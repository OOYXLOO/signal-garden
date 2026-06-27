import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createDevvitReadinessReport, formatDevvitReadinessReport } from "../scripts/export-devvit-readiness.mjs";

const run = promisify(execFile);
const script = new URL("../scripts/export-devvit-readiness.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const report = await createDevvitReadinessReport({ date: "2026-06-22" });

assert.equal(report.schemaVersion, "signal-garden-devvit-readiness/v1");
assert.equal(report.verdict, "READY_FOR_ACCOUNT_OWNER_PLAYTEST");
assert.ok(report.checks.every((item) => item.ok));
assert.ok(report.checks.some((item) => item.id === "config-name" && item.evidence === "devvit.json name is sigardenyxl"));
assert.ok(report.checks.some((item) => item.id === "menu-endpoint"));
assert.ok(report.checks.some((item) => item.id === "redis-boundary"));
assert.ok(report.checks.some((item) => item.id === "listing-pack"));
assert.ok(report.accountOwnerGates.some((gate) => gate.includes("devvit login")));
assert.equal(report.accountOwnerHandoff.appSlug, "sigardenyxl");
assert.ok(report.accountOwnerHandoff.humanityGateUrl.includes("app_name=sigardenyxl"));
assert.ok(report.accountOwnerHandoff.afterHumanityCommands.includes("npx devvit upload --verbose"));
assert.ok(report.accountOwnerHandoff.requiredPublicUrls.some((item) => item.label === "Devvit app listing URL"));
assert.ok(report.accountOwnerHandoff.sensitiveBoundaries.some((item) => item.includes("OTP")));
assert.ok(report.recommendedCommands.includes("npm run audit:devvit"));
assert.ok(report.recommendedCommands.includes("npm run export:devvit-listing-pack -- --output docs/devvit-listing-pack.md"));

const markdown = formatDevvitReadinessReport(report);
assert.match(markdown, /# Devvit Readiness Report/);
assert.match(markdown, /READY_FOR_ACCOUNT_OWNER_PLAYTEST/);
assert.match(markdown, /subreddit moderator endpoint/);
assert.match(markdown, /Post-Humanity Handoff/);
assert.match(markdown, /sigardenyxl/);
assert.match(markdown, /Devvit listing field pack/);
assert.match(markdown, /npx devvit upload --verbose/);
assert.match(markdown, /public Reddit demo post URL/);
assert.match(markdown, /private account pages/);

const { stdout } = await run(process.execPath, [script, "--json", "--date", "2026-06-22"]);
const cliReport = JSON.parse(stdout);
assert.equal(cliReport.date, "2026-06-22");
assert.equal(cliReport.verdict, "READY_FOR_ACCOUNT_OWNER_PLAYTEST");
assert.equal(cliReport.accountOwnerHandoff.appSlug, "sigardenyxl");

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:devvit-readiness/);

console.log("signal garden export devvit readiness cli tests passed");
