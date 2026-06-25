function countActiveSlots(gardenLog = null) {
  return (gardenLog?.slots || []).filter((slot) => ["complete", "draft"].includes(slot.state) || slot.preview).length;
}

function normalizeState(ready, preview = false) {
  if (ready) {
    return "ready";
  }
  return preview ? "preview" : "todo";
}

export function createCommunityLaunchPlan({
  puzzle,
  result,
  plan = [],
  consensus = null,
  gardenLog = null,
  returnPledge = null,
  shareUrl = "",
  sampleRouteUrl = "",
} = {}) {
  const routeReady = Boolean(result?.complete && plan.length);
  const routePreview = Boolean(sampleRouteUrl);
  const proposalCount = Number(consensus?.proposalCount || 0);
  const contributorCount = Array.isArray(consensus?.contributors) ? consensus.contributors.length : 0;
  const consensusReady = proposalCount >= 2 && contributorCount >= 2;
  const consensusPreview = Boolean(consensus?.preview || proposalCount > 0);
  const activeSlots = countActiveSlots(gardenLog);
  const returnReady = Boolean(returnPledge?.state === "ready" && activeSlots >= 2);
  const returnPreview = Boolean(returnPledge?.state === "preview" || activeSlots > 0);
  const launchReady = routeReady && consensusReady && returnReady;
  const state = launchReady ? "ready" : routeReady || consensusPreview || returnPreview ? "preview" : "todo";
  const sampleLine = sampleRouteUrl ? `Sample route: ${sampleRouteUrl}` : "Sample route: open the daily board";
  const reviewLine = shareUrl && plan.length ? `Review link: ${shareUrl}` : sampleLine;
  const best = consensus?.best || null;
  const topRouteLine = best
    ? `Top route: ${best.score} pts, ${best.beacons}/${puzzle.beacons.length} beacons, ${best.moves} moves by ${best.author || "a player"}.`
    : "Top route: open, first complete route sets the target.";
  const returnLine = returnPledge?.prompt || "Return tomorrow for the next daily relay.";
  const primaryAction = launchReady
    ? "Publish the daily relay post, then pin the first comment asking for two route replies."
    : routeReady
      ? "Ask for two independent reply routes before calling the daily route settled."
      : "Use the sample route first, then ask players to beat or repair it.";

  return {
    state,
    summary:
      state === "ready"
        ? "Community launch plan ready"
        : state === "preview"
          ? "Community launch plan preview"
          : "Community launch plan open",
    metrics: [
      {
        label: "Route anchor",
        state: normalizeState(routeReady, routePreview),
        value: routeReady ? "complete" : routePreview ? "sample" : "open",
        detail: routeReady ? "A solved route can anchor the first post." : "Open the sample route or solve today's board first.",
      },
      {
        label: "Reply depth",
        state: normalizeState(consensusReady, consensusPreview),
        value: proposalCount ? `${proposalCount} routes` : "open",
        detail: consensusReady
          ? `${contributorCount} contributors can support a ranked discussion.`
          : "Import at least two distinct reply routes to make the thread feel alive.",
      },
      {
        label: "Return hook",
        state: normalizeState(returnReady, returnPreview),
        value: activeSlots ? `${activeSlots}/7 days` : "open",
        detail: returnReady
          ? "The return map and next-day pledge are both visible."
          : "Use the next-day prompt to turn a solved board into a return invitation.",
      },
      {
        label: "First action",
        state,
        value: state === "ready" ? "post" : state === "preview" ? "seed" : "prepare",
        detail: primaryAction,
      },
    ],
    copy: [
      `Signal Garden ${puzzle.id} community launch`,
      `Board: ${puzzle.title}`,
      reviewLine,
      topRouteLine,
      `Today: ${primaryAction}`,
      `Return hook: ${returnLine}`,
      "Reply with a review link or short route coordinates so the thread can rank today's best signal.",
    ].join("\n"),
  };
}
