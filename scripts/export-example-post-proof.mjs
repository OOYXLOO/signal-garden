import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createExamplePostProofPack, formatExamplePostProofPack, todayUtcDay } from "../src/examplePostProof.js";

function parseArgs(argv) {
  const options = {
    appListingUrl: "",
    day: todayUtcDay(),
    demoPostUrl: "",
    help: false,
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
      if (!(key in options)) throw new Error(`Unknown option: ${arg}`);
      index += 1;
      if (index >= argv.length) throw new Error(`Missing value for ${arg}`);
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
    "  npm run export:example-post-proof -- --day 2026-06-28 --output docs/example-post-proof-pack.md",
    "  npm run export:example-post-proof -- --day 2026-06-28 --app-listing-url https://... --demo-post-url https://...",
    "",
    "Creates a reviewer proof pack for the Reddit-style example post and comment-route loop.",
  ].join("\n");
}

export function createExamplePostProofPackFromOptions(options = {}) {
  return createExamplePostProofPack(options);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }
  const pack = createExamplePostProofPackFromOptions(options);
  const text = formatExamplePostProofPack(pack);
  if (options.output) {
    await writeFile(resolve(options.output), text, "utf8");
  } else {
    process.stdout.write(text);
  }
}

if (process.argv[1]?.endsWith("export-example-post-proof.mjs")) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
