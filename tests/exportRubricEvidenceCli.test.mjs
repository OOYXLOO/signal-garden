import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createRubricEvidenceFromOptions } from "../scripts/export-rubric-evidence.mjs";
import { formatRubricEvidenceMatrix, sampleRouteUrl } from "../src/rubricEvidence.js";

const run = promisify(execFile);
const script = new URL("../scripts/export-rubric-evidence.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const matrix = createRubricEvidenceFromOptions({ day: "2026-06-26" });
assert.equal(matrix.projectName, "Signal Garden");
assert.equal(matrix.checkedDay, "2026-06-26");
assert.equal(sampleRouteUrl("2026-06-26"), "https://ooyxloo.github.io/signal-garden/?day=2026-06-26&sample=1");
assert.ok(matrix.requiredSubmissionSurfaces.some((item) => item.requirement === "Working project access" && item.status === "ready"));
assert.ok(matrix.requiredSubmissionSurfaces.some((item) => item.requirement === "Public demo post URL" && item.status === "user-gated"));
assert.ok(matrix.judgingAngles.some((item) => item.angle === "Most Reddity" && item.fit.includes("comment-sized proposals")));
assert.ok(matrix.judgingAngles.some((item) => item.angle === "Developer Feedback" && item.proof.includes("developer-feedback-form-pack")));
assert.ok(matrix.riskRegister.some((item) => item.risk.includes("generic puzzle demo")));
assert.ok(matrix.nextExternalGates.some((item) => item.includes("Devvit app listing")));

const markdown = formatRubricEvidenceMatrix(matrix);
assert.match(markdown, /Signal Garden Rubric Evidence Matrix/);
assert.match(markdown, /day=2026-06-26&sample=1/);
assert.match(markdown, /Required Submission Surfaces/);
assert.match(markdown, /Judging Angle Fit/);
assert.match(markdown, /Delightful UX/);
assert.match(markdown, /Most Reddity/);
assert.match(markdown, /Phaser Innovation/);
assert.match(markdown, /Developer Feedback/);
assert.match(markdown, /user-gated/);
assert.match(markdown, /review aid only/);
for (const pattern of [
  new RegExp(["money", "goal"].join("-"), "i"),
  new RegExp(["USD", "200"].join(" "), "i"),
  new RegExp(["pay", "out"].join(""), "i"),
  new RegExp(["private", "key"].join(" "), "i"),
  new RegExp(["api", "key"].join(" "), "i"),
  /password\s*[:=]/i,
]) {
  assert.doesNotMatch(markdown, pattern);
}

const { stdout } = await run(process.execPath, [script, "--day", "2026-06-27"]);
assert.match(stdout, /Signal Garden Rubric Evidence Matrix/);
assert.match(stdout, /day=2026-06-27&sample=1/);
assert.match(stdout, /Public Reddit game surface/);
assert.match(stdout, /Next External Gates/);

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:rubric-evidence/);

console.log("signal garden export rubric evidence cli tests passed");
