import { createSubmissionWindowStatus, formatSubmissionWindowStatus, submissionWindowGateStatus } from "./submissionWindow.js";

const PUBLIC_APP_URL = "https://ooyxloo.github.io/signal-garden/";
const SOURCE_REPO_URL = "https://github.com/OOYXLOO/signal-garden";
const RAW_DOC_BASE = "https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs";

export function todayUtcDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function sampleRouteUrl(day = todayUtcDay()) {
  const url = new URL(PUBLIC_APP_URL);
  url.searchParams.set("day", day);
  url.searchParams.set("sample", "1");
  return url.toString();
}

export function createRubricEvidenceMatrix({ day = todayUtcDay() } = {}) {
  const sampleRoute = sampleRouteUrl(day);
  const submissionWindow = createSubmissionWindowStatus({ now: `${day}T12:00:00.000Z` });
  return {
    projectName: "Signal Garden",
    checkedDay: day,
    submissionWindow,
    publicLinks: [
      { label: "Public app", url: PUBLIC_APP_URL },
      { label: "Daily sample route", url: sampleRoute },
      { label: "Judge desk", url: `${PUBLIC_APP_URL}judge.html` },
      { label: "Source repository", url: SOURCE_REPO_URL },
      { label: "Final captioned demo", url: `${RAW_DOC_BASE}/demo-final-captioned.webm` },
      { label: "Submission manifest", url: `${RAW_DOC_BASE}/submission-manifest.json` },
    ],
    requiredSubmissionSurfaces: [
      {
        requirement: "Submission window",
        evidence: `${submissionWindow.detail} Rules source: ${submissionWindow.sourceUrl}`,
        status: submissionWindowGateStatus(submissionWindow),
      },
      {
        requirement: "Working project access",
        evidence: "Public GitHub Pages app, deterministic sample route, judge desk, and public URL audit.",
        status: "ready",
      },
      {
        requirement: "Testing instructions",
        evidence: "Reviewer Quickstart, judge desk First Minute checklist, submission runbook, and launch readiness docs.",
        status: "ready",
      },
      {
        requirement: "Source review",
        evidence: "Public GitHub repository and submission manifest with hashes for media, docs, scripts, and generated packs.",
        status: "ready",
      },
      {
        requirement: "Public Reddit game surface",
        evidence: "Devvit shell, app listing handoff, Reddit demo post draft, and final submission pack commands.",
        status: "user-gated",
      },
      {
        requirement: "Public demo post URL",
        evidence: "Reddit demo post handoff draft exists; final public post URL is filled after account-side posting.",
        status: "user-gated",
      },
      {
        requirement: "Short demo media",
        evidence: "Final captioned WebM, cover, desktop preview, mobile preview, and manifest duration/size audit.",
        status: "ready",
      },
    ],
    judgingAngles: [
      {
        angle: "Delightful UX",
        fit: "First-session guide, objective chips, route replay, top route ghost, rationale text, and mobile smoke coverage reduce first-minute confusion.",
        proof: "public/judge.html, docs/demo-final-captioned.webm, docs/mobile-preview.png, tests/reviewerGuide.test.mjs",
      },
      {
        angle: "Polish",
        fit: "The submission has media assets, generated field packs, launch runbooks, public URL audits, manifest hashes, and a judge desk instead of loose screenshots.",
        proof: "docs/submission-manifest.json, docs/gallery_assets.md, scripts/audit-submission-assets.mjs",
      },
      {
        angle: "Most Reddity",
        fit: "Routes become comment-sized proposals that can be pasted back from a thread, ranked, replayed, and summarized as community state.",
        proof: "src/game/proposals.js, src/reviewerGuide.js, docs/reddit-demo-post-draft.md",
      },
      {
        angle: "Hookiest Hook",
        fit: "The hook is not the mirror puzzle alone; it is the daily relay from one exact route link into ranked community proposals and a next-day invite.",
        proof: "docs/criteria-fit.md, docs/submission-field-pack.md, public/judge.html",
      },
      {
        angle: "Phaser Innovation",
        fit: "The Phaser board is paired with deterministic review links, replay state, contribution import, and Devvit-shaped packaging boundaries.",
        proof: "src/game/SignalGardenScene.js, src/share.js, docs/devvit-readiness-report.md",
      },
      {
        angle: "Developer Feedback",
        fit: "The feedback pack ties concrete Phaser/Vite/Devvit integration gaps to public evidence, reproduction steps, and answer-field order.",
        proof: "docs/platform-feedback-pack.md, docs/developer-feedback-form-pack.md, src/platformFeedback.js",
      },
    ],
    riskRegister: [
      {
        risk: "A judge opens the app before the Reddit demo post exists.",
        mitigation: "Judge desk and sample route show the full gameplay and community loop without private account access.",
      },
      {
        risk: "Feedback award eligibility is missed even if good answers exist.",
        mitigation: "Developer feedback form pack includes an eligibility checklist before copying answers.",
      },
      {
        risk: "Evidence links get stale across a multi-week judging window.",
        mitigation: "Judge desk and feedback pack generate current sample-route dates; manifest and audits catch stale generated files.",
      },
      {
        risk: "The project is mistaken for a generic puzzle demo.",
        mitigation: "Rubric matrix, criteria-fit brief, sample thread import, contributor board, and top-route rationale foreground Reddit-native contribution loops.",
      },
    ],
    nextExternalGates: [
      "Create or open the Devvit app listing.",
      "Run a real Devvit playtest.",
      "Publish the public Reddit demo post.",
      "Export final submission pack with live app listing and demo post URLs.",
      "Submit the Devpost-style entry and Developer Feedback Survey from the account owner side.",
    ],
  };
}

function tableCell(value) {
  return String(value || "")
    .replaceAll("|", "\\|")
    .replace(/\s+/g, " ")
    .trim();
}

function table(headers, rows) {
  return [
    `| ${headers.map(tableCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(tableCell).join(" | ")} |`),
  ].join("\n");
}

export function formatRubricEvidenceMatrix(matrix) {
  const lines = [
    "# Signal Garden Rubric Evidence Matrix",
    "",
    `Generated for day: ${matrix.checkedDay}`,
    "",
    "This matrix maps public judging and submission expectations to concrete Signal Garden evidence. It is a review aid only; it does not submit forms, post to Reddit, or claim external-account actions are complete.",
    "",
    "## Public Links",
    "",
    ...matrix.publicLinks.map((link) => `- ${link.label}: ${link.url}`),
    "",
    "## Submission Window",
    "",
    formatSubmissionWindowStatus(matrix.submissionWindow),
    "",
    "## Required Submission Surfaces",
    "",
    table(
      ["Requirement", "Evidence", "Status"],
      matrix.requiredSubmissionSurfaces.map((item) => [item.requirement, item.evidence, item.status]),
    ),
    "",
    "## Judging Angle Fit",
    "",
    table(
      ["Angle", "Signal Garden fit", "Proof"],
      matrix.judgingAngles.map((item) => [item.angle, item.fit, item.proof]),
    ),
    "",
    "## Risk Register",
    "",
    table(
      ["Risk", "Mitigation"],
      matrix.riskRegister.map((item) => [item.risk, item.mitigation]),
    ),
    "",
    "## Next External Gates",
    "",
    ...matrix.nextExternalGates.map((gate, index) => `${index + 1}. ${gate}`),
    "",
  ];
  return lines.join("\n");
}
