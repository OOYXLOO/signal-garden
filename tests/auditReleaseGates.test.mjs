import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  auditReleaseGates,
  formatText,
  githubPagesUrlFromOrigin,
  safePublicUrl,
  sourceRepoUrlFromOrigin,
} from "../scripts/audit-release-gates.mjs";

const run = promisify(execFile);
const script = new URL("../scripts/audit-release-gates.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

assert.deepEqual(safePublicUrl(""), { status: "waiting", detail: "not supplied yet" });
assert.equal(safePublicUrl("http://127.0.0.1:8796/").status, "blocked");
assert.equal(safePublicUrl("https://ooyxloo.github.io/signal-garden/").status, "ready");
assert.equal(
  sourceRepoUrlFromOrigin("https://github.com/OOYXLOO/signal-garden.git", "OOYXLOO/signal-garden"),
  "https://github.com/OOYXLOO/signal-garden",
);
assert.equal(sourceRepoUrlFromOrigin("git@github.com:OOYXLOO/signal-garden.git"), "https://github.com/OOYXLOO/signal-garden");
assert.equal(
  githubPagesUrlFromOrigin("https://github.com/OOYXLOO/signal-garden.git", "OOYXLOO/signal-garden"),
  "https://ooyxloo.github.io/signal-garden/",
);

const result = await auditReleaseGates({
  now: "2026-06-24T04:00:00.000Z",
  publicAppUrl: "https://ooyxloo.github.io/signal-garden/",
  sourceRepoUrl: "https://github.com/OOYXLOO/signal-garden",
  appListingUrl: "https://developers.reddit.com/apps/signal-garden",
  demoPostUrl: "https://www.reddit.com/r/test/comments/signal_garden/",
});

assert.equal(result.project, "signal-garden");
assert.equal(result.ok, true);
assert.ok(result.gates.some((gate) => gate.id === "branch" && gate.status === "ready"));
assert.ok(result.gates.some((gate) => gate.id === "public-app-url" && gate.status === "ready"));
assert.ok(result.gates.some((gate) => gate.id === "source-repo-url" && gate.status === "ready"));
assert.ok(result.gates.some((gate) => gate.id === "app-listing-url" && gate.status === "ready"));
assert.ok(result.gates.some((gate) => gate.id === "demo-post-url" && gate.status === "ready"));
assert.ok(result.gates.some((gate) => gate.id === "submission-window" && gate.status === "ready"));
assert.ok(result.nextCommands.some((command) => command.includes("export:submission-pack")));
assert.ok(result.nextCommands.some((command) => command.includes("export:devpost-fields")));
assert.ok(result.nextCommands.some((command) => command.includes("--sample-route")));
assert.match(formatText(result), /PASS release gate audit/);

const localResult = await auditReleaseGates({
  now: "2026-07-16T02:00:00.000Z",
  publicAppUrl: "http://localhost:8796/",
});
assert.equal(localResult.ok, false);
assert.ok(localResult.failures.some((failure) => failure.includes("Public app URL")));
assert.ok(localResult.failures.some((failure) => failure.includes("Submission window")));

const { stdout } = await run(process.execPath, [script, "--json"]);
const cliResult = JSON.parse(stdout);
assert.equal(cliResult.project, "signal-garden");
assert.equal(cliResult.ok, true);
assert.ok(
  cliResult.gates.some(
    (gate) =>
      gate.id === "public-app-url" &&
      gate.status === "ready" &&
      gate.detail === "https://signal-garden.vercel.app/ (default public app)",
  ),
);
assert.ok(cliResult.gates.some((gate) => gate.id === "origin" && ["ready", "waiting"].includes(gate.status)));
assert.ok(cliResult.gates.some((gate) => gate.id === "source-repo-url" && ["ready", "waiting"].includes(gate.status)));
assert.ok(
  cliResult.nextCommands.some((command) =>
    command.includes("npm run audit:public -- --base-url https://signal-garden.vercel.app/"),
  ),
);
assert.ok(
  cliResult.nextCommands.some((command) =>
    command.includes(
      "npm run export:devpost-fields -- --public-app-url https://signal-garden.vercel.app/ --source-repo-url https://github.com/OOYXLOO/signal-garden",
    ),
  ),
);

console.log("signal garden release gate audit tests passed");
