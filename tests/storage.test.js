import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, place, BLACK } from '../js/game.js';
import {
  KEY,
  VERSION,
  validateState,
  serialize,
  deserialize,
  save,
  load,
} from '../js/storage.js';

function savedPosition() {
  return place(createGame(), 40).state;
}

function withLocalStorage(run) {
  const store = new Map();
  const original = globalThis.localStorage;
  globalThis.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };

  try {
    return run(store);
  } finally {
    if (original === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = original;
  }
}

test('storage key and version match the documented schema', () => {
  assert.equal(KEY, 'demo:save:v1');
  assert.equal(VERSION, 1);
});

test('a fresh and a played game are valid states', () => {
  assert.equal(validateState(createGame()), true);

  const played = savedPosition();
  assert.equal(played.board[40], BLACK);
  assert.equal(validateState(played), true);
});

test('malformed states are rejected', () => {
  const cases = [
    (state) => null,
    (state) => ({ ...state, size: 8 }),
    (state) => ({ ...state, board: state.board.slice(0, 80) }),
    (state) => {
      const board = state.board.slice();
      board[0] = 'X';
      return { ...state, board };
    },
    (state) => ({ ...state, turn: 'X' }),
    (state) => ({ ...state, captures: null }),
    (state) => ({ ...state, captures: { B: -1, W: 0 } }),
    (state) => ({ ...state, captures: { B: 0.5, W: 0 } }),
    (state) => ({ ...state, history: 'none' }),
    (state) => ({
      ...state,
      history: [{ index: 81, color: 'B', type: 'place', captured: [], boardBeforeHash: '' }],
    }),
    (state) => ({
      ...state,
      history: [{ index: null, color: 'B', type: 'dance', captured: [], boardBeforeHash: '' }],
    }),
    (state) => ({ ...state, passes: -1 }),
    (state) => ({ ...state, status: 'paused' }),
    (state) => ({ ...state, koPoint: 81 }),
    (state) => ({ ...state, result: { winner: 'X', reason: 'score' } }),
    (state) => ({ ...state, result: { winner: 'B', reason: 'timeout' } }),
  ];

  const base = createGame();
  for (const mutate of cases) assert.equal(validateState(mutate(base)), false);
});

test('serialisation round-trips a game', () => {
  const state = savedPosition();
  const raw = serialize(state);
  const parsed = JSON.parse(raw);

  assert.equal(parsed.version, VERSION);
  assert.equal(typeof parsed.savedAt, 'string');
  assert.ok(!Number.isNaN(Date.parse(parsed.savedAt)));
  assert.deepEqual(deserialize(raw), state);
});

test('deserialisation rejects wrong versions, bad json, and invalid states', () => {
  const state = createGame();

  assert.equal(deserialize('not json'), null);
  assert.equal(deserialize(JSON.stringify({ version: 2, state })), null);
  assert.equal(deserialize(JSON.stringify({ version: VERSION })), null);
  assert.equal(
    deserialize(JSON.stringify({ version: VERSION, state: { ...state, size: 8 } })),
    null,
  );
});

test('save and load work with localStorage and discard corrupt records', () => {
  withLocalStorage((store) => {
    const state = savedPosition();

    assert.equal(save(state), true);
    assert.ok(store.has(KEY));
    assert.deepEqual(load(), state);

    store.set(KEY, '{broken');
    assert.equal(load(), null);
    assert.equal(store.has(KEY), false);
  });
});

test('save and load fail safely when storage throws', () => {
  withLocalStorage(() => {
    globalThis.localStorage.setItem = () => {
      throw new Error('quota');
    };
    globalThis.localStorage.getItem = () => {
      throw new Error('blocked');
    };

    assert.equal(save(createGame()), false);
    assert.equal(load(), null);
  });
});
