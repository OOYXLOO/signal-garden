import { readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), "..");

const requiredPaths = [
  "devvit.json",
  "vite.devvit.client.config.js",
  "vite.devvit.server.config.js",
  "src/devvit/client/splash.html",
  "src/devvit/client/splash.js",
  "src/devvit/client/game.html",
  "src/devvit/client/game-entry.js",
  "src/devvit/server/index.js",
  "src/client/communityClient.js",
  "src/server/signalGardenApi.js",
  "src/server/redisProposalStore.js",
  "docs/reddit-demo-post-draft.md",
  "docs/platform-feedback-pack.md",
  "docs/devpost-field-pack.md",
];

const accountOwnerGates = [
  "Run devvit login with the account owner present.",
  "Create or select the Reddit test community.",
  "Create the Devvit app listing and run a real playtest.",
  "Create the public Reddit demo post.",
  "Submit the final Devpost or platform form with public URLs.",
];

const accountOwnerHandoff = {
  appSlug: "signalgardenyxl",
  humanityGateUrl: "https://developers.reddit.com/new/humanity-check?app_name=signalgardenyxl&app_name_verified=true",
  afterHumanityCommands: [
    "npx devvit upload --verbose",
    "npx devvit list apps",
    "npm run audit:release -- --json",
  ],
  requiredPublicUrls: [
    {
      label: "Devvit app listing URL",
      placeholder: "<public-app-listing-url>",
    },
    {
      label: "public Reddit demo post URL",
      placeholder: "<public-reddit-demo-post-url>",
    },
  ],
  sensitiveBoundaries: [
    "Do not paste passwords, OTPs, cookies, private account pages, payment settings, KYC screens, or platform secrets into the repository.",
    "Use public URLs only after the account owner creates the listing, playtest, demo post, or submission record.",
  ],
};

