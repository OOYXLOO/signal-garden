# Signal Garden Submission Runbook

Generated for day: 2026-06-28

This runbook orders the public handoff steps for the account owner. It does not contain credentials, cookies, private account pages, payment data, or identity material.

## Public Evidence Pack

- Public app: https://signal-garden.vercel.app/
- Sample route: https://signal-garden.vercel.app/?day=2026-06-28&sample=1
- Judge desk: https://signal-garden.vercel.app/judge.html
- Source repository: https://github.com/OOYXLOO/signal-garden
- Devvit readiness report: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/devvit-readiness-report.md
- Devpost-style field pack: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/devpost-field-pack.md
- Reddit demo post draft: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/reddit-demo-post-draft.md
- Platform feedback pack: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/platform-feedback-pack.md
- Developer feedback form pack: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/developer-feedback-form-pack.md
- Devvit app listing: <fill after platform gate>
- Public Reddit demo post: <fill after posting gate>
- Platform feedback confirmation: <fill only if a public confirmation URL exists>

## Stage 0 - Public Preflight

1. Open the public app and confirm the board renders.
2. Open the sample route and confirm it displays a solved route and review surfaces.
3. Open the judge desk and confirm links to demo media, manifest, criteria fit, Devvit readiness, field pack, demo post draft, and feedback pack.
4. Open the source repository and confirm the README, docs, and verification scripts are public.

Expected local check:

```powershell
npm run audit:public -- --base-url 'https://signal-garden.vercel.app/' --day '2026-06-28'
npm run audit:submission
```

## Stage 1 - Devvit App Listing

Account-owner action:

1. Sign in to Reddit / Devvit.
2. Create or open the Signal Garden app listing.
3. Use the public app, sample route, source repo, and Devvit readiness report as the evidence set.
4. Run a real playtest if the platform flow supports it.
5. Record only the public app listing URL here or in local notes.

Output needed for final pack:

- Public Devvit app listing URL.
- Any public playtest URL or public note, if the platform exposes one.

Do not copy passwords, OTPs, cookies, private account pages, payment settings, or identity/KYC screens.

## Stage 2 - Reddit Demo Post

Account-owner action:

1. Open the Reddit demo post draft.
2. Use the suggested title, body, and first comment.
3. Include the public app, sample route, judge desk, source repo, and feedback pack links.
4. Publish only when the account owner is comfortable with the subreddit and content.
5. Record the public demo post URL.

Output needed for final pack:

- Public Reddit demo post URL.

## Stage 3 - Devpost-Style Submission Fields

Account-owner action:

1. Open the Devpost-style field pack.
2. Fill project name, tagline, public URLs, description, built-with list, testing instructions, and honest current weaknesses.
3. Attach `docs/demo-final-captioned.webm` or provide a final public video URL.
4. Before final submit, run the generated field export command again with the real app listing and demo post URLs.

Command after app listing and demo post exist:

```powershell
npm run export:devpost-fields -- --public-app-url 'https://signal-garden.vercel.app/' --source-repo-url 'https://github.com/OOYXLOO/signal-garden' --day '2026-06-28' --app-listing-url '<public-app-listing-url>' --demo-post-url '<public-demo-post-url>'
```

## Stage 4 - Platform Feedback Form

Account-owner action:

1. Open the platform feedback pack.
2. Open the developer feedback form pack and copy answers in the public form question order.
3. Prefer the evidence-backed Actionability Matrix when a form allows multiple paragraphs.
4. Use the medium single-field version for a compact text field.
5. Use the short single-field version if the form is very constrained.
6. If the form returns a public confirmation URL, record it. If it returns only a private confirmation screen, keep it out of public docs.

## Final Evidence Return

After the account-owner gates, the only values needed back in this repository or local notes are public URLs:

- Public Devvit app listing URL.
- Public Reddit demo post URL.
- Final public video URL, if not using the committed WebM upload.
- Public feedback confirmation URL, only if one exists.

Then regenerate the final submission pack:

```powershell
npm run export:submission-pack -- --public-app-url 'https://signal-garden.vercel.app/' --day '2026-06-28' --sample-route --source-repo-url 'https://github.com/OOYXLOO/signal-garden' --app-listing-url '<public-app-listing-url>' --demo-post-url '<public-demo-post-url>'
npm run audit:submission
```
