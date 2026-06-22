import { decodePlanToken, encodePlanToken } from "./game/puzzle.js";

function clonePlan(plan = []) {
  return plan.map((move) => ({ x: move.x, y: move.y, mirror: move.mirror }));
}

export function wantsSampleRoute(searchParams) {
  const value = String(searchParams.get("sample") || searchParams.get("sampleRoute") || "").toLowerCase();
  return ["1", "true", "yes", "route"].includes(value);
}

export function wantsSampleWeek(searchParams) {
  const value = String(searchParams.get("sampleWeek") || searchParams.get("weekPreview") || "").toLowerCase();
  return wantsSampleRoute(searchParams) || ["1", "true", "yes", "week"].includes(value);
}

export function resolveInitialRoutePlan({ searchParams, puzzle, storedPlan = [] }) {
  const sharedDay = searchParams.get("day");
  const sharedPlan = sharedDay === puzzle.id ? decodePlanToken(searchParams.get("plan"), puzzle) : [];
  if (sharedPlan.length) {
    return sharedPlan;
  }
  if (wantsSampleRoute(searchParams)) {
    return clonePlan(puzzle.solution);
  }
  return clonePlan(storedPlan);
}

export function buildShareUrl(currentHref, puzzle, plan = []) {
  if (!plan.length) {
    return "";
  }
  const url = new URL(currentHref);
  url.searchParams.delete("sample");
  url.searchParams.delete("sampleRoute");
  url.searchParams.delete("sampleWeek");
  url.searchParams.delete("weekPreview");
  url.searchParams.set("day", puzzle.id);
  url.searchParams.set("plan", encodePlanToken(plan));
  return url.toString();
}

export function createShareBriefing({ briefing, shareUrl }) {
  if (!shareUrl) {
    return briefing;
  }
  return `${briefing}\nReview link: ${shareUrl}`;
}

export function createCommentChallenge({ puzzle, result, plan = [], shareUrl = "", consensus = null }) {
  const hasRoute = plan.length > 0 && result;
  const best = consensus?.best || null;
  const lines = [
    `Signal Garden ${puzzle.id} challenge`,
    `${puzzle.title}: ${puzzle.brief}`,
    hasRoute
      ? `My route: ${result.status}, ${result.score} pts, ${result.hitBeacons.length}/${puzzle.beacons.length} beacons, ${plan.length}/${puzzle.moveLimit} moves.`
      : `Open board: ${puzzle.beacons.length} beacons, ${puzzle.moveLimit} mirrors max.`,
  ];

  if (shareUrl) {
    lines.push(`Review link: ${shareUrl}`);
  }

  lines.push(
    best
      ? `Current top: ${best.score} pts, ${best.beacons}/${puzzle.beacons.length} beacons, ${best.moves} moves.`
      : "Current top: open.",
  );
  lines.push("Reply with your Review link or a short route like `r3c3\\ r7c3\\` so it can join the community board.");
  return lines.join("\n");
}

export function createRedditPostDraft({
  puzzle,
  result,
  plan = [],
  shareUrl = "",
  sampleRouteUrl = "",
  consensus = null,
} = {}) {
  const best = consensus?.best || null;
  const hasRoute = plan.length > 0 && result;
  const status = result?.complete ? "complete" : result?.status || "open";
  const score = Number(result?.score || 0);
  const beacons = result?.hitBeacons?.length || 0;
  const reviewLine = shareUrl
    ? `Review my route: ${shareUrl}`
    : sampleRouteUrl
      ? `Quick review route: ${sampleRouteUrl}`
      : "Review route: add a public route link after playtest.";
  const title = `Signal Garden ${puzzle.id}: route today's ${puzzle.title}`;
  const lines = [
    `Title: ${title}`,
    "",
    "Body:",
    `${puzzle.brief}`,
    "",
    hasRoute
      ? `Current route: ${status}, ${score} pts, ${beacons}/${puzzle.beacons.length} beacons, ${plan.length}/${puzzle.moveLimit} moves.`
      : `Open board: ${puzzle.beacons.length} beacons, ${puzzle.moveLimit} mirrors max.`,
    best
      ? `Community target: ${best.score} pts, ${best.beacons}/${puzzle.beacons.length} beacons, ${best.moves} moves.`
      : "Community target: open. First complete route sets the chase target.",
    reviewLine,
    "",
    "Try it: place mirrors, copy your Review link, then reply with it or a short coordinate route so the route can join the daily board.",
    "",
    "First comment prompt:",
    "Reply with your Review link or a short route like `r3c3\\ r7c3\\`. The app can import a thread of routes, skip duplicate or cross-day routes, and explain why the top route leads.",
  ];
  return lines.join("\n");
}

