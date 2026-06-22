import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const failures = [];

async function requireFile(path) {
  try {
    const info = await stat(join(root, path));
    if (!info.isFile() || info.size <= 0) {
      failures.push(`missing or empty file: ${path}`);
    }
  } catch {
    failures.push(`missing file: ${path}`);
  }
}

await requireFile("dist/index.html");
await requireFile("dist/judge.html");
await requireFile("dist/favicon.svg");

let html = "";
let judgeHtml = "";
try {
  html = await readFile(join(root, "dist/index.html"), "utf8");
} catch (error) {
  failures.push(`could not read dist/index.html: ${error.message}`);
}
try {
  judgeHtml = await readFile(join(root, "dist/judge.html"), "utf8");
} catch (error) {
  failures.push(`could not read dist/judge.html: ${error.message}`);
}

const forbiddenFragments = [
  'href="/',
  'src="/',
  "href='/",
  "src='/",
];

for (const fragment of forbiddenFragments) {
  if (html.includes(fragment)) {
    failures.push(`dist/index.html contains root-relative asset reference: ${fragment}`);
  }
  if (judgeHtml.includes(fragment)) {
    failures.push(`dist/judge.html contains root-relative asset reference: ${fragment}`);
  }
}

if (!html.includes("./assets/")) {
  failures.push("dist/index.html does not include relative ./assets/ references");
}
if (!html.includes("./favicon.svg")) {
  failures.push("dist/index.html does not include relative favicon reference");
}
for (const fragment of [
  "Signal Garden Judge Desk",
  "Open sample route",
  "demo-final-captioned.webm",
  "submission-manifest.json",
  "criteria-fit.md",
  "devpost-field-pack.md",
  "https://github.com/OOYXLOO/signal-garden",
]) {
  if (!judgeHtml.includes(fragment)) {
    failures.push(`dist/judge.html missing review desk text: ${fragment}`);
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`FAIL ${failure}`);
  }
  process.exit(1);
}

console.log("PASS pages build assets are repository-page relative");
