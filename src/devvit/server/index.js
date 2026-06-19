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

export function fetch(request) {
  return api.handleRequest(request);
}

export default {
  fetch,
};
