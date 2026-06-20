import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const requiredFiles = [
  "devvit.json",
  "vite.devvit.client.config.js",
  "vite.devvit.server.config.js",
  "src/devvit/client/splash.html",
  "src/devvit/client/game.html",
  "src/devvit/client/game-entry.js",
  "src/devvit/server/index.js",
  "src/client/communityClient.js",
  "src/server/signalGardenApi.js",
  "docs/devvit_shell_readiness.md",
];

const failures = [];

for (const file of requiredFiles) {
  try {
    const info = await stat(join(root, file));
    if (!info.isFile()) {
      failures.push(`required file is not a file: ${file}`);
    }
  } catch {
    failures.push(`required file missing: ${file}`);
  }
}

const config = JSON.parse(await readFile(join(root, "devvit.json"), "utf8"));
if (config.name !== "signal-garden") {
  failures.push("devvit.json name must be signal-garden");
}
if (config.post?.dir !== "dist/client") {
  failures.push("devvit client dir must be dist/client");
}
if (config.post?.entrypoints?.default?.entry !== "splash.html") {
  failures.push("default post entrypoint must be splash.html");
}
if (config.post?.entrypoints?.game?.entry !== "game.html") {
  failures.push("game post entrypoint must be game.html");
}
if (config.server?.dir !== "dist/server" || config.server?.entry !== "index.cjs") {
  failures.push("server output must be dist/server/index.cjs");
}
const serialized = JSON.stringify(config);
if (serialized.includes("<%") || serialized.includes("%>")) {
  failures.push("devvit.json still contains template placeholders");
}

async function fileExists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

const builtClientDir = join(root, "dist/client");
if (await fileExists(join(builtClientDir, "splash.html"))) {
  if (!(await fileExists(join(builtClientDir, "game.html")))) {
    failures.push("built devvit client is missing game.html");
  }
} else {
  const distInfo = await stat(join(root, "dist")).catch(() => null);
  if (distInfo) {
    failures.push("dist exists but built devvit client is missing splash.html in the configured client dir");
  }
}

const builtServer = join(root, "dist/server/index.cjs");
const distInfo = await stat(join(root, "dist")).catch(() => null);
if (distInfo && !(await fileExists(builtServer))) {
  failures.push("dist exists but built devvit server is missing index.cjs in the configured server dir");
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`FAIL ${failure}`);
  }
  process.exit(1);
}

console.log("PASS devvit shell files present");
console.log("PASS devvit config shape valid");
