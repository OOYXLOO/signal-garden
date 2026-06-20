import assert from "node:assert/strict";
import { buildGameEntryUrl, createExpandedModeMessage, requestExpandedGame } from "../src/devvit/client/splash.js";

const entryUrl = buildGameEntryUrl(
  {
    entrypoints: {
      game: "https://example.test/game.html?view=inline",
    },
    token: "token-123",
  },
  "https://example.test/splash.html",
);
assert.equal(entryUrl, "https://example.test/game.html?view=inline&token=token-123");

assert.deepEqual(createExpandedModeMessage("https://example.test/game.html?token=token-123"), {
  immersiveMode: {
    entryUrl: "https://example.test/game.html?token=token-123",
    immersiveMode: 2,
  },
  scope: 0,
  type: "devvit-internal",
});

let postedMessage;
const expanded = requestExpandedGame(
  { type: "click", isTrusted: true },
  {
    devvit: {
      entrypoints: {
        game: "/game.html",
      },
      token: "abc",
    },
    location: {
      href: "https://example.test/splash.html",
    },
    parent: {
      postMessage(message, targetOrigin) {
        postedMessage = { message, targetOrigin };
      },
    },
  },
);
assert.equal(expanded, true);
assert.equal(postedMessage.targetOrigin, "*");
assert.equal(postedMessage.message.type, "devvit-internal");
assert.equal(postedMessage.message.scope, 0);
assert.equal(postedMessage.message.immersiveMode.immersiveMode, 2);
assert.equal(postedMessage.message.immersiveMode.entryUrl, "https://example.test/game.html?token=abc");

assert.equal(
  requestExpandedGame(
    { type: "click", isTrusted: false },
    {
      devvit: { entrypoints: { game: "/game.html" }, token: "abc" },
      location: { href: "https://example.test/splash.html" },
      parent: { postMessage() {} },
    },
  ),
  false,
);

console.log("signal garden devvit splash tests passed");
