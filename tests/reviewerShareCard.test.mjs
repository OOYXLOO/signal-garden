import assert from "node:assert/strict";
import { createPuzzleForDayKey, traceSignal } from "../src/game/puzzle.js";
import { buildReviewerShareCard, renderReviewerShareCardMarkdown, renderReviewerShareCardSvg } from "../src/reviewerShareCard.js";

const puzzle = createPuzzleForDayKey("2026-06-19");
const plan = puzzle.solution;
const result = traceSignal(puzzle, plan);

const card = buildReviewerShareCard({
  puzzle,
  result,
  plan,
  publicAppUrl: "https://ooyxloo.github.io/signal-garden/",
  sourceRepoUrl: "https://github.com/OOYXLOO/signal-garden",
});

assert.equal(card.schemaVersion, "signal-garden-reviewer-share-card/v1");
assert.equal(card.title, "Signal Garden 2026-06-19");
assert.equal(card.metrics.score, result.score);
assert.equal(card.metrics.beacons, "3/3");
assert.equal(card.metrics.moves, "2/5");
assert.equal(card.links.play, "https://ooyxloo.github.io/signal-garden/");
assert.equal(card.links.judge, "https://ooyxloo.github.io/signal-garden/judge.html");
assert.equal(card.links.source, "https://github.com/OOYXLOO/signal-garden");
assert.match(card.links.review, /day=2026-06-19/);
assert.match(card.links.review, /plan=2-2-b\.2-6-b/);
assert.match(card.copy.shortCaption, /Daily community relay puzzle/);
assert.match(card.copy.longCaption, /Review in under a minute/);
assert.match(card.copy.firstCommentCta, /Reply with a Review link/);
assert.match(card.copy.altText, /Signal Garden share card/);
assert.ok(card.copy.altText.length < 280);

const markdown = renderReviewerShareCardMarkdown(card);
assert.match(markdown, /# Signal Garden Reviewer Share Card/);
assert.match(markdown, /Quick Links/);
assert.match(markdown, /https:\/\/ooyxloo\.github\.io\/signal-garden\/judge\.html/);
assert.match(markdown, /First Comment CTA/);
assert.doesNotMatch(markdown, /localhost|127\.0\.0\.1/i);

const svg = renderReviewerShareCardSvg(card);
assert.match(svg, /<svg[^>]+width="1200"[^>]+height="630"/);
assert.match(svg, /Signal Garden 2026-06-19/);
assert.match(svg, /Review in 60 seconds/);
assert.match(svg, /3\/3 beacons/);
assert.doesNotMatch(svg, /<script/i);

assert.throws(
  () =>
    buildReviewerShareCard({
      puzzle,
      result,
      plan,
      publicAppUrl: "http://127.0.0.1:8796/",
    }),
  /must be public/,
);

console.log("signal garden reviewer share card tests passed");
