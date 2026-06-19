import assert from "node:assert/strict";
import { createFetchCommunityClient, createLocalCommunityClient } from "../src/client/communityClient.js";
import { createDailyPuzzle } from "../src/game/puzzle.js";
import { MemoryProposalStore } from "../src/server/memoryProposalStore.js";

const day = "2026-06-19";
const puzzle = createDailyPuzzle(new Date(`${day}T00:00:00.000Z`));

const localClient = createLocalCommunityClient({
  store: new MemoryProposalStore(),
  today: () => day,
  now: () => "2026-06-19T12:00:00.000Z",
});

const initial = await localClient.init();
assert.equal(initial.consensus.proposalCount, 0);

const saved = await localClient.submitProposal({
  day,
  author: "reader-local",
  plan: puzzle.solution,
  score: 999999,
});
assert.equal(saved.consensus.proposalCount, 1);
assert.equal(saved.consensus.completed, 1);
assert.notEqual(saved.proposal.score, 999999);

const fetchClient = createFetchCommunityClient({
  baseUrl: "https://example.test",
  fetchImpl: async (url, options = {}) => {
    if (url === "https://example.test/api/init?day=2026-06-19") {
      return Response.json({ type: "init", consensus: { proposalCount: 0 } });
    }
    if (url === "https://example.test/api/proposal" && options.method === "POST") {
      const body = JSON.parse(options.body);
      assert.equal(body.author, "reader-fetch");
      return Response.json({ type: "proposal", consensus: { proposalCount: 1 } });
    }
    return Response.json({ error: "not found" }, { status: 404 });
  },
});

assert.equal((await fetchClient.init(day)).type, "init");
assert.equal(
  (
    await fetchClient.submitProposal({
      day,
      author: "reader-fetch",
      plan: puzzle.solution,
    })
  ).consensus.proposalCount,
  1,
);

console.log("signal garden community client tests passed");

