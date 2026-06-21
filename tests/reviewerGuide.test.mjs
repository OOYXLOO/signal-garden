import assert from "node:assert/strict";
import {
  buildSampleRouteUrl,
  createReviewerFastPath,
  createSubmissionReadiness,
  formatSubmissionReadiness,
} from "../src/reviewerGuide.js";
import { createDailyPuzzle, traceSignal } from "../src/game/puzzle.js";
import { createGardenLog, createSampleGardenArchive } from "../src/state/store.js";

const puzzle = createDailyPuzzle(new Date("2026-06-19T00:00:00.000Z"));
const result = traceSignal(puzzle, puzzle.solution);
const sampleUrl = buildSampleRouteUrl("https://example.test/play?plan=old&sampleRoute=true&x=1", puzzle);

assert.equal(sampleUrl, "https://example.test/play?x=1&day=2026-06-19&sample=1");

const fastPath = createReviewerFastPath({
  puzzle,
  result,
  plan: puzzle.solution,
  shareUrl: "https://example.test/play?day=2026-06-19&plan=2-2-b.2-6-b",
  sampleRouteUrl: sampleUrl,
  consensus: {
    completed: 1,
    proposalCount: 1,
    best: {
      score: result.score,
      beacons: 3,
      moves: 2,
    },
  },
});

assert.match(fastPath, /Signal Garden reviewer fast path/);
assert.match(fastPath, /Route state: complete/);
assert.match(fastPath, /Community state: 1\/1 saved routes complete/);
assert.match(fastPath, /Lead rationale:/);
assert.match(fastPath, /Completes all 3 beacons/);
assert.match(fastPath, /Sample route: https:\/\/example\.test\/play/);
assert.match(fastPath, /Current review link:/);
assert.match(fastPath, /1-minute check:/);
assert.match(fastPath, /Reddit loop:/);

const emptyConsensus = createReviewerFastPath({ puzzle, result: null, plan: [], consensus: null });
assert.match(emptyConsensus, /No saved proposals yet/);

const gardenLog = createGardenLog({
  currentPuzzleId: puzzle.id,
  archive: createSampleGardenArchive(puzzle.id),
});
const readiness = createSubmissionReadiness({
  puzzle,
  result,
  plan: puzzle.solution,
  shareUrl: "https://example.test/play?day=2026-06-19&plan=2-2-b.2-6-b",
  sampleRouteUrl: sampleUrl,
  consensus: {
    completed: 1,
    proposalCount: 1,
    best: {
      score: result.score,
      beacons: 3,
      moves: 2,
    },
  },
  gardenLog,
  launchPacket: "Signal Garden launch packet",
});
assert.equal(readiness.total, 7);
assert.equal(readiness.readyCount, 6);
assert.match(readiness.summary, /6\/7 surfaces ready/);
assert.deepEqual(
  readiness.items.map((item) => item.label),
  [
    "Playable board",
    "Sample route",
    "Current Review link",
    "Retention loop",
    "Contribution loop",
    "Launch packet",
    "Public URLs",
  ],
);
const readinessText = formatSubmissionReadiness(readiness);
assert.match(readinessText, /Submission readiness/);
assert.match(readinessText, /Sample route: preview/);
assert.match(readinessText, /Public URLs: waiting/);

const draftReadiness = createSubmissionReadiness({
  puzzle,
  result: null,
  plan: [],
  sampleRouteUrl: sampleUrl,
  gardenLog,
});
assert.equal(draftReadiness.readyCount, 3);
assert.match(formatSubmissionReadiness(draftReadiness), /Trace a route before copying/);

console.log("signal garden reviewer guide tests passed");
