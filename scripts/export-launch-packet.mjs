import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createDailyPuzzle, createPuzzleForDayKey, decodePlanToken, encodePlanToken, traceSignal } from "../src/game/puzzle.js";
import { summarizeConsensus } from "../src/game/proposals.js";
import { createLaunchPacket, formatLaunchPacket } from "../src/launchPacket.js";

function parseArgs(argv) {
  const options = {
    day: "",
    plan: "",
    reviewUrl: "",
    reviewBaseUrl: "",
    appListingUrl: "",
    demoPostUrl: "",
    feedbackUrl: "",
    output: "",
    sampleRoute: false,
    strict: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--sample-route") {
      options.sampleRoute = true;
    } else if (arg === "--strict") {
      options.strict = true;
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
    "  npm run export:launch-packet -- --day 2026-06-21 --plan 7-5-s.2-5-b.2-1-b --review-base-url https://... --app-listing-url https://... --demo-post-url https://... --strict",
    "",
    "Options:",
    "  --day YYYY-MM-DD             Daily board date. Defaults to today.",
    "  --plan TOKEN                 Encoded route token from a Review link.",
    "  --review-url URL             Exact public Review link after the user gate.",
    "  --review-base-url URL         Public app URL; day and plan query params will be added.",
    "  --sample-route               Use the built-in sample route for local dry-run output.",
    "  --app-listing-url URL         Public Devvit app listing URL after the user gate.",
    "  --demo-post-url URL           Public Reddit demo post URL after the user gate.",
    "  --feedback-url URL            Official feedback form URL, if needed.",
    "  --output PATH                 Optional file output. Defaults to stdout.",
    "  --strict                      Require a route, review URL, app listing URL, and demo post URL.",
  ].join("\n");
}

function assertPublicHttpUrl(name, value, required = false) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    if (required) {
      throw new Error(`${name} is required`);
    }
    return "";
  }

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

function resolvePuzzle(day) {
  if (!day) {
    return createDailyPuzzle();
  }
  const puzzle = createPuzzleForDayKey(day);
  if (!puzzle) {
    throw new Error("--day must be a real date in YYYY-MM-DD format");
  }
  return puzzle;
}

function buildReviewUrl({ reviewUrl, reviewBaseUrl, puzzle, plan }) {
  const direct = assertPublicHttpUrl("review URL", reviewUrl, false);
  if (direct) {
    return direct;
  }
  const base = assertPublicHttpUrl("review base URL", reviewBaseUrl, false);
  if (!base || !plan.length) {
    return "";
  }
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

  const puzzle = resolvePuzzle(options.day);
  let plan = options.plan ? decodePlanToken(options.plan, puzzle) : [];
  if (!plan.length && options.sampleRoute) {
    plan = puzzle.solution;
  }
  if (options.strict && !plan.length) {
    throw new Error("--strict requires --plan or --sample-route");
  }

  const appListingUrl = assertPublicHttpUrl("app listing URL", options.appListingUrl, options.strict);
  const demoPostUrl = assertPublicHttpUrl("demo post URL", options.demoPostUrl, options.strict);
  const feedbackUrl = assertPublicHttpUrl("feedback URL", options.feedbackUrl, false);
  const result = traceSignal(puzzle, plan);
  const shareUrl = buildReviewUrl({ reviewUrl: options.reviewUrl, reviewBaseUrl: options.reviewBaseUrl, puzzle, plan });
  if (options.strict && !shareUrl) {
    throw new Error("--strict requires --review-url or --review-base-url with a route plan");
  }
  const proposal = plan.length
    ? {
        id: "launch-packet-preview",
        puzzleId: puzzle.id,
        author: "launch-preview",
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
  const packet = createLaunchPacket({
    puzzle,
    result,
    plan,
    shareUrl,
    consensus,
    appListingUrl,
    demoPostUrl,
    feedbackUrl,
  });
  const text = formatLaunchPacket(packet);

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
