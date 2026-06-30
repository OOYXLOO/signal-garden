export type Direction = 'north' | 'east' | 'south' | 'west';

export type TileKind = 'line' | 'corner' | 'tee';

export interface Tile {
  readonly kind: TileKind;
  rotation: number;
  powered: boolean;
}

export interface BoardState {
  readonly size: number;
  readonly seed: number;
  moves: number;
  score: number;
  solved: boolean;
  tiles: Tile[][];
}

const directionIndex: Record<Direction, number> = {
  north: 0,
  east: 1,
  south: 2,
  west: 3
};

const vectors: Record<Direction, { dx: number; dy: number }> = {
  north: { dx: 0, dy: -1 },
  east: { dx: 1, dy: 0 },
  south: { dx: 0, dy: 1 },
  west: { dx: -1, dy: 0 }
};

const opposite: Record<Direction, Direction> = {
  north: 'south',
  east: 'west',
  south: 'north',
  west: 'east'
};

const baseConnections: Record<TileKind, Direction[]> = {
  line: ['west', 'east'],
  corner: ['north', 'east'],
  tee: ['north', 'east', 'west']
};

export function createBoard(seed = daySeed()): BoardState {
  const random = seededRandom(seed);
  const size = 5;
  const solvedKinds: TileKind[][] = [
    ['line', 'line', 'corner', 'tee', 'corner'],
    ['corner', 'tee', 'line', 'corner', 'line'],
    ['line', 'line', 'tee', 'line', 'line'],
    ['corner', 'line', 'corner', 'tee', 'corner'],
    ['line', 'corner', 'line', 'line', 'line']
  ];

  const tiles = solvedKinds.map((row) =>
    row.map((kind) => ({
      kind,
      rotation: Math.floor(random() * 4),
      powered: false
    }))
  );

  const board: BoardState = {
    size,
    seed,
    moves: 0,
    score: 0,
    solved: false,
    tiles
  };

  evaluateBoard(board);
  return board;
}

export function rotateTile(board: BoardState, x: number, y: number): BoardState {
  if (board.solved || !board.tiles[y]?.[x]) {
    return board;
  }

  board.tiles[y][x].rotation = (board.tiles[y][x].rotation + 1) % 4;
  board.moves += 1;
  evaluateBoard(board);
  return board;
}

export function connections(tile: Tile): Direction[] {
  return baseConnections[tile.kind].map((direction) => rotateDirection(direction, tile.rotation));
}

export function evaluateBoard(board: BoardState): BoardState {
  for (const row of board.tiles) {
    for (const tile of row) {
      tile.powered = false;
    }
  }

  const start = { x: 0, y: 2 };
  const goal = { x: board.size - 1, y: 2 };
  const queue = [start];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const key = `${current.x},${current.y}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    const tile = board.tiles[current.y]?.[current.x];
    if (!tile) {
      continue;
    }
    tile.powered = true;

    for (const direction of connections(tile)) {
      const vector = vectors[direction];
      const next = { x: current.x + vector.dx, y: current.y + vector.dy };
      const nextTile = board.tiles[next.y]?.[next.x];
      if (!nextTile) {
        continue;
      }

      if (connections(nextTile).includes(opposite[direction])) {
        queue.push(next);
      }
    }
  }

  board.solved = board.tiles[goal.y][goal.x].powered;
  board.score = Math.max(0, 1000 - board.moves * 25 + visited.size * 20 + (board.solved ? 500 : 0));
  return board;
}

export function hintFor(board: BoardState): string {
  if (board.solved) {
    return 'Solved. Share the route and try to beat the move count tomorrow.';
  }

  const poweredCount = board.tiles.flat().filter((tile) => tile.powered).length;
  if (poweredCount < 3) {
    return 'Start near the left root. Powered tiles glow brighter when the signal can enter them.';
  }

  return 'Look for a powered tile whose open side faces an unpowered neighbor. Rotate that neighbor first.';
}

function rotateDirection(direction: Direction, rotation: number): Direction {
  const directions: Direction[] = ['north', 'east', 'south', 'west'];
  return directions[(directionIndex[direction] + rotation) % 4];
}

function daySeed(): number {
  const now = new Date();
  return Number(`${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`);
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}
