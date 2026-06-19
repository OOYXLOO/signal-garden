const STORAGE_KEY = "signal-garden-state";

function safeRead() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function loadPlan(puzzleId) {
  const state = safeRead();
  return state[puzzleId]?.plan || [];
}

export function savePlan(puzzleId, plan, resultOrComplete) {
  const state = safeRead();
  const today = state[puzzleId] || {};
  const result =
    typeof resultOrComplete === "boolean"
      ? { complete: resultOrComplete }
      : resultOrComplete || {};
  state[puzzleId] = {
    ...today,
    plan,
    complete: Boolean(result.complete),
    status: result.status || today.status || "drafting",
    score: Number.isFinite(result.score) ? result.score : today.score || 0,
    beacons: Array.isArray(result.hitBeacons) ? result.hitBeacons.length : today.beacons || 0,
    moves: plan.length,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getLocalArchive(currentPuzzleId, limit = 7) {
  const state = safeRead();
  return Object.entries(state)
    .filter(([key]) => key <= currentPuzzleId)
    .sort(([left], [right]) => right.localeCompare(left))
    .slice(0, limit)
    .map(([id, value]) => ({
      id,
      complete: Boolean(value.complete),
      status: value.status || "drafting",
      score: value.score || 0,
      beacons: value.beacons || 0,
      moves: value.moves || 0,
      updatedAt: value.updatedAt || "",
    }));
}

export function getLocalStreak(currentPuzzleId) {
  const state = safeRead();
  return Object.entries(state)
    .filter(([key, value]) => key <= currentPuzzleId && value.complete)
    .sort(([a], [b]) => b.localeCompare(a))
    .reduce((streak, [, value], index) => {
      if (index === streak && value.complete) {
        return streak + 1;
      }
      return streak;
    }, 0);
}
