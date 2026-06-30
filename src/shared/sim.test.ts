import { describe, expect, it } from 'vitest';
import { applyRotations, createBoard, formatResultText, rotateTile } from './sim';

describe('board simulation', () => {
  it('can apply a known route and solve the daily board shape', () => {
    const board = createBoard(20260701);

    applyRotations(board, [
      [0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]);

    expect(board.solved).toBe(true);
    expect(board.tiles[2][4].powered).toBe(true);
  });

  it('rotating a tile increments moves and changes score', () => {
    const board = createBoard(20260701);
    const initialScore = board.score;

    rotateTile(board, 0, 0);

    expect(board.moves).toBe(1);
    expect(board.score).not.toBe(initialScore);
  });
});

describe('formatResultText', () => {
  it('formats an unsolved board as a comment-ready progress line', () => {
    const board = createBoard(20260701);

    expect(formatResultText(board)).toBe(
      'Signal Garden 20260701: I am still routing the signal. Current score 1020 after 0 moves.'
    );
  });

  it('formats a solved board as a comment-ready result line', () => {
    const board = createBoard(20260701);
    board.solved = true;
    board.moves = 12;
    board.score = 1420;

    expect(formatResultText(board)).toBe('Signal Garden 20260701: connected the bloom in 12 moves for 1420 points.');
  });
});
