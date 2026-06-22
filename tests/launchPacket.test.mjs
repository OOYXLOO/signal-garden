import assert from "node:assert/strict";
import { createLaunchPacket, formatLaunchPacket } from "../src/launchPacket.js";
import { createDailyPuzzle, traceSignal } from "../src/game/puzzle.js";

const puzzle = createDailyPuzzle(new Date("2026-06-19T00:00:00.000Z"));
const plan = puzzle.solution;
const result = traceSignal(puzzle, plan);
const shareUrl = "https://example.test/play?day=2026-06-19&plan=2-2-b.2-6-b";
const consensus = {
  completed: 2,
  proposalCount: 3,
  contributors: [{ author: "local-player", completed: 2, proposals: 2, bestScore: 920 }],
  best: {
    score: 920,
    beacons: 3,
    moves: 2,
    plan,
    complete: true,
  },
};

const packet = createLaunchPacket({
  puzzle,
  result,
  plan,
  shareUrl,
  consensus,
  appListingUrl: "https://developers.reddit.com/apps/signal-garden",
  demoPostUrl: "https://reddit.com/r/test/comments/signal_garden",
  feedbackUrl: "https://forms.gle/example",
  sourceRepoUrl: "https://github.com/OOYXLOO/signal-garden",
});

assert.equal(packet.title, "Signal Garden 2026-06-19: Harbor loop");
assert.match(packet.hook, /daily mirror-routing relay/);
assert.equal(packet.reviewLink, shareUrl);
assert.match(packet.currentRoute, /complete/);
assert.match(packet.currentRoute, /3\/3 beacons/);
assert.equal(packet.launchChecks.length, 6);
assert.match(packet.commentChallenge, /Reply with your Review link/);
assert.match(packet.redditPostDraft, /Title: Signal Garden 2026-06-19/);
assert.match(packet.redditPostDraft, /First comment prompt/);
assert.match(packet.developerFeedbackDraft, /developer feedback draft/);
assert.match(packet.developerFeedbackDraft, /Devvit Web-style client shell/);
assert.match(packet.reviewerFastPath, /reviewer fast path/);
assert.match(packet.reviewerFastPath, /Reddit loop/);
assert.match(packet.topRouteRationale.summary, /3\/3 beacons/);
assert.match(packet.topRouteRationale.points.join(" "), /Completes all 3 beacons/);
assert.match(packet.reviewSnapshot, /Judge checks/);
assert.match(packet.dailyRecap, /Signal Garden 2026-06-19 recap/);

const formatted = formatLaunchPacket(packet);
assert.match(formatted, /# Signal Garden 2026-06-19: Harbor loop/);
assert.match(formatted, /Demo post: https:\/\/reddit\.com\/r\/test\/comments\/signal_garden/);
assert.match(formatted, /Source repository: https:\/\/github\.com\/OOYXLOO\/signal-garden/);
assert.match(formatted, /App listing: https:\/\/developers\.reddit\.com\/apps\/signal-garden/);
assert.match(formatted, /Review link: https:\/\/example\.test\/play/);
assert.match(formatted, /## Why It Fits Reddit/);
assert.match(formatted, /## Comment Challenge/);
assert.match(formatted, /## Reddit Post Draft/);
assert.match(formatted, /## Reviewer Fast Path/);
assert.match(formatted, /## Top Route Rationale/);
assert.match(formatted, /## Review Snapshot/);
assert.match(formatted, /## Daily Recap/);
assert.match(formatted, /## Developer Platform Feedback/);
assert.match(formatted, /Product feedback:/);
assert.match(formatted, /Mobile WebView guidance/);
assert.match(formatted, /Dependency hygiene/);

const emptyRoutePacket = formatLaunchPacket(createLaunchPacket({ puzzle, result: null, plan: [], consensus: null }));
assert.match(emptyRoutePacket, /create a route first/);
assert.match(emptyRoutePacket, /Source repository: add after the public source repository exists/);

console.log("signal garden launch packet tests passed");
