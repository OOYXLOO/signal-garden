import { copyFile, mkdir, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { traceSignal } from "../src/game/puzzle.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const args = new Set(process.argv.slice(2));
const final = args.has("--final") || process.env.DEMO_FINAL === "1";
const captioned = final || args.has("--captioned") || process.env.DEMO_CAPTIONED === "1";
const baseUrl = process.env.DEMO_BASE_URL || "http://127.0.0.1:8796/";
const chromePath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const defaultOutput = final ? "docs/demo-final-captioned.webm" : captioned ? "docs/demo-captioned.webm" : "docs/demo.webm";
const output = resolve(root, process.env.DEMO_OUTPUT || defaultOutput);
const tempDir = process.env.DEMO_TEMP_DIR || join(tmpdir(), "signal-garden-demo-video");

const shortDurations = {
  intro: 3200,
  feedback: 2800,
  route: 2800,
  proposal: 3200,
  share: 2600,
  clear: 2400,
  apply: 3000,
  archive: 3000,
  adapter: 3200,
};

const finalDurations = {
  intro: 8200,
  board: 7200,
  feedback: 6800,
  route: 7600,
  proposal: 8200,
  share: 6200,
  clear: 6200,
  apply: 7600,
  archive: 8200,
  adapter: 7600,
  close: 6800,
};

async function loadPlaywright() {
  if (process.env.PLAYWRIGHT_MODULE_PATH) {
    return await import(pathToFileURL(resolve(process.env.PLAYWRIGHT_MODULE_PATH, "index.mjs")).href);
  }

  try {
    return await import("playwright");
  } catch {
    try {
      return require("playwright");
    } catch {
      throw new Error(
        "Playwright is required to record the demo. Install it in the project or expose it through the current Node runtime, then rerun npm run record:demo.",
      );
    }
  }
}

async function main() {
  const { chromium } = await loadPlaywright();
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
  });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    recordVideo: {
      dir: tempDir,
      size: { width: 1366, height: 900 },
    },
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => window.localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await installCaptionLayer(page);
  const durations = final ? finalDurations : shortDurations;
  await showCaption(
    page,
    "Signal Garden is a daily Phaser relay puzzle: place mirrors, route the signal, and return for a new board.",
    durations.intro,
  );
  if (final) {
    await showCaption(page, "The first screen shows the daily seed, board title, three beacons, and the five-move limit.", durations.board);
  }

  const puzzle = await page.evaluate(() => window.signalGarden.scene.puzzle);
  const feedbackPlan = findRouteExample(puzzle, ["partial", "blocked", "lost"]);
  if (feedbackPlan) {
    await page.evaluate((plan) => window.signalGarden.scene.applyPlan(plan), feedbackPlan);
    await showCaption(page, "If a route fails, the status hint and board marker show where the player should revise it.", durations.feedback);
  }

  await page.evaluate(() => window.signalGarden.scene.applyPlan(window.signalGarden.scene.puzzle.solution));
  await showCaption(page, "A complete route must reach all three beacons before the receiver.", durations.route);
  await page.locator("#save-proposal").click();
  await page.waitForFunction(() => !document.querySelector("#apply-plan").disabled);
  await showCaption(page, "Saving a route creates a proposal. The adapter recomputes score instead of trusting the client.", durations.proposal);
  await page.locator("#copy-link").click();
  await showCaption(page, "A share link carries the exact route so a post or review thread can reopen the same plan.", durations.share);
  await page.locator("#clear-plan").click();
  await showCaption(page, "Clear the board: the community plan is now stored separately from the local draft.", durations.clear);
  await page.locator("#apply-plan").click();
  await showCaption(page, "Apply top proposal restores the best saved plan, not a hidden answer.", durations.apply);
  await showCaption(page, "The archive and streak panel make the daily board feel persistent.", durations.archive);
  await showCaption(page, "The Devvit shell keeps the client/server adapter ready for a Reddit surface.", durations.adapter);
  if (final) {
    await showCaption(page, "Submission assets include screenshots, a silent clip, this captioned walkthrough, and a server-shaped adapter boundary.", durations.close);
  }

  const state = await page.evaluate(() => ({
    title: document.querySelector("#puzzle-title")?.textContent,
    status: document.querySelector("#status-value")?.textContent,
    summary: document.querySelector("#proposal-summary")?.textContent,
    archive: [...document.querySelectorAll("#archive-list li")].map((item) => item.getAttribute("aria-label") || item.textContent),
  }));

  const video = page.video();
  await context.close();
  await browser.close();

  if (consoleErrors.length) {
    throw new Error(`Console errors during demo recording: ${consoleErrors.join(" | ")}`);
  }
  if (state.status !== "Complete" || !state.summary?.includes("1/1 saved proposals complete")) {
    throw new Error(`Unexpected demo state: ${JSON.stringify(state)}`);
  }

  const videoPath = await video.path();
  await mkdir(dirname(output), { recursive: true });
  await copyFile(videoPath, output);
  console.log(`Recorded demo to ${output}`);
  console.log(JSON.stringify(state, null, 2));
}

