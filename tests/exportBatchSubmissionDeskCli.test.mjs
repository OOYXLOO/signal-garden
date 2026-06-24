import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  createBatchSubmissionDesk,
  formatBatchSubmissionDesk,
} from "../src/batchSubmissionDesk.js";

const run = promisify(execFile);
const script = new URL("../scripts/export-batch-submission-desk.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const desk = createBatchSubmissionDesk({
  day: "2026-06-24",
  publicAppUrl: "https://ooyxloo.github.io/signal-garden/",
  sourceRepoUrl: "https://github.com/OOYXLOO/signal-garden",
  feedbackFormUrl: "https://forms.gle/YByxxCneDsn174qb9",
});

assert.equal(desk.title, "Signal Garden Batch Submission Desk");
assert.equal(desk.day, "2026-06-24");
assert.ok(desk.openOrder.some((item) => item.label === "Public app"));
assert.ok(desk.openOrder.some((item) => item.label === "Sample route"));
assert.ok(desk.openOrder.some((item) => item.label === "Judge desk"));
assert.ok(desk.openOrder.some((item) => item.label === "Source repository"));
assert.ok(desk.openOrder.some((item) => item.label === "Feedback form"));
assert.ok(desk.copyBlocks.some((item) => item.label === "Final pack command"));
assert.ok(desk.copyBlocks.some((item) => item.label === "Pre-gate pack command"));
assert.ok(desk.copyBlocks.some((item) => item.text.includes("--sample-route")));
assert.ok(desk.externalGates.some((item) => item.includes("Devvit")));
assert.ok(desk.externalGates.some((item) => item.includes("Reddit demo post")));
assert.ok(desk.externalGates.some((item) => item.includes("Devpost")));
assert.ok(desk.safetyBoundaries.some((item) => item.includes("Do not paste passwords")));

const markdown = formatBatchSubmissionDesk(desk);
const privateRoutePattern = new RegExp(`${"money"}-${"goal"}|USD ${"200"}|${"\u8d5a\u94b1"}`, "i");
assert.match(markdown, /# Signal Garden Batch Submission Desk/);
assert.match(markdown, /## Open In Order/);
assert.match(markdown, /https:\/\/ooyxloo\.github\.io\/signal-garden\/\?day=2026-06-24&sample=1/);
assert.match(markdown, /## Copy Blocks/);
assert.match(markdown, /npm run export:submission-pack/);
assert.match(markdown, /--allow-pending-platform-gates/);
assert.match(markdown, /<public-app-listing-url>/);
assert.match(markdown, /<public-demo-post-url>/);
assert.match(markdown, /## External Gates/);
assert.match(markdown, /## Safety Boundaries/);
assert.doesNotMatch(markdown, privateRoutePattern);

const { stdout } = await run(process.execPath, [
  script,
  "--day",
  "2026-06-24",
  "--public-app-url",
  "https://ooyxloo.github.io/signal-garden/",
  "--source-repo-url",
  "https://github.com/OOYXLOO/signal-garden",
]);

assert.match(stdout, /Signal Garden Batch Submission Desk/);
assert.match(stdout, /Open In Order/);
assert.match(stdout, /Copy Blocks/);
assert.match(stdout, /Feedback form/);
assert.match(stdout, /Do not paste passwords/);
assert.doesNotMatch(stdout, privateRoutePattern);

console.log("signal garden export batch submission desk cli tests passed");
