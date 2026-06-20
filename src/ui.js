import { createCommunityClient } from "./client/communityClient.js";
import { createGameAudio } from "./audio.js";
import { createRouteInsight, describeResult, encodePlanToken } from "./game/puzzle.js";
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
    score: document.querySelector("#score-value"),
    beacons: document.querySelector("#beacon-value"),
    moves: document.querySelector("#move-value"),
    moveList: document.querySelector("#move-list"),
    seed: document.querySelector("#seed-value"),
    streak: document.querySelector("#streak-value"),
    status: document.querySelector("#status-value"),
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
    saveProposal: document.querySelector("#save-proposal"),
    proposalSummary: document.querySelector("#proposal-summary"),
    proposalList: document.querySelector("#proposal-list"),
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
    const url = new URL(window.location.href);
    url.searchParams.set("day", latest.puzzle.id);
    url.searchParams.set("plan", encodePlanToken(latest.plan));
    try {
      await navigator.clipboard.writeText(url.toString());
      refs.copyLink.textContent = "Link copied";
      window.setTimeout(() => {
        refs.copyLink.textContent = "Copy share link";
      }, 1200);
    } catch {
      refs.briefing.value = `${refs.briefing.value}\nShare link: ${url.toString()}`;
      refs.briefing.select();
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
      latestConsensus = renderConsensus(refs, response.consensus);
    } catch (error) {
      refs.proposalSummary.textContent = error instanceof Error ? error.message : "Could not save proposal.";
    } finally {
      refs.saveProposal.disabled = false;
    }
  });

  window.addEventListener("signal-garden:update", (event) => {
    const { puzzle, result, plan, briefing } = event.detail;
    latest = event.detail;
    refs.dayChip.textContent = puzzle.id;
    refs.title.textContent = puzzle.title;
    refs.brief.textContent = puzzle.brief;
    refs.score.textContent = String(result.score);
    refs.beacons.textContent = `${result.hitBeacons.length}/${puzzle.beacons.length}`;
    refs.moves.textContent = `${plan.length}/${puzzle.moveLimit}`;
    refs.copyLink.disabled = plan.length === 0;
    refs.replayPlan.disabled = plan.length === 0;
    refs.seed.textContent = puzzle.id.replaceAll("-", "");
    refs.streak.textContent = String(getLocalStreak(puzzle.id));
    refs.status.textContent = statusText[result.status] || "Drafting";
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
    refs.briefing.value = briefing;
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
      });
    }
  });
}

function renderArchive(refs, currentPuzzleId) {
  const archive = getLocalArchive(currentPuzzleId);
  refs.archiveList.replaceChildren(
    ...(archive.length
      ? archive.map((entry) => {
          const item = document.createElement("li");
          const label = document.createElement("span");
          const score = document.createElement("strong");
          label.textContent = `${entry.id.slice(5)} · ${entry.complete ? "complete" : entry.status}`;
          score.textContent = `${entry.score} pts`;
          item.setAttribute("aria-label", `${label.textContent}, ${score.textContent}`);
          item.append(label, score);
          return item;
        })
      : [document.createElement("li")]),
  );
  if (!archive.length) {
    refs.archiveList.firstChild.textContent = "Play a daily board to start the local archive.";
  }
}

async function refreshConsensus(refs, communityClient, day) {
  refs.proposalSummary.textContent = "Loading local consensus...";
  try {
    const response = await communityClient.init(day);
    return renderConsensus(refs, response.consensus);
  } catch (error) {
    refs.proposalSummary.textContent = error instanceof Error ? error.message : "Could not load consensus.";
    return null;
  }
}

function renderConsensus(refs, consensus) {
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
  return consensus;
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
