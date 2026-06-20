import { dayKey, hashSeed, mulberry32, pick } from "./seeded.js";

export const BOARD_SIZE = 8;
export const MOVE_LIMIT = 5;

export const DIRECTIONS = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
};

const TURN = {
  slash: { N: "E", E: "N", S: "W", W: "S" },
  backslash: { N: "W", W: "N", S: "E", E: "S" },
};

export const PUZZLE_TEMPLATES = [
  {
    title: "North arcade",
    source: { x: 0, y: 4, dir: "E" },
    target: { x: 7, y: 1 },
    beacons: [
      { x: 3, y: 4 },
      { x: 3, y: 1 },
      { x: 6, y: 1 },
    ],
    blockers: [
      { x: 1, y: 1 },
      { x: 2, y: 3 },
      { x: 4, y: 3 },
      { x: 6, y: 5 },
      { x: 5, y: 6 },
    ],
    solution: [
      { x: 3, y: 4, mirror: "slash" },
      { x: 3, y: 1, mirror: "slash" },
    ],
  },
  {
    title: "Harbor loop",
    source: { x: 0, y: 2, dir: "E" },
    target: { x: 7, y: 6 },
    beacons: [
      { x: 2, y: 2 },
      { x: 2, y: 6 },
      { x: 5, y: 6 },
    ],
    blockers: [
      { x: 4, y: 1 },
      { x: 5, y: 2 },
      { x: 1, y: 5 },
      { x: 4, y: 5 },
      { x: 6, y: 3 },
    ],
    solution: [
      { x: 2, y: 2, mirror: "backslash" },
      { x: 2, y: 6, mirror: "backslash" },
    ],
  },
  {
    title: "West stair",
    source: { x: 7, y: 5, dir: "W" },
    target: { x: 1, y: 1 },
    beacons: [
      { x: 5, y: 5 },
      { x: 5, y: 1 },
      { x: 2, y: 1 },
    ],
    blockers: [
      { x: 3, y: 2 },
      { x: 4, y: 3 },
      { x: 1, y: 4 },
      { x: 6, y: 2 },
      { x: 2, y: 6 },
    ],
    solution: [
      { x: 5, y: 5, mirror: "backslash" },
      { x: 5, y: 1, mirror: "backslash" },
    ],
  },
  {
    title: "East orchard",
    source: { x: 0, y: 6, dir: "E" },
    target: { x: 7, y: 2 },
    beacons: [
      { x: 2, y: 6 },
      { x: 4, y: 2 },
      { x: 6, y: 2 },
    ],
    blockers: [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 5 },
      { x: 6, y: 6 },
    ],
    solution: [
      { x: 4, y: 6, mirror: "slash" },
      { x: 4, y: 2, mirror: "slash" },
    ],
  },
  {
    title: "South lantern",
    source: { x: 6, y: 0, dir: "S" },
    target: { x: 1, y: 7 },
    beacons: [
      { x: 6, y: 3 },
      { x: 3, y: 3 },
      { x: 1, y: 6 },
    ],
    blockers: [
      { x: 2, y: 1 },
      { x: 4, y: 2 },
      { x: 5, y: 5 },
      { x: 7, y: 6 },
      { x: 3, y: 7 },
    ],
    solution: [
      { x: 6, y: 3, mirror: "slash" },
      { x: 1, y: 3, mirror: "slash" },
    ],
  },
  {
    title: "Central ferry",
    source: { x: 7, y: 0, dir: "S" },
    target: { x: 0, y: 1 },
    beacons: [
      { x: 7, y: 5 },
      { x: 4, y: 5 },
      { x: 2, y: 1 },
    ],
    blockers: [
      { x: 1, y: 3 },
      { x: 3, y: 3 },
      { x: 5, y: 2 },
      { x: 6, y: 6 },
      { x: 0, y: 7 },
    ],
    solution: [
      { x: 7, y: 5, mirror: "slash" },
      { x: 2, y: 5, mirror: "backslash" },
      { x: 2, y: 1, mirror: "backslash" },
    ],
  },
  {
    title: "Quiet relay",
    source: { x: 0, y: 1, dir: "E" },
    target: { x: 2, y: 7 },
    beacons: [
      { x: 3, y: 1 },
      { x: 5, y: 4 },
      { x: 2, y: 6 },
    ],
    blockers: [
      { x: 1, y: 4 },
      { x: 3, y: 3 },
      { x: 4, y: 7 },
      { x: 6, y: 2 },
      { x: 7, y: 5 },
    ],
    solution: [
      { x: 5, y: 1, mirror: "backslash" },
      { x: 5, y: 6, mirror: "slash" },
      { x: 2, y: 6, mirror: "slash" },
    ],
  },
];

function keyOf(cell) {
  return `${cell.x},${cell.y}`;
}

function normalizePlan(plan = []) {
  return plan
    .filter((move) => Number.isInteger(move.x) && Number.isInteger(move.y))
    .filter((move) => move.mirror === "slash" || move.mirror === "backslash")
    .slice(0, MOVE_LIMIT)
    .map((move) => ({ x: move.x, y: move.y, mirror: move.mirror }));
}

function isPlayableCell(puzzle, x, y) {
  if (x < 0 || y < 0 || x >= puzzle.size || y >= puzzle.size) {
    return false;
  }
  if (x === puzzle.source.x && y === puzzle.source.y) {
    return false;
  }
  if (x === puzzle.target.x && y === puzzle.target.y) {
    return false;
  }
  return !puzzle.blockers.some((cell) => cell.x === x && cell.y === y);
}

