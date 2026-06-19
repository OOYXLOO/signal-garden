import { createProposal, summarizeConsensus } from "./game/proposals.js";
import { getLocalStreak, loadProposals, savePlan, saveProposal } from "./state/store.js";

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

export function bindUi(scene) {
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
    briefing: document.querySelector("#briefing-output"),
    applyPlan: document.querySelector("#apply-plan"),
    clearPlan: document.querySelector("#clear-plan"),
    copyBriefing: document.querySelector("#copy-briefing"),
    saveProposal: document.querySelector("#save-proposal"),
    proposalSummary: document.querySelector("#proposal-summary"),
    proposalList: document.querySelector("#proposal-list"),
  };
  let latest = null;

  refs.applyPlan.addEventListener("click", () => scene.applyCommunityPlan());
  refs.clearPlan.addEventListener("click", () => scene.clearPlan());
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

  refs.saveProposal.addEventListener("click", () => {
    if (!latest) {
      return;
    }
    const proposal = createProposal({
      puzzle: latest.puzzle,
      plan: latest.plan,
      author: "local-player",
    });
    saveProposal(proposal);
    renderConsensus(refs, latest.puzzle);
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
    refs.seed.textContent = puzzle.id.replaceAll("-", "");
    refs.streak.textContent = String(getLocalStreak(puzzle.id));
    refs.status.textContent = statusText[result.status] || "Drafting";
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
    savePlan(puzzle.id, plan, result.complete);
    renderConsensus(refs, puzzle);
  });
}

function renderConsensus(refs, puzzle) {
  const proposals = loadProposals(puzzle.id);
  const consensus = summarizeConsensus(puzzle, proposals);
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
}
