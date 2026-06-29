# Signal Garden Public Submission Pack

## Public URLs

- Public app: https://signal-garden.vercel.app/
- Sample route: https://signal-garden.vercel.app/?day=2026-06-30&sample=1
- Review link: https://signal-garden.vercel.app/?day=2026-06-30&plan=5-1-b.5-6-s.2-6-s
- Source repository: https://github.com/OOYXLOO/signal-garden
- App listing: pending user gate: add after the public Devvit app listing exists.
- Demo post: pending user gate: add after the public Reddit demo post exists.
- Feedback form: https://forms.gle/YByxxCneDsn174qb9

## Public URL Audit

- Base URL: HTTP 200, Signal Garden
- Sample route URL: HTTP 200, Signal Garden
- Localhost guard: passed by this command before generating the pack.

## Evidence Receipt

Signal Garden 2026-06-30: evidence receipt
4/6 public URL evidence slots ready

Evidence claims:
- Playable puzzle: 3 beacons, 5 mirrors, deterministic day 2026-06-30.
- Hook proof: the review path shows a daily puzzle, shareable route, reply-thread ranking, top-route ghosting, and next-day return prompt.
- Route proof: complete, 1006 pts, 3/3 beacons, 3/5 moves.
- Community proof: 1/1 saved routes complete, with a ranked top route and 80/100 contribution quality.
- Retention proof: 4/7 return-map slots show activity or preview state; next-day pledge waiting.
- Handoff proof: launch packet is generated from the current board state.
- Submission window proof: Submission window: open Submissions close July 15, 2026 at 6:00 PM Pacific; 17 days remain. Rules source: https://redditgameswithahook.devpost.com/rules
- Safety proof: public evidence avoids credentials, private data, billing, identity checks, and platform secrets.

Public URLs:
- Public app: https://signal-garden.vercel.app/
- Sample route: https://signal-garden.vercel.app/?day=2026-06-30&sample=1
- Review link: https://signal-garden.vercel.app/?day=2026-06-30&plan=5-1-b.5-6-s.2-6-s
- Source repository: https://github.com/OOYXLOO/signal-garden
- App listing: waiting for app listing
- Demo post: waiting for public demo post

## Gate Runbook

1. Open the public app URL and confirm the board, objective chips, reviewer panel, and submission readiness panel are visible.
   Evidence: https://signal-garden.vercel.app/
2. Open the sample route and confirm it shows a labeled sample preview, top-route rationale, return map preview, and comment import loop.
   Evidence: https://signal-garden.vercel.app/?day=2026-06-30&sample=1
3. Open the exact review link and confirm the route replays on the same daily board without localhost or account-only links.
   Evidence: https://signal-garden.vercel.app/?day=2026-06-30&plan=5-1-b.5-6-s.2-6-s
4. Open the source repository and confirm the README, docs, demo media, and verification scripts are public or intentionally visible to reviewers.
   Evidence: https://github.com/OOYXLOO/signal-garden
5. Paste the app listing URL only after the user-approved Devvit listing is public.
   Evidence: pending user gate: public app listing URL
6. Paste the public demo post URL only after the user-approved Reddit demo post is public.
   Evidence: pending user gate: public demo post URL
7. Paste the platform feedback URL only if that target flow asks for it: https://forms.gle/YByxxCneDsn174qb9
8. Attach media in this order: cover, desktop preview, mobile preview, final captioned demo.
9. Re-run the final commands before submission and keep their output with the project notes:
   npm run audit:public -- --base-url 'https://signal-garden.vercel.app/' --day '2026-06-30'
   npm run export:submission-pack -- --public-app-url 'https://signal-garden.vercel.app/' --day '2026-06-30' --plan '5-1-b.5-6-s.2-6-s' --source-repo-url 'https://github.com/OOYXLOO/signal-garden' --app-listing-url '<public-app-listing-url>' --demo-post-url '<public-demo-post-url>' --feedback-url 'https://forms.gle/YByxxCneDsn174qb9'
   npm run audit:submission

## Submission Fields

### Project Name

Signal Garden

### Short Description

Signal Garden is a daily Phaser relay puzzle where players place mirrors, guide one signal through three beacons, and turn each route into a community proposal.

### Long Description

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

### Source Repository

https://github.com/OOYXLOO/signal-garden

### What Makes It Social

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

### Technical Highlights

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

## Media Assets

