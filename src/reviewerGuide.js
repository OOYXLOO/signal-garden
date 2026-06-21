import { createTopRouteRationale } from "./game/proposals.js";

export function buildSampleRouteUrl(currentHref, puzzle) {
  if (!puzzle?.id) {
    return "";
  }
  const url = new URL(currentHref);
  url.searchParams.delete("plan");
  url.searchParams.delete("sampleRoute");
  url.searchParams.set("day", puzzle.id);
  url.searchParams.set("sample", "1");
  return url.toString();
}

function routeSummary(puzzle, result, plan = []) {
  const status = result?.complete ? "complete" : result?.status || "drafting";
  const score = Number(result?.score || 0);
  const beacons = result?.hitBeacons?.length || 0;
  return `${status}, ${score} pts, ${beacons}/${puzzle.beacons.length} beacons, ${plan.length}/${puzzle.moveLimit} moves`;
}

function consensusSummary(consensus, puzzle) {
  if (!consensus?.proposalCount) {
    return "No saved proposals yet; the sample route shows the full review loop without writing stored data.";
  }
  const best = consensus.best;
  const prefix = `${consensus.completed}/${consensus.proposalCount} saved routes complete`;
  if (!best) {
    return `${prefix}; top route still open.`;
  }
  return `${prefix}; top route ${best.score} pts, ${best.beacons}/${puzzle.beacons.length} beacons, ${best.moves} moves.`;
}

function rationaleSummary(consensus, puzzle) {
  if (!consensus?.best) {
    return "Lead rationale: no ranked route yet.";
  }
  const rationale = createTopRouteRationale(puzzle, consensus);
  return `Lead rationale: ${rationale.points.slice(0, 2).join(" ")}`;
}

export function createReviewerFastPath({
  puzzle,
  result,
  plan = [],
  shareUrl = "",
  sampleRouteUrl = "",
  consensus = null,
} = {}) {
  if (!puzzle) {
    throw new Error("createReviewerFastPath requires a puzzle");
  }
  const lines = [
    "Signal Garden reviewer fast path",
    `Day: ${puzzle.id} - ${puzzle.title}`,
    `Route state: ${routeSummary(puzzle, result, plan)}`,
    `Community state: ${consensusSummary(consensus, puzzle)}`,
    rationaleSummary(consensus, puzzle),
    sampleRouteUrl
      ? `Sample route: ${sampleRouteUrl}`
      : "Sample route: open the app with day=<date>&sample=1 to load a complete labeled preview.",
  ];

  if (shareUrl) {
    lines.push(`Current review link: ${shareUrl}`);
  }

  lines.push(
    "1-minute check: open the sample route, replay the beam, compare the top-route ghost, copy the comment challenge, then paste the review link into Comment route to see it rank.",
    "Reddit loop: a route link from any reply can become a ranked daily proposal, and the recap gives the thread a next-day reason to return.",
  );

  return lines.join("\n");
}
