# Signal Garden Vercel Production Proof - 2026-06-28

This note records the public production deployment surface for reviewers. It contains no credentials, cookies, private account pages, payment data, or identity material.

## Production URLs

- Public app: <https://signal-garden.vercel.app/>
- Sample route: <https://signal-garden.vercel.app/?day=2026-06-28&sample=1>
- Judge desk: <https://signal-garden.vercel.app/judge.html>
- Demo video page: <https://signal-garden.vercel.app/demo-video.html>
- Source repository: <https://github.com/OOYXLOO/signal-garden>

## Vercel Project State

Observed with the Vercel CLI under the `c4ppp` scope after the account owner completed Google sign-in:

```text
Project: signal-garden
Latest Production URL: https://signal-garden.vercel.app
Node Version: 24.x
```

## Reviewer Value

The Vercel URL is the primary review URL because it avoids stale GitHub Pages paths and reflects the current production deployment. GitHub Pages remains a historical backup only when mentioned in older notes.

## Verification Command

```powershell
npm run audit:public -- --base-url 'https://signal-garden.vercel.app/' --day '2026-06-28'
npm run audit:submission
```
