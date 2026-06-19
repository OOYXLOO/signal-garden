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
- The board can represent individual proposals or community consensus.
- The briefing format is small enough to fit inside a post, comment, or chat surface.
- The renderer is independent of the puzzle rules, so the rules can move to a server or platform adapter later.

## Community Proposal Layer

The current prototype saves proposals locally, ranks completed paths above partial paths, and produces a compact consensus payload. Applying the top proposal uses the best saved plan rather than a hidden answer. This keeps the community loop testable before a platform adapter exists.

Future server routes should recompute every proposal score from the shared puzzle module instead of trusting client-provided values.

## Visual Language

- Warm paper background for a puzzle-table feel.
- Teal signal path, coral receiver, amber beacons, violet mirrors.
- Ghost mirrors show the suggested community plan without solving the board automatically.
