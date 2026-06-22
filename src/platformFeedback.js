export function createPlatformFeedbackPack({
  puzzle,
  result,
  plan = [],
  shareUrl = "",
  sampleRouteUrl = "",
  consensus = null,
  stage = "Local prototype and Devvit shell validation.",
} = {}) {
  if (!puzzle) {
    throw new Error("createPlatformFeedbackPack requires a puzzle");
  }

  const status = result?.complete ? "complete" : result?.status || "open";
  const score = Number(result?.score || 0);
  const beacons = result?.hitBeacons?.length || 0;
  const completed = Number(consensus?.completed || 0);
  const proposalCount = Number(consensus?.proposalCount || 0);
  const reviewPath = shareUrl || sampleRouteUrl || "add a public review URL after playtest";
  const buildSummary =
    "Signal Garden is a daily Phaser relay puzzle for Reddit-style interactive posts. Players place mirrors to route one signal through three beacons, save each route as a proposal, import route links from comments, compare community proposals, and export a launch packet for demo-post discussion and review.";
  const stageSummary = [
    stage,
    `Current local board: ${puzzle.id} ${puzzle.title}.`,
    `Route state: ${status}, ${score} pts, ${beacons}/${puzzle.beacons.length} beacons, ${plan.length}/${puzzle.moveLimit} moves.`,
    `Community loop: ${completed}/${proposalCount} saved routes complete.`,
    `Review path: ${reviewPath}`,
  ].join(" ");

  const coreFeedback = [
    "The Devvit game path would benefit from one clearer end-to-end workflow.",
    "First, add a Phaser + Vite asset checklist for WebView/static hosting, especially relative asset paths instead of root /assets assumptions.",
    "Second, document the splash-to-expanded-game lifecycle with the expected message shape, entrypoint transition, token/context handoff, and local fallback.",
    "Third, add a comment-to-game-state example: parse a reply, validate it server-side, rank it, and reflect the recap back into the post.",
    "Fourth, provide a game-specific persistence example for daily seeds, proposal lists, archive rows, and server-side score recomputation.",
    "Finally, publish a sample final submission packet that maps app listing, public demo post, source repository, media assets, and Devpost fields so builders know what evidence must be live before claiming it.",
  ].join(" ");

  return {
    projectName: "Signal Garden",
    buildSummary,
    stageSummary,
    surveyHandoffChecklist: [
      "Use the public app URL and one sample route so reviewers can reproduce the exact game state before reading the feedback.",
      "Mention the concrete implementation surfaces: Phaser/Vite build, Devvit-shaped client/server shell, splash entrypoint, comment route import, proposal ranking, Redis-shaped persistence, and mobile smoke checks.",
      "Keep each recommendation actionable: name the missing doc/example, explain the integration risk it removes, and describe the expected output shape.",
      "Avoid private account details; only include public repo, public app, public sample route, and generated evidence text.",
    ],
    actionabilityMatrix: [
      {
        gap: "Phaser static assets in Devvit WebView",
        impact: "A browser build can pass locally but fail in a repository-page or WebView path when assets assume /assets from the domain root.",
        recommendation: "Publish a Vite/Phaser asset checklist with relative base paths, WebView path examples, and an audit command for generated bundles.",
      },
      {
        gap: "Splash-to-expanded-game lifecycle",
        impact: "Builders have to infer how the small entrypoint hands state, context, and fallback behavior to the full game.",
        recommendation: "Document the message shape, route handoff, token/context boundaries, and local preview fallback in one minimal sample.",
      },
      {
        gap: "Comments becoming game state",
        impact: "The challenge rewards user contribution, but builders need an example of turning comment replies into validated, ranked game actions.",
        recommendation: "Add a comment parser example that validates a player route server-side, stores it, ranks it, and reflects a recap into the thread.",
      },
      {
        gap: "Submission evidence handoff",
        impact: "Game evidence is split between app listing, demo post, source repo, media, feedback, and Devpost fields.",
        recommendation: "Provide a final submission packet template that names every public URL and media proof before the submit button is pressed.",
      },
    ],
    feedbackSummary:
      "The current resources are useful, but game builders still have to infer several critical integration steps between a local browser prototype, the expanded game entrypoint, public comment input, persistence, and final evidence handoff.",
    workedWell:
      "The public game framing is strong: the categories around Phaser, retention, and user contributions push builders toward real game loops rather than static demos. The Devvit Web direction also makes it realistic to bring an existing Phaser/Vite workflow toward Reddit.",
    confusingOrMissing:
      "The confusing parts were mostly between local web development and the final Reddit surface: relative asset paths in the WebView/static build, the splash-to-expanded-game transition, how comment input should become structured game state, how to migrate a local store to the Devvit persistence pattern, and how app listing/demo post evidence maps into submission fields.",
    improvement:
      "Add one official end-to-end Phaser game example that includes Vite config, Devvit client/server output shape, splash-to-game transition, a comment-driven game-state loop, Redis-backed daily persistence, mobile WebView checks, and a final submission packet with app listing/demo post/source/media fields.",
    anythingElse:
      "The strongest Devvit games will probably feel less like embedded websites and more like Reddit-native rituals: daily posts, comment challenges, route sharing, contributor recaps, and reasons to come back tomorrow. More examples around those community mechanics would help builders create games that fit Reddit rather than only run on Reddit.",
    variants: createFeedbackVariants({ buildSummary, stageSummary, coreFeedback }),
  };
}

