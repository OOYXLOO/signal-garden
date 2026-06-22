# Submission Field Pack

Use this as source copy for a Devpost or project gallery submission after the live platform gate is complete.

## Short Description

Signal Garden is a daily Phaser relay puzzle where players place mirrors, guide one signal through three beacons, and turn each route into a community proposal.

## Long Description

Signal Garden explores a daily community puzzle loop for Reddit-style surfaces. A deterministic board appears each day with a source, receiver, blockers, three beacons, and a five-move limit. Players place mirrors to route the signal, then save the route as a proposal.

The proposal layer recomputes scores from the shared puzzle rules instead of trusting client-provided values. Saved proposals are ranked by completion, score, and move count, contributors are grouped into a small daily board, and the player can apply the current top proposal back onto the puzzle. Share links reopen a specific route on the same daily board, the briefing output includes an exact review link, and a compact archive/streak panel gives the experience a reason to return on the next daily board.
The current interface also includes a seven-day return map that shows complete, draft, and open days from the local archive, plus a clearly labeled sample week preview for first-minute review when no real archive exists yet. That turns the retention loop into a visible product surface rather than a note in the README.

The current build includes seven verified puzzle templates, objective progress chips, daily missions, top route ghosting, top route rationale, sample route URLs with labeled sample preview consensus for reviewer walkthroughs, a sample comment thread loader, comment thread route import with skip reasons, a comment challenge prompt, a Reddit post draft, a reviewer fast path, Phaser rendering, local persistence, a server-shaped proposal adapter, a Redis-shaped store, a launch packet CLI export, dependency hygiene notes, and a Devvit shell for pre-account validation.
The submission packet also has a deterministic manifest that records byte counts and SHA-256 hashes for the public evidence files.
The app also includes a copyable reviewer fast path that points to the sample route, current review link, top-route ghost, lead rationale, comment challenge, and import loop for a one-minute evaluation pass.
The app now also includes a submission readiness checklist that keeps the playable board, sample route, Review link, public app URL status, return map, contribution loop, launch packet, and platform URL placeholders visible in one compact handoff surface.
The exported submission pack now includes a gate runbook that orders the public app check, sample route check, exact Review link check, source repository check, app listing URL, demo post URL, media attachments, and final audit commands before a submission pass.

## What Makes It Social

- Each mirror route is a proposal.
- Each route can be shared as a link that reopens the same plan.
- Briefings include the exact review link for the current route.
- Multiple routes pasted from a comment thread, individual comments, briefings, or short coordinate replies can be imported into the consensus list, with visible counts for imported, duplicate, and cross-day routes.
- A sample thread loader fills the import box with a complete route, a partial route, a cross-day route, and a duplicate route for an immediate review of the reply loop.
- A comment challenge prompt gives players a ready reply format with their exact Review link and current score.
- A Reddit post draft prepares a title, body, route review link, community target, and first-comment prompt for a later user-approved demo post.
- A developer feedback draft packages setup notes, mobile WebView checks, dependency hygiene observations, public review-link flow, and comment-loop feedback for a later user-approved platform feedback pass.
- A review snapshot packages the current route, consensus state, top saved route, and judge checks.
- A reviewer fast path packages the sample route, current review link, top-route ghost, lead rationale, and comment import loop in one compact block.
- A submission readiness checklist summarizes the playable board, sample route, Review link, public app URL status, retention surface, contribution loop, launch packet, and remaining platform URL placeholders.
- A gate runbook in the exported submission pack keeps the public app, sample route, exact Review link, source repository, app listing, demo post, media attachments, and final audit commands in a single execution order.
- A launch packet combines the comment challenge, review snapshot, daily recap, demo post placeholders, app listing placeholders, and developer platform feedback topics in one copyable block.
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
- Review snapshot generated from the current route, Review link, consensus, and reproducibility checks.
- Reviewer fast path generated from the current route, sample URL, Review link, consensus, and Reddit reply loop.
- Submission readiness generated from the current route, sample URL, Review link, return map, consensus, and launch packet state.
- Launch packet generated from the current route, Review link, consensus, top route rationale, Reddit fit checks, and platform feedback notes.
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
- Copy the review snapshot for a judge or gallery note.
- Copy the reviewer fast path for a quick judge or playtester handoff.
- Copy the submission readiness checklist to verify the handoff surface before final submission text.
- Copy the launch packet for the public demo post, app listing, discussion follow-up, and platform feedback pass.
- After real public URLs exist, run the strict launch packet export before copying final submission text.
- If using GitHub Pages as the public review surface, run `npm run build` and `npm run audit:pages` before the final URL pass.
- After the public app URL exists, run `npm run audit:public -- --base-url <public-app-url> --day <YYYY-MM-DD>`.
- After public app, source repository, app listing, demo post, and review route token exist, run `npm run export:submission-pack` with `--source-repo-url`.
- Use the Gate Runbook section in the exported submission pack as the final public evidence checklist, including the source repository check.
- Load or paste a comment thread with multiple Review links and show the imported routes plus skip reasons in consensus.
- Show the contributor board and copy the daily recap.
- Clear the board and apply the top proposal.
- Show daily seed, streak, archive, and briefing output.
- Show the seven-day return map and sample week preview after playing or loading a sample route.
- Avoid account pages and private consoles.

## Current Local Video Assets

- `docs/demo.webm`: silent interaction clip.
- `docs/demo-captioned.webm`: captioned walkthrough draft for quick review.
- `docs/demo-final-captioned.webm`: 53-second captioned final candidate for submission review.

## Local Asset Check

Run `npm run audit:submission` before a user-approved submission pass to verify gallery image dimensions, final demo presence, under-60-second duration, and required submission text sections.
Refresh `docs/submission-manifest.json` with `npm run export:submission-manifest -- --output docs/submission-manifest.json` whenever evidence files change; the submission audit recomputes hashes and fails if the manifest is stale.
