import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { promisify } from "node:util";

const run = promisify(execFile);
const script = new URL("../scripts/export-submission-pack.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address()));
  });
}

const html = [
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

const server = createServer((request, response) => {
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(html);
});
const address = await listen(server);
const baseUrl = `http://127.0.0.1:${address.port}/signal-garden/`;

try {
  const failure = await run(process.execPath, [
    script,
    "--public-app-url",
    baseUrl,
    "--day",
    "2026-06-19",
    "--plan",
    "2-2-b.2-6-b",
    "--source-repo-url",
    "https://github.com/OOYXLOO/signal-garden",
    "--app-listing-url",
    "https://developers.reddit.com/apps/signal-garden",
    "--demo-post-url",
    "https://www.reddit.com/r/test/comments/signal_garden/",
  ]).then(
    () => null,
    (error) => error,
  );
  assert.ok(failure);
  assert.match(`${failure.stderr}${failure.stdout}`, /must be public/);

  const missingSource = await run(process.execPath, [
    script,
    "--public-app-url",
    baseUrl,
    "--day",
    "2026-06-19",
    "--plan",
    "2-2-b.2-6-b",
    "--app-listing-url",
    "https://developers.reddit.com/apps/signal-garden",
    "--demo-post-url",
    "https://www.reddit.com/r/test/comments/signal_garden/",
    "--allow-local",
  ]).then(
    () => null,
    (error) => error,
  );
  assert.ok(missingSource);
  assert.match(`${missingSource.stderr}${missingSource.stdout}`, /source repository URL is required/);

  const { stdout } = await run(process.execPath, [
    script,
    "--public-app-url",
    baseUrl,
    "--day",
    "2026-06-19",
    "--plan",
    "2-2-b.2-6-b",
    "--source-repo-url",
    "https://github.com/OOYXLOO/signal-garden",
    "--app-listing-url",
    "https://developers.reddit.com/apps/signal-garden",
    "--demo-post-url",
    "https://www.reddit.com/r/test/comments/signal_garden/",
    "--allow-local",
  ]);
  assert.match(stdout, /# Signal Garden Public Submission Pack/);
  assert.match(stdout, /Public URL Audit/);
  assert.match(stdout, /Evidence Receipt/);
  assert.match(stdout, /Evidence claims/);
  assert.match(stdout, /6\/6 public URL evidence slots ready/);
  assert.match(stdout, /Community proof: 1\/1 saved routes complete/);
  assert.match(stdout, /Retention proof:/);
  assert.match(stdout, /Gate Runbook/);
  assert.match(stdout, /Open the public app URL/);
  assert.match(stdout, /Open the sample route/);
  assert.match(stdout, /Open the exact review link/);
  assert.match(stdout, /Open the source repository/);
  assert.match(stdout, /Attach media in this order/);
  assert.match(stdout, /npm run audit:public/);
  assert.match(stdout, /--base-url 'http:\/\/127\.0\.0\.1:/);
  assert.match(stdout, /--plan '2-2-b\.2-6-b'/);
  assert.match(stdout, /--source-repo-url 'https:\/\/github\.com\/OOYXLOO\/signal-garden'/);
  assert.match(stdout, /npm run audit:submission/);
  assert.match(stdout, /Review link:/);
  assert.match(stdout, /Source repository: https:\/\/github\.com\/OOYXLOO\/signal-garden/);
  assert.match(stdout, /day=2026-06-19/);
  assert.match(stdout, /plan=2-2-b\.2-6-b/);
  assert.match(stdout, /Short Description/);
  assert.match(stdout, /Source Repository/);
  assert.match(stdout, /Launch Packet/);
  assert.match(stdout, /Developer Platform Feedback/);
} finally {
  server.close();
}

console.log("signal garden export submission pack cli tests passed");
