# Signal Garden Public Proof Checklist

Generated for day: 2026-06-27

This checklist is a public review aid. It does not submit forms, post to Reddit, access private account pages, or include credentials.

## Quick Links

- Public app: https://signal-garden.vercel.app/
- Sample route: https://signal-garden.vercel.app/?day=2026-06-27&sample=1
- Judge desk: https://signal-garden.vercel.app/judge.html
- Source repository: https://github.com/OOYXLOO/signal-garden

## Status Counts

- optional: 1
- ready: 25
- user-gated: 2

## Public access

Links a reviewer can open without private account data.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Playable app | ready | Production app surface is public. | https://signal-garden.vercel.app/ |
| Sample route | ready | Day-specific route opens a complete review loop. | https://signal-garden.vercel.app/?day=2026-06-27&sample=1 |
| Judge desk | ready | Static review desk links media, manifests, docs, and copy packet. | https://signal-garden.vercel.app/judge.html |
| Source repository | ready | Public source and verification scripts are available. | https://github.com/OOYXLOO/signal-garden |

## Gameplay proof

Shows that the project is a playable daily puzzle, not only a pitch deck.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Deterministic board | ready | Daily Phaser board with beacons, mirror limit, route replay, and objective chips. | https://signal-garden.vercel.app/ |
| Final captioned demo | ready | Under-one-minute WebM demo is included in the committed evidence set. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/demo-final-captioned.webm |
| Media kit | ready | Cover, desktop, mobile, demo script, and gallery asset index are committed. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/gallery_assets.md |
| Submission manifest | ready | Manifest records byte counts and hashes for public evidence files. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-manifest.json |

## Community loop

Proves the Reddit-style hook: replies can become ranked game state.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Comment challenge | ready | The app exports a comment prompt with a Review link. | https://signal-garden.vercel.app/ |
| Route import | ready | Review links and short coordinate replies can be parsed into ranked proposals. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-field-pack.md |
| Top route ghost | ready | The board can replay or apply the leading community route. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/demo-script.md |
| Community launch plan | ready | Route proof, reply depth, return hook, and first action are packaged for a demo-post launch. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/src/communityLaunchPlan.js |
| Daily recap | ready | A copyable recap summarizes routes, contributors, and next-day return cue. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/reddit-demo-post-draft.md |

## Return loop

Shows why a player has a reason to come back after the first solve.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Return map | ready | Seven-day archive surface shows completed, preview, partial, and open slots. | https://signal-garden.vercel.app/ |
| Daily missions | ready | Daily objectives and contribution checks create short-session progression. | https://signal-garden.vercel.app/ |
| Sample week | ready | Sample week preview demonstrates retention surface without stored private data. | https://signal-garden.vercel.app/?sampleWeek=1 |
| Return pledge | ready | App exports a next-day prompt that can be used in the demo post or recap. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/launch-readiness.md |

## Platform handoff

Keeps account-owner actions separate from public, reusable evidence.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Devvit readiness | ready | Report explains WebView surface, server adapter, and dependency boundary. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/devvit-readiness-report.md |
| Developer feedback pack | ready | Evidence-backed feedback fields are prepared without submitting a form. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/developer-feedback-form-pack.md |
| Batch submission desk | ready | Copy blocks and links are ordered for user-present platform gates. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/batch-submission-desk.md |
| Public demo post | user-gated | Account owner posts later; draft is prepared. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/reddit-demo-post-draft.md |

## Feedback award readiness

Shows that the optional developer feedback route is evidence-backed and account-owner gated.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Survey answer pack | ready | Prepared answers follow the public form order and include character counts for constrained fields. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/developer-feedback-form-pack.md |
| Eligibility gate | ready | Checklist names the required participant account, project entry, username match, and public proof checks before submission. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/developer-feedback-form-pack.md |
| Actionable platform feedback | ready | Feedback is tied to concrete Devvit game-building gaps: WebView assets, expanded-mode lifecycle, comment-to-state flow, and evidence handoff. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/platform-feedback-pack.md |
| Feedback confirmation | optional | Only record this after the account owner submits the survey. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/developer-feedback-form-pack.md |

## Final submission guard

Names what must be true immediately before pressing a platform submit button.

| Item | Status | Evidence | Link |
|---|---:|---|---|
| Submission window | ready | Submission window: open Submissions close July 15, 2026 at 6:00 PM Pacific; 19 days remain. Rules source: https://redditgameswithahook.devpost.com/rules | https://redditgameswithahook.devpost.com/rules |
| App listing | user-gated | Account owner creates listing later. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-runbook.md |
| Local verification | ready | Run check, tests, builds, local/devvit/pages/submission audits, public URL audit, and npm audit. | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/public-verification.md |

## Final Pre-Submit Command

```powershell
npm run audit:public -- --base-url 'https://signal-garden.vercel.app/' --day '2026-06-27'
npm run audit:submission
npm audit --audit-level=moderate
```
