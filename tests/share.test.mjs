import assert from "node:assert/strict";
import { createDailyPuzzle } from "../src/game/puzzle.js";
import { buildShareUrl, createCommentChallenge, createShareBriefing, parseSharedRoute } from "../src/share.js";

const puzzle = createDailyPuzzle(new Date("2026-06-19T00:00:00.000Z"));
const shareUrl = buildShareUrl("https://example.test/play?old=1", puzzle, puzzle.solution);

assert.equal(shareUrl, "https://example.test/play?old=1&day=2026-06-19&plan=2-2-b.2-6-b");
assert.equal(buildShareUrl("https://example.test/play", puzzle, []), "");
assert.equal(createShareBriefing({ briefing: "Signal Garden", shareUrl }), `Signal Garden\nReview link: ${shareUrl}`);
assert.equal(createShareBriefing({ briefing: "Signal Garden", shareUrl: "" }), "Signal Garden");

const challenge = createCommentChallenge({
  puzzle,
  result: {
    status: "complete",
    score: 820,
    hitBeacons: puzzle.beacons,
  },
  plan: puzzle.solution,
  shareUrl,
  consensus: {
    best: {
      score: 900,
      beacons: 3,
      moves: 2,
    },
  },
});
assert.match(challenge, /Signal Garden 2026-06-19 challenge/);
assert.match(challenge, /My route: complete, 820 pts, 3\/3 beacons, 2\/5 moves/);
assert.match(challenge, /Review link: https:\/\/example\.test\/play/);
assert.match(challenge, /Current top: 900 pts, 3\/3 beacons, 2 moves/);
assert.match(challenge, /Reply with your Review link/);

const parsedLink = parseSharedRoute(`Try this path: ${shareUrl}`, puzzle);
assert.equal(parsedLink.ok, true);
assert.equal(parsedLink.source, "review-link");
assert.deepEqual(parsedLink.plan, puzzle.solution);

const parsedBriefing = parseSharedRoute(
  [
    "Signal Garden 2026-06-19",
    "Plan: backslash at 3,3; backslash at 3,7",
  ].join("\n"),
  puzzle,
);
assert.equal(parsedBriefing.ok, true);
assert.equal(parsedBriefing.source, "briefing");
assert.deepEqual(parsedBriefing.plan, puzzle.solution);

const wrongDay = parseSharedRoute("https://example.test/play?day=2026-06-18&plan=2-2-b", puzzle);
assert.equal(wrongDay.ok, false);
assert.match(wrongDay.error, /2026-06-18/);
assert.equal(parseSharedRoute("No route here", puzzle).ok, false);

console.log("signal garden share tests passed");
