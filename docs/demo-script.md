# Signal Garden Demo Script

Target length: under 60 seconds.

Current local assets include a shorter captioned walkthrough draft at `docs/demo-captioned.webm` and a final captioned candidate at `docs/demo-final-captioned.webm`. Use the final candidate for submission review only after `npm run audit:submission` confirms it stays under 60 seconds.

## Core Message

Signal Garden is a daily community relay puzzle. Each player proposes a route by placing mirrors. The app ranks saved proposals, lets the community apply the current top plan, and preserves a small local archive so the puzzle has a reason to return tomorrow.

## Shot List

1. Open on the full board.
   - Say: "Signal Garden is a daily relay puzzle built with Phaser."
   - Show the date chip, board title, objective progress, move limit, hint button, and three beacons.

2. Place or apply a complete plan.
   - Say: "Players guide one signal through all three beacons before it reaches the receiver."
   - Show the path updating instantly and the objective chips turning complete.

3. Replay the route.
   - Say: "Replay makes the path readable during review."
   - Show the signal marker moving along the current route.

4. Show one failed route.
   - Say: "Failed routes explain what happened instead of leaving the player guessing."
   - Show the status hint and board marker for an incomplete path.

5. Save the proposal.
   - Say: "Each route becomes a proposal. The app recomputes the score, ranks the best plan, and shows the top route as a board ghost."
   - Show the consensus summary changing to `1/1 saved proposals complete`.

6. Copy the share link and briefing.
   - Say: "A share link and briefing carry the exact route into a post, comment, or review thread."
   - Show the review link inside the briefing output and the copy button changing to `Link copied`.

7. Import a comment thread.
   - Say: "Pasted review links become scored community proposals, while duplicate or cross-day routes are explained instead of silently failing."
   - Click `Load sample thread`, import it, then show the import summary, skip reasons, and the contributor board updating.

8. Show the comment challenge, review snapshot, launch packet, and daily recap.
   - Say: "The comment prompt invites routes back in, the review snapshot gives judges the route and reproducibility checks, and the launch packet gathers the demo-post setup in one copy."
   - Show the comment challenge with a Review link, the review snapshot, the launch packet sections, then the recap text with route count and contributor lead.

9. Clear and apply the top proposal.
   - Say: "The top proposal is not a hidden answer. It is the best saved community plan."
   - Show the top route ghost remaining after the local draft is cleared, then show the board returning to the saved route.

10. Show the loop panel.
   - Say: "The local archive and streak make the daily board feel persistent."
   - Point out daily seed, local streak, status, and the archive Review link.

11. Close on the platform path.
   - Say: "The browser version is testable today, and the Devvit shell keeps the client and server adapter ready for a Reddit surface."

## Submission Caption

Daily Phaser puzzle with seven verified board templates, objective progress, route replay, adapter-backed proposal consensus, top route ghosting, comment challenge prompts, review snapshot export, launch packet export, sample thread loading, comment thread route import with skip reasons, contributor recap, shareable route links, a compact archive/streak loop, explainable route feedback, and a Devvit-ready adapter boundary.

## Field Notes

- Keep public project fields focused on the game, community loop, and technical implementation.
- Do not claim a live Reddit deployment until the account owner completes the Devvit/Reddit gate.
- Do not include private account pages, tokens, cookies, billing pages, or console screenshots in the video.
