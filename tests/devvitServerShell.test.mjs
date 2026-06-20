import assert from "node:assert/strict";

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
    const next = list.filter((item) => item.member !== entry.member);
    next.push({ member: entry.member, score: entry.score });
    next.sort((left, right) => left.score - right.score);
    this.sorted.set(key, next);
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

globalThis.signalGardenRedis = new FakeRedis();
const shell = await import(`../src/devvit/server/index.js?case=${Date.now()}`);

const response = await shell.fetch(
  new Request("http://local.test/api/proposal", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      day: "2026-06-19",
      author: "devvit-shell",
      plan: [
        { x: 3, y: 4, mirror: "slash" },
        { x: 3, y: 1, mirror: "slash" },
      ],
    }),
  }),
);
assert.equal(response.status, 200);
const result = await response.json();
assert.equal(result.type, "proposal");
assert.equal(result.consensus.proposalCount, 1);

const archiveResponse = await shell.fetch(new Request("http://local.test/api/archive/2026-06-19"));
const archive = await archiveResponse.json();
assert.equal(archive.consensus.proposalCount, 1);

let createdPostTitle = "";
globalThis.signalGardenContext = { subredditName: "signal-garden-test" };
globalThis.signalGardenReddit = {
  async submitCustomPost(input) {
    createdPostTitle = input.title;
    return { id: "abc123" };
  },
};
const menuResponse = await shell.fetch(
  new Request("http://local.test/internal/menu/post-create", {
    method: "POST",
  }),
);
assert.equal(menuResponse.status, 200);
const menu = await menuResponse.json();
assert.equal(createdPostTitle, "Signal Garden daily relay");
assert.equal(menu.navigateTo, "https://reddit.com/r/signal-garden-test/comments/abc123");

delete globalThis.signalGardenReddit;
const missingPlatformResponse = await shell.fetch(
  new Request("http://local.test/internal/menu/post-create", {
    method: "POST",
  }),
);
assert.equal(missingPlatformResponse.status, 501);
assert.match((await missingPlatformResponse.json()).showToast, /not available/);

delete globalThis.signalGardenRedis;
delete globalThis.signalGardenContext;

console.log("signal garden devvit server shell tests passed");
