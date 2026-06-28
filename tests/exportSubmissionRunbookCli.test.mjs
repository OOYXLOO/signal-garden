import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createSubmissionRunbook, todayUtcDay } from "../scripts/export-submission-runbook.mjs";

const run = promisify(execFile);
const script = new URL("../scripts/export-submission-runbook.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const runbook = createSubmissionRunbook({
  day: "2026-06-22",
  appListingUrl: "https://developers.reddit.com/apps/signal-garden",
  demoPostUrl: "https://www.reddit.com/r/test/comments/signal_garden_demo/",
});

assert.match(runbook, /Signal Garden Submission Runbook/);
assert.match(runbook, /Stage 0 - Public Preflight/);
assert.match(runbook, /Stage 1 - Devvit App Listing/);
assert.match(runbook, /Stage 2 - Reddit Demo Post/);
assert.match(runbook, /Stage 3 - Devpost-Style Submission Fields/);
assert.match(runbook, /Stage 4 - Platform Feedback Form/);
assert.match(runbook, /Final Evidence Return/);
assert.match(runbook, /Devvit readiness report/);
assert.match(runbook, /Platform feedback pack/);
assert.match(runbook, /npm run export:submission-pack/);
assert.match(runbook, /https:\/\/signal-garden\.vercel\.app\/\?day=2026-06-22&sample=1/);
assert.match(runbook, /https:\/\/developers\.reddit\.com\/apps\/signal-garden/);
assert.match(runbook, /https:\/\/www\.reddit\.com\/r\/test\/comments\/signal_garden_demo\//);

const defaultRunbook = createSubmissionRunbook({});
assert.match(defaultRunbook, new RegExp(`Generated for day: ${todayUtcDay()}`));
assert.doesNotMatch(defaultRunbook, /day=2026-06-22&sample=1/);

for (const forbidden of ["passwords, OTPs, cookies", "identity/KYC screens"]) {
  assert.match(runbook, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}
const forbiddenPublicTerms = [
  ["USD", "200"].join(" "),
  ["money", "goal"].join("-"),
  ["赚", "钱"].join(""),
  ["pay", "out"].join(""),
];
for (const term of forbiddenPublicTerms) {
  assert.doesNotMatch(runbook, new RegExp(term, "i"));
}

assert.throws(() => createSubmissionRunbook({ publicAppUrl: "http://localhost:8796/" }), /public/);

const { stdout } = await run(process.execPath, [script, "--day", "2026-06-22"]);
assert.match(stdout, /Signal Garden Submission Runbook/);
assert.match(stdout, /<fill after platform gate>/);

const defaultCli = await run(process.execPath, [script]);
assert.match(defaultCli.stdout, new RegExp(`Generated for day: ${todayUtcDay()}`));
assert.doesNotMatch(defaultCli.stdout, /day=2026-06-22&sample=1/);

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:submission-runbook/);

console.log("signal garden export submission runbook cli tests passed");
