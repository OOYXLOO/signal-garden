# Public Status Receipt - 2026-06-27

This receipt records a public review pass for Signal Garden. It is intended for reviewers who want to verify that the static build, judge desk, source evidence, and copy-ready submission materials are reachable without account access.

## Public Surfaces

| Surface | URL | Status |
| --- | --- | --- |
| Playable app | https://ooyxloo.github.io/signal-garden/ | HTTP 200 |
| Sample review route | https://ooyxloo.github.io/signal-garden/?day=2026-06-27&sample=1 | HTTP 200 |
| Judge desk | https://ooyxloo.github.io/signal-garden/judge.html | HTTP 200 |
| Source repository | https://github.com/OOYXLOO/signal-garden | Public |
| Devvit listing pack | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/devvit-listing-pack.md | HTTP 200 |
| Submission manifest | https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-manifest.json | HTTP 200 |

## Verification Commands

The following checks passed locally before this receipt was added:

```powershell
npm run check
npm test
npm run build
npm run audit:submission
npm run audit:public -- --base-url https://ooyxloo.github.io/signal-garden/ --day 2026-06-27
curl.exe -L -s -o NUL -w "%{http_code} %{size_download} %{url_effective}\n" https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/devvit-listing-pack.md
curl.exe -L -s -o NUL -w "%{http_code} %{size_download} %{url_effective}\n" https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/submission-manifest.json
```

## Remaining Platform URLs

These are expected to be filled only after the app owner completes the relevant platform flow:

- Devvit app listing URL
- Public Reddit demo post URL
- Final Devpost submission URL

No passwords, cookies, tokens, private account pages, payment data, or platform secrets are part of this repository.
