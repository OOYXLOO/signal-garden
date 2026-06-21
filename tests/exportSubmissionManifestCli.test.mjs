import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

const script = new URL("../scripts/export-submission-manifest.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const { stdout } = await run(process.execPath, [script]);
const manifest = JSON.parse(stdout);

assert.equal(manifest.schemaVersion, "signal-garden-submission-manifest/v1");
assert.equal(manifest.project.name, "Signal Garden");
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/demo-final-captioned.webm"));
assert.ok(manifest.evidence.some((entry) => entry.path === ".github/workflows/deploy-pages.yml"));
assert.ok(manifest.evidence.some((entry) => entry.path === "scripts/audit-pages-build.mjs"));
assert.ok(manifest.evidence.every((entry) => typeof entry.bytes === "number" && entry.bytes > 0));
assert.ok(manifest.evidence.every((entry) => /^[a-f0-9]{64}$/.test(entry.sha256)));
assert.match(manifest.launchPacketCommand, /export:launch-packet/);
assert.ok(manifest.requiredLocalChecks.includes("npm run audit:submission"));
assert.ok(manifest.requiredLocalChecks.includes("npm run audit:pages"));

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:submission-manifest/);

console.log("signal garden export submission manifest cli tests passed");
