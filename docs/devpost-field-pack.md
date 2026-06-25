# Signal Garden Devpost Field Pack

Generated for day: 2026-06-26

## Project Name

Signal Garden

## Tagline

Signal Garden is a daily Phaser relay puzzle where players place mirrors, guide one signal through three beacons, and turn each route into a community proposal.

## Project URL Fields

- Public app: https://ooyxloo.github.io/signal-garden/
- Sample route: https://ooyxloo.github.io/signal-garden/?day=2026-06-26&sample=1
- Judge desk: https://ooyxloo.github.io/signal-garden/judge.html
- Source repository: https://github.com/OOYXLOO/signal-garden
- Criteria fit brief: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/criteria-fit.md
- Devvit app listing: <add after platform gate>
- Public demo post: <add after user-approved Reddit post>
- Video: attach `docs/demo-final-captioned.webm` or add final public video URL

## Short Description

Signal Garden is a daily Phaser relay puzzle where players place mirrors, guide one signal through three beacons, and turn each route into a community proposal.

## Long Description

Signal Garden explores a daily community puzzle loop for Reddit-style surfaces. A deterministic board appears each day with a source, receiver, blockers, three beacons, and a five-move limit. Players place mirrors to route the signal, then save the route as a proposal.

The proposal layer recomputes scores from the shared puzzle rules instead of trusting client-provided values. Saved proposals are ranked by completion, score, and move count, contributors are grouped into a small daily board, and the player can apply the current top proposal back onto the puzzle. Share links reopen a specific route on the same daily board, the briefing output includes an exact review link, and a compact archive/streak panel gives the experience a reason to return on the next daily board.
The current interface also includes a seven-day return map that shows complete, draft, and open days from the local archive, plus a clearly labeled sample week preview for first-minute review when no real archive exists yet. That turns the retention loop into a visible product surface rather than a note in the README.

The current build includes seven verified puzzle templates, objective progress chips, daily missions, top route ghosting, top route rationale, sample route URLs with labeled multi-contributor sample preview consensus for reviewer walkthroughs, a sample comment thread loader, comment thread route import with skip reasons, a comment challenge prompt, a Reddit post draft, a reviewer fast path, Phaser rendering, local persistence, a server-shaped proposal adapter, a Redis-shaped store, a launch packet CLI export, dependency hygiene notes, and a Devvit shell for pre-account validation.
The project also includes a platform feedback export that turns the real integration lessons into copyable field answers plus short, medium, and long single-field versions.
The submission packet also has a deterministic manifest that records byte counts and SHA-256 hashes for the public evidence files.
The app also includes a copyable reviewer fast path that points to the sample route, current review link, top-route ghost, lead rationale, comment challenge, and import loop for a one-minute evaluation pass.
The current interface also includes a first-session guide that tells a new reviewer what to do next: trace the beam, open the sample route, show the community loop, and copy the handoff proof.
The app now also includes a submission readiness checklist that keeps the playable board, sample route, Review link, public app URL status, return map, contribution loop, launch packet, and platform URL placeholders visible in one compact handoff surface.
The app also generates an evidence receipt that ties gameplay proof, community proof, retention proof, handoff proof, public URLs, and safety boundaries into one copyable review block.
The exported submission pack now includes a gate runbook that orders the public app check, sample route check, exact Review link check, source repository check, app listing URL, demo post URL, media attachments, and final audit commands before a submission pass.
The public evidence set also includes a criteria fit brief that maps the official public rules and overview signals to specific Signal Garden review surfaces and the remaining platform gates.
The Devpost field export turns the same evidence into concise form fields: project name, tagline, public URLs, built-with notes, testing instructions, criteria fit summary, and pending external gates.

## Built With

Phaser, Vite, JavaScript, Devvit-shaped client/server shell, GitHub Pages, Web Audio, deterministic puzzle engine, local proposal store, Redis-shaped proposal store.

## What Makes It Social

- Each mirror route is a proposal.
- Each route can be shared as a link that reopens the same plan.
- Briefings include the exact review link for the current route.
- Multiple routes pasted from a comment thread, individual comments, briefings, or short coordinate replies can be imported into the consensus list, with visible counts for imported, duplicate, and cross-day routes.
- A sample thread loader fills the import box with a complete route, a partial route, a cross-day route, and a duplicate route for an immediate review of the reply loop.
- A comment challenge prompt gives players a ready reply format with their exact Review link and current score.
- A Reddit post draft prepares a title, body, route review link, community target, and first-comment prompt for a later user-approved demo post.
- A developer feedback draft packages setup notes, mobile WebView checks, dependency hygiene observations, public review-link flow, and comment-loop feedback for a later user-approved platform feedback pass.
- A platform feedback export packages the same lessons into copyable form-field answers and length-limited variants.
- A review snapshot packages the current route, consensus state, top saved route, and judge checks.
- A reviewer fast path packages the sample route, current review link, top-route ghost, lead rationale, and comment import loop in one compact block.
- A first-session guide converts the current board state into four concrete reviewer steps: trace the beam, open sample route, show community loop, and copy handoff proof.
- A submission readiness checklist summarizes the playable board, sample route, Review link, public app URL status, retention surface, contribution loop, launch packet, and remaining platform URL placeholders.
- An evidence receipt summarizes gameplay proof, route proof, community proof, retention proof, launch handoff proof, public URLs, and the no-private-data safety boundary.
- A gate runbook in the exported submission pack keeps the public app, sample route, exact Review link, source repository, app listing, demo post, media attachments, and final audit commands in a single execution order.
- A criteria fit brief maps public hackathon signals to concrete review evidence, so the project can be evaluated against replayability, community contribution, Devvit migration, and testing instructions without guessing.
- A Devpost field pack export reduces final form-filling friction by turning public app/source/judge/criteria evidence into concise copyable fields.
- A launch packet combines the comment challenge, review snapshot, daily recap, source repository placeholder, demo post placeholders, app listing placeholders, and developer platform feedback topics in one copyable block.
- Contributors get a compact daily board based on complete routes and best score.
- A daily recap can be copied back into a discussion thread.
- The top route can be applied by the community.
- The top route appears as a low-contrast board ghost so players can see what the community is chasing before applying it.
- The top route rationale explains the leader by completion, score, move count, tie-breaks, and contributor record.
- The briefing output is short enough to fit in a post or comment.
- Daily boards and archive rows support recurring discussion.
- The seven-day return map and sample week preview make streak and recent-day progress visible at a glance.

