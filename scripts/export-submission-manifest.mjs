import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), "..");

const evidenceFiles = [
  "README.md",
  ".github/workflows/deploy-pages.yml",
  "public/judge.html",
  "public/demo-video.html",
  "docs/cover.png",
  "docs/desktop-preview.png",
  "docs/mobile-preview.png",
  "docs/demo-final-captioned.webm",
  "docs/demo-script.md",
  "docs/gallery_assets.md",
  "docs/launch-readiness.md",
  "docs/submission-field-pack.md",
  "docs/devpost-field-pack.md",
  "docs/criteria-fit.md",
  "docs/rubric-evidence-matrix.md",
  "docs/platform-feedback-pack.md",
  "docs/developer-feedback-form-pack.md",
  "docs/feedback-award-submission-brief.md",
  "docs/batch-submission-desk.md",
  "docs/public-proof-checklist.md",
  "docs/example-post-proof-pack.md",
  "docs/public-playtest-2026-06-28.md",
  "docs/vercel-production-proof-2026-06-28.md",
  "docs/launch-proof-template.md",
  "docs/reviewer-share-card.md",
  "docs/reviewer-share-card.json",
  "docs/reviewer-share-card.svg",
  "docs/frontend-reviewer-handoff.md",
  "docs/submission-runbook.md",
  "docs/reddit-demo-post-draft.md",
  "docs/devvit_shell_readiness.md",
  "docs/devvit-readiness-report.md",
  "docs/devvit-listing-pack.md",
  "docs/devvit-listing-pack.json",
  "docs/devvit_dependency_watch.md",
  "src/platformFeedback.js",
  "src/reviewerShareCard.js",
  "src/communityLaunchPlan.js",
  "src/rubricEvidence.js",
  "src/publicProofChecklist.js",
  "src/examplePostProof.js",
  "src/batchSubmissionDesk.js",
  "scripts/audit-pages-build.mjs",
  "scripts/audit-public-url.mjs",
  "scripts/audit-release-gates.mjs",
  "scripts/export-launch-packet.mjs",
  "scripts/export-submission-pack.mjs",
  "scripts/export-devpost-fields.mjs",
  "scripts/export-platform-feedback.mjs",
  "scripts/export-feedback-form-pack.mjs",
  "scripts/export-rubric-evidence.mjs",
  "scripts/export-batch-submission-desk.mjs",
  "scripts/export-public-proof-checklist.mjs",
  "scripts/export-example-post-proof.mjs",
  "scripts/export-demo-post.mjs",
  "scripts/export-reviewer-share-card.mjs",
  "scripts/export-devvit-readiness.mjs",
  "scripts/export-devvit-listing-pack.mjs",
  "scripts/export-submission-runbook.mjs",
];

function parseArgs(argv) {
  const options = {
    output: "",
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--output") {
      index += 1;
      if (index >= argv.length) {
        throw new Error("Missing value for --output");
      }
      options.output = argv[index];
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  return options;
}

function helpText() {
  return [
    "Usage:",
    "  npm run export:submission-manifest -- --output docs/submission-manifest.json",
    "",
    "Creates a deterministic manifest of public submission evidence files.",
  ].join("\n");
}

async function fileEntry(path) {
  const buffer = await readFile(resolve(root, path));
  return {
    path,
    bytes: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
  };
}

export async function createSubmissionManifest() {
  const entries = [];
  for (const path of evidenceFiles) {
    entries.push(await fileEntry(path));
  }

  return {
    schemaVersion: "signal-garden-submission-manifest/v1",
    project: {
      name: "Signal Garden",
      type: "daily-community-relay-puzzle",
      buildSurface: "Phaser browser game with Devvit shell",
    },
    evidence: entries,
    requiredLocalChecks: [
      "npm test",
      "npm run check",
      "npm run build:all",
      "npm run audit:local",
      "npm run audit:devvit",
      "npm run audit:pages",
      "npm run audit:release",
      "npm run audit:submission",
      "npm audit --audit-level=moderate",
    ],
    launchPacketCommand:
      "npm run export:launch-packet -- --day <YYYY-MM-DD> --plan <review-plan-token> --review-base-url <public-app-url> --source-repo-url <public-source-repo-url> --app-listing-url <public-app-listing-url> --demo-post-url <public-demo-post-url> --strict",
    publicUrlAuditCommand: "npm run audit:public -- --base-url <public-app-url> --day <YYYY-MM-DD>",
    platformFeedbackCommand:
      "npm run export:platform-feedback -- --day <YYYY-MM-DD> --sample-route --review-base-url <public-app-url>",
    feedbackFormPackCommand:
      "npm run export:feedback-form-pack -- --sample-route --username <reddit-username> --output docs/developer-feedback-form-pack.md",
    batchSubmissionDeskCommand:
      "npm run export:batch-submission-desk -- --day <YYYY-MM-DD> --output docs/batch-submission-desk.md",
    publicProofChecklistCommand:
      "npm run export:public-proof-checklist -- --day <YYYY-MM-DD> --output docs/public-proof-checklist.md",
    examplePostProofCommand:
      "npm run export:example-post-proof -- --day <YYYY-MM-DD> --output docs/example-post-proof-pack.md",
    reviewerShareCardCommand:
      "npm run export:reviewer-share-card -- --day <YYYY-MM-DD> --sample-route --public-app-url <public-app-url> --source-repo-url <public-source-repo-url>",
    devvitReadinessCommand:
      "npm run export:devvit-readiness -- --output docs/devvit-readiness-report.md",
    devvitListingPackCommand:
      "npm run export:devvit-listing-pack -- --output docs/devvit-listing-pack.md",
    submissionRunbookCommand: "npm run export:submission-runbook -- --output docs/submission-runbook.md",
    devpostFieldsCommand:
      "npm run export:devpost-fields -- --public-app-url <public-app-url> --source-repo-url <public-source-repo-url> --day <YYYY-MM-DD>",
    demoPostCommand:
      "npm run export:demo-post -- --day <YYYY-MM-DD> --sample-route --public-app-url <public-app-url> --source-repo-url <public-source-repo-url> --feedback-pack-url <public-feedback-pack-url>",
    submissionPackCommand:
      "npm run export:submission-pack -- --public-app-url <public-app-url> --day <YYYY-MM-DD> --plan <review-plan-token> --source-repo-url <public-source-repo-url> --app-listing-url <public-app-listing-url> --demo-post-url <public-demo-post-url> OR --sample-route",
    publicGatePlaceholders: [
      "public source repository URL",
      "public app listing URL",
      "public demo post URL",
      "public review URL",
    ],
    guardrails: [
      "No private account pages or credentials in media.",
      "No localhost URLs in strict launch packet output.",
      "Repository text stays focused on Signal Garden project evidence.",
    ],
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }

  const manifest = await createSubmissionManifest();
  const text = `${JSON.stringify(manifest, null, 2)}\n`;
  if (options.output) {
    await writeFile(resolve(root, options.output), text, "utf8");
  } else {
    process.stdout.write(text);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
