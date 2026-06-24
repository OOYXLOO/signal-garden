import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  auditDeveloperFeedbackGate,
  createDeveloperFeedbackSurveyPack,
} from "../src/platformFeedback.js";

const run = promisify(execFile);
const script = new URL("../scripts/audit-feedback-gate.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const readyPack = createDeveloperFeedbackSurveyPack({
  now: "2026-06-24T04:00:00.000Z",
  username: "OOYXLOO",
});
const readyAudit = auditDeveloperFeedbackGate(readyPack);
assert.equal(readyAudit.ok, true);
assert.ok(readyAudit.checks.some((check) => check.id === "submission-window" && check.status === "ready"));
assert.ok(readyAudit.checks.some((check) => check.id === "feedback-runbook" && check.status === "ready"));
assert.ok(readyAudit.checks.some((check) => check.id === "stop-conditions" && check.status === "ready"));
assert.equal(readyAudit.failures.length, 0);

const closedPack = createDeveloperFeedbackSurveyPack({
  now: "2026-07-16T02:00:00.000Z",
  username: "OOYXLOO",
});
const closedAudit = auditDeveloperFeedbackGate(closedPack);
assert.equal(closedAudit.ok, false);
assert.ok(closedAudit.failures.some((failure) => failure.includes("Submission window is not open")));

const { stdout } = await run(process.execPath, [
  script,
  "--day",
  "2026-06-24",
  "--sample-route",
  "--username",
  "OOYXLOO",
  "--now",
  "2026-06-24T04:00:00.000Z",
]);
assert.match(stdout, /PASS feedback gate handoff ready/);
assert.match(stdout, /PASS submission-window/);
assert.match(stdout, /PASS feedback-runbook/);

const jsonRun = await run(process.execPath, [
  script,
  "--day",
  "2026-06-24",
  "--sample-route",
  "--username",
  "OOYXLOO",
  "--now",
  "2026-06-24T04:00:00.000Z",
  "--json",
]);
const json = JSON.parse(jsonRun.stdout);
assert.equal(json.ok, true);
assert.ok(json.checks.some((check) => check.id === "public-evidence-links"));

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /audit:feedback-gate/);

console.log("signal garden audit feedback gate cli tests passed");
