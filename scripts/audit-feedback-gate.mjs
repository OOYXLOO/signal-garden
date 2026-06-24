import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createFeedbackFormPackFromOptions } from "./export-feedback-form-pack.mjs";
import { auditDeveloperFeedbackGate } from "../src/platformFeedback.js";

const scriptPath = fileURLToPath(import.meta.url);

function todayUtcDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function parseArgs(argv) {
  const options = {
    day: todayUtcDay(),
    help: false,
    json: false,
    now: new Date().toISOString(),
    plan: "",
    reviewUrl: "",
    sampleRoute: false,
    username: "OOYXLOO",
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--sample-route") {
      options.sampleRoute = true;
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
    "  npm run audit:feedback-gate -- --day <YYYY-MM-DD> --sample-route --username <name>",
    "",
    "Checks whether the copy-only Developer Feedback Survey handoff is ready.",
    "This command does not submit the form or access account pages.",
  ].join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }

  const pack = createFeedbackFormPackFromOptions(options);
  const audit = auditDeveloperFeedbackGate(pack);
  if (options.json) {
    console.log(JSON.stringify(audit, null, 2));
  } else {
    for (const check of audit.checks) {
      const prefix = check.status === "ready" ? "PASS" : "FAIL";
      console.log(`${prefix} ${check.id}: ${check.detail}`);
    }
    if (audit.ok) {
      console.log("PASS feedback gate handoff ready");
    }
  }
  if (!audit.ok) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
