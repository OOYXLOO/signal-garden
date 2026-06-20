import { decodePlanToken, encodePlanToken } from "./game/puzzle.js";

export function buildShareUrl(currentHref, puzzle, plan = []) {
  if (!plan.length) {
    return "";
  }
  const url = new URL(currentHref);
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
