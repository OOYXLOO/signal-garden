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
```

## Scope

- Browser-first Phaser game loop.
- Deterministic daily puzzle seed.
- Local-only persistence with no credentials or private account data.
- Adapter boundary notes for a community platform surface.
- Local Devvit shell build outputs for pre-account validation.

No production account setup, hosting configuration, or platform submission is performed by this repository.
