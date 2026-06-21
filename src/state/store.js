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
      plan: Array.isArray(value.plan) ? value.plan : [],
      updatedAt: value.updatedAt || "",
    }));
}

function parseDayKey(value) {
  const text = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return null;
  }
  const date = new Date(`${text}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDayKey(date) {
  return date.toISOString().slice(0, 10);
}

export function createGardenLog({ currentPuzzleId, archive = [], streak = 0, limit = 7 } = {}) {
  const currentDate = parseDayKey(currentPuzzleId);
  const archiveById = new Map(archive.map((entry) => [entry.id, entry]));
  if (!currentDate) {
    return {
      summary: "Open daily log",
      slots: [],
    };
  }

  const slots = [];
  for (let offset = 0; offset < limit; offset += 1) {
    const date = new Date(currentDate.getTime() - offset * 24 * 60 * 60 * 1000);
    const id = formatDayKey(date);
    const entry = archiveById.get(id) || null;
    const complete = Boolean(entry?.complete);
    const hasRoute = Boolean(entry?.plan?.length);
    const status = entry?.status || "open";
    slots.push({
      id,
      label: offset === 0 ? "Today" : offset === 1 ? "Yesterday" : id.slice(5),
      state: complete ? "complete" : hasRoute ? "draft" : "open",
      value: complete
        ? `${entry.score || 0} pts`
        : hasRoute
          ? `${entry.beacons || 0} beacons`
          : "Open",
      detail: entry ? status : "not played",
    });
  }

  const completed = slots.filter((slot) => slot.state === "complete").length;
  return {
    summary: streak ? `${streak}-day complete streak` : `${completed}/${slots.length} recent days complete`,
    slots,
  };
}

export function getLocalStreak(currentPuzzleId) {
  const state = safeRead();
  const currentDate = parseDayKey(currentPuzzleId);
  if (!currentDate) {
    return 0;
  }

  let streak = 0;
  while (true) {
    const date = new Date(currentDate.getTime() - streak * 24 * 60 * 60 * 1000);
    const entry = state[formatDayKey(date)];
    if (!entry?.complete) {
      return streak;
    }
    streak += 1;
  }
}
