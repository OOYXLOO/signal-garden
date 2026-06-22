import { readFile, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const run = promisify(execFile);
const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const requiredScripts = [
  "build:all",
  "audit:local",
  "audit:devvit",
  "audit:pages",
  "audit:public",
  "audit:submission",
  "export:launch-packet",
  "export:submission-manifest",
  "export:submission-pack",
];

const requiredFiles = [
  ".github/workflows/deploy-pages.yml",
  "docs/submission-manifest.json",
  "docs/submission-field-pack.md",
  "docs/launch-readiness.md",
  "docs/devvit_dependency_watch.md",
  "docs/demo-final-captioned.webm",
  "scripts/audit-public-url.mjs",
  "scripts/export-launch-packet.mjs",
  "scripts/export-submission-pack.mjs",
  "scripts/github-pages-release-check.ps1",
];

function parseArgs(argv) {
  const options = {
    appListingUrl: "",
    demoPostUrl: "",
    expectedRepo: "OOYXLOO/signal-garden",
    help: false,
    json: false,
    publicAppUrl: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--json") {
      options.json = true;
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
    "  npm run audit:release -- --json",
    "  npm run audit:release -- --public-app-url https://... --app-listing-url https://... --demo-post-url https://...",
    "",
    "Checks local release readiness and reports which public platform gates are still waiting.",
    "This command does not push, publish, submit, log in, or contact private account pages.",
  ].join("\n");
}

function createGate(id, label, status, detail = "") {
  return { id, label, status, detail };
}

function safePublicUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return { status: "waiting", detail: "not supplied yet" };
  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();
    const local = host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".localhost");
    if (!["http:", "https:"].includes(url.protocol)) {
      return { status: "blocked", detail: "must use http or https" };
    }
    if (local) {
      return { status: "blocked", detail: "must be public, not localhost" };
    }
    return { status: "ready", detail: url.toString() };
  } catch {
    return { status: "blocked", detail: "invalid URL" };
  }
}

async function gitValue(args) {
  try {
    const { stdout } = await run("git", args, { cwd: root });
    return stdout.trim();
  } catch {
    return "";
  }
}

async function fileExists(path) {
  try {
    const info = await stat(resolve(root, path));
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

async function auditReleaseGates(options = {}) {
  const config = {
    appListingUrl: "",
    demoPostUrl: "",
    expectedRepo: "OOYXLOO/signal-garden",
    publicAppUrl: "",
    ...options,
  };
  const failures = [];
  const warnings = [];
  const gates = [];

  const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  for (const script of requiredScripts) {
    if (!packageJson.scripts?.[script]) failures.push(`package.json missing script: ${script}`);
  }

  for (const file of requiredFiles) {
    if (!(await fileExists(file))) failures.push(`required release file missing or empty: ${file}`);
  }

  const manifest = JSON.parse(await readFile(resolve(root, "docs/submission-manifest.json"), "utf8"));
  for (const command of ["audit:public", "export:launch-packet", "export:submission-pack"]) {
    const text = JSON.stringify(manifest);
    if (!text.includes(command)) failures.push(`submission manifest missing command marker: ${command}`);
  }

  const branch = await gitValue(["branch", "--show-current"]);
  gates.push(createGate("branch", "Current Git branch", branch ? "ready" : "blocked", branch || "missing branch"));

  const dirty = await gitValue(["status", "--short"]);
  if (dirty) {
    warnings.push("working tree is dirty; commit release changes before push");
    gates.push(createGate("working-tree", "Working tree", "waiting", "dirty local changes"));
  } else {
    gates.push(createGate("working-tree", "Working tree", "ready", "clean"));
  }

  const origin = await gitValue(["remote", "get-url", "origin"]);
  if (!origin) {
    gates.push(createGate("origin", "Git origin remote", "waiting", "create the repository, then run the release helper"));
  } else if (!origin.toLowerCase().includes(config.expectedRepo.toLowerCase())) {
    gates.push(createGate("origin", "Git origin remote", "blocked", `unexpected origin: ${origin}`));
  } else {
    gates.push(createGate("origin", "Git origin remote", "ready", origin));
  }

  const publicApp = safePublicUrl(config.publicAppUrl);
  gates.push(createGate("public-app-url", "Public app URL", publicApp.status, publicApp.detail));
  const listing = safePublicUrl(config.appListingUrl);
  gates.push(createGate("app-listing-url", "App listing URL", listing.status, listing.detail));
  const demoPost = safePublicUrl(config.demoPostUrl);
  gates.push(createGate("demo-post-url", "Demo post URL", demoPost.status, demoPost.detail));

  const blockedGates = gates.filter((gate) => gate.status === "blocked");
  for (const gate of blockedGates) failures.push(`${gate.label}: ${gate.detail}`);

  return {
    ok: failures.length === 0,
    project: packageJson.name,
    branch,
    expectedRepo: config.expectedRepo,
    gates,
    failures,
    warnings,
    nextCommands: [
      "npm test",
      "npm run check",
      "npm run build:all",
      "npm run audit:local",
      "npm run audit:devvit",
      "npm run audit:pages",
      "npm run audit:submission",
      "npm audit --audit-level=moderate",
      "powershell -ExecutionPolicy Bypass -File scripts/github-pages-release-check.ps1 -SetOrigin -Push",
      "npm run audit:public -- --base-url <public-app-url> --day <YYYY-MM-DD>",
      "npm run export:submission-pack -- --public-app-url <public-app-url> --day <YYYY-MM-DD> --plan <review-plan-token> --app-listing-url <public-app-listing-url> --demo-post-url <public-demo-post-url>",
    ],
  };
}

function formatText(result) {
  const lines = [
    "Signal Garden release gate audit",
    `Project: ${result.project}`,
    `Branch: ${result.branch || "unknown"}`,
    "",
    "Gates:",
  ];
  for (const gate of result.gates) {
    lines.push(`- ${gate.status.toUpperCase()} ${gate.label}: ${gate.detail}`);
  }
  if (result.warnings.length) {
    lines.push("", "Warnings:");
    for (const warning of result.warnings) lines.push(`- ${warning}`);
  }
  if (result.failures.length) {
    lines.push("", "Failures:");
    for (const failure of result.failures) lines.push(`- ${failure}`);
  }
  lines.push("", result.ok ? "PASS release gate audit" : "FAIL release gate audit");
  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }
  const result = await auditReleaseGates(options);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatText(result));
  }
  if (!result.ok) process.exit(1);
}

export { auditReleaseGates, formatText, safePublicUrl };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
