# Devvit Shell Readiness

Generated: 2026-06-20

## Ready Locally

- Shared puzzle rules are independent from the Phaser renderer.
- Proposal creation and scoring are server-safe: scores are recomputed from the plan.
- A local API adapter mirrors the future Devvit route shape:
  - `GET /api/init`
  - `POST /api/proposal`
  - `GET /api/archive/:day`
- A local menu adapter mirrors the official subreddit menu endpoint shape:
  - `POST /internal/menu/post-create`
  - returns `navigateTo` when a platform post helper is injected
  - returns a clear `showToast` in the local shell when the platform helper is absent
  - submits a custom post payload with `entry: "default"`, day/source `postData`, a text fallback, user-generated-content enabled, and a tall dark WebView style
- A memory store exists for tests and local pre-Devvit development.
- Tests prove a forged client score is ignored.
- The browser UI now submits proposals through a `communityClient` boundary instead of directly writing the consensus list.
- The Devvit client entry starts the app manually with `createFetchCommunityClient({ baseUrl: window.location.origin })`.
- The Devvit splash entry now uses a lightweight expanded-mode shim: it posts the official-shaped `devvit-internal` immersive-mode message for the configured `game` entrypoint, injects the Devvit token into the game URL, and falls back to `game.html` in a normal browser.
- Browser validation confirms saved proposals reload through the local adapter store.
- A local `devvit.json` shell and Vite Devvit client/server builds exist for pre-account validation.
- Devvit build outputs now follow the official Phaser starter shape:
  - `dist/client`
  - `dist/server/index.cjs`
- The Devvit client build uses relative asset paths (`base: "./"`) so `splash.html` and `game.html` can be served from a static WebView directory without depending on root-level `/assets`.
- The Devvit game shell keeps the same reviewer fast path, launch packet, review snapshot, mission list, and rival target DOM contracts as the browser page.
- `npm run audit:devvit` verifies the configured entrypoint paths, built output paths, and menu endpoint stay in sync.
- The Devvit server shell test verifies the menu-created custom post payload includes `entry`, `postData`, `textFallback`, `userGeneratedContent`, and style height, rather than only a title.

## Dependency Watch

- `docs/devvit_dependency_watch.md` records the current npm package snapshot and isolated audit result.
- As of 2026-06-22, `devvit@0.13.4` is still the latest npm release and pulls `@devvit/cli@0.13.4`.
- An isolated `npm audit --audit-level=moderate` pass for `devvit@0.13.4` plus `@devvit/public-api@0.13.4` reports 23 findings, including 4 high-severity findings.
- `devvit@1.0.0` is not a usable migration target because npm marks it deprecated and `@devvit/public-api@1.0.0` is not published.
- Therefore the repository keeps the official Devvit CLI/API packages out of normal dependencies and uses the shell only as a contract-tested migration surface.

## Not Yet Done

- No Devvit app has been created or uploaded.
- No Reddit account page has been opened by automation.
- No playtest, install, real post creation, publishing, or Devpost submission has been performed.
- The Devvit server shell can accept `globalThis.signalGardenRedis`; without it, it falls back to `MemoryProposalStore` for local build validation.
- A Redis-shaped proposal store exists and is tested with a fake Redis implementation.
- The Devvit server shell test injects a Redis-shaped object and verifies proposals persist through that path.
- The default browser client still uses the local adapter. The Devvit client entry uses hosted same-origin routes.

## Next Engineering Step

Use the current shell as the real playtest migration surface:

1. Inject the platform Redis object as `globalThis.signalGardenRedis` or replace `createStore` with the official Devvit Redis import pattern.
2. Run the splash-to-game transition inside a real Devvit playtest and compare it with the local expanded-mode message test.
3. Bind the local menu route to the official post creation helper when the account owner runs a real playtest.
4. Keep `tests/serverAdapter.test.mjs`, `tests/communityClient.test.mjs`, and `tests/devvitSplash.test.mjs` as contract tests while the platform integration changes.

## Account Gate

The following actions require the account owner to be present:

- `devvit login`
- creating or selecting a test community
- running a real playtest against a Reddit surface
- creating a demo post
- uploading media
- submitting to Devpost

See `docs/launch-readiness.md` for the full user-approved launch checklist and submission field mapping.
