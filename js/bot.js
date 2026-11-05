import {
  SIZE,
  place,
  cloneState,
  getGroup,
  neighbors,
  pointOf,
} from './game.js';

const STAR_POINTS = new Set([20, 24, 56, 60, 40]);

function positionalValue(index) {
  const { x, y } = pointOf(index);
  const edgeDistance = Math.min(x, y, SIZE - 1 - x, SIZE - 1 - y);

  let value = 0;
  if (edgeDistance === 0) value -= 2.5;
  else if (edgeDistance === 1) value += 0.5;
  else if (edgeDistance === 2) value += 3;
  else if (edgeDistance === 3) value += 2.2;
  else value += 1;

  const nearCorner = (x <= 2 || x >= SIZE - 3) && (y <= 2 || y >= SIZE - 3);
  if (nearCorner) value += 1.8;
  if (STAR_POINTS.has(index)) value += 2.5;

  const fromCentre = Math.abs(x - 4) + Math.abs(y - 4);
  value += (8 - fromCentre) * 0.12;

  return value;
}

export function chooseMove(state) {
  if (state.status !== 'playing') return null;
  if (state.passes > 0) return null;

  let best = null;
  let bestScore = -Infinity;

  const total = SIZE * SIZE;
  for (let i = 0; i < total; i += 1) {
    if (state.board[i] !== null) continue;

    const result = place(cloneState(state), i);
    if (result.error) continue;

    const next = result.state;
    const captured = next.captures[state.turn] - state.captures[state.turn];
    const own = getGroup(next.board, i);

    let score = captured * 12 + positionalValue(i);

    for (const nextPoint of neighbors(i)) {
      if (state.board[nextPoint] !== state.turn) continue;
      const before = getGroup(state.board, nextPoint);
      if (before.liberties.length !== 1) continue;
      const after = getGroup(next.board, i);
      if (after.liberties.length > 1) score += 5;
    }

    if (captured === 0 && own.liberties.length === 1) score -= 9;

    const friendlyNeighbours = neighbors(i).filter(
      (nextPoint) => state.board[nextPoint] === state.turn,
    ).length;
    if (captured === 0 && friendlyNeighbours === 4) score -= 4;

    if (score > bestScore + 1e-9) {
      bestScore = score;
      best = i;
    }
  }

  return best;
}
