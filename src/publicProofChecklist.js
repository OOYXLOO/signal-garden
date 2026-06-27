import { createSubmissionWindowStatus, formatSubmissionWindowStatus, submissionWindowGateStatus } from "./submissionWindow.js";

export const defaultPublicAppUrl = "https://signal-garden.vercel.app/";
export const defaultSourceRepoUrl = "https://github.com/OOYXLOO/signal-garden";
export const defaultJudgeDeskUrl = "https://signal-garden.vercel.app/judge.html";
export const defaultRawBase = "https://raw.githubusercontent.com/OOYXLOO/signal-garden/master";

export function todayUtcDay(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function assertDay(day) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error("day must be YYYY-MM-DD");
  }
  return day;
}

function publicUrl(name, value, { required = true } = {}) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    if (required) {
      throw new Error(`${name} is required`);
    }
    return "";
  }
  const url = new URL(trimmed);
  const host = url.hostname.toLowerCase();
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`${name} must use http or https`);
  }
  if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(host) || host.endsWith(".local") || host.endsWith(".test")) {
    throw new Error(`${name} must be a public URL`);
  }
  return url.toString();
}

function sampleRouteUrl(publicAppUrl, day) {
  const url = new URL(publicAppUrl);
  url.searchParams.set("day", day);
  url.searchParams.set("sample", "1");
  return url.toString();
}

function proof(label, status, evidence, link = "") {
  return { label, status, evidence, link };
}

function raw(path) {
  return `${defaultRawBase}/${path}`;
}

function group(title, summary, items) {
  return { title, summary, items };
}

export function createPublicProofChecklist(options = {}) {
  const day = assertDay(options.day || todayUtcDay());
  const publicAppUrl = publicUrl("public app URL", options.publicAppUrl || defaultPublicAppUrl);
  const sourceRepoUrl = publicUrl("source repository URL", options.sourceRepoUrl || defaultSourceRepoUrl);
  const judgeDeskUrl = publicUrl("judge desk URL", options.judgeDeskUrl || defaultJudgeDeskUrl);
  const appListingUrl = publicUrl("app listing URL", options.appListingUrl, { required: false });
  const demoPostUrl = publicUrl("demo post URL", options.demoPostUrl, { required: false });
  const feedbackConfirmationUrl = publicUrl("feedback confirmation URL", options.feedbackConfirmationUrl, { required: false });
  const submissionWindow = createSubmissionWindowStatus({ now: `${day}T12:00:00.000Z` });
  const sampleUrl = sampleRouteUrl(publicAppUrl, day);

  const groups = [
    group("Public access", "Links a reviewer can open without private account data.", [
      proof("Playable app", "ready", "Production app surface is public.", publicAppUrl),
      proof("Sample route", "ready", "Day-specific route opens a complete review loop.", sampleUrl),
      proof("Judge desk", "ready", "Static review desk links media, manifests, docs, and copy packet.", judgeDeskUrl),
      proof("Source repository", "ready", "Public source and verification scripts are available.", sourceRepoUrl),
    ]),
    group("Gameplay proof", "Shows that the project is a playable daily puzzle, not only a pitch deck.", [
      proof("Deterministic board", "ready", "Daily Phaser board with beacons, mirror limit, route replay, and objective chips.", publicAppUrl),
      proof("Final captioned demo", "ready", "Under-one-minute WebM demo is included in the committed evidence set.", raw("docs/demo-final-captioned.webm")),
      proof("Media kit", "ready", "Cover, desktop, mobile, demo script, and gallery asset index are committed.", raw("docs/gallery_assets.md")),
      proof("Submission manifest", "ready", "Manifest records byte counts and hashes for public evidence files.", raw("docs/submission-manifest.json")),
    ]),
    group("Community loop", "Proves the Reddit-style hook: replies can become ranked game state.", [
      proof("Comment challenge", "ready", "The app exports a comment prompt with a Review link.", publicAppUrl),
      proof("Route import", "ready", "Review links and short coordinate replies can be parsed into ranked proposals.", raw("docs/submission-field-pack.md")),
      proof("Top route ghost", "ready", "The board can replay or apply the leading community route.", raw("docs/demo-script.md")),
      proof("Community launch plan", "ready", "Route proof, reply depth, return hook, and first action are packaged for a demo-post launch.", raw("src/communityLaunchPlan.js")),
      proof("Daily recap", "ready", "A copyable recap summarizes routes, contributors, and next-day return cue.", raw("docs/reddit-demo-post-draft.md")),
    ]),
    group("Return loop", "Shows why a player has a reason to come back after the first solve.", [
      proof("Return map", "ready", "Seven-day archive surface shows completed, preview, partial, and open slots.", publicAppUrl),
      proof("Daily missions", "ready", "Daily objectives and contribution checks create short-session progression.", publicAppUrl),
      proof("Sample week", "ready", "Sample week preview demonstrates retention surface without stored private data.", `${publicAppUrl}?sampleWeek=1`),
      proof("Return pledge", "ready", "App exports a next-day prompt that can be used in the demo post or recap.", raw("docs/launch-readiness.md")),
    ]),
    group("Platform handoff", "Keeps account-owner actions separate from public, reusable evidence.", [
      proof("Devvit readiness", "ready", "Report explains WebView surface, server adapter, and dependency boundary.", raw("docs/devvit-readiness-report.md")),
      proof("Developer feedback pack", "ready", "Evidence-backed feedback fields are prepared without submitting a form.", raw("docs/developer-feedback-form-pack.md")),
      proof("Batch submission desk", "ready", "Copy blocks and links are ordered for user-present platform gates.", raw("docs/batch-submission-desk.md")),
      proof("Public demo post", demoPostUrl ? "ready" : "user-gated", demoPostUrl ? "Public Reddit demo post URL is available." : "Account owner posts later; draft is prepared.", demoPostUrl || raw("docs/reddit-demo-post-draft.md")),
    ]),
    group("Feedback award readiness", "Shows that the optional developer feedback route is evidence-backed and account-owner gated.", [
      proof("Survey answer pack", "ready", "Prepared answers follow the public form order and include character counts for constrained fields.", raw("docs/developer-feedback-form-pack.md")),
      proof("Eligibility gate", "ready", "Checklist names the required participant account, project entry, username match, and public proof checks before submission.", raw("docs/developer-feedback-form-pack.md")),
      proof("Actionable platform feedback", "ready", "Feedback is tied to concrete Devvit game-building gaps: WebView assets, expanded-mode lifecycle, comment-to-state flow, and evidence handoff.", raw("docs/platform-feedback-pack.md")),
      proof("Feedback confirmation", feedbackConfirmationUrl ? "ready" : "optional", feedbackConfirmationUrl ? "Public feedback confirmation URL is available." : "Only record this after the account owner submits the survey.", feedbackConfirmationUrl || raw("docs/developer-feedback-form-pack.md")),
    ]),
    group("Final submission guard", "Names what must be true immediately before pressing a platform submit button.", [
      proof("Submission window", submissionWindowGateStatus(submissionWindow), formatSubmissionWindowStatus(submissionWindow), submissionWindow.sourceUrl),
      proof("App listing", appListingUrl ? "ready" : "user-gated", appListingUrl ? "Public app listing URL is available." : "Account owner creates listing later.", appListingUrl || raw("docs/submission-runbook.md")),
      proof("Local verification", "ready", "Run check, tests, builds, local/devvit/pages/submission audits, public URL audit, and npm audit.", raw("docs/public-verification.md")),
    ]),
  ];

  const counts = groups
    .flatMap((item) => item.items)
    .reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

  return {
    schemaVersion: "signal-garden-public-proof-checklist/v1",
    projectName: "Signal Garden",
    day,
    generatedAt: `${day}T12:00:00.000Z`,
    publicAppUrl,
    sampleRouteUrl: sampleUrl,
    sourceRepoUrl,
    judgeDeskUrl,
    statusCounts: counts,
    groups,
  };
}

