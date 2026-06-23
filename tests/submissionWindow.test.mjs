import assert from "node:assert/strict";
import {
  createSubmissionWindowStatus,
  formatSubmissionWindowStatus,
  submissionWindowGateStatus,
} from "../src/submissionWindow.js";

const open = createSubmissionWindowStatus({ now: "2026-06-24T04:00:00.000Z" });
assert.equal(open.phase, "open");
assert.equal(open.open, true);
assert.equal(open.daysRemaining, 22);
assert.match(open.detail, /Submissions close July 15, 2026/);
assert.match(open.sourceUrl, /redditgameswithahook\.devpost\.com\/rules/);
assert.equal(submissionWindowGateStatus(open), "ready");

const closingSoon = createSubmissionWindowStatus({ now: "2026-07-15T10:00:00.000Z" });
assert.equal(closingSoon.phase, "closing-soon");
assert.equal(closingSoon.open, true);
assert.equal(closingSoon.daysRemaining, 1);
assert.equal(submissionWindowGateStatus(closingSoon), "ready");

const closed = createSubmissionWindowStatus({ now: "2026-07-16T02:00:00.000Z" });
assert.equal(closed.phase, "closed");
assert.equal(closed.open, false);
assert.equal(submissionWindowGateStatus(closed), "blocked");

const formatted = formatSubmissionWindowStatus(open);
assert.match(formatted, /Submission window: open/);
assert.match(formatted, /22 day/);
assert.doesNotMatch(formatted, new RegExp(["USD", "200"].join(" "), "i"));
assert.doesNotMatch(formatted, new RegExp(["money", "goal"].join("-"), "i"));

console.log("signal garden submission window tests passed");
