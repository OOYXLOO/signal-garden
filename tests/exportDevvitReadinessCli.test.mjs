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
assert.ok(report.checks.some((item) => item.id === "menu-endpoint"));
assert.ok(report.checks.some((item) => item.id === "redis-boundary"));
assert.ok(report.accountOwnerGates.some((gate) => gate.includes("devvit login")));
assert.ok(report.recommendedCommands.includes("npm run audit:devvit"));

const markdown = formatDevvitReadinessReport(report);
assert.match(markdown, /# Devvit Readiness Report/);
assert.match(markdown, /READY_FOR_ACCOUNT_OWNER_PLAYTEST/);
assert.match(markdown, /subreddit moderator endpoint/);
assert.match(markdown, /private account pages/);

const { stdout } = await run(process.execPath, [script, "--json", "--date", "2026-06-22"]);
const cliReport = JSON.parse(stdout);
assert.equal(cliReport.date, "2026-06-22");
assert.equal(cliReport.verdict, "READY_FOR_ACCOUNT_OWNER_PLAYTEST");

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:devvit-readiness/);

console.log("signal garden export devvit readiness cli tests passed");
