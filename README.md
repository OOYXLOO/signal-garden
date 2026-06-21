# Signal Garden

Signal Garden is a daily community relay puzzle prototype built with Phaser.

Players place a small number of mirrors on a shared board, guide a signal through three beacons, and copy a compact briefing that can be used for community discussion or a later platform adapter.

## Local Run

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:8796/`.

## Quality Checks

```powershell
npm test
npm run check
npm run build
npm run build:devvit
npm run audit:local
npm run audit:devvit
npm run audit:pages
npm run export:submission-manifest -- --output docs/submission-manifest.json
npm run record:demo
npm run export:launch-packet -- --help
```

## Static Pages Deployment

The standard browser build uses relative asset paths so it can run from a project page such as `https://example.github.io/signal-garden/`.

```powershell
npm run build
npm run audit:pages
```

`.github/workflows/deploy-pages.yml` builds `dist/`, audits the artifact, and publishes it through GitHub Pages after the repository has Pages enabled for GitHub Actions.
After the public URL exists, run `npm run audit:public -- --base-url <public-app-url> --day <YYYY-MM-DD>` to verify the deployed page and sample-route review URL.
Then run `npm run export:submission-pack -- --public-app-url <public-app-url> --day <YYYY-MM-DD> --plan <review-plan-token> --app-listing-url <public-app-listing-url> --demo-post-url <public-demo-post-url>` to generate one copyable submission packet.

## Scope

- Browser-first Phaser game loop.
- Deterministic daily puzzle seed.
- Seven verified puzzle templates for a broader daily rotation.
- Objective progress chips for the three beacons and receiver.
- Daily missions that connect route tracing, proposal saving, relay completion, and the rival target.
- Return map that turns the recent seven-day archive into a visible retention loop with streak, draft, complete, and open day states.
- Local-only persistence with no credentials or private account data.
- Adapter-backed proposal consensus that ranks saved player plans.
- Top route ghosting that shows the current community route on the board without applying it.
- Top route rationale that explains why the current community route leads by completion, score, move count, tie-breaks, and contributor record.
- Contributor board that aggregates completed routes and best scores by author.
- Daily community recap copy for discussion posts or comment follow-ups.
- Comment challenge prompt that packages the current score, Review link, and top route context for reply threads.
- Reddit post draft export that prepares a title, body, route review link, community target, and first-comment prompt without posting.
- Developer feedback draft export that packages Devvit Web setup notes, Phaser static asset notes, mobile WebView checks, and comment-loop feedback without posting.
- Comment thread import that parses multiple pasted Review links into ranked community proposals while preserving lightweight author labels.
- Sample comment thread loader for instantly previewing the reply-thread import loop without manual URL assembly.
- Review snapshot export that packages the current route, community consensus, top saved route, and judge checks.
- Launch packet export that combines the demo post setup, Reddit fit checks, comment challenge, Reddit post draft, developer feedback draft, top route rationale, review snapshot, daily recap, and developer platform feedback notes in one copyable block.
- Launch packet CLI export for injecting user-approved public app listing, demo post, and review URLs after platform gates.
- GitHub Pages workflow and artifact audit for turning a pushed repository into a public static review surface.
- Public URL audit for checking the deployed page and `sample=1` review link before a submission pass.
- Submission pack export that combines public URL checks, submission fields, media checklist, and launch packet copy.
- Submission evidence manifest export with byte counts and SHA-256 hashes for public assets and source notes.
- A real "apply top proposal" flow: the UI applies the best saved community plan, not a hidden answer.
- Share links that reopen the same daily route for review or discussion, even after the default daily board changes.
- Sample route URLs with `?day=YYYY-MM-DD&sample=1` for first-minute reviewer walkthroughs before a final public Review link exists, including a labeled sample preview consensus when no proposal exists yet.
- Comment thread route import that turns pasted review links or briefings into ranked community proposals, with import counts, skip reasons for duplicate or cross-day routes, a one-click sample thread loader, and an explainable top route rationale after ranking.
- Recent local archive and streak state for the daily return loop, with review links for saved routes.
- Seven-day garden log that makes the return loop visible even before platform analytics exist.
- Briefing output that includes an exact review link whenever a route is present.
- Completion pulse feedback for solved boards.
- Short Web Audio cues with a persistent mute toggle.
- Replay route animation for the current plan.
- Status hints and board markers for blocked, lost, and partial routes.
- Route insight cards that explain the next useful adjustment after drafting, early receiver hits, blocked paths, or escaped signals.
- Optional progressive hints that reveal solution mirrors only when the player asks.
- Demo script, submission field pack, local silent WebM demo, captioned walkthrough draft, and final captioned demo candidate with explainable route feedback.
- Launch readiness checklist for user-approved platform submission gates.
- Server-shaped adapter for init, proposal submission, and archive reads.
- Devvit-style subreddit menu route for creating a daily relay post when a platform post helper is available.
- Devvit client entry uses the fetch-backed community client against the hosted origin.
- Redis-shaped proposal store and local Devvit shell build outputs for pre-account validation.

No production account setup, hosting configuration, or platform submission is performed by this repository.

## Dependency Note

The repository intentionally keeps official Devvit CLI packages out of normal dependencies until a live platform playtest is performed in an isolated, user-approved environment. The local shell is designed to keep the app buildable and testable without storing account tokens or platform credentials.

`npm run record:demo`, `npm run record:demo:captioned`, and `npm run record:demo:final` are optional and require Playwright to be available in the local Node environment. They record only the local app at `127.0.0.1`; they do not access platform accounts.
