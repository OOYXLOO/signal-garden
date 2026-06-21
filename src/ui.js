import { createCommunityClient } from "./client/communityClient.js";
import { createGameAudio } from "./audio.js";
import { createObjectiveList, createRouteInsight, describeResult } from "./game/puzzle.js";
import { createCommunityTarget, createDailyRecap } from "./game/proposals.js";
import { createLaunchPacket, formatLaunchPacket } from "./launchPacket.js";
import { buildShareUrl, createCommentChallenge, createReviewSnapshot, createShareBriefing, parseSharedRoute } from "./share.js";
import { getLocalArchive, getLocalStreak, savePlan } from "./state/store.js";

const statusText = {
  complete: "Complete",
  partial: "Receiver reached",
  blocked: "Blocked",
  lost: "Signal lost",
  drafting: "Drafting",
};

function mirrorLabel(move) {
  const symbol = move.mirror === "slash" ? "/" : "\\";
  return `${symbol} mirror at row ${move.y + 1}, column ${move.x + 1}`;
}

export function bindUi(scene, { communityClient = createCommunityClient(), audio = createGameAudio() } = {}) {
  const refs = {
    dayChip: document.querySelector("#day-chip"),
    title: document.querySelector("#puzzle-title"),
    brief: document.querySelector("#puzzle-brief"),
    objectives: document.querySelector("#objective-list"),
    score: document.querySelector("#score-value"),
    beacons: document.querySelector("#beacon-value"),
    moves: document.querySelector("#move-value"),
    moveList: document.querySelector("#move-list"),
    seed: document.querySelector("#seed-value"),
    streak: document.querySelector("#streak-value"),
    status: document.querySelector("#status-value"),
    targetCard: document.querySelector("#target-card"),
    targetLabel: document.querySelector("#target-label"),
    targetValue: document.querySelector("#target-value"),
    targetDetail: document.querySelector("#target-detail"),
    statusHint: document.querySelector("#status-hint"),
    routeInsight: document.querySelector("#route-insight"),
    archiveList: document.querySelector("#archive-list"),
    briefing: document.querySelector("#briefing-output"),
    copyLink: document.querySelector("#copy-link"),
    applyPlan: document.querySelector("#apply-plan"),
    soundToggle: document.querySelector("#sound-toggle"),
    hintPlan: document.querySelector("#hint-plan"),
    clearPlan: document.querySelector("#clear-plan"),
    replayPlan: document.querySelector("#replay-plan"),
    copyBriefing: document.querySelector("#copy-briefing"),
    commentRoute: document.querySelector("#comment-route"),
    importRoute: document.querySelector("#import-route"),
    saveProposal: document.querySelector("#save-proposal"),
    proposalSummary: document.querySelector("#proposal-summary"),
    proposalList: document.querySelector("#proposal-list"),
    contributorList: document.querySelector("#contributor-list"),
    dailyRecap: document.querySelector("#daily-recap"),
    copyRecap: document.querySelector("#copy-recap"),
    commentChallenge: document.querySelector("#comment-challenge"),
    copyCommentChallenge: document.querySelector("#copy-comment-challenge"),
    reviewSnapshot: document.querySelector("#review-snapshot"),
    copyReviewSnapshot: document.querySelector("#copy-review-snapshot"),
    launchPacket: document.querySelector("#launch-packet"),
    copyLaunchPacket: document.querySelector("#copy-launch-packet"),
  };
  let latest = null;
  let latestDay = null;
  let latestConsensus = null;
  let lastSoundStatus = null;
  let hasRenderedState = false;

  function renderSoundToggle() {
    refs.soundToggle.textContent = audio.isMuted() ? "Sound off" : "Sound on";
    refs.soundToggle.setAttribute("aria-pressed", String(!audio.isMuted()));
  }

  refs.applyPlan.disabled = true;
  renderSoundToggle();
  refs.soundToggle.addEventListener("click", () => {
    audio.toggle();
    renderSoundToggle();
  });
  refs.applyPlan.addEventListener("click", () => {
    if (!latestConsensus?.best?.plan) {
      refs.proposalSummary.textContent = "Save or load a community proposal before applying one.";
      return;
    }
    scene.applyPlan(latestConsensus.best.plan);
  });
  refs.hintPlan.addEventListener("click", () => scene.revealHint());
  refs.clearPlan.addEventListener("click", () => scene.clearPlan());
  refs.replayPlan.addEventListener("click", () => {
    if (scene.replayRoute()) {
      audio.play("replay");
    }
  });
  refs.copyBriefing.addEventListener("click", async () => {
    refs.briefing.select();
    try {
      await navigator.clipboard.writeText(refs.briefing.value);
      refs.copyBriefing.textContent = "Copied";
      window.setTimeout(() => {
        refs.copyBriefing.textContent = "Copy briefing";
      }, 1200);
    } catch {
      document.execCommand("copy");
    }
  });
  refs.copyLink.addEventListener("click", async () => {
    if (!latest?.plan?.length) {
      return;
    }
    const shareUrl = buildShareUrl(window.location.href, latest.puzzle, latest.plan);
    try {
      await navigator.clipboard.writeText(shareUrl);
      refs.copyLink.textContent = "Link copied";
      window.setTimeout(() => {
        refs.copyLink.textContent = "Copy share link";
      }, 1200);
    } catch {
      refs.briefing.value = createShareBriefing({ briefing: refs.briefing.value, shareUrl });
      refs.briefing.select();
      document.execCommand("copy");
    }
  });
  refs.copyRecap.addEventListener("click", async () => {
    refs.dailyRecap.select();
    try {
      await navigator.clipboard.writeText(refs.dailyRecap.value);
      refs.copyRecap.textContent = "Recap copied";
      window.setTimeout(() => {
        refs.copyRecap.textContent = "Copy daily recap";
      }, 1200);
    } catch {
      document.execCommand("copy");
    }
  });
  refs.copyCommentChallenge.addEventListener("click", async () => {
    refs.commentChallenge.select();
    try {
      await navigator.clipboard.writeText(refs.commentChallenge.value);
      refs.copyCommentChallenge.textContent = "Challenge copied";
      window.setTimeout(() => {
        refs.copyCommentChallenge.textContent = "Copy comment challenge";
      }, 1200);
    } catch {
      document.execCommand("copy");
    }
  });
  refs.copyReviewSnapshot.addEventListener("click", async () => {
    refs.reviewSnapshot.select();
    try {
      await navigator.clipboard.writeText(refs.reviewSnapshot.value);
      refs.copyReviewSnapshot.textContent = "Snapshot copied";
      window.setTimeout(() => {
        refs.copyReviewSnapshot.textContent = "Copy review snapshot";
      }, 1200);
    } catch {
      document.execCommand("copy");
    }
  });
  refs.copyLaunchPacket.addEventListener("click", async () => {
    refs.launchPacket.select();
    try {
      await navigator.clipboard.writeText(refs.launchPacket.value);
      refs.copyLaunchPacket.textContent = "Packet copied";
      window.setTimeout(() => {
        refs.copyLaunchPacket.textContent = "Copy launch packet";
      }, 1200);
    } catch {
      document.execCommand("copy");
    }
  });

  refs.saveProposal.addEventListener("click", async () => {
    if (!latest) {
      return;
    }
    refs.saveProposal.disabled = true;
    try {
      const response = await communityClient.submitProposal({
        day: latest.puzzle.id,
        plan: latest.plan,
        author: "local-player",
      });
      latestConsensus = renderConsensus(refs, response.consensus, latest.puzzle);
      renderCommentChallenge(refs, latest, latestConsensus);
      renderReviewSnapshot(refs, latest, latestConsensus);
      renderLaunchPacket(refs, latest, latestConsensus);
    } catch (error) {
      refs.proposalSummary.textContent = error instanceof Error ? error.message : "Could not save proposal.";
    } finally {
      refs.saveProposal.disabled = false;
    }
  });

  refs.importRoute.addEventListener("click", async () => {
    if (!latest) {
      return;
    }
    const parsed = parseSharedRoute(refs.commentRoute.value, latest.puzzle);
    if (!parsed.ok) {
      refs.proposalSummary.textContent = parsed.error;
      return;
    }
    refs.importRoute.disabled = true;
    try {
      const response = await communityClient.submitProposal({
        day: latest.puzzle.id,
        plan: parsed.plan,
        author: "comment-route",
      });
      latestConsensus = renderConsensus(refs, response.consensus, latest.puzzle);
      renderCommentChallenge(refs, latest, latestConsensus);
      renderReviewSnapshot(refs, latest, latestConsensus);
      renderLaunchPacket(refs, latest, latestConsensus);
      const summary = refs.proposalSummary.textContent;
      refs.proposalSummary.textContent = `Imported ${parsed.plan.length} move ${parsed.source}. ${summary}`;
      refs.commentRoute.value = "";
    } catch (error) {
      refs.proposalSummary.textContent = error instanceof Error ? error.message : "Could not import route.";
    } finally {
      refs.importRoute.disabled = false;
    }
  });

  window.addEventListener("signal-garden:update", (event) => {
    const { puzzle, result, plan, briefing } = event.detail;
    latest = event.detail;
    refs.dayChip.textContent = puzzle.id;
    refs.title.textContent = puzzle.title;
    refs.brief.textContent = puzzle.brief;
    renderObjectives(refs, createObjectiveList(puzzle, result));
    refs.score.textContent = String(result.score);
    refs.beacons.textContent = `${result.hitBeacons.length}/${puzzle.beacons.length}`;
    refs.moves.textContent = `${plan.length}/${puzzle.moveLimit}`;
    refs.copyLink.disabled = plan.length === 0;
    refs.replayPlan.disabled = plan.length === 0;
    refs.seed.textContent = puzzle.id.replaceAll("-", "");
    refs.streak.textContent = String(getLocalStreak(puzzle.id));
    refs.status.textContent = statusText[result.status] || "Drafting";
    renderCommunityTarget(refs, puzzle, result, latestConsensus);
    refs.statusHint.textContent = describeResult(puzzle, result);
    renderRouteInsight(refs, createRouteInsight(puzzle, result));
    if (hasRenderedState && lastSoundStatus !== result.status) {
      if (result.complete) {
        audio.play("complete");
      } else if (plan.length && ["blocked", "lost"].includes(result.status)) {
        audio.play("blocked");
      }
    }
    lastSoundStatus = result.status;
    hasRenderedState = true;
    const hints = scene.getHintProgress();
    refs.hintPlan.disabled = result.complete || hints.revealed >= hints.total;
    refs.hintPlan.textContent = result.complete
      ? "Solved"
      : hints.revealed >= hints.total
        ? `Hints ${hints.revealed}/${hints.total}`
        : `Hint ${hints.revealed}/${hints.total}`;
    const shareUrl = buildShareUrl(window.location.href, puzzle, plan);
    refs.briefing.value = createShareBriefing({ briefing, shareUrl });
    renderCommentChallenge(refs, latest, latestConsensus);
    renderReviewSnapshot(refs, latest, latestConsensus);
    renderLaunchPacket(refs, latest, latestConsensus);
    refs.moveList.replaceChildren(
      ...(plan.length
        ? plan.map((move) => {
            const item = document.createElement("li");
            item.textContent = mirrorLabel(move);
            return item;
          })
        : [document.createElement("li")]),
    );
    if (!plan.length) {
      refs.moveList.firstChild.textContent = "Tap a cell to propose a mirror.";
    }
    savePlan(puzzle.id, plan, result);
    renderArchive(refs, puzzle.id);
    if (latestDay !== puzzle.id) {
      latestDay = puzzle.id;
      refreshConsensus(refs, communityClient, puzzle.id).then((consensus) => {
        latestConsensus = consensus;
        renderCommunityTarget(refs, puzzle, result, latestConsensus);
        renderCommentChallenge(refs, latest, latestConsensus);
        renderReviewSnapshot(refs, latest, latestConsensus);
        renderLaunchPacket(refs, latest, latestConsensus);
      });
    }
  });
}

