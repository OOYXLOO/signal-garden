import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), "..");

const publicAppUrl = "https://ooyxloo.github.io/signal-garden/";
const sourceRepoUrl = "https://github.com/OOYXLOO/signal-garden";
const feedbackPackUrl = "https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/docs/developer-feedback-form-pack.md";

function parseArgs(argv) {
  const options = {
    date: new Date().toISOString().slice(0, 10),
    output: "",
    json: false,
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--date") {
      index += 1;
      if (index >= argv.length) {
        throw new Error("Missing value for --date");
      }
      options.date = argv[index];
    } else if (arg === "--output") {
      index += 1;
      if (index >= argv.length) {
        throw new Error("Missing value for --output");
      }
      options.output = argv[index];
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  return options;
}

function helpText() {
  return [
    "Usage:",
    "  npm run export:devvit-listing-pack -- --output docs/devvit-listing-pack.md",
    "  node scripts/export-devvit-listing-pack.mjs --json --date 2026-06-26",
    "",
    "Creates a public, copy-ready field pack for the Devvit app listing and post-humanity handoff.",
  ].join("\n");
}

export async function createDevvitListingPack({ date } = {}) {
  return {
    schemaVersion: "signal-garden-devvit-listing-pack/v1",
    date: date || new Date().toISOString().slice(0, 10),
    appSlug: "sigardenyxl",
    template: "phaser",
    developerPortalStartUrl: "https://developers.reddit.com/new/app?template=phaser",
    humanityGateUrl:
      "https://developers.reddit.com/new/humanity-check?app_name=sigardenyxl&app_name_verified=true&template=phaser",
    listingFields: {
      displayName: "Signal Garden",
      tagline: "A daily community relay puzzle that turns each solved route into tomorrow's challenge.",
      shortDescription:
        "Signal Garden is a daily community relay puzzle: players solve a route, leave a rationale, and seed the next day's board.",
      longDescription:
        "Signal Garden is a Phaser puzzle prototype prepared for a Devvit shell. Each day presents a small signal-routing board with a reviewer-friendly sample route, rationale trail, community launch plan, and public evidence packet. The Devvit adapter adds an expanded-mode entry, a moderator menu for daily relay posts, same-origin community API calls, and a Redis migration boundary with memory fallback for local review.",
      audience:
        "Small Reddit communities that want a low-friction daily puzzle thread, lightweight collaborative reasoning, and a clear route recap.",
      reviewNote:
        "The public web build is available for source and gameplay review before the app-owner playtest. The Devvit shell is ready for account-owner upload after the humanity check.",
    },
    publicEvidence: [
      {
        label: "Playable public app",
        url: publicAppUrl,
      },
      {
        label: "Sample first-minute review route",
        url: `${publicAppUrl}?day=${date || new Date().toISOString().slice(0, 10)}&sample=1`,
      },
      {
        label: "Judge desk",
        url: `${publicAppUrl}judge.html`,
      },
      {
        label: "Source repository",
        url: sourceRepoUrl,
      },
      {
        label: "Developer feedback field pack",
        url: feedbackPackUrl,
      },
    ],
    postHumanityChecklist: {
      commands: [
        "npx devvit upload --verbose",
        "npx devvit list apps",
        "npm run audit:release -- --json",
        "npm run export:submission-pack -- --public-app-url 'https://ooyxloo.github.io/signal-garden/' --source-repo-url 'https://github.com/OOYXLOO/signal-garden' --day '<YYYY-MM-DD>' --sample-route --app-listing-url '<public-app-listing-url>' --demo-post-url '<public-demo-post-url>' --feedback-url 'https://forms.gle/YByxxCneDsn174qb9'",
      ],
      recordPublicUrls: [
        {
          label: "Devvit app listing URL",
          placeholder: "<public-app-listing-url>",
        },
        {
          label: "public Reddit demo post URL",
          placeholder: "<public-demo-post-url>",
        },
      ],
    },
    boundaries: [
      "No passwords, OTPs, cookies, private account pages, payment settings, KYC screens, or platform secrets belong in this repository.",
      "Use public listing and demo post URLs only after the app owner creates them.",
      "Do not claim live community evidence when the sample route is being used for first-minute review.",
    ],
  };
}

function bulletList(items, mapper) {
  return items.map((item) => `- ${mapper(item)}`).join("\n");
}

export function formatDevvitListingPack(pack) {
  const fieldRows = [
    ["Display name", pack.listingFields.displayName],
    ["App slug", pack.appSlug],
    ["Template", pack.template],
    ["Tagline", pack.listingFields.tagline],
    ["Short description", pack.listingFields.shortDescription],
    ["Audience", pack.listingFields.audience],
    ["Review note", pack.listingFields.reviewNote],
  ]
    .map(([label, value]) => `| ${label} | ${value} |`)
    .join("\n");
  return [
    "# Devvit Listing Pack",
    "",
    `Generated: ${pack.date}`,
    "",
    "This copy-ready pack keeps the account-owner listing flow short after the Reddit humanity check. It only contains public project material.",
    "",
    "## Listing Fields",
    "",
    "| Field | Copy |",
    "| --- | --- |",
    fieldRows,
    "",
    "## Long Description",
    "",
    pack.listingFields.longDescription,
    "",
    "## Public Evidence",
    "",
    bulletList(pack.publicEvidence, (item) => `${item.label}: ${item.url}`),
    "",
    "## Post-Humanity Checklist",
    "",
    `Start URL: ${pack.developerPortalStartUrl}`,
    `Humanity gate: ${pack.humanityGateUrl}`,
    "",
    "Run after the app owner completes the humanity check:",
    "",
    bulletList(pack.postHumanityChecklist.commands, (command) => `\`${command}\``),
    "",
    "Record public URLs:",
    "",
    bulletList(pack.postHumanityChecklist.recordPublicUrls, (item) => `${item.label}: \`${item.placeholder}\``),
    "",
    "## Boundaries",
    "",
    bulletList(pack.boundaries, (item) => item),
    "",
  ].join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }
  const pack = await createDevvitListingPack({ date: options.date });
  if (options.json) {
    const text = `${JSON.stringify(pack, null, 2)}\n`;
    if (options.output) {
      await writeFile(resolve(root, options.output), text, "utf8");
    } else {
      process.stdout.write(text);
    }
    return;
  }
  const text = formatDevvitListingPack(pack);
  if (options.output) {
    await writeFile(resolve(root, options.output), text, "utf8");
  } else {
    process.stdout.write(text);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
