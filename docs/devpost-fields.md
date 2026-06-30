# Devpost Draft Fields

## Project Name

Signal Garden

## Tagline

A daily cooperative Reddit puzzle where players route signal tiles, compare paths, and return for a fresh board.

## Inspiration

Many Reddit games work because they create a tiny shared ritual: people can play quickly, compare outcomes, and talk about what they tried. Signal Garden is built around that loop. Each post becomes a compact puzzle board with a clear goal, a visible score, and room for comments about better routes.

## What It Does

Signal Garden gives players a 5x5 signal-routing board. The player rotates tiles to connect the left root to the right bloom. The game tracks moves, score, solved state, hints, today's seed, a local best score, and a copyable result line for comments. The long-term Reddit version is designed around daily seeded boards so a community can compare routes and return the next day.

## How We Built It

- Devvit app structure with separate splash and game entrypoints.
- Phaser for the 2D game surface.
- TypeScript simulation module for tile state, rotation, signal propagation, scoring, and hints.
- Hono server endpoints prepared for Reddit app initialization and post creation.
- DOM HUD for score, moves, controls, and readable status text.
- Local best-score storage and copyable result text for community comparison.

## Challenges

The main design challenge was keeping the game readable inside a compact Reddit surface. The core loop had to be simple enough to understand in seconds, but still support replay and community discussion. The implementation also separates simulation state from Phaser rendering so the game can later persist daily boards and scores through the Reddit app layer.

## Accomplishments

- Local Devvit structure builds successfully.
- The Phaser game renders from the Devvit client build output.
- The puzzle has playable rotation, signal propagation, score, move count, solved state, and hints.
- The HUD includes daily seed, best score, and copyable result text.
- Browser smoke testing confirmed a nonblank canvas, expected controls, and no console errors.

## What Is Next

- Run a Reddit developer playtest.
- Persist daily board seed and score data.
- Add a compact share/result message.
- Record a short demo video.
- Tune puzzle generation for more reliable daily difficulty.

## Built With

Devvit, Phaser, TypeScript, Vite, Hono.
