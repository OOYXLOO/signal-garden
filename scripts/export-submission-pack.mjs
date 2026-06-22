import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { auditPublicUrl } from "./audit-public-url.mjs";
import { createPuzzleForDayKey, decodePlanToken, encodePlanToken, traceSignal } from "../src/game/puzzle.js";
import { summarizeConsensus } from "../src/game/proposals.js";
import { createLaunchPacket, formatLaunchPacket } from "../src/launchPacket.js";
import { createEvidenceReceipt, formatEvidenceReceipt } from "../src/reviewerGuide.js";
import { createGardenLog, createSampleGardenArchive } from "../src/state/store.js";

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), "..");

function parseArgs(argv) {
  const options = {
    allowLocal: false,
    appListingUrl: "",
    day: "",
    demoPostUrl: "",
    feedbackUrl: "",
    help: false,
    output: "",
    plan: "",
    publicAppUrl: "",
    sampleRoute: false,
    sourceRepoUrl: "",
    timeoutMs: 20_000,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--allow-local") {
      options.allowLocal = true;
    } else if (arg === "--sample-route") {
      options.sampleRoute = true;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      if (!(key in options)) throw new Error(`Unknown option: ${arg}`);
      index += 1;
      if (index >= argv.length) throw new Error(`Missing value for ${arg}`);
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
    "  npm run export:submission-pack -- --public-app-url https://... --day 2026-06-19 --plan <token> --source-repo-url https://... --app-listing-url https://... --demo-post-url https://...",
    "  npm run export:submission-pack -- --public-app-url https://... --day 2026-06-19 --sample-route --source-repo-url https://... --app-listing-url https://... --demo-post-url https://...",
    "",
    "Creates a copyable public submission packet after the public app URL exists.",
    "The command audits the public app URL and sample route before writing output.",
  ].join("\n");
}

