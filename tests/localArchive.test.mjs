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

const { getLocalArchive, getLocalStreak, loadPlan, savePlan } = await import(`../src/state/store.js?case=${Date.now()}`);

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
assert.equal(archive[1].complete, true);
assert.equal(archive[1].score, 140);
assert.equal(getLocalStreak("2026-06-18"), 1);

console.log("signal garden local archive tests passed");
