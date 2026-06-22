import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const defaultPublicAppUrl = "https://ooyxloo.github.io/signal-garden/";
const defaultSourceRepoUrl = "https://github.com/OOYXLOO/signal-garden";
const defaultJudgeUrl = "https://ooyxloo.github.io/signal-garden/judge.html";
const defaultFeedbackPackUrl =
  "https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/platform-feedback-pack.md";
const defaultFeedbackFormPackUrl =
  "https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/developer-feedback-form-pack.md";
const defaultDevpostFieldsUrl =
  "https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/devpost-field-pack.md";
const defaultDemoPostDraftUrl =
  "https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/reddit-demo-post-draft.md";
const defaultDevvitReadinessUrl =
  "https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/devvit-readiness-report.md";

function parseArgs(argv) {
  const options = {
    appListingUrl: "",
    day: "2026-06-22",
    demoPostUrl: "",
    feedbackConfirmationUrl: "",
    help: false,
    output: "",
    publicAppUrl: defaultPublicAppUrl,
    sourceRepoUrl: defaultSourceRepoUrl,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
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
    "  npm run export:submission-runbook -- --output docs/submission-runbook.md",
    "  npm run export:submission-runbook -- --day 2026-06-22 --app-listing-url https://... --demo-post-url https://...",
    "",
    "Creates a public, account-owner handoff runbook for Devvit, Reddit, Devpost-style fields, and platform feedback.",
  ].join("\n");
}

function assertPublicHttpUrl(name, value, { required = true } = {}) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    if (required) {
      throw new Error(`${name} is required`);
    }
    return "";
  }
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

function sampleRouteUrl(publicAppUrl, day) {
  const url = new URL(publicAppUrl);
  url.searchParams.set("day", day);
  url.searchParams.set("sample", "1");
  return url.toString();
}

function optionalLine(label, value, fallback) {
  return `- ${label}: ${value || fallback}`;
}

