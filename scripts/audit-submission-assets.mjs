import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const requiredFiles = [
  "docs/submission-manifest.json",
  "docs/cover.png",
  "docs/desktop-preview.png",
  "docs/mobile-preview.png",
  "docs/demo-final-captioned.webm",
  "docs/demo-script.md",
  "docs/gallery_assets.md",
  "docs/launch-readiness.md",
  "docs/submission-field-pack.md",
  "docs/devvit_dependency_watch.md",
  "scripts/audit-release-gates.mjs",
];

const pngExpectations = [
  { file: "docs/cover.png", width: 1200, height: 630 },
  { file: "docs/desktop-preview.png", width: 1366, minHeight: 900 },
  { file: "docs/mobile-preview.png", width: 390, minHeight: 844 },
];

const textExpectations = [
  {
    file: "docs/submission-field-pack.md",
    fragments: [
      "Short Description",
      "Long Description",
      "What Makes It Social",
      "Technical Highlights",
      "Demo Checklist",
      "comment challenge",
      "review snapshot",
      "launch packet",
      "launch packet CLI export",
      "submission readiness",
      "top route ghosting",
      "sample route",
      "sample preview",
      "GitHub Pages workflow",
      "public URL audit",
      "submission pack",
      "gate runbook",
      "source repository",
      "developer feedback draft",
      "dependency hygiene",
      "return map",
      "sample week preview",
    ],
  },
  {
    file: "docs/devvit_dependency_watch.md",
    fragments: [
      "Devvit Dependency Watch",
      "devvit@0.13.4",
      "@devvit/public-api@0.13.4",
      "23",
      "4",
      "devvit@1.0.0",
      "Repository Policy",
    ],
  },
  {
    file: "docs/demo-script.md",
    fragments: [
      "objective progress",
      "review link",
      "archive Review",
      "comment prompt",
      "review snapshot",
      "submission readiness",
      "launch packet",
      "top route ghost",
    ],
  },
  {
    file: "docs/gallery_assets.md",
    fragments: ["cover.png", "desktop-preview.png", "mobile-preview.png", "demo-final-captioned.webm"],
  },
  {
    file: "docs/launch-readiness.md",
    fragments: [
      "User-Present Gates",
      "Submission Field Mapping",
      "Final Pre-Submit Check",
      "app listing",
      "public demo post",
      "launch packet",
      "submission readiness",
      "export:launch-packet",
      "top route",
      "sample=1",
      "sample preview",
      "Static Review Surface",
      "audit:pages",
      "audit:public",
      "audit:release",
      "export:submission-pack",
      "Gate Runbook",
      "source repository",
      "developer feedback draft",
      "return map",
      "sample week preview",
    ],
  },
];

const maxDemoDurationSeconds = 60;
const expectedManifestSchema = "signal-garden-submission-manifest/v1";

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

function readVintSize(buffer, offset) {
  const first = buffer[offset];
  if (first === undefined) {
    throw new Error("missing vint");
  }
  let length = 1;
  let marker = 0x80;
  while (length <= 8 && !(first & marker)) {
    length += 1;
    marker >>= 1;
  }
  if (length > 8 || offset + length > buffer.length) {
    throw new Error("invalid vint");
  }
  let value = BigInt(first & ~marker);
  for (let index = 1; index < length; index += 1) {
    value = (value << 8n) + BigInt(buffer[offset + index]);
  }
  return { length, value: Number(value) };
}

function readUnsigned(buffer, offset, length) {
  let value = 0;
  for (let index = 0; index < length; index += 1) {
    value = value * 256 + buffer[offset + index];
  }
  return value;
}

function findElement(buffer, idBytes) {
  const id = Buffer.from(idBytes);
  const offset = buffer.indexOf(id);
  if (offset === -1) {
    return null;
  }
  const size = readVintSize(buffer, offset + id.length);
  const dataOffset = offset + id.length + size.length;
  if (dataOffset + size.value > buffer.length) {
    throw new Error(`element ${id.toString("hex")} exceeds file size`);
  }
  return { offset: dataOffset, size: size.value };
}

