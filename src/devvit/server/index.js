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

const DEFAULT_POST_ENTRY = "default";
const POST_HEIGHT = "TALL";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function createDailyRelayPost() {
  const reddit = globalThis.signalGardenReddit;
  if (!reddit?.submitCustomPost) {
    return json({ showToast: "Devvit reddit API is not available in this local shell." }, 501);
  }

  try {
    const day = globalThis.signalGardenContext?.day || todayKey();
    const post = await reddit.submitCustomPost({
      title: `Signal Garden daily relay - ${day}`,
      entry: DEFAULT_POST_ENTRY,
      postData: {
        day,
        source: "signal-garden-menu",
      },
      textFallback:
        "Signal Garden is a daily relay puzzle. Open the custom post to route the signal, share a route, and compare community proposals.",
      userGeneratedContent: true,
      styles: {
        backgroundColor: "#111317FF",
        backgroundColorDark: "#111317FF",
        height: POST_HEIGHT,
      },
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