function renderCommentChallenge(refs, latest, consensus) {
  refs.commentChallenge.value = latest
    ? createCommentChallenge({
        puzzle: latest.puzzle,
        result: latest.result,
        plan: latest.plan,
        shareUrl: buildShareUrl(window.location.href, latest.puzzle, latest.plan),
        consensus,
      })
    : "";
}

function renderReviewSnapshot(refs, latest, consensus) {
  refs.reviewSnapshot.value = latest
    ? createReviewSnapshot({
        puzzle: latest.puzzle,
        result: latest.result,
        plan: latest.plan,
        shareUrl: buildShareUrl(window.location.href, latest.puzzle, latest.plan),
        consensus,
      })
    : "";
}

function renderLaunchPacket(refs, latest, consensus) {
  refs.launchPacket.value = latest
    ? formatLaunchPacket(
        createLaunchPacket({
          puzzle: latest.puzzle,
          result: latest.result,
          plan: latest.plan,
          shareUrl: buildShareUrl(window.location.href, latest.puzzle, latest.plan),
          consensus,
        }),
      )
    : "";
}

function renderArchive(refs, currentPuzzleId) {
  const archive = getLocalArchive(currentPuzzleId);
  refs.archiveList.replaceChildren(
    ...(archive.length
      ? archive.map((entry) => {
          const item = document.createElement("li");
          const summary = document.createElement("span");
          const label = document.createElement("span");
          const score = document.createElement("strong");
          label.textContent = `${entry.id.slice(5)} · ${entry.complete ? "complete" : entry.status}`;
          score.textContent = `${entry.score} pts`;
          item.setAttribute("aria-label", `${label.textContent}, ${score.textContent}`);
          summary.append(label, score);
          item.append(summary);
          if (entry.plan.length) {
            const review = document.createElement("a");
            review.href = buildShareUrl(window.location.href, { id: entry.id }, entry.plan);
            review.textContent = "Review";
            review.setAttribute("aria-label", `Review ${entry.id} route`);
            item.append(review);
          } else {
            const empty = document.createElement("em");
            empty.textContent = "No route";
            item.append(empty);
          }
          return item;
        })
      : [document.createElement("li")]),
  );
  if (!archive.length) {
    refs.archiveList.firstChild.textContent = "Play a daily board to start the local archive.";
  }
}

