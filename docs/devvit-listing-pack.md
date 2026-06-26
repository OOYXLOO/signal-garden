# Devvit Listing Pack

Generated: 2026-06-26

This copy-ready pack keeps the account-owner listing flow short after the Reddit humanity check. It only contains public project material.

## Listing Fields

| Field | Copy |
| --- | --- |
| Display name | Signal Garden |
| App slug | signalgardenyxl |
| Template | phaser |
| Tagline | A daily community relay puzzle that turns each solved route into tomorrow's challenge. |
| Short description | Signal Garden is a daily community relay puzzle: players solve a route, leave a rationale, and seed the next day's board. |
| Audience | Small Reddit communities that want a low-friction daily puzzle thread, lightweight collaborative reasoning, and a clear route recap. |
| Review note | The public web build is available for source and gameplay review before the app-owner playtest. The Devvit shell is ready for account-owner upload after the humanity check. |

## Long Description

Signal Garden is a Phaser puzzle prototype prepared for a Devvit shell. Each day presents a small signal-routing board with a reviewer-friendly sample route, rationale trail, community launch plan, and public evidence packet. The Devvit adapter adds an expanded-mode entry, a moderator menu for daily relay posts, same-origin community API calls, and a Redis migration boundary with memory fallback for local review.

## Public Evidence

- Playable public app: https://ooyxloo.github.io/signal-garden/
- Sample first-minute review route: https://ooyxloo.github.io/signal-garden/?day=2026-06-26&sample=1
- Judge desk: https://ooyxloo.github.io/signal-garden/judge.html
- Source repository: https://github.com/OOYXLOO/signal-garden
- Developer feedback field pack: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/developer-feedback-form-pack.md

## Post-Humanity Checklist

Start URL: https://developers.reddit.com/new/app?template=phaser
Humanity gate: https://developers.reddit.com/new/humanity-check?app_name=signalgardenyxl&app_name_verified=true

Run after the app owner completes the humanity check:

- `npx devvit upload --verbose`
- `npx devvit list apps`
- `npm run audit:release -- --json`
- `npm run export:submission-pack -- --public-app-url 'https://ooyxloo.github.io/signal-garden/' --source-repo-url 'https://github.com/OOYXLOO/signal-garden' --day '<YYYY-MM-DD>' --sample-route --app-listing-url '<public-app-listing-url>' --demo-post-url '<public-demo-post-url>' --feedback-url 'https://forms.gle/YByxxCneDsn174qb9'`

Record public URLs:

- Devvit app listing URL: `<public-app-listing-url>`
- public Reddit demo post URL: `<public-demo-post-url>`

## Boundaries

- No passwords, OTPs, cookies, private account pages, payment settings, KYC screens, or platform secrets belong in this repository.
- Use public listing and demo post URLs only after the app owner creates them.
- Do not claim live community evidence when the sample route is being used for first-minute review.
