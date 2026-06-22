import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createDailyPuzzle, traceSignal } from "../src/game/puzzle.js";
import { summarizeConsensus } from "../src/game/proposals.js";
import { createPlatformFeedbackPack, countFeedbackText, formatPlatformFeedbackPack } from "../src/platformFeedback.js";

const execFileAsync = promisify(execFile);
const puzzle = createDailyPuzzle(new Date("2026-06-19T00:00:00.000Z"));
const plan = puzzle.solution;
const result = traceSignal(puzzle, plan);
const consensus = summarizeConsensus(puzzle, [
  {
    id: "test-proposal",
    puzzleId: puzzle.id,
    author: "local",
    createdAt: "2026-06-19T00:00:00.000Z",
    plan,
    status: result.status,
    complete: result.complete,
    score: result.score,
    beacons: result.hitBeacons.length,
    moves: result.moves.length,
  },
]);

const pack = createPlatformFeedbackPack({
  puzzle,
  result,
  plan,
  shareUrl: "https://example.test/signal-garden/?day=2026-06-19&plan=2-2-b.2-6-b",
  consensus,
});

assert.equal(pack.projectName, "Signal Garden");
assert.match(pack.buildSummary, /daily Phaser relay puzzle/);
assert.match(pack.stageSummary, /Route state: complete/);
assert.equal(pack.surveyHandoffChecklist.length, 4);
assert.equal(pack.actionabilityMatrix.length, 4);
assert.match(pack.actionabilityMatrix[0].recommendation, /asset checklist/);
assert.match(pack.feedbackSummary, /integration steps/);
assert.match(pack.improvement, /end-to-end Phaser game example/);
assert.match(pack.variants.short, /Phaser\/Vite asset checklist/);
assert.match(pack.variants.medium, /comment-to-game-state example/);
assert.match(pack.variants.long, /Signal Garden is a daily Phaser relay puzzle/);

for (const text of Object.values(pack.variants)) {
  const count = countFeedbackText(text);
  assert.ok(count.chars > 250);
  assert.ok(count.words > 40);
}

const formatted = formatPlatformFeedbackPack(pack);
assert.match(formatted, /Developer Platform Feedback/);
assert.match(formatted, /Survey Handoff Checklist/);
assert.match(formatted, /Actionability Matrix/);
assert.match(formatted, /Recommendation:/);
assert.match(formatted, /What Was Confusing Or Missing/);
assert.match(formatted, /Short Single-Field Version/);
assert.match(formatted, /chars=\d+ words=\d+/);
const forbiddenPublicTerms = [
  ["USD", "200"].join(" "),
  ["cash", "prize"].join(" "),
  ["pay", "out"].join(""),
  ["money", "goal"].join("-"),
];
for (const term of forbiddenPublicTerms) {
  assert.doesNotMatch(formatted, new RegExp(term, "i"));
}

const script = new URL("../scripts/export-platform-feedback.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const { stdout } = await execFileAsync(process.execPath, [
  script,
  "--day",
  "2026-06-19",
  "--sample-route",
  "--review-base-url",
  "https://example.test/signal-garden/",
]);
assert.match(stdout, /Signal Garden Developer Platform Feedback/);
assert.match(stdout, /Review path: https:\/\/example\.test\/signal-garden\/\?day=2026-06-19&plan=2-2-b\.2-6-b/);

const help = await execFileAsync(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:platform-feedback/);

console.log("signal garden platform feedback tests passed");
