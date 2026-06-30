# Submission Checklist

## Code

- `npm install`
- `npm test`
- `npm run type-check`
- `npm run build`
- Browser smoke test `dist/client/game.html`
- Confirm console errors are 0

## Reddit Developer Playtest

- `npm run login`
- `npm run dev`
- Confirm splash entrypoint opens
- Confirm game entrypoint opens
- Confirm Create Signal Garden post menu item works
- Confirm today's board is playable inside Reddit
- Confirm score/result text can be copied or displayed

## Public Repo

- Push neutral repository to `OOYXLOO/signal-garden`
- Confirm README contains no local paths or non-public notes
- Confirm `.env`, `node_modules`, `dist`, and build info are absent
- Confirm no credentials, cookies, tokens, payment data, or private account details are committed

## Devpost

- Project name: `Signal Garden`
- Add public repository URL:
  - `https://github.com/OOYXLOO/signal-garden/tree/codex/devvit-phaser-prototype`
- Add public demo video page:
  - `https://ooyxloo.github.io/oid-knowledge-lab/signal-garden-demo.html`
- Add direct demo video URL if needed:
  - `https://ooyxloo.github.io/oid-knowledge-lab/assets/signal-garden-demo.webm`
- Add screenshots:
  - `https://ooyxloo.github.io/oid-knowledge-lab/assets/signal-garden-splash.png`
  - `https://ooyxloo.github.io/oid-knowledge-lab/assets/signal-garden-game.png`
- Add built-with tags: Devvit, Phaser, TypeScript, Vite, Hono
- Explain the hook: daily seeded board, comments compare routes, return tomorrow
- Use `docs/devpost-final-fields-20260630.md` as the current field pack.

## Before Final Submit

- Re-check official rules and eligibility
- Re-check deadline
- Verify the app is accessible to judges
- Keep all public language focused on product, implementation, and player experience