export function formatPublicProofChecklist(checklist) {
  const tableCell = (value) => String(value || "").replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|");
  const lines = [
    "# Signal Garden Public Proof Checklist",
    "",
    `Generated for day: ${checklist.day}`,
    "",
    "This checklist is a public review aid. It does not submit forms, post to Reddit, access private account pages, or include credentials.",
    "",
    "## Quick Links",
    "",
    `- Public app: ${checklist.publicAppUrl}`,
    `- Sample route: ${checklist.sampleRouteUrl}`,
    `- Judge desk: ${checklist.judgeDeskUrl}`,
    `- Source repository: ${checklist.sourceRepoUrl}`,
    "",
    "## Status Counts",
    "",
  ];

  for (const key of Object.keys(checklist.statusCounts).sort()) {
    lines.push(`- ${key}: ${checklist.statusCounts[key]}`);
  }

  for (const group of checklist.groups) {
    lines.push("", `## ${group.title}`, "", group.summary, "");
    lines.push("| Item | Status | Evidence | Link |", "|---|---:|---|---|");
    for (const item of group.items) {
      lines.push(`| ${tableCell(item.label)} | ${tableCell(item.status)} | ${tableCell(item.evidence)} | ${tableCell(item.link)} |`);
    }
  }

  lines.push(
    "",
    "## Final Pre-Submit Command",
    "",
    "```powershell",
    `npm run audit:public -- --base-url '${checklist.publicAppUrl}' --day '${checklist.day}'`,
    "npm run audit:submission",
    "npm audit --audit-level=moderate",
    "```",
    "",
  );
  return lines.join("\n");
}
