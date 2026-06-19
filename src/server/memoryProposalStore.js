export class MemoryProposalStore {
  constructor(initialState = {}) {
    this.state = new Map(
      Object.entries(initialState).map(([day, proposals]) => [day, [...proposals]]),
    );
  }

  async list(day) {
    return [...(this.state.get(day) || [])];
  }

  async save(proposal) {
    const existing = this.state.get(proposal.puzzleId) || [];
    const withoutDuplicate = existing.filter((item) => item.id !== proposal.id);
    const next = [proposal, ...withoutDuplicate].slice(0, 100);
    this.state.set(proposal.puzzleId, next);
    return [...next];
  }

  async days() {
    return [...this.state.keys()].sort();
  }
}

