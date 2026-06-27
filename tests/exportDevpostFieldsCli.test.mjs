import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { promisify } from "node:util";

const run = promisify(execFile);
const script = new URL("../scripts/export-devpost-fields.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address()));
  });
}

const appHtml = [
  "<!doctype html>",
  "<html>",
  "<head>",
  "<title>Signal Garden</title>",
  '<link rel="stylesheet" href="./assets/app.css">',
  "</head>",
  "<body>",
  "<main>Signal Garden public review surface</main>",
  '<script type="module" src="./assets/app.js"></script>',
  "</body>",
  "</html>",
].join("");

const judgeHtml = [
  "<!doctype html>",
  "<html>",
  "<head>",
  "<title>Signal Garden Judge Desk</title>",
  '<link rel="icon" href="./favicon.svg">',
  "</head>",
  "<body>",
  "<main>",
  "<h1>Signal Garden Judge Desk</h1>",
  "<a>Open today's sample route</a>",
  "<a>https://github.com/OOYXLOO/signal-garden</a>",
  "<a>demo-final-captioned.webm</a>",
  "<a>submission-manifest.json</a>",
  "<a>criteria-fit.md</a>",
  "</main>",
  "</body>",
  "</html>",
].join("");

const server = createServer((request, response) => {
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(request.url.includes("judge.html") ? judgeHtml : appHtml);
});

const address = await listen(server);
const baseUrl = `http://127.0.0.1:${address.port}/signal-garden/`;

try {
  const localFailure = await run(process.execPath, [
    script,
    "--public-app-url",
    baseUrl,
    "--source-repo-url",
    "https://github.com/OOYXLOO/signal-garden",
    "--day",
    "2026-06-22",
  ]).then(
    () => null,
    (error) => error,
  );
  assert.ok(localFailure);
  assert.match(`${localFailure.stderr}${localFailure.stdout}`, /must be public/);

  const strictFailure = await run(process.execPath, [
    script,
    "--public-app-url",
    baseUrl,
    "--source-repo-url",
    "https://github.com/OOYXLOO/signal-garden",
    "--day",
    "2026-06-22",
    "--allow-local",
    "--strict",
  ]).then(
    () => null,
    (error) => error,
  );
  assert.ok(strictFailure);
  assert.match(`${strictFailure.stderr}${strictFailure.stdout}`, /app listing URL is required|video URL is required/);

  const { stdout } = await run(process.execPath, [
    script,
    "--public-app-url",
    baseUrl,
    "--source-repo-url",
    "https://github.com/OOYXLOO/signal-garden",
    "--day",
    "2026-06-22",
    "--allow-local",
  ]);
  assert.match(stdout, /# Signal Garden Devpost Field Pack/);
  assert.match(stdout, /Project Name/);
  assert.match(stdout, /Signal Garden/);
  assert.match(stdout, /Tagline/);
  assert.match(stdout, /Project URL Fields/);
  assert.match(stdout, /Sample route: http:\/\/127\.0\.0\.1:/);
  assert.match(stdout, /Judge desk: http:\/\/127\.0\.0\.1:/);
  assert.match(stdout, /Criteria fit brief:/);
  assert.match(stdout, /Built With/);
  assert.match(stdout, /What Makes It Social/);
  assert.match(stdout, /Each route can be shared as a link/);
  assert.match(stdout, /Testing Instructions/);
  assert.match(stdout, /Shared deterministic puzzle engine/);
  assert.match(stdout, /The proposal layer recomputes scores/);
  assert.match(stdout, /Criteria Fit Summary/);
  assert.match(stdout, /Pending External Gates/);
  assert.match(stdout, /Devvit app listing URL/);
  assert.match(stdout, /public Reddit demo post URL/);
  assert.match(stdout, /Video: http:\/\/127\.0\.0\.1:\d+\/signal-garden\/demo-video\.html/);
  assert.doesNotMatch(stdout, /uploaded Devpost video or final public video URL/);
  assert.match(stdout, /Final Pre-Submit Commands/);

  const strictReady = await run(process.execPath, [
    script,
    "--public-app-url",
    baseUrl,
    "--source-repo-url",
    "https://github.com/OOYXLOO/signal-garden",
    "--app-listing-url",
    "https://developers.reddit.com/apps/signal-garden",
    "--demo-post-url",
    "https://www.reddit.com/r/test/comments/signal_garden/",
    "--video-url",
    "https://example.com/signal-garden-demo.webm",
    "--day",
    "2026-06-22",
    "--allow-local",
    "--strict",
  ]);
  assert.match(strictReady.stdout, /None for the supplied field set/);
  assert.match(strictReady.stdout, /Devvit app listing: https:\/\/developers\.reddit\.com\/apps\/signal-garden/);
  assert.match(strictReady.stdout, /Public demo post: https:\/\/www\.reddit\.com\/r\/test\/comments\/signal_garden\//);
} finally {
  server.close();
}

console.log("signal garden export devpost fields cli tests passed");
