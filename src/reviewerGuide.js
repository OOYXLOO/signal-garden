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

function loopCheck(label, ready, detail, state = "ready") {
  return {
    label,
    ready: Boolean(ready),
    state: ready ? state : "todo",
    detail,
  };
}

export function createReviewerLoopChecks({
  puzzle,
  result,
  plan = [],
  sampleRouteUrl = "",
  consensus = null,
  launchPacket = "",
} = {}) {
  if (!puzzle) {
    throw new Error("createReviewerLoopChecks requires a puzzle");
  }
  const routeStatus = result?.complete ? "complete" : result?.status || "draft";
  const routeDetail = plan.length
    ? `${routeStatus}, ${result?.score || 0} pts, ${result?.hitBeacons?.length || 0}/${puzzle.beacons.length} beacons, ${plan.length}/${puzzle.moveLimit} moves.`
    : "Trace a route or open the sample route before judging the live loop.";
  const proposalDetail = consensus?.proposalCount
    ? `${consensus.completed}/${consensus.proposalCount} ranked proposals; top route can be replayed and applied.`
    : consensus?.preview
      ? "Sample preview shows the ranked proposal loop without stored data."
      : "Save or import a route to show comment replies becoming ranked proposals.";

  return [
    loopCheck("Open sample", Boolean(sampleRouteUrl), sampleRouteUrl ? "Labeled sample route link is ready." : "Use ?sample=1 to load a labeled route.", "preview"),
    loopCheck("Trace route", Boolean(plan.length), routeDetail),
    loopCheck("Rank proposal", Boolean(consensus?.proposalCount || consensus?.preview), proposalDetail, consensus?.preview ? "preview" : "ready"),
    loopCheck("Copy packet", Boolean(launchPacket), launchPacket ? "Launch packet is generated for handoff." : "Render the board to generate a handoff packet."),
  ];
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

function isPublicAppUrl(currentHref = "") {
  if (!currentHref) {
    return false;
  }
  try {
    const url = new URL(currentHref);
    const hostname = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      !["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname) &&
      !hostname.endsWith(".local") &&
      !hostname.endsWith(".test") &&
      !hostname.endsWith(".invalid")
    );
  } catch {
    return false;
  }
}

function publicAppReadiness(currentHref = "") {
  if (isPublicAppUrl(currentHref)) {
    const url = new URL(currentHref);
    url.search = "";
    url.hash = "";
    return readinessState("Public app URL", true, `${url.toString()} is a public HTTPS app surface.`);
  }
  return {
    label: "Public app URL",
    state: "waiting",
    ready: false,
    detail: "Publish the static app through GitHub Pages or another HTTPS host before final submission.",
  };
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
  currentHref = "",
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
    publicAppReadiness(currentHref),
    retentionReadiness(gardenLog),
    consensusReadiness(consensus),
    readinessState(
      "Launch packet",
      Boolean(launchPacket),
      launchPacket ? "Copyable handoff is generated inside the app." : "Generate the launch packet after a board renders.",
    ),
    {
      label: "Platform URLs",
      state: shareUrl ? "waiting" : "todo",
      ready: false,
      detail: shareUrl
        ? "Add public app listing and public demo post URLs after platform gates."
        : "Needs a route plus public app listing and demo post URLs after platform gates.",
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
