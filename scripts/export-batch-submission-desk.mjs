import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  createBatchSubmissionDesk,
  formatBatchSubmissionDesk,
} from "../src/batchSubmissionDesk.js";

function parseArgs(argv) {
  const options = {
    appListingUrl: "",
    day: "",
    demoPostUrl: "",
    feedbackFormUrl: "https://forms.gle/YByxxCneDsn174qb9",
    help: false,
    output: "",
    publicAppUrl: "https://signal-garden.vercel.app/",
    sourceRepoUrl: "https://github.com/OOYXLOO/signal-garden",
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
    "  npm run export:batch-submission-desk -- --day 2026-06-24 --output docs/batch-submission-desk.md",
    "",
    "Creates a one-page account-owner submission desk for Signal Garden.",
  ].join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }
  const markdown = formatBatchSubmissionDesk(createBatchSubmissionDesk(options));
  if (options.output) {
    await writeFile(resolve(options.output), markdown, "utf8");
  } else {
    process.stdout.write(markdown);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
