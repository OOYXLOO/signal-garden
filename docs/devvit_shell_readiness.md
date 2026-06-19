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
- The browser UI now submits proposals through a `communityClient` boundary instead of directly writing the consensus list.
- Browser validation confirms saved proposals reload through the local adapter store.
- A local `devvit.json` shell and Vite Devvit client/server builds exist for pre-account validation.

## Not Yet Done

- No Devvit app has been created or uploaded.
- No Reddit account page has been opened by automation.
- No playtest, install, post creation, publishing, or Devpost submission has been performed.
- The Devvit server shell still uses `MemoryProposalStore`; it must be replaced by platform storage before a real playtest.
- The default browser client still uses the local adapter. Switching to hosted Devvit routes should use `createFetchCommunityClient`.

## Next Engineering Step

Use the official Phaser starter structure as the migration shell:

1. Replace `MemoryProposalStore` with a storage adapter backed by the platform storage API.
2. Point `createFetchCommunityClient` at the hosted route root inside the Devvit client build.
3. Add post creation flow through the official menu endpoint shape.
4. Keep `tests/serverAdapter.test.mjs` and `tests/communityClient.test.mjs` as contract tests while the storage implementation changes.

## Account Gate

The following actions require the account owner to be present:

- `devvit login`
- creating or selecting a test community
- running a real playtest against a Reddit surface
- creating a demo post
- uploading media
- submitting to Devpost
