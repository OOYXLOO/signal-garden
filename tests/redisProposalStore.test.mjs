import assert from "node:assert/strict";
import { createDailyPuzzle } from "../src/game/puzzle.js";
import { createProposal } from "../src/game/proposals.js";
import { RedisProposalStore } from "../src/server/redisProposalStore.js";

class FakeRedis {
  constructor() {
    this.hashes = new Map();
    this.sorted = new Map();
  }

  async hSet(key, values) {
    const hash = this.hashes.get(key) || {};
    Object.assign(hash, values);
    this.hashes.set(key, hash);
  }

  async hGetAll(key) {
    return { ...(this.hashes.get(key) || {}) };
  }

  async hDel(key, fields) {
    const hash = this.hashes.get(key) || {};
    for (const field of fields) {
      delete hash[field];
    }
    this.hashes.set(key, hash);
  }

  async zAdd(key, entry) {
    const list = this.sorted.get(key) || [];
    const without = list.filter((item) => item.member !== entry.member);
    without.push({ member: entry.member, score: entry.score });
    without.sort((left, right) => left.score - right.score || left.member.localeCompare(right.member));
    this.sorted.set(key, without);
  }

  async zRange(key, start, stop) {
    return (this.sorted.get(key) || []).slice(start, stop + 1).map((item) => item.member);
  }

  async zCard(key) {
    return (this.sorted.get(key) || []).length;
  }

  async zRemRangeByRank(key, start, stop) {
    const list = this.sorted.get(key) || [];
    const remove = new Set(list.slice(start, stop + 1).map((item) => item.member));
    this.sorted.set(
      key,
      list.filter((item) => !remove.has(item.member)),
    );
  }
}

const day = "2026-06-19";
const puzzle = createDailyPuzzle(new Date(`${day}T00:00:00.000Z`));
const redis = new FakeRedis();
const store = new RedisProposalStore(redis, { limit: 2 });

const first = createProposal({
  puzzle,
  plan: [],
  author: "reader-a",
  createdAt: "2026-06-19T00:00:00.000Z",
});
const second = createProposal({
  puzzle,
  plan: puzzle.solution,
  author: "reader-b",
  createdAt: "2026-06-19T00:01:00.000Z",
});
const third = createProposal({
  puzzle,
  plan: puzzle.solution,
  author: "reader-c",
  createdAt: "2026-06-19T00:02:00.000Z",
});

await store.save(first);
await store.save(second);
assert.deepEqual(
  (await store.list(day)).map((proposal) => proposal.author),
  ["reader-a", "reader-b"],
);

await store.save(third);
assert.deepEqual(
  (await store.list(day)).map((proposal) => proposal.author),
  ["reader-b", "reader-c"],
);

const updatedSecond = {
  ...second,
  score: second.score + 1,
  createdAt: "2026-06-19T00:03:00.000Z",
};
await store.save(updatedSecond);
const afterUpdate = await store.list(day);
assert.equal(afterUpdate.length, 2);
assert.equal(afterUpdate.find((proposal) => proposal.id === second.id).score, updatedSecond.score);

console.log("signal garden redis proposal store tests passed");

