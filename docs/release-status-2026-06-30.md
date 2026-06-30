# Signal Garden Release Status - 2026-06-30

Signal Garden is ready for public review as a web game and source snapshot.

## Public Links

- App: https://signal-garden.vercel.app/
- Judge desk: https://signal-garden.vercel.app/judge.html
- Source: https://github.com/OOYXLOO/signal-garden
- Current submission pack: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-pack-current.md

## Verification

Latest local verification:

```text
npm test
npm run audit:release -- --json
```

Both checks passed. The release audit reported the public app URL, source repo URL, git origin, branch, and working tree as ready.

Public HTTP checks returned `200` for:

- `https://signal-garden.vercel.app/`
- `https://signal-garden.vercel.app/judge.html`
- `https://github.com/OOYXLOO/signal-garden`
- `https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-pack-current.md`

## Remaining Platform Items

The game still needs final platform-side URLs before the submission packet can be considered complete:

- Devvit app listing URL
- Public Reddit demo post URL

After those URLs exist, regenerate the submission pack with the final platform links.
