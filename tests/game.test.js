import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SIZE,
  KOMI,
  BLACK,
  WHITE,
  other,
  pointOf,
  indexOf,
  neighbors,
  createGame,
  boardHash,
  getGroup,
  cloneState,
  isLegal,
  legalMoves,
  place,
  pass,
  resign,
  undo,
} from '../js/game.js';

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

test('board metadata and coordinates are correct', () => {
  assert.equal(SIZE, 9);
  assert.equal(KOMI, 6.5);
  assert.equal(other(BLACK), WHITE);
  assert.equal(other(WHITE), BLACK);
  assert.deepEqual(pointOf(0), { x: 0, y: 0 });
  assert.deepEqual(pointOf(80), { x: 8, y: 8 });
  assert.deepEqual(pointOf(idx(4, 4)), { x: 4, y: 4 });
  assert.equal(indexOf(4, 4), 40);
  assert.deepEqual(neighbors(0).sort((a, b) => a - b), [1, 9]);
  assert.deepEqual(neighbors(40).sort((a, b) => a - b), [31, 39, 41, 49]);
});

test('createGame starts with an empty playing position', () => {
  const state = createGame();
  assert.equal(state.board.length, 81);
  assert.ok(state.board.every((cell) => cell === null));
  assert.equal(state.turn, BLACK);
  assert.deepEqual(state.captures, { B: 0, W: 0 });
  assert.equal(state.koPoint, null);
  assert.deepEqual(state.history, []);
  assert.equal(state.passes, 0);
  assert.equal(state.status, 'playing');
  assert.equal(state.result, null);
  assert.equal(boardHash(state.board), '.'.repeat(81));
});

test('occupied points are rejected without changing state', () => {
  const state = stateWithStones([[40, BLACK]]);
  const before = structuredClone(state);
  const result = place(state, 40);
  assert.match(result.error, /occupied/);
  assert.deepEqual(state, before);
});

test('invalid indices are rejected without changing state', () => {
  const state = createGame();
  assert.match(place(state, -1).error, /not a point/);
  assert.match(place(state, 81).error, /not a point/);
  assert.match(place(state, 1.5).error, /not a point/);
});

test('a single opposing stone is captured and counted', () => {
  const state = stateWithStones([
    [idx(1, 1), WHITE],
    [idx(0, 1), BLACK],
    [idx(1, 0), BLACK],
    [idx(2, 1), BLACK],
  ]);

  const result = place(state, idx(1, 2));
  assert.equal(result.error, undefined);

  const next = result.state;
  assert.equal(next.board[idx(1, 1)], null);
  assert.equal(next.board[idx(1, 2)], BLACK);
  assert.deepEqual(next.captures, { B: 1, W: 0 });
  assert.equal(next.turn, WHITE);
  assert.equal(next.history.length, 1);
  assert.deepEqual(next.history[0].captured, [idx(1, 1)]);
  assert.equal(next.history[0].type, 'place');
  assert.equal(next.koPoint, null);
});

test('multiple groups are captured even when the move fills its own last liberty', () => {
  const state = stateWithStones([
    [idx(1, 0), WHITE],
    [idx(0, 1), WHITE],
    [idx(2, 0), BLACK],
    [idx(1, 1), BLACK],
    [idx(0, 2), BLACK],
    [idx(1, 2), BLACK],
  ]);

  const result = place(state, idx(0, 0));
  assert.equal(result.error, undefined);

  const next = result.state;
  assert.equal(next.board[idx(0, 0)], BLACK);
  assert.equal(next.board[idx(1, 0)], null);
  assert.equal(next.board[idx(0, 1)], null);
  assert.deepEqual(next.captures, { B: 2, W: 0 });
  assert.equal(next.turn, WHITE);
  assert.deepEqual(next.history[0].captured.sort((a, b) => a - b), [
    idx(1, 0),
    idx(0, 1),
  ].sort((a, b) => a - b));
});

test('suicide is rejected without changing state', () => {
  const state = stateWithStones([
    [idx(1, 0), WHITE],
    [idx(0, 1), WHITE],
    [idx(2, 1), WHITE],
    [idx(1, 2), WHITE],
  ]);
  const before = structuredClone(state);

  const result = place(state, idx(1, 1));
  assert.match(result.error, /Suicide/);
  assert.deepEqual(state, before);
});

test('ko prevents immediate recapture but allows it after intervening moves', () => {
  const state = koFixture();

  const captured = place(state, idx(1, 1)).state;
  assert.equal(captured.board[idx(1, 2)], null);
  assert.equal(captured.captures.B, 1);
  assert.equal(captured.koPoint, idx(1, 2));

  const immediate = place(captured, idx(1, 2));
  assert.match(immediate.error, /Ko/);

  const whiteElsewhere = place(captured, idx(8, 8)).state;
  assert.equal(whiteElsewhere.koPoint, null);

  const blackElsewhere = place(whiteElsewhere, idx(0, 8)).state;

  const recapture = place(blackElsewhere, idx(1, 2));
  assert.equal(recapture.error, undefined);
  assert.equal(recapture.state.board[idx(1, 1)], null);
  assert.equal(recapture.state.board[idx(1, 2)], WHITE);
  assert.equal(recapture.state.captures.W, 1);
});

