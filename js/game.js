import { scoreBoard } from './scoring.js';

export const SIZE = 9;
export const KOMI = 6.5;
export const BLACK = 'B';
export const WHITE = 'W';

export function other(color) {
  return color === BLACK ? WHITE : BLACK;
}

export function pointOf(index) {
  return { x: index % SIZE, y: Math.floor(index / SIZE) };
}

export function indexOf(x, y) {
  return y * SIZE + x;
}

export function neighbors(index) {
  const { x, y } = pointOf(index);
  const out = [];
  if (x > 0) out.push(index - 1);
  if (x < SIZE - 1) out.push(index + 1);
  if (y > 0) out.push(index - SIZE);
  if (y < SIZE - 1) out.push(index + SIZE);
  return out;
}

export function createGame() {
  return {
    size: SIZE,
    board: new Array(SIZE * SIZE).fill(null),
    turn: BLACK,
    captures: { B: 0, W: 0 },
    koPoint: null,
    history: [],
    passes: 0,
    status: 'playing',
    result: null,
  };
}

export function boardHash(board) {
  let hash = '';
  for (let i = 0; i < board.length; i += 1) {
    hash += board[i] === null ? '.' : board[i];
  }
  return hash;
}

export function getGroup(board, start) {
  const color = board[start];
  if (!color) return { stones: [], liberties: [] };

  const stones = new Set([start]);
  const liberties = new Set();
  const stack = [start];

  while (stack.length) {
    const point = stack.pop();
    for (const next of neighbors(point)) {
      const value = board[next];
      if (value === null) {
        liberties.add(next);
      } else if (value === color && !stones.has(next)) {
        stones.add(next);
        stack.push(next);
      }
    }
  }

  return { stones: [...stones], liberties: [...liberties] };
}

export function cloneState(state) {
  return {
    ...state,
    board: state.board.slice(),
    captures: { ...state.captures },
    history: state.history.slice(),
  };
}

export function isLegal(state, index) {
  return !place(cloneState(state), index).error;
}

export function legalMoves(state) {
  const moves = [];
  const total = SIZE * SIZE;
  for (let i = 0; i < total; i += 1) {
    if (state.board[i] === null && isLegal(state, i)) moves.push(i);
  }
  return moves;
}

export function place(state, index) {
  if (state.status !== 'playing') {
    return { error: 'The game is over. Start a new game to play again.' };
  }
  if (!Number.isInteger(index) || index < 0 || index >= SIZE * SIZE) {
    return { error: 'That is not a point on the board.' };
  }
  if (state.board[index] !== null) {
    return { error: 'That point is already occupied.' };
  }
  if (state.koPoint === index) {
    return { error: 'Ko: you cannot immediately recapture at the same point.' };
  }

  const color = state.turn;
  const opponent = other(color);
  const board = state.board.slice();
  board[index] = color;

  const captured = [];
  const seen = new Set();

  for (const next of neighbors(index)) {
    if (board[next] !== opponent || seen.has(next)) continue;
    const group = getGroup(board, next);
    for (const stone of group.stones) seen.add(stone);
    if (group.liberties.length === 0) {
      for (const stone of group.stones) {
        board[stone] = null;
        captured.push(stone);
      }
    }
  }

  const own = getGroup(board, index);
  if (own.liberties.length === 0) {
    return { error: 'Suicide: that move would leave your group with no liberties.' };
  }

  const hash = boardHash(board);
  const lastMove = state.history[state.history.length - 1];
  if (lastMove && hash === lastMove.boardBeforeHash) {
    return { error: 'Ko: that move would repeat the previous position.' };
  }

  let koPoint = null;
  if (captured.length === 1 && own.stones.length === 1 && own.liberties.length === 1) {
    koPoint = captured[0];
  }

  const nextState = {
    ...state,
    board,
    turn: opponent,
    captures: {
      ...state.captures,
      [color]: state.captures[color] + captured.length,
    },
    koPoint,
    history: [
      ...state.history,
      {
        index,
        color,
        type: 'place',
        captured,
        boardBeforeHash: boardHash(state.board),
      },
    ],
    passes: 0,
  };

  return { state: nextState };
}

function countTrailingPasses(history) {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i].type !== 'pass') break;
    count += 1;
  }
  return count;
}

function restoredKoPoint(board, history) {
  const last = history[history.length - 1];
  if (!last || last.type !== 'place' || last.captured.length !== 1) return null;
  const group = getGroup(board, last.index);
  if (group.stones.length === 1 && group.liberties.length === 1) return last.captured[0];
  return null;
}

export function pass(state) {
  if (state.status !== 'playing') {
    return { error: 'The game is over. Start a new game to play again.' };
  }

  const nextState = {
    ...state,
    turn: other(state.turn),
    koPoint: null,
    history: [
      ...state.history,
      {
        index: null,
        color: state.turn,
        type: 'pass',
        captured: [],
        boardBeforeHash: boardHash(state.board),
      },
    ],
    passes: state.passes + 1,
  };

  if (nextState.passes >= 2) {
    nextState.status = 'scored';
    nextState.result = scoreBoard(nextState.board, SIZE, KOMI);
  }

  return { state: nextState };
}

export function resign(state) {
  if (state.status !== 'playing') {
    return { error: 'The game is over. Start a new game to play again.' };
  }

  const scored = scoreBoard(state.board, SIZE, KOMI);

  return {
    state: {
      ...state,
      koPoint: null,
      history: [
        ...state.history,
        {
          index: null,
          color: state.turn,
          type: 'resign',
          captured: [],
          boardBeforeHash: boardHash(state.board),
        },
      ],
      status: 'resigned',
      result: {
        winner: other(state.turn),
        reason: 'resign',
        blackArea: scored.blackArea,
        whiteArea: scored.whiteArea,
        komi: KOMI,
      },
    },
  };
}

export function undo(state) {
  if (state.history.length === 0) {
    return { error: 'There is no move to undo.' };
  }

  const last = state.history[state.history.length - 1];
  const board = state.board.slice();
  const captures = { ...state.captures };

  if (last.type === 'place') {
    board[last.index] = null;
    const capturedColor = other(last.color);
    for (const point of last.captured) board[point] = capturedColor;
    captures[last.color] = Math.max(0, captures[last.color] - last.captured.length);
  }

  const history = state.history.slice(0, -1);

  return {
    state: {
      ...state,
      board,
      captures,
      history,
      passes: countTrailingPasses(history),
      koPoint: restoredKoPoint(board, history),
      status: 'playing',
      result: null,
      turn: last.color,
    },
  };
}
