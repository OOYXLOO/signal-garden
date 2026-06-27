# Signal Garden Example Post Proof Pack

Generated for day: 2026-06-28

This pack shows how the public game, sample Reddit-style post, and comment-route import loop fit together. It does not post to Reddit, submit forms, access private pages, or include credentials.

## Quick Links

- Public app: https://signal-garden.vercel.app/
- Sample route: https://signal-garden.vercel.app/?day=2026-06-28&sample=1
- Judge desk: https://signal-garden.vercel.app/judge.html
- Source repository: https://github.com/OOYXLOO/signal-garden
- App listing: <add after public listing exists>
- Demo post: <add after public demo post exists>

## Gate Status

| Gate | Status |
| --- | --- |
| Submission window | ready - Submission window: open Submissions close July 15, 2026 at 6:00 PM Pacific; 18 days remain. Rules source: https://redditgameswithahook.devpost.com/rules |
| App listing | user-gated |
| Demo post | user-gated |

## Example Reddit-Style Post

Title: Signal Garden daily relay - 2026-06-28

Body:

- Today's board is a five-move relay puzzle: place mirrors, route the signal through the beacons, and share your route.
- Play the sample route: https://signal-garden.vercel.app/?day=2026-06-28&sample=1
- Reply with a Review link or a compact coordinate route so the thread can rank community proposals.

First comment:

- Route reply format:
- Open the sample route, improve it, copy the Review link, and reply with the link or coordinates such as `r3c3 r7c3`.
- The app imports replies into ranked proposals and shows the leading route as a ghost route.

## Comment Shapes

| Shape | Example | Proof |
| --- | --- | --- |
| Review link | https://signal-garden.vercel.app/?day=2026-06-28&sample=1 | Importer accepts day-specific review URLs and extracts route state for ranking. |
| Coordinate-only route | r3c3 r7c3 r7c5 | Importer accepts compact comment routes for the current board. |
| Recap reply | Lead route solved 3/3 beacons; try shaving one mirror tomorrow. | Launch packet and daily recap convert route state into a next-day prompt. |

## Proof Path

| Step | Evidence |
| --- | --- |
| Open public game | https://signal-garden.vercel.app/ |
| Open sample route | https://signal-garden.vercel.app/?day=2026-06-28&sample=1 |
| Load sample comment thread | Reviewer loop panel shows import counts, skip reasons, ranked proposals, and top-route rationale. |
| Inspect judge desk | https://signal-garden.vercel.app/judge.html |
| Review source and manifest | https://github.com/OOYXLOO/signal-garden and https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-manifest.json |

## Award Fit

| Category | Fit |
| --- | --- |
| User contributions | Comment replies become imported, ranked, replayable game proposals. |
| Retention | Daily board, return map, recap copy, and next-day pledge make the thread a repeatable ritual. |
| Phaser | Phaser board is paired with deterministic routes, replay animation, and community state import. |
| Feedback | Platform feedback is tied to concrete Devvit WebView, asset, persistence, and comment-loop gaps. |

## Safety Boundaries

- No passwords, OTPs, cookies, account settings, payment data, or private Reddit pages.
- No claim that the app listing or demo post exists until the public URLs are recorded.
- No private subreddit content is required for review; the sample thread proof is local and public.
