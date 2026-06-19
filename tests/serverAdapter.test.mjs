import assert from "node:assert/strict";
import { createDailyPuzzle } from "../src/game/puzzle.js";
import { MemoryProposalStore } from "../src/server/memoryProposalStore.js";
import { createSignalGardenApi } from "../src/server/signalGardenApi.js";

const day = "2026-06-19";
const puzzle = createDailyPuzzle(new Date(`${day}T00:00:00.000Z`));
const store = new MemoryProposalStore();
const api = createSignalGardenApi({
  store,
  today: () => day,
  now: () => "2026-06-19T10:00:00.000Z",
});

const init = await api.init();
assert.equal(init.type, "init");
assert.equal(init.puzzle.id, day);
assert.equal(init.consensus.proposalCount, 0);

const forgedScore = await api.handleRequest(
  new Request("http://local.test/api/proposal", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      day,
      author: "reader-a",
      score: 999999,
      plan: puzzle.solution,
    }),
  }),
);
assert.equal(forgedScore.status, 200);
const proposalResponse = await forgedScore.json();
assert.equal(proposalResponse.type, "proposal");
assert.equal(proposalResponse.proposal.complete, true);
assert.notEqual(proposalResponse.proposal.score, 999999);
assert.equal(proposalResponse.consensus.proposalCount, 1);

const archiveResponse = await api.handleRequest(new Request(`http://local.test/api/archive/${day}`));
assert.equal(archiveResponse.status, 200);
const archive = await archiveResponse.json();
assert.equal(archive.type, "archive");
assert.equal(archive.consensus.completed, 1);
assert.equal(archive.payload.best.complete, true);

const badArchive = await api.handleRequest(new Request("http://local.test/api/archive/not-a-day"));
assert.equal(badArchive.status, 400);

console.log("signal garden server adapter tests passed");

