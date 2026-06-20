import { MemoryProposalStore } from "../../server/memoryProposalStore.js";
import { createRedisProposalStore } from "../../server/redisProposalStore.js";
import { createSignalGardenApi } from "../../server/signalGardenApi.js";

function createStore() {
  if (globalThis.signalGardenRedis) {
    return createRedisProposalStore(globalThis.signalGardenRedis);
  }
  return new MemoryProposalStore();
}

const api = createSignalGardenApi({
  store: createStore(),
});

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

async function createDailyRelayPost() {
  const reddit = globalThis.signalGardenReddit;
  if (!reddit?.submitCustomPost) {
    return json({ showToast: "Devvit reddit API is not available in this local shell." }, 501);
  }

  try {
    const post = await reddit.submitCustomPost({
      title: "Signal Garden daily relay",
    });
    const subreddit = globalThis.signalGardenContext?.subredditName || "signal-garden";
    return json({
      navigateTo: `https://reddit.com/r/${subreddit}/comments/${post.id}`,
    });
  } catch {
    return json({ showToast: "Failed to create Signal Garden relay post." }, 400);
  }
}

export function fetch(request) {
  const url = new URL(request.url);
  if (request.method === "POST" && url.pathname === "/internal/menu/post-create") {
    return createDailyRelayPost();
  }
  return api.handleRequest(request);
}

export default {
  fetch,
};
