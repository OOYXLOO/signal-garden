# Signal Garden Criteria Fit Brief

Last checked: 2026-06-26

Public review desk: https://ooyxloo.github.io/signal-garden/judge.html  
Public app: https://ooyxloo.github.io/signal-garden/  
Sample route: https://ooyxloo.github.io/signal-garden/?day=2026-06-26&sample=1
Source repository: https://github.com/OOYXLOO/signal-garden
Rubric evidence matrix: https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/rubric-evidence-matrix.md

This brief maps Signal Garden to the public Reddit Games with a Hook materials so a reviewer can
judge the project without hunting through the repository.

## Official Public Signals

- The public hackathon page presents the challenge as building a new Reddit game with Devvit for Reddit users.
- The public rules page lists the submission period as June 17, 2026 to July 15, 2026 at 6:00pm Pacific Time.
- The public overview emphasizes replayable, retentive games rather than literal hook interpretations.
- The public overview warns that common game categories need a strong differentiator.
- The public rules state that judges may evaluate from the text, images, and video even if they do not run the project.
- The public rules require access to a working project for testing and mention a public Reddit post running the game.

Reference pages:

- https://redditgameswithahook.devpost.com/
- https://redditgameswithahook.devpost.com/rules

## Fit Map

| Public signal | Signal Garden evidence | Current status |
| --- | --- | --- |
| New Reddit game concept | Daily signal-routing community puzzle with mirror placement, beacons, receiver, and route proposals | Implemented in browser build and Devvit shell |
| Built for Reddit community loops | Review links, Reddit post draft, comment challenge prompt, comment route import, proposal ranking, daily recap | Implemented locally and documented for user-approved posting |
| Replayable or retentive hook | Deterministic daily boards, seven verified puzzle templates, return map, streak/archive state, sample week preview, next-day return pledge prompt | Implemented in app and submission field pack |
| User contribution | Routes become proposals, contributor board aggregates authors, sample preview shows multiple contributors, top route can be applied and explained | Implemented in app and tests |
| Not a common clone | Community relay puzzle based on route sharing and ranked comment proposals, not a shooter, platformer, trivia app, or story clone | Documented and visible in app |
| Evaluatable without running a platform account | Public app, sample route, judge desk, final captioned demo, manifest, README, launch readiness docs | Public and audited |
| Devvit migration path | Devvit-shaped client/server shell, splash-to-expanded-game notes, Redis-shaped proposal store, dependency watch | Implemented as pre-account validation |
| Testing instructions | Reviewer Quickstart, first-session guide, judge desk, public URL audit, submission pack export | Implemented and audited |
| English materials | README, judge desk, demo script, submission field pack, feedback pack, launch readiness | Implemented |
| Required external running post | Reddit demo post and Devvit app listing still require platform account action | User batch gate |

## Strongest Submission Angle

Signal Garden should be framed as a daily community relay puzzle: players solve a small deterministic
route board, then turn their route into a shareable proposal that can be pasted back from a comment
thread, ranked, replayed, and used as the next community target.

The strongest differentiator is not the mirror puzzle alone. The differentiator is the comment-to-game
state loop: a Reddit-style thread can become a ranked set of playable proposals, and the app can explain
why the top proposal leads.

## Current Weaknesses

- The public app is hosted on GitHub Pages, not inside a live Reddit post yet.
- The Devvit shell is built and audited, but the real Devvit app listing and playtest still require platform account actions.
- The demo post is exported as a handoff draft, not published yet.
- Real multi-user community data is represented through sample route and sample thread flows until a public post exists.

## Next Submission Gate Order

1. Create or open the Devvit app listing.
2. Run a live playtest with the current public build and sample route.
3. Publish a public Reddit demo post in an eligible small subreddit.
4. Export the final submission pack with the live app listing and demo post URLs.
5. Submit on Devpost with the public app, source repo, judge desk, final demo, manifest, and testing instructions.

## What To Emphasize In Final Text

- Daily replay loop, not one-off demo.
- Return pledge: today's route creates a concrete reason to invite the thread back tomorrow.
- Comment replies become playable route proposals.
- Review links preserve exact route evidence.
- Top route ghost and rationale make community state explainable.
- Public judge desk and manifest reduce review friction.
- No private credentials, platform tokens, or account data are needed to evaluate the static public build.
