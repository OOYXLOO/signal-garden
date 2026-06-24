# Signal Garden Public Proof Checklist

Generated for day: 2026-06-24

This checklist is a public review aid. It does not submit forms, post to Reddit, access private account pages, or include credentials.

## Quick Links

- Public app: https://ooyxloo.github.io/signal-garden/
- Sample route: https://ooyxloo.github.io/signal-garden/?day=2026-06-24&sample=1
- Judge desk: https://ooyxloo.github.io/signal-garden/judge.html
- Source repository: https://github.com/OOYXLOO/signal-garden

## Status Counts

- optional: 1
- ready: 21
- user-gated: 2

## Public access

Links a reviewer can open without private account data.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Playable app | ready | GitHub Pages app surface is public. | https://ooyxloo.github.io/signal-garden/ |
| Sample route | ready | Day-specific route opens a complete review loop. | https://ooyxloo.github.io/signal-garden/?day=2026-06-24&sample=1 |
| Judge desk | ready | Static review desk links media, manifests, docs, and copy packet. | https://ooyxloo.github.io/signal-garden/judge.html |
| Source repository | ready | Public source and verification scripts are available. | https://github.com/OOYXLOO/signal-garden |

## Gameplay proof

Shows that the project is a playable daily puzzle, not only a pitch deck.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Deterministic board | ready | Daily Phaser board with beacons, mirror limit, route replay, and objective chips. | https://ooyxloo.github.io/signal-garden/ |
| Final captioned demo | ready | Under-one-minute WebM demo is included in the committed evidence set. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/demo-final-captioned.webm |
| Media kit | ready | Cover, desktop, mobile, demo script, and gallery asset index are committed. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/gallery_assets.md |
| Submission manifest | ready | Manifest records byte counts and hashes for public evidence files. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-manifest.json |

## Community loop

Proves the Reddit-style hook: replies can become ranked game state.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Comment challenge | ready | The app exports a comment prompt with a Review link. | https://ooyxloo.github.io/signal-garden/ |
| Route import | ready | Review links and short coordinate replies can be parsed into ranked proposals. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-field-pack.md |
| Top route ghost | ready | The board can replay or apply the leading community route. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/demo-script.md |
| Daily recap | ready | A copyable recap summarizes routes, contributors, and next-day return cue. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/reddit-demo-post-draft.md |

## Return loop

Shows why a player has a reason to come back after the first solve.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Return map | ready | Seven-day archive surface shows completed, preview, partial, and open slots. | https://ooyxloo.github.io/signal-garden/ |
| Daily missions | ready | Daily objectives and contribution checks create short-session progression. | https://ooyxloo.github.io/signal-garden/ |
| Sample week | ready | Sample week preview demonstrates retention surface without stored private data. | https://ooyxloo.github.io/signal-garden/?sampleWeek=1 |
| Return pledge | ready | App exports a next-day prompt that can be used in the demo post or recap. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/launch-readiness.md |

## Platform handoff

Keeps account-owner actions separate from public, reusable evidence.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Devvit readiness | ready | Report explains WebView surface, server adapter, and dependency boundary. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/devvit-readiness-report.md |
| Developer feedback pack | ready | Evidence-backed feedback fields are prepared without submitting a form. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/developer-feedback-form-pack.md |
| Batch submission desk | ready | Copy blocks and links are ordered for user-present platform gates. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/batch-submission-desk.md |
| Public demo post | user-gated | Account owner posts later; draft is prepared. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/reddit-demo-post-draft.md |

## Final submission guard

Names what must be true immediately before pressing a platform submit button.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Submission window | ready | Submission window: open Submissions close July 15, 2026 at 6:00 PM Pacific; 22 days remain. Rules source: https://redditgameswithahook.devpost.com/rules | https://redditgameswithahook.devpost.com/rules |
| App listing | user-gated | Account owner creates listing later. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-runbook.md |
| Feedback confirmation | optional | Only record this when a public confirmation URL exists. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/platform-feedback-pack.md |
| Local verification | ready | Run check, tests, builds, local/devvit/pages/submission audits, public URL audit, and npm audit. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/public-verification.md |

## Final Pre-Submit Command

```powershell
npm run audit:public -- --base-url 'https://ooyxloo.github.io/signal-garden/' --day '2026-06-24'
npm run audit:submission
npm audit --audit-level=moderate
```
