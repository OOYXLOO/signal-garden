import { describe, expect, it } from 'vitest';
import { createBoard, formatResultText } from './sim';

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
