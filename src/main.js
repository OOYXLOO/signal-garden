import Phaser from "phaser";
import "./styles.css";
import { SignalGardenScene } from "./game/SignalGardenScene.js";
import { createDailyPuzzle } from "./game/puzzle.js";
import { loadPlan } from "./state/store.js";
import { bindUi } from "./ui.js";

const puzzle = createDailyPuzzle();
const scene = new SignalGardenScene({
  puzzle,
  initialPlan: loadPlan(puzzle.id),
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

