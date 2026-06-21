import assert from "node:assert/strict";
import { createCommunityTarget, createDailyRecap, createProposal, rankProposals, summarizeConsensus, summarizeContributors, toCommunityPayload } from "../src/game/proposals.js";
import { PUZZLE_TEMPLATES, createDailyPuzzle, createBriefing, createObjectiveList, createPuzzleForDayKey, createRouteInsight, decodePlanToken, describeResult, encodePlanToken, traceSignal } from "../src/game/puzzle.js";

const puzzle = createDailyPuzzle(new Date("2026-06-19T00:00:00.000Z"));
const linkedPuzzle = createPuzzleForDayKey("2026-06-19");
const solved = traceSignal(puzzle, puzzle.solution);
const empty = traceSignal(puzzle, []);

assert.equal(linkedPuzzle.id, puzzle.id);
assert.equal(createPuzzleForDayKey("2026-02-31"), null);
assert.equal(createPuzzleForDayKey("not-a-day"), null);
assert.equal(puzzle.size, 8);
assert.equal(puzzle.beacons.length, 3);
assert.ok(PUZZLE_TEMPLATES.length >= 7);
assert.equal(solved.complete, true);
assert.equal(solved.hitBeacons.length, 3);
assert.ok(solved.score > empty.score);
assert.match(createBriefing(puzzle, solved), /Signal Garden 2026-06-19/);
assert.match(describeResult(puzzle, solved), /All beacons/);
assert.match(describeResult(puzzle, empty), /row|Place mirrors|Receiver reached|left the garden/);
assert.match(createRouteInsight(puzzle, solved).map((insight) => insight.value).join(" "), /beacons are connected/);
assert.match(createRouteInsight(puzzle, empty).map((insight) => insight.value).join(" "), /first beacon|leaves after/);
assert.deepEqual(createObjectiveList(puzzle, solved).map((objective) => objective.complete), [true, true, true, true]);
assert.equal(createObjectiveList(puzzle, empty).filter((objective) => objective.complete).length, empty.hitBeacons.length);
assert.equal(createObjectiveList(puzzle, empty).at(-1).complete, false);
assert.deepEqual(decodePlanToken(encodePlanToken(puzzle.solution), puzzle), puzzle.solution);
assert.deepEqual(decodePlanToken(encodePlanToken(linkedPuzzle.solution), linkedPuzzle), linkedPuzzle.solution);
assert.deepEqual(decodePlanToken(`0-0-s.99-1-b.bad.${puzzle.blockers[0].x}-${puzzle.blockers[0].y}-b`, puzzle), [{ x: 0, y: 0, mirror: "slash" }]);

const partialPuzzle = {
  id: "partial-check",
  title: "Partial check",
  size: 8,
  moveLimit: 5,
  source: { x: 0, y: 0, dir: "E" },
  target: { x: 3, y: 0 },
  beacons: [
    { x: 1, y: 0 },
    { x: 2, y: 2 },
    { x: 4, y: 4 },
  ],
  blockers: [],
  solution: [],
};
const partial = traceSignal(partialPuzzle, [{ x: 7, y: 7, mirror: "slash" }]);
assert.equal(partial.status, "partial");
assert.match(createRouteInsight(partialPuzzle, partial).map((insight) => insight.value).join(" "), /Missing|row 3, column 3/);

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
assert.equal(consensus.contributors[0].author, "reader-b");
assert.equal(consensus.contributors[0].completed, 1);
assert.equal(summarizeContributors([weakProposal, solvedProposal]).length, 2);
assert.match(createDailyRecap(puzzle, consensus), /Contributor lead: reader-b/);
assert.equal(toCommunityPayload(puzzle, [solvedProposal]).best.complete, true);
assert.equal(toCommunityPayload(puzzle, [solvedProposal]).contributors, 1);
assert.equal(createCommunityTarget(puzzle, solved, summarizeConsensus(puzzle, [])).state, "open");
assert.equal(createCommunityTarget(puzzle, empty, consensus).state, "chasing");
assert.match(createCommunityTarget(puzzle, empty, consensus).detail, /Top saved route/);
assert.equal(createCommunityTarget(puzzle, solved, consensus).state, "matched");
assert.equal(createCommunityTarget(puzzle, solved, summarizeConsensus(puzzle, [weakProposal])).state, "leading");

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
