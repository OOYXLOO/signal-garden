import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const script = new URL("../scripts/export-reviewer-share-card.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const localFailure = await run(process.execPath, [
  script,
  "--public-app-url",
  "http://127.0.0.1:8796/",
  "--sample-route",
]).then(
  () => null,
  (error) => error,
);
assert.ok(localFailure);
assert.match(`${localFailure.stderr}${localFailure.stdout}`, /must be public/);

const jsonRun = await run(process.execPath, [
  script,
  "--format",
  "json",
  "--day",
  "2026-06-19",
  "--sample-route",
  "--public-app-url",
  "https://ooyxloo.github.io/signal-garden/",
  "--source-repo-url",
  "https://github.com/OOYXLOO/signal-garden",
]);
const card = JSON.parse(jsonRun.stdout);
assert.equal(card.schemaVersion, "signal-garden-reviewer-share-card/v1");
assert.equal(card.links.judge, "https://ooyxloo.github.io/signal-garden/judge.html");
assert.match(card.links.review, /plan=2-2-b\.2-6-b/);

const markdownRun = await run(process.execPath, [
  script,
  "--day",
  "2026-06-19",
  "--sample-route",
  "--public-app-url",
  "https://ooyxloo.github.io/signal-garden/",
  "--source-repo-url",
  "https://github.com/OOYXLOO/signal-garden",
]);
assert.match(markdownRun.stdout, /# Signal Garden Reviewer Share Card/);
assert.match(markdownRun.stdout, /First Comment CTA/);

const svgRun = await run(process.execPath, [
  script,
  "--format",
  "svg",
  "--day",
  "2026-06-19",
  "--sample-route",
  "--public-app-url",
  "https://ooyxloo.github.io/signal-garden/",
  "--source-repo-url",
  "https://github.com/OOYXLOO/signal-garden",
]);
assert.match(svgRun.stdout, /<svg[^>]+width="1200"[^>]+height="630"/);
assert.match(svgRun.stdout, /Signal Garden 2026-06-19/);

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:reviewer-share-card/);

console.log("signal garden export reviewer share card cli tests passed");
