import { copyFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = process.env.DEMO_BASE_URL || "http://127.0.0.1:8796/";
const chromePath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const output = resolve(root, process.env.DEMO_OUTPUT || "docs/demo.webm");
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
  await page.waitForTimeout(900);

  await page.evaluate(() => window.signalGarden.scene.applyPlan(window.signalGarden.scene.puzzle.solution));
  await page.waitForTimeout(1400);
  await page.locator("#save-proposal").click();
  await page.waitForFunction(() => !document.querySelector("#apply-plan").disabled);
  await page.waitForTimeout(1000);
  await page.locator("#clear-plan").click();
  await page.waitForTimeout(800);
  await page.locator("#apply-plan").click();
  await page.waitForTimeout(1400);

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

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
