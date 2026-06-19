import assert from "node:assert/strict";
import { createProposal, rankProposals, summarizeConsensus, toCommunityPayload } from "../src/game/proposals.js";
import { PUZZLE_TEMPLATES, createDailyPuzzle, createBriefing, describeResult, traceSignal } from "../src/game/puzzle.js";

const puzzle = createDailyPuzzle(new Date("2026-06-19T00:00:00.000Z"));
const solved = traceSignal(puzzle, puzzle.solution);
const empty = traceSignal(puzzle, []);

assert.equal(puzzle.size, 8);
assert.equal(puzzle.beacons.length, 3);
assert.ok(PUZZLE_TEMPLATES.length >= 7);
assert.equal(solved.complete, true);
assert.equal(solved.hitBeacons.length, 3);
assert.ok(solved.score > empty.score);
assert.match(createBriefing(puzzle, solved), /Signal Garden 2026-06-19/);
assert.match(describeResult(puzzle, solved), /All beacons/);
assert.match(describeResult(puzzle, empty), /row|Place mirrors|Receiver reached|left the garden/);

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

for (const template of PUZZLE_TEMPLATES) {
  const templatePuzzle = {
    id: "template-check",
    title: template.title,
    size: 8,
    moveLimit: 5,
    source: template.source,
    target: template.target,
    beacons: template.beacons,
    blockers: template.blockers,
    solution: template.solution,
  };
  const result = traceSignal(templatePuzzle, template.solution);
  assert.equal(result.complete, true, `${template.title} solution should complete`);
  assert.equal(result.hitBeacons.length, template.beacons.length, `${template.title} should hit every beacon`);
  assert.ok(result.moves.length <= templatePuzzle.moveLimit, `${template.title} should respect move limit`);
}

console.log("signal garden puzzle tests passed");
