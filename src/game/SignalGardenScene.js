import Phaser from "phaser";
import { createBriefing, mapToPlan, planToMap, traceSignal } from "./puzzle.js";

const COLORS = {
  ink: 0x202124,
  paper: 0xf6f1e8,
  panel: 0xfffaf1,
  grid: 0xddd2c2,
  teal: 0x1f7a73,
  coral: 0xc6553f,
  violet: 0x6355a3,
  amber: 0xb98513,
  blocked: 0x263230,
  ghost: 0x8f9c98,
};

function cellKey(x, y) {
  return `${x},${y}`;
}

export class SignalGardenScene extends Phaser.Scene {
  constructor(options) {
    super("SignalGardenScene");
    this.puzzle = options.puzzle;
    this.placements = planToMap(options.initialPlan || []);
    this.layers = {};
  }

  create() {
    this.cameras.main.setBackgroundColor("#f6f1e8");
    this.input.on("pointerdown", (pointer) => this.handlePointer(pointer));
    this.scale.on("resize", () => this.redraw());
    this.redraw();
  }

  applyPlan(plan = []) {
    this.placements = planToMap(plan);
    this.redraw();
  }

  clearPlan() {
    this.placements = new Map();
    this.redraw();
  }

  handlePointer(pointer) {
    const cell = this.pointerToCell(pointer);
    if (!cell || this.isLockedCell(cell.x, cell.y)) {
      return;
    }

    const key = cellKey(cell.x, cell.y);
    const current = this.placements.get(key);
    if (!current) {
      this.placements.set(key, "slash");
    } else if (current === "slash") {
      this.placements.set(key, "backslash");
    } else {
      this.placements.delete(key);
    }

    this.redraw();
  }

  pointerToCell(pointer) {
    const layout = this.getLayout();
    const x = Math.floor((pointer.x - layout.originX) / layout.cell);
    const y = Math.floor((pointer.y - layout.originY) / layout.cell);
    if (x < 0 || y < 0 || x >= this.puzzle.size || y >= this.puzzle.size) {
      return null;
    }
    return { x, y };
  }

  isLockedCell(x, y) {
    if (x === this.puzzle.source.x && y === this.puzzle.source.y) {
      return true;
    }
    if (x === this.puzzle.target.x && y === this.puzzle.target.y) {
      return true;
    }
    return this.puzzle.blockers.some((cell) => cell.x === x && cell.y === y);
  }

  getLayout() {
    const width = this.scale.width;
    const height = this.scale.height;
    const cell = Math.floor(Math.min(width * 0.82, height * 0.82) / this.puzzle.size);
    const board = cell * this.puzzle.size;
    return {
      cell,
      board,
      originX: Math.floor((width - board) / 2),
      originY: Math.max(18, Math.floor((height - board) * 0.32) + 12),
    };
  }

  redraw() {
    for (const layer of Object.values(this.layers)) {
      layer.destroy();
    }
    this.layers = {
      board: this.add.graphics(),
      path: this.add.graphics(),
      labels: this.add.container(0, 0),
    };

    const result = traceSignal(this.puzzle, mapToPlan(this.placements));
    this.drawBoard(result);
    this.emitState(result);
  }

  drawBoard(result) {
    const layout = this.getLayout();
    const { board, cell, originX, originY } = layout;
    const graphics = this.layers.board;

    graphics.fillStyle(COLORS.panel, 1);
    graphics.lineStyle(2, COLORS.grid, 1);
    graphics.fillRoundedRect(originX - 12, originY - 12, board + 24, board + 24, 16);
    graphics.strokeRoundedRect(originX - 12, originY - 12, board + 24, board + 24, 16);

    for (let y = 0; y < this.puzzle.size; y += 1) {
      for (let x = 0; x < this.puzzle.size; x += 1) {
        const px = originX + x * cell;
        const py = originY + y * cell;
        graphics.lineStyle(1, COLORS.grid, 0.85);
        graphics.fillStyle((x + y) % 2 === 0 ? 0xfffdf8 : 0xf8efe2, 1);
        graphics.fillRoundedRect(px + 3, py + 3, cell - 6, cell - 6, 8);
        graphics.strokeRoundedRect(px + 3, py + 3, cell - 6, cell - 6, 8);
      }
    }

    this.drawGhostPlan(layout);
    this.drawSpecialCells(layout, result);
    this.drawPath(layout, result);
    this.drawMirrors(layout);
  }

