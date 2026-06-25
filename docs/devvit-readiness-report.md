# Devvit Readiness Report

Generated: 2026-06-26

Verdict: READY_FOR_ACCOUNT_OWNER_PLAYTEST

This report is generated from repository config, source files, and public handoff docs. It is meant to give reviewers a compact view of the Devvit migration surface without requiring private accounts or platform tokens.

## Readiness Checks

| Status | Check | Evidence |
| --- | --- | --- |
| PASS | Devvit app config has a stable public name | devvit.json name is signal-garden |
| PASS | Client has splash and game entrypoints | default=splash.html, game=game.html |
| PASS | Server entry is built to the configured path | server dir dist/server, entry index.cjs |
| PASS | Moderator menu creates a daily relay post | subreddit moderator endpoint /internal/menu/post-create |
| PASS | Package scripts include Devvit build and audit commands | build:devvit, build:all, audit:devvit |
| PASS | Required Devvit handoff files exist | 14 required files present |
| PASS | Splash requests Devvit expanded mode with browser fallback | expanded-mode message plus game.html fallback |
| PASS | Game entry uses same-origin community API calls | manual startup with same-origin fetch client |
| PASS | Server shell exposes init, proposal, archive, and menu routes | shared API plus menu post-create route |
| PASS | Menu-created custom posts include Devvit-ready entry, fallback, post data, and styles | submitCustomPost payload includes entry, postData, textFallback, userGeneratedContent, and TALL height |
| PASS | Redis migration boundary is isolated | global Redis injection with memory fallback |

## Account-Owner Gates

- Run devvit login with the account owner present.
- Create or select the Reddit test community.
- Create the Devvit app listing and run a real playtest.
- Create the public Reddit demo post.
- Submit the final Devpost or platform form with public URLs.

## Recommended Local Commands

- `npm run build:devvit`
- `npm run audit:devvit`
- `npm run export:submission-manifest -- --output docs/submission-manifest.json`

## Boundary

The public repository is ready for source review and account-owner playtest preparation. It does not include credentials, cookies, private account pages, production tokens, payment data, or KYC material.
