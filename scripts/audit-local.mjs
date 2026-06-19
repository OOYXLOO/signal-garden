import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const required = [
  "README.md",
  "index.html",
  "src/main.js",
  "src/game/puzzle.js",
  "src/game/proposals.js",
  "src/game/SignalGardenScene.js",
  "tests/puzzle.test.mjs",
  "docs/design.md",
  "docs/devvit-adapter-plan.md",
];

const forbidden = [
  new RegExp(["money", "goal"].join("-"), "i"),
  new RegExp(["USD", "200"].join(" "), "i"),
  new RegExp("\\u8d5a\\u94b1"),
  new RegExp("\\u5956\\u91d1"),
  new RegExp(["pay", "out"].join(""), "i"),
  new RegExp(["cash", "prize"].join(" "), "i"),
];
const ignoredDirs = new Set(["node_modules", "dist", ".git"]);
const checkedExtensions = new Set([".md", ".html", ".js", ".mjs", ".css", ".json"]);

function extname(path) {
  const index = path.lastIndexOf(".");
  return index === -1 ? "" : path.slice(index);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
    } else {
      files.push(path);
    }
  }
  return files;
}

const failures = [];
for (const file of required) {
  try {
    const info = await stat(join(root, file));
    if (!info.isFile()) failures.push(`required file missing: ${file}`);
  } catch {
    failures.push(`required file missing: ${file}`);
  }
}

for (const file of await walk(root)) {
  if (!checkedExtensions.has(extname(file))) {
    continue;
  }
  const text = await readFile(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(text)) {
      failures.push(`public wording hit ${pattern} in ${relative(root, file)}`);
    }
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`FAIL ${failure}`);
  }
  process.exit(1);
}

console.log("PASS required files present");
console.log("PASS public wording scan clean");
