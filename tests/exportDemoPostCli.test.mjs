import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const script = new URL("../scripts/export-demo-post.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const localFailure = await run(process.execPath, [
  script,
  "--public-app-url",
  "http://127.0.0.1:8797/signal-garden/",
  "--source-repo-url",
  "https://github.com/OOYXLOO/signal-garden",
  "--feedback-pack-url",
  "https://github.com/OOYXLOO/signal-garden/blob/master/docs/platform-feedback-pack.md",
  "--sample-route",
]).then(
  () => null,
  (error) => error,
);
assert.ok(localFailure);
assert.match(`${localFailure.stderr}${localFailure.stdout}`, /must be public/);

const { stdout } = await run(process.execPath, [
  script,
  "--day",
  "2026-06-19",
  "--sample-route",
  "--public-app-url",
  "https://ooyxloo.github.io/signal-garden/",
  "--source-repo-url",
  "https://github.com/OOYXLOO/signal-garden",
  "--feedback-pack-url",
  "https://github.com/OOYXLOO/signal-garden/blob/master/docs/platform-feedback-pack.md",
]);

assert.match(stdout, /# Signal Garden Reddit Demo Post Draft/);
assert.match(stdout, /Suggested Title/);
assert.match(stdout, /Suggested Body/);
assert.match(stdout, /Play the public build: https:\/\/ooyxloo\.github\.io\/signal-garden\//);
assert.match(stdout, /Open today's review route: https:\/\/ooyxloo\.github\.io\/signal-garden\//);
assert.match(stdout, /day=2026-06-19/);
assert.match(stdout, /plan=2-2-b\.2-6-b/);
assert.match(stdout, /Source and evidence: https:\/\/github\.com\/OOYXLOO\/signal-garden/);
assert.match(stdout, /Developer platform feedback pack:/);
assert.match(stdout, /How to try the community loop from this post:/);
assert.match(stdout, /Paste a full Review link from the app/);
assert.match(stdout, /r3c3\\ r7c3\\/);
assert.match(stdout, /Demo Post Reviewer Checklist/);
assert.match(stdout, /Sample thread import shows complete, partial, duplicate, and cross-day route handling/);
assert.match(stdout, /Suggested First Comment/);
assert.match(stdout, /Suggested Venues/);
assert.match(stdout, /No credentials, private messages, private dashboards/);

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:demo-post/);

console.log("signal garden export demo post cli tests passed");
