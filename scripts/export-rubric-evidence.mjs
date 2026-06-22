import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createRubricEvidenceMatrix, formatRubricEvidenceMatrix, todayUtcDay } from "../src/rubricEvidence.js";

function parseArgs(argv) {
  const options = {
    day: todayUtcDay(),
    help: false,
    output: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      if (!(key in options)) {
        throw new Error(`Unknown option: ${arg}`);
      }
      index += 1;
      if (index >= argv.length) {
        throw new Error(`Missing value for ${arg}`);
      }
      options[key] = argv[index];
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  return options;
}

function helpText() {
  return [
    "Usage:",
    "  npm run export:rubric-evidence -- --day 2026-06-22 --output docs/rubric-evidence-matrix.md",
    "",
    "Creates a public judging and submission evidence matrix. It never submits forms or posts to Reddit.",
  ].join("\n");
}

export function createRubricEvidenceFromOptions(options = {}) {
  return createRubricEvidenceMatrix({ day: options.day || todayUtcDay() });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }

  const matrix = createRubricEvidenceFromOptions(options);
  const text = formatRubricEvidenceMatrix(matrix);
  if (options.output) {
    await writeFile(resolve(options.output), text, "utf8");
  } else {
    process.stdout.write(text);
  }
}

if (process.argv[1]?.endsWith("export-rubric-evidence.mjs")) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
