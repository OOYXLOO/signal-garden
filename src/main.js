import Phaser from "phaser";
import "./styles.css";
import { SignalGardenScene } from "./game/SignalGardenScene.js";
import { createDailyPuzzle, createPuzzleForDayKey, decodePlanToken } from "./game/puzzle.js";
import { loadPlan } from "./state/store.js";
import { bindUi } from "./ui.js";

export function startSignalGarden({ communityClient } = {}) {
  const params = new URLSearchParams(window.location.search);
  const sharedDay = params.get("day");
  const puzzle = createPuzzleForDayKey(sharedDay) || createDailyPuzzle();
  const sharedPlan = sharedDay === puzzle.id ? decodePlanToken(params.get("plan"), puzzle) : [];
  const scene = new SignalGardenScene({
    puzzle,
    initialPlan: sharedPlan.length ? sharedPlan : loadPlan(puzzle.id),
  });

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-root",
    width: 960,
    height: 720,
    backgroundColor: "#f6f1e8",
    scale: {
      mode: Phaser.Scale.RESIZE,
      parent: "game-root",
      width: "100%",
      height: "100%",
    },
    scene: [scene],
  });

  bindUi(scene, { communityClient });

  window.signalGarden = {
    game,
    scene,
    communityMode: communityClient ? "server" : "local",
  };

  return window.signalGarden;
}

if (!window.SIGNAL_GARDEN_MANUAL_START) {
  startSignalGarden();
}
