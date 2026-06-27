# Signal Garden Developer Platform Feedback

## Project Name
Signal Garden

## What I Built
Signal Garden is a daily Phaser relay puzzle for Reddit-style interactive posts. Players place mirrors to route one signal through three beacons, save each route as a proposal, import route links from comments, compare community proposals, and export a launch packet for demo-post discussion and review.

## Current Stage
Local prototype and Devvit shell validation. Current local board: 2026-06-28 South lantern. Route state: complete, 1016 pts, 3/3 beacons, 2/5 moves. Community loop: 1/1 saved routes complete. Review path: https://signal-garden.vercel.app/?day=2026-06-28&plan=6-3-s.1-3-s

## Survey Handoff Checklist
- Use the public app URL and one sample route so reviewers can reproduce the exact game state before reading the feedback.
- Mention the concrete implementation surfaces: Phaser/Vite build, Devvit-shaped client/server shell, splash entrypoint, comment route import, proposal ranking, Redis-shaped persistence, and mobile smoke checks.
- Keep each recommendation actionable: name the missing doc/example, explain the integration risk it removes, and describe the expected output shape.
- Avoid private account details; only include public repo, public app, public sample route, and generated evidence text.

## Actionability Matrix
- Gap: Phaser static assets in Devvit WebView
  Impact: A browser build can pass locally but fail in a repository-page or WebView path when assets assume /assets from the domain root.
  Evidence: Signal Garden needed a Devvit client build with relative asset paths, a Pages build audit, and a public sample route audit before the same app was safe to review from GitHub Pages and a WebView-shaped directory.
  Reproduction: Build a Vite/Phaser app once with a root asset base and once with a relative base, then open splash.html and game.html from a nested static path.
  Recommendation: Publish a Vite/Phaser asset checklist with relative base paths, WebView path examples, and an audit command for generated bundles.
  Acceptance criteria: A starter app can run the checklist, see whether generated HTML references root /assets, and fix the config before uploading.
- Gap: Splash-to-expanded-game lifecycle
  Impact: Builders have to infer how the small entrypoint hands state, context, and fallback behavior to the full game.
  Evidence: Signal Garden keeps a splash entrypoint, an expanded game entrypoint, a local game.html fallback, and tests for the Devvit-shaped message so the transition stays inspectable without private account state.
  Reproduction: Open the splash shell locally, click the launch control, and compare the posted devvit-internal immersiveMode message with the browser fallback path.
  Recommendation: Document the message shape, route handoff, token/context boundaries, and local preview fallback in one minimal sample.
  Acceptance criteria: A builder can copy one lifecycle sample and understand which values are platform-provided, which are app URLs, and what the local fallback should do.
- Gap: Comments becoming game state
  Impact: The challenge rewards user contribution, but builders need an example of turning comment replies into validated, ranked game actions.
  Evidence: Signal Garden parses route links and compact coordinate comments into proposals, recomputes score server-side, skips duplicates/cross-day links, and shows why the top route is leading.
  Reproduction: Paste a sample route link or a compact route comment into the import flow and verify that the proposal appears in the ranked consensus list with skip reasons for invalid input.
  Recommendation: Add a comment parser example that validates a player route server-side, stores it, ranks it, and reflects a recap into the thread.
  Acceptance criteria: An official example demonstrates reply parsing, validation, server-side scoring, persistence, ranking, and a recap payload.
- Gap: Submission evidence handoff
  Impact: Game evidence is split between app listing, demo post, source repo, media, feedback, and Devpost fields.
  Evidence: Signal Garden now exports a launch packet, Devpost field pack, demo post draft, platform feedback pack, Devvit readiness report, and submission manifest with hashes.
  Reproduction: Run the export commands, then compare the generated URLs and hashes with the public judge desk and raw docs before final form submission.
  Recommendation: Provide a final submission packet template that names every public URL and media proof before the submit button is pressed.
  Acceptance criteria: A final packet template lists the required public app, sample route, source repo, app listing, demo post, video/media, feedback, and manifest evidence fields.

