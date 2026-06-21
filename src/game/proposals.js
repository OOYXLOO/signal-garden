import { traceSignal } from "./puzzle.js";
import { hashSeed } from "./seeded.js";

function normalizeAuthor(author) {
  const value = String(author || "local-player").trim();
  return value.slice(0, 32) || "local-player";
}

function proposalId(puzzleId, author, plan, createdAt) {
  const raw = `${puzzleId}:${author}:${createdAt}:${JSON.stringify(plan)}`;
  return `sg-${hashSeed(raw).toString(16).padStart(8, "0")}`;
}

export function createProposal({ puzzle, plan, author = "local-player", createdAt = new Date().toISOString() }) {
  const result = traceSignal(puzzle, plan);
  const normalizedAuthor = normalizeAuthor(author);
  return {
    id: proposalId(puzzle.id, normalizedAuthor, result.moves, createdAt),
    puzzleId: puzzle.id,
    author: normalizedAuthor,
    createdAt,
    plan: result.moves,
    status: result.status,
    complete: result.complete,
    score: result.score,
    beacons: result.hitBeacons.length,
    moves: result.moves.length,
  };
}

export function rankProposals(proposals = []) {
  return [...proposals].sort((left, right) => {
    if (left.complete !== right.complete) {
      return left.complete ? -1 : 1;
    }
    if (left.score !== right.score) {
      return right.score - left.score;
    }
    if (left.moves !== right.moves) {
      return left.moves - right.moves;
    }
    return String(left.createdAt).localeCompare(String(right.createdAt));
  });
}

export function summarizeConsensus(puzzle, proposals = []) {
  const ranked = rankProposals(proposals);
  const best = ranked[0] || null;
  const completed = ranked.filter((proposal) => proposal.complete).length;
  return {
    puzzleId: puzzle.id,
    proposalCount: ranked.length,
    completed,
    best,
    top: ranked.slice(0, 5),
    contributors: summarizeContributors(ranked),
  };
}

export function createCommunityTarget(puzzle, result, consensus) {
  const best = consensus?.best || null;
  const currentScore = Number(result?.score || 0);
  const currentMoves = result?.moves?.length || 0;
  const beaconTotal = puzzle.beacons.length;

  if (!best) {
    return {
      state: "open",
      label: "Rival target",
      value: "Open board",
      detail: `First complete route sets the ${beaconTotal}-beacon target.`,
    };
  }

  const bestSummary = `${best.score} pts, ${best.beacons}/${beaconTotal} beacons, ${best.moves} moves`;
  if (result?.complete && currentScore > best.score) {
    return {
      state: "leading",
      label: "Rival target",
      value: `+${currentScore - best.score} pts`,
      detail: `Current route leads the top saved route: ${bestSummary}.`,
    };
  }

  if (result?.complete && currentScore === best.score && currentMoves <= best.moves) {
    return {
      state: "matched",
      label: "Rival target",
      value: "Top route matched",
      detail: `Current route matches the saved target: ${bestSummary}.`,
    };
  }

  const scoreGap = Math.max(1, best.score - currentScore + 1);
  const detail = result?.complete
    ? `Need ${scoreGap} more pts to pass the saved target: ${bestSummary}.`
    : `Top saved route: ${bestSummary}.`;

  return {
    state: "chasing",
    label: "Rival target",
    value: `${best.score + 1} pts`,
    detail,
  };
}

