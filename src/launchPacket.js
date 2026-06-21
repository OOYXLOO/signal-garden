import { createDailyRecap } from "./game/proposals.js";
import { createCommentChallenge, createReviewSnapshot } from "./share.js";

const DEFAULT_FEEDBACK_URL = "https://forms.gle/";

function compactLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function resultSummary(puzzle, result, plan = []) {
  const status = result?.complete ? "complete" : result?.status || "drafting";
  const score = Number(result?.score || 0);
  const beacons = result?.hitBeacons?.length || 0;
  return `${status}, ${score} pts, ${beacons}/${puzzle.beacons.length} beacons, ${plan.length}/${puzzle.moveLimit} moves`;
}

export function createLaunchPacket({
  puzzle,
  result,
  plan = [],
  shareUrl = "",
  consensus = null,
  appListingUrl = "",
  demoPostUrl = "",
  feedbackUrl = DEFAULT_FEEDBACK_URL,
} = {}) {
  if (!puzzle) {
    throw new Error("createLaunchPacket requires a puzzle");
  }

  const reviewSnapshot = createReviewSnapshot({ puzzle, result, plan, shareUrl, consensus });
  const commentChallenge = createCommentChallenge({ puzzle, result, plan, shareUrl, consensus });
  const dailyRecap = createDailyRecap(
    puzzle,
    consensus || { completed: 0, proposalCount: 0, contributors: [], best: null },
  );
  const hasRoute = plan.length > 0 && Boolean(shareUrl);
  const launchChecks = [
    "Self-explanatory first post: board, objective, move limit, and one action are visible before reading docs.",
    "Return loop: deterministic daily board, streak state, archive rows, and recap copy make tomorrow matter.",
    "User contribution loop: review links from comments can become ranked community proposals.",
    "Phaser surface: beam trace, blockers, beacons, route replay, audio cues, and responsive canvas are inside the game.",
    "Safety boundary: no account tokens, private data, billing pages, or platform credentials are stored in the app.",
  ];

  return {
    title: `Signal Garden ${puzzle.id}: ${puzzle.title}`,
    hook: "A daily mirror-routing relay where every player route can become the next community proposal.",
    demoPostUrl: compactLine(demoPostUrl),
    appListingUrl: compactLine(appListingUrl),
    feedbackUrl: compactLine(feedbackUrl),
    currentRoute: resultSummary(puzzle, result, plan),
    reviewLink: hasRoute ? shareUrl : "",
    launchChecks,
    commentChallenge,
    reviewSnapshot,
    dailyRecap,
  };
}

export function formatLaunchPacket(packet) {
  const lines = [
    `# ${packet.title}`,
    "",
    `Hook: ${packet.hook}`,
    `Current route: ${packet.currentRoute}`,
  ];

  if (packet.reviewLink) {
    lines.push(`Review link: ${packet.reviewLink}`);
  } else {
    lines.push("Review link: create a route first, then copy this packet again.");
  }

  lines.push(
    "",
    "## Demo Post Setup",
    packet.demoPostUrl ? `Demo post: ${packet.demoPostUrl}` : "Demo post: add after the public demo post exists.",
    packet.appListingUrl ? `App listing: ${packet.appListingUrl}` : "App listing: add after the app listing exists.",
    "",
    "## Why It Fits Reddit",
    ...packet.launchChecks.map((check) => `- ${check}`),
    "",
    "## Comment Challenge",
    packet.commentChallenge,
    "",
    "## Review Snapshot",
    packet.reviewSnapshot,
    "",
    "## Daily Recap",
    packet.dailyRecap,
    "",
    "## Developer Platform Feedback",
    `Survey URL: ${packet.feedbackUrl || "add official survey URL"}`,
    "Feedback topics: Devvit Web setup, Phaser static assets, interactive post judging path, mobile WebView checks, and post/comment route import flow.",
  );

  return lines.join("\n");
}
