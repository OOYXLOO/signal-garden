import assert from "node:assert/strict";
import { buildSampleRouteUrl, createReviewerFastPath } from "../src/reviewerGuide.js";
import { createDailyPuzzle, traceSignal } from "../src/game/puzzle.js";

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
assert.match(fastPath, /Sample route: https:\/\/example\.test\/play/);
assert.match(fastPath, /Current review link:/);
assert.match(fastPath, /1-minute check:/);
assert.match(fastPath, /Reddit loop:/);

const emptyConsensus = createReviewerFastPath({ puzzle, result: null, plan: [], consensus: null });
assert.match(emptyConsensus, /No saved proposals yet/);

console.log("signal garden reviewer guide tests passed");