function assertPublicHttpUrl(name, value, { allowLocal = false, required = true } = {}) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    if (required) throw new Error(`${name} is required`);
    return "";
  }
  const parsed = new URL(trimmed);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${name} must use http or https`);
  }
  const host = parsed.hostname.toLowerCase();
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".localhost");
  if (isLocal && !allowLocal) {
    throw new Error(`${name} must be public, not localhost`);
  }
  return parsed.toString();
}

function normalizeBaseUrl(value, allowLocal) {
  const parsed = new URL(assertPublicHttpUrl("public app URL", value, { allowLocal }));
  parsed.hash = "";
  parsed.search = "";
  if (!parsed.pathname.endsWith("/")) {
    parsed.pathname = `${parsed.pathname}/`;
  }
  return parsed;
}

function createReviewUrl(baseUrl, day, planToken) {
  const url = new URL(baseUrl.toString());
  url.searchParams.set("day", day);
  url.searchParams.set("plan", planToken);
  return url.toString();
}

function extractSection(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^## ${escaped}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "m"));
  if (!match) {
    throw new Error(`docs/submission-field-pack.md missing section: ${heading}`);
  }
  return match[1].trim();
}

function psArg(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function createGateRunbook({
  publicAppUrl,
  sampleRouteUrl,
  reviewUrl,
  sourceRepoUrl,
  appListingUrl,
  demoPostUrl,
  feedbackUrl,
  day,
  planToken,
}) {
  const submissionPackCommand = [
    "npm run export:submission-pack --",
    "--public-app-url",
    psArg(publicAppUrl),
    "--day",
    psArg(day),
    "--plan",
    psArg(planToken),
    "--source-repo-url",
    psArg(sourceRepoUrl),
    "--app-listing-url",
    psArg(appListingUrl),
    "--demo-post-url",
    psArg(demoPostUrl),
    ...(feedbackUrl ? ["--feedback-url", psArg(feedbackUrl)] : []),
  ].join(" ");
  return [
    "1. Open the public app URL and confirm the board, objective chips, reviewer panel, and submission readiness panel are visible.",
    `   Evidence: ${publicAppUrl}`,
    "2. Open the sample route and confirm it shows a labeled sample preview, top-route rationale, return map preview, and comment import loop.",
    `   Evidence: ${sampleRouteUrl}`,
    "3. Open the exact review link and confirm the route replays on the same daily board without localhost or account-only links.",
    `   Evidence: ${reviewUrl}`,
    "4. Open the source repository and confirm the README, docs, demo media, and verification scripts are public or intentionally visible to reviewers.",
    `   Evidence: ${sourceRepoUrl}`,
    "5. Paste the app listing URL only after the user-approved Devvit listing is public.",
    `   Evidence: ${appListingUrl}`,
    "6. Paste the public demo post URL only after the user-approved Reddit demo post is public.",
    `   Evidence: ${demoPostUrl}`,
    feedbackUrl
      ? `7. Paste the platform feedback URL only if that target flow asks for it: ${feedbackUrl}`
      : "7. Leave the feedback URL blank unless the target flow asks for a public platform feedback form.",
    "8. Attach media in this order: cover, desktop preview, mobile preview, final captioned demo.",
    "9. Re-run the final commands before submission and keep their output with the project notes:",
    `   npm run audit:public -- --base-url ${psArg(publicAppUrl)} --day ${psArg(day)}`,
    `   ${submissionPackCommand}`,
    "   npm run audit:submission",
  ].join("\n");
}

async function createSubmissionPack(options) {
  if (!options.day || !/^\d{4}-\d{2}-\d{2}$/.test(options.day)) {
    throw new Error("--day must be YYYY-MM-DD");
  }
  const puzzle = createPuzzleForDayKey(options.day);
  if (!puzzle) {
    throw new Error("--day must be a real date in YYYY-MM-DD format");
  }
  const plan = options.plan ? decodePlanToken(options.plan, puzzle) : options.sampleRoute ? puzzle.solution : [];
  if (!plan.length) {
    throw new Error("--plan did not decode to a playable route for the selected day; use --sample-route for the built-in review route");
  }
  const planToken = options.plan || encodePlanToken(plan);
  const publicAppUrl = normalizeBaseUrl(options.publicAppUrl, options.allowLocal);
  const sourceRepoUrl = assertPublicHttpUrl("source repository URL", options.sourceRepoUrl, {
    allowLocal: options.allowLocal,
  });
  const appListingUrl = assertPublicHttpUrl("app listing URL", options.appListingUrl, {
    allowLocal: options.allowLocal,
  });
  const demoPostUrl = assertPublicHttpUrl("demo post URL", options.demoPostUrl, {
    allowLocal: options.allowLocal,
  });
  const feedbackUrl = assertPublicHttpUrl("feedback URL", options.feedbackUrl, {
    allowLocal: options.allowLocal,
    required: false,
  });
  const publicAudit = await auditPublicUrl({
    allowLocal: options.allowLocal,
    baseUrl: publicAppUrl.toString(),
    day: options.day,
    timeoutMs: options.timeoutMs,
  });
  if (!publicAudit.ok) {
    throw new Error(`public URL audit failed: ${publicAudit.failures.join("; ")}`);
  }

  const reviewUrl = createReviewUrl(publicAppUrl, options.day, planToken);
  const result = traceSignal(puzzle, plan);
  const proposal = {
    id: "submission-pack-preview",
    puzzleId: puzzle.id,
    author: "submission-preview",
    createdAt: new Date(`${puzzle.id}T00:00:00.000Z`).toISOString(),
    plan,
    status: result.status,
    complete: result.complete,
    score: result.score,
    beacons: result.hitBeacons.length,
    moves: result.moves.length,
  };
  const consensus = summarizeConsensus(puzzle, [proposal]);
  const launchPacket = formatLaunchPacket(
    createLaunchPacket({
      puzzle,
      result,
      plan,
      shareUrl: reviewUrl,
      consensus,
      appListingUrl,
      demoPostUrl,
      feedbackUrl,
      sourceRepoUrl,
    }),
  );
  const sampleGardenLog = createGardenLog({
    currentPuzzleId: puzzle.id,
    archive: createSampleGardenArchive(puzzle.id),
  });
  const evidenceReceipt = formatEvidenceReceipt(
    createEvidenceReceipt({
      puzzle,
      result,
      plan,
      shareUrl: reviewUrl,
      sampleRouteUrl: publicAudit.sampleRouteUrl,
      consensus,
      gardenLog: sampleGardenLog,
      launchPacket,
      publicAppUrl: publicAppUrl.toString(),
      sourceRepoUrl,
      appListingUrl,
      demoPostUrl,
    }),
  );
  const fieldPack = await readFile(resolve(root, "docs/submission-field-pack.md"), "utf8");
  const shortDescription = extractSection(fieldPack, "Short Description");
  const longDescription = extractSection(fieldPack, "Long Description");
  const socialLoop = extractSection(fieldPack, "What Makes It Social");
  const technicalHighlights = extractSection(fieldPack, "Technical Highlights");
  const demoChecklist = extractSection(fieldPack, "Demo Checklist");
  const gateRunbook = createGateRunbook({
    publicAppUrl: publicAppUrl.toString(),
    sampleRouteUrl: publicAudit.sampleRouteUrl,
    reviewUrl,
    sourceRepoUrl,
    appListingUrl,
    demoPostUrl,
    feedbackUrl,
    day: options.day,
    planToken,
  });

  return [
    "# Signal Garden Public Submission Pack",
    "",
    "## Public URLs",
    "",
    `- Public app: ${publicAppUrl.toString()}`,
    `- Sample route: ${publicAudit.sampleRouteUrl}`,
    `- Review link: ${reviewUrl}`,
    `- Source repository: ${sourceRepoUrl}`,
    `- App listing: ${appListingUrl}`,
    `- Demo post: ${demoPostUrl}`,
    feedbackUrl ? `- Feedback form: ${feedbackUrl}` : "- Feedback form: add only if the target platform asks for it.",
    "",
    "## Public URL Audit",
    "",
    `- Base URL: HTTP ${publicAudit.baseStatus}, ${publicAudit.baseTitle || "untitled"}`,
    `- Sample route URL: HTTP ${publicAudit.sampleStatus}, ${publicAudit.sampleTitle || "untitled"}`,
    "- Localhost guard: passed by this command before generating the pack.",
    "",
    "## Evidence Receipt",
    "",
    evidenceReceipt,
    "",
    "## Gate Runbook",
    "",
    gateRunbook,
    "",
    "## Submission Fields",
    "",
    "### Project Name",
    "",
    "Signal Garden",
    "",
    "### Short Description",
    "",
    shortDescription,
    "",
    "### Long Description",
    "",
    longDescription,
    "",
    "### Source Repository",
    "",
    sourceRepoUrl,
    "",
    "### What Makes It Social",
    "",
    socialLoop,
    "",
    "### Technical Highlights",
    "",
    technicalHighlights,
    "",
    "## Media Assets",
    "",
    "- Cover: `docs/cover.png`",
    "- Desktop preview: `docs/desktop-preview.png`",
    "- Mobile preview: `docs/mobile-preview.png`",
    "- Demo video: `docs/demo-final-captioned.webm`",
    "",
    "## Demo Checklist",
    "",
    demoChecklist,
    "",
    "## Launch Packet",
    "",
    launchPacket,
    "",
  ].join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }
  const text = await createSubmissionPack(options);
  if (options.output) {
    await writeFile(resolve(options.output), text, "utf8");
  } else {
    process.stdout.write(text);
  }
}

export { createSubmissionPack };

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
