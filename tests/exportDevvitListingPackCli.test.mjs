import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createDevvitListingPack, formatDevvitListingPack } from "../scripts/export-devvit-listing-pack.mjs";

const run = promisify(execFile);
const script = new URL("../scripts/export-devvit-listing-pack.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const pack = await createDevvitListingPack({ date: "2026-06-26" });

assert.equal(pack.schemaVersion, "signal-garden-devvit-listing-pack/v1");
assert.equal(pack.date, "2026-06-26");
assert.equal(pack.appSlug, "signalgardenyxl");
assert.equal(pack.listingFields.displayName, "Signal Garden");
assert.ok(pack.listingFields.tagline.length <= 120);
assert.match(pack.listingFields.shortDescription, /daily community relay puzzle/i);
assert.match(pack.listingFields.longDescription, /Devvit/i);
assert.ok(pack.publicEvidence.some((item) => item.label === "Playable public app"));
assert.ok(pack.publicEvidence.some((item) => item.url === "https://github.com/OOYXLOO/signal-garden"));
assert.ok(pack.postHumanityChecklist.commands.includes("npx devvit upload --verbose"));
assert.ok(pack.postHumanityChecklist.recordPublicUrls.some((item) => item.placeholder === "<public-app-listing-url>"));
assert.ok(pack.boundaries.some((item) => item.includes("passwords")));

const markdown = formatDevvitListingPack(pack);
assert.match(markdown, /# Devvit Listing Pack/);
assert.match(markdown, /signalgardenyxl/);
assert.match(markdown, /Display name/);
assert.match(markdown, /Public Evidence/);
assert.match(markdown, /Post-Humanity Checklist/);
assert.match(markdown, /npx devvit upload --verbose/);
assert.match(markdown, /No passwords/);

const { stdout } = await run(process.execPath, [script, "--json", "--date", "2026-06-26"]);
const cliPack = JSON.parse(stdout);
assert.equal(cliPack.schemaVersion, "signal-garden-devvit-listing-pack/v1");
assert.equal(cliPack.appSlug, "signalgardenyxl");
assert.equal(cliPack.listingFields.displayName, "Signal Garden");

const help = await run(process.execPath, [script, "--help"]);
assert.match(help.stdout, /export:devvit-listing-pack/);

console.log("signal garden export devvit listing pack cli tests passed");
