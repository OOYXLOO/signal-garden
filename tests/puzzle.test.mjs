import assert from "node:assert/strict";
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

console.log("signal garden puzzle tests passed");

