# Devpost Final Field Pack - Signal Garden

## Project Name

Signal Garden

## Tagline

A daily cooperative Reddit puzzle where players route signal tiles, compare paths, and return for a fresh board.

## Project URL / Source Code

```text
https://github.com/OOYXLOO/signal-garden/tree/codex/devvit-phaser-prototype
```

## Demo Video / Public Demo Page

```text
https://ooyxloo.github.io/oid-knowledge-lab/signal-garden-demo.html
```

Direct video:

```text
https://ooyxloo.github.io/oid-knowledge-lab/assets/signal-garden-demo.webm
```

## Screenshots

```text
https://ooyxloo.github.io/oid-knowledge-lab/assets/signal-garden-splash.png
https://ooyxloo.github.io/oid-knowledge-lab/assets/signal-garden-game.png
```

## Inspiration

Reddit games work best when they create a tiny shared ritual: people can play quickly, compare outcomes, and talk about what they tried. Signal Garden is built around that loop. Each post becomes a compact routing puzzle with a visible score and a natural reason for comments: finding a better path.

## What It Does

Signal Garden gives players a 5x5 signal-routing board. The player rotates tiles to connect the left root to the right bloom. The game tracks moves, score, solved state, hints, today's seed, a local best score, and a copyable result line that is ready to paste into Reddit comments.

The Reddit-native hook is the shared daily board: a post can carry the same seed for everyone, so players can compare routes, share scores, and return for tomorrow's puzzle.

## How We Built It

- Devvit app structure with separate splash and game entrypoints.
- Phaser for the 2D game surface.
- TypeScript simulation module for tile state, rotation, signal propagation, scoring, and hints.
- Hono server endpoints for Reddit initialization and post creation flow.
- `/api/init` seed handling with a local static fallback for non-Reddit previews.
- DOM HUD for seed, score, moves, best score, controls, and readable status text.
- Local best-score storage and copyable result text for community comparison.

## Challenges

The main design challenge was making a puzzle that is readable inside a compact Reddit surface. The core loop had to be clear in seconds, but still support replay and discussion. The implementation also needed to keep simulation logic separate from Phaser rendering so the same rules can be tested, replayed, and connected to Reddit post state later.

## Accomplishments

- Built a playable 5x5 Phaser routing puzzle.
- Added move count, score, solved state, hints, daily seed, and best score.
- Added a copyable Reddit comment result format.
- Added tested simulation and sharing logic.
- Added Devvit `/api/init` seed parsing with local fallback.
- Generated public screenshots and a public demo video page.
- Published source on a neutral GitHub branch for reviewer access.
- Verified local type-check, tests, build, and browser smoke.

## What We Learned

Small Reddit games need a social loop as much as a mechanical loop. The strongest version of Signal Garden is not just "solve the board"; it is "solve the board, compare your path, and come back tomorrow."

## What's Next

- Run the final Reddit Developer / Devvit playtest inside a logged-in developer session.
- Persist daily seed and score data through the Reddit app surface.
- Add post-level score summaries.
- Add puzzle difficulty tuning for daily boards.
- Submit the final Devpost entry after the Reddit playtest gate is verified.

## Built With

```text
Devvit
Phaser
TypeScript
Vite
Hono
Vitest
```

## Current Gate Note

The local build, public source branch, screenshots, and public demo video page are ready. The remaining platform gate before final submission is validating the interactive post in Reddit Developer / Devvit playtest.
