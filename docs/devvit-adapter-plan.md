# Community Platform Adapter Plan

The browser prototype keeps the game rules separate from the renderer so the same daily board can later be exposed inside a community post surface.

## Candidate Data Shape

```json
{
  "day": "2026-06-19",
  "board": "north-arcade",
  "proposal": [
    { "x": 3, "y": 4, "mirror": "slash" },
    { "x": 3, "y": 1, "mirror": "slash" }
  ],
  "score": 1014,
  "complete": true
}
```

## Adapter Responsibilities

- Store one daily board state per community.
- Accept a bounded player proposal.
- Recompute score from the shared puzzle module.
- Render the current consensus and next prompt.
- Avoid collecting private user data beyond platform-provided public interaction metadata.

