import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

const script = new URL("../scripts/export-submission-manifest.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const { stdout } = await run(process.execPath, [script]);
const manifest = JSON.parse(stdout);

assert.equal(manifest.schemaVersion, "signal-garden-submission-manifest/v1");
assert.equal(manifest.project.name, "Signal Garden");
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/demo-final-captioned.webm"));
assert.ok(manifest.evidence.some((entry) => entry.path === ".github/workflows/deploy-pages.yml"));
assert.ok(manifest.evidence.some((entry) => entry.path === "scripts/audit-pages-build.mjs"));
assert.ok(manifest.evidence.some((entry) => entry.path === "scripts/audit-public-url.mjs"));
assert.ok(manifest.evidence.some((entry) => entry.path === "scripts/export-submission-pack.mjs"));
assert.ok(manifest.evidence.some((entry) => entry.path === "scripts/export-demo-post.mjs"));
assert.ok(manifest.evidence.some((entry) => entry.path === "scripts/export-reviewer-share-card.mjs"));
assert.ok(manifest.evidence.some((entry) => entry.path === "scripts/export-feedback-form-pack.mjs"));
assert.ok(manifest.evidence.some((entry) => entry.path === "scripts/export-devvit-readiness.mjs"));
assert.ok(manifest.evidence.some((entry) => entry.path === "scripts/export-devvit-listing-pack.mjs"));
assert.ok(manifest.evidence.some((entry) => entry.path === "scripts/export-submission-runbook.mjs"));
assert.ok(manifest.evidence.some((entry) => entry.path === "scripts/export-public-proof-checklist.mjs"));
assert.ok(manifest.evidence.some((entry) => entry.path === "scripts/export-example-post-proof.mjs"));
assert.ok(manifest.evidence.some((entry) => entry.path === "src/publicProofChecklist.js"));
assert.ok(manifest.evidence.some((entry) => entry.path === "src/examplePostProof.js"));
assert.ok(manifest.evidence.some((entry) => entry.path === "src/reviewerShareCard.js"));
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/devvit-readiness-report.md"));
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/devvit-listing-pack.md"));
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/devvit-listing-pack.json"));
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/developer-feedback-form-pack.md"));
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/submission-runbook.md"));
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/public-proof-checklist.md"));
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/example-post-proof-pack.md"));
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/reviewer-share-card.md"));
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/reviewer-share-card.json"));
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/reviewer-share-card.svg"));
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/frontend-reviewer-handoff.md"));
assert.ok(manifest.evidence.some((entry) => entry.path === "docs/reddit-demo-post-draft.md"));
assert.ok(manifest.evidence.every((entry) => typeof entry.bytes === "number" && entry.bytes > 0));
assert.ok(manifest.evidence.every((entry) => /^[a-f0-9]{64}$/.test(entry.sha256)));
assert.match(manifest.launchPacketCommand, /export:launch-packet/);
assert.match(manifest.launchPacketCommand, /--source-repo-url/);
assert.match(manifest.publicUrlAuditCommand, /audit:public/);
assert.match(manifest.demoPostCommand, /export:demo-post/);
assert.match(manifest.feedbackFormPackCommand, /export:feedback-form-pack/);
assert.match(manifest.devvitReadinessCommand, /export:devvit-readiness/);
assert.match(manifest.devvitListingPackCommand, /export:devvit-listing-pack/);
assert.match(manifest.submissionRunbookCommand, /export:submission-runbook/);
assert.match(manifest.publicProofChecklistCommand, /export:public-proof-checklist/);
assert.match(manifest.examplePostProofCommand, /export:example-post-proof/);
assert.match(manifest.reviewerShareCardCommand, /export:reviewer-share-card/);
assert.match(manifest.submissionPackCommand, /export:submission-pack/);
assert.ok(manifest.requiredLocalChecks.includes("npm run audit:submission"));
assert.ok(manifest.requiredLocalChecks.includes("npm run audit:pages"));

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:submission-manifest/);

console.log("signal garden export submission manifest cli tests passed");
