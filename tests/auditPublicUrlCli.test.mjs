import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { promisify } from "node:util";

const run = promisify(execFile);
const script = new URL("../scripts/audit-public-url.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

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
  "<a data-dynamic-sample-route>Open today's sample route</a>",
  "<section>Retention Mechanics</section>",
  "<section>User Contributions</section>",
  "<section>Developer Feedback</section>",
  "<section>Media Evidence Kit</section>",
  "<section>Submission Copy Packet</section>",
  "<textarea data-evidence-packet></textarea>",
  "<button>Copy evidence packet</button>",
  "<p>Return pledge</p>",
  "<a>https://github.com/OOYXLOO/signal-garden</a>",
  "<a>demo-final-captioned.webm</a>",
  "<a>desktop-preview.png</a>",
  "<a>mobile-preview.png</a>",
  "<a>submission-manifest.json</a>",
  "<a>criteria-fit.md</a>",
  "<a>devpost-field-pack.md</a>",
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
  const localFailure = await run(process.execPath, [script, "--base-url", baseUrl, "--day", "2026-06-19"]).then(
    () => null,
    (error) => error,
  );
  assert.ok(localFailure);
  assert.match(`${localFailure.stderr}${localFailure.stdout}`, /rejects localhost/);

  const { stdout } = await run(process.execPath, [
    script,
    "--base-url",
    baseUrl,
    "--day",
    "2026-06-19",
    "--allow-local",
    "--json",
  ]);
  const result = JSON.parse(stdout);
  assert.equal(result.ok, true);
  assert.equal(result.baseStatus, 200);
  assert.equal(result.sampleStatus, 200);
  assert.equal(result.judgeStatus, 200);
  assert.match(result.sampleRouteUrl, /day=2026-06-19/);
  assert.match(result.sampleRouteUrl, /sample=1/);
  assert.match(result.judgeDeskUrl, /judge\.html$/);
  assert.equal(result.failures.length, 0);
} finally {
  server.close();
}

console.log("signal garden audit public url cli tests passed");
