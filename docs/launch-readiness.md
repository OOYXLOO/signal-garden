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
- Launch packet export in the app: demo post setup, app listing placeholder, Reddit fit checks, comment challenge, Reddit post draft, developer feedback draft, top route rationale, review snapshot, daily recap, and developer platform feedback topics.
- Submission readiness panel in the app: playable board, sample route, Review link, public app URL status, return map, contribution loop, launch packet, and remaining platform URL placeholders in one copyable checklist.
- Evidence receipt in the app and exported submission pack: gameplay proof, route proof, community proof, retention proof, launch handoff proof, public URL evidence slots, and safety boundary claims.
- Seven-day return map in the Loop panel: visible local archive, streak, complete, draft, open day states, and non-persistent sample week preview for retention review.
- `docs/demo-final-captioned.webm`: current 53-second captioned demo candidate.
- `docs/cover.png`: gallery cover.
- `docs/desktop-preview.png`: desktop gallery preview.
- `docs/mobile-preview.png`: mobile gallery preview.
- `docs/devvit_shell_readiness.md`: Devvit shell status and account gates.
- `docs/devvit_dependency_watch.md`: current Devvit npm package snapshot and isolated dependency audit rationale.
- `docs/gallery_assets.md`: asset inventory and guardrails.
- `docs/submission-manifest.json`: deterministic file manifest with byte counts and SHA-256 hashes for the public evidence packet.
- `.github/workflows/deploy-pages.yml`: GitHub Pages deployment workflow for the static browser build.
- `scripts/audit-pages-build.mjs`: checks that the built static artifact uses project-page-safe relative asset paths.
- `scripts/audit-public-url.mjs`: checks the deployed public URL and `sample=1` reviewer walkthrough URL after a public app URL exists.
- `scripts/audit-release-gates.mjs`: reports local release readiness and marks the repository, public app URL, source repository URL, app listing URL, and demo post URL gates as ready, waiting, or blocked. If `origin` points to the expected GitHub repository, the source repository URL is inferred from origin.
- `scripts/export-submission-pack.mjs`: generates one final copyable submission packet after public URLs exist, including a Gate Runbook for the ordered public evidence pass.
- `scripts/github-pages-release-check.ps1`: runs the local quality checks, can set the GitHub remote after the repository exists, can push the current branch, and can audit the public Pages URL after it is live.

## Local Verification Before Any User Gate

Run these from the project root:

```powershell
npm test
npm run check
npm run build:all
npm run audit:local
npm run audit:devvit
npm run build
npm run audit:pages
npm run audit:release
npm run audit:public -- --base-url <public-app-url> --day <YYYY-MM-DD>
npm run export:submission-pack -- --public-app-url <public-app-url> --day <YYYY-MM-DD> --plan <review-plan-token> --source-repo-url <public-source-repo-url> --app-listing-url <public-app-listing-url> --demo-post-url <public-demo-post-url>
npm run export:submission-pack -- --public-app-url <public-app-url> --day <YYYY-MM-DD> --sample-route --source-repo-url <public-source-repo-url> --app-listing-url <public-app-listing-url> --demo-post-url <public-demo-post-url>
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
npm run export:launch-packet -- --day 2026-06-21 --plan <review-plan-token> --review-base-url <public-app-url> --source-repo-url <public-source-repo-url> --app-listing-url <public-app-listing-url> --demo-post-url <public-demo-post-url> --strict
```

`--strict` fails if the route, review URL, app listing URL, or demo post URL is missing or points to localhost.

After the GitHub repository exists, the release helper can run the local checks and push the current branch:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/github-pages-release-check.ps1 -SetOrigin -Push
```

After GitHub Pages is live, verify the deployed page and sample route:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/github-pages-release-check.ps1 -PublicAudit
```

For a quick reviewer walkthrough before a copied Review link exists, open the public app with a sample route:

```text
<public-app-url>?day=2026-06-21&sample=1
```

The app turns that sample route into the same briefing, review snapshot, comment challenge, top route rationale, return map, and launch packet surfaces as a manually traced route. If no community proposal exists yet, the page shows a clearly labeled sample preview consensus and sample week preview without writing either preview to saved proposal storage. The `Load sample thread` control also fills the comment import box with a complete route, a partial route, a cross-day route, and a duplicate route so a reviewer can preview the reply-thread import loop without manually assembling URLs. Short coordinate replies such as `r3c3\ r7c3\` can also be imported when a player replies without a full Review link.

## Static Review Surface

The browser build is ready for a repository-page path such as `https://<owner>.github.io/signal-garden/`.

