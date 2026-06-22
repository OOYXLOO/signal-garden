import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { auditReleaseGates, formatText, safePublicUrl } from "../scripts/audit-release-gates.mjs";

const run = promisify(execFile);
const script = new URL("../scripts/audit-release-gates.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

assert.deepEqual(safePublicUrl(""), { status: "waiting", detail: "not supplied yet" });
assert.equal(safePublicUrl("http://127.0.0.1:8796/").status, "blocked");
assert.equal(safePublicUrl("https://ooyxloo.github.io/signal-garden/").status, "ready");

const result = await auditReleaseGates({
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
assert.ok(result.nextCommands.some((command) => command.includes("export:submission-pack")));
assert.match(formatText(result), /PASS release gate audit/);

const localResult = await auditReleaseGates({
  publicAppUrl: "http://localhost:8796/",
});
assert.equal(localResult.ok, false);
assert.ok(localResult.failures.some((failure) => failure.includes("Public app URL")));

const { stdout } = await run(process.execPath, [script, "--json"]);
const cliResult = JSON.parse(stdout);
assert.equal(cliResult.project, "signal-garden");
assert.equal(cliResult.ok, true);
assert.ok(cliResult.gates.some((gate) => gate.id === "public-app-url" && gate.status === "waiting"));
assert.ok(cliResult.gates.some((gate) => gate.id === "source-repo-url" && gate.status === "waiting"));
assert.ok(cliResult.gates.some((gate) => gate.id === "origin" && ["ready", "waiting"].includes(gate.status)));

console.log("signal garden release gate audit tests passed");