function readWebmDurationSeconds(buffer) {
  const scaleElement = findElement(buffer, [0x2a, 0xd7, 0xb1]);
  const timecodeScale = scaleElement ? readUnsigned(buffer, scaleElement.offset, scaleElement.size) : 1_000_000;
  const durationElement = findElement(buffer, [0x44, 0x89]);
  if (!durationElement) {
    throw new Error("missing duration metadata");
  }

  let duration;
  if (durationElement.size === 4) {
    duration = buffer.readFloatBE(durationElement.offset);
  } else if (durationElement.size === 8) {
    duration = buffer.readDoubleBE(durationElement.offset);
  } else {
    throw new Error(`unsupported duration size ${durationElement.size}`);
  }
  return (duration * timecodeScale) / 1_000_000_000;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function auditSubmissionManifest() {
  const manifestPath = "docs/submission-manifest.json";
  let manifest;
  try {
    manifest = JSON.parse(await readFile(join(root, manifestPath), "utf8"));
  } catch (error) {
    failures.push(`${manifestPath} parse failed: ${error.message}`);
    return;
  }

  if (manifest.schemaVersion !== expectedManifestSchema) {
    failures.push(`${manifestPath} schema ${manifest.schemaVersion}, expected ${expectedManifestSchema}`);
  }
  if (manifest.project?.name !== "Signal Garden") {
    failures.push(`${manifestPath} missing Signal Garden project name`);
  }
  if (!Array.isArray(manifest.evidence) || manifest.evidence.length === 0) {
    failures.push(`${manifestPath} evidence list is empty`);
    return;
  }
  if (!Array.isArray(manifest.requiredLocalChecks) || !manifest.requiredLocalChecks.includes("npm run audit:submission")) {
    failures.push(`${manifestPath} missing required local check list`);
  }
  if (!String(manifest.launchPacketCommand || "").includes("export:launch-packet")) {
    failures.push(`${manifestPath} missing launch packet command`);
  }
  if (!String(manifest.publicUrlAuditCommand || "").includes("audit:public")) {
    failures.push(`${manifestPath} missing public URL audit command`);
  }
  if (!String(manifest.submissionPackCommand || "").includes("export:submission-pack")) {
    failures.push(`${manifestPath} missing submission pack command`);
  }

  const seen = new Set();
  for (const entry of manifest.evidence) {
    if (!entry || typeof entry.path !== "string") {
      failures.push(`${manifestPath} contains an evidence entry without a path`);
      continue;
    }
    if (entry.path.includes("\\") || entry.path.startsWith("/") || entry.path.includes("..")) {
      failures.push(`${manifestPath} evidence path is not repository-relative: ${entry.path}`);
      continue;
    }
    if (seen.has(entry.path)) {
      failures.push(`${manifestPath} duplicate evidence path: ${entry.path}`);
      continue;
    }
    seen.add(entry.path);

    try {
      const buffer = await readFile(join(root, entry.path));
      if (entry.bytes !== buffer.length) {
        failures.push(`${manifestPath} stale byte count for ${entry.path}`);
      }
      if (entry.sha256 !== sha256(buffer)) {
        failures.push(`${manifestPath} stale sha256 for ${entry.path}`);
      }
    } catch (error) {
      failures.push(`${manifestPath} evidence read failed for ${entry.path}: ${error.message}`);
    }
  }
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
  const path = join(root, "docs/demo-final-captioned.webm");
  const info = await stat(path);
  if (info.size < 2_000_000) {
    failures.push(`docs/demo-final-captioned.webm size ${info.size}, expected at least 2000000`);
  }
  const duration = readWebmDurationSeconds(await readFile(path));
  if (!Number.isFinite(duration) || duration <= 0) {
    failures.push("docs/demo-final-captioned.webm duration metadata is invalid");
  }
  if (duration > maxDemoDurationSeconds) {
    failures.push(
      `docs/demo-final-captioned.webm duration ${duration.toFixed(2)}s, expected at most ${maxDemoDurationSeconds}s`,
    );
  }
} catch (error) {
  failures.push(`docs/demo-final-captioned.webm check failed: ${error.message}`);
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

await auditSubmissionManifest();

if (failures.length) {
  for (const failure of failures) {
    console.error(`FAIL ${failure}`);
  }
  process.exit(1);
}

console.log("PASS submission assets present");
console.log("PASS gallery image dimensions valid");
console.log("PASS final captioned demo size valid");
console.log("PASS final captioned demo duration valid");
console.log("PASS submission text pack complete");
console.log("PASS submission manifest fresh");
