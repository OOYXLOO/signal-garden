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

const { createGardenLog, createSampleGardenArchive, getLocalArchive, getLocalStreak, loadPlan, mergeGardenArchive, savePlan } = await import(`../src/state/store.js?case=${Date.now()}`);

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

const previewArchive = createSampleGardenArchive("2026-06-19");
assert.equal(previewArchive.length, 4);
assert.equal(previewArchive[0].id, "2026-06-19");
assert.equal(previewArchive[0].preview, true);
const mergedArchive = mergeGardenArchive(archive, previewArchive);
const previewLog = createGardenLog({
  currentPuzzleId: "2026-06-19",
  archive: mergedArchive,
  streak: 0,
});
assert.equal(previewLog.slots.length, 7);
assert.equal(previewLog.slots[0].preview, false);
assert.equal(previewLog.slots[1].preview, false);
assert.equal(previewLog.slots[3].preview, false);
assert.equal(previewLog.slots[4].preview, true);
assert.match(previewLog.slots[4].detail, /sample complete/);
const sampleRouteArchive = mergeGardenArchive(
  [
    {
      id: "2026-06-19",
      complete: true,
      status: "complete",
      score: 1012,
      beacons: 3,
      moves: 2,
      plan: [{ x: 2, y: 2, mirror: "backslash" }],
    },
  ],
  previewArchive,
);
assert.equal(createGardenLog({ currentPuzzleId: "2026-06-19", archive: sampleRouteArchive }).summary, "2-day complete streak");

console.log("signal garden local archive tests passed");
