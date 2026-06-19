import { createSignalGardenApi } from "../server/signalGardenApi.js";
import { createBrowserProposalStore } from "../state/browserProposalStore.js";

const LOCAL_ORIGIN = "http://signal-garden.local";

async function parseJsonResponse(response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with ${response.status}`);
  }
  return payload;
}

export function createFetchCommunityClient({ baseUrl = "", fetchImpl = fetch } = {}) {
  const root = baseUrl.replace(/\/+$/, "");
  return {
    async init(day) {
      const url = new URL(`${root || LOCAL_ORIGIN}/api/init`);
      if (day) {
        url.searchParams.set("day", day);
      }
      return parseJsonResponse(await fetchImpl(url.toString()));
    },

    async submitProposal({ day, plan, author }) {
      return parseJsonResponse(
        await fetchImpl(`${root || LOCAL_ORIGIN}/api/proposal`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ day, plan, author }),
        }),
      );
    },

    async archive(day) {
      return parseJsonResponse(await fetchImpl(`${root || LOCAL_ORIGIN}/api/archive/${encodeURIComponent(day)}`));
    },
  };
}

export function createLocalCommunityClient({ store = createBrowserProposalStore(), today, now } = {}) {
  const api = createSignalGardenApi({ store, today, now });
  return {
    init(day) {
      return api.init(day);
    },

    submitProposal(input) {
      return api.submitProposal(input);
    },

    archive(day) {
      return api.archive(day);
    },
  };
}

export function createCommunityClient(options = {}) {
  if (options.baseUrl) {
    return createFetchCommunityClient(options);
  }
  return createLocalCommunityClient(options);
}

