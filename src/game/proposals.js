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