## Feedback Summary
The current resources are useful, but game builders still have to infer several critical integration steps between a local browser prototype, the expanded game entrypoint, public comment input, persistence, and final evidence handoff.

## What Worked Well
The public game framing is strong: the categories around Phaser, retention, and user contributions push builders toward real game loops rather than static demos. The Devvit Web direction also makes it realistic to bring an existing Phaser/Vite workflow toward Reddit.

## What Was Confusing Or Missing
The confusing parts were mostly between local web development and the final Reddit surface: relative asset paths in the WebView/static build, the splash-to-expanded-game transition, how comment input should become structured game state, how to migrate a local store to the Devvit persistence pattern, and how app listing/demo post evidence maps into submission fields.

## What I Would Improve
Add one official end-to-end Phaser game example that includes Vite config, Devvit client/server output shape, splash-to-game transition, a comment-driven game-state loop, Redis-backed daily persistence, mobile WebView checks, and a final submission packet with app listing/demo post/source/media fields.

## Anything Else
The strongest Devvit games will probably feel less like embedded websites and more like Reddit-native rituals: daily posts, comment challenges, route sharing, contributor recaps, and reasons to come back tomorrow. More examples around those community mechanics would help builders create games that fit Reddit rather than only run on Reddit.

## Short Single-Field Version
chars=473 words=65

I built Signal Garden, a local Phaser + Devvit-shell daily puzzle. The biggest missing piece in the current resources is an end-to-end game submission path. Please add a Phaser/Vite asset checklist for Devvit WebView relative paths, a clear splash-to-expanded-game lifecycle diagram, and a small comment-to-game-state example. Those three items would help builders move from browser prototype to Reddit-native interactive post without guessing critical integration details.

## Medium Single-Field Version
chars=918 words=134

I built Signal Garden, a daily Phaser relay puzzle with a Devvit-shaped client/server shell, shareable review links, comment route import, proposal scoring, launch packet export, and a 390px mobile smoke check. My main feedback is that the Devvit game path needs a clearer end-to-end workflow. First, please add a Phaser + Vite asset checklist for WebView/static hosting, especially relative asset paths instead of root /assets assumptions. Second, document the splash-to-expanded-game lifecycle with the expected message shape, entrypoint transition, token/context handoff, and local fallback. Third, add a comment-to-game-state example: parse a reply, validate it server-side, rank it, and reflect the recap back into the post. Finally, publish a sample final submission packet that maps app listing, public demo post, source, media, and Devpost fields so builders know what evidence must be live before claiming it.

## Long Single-Field Version
chars=1421 words=194

Signal Garden is a daily Phaser relay puzzle for Reddit-style interactive posts. Players place mirrors to route one signal through three beacons, save each route as a proposal, import route links from comments, compare community proposals, and export a launch packet for demo-post discussion and review.

Local prototype and Devvit shell validation. Current local board: 2026-06-28 South lantern. Route state: complete, 1016 pts, 3/3 beacons, 2/5 moves. Community loop: 1/1 saved routes complete. Review path: https://signal-garden.vercel.app/?day=2026-06-28&plan=6-3-s.1-3-s

The Devvit game path would benefit from one clearer end-to-end workflow. First, add a Phaser + Vite asset checklist for WebView/static hosting, especially relative asset paths instead of root /assets assumptions. Second, document the splash-to-expanded-game lifecycle with the expected message shape, entrypoint transition, token/context handoff, and local fallback. Third, add a comment-to-game-state example: parse a reply, validate it server-side, rank it, and reflect the recap back into the post. Fourth, provide a game-specific persistence example for daily seeds, proposal lists, archive rows, and server-side score recomputation. Finally, publish a sample final submission packet that maps app listing, public demo post, source repository, media assets, and Devpost fields so builders know what evidence must be live before claiming it.