- Cover: `docs/cover.png`
- Desktop preview: `docs/desktop-preview.png`
- Mobile preview: `docs/mobile-preview.png`
- Demo video: `docs/demo-final-captioned.webm`

## Demo Checklist

- Show a full board in the first five seconds.
- Use a sample route URL when a quick reviewer walkthrough is needed before a final public Review link exists.
- Complete a route through all three beacons.
- Replay the completed route.
- Save the proposal and show the consensus summary.
- Show the top route ghost after a route is saved or imported.
- Show the top route rationale and explain why the leader ranks above the next route.
- Copy a share link and briefing for the exact route.
- Copy the comment challenge prompt for a reply thread.
- Copy the Reddit post draft for a later user-approved demo post.
- Copy the developer feedback draft for a later user-approved platform feedback pass.
- Run `npm run export:platform-feedback` when a copyable platform feedback packet is needed outside the app UI.
- Copy the review snapshot for a judge or gallery note.
- Copy the reviewer fast path for a quick judge or playtester handoff.
- Follow the first-session guide so a fresh reviewer can see the next action without reading the README.
- Copy the submission readiness checklist to verify the handoff surface before final submission text.
- Copy the evidence receipt so a reviewer can see public URLs, proof claims, and safety boundaries without hunting through the repository.
- Copy the launch packet for the public demo post, app listing, discussion follow-up, and platform feedback pass.
- After real public URLs exist, run the strict launch packet export before copying final submission text.
- If using GitHub Pages as the public review surface, run `npm run build` and `npm run audit:pages` before the final URL pass.
- After the public app URL exists, run `npm run audit:public -- --base-url <public-app-url> --day <YYYY-MM-DD>`.
- After public app, source repository, app listing, and demo post exist, run `npm run export:submission-pack` with `--source-repo-url`; use `--plan <review-plan-token>` when a copied route token exists, or `--sample-route` to generate a complete built-in review route for the selected day.
- Use the Gate Runbook section in the exported submission pack as the final public evidence checklist, including the source repository check.
- Load or paste a comment thread with multiple Review links and show the imported routes plus skip reasons in consensus.
- Show the contributor board and copy the daily recap.
- Clear the board and apply the top proposal.
- Show daily seed, streak, archive, and briefing output.
- Show the seven-day return map and sample week preview after playing or loading a sample route.
- Avoid account pages and private consoles.

## Launch Packet

# Signal Garden 2026-06-30: Quiet relay

Hook: A daily mirror-routing relay where every player route can become the next community proposal.
Current route: complete, 1006 pts, 3/3 beacons, 3/5 moves
Review link: https://signal-garden.vercel.app/?day=2026-06-30&plan=5-1-b.5-6-s.2-6-s

## Demo Post Setup
Demo post: add after the public demo post exists.
Source repository: https://github.com/OOYXLOO/signal-garden
App listing: add after the app listing exists.

## Why It Fits Reddit
- Self-explanatory first post: board, objective, move limit, and one action are visible before reading docs.
- Return loop: deterministic daily board, streak state, archive rows, and recap copy make tomorrow matter.
- User contribution loop: review links from comments can become ranked community proposals.
- Phaser surface: beam trace, blockers, beacons, route replay, audio cues, and responsive canvas are inside the game.
- Integration boundary: official Devvit packages stay outside normal dependencies until the SDK chain is clean in an isolated playtest.
- Safety boundary: no account tokens, private data, billing pages, or platform credentials are stored in the app.

