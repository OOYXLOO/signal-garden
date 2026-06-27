# Signal Garden Public Playtest - 2026-06-28

This playtest verifies the public reviewer path for Signal Garden after the Example Post Proof Pack update.

It is a public QA note only. It does not post to Reddit, submit forms, access private pages, or include credentials.

## Targets

- Public sample route: <https://signal-garden.vercel.app/?day=2026-06-28&sample=1>
- Judge desk: <https://signal-garden.vercel.app/judge.html>
- Example post proof pack: <https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/example-post-proof-pack.md>
- Submission manifest: <https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-manifest.json>

## Desktop Viewport

Viewport: `1280x720`

Observed:

- The sample route opens directly into a completed board.
- Score, beacons, moves, daily objectives, and first-session guide are visible in the first screen.
- The game canvas is nonblank and framed clearly.
- The reviewer panel does not cover the board.

## Mobile Viewport

Viewport: `390x844`

Observed:

- The title, date chip, board, and first information card are readable.
- The board is centered and nonblank.
- The right-side reviewer panel stacks below the board instead of overlapping it.
- The first scroll reveals the Civo-style card layout without text collision or canvas obstruction.

## Core Verb Pass

Actions exercised on the public sample route:

1. Replay route.
2. Load sample thread.
3. Import comment routes.
4. Copy launch packet.

Observed:

- Browser console reported no errors during the action pass.
- Import status appeared after loading and importing the sample thread.
- Ranked proposals text was present.
- Top route text was present.
- Launch packet text was present.

## Finding

No blocking public playtest issue was found.

One full-page screenshot captured through browser automation repeated sticky content vertically. This appears to be a screenshot-tool artifact caused by sticky layout during full-page capture, not a real player-facing issue. Viewport screenshots at desktop and mobile sizes rendered correctly.

## Why This Matters

The strongest external judging risk is that Signal Garden looks like a generic web puzzle instead of a Reddit-native game loop. This pass confirms that the public reviewer path now exposes:

- the completed daily route,
- the first-session guide,
- sample route review link,
- comment-route import,
- ranked proposals,
- top route state,
- and launch packet proof.

These are the key evidence points for a judge evaluating user contributions, retention, and Reddit-style game mechanics.