function findRouteExample(puzzle, preferredStatuses) {
  const unlockedCells = [];
  for (let y = 0; y < puzzle.size; y += 1) {
    for (let x = 0; x < puzzle.size; x += 1) {
      const locked =
        (x === puzzle.source.x && y === puzzle.source.y) ||
        (x === puzzle.target.x && y === puzzle.target.y) ||
        puzzle.blockers.some((cell) => cell.x === x && cell.y === y);
      if (!locked) {
        unlockedCells.push({ x, y });
      }
    }
  }

  const mirrors = ["slash", "backslash"];
  const found = new Map();
  const plan = [];

  function search(startIndex, maxMoves) {
    const result = traceSignal(puzzle, plan);
    if (plan.length && preferredStatuses.includes(result.status) && !found.has(result.status)) {
      found.set(result.status, plan.map((move) => ({ ...move })));
    }
    if (plan.length >= maxMoves || found.size === preferredStatuses.length) {
      return;
    }
    for (let index = startIndex; index < unlockedCells.length; index += 1) {
      for (const mirror of mirrors) {
        plan.push({ ...unlockedCells[index], mirror });
        search(index + 1, maxMoves);
        plan.pop();
      }
    }
  }

  search(0, 3);
  for (const status of preferredStatuses) {
    if (found.has(status)) {
      return found.get(status);
    }
  }
  return null;
}

async function installCaptionLayer(page) {
  if (!captioned) {
    return;
  }
  await page.addStyleTag({
    content: `
      #demo-caption {
        position: fixed;
        left: 50%;
        bottom: 26px;
        z-index: 10000;
        width: min(920px, calc(100vw - 48px));
        transform: translateX(-50%);
        border: 1px solid rgba(255, 250, 241, 0.42);
        border-radius: 8px;
        padding: 14px 18px;
        color: #fffaf1;
        background: rgba(24, 34, 32, 0.94);
        box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28);
        font: 800 24px/1.32 Inter, ui-sans-serif, system-ui, sans-serif;
        letter-spacing: 0;
        text-align: center;
        opacity: 0;
        transition: opacity 160ms ease;
        pointer-events: none;
      }
      #demo-caption[data-visible="true"] {
        opacity: 1;
      }
    `,
  });
  await page.evaluate(() => {
    const caption = document.createElement("div");
    caption.id = "demo-caption";
    caption.setAttribute("aria-live", "polite");
    document.body.append(caption);
  });
}

async function showCaption(page, text, duration) {
  if (!captioned) {
    await page.waitForTimeout(Math.min(duration, 1400));
    return;
  }
  await page.evaluate((captionText) => {
    const caption = document.querySelector("#demo-caption");
    caption.textContent = captionText;
    caption.dataset.visible = "true";
  }, text);
  await page.waitForTimeout(duration);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
