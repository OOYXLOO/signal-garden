import { context, reddit } from '@devvit/web/server';
import { Hono } from 'hono';
import type { InitResponse } from '../../shared/api';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const api = new Hono();

api.get('/init', async (c) => {
  const { postId } = context;

  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required but missing from context'
      },
      400
    );
  }

  const username = await reddit.getCurrentUsername();
  const now = new Date();
  const seed = Number(`${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`);

  return c.json<InitResponse>({
    type: 'init',
    postId,
    username: username ?? 'anonymous',
    seed
  });
});
