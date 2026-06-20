const DEVVIT_INTERNAL_MESSAGE = "devvit-internal";
const DEVVIT_CLIENT_SCOPE = 0;
const DEVVIT_IMMERSIVE_MODE = 2;
const TOKEN_PARAM = "token";
const GAME_ENTRY = "game";
const LOCAL_GAME_URL = "game.html";

export function buildGameEntryUrl(devvitState, baseHref = globalThis.location?.href || "http://local.test/") {
  const entry = devvitState?.entrypoints?.[GAME_ENTRY];
  if (!entry) {
    return "";
  }

  const url = new URL(entry, baseHref);
  if (devvitState.token) {
    url.searchParams.set(TOKEN_PARAM, devvitState.token);
  }
  return url.toString();
}

export function createExpandedModeMessage(entryUrl) {
  return {
    immersiveMode: {
      entryUrl,
      immersiveMode: DEVVIT_IMMERSIVE_MODE,
    },
    scope: DEVVIT_CLIENT_SCOPE,
    type: DEVVIT_INTERNAL_MESSAGE,
  };
}

export function requestExpandedGame(event, win = globalThis.window) {
  const entryUrl = buildGameEntryUrl(win?.devvit, win?.location?.href);
  if (!entryUrl || !win?.parent?.postMessage) {
    return false;
  }

  if (event?.type && event.type !== "click") {
    return false;
  }
  if (event?.isTrusted === false) {
    return false;
  }

  win.parent.postMessage(createExpandedModeMessage(entryUrl), "*");
  return true;
}

export function openLocalGame(win = globalThis.window) {
  win.location.href = LOCAL_GAME_URL;
}

function bindSplash() {
  const button = document.querySelector("#open-game");
  button?.addEventListener("click", (event) => {
    if (!requestExpandedGame(event, window)) {
      openLocalGame(window);
    }
  });
}

if (typeof document !== "undefined") {
  bindSplash();
}
