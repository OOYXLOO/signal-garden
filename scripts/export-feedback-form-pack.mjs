import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createPuzzleForDayKey, decodePlanToken, traceSignal } from "../src/game/puzzle.js";
import { summarizeConsensus } from "../src/game/proposals.js";
import {
  createDeveloperFeedbackSurveyPack,
  createPlatformFeedbackPack,
  formatDeveloperFeedbackSurveyPack,
} from "../src/platformFeedback.js";

function parseArgs(argv) {
  const options = {
    day: "2026-06-22",
    help: false,
    output: "",
    plan: "",
    reviewUrl: "",
    sampleRoute: false,
    username: "OOYXLOO",
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
    "  npm run export:feedback-form-pack -- --sample-route --username OOYXLOO --output docs/developer-feedback-form-pack.md",
    "",
    "Creates a copy-only answer pack for the public Developer Feedback Survey. It never submits the form.",
  ].join("\n");
}

function assertPublicHttpUrl(name, value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const parsed = new URL(trimmed);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${name} must use http or https`);
  }
  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".localhost")) {
    throw new Error(`${name} must be public, not localhost`);
  }
  return parsed.toString();
}

export function createFeedbackFormPackFromOptions(options) {
  const puzzle = createPuzzleForDayKey(options.day);
  if (!puzzle) {
    throw new Error("--day must be a real date in YYYY-MM-DD format");
  }
  let plan = options.plan ? decodePlanToken(options.plan, puzzle) : [];
  if (!plan.length && options.sampleRoute) {
    plan = puzzle.solution;
  }
  const result = traceSignal(puzzle, plan);
  const reviewUrl = assertPublicHttpUrl("review URL", options.reviewUrl || "https://ooyxloo.github.io/signal-garden/?day=2026-06-22&sample=1");
  const proposal = plan.length
    ? {
        id: "feedback-form-preview",
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
  const feedbackPack = createPlatformFeedbackPack({
    puzzle,
    result,
    plan,
    shareUrl: reviewUrl,
    sampleRouteUrl: reviewUrl,
    consensus,
  });
  return createDeveloperFeedbackSurveyPack({
    feedbackPack,
    username: options.username,
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }
  const pack = createFeedbackFormPackFromOptions(options);
  const text = formatDeveloperFeedbackSurveyPack(pack);
  if (options.output) {
    await writeFile(resolve(options.output), text, "utf8");
  } else {
    process.stdout.write(text);
  }
}

if (process.argv[1]?.endsWith("export-feedback-form-pack.mjs")) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
