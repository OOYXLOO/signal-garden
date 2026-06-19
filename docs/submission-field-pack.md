# Submission Field Pack

Use this as source copy for a Devpost or project gallery submission after the live platform gate is complete.

## Short Description

Signal Garden is a daily Phaser relay puzzle where players place mirrors, guide one signal through three beacons, and turn each route into a community proposal.

## Long Description

Signal Garden explores a daily community puzzle loop for Reddit-style surfaces. A deterministic board appears each day with a source, receiver, blockers, three beacons, and a five-move limit. Players place mirrors to route the signal, then save the route as a proposal.

The proposal layer recomputes scores from the shared puzzle rules instead of trusting client-provided values. Saved proposals are ranked by completion, score, and move count, and the player can apply the current top proposal back onto the board. A compact archive and streak panel give the experience a reason to return on the next daily board.

The current build includes seven verified puzzle templates, Phaser rendering, local persistence, a server-shaped proposal adapter, a Redis-shaped store, and a Devvit shell for pre-account validation.

## What Makes It Social

- Each mirror route is a proposal.
- The top route can be applied by the community.
- The briefing output is short enough to fit in a post or comment.
- Daily boards and archive rows support recurring discussion.

## Technical Highlights

- Phaser + Vite browser game.
- Shared deterministic puzzle engine.
- Server-shaped `init`, `proposal`, and `archive` adapter.
- Score recomputation on proposal submission.
- Redis-shaped proposal store with tests.
- Devvit client/server shell build outputs.

## Demo Checklist

- Show a full board in the first five seconds.
- Complete a route through all three beacons.
- Save the proposal and show the consensus summary.
- Clear the board and apply the top proposal.
- Show daily seed, streak, archive, and briefing output.
- Avoid account pages and private consoles.

## Current Local Video Assets

- `docs/demo.webm`: silent interaction clip.
- `docs/demo-captioned.webm`: captioned walkthrough draft for quick review.