export function createFeedbackVariants({ buildSummary, stageSummary, coreFeedback } = {}) {
  return {
    short:
      "I built Signal Garden, a local Phaser + Devvit-shell daily puzzle. The biggest missing piece in the current resources is an end-to-end game submission path. Please add a Phaser/Vite asset checklist for Devvit WebView relative paths, a clear splash-to-expanded-game lifecycle diagram, and a small comment-to-game-state example. Those three items would help builders move from browser prototype to Reddit-native interactive post without guessing critical integration details.",
    medium:
      "I built Signal Garden, a daily Phaser relay puzzle with a Devvit-shaped client/server shell, shareable review links, comment route import, proposal scoring, launch packet export, and a 390px mobile smoke check. My main feedback is that the Devvit game path needs a clearer end-to-end workflow. First, please add a Phaser + Vite asset checklist for WebView/static hosting, especially relative asset paths instead of root /assets assumptions. Second, document the splash-to-expanded-game lifecycle with the expected message shape, entrypoint transition, token/context handoff, and local fallback. Third, add a comment-to-game-state example: parse a reply, validate it server-side, rank it, and reflect the recap back into the post. Finally, publish a sample final submission packet that maps app listing, public demo post, source, media, and Devpost fields so builders know what evidence must be live before claiming it.",
    long: [buildSummary, stageSummary, coreFeedback].filter(Boolean).join("\n\n"),
  };
}

export function countFeedbackText(value) {
  const text = String(value || "");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return {
    chars: text.length,
    words,
  };
}

export function formatPlatformFeedbackPack(pack) {
  const variants = pack.variants || {};
  const lines = [
    "# Signal Garden Developer Platform Feedback",
    "",
    "## Project Name",
    pack.projectName,
    "",
    "## What I Built",
    pack.buildSummary,
    "",
    "## Current Stage",
    pack.stageSummary,
    "",
    "## Survey Handoff Checklist",
    ...(pack.surveyHandoffChecklist || []).map((item) => `- ${item}`),
    "",
    "## Actionability Matrix",
    ...(pack.actionabilityMatrix || []).flatMap((item) => [
      `- Gap: ${item.gap}`,
      `  Impact: ${item.impact}`,
      `  Recommendation: ${item.recommendation}`,
    ]),
    "",
    "## Feedback Summary",
    pack.feedbackSummary,
    "",
    "## What Worked Well",
    pack.workedWell,
    "",
    "## What Was Confusing Or Missing",
    pack.confusingOrMissing,
    "",
    "## What I Would Improve",
    pack.improvement,
    "",
    "## Anything Else",
    pack.anythingElse,
  ];

  for (const [label, text] of [
    ["Short", variants.short],
    ["Medium", variants.medium],
    ["Long", variants.long],
  ]) {
    const count = countFeedbackText(text);
    lines.push("", `## ${label} Single-Field Version`, `chars=${count.chars} words=${count.words}`, "", text || "");
  }

  return lines.join("\n");
}
