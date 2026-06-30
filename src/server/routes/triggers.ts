import { context } from '@devvit/web/server';
import type { OnAppInstallRequest, TriggerResponse } from '@devvit/web/shared';
import { Hono } from 'hono';
import { createPost } from '../core/post';

export const triggers = new Hono();

triggers.post('/on-app-install', async (c) => {
  try {
    const post = await createPost();
    const input = await c.req.json<OnAppInstallRequest>();

    return c.json<TriggerResponse>(
      {
        status: 'success',
        message: `Signal Garden post created in r/${context.subredditName} with id ${post.id} (trigger: ${input.type})`
      },
      200
    );
  } catch (error) {
    console.error(`Error creating Signal Garden post: ${error}`);
    return c.json<TriggerResponse>(
      {
        status: 'error',
        message: 'Failed to create Signal Garden post'
      },
      400
    );
  }
});
