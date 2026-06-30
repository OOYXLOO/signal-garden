import { context } from '@devvit/web/server';
import type { UiResponse } from '@devvit/web/shared';
import { Hono } from 'hono';
import { createPost } from '../core/post';

export const menu = new Hono();

menu.post('/post-create', async (c) => {
  try {
    const post = await createPost();

    return c.json<UiResponse>(
      {
        navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`
      },
      200
    );
  } catch (error) {
    console.error(`Error creating Signal Garden post: ${error}`);
    return c.json<UiResponse>(
      {
        showToast: 'Failed to create Signal Garden post'
      },
      400
    );
  }
});
