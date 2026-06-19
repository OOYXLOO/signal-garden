# Devvit Shell Readiness

Generated: 2026-06-20

## Ready Locally

- Shared puzzle rules are independent from the Phaser renderer.
- Proposal creation and scoring are server-safe: scores are recomputed from the plan.
- A local API adapter mirrors the future Devvit route shape:
  - `GET /api/init`
  - `POST /api/proposal`
  - `GET /api/archive/:day`
- A memory store exists for tests and local pre-Devvit development.
- Tests prove a forged client score is ignored.

## Not Yet Done

- No Devvit app has been created.
- No Reddit account page has been opened by automation.
- No playtest, install, post creation, publishing, or Devpost submission has been performed.
- The local memory store still needs to be replaced by the platform storage layer.
- The Phaser client still talks to local storage; it has not been wired to a Devvit-hosted API.

## Next Engineering Step

Use the official Phaser starter structure as the migration shell:

1. Move the existing browser game into the starter client entrypoint.
2. Wrap `createSignalGardenApi` inside the Devvit server route layer.
3. Replace `MemoryProposalStore` with a storage adapter backed by the platform storage API.
4. Keep `tests/serverAdapter.test.mjs` as the contract test while the storage implementation changes.

## Account Gate

The following actions require the account owner to be present:

- `devvit login`
- creating or selecting a test community
- running a real playtest against a Reddit surface
- creating a demo post
- uploading media
- submitting to Devpost

