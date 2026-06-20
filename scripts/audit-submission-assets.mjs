import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const requiredFiles = [
  "docs/cover.png",
  "docs/desktop-preview.png",
  "docs/mobile-preview.png",
  "docs/demo-final-captioned.webm",
  "docs/demo-script.md",
  "docs/gallery_assets.md",
  "docs/launch-readiness.md",
  "docs/submission-field-pack.md",
];

const pngExpectations = [
  { file: "docs/cover.png", width: 1200, height: 630 },
  { file: "docs/desktop-preview.png", width: 1366, minHeight: 900 },
  { file: "docs/mobile-preview.png", width: 390, minHeight: 844 },
];

const textExpectations = [
  {
    file: "docs/submission-field-pack.md",
    fragments: ["Short Description", "Long Description", "What Makes It Social", "Technical Highlights", "Demo Checklist"],
  },
  {
    file: "docs/demo-script.md",
    fragments: ["objective progress", "review link", "archive Review"],
  },
  {
    file: "docs/gallery_assets.md",
    fragments: ["cover.png", "desktop-preview.png", "mobile-preview.png", "demo-final-captioned.webm"],
  },
  {
    file: "docs/launch-readiness.md",
    fragments: ["User-Present Gates", "Submission Field Mapping", "Final Pre-Submit Check", "app listing", "public demo post"],
  },
];

function readPngDimensions(buffer) {
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error("not a png");
  }
  const chunkType = buffer.subarray(12, 16).toString("ascii");
  if (chunkType !== "IHDR") {
    throw new Error("missing IHDR");
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const failures = [];

for (const file of requiredFiles) {
  try {
    const info = await stat(join(root, file));
    if (!info.isFile() || info.size <= 0) {
      failures.push(`required asset is empty: ${file}`);
    }
  } catch {
    failures.push(`required asset missing: ${file}`);
  }
}

for (const expectation of pngExpectations) {
  try {
    const buffer = await readFile(join(root, expectation.file));
    const dimensions = readPngDimensions(buffer);
    if (dimensions.width !== expectation.width) {
      failures.push(`${expectation.file} width ${dimensions.width}, expected ${expectation.width}`);
    }
    if (expectation.height && dimensions.height !== expectation.height) {
      failures.push(`${expectation.file} height ${dimensions.height}, expected ${expectation.height}`);
    }
    if (expectation.minHeight && dimensions.height < expectation.minHeight) {
      failures.push(`${expectation.file} height ${dimensions.height}, expected at least ${expectation.minHeight}`);
    }
  } catch (error) {
    failures.push(`${expectation.file} dimension check failed: ${error.message}`);
  }
}

try {
  const info = await stat(join(root, "docs/demo-final-captioned.webm"));
  if (info.size < 4_000_000) {
    failures.push(`docs/demo-final-captioned.webm size ${info.size}, expected at least 4000000`);
  }
} catch {
  failures.push("docs/demo-final-captioned.webm missing");
}

for (const expectation of textExpectations) {
  try {
    const text = await readFile(join(root, expectation.file), "utf8");
    for (const fragment of expectation.fragments) {
      if (!text.toLowerCase().includes(fragment.toLowerCase())) {
        failures.push(`${expectation.file} missing text: ${fragment}`);
      }
    }
  } catch (error) {
    failures.push(`${expectation.file} text check failed: ${error.message}`);
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`FAIL ${failure}`);
  }
  process.exit(1);
}

console.log("PASS submission assets present");
console.log("PASS gallery image dimensions valid");
console.log("PASS final captioned demo size valid");
console.log("PASS submission text pack complete");

