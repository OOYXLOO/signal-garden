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

It also has a local server adapter that mirrors the future Devvit API shape:

- `devvit.json`
  - post entrypoints for `splash.html` and `game.html`
  - server entrypoint for `dist/server/index.cjs`
- `vite.devvit.client.config.js`
  - builds `dist/client/splash.html`
  - builds `dist/client/game.html`
- `vite.devvit.server.config.js`
  - builds `dist/server/index.cjs`
- `src/server/signalGardenApi.js`
  - `init`
  - `submitProposal`
  - `archive`
  - `handleRequest`
- `src/devvit/server/index.js`
  - routes `/internal/menu/post-create`
  - returns a Devvit-style `navigateTo` response when a platform post helper is injected
  - returns a local `showToast` response when the platform helper is absent
- `src/server/memoryProposalStore.js`
  - local in-memory store used only for tests and pre-Devvit development.
- `src/server/redisProposalStore.js`
  - Redis-shaped proposal store using hashes and sorted sets.
  - accepts an injected Redis object so the source remains buildable before account setup.
- `src/client/communityClient.js`
  - local client adapter used by the browser UI.
  - fetch client adapter used by the Devvit client entry for hosted same-origin routes.
- `src/devvit/client/game-entry.js`
  - starts the game manually.
  - injects `createFetchCommunityClient({ baseUrl: window.location.origin })`.
- `src/state/browserProposalStore.js`
  - browser-backed local store used only by the local adapter.

## Candidate Devvit Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/init` | GET | Return today's board, current consensus, and viewer-safe display state. |
| `/api/proposal` | POST | Accept a bounded mirror plan, recompute the score server-side, and store one proposal. |
| `/api/archive/:day` | GET | Return a read-only summary for a previous board. |
| `/internal/menu/post-create` | POST | Create a daily relay custom post through the platform helper when running in Devvit. |

The server route should never trust a client-provided score. It should recompute through `traceSignal` and `createProposal`.

`tests/serverAdapter.test.mjs` verifies this by sending a forged client score and confirming the adapter ignores it.

`tests/communityClient.test.mjs` verifies both the local client adapter and a hosted fetch-shaped adapter.

`tests/redisProposalStore.test.mjs` verifies save, list, duplicate replacement, and bounded trimming against a fake Redis implementation.

`tests/devvitServerShell.test.mjs` verifies the Devvit server shell can use an injected Redis-shaped object.