export function createDailyMissions(puzzle, result, plan = [], consensus) {
  const proposalCount = Number(consensus?.proposalCount || 0);
  const best = consensus?.best || null;
  const moveCount = plan.length;
  const beaconTotal = puzzle.beacons.length;
  const hitBeacons = result?.hitBeacons?.length || 0;
  const currentScore = Number(result?.score || 0);
  const currentMoves = result?.moves?.length || moveCount;
  const beatsBest = best && result?.complete && (currentScore > best.score || (currentScore === best.score && currentMoves <= best.moves));

  return [
    {
      label: "Trace a route",
      value: moveCount ? `${moveCount}/${puzzle.moveLimit} moves` : "Open path",
      complete: moveCount > 0,
    },
    {
      label: "Save proposal",
      value: proposalCount ? `${proposalCount} saved` : "Open slot",
      complete: proposalCount > 0,
    },
    {
      label: "Complete relay",
      value: result?.complete ? `${currentScore} pts` : `${hitBeacons}/${beaconTotal} beacons`,
      complete: Boolean(result?.complete),
    },
    {
      label: best ? "Beat top route" : "Set first target",
      value: best ? `${best.score + 1} pts` : "First saved route",
      complete: best ? Boolean(beatsBest) : proposalCount > 0,
    },
  ];
}

export function createRivalRouteGuide(puzzle, consensus) {
  const best = consensus?.best || null;
  if (!best?.plan?.length) {
    return null;
  }

  const result = traceSignal(puzzle, best.plan);
  return {
    label: "Top route",
    score: best.score,
    moves: best.moves,
    beacons: best.beacons,
    complete: best.complete,
    plan: result.moves,
    visited: result.visited,
  };
}

export function toCommunityPayload(puzzle, proposals = []) {
  const consensus = summarizeConsensus(puzzle, proposals);
  return {
    type: "signal-garden-consensus",
    day: puzzle.id,
    board: puzzle.title,
    moveLimit: puzzle.moveLimit,
    beacons: puzzle.beacons.length,
    proposalCount: consensus.proposalCount,
    completed: consensus.completed,
    contributors: consensus.contributors.length,
    best: consensus.best
      ? {
          score: consensus.best.score,
          moves: consensus.best.moves,
          complete: consensus.best.complete,
          plan: consensus.best.plan,
        }
      : null,
  };
}

export function summarizeContributors(proposals = []) {
  const byAuthor = new Map();
  for (const proposal of proposals) {
    const author = normalizeAuthor(proposal.author);
    const current =
      byAuthor.get(author) || {
        author,
        proposals: 0,
        completed: 0,
        bestScore: 0,
        bestMoves: null,
        latestAt: "",
      };
    current.proposals += 1;
    current.completed += proposal.complete ? 1 : 0;
    if (proposal.score > current.bestScore) {
      current.bestScore = proposal.score;
      current.bestMoves = proposal.moves;
    }
    if (String(proposal.createdAt || "") > current.latestAt) {
      current.latestAt = proposal.createdAt;
    }
    byAuthor.set(author, current);
  }

  return Array.from(byAuthor.values())
    .sort((left, right) => {
      if (left.completed !== right.completed) {
        return right.completed - left.completed;
      }
      if (left.bestScore !== right.bestScore) {
        return right.bestScore - left.bestScore;
      }
      if (left.proposals !== right.proposals) {
        return right.proposals - left.proposals;
      }
      return String(right.latestAt).localeCompare(String(left.latestAt));
    })
    .slice(0, 5);
}

export function createDailyRecap(puzzle, consensus) {
  const leader = consensus.contributors?.[0] || null;
  const best = consensus.best || null;
  const lines = [
    `Signal Garden ${puzzle.id} recap`,
    `Board: ${puzzle.title}`,
    `Routes: ${consensus.completed}/${consensus.proposalCount} complete`,
  ];

  if (best) {
    lines.push(`Top route: ${best.score} pts, ${best.beacons}/${puzzle.beacons.length} beacons, ${best.moves} moves`);
  } else {
    lines.push("Top route: open");
  }

  if (leader) {
    lines.push(`Contributor lead: ${leader.author} with ${leader.completed}/${leader.proposals} complete routes`);
  } else {
    lines.push("Contributor lead: open");
  }

  lines.push("Try a route, paste a review link, and help the garden choose today's best signal.");
  return lines.join("\n");
}
