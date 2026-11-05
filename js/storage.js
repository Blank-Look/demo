export const KEY = 'demo:save:v1';
export const VERSION = 1;

const COLORS = new Set(['B', 'W']);
const MOVE_TYPES = new Set(['place', 'pass', 'resign']);
const STATUSES = new Set(['playing', 'scored', 'resigned']);
const TOTAL = 81;

function isMove(move) {
  if (!move || typeof move !== 'object') return false;
  if (move.index !== null) {
    if (!Number.isInteger(move.index) || move.index < 0 || move.index >= TOTAL) {
      return false;
    }
  }
  if (!COLORS.has(move.color)) return false;
  if (!MOVE_TYPES.has(move.type)) return false;
  if (!Array.isArray(move.captured)) return false;
  if (!move.captured.every((point) => Number.isInteger(point) && point >= 0 && point < TOTAL)) {
    return false;
  }
  return typeof move.boardBeforeHash === 'string';
}

export function validateState(state) {
  if (!state || typeof state !== 'object') return false;
  if (state.size !== 9) return false;

  if (!Array.isArray(state.board) || state.board.length !== TOTAL) return false;
  if (!state.board.every((cell) => cell === null || COLORS.has(cell))) return false;

  if (!COLORS.has(state.turn)) return false;

  if (!state.captures || typeof state.captures !== 'object') return false;
  if (!Number.isInteger(state.captures.B) || state.captures.B < 0) return false;
  if (!Number.isInteger(state.captures.W) || state.captures.W < 0) return false;

  if (!Array.isArray(state.history) || !state.history.every(isMove)) return false;

  if (!Number.isInteger(state.passes) || state.passes < 0) return false;
  if (!STATUSES.has(state.status)) return false;

  if (state.koPoint !== null) {
    if (!Number.isInteger(state.koPoint) || state.koPoint < 0 || state.koPoint >= TOTAL) {
      return false;
    }
  }

  if (state.result !== null) {
    if (typeof state.result !== 'object') return false;
    if (!COLORS.has(state.result.winner)) return false;
    if (state.result.reason !== 'score' && state.result.reason !== 'resign') return false;
  }

  return true;
}

export function serialize(state) {
  return JSON.stringify({
    version: VERSION,
    savedAt: new Date().toISOString(),
    state,
  });
}

export function deserialize(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.version !== VERSION) return null;
    if (!validateState(parsed.state)) return null;
    return parsed.state;
  } catch {
    return null;
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, serialize(state));
    return true;
  } catch {
    return false;
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const state = deserialize(raw);
    if (!state) localStorage.removeItem(KEY);
    return state;
  } catch {
    return null;
  }
}
