import assert from "node:assert/strict";
import {
  buildSampleRouteUrl,
  createEvidenceReceipt,
  createFirstSessionGuide,
  createReviewerFastPath,
  createReviewerLoopChecks,
  createSubmissionReadiness,
  formatEvidenceReceipt,
  formatSubmissionReadiness,
  inferSourceRepoUrl,
} from "../src/reviewerGuide.js";
import { createDailyPuzzle, traceSignal } from "../src/game/puzzle.js";
import { createGardenLog, createReturnPledge, createSampleGardenArchive } from "../src/state/store.js";

const puzzle = createDailyPuzzle(new Date("2026-06-19T00:00:00.000Z"));
const result = traceSignal(puzzle, puzzle.solution);
const sampleUrl = buildSampleRouteUrl("https://example.test/play?plan=old&sampleRoute=true&x=1", puzzle);

assert.equal(sampleUrl, "https://example.test/play?x=1&day=2026-06-19&sample=1");
assert.equal(
  inferSourceRepoUrl("https://ooyxloo.github.io/signal-garden/?day=2026-06-19&sample=1"),
  "https://github.com/ooyxloo/signal-garden",
);
assert.equal(inferSourceRepoUrl("https://example.com/signal-garden/"), "");
assert.equal(inferSourceRepoUrl("http://127.0.0.1:8796/signal-garden/"), "");

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
assert.match(fastPath, /Lead rationale:/);
assert.match(fastPath, /Completes all 3 beacons/);
assert.match(fastPath, /Contribution quality: 80\/100/);
assert.match(fastPath, /Sample route: https:\/\/example\.test\/play/);
assert.match(fastPath, /Current review link:/);
assert.match(fastPath, /1-minute check:/);
assert.match(fastPath, /Reddit loop:/);

const emptyConsensus = createReviewerFastPath({ puzzle, result: null, plan: [], consensus: null });
assert.match(emptyConsensus, /No saved proposals yet/);

const draftGuide = createFirstSessionGuide({
  puzzle,
  result: null,
  plan: [],
  sampleRouteUrl: sampleUrl,
  consensus: null,
});
assert.equal(draftGuide.total, 4);
assert.equal(draftGuide.readyCount, 1);
assert.deepEqual(
  draftGuide.steps.map((step) => step.label),
  ["Trace the beam", "Open sample route", "Show community loop", "Copy handoff proof"],
);
assert.deepEqual(
  draftGuide.steps.map((step) => step.state),
  ["todo", "preview", "todo", "todo"],
);
assert.match(draftGuide.summary, /1\/4 first-session guide steps ready/);
assert.match(draftGuide.steps[0].detail, /open the sample route/);

