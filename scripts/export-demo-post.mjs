import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createPuzzleForDayKey, decodePlanToken, encodePlanToken, traceSignal } from "../src/game/puzzle.js";

function parseArgs(argv) {
  const options = {
    day: "2026-06-19",
    plan: "",
    sampleRoute: false,
    publicAppUrl: "",
    reviewBaseUrl: "",
    reviewUrl: "",
    sourceRepoUrl: "",
    feedbackPackUrl: "",
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
    "  npm run export:demo-post -- --day 2026-06-19 --sample-route --public-app-url https://... --source-repo-url https://...",
    "",
    "Options:",
    "  --day YYYY-MM-DD          Daily board date. Defaults to the reviewer sample day.",
    "  --plan TOKEN              Encoded route token from a Review link.",
    "  --sample-route            Use the built-in sample route when no plan token is supplied.",
    "  --public-app-url URL      Public game URL.",
    "  --review-base-url URL     Public app URL used to build a Review link.",
    "  --review-url URL          Exact public Review link.",
    "  --source-repo-url URL     Public source repository URL.",
    "  --feedback-pack-url URL   Public platform feedback pack URL.",
    "  --output PATH             Optional file output. Defaults to stdout.",
    "  --allow-local             Permit localhost URLs for CLI tests only.",
  ].join("\n");
}

function assertHttpUrl(name, value, { required = false, allowLocal = false } = {}) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    if (required) throw new Error(`${name} is required`);
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
  if (!allowLocal && ["localhost", "127.0.0.1"].includes(parsed.hostname)) {
    throw new Error(`${name} must be public, not localhost`);
  }
  return parsed.toString();
}

function buildReviewUrl({ reviewUrl, reviewBaseUrl, publicAppUrl, puzzle, plan, allowLocal }) {
  const direct = assertHttpUrl("review URL", reviewUrl, { allowLocal });
  if (direct) return direct;
  const base = assertHttpUrl("review base URL", reviewBaseUrl || publicAppUrl, { allowLocal });
  if (!base || !plan.length) return "";
  const url = new URL(base);
  url.searchParams.set("day", puzzle.id);
  url.searchParams.set("plan", encodePlanToken(plan));
  return url.toString();
}

function formatRouteSummary(result) {
  const beacons = result.hitBeacons.map((beacon) => beacon.label || beacon.id || beacon.name || "").filter(Boolean).join(", ");
  return `${result.status}; ${result.moves.length} moves; ${result.hitBeacons.length}/3 beacons${beacons ? ` (${beacons})` : ""}`;
}

function formatDemoPostDraft({ puzzle, result, reviewUrl, publicAppUrl, sourceRepoUrl, feedbackPackUrl }) {
  const routeSummary = formatRouteSummary(result);
  const title = "Signal Garden: a daily co-op route puzzle where comments shape tomorrow's board";
  const playLine = publicAppUrl ? `Play the public build: ${publicAppUrl}` : "Play the public build: <public app URL>";
  const reviewLine = reviewUrl ? `Open today's review route: ${reviewUrl}` : "Open today's review route: <review URL>";
  const sourceLine = sourceRepoUrl ? `Source and evidence: ${sourceRepoUrl}` : "Source and evidence: <source repository URL>";
  const feedbackLine = feedbackPackUrl
    ? `Developer platform feedback pack: ${feedbackPackUrl}`
    : "Developer platform feedback pack: <feedback pack URL>";

  return [
    "# Signal Garden Reddit Demo Post Draft",
    "",
    "## Suggested Title",
    title,
    "",
    "## Suggested Body",
    "Signal Garden is a lightweight daily puzzle about keeping a signal alive through a tiny network of relays. Each day has a fixed board, a route token, and a shareable Review link so players can compare routes without needing accounts or private data.",
    "",
    playLine,
    reviewLine,
    sourceLine,
    feedbackLine,
    "",
    "What I would love feedback on:",
    "- Is the daily board readable within the first 10 seconds?",
    "- Does the Review link make it clear how a route was scored?",
    "- Would comment-driven route suggestions feel natural in a subreddit thread?",
    "- Is the Devvit splash-to-expanded-game flow understandable from the public demo materials?",
    "",
    `Today sample: ${puzzle.id}`,
    `Route receipt: ${routeSummary}`,
    "",
    "## Suggested First Comment",
    `Today's sample route is ready in the Review link above. Try beating the beacon count or leaving a route idea that would make a good next-day challenge.`,
    "",
    "## Suggested Venues",
    "- r/playmygame",
    "- r/WebGames",
    "- an appropriate private test subreddit controlled by the publisher",
    "",
    "## Safety Notes",
    "- No credentials, private messages, private dashboards, or account-local data are needed for the demo.",
    "- Post only once the app listing URL and public demo thread are ready.",
    "- Keep platform-specific submission steps outside this repository.",
    "",
  ].join("\n");
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
  const publicAppUrl = assertHttpUrl("public app URL", options.publicAppUrl, { allowLocal: options.allowLocal });
  const sourceRepoUrl = assertHttpUrl("source repository URL", options.sourceRepoUrl, { allowLocal: options.allowLocal });
  const feedbackPackUrl = assertHttpUrl("feedback pack URL", options.feedbackPackUrl, { allowLocal: options.allowLocal });
  const reviewUrl = buildReviewUrl({
    reviewUrl: options.reviewUrl,
    reviewBaseUrl: options.reviewBaseUrl,
    publicAppUrl,
    puzzle,
    plan,
    allowLocal: options.allowLocal,
  });
  const text = formatDemoPostDraft({ puzzle, result, reviewUrl, publicAppUrl, sourceRepoUrl, feedbackPackUrl });

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
