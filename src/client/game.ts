import * as Phaser from 'phaser';
import { AUTO, Game } from 'phaser';
import { BoardState, connections, createBoard, hintFor, rotateTile } from '../shared/sim';

const tileSize = 86;
const boardPadding = 28;

class GardenScene extends Phaser.Scene {
  private board: BoardState = createBoard();
  private tiles: Phaser.GameObjects.Container[][] = [];
  private movesEl: HTMLElement | null = null;
  private scoreEl: HTMLElement | null = null;
  private messageEl: HTMLElement | null = null;

  constructor() {
    super('garden');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#193323');
    this.movesEl = document.querySelector('#moves');
    this.scoreEl = document.querySelector('#score');
    this.messageEl = document.querySelector('#message');
    document.querySelector('#new-board')?.addEventListener('click', () => this.newBoard());
    document.querySelector('#hint')?.addEventListener('click', () => this.setMessage(hintFor(this.board)));
    this.drawBoard();
    this.syncHud();
  }

  private newBoard(): void {
    this.board = createBoard(this.board.seed + 1);
    this.drawBoard();
    this.syncHud();
    this.setMessage('A fresh board sprouted. Find the cleanest route.');
  }

  private drawBoard(): void {
    for (const row of this.tiles) {
      for (const container of row) {
        container.destroy(true);
      }
    }
    this.tiles = [];
    this.children.removeAll();

    const width = this.board.size * tileSize + boardPadding * 2;
    const height = this.board.size * tileSize + boardPadding * 2;
    const originX = Math.max(20, (this.scale.width - width) / 2) + boardPadding;
    const originY = Math.max(18, (this.scale.height - height) / 2) + boardPadding;

    this.add
      .rectangle(originX + tileSize * 2, originY + tileSize * 2, width, height, 0x203f2b, 1)
      .setStrokeStyle(2, 0x4d7c58);

    for (let y = 0; y < this.board.size; y += 1) {
      this.tiles[y] = [];
      for (let x = 0; x < this.board.size; x += 1) {
        const container = this.add.container(originX + x * tileSize, originY + y * tileSize);
        container.setSize(tileSize - 8, tileSize - 8);
        container.setInteractive(
          new Phaser.Geom.Rectangle(-tileSize / 2 + 4, -tileSize / 2 + 4, tileSize - 8, tileSize - 8),
          Phaser.Geom.Rectangle.Contains
        );
        container.on('pointerdown', () => this.rotate(x, y));
        this.tiles[y][x] = container;
      }
    }

    this.renderTiles();
  }

  private rotate(x: number, y: number): void {
    rotateTile(this.board, x, y);
    this.renderTiles();
    this.syncHud();
    this.setMessage(this.board.solved ? 'Bloom connected. The thread has a route worth sharing.' : 'Signal updated.');
  }

  private renderTiles(): void {
    for (let y = 0; y < this.board.size; y += 1) {
      for (let x = 0; x < this.board.size; x += 1) {
        const tile = this.board.tiles[y][x];
        const container = this.tiles[y][x];
        container.removeAll(true);

        const isStart = x === 0 && y === 2;
        const isGoal = x === this.board.size - 1 && y === 2;
        const fill = tile.powered ? 0x4c9b5f : 0x284935;
        const stroke = isGoal ? 0xf4cd6b : isStart ? 0x8ed7ff : 0x60936e;
        const glow = tile.powered ? 0xb9f59d : 0x86b98f;

        container.add(this.add.rectangle(0, 0, tileSize - 10, tileSize - 10, fill, 1).setStrokeStyle(2, stroke));
        for (const direction of connections(tile)) {
          this.drawConnection(container, direction, glow);
        }
        container.add(this.add.circle(0, 0, 8, glow, 1));

        if (isStart) {
          container.add(this.add.text(-30, -38, 'ROOT', { color: '#d5f5ff', fontFamily: 'monospace', fontSize: '11px' }));
        }
        if (isGoal) {
          container.add(this.add.text(-34, 24, 'BLOOM', { color: '#ffe9a8', fontFamily: 'monospace', fontSize: '11px' }));
        }
      }
    }
  }

  private drawConnection(container: Phaser.GameObjects.Container, direction: string, color: number): void {
    const line = this.add.rectangle(0, 0, 12, tileSize / 2 - 8, color, 1);
    if (direction === 'north') {
      line.setPosition(0, -tileSize / 4);
    } else if (direction === 'south') {
      line.setPosition(0, tileSize / 4);
    } else if (direction === 'east') {
      line.setSize(tileSize / 2 - 8, 12).setPosition(tileSize / 4, 0);
    } else {
      line.setSize(tileSize / 2 - 8, 12).setPosition(-tileSize / 4, 0);
    }
    container.add(line);
  }

  private syncHud(): void {
    if (this.movesEl) {
      this.movesEl.textContent = `Moves ${this.board.moves}`;
    }
    if (this.scoreEl) {
      this.scoreEl.textContent = `Score ${this.board.score}`;
    }
  }

  private setMessage(message: string): void {
    if (this.messageEl) {
      this.messageEl.textContent = message;
    }
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: 'game-container',
  backgroundColor: '#193323',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 620,
    height: 620
  },
  scene: [GardenScene]
};

document.addEventListener('DOMContentLoaded', () => {
  new Game(config);
});
