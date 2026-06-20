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
- Local-only persistence with no credentials or private account data.
- Local proposal consensus that ranks saved player plans.
- A real "apply top proposal" flow: the UI applies the best saved community plan, not a hidden answer.
- Share links that reopen the same daily route for review or discussion.
- Recent local archive and streak state for the daily return loop.
- Completion pulse feedback for solved boards.
- Short Web Audio cues with a persistent mute toggle.
- Replay route animation for the current plan.
- Status hints and board markers for blocked, lost, and partial routes.
- Route insight cards that explain the next useful adjustment after drafting, early receiver hits, blocked paths, or escaped signals.
- Optional progressive hints that reveal solution mirrors only when the player asks.
- Demo script, submission field pack, local silent WebM demo, captioned walkthrough draft, and final captioned demo candidate with explainable route feedback.
- Server-shaped adapter for init, proposal submission, and archive reads.
- Redis-shaped proposal store and local Devvit shell build outputs for pre-account validation.

No production account setup, hosting configuration, or platform submission is performed by this repository.

## Dependency Note

The repository intentionally keeps official Devvit CLI packages out of normal dependencies until a live platform playtest is performed in an isolated, user-approved environment. The local shell is designed to keep the app buildable and testable without storing account tokens or platform credentials.

`npm run record:demo`, `npm run record:demo:captioned`, and `npm run record:demo:final` are optional and require Playwright to be available in the local Node environment. They record only the local app at `127.0.0.1`; they do not access platform accounts.
