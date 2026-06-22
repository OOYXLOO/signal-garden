import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createPuzzleForDayKey, decodePlanToken, encodePlanToken, traceSignal } from "../src/game/puzzle.js";
import { summarizeConsensus } from "../src/game/proposals.js";
import { createPlatformFeedbackPack, formatPlatformFeedbackPack } from "../src/platformFeedback.js";

function parseArgs(argv) {
  const options = {
    day: "2026-06-19",
    plan: "",
    reviewBaseUrl: "",
    reviewUrl: "",
    sampleRoute: false,
    output: "",
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--sample-route") {
      options.sampleRoute = true;
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
    "  npm run export:platform-feedback -- --day 2026-06-19 --sample-route --review-base-url https://...",
    "",
    "Options:",
    "  --day YYYY-MM-DD       Daily board date. Defaults to the reviewer sample day.",
    "  --plan TOKEN           Encoded route token from a Review link.",
    "  --sample-route         Use the built-in sample route when no plan token is supplied.",
    "  --review-url URL       Exact public Review link after the public app gate.",
    "  --review-base-url URL  Public app URL; day and plan query params will be added.",
    "  --output PATH          Optional file output. Defaults to stdout.",
  ].join("\n");
}

function assertPublicHttpUrl(name, value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${name} must use http or https`);
  }
  if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
    throw new Error(`${name} must be public, not localhost`);
  }
  return parsed.toString();
}

function buildReviewUrl({ reviewUrl, reviewBaseUrl, puzzle, plan }) {
  const direct = assertPublicHttpUrl("review URL", reviewUrl);
  if (direct) return direct;
  const base = assertPublicHttpUrl("review base URL", reviewBaseUrl);
  if (!base || !plan.length) return "";
  const url = new URL(base);
  url.searchParams.set("day", puzzle.id);
  url.searchParams.set("plan", encodePlanToken(plan));
  return url.toString();
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
  const shareUrl = buildReviewUrl({ reviewUrl: options.reviewUrl, reviewBaseUrl: options.reviewBaseUrl, puzzle, plan });
  const proposal = plan.length
    ? {
        id: "platform-feedback-preview",
        puzzleId: puzzle.id,
        author: "feedback-preview",
        createdAt: new Date(`${puzzle.id}T00:00:00.000Z`).toISOString(),
        plan,
        status: result.status,
        complete: result.complete,
        score: result.score,
        beacons: result.hitBeacons.length,
        moves: result.moves.length,
      }
    : null;
  const consensus = summarizeConsensus(puzzle, proposal ? [proposal] : []);
  const pack = createPlatformFeedbackPack({
    puzzle,
    result,
    plan,
    shareUrl,
    sampleRouteUrl: options.sampleRoute ? `sample route for ${puzzle.id}` : "",
    consensus,
  });
  const text = formatPlatformFeedbackPack(pack);

  if (options.output) {
    await writeFile(resolve(options.output), text, "utf8");
  } else {
    process.stdout.write(`${text}\n`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
