import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SIZE,
  BLACK,
  WHITE,
  createGame,
  place,
  isLegal,
} from '../js/game.js';
import { chooseMove } from '../js/bot.js';

function idx(x, y) {
  return y * SIZE + x;
}

function stateWithStones(stones, turn = BLACK) {
  const state = createGame();
  for (const [index, color] of stones) state.board[index] = color;
  state.turn = turn;
  return state;
}

function koFixture() {
  return stateWithStones([
    [idx(1, 2), WHITE],
    [idx(0, 1), WHITE],
    [idx(2, 1), WHITE],
    [idx(1, 0), WHITE],
    [idx(0, 2), BLACK],
    [idx(2, 2), BLACK],
    [idx(1, 3), BLACK],
  ]);
}

function assertLegalChoice(state) {
  const move = chooseMove(state);
  if (move === null) return;
  assert.ok(Number.isInteger(move));
  assert.equal(state.board[move], null);
  assert.ok(isLegal(state, move));
}

test('bot is deterministic and chooses a legal opening move', () => {
  const state = createGame();
  state.turn = WHITE;

  const first = chooseMove(state);
  assert.ok(Number.isInteger(first));
  assert.equal(chooseMove(state), first);
  assertLegalChoice(state);
});

test('bot captures an isolated stone when it can', () => {
  const state = koFixture();
  assert.equal(chooseMove(state), idx(1, 1));
});

test('bot chooses legal moves across representative positions', () => {
  const positions = [createGame(), stateWithStones([[40, BLACK]], WHITE), koFixture()];

  const afterKoCapture = place(koFixture(), idx(1, 1)).state;
  positions.push(afterKoCapture);

  const afterPass = createGame();
  afterPass.passes = 1;

  for (const state of positions) assertLegalChoice(state);
});

test('bot passes when the board has no empty points', () => {
  const state = createGame();
  state.board = new Array(SIZE * SIZE).fill(BLACK);
  state.turn = WHITE;
  assert.equal(chooseMove(state), null);
});

test('bot passes when the previous move was a pass', () => {
  const state = createGame();
  state.passes = 1;
  assert.equal(chooseMove(state), null);
});

test('bot does not move when the game is over', () => {
  const scored = createGame();
  scored.status = 'scored';

  const resigned = createGame();
  resigned.status = 'resigned';

  assert.equal(chooseMove(scored), null);
  assert.equal(chooseMove(resigned), null);
});
