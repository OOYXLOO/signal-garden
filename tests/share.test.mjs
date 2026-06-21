import assert from "node:assert/strict";
import { createDailyPuzzle } from "../src/game/puzzle.js";
import { buildShareUrl, createCommentChallenge, createDeveloperFeedbackDraft, createRedditPostDraft, createReviewSnapshot, createShareBriefing, formatImportSkipReasons, parseSharedRoute, parseSharedRoutes, resolveInitialRoutePlan, wantsSampleRoute, wantsSampleWeek } from "../src/share.js";

const puzzle = createDailyPuzzle(new Date("2026-06-19T00:00:00.000Z"));
const shareUrl = buildShareUrl("https://example.test/play?old=1", puzzle, puzzle.solution);

assert.equal(shareUrl, "https://example.test/play?old=1&day=2026-06-19&plan=2-2-b.2-6-b");
assert.equal(buildShareUrl("https://example.test/play?sample=1", puzzle, puzzle.solution), "https://example.test/play?day=2026-06-19&plan=2-2-b.2-6-b");
assert.equal(buildShareUrl("https://example.test/play?sampleWeek=1&weekPreview=true", puzzle, puzzle.solution), "https://example.test/play?day=2026-06-19&plan=2-2-b.2-6-b");
assert.equal(buildShareUrl("https://example.test/play", puzzle, []), "");
assert.equal(createShareBriefing({ briefing: "Signal Garden", shareUrl }), `Signal Garden\nReview link: ${shareUrl}`);
assert.equal(createShareBriefing({ briefing: "Signal Garden", shareUrl: "" }), "Signal Garden");
assert.equal(wantsSampleRoute(new URLSearchParams("sample=1")), true);
assert.equal(wantsSampleRoute(new URLSearchParams("sampleRoute=true")), true);
assert.equal(wantsSampleRoute(new URLSearchParams("sample=0")), false);
assert.equal(wantsSampleWeek(new URLSearchParams("sample=1")), true);
assert.equal(wantsSampleWeek(new URLSearchParams("sampleWeek=week")), true);
assert.equal(wantsSampleWeek(new URLSearchParams("weekPreview=true")), true);
assert.equal(wantsSampleWeek(new URLSearchParams("")), false);
assert.deepEqual(
  resolveInitialRoutePlan({
    searchParams: new URLSearchParams("day=2026-06-19&sample=1"),
    puzzle,
    storedPlan: [{ x: 0, y: 0, mirror: "slash" }],
  }),
  puzzle.solution,
);
assert.deepEqual(
  resolveInitialRoutePlan({
    searchParams: new URLSearchParams("day=2026-06-19&plan=2-2-b.2-6-b&sample=1"),
    puzzle,
    storedPlan: [],
  }),
  puzzle.solution,
);
assert.deepEqual(
  resolveInitialRoutePlan({
    searchParams: new URLSearchParams(""),
    puzzle,
    storedPlan: [{ x: 0, y: 0, mirror: "slash" }],
  }),
  [{ x: 0, y: 0, mirror: "slash" }],
);

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

const postDraft = createRedditPostDraft({
  puzzle,
  result: {
    status: "complete",
    complete: true,
    score: 820,
    hitBeacons: puzzle.beacons,
  },
  plan: puzzle.solution,
  shareUrl,
  sampleRouteUrl: "https://example.test/play?day=2026-06-19&sample=1",
  consensus: {
    best: {
      score: 900,
      beacons: 3,
      moves: 2,
    },
  },
});
assert.match(postDraft, /Title: Signal Garden 2026-06-19/);
assert.match(postDraft, /Body:/);
assert.match(postDraft, /Current route: complete, 820 pts, 3\/3 beacons, 2\/5 moves/);
assert.match(postDraft, /Community target: 900 pts/);
assert.match(postDraft, /Review my route: https:\/\/example\.test\/play/);
assert.match(postDraft, /First comment prompt:/);
assert.match(postDraft, /explain why the top route leads/);

const feedbackDraft = createDeveloperFeedbackDraft({
  puzzle,
  result: {
    status: "complete",
    complete: true,
    score: 820,
    hitBeacons: puzzle.beacons,
  },
  plan: puzzle.solution,
  shareUrl,
  sampleRouteUrl: "https://example.test/play?day=2026-06-19&sample=1",
  consensus: {
    completed: 2,
    proposalCount: 3,
  },
});
assert.match(feedbackDraft, /developer feedback draft/);
assert.match(feedbackDraft, /Devvit Web-style client shell/);
assert.match(feedbackDraft, /Route state: complete, 820 pts, 3\/3 beacons, 2\/5 moves/);
assert.match(feedbackDraft, /Review path: https:\/\/example\.test\/play/);
assert.match(feedbackDraft, /Mobile WebView guidance/);
assert.match(feedbackDraft, /sample route URL/);

const snapshot = createReviewSnapshot({
  puzzle,
  result: {
    status: "complete",
    complete: true,
    score: 820,
    hitBeacons: puzzle.beacons,
  },
  plan: puzzle.solution,
  shareUrl,
  consensus: {
    completed: 2,
    proposalCount: 3,
    contributors: [{ author: "local-player" }],
    best: {
      score: 900,
      beacons: 3,
      moves: 2,
    },
  },
});
assert.match(snapshot, /Signal Garden review snapshot/);
assert.match(snapshot, /Route: complete, 820 pts, 3\/3 beacons, 2\/5 moves/);
assert.match(snapshot, /Community: 2\/3 saved routes complete, 1 contributors/);
assert.match(snapshot, /Top saved route: 900 pts, 3\/3 beacons, 2 moves/);
assert.match(snapshot, /Review link: https:\/\/example\.test\/play/);
assert.match(snapshot, /deterministic daily seed/);

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

const partialRouteUrl = buildShareUrl("https://example.test/play", puzzle, [{ x: 0, y: 0, mirror: "slash" }]);
const threadRoutes = parseSharedRoutes(
  [
    `u/alice: ${shareUrl}`,
    `@bob - ${partialRouteUrl}`,
    `u/old: https://example.test/play?day=2026-06-18&plan=2-2-b`,
    `u/alice-again: ${shareUrl}`,
  ].join("\n"),
  puzzle,
);
assert.equal(threadRoutes.ok, true);
assert.equal(threadRoutes.imported, 2);
assert.equal(threadRoutes.skipped, 2);
assert.equal(threadRoutes.candidates, 4);
assert.deepEqual(threadRoutes.skippedByReason, {
  "cross-day": 1,
  duplicate: 1,
});
assert.equal(formatImportSkipReasons(threadRoutes.skippedByReason), "1 cross-day, 1 duplicate");
assert.deepEqual(
  threadRoutes.routes.map((route) => route.author),
  ["alice", "bob"],
);
assert.deepEqual(threadRoutes.routes[0].plan, puzzle.solution);
assert.deepEqual(threadRoutes.routes[1].plan, [{ x: 0, y: 0, mirror: "slash" }]);
assert.match(threadRoutes.errors.join("\n"), /2026-06-18/);
assert.match(threadRoutes.errors.join("\n"), /Duplicate route skipped/);
assert.equal(parseSharedRoutes("", puzzle).ok, false);

console.log("signal garden share tests passed");
