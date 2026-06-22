# Public Verification

Last checked: 2026-06-22

## Public Links

- Source: https://github.com/OOYXLOO/signal-garden
- GitHub Pages: https://ooyxloo.github.io/signal-garden/
- Sample reviewer route: https://ooyxloo.github.io/signal-garden/?day=2026-06-22&sample=1

## Verified Source Baseline

- Branch: `master`
- Baseline commit before this verification note: `0bbab8eddeab39303894ab7ee1ed683800626252`
- Baseline commit message: `Sync lockfile for CI`

The latest repository head is intentionally left to GitHub's commit history so this document does not become stale after documentation-only commits.

## Verified Checks

- `npm run check`
- `npm test`
- `npm run build:all`
- `npm run audit:local`
- `npm run audit:devvit`
- `npm run audit:pages`
- `npm run audit:submission`
- `npm run audit:public -- --base-url https://ooyxloo.github.io/signal-garden/ --day 2026-06-22`
- `npm audit --audit-level=moderate`

## Notes

The repository contains only public product code, static assets, documentation, and launch-readiness checks. Account-specific platform actions, app listing publication, and community posting are intentionally outside the repository.
