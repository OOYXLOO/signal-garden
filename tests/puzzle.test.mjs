import assert from "node:assert/strict";
import { createProposal, rankProposals, summarizeConsensus, toCommunityPayload } from "../src/game/proposals.js";
import { createDailyPuzzle, createBriefing, traceSignal } from "../src/game/puzzle.js";

const puzzle = createDailyPuzzle(new Date("2026-06-19T00:00:00.000Z"));
const solved = traceSignal(puzzle, puzzle.solution);
const empty = traceSignal(puzzle, []);

assert.equal(puzzle.size, 8);
assert.equal(puzzle.beacons.length, 3);
assert.equal(solved.complete, true);
assert.equal(solved.hitBeacons.length, 3);
assert.ok(solved.score > empty.score);
assert.match(createBriefing(puzzle, solved), /Signal Garden 2026-06-19/);

const weakProposal = createProposal({
  puzzle,
  plan: [],
  author: "reader-a",
  createdAt: "2026-06-19T00:00:00.000Z",
});
const solvedProposal = createProposal({
  puzzle,
  plan: puzzle.solution,
  author: "reader-b",
  createdAt: "2026-06-19T00:01:00.000Z",
});
const ranked = rankProposals([weakProposal, solvedProposal]);
assert.equal(ranked[0].complete, true);
assert.equal(ranked[0].author, "reader-b");
const consensus = summarizeConsensus(puzzle, [weakProposal, solvedProposal]);
assert.equal(consensus.proposalCount, 2);
assert.equal(consensus.completed, 1);
assert.equal(consensus.best.id, solvedProposal.id);
assert.equal(toCommunityPayload(puzzle, [solvedProposal]).best.complete, true);

console.log("signal garden puzzle tests passed");
