import { encodePlanToken } from "./game/puzzle.js";

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

