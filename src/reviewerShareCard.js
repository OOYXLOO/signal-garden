import { encodePlanToken } from "./game/puzzle.js";

const schemaVersion = "signal-garden-reviewer-share-card/v1";

function assertPublicHttpUrl(name, value, { required = false, allowLocal = false } = {}) {
  const text = String(value || "").trim();
  if (!text) {
    if (required) {
      throw new Error(`${name} is required`);
    }
    return "";
  }

  let url;
  try {
    url = new URL(text);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`${name} must use http or https`);
  }
  if (!allowLocal && ["localhost", "127.0.0.1"].includes(url.hostname)) {
    throw new Error(`${name} must be public, not localhost`);
  }
  return url.toString();
}

function ensureDirectoryUrl(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

function buildJudgeUrl(publicAppUrl, judgeUrl, allowLocal) {
  const explicit = assertPublicHttpUrl("judge URL", judgeUrl, { allowLocal });
  if (explicit) {
    return explicit;
  }
  return new URL("judge.html", ensureDirectoryUrl(publicAppUrl)).toString();
}

function buildReviewUrl({ publicAppUrl, reviewUrl, puzzle, plan, allowLocal }) {
  const explicit = assertPublicHttpUrl("review URL", reviewUrl, { allowLocal });
  if (explicit) {
    return explicit;
  }
  if (!plan.length) {
    return "";
  }
  const url = new URL(publicAppUrl);
  url.searchParams.set("day", puzzle.id);
  url.searchParams.set("plan", encodePlanToken(plan));
  return url.toString();
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function xmlEscape(value) {
  return cleanText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markdownEscape(value) {
  return String(value || "").replace(/\|/g, "\\|").trim();
}

function routeStatus(result) {
  return result?.complete ? "complete" : result?.status || "open";
}

export function buildReviewerShareCard({
  puzzle,
  result,
  plan = [],
  publicAppUrl,
  sourceRepoUrl = "",
  judgeUrl = "",
  reviewUrl = "",
  allowLocal = false,
} = {}) {
  if (!puzzle) {
    throw new Error("buildReviewerShareCard requires a puzzle");
  }

  const playUrl = assertPublicHttpUrl("public app URL", publicAppUrl, { required: true, allowLocal });
  const sourceUrl = assertPublicHttpUrl("source repository URL", sourceRepoUrl, { allowLocal });
  const normalizedPlan = Array.isArray(plan) ? plan : [];
  const beaconCount = Array.isArray(puzzle.beacons) ? puzzle.beacons.length : 0;
  const hitCount = Array.isArray(result?.hitBeacons) ? result.hitBeacons.length : 0;
  const moves = normalizedPlan.length;
  const maxMoves = Number(puzzle.moveLimit || 0);
  const score = Number(result?.score || 0);
  const status = routeStatus(result);
  const review = buildReviewUrl({
    publicAppUrl: playUrl,
    reviewUrl,
    puzzle,
    plan: normalizedPlan,
    allowLocal,
  });

  const title = `Signal Garden ${puzzle.id}`;
  const subtitle = "Daily community relay puzzle for route sharing and comment-driven play.";
  const shortCaption = [
    "Daily community relay puzzle:",
    `${hitCount}/${beaconCount} beacons,`,
    `${moves}/${maxMoves} mirrors,`,
    `${score} points.`,
    "Open the Review link, replay the route, then reply with your own path.",
  ].join(" ");
  const longCaption = [
    `${title} turns a tiny mirror-route puzzle into a public community loop.`,
    "Review in under a minute: open the route, replay the beam, import sample comments, and compare the top route rationale.",
    "The build is static, source-visible, and designed to be checked without private account data.",
  ].join(" ");
  const firstCommentCta =
    "Reply with a Review link or a short coordinate route like `r3c3\\ r7c3\\`; Signal Garden can import routes, skip duplicates, and explain the current leader.";
  const altText = `Signal Garden share card for ${puzzle.id}: ${hitCount}/${beaconCount} beacons, ${moves}/${maxMoves} mirrors, ${score} points, public review links included.`;

  return {
    schemaVersion,
    title,
    subtitle,
    metrics: {
      status,
      score,
      beacons: `${hitCount}/${beaconCount}`,
      moves: `${moves}/${maxMoves}`,
    },
    links: {
      play: playUrl,
      review,
      judge: buildJudgeUrl(playUrl, judgeUrl, allowLocal),
      source: sourceUrl,
    },
    copy: {
      shortCaption,
      longCaption,
      firstCommentCta,
      altText,
    },
  };
}

export function renderReviewerShareCardMarkdown(card) {
  const rows = [
    ["Public app", card.links.play],
    ["Review route", card.links.review || "Add a route link after playtest."],
    ["Judge desk", card.links.judge],
    ["Source repository", card.links.source || "Add the public source repository URL."],
  ];

  return [
    "# Signal Garden Reviewer Share Card",
    "",
    "![Signal Garden reviewer share card](reviewer-share-card.svg)",
    "",
    "## Share Copy",
    "",
    card.copy.shortCaption,
    "",
    card.copy.longCaption,
    "",
    "## Quick Links",
    "",
    "| Field | URL |",
    "|---|---|",
    ...rows.map(([label, value]) => `| ${label} | ${markdownEscape(value)} |`),
    "",
    "## Route Metrics",
    "",
    `- Status: ${card.metrics.status}`,
    `- Score: ${card.metrics.score}`,
    `- Beacons: ${card.metrics.beacons}`,
    `- Mirrors: ${card.metrics.moves}`,
    "",
    "## First Comment CTA",
    "",
    card.copy.firstCommentCta,
    "",
    "## Alt Text",
    "",
    card.copy.altText,
    "",
    "## Safety Boundary",
    "",
    "This share card uses only public app, review, judge, and source links. It does not require credentials, private messages, account-console evidence, payment data, or private user data.",
    "",
  ].join("\n");
}

export function renderReviewerShareCardSvg(card) {
  const reviewLine = card.links.review ? "Review link restores the exact route" : "Sample route ready for review";
  const sourceLine = card.links.source ? "Source and judge desk linked" : "Judge desk linked";
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">',
    `<title id="title">${xmlEscape(card.title)}</title>`,
    `<desc id="desc">${xmlEscape(card.copy.altText)}</desc>`,
    "<defs>",
    '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">',
    '<stop offset="0%" stop-color="#102018"/>',
    '<stop offset="52%" stop-color="#18343b"/>',
    '<stop offset="100%" stop-color="#4a3322"/>',
    "</linearGradient>",
    '<filter id="soft" x="-20%" y="-20%" width="140%" height="140%">',
    '<feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#020805" flood-opacity="0.32"/>',
    "</filter>",
    "</defs>",
    '<rect width="1200" height="630" fill="url(#bg)"/>',
    '<rect x="64" y="58" width="1072" height="514" rx="28" fill="#f7f3e8" filter="url(#soft)"/>',
    '<rect x="96" y="90" width="1008" height="450" rx="18" fill="#163329"/>',
    '<path d="M126 415 C236 332 310 370 407 292 S596 160 714 242 S888 376 1070 206" fill="none" stroke="#f0b35d" stroke-width="14" stroke-linecap="round"/>',
    '<circle cx="126" cy="415" r="18" fill="#78d5a0"/>',
    '<circle cx="407" cy="292" r="18" fill="#78d5a0"/>',
    '<circle cx="714" cy="242" r="18" fill="#78d5a0"/>',
    '<circle cx="1070" cy="206" r="18" fill="#ff7a6a"/>',
    '<text x="126" y="162" fill="#f7f3e8" font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="700">Signal Garden</text>',
    `<text x="126" y="222" fill="#dbe8dd" font-family="Arial, Helvetica, sans-serif" font-size="34">${xmlEscape(card.title.replace("Signal Garden ", ""))} daily board</text>`,
    '<text x="126" y="292" fill="#f0b35d" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700">Review in 60 seconds</text>',
    `<text x="126" y="350" fill="#f7f3e8" font-family="Arial, Helvetica, sans-serif" font-size="32">${xmlEscape(`${card.metrics.beacons} beacons`)}</text>`,
    `<text x="354" y="350" fill="#f7f3e8" font-family="Arial, Helvetica, sans-serif" font-size="32">${xmlEscape(`${card.metrics.moves} mirrors`)}</text>`,
    `<text x="572" y="350" fill="#f7f3e8" font-family="Arial, Helvetica, sans-serif" font-size="32">${xmlEscape(`${card.metrics.score} pts`)}</text>`,
    `<text x="126" y="468" fill="#dbe8dd" font-family="Arial, Helvetica, sans-serif" font-size="28">${xmlEscape(reviewLine)}</text>`,
    `<text x="126" y="510" fill="#dbe8dd" font-family="Arial, Helvetica, sans-serif" font-size="28">${xmlEscape(sourceLine)}</text>`,
    '<text x="822" y="510" fill="#f0b35d" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">Comment routes shape the board</text>',
    "</svg>",
    "",
  ].join("\n");
}
