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
- `docs/demo-script.md`: under-60-second walkthrough plan.
- Launch packet export in the app: demo post setup, app listing placeholder, Reddit fit checks, comment challenge, review snapshot, daily recap, and developer platform feedback topics.
- `docs/demo-final-captioned.webm`: current 53-second captioned demo candidate.
- `docs/cover.png`: gallery cover.
- `docs/desktop-preview.png`: desktop gallery preview.
- `docs/mobile-preview.png`: mobile gallery preview.
- `docs/devvit_shell_readiness.md`: Devvit shell status and account gates.
- `docs/gallery_assets.md`: asset inventory and guardrails.
- `docs/submission-manifest.json`: deterministic file manifest with byte counts and SHA-256 hashes for the public evidence packet.

## Local Verification Before Any User Gate

Run these from the project root:

```powershell
npm test
npm run check
npm run build:all
npm run audit:local
npm run audit:devvit
npm run export:submission-manifest -- --output docs/submission-manifest.json
npm run audit:submission
npm audit --audit-level=moderate
```

`npm run audit:submission` checks that the final captioned demo stays at or below 60 seconds.
It also recomputes the submission manifest hashes so the evidence packet fails closed if an asset changes after export.

Optional asset refresh:

```powershell
npm run record:demo:final
```

The optional recording command should only target `127.0.0.1` and write generated media into `docs/`.

After the user-approved app listing and public demo post exist, generate a final copyable launch packet with real public URLs:

```powershell
npm run export:launch-packet -- --day 2026-06-21 --plan <review-plan-token> --review-base-url <public-app-url> --app-listing-url <public-app-listing-url> --demo-post-url <public-demo-post-url> --strict
```

`--strict` fails if the route, review URL, app listing URL, or demo post URL is missing or points to localhost.

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
- Demo discussion packet: copy the app launch packet after a complete route exists.
- Final launch packet: use `npm run export:launch-packet -- --strict` after real public URLs exist.
- Submission manifest: refresh `docs/submission-manifest.json` after media or copy changes, then run `npm run audit:submission`.
- Demo post: add only after a user-approved public Reddit post exists.
- App listing: add only after a user-approved Devvit listing exists.

## Final Pre-Submit Check

- The first screen shows the daily board, objective chips, and move limit.
- Daily missions show route tracing, proposal saving, relay completion, and rival target progress.
- A saved or imported top route appears as a low-contrast board ghost before it is applied.
- A completed route turns all objectives complete.
- The briefing contains an exact review link.
- A pasted review link or briefing can be imported as a community proposal.
- The comment challenge prompt includes the current Review link and score context for a reply thread.
- The launch packet includes demo post/app listing placeholders, Reddit fit checks, comment challenge, review snapshot, daily recap, and developer platform feedback topics.
- The contributor board and daily recap update after saved or imported routes.
- Archive rows with saved routes include Review links.
- The Devvit client entry uses same-origin server routes for proposal consensus.
- The Devvit splash entry requests expanded mode for the `game` entrypoint and still falls back to `game.html` in a normal browser.
- The Devvit client build uses relative asset paths, avoiding root `/assets` assumptions in WebView static hosting.
- The Devvit menu endpoint can return `navigateTo` when a platform post helper is injected.
- The demo media does not show private pages, credentials, tokens, account consoles, or billing screens.
- The public repository text does not mention private planning context.
