import { createCommunityClient } from "./client/communityClient.js";
import { createCommunityLaunchPlan } from "./communityLaunchPlan.js";
import { createGameAudio } from "./audio.js";
import { createObjectiveList, createRouteInsight, describeResult } from "./game/puzzle.js";
import {
  createCommunityTarget,
  createContributionQuality,
  createDailyMissions,
  createDailyRecap,
  createPreviewConsensus,
  createRivalRouteGuide,
  createTopRouteRationale,
} from "./game/proposals.js";
import { createLaunchPacket, formatLaunchPacket } from "./launchPacket.js";
import {
  buildSampleRouteUrl,
  createEvidenceReceipt,
  createFirstSessionGuide,
  createReviewerFastPath,
  createReviewerLoopChecks,
  createSubmissionReadiness,
  formatEvidenceReceipt,
  formatSubmissionReadiness,
  inferSourceRepoUrl,
} from "./reviewerGuide.js";
import { buildShareUrl, createCommentChallenge, createDeveloperFeedbackDraft, createRedditPostDraft, createReviewSnapshot, createShareBriefing, formatImportSkipReasons, parseSharedRoutes, wantsSampleRoute, wantsSampleWeek } from "./share.js";
import { createGardenLog, createReturnPledge, createSampleGardenArchive, getLocalArchive, getLocalStreak, mergeGardenArchive, savePlan } from "./state/store.js";

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
    onboardingTitle: document.querySelector("#onboarding-title"),
    onboardingSummary: document.querySelector("#onboarding-summary"),
    onboardingSteps: document.querySelector("#onboarding-steps"),
    moveList: document.querySelector("#move-list"),
    seed: document.querySelector("#seed-value"),
    streak: document.querySelector("#streak-value"),
    status: document.querySelector("#status-value"),
    retentionSummary: document.querySelector("#retention-summary"),
    gardenLogList: document.querySelector("#garden-log-list"),
    returnPledge: document.querySelector("#return-pledge"),
    returnPledgeValue: document.querySelector("#return-pledge-value"),
    returnPledgeDetail: document.querySelector("#return-pledge-detail"),
    returnPledgePrompt: document.querySelector("#return-pledge-prompt"),
    communityLaunchTitle: document.querySelector("#community-launch-title"),
    communityLaunchList: document.querySelector("#community-launch-list"),
    communityLaunchOutput: document.querySelector("#community-launch-output"),
    copyCommunityLaunch: document.querySelector("#copy-community-launch"),
    targetCard: document.querySelector("#target-card"),
    targetLabel: document.querySelector("#target-label"),
    targetValue: document.querySelector("#target-value"),
    targetDetail: document.querySelector("#target-detail"),
    missions: document.querySelector("#mission-list"),
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
    loadSampleThread: document.querySelector("#load-sample-thread"),
    importRoute: document.querySelector("#import-route"),
    saveProposal: document.querySelector("#save-proposal"),
    proposalSummary: document.querySelector("#proposal-summary"),
    contributionQualityCard: document.querySelector("#contribution-quality"),
    contributionQualityValue: document.querySelector("#contribution-quality-value"),
    contributionQualityDetail: document.querySelector("#contribution-quality-detail"),
    contributionQualityList: document.querySelector("#contribution-quality-list"),
    topRouteRationale: document.querySelector("#top-route-rationale"),
    topRouteRationaleSummary: document.querySelector("#top-route-rationale-summary"),
    topRouteRationaleList: document.querySelector("#top-route-rationale-list"),
    proposalList: document.querySelector("#proposal-list"),
    contributorList: document.querySelector("#contributor-list"),
    dailyRecap: document.querySelector("#daily-recap"),
    copyRecap: document.querySelector("#copy-recap"),
    commentChallenge: document.querySelector("#comment-challenge"),
    copyCommentChallenge: document.querySelector("#copy-comment-challenge"),
    redditPostDraft: document.querySelector("#reddit-post-draft"),
    copyRedditPostDraft: document.querySelector("#copy-reddit-post-draft"),
    developerFeedbackDraft: document.querySelector("#developer-feedback-draft"),
    copyDeveloperFeedbackDraft: document.querySelector("#copy-developer-feedback-draft"),
    reviewSnapshot: document.querySelector("#review-snapshot"),
    copyReviewSnapshot: document.querySelector("#copy-review-snapshot"),
    reviewerFastPath: document.querySelector("#reviewer-fast-path"),
    copyReviewerFastPath: document.querySelector("#copy-reviewer-fast-path"),
    reviewerLoopChecks: document.querySelector("#reviewer-loop-checks"),
    sampleRouteLink: document.querySelector("#sample-route-link"),
    fastPathRoute: document.querySelector("#fast-path-route"),
    fastPathConsensus: document.querySelector("#fast-path-consensus"),
    fastPathLoop: document.querySelector("#fast-path-loop"),
    submissionReadinessTitle: document.querySelector("#submission-readiness-title"),
    submissionReadinessList: document.querySelector("#submission-readiness-list"),
    submissionReadinessOutput: document.querySelector("#submission-readiness-output"),
    copySubmissionReadiness: document.querySelector("#copy-submission-readiness"),
    evidenceReceipt: document.querySelector("#evidence-receipt"),
    copyEvidenceReceipt: document.querySelector("#copy-evidence-receipt"),
    launchPacket: document.querySelector("#launch-packet"),
    copyLaunchPacket: document.querySelector("#copy-launch-packet"),
  };
  let latest = null;
  let latestDay = null;
  let latestConsensus = null;
  let lastSoundStatus = null;
  let hasRenderedState = false;
  const initialSearchParams = new URLSearchParams(window.location.search);
  const sampleRoutePreview = wantsSampleRoute(initialSearchParams);
  const sampleWeekPreview = wantsSampleWeek(initialSearchParams);

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
  refs.copyRedditPostDraft.addEventListener("click", async () => {
    refs.redditPostDraft.select();
    try {
      await navigator.clipboard.writeText(refs.redditPostDraft.value);
      refs.copyRedditPostDraft.textContent = "Draft copied";
      window.setTimeout(() => {
        refs.copyRedditPostDraft.textContent = "Copy post draft";
      }, 1200);
    } catch {
      document.execCommand("copy");
    }
  });
  refs.copyDeveloperFeedbackDraft.addEventListener("click", async () => {
    refs.developerFeedbackDraft.select();
    try {
      await navigator.clipboard.writeText(refs.developerFeedbackDraft.value);
      refs.copyDeveloperFeedbackDraft.textContent = "Feedback copied";
      window.setTimeout(() => {
        refs.copyDeveloperFeedbackDraft.textContent = "Copy feedback draft";
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
  refs.copyReviewerFastPath.addEventListener("click", async () => {
    refs.reviewerFastPath.select();
    try {
      await navigator.clipboard.writeText(refs.reviewerFastPath.value);
      refs.copyReviewerFastPath.textContent = "Path copied";
      window.setTimeout(() => {
        refs.copyReviewerFastPath.textContent = "Copy reviewer path";
      }, 1200);
    } catch {
      document.execCommand("copy");
    }
  });
  refs.copySubmissionReadiness.addEventListener("click", async () => {
    refs.submissionReadinessOutput.select();
    try {
      await navigator.clipboard.writeText(refs.submissionReadinessOutput.value);
      refs.copySubmissionReadiness.textContent = "Readiness copied";
      window.setTimeout(() => {
        refs.copySubmissionReadiness.textContent = "Copy readiness";
      }, 1200);
    } catch {
      document.execCommand("copy");
    }
  });
  refs.copyEvidenceReceipt.addEventListener("click", async () => {
    refs.evidenceReceipt.select();
    try {
      await navigator.clipboard.writeText(refs.evidenceReceipt.value);
      refs.copyEvidenceReceipt.textContent = "Receipt copied";
      window.setTimeout(() => {
        refs.copyEvidenceReceipt.textContent = "Copy evidence receipt";
      }, 1200);
    } catch {
      document.execCommand("copy");
    }
  });
  refs.copyCommunityLaunch.addEventListener("click", async () => {
    refs.communityLaunchOutput.select();
    try {
      await navigator.clipboard.writeText(refs.communityLaunchOutput.value);
      refs.copyCommunityLaunch.textContent = "Launch copied";
      window.setTimeout(() => {
        refs.copyCommunityLaunch.textContent = "Copy launch plan";
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

  refs.loadSampleThread.addEventListener("click", () => {
    if (!latest) {
      return;
    }
    refs.commentRoute.value = createSampleCommentThread(window.location.href, latest.puzzle);
    refs.commentRoute.focus();
    refs.proposalSummary.textContent = "Sample thread loaded. Import it to preview ranked comment routes.";
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
      syncRivalGuide(scene, latest.puzzle, latestConsensus);
      renderCommentChallenge(refs, latest, latestConsensus);
      renderFirstSessionGuide(refs, latest, latestConsensus);
      renderRedditPostDraft(refs, latest, latestConsensus);
      renderDeveloperFeedbackDraft(refs, latest, latestConsensus);
      renderReviewerFastPath(refs, latest, latestConsensus);
      renderReviewSnapshot(refs, latest, latestConsensus);
      renderLaunchPacket(refs, latest, latestConsensus);
      renderSubmissionReadiness(refs, latest, latestConsensus, { sampleWeekPreview });
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
    const parsed = parseSharedRoutes(refs.commentRoute.value, latest.puzzle);
    if (!parsed.ok) {
      refs.proposalSummary.textContent = parsed.error;
      return;
    }
    refs.importRoute.disabled = true;
    try {
      let response = null;
      for (const route of parsed.routes) {
        response = await communityClient.submitProposal({
          day: latest.puzzle.id,
          plan: route.plan,
          author: route.author,
        });
      }
      latestConsensus = renderConsensus(refs, response.consensus, latest.puzzle);
      syncRivalGuide(scene, latest.puzzle, latestConsensus);
      renderCommentChallenge(refs, latest, latestConsensus);
      renderFirstSessionGuide(refs, latest, latestConsensus);
      renderRedditPostDraft(refs, latest, latestConsensus);
      renderDeveloperFeedbackDraft(refs, latest, latestConsensus);
      renderReviewerFastPath(refs, latest, latestConsensus);
      renderReviewSnapshot(refs, latest, latestConsensus);
      renderLaunchPacket(refs, latest, latestConsensus);
      renderSubmissionReadiness(refs, latest, latestConsensus, { sampleWeekPreview });
      const summary = refs.proposalSummary.textContent;
      const routeLabel = parsed.routes.length === 1 ? "route" : "routes";
      const skipped = parsed.skipped ? `, ${parsed.skipped} skipped (${formatImportSkipReasons(parsed.skippedByReason)})` : "";
      refs.proposalSummary.textContent = `Imported ${parsed.routes.length}/${parsed.candidates} comment ${routeLabel}${skipped}. ${summary}`;
      refs.commentRoute.value = "";
    } catch (error) {
      refs.proposalSummary.textContent = error instanceof Error ? error.message : "Could not import comment routes.";
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
    renderDailyMissions(refs, createDailyMissions(puzzle, result, plan, latestConsensus));
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
    renderFirstSessionGuide(refs, latest, latestConsensus);
    renderRedditPostDraft(refs, latest, latestConsensus);
    renderDeveloperFeedbackDraft(refs, latest, latestConsensus);
    renderReviewerFastPath(refs, latest, latestConsensus);
    renderReviewSnapshot(refs, latest, latestConsensus);
    renderLaunchPacket(refs, latest, latestConsensus);
    renderSubmissionReadiness(refs, latest, latestConsensus, { sampleWeekPreview });
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
    renderGardenLog(refs, puzzle.id, { preview: sampleWeekPreview });
    renderCommunityLaunchPlan(refs, latest, latestConsensus, { sampleWeekPreview });
    if (latestDay !== puzzle.id) {
      latestDay = puzzle.id;
      latestConsensus = null;
      syncRivalGuide(scene, puzzle, latestConsensus);
      refreshConsensus(refs, communityClient, puzzle.id, {
        preview: sampleRoutePreview,
        puzzle,
        plan,
      }).then((consensus) => {
        latestConsensus = consensus;
        syncRivalGuide(scene, puzzle, latestConsensus);
        renderCommunityTarget(refs, puzzle, result, latestConsensus);
        renderDailyMissions(refs, createDailyMissions(puzzle, result, plan, latestConsensus));
        renderCommentChallenge(refs, latest, latestConsensus);
        renderFirstSessionGuide(refs, latest, latestConsensus);
        renderRedditPostDraft(refs, latest, latestConsensus);
        renderDeveloperFeedbackDraft(refs, latest, latestConsensus);
        renderReviewerFastPath(refs, latest, latestConsensus);
        renderReviewSnapshot(refs, latest, latestConsensus);
        renderLaunchPacket(refs, latest, latestConsensus);
        renderSubmissionReadiness(refs, latest, latestConsensus, { sampleWeekPreview });
        renderCommunityLaunchPlan(refs, latest, latestConsensus, { sampleWeekPreview });
      });
    }
  });
}

function createSampleCommentThread(currentHref, puzzle) {
  const completeRoute = buildShareUrl(currentHref, puzzle, puzzle.solution);
  const partialRoute = buildShareUrl(currentHref, puzzle, puzzle.solution.slice(0, 1));
  const oldRoute = new URL(currentHref);
  oldRoute.searchParams.set("day", "2026-06-18");
  oldRoute.searchParams.set("plan", "2-2-b");
  return [
    `u/alice: ${completeRoute}`,
    `@bob - ${partialRoute}`,
    `u/old: ${oldRoute.toString()}`,
    `u/alice-again: ${completeRoute}`,
  ].join("\n");
}

function syncRivalGuide(scene, puzzle, consensus) {
  const guide = createRivalRouteGuide(puzzle, consensus);
  scene.setRivalPlan(guide?.plan || []);
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

function renderFirstSessionGuide(refs, latest, consensus) {
  if (!latest) {
    refs.onboardingTitle.textContent = "First-session guide";
    refs.onboardingSummary.textContent = "Waiting for the daily board.";
    refs.onboardingSteps.replaceChildren();
    return;
  }

  const guide = createFirstSessionGuide({
    puzzle: latest.puzzle,
    result: latest.result,
    plan: latest.plan,
    shareUrl: buildShareUrl(window.location.href, latest.puzzle, latest.plan),
    sampleRouteUrl: buildSampleRouteUrl(window.location.href, latest.puzzle),
    consensus,
  });

  refs.onboardingTitle.textContent = guide.title;
  refs.onboardingSummary.textContent = guide.summary;
  refs.onboardingSteps.replaceChildren(
    ...guide.steps.map((step) => {
      const item = document.createElement("li");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      const detail = document.createElement("em");
      item.className = step.state;
      item.setAttribute("aria-label", `${step.label}: ${step.state}, ${step.detail}`);
      label.textContent = step.label;
      value.textContent = step.value;
      detail.textContent = step.detail;
      item.append(label, value, detail);
      return item;
    }),
  );
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

function renderRedditPostDraft(refs, latest, consensus) {
  refs.redditPostDraft.value = latest
    ? createRedditPostDraft({
        puzzle: latest.puzzle,
        result: latest.result,
        plan: latest.plan,
        shareUrl: buildShareUrl(window.location.href, latest.puzzle, latest.plan),
        sampleRouteUrl: buildSampleRouteUrl(window.location.href, latest.puzzle),
        consensus,
      })
    : "";
}

function renderDeveloperFeedbackDraft(refs, latest, consensus) {
  refs.developerFeedbackDraft.value = latest
    ? createDeveloperFeedbackDraft({
        puzzle: latest.puzzle,
        result: latest.result,
        plan: latest.plan,
        shareUrl: buildShareUrl(window.location.href, latest.puzzle, latest.plan),
        sampleRouteUrl: buildSampleRouteUrl(window.location.href, latest.puzzle),
        consensus,
      })
    : "";
}

function renderReviewerFastPath(refs, latest, consensus) {
  if (!latest) {
    refs.reviewerFastPath.value = "";
    refs.reviewerLoopChecks.replaceChildren();
    refs.fastPathRoute.textContent = "Loading";
    refs.fastPathConsensus.textContent = "Loading";
    refs.fastPathLoop.textContent = "Loading";
    refs.sampleRouteLink.removeAttribute("href");
    return;
  }
  const sampleRouteUrl = buildSampleRouteUrl(window.location.href, latest.puzzle);
  const shareUrl = buildShareUrl(window.location.href, latest.puzzle, latest.plan);
  const launchPacket = createLaunchPacketText(latest, consensus);
  refs.sampleRouteLink.href = sampleRouteUrl;
  refs.sampleRouteLink.textContent = "Open sample route";
  refs.fastPathRoute.textContent = latest.result?.complete ? "Complete route" : latest.plan.length ? "Draft route" : "Open board";
  refs.fastPathConsensus.textContent = consensus?.proposalCount
    ? `${consensus.completed}/${consensus.proposalCount} complete`
    : consensus?.preview
      ? "Sample preview"
      : "Open board";
  refs.fastPathLoop.textContent = "Reply thread -> import -> ranked proposals";
  renderReviewerLoopChecks(refs, createReviewerLoopChecks({
    puzzle: latest.puzzle,
    result: latest.result,
    plan: latest.plan,
    sampleRouteUrl,
    consensus,
    launchPacket,
  }));
  refs.reviewerFastPath.value = createReviewerFastPath({
    puzzle: latest.puzzle,
    result: latest.result,
    plan: latest.plan,
    shareUrl,
    sampleRouteUrl,
    consensus,
  });
}

function renderReviewerLoopChecks(refs, checks) {
  refs.reviewerLoopChecks.replaceChildren(
    ...checks.map((check) => {
      const item = document.createElement("li");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      const detail = document.createElement("em");
      item.className = check.state;
      item.setAttribute("aria-label", `${check.label}: ${check.state}, ${check.detail}`);
      label.textContent = check.label;
      value.textContent = check.state;
      detail.textContent = check.detail;
      item.append(label, value, detail);
      return item;
    }),
  );
}

function createLaunchPacketText(latest, consensus) {
  return latest
    ? formatLaunchPacket(
        createLaunchPacket({
          puzzle: latest.puzzle,
          result: latest.result,
          plan: latest.plan,
          shareUrl: buildShareUrl(window.location.href, latest.puzzle, latest.plan),
          consensus,
          sourceRepoUrl: inferSourceRepoUrl(window.location.href),
        }),
      )
    : "";
}

function renderLaunchPacket(refs, latest, consensus) {
  refs.launchPacket.value = createLaunchPacketText(latest, consensus);
}

function renderSubmissionReadiness(refs, latest, consensus, { sampleWeekPreview = false } = {}) {
  if (!latest) {
    refs.submissionReadinessTitle.textContent = "Loading";
    refs.submissionReadinessList.replaceChildren();
    refs.submissionReadinessOutput.value = "";
    refs.evidenceReceipt.value = "";
    return;
  }

  const archive = sampleWeekPreview
    ? mergeGardenArchive(getLocalArchive(latest.puzzle.id), createSampleGardenArchive(latest.puzzle.id))
    : getLocalArchive(latest.puzzle.id);
  const gardenLog = createGardenLog({
    currentPuzzleId: latest.puzzle.id,
    archive,
    streak: sampleWeekPreview ? undefined : getLocalStreak(latest.puzzle.id),
  });
  const returnPledge = createReturnPledge({
    currentPuzzleId: latest.puzzle.id,
    archive,
    streak: sampleWeekPreview ? undefined : getLocalStreak(latest.puzzle.id),
  });
  const readiness = createSubmissionReadiness({
    puzzle: latest.puzzle,
    result: latest.result,
    plan: latest.plan,
    shareUrl: buildShareUrl(window.location.href, latest.puzzle, latest.plan),
    sampleRouteUrl: buildSampleRouteUrl(window.location.href, latest.puzzle),
    consensus,
    gardenLog,
    returnPledge,
    launchPacket: refs.launchPacket.value,
    currentHref: window.location.href,
    sourceRepoUrl: inferSourceRepoUrl(window.location.href),
  });
  refs.submissionReadinessTitle.textContent = readiness.summary;
  refs.submissionReadinessOutput.value = formatSubmissionReadiness(readiness);
  refs.evidenceReceipt.value = formatEvidenceReceipt(
    createEvidenceReceipt({
      puzzle: latest.puzzle,
      result: latest.result,
      plan: latest.plan,
      shareUrl: buildShareUrl(window.location.href, latest.puzzle, latest.plan),
      sampleRouteUrl: buildSampleRouteUrl(window.location.href, latest.puzzle),
      consensus,
      gardenLog,
      returnPledge,
      launchPacket: refs.launchPacket.value,
      publicAppUrl: publicAppReadinessUrl(window.location.href),
      sourceRepoUrl: inferSourceRepoUrl(window.location.href),
    }),
  );
  refs.submissionReadinessList.replaceChildren(
    ...readiness.items.map((check) => {
      const item = document.createElement("li");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      const detail = document.createElement("em");
      item.className = check.state;
      label.textContent = check.label;
      value.textContent = check.state;
      detail.textContent = check.detail;
      item.append(label, value, detail);
      return item;
    }),
  );
}

function renderCommunityLaunchPlan(refs, latest, consensus, { sampleWeekPreview = false } = {}) {
  if (!latest) {
    refs.communityLaunchTitle.textContent = "Loading";
    refs.communityLaunchList.replaceChildren();
    refs.communityLaunchOutput.value = "";
    return;
  }

  const archive = sampleWeekPreview
    ? mergeGardenArchive(getLocalArchive(latest.puzzle.id), createSampleGardenArchive(latest.puzzle.id))
    : getLocalArchive(latest.puzzle.id);
  const gardenLog = createGardenLog({
    currentPuzzleId: latest.puzzle.id,
    archive,
    streak: sampleWeekPreview ? undefined : getLocalStreak(latest.puzzle.id),
  });
  const returnPledge = createReturnPledge({
    currentPuzzleId: latest.puzzle.id,
    archive,
    streak: sampleWeekPreview ? undefined : getLocalStreak(latest.puzzle.id),
  });
  const plan = createCommunityLaunchPlan({
    puzzle: latest.puzzle,
    result: latest.result,
    plan: latest.plan,
    shareUrl: buildShareUrl(window.location.href, latest.puzzle, latest.plan),
    sampleRouteUrl: buildSampleRouteUrl(window.location.href, latest.puzzle),
    consensus,
    gardenLog,
    returnPledge,
  });
  refs.communityLaunchTitle.textContent = plan.summary;
  refs.communityLaunchOutput.value = plan.copy;
  refs.communityLaunchList.replaceChildren(
    ...plan.metrics.map((metric) => {
      const item = document.createElement("li");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      const detail = document.createElement("em");
      item.className = metric.state;
      label.textContent = metric.label;
      value.textContent = metric.value;
      detail.textContent = metric.detail;
      item.append(label, value, detail);
      return item;
    }),
  );
}

function publicAppReadinessUrl(currentHref = "") {
  try {
    const url = new URL(currentHref);
    const hostname = url.hostname.toLowerCase();
    const isPublic =
      url.protocol === "https:" &&
      !["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname) &&
      !hostname.endsWith(".local") &&
      !hostname.endsWith(".test") &&
      !hostname.endsWith(".invalid");
    if (!isPublic) {
      return "";
    }
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
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
          label.textContent = `${entry.id.slice(5)} route ${entry.complete ? "complete" : entry.status}`;
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

function renderGardenLog(refs, currentPuzzleId, { preview = false } = {}) {
  const archive = preview
    ? mergeGardenArchive(getLocalArchive(currentPuzzleId), createSampleGardenArchive(currentPuzzleId))
    : getLocalArchive(currentPuzzleId);
  const log = createGardenLog({
    currentPuzzleId,
    archive,
    streak: preview ? undefined : getLocalStreak(currentPuzzleId),
  });
  const pledge = createReturnPledge({
    currentPuzzleId,
    archive,
    streak: preview ? undefined : getLocalStreak(currentPuzzleId),
  });
  refs.retentionSummary.textContent = log.summary;
  renderReturnPledge(refs, pledge);
  refs.gardenLogList.replaceChildren(
    ...(log.slots.length
      ? log.slots.map((slot) => {
          const item = document.createElement("li");
          const label = document.createElement("span");
          const value = document.createElement("strong");
          const detail = document.createElement("em");
          item.className = `${slot.state}${slot.preview ? " preview" : ""}`;
          item.setAttribute("aria-label", `${slot.label}: ${slot.value}, ${slot.detail}`);
          label.textContent = slot.label;
          value.textContent = slot.value;
          detail.textContent = slot.detail;
          item.append(label, value, detail);
          return item;
        })
      : [document.createElement("li")]),
  );
  if (!log.slots.length) {
    refs.gardenLogList.firstChild.textContent = "Daily log opens after the first board loads.";
  }
}

function renderReturnPledge(refs, pledge) {
  refs.returnPledge.className = `return-pledge ${pledge.state}`;
  refs.returnPledgeValue.textContent = pledge.summary;
  refs.returnPledgeDetail.textContent = pledge.detail;
  refs.returnPledgePrompt.value = pledge.prompt;
}

async function refreshConsensus(refs, communityClient, day, previewRoute = null) {
  refs.proposalSummary.textContent = "Loading consensus...";
  try {
    const response = await communityClient.init(day);
    const consensus =
      previewRoute?.preview && !response.consensus?.proposalCount
        ? createPreviewConsensus(previewRoute.puzzle || response.puzzle, previewRoute.plan || [])
        : response.consensus;
    return renderConsensus(refs, consensus, response.puzzle);
  } catch (error) {
    refs.proposalSummary.textContent = error instanceof Error ? error.message : "Could not load consensus.";
    return null;
  }
}

function renderConsensus(refs, consensus, puzzle) {
  const best = consensus.best || null;
  refs.applyPlan.disabled = !best;
  refs.applyPlan.textContent = best ? "Apply top proposal" : "No proposal yet";
  refs.proposalSummary.textContent = consensus.preview
    ? `Sample route preview: ${consensus.completed}/${consensus.proposalCount} complete route shown.`
    : consensus.proposalCount
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
  renderContributionQuality(refs, createContributionQuality(puzzle, consensus));
  renderTopRouteRationale(refs, createTopRouteRationale(puzzle, consensus));
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

function renderDailyMissions(refs, missions) {
  refs.missions.replaceChildren(
    ...missions.map((mission) => {
      const item = document.createElement("li");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      item.className = mission.complete ? "complete" : "";
      item.setAttribute("aria-label", `${mission.label}: ${mission.complete ? "complete" : "open"}, ${mission.value}`);
      label.textContent = mission.label;
      value.textContent = mission.value;
      item.append(label, value);
      return item;
    }),
  );
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

function renderContributionQuality(refs, quality) {
  refs.contributionQualityCard.className = `quality-card ${quality.state}`;
  refs.contributionQualityValue.textContent = `${quality.score}/100`;
  refs.contributionQualityDetail.textContent = quality.detail;
  refs.contributionQualityList.replaceChildren(
    ...quality.criteria.map((item) => {
      const row = document.createElement("li");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      const detail = document.createElement("em");
      row.className = item.ready ? "ready" : "todo";
      label.textContent = item.label;
      value.textContent = item.ready ? "ready" : "open";
      detail.textContent = item.detail;
      row.append(label, value, detail);
      return row;
    }),
  );
}

function renderTopRouteRationale(refs, rationale) {
  refs.topRouteRationale.querySelector("span").textContent = rationale.label;
  refs.topRouteRationaleSummary.textContent = rationale.summary;
  refs.topRouteRationaleList.replaceChildren(
    ...rationale.points.map((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      return item;
    }),
  );
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
