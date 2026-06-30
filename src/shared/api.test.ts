import { describe, expect, it } from 'vitest';
import { resolveInitSeed, shouldRequestInit } from './api';

describe('resolveInitSeed', () => {
  it('uses a positive integer seed from the Devvit init response', () => {
    expect(resolveInitSeed({ type: 'init', postId: 'abc', username: 'yxl', seed: 20260701 }, 20260630)).toBe(20260701);
  });

  it('falls back when the init response seed is missing or invalid', () => {
    expect(resolveInitSeed({ type: 'init', postId: 'abc', username: 'yxl', seed: -1 }, 20260630)).toBe(20260630);
    expect(resolveInitSeed(null, 20260630)).toBe(20260630);
  });
});

describe('shouldRequestInit', () => {
  it('skips the Devvit init API on local static preview hosts', () => {
    expect(shouldRequestInit('127.0.0.1')).toBe(false);
    expect(shouldRequestInit('localhost')).toBe(false);
  });

  it('requests the Devvit init API on non-local hosts', () => {
    expect(shouldRequestInit('developers.reddit.com')).toBe(true);
    expect(shouldRequestInit('signal-garden.reddit.dev')).toBe(true);
  });
});