  drawSpecialCells(layout, result) {
    const graphics = this.layers.board;
    const hit = new Set(result.hitBeacons);

    for (const blocker of this.puzzle.blockers) {
      const center = this.cellCenter(layout, blocker.x, blocker.y);
      graphics.fillStyle(COLORS.blocked, 1);
      graphics.fillRoundedRect(center.x - layout.cell * 0.26, center.y - layout.cell * 0.26, layout.cell * 0.52, layout.cell * 0.52, 6);
    }

    for (const beacon of this.puzzle.beacons) {
      const center = this.cellCenter(layout, beacon.x, beacon.y);
      graphics.fillStyle(hit.has(cellKey(beacon.x, beacon.y)) ? COLORS.amber : 0xf1d9a0, 1);
      graphics.lineStyle(3, COLORS.amber, 0.88);
      graphics.fillCircle(center.x, center.y, layout.cell * 0.18);
      graphics.strokeCircle(center.x, center.y, layout.cell * 0.18);
    }

    const source = this.cellCenter(layout, this.puzzle.source.x, this.puzzle.source.y);
    graphics.fillStyle(COLORS.teal, 1);
    graphics.fillTriangle(
      source.x - layout.cell * 0.2,
      source.y - layout.cell * 0.24,
      source.x - layout.cell * 0.2,
      source.y + layout.cell * 0.24,
      source.x + layout.cell * 0.26,
      source.y,
    );

    const target = this.cellCenter(layout, this.puzzle.target.x, this.puzzle.target.y);
    graphics.lineStyle(4, COLORS.coral, 1);
    graphics.fillStyle(0xfde5dc, 1);
    graphics.fillCircle(target.x, target.y, layout.cell * 0.26);
    graphics.strokeCircle(target.x, target.y, layout.cell * 0.26);
  }

  drawPath(layout, result) {
    if (result.visited.length < 2) {
      return;
    }
    const graphics = this.layers.path;
    graphics.lineStyle(7, COLORS.teal, 0.92);

    const first = this.cellCenter(layout, result.visited[0].x, result.visited[0].y);
    graphics.beginPath();
    graphics.moveTo(first.x, first.y);
    for (const step of result.visited.slice(1)) {
      const point = this.cellCenter(layout, step.x, step.y);
      graphics.lineTo(point.x, point.y);
    }
    graphics.strokePath();

    graphics.lineStyle(2, 0xffffff, 0.75);
    graphics.beginPath();
    graphics.moveTo(first.x, first.y);
    for (const step of result.visited.slice(1)) {
      const point = this.cellCenter(layout, step.x, step.y);
      graphics.lineTo(point.x, point.y);
    }
    graphics.strokePath();
  }

  drawMirrors(layout) {
    const graphics = this.layers.board;
    for (const [key, mirror] of this.placements.entries()) {
      const [x, y] = key.split(",").map(Number);
      this.drawMirror(graphics, layout, x, y, mirror, COLORS.violet, 1);
    }
  }

  drawGhostPlan(layout) {
    const graphics = this.layers.board;
    for (const move of this.puzzle.solution) {
      const key = cellKey(move.x, move.y);
      if (!this.placements.has(key)) {
        this.drawMirror(graphics, layout, move.x, move.y, move.mirror, COLORS.ghost, 0.32);
      }
    }
  }

  drawMirror(graphics, layout, x, y, mirror, color, alpha) {
    const center = this.cellCenter(layout, x, y);
    const pad = layout.cell * 0.24;
    graphics.lineStyle(Math.max(5, layout.cell * 0.1), color, alpha);
    if (mirror === "slash") {
      graphics.lineBetween(center.x + pad, center.y - pad, center.x - pad, center.y + pad);
    } else {
      graphics.lineBetween(center.x - pad, center.y - pad, center.x + pad, center.y + pad);
    }
  }

  cellCenter(layout, x, y) {
    return {
      x: layout.originX + x * layout.cell + layout.cell / 2,
      y: layout.originY + y * layout.cell + layout.cell / 2,
    };
  }

  emitState(result) {
    const detail = {
      puzzle: this.puzzle,
      result,
      plan: mapToPlan(this.placements),
      briefing: createBriefing(this.puzzle, result),
    };
    window.dispatchEvent(new CustomEvent("signal-garden:update", { detail }));
  }
}
