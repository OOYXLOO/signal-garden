const DEFAULT_FEEDBACK_FORM_URL = "https://forms.gle/YByxxCneDsn174qb9";
const DEFAULT_SOURCE_REPO_URL = "https://github.com/OOYXLOO/signal-garden";
const DEFAULT_PUBLIC_APP_URL = "https://ooyxloo.github.io/signal-garden/";

function assertDay(day) {
  const value = String(day || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("day must be YYYY-MM-DD");
  }
  return value;
}

function trimUrl(value, fallback = "") {
  const url = String(value || fallback || "").trim();
  if (!url) return "";
  return url;
}

function ensureTrailingSlash(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

function sampleRouteUrl(publicAppUrl, day) {
  const url = new URL(ensureTrailingSlash(publicAppUrl));
  url.searchParams.set("day", day);
  url.searchParams.set("sample", "1");
  return url.toString();
}

function judgeDeskUrl(publicAppUrl) {
  return new URL("judge.html", ensureTrailingSlash(publicAppUrl)).toString();
}

function rawDocUrl(path) {
  return `https://raw.githubusercontent.com/OOYXLOO/signal-garden/master/${path}`;
}

function psArg(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function createBatchSubmissionDesk({
  day,
  publicAppUrl = DEFAULT_PUBLIC_APP_URL,
  sourceRepoUrl = DEFAULT_SOURCE_REPO_URL,
  feedbackFormUrl = DEFAULT_FEEDBACK_FORM_URL,
  appListingUrl = "",
  demoPostUrl = "",
} = {}) {
  const resolvedDay = assertDay(day);
  const resolvedPublicAppUrl = ensureTrailingSlash(trimUrl(publicAppUrl, DEFAULT_PUBLIC_APP_URL));
  const resolvedSourceRepoUrl = trimUrl(sourceRepoUrl, DEFAULT_SOURCE_REPO_URL);
  const resolvedFeedbackFormUrl = trimUrl(feedbackFormUrl, DEFAULT_FEEDBACK_FORM_URL);
  const resolvedAppListingUrl = trimUrl(appListingUrl);
  const resolvedDemoPostUrl = trimUrl(demoPostUrl);
  const sampleUrl = sampleRouteUrl(resolvedPublicAppUrl, resolvedDay);
  const judgeUrl = judgeDeskUrl(resolvedPublicAppUrl);
  const appListingPlaceholder = resolvedAppListingUrl || "<public-app-listing-url>";
  const demoPostPlaceholder = resolvedDemoPostUrl || "<public-demo-post-url>";
  const finalPackCommand = [
    "npm run export:submission-pack --",
    "--public-app-url",
    psArg(resolvedPublicAppUrl),
    "--source-repo-url",
    psArg(resolvedSourceRepoUrl),
    "--day",
    psArg(resolvedDay),
    "--sample-route",
    "--app-listing-url",
    psArg(appListingPlaceholder),
    "--demo-post-url",
    psArg(demoPostPlaceholder),
    "--feedback-url",
    psArg(resolvedFeedbackFormUrl),
  ].join(" ");
  const preGatePackCommand = [
    "npm run export:submission-pack --",
    "--public-app-url",
    psArg(resolvedPublicAppUrl),
    "--source-repo-url",
    psArg(resolvedSourceRepoUrl),
    "--day",
    psArg(resolvedDay),
    "--sample-route",
    "--allow-pending-platform-gates",
    "--feedback-url",
    psArg(resolvedFeedbackFormUrl),
  ].join(" ");

  return {
    title: "Signal Garden Batch Submission Desk",
    day: resolvedDay,
    openOrder: [
      {
        label: "Public app",
        url: resolvedPublicAppUrl,
        purpose: "Confirm the board, reviewer panel, submission readiness, and evidence receipt render.",
      },
      {
        label: "Sample route",
        url: sampleUrl,
        purpose: "Use this for first-minute review when no final route token has been copied.",
      },
      {
        label: "Judge desk",
        url: judgeUrl,
        purpose: "Copy the evidence packet and inspect media, manifest, rubric, and source links.",
      },
      {
        label: "Source repository",
        url: resolvedSourceRepoUrl,
        purpose: "Give reviewers public source, docs, media, and verification scripts.",
      },
      {
        label: "Reddit demo post draft",
        url: rawDocUrl("docs/reddit-demo-post-draft.md"),
        purpose: "Copy only after the account owner creates the public demo post.",
      },
      {
        label: "Developer feedback form pack",
        url: rawDocUrl("docs/developer-feedback-form-pack.md"),
        purpose: "Use for the user-approved feedback form pass.",
      },
      {
        label: "Feedback form",
        url: resolvedFeedbackFormUrl,
        purpose: "Submit only through the account-owner flow.",
      },
    ],
    copyBlocks: [
      {
        label: "Pre-gate pack command",
        text: preGatePackCommand,
      },
      {
        label: "Final pack command",
        text: finalPackCommand,
      },
      {
        label: "App listing placeholder",
        text: appListingPlaceholder,
      },
      {
        label: "Demo post placeholder",
        text: demoPostPlaceholder,
      },
    ],
    externalGates: [
      "Devvit app listing/playtest: account owner creates or opens the app listing, then records the public URL.",
      "Reddit demo post: account owner posts the demo thread, then records the public post URL.",
      "Devpost or related contest submission: account owner submits the project fields, source URL, media, and public demo links.",
      "Feedback survey/form: account owner submits only after checking the eligibility gate checklist.",
    ],
    safetyBoundaries: [
      "Do not paste passwords, OTPs, cookies, private account pages, payment settings, KYC screens, or platform secrets into this project.",
      "Do not claim app listing or demo post evidence until the public URLs exist.",
      "Do not edit generated public proof to imply live community data when using sample-route preview evidence.",
    ],
  };
}

function formatList(items, formatter) {
  return items.map(formatter).join("\n");
}

function formatBatchSubmissionDesk(desk) {
  return [
    `# ${desk.title}`,
    "",
    `Day: \`${desk.day}\``,
    "",
    "## Open In Order",
    "",
    formatList(
      desk.openOrder,
      (item, index) => `${index + 1}. ${item.label}: ${item.url}\n   Purpose: ${item.purpose}`,
    ),
    "",
    "## Copy Blocks",
    "",
    formatList(
      desk.copyBlocks,
      (item) => `### ${item.label}\n\n\`\`\`text\n${item.text}\n\`\`\``,
    ),
    "",
    "## External Gates",
    "",
    formatList(desk.externalGates, (item) => `- ${item}`),
    "",
    "## Safety Boundaries",
    "",
    formatList(desk.safetyBoundaries, (item) => `- ${item}`),
    "",
  ].join("\n");
}

export {
  createBatchSubmissionDesk,
  formatBatchSubmissionDesk,
};
