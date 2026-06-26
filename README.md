# Signal Garden

Signal Garden is a daily community relay puzzle prototype built with Phaser.

Players place a small number of mirrors on a shared board, guide a signal through three beacons, and copy a compact briefing that can be used for community discussion or a later platform adapter.

## Reviewer Quickstart

Public app: https://ooyxloo.github.io/signal-garden/

1. Open the deployed app, or run the local dev server below.
2. Use a current sample route URL such as `?day=YYYY-MM-DD&sample=1` to load a complete review path without manual moves.
3. Check the Reviewer loop panel for sample route, current review link, proposal ranking, and launch packet readiness.
4. Load the sample comment thread to see linked routes and coordinate-only route comments become ranked proposals.
5. Copy the Launch packet or Evidence receipt when a platform submission needs the public app, source repository, app listing, and demo post fields.

For a one-page public review desk, open `https://ooyxloo.github.io/signal-garden/judge.html`.

See `docs/public-verification.md` for the current public deployment, source, and check status.
See `docs/criteria-fit.md` for the public rules-to-evidence map used during submission review.
See `docs/devpost-field-pack.md` for a concise copyable field pack generated from the current public URLs.
See `docs/launch-proof-template.md` for the public evidence template used to turn the demo into a reviewer-ready launch proof pack.
See `docs/reviewer-share-card.md` for a compact share card, captions, first-comment CTA, and public review links for demo posts.
See `docs/batch-submission-desk.md` for the account-owner gate order, copy blocks, and safety boundaries.

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
npm run audit:release
npm run audit:feedback-gate -- --day <YYYY-MM-DD> --sample-route --username <name>
npm run export:platform-feedback -- --day 2026-06-19 --sample-route --review-base-url <public-app-url>
npm run export:batch-submission-desk -- --day <YYYY-MM-DD> --output docs/batch-submission-desk.md
npm run export:devpost-fields -- --public-app-url <public-app-url> --source-repo-url <public-source-repo-url> --day <YYYY-MM-DD>
npm run export:reviewer-share-card -- --day <YYYY-MM-DD> --sample-route --public-app-url <public-app-url> --source-repo-url <public-source-repo-url>
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
Then run `npm run export:submission-pack -- --public-app-url <public-app-url> --day <YYYY-MM-DD> --plan <review-plan-token> --source-repo-url <public-source-repo-url> --app-listing-url <public-app-listing-url> --demo-post-url <public-demo-post-url>` to generate one copyable submission packet.
If a final review token has not been copied yet, use `npm run export:submission-pack -- --public-app-url <public-app-url> --day <YYYY-MM-DD> --sample-route --source-repo-url <public-source-repo-url> --app-listing-url <public-app-listing-url> --demo-post-url <public-demo-post-url>` to generate the packet with the built-in complete review route.

For a repository publish pass after the GitHub repository exists:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/github-pages-release-check.ps1 -SetOrigin -Push
```

After GitHub Pages is live, add `-PublicAudit` to verify the public page and sample route.

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
- Platform feedback export that turns the same integration lessons into copyable field answers plus short, medium, and long single-field versions without posting.
- Comment thread import that parses multiple pasted Review links or short coordinate routes into ranked community proposals while preserving lightweight author labels.
- Sample comment thread loader for instantly previewing the reply-thread import loop without manual URL assembly.
- Review snapshot export that packages the current route, community consensus, top saved route, and judge checks.
- Rubric evidence matrix that maps the daily return, progression, daily challenge, community contribution, and evolving-content loop to public proof files.
- Launch packet export that combines the demo post setup, Reddit fit checks, comment challenge, Reddit post draft, developer feedback draft, top route rationale, review snapshot, daily recap, and developer platform feedback notes in one copyable block.
- Launch packet CLI export for injecting user-approved public app listing, demo post, and review URLs after platform gates.
- Platform feedback CLI export for preparing user-approved developer/platform feedback after the public app URL exists.
- GitHub Pages workflow and artifact audit for turning a pushed repository into a public static review surface.
- Public URL audit for checking the deployed page and `sample=1` review link before a submission pass.
- Public judge desk that links the playable app, today's sample route, source repository, final captioned demo, media evidence kit, copyable evidence packet, manifest, and handoff docs from one static page.
- Criteria fit brief that maps public hackathon signals to concrete product evidence and remaining platform gates.
- Devpost field pack export that turns the public app, source repository, judge desk, criteria brief, and current gate status into concise copyable form fields.
- Release gate audit that reports local release readiness, infers the GitHub Pages app URL and source repository from `origin`, and marks listing/demo post gates as ready, waiting, or blocked.
- Submission pack export that combines public URL checks, source repository evidence, submission fields, media checklist, launch packet copy, and an optional built-in sample review route.
- Batch submission desk export that puts account-owner open order, copy blocks, remaining platform gates, and no-secret safety boundaries on one page.
- Submission evidence manifest export with byte counts and SHA-256 hashes for public assets and source notes.
- Launch proof template for turning the playable app, judge desk, source, media, and remaining public gates into a reviewer-ready evidence pack.
- Reviewer share card export that produces Markdown, JSON, and SVG share assets for public demo posts and first-minute review.
- A real "apply top proposal" flow: the UI applies the best saved community plan, not a hidden answer.
- Share links that reopen the same daily route for review or discussion, even after the default daily board changes.
- Sample route URLs with `?day=YYYY-MM-DD&sample=1` for first-minute reviewer walkthroughs before a final public Review link exists, including a labeled multi-contributor sample preview consensus and sample week preview when no proposal or archive exists yet.
- Comment thread route import that turns pasted review links, briefings, or short coordinate replies such as `r3c3\ r7c3\` into ranked community proposals, with import counts, skip reasons for duplicate or cross-day routes, a one-click sample thread loader, and an explainable top route rationale after ranking.
- Submission readiness panel that summarizes the playable board, sample route, current Review link, public app URL status, return map, contribution loop, launch packet, and remaining platform URL placeholders in one copyable checklist.
- Submission window proof that carries the current rules deadline into the reviewer fast path, readiness checklist, and evidence receipt.
- Recent local archive and streak state for the daily return loop, with review links for saved routes.
- Seven-day garden log with sample week preview that makes the return loop visible even before platform analytics exist.
- Return pledge card that turns today's solved, partial, or sample archive state into a next-day invite prompt for the thread.
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

See `docs/devvit_dependency_watch.md` for the current npm package snapshot and isolated audit rationale. As of 2026-06-26, `devvit@0.13.5` still brings a vulnerable CLI dependency chain, while `devvit@1.0.0` is a deprecated placeholder and does not provide a matching `@devvit/public-api@1.0.0`.

`npm run record:demo`, `npm run record:demo:captioned`, and `npm run record:demo:final` are optional and require Playwright to be available in the local Node environment. They record only the local app at `127.0.0.1`; they do not access platform accounts.
