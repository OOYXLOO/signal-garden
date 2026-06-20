import Phaser from "phaser";
import "./styles.css";
import { SignalGardenScene } from "./game/SignalGardenScene.js";
import { createDailyPuzzle, decodePlanToken } from "./game/puzzle.js";
import { loadPlan } from "./state/store.js";
import { bindUi } from "./ui.js";

const puzzle = createDailyPuzzle();
const params = new URLSearchParams(window.location.search);
const sharedDay = params.get("day");
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

bindUi(scene);

window.signalGarden = {
  game,
  scene,
};
