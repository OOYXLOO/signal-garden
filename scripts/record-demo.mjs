import { copyFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const captioned = args.has("--captioned") || process.env.DEMO_CAPTIONED === "1";
const baseUrl = process.env.DEMO_BASE_URL || "http://127.0.0.1:8796/";
const chromePath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const output = resolve(root, process.env.DEMO_OUTPUT || (captioned ? "docs/demo-captioned.webm" : "docs/demo.webm"));
const tempDir = process.env.DEMO_TEMP_DIR || join(tmpdir(), "signal-garden-demo-video");

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    throw new Error(
      "Playwright is required to record the demo. Install or expose it in the current Node environment, then rerun npm run record:demo.",
    );
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
  await showCaption(
    page,
    "Signal Garden is a daily Phaser relay puzzle: place mirrors, route the signal, and return for a new board.",
    3200,
  );

  await page.evaluate(() => window.signalGarden.scene.applyPlan(window.signalGarden.scene.puzzle.solution));
  await showCaption(page, "A complete route must reach all three beacons before the receiver.", 2800);
  await page.locator("#save-proposal").click();
  await page.waitForFunction(() => !document.querySelector("#apply-plan").disabled);
  await showCaption(page, "Saving a route creates a proposal. The adapter recomputes score instead of trusting the client.", 3200);
  await page.locator("#clear-plan").click();
  await showCaption(page, "Clear the board: the community plan is now stored separately from the local draft.", 2400);
  await page.locator("#apply-plan").click();
  await showCaption(page, "Apply top proposal restores the best saved plan, not a hidden answer.", 3000);
  await showCaption(page, "The archive and streak panel make the daily board feel persistent.", 3000);
  await showCaption(page, "The Devvit shell keeps the client/server adapter ready for a Reddit surface.", 3200);

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
