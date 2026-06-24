import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createFeedbackFormPackFromOptions } from "../scripts/export-feedback-form-pack.mjs";
import { formatDeveloperFeedbackSurveyPack } from "../src/platformFeedback.js";

const run = promisify(execFile);
const script = new URL("../scripts/export-feedback-form-pack.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const pack = createFeedbackFormPackFromOptions({
  day: "2026-06-24",
  now: "2026-07-14T18:30:00-07:00",
  sampleRoute: true,
  username: "OOYXLOO",
});

assert.equal(pack.formTitle, "Developer Feedback Survey");
assert.ok(pack.submissionChecklist.length >= 5);
assert.ok(pack.submissionChecklist.some((item) => item.includes("registered for the hackathon")));
assert.ok(pack.eligibilityChecklist.some((item) => item.includes("Devpost project entry")));
assert.ok(pack.eligibilityChecklist.some((item) => item.includes("actionable comments")));
assert.ok(pack.publicEvidenceLinks.some((link) => link.label === "Judge desk"));
assert.ok(pack.publicEvidenceLinks.some((link) => link.label === "Sample route" && link.url.includes("day=2026-06-24")));
assert.ok(!pack.publicEvidenceLinks.some((link) => link.label === "Sample route" && link.url.includes("day=2026-06-22")));
assert.equal(pack.feedbackAwardEvidence.source, "Reddit Games with a Hook Hackathon Devpost page");
assert.equal(pack.feedbackAwardEvidence.deadline, "2026-07-15 18:00 PDT");
assert.equal(pack.feedbackAwardEvidence.windowStatus.phase, "closing-soon");
assert.equal(pack.feedbackAwardEvidence.windowStatus.open, true);
assert.equal(pack.feedbackAwardEvidence.windowStatus.daysRemaining, 1);
assert.ok(pack.feedbackAwardEvidence.gateRunbook.some((item) => item.includes("Start or open the Signal Garden Devpost project entry")));
assert.ok(pack.feedbackAwardEvidence.gateRunbook.some((item) => item.includes("Submit the feedback form")));
assert.ok(pack.feedbackAwardEvidence.stopConditions.some((item) => item.includes("Do not submit")));
assert.ok(pack.feedbackAwardEvidence.prerequisites.some((item) => item.includes("Devpost project entry")));
assert.ok(pack.feedbackAwardEvidence.publicProof.some((item) => item.includes("Public app")));
assert.doesNotMatch(JSON.stringify(pack.feedbackAwardEvidence), /\$|USD|cash|prize/i);
assert.equal(pack.fields.length, 16);
assert.equal(pack.fields[0].answer, "8");
assert.equal(pack.fields[4].answer, "4");
assert.equal(pack.fields[6].answer, "3");
assert.equal(pack.fields[10].answer, "Yes");
assert.equal(pack.fields[12].answer, "No");
assert.equal(pack.fields[13].answer, "OOYXLOO");
assert.ok(pack.fields.some((field) => field.question.includes("What would get you most excited")));
assert.ok(pack.fields.some((field) => field.answer.includes("Phaser/Vite config")));
assert.ok(pack.fields.some((field) => field.answer.includes("Concrete reproduction notes")));

const markdown = formatDeveloperFeedbackSurveyPack(pack);
assert.match(markdown, /Signal Garden Developer Feedback Form Pack/);
assert.match(markdown, /Submission Checklist/);
assert.match(markdown, /Eligibility Gate Checklist/);
assert.match(markdown, /registered hackathon participant/i);
assert.match(markdown, /Signal Garden Devpost project entry/);
assert.match(markdown, /Public Evidence Links/);
assert.match(markdown, /Feedback Award Evidence Receipt/);
assert.match(markdown, /Submission window: closing-soon/);
assert.match(markdown, /1 day remain/);
assert.match(markdown, /Feedback Submission Runbook/);
assert.match(markdown, /Start or open the Signal Garden Devpost project entry/);
assert.match(markdown, /Stop Conditions/);
assert.match(markdown, /2026-07-15 18:00 PDT/);
assert.match(markdown, /Answer Index/);
assert.match(markdown, /\| # \| Question \| chars \| words \| note \|/);
assert.match(markdown, /How likely are you to recommend/);
assert.match(markdown, /What is your username/);
assert.match(markdown, /copy-only and does not submit/);
assert.match(markdown, /OOYXLOO/);
assert.match(markdown, /Do not paste credentials/);
assert.doesNotMatch(markdown, /password\s*[:=]|otp\s*[:=]|sk-[a-z0-9]{20,}|AKIA[0-9A-Z]{16}/i);

const { stdout } = await run(process.execPath, [script, "--day", "2026-06-25", "--sample-route", "--username", "OOYXLOO"]);
assert.match(stdout, /Developer Feedback Survey/);
assert.match(stdout, /Feedback Award Evidence Receipt/);
assert.match(stdout, /How satisfied are you with the developer experience/);
assert.match(stdout, /Concrete reproduction notes/);
assert.match(stdout, /OOYXLOO/);
assert.match(stdout, /day=2026-06-25&sample=1/);
assert.doesNotMatch(stdout, /day=2026-06-22&sample=1/);

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:feedback-form-pack/);

console.log("signal garden export feedback form pack cli tests passed");