async function refreshConsensus(refs, communityClient, day) {
  refs.proposalSummary.textContent = "Loading consensus...";
  try {
    const response = await communityClient.init(day);
    return renderConsensus(refs, response.consensus, response.puzzle);
  } catch (error) {
    refs.proposalSummary.textContent = error instanceof Error ? error.message : "Could not load consensus.";
    return null;
  }
}

function renderConsensus(refs, consensus, puzzle) {
  const best = consensus.best || null;
  refs.applyPlan.disabled = !best;
  refs.applyPlan.textContent = best ? "Apply top proposal" : "No proposal yet";
  refs.proposalSummary.textContent = consensus.proposalCount
    ? `${consensus.completed}/${consensus.proposalCount} saved proposals complete. Best score ${consensus.best.score}.`
    : "No saved proposals yet.";
  refs.proposalList.replaceChildren(
    ...(consensus.top.length
      ? consensus.top.map((proposal) => {
          const item = document.createElement("li");
          const status = proposal.complete ? "complete" : proposal.status;
          item.textContent = `${proposal.author}: ${proposal.score} pts, ${proposal.beacons}/3 beacons, ${proposal.moves} moves, ${status}`;
          return item;
        })
      : [document.createElement("li")]),
  );
  if (!consensus.top.length) {
    refs.proposalList.firstChild.textContent = "Save a plan to start the local consensus list.";
  }
  renderContributors(refs, consensus.contributors || []);
  refs.dailyRecap.value = puzzle ? createDailyRecap(puzzle, consensus) : "";
  return consensus;
}

