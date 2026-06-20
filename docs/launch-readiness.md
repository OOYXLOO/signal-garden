# Launch Readiness

This checklist keeps the project ready for a user-approved Devvit, Reddit, and Devpost submission pass. It does not perform login, publishing, posting, uploading, or account setup.

## Public Source Notes

- Event page: https://redditgameswithahook.devpost.com/
- Rules page: https://redditgameswithahook.devpost.com/rules
- Resources page: https://redditgameswithahook.devpost.com/resources

Observed public requirements and signals on 2026-06-20:

- Deadline shown publicly: July 15, 2026 at 6:00 PM PDT.
- Build target: a game on Devvit using Interactive Posts.
- Required submission evidence includes an app listing link and a public demo post link.
- Judging emphasizes easy-to-understand UX, polish, Reddit community fit, retention, user contributions, and mobile experience.
- Official resources point builders toward Devvit Web, the template library, example games, and community support.

## Local Evidence Ready

- `README.md`: project overview, local run, quality checks, and scope.
- `docs/submission-field-pack.md`: short description, long description, social loop, technical highlights, demo checklist.
- `docs/demo-script.md`: 60-90 second walkthrough plan.
- `docs/demo-final-captioned.webm`: current captioned demo candidate.
- `docs/cover.png`: gallery cover.
- `docs/desktop-preview.png`: desktop gallery preview.
- `docs/mobile-preview.png`: mobile gallery preview.
- `docs/devvit_shell_readiness.md`: Devvit shell status and account gates.
- `docs/gallery_assets.md`: asset inventory and guardrails.

## Local Verification Before Any User Gate

Run these from the project root:

```powershell
npm test
npm run check
npm run build:all
npm run audit:local
npm run audit:devvit
npm run audit:submission
npm audit --audit-level=moderate
```

Optional asset refresh:

```powershell
npm run record:demo:final
```

The optional recording command should only target `127.0.0.1` and write generated media into `docs/`.

## User-Present Gates

These steps require the account owner to be present and approving each action:

1. Create or select the public GitHub repository.
2. Push the current local repository state.
3. Run official Devvit setup and login.
4. Create or select a test community.
5. Run a real Devvit playtest.
6. Create a public demo post running the game.
7. Prepare the Devpost project page.
8. Upload or attach public media assets.
9. Submit the Devpost entry.

Do not automate account login, OTP, CAPTCHA, private console pages, billing, KYC, or settings changes.

## Submission Field Mapping

- Project name: `Signal Garden`
- Tagline: use `docs/submission-field-pack.md` short description.
- Description: use `docs/submission-field-pack.md` long description.
- Media:
  - Cover: `docs/cover.png`
  - Desktop: `docs/desktop-preview.png`
  - Mobile: `docs/mobile-preview.png`
  - Demo: `docs/demo-final-captioned.webm`
- Technical notes: use `Technical Highlights` from `docs/submission-field-pack.md`.
- Social loop notes: use `What Makes It Social` from `docs/submission-field-pack.md`.
- Demo post: add only after a user-approved public Reddit post exists.
- App listing: add only after a user-approved Devvit listing exists.

## Final Pre-Submit Check

- The first screen shows the daily board, objective chips, and move limit.
- A completed route turns all objectives complete.
- The briefing contains an exact review link.
- Archive rows with saved routes include Review links.
- The demo media does not show private pages, credentials, tokens, account consoles, or billing screens.
- The public repository text does not mention private goal tracking or financial intent.
