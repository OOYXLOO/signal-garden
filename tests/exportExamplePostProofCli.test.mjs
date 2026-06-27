import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createExamplePostProofPackFromOptions } from "../scripts/export-example-post-proof.mjs";
import { formatExamplePostProofPack } from "../src/examplePostProof.js";

const run = promisify(execFile);
const script = new URL("../scripts/export-example-post-proof.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const pack = createExamplePostProofPackFromOptions({ day: "2026-06-28" });
assert.equal(pack.schemaVersion, "signal-garden-example-post-proof/v1");
assert.equal(pack.projectName, "Signal Garden");
assert.equal(pack.sampleRouteUrl, "https://signal-garden.vercel.app/?day=2026-06-28&sample=1");
assert.equal(pack.gateStatus.appListing, "user-gated");
assert.equal(pack.gateStatus.demoPost, "user-gated");
assert.equal(pack.commentShapes.length, 3);
assert.ok(pack.proofPath.some((item) => item[0] === "Load sample comment thread"));
assert.ok(pack.awardFit.some((item) => item[0] === "User contributions"));
assert.ok(pack.awardFit.some((item) => item[0] === "Retention"));

const ready = createExamplePostProofPackFromOptions({
  day: "2026-06-28",
  appListingUrl: "https://developers.reddit.com/apps/signal-garden",
  demoPostUrl: "https://www.reddit.com/r/test/comments/signal_garden_daily_relay/",
});
assert.equal(ready.gateStatus.appListing, "ready");
assert.equal(ready.gateStatus.demoPost, "ready");

const markdown = formatExamplePostProofPack(pack);
assert.match(markdown, /Signal Garden Example Post Proof Pack/);
assert.match(markdown, /Example Reddit-Style Post/);
assert.match(markdown, /Comment Shapes/);
assert.match(markdown, /r3c3 r7c3 r7c5/);
assert.match(markdown, /Award Fit/);
assert.match(markdown, /Safety Boundaries/);
for (const pattern of [
  new RegExp(["money", "goal"].join("-"), "i"),
  new RegExp(["USD", "200"].join(" "), "i"),
  new RegExp(["pay", "out"].join(""), "i"),
  /password\s*[:=]/i,
  new RegExp(["api", "key"].join(" "), "i"),
]) {
  assert.doesNotMatch(markdown, pattern);
}

const { stdout } = await run(process.execPath, [script, "--day", "2026-06-29"]);
assert.match(stdout, /day=2026-06-29&sample=1/);
assert.match(stdout, /Example Reddit-Style Post/);

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:example-post-proof/);

assert.throws(
  () => createExamplePostProofPackFromOptions({ day: "2026-06-28", publicAppUrl: "http://127.0.0.1:8796/" }),
  /public app URL must be a public URL/,
);

console.log("signal garden export example post proof cli tests passed");
