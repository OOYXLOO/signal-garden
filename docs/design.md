# Signal Garden Design Notes

## Core Loop

1. A deterministic daily board appears.
2. The player places up to five mirrors.
3. The signal path updates instantly.
4. A completed route creates a compact briefing.
5. The result is saved into a recent archive.
6. The next daily board gives the player a reason to return.

## Differentiators

- The puzzle is readable in seconds but has a visible optimization target.
- Seven verified templates broaden the daily rotation without changing the core rules.
- The board can represent individual proposals or community consensus.
- The briefing format is small enough to fit inside a post, comment, or chat surface.
- The renderer is independent of the puzzle rules, so the rules can move to a server or platform adapter later.

## Community Proposal Layer

The current prototype saves proposals locally, ranks completed paths above partial paths, and produces a compact consensus payload. Applying the top proposal uses the best saved plan rather than a hidden answer. Share links encode the daily route so a post or review thread can reopen the same plan. This keeps the community loop testable before a platform adapter exists.

Future server routes should recompute every proposal score from the shared puzzle module instead of trusting client-provided values.

## Visual Language

- Warm paper background for a puzzle-table feel.
- Teal signal path, coral receiver, amber beacons, violet mirrors.
- Hint mirrors are hidden by default and appear one at a time only when the player asks, so the first board is not spoiled.
- Replay route uses a small moving marker to make the current plan readable without changing the puzzle state.
- A solved board flashes a short amber/coral pulse across the route, beacons, and receiver.
- Short generated audio cues reinforce solved, blocked, and replay moments, with a persistent mute toggle.
- Blocked, lost, and partial routes get an explicit status hint plus a board marker so the player knows where to revise the route.
- Route insight cards translate the current trace into short labels such as Next, Exit, Progress, Missing, and Last safe.
