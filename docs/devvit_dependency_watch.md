# Devvit Dependency Watch

Generated: 2026-06-22

Signal Garden keeps the official Devvit CLI and SDK packages out of the default repository dependencies until a real platform playtest runs in an isolated environment.

## Current Package Snapshot

- `devvit@0.13.4` is the current `latest` release on npm.
- `devvit@0.13.4` depends on `@devvit/cli@0.13.4`.
- `@devvit/public-api@0.13.4` is published and brings the current public API chain.
- `devvit@1.0.0` exists, but npm marks it as deprecated and the package is a tiny placeholder.
- `@devvit/public-api@1.0.0` is not published.

## Isolated Audit Result

The dependency check was run outside the repository in:

`C:\Users\YXL\.codex\tmp\signal-garden\devvit-audit-20260622-0918`

Command shape:

```powershell
npm init -y
npm install --package-lock-only --ignore-scripts devvit@0.13.4 @devvit/public-api@0.13.4
npm audit --audit-level=moderate --json
```

Result summary:

- Total audit findings: 23
- Low: 2
- Moderate: 17
- High: 4
- High-level affected chain includes `@devvit/cli`, `protobufjs`, `tmp`, and `ws`.
- The suggested `devvit@1.0.0` remediation is not usable for this project because that package is deprecated and the matching `@devvit/public-api@1.0.0` package is absent.

## Repository Policy

- Keep `devvit` and `@devvit/public-api` out of `package.json` for normal local development.
- Keep the local Devvit shell buildable through Vite, plain JavaScript, and adapter contracts.
- Keep `npm audit --audit-level=moderate` clean for this repository's installed dependency set.
- Run official Devvit CLI commands only in a short-lived, isolated playtest directory when an account owner is present.
- Re-check this file before a platform submission if npm publishes a newer Devvit chain.

