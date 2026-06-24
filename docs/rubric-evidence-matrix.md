# Signal Garden Rubric Evidence Matrix

Generated for day: 2026-06-24

This matrix maps public judging and submission expectations to concrete Signal Garden evidence. It is a review aid only; it does not submit forms, post to Reddit, or claim external-account actions are complete.

## Public Links

- Public app: https://ooyxloo.github.io/signal-garden/
- Daily sample route: https://ooyxloo.github.io/signal-garden/?day=2026-06-24&sample=1
- Judge desk: https://ooyxloo.github.io/signal-garden/judge.html
- Source repository: https://github.com/OOYXLOO/signal-garden
- Final captioned demo: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/demo-final-captioned.webm
- Submission manifest: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-manifest.json

## Submission Window

Submission window: open
Submissions close July 15, 2026 at 6:00 PM Pacific; 22 days remain.
Rules source: https://redditgameswithahook.devpost.com/rules

## Required Submission Surfaces

| Requirement | Evidence | Status |
| --- | --- | --- |
| Submission window | Submissions close July 15, 2026 at 6:00 PM Pacific; 22 days remain. Rules source: https://redditgameswithahook.devpost.com/rules | ready |
| Working project access | Public GitHub Pages app, deterministic sample route, judge desk, and public URL audit. | ready |
| Testing instructions | Reviewer Quickstart, judge desk First Minute checklist, submission runbook, and launch readiness docs. | ready |
| Source review | Public GitHub repository and submission manifest with hashes for media, docs, scripts, and generated packs. | ready |
| Public Reddit game surface | Devvit shell, app listing handoff, Reddit demo post draft, and final submission pack commands. | user-gated |
| Public demo post URL | Reddit demo post handoff draft exists; final public post URL is filled after account-side posting. | user-gated |
| Short demo media | Final captioned WebM, cover, desktop preview, mobile preview, and manifest duration/size audit. | ready |

## Judging Angle Fit

| Angle | Signal Garden fit | Proof |
| --- | --- | --- |
| Delightful UX | First-session guide, objective chips, route replay, top route ghost, rationale text, and mobile smoke coverage reduce first-minute confusion. | public/judge.html, docs/demo-final-captioned.webm, docs/mobile-preview.png, tests/reviewerGuide.test.mjs |
| Polish | The submission has media assets, generated field packs, launch runbooks, public URL audits, manifest hashes, and a judge desk instead of loose screenshots. | docs/submission-manifest.json, docs/gallery_assets.md, scripts/audit-submission-assets.mjs |
| Most Reddity | Routes become comment-sized proposals that can be pasted back from a thread, ranked, replayed, and summarized as community state. | src/game/proposals.js, src/reviewerGuide.js, docs/reddit-demo-post-draft.md |
| Hookiest Hook | The hook is not the mirror puzzle alone; it is the daily relay from one exact route link into ranked community proposals and a next-day invite. | docs/criteria-fit.md, docs/submission-field-pack.md, public/judge.html |
| Phaser Innovation | The Phaser board is paired with deterministic review links, replay state, contribution import, and Devvit-shaped packaging boundaries. | src/game/SignalGardenScene.js, src/share.js, docs/devvit-readiness-report.md |
| Developer Feedback | The feedback pack ties concrete Phaser/Vite/Devvit integration gaps to public evidence, reproduction steps, and answer-field order. | docs/platform-feedback-pack.md, docs/developer-feedback-form-pack.md, src/platformFeedback.js |

## Reddit Daily Loop Evidence

| Pillar | Evidence | Proof |
| --- | --- | --- |
| Daily return | Day-specific puzzles, seven-day return map, next-day pledge copy, and sample route links give players a clear reason to come back tomorrow. | src/state/store.js, src/reviewerGuide.js, public/judge.html |
| Progression | The contributor board, route score, beacon count, move limit, and top-route ghost turn each reply into visible progress for the thread. | src/game/proposals.js, src/game/puzzle.js, src/game/SignalGardenScene.js |
| Daily challenge | Each date resolves to a deterministic puzzle and a shareable sample route, so a subreddit can play one compact challenge per day. | https://ooyxloo.github.io/signal-garden/?day=2026-06-24&sample=1, src/game/puzzle.js, docs/demo-script.md |
| Community contribution | Comment-sized route links can be imported, ranked, replayed, summarized, and promoted as the lead route without requiring private account data. | src/share.js, src/game/proposals.js, docs/reddit-demo-post-draft.md |
| Evolving content | The daily archive, route proposals, launch packet, and feedback packs make each thread state exportable for recap posts and follow-up prompts. | src/launchPacket.js, docs/submission-field-pack.md, docs/developer-feedback-form-pack.md |

## Risk Register

| Risk | Mitigation |
| --- | --- |
| A judge opens the app before the Reddit demo post exists. | Judge desk and sample route show the full gameplay and community loop without private account access. |
| Feedback award eligibility is missed even if good answers exist. | Developer feedback form pack includes an eligibility checklist before copying answers. |
| Evidence links get stale across a multi-week judging window. | Judge desk and feedback pack generate current sample-route dates; manifest and audits catch stale generated files. |
| The project is mistaken for a generic puzzle demo. | Rubric matrix, criteria-fit brief, sample thread import, contributor board, and top-route rationale foreground Reddit-native contribution loops. |

## Next External Gates

1. Create or open the Devvit app listing.
2. Run a real Devvit playtest.
3. Publish the public Reddit demo post.
4. Export final submission pack with live app listing and demo post URLs.
5. Submit the Devpost-style entry and Developer Feedback Survey from the account owner side.