## Comment Challenge
Signal Garden 2026-06-30 challenge
Quiet relay: Guide the signal through all three beacons before it reaches the receiver. Each placed mirror becomes a public proposal for today's relay.
My route: complete, 1006 pts, 3/3 beacons, 3/5 moves.
Review link: https://signal-garden.vercel.app/?day=2026-06-30&plan=5-1-b.5-6-s.2-6-s
Current top: 1006 pts, 3/3 beacons, 3 moves.
Reply with your Review link or a short route like `r3c3\ r7c3\` so it can join the community board.

## Reddit Post Draft
Title: Signal Garden 2026-06-30: route today's Quiet relay

Body:
Guide the signal through all three beacons before it reaches the receiver. Each placed mirror becomes a public proposal for today's relay.

Current route: complete, 1006 pts, 3/3 beacons, 3/5 moves.
Community target: 1006 pts, 3/3 beacons, 3 moves.
Review my route: https://signal-garden.vercel.app/?day=2026-06-30&plan=5-1-b.5-6-s.2-6-s

Try it: place mirrors, copy your Review link, then reply with it or a short coordinate route so the route can join the daily board.

First comment prompt:
Reply with your Review link or a short route like `r3c3\ r7c3\`. The app can import a thread of routes, skip duplicate or cross-day routes, and explain why the top route leads.

## Reviewer Fast Path
Signal Garden reviewer fast path
Day: 2026-06-30 - Quiet relay
Route state: complete, 1006 pts, 3/3 beacons, 3/5 moves
Community state: 1/1 saved routes complete; top route 1006 pts, 3/3 beacons, 3 moves.
Lead rationale: Completes all 3 beacons. 1006 pts using 3/5 moves.
Contribution quality: 80/100 - The loop has 1/1 complete routes across 1 contributor view.
Submission window: open - Submissions close July 15, 2026 at 6:00 PM Pacific; 17 days remain.
Sample route: open the app with day=<date>&sample=1 to load a complete labeled preview.
Current review link: https://signal-garden.vercel.app/?day=2026-06-30&plan=5-1-b.5-6-s.2-6-s
1-minute check: open the sample route, replay the beam, compare the top-route ghost, copy the comment challenge, then paste the review link into Comment route to see it rank.
Reddit loop: a route link from any reply can become a ranked daily proposal, and the recap gives the thread a next-day reason to return.

## Top Route Rationale
1006 pts, 3/3 beacons, 3 moves.
- Completes all 3 beacons.
- 1006 pts using 3/5 moves.
- First ranked route sets today's chase target.
- submission-preview contributor record: 1/1 complete.

## Review Snapshot
Signal Garden review snapshot
Day: 2026-06-30
Board: Quiet relay
Route: complete, 1006 pts, 3/3 beacons, 3/5 moves
Community: 1/1 saved routes complete, 1 contributors
Top saved route: 1006 pts, 3/3 beacons, 3 moves
Review link: https://signal-garden.vercel.app/?day=2026-06-30&plan=5-1-b.5-6-s.2-6-s
Judge checks: deterministic daily seed; route can be reopened; consensus is built from saved/imported proposals.

## Daily Recap
Signal Garden 2026-06-30 recap
Board: Quiet relay
Routes: 1/1 complete
Top route: 1006 pts, 3/3 beacons, 3 moves
Lead rationale: Completes all 3 beacons.
Contributor lead: submission-preview with 1/1 complete routes
Try a route, paste a review link, and help the garden choose today's best signal.

## Developer Platform Feedback
Survey URL: https://forms.gle/YByxxCneDsn174qb9
Signal Garden developer feedback draft

What I tested:
- Devvit Web-style client shell running a Phaser/Vite game surface.
- Daily deterministic puzzle, Review links, and comment-thread route import.
- Server-shaped proposal consensus with a Redis-shaped store for later platform wiring.

Current build:
- Board: 2026-06-30 Quiet relay.
- Route state: complete, 1006 pts, 3/3 beacons, 3/5 moves.
- Community loop: 1/1 saved routes complete.
- Review path: https://signal-garden.vercel.app/?day=2026-06-30&plan=5-1-b.5-6-s.2-6-s

Product feedback:
- Devvit Web setup would be easier with a compact Phaser/Vite starter that shows static asset paths, expanded post launch, and same-origin server routes together.
- Interactive post review would benefit from a checklist that connects app listing URL, public demo post URL, and a playable review link in one flow.
- Mobile WebView guidance should call out touch targets, fixed canvas sizing, audio unlock behavior, and safe-area constraints.
- Comment-driven games need clearer examples for importing public reply links or short coordinate routes, handling duplicates, and showing why one community result leads another.
- A local dry-run command that validates client bundle, server routes, and public review links before submission would reduce last-minute mistakes.
- Dependency hygiene is still hard to judge from the outside: an isolated 2026-06-26 audit of devvit@0.13.5 plus @devvit/public-api@0.13.5 reported 23 findings, including 4 high, while devvit@1.0.0 is a deprecated placeholder and @devvit/public-api@1.0.0 is not published.

What worked well:
- The app can keep the first screen playable without account data.
- A sample route URL lets reviewers test the loop before live community data exists.
- Copyable post, review, recap, and launch packets keep the public handoff consistent.
