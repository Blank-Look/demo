export const DEFAULT_SIZE = 9;
export const DEFAULT_KOMI = 6.5;

function neighbours(index, size) {
  const x = index % size;
  const y = Math.floor(index / size);
  const out = [];
  if (x > 0) out.push(index - 1);
  if (x < size - 1) out.push(index + 1);
  if (y > 0) out.push(index - size);
  if (y < size - 1) out.push(index + size);
  return out;
}

export function scoreBoard(board, size = DEFAULT_SIZE, komi = DEFAULT_KOMI) {
  const total = size * size;
  let blackStones = 0;
  let whiteStones = 0;

  for (let i = 0; i < total; i += 1) {
    if (board[i] === 'B') blackStones += 1;
    else if (board[i] === 'W') whiteStones += 1;
  }

  const visited = new Array(total).fill(false);
  let blackTerritory = 0;
  let whiteTerritory = 0;

  for (let i = 0; i < total; i += 1) {
    if (board[i] !== null || visited[i]) continue;

    const region = [];
    const border = new Set();
    const stack = [i];
    visited[i] = true;

    while (stack.length) {
      const point = stack.pop();
      region.push(point);

      for (const next of neighbours(point, size)) {
        const value = board[next];
        if (value === null) {
          if (!visited[next]) {
            visited[next] = true;
            stack.push(next);
          }
        } else {
          border.add(value);
        }
      }
    }

    if (border.size === 1) {
      const owner = [...border][0];
      if (owner === 'B') blackTerritory += region.length;
      else whiteTerritory += region.length;
    }
  }

  const blackArea = blackStones + blackTerritory;
  const whiteArea = whiteStones + whiteTerritory + komi;

  return {
    winner: blackArea > whiteArea ? 'B' : 'W',
    reason: 'score',
    blackArea,
    whiteArea,
    komi,
    blackStones,
    whiteStones,
    blackTerritory,
    whiteTerritory,
  };
}
