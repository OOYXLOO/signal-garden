# Signal Garden Batch Submission Desk

Day: `2026-06-26`

## Open In Order

1. Public app: https://ooyxloo.github.io/signal-garden/
   Purpose: Confirm the board, reviewer panel, submission readiness, and evidence receipt render.
2. Sample route: https://ooyxloo.github.io/signal-garden/?day=2026-06-26&sample=1
   Purpose: Use this for first-minute review when no final route token has been copied.
3. Judge desk: https://ooyxloo.github.io/signal-garden/judge.html
   Purpose: Copy the evidence packet and inspect media, manifest, rubric, and source links.
4. Source repository: https://github.com/OOYXLOO/signal-garden
   Purpose: Give reviewers public source, docs, media, and verification scripts.
5. Reddit demo post draft: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/reddit-demo-post-draft.md
   Purpose: Copy only after the account owner creates the public demo post.
6. Developer feedback form pack: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/developer-feedback-form-pack.md
   Purpose: Use for the user-approved feedback form pass.
7. Feedback form: https://forms.gle/YByxxCneDsn174qb9
   Purpose: Submit only through the account-owner flow.

## Copy Blocks

### Pre-gate pack command

```text
npm run export:submission-pack -- --public-app-url 'https://ooyxloo.github.io/signal-garden/' --source-repo-url 'https://github.com/OOYXLOO/signal-garden' --day '2026-06-26' --sample-route --allow-pending-platform-gates --feedback-url 'https://forms.gle/YByxxCneDsn174qb9'
```
### Final pack command

```text
npm run export:submission-pack -- --public-app-url 'https://ooyxloo.github.io/signal-garden/' --source-repo-url 'https://github.com/OOYXLOO/signal-garden' --day '2026-06-26' --sample-route --app-listing-url '<public-app-listing-url>' --demo-post-url '<public-demo-post-url>' --feedback-url 'https://forms.gle/YByxxCneDsn174qb9'
```
### App listing placeholder

```text
<public-app-listing-url>
```
### Demo post placeholder

```text
<public-demo-post-url>
```

## External Gates

- Devvit app listing/playtest: account owner creates or opens the app listing, then records the public URL.
- Reddit demo post: account owner posts the demo thread, then records the public post URL.
- Devpost or related contest submission: account owner submits the project fields, source URL, media, and public demo links.
- Feedback survey/form: account owner submits only after checking the eligibility gate checklist.

## Safety Boundaries

- Do not paste passwords, OTPs, cookies, private account pages, payment settings, KYC screens, or platform secrets into this project.
- Do not claim app listing or demo post evidence until the public URLs exist.
- Do not edit generated public proof to imply live community data when using sample-route preview evidence.