test('legalMoves contains only empty, legal points', () => {
  const state = koFixture();
  const captured = place(state, idx(1, 1)).state;
  const moves = legalMoves(captured);

  assert.ok(!moves.includes(idx(1, 2)));
  assert.ok(!moves.includes(idx(1, 1)));
  assert.ok(moves.includes(idx(8, 8)));
  assert.ok(moves.every((index) => captured.board[index] === null));
  assert.ok(moves.every((index) => isLegal(captured, index)));
});

test('passing twice ends the game with an area score', () => {
  const first = pass(createGame()).state;
  assert.equal(first.status, 'playing');
  assert.equal(first.passes, 1);
  assert.equal(first.turn, WHITE);

  const second = pass(first).state;
  assert.equal(second.status, 'scored');
  assert.equal(second.passes, 2);
  assert.equal(second.turn, BLACK);
  assert.equal(second.result.winner, WHITE);
  assert.equal(second.result.reason, 'score');
  assert.equal(second.result.blackArea, 0);
  assert.equal(second.result.whiteArea, KOMI);

  assert.match(place(second, 40).error, /game is over/);
});

test('a placement resets the consecutive pass count', () => {
  const afterPass = pass(createGame()).state;
  const afterPlace = place(afterPass, 40).state;
  assert.equal(afterPlace.passes, 0);
  assert.equal(afterPlace.history[1].type, 'place');
});

test('resign ends the game and awards the opponent', () => {
  const result = resign(createGame());
  assert.equal(result.error, undefined);
  assert.equal(result.state.status, 'resigned');
  assert.equal(result.state.result.winner, WHITE);
  assert.equal(result.state.result.reason, 'resign');
  assert.equal(result.state.history.at(-1).type, 'resign');
  assert.match(place(result.state, 40).error, /game is over/);
});

test('undo restores the board, captures, turn, and ko point', () => {
  const start = koFixture();
  const captured = place(start, idx(1, 1)).state;
  const whiteElsewhere = place(captured, idx(8, 8)).state;

  const undone = undo(whiteElsewhere).state;
  assert.equal(undone.board[idx(8, 8)], null);
  assert.equal(undone.board[idx(1, 1)], BLACK);
  assert.equal(undone.board[idx(1, 2)], null);
  assert.deepEqual(undone.captures, { B: 1, W: 0 });
  assert.equal(undone.turn, WHITE);
  assert.equal(undone.koPoint, idx(1, 2));
  assert.equal(undone.history.length, 1);
  assert.equal(undone.passes, 0);
  assert.equal(undone.status, 'playing');

  const rewound = undo(captured).state;
  assert.equal(rewound.board[idx(1, 1)], null);
  assert.equal(rewound.board[idx(1, 2)], WHITE);
  assert.deepEqual(rewound.captures, { B: 0, W: 0 });
  assert.equal(rewound.turn, BLACK);
  assert.equal(rewound.koPoint, null);
  assert.equal(rewound.history.length, 0);
});

test('undo after two passes restores a playable game', () => {
  const scored = pass(pass(createGame()).state).state;
  const afterOneUndo = undo(scored).state;

  assert.equal(afterOneUndo.status, 'playing');
  assert.equal(afterOneUndo.result, null);
  assert.equal(afterOneUndo.passes, 1);
  assert.equal(afterOneUndo.turn, WHITE);

  const afterSecondUndo = undo(afterOneUndo).state;
  assert.equal(afterSecondUndo.passes, 0);
  assert.equal(afterSecondUndo.turn, BLACK);
  assert.equal(afterSecondUndo.history.length, 0);
});

test('undo with no history is rejected', () => {
  assert.match(undo(createGame()).error, /no move/);
});

test('cloneState produces an independent copy', () => {
  const state = stateWithStones([[40, BLACK]]);
  const copy = cloneState(state);
  copy.board[40] = WHITE;
  copy.captures.B = 5;
  copy.history.push({ type: 'pass' });

  assert.equal(state.board[40], BLACK);
  assert.equal(state.captures.B, 0);
  assert.equal(state.history.length, 0);
});

test('getGroup reports stones and liberties for connected groups', () => {
  const state = stateWithStones([
    [idx(0, 0), BLACK],
    [idx(1, 0), BLACK],
    [idx(0, 1), WHITE],
  ]);

  const group = getGroup(state.board, idx(0, 0));
  assert.deepEqual(group.stones.sort((a, b) => a - b), [idx(0, 0), idx(1, 0)].sort((a, b) => a - b));
  assert.ok(group.liberties.includes(idx(2, 0)));
  assert.ok(group.liberties.includes(idx(1, 1)));

  const empty = getGroup(state.board, idx(4, 4));
  assert.deepEqual(empty, { stones: [], liberties: [] });
});
