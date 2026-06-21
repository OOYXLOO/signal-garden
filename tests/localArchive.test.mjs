import assert from "node:assert/strict";

const state = new Map();
globalThis.window = {
  localStorage: {
    getItem(key) {
      return state.get(key) || null;
    },
    setItem(key, value) {
      state.set(key, value);
    },
  },
};

const { createGardenLog, getLocalArchive, getLocalStreak, loadPlan, savePlan } = await import(`../src/state/store.js?case=${Date.now()}`);

savePlan(
  "2026-06-18",
  [{ x: 1, y: 2, mirror: "slash" }],
  {
    complete: true,
    status: "complete",
    score: 140,
    hitBeacons: ["1,1", "2,2"],
  },
);
savePlan("2026-06-19", [], {
  complete: false,
  status: "blocked",
  score: 20,
  hitBeacons: [],
});

assert.deepEqual(loadPlan("2026-06-18"), [{ x: 1, y: 2, mirror: "slash" }]);
const archive = getLocalArchive("2026-06-19");
assert.equal(archive.length, 2);
assert.equal(archive[0].id, "2026-06-19");
assert.equal(archive[0].status, "blocked");
assert.deepEqual(archive[0].plan, []);
assert.equal(archive[1].complete, true);
assert.equal(archive[1].score, 140);
assert.deepEqual(archive[1].plan, [{ x: 1, y: 2, mirror: "slash" }]);
assert.equal(getLocalStreak("2026-06-18"), 1);
assert.equal(getLocalStreak("2026-06-19"), 0);

const log = createGardenLog({
  currentPuzzleId: "2026-06-19",
  archive,
  streak: getLocalStreak("2026-06-19"),
});
assert.equal(log.slots.length, 7);
assert.equal(log.slots[0].id, "2026-06-19");
assert.equal(log.slots[0].label, "Today");
assert.equal(log.slots[0].state, "open");
assert.equal(log.slots[0].value, "Open");
assert.equal(log.slots[1].id, "2026-06-18");
assert.equal(log.slots[1].label, "Yesterday");
assert.equal(log.slots[1].state, "complete");
assert.equal(log.slots[1].value, "140 pts");
assert.equal(log.summary, "1/7 recent days complete");
assert.deepEqual(createGardenLog({ currentPuzzleId: "not-a-day", archive }).slots, []);

console.log("signal garden local archive tests passed");
