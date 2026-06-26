import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createPuzzleForDayKey, decodePlanToken, traceSignal } from "../src/game/puzzle.js";
import {
  buildReviewerShareCard,
  renderReviewerShareCardMarkdown,
  renderReviewerShareCardSvg,
} from "../src/reviewerShareCard.js";

function parseArgs(argv) {
  const options = {
    day: "2026-06-19",
    plan: "",
    sampleRoute: false,
    publicAppUrl: "",
    sourceRepoUrl: "",
    judgeUrl: "",
    reviewUrl: "",
    format: "md",
    output: "",
    allowLocal: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--sample-route") {
      options.sampleRoute = true;
    } else if (arg === "--allow-local") {
      options.allowLocal = true;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      if (!(key in options)) {
        throw new Error(`Unknown option: ${arg}`);
      }
      index += 1;
      if (index >= argv.length) {
        throw new Error(`Missing value for ${arg}`);
      }
      options[key] = argv[index];
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  return options;
}

function helpText() {
  return [
    "Usage:",
    "  npm run export:reviewer-share-card -- --day 2026-06-19 --sample-route --public-app-url https://... --source-repo-url https://...",
    "",
    "Options:",
    "  --day YYYY-MM-DD          Daily board date. Defaults to the reviewer sample day.",
    "  --plan TOKEN              Encoded route token from a Review link.",
    "  --sample-route            Use the built-in sample route when no plan token is supplied.",
    "  --public-app-url URL      Public game URL. Required.",
    "  --source-repo-url URL     Public source repository URL.",
    "  --judge-url URL           Public judge desk URL. Defaults to <public-app-url>/judge.html.",
    "  --review-url URL          Exact public Review link.",
    "  --format md|json|svg      Output format. Defaults to md.",
    "  --output PATH             Optional file output. Defaults to stdout.",
    "  --allow-local             Permit localhost URLs for CLI tests only.",
  ].join("\n");
}

function render(card, format) {
  if (format === "json") {
    return `${JSON.stringify(card, null, 2)}\n`;
  }
  if (format === "svg") {
    return renderReviewerShareCardSvg(card);
  }
  if (format === "md") {
    return renderReviewerShareCardMarkdown(card);
  }
  throw new Error("--format must be md, json, or svg");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }

  const puzzle = createPuzzleForDayKey(options.day);
  if (!puzzle) {
    throw new Error("--day must be a real date in YYYY-MM-DD format");
  }

  let plan = options.plan ? decodePlanToken(options.plan, puzzle) : [];
  if (!plan.length && options.sampleRoute) {
    plan = puzzle.solution;
  }
  const result = traceSignal(puzzle, plan);
  const card = buildReviewerShareCard({
    puzzle,
    result,
    plan,
    publicAppUrl: options.publicAppUrl,
    sourceRepoUrl: options.sourceRepoUrl,
    judgeUrl: options.judgeUrl,
    reviewUrl: options.reviewUrl,
    allowLocal: options.allowLocal,
  });
  const text = render(card, options.format);

  if (options.output) {
    await writeFile(resolve(options.output), text, "utf8");
  } else {
    process.stdout.write(text);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
