import { createContributionQuality, createTopRouteRationale } from "./game/proposals.js";

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

function contributionQualitySummary(consensus, puzzle) {
  const quality = createContributionQuality(puzzle, consensus);
  return `Contribution quality: ${quality.score}/100 - ${quality.detail}`;
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
  const quality = createContributionQuality(puzzle, consensus);

  return [
    loopCheck("Open sample", Boolean(sampleRouteUrl), sampleRouteUrl ? "Labeled sample route link is ready." : "Use ?sample=1 to load a labeled route.", "preview"),
    loopCheck("Trace route", Boolean(plan.length), routeDetail),
    loopCheck("Rank proposal", Boolean(consensus?.proposalCount || consensus?.preview), proposalDetail, consensus?.preview ? "preview" : "ready"),
    loopCheck("Quality proof", quality.score >= 40, `${quality.score}/100 - ${quality.detail}`, quality.state === "ready" ? "ready" : "preview"),
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
    contributionQualitySummary(consensus, puzzle),
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

function guideStep(label, state, value, detail) {
  return {
    label,
    state,
    ready: state === "ready" || state === "preview",
    value,
    detail,
  };
}

export function createFirstSessionGuide({
  puzzle,
  result,
  plan = [],
  shareUrl = "",
  sampleRouteUrl = "",
  consensus = null,
} = {}) {
  if (!puzzle) {
    throw new Error("createFirstSessionGuide requires a puzzle");
  }

  const routeStatus = result?.complete ? "complete" : result?.status || "drafting";
  const routeBeacons = result?.hitBeacons?.length || 0;
  const routeStep = plan.length
    ? guideStep(
        "Trace the beam",
        result?.complete ? "ready" : "preview",
        `${routeStatus}, ${routeBeacons}/${puzzle.beacons.length} beacons`,
        `${plan.length}/${puzzle.moveLimit} mirrors placed. Use Replay route to show how the signal travels.`,
      )
    : guideStep(
        "Trace the beam",
        "todo",
        "Place mirrors",
        "Tap board cells to rotate mirrors, or open the sample route for a full first-minute walkthrough.",
      );

  const sampleStep = guideStep(
    "Open sample route",
    sampleRouteUrl ? "preview" : "todo",
    sampleRouteUrl ? "Sample ready" : "Needs sample URL",
    sampleRouteUrl
      ? "The sample route demonstrates the full loop without creating stored community data."
      : "Use a day-specific sample route so reviewers do not need to solve the board first.",
  );

  const communityStep =
    consensus?.proposalCount || consensus?.preview
      ? guideStep(
          "Show community loop",
          consensus.preview ? "preview" : "ready",
          consensus.preview
            ? "Sample consensus"
            : `${consensus.completed}/${consensus.proposalCount} routes ranked`,
          consensus.preview
            ? "Sample consensus explains how reply links become ranked routes."
            : "Saved or imported comment routes now feed the contributor board and top-route ghost.",
        )
      : guideStep(
          "Show community loop",
          "todo",
          "Save or import",
          "Use Save route proposal or Load sample thread -> Import comment routes to prove user contribution flow.",
        );

  const evidenceStep =
    shareUrl || plan.length
      ? guideStep(
          "Copy handoff proof",
          "ready",
          "Evidence ready",
          "Reviewer fast path, evidence receipt, launch packet, and post draft now reflect the current board state.",
        )
      : guideStep(
          "Copy handoff proof",
          "todo",
          "Needs route",
          "Trace or load a route before copying the final review link and evidence receipt.",
        );

  const steps = [routeStep, sampleStep, communityStep, evidenceStep];
  const readyCount = steps.filter((step) => step.ready).length;
  const summary =
    readyCount === steps.length
      ? "Reviewer path is ready: play route, social loop, and evidence handoff are visible."
      : `${readyCount}/${steps.length} first-session guide steps ready. Follow the open steps from top to bottom.`;

  return {
    title: "First-session guide",
    summary,
    readyCount,
    total: steps.length,
    steps,
  };
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

function consensusReadiness(puzzle, consensus) {
  const quality = createContributionQuality(puzzle, consensus);
  const qualityDetail = consensus?.proposalCount || consensus?.preview ? ` ${quality.score}/100 contribution quality.` : "";
  if (consensus?.proposalCount) {
    return readinessState(
      "Contribution loop",
      true,
      `${consensus.completed}/${consensus.proposalCount} proposals complete; imported links can rank.${qualityDetail}`,
    );
  }
  if (consensus?.preview) {
    return readinessState("Contribution loop", true, `Sample preview shows ranking without writing stored data.${qualityDetail}`, "preview");
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

export function inferSourceRepoUrl(currentHref = "") {
  if (!currentHref) {
    return "";
  }
  try {
    const url = new URL(currentHref);
    const hostname = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || !hostname.endsWith(".github.io")) {
      return "";
    }
    const owner = hostname.slice(0, -".github.io".length);
    const repo = url.pathname.split("/").filter(Boolean)[0] || "";
    if (!owner || !repo) {
      return "";
    }
    return `https://github.com/${owner}/${repo}`;
  } catch {
    return "";
  }
}

function sourceRepoReadiness(currentHref = "", sourceRepoUrl = "") {
  const resolvedUrl = sourceRepoUrl || inferSourceRepoUrl(currentHref);
  if (resolvedUrl) {
    return readinessState("Source repository", true, `${resolvedUrl} is linked for public source review.`);
  }
  return {
    label: "Source repository",
    state: "waiting",
    ready: false,
    detail: "Add a public source repository before final submission.",
  };
}

function platformUrlReadiness({ shareUrl = "", appListingUrl = "", demoPostUrl = "" } = {}) {
  const missing = [];
  if (!appListingUrl) {
    missing.push("app listing");
  }
  if (!demoPostUrl) {
    missing.push("public demo post");
  }
  if (!missing.length) {
    return readinessState("Platform URLs", true, `${appListingUrl} and ${demoPostUrl} are linked.`);
  }
  return {
    label: "Platform URLs",
    state: shareUrl ? "waiting" : "todo",
    ready: false,
    detail: shareUrl
      ? `Add ${missing.join(" and ")} URLs after platform gates.`
      : `Needs a route plus ${missing.join(" and ")} URLs after platform gates.`,
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
  sourceRepoUrl = "",
  appListingUrl = "",
  demoPostUrl = "",
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
    sourceRepoReadiness(currentHref, sourceRepoUrl),
    retentionReadiness(gardenLog),
    consensusReadiness(puzzle, consensus),
    readinessState(
      "Launch packet",
      Boolean(launchPacket),
      launchPacket ? "Copyable handoff is generated inside the app." : "Generate the launch packet after a board renders.",
    ),
    platformUrlReadiness({ shareUrl, appListingUrl, demoPostUrl }),
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

function urlEvidence(label, value, fallback) {
  return {
    label,
    value: value || fallback,
    ready: Boolean(value),
  };
}

export function createEvidenceReceipt({
  puzzle,
  result,
  plan = [],
  shareUrl = "",
  sampleRouteUrl = "",
  consensus = null,
  gardenLog = null,
  launchPacket = "",
  publicAppUrl = "",
  sourceRepoUrl = "",
  appListingUrl = "",
  demoPostUrl = "",
} = {}) {
  if (!puzzle) {
    throw new Error("createEvidenceReceipt requires a puzzle");
  }

  const completed = Number(consensus?.completed || 0);
  const proposalCount = Number(consensus?.proposalCount || 0);
  const activeReturnSlots = Array.isArray(gardenLog?.slots)
    ? gardenLog.slots.filter((slot) => slot.state !== "open").length
    : 0;
  const routeStatus = result?.complete ? "complete" : result?.status || "drafting";
  const routeScore = Number(result?.score || 0);
  const routeBeacons = result?.hitBeacons?.length || 0;
  const contributionQuality = createContributionQuality(puzzle, consensus);
  const publicUrls = [
    urlEvidence("Public app", publicAppUrl, "waiting for deployed app URL"),
    urlEvidence("Sample route", sampleRouteUrl, "waiting for sample route URL"),
    urlEvidence("Review link", shareUrl, "waiting for traced route"),
    urlEvidence("Source repository", sourceRepoUrl, "waiting for public source repository"),
    urlEvidence("App listing", appListingUrl, "waiting for app listing"),
    urlEvidence("Demo post", demoPostUrl, "waiting for public demo post"),
  ];
  const claims = [
    `Playable puzzle: ${puzzle.beacons.length} beacons, ${puzzle.moveLimit} mirrors, deterministic day ${puzzle.id}.`,
    `Route proof: ${routeStatus}, ${routeScore} pts, ${routeBeacons}/${puzzle.beacons.length} beacons, ${plan.length}/${puzzle.moveLimit} moves.`,
    proposalCount
      ? `Community proof: ${completed}/${proposalCount} saved routes complete, with a ranked top route and ${contributionQuality.score}/100 contribution quality.`
      : consensus?.preview
        ? `Community proof: sample preview demonstrates ranking without stored data and ${contributionQuality.score}/100 contribution quality.`
        : "Community proof: waiting for saved or imported route proposals.",
    gardenLog?.slots?.length
      ? `Retention proof: ${activeReturnSlots}/${gardenLog.slots.length} return-map slots show activity or preview state.`
      : "Retention proof: waiting for return-map render.",
    launchPacket ? "Handoff proof: launch packet is generated from the current board state." : "Handoff proof: waiting for launch packet render.",
    "Safety proof: public evidence avoids credentials, private data, billing, identity checks, and platform secrets.",
  ];
  const readyUrlCount = publicUrls.filter((item) => item.ready).length;

  return {
    title: `Signal Garden ${puzzle.id}: evidence receipt`,
    summary: `${readyUrlCount}/${publicUrls.length} public URL evidence slots ready`,
    claims,
    publicUrls,
  };
}

export function formatEvidenceReceipt(receipt) {
  return [
    receipt.title,
    receipt.summary,
    "",
    "Evidence claims:",
    ...receipt.claims.map((claim) => `- ${claim}`),
    "",
    "Public URLs:",
    ...receipt.publicUrls.map((item) => `- ${item.label}: ${item.value}`),
  ].join("\n");
}
