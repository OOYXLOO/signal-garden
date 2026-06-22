import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { auditPublicUrl } from "./audit-public-url.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), "..");

function parseArgs(argv) {
  const options = {
    allowLocal: false,
    appListingUrl: "",
    criteriaUrl: "",
    day: "",
    demoPostUrl: "",
    help: false,
    judgeUrl: "",
    output: "",
    publicAppUrl: "",
    sourceRepoUrl: "",
    strict: false,
    timeoutMs: 20_000,
    videoUrl: "",
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--allow-local") {
      options.allowLocal = true;
    } else if (arg === "--strict") {
      options.strict = true;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      if (!(key in options)) throw new Error(`Unknown option: ${arg}`);
      index += 1;
      if (index >= argv.length) throw new Error(`Missing value for ${arg}`);
      options[key] = argv[index];
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  return options;
}

function helpText() {
  return [
    "Usage:",
    "  npm run export:devpost-fields -- --public-app-url https://... --source-repo-url https://... --day 2026-06-22",
    "  npm run export:devpost-fields -- --public-app-url https://... --source-repo-url https://... --app-listing-url https://... --demo-post-url https://... --strict",
    "",
    "Creates a concise, copyable Devpost-style field pack without submitting any form.",
  ].join("\n");
}

function isLocalHost(hostname) {
  const host = hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".localhost");
}

function assertHttpUrl(name, value, { allowLocal = false, required = true } = {}) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    if (required) throw new Error(`${name} is required`);
    return "";
  }
  const parsed = new URL(trimmed);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${name} must use http or https`);
  }
  if (!allowLocal && isLocalHost(parsed.hostname)) {
    throw new Error(`${name} must be public, not localhost`);
  }
  return parsed.toString();
}

function normalizeBaseUrl(value, allowLocal) {
  const parsed = new URL(assertHttpUrl("public app URL", value, { allowLocal }));
  parsed.hash = "";
  parsed.search = "";
  if (!parsed.pathname.endsWith("/")) {
    parsed.pathname = `${parsed.pathname}/`;
  }
  return parsed;
}

function defaultFromBase(baseUrl, path) {
  return new URL(path, baseUrl).toString();
}

function extractSection(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^## ${escaped}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "m"));
  if (!match) {
    throw new Error(`docs/submission-field-pack.md missing section: ${heading}`);
  }
  return match[1].trim();
}

function truncateParagraph(text, maxLength) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}.`;
}

function formatMissingGates({ appListingUrl, demoPostUrl, videoUrl }) {
  const missing = [];
  if (!appListingUrl) missing.push("Devvit app listing URL");
  if (!demoPostUrl) missing.push("public Reddit demo post URL");
  if (!videoUrl) missing.push("uploaded Devpost video or final public video URL");
  return missing;
}

