import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createPublicProofChecklistFromOptions } from "../scripts/export-public-proof-checklist.mjs";
import { formatPublicProofChecklist } from "../src/publicProofChecklist.js";

const run = promisify(execFile);
const script = new URL("../scripts/export-public-proof-checklist.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const checklist = createPublicProofChecklistFromOptions({ day: "2026-06-24" });
assert.equal(checklist.schemaVersion, "signal-garden-public-proof-checklist/v1");
assert.equal(checklist.projectName, "Signal Garden");
assert.equal(checklist.day, "2026-06-24");
assert.equal(checklist.sampleRouteUrl, "https://ooyxloo.github.io/signal-garden/?day=2026-06-24&sample=1");
assert.equal(checklist.groups.length, 6);
assert.equal(checklist.statusCounts.ready, 22);
assert.equal(checklist.statusCounts["user-gated"], 2);
assert.equal(checklist.statusCounts.optional, 1);
assert.ok(checklist.groups.some((group) => group.title === "Community loop"));
assert.ok(checklist.groups.some((group) => group.title === "Return loop"));
assert.ok(checklist.groups.some((group) => group.title === "Platform handoff"));
assert.ok(
  checklist.groups
    .flatMap((group) => group.items)
    .some((item) => item.label === "Public demo post" && item.status === "user-gated"),
);

const withUrls = createPublicProofChecklistFromOptions({
  day: "2026-06-24",
  appListingUrl: "https://developers.reddit.com/apps/signal-garden",
  demoPostUrl: "https://www.reddit.com/r/test/comments/signal_garden_demo/",
  feedbackConfirmationUrl: "https://example.com/public-feedback-confirmation",
});
assert.equal(withUrls.statusCounts.ready, 25);
assert.equal(withUrls.statusCounts.optional, undefined);
assert.equal(withUrls.statusCounts["user-gated"], undefined);

const markdown = formatPublicProofChecklist(checklist);
assert.match(markdown, /Signal Garden Public Proof Checklist/);
assert.match(markdown, /Public access/);
assert.match(markdown, /Gameplay proof/);
assert.match(markdown, /Community loop/);
assert.match(markdown, /Community launch plan/);
assert.match(markdown, /Return loop/);
assert.match(markdown, /Platform handoff/);
assert.match(markdown, /Final submission guard/);
assert.match(markdown, /day=2026-06-24&sample=1/);
assert.match(markdown, /Route import/);
assert.match(markdown, /Submission window/);
assert.match(markdown, /Final Pre-Submit Command/);
for (const pattern of [
  new RegExp(["money", "goal"].join("-"), "i"),
  new RegExp(["USD", "200"].join(" "), "i"),
  new RegExp(["pay", "out"].join(""), "i"),
  /password\s*[:=]/i,
  new RegExp(["api", "key"].join(" "), "i"),
]) {
  assert.doesNotMatch(markdown, pattern);
}

const { stdout } = await run(process.execPath, [script, "--day", "2026-06-25"]);
assert.match(stdout, /Signal Garden Public Proof Checklist/);
assert.match(stdout, /day=2026-06-25&sample=1/);
assert.match(stdout, /Public demo post/);

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:public-proof-checklist/);

assert.throws(
  () => createPublicProofChecklistFromOptions({ day: "2026-06-24", publicAppUrl: "http://127.0.0.1:8796/" }),
  /public app URL must be a public URL/,
);

console.log("signal garden export public proof checklist cli tests passed");
