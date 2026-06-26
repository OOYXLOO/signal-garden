# Making a Phaser Browser Game Reviewer-Ready

Signal Garden is a small Phaser game, but the hardest part of preparing it for a public review is not only the board logic. A reviewer needs to understand the game state, replay a representative route, verify that the deployed build matches the source repository, and see how the community loop would work before a live platform integration exists.

This note describes the frontend handoff pattern used in the project: a playable game surface, deterministic sample routes, public proof links, and copyable review packets.

## The Problem With "Just Play It"

For a small browser game, a blank first session is risky. The game might be fun after a few minutes, but the first reviewer may only spend one minute deciding whether the project is understandable.

Signal Garden treats that first minute as a product surface. The app exposes:

- a sample route URL that loads a complete path,
- a reviewer loop panel that names the next checks,
- a judge desk that links the playable app, source repository, proof files, and media,
- a launch packet that summarizes public URLs and current gate status,
- and a submission manifest that records the public evidence files used by the review.

The goal is not to script the reviewer's opinion. It is to remove avoidable confusion.

## Deterministic Review Routes

Daily puzzle games usually depend on today's seed. That is good for players, but it can make review difficult. If a reviewer opens the app on a different day, screenshots and docs may no longer match the board.

Signal Garden keeps the daily seed, but also supports review URLs such as:

```text
https://ooyxloo.github.io/signal-garden/?day=YYYY-MM-DD&sample=1
```

The `day` value selects the puzzle seed. The `sample=1` value loads a known complete review route without pretending it is real user data.

That distinction matters. Sample routes help a reviewer see the loop quickly, while labels make clear that the route is demonstration data.

## Review State In The UI

The app includes frontend panels that explain review progress without opening a separate guide first.

Key surfaces include:

- `Reviewer loop`: a compact checklist for opening the sample, tracing the route, ranking the proposal, and copying the packet.
- `Submission readiness`: a status panel for playable board, sample route, current review link, public app URL, return map, contribution loop, launch packet, and remaining platform URLs.
- `Evidence receipt`: a copyable summary of the route, proof links, and remaining external gates.
- `Return map`: a seven-day view that makes the retention idea visible even before platform analytics exist.

These panels are intentionally generated from project state instead of handwritten screenshots. When the URLs or gate status change, the exported packet and app panels can be refreshed together.

## Community Loop Without Private Platform Data

The game is designed for community replies, but it does not require private account access for local review. The browser build can parse public-style route snippets:

```text
r3c3\ r7c3\
```

It can also import sample comment threads and rank proposed routes. This lets the frontend demonstrate the intended community loop without storing account tokens, reading private messages, or depending on a live subreddit during local testing.

That boundary keeps the implementation easier to audit:

- public links are safe to include in docs,
- route proposals are lightweight game data,
- sample threads are clearly labeled,
- and live platform actions remain outside the repository until a real account owner performs them.

## Public Proof Links

A public reviewer should not have to infer where the evidence lives. Signal Garden keeps a small static judge desk:

```text
https://ooyxloo.github.io/signal-garden/judge.html
```

The judge desk links the playable app, a sample route, media files, proof checklists, field packs, and source repository evidence. It functions like a table of contents for the public review.

This pattern is useful beyond games. Any frontend demo that depends on generated reports, screenshots, or submission fields can benefit from a stable review desk.

## Build And Audit Commands

The project keeps the checks ordinary:

```powershell
npm test
npm run check
npm run build
npm run build:devvit
npm run audit:pages
npm run audit:submission
```

The important part is not the exact script names. The important part is that review artifacts are treated as build outputs with checks, not loose notes copied by hand.

## What This Pattern Avoids

This handoff pattern avoids a few common demo problems:

- local-only URLs appearing in public submissions,
- source repository links missing from the final packet,
- screenshots that do not match the current build,
- review routes that expire when the daily seed changes,
- account-specific platform fields leaking into public files,
- and reviewers needing to read a long README before seeing the core loop.

## Reusable Checklist

For a small browser game or frontend demo, the practical checklist is:

1. Add a deterministic sample route.
2. Label sample data clearly.
3. Put the first-minute reviewer path inside the UI.
4. Provide a single public judge desk.
5. Generate copyable launch or submission packets from current state.
6. Keep platform account actions out of the repository.
7. Run static build and artifact audits before sharing the link.

The result is not just a playable prototype. It is a prototype that can be reviewed, discussed, and verified without the reviewer reconstructing the project from scattered links.
