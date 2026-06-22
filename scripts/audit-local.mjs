import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const required = [
  "README.md",
  ".github/workflows/deploy-pages.yml",
  "devvit.json",
  "index.html",
  "vite.devvit.client.config.js",
  "vite.devvit.server.config.js",
  "src/main.js",
  "src/audio.js",
  "src/share.js",
  "src/platformFeedback.js",
  "src/client/communityClient.js",
  "src/devvit/client/splash.html",
  "src/devvit/client/splash.js",
  "src/devvit/client/game.html",
  "src/devvit/client/game-entry.js",
  "src/devvit/server/index.js",
  "src/game/puzzle.js",
  "src/game/proposals.js",
  "src/game/SignalGardenScene.js",
  "src/server/memoryProposalStore.js",
  "src/server/redisProposalStore.js",
  "src/server/signalGardenApi.js",
  "src/state/browserProposalStore.js",
  "tests/puzzle.test.mjs",
  "tests/serverAdapter.test.mjs",
  "tests/communityClient.test.mjs",
  "tests/audio.test.mjs",
  "tests/share.test.mjs",
  "tests/platformFeedback.test.mjs",
  "tests/redisProposalStore.test.mjs",
  "tests/devvitServerShell.test.mjs",
  "tests/devvitSplash.test.mjs",
  "docs/design.md",
  "docs/demo-captioned.webm",
  "docs/demo-final-captioned.webm",
  "docs/demo-script.md",
  "docs/demo.webm",
  "docs/devvit-adapter-plan.md",
  "docs/devvit_shell_readiness.md",
  "docs/launch-readiness.md",
  "docs/submission-field-pack.md",
  "docs/submission-manifest.json",
  "scripts/record-demo.mjs",
  "scripts/audit-pages-build.mjs",
  "scripts/audit-submission-assets.mjs",
  "scripts/export-platform-feedback.mjs",
  "scripts/export-launch-packet.mjs",
  "scripts/export-submission-manifest.mjs",
  "scripts/github-pages-release-check.ps1",
  "tests/exportLaunchPacketCli.test.mjs",
  "tests/exportSubmissionManifestCli.test.mjs",
];

const forbidden = [
  new RegExp(["money", "goal"].join("-"), "i"),
  new RegExp(["USD", "200"].join(" "), "i"),
  new RegExp("\\u8d5a\\u94b1"),
  new RegExp("\\u5956\\u91d1"),
  new RegExp(["pay", "out"].join(""), "i"),
  new RegExp(["cash", "prize"].join(" "), "i"),
];
const ignoredDirs = new Set(["node_modules", "dist", ".git"]);
const checkedExtensions = new Set([".md", ".html", ".js", ".mjs", ".css", ".json"]);

function extname(path) {
  const index = path.lastIndexOf(".");
  return index === -1 ? "" : path.slice(index);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
    } else {
      files.push(path);
    }
  }
  return files;
}

const failures = [];
for (const file of required) {
  try {
    const info = await stat(join(root, file));
    if (!info.isFile()) failures.push(`required file missing: ${file}`);
  } catch {
    failures.push(`required file missing: ${file}`);
  }
}