export function createDeveloperFeedbackDraft({
  puzzle,
  result,
  plan = [],
  shareUrl = "",
  sampleRouteUrl = "",
  consensus = null,
} = {}) {
  if (!puzzle) {
    throw new Error("createDeveloperFeedbackDraft requires a puzzle");
  }

  const status = result?.complete ? "complete" : result?.status || "open";
  const score = Number(result?.score || 0);
  const beacons = result?.hitBeacons?.length || 0;
  const completed = Number(consensus?.completed || 0);
  const proposalCount = Number(consensus?.proposalCount || 0);
  const reviewLine = shareUrl || sampleRouteUrl || "add a public review URL after playtest";
  const lines = [
    "Signal Garden developer feedback draft",
    "",
    "What I tested:",
    "- Devvit Web-style client shell running a Phaser/Vite game surface.",
    "- Daily deterministic puzzle, Review links, and comment-thread route import.",
    "- Server-shaped proposal consensus with a Redis-shaped store for later platform wiring.",
    "",
    "Current build:",
    `- Board: ${puzzle.id} ${puzzle.title}.`,
    `- Route state: ${status}, ${score} pts, ${beacons}/${puzzle.beacons.length} beacons, ${plan.length}/${puzzle.moveLimit} moves.`,
    `- Community loop: ${completed}/${proposalCount} saved routes complete.`,
    `- Review path: ${reviewLine}`,
    "",
    "Product feedback:",
    "- Devvit Web setup would be easier with a compact Phaser/Vite starter that shows static asset paths, expanded post launch, and same-origin server routes together.",
    "- Interactive post review would benefit from a checklist that connects app listing URL, public demo post URL, and a playable review link in one flow.",
    "- Mobile WebView guidance should call out touch targets, fixed canvas sizing, audio unlock behavior, and safe-area constraints.",
    "- Comment-driven games need clearer examples for importing public reply links or short coordinate routes, handling duplicates, and showing why one community result leads another.",
    "- A local dry-run command that validates client bundle, server routes, and public review links before submission would reduce last-minute mistakes.",
    "",
    "What worked well:",
    "- The app can keep the first screen playable without account data.",
    "- A sample route URL lets reviewers test the loop before live community data exists.",
    "- Copyable post, review, recap, and launch packets keep the public handoff consistent.",
  ];
  return lines.join("\n");
}

export function createReviewSnapshot({ puzzle, result, plan = [], shareUrl = "", consensus = null }) {
  const best = consensus?.best || null;
  const completed = Number(consensus?.completed || 0);
  const proposalCount = Number(consensus?.proposalCount || 0);
  const contributorCount = Array.isArray(consensus?.contributors) ? consensus.contributors.length : 0;
  const status = result?.complete ? "complete" : result?.status || "drafting";
  const beacons = result?.hitBeacons?.length || 0;
  const lines = [
    `Signal Garden review snapshot`,
    `Day: ${puzzle.id}`,
    `Board: ${puzzle.title}`,
    `Route: ${status}, ${result?.score || 0} pts, ${beacons}/${puzzle.beacons.length} beacons, ${plan.length}/${puzzle.moveLimit} moves`,
    `Community: ${completed}/${proposalCount} saved routes complete, ${contributorCount} contributors`,
    best
      ? `Top saved route: ${best.score} pts, ${best.beacons}/${puzzle.beacons.length} beacons, ${best.moves} moves`
      : "Top saved route: open",
  ];

  if (shareUrl) {
    lines.push(`Review link: ${shareUrl}`);
  }

  lines.push("Judge checks: deterministic daily seed; route can be reopened; consensus is built from saved/imported proposals.");
  return lines.join("\n");
}

function cleanUrl(value) {
  return String(value || "").replace(/[),.;\]]+$/, "");
}

