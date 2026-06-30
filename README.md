# Signal Garden

Signal Garden is a small daily puzzle game for Reddit interactive posts.

Current status:

```text
devvit_structure_builds_and_game_smoke_passes
```

Product idea:

```text
A daily cooperative Reddit puzzle where players route tiny signal tiles together, compare community scores, and return each day for a new board.
```

Current player-facing loop:

- Daily seed appears in the HUD.
- Move count and score update as the route changes.
- Local best score is stored per seed.
- Copy result creates a comment-ready score line for the thread.

Working rules:

- Keep the game small and playable in 30-90 seconds.
- Use Phaser for the game surface.
- Keep the simulation separate from the renderer.
- Build one strong game, not several weak ones.
- Do not commit secrets, credentials, tokens, cookies, private account details, or private user data.

## Local Commands

```powershell
npm install
npm run type-check
npm run build
npm run preview -- --port 4177
```

## Verification

Last verified: 2026-06-30 16:55 +08

- `npm run type-check`: passed.
- `npm test`: passed.
- `npm run build`: passed with Devvit/Vite warnings from the official plugin output.
- Browser smoke test against `dist/client/game.html` with local Chrome: passed.
- Canvas rendered at 868 x 628 in a 900 x 720 viewport.
- Buttons found: `New board`, `Hint`, `Copy result`.
- HUD found: daily seed, moves, score, best score.
- Copy result feedback was verified through browser DOM event dispatch.
- Share text formatter has unit coverage in `src/shared/sim.test.ts`.
- Console errors: 0.
- `npm audit fix` cannot clear all findings without breaking Devvit template compatibility. Remaining audit findings are in the Devvit 0.13.5 dependency chain and require upstream fixes or a future controlled Devvit 1.0 migration.

## Next Integration Gates

1. Run `npm run login` / `npm run dev` in a user-present Reddit developer session.
2. Verify the app inside Reddit playtest.
3. Persist daily seed and score data through the Reddit app surface.
4. Add a short demo video and Devpost field pack.
5. Keep public repo text focused on the product, implementation, and player experience.

Useful submission files:

- `docs/devpost-fields.md`
- `docs/devpost-final-fields-20260630.md`
- `docs/devvit-playtest-runbook-20260630.md`
- `docs/demo-script.md`
- `docs/submission-checklist.md`

Screenshots:

- `docs/screenshots/signal-garden-splash.png`
- `docs/screenshots/signal-garden-game.png`

Demo video:

- `docs/demo/signal-garden-demo.webm`
- `https://ooyxloo.github.io/oid-knowledge-lab/signal-garden-demo.html`
