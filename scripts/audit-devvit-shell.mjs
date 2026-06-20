import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const requiredFiles = [
  "devvit.json",
  "vite.devvit.client.config.js",
  "vite.devvit.server.config.js",
  "src/devvit/client/splash.html",
  "src/devvit/client/splash.js",
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
const createPostMenu = config.menu?.items?.find((item) => item.endpoint === "/internal/menu/post-create");
if (!createPostMenu) {
  failures.push("devvit menu must expose /internal/menu/post-create");
} else {
  if (createPostMenu.location !== "subreddit") {
    failures.push("post create menu must be a subreddit menu item");
  }
  if (createPostMenu.forUserType !== "moderator") {
    failures.push("post create menu must be moderator scoped");
  }
}
const serialized = JSON.stringify(config);
if (serialized.includes("<%") || serialized.includes("%>")) {
  failures.push("devvit.json still contains template placeholders");
}

const gameEntry = await readFile(join(root, "src/devvit/client/game-entry.js"), "utf8");
if (!gameEntry.includes("SIGNAL_GARDEN_MANUAL_START")) {
  failures.push("devvit game entry must use manual Signal Garden startup");
}
if (!gameEntry.includes("createFetchCommunityClient")) {
  failures.push("devvit game entry must use the fetch-backed community client");
}
if (!gameEntry.includes("window.location.origin")) {
  failures.push("devvit game entry must point fetch client at the hosted origin");
}

const gameHtml = await readFile(join(root, "src/devvit/client/game.html"), "utf8");
if (!gameHtml.includes('id="comment-challenge"')) {
  failures.push("devvit game shell must include the comment challenge prompt");
}
if (!gameHtml.includes('id="copy-comment-challenge"')) {
  failures.push("devvit game shell must include the comment challenge copy control");
}

const splash = await readFile(join(root, "src/devvit/client/splash.html"), "utf8");
if (!splash.includes("./splash.js")) {
  failures.push("devvit splash must load its entry shim");
}
if (!splash.includes('id="open-game"')) {
  failures.push("devvit splash must expose an explicit open-game control");
}

const splashEntry = await readFile(join(root, "src/devvit/client/splash.js"), "utf8");
if (!splashEntry.includes("devvit-internal")) {
  failures.push("devvit splash shim must emit Devvit internal messages");
}
if (!splashEntry.includes("immersiveMode")) {
  failures.push("devvit splash shim must request immersive mode");
}
if (!splashEntry.includes("entrypoints") || !splashEntry.includes("game")) {
  failures.push("devvit splash shim must use the configured game entrypoint");
}
if (!splashEntry.includes("game.html")) {
  failures.push("devvit splash shim must keep a local game.html fallback");
}

async function fileExists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function dirExists(path) {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

const builtClientDir = join(root, "dist/client");
if (await fileExists(join(builtClientDir, "splash.html"))) {
  const builtSplash = await readFile(join(builtClientDir, "splash.html"), "utf8");
  const builtGame = await readFile(join(builtClientDir, "game.html"), "utf8").catch(() => "");
  if (builtSplash.includes('src="/assets') || builtSplash.includes('href="/assets')) {
    failures.push("built splash.html must use relative asset paths for Devvit static hosting");
  }
  if (builtGame.includes('src="/assets') || builtGame.includes('href="/assets')) {
    failures.push("built game.html must use relative asset paths for Devvit static hosting");
  }
  if (!(await fileExists(join(builtClientDir, "game.html")))) {
    failures.push("built devvit client is missing game.html");
  }
  if (!(await dirExists(join(builtClientDir, "assets")))) {
    failures.push("built devvit client is missing bundled assets");
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