function urlMatches(input) {
  const pattern = /https?:\/\/[^\s<>"']+/gi;
  return [...String(input || "").matchAll(pattern)].map((match) => ({
    index: match.index || 0,
    url: cleanUrl(match[0]),
  }));
}

function firstUrl(input) {
  return urlMatches(input)[0]?.url || "";
}

function parseBriefingPlan(input) {
  const moves = [];
  const pattern = /\b(slash|backslash)\s+at\s+(\d+)\s*,\s*(\d+)/gi;
  for (const match of String(input || "").matchAll(pattern)) {
    moves.push({
      mirror: match[1].toLowerCase(),
      x: Number(match[2]) - 1,
      y: Number(match[3]) - 1,
    });
  }
  moves.push(...parseCoordinatePlan(input));
  return moves;
}

function mirrorFromText(value) {
  const text = String(value || "").toLowerCase();
  if (text === "/" || text === "slash") {
    return "slash";
  }
  if (text === "\\" || text === "backslash") {
    return "backslash";
  }
  return "";
}

function parseCoordinatePlan(input) {
  const source = String(input || "");
  const moves = [];
  const patterns = [
    /\br\s*(\d+)\s*c\s*(\d+)\s*(\/|\\|slash|backslash)(?=$|[\s,.;])/gi,
    /\bc\s*(\d+)\s*r\s*(\d+)\s*(\/|\\|slash|backslash)(?=$|[\s,.;])/gi,
    /\brow\s*(\d+)\s*,?\s*col(?:umn)?\s*(\d+)\s*(\/|\\|slash|backslash)(?=$|[\s,.;])/gi,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const first = Number(match[1]) - 1;
      const second = Number(match[2]) - 1;
      const rowFirst = !pattern.source.startsWith("\\bc");
      const mirror = mirrorFromText(match[3]);
      if (!mirror) {
        continue;
      }
      moves.push({
        x: rowFirst ? second : first,
        y: rowFirst ? first : second,
        mirror,
      });
    }
  }

  return moves;
}

export function parseSharedRoute(input, puzzle) {
  const text = String(input || "").trim();
  if (!text) {
    return { ok: false, reason: "empty", error: "Paste a route link or briefing first." };
  }

  const urlText = firstUrl(text);
  if (urlText) {
    try {
      const url = new URL(urlText);
      const day = url.searchParams.get("day");
      const token = url.searchParams.get("plan");
      if (!day || !token) {
        return { ok: false, reason: "missing-plan", error: "That link does not include a route plan." };
      }
      if (day !== puzzle.id) {
        return { ok: false, reason: "cross-day", error: `That route is for ${day}. Open that day before importing it.` };
      }
      const plan = decodePlanToken(token, puzzle);
      if (!plan.length) {
        return { ok: false, reason: "empty-route", error: "That route has no playable mirrors." };
      }
      return { ok: true, day, plan, source: "review-link" };
    } catch {
      return { ok: false, reason: "unreadable-link", error: "That route link is not readable." };
    }
  }

  const dayMatch = text.match(/Signal Garden\s+(\d{4}-\d{2}-\d{2})/i);
  const day = dayMatch ? dayMatch[1] : puzzle.id;
  if (day !== puzzle.id) {
    return { ok: false, reason: "cross-day", error: `That briefing is for ${day}. Open that day before importing it.` };
  }

  const plan = decodePlanToken(encodePlanToken(parseBriefingPlan(text)), puzzle);
  if (!plan.length) {
    return { ok: false, reason: "no-route", error: "No playable route was found in that text." };
  }
  return { ok: true, day, plan, source: "briefing" };
}

