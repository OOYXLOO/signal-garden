import { decodePlanToken, encodePlanToken } from "./game/puzzle.js";

function clonePlan(plan = []) {
  return plan.map((move) => ({ x: move.x, y: move.y, mirror: move.mirror }));
}

export function wantsSampleRoute(searchParams) {
  const value = String(searchParams.get("sample") || searchParams.get("sampleRoute") || "").toLowerCase();
  return ["1", "true", "yes", "route"].includes(value);
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
  lines.push("Reply with your Review link so it can join the community board.");
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

function firstUrl(input) {
  const match = String(input || "").match(/https?:\/\/[^\s<>"']+/i);
  if (!match) {
    return "";
  }
  return match[0].replace(/[),.;\]]+$/, "");
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
  return moves;
}

export function parseSharedRoute(input, puzzle) {
  const text = String(input || "").trim();
  if (!text) {
    return { ok: false, error: "Paste a route link or briefing first." };
  }

  const urlText = firstUrl(text);
  if (urlText) {
    try {
      const url = new URL(urlText);
      const day = url.searchParams.get("day");
      const token = url.searchParams.get("plan");
      if (!day || !token) {
        return { ok: false, error: "That link does not include a route plan." };
      }
      if (day !== puzzle.id) {
        return { ok: false, error: `That route is for ${day}. Open that day before importing it.` };
      }
      const plan = decodePlanToken(token, puzzle);
      if (!plan.length) {
        return { ok: false, error: "That route has no playable mirrors." };
      }
      return { ok: true, day, plan, source: "review-link" };
    } catch {
      return { ok: false, error: "That route link is not readable." };
    }
  }

  const dayMatch = text.match(/Signal Garden\s+(\d{4}-\d{2}-\d{2})/i);
  const day = dayMatch ? dayMatch[1] : puzzle.id;
  if (day !== puzzle.id) {
    return { ok: false, error: `That briefing is for ${day}. Open that day before importing it.` };
  }

  const plan = decodePlanToken(encodePlanToken(parseBriefingPlan(text)), puzzle);
  if (!plan.length) {
    return { ok: false, error: "No playable route was found in that text." };
  }
  return { ok: true, day, plan, source: "briefing" };
}