const readyGuide = createFirstSessionGuide({
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
assert.equal(readyGuide.readyCount, 4);
assert.match(readyGuide.summary, /Reviewer path is ready/);
assert.deepEqual(readyGuide.steps.map((step) => step.state), ["ready", "preview", "ready", "ready"]);
assert.match(readyGuide.steps[2].detail, /top-route ghost/);

const loopChecks = createReviewerLoopChecks({
  puzzle,
  result,
  plan: puzzle.solution,
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
  launchPacket: "Signal Garden launch packet",
});
assert.deepEqual(
  loopChecks.map((check) => check.label),
  ["Open sample", "Trace route", "Rank proposal", "Quality proof", "Copy packet"],
);
assert.deepEqual(
  loopChecks.map((check) => check.state),
  ["preview", "ready", "ready", "ready", "ready"],
);
assert.match(loopChecks[2].detail, /1\/1 ranked proposals/);
assert.match(loopChecks[3].detail, /80\/100/);

const draftLoopChecks = createReviewerLoopChecks({ puzzle, sampleRouteUrl: sampleUrl });
assert.equal(draftLoopChecks.filter((check) => check.ready).length, 1);
assert.match(draftLoopChecks[1].detail, /Trace a route/);

const gardenLog = createGardenLog({
  currentPuzzleId: puzzle.id,
  archive: createSampleGardenArchive(puzzle.id),
});
const returnPledge = createReturnPledge({
  currentPuzzleId: puzzle.id,
  archive: createSampleGardenArchive(puzzle.id),
});
const readiness = createSubmissionReadiness({
  puzzle,
  result,
  plan: puzzle.solution,
  shareUrl: "https://example.test/play?day=2026-06-19&plan=2-2-b.2-6-b",
  sampleRouteUrl: sampleUrl,
  currentHref: "https://ooyxloo.github.io/signal-garden/?day=2026-06-19&sample=1",
  consensus: {
    completed: 1,
    proposalCount: 1,
    best: {
      score: result.score,
      beacons: 3,
      moves: 2,
    },
  },
  gardenLog,
  returnPledge,
  launchPacket: "Signal Garden launch packet",
});
assert.equal(readiness.total, 9);
assert.equal(readiness.readyCount, 8);
assert.match(readiness.summary, /8\/9 surfaces ready/);
assert.deepEqual(
  readiness.items.map((item) => item.label),
  [
    "Playable board",
    "Sample route",
    "Current Review link",
    "Public app URL",
    "Source repository",
    "Retention loop",
    "Contribution loop",
    "Launch packet",
    "Platform URLs",
  ],
);
const readinessText = formatSubmissionReadiness(readiness);
assert.match(readinessText, /Submission readiness/);
assert.match(readinessText, /Sample route: preview/);
assert.match(readinessText, /Public app URL: ready/);
assert.match(readinessText, /Source repository: ready/);
assert.match(readinessText, /github\.com\/ooyxloo\/signal-garden/);
assert.match(readinessText, /80\/100 contribution quality/);
assert.match(readinessText, /Next-day pledge:/);
assert.match(readinessText, /Platform URLs: waiting/);
assert.match(readinessText, /app listing and public demo post/);

const draftReadiness = createSubmissionReadiness({
  puzzle,
  result: null,
  plan: [],
  sampleRouteUrl: sampleUrl,
  currentHref: "http://127.0.0.1:8796/?sample=1",
  gardenLog,
});
assert.equal(draftReadiness.total, 9);
assert.equal(draftReadiness.readyCount, 3);
assert.match(formatSubmissionReadiness(draftReadiness), /Trace a route before copying/);
assert.match(formatSubmissionReadiness(draftReadiness), /Public app URL: waiting/);
assert.match(formatSubmissionReadiness(draftReadiness), /Source repository: waiting/);

const evidenceReceipt = createEvidenceReceipt({
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
  gardenLog,
  returnPledge,
  launchPacket: "Signal Garden launch packet",
  publicAppUrl: "https://ooyxloo.github.io/signal-garden/",
  sourceRepoUrl: "https://github.com/OOYXLOO/signal-garden",
  appListingUrl: "https://developers.reddit.com/apps/signal-garden",
  demoPostUrl: "https://www.reddit.com/r/test/comments/signal_garden/",
});
assert.equal(evidenceReceipt.summary, "6/6 public URL evidence slots ready");
assert.match(evidenceReceipt.claims.join(" "), /Playable puzzle/);
assert.match(evidenceReceipt.claims.join(" "), /Community proof: 1\/1 saved routes complete/);
assert.match(evidenceReceipt.claims.join(" "), /80\/100 contribution quality/);
assert.match(evidenceReceipt.claims.join(" "), /Retention proof:/);
assert.match(evidenceReceipt.claims.join(" "), /relay queued|return prompt/);
const evidenceReceiptText = formatEvidenceReceipt(evidenceReceipt);
assert.match(evidenceReceiptText, /Evidence claims/);
assert.match(evidenceReceiptText, /Public URLs/);
assert.match(evidenceReceiptText, /Source repository: https:\/\/github\.com\/OOYXLOO\/signal-garden/);
assert.match(evidenceReceiptText, /Safety proof/);

console.log("signal garden reviewer guide tests passed");