const indexHtml = await readFile(join(root, "index.html"), "utf8");
const devvitGameHtml = await readFile(join(root, "src/devvit/client/game.html"), "utf8");
if (!indexHtml.includes('id="comment-challenge"')) {
  failures.push("index.html missing comment challenge prompt");
}
if (!indexHtml.includes('id="copy-comment-challenge"')) {
  failures.push("index.html missing comment challenge copy control");
}
if (!indexHtml.includes('id="reddit-post-draft"')) {
  failures.push("index.html missing reddit post draft");
}
if (!indexHtml.includes('id="copy-reddit-post-draft"')) {
  failures.push("index.html missing reddit post draft copy control");
}
if (!indexHtml.includes('id="developer-feedback-draft"')) {
  failures.push("index.html missing developer feedback draft");
}
if (!indexHtml.includes('id="copy-developer-feedback-draft"')) {
  failures.push("index.html missing developer feedback draft copy control");
}
if (!indexHtml.includes('id="review-snapshot"')) {
  failures.push("index.html missing review snapshot");
}
if (!indexHtml.includes('id="copy-review-snapshot"')) {
  failures.push("index.html missing review snapshot copy control");
}
if (!indexHtml.includes('id="reviewer-fast-path"')) {
  failures.push("index.html missing reviewer fast path");
}
if (!indexHtml.includes('id="onboarding-steps"')) {
  failures.push("index.html missing first-session guide");
}
if (!indexHtml.includes('id="reviewer-loop-checks"')) {
  failures.push("index.html missing reviewer loop checks");
}
if (!indexHtml.includes('id="contribution-quality"')) {
  failures.push("index.html missing contribution quality proof");
}
if (!indexHtml.includes('id="submission-readiness-list"')) {
  failures.push("index.html missing submission readiness list");
}
if (!indexHtml.includes('id="submission-readiness-output"')) {
  failures.push("index.html missing submission readiness output");
}
if (!indexHtml.includes('id="evidence-receipt"')) {
  failures.push("index.html missing evidence receipt");
}
if (!indexHtml.includes('id="copy-evidence-receipt"')) {
  failures.push("index.html missing evidence receipt copy control");
}
if (!indexHtml.includes('id="launch-packet"')) {
  failures.push("index.html missing launch packet");
}
if (!indexHtml.includes('id="target-card"')) {
  failures.push("index.html missing rival target card");
}
if (!indexHtml.includes('id="mission-list"')) {
  failures.push("index.html missing daily missions");
}
if (!indexHtml.includes('id="retention-summary"')) {
  failures.push("index.html missing retention summary");
}
if (!indexHtml.includes('id="garden-log-list"')) {
  failures.push("index.html missing garden log list");
}
if (!indexHtml.includes('id="load-sample-thread"')) {
  failures.push("index.html missing sample comment thread loader");
}
if (!indexHtml.includes('id="top-route-rationale"')) {
  failures.push("index.html missing top route rationale");
}
if (!devvitGameHtml.includes('id="target-card"')) {
  failures.push("devvit game.html missing rival target card");
}
if (!devvitGameHtml.includes('id="mission-list"')) {
  failures.push("devvit game.html missing daily missions");
}
if (!devvitGameHtml.includes('id="retention-summary"')) {
  failures.push("devvit game.html missing retention summary");
}
if (!devvitGameHtml.includes('id="garden-log-list"')) {
  failures.push("devvit game.html missing garden log list");
}
if (!devvitGameHtml.includes('id="review-snapshot"')) {
  failures.push("devvit game.html missing review snapshot");
}
if (!devvitGameHtml.includes('id="reddit-post-draft"')) {
  failures.push("devvit game.html missing reddit post draft");
}
if (!devvitGameHtml.includes('id="developer-feedback-draft"')) {
  failures.push("devvit game.html missing developer feedback draft");
}
if (!devvitGameHtml.includes('id="copy-developer-feedback-draft"')) {
  failures.push("devvit game.html missing developer feedback draft copy control");
}
if (!devvitGameHtml.includes('id="reviewer-fast-path"')) {
  failures.push("devvit game.html missing reviewer fast path");
}
if (!devvitGameHtml.includes('id="onboarding-steps"')) {
  failures.push("devvit game.html missing first-session guide");
}
if (!devvitGameHtml.includes('id="reviewer-loop-checks"')) {
  failures.push("devvit game.html missing reviewer loop checks");
}
if (!devvitGameHtml.includes('id="contribution-quality"')) {
  failures.push("devvit game.html missing contribution quality proof");
}
if (!devvitGameHtml.includes('id="submission-readiness-list"')) {
  failures.push("devvit game.html missing submission readiness list");
}
if (!devvitGameHtml.includes('id="submission-readiness-output"')) {
  failures.push("devvit game.html missing submission readiness output");
}
if (!devvitGameHtml.includes('id="evidence-receipt"')) {
  failures.push("devvit game.html missing evidence receipt");
}
if (!devvitGameHtml.includes('id="copy-evidence-receipt"')) {
  failures.push("devvit game.html missing evidence receipt copy control");
}
if (!devvitGameHtml.includes('id="launch-packet"')) {
  failures.push("devvit game.html missing launch packet");
}
if (!devvitGameHtml.includes('id="load-sample-thread"')) {
  failures.push("devvit game.html missing sample comment thread loader");
}
if (!devvitGameHtml.includes('id="top-route-rationale"')) {
  failures.push("devvit game.html missing top route rationale");
}
const sceneText = await readFile(join(root, "src/game/SignalGardenScene.js"), "utf8");
const proposalText = await readFile(join(root, "src/game/proposals.js"), "utf8");
if (!sceneText.includes("setRivalPlan")) {
  failures.push("SignalGardenScene missing rival route guide sync");
}
if (!proposalText.includes("createRivalRouteGuide")) {
  failures.push("proposals missing rival route guide");
}
if (!proposalText.includes("createTopRouteRationale")) {
  failures.push("proposals missing top route rationale");
}

for (const file of await walk(root)) {
  if (!checkedExtensions.has(extname(file))) {
    continue;
  }
  const text = await readFile(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(text)) {
      failures.push(`public wording hit ${pattern} in ${relative(root, file)}`);
    }
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`FAIL ${failure}`);
  }
  process.exit(1);
}

console.log("PASS required files present");
console.log("PASS public wording scan clean");
