import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createPublicProofChecklist, formatPublicProofChecklist, todayUtcDay } from "../src/publicProofChecklist.js";

function parseArgs(argv) {
  const options = {
    appListingUrl: "",
    day: todayUtcDay(),
    demoPostUrl: "",
    feedbackConfirmationUrl: "",
    help: false,
    judgeDeskUrl: "",
    output: "",
    publicAppUrl: "",
    sourceRepoUrl: "",
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
    "  npm run export:public-proof-checklist -- --day 2026-06-24 --output docs/public-proof-checklist.md",
    "  npm run export:public-proof-checklist -- --day 2026-06-24 --app-listing-url https://... --demo-post-url https://...",
    "",
    "Creates a public proof checklist for final review and platform submission handoff.",
  ].join("\n");
}

export function createPublicProofChecklistFromOptions(options = {}) {
  return createPublicProofChecklist(options);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }

  const checklist = createPublicProofChecklistFromOptions(options);
  const text = formatPublicProofChecklist(checklist);
  if (options.output) {
    await writeFile(resolve(options.output), text, "utf8");
  } else {
    process.stdout.write(text);
  }
}

if (process.argv[1]?.endsWith("export-public-proof-checklist.mjs")) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
