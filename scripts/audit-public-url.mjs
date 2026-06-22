import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const defaultTimeoutMs = 20_000;
const scriptPath = fileURLToPath(import.meta.url);

function parseArgs(argv) {
  const options = {
    allowLocal: false,
    baseUrl: "",
    day: "",
    help: false,
    json: false,
    timeoutMs: defaultTimeoutMs,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--allow-local") {
      options.allowLocal = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--base-url") {
      index += 1;
      if (index >= argv.length) throw new Error("Missing value for --base-url");
      options.baseUrl = argv[index];
    } else if (arg === "--day") {
      index += 1;
      if (index >= argv.length) throw new Error("Missing value for --day");
      options.day = argv[index];
    } else if (arg === "--timeout-ms") {
      index += 1;
      if (index >= argv.length) throw new Error("Missing value for --timeout-ms");
      options.timeoutMs = Number(argv[index]);
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  return options;
}

function helpText() {
  return [
    "Usage:",
    "  npm run audit:public -- --base-url <public-app-url> --day <YYYY-MM-DD>",
    "",
    "Checks a deployed static Signal Garden URL and its sample-route review URL.",
    "Use --allow-local only for local test servers.",
  ].join("\n");
}

function isLocalHost(hostname) {
  const host = hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".localhost");
}

function normalizeBaseUrl(value, { allowLocal }) {
  if (!value) throw new Error("Missing --base-url");
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http(s) URLs are supported");
  }
  if (!allowLocal && isLocalHost(url.hostname)) {
    throw new Error("Public URL audit rejects localhost unless --allow-local is set");
  }
  url.hash = "";
  url.search = "";
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  return url;
}

function validateDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    throw new Error("Missing or invalid --day; expected YYYY-MM-DD");
  }
  return value;
}

function sampleRouteUrl(baseUrl, day) {
  const url = new URL(baseUrl.toString());
  url.searchParams.set("day", day);
  url.searchParams.set("sample", "1");
  return url;
}

function judgeDeskUrl(baseUrl) {
  return new URL("judge.html", baseUrl);
}

async function fetchText(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "SignalGardenPublicUrlAudit/1.0",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await response.text();
    return {
      finalUrl: response.url,
      ok: response.ok,
      status: response.status,
      text,
      title: (text.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || "").trim(),
    };
  } finally {
    clearTimeout(timer);
  }
}

function auditHtml(name, result) {
  const failures = [];
  if (!result.ok) {
    failures.push(`${name} returned HTTP ${result.status}`);
  }
  if (!/Signal Garden/i.test(result.title) && !/Signal Garden/i.test(result.text)) {
    failures.push(`${name} does not look like Signal Garden HTML`);
  }
  if (/Site not found|404/i.test(result.title)) {
    failures.push(`${name} title looks like an error page: ${result.title}`);
  }
  if (result.text.includes('src="/assets') || result.text.includes('href="/assets')) {
    failures.push(`${name} contains root-relative /assets references`);
  }
  return failures;
}

export async function auditPublicUrl(options) {
  const day = validateDay(options.day);
  const baseUrl = normalizeBaseUrl(options.baseUrl, options);
  const reviewUrl = sampleRouteUrl(baseUrl, day);
  const judgeUrl = judgeDeskUrl(baseUrl);
  const base = await fetchText(baseUrl, options.timeoutMs);
  const sample = await fetchText(reviewUrl, options.timeoutMs);
  const judge = await fetchText(judgeUrl, options.timeoutMs);
  const failures = [
    ...auditHtml("base URL", base),
    ...auditHtml("sample route URL", sample),
    ...auditHtml("judge desk URL", judge),
  ];

  if (sample.finalUrl.includes("plan=")) {
    failures.push("sample route URL unexpectedly includes a plan parameter before play");
  }
  if (!reviewUrl.searchParams.has("sample") || reviewUrl.searchParams.get("sample") !== "1") {
    failures.push("sample route URL missing sample=1");
  }
  if (reviewUrl.searchParams.get("day") !== day) {
    failures.push("sample route URL missing requested day");
  }
  for (const fragment of [
    "Signal Garden",
    "Judge Desk",
    "Open sample route",
    "demo-final-captioned.webm",
    "submission-manifest.json",
    "criteria-fit.md",
    "https://github.com/OOYXLOO/signal-garden",
  ]) {
    if (!judge.text.includes(fragment)) {
      failures.push(`judge desk URL missing text: ${fragment}`);
    }
  }

  return {
    ok: failures.length === 0,
    baseUrl: baseUrl.toString(),
    sampleRouteUrl: reviewUrl.toString(),
    judgeDeskUrl: judgeUrl.toString(),
    baseStatus: base.status,
    sampleStatus: sample.status,
    judgeStatus: judge.status,
    baseTitle: base.title,
    sampleTitle: sample.title,
    judgeTitle: judge.title,
    failures,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }
  const result = await auditPublicUrl(options);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(`PASS public base URL ${result.baseStatus}: ${result.baseUrl}`);
    console.log(`PASS public sample route ${result.sampleStatus}: ${result.sampleRouteUrl}`);
    console.log(`PASS public judge desk ${result.judgeStatus}: ${result.judgeDeskUrl}`);
  }
  if (!result.ok) {
    for (const failure of result.failures) {
      console.error(`FAIL ${failure}`);
    }
    process.exit(1);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