async function createDevpostFields(options) {
  const day = options.day || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error("--day must be YYYY-MM-DD");
  }

  const publicAppUrl = normalizeBaseUrl(options.publicAppUrl, options.allowLocal);
  const sourceRepoUrl = assertHttpUrl("source repository URL", options.sourceRepoUrl, {
    allowLocal: options.allowLocal,
  });
  const judgeUrl = assertHttpUrl("judge URL", options.judgeUrl || defaultFromBase(publicAppUrl, "judge.html"), {
    allowLocal: options.allowLocal,
  });
  const criteriaUrl = assertHttpUrl(
    "criteria URL",
    options.criteriaUrl || "https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/criteria-fit.md",
    { allowLocal: options.allowLocal },
  );
  const appListingUrl = assertHttpUrl("app listing URL", options.appListingUrl, {
    allowLocal: options.allowLocal,
    required: options.strict,
  });
  const demoPostUrl = assertHttpUrl("demo post URL", options.demoPostUrl, {
    allowLocal: options.allowLocal,
    required: options.strict,
  });
  const videoUrl = assertHttpUrl("video URL", options.videoUrl, {
    allowLocal: options.allowLocal,
    required: false,
  });
  if (options.strict && !videoUrl) {
    throw new Error("video URL is required in --strict mode");
  }

  const publicAudit = await auditPublicUrl({
    allowLocal: options.allowLocal,
    baseUrl: publicAppUrl.toString(),
    day,
    judgeFragments: [
      "Signal Garden",
      "Judge Desk",
      "Open sample route",
      "demo-final-captioned.webm",
      "submission-manifest.json",
      "criteria-fit.md",
      "https://github.com/OOYXLOO/signal-garden",
    ],
    timeoutMs: options.timeoutMs,
  });
  if (!publicAudit.ok) {
    throw new Error(`public URL audit failed: ${publicAudit.failures.join("; ")}`);
  }

  const fieldPack = await readFile(resolve(root, "docs/submission-field-pack.md"), "utf8");
  const criteriaBrief = await readFile(resolve(root, "docs/criteria-fit.md"), "utf8");
  const shortDescription = extractSection(fieldPack, "Short Description");
  const longDescription = extractSection(fieldPack, "Long Description");
  const socialLoop = extractSection(fieldPack, "What Makes It Social");
  const technicalHighlights = extractSection(fieldPack, "Technical Highlights");
  const missingGates = formatMissingGates({ appListingUrl, demoPostUrl, videoUrl });

  return [
    "# Signal Garden Devpost Field Pack",
    "",
    `Generated for day: ${day}`,
    "",
    "## Project Name",
    "",
    "Signal Garden",
    "",
    "## Tagline",
    "",
    truncateParagraph(shortDescription, 170),
    "",
    "## Project URL Fields",
    "",
    `- Public app: ${publicAppUrl.toString()}`,
    `- Sample route: ${publicAudit.sampleRouteUrl}`,
    `- Judge desk: ${judgeUrl}`,
    `- Source repository: ${sourceRepoUrl}`,
    `- Criteria fit brief: ${criteriaUrl}`,
    appListingUrl ? `- Devvit app listing: ${appListingUrl}` : "- Devvit app listing: <add after platform gate>",
    demoPostUrl ? `- Public demo post: ${demoPostUrl}` : "- Public demo post: <add after user-approved Reddit post>",
    videoUrl ? `- Video: ${videoUrl}` : "- Video: attach `docs/demo-final-captioned.webm` or add final public video URL",
    "",
    "## Short Description",
    "",
    shortDescription,
    "",
    "## Long Description",
    "",
    longDescription,
    "",
    "## Built With",
    "",
    "Phaser, Vite, JavaScript, Devvit-shaped client/server shell, GitHub Pages, Web Audio, deterministic puzzle engine, local proposal store, Redis-shaped proposal store.",
    "",
    "## What Makes It Social",
    "",
    socialLoop,
    "",
    "## Technical Highlights",
    "",
    technicalHighlights,
    "",
    "## Testing Instructions",
    "",
    "1. Open the public app.",
    "2. Open the sample route and confirm it shows a solved route for the selected day.",
    "3. Open the judge desk and follow the First Minute checklist.",
    "4. Copy a review link or use the sample thread loader to see comment routes become ranked proposals.",
    "5. Open the criteria fit brief to compare the build against the public challenge signals.",
    "",
    "## Criteria Fit Summary",
    "",
    truncateParagraph(
      criteriaBrief
        .split("## Strongest Submission Angle")[1]
        ?.split("## Current Weaknesses")[0]
        ?.replace(/#/g, "")
        .trim() || "Signal Garden is framed as a daily community relay puzzle with comment-to-game state as the differentiator.",
      900,
    ),
    "",
    "## Honest Current Weaknesses",
    "",
    "- The public app is hosted on GitHub Pages until a live Reddit post exists.",
    "- The Devvit shell is built and audited, but app listing/playtest remain platform gates.",
    "- Real multi-user data starts after the public demo post; sample route and sample thread flows are labeled as review previews.",
    "",
    "## Pending External Gates",
    "",
    missingGates.length ? missingGates.map((gate) => `- ${gate}`).join("\n") : "- None for the supplied field set.",
    "",
    "## Final Pre-Submit Commands",
    "",
    "```powershell",
    `npm run audit:public -- --base-url '${publicAppUrl.toString()}' --day '${day}'`,
    `npm run export:devpost-fields -- --public-app-url '${publicAppUrl.toString()}' --source-repo-url '${sourceRepoUrl}' --day '${day}'${appListingUrl ? ` --app-listing-url '${appListingUrl}'` : ""}${demoPostUrl ? ` --demo-post-url '${demoPostUrl}'` : ""}${videoUrl ? ` --video-url '${videoUrl}'` : ""}`,
    "npm run audit:submission",
    "```",
    "",
  ].join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }
  const text = await createDevpostFields(options);
  if (options.output) {
    await writeFile(resolve(options.output), text, "utf8");
  } else {
    process.stdout.write(text);
  }
}

export { createDevpostFields };

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
