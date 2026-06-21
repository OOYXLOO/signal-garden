# Signal Garden

Signal Garden is a daily community relay puzzle prototype built with Phaser.

Players place a small number of mirrors on a shared board, guide a signal through three beacons, and copy a compact briefing that can be used for community discussion or a later platform adapter.

## Local Run

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:8796/`.

## Quality Checks

```powershell
npm test
npm run check
npm run build
npm run build:devvit
npm run audit:local
npm run audit:devvit
npm run record:demo
```

## Scope

- Browser-first Phaser game loop.
- Deterministic daily puzzle seed.
- Seven verified puzzle templates for a broader daily rotation.
- Objective progress chips for the three beacons and receiver.
- Daily missions that connect route tracing, proposal saving, relay completion, and the rival target.
- Local-only persistence with no credentials or private account data.
- Adapter-backed proposal consensus that ranks saved player plans.
- Contributor board that aggregates completed routes and best scores by author.
- Daily community recap copy for discussion posts or comment follow-ups.
- Comment challenge prompt that packages the current score, Review link, and top route context for reply threads.
- Review snapshot export that packages the current route, community consensus, top saved route, and judge checks.
- Launch packet export that combines the demo post setup, Reddit fit checks, comment challenge, review snapshot, daily recap, and developer platform feedback notes in one copyable block.
- A real "apply top proposal" flow: the UI applies the best saved community plan, not a hidden answer.
- Share links that reopen the same daily route for review or discussion, even after the default daily board changes.
- Comment route import that turns a pasted review link or briefing into a ranked community proposal.
- Recent local archive and streak state for the daily return loop, with review links for saved routes.
- Briefing output that includes an exact review link whenever a route is present.
- Completion pulse feedback for solved boards.
- Short Web Audio cues with a persistent mute toggle.
- Replay route animation for the current plan.
- Status hints and board markers for blocked, lost, and partial routes.
- Route insight cards that explain the next useful adjustment after drafting, early receiver hits, blocked paths, or escaped signals.
- Optional progressive hints that reveal solution mirrors only when the player asks.
- Demo script, submission field pack, local silent WebM demo, captioned walkthrough draft, and final captioned demo candidate with explainable route feedback.
- Launch readiness checklist for user-approved platform submission gates.
- Server-shaped adapter for init, proposal submission, and archive reads.
- Devvit-style subreddit menu route for creating a daily relay post when a platform post helper is available.
- Devvit client entry uses the fetch-backed community client against the hosted origin.
- Redis-shaped proposal store and local Devvit shell build outputs for pre-account validation.

No production account setup, hosting configuration, or platform submission is performed by this repository.

## Dependency Note

The repository intentionally keeps official Devvit CLI packages out of normal dependencies until a live platform playtest is performed in an isolated, user-approved environment. The local shell is designed to keep the app buildable and testable without storing account tokens or platform credentials.

`npm run record:demo`, `npm run record:demo:captioned`, and `npm run record:demo:final` are optional and require Playwright to be available in the local Node environment. They record only the local app at `127.0.0.1`; they do not access platform accounts.
