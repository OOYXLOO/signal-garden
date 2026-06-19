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

export function savePlan(puzzleId, plan, complete) {
  const state = safeRead();
  const today = state[puzzleId] || {};
  state[puzzleId] = {
    ...today,
    plan,
    complete,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
