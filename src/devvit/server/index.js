import { MemoryProposalStore } from "../../server/memoryProposalStore.js";
import { createSignalGardenApi } from "../../server/signalGardenApi.js";

const api = createSignalGardenApi({
  store: new MemoryProposalStore(),
});

export function fetch(request) {
  return api.handleRequest(request);
}

export default {
  fetch,
};

