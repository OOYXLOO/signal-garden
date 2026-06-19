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

## Current Local Adapter Boundary

The browser prototype now has a storage-neutral consensus layer:

- `src/game/proposals.js`
  - `createProposal`
  - `rankProposals`
  - `summarizeConsensus`
  - `toCommunityPayload`
- `src/state/store.js`
  - local-only proposal persistence that can be replaced by a Devvit server route later.

## Candidate Devvit Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/init` | GET | Return today's board, current consensus, and viewer-safe display state. |
| `/api/proposal` | POST | Accept a bounded mirror plan, recompute the score server-side, and store one proposal. |
| `/api/archive/:day` | GET | Return a read-only summary for a previous board. |

The server route should never trust a client-provided score. It should recompute through `traceSignal` and `createProposal`.