function normalizeThreadAuthor(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .replace(/^u\//i, "")
    .replace(/^@/, "")
    .replace(/[^A-Za-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return normalized || fallback;
}

function lineAround(text, index) {
  const source = String(text || "");
  const start = source.lastIndexOf("\n", Math.max(0, index - 1)) + 1;
  const end = source.indexOf("\n", index);
  return source.slice(start, end === -1 ? source.length : end);
}

function inferThreadAuthor(text, index, routeIndex) {
  const line = lineAround(text, index);
  const prefix = line.slice(0, Math.max(0, index - (String(text || "").lastIndexOf("\n", Math.max(0, index - 1)) + 1)));
  const prefixMatch = prefix.match(/(?:^|\s)(u\/[A-Za-z0-9_-]{2,24}|@[A-Za-z0-9_-]{2,24}|[A-Za-z][A-Za-z0-9_-]{1,23})\s*[:>-]\s*$/);
  if (prefixMatch) {
    return normalizeThreadAuthor(prefixMatch[1], `comment-${routeIndex + 1}`);
  }
  const byMatch = line.match(/\bby\s+(u\/[A-Za-z0-9_-]{2,24}|@[A-Za-z0-9_-]{2,24}|[A-Za-z][A-Za-z0-9_-]{1,23})\b/i);
  if (byMatch) {
    return normalizeThreadAuthor(byMatch[1], `comment-${routeIndex + 1}`);
  }
  return `comment-${routeIndex + 1}`;
}

function inferBlockAuthor(block, routeIndex) {
  const match = String(block || "").match(
    /^\s*(u\/[A-Za-z0-9_-]{2,24}|@[A-Za-z0-9_-]{2,24}|[A-Za-z][A-Za-z0-9_-]{1,23})\s*[:>-]\s*/,
  );
  return normalizeThreadAuthor(match?.[1] || "", `comment-${routeIndex + 1}`);
}

export function parseSharedRoutes(input, puzzle) {
  const text = String(input || "").trim();
  if (!text) {
    return {
      ok: false,
      error: "Paste a comment thread, route link, or briefing first.",
      routes: [],
      errors: [],
      candidates: 0,
      skippedByReason: {},
    };
  }

  const routes = [];
  const errors = [];
  const skippedByReason = {};
  const seen = new Set();

  function skip(reason, error) {
    const key = reason || "unreadable";
    skippedByReason[key] = (skippedByReason[key] || 0) + 1;
    errors.push(error);
  }

  function addRoute(parsed, author) {
    if (!parsed.ok) {
      skip(parsed.reason, parsed.error);
      return;
    }
    const token = encodePlanToken(parsed.plan);
    if (seen.has(token)) {
      skip("duplicate", `Duplicate route skipped for ${author}.`);
      return;
    }
    seen.add(token);
    routes.push({
      day: parsed.day,
      plan: parsed.plan,
      source: parsed.source,
      author,
    });
  }

  const matches = urlMatches(text);
  let candidates = 0;
  if (matches.length) {
    candidates += matches.length;
    matches.forEach((match, index) => {
      addRoute(parseSharedRoute(match.url, puzzle), inferThreadAuthor(text, match.index, index));
    });

    const urlLines = new Set(matches.map((match) => lineAround(text, match.index)));
    const coordinateBlocks = text
      .split(/\n+/)
      .map((block) => block.trim())
      .filter(Boolean)
      .filter((block) => !urlLines.has(block))
      .filter((block) => parseBriefingPlan(block).length > 0);
    candidates += coordinateBlocks.length;
    coordinateBlocks.forEach((block, index) => {
      addRoute(parseSharedRoute(block, puzzle), inferBlockAuthor(block, matches.length + index));
    });
  } else {
    const blocks = text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
    candidates = blocks.length;
    blocks.forEach((block, index) => {
      addRoute(parseSharedRoute(block, puzzle), inferBlockAuthor(block, index));
    });
  }

  if (!routes.length) {
    return {
      ok: false,
      error: errors[0] || "No playable routes were found in that thread.",
      routes,
      errors,
      candidates,
      skippedByReason,
    };
  }

  return {
    ok: true,
    routes,
    errors,
    imported: routes.length,
    skipped: errors.length,
    candidates,
    skippedByReason,
  };
}

export function formatImportSkipReasons(skippedByReason = {}) {
  const labels = {
    "cross-day": "cross-day",
    duplicate: "duplicate",
    "missing-plan": "missing plan",
    "empty-route": "empty route",
    "no-route": "no route",
    "unreadable-link": "unreadable link",
    empty: "empty block",
    unreadable: "unreadable",
  };
  return Object.entries(skippedByReason)
    .filter(([, count]) => Number(count) > 0)
    .map(([reason, count]) => `${count} ${labels[reason] || reason}`)
    .join(", ");
}
