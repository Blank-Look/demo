import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreBoard, DEFAULT_SIZE, DEFAULT_KOMI } from '../js/scoring.js';

function emptyBoard(size) {
  return new Array(size * size).fill(null);
}

test('defaults are a 9x9 board with 6.5 komi', () => {
  assert.equal(DEFAULT_SIZE, 9);
  assert.equal(DEFAULT_KOMI, 6.5);
});

test('an empty 9x9 board scores only komi', () => {
  const result = scoreBoard(emptyBoard(9));
  assert.equal(result.blackArea, 0);
  assert.equal(result.whiteArea, 6.5);
  assert.equal(result.komi, 6.5);
  assert.equal(result.blackTerritory, 0);
  assert.equal(result.whiteTerritory, 0);
  assert.equal(result.winner, 'W');
  assert.equal(result.reason, 'score');
});

test('area scoring counts stones plus surrounded empty points', () => {
  const board = new Array(9).fill('B');
  board[4] = null;

  const result = scoreBoard(board, 3, 0);
  assert.equal(result.blackStones, 8);
  assert.equal(result.whiteStones, 0);
  assert.equal(result.blackTerritory, 1);
  assert.equal(result.whiteTerritory, 0);
  assert.equal(result.blackArea, 9);
  assert.equal(result.whiteArea, 0);
  assert.equal(result.winner, 'B');
});

test('empty regions touching both colours are neutral', () => {
  const board = new Array(9).fill(null);
  board[0] = 'B';
  board[1] = 'B';
  board[2] = 'B';
  board[6] = 'W';
  board[7] = 'W';
  board[8] = 'W';

  const result = scoreBoard(board, 3, 0);
  assert.equal(result.blackTerritory, 0);
  assert.equal(result.whiteTerritory, 0);
  assert.equal(result.blackArea, 3);
  assert.equal(result.whiteArea, 3);
});

test('komi is added to white area and decides close games', () => {
  const board = emptyBoard(9);
  board[0] = 'B';
  board[2] = 'B';
  board[80] = 'W';
  board[78] = 'W';

  const result = scoreBoard(board, 9, 6.5);
  assert.equal(result.blackStones, 2);
  assert.equal(result.whiteStones, 2);
  assert.equal(result.whiteArea, result.whiteStones + result.whiteTerritory + 6.5);
  assert.equal(result.winner, 'W');
});

test('white wins ties when komi is zero', () => {
  const board = emptyBoard(3);
  board[0] = 'B';
  board[8] = 'W';

  const result = scoreBoard(board, 3, 0);
  assert.equal(result.blackArea, 1);
  assert.equal(result.whiteArea, 1);
  assert.equal(result.winner, 'W');
});

test('multiple enclosed regions are counted per colour', () => {
  const board = new Array(25).fill(null);

  for (const point of [1, 5, 7, 11]) board[point] = 'B';
  for (const point of [13, 17, 19, 23]) board[point] = 'W';

  const result = scoreBoard(board, 5, 0);
  assert.equal(result.blackStones, 4);
  assert.equal(result.whiteStones, 4);
  assert.equal(result.blackTerritory, 2);
  assert.equal(result.whiteTerritory, 2);
  assert.equal(result.blackArea, 6);
  assert.equal(result.whiteArea, 6);
});