function renderCommunityTarget(refs, puzzle, result, consensus) {
  const target = createCommunityTarget(puzzle, result, consensus);
  refs.targetCard.className = `target-card ${target.state}`;
  refs.targetLabel.textContent = target.label;
  refs.targetValue.textContent = target.value;
  refs.targetDetail.textContent = target.detail;
}

function renderContributors(refs, contributors) {
  refs.contributorList.replaceChildren(
    ...(contributors.length
      ? contributors.map((contributor) => {
          const item = document.createElement("li");
          item.textContent = `${contributor.author}: ${contributor.completed}/${contributor.proposals} complete, best ${contributor.bestScore} pts`;
          return item;
        })
      : [document.createElement("li")]),
  );
  if (!contributors.length) {
    refs.contributorList.firstChild.textContent = "Import or save routes to start the contributor board.";
  }
}

function renderRouteInsight(refs, insights) {
  refs.routeInsight.replaceChildren(
    ...insights.map((insight) => {
      const item = document.createElement("li");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      label.textContent = insight.label;
      value.textContent = insight.value;
      item.append(label, value);
      return item;
    }),
  );
}

function renderObjectives(refs, objectives) {
  refs.objectives.replaceChildren(
    ...objectives.map((objective) => {
      const item = document.createElement("li");
      item.className = objective.complete ? "complete" : "";
      item.textContent = objective.label;
      item.setAttribute("aria-label", `${objective.label}: ${objective.complete ? "complete" : "open"}`);
      return item;
    }),
  );
}
