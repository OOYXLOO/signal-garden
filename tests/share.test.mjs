import assert from "node:assert/strict";
import { createDailyPuzzle } from "../src/game/puzzle.js";
import { buildShareUrl, createShareBriefing } from "../src/share.js";

const puzzle = createDailyPuzzle(new Date("2026-06-19T00:00:00.000Z"));
const shareUrl = buildShareUrl("https://example.test/play?old=1", puzzle, puzzle.solution);

assert.equal(shareUrl, "https://example.test/play?old=1&day=2026-06-19&plan=2-2-b.2-6-b");
assert.equal(buildShareUrl("https://example.test/play", puzzle, []), "");
assert.equal(createShareBriefing({ briefing: "Signal Garden", shareUrl }), `Signal Garden\nReview link: ${shareUrl}`);
assert.equal(createShareBriefing({ briefing: "Signal Garden", shareUrl: "" }), "Signal Garden");

console.log("signal garden share tests passed");

