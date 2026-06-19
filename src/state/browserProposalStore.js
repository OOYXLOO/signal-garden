const PROPOSAL_KEY = "signal-garden-proposals";

function readState() {
  try {
    return JSON.parse(window.localStorage.getItem(PROPOSAL_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeState(state) {
  window.localStorage.setItem(PROPOSAL_KEY, JSON.stringify(state));
}

export function createBrowserProposalStore() {
  return {
    async list(day) {
      const state = readState();
      return [...(state[day] || [])];
    },

    async save(proposal) {
      const state = readState();
      const existing = state[proposal.puzzleId] || [];
      const withoutDuplicate = existing.filter((item) => item.id !== proposal.id);
      const next = [proposal, ...withoutDuplicate].slice(0, 100);
      state[proposal.puzzleId] = next;
      writeState(state);
      return [...next];
    },
  };
}

