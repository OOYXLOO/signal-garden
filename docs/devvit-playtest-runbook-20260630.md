# Devvit Playtest Runbook

## Current CLI Status

Verified local CLI:

```text
node_modules\.bin\devvit.cmd --version
@devvit/cli/0.13.5 win32-x64 node-v24.13.0
```

Current login status:

```text
node_modules\.bin\devvit.cmd whoami
Error: Not currently logged in. Try `devvit login` first
```

## Why this matters

Signal Garden is ready as a local Devvit / Phaser prototype, with public source, screenshots, and a public demo page. The remaining platform gate is validating the interactive post inside Reddit Developer / Devvit playtest.

## Commands

Run from the repository root.

```powershell
npm install
node_modules\.bin\devvit.cmd login
node_modules\.bin\devvit.cmd whoami
npm run build
node_modules\.bin\devvit.cmd playtest
```

Use `node_modules\.bin\devvit.cmd` directly. On this machine, `npx devvit` can hang even though the local CLI works.

## Playtest Checks

Confirm these before final Devpost submission:

- Reddit login completes.
- `whoami` prints the expected Reddit account.
- `devvit playtest` starts without upload/install errors.
- Splash entrypoint opens.
- Game entrypoint opens.
- `Create Signal Garden post` menu item is visible for the test subreddit.
- Today's board is playable inside Reddit.
- Move count, score, hint, and copy result work.
- Console/log output has no blocking runtime errors.

## Public Submission Links

Source branch:

```text
https://github.com/OOYXLOO/signal-garden/tree/codex/devvit-phaser-prototype
```

Demo page:

```text
https://ooyxloo.github.io/oid-knowledge-lab/signal-garden-demo.html
```

Final Devpost field pack:

```text
docs/devpost-final-fields-20260630.md
```

## Do not do during playtest

- Do not publish the app before playtest checks pass.
- Do not include credentials, cookies, tokens, payment details, identity documents, or private account data in logs or screenshots.
- Do not claim the Reddit integration is complete until the app has been tested inside Reddit.
