import { createSubmissionWindowStatus, formatSubmissionWindowStatus, submissionWindowGateStatus } from "./submissionWindow.js";

const DEFAULT_PUBLIC_APP_URL = "https://signal-garden.vercel.app/";
const DEFAULT_SOURCE_REPO_URL = "https://github.com/OOYXLOO/signal-garden";
const DEFAULT_RAW_BASE = "https://raw.githubusercontent.com/OOYXLOO/signal-garden/master";

export function todayUtcDay(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function assertDay(day) {
  const value = String(day || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("day must be YYYY-MM-DD");
  }
  return value;
}

function ensurePublicUrl(name, value, { required = true } = {}) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    if (required) throw new Error(`${name} is required`);
    return "";
  }
  const url = new URL(trimmed);
  const host = url.hostname.toLowerCase();
  if (!["http:", "https:"].includes(url.protocol)) throw new Error(`${name} must use http or https`);
  if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(host) || host.endsWith(".local") || host.endsWith(".test")) {
    throw new Error(`${name} must be a public URL`);
  }
  return url.toString();
}

function withTrailingSlash(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

function sampleRouteUrl(publicAppUrl, day) {
  const url = new URL(withTrailingSlash(publicAppUrl));
  url.searchParams.set("day", day);
  url.searchParams.set("sample", "1");
  return url.toString();
}

function judgeDeskUrl(publicAppUrl) {
  return new URL("judge.html", withTrailingSlash(publicAppUrl)).toString();
}

function raw(path) {
  return `${DEFAULT_RAW_BASE}/${path}`;
}

function readyStatus(value) {
  return value ? "ready" : "user-gated";
}

export function createExamplePostProofPack(options = {}) {
  const day = assertDay(options.day || todayUtcDay());
  const publicAppUrl = ensurePublicUrl("public app URL", options.publicAppUrl || DEFAULT_PUBLIC_APP_URL);
  const sourceRepoUrl = ensurePublicUrl("source repository URL", options.sourceRepoUrl || DEFAULT_SOURCE_REPO_URL);
  const appListingUrl = ensurePublicUrl("app listing URL", options.appListingUrl, { required: false });
  const demoPostUrl = ensurePublicUrl("demo post URL", options.demoPostUrl, { required: false });
  const sampleUrl = sampleRouteUrl(publicAppUrl, day);
  const judgeUrl = judgeDeskUrl(publicAppUrl);
  const submissionWindow = createSubmissionWindowStatus({ now: `${day}T12:00:00.000Z` });

  return {
    schemaVersion: "signal-garden-example-post-proof/v1",
    projectName: "Signal Garden",
    day,
    generatedAt: `${day}T12:00:00.000Z`,
    publicAppUrl,
    sampleRouteUrl: sampleUrl,
    judgeDeskUrl: judgeUrl,
    sourceRepoUrl,
    appListingUrl,
    demoPostUrl,
    submissionWindow,
    gateStatus: {
      appListing: readyStatus(appListingUrl),
      demoPost: readyStatus(demoPostUrl),
      submissionWindow: submissionWindowGateStatus(submissionWindow),
    },
    examplePost: {
      title: `Signal Garden daily relay - ${day}`,
      body: [
        "Today's board is a five-move relay puzzle: place mirrors, route the signal through the beacons, and share your route.",
        `Play the sample route: ${sampleUrl}`,
        "Reply with a Review link or a compact coordinate route so the thread can rank community proposals.",
      ],
      firstComment: [
        "Route reply format:",
        "Open the sample route, improve it, copy the Review link, and reply with the link or coordinates such as `r3c3 r7c3`.",
        "The app imports replies into ranked proposals and shows the leading route as a ghost route.",
      ],
    },
    commentShapes: [
      ["Review link", sampleUrl, "Importer accepts day-specific review URLs and extracts route state for ranking."],
      ["Coordinate-only route", "r3c3 r7c3 r7c5", "Importer accepts compact comment routes for the current board."],
      ["Recap reply", "Lead route solved 3/3 beacons; try shaving one mirror tomorrow.", "Launch packet and daily recap convert route state into a next-day prompt."],
    ],
    proofPath: [
      ["Open public game", publicAppUrl],
      ["Open sample route", sampleUrl],
      ["Load sample comment thread", "Reviewer loop panel shows import counts, skip reasons, ranked proposals, and top-route rationale."],
      ["Inspect judge desk", judgeUrl],
      ["Review source and manifest", `${sourceRepoUrl} and ${raw("docs/submission-manifest.json")}`],
    ],
    awardFit: [
      ["User contributions", "Comment replies become imported, ranked, replayable game proposals."],
      ["Retention", "Daily board, return map, recap copy, and next-day pledge make the thread a repeatable ritual."],
      ["Phaser", "Phaser board is paired with deterministic routes, replay animation, and community state import."],
      ["Feedback", "Platform feedback is tied to concrete Devvit WebView, asset, persistence, and comment-loop gaps."],
    ],
    safetyBoundaries: [
      "No passwords, OTPs, cookies, account settings, payment data, or private Reddit pages.",
      "No claim that the app listing or demo post exists until the public URLs are recorded.",
      "No private subreddit content is required for review; the sample thread proof is local and public.",
    ],
  };
}

function tableCell(value) {
  return String(value || "").replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|").trim();
}

function table(headers, rows) {
  return [
    `| ${headers.map(tableCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(tableCell).join(" | ")} |`),
  ].join("\n");
}

export function formatExamplePostProofPack(pack) {
  return [
    "# Signal Garden Example Post Proof Pack",
    "",
    `Generated for day: ${pack.day}`,
    "",
    "This pack shows how the public game, sample Reddit-style post, and comment-route import loop fit together. It does not post to Reddit, submit forms, access private pages, or include credentials.",
    "",
    "## Quick Links",
    "",
    `- Public app: ${pack.publicAppUrl}`,
    `- Sample route: ${pack.sampleRouteUrl}`,
    `- Judge desk: ${pack.judgeDeskUrl}`,
    `- Source repository: ${pack.sourceRepoUrl}`,
    `- App listing: ${pack.appListingUrl || "<add after public listing exists>"}`,
    `- Demo post: ${pack.demoPostUrl || "<add after public demo post exists>"}`,
    "",
    "## Gate Status",
    "",
    table(
      ["Gate", "Status"],
      [
        ["Submission window", `${pack.gateStatus.submissionWindow} - ${formatSubmissionWindowStatus(pack.submissionWindow)}`],
        ["App listing", pack.gateStatus.appListing],
        ["Demo post", pack.gateStatus.demoPost],
      ],
    ),
    "",
    "## Example Reddit-Style Post",
    "",
    `Title: ${pack.examplePost.title}`,
    "",
    "Body:",
    "",
    ...pack.examplePost.body.map((line) => `- ${line}`),
    "",
    "First comment:",
    "",
    ...pack.examplePost.firstComment.map((line) => `- ${line}`),
    "",
    "## Comment Shapes",
    "",
    table(["Shape", "Example", "Proof"], pack.commentShapes),
    "",
    "## Proof Path",
    "",
    table(["Step", "Evidence"], pack.proofPath),
    "",
    "## Award Fit",
    "",
    table(["Category", "Fit"], pack.awardFit),
    "",
    "## Safety Boundaries",
    "",
    ...pack.safetyBoundaries.map((item) => `- ${item}`),
    "",
  ].join("\n");
}
