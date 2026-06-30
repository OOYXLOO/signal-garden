export type InitResponse = {
  type: 'init';
  postId: string;
  username: string;
  seed: number;
};

export function resolveInitSeed(payload: unknown, fallbackSeed: number): number {
  if (!payload || typeof payload !== 'object') {
    return fallbackSeed;
  }

  const seed = (payload as { seed?: unknown }).seed;
  return typeof seed === 'number' && Number.isInteger(seed) && seed > 0 ? seed : fallbackSeed;
}

export function shouldRequestInit(hostname: string): boolean {
  return hostname !== '127.0.0.1' && hostname !== 'localhost';
}
