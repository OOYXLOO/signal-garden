import assert from "node:assert/strict";
import { createCommunityLaunchPlan } from "../src/communityLaunchPlan.js";
import { createPreviewConsensus, summarizeConsensus, createProposal } from "../src/game/proposals.js";
import { createDailyPuzzle, traceSignal } from "../src/game/puzzle.js";
import { createGardenLog, createReturnPledge, createSampleGardenArchive } from "../src/state/store.js";

const puzzle = createDailyPuzzle(new Date("2026-06-26T00:00:00.000Z"));
const solved = traceSignal(puzzle, puzzle.solution);
const archive = createSampleGardenArchive(puzzle.id);
const gardenLog = createGardenLog({ currentPuzzleId: puzzle.id, archive });
const returnPledge = createReturnPledge({ currentPuzzleId: puzzle.id, archive });
const actualArchive = [
  { id: puzzle.id, complete: true, status: "complete", score: solved.score, beacons: 3, moves: puzzle.solution.length, plan: puzzle.solution },
  { id: "2026-06-25", complete: true, status: "complete", score: 740, beacons: 3, moves: 3, plan: puzzle.solution.slice(0, 1) },
];

const openPlan = createCommunityLaunchPlan({
  puzzle,
  result: traceSignal(puzzle, []),
  plan: [],
});
assert.equal(openPlan.state, "todo");
assert.equal(openPlan.metrics.length, 4);
assert.match(openPlan.copy, /Signal Garden 2026-06-26 community launch/);
assert.match(openPlan.copy, /Top route: open/);

const previewPlan = createCommunityLaunchPlan({
  puzzle,
  result: solved,
  plan: puzzle.solution,
  sampleRouteUrl: "https://example.test/signal-garden/?day=2026-06-26&sample=1",
  consensus: createPreviewConsensus(puzzle, puzzle.solution),
  gardenLog,
  returnPledge,
});
assert.equal(previewPlan.state, "preview");
assert.match(previewPlan.summary, /preview/);
assert.match(previewPlan.copy, /Sample route:/);
assert.match(previewPlan.copy, /Return hook:/);

const proposals = [
  createProposal({ puzzle, plan: puzzle.solution, author: "route-a", createdAt: "2026-06-26T00:00:00.000Z" }),
  createProposal({ puzzle, plan: puzzle.solution.slice(0, 1), author: "route-b", createdAt: "2026-06-26T00:01:00.000Z" }),
];
const readyPlan = createCommunityLaunchPlan({
  puzzle,
  result: solved,
  plan: puzzle.solution,
  shareUrl: "https://example.test/signal-garden/?day=2026-06-26&plan=1-2-s",
  sampleRouteUrl: "https://example.test/signal-garden/?day=2026-06-26&sample=1",
  consensus: summarizeConsensus(puzzle, proposals),
  gardenLog: createGardenLog({ currentPuzzleId: puzzle.id, archive: actualArchive }),
  returnPledge: createReturnPledge({ currentPuzzleId: puzzle.id, archive: actualArchive }),
});
assert.equal(readyPlan.state, "ready");
assert.match(readyPlan.summary, /ready/);
assert.match(readyPlan.copy, /pin the first comment/);
assert.match(readyPlan.copy, /route-a|route-b/);

console.log("signal garden community launch plan tests passed");
