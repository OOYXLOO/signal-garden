# Signal Garden Feedback Award Submission Brief

This brief supports the public Developer Feedback Survey handoff for Signal Garden. It is copy-only evidence and does not submit the form, join a challenge, post to Reddit, or access private account pages.

## Public Evidence

- Public app: <https://signal-garden.vercel.app/>
- Sample route: <https://signal-garden.vercel.app/?day=2026-06-28&sample=1>
- Judge desk: <https://signal-garden.vercel.app/judge.html>
- Source repository: <https://github.com/OOYXLOO/signal-garden>
- Developer feedback form pack: <https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/developer-feedback-form-pack.md>
- Platform feedback pack: <https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/platform-feedback-pack.md>
- Devvit readiness report: <https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/devvit-readiness-report.md>

## Eligibility Checklist

Before any account-side feedback submission:

1. The submitting account has joined the hackathon.
2. The Signal Garden Devpost project entry has been started.
3. The username field is replaced with the actual submitting Reddit username.
4. The public app, sample route, judge desk, source repository, and raw evidence links return HTTP 200.
5. The final answer contains only public evidence and no credentials, tokens, private account screenshots, payment data, or identity material.

## Why The Feedback Is Actionable

The feedback is based on a working Phaser/Vite game and a Devvit-shaped shell, not on a generic opinion. Each recommendation names a concrete gap, explains the integration risk, and provides a reproduction path.

| Gap | Reproduction | Requested improvement |
| --- | --- | --- |
| Phaser static assets in Devvit WebView | Build a Vite/Phaser app once with a root asset base and once with a relative base, then open `splash.html` and `game.html` from a nested static path. | Publish a Vite/Phaser asset checklist with relative base paths, WebView path examples, and an audit command for generated bundles. |
| Splash-to-expanded-game lifecycle | Open the splash shell locally, click the launch control, and compare the posted `devvit-internal` immersive-mode message with the browser fallback path. | Document the message shape, route handoff, token/context boundaries, and local preview fallback in one minimal sample. |
| Comments becoming game state | Paste a sample route link or compact coordinate reply into the import flow and verify the ranked consensus list, skip reasons, and top route state. | Add a comment parser example that validates a player route server-side, stores it, ranks it, and reflects a recap into the thread. |
| Submission evidence handoff | Run the export commands, then compare generated URLs and hashes with the public judge desk and raw docs before final form submission. | Provide a final submission packet template that names every public app, sample route, source, listing, post, media, feedback, and manifest field. |

## Strongest Single-Field Answer

```text
I built Signal Garden, a daily Phaser relay puzzle with a Devvit-shaped client/server shell, shareable review links, comment route import, proposal scoring, launch packet export, and a 390px mobile smoke check. My main feedback is that the Devvit game path needs a clearer end-to-end workflow. First, please add a Phaser + Vite asset checklist for WebView/static hosting, especially relative asset paths instead of root /assets assumptions. Second, document the splash-to-expanded-game lifecycle with the expected message shape, entrypoint transition, token/context handoff, and local fallback. Third, add a comment-to-game-state example: parse a reply, validate it server-side, rank it, and reflect the recap back into the post. Finally, publish a sample final submission packet that maps app listing, public demo post, source, media, and Devpost fields so builders know what evidence must be live before claiming it.
```

## Account-Side Values Still Needed

- Actual submitting Reddit username.
- Public Devvit app listing URL, if the platform exposes one.
- Public Reddit demo post URL, after the account owner posts it.
- Any public feedback confirmation URL, only if the form returns one.

Keep private confirmations, screenshots, account pages, and payment/tax/identity screens out of the repository.
