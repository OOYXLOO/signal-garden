import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

const script = new URL("../scripts/export-launch-packet.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const { stdout } = await run(process.execPath, [
  script,
  "--day",
  "2026-06-19",
  "--sample-route",
  "--review-base-url",
  "https://signal.example.test/play",
  "--source-repo-url",
  "https://github.com/OOYXLOO/signal-garden",
  "--app-listing-url",
  "https://developers.reddit.com/apps/signal-garden",
  "--demo-post-url",
  "https://reddit.com/r/test/comments/signal_garden",
  "--feedback-url",
  "https://forms.gle/example",
  "--strict",
]);

assert.match(stdout, /# Signal Garden 2026-06-19: Harbor loop/);
assert.match(stdout, /Review link: https:\/\/signal\.example\.test\/play\?day=2026-06-19&plan=/);
assert.match(stdout, /Demo post: https:\/\/reddit\.com\/r\/test\/comments\/signal_garden/);
assert.match(stdout, /Source repository: https:\/\/github\.com\/OOYXLOO\/signal-garden/);
assert.match(stdout, /App listing: https:\/\/developers\.reddit\.com\/apps\/signal-garden/);
assert.match(stdout, /## Developer Platform Feedback/);

await assert.rejects(
  () =>
    run(process.execPath, [
      script,
      "--day",
      "2026-06-19",
      "--sample-route",
      "--source-repo-url",
      "https://github.com/OOYXLOO/signal-garden",
      "--app-listing-url",
      "https://developers.reddit.com/apps/signal-garden",
      "--demo-post-url",
      "https://reddit.com/r/test/comments/signal_garden",
      "--strict",
    ]),
  /strict requires --review-url or --review-base-url/,
);

await assert.rejects(
  () =>
    run(process.execPath, [
      script,
      "--day",
      "2026-06-19",
      "--sample-route",
      "--review-base-url",
      "https://signal.example.test/play",
      "--app-listing-url",
      "https://developers.reddit.com/apps/signal-garden",
      "--demo-post-url",
      "https://reddit.com/r/test/comments/signal_garden",
      "--strict",
    ]),
  /source repository URL is required/,
);

console.log("signal garden export launch packet cli tests passed");
