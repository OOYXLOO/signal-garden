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

Last verified: 2026-06-30 16:15 +08

- `npm run type-check`: passed.
- `npm run build`: passed with Devvit/Vite warnings from the official plugin output.
- Browser smoke test against `dist/client/game.html` with local Chrome: passed.
- Canvas rendered at 868 x 628 in a 900 x 720 viewport.
- Buttons found: `New board`, `Hint`.
- Console errors: 0.
- `npm audit fix` cannot clear all findings without breaking Devvit template compatibility. Remaining audit findings are in the Devvit 0.13.5 dependency chain and require upstream fixes or a future controlled Devvit 1.0 migration.

## Next Integration Gates

1. Run `npm run login` / `npm run dev` in a user-present Reddit developer session.
2. Verify the app inside Reddit playtest.
3. Persist daily seed and score data through the Reddit app surface.
4. Add a short demo video and Devpost field pack.
5. Keep public repo text focused on the product, implementation, and player experience.