export function createDailyPuzzle(date = new Date()) {
  const key = dayKey(date);
  const random = mulberry32(hashSeed(`signal-garden:${key}`));
  const template = pick(random, PUZZLE_TEMPLATES);
  const accents = ["teal", "coral", "violet", "amber"];

  return {
    id: key,
    title: template.title,
    size: BOARD_SIZE,
    moveLimit: MOVE_LIMIT,
    source: template.source,
    target: template.target,
    beacons: template.beacons,
    blockers: template.blockers,
    solution: template.solution,
    accent: pick(random, accents),
    brief:
      "Guide the signal through all three beacons before it reaches the receiver. Each placed mirror becomes a public proposal for today's relay.",
  };
}

export function planToMap(plan = []) {
  const placements = new Map();
  for (const move of normalizePlan(plan)) {
    placements.set(keyOf(move), move.mirror);
  }
  return placements;
}

export function mapToPlan(placements) {
  return Array.from(placements.entries()).map(([key, mirror]) => {
    const [x, y] = key.split(",").map(Number);
    return { x, y, mirror };
  });
}

export function encodePlanToken(plan = []) {
  return normalizePlan(plan)
    .map((move) => `${move.x}-${move.y}-${move.mirror === "slash" ? "s" : "b"}`)
    .join(".");
}

export function decodePlanToken(token, puzzle) {
  if (!token || typeof token !== "string") {
    return [];
  }

  return token
    .split(".")
    .map((part) => {
      const [rawX, rawY, rawMirror] = part.split("-");
      const x = Number(rawX);
      const y = Number(rawY);
      const mirror = rawMirror === "s" ? "slash" : rawMirror === "b" ? "backslash" : "";
      return { x, y, mirror };
    })
    .filter((move) => Number.isInteger(move.x) && Number.isInteger(move.y))
    .filter((move) => move.mirror === "slash" || move.mirror === "backslash")
    .filter((move) => isPlayableCell(puzzle, move.x, move.y))
    .slice(0, puzzle.moveLimit || MOVE_LIMIT);
}

export function traceSignal(puzzle, plan = []) {
  const placements = planToMap(plan);
  const blockers = new Set(puzzle.blockers.map(keyOf));
  const beaconSet = new Set(puzzle.beacons.map(keyOf));
  const hitBeacons = new Set();
  const visited = [];
  let x = puzzle.source.x;
  let y = puzzle.source.y;
  let dir = puzzle.source.dir;
  let status = "drafting";

  for (let step = 0; step < puzzle.size * puzzle.size * 2; step += 1) {
    if (x < 0 || y < 0 || x >= puzzle.size || y >= puzzle.size) {
      status = "lost";
      break;
    }

    const key = `${x},${y}`;
    visited.push({ x, y, dir });

    if (blockers.has(key)) {
      status = "blocked";
      break;
    }

    if (beaconSet.has(key)) {
      hitBeacons.add(key);
    }

    if (x === puzzle.target.x && y === puzzle.target.y) {
      status = hitBeacons.size === puzzle.beacons.length ? "complete" : "partial";
      break;
    }

    const mirror = placements.get(key);
    if (mirror) {
      dir = TURN[mirror][dir];
    }

    x += DIRECTIONS[dir].dx;
    y += DIRECTIONS[dir].dy;
  }

  const moves = mapToPlan(placements);
  const completeBonus = status === "complete" ? 520 : 0;
  const targetBonus = status === "partial" ? 180 : 0;
  const beaconBonus = hitBeacons.size * 130;
  const efficiencyBonus = Math.max(0, 90 - moves.length * 18);
  const pathBonus = Math.min(120, visited.length * 4);
  const score = completeBonus + targetBonus + beaconBonus + efficiencyBonus + pathBonus;

  return {
    status: moves.length === 0 && status !== "complete" ? "drafting" : status,
    visited,
    hitBeacons: Array.from(hitBeacons),
    moves,
    score,
    complete: status === "complete",
  };
}

export function createBriefing(puzzle, result) {
  const status = result.complete ? "Complete" : "Open";
  const moves = result.moves.length
    ? result.moves.map((move) => `${move.mirror} at ${move.x + 1},${move.y + 1}`).join("; ")
    : "No mirrors placed";

  return [
    `Signal Garden ${puzzle.id}`,
    `Board: ${puzzle.title}`,
    `Status: ${status}`,
    `Score: ${result.score}`,
    `Beacons: ${result.hitBeacons.length}/${puzzle.beacons.length}`,
    `Plan: ${moves}`,
  ].join("\n");
}

export function describeResult(puzzle, result) {
  if (result.complete) {
    return "All beacons are connected before the receiver.";
  }

  if (result.status === "drafting") {
    return "Place mirrors to guide the signal through every beacon.";
  }

  if (result.status === "partial") {
    return `Receiver reached early: ${result.hitBeacons.length}/${puzzle.beacons.length} beacons connected.`;
  }

  const last = result.visited.at(-1);
  if (result.status === "blocked" && last) {
    return `Blocked at row ${last.y + 1}, column ${last.x + 1}. Try bending the route earlier.`;
  }

  if (result.status === "lost" && last) {
    return `Signal left the garden after row ${last.y + 1}, column ${last.x + 1}. Add a mirror before the edge.`;
  }

  return "Keep adjusting mirrors until the route reaches every beacon.";
}