export function createSubmissionRunbook(options = {}) {
  const day = options.day || "2026-06-22";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error("--day must be YYYY-MM-DD");
  }
  const publicAppUrl = assertPublicHttpUrl("public app URL", options.publicAppUrl || defaultPublicAppUrl);
  const sourceRepoUrl = assertPublicHttpUrl("source repository URL", options.sourceRepoUrl || defaultSourceRepoUrl);
  const appListingUrl = assertPublicHttpUrl("app listing URL", options.appListingUrl, { required: false });
  const demoPostUrl = assertPublicHttpUrl("demo post URL", options.demoPostUrl, { required: false });
  const feedbackConfirmationUrl = assertPublicHttpUrl("feedback confirmation URL", options.feedbackConfirmationUrl, {
    required: false,
  });
  const sampleUrl = sampleRouteUrl(publicAppUrl, day);

  return [
    "# Signal Garden Submission Runbook",
    "",
    `Generated for day: ${day}`,
    "",
    "This runbook orders the public handoff steps for the account owner. It does not contain credentials, cookies, private account pages, payment data, or identity material.",
    "",
    "## Public Evidence Pack",
    "",
    `- Public app: ${publicAppUrl}`,
    `- Sample route: ${sampleUrl}`,
    `- Judge desk: ${defaultJudgeUrl}`,
    `- Source repository: ${sourceRepoUrl}`,
    `- Devvit readiness report: ${defaultDevvitReadinessUrl}`,
    `- Devpost-style field pack: ${defaultDevpostFieldsUrl}`,
    `- Reddit demo post draft: ${defaultDemoPostDraftUrl}`,
    `- Platform feedback pack: ${defaultFeedbackPackUrl}`,
    `- Developer feedback form pack: ${defaultFeedbackFormPackUrl}`,
    optionalLine("Devvit app listing", appListingUrl, "<fill after platform gate>"),
    optionalLine("Public Reddit demo post", demoPostUrl, "<fill after posting gate>"),
    optionalLine("Platform feedback confirmation", feedbackConfirmationUrl, "<fill only if a public confirmation URL exists>"),
    "",
    "## Stage 0 - Public Preflight",
    "",
    "1. Open the public app and confirm the board renders.",
    "2. Open the sample route and confirm it displays a solved route and review surfaces.",
    "3. Open the judge desk and confirm links to demo media, manifest, criteria fit, Devvit readiness, field pack, demo post draft, and feedback pack.",
    "4. Open the source repository and confirm the README, docs, and verification scripts are public.",
    "",
    "Expected local check:",
    "",
    "```powershell",
    `npm run audit:public -- --base-url '${publicAppUrl}' --day '${day}'`,
    "npm run audit:submission",
    "```",
    "",
    "## Stage 1 - Devvit App Listing",
    "",
    "Account-owner action:",
    "",
    "1. Sign in to Reddit / Devvit.",
    "2. Create or open the Signal Garden app listing.",
    "3. Use the public app, sample route, source repo, and Devvit readiness report as the evidence set.",
    "4. Run a real playtest if the platform flow supports it.",
    "5. Record only the public app listing URL here or in local notes.",
    "",
    "Output needed for final pack:",
    "",
    "- Public Devvit app listing URL.",
    "- Any public playtest URL or public note, if the platform exposes one.",
    "",
    "Do not copy passwords, OTPs, cookies, private account pages, payment settings, or identity/KYC screens.",
    "",
    "## Stage 2 - Reddit Demo Post",
    "",
    "Account-owner action:",
    "",
    "1. Open the Reddit demo post draft.",
    "2. Use the suggested title, body, and first comment.",
    "3. Include the public app, sample route, judge desk, source repo, and feedback pack links.",
    "4. Publish only when the account owner is comfortable with the subreddit and content.",
    "5. Record the public demo post URL.",
    "",
    "Output needed for final pack:",
    "",
    "- Public Reddit demo post URL.",
    "",
    "## Stage 3 - Devpost-Style Submission Fields",
    "",
    "Account-owner action:",
    "",
    "1. Open the Devpost-style field pack.",
    "2. Fill project name, tagline, public URLs, description, built-with list, testing instructions, and honest current weaknesses.",
    "3. Attach `docs/demo-final-captioned.webm` or provide a final public video URL.",
    "4. Before final submit, run the generated field export command again with the real app listing and demo post URLs.",
    "",
    "Command after app listing and demo post exist:",
    "",
    "```powershell",
    `npm run export:devpost-fields -- --public-app-url '${publicAppUrl}' --source-repo-url '${sourceRepoUrl}' --day '${day}' --app-listing-url '<public-app-listing-url>' --demo-post-url '<public-demo-post-url>'`,
    "```",
    "",
    "## Stage 4 - Platform Feedback Form",
    "",
    "Account-owner action:",
    "",
    "1. Open the platform feedback pack.",
    "2. Open the developer feedback form pack and copy answers in the public form question order.",
    "3. Prefer the evidence-backed Actionability Matrix when a form allows multiple paragraphs.",
    "4. Use the medium single-field version for a compact text field.",
    "5. Use the short single-field version if the form is very constrained.",
    "6. If the form returns a public confirmation URL, record it. If it returns only a private confirmation screen, keep it out of public docs.",
    "",
    "## Final Evidence Return",
    "",
    "After the account-owner gates, the only values needed back in this repository or local notes are public URLs:",
    "",
    "- Public Devvit app listing URL.",
    "- Public Reddit demo post URL.",
    "- Final public video URL, if not using the committed WebM upload.",
    "- Public feedback confirmation URL, only if one exists.",
    "",
    "Then regenerate the final submission pack:",
    "",
    "```powershell",
    `npm run export:submission-pack -- --public-app-url '${publicAppUrl}' --day '${day}' --sample-route --source-repo-url '${sourceRepoUrl}' --app-listing-url '<public-app-listing-url>' --demo-post-url '<public-demo-post-url>'`,
    "npm run audit:submission",
    "```",
    "",
  ].join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }
  const text = createSubmissionRunbook(options);
  if (options.output) {
    await writeFile(resolve(options.output), text, "utf8");
  } else {
    process.stdout.write(text);
  }
}

if (process.argv[1]?.endsWith("export-submission-runbook.mjs")) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
