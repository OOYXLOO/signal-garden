# Submission Field Pack

Use this as source copy for a Devpost or project gallery submission after the live platform gate is complete.

## Short Description

Signal Garden is a daily Phaser relay puzzle where players place mirrors, guide one signal through three beacons, and turn each route into a community proposal.

## Long Description

Signal Garden explores a daily community puzzle loop for Reddit-style surfaces. A deterministic board appears each day with a source, receiver, blockers, three beacons, and a five-move limit. Players place mirrors to route the signal, then save the route as a proposal.

The proposal layer recomputes scores from the shared puzzle rules instead of trusting client-provided values. Saved proposals are ranked by completion, score, and move count, contributors are grouped into a small daily board, and the player can apply the current top proposal back onto the puzzle. Share links reopen a specific route on the same daily board, the briefing output includes an exact review link, and a compact archive/streak panel gives the experience a reason to return on the next daily board.

The current build includes seven verified puzzle templates, objective progress chips, daily missions, top route ghosting, sample route URLs with labeled sample preview consensus for reviewer walkthroughs, comment route import, a comment challenge prompt, a reviewer fast path, Phaser rendering, local persistence, a server-shaped proposal adapter, a Redis-shaped store, a launch packet CLI export, and a Devvit shell for pre-account validation.
The submission packet also has a deterministic manifest that records byte counts and SHA-256 hashes for the public evidence files.
The app also includes a copyable reviewer fast path that points to the sample route, current review link, top-route ghost, comment challenge, and import loop for a one-minute evaluation pass.

## What Makes It Social

- Each mirror route is a proposal.
- Each route can be shared as a link that reopens the same plan.
- Briefings include the exact review link for the current route.
- Routes pasted from comments or briefings can be imported into the consensus list.
- A comment challenge prompt gives players a ready reply format with their exact Review link and current score.
- A review snapshot packages the current route, consensus state, top saved route, and judge checks.
- A reviewer fast path packages the sample route, current review link, top-route ghost, and comment import loop in one compact block.
- A launch packet combines the comment challenge, review snapshot, daily recap, demo post placeholders, app listing placeholders, and developer platform feedback topics in one copyable block.
- Contributors get a compact daily board based on complete routes and best score.
- A daily recap can be copied back into a discussion thread.
- The top route can be applied by the community.
- The top route appears as a low-contrast board ghost so players can see what the community is chasing before applying it.
- The briefing output is short enough to fit in a post or comment.
- Daily boards and archive rows support recurring discussion.

## Technical Highlights

- Phaser + Vite browser game.
- Shared deterministic puzzle engine.
- Objective progress derived from the current trace.
- Daily missions for route tracing, proposal saving, relay completion, and rival target chasing.
- Top route ghosting for community route visibility on the board.
- Replay animation for the current route.
- Status hints and board markers for complete, blocked, lost, and partial paths.
- Optional progressive hints that avoid spoiling the board on first load.
- Compact route encoding for share links.
- Review link and briefing parser for community route import.
- Sample route query support with `?day=YYYY-MM-DD&sample=1` for first-minute review.
- Sample preview consensus that shows the top-route loop without writing fake proposals to storage.
- Comment challenge prompt generated from the current route, Review link, and top proposal.
- Review snapshot generated from the current route, Review link, consensus, and reproducibility checks.
- Reviewer fast path generated from the current route, sample URL, Review link, consensus, and Reddit reply loop.
- Launch packet generated from the current route, Review link, consensus, Reddit fit checks, and platform feedback notes.
- Strict launch packet CLI export for injecting public app listing, demo post, and review URLs after the platform gate.
- Submission evidence manifest export for checking that media and source notes are current before a submission pass.
- Contributor aggregation and Reddit-ready daily recap text.
- Briefing export with exact review link.
- Server-shaped `init`, `proposal`, and `archive` adapter.
- Score recomputation on proposal submission.
- Redis-shaped proposal store with tests.
- Devvit client/server shell build outputs.

## Demo Checklist

- Show a full board in the first five seconds.
- Use a sample route URL when a quick reviewer walkthrough is needed before a final public Review link exists.
- Complete a route through all three beacons.
- Replay the completed route.
- Save the proposal and show the consensus summary.
- Show the top route ghost after a route is saved or imported.
- Copy a share link and briefing for the exact route.
- Copy the comment challenge prompt for a reply thread.
- Copy the review snapshot for a judge or gallery note.
- Copy the reviewer fast path for a quick judge or playtester handoff.
- Copy the launch packet for the public demo post, app listing, discussion follow-up, and platform feedback pass.
- After real public URLs exist, run the strict launch packet export before copying final submission text.
- Paste the route back as a comment route and show it in consensus.
- Show the contributor board and copy the daily recap.
- Clear the board and apply the top proposal.
- Show daily seed, streak, archive, and briefing output.
- Avoid account pages and private consoles.

## Current Local Video Assets

- `docs/demo.webm`: silent interaction clip.
- `docs/demo-captioned.webm`: captioned walkthrough draft for quick review.
- `docs/demo-final-captioned.webm`: 53-second captioned final candidate for submission review.

## Local Asset Check

Run `npm run audit:submission` before a user-approved submission pass to verify gallery image dimensions, final demo presence, under-60-second duration, and required submission text sections.
Refresh `docs/submission-manifest.json` with `npm run export:submission-manifest -- --output docs/submission-manifest.json` whenever evidence files change; the submission audit recomputes hashes and fails if the manifest is stale.
