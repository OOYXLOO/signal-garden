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

function readinessState(label, ready, detail, state = "ready") {
  return {
    label,
    state: ready ? state : "todo",
    ready: Boolean(ready),
    detail,
  };
}

function routeReadiness(puzzle, result, plan = []) {
  if (!plan.length) {
    return readinessState(
      "Current Review link",
      false,
      "Trace a route before copying the final review link.",
    );
  }
  const status = result?.complete ? "complete" : result?.status || "draft";
  return readinessState(
    "Current Review link",
    true,
    `${status}, ${result?.score || 0} pts, ${result?.hitBeacons?.length || 0}/${puzzle.beacons.length} beacons, ${plan.length}/${puzzle.moveLimit} moves.`,
  );
}

function consensusReadiness(consensus) {
  if (consensus?.proposalCount) {
    return readinessState(
      "Contribution loop",
      true,
      `${consensus.completed}/${consensus.proposalCount} proposals complete; imported links can rank.`,
    );
  }
  if (consensus?.preview) {
    return readinessState("Contribution loop", true, "Sample preview shows ranking without writing stored data.", "preview");
  }
  return readinessState(
    "Contribution loop",
    false,
    "Save or import a route to show the ranked proposal loop.",
  );
}

function retentionReadiness(gardenLog) {
  if (!gardenLog?.slots?.length) {
    return readinessState("Retention loop", false, "Return map has not rendered yet.");
  }
  const activeSlots = gardenLog.slots.filter((slot) => slot.state !== "open").length;
  return readinessState(
    "Retention loop",
    true,
    activeSlots
      ? `${activeSlots}/${gardenLog.slots.length} return-map slots show activity or preview state.`
      : "Seven-day return map is visible and ready for archive data.",
    activeSlots ? "ready" : "preview",
  );
}

export function createSubmissionReadiness({
  puzzle,
  result,
  plan = [],
  shareUrl = "",
  sampleRouteUrl = "",
  consensus = null,
  gardenLog = null,
  launchPacket = "",
} = {}) {
  if (!puzzle) {
    throw new Error("createSubmissionReadiness requires a puzzle");
  }

  const items = [
    readinessState(
      "Playable board",
      true,
      `${puzzle.beacons.length} beacons, ${puzzle.moveLimit} mirror limit, deterministic day ${puzzle.id}.`,
    ),
    readinessState(
      "Sample route",
      Boolean(sampleRouteUrl),
      sampleRouteUrl || "Open the app with day=<date>&sample=1 for a labeled reviewer route.",
      "preview",
    ),
    routeReadiness(puzzle, result, plan),
    retentionReadiness(gardenLog),
    consensusReadiness(consensus),
    readinessState(
      "Launch packet",
      Boolean(launchPacket),
      launchPacket ? "Copyable handoff is generated inside the app." : "Generate the launch packet after a board renders.",
    ),
    {
      label: "Public URLs",
      state: shareUrl ? "waiting" : "todo",
      ready: false,
      detail: shareUrl
        ? "Add public app, app listing, and demo post URLs after platform gates."
        : "Needs a route plus public app, listing, and demo post URLs after platform gates.",
    },
  ];

  const readyCount = items.filter((item) => item.ready).length;
  return {
    title: `Signal Garden ${puzzle.id}: Submission readiness`,
    summary: `${readyCount}/${items.length} surfaces ready`,
    readyCount,
    total: items.length,
    items,
  };
}

export function formatSubmissionReadiness(readiness) {
  const lines = [readiness.title, readiness.summary, ""];
  for (const item of readiness.items) {
    lines.push(`- ${item.label}: ${item.state} - ${item.detail}`);
  }
  return lines.join("\n");
}
