const DEFAULT_LIMIT = 100;

function proposalHashKey(day) {
  return `signal-garden:proposals:${day}`;
}

function proposalIndexKey(day) {
  return `signal-garden:proposal-index:${day}`;
}

function createdAtScore(proposal) {
  const score = Date.parse(proposal.createdAt);
  return Number.isFinite(score) ? score : Date.now();
}

export class RedisProposalStore {
  constructor(redis, { limit = DEFAULT_LIMIT } = {}) {
    if (!redis) {
      throw new Error("redis is required");
    }
    this.redis = redis;
    this.limit = limit;
  }

  async list(day) {
    const ids = await this.redis.zRange(proposalIndexKey(day), 0, this.limit - 1, { by: "rank" });
    const records = await this.redis.hGetAll(proposalHashKey(day));
    return ids
      .map((id) => records[id])
      .filter(Boolean)
      .map((value) => JSON.parse(value));
  }

  async save(proposal) {
    const hashKey = proposalHashKey(proposal.puzzleId);
    const indexKey = proposalIndexKey(proposal.puzzleId);

    await this.redis.hSet(hashKey, { [proposal.id]: JSON.stringify(proposal) });
    await this.redis.zAdd(indexKey, { member: proposal.id, score: createdAtScore(proposal) });
    await this.trim(proposal.puzzleId);
    return this.list(proposal.puzzleId);
  }

  async trim(day) {
    const indexKey = proposalIndexKey(day);
    const hashKey = proposalHashKey(day);
    const count = await this.redis.zCard(indexKey);
    const overflow = count - this.limit;
    if (overflow <= 0) {
      return;
    }

    const staleIds = await this.redis.zRange(indexKey, 0, overflow - 1, { by: "rank" });
    if (!staleIds.length) {
      return;
    }

    await this.redis.zRemRangeByRank(indexKey, 0, overflow - 1);
    await this.redis.hDel(hashKey, staleIds);
  }
}

export function createRedisProposalStore(redis, options) {
  return new RedisProposalStore(redis, options);
}