- `vite.config.js` uses relative asset paths for the standard static build.
- `.github/workflows/deploy-pages.yml` builds `dist/` and deploys it through GitHub Pages when the repository is configured for GitHub Actions Pages.
- `npm run audit:pages` fails if `dist/index.html` contains root-relative asset URLs that would break on a project page.
- `npm run audit:release -- --json` reports which local release checks are ready and which public platform gates are still waiting.
- `npm run audit:public -- --base-url <public-app-url> --day <YYYY-MM-DD>` fails if the deployed page or its `sample=1` route is unavailable or looks like an error page.
- `npm run export:submission-pack -- --public-app-url <public-app-url> --day <YYYY-MM-DD> --plan <review-plan-token> --source-repo-url <public-source-repo-url> --app-listing-url <public-app-listing-url> --demo-post-url <public-demo-post-url>` creates the final copyable packet after public URL checks pass.
- `npm run export:submission-pack -- --public-app-url <public-app-url> --day <YYYY-MM-DD> --sample-route --source-repo-url <public-source-repo-url> --app-listing-url <public-app-listing-url> --demo-post-url <public-demo-post-url>` creates the same packet with the built-in complete review route when a final route token has not been copied yet.
- The exported `Gate Runbook` section orders the public app check, sample route check, exact Review link check, source repository check, app listing URL, demo post URL, media attachments, and final audit commands.

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

Do not automate account login, human verification, private console pages, billing, identity checks, or settings changes.

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
- Reddit post draft: copy only after the user is ready to create a public demo post; the app generates text but does not post it.
- Developer feedback draft: copy only after the user is ready to submit public platform feedback; the app generates text but does not submit it.
- Final launch packet: use `npm run export:launch-packet -- --strict` with public app, source repository, app listing, and demo post URLs after real public URLs exist.
- Final submission packet: use `npm run export:submission-pack` after the public app, source repository, app listing, and demo post exist; pass either a copied route token with `--plan` or the built-in complete review route with `--sample-route`.
- Evidence receipt: copy the app receipt or the `Evidence Receipt` section from the exported submission pack as a compact reviewer proof block.
- Gate runbook: use the `Gate Runbook` section from the exported submission packet as the final public evidence checklist.
- Submission manifest: refresh `docs/submission-manifest.json` after media or copy changes, then run `npm run audit:submission`.
- Demo post: add only after a user-approved public Reddit post exists.
- App listing: add only after a user-approved Devvit listing exists.
- Source repository: add only after the user-approved repository exists and the intended review branch is pushed.

## Final Pre-Submit Check

- The first screen shows the daily board, objective chips, and move limit.
- Daily missions show route tracing, proposal saving, relay completion, and rival target progress.
- The return map shows a seven-day local archive with complete, draft, and open day states; `sample=1` can add a clearly labeled sample week preview without persisting fake archive data.
- A saved or imported top route appears as a low-contrast board ghost before it is applied.
- The top route rationale explains why the current route leads, including completion, score, move count, tie-breaks, and contributor record.
- A completed route turns all objectives complete.
- The briefing contains an exact review link.
- `?day=YYYY-MM-DD&sample=1` loads a complete sample route without keeping the sample flag in copied Review links.
- Empty local consensus plus `sample=1` shows a sample preview top route and contributor row without claiming live community data.
- A pasted review link, briefing, or short coordinate reply can be imported as a community proposal.
- The sample comment thread loader produces a visible import summary with duplicate and cross-day skip reasons.
- The comment challenge prompt includes the current Review link and score context for a reply thread.
- The Reddit post draft includes a title, body, route review link or sample route, community target, and first-comment prompt.
- The developer feedback draft includes Devvit Web setup notes, Phaser static asset notes, dependency hygiene observations, mobile WebView checks, public review-link flow, and comment-loop feedback.
- The submission readiness panel marks the sample route, route link, public app URL, return map, contribution loop, launch packet, and platform URL placeholders clearly.
- The evidence receipt summarizes public URL evidence slots plus gameplay, route, community, retention, handoff, and safety proof claims.
- The launch packet includes demo post/app listing placeholders, Reddit fit checks, comment challenge, review snapshot, daily recap, and developer platform feedback topics.
- The contributor board and daily recap update after saved or imported routes.
- Archive rows with saved routes include Review links.
- The Devvit client entry uses same-origin server routes for proposal consensus.
- The Devvit splash entry requests expanded mode for the `game` entrypoint and still falls back to `game.html` in a normal browser.
- The Devvit client build uses relative asset paths, avoiding root `/assets` assumptions in WebView static hosting.
- The official Devvit CLI/API packages remain outside normal dependencies until the dependency chain passes an isolated audit or a user-approved playtest requires them.
- The standard static build uses relative asset paths, avoiding root `/assets` assumptions on GitHub Pages project URLs.
- The public URL audit passes for both the base app URL and the `sample=1` reviewer walkthrough URL.
- The exported submission pack contains public URLs, source repository evidence, submission fields, media assets, demo checklist, and launch packet copy.
- The exported submission pack contains an Evidence Receipt section with public URL evidence slots and proof claims for gameplay, route, community, retention, handoff, and safety boundaries.
- The exported submission pack contains a Gate Runbook that keeps public evidence checks in the right order.
- The Devvit shell includes the same reviewer fast path, launch packet, review snapshot, missions, and rival target DOM contracts as the browser page.
- The Devvit menu endpoint can return `navigateTo` when a platform post helper is injected.
- The demo media does not show private pages, credentials, tokens, account consoles, or billing screens.
- The public repository text stays focused on Signal Garden project evidence.
