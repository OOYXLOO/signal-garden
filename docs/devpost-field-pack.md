# Signal Garden Devpost Field Pack

Generated for day: 2026-06-22

## Project Name

Signal Garden

## Tagline

Signal Garden is a daily Phaser relay puzzle where players place mirrors, guide one signal through three beacons, and turn each route into a community proposal.

## Project URL Fields

- Public app: https://ooyxloo.github.io/signal-garden/
- Sample route: https://ooyxloo.github.io/signal-garden/?day=2026-06-22&sample=1
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

## Built With

Phaser, Vite, JavaScript, Devvit-shaped client/server shell, GitHub Pages, Web Audio, deterministic puzzle engine, local proposal store, Redis-shaped proposal store.

## What Makes It Social

- Each mirror route is a proposal.

## Technical Highlights

- Phaser + Vite browser game.

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
npm run audit:public -- --base-url 'https://ooyxloo.github.io/signal-garden/' --day '2026-06-22'
npm run export:devpost-fields -- --public-app-url 'https://ooyxloo.github.io/signal-garden/' --source-repo-url 'https://github.com/OOYXLOO/signal-garden' --day '2026-06-22'
npm run audit:submission
```