function parseArgs(argv) {
  const options = {
    date: new Date().toISOString().slice(0, 10),
    output: "",
    json: false,
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--date") {
      index += 1;
      if (index >= argv.length) {
        throw new Error("Missing value for --date");
      }
      options.date = argv[index];
    } else if (arg === "--output") {
      index += 1;
      if (index >= argv.length) {
        throw new Error("Missing value for --output");
      }
      options.output = argv[index];
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  return options;
}

function helpText() {
  return [
    "Usage:",
    "  npm run export:devvit-readiness -- --output docs/devvit-readiness-report.md",
    "  node scripts/export-devvit-readiness.mjs --json --date 2026-06-22",
    "",
    "Creates a public Devvit readiness report from local config, scripts, and source files.",
  ].join("\n");
}

async function fileExists(path) {
  try {
    return (await stat(resolve(root, path))).isFile();
  } catch {
    return false;
  }
}

function check(id, label, ok, evidence) {
  return {
    id,
    label,
    ok: Boolean(ok),
    evidence,
  };
}

export async function createDevvitReadinessReport({ date } = {}) {
  const config = JSON.parse(await readFile(resolve(root, "devvit.json"), "utf8"));
  const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  const server = await readFile(resolve(root, "src/devvit/server/index.js"), "utf8");
  const splash = await readFile(resolve(root, "src/devvit/client/splash.js"), "utf8");
  const gameEntry = await readFile(resolve(root, "src/devvit/client/game-entry.js"), "utf8");
  const missingPaths = [];
  for (const path of requiredPaths) {
    if (!(await fileExists(path))) {
      missingPaths.push(path);
    }
  }

  const checks = [
    check("config-name", "Devvit app config has a stable public name", config.name === "signal-garden", "devvit.json name is signal-garden"),
    check("client-entrypoints", "Client has splash and game entrypoints", config.post?.entrypoints?.default?.entry === "splash.html" && config.post?.entrypoints?.game?.entry === "game.html", "default=splash.html, game=game.html"),
    check("server-entry", "Server entry is built to the configured path", config.server?.dir === "dist/server" && config.server?.entry === "index.cjs", "server dir dist/server, entry index.cjs"),
    check("menu-endpoint", "Moderator menu creates a daily relay post", config.menu?.items?.some((item) => item.endpoint === "/internal/menu/post-create" && item.location === "subreddit" && item.forUserType === "moderator"), "subreddit moderator endpoint /internal/menu/post-create"),
    check("build-scripts", "Package scripts include Devvit build and audit commands", Boolean(packageJson.scripts?.["build:devvit"] && packageJson.scripts?.["audit:devvit"] && packageJson.scripts?.["build:all"]), "build:devvit, build:all, audit:devvit"),
    check("required-files", "Required Devvit handoff files exist", missingPaths.length === 0, missingPaths.length ? `missing: ${missingPaths.join(", ")}` : `${requiredPaths.length} required files present`),
    check("expanded-mode", "Splash requests Devvit expanded mode with browser fallback", splash.includes("devvit-internal") && splash.includes("immersiveMode") && splash.includes("game.html"), "expanded-mode message plus game.html fallback"),
    check("fetch-client", "Game entry uses same-origin community API calls", gameEntry.includes("SIGNAL_GARDEN_MANUAL_START") && gameEntry.includes("createFetchCommunityClient") && gameEntry.includes("window.location.origin"), "manual startup with same-origin fetch client"),
    check("server-routes", "Server shell exposes init, proposal, archive, and menu routes", server.includes("createSignalGardenApi") && server.includes("/internal/menu/post-create") && server.includes("submitCustomPost"), "shared API plus menu post-create route"),
    check(
      "custom-post-payload",
      "Menu-created custom posts include Devvit-ready entry, fallback, post data, and styles",
      server.includes('entry: DEFAULT_POST_ENTRY') &&
        server.includes("postData") &&
        server.includes("textFallback") &&
        server.includes("userGeneratedContent") &&
        server.includes("height: POST_HEIGHT"),
      "submitCustomPost payload includes entry, postData, textFallback, userGeneratedContent, and TALL height",
    ),
    check("redis-boundary", "Redis migration boundary is isolated", server.includes("signalGardenRedis") && server.includes("createRedisProposalStore") && server.includes("MemoryProposalStore"), "global Redis injection with memory fallback"),
  ];

  const ready = checks.every((item) => item.ok);
  return {
    schemaVersion: "signal-garden-devvit-readiness/v1",
    date: date || new Date().toISOString().slice(0, 10),
    verdict: ready ? "READY_FOR_ACCOUNT_OWNER_PLAYTEST" : "NEEDS_LOCAL_FIX",
    checks,
    accountOwnerGates,
    accountOwnerHandoff,
    recommendedCommands: [
      "npm run build:devvit",
      "npm run audit:devvit",
      "npm run export:submission-manifest -- --output docs/submission-manifest.json",
    ],
  };
}

export function formatDevvitReadinessReport(report) {
  const checkRows = report.checks
    .map((item) => `| ${item.ok ? "PASS" : "FAIL"} | ${item.label} | ${item.evidence} |`)
    .join("\n");
  const gates = report.accountOwnerGates.map((gate) => `- ${gate}`).join("\n");
  const handoffCommands = report.accountOwnerHandoff.afterHumanityCommands.map((command) => `- \`${command}\``).join("\n");
  const handoffUrls = report.accountOwnerHandoff.requiredPublicUrls
    .map((item) => `- ${item.label}: \`${item.placeholder}\``)
    .join("\n");
  const handoffBoundaries = report.accountOwnerHandoff.sensitiveBoundaries.map((item) => `- ${item}`).join("\n");
  const commands = report.recommendedCommands.map((command) => `- \`${command}\``).join("\n");
  return [
    "# Devvit Readiness Report",
    "",
    `Generated: ${report.date}`,
    "",
    `Verdict: ${report.verdict}`,
    "",
    "This report is generated from repository config, source files, and public handoff docs. It is meant to give reviewers a compact view of the Devvit migration surface without requiring private accounts or platform tokens.",
    "",
    "## Readiness Checks",
    "",
    "| Status | Check | Evidence |",
    "| --- | --- | --- |",
    checkRows,
    "",
    "## Account-Owner Gates",
    "",
    gates,
    "",
    "## Post-Humanity Handoff",
    "",
    `App slug: \`${report.accountOwnerHandoff.appSlug}\``,
    `Current humanity gate: ${report.accountOwnerHandoff.humanityGateUrl}`,
    "",
    "After the account owner completes the humanity check, run:",
    "",
    handoffCommands,
    "",
    "Record these public URLs before final submission:",
    "",
    handoffUrls,
    "",
    "Do not include these in public handoff material:",
    "",
    handoffBoundaries,
    "",
    "## Recommended Local Commands",
    "",
    commands,
    "",
    "## Boundary",
    "",
    "The public repository is ready for source review and account-owner playtest preparation. It does not include credentials, cookies, private account pages, production tokens, payment data, or KYC material.",
    "",
  ].join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }
  const report = await createDevvitReadinessReport({ date: options.date });
  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  const text = formatDevvitReadinessReport(report);
  if (options.output) {
    await writeFile(resolve(root, options.output), text, "utf8");
  } else {
    process.stdout.write(text);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