## Technical Highlights

- Phaser + Vite browser game.
- Shared deterministic puzzle engine.
- Objective progress derived from the current trace.
- Daily missions for route tracing, proposal saving, relay completion, and rival target chasing.
- Seven-day garden log generated from the local archive, streak state, and non-persistent sample week preview.
- Top route ghosting for community route visibility on the board.
- Top route rationale for explaining the current leader after saved proposals or comment-thread imports.
- Replay animation for the current route.
- Status hints and board markers for complete, blocked, lost, and partial paths.
- Optional progressive hints that avoid spoiling the board on first load.
- Compact route encoding for share links.
- Review link, briefing, short coordinate reply parser, sample thread loader, and comment-thread parser for community route import, including duplicate and cross-day skip summaries.
- Sample route query support with `?day=YYYY-MM-DD&sample=1` for first-minute review.
- Sample preview consensus that shows the top-route loop without writing fake proposals to storage.
- Comment challenge prompt generated from the current route, Review link, and top proposal.
- Reddit post draft generated from the current route, sample route, Review link, and top proposal.
- Developer feedback draft generated from the current route, Review link, sample route, consensus, dependency hygiene notes, and Devvit Web integration notes.
- Platform feedback export generated from the current route, Review link, sample route, consensus, and integration notes, with short, medium, and long single-field variants.
- Review snapshot generated from the current route, Review link, consensus, and reproducibility checks.
- Reviewer fast path generated from the current route, sample URL, Review link, consensus, and Reddit reply loop.
- First-session guide generated from route state, sample URL, Review link, and consensus state.
- Submission readiness generated from the current route, sample URL, Review link, return map, consensus, and launch packet state.
- Evidence receipt generated from route state, sample URL, Review link, consensus, return map, launch packet, public URLs, and safety boundary claims.
- Launch packet generated from the current route, Review link, consensus, top route rationale, source repository placeholder, Reddit fit checks, and platform feedback notes.
- Strict launch packet CLI export for injecting public app listing, demo post, and review URLs after the platform gate.
- GitHub Pages workflow plus artifact audit for publishing the static browser build from a repository-page path after the repository gate.
- Public URL audit for checking the deployed app and `sample=1` reviewer walkthrough before a submission pass.
- Submission pack export that combines public URL checks, source repository evidence, project fields, media checklist, demo checklist, and launch packet copy.
- Gate runbook export that turns the user-approved public publishing steps into an ordered evidence checklist.
- Submission evidence manifest export for checking that media and source notes are current before a submission pass.
- Contributor aggregation and Reddit-ready daily recap text.
- Briefing export with exact review link.
- Server-shaped `init`, `proposal`, and `archive` adapter.
- Score recomputation on proposal submission.
- Redis-shaped proposal store with tests.
- Devvit client/server shell build outputs.

## Testing Instructions

1. Open the public app.
2. Open the sample route and confirm it shows a solved route for the selected day.
3. Open the judge desk and follow the First Minute checklist.
4. Copy a review link or use the sample thread loader to see comment routes become ranked proposals.
5. Open the criteria fit brief to compare the build against the public challenge signals.

## Criteria Fit Summary

Signal Garden should be framed as a daily community relay puzzle: players solve a small deterministic route board, then turn their route into a shareable proposal that can be pasted back from a comment thread, ranked, replayed, and used as the next community target. The strongest differentiator is not the mirror puzzle alone. The differentiator is the comment-to-game state loop: a Reddit-style thread can become a ranked set of playable proposals, and the app can explain why the top proposal leads.

## Honest Current Weaknesses

- The public app is hosted on GitHub Pages until a live Reddit post exists.
- The Devvit shell is built and audited, but app listing/playtest remain platform gates.
- Real multi-user data starts after the public demo post; sample route and sample thread flows are labeled as review previews.

## Pending External Gates

- Devvit app listing URL
- public Reddit demo post URL
- uploaded Devpost video or final public video URL

## Final Pre-Submit Commands

```powershell
npm run audit:public -- --base-url 'https://ooyxloo.github.io/signal-garden/' --day '2026-06-26'
npm run export:devpost-fields -- --public-app-url 'https://ooyxloo.github.io/signal-garden/' --source-repo-url 'https://github.com/OOYXLOO/signal-garden' --day '2026-06-26'
npm run audit:submission
```
