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

export function createPreviewConsensus(puzzle, plan = [], author = "sample-review") {
  if (!plan.length) {
    return null;
  }
  return {
    ...summarizeConsensus(puzzle, [
      createProposal({
        puzzle,
        plan,
        author,
        createdAt: `${puzzle.id}T00:00:00.000Z`,
      }),
    ]),
    preview: true,
  };
}

export function createCommunityTarget(puzzle, result, consensus) {
  const best = consensus?.best || null;
  const currentScore = Number(result?.score || 0);
  const currentMoves = result?.moves?.length || 0;
  const beaconTotal = puzzle.beacons.length;
  const targetName = consensus?.preview ? "sample preview route" : "saved target";

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
    ? `Need ${scoreGap} more pts to pass the ${targetName}: ${bestSummary}.`
    : consensus?.preview
      ? `Sample preview route: ${bestSummary}.`
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

export function createTopRouteRationale(puzzle, consensus) {
  const best = consensus?.best || null;
  if (!best) {
    return {
      label: "Top route rationale",
      summary: "No ranked route yet.",
      points: [
        `First saved or imported route sets the ${puzzle.beacons.length}-beacon target.`,
        "Reply-thread review links can become ranked proposals once imported.",
      ],
    };
  }

  const runnerUp = consensus.top?.find((proposal) => proposal.id !== best.id) || null;
  const beaconTotal = puzzle.beacons.length;
  const bestComplete = Boolean(best.complete || best.beacons >= beaconTotal);
  const bestStatus = best.status || (bestComplete ? "complete" : "partial");
  const points = [
    bestComplete
      ? `Completes all ${beaconTotal} beacons.`
      : `Reaches ${best.beacons}/${beaconTotal} beacons with status ${bestStatus}.`,
    `${best.score} pts using ${best.moves}/${puzzle.moveLimit} moves.`,
  ];

  if (runnerUp) {
    const runnerUpComplete = Boolean(runnerUp.complete || runnerUp.beacons >= beaconTotal);
    if (bestComplete !== runnerUpComplete) {
      points.push(`Ranks above ${runnerUp.author} because complete routes lead partial routes.`);
    } else if (best.score !== runnerUp.score) {
      points.push(`${best.score - runnerUp.score} pts ahead of ${runnerUp.author}.`);
    } else if (best.moves !== runnerUp.moves) {
      points.push(`Tie-break: ${Math.abs(best.moves - runnerUp.moves)} fewer moves than ${runnerUp.author}.`);
    } else {
      points.push(`Tie-break: earlier route than ${runnerUp.author}.`);
    }
  } else if (consensus.preview) {
    points.push("Sample preview route, clearly labeled and not stored.");
  } else {
    points.push("First ranked route sets today's chase target.");
  }

  const contributor = consensus.contributors?.find((entry) => entry.author === best.author);
  if (contributor) {
    points.push(`${best.author} contributor record: ${contributor.completed}/${contributor.proposals} complete.`);
  }

  return {
    label: `Why ${best.author} leads`,
    summary: `${best.score} pts, ${best.beacons}/${beaconTotal} beacons, ${best.moves} moves.`,
    points,
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
  const preview = Boolean(consensus.preview);
  const lines = [
    `Signal Garden ${puzzle.id} recap`,
    `Board: ${puzzle.title}`,
    preview
      ? `Routes: sample preview, ${consensus.completed}/${consensus.proposalCount} complete`
      : `Routes: ${consensus.completed}/${consensus.proposalCount} complete`,
  ];

  if (best) {
    lines.push(`Top route: ${best.score} pts, ${best.beacons}/${puzzle.beacons.length} beacons, ${best.moves} moves`);
    lines.push(`Lead rationale: ${createTopRouteRationale(puzzle, consensus).points[0]}`);
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

export function createContributionQuality(puzzle, consensus = null) {
  const proposalCount = Number(consensus?.proposalCount || 0);
  const completed = Number(consensus?.completed || 0);
  const contributors = Array.isArray(consensus?.contributors) ? consensus.contributors : [];
  const contributorCount = contributors.length;
  const best = consensus?.best || null;
  const preview = Boolean(consensus?.preview);
  const bestComplete = Boolean(best?.complete || best?.beacons >= (puzzle?.beacons?.length || 0));
  const criteria = [
    {
      label: "Route evidence",
      weight: 25,
      ready: proposalCount > 0 || preview,
      detail: proposalCount
        ? `${proposalCount} route proposal${proposalCount === 1 ? "" : "s"} saved or imported.`
        : preview
          ? "Sample preview route proves the loop without stored data."
          : "Import or save a review link to create route evidence.",
    },
    {
      label: "Complete route",
      weight: 30,
      ready: completed > 0 || (preview && bestComplete),
      detail: completed
        ? `${completed}/${proposalCount} proposal${proposalCount === 1 ? "" : "s"} complete.`
        : preview && bestComplete
          ? "Sample route completes the board."
          : "A complete route gives the thread a credible target.",
    },
    {
      label: "Contributor spread",
      weight: 20,
      ready: contributorCount >= 2 || (preview && contributorCount >= 1),
      detail:
        contributorCount >= 2
          ? `${contributorCount} contributors represented in the ranked list.`
          : contributorCount === 1
            ? "One contributor is present; import another route to show thread diversity."
            : "No contributor record yet.",
    },
    {
      label: "Recap handoff",
      weight: 25,
      ready: Boolean(best || preview),
      detail: best
        ? `Daily recap can explain why ${best.author} leads.`
        : preview
          ? "Sample recap can be copied after opening the preview route."
          : "A recap needs at least one ranked route.",
    },
  ];
  const score = criteria.reduce((total, item) => total + (item.ready ? item.weight : 0), 0);
  const state = preview && score >= 40 ? "preview" : score >= 80 ? "ready" : score >= 40 ? "preview" : "todo";
  const label =
    state === "ready"
      ? "Community proof ready"
      : state === "preview"
        ? "Community proof preview"
        : "Community proof open";
  const detail =
    state === "ready"
      ? contributorCount
        ? `The loop has ${completed}/${proposalCount} complete routes across ${contributorCount} contributor view${contributorCount === 1 ? "" : "s"}.`
        : `The loop has ${completed}/${proposalCount} complete routes; contributor metadata is optional.`
      : state === "preview"
        ? "The loop is demonstrable, but it still needs more saved/imported community evidence before final submission."
        : "Save or import comment routes so reviewers can inspect the contribution loop.";

  return {
    label,
    state,
    score,
    completionRate: proposalCount ? completed / proposalCount : 0,
    proposalCount,
    completed,
    contributorCount,
    criteria,
    detail,
  };
}
