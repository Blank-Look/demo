const NS = 'http://www.w3.org/2000/svg';
const COLUMNS = 'ABCDEFGHJ';

export function columnLabel(x) {
  return COLUMNS[x] ?? '?';
}

export function coordinateLabel(index, size = 9) {
  const x = index % size;
  const y = Math.floor(index / size);
  return `${COLUMNS[x]}${size - y}`;
}

export function createBoard(container, { size, onPlay }) {
  const WIDTH = 100;
  const PAD = 6;
  const step = (WIDTH - PAD * 2) / (size - 1);
  const stoneRadius = step * 0.42;
  const hitRadius = step * 0.58;

  function coords(index) {
    const x = index % size;
    const y = Math.floor(index / size);
    return { x, y, cx: PAD + x * step, cy: PAD + y * step };
  }

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${WIDTH} ${WIDTH}`);
  svg.setAttribute('class', 'board');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', `${size} by ${size} Go board`);

  const grid = document.createElementNS(NS, 'g');
  grid.setAttribute('class', 'grid');
  for (let i = 0; i < size; i += 1) {
    const offset = PAD + i * step;

    const horizontal = document.createElementNS(NS, 'line');
    horizontal.setAttribute('x1', PAD);
    horizontal.setAttribute('y1', offset);
    horizontal.setAttribute('x2', WIDTH - PAD);
    horizontal.setAttribute('y2', offset);
    grid.appendChild(horizontal);

    const vertical = document.createElementNS(NS, 'line');
    vertical.setAttribute('x1', offset);
    vertical.setAttribute('y1', PAD);
    vertical.setAttribute('x2', offset);
    vertical.setAttribute('y2', WIDTH - PAD);
    grid.appendChild(vertical);
  }
  svg.appendChild(grid);

  const starLayer = document.createElementNS(NS, 'g');
  starLayer.setAttribute('class', 'star-points');
  const starPoints = size === 9
    ? [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]]
    : [];
  for (const [x, y] of starPoints) {
    const star = document.createElementNS(NS, 'circle');
    star.setAttribute('cx', PAD + x * step);
    star.setAttribute('cy', PAD + y * step);
    star.setAttribute('r', step * 0.09);
    starLayer.appendChild(star);
  }
  svg.appendChild(starLayer);

  const stoneLayer = document.createElementNS(NS, 'g');
  stoneLayer.setAttribute('class', 'stones');
  svg.appendChild(stoneLayer);

  const markerLayer = document.createElementNS(NS, 'g');
  markerLayer.setAttribute('class', 'markers');
  svg.appendChild(markerLayer);

  const hitLayer = document.createElementNS(NS, 'g');
  hitLayer.setAttribute('class', 'hits');
  svg.appendChild(hitLayer);

  const points = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      const { cx, cy } = coords(index);

      const point = document.createElementNS(NS, 'g');
      point.setAttribute('class', 'point');
      point.setAttribute('data-index', String(index));
      point.setAttribute('tabindex', '0');
      point.setAttribute('role', 'button');

      const hit = document.createElementNS(NS, 'circle');
      hit.setAttribute('class', 'hit');
      hit.setAttribute('cx', cx);
      hit.setAttribute('cy', cy);
      hit.setAttribute('r', hitRadius);

      point.appendChild(hit);
      hitLayer.appendChild(point);
      points.push(point);
    }
  }

  svg.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('.point') : null;
    if (!target) return;
    onPlay(Number(target.getAttribute('data-index')));
  });

  svg.addEventListener('keydown', (event) => {
    const target = event.target instanceof Element ? event.target.closest('.point') : null;
    if (!target) return;

    const index = Number(target.getAttribute('data-index'));
    const { x, y } = coords(index);
    let nextX = x;
    let nextY = y;

    if (event.key === 'ArrowLeft') nextX = Math.max(0, x - 1);
    else if (event.key === 'ArrowRight') nextX = Math.min(size - 1, x + 1);
    else if (event.key === 'ArrowUp') nextY = Math.max(0, y - 1);
    else if (event.key === 'ArrowDown') nextY = Math.min(size - 1, y + 1);
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPlay(index);
      return;
    } else {
      return;
    }

    event.preventDefault();
    points[nextY * size + nextX]?.focus();
  });

  function render(state) {
    while (stoneLayer.firstChild) stoneLayer.removeChild(stoneLayer.firstChild);
    while (markerLayer.firstChild) markerLayer.removeChild(markerLayer.firstChild);

    for (let index = 0; index < state.board.length; index += 1) {
      const color = state.board[index];
      if (!color) continue;

      const { cx, cy } = coords(index);

      const stone = document.createElementNS(NS, 'circle');
      stone.setAttribute('class', `stone ${color === 'B' ? 'stone-b' : 'stone-w'}`);
      stone.setAttribute('cx', cx);
      stone.setAttribute('cy', cy);
      stone.setAttribute('r', stoneRadius);
      stoneLayer.appendChild(stone);

      const label = document.createElementNS(NS, 'text');
      label.setAttribute(
        'class',
        `stone-label ${color === 'B' ? 'stone-label-b' : 'stone-label-w'}`,
      );
      label.setAttribute('x', cx);
      label.setAttribute('y', cy);
      label.textContent = color;
      stoneLayer.appendChild(label);
    }

    const last = state.history[state.history.length - 1];
    if (last && last.type === 'place') {
      const { cx, cy } = coords(last.index);
      const ring = document.createElementNS(NS, 'circle');
      ring.setAttribute('class', 'last-move');
      ring.setAttribute('cx', cx);
      ring.setAttribute('cy', cy);
      ring.setAttribute('r', stoneRadius * 0.55);
      markerLayer.appendChild(ring);
    }

    const playing = state.status === 'playing';

    for (const point of points) {
      const index = Number(point.getAttribute('data-index'));
      const { x, y } = coords(index);
      const color = state.board[index];
      const description = color === 'B'
        ? 'black stone'
        : color === 'W'
          ? 'white stone'
          : 'empty';

      point.setAttribute(
        'aria-label',
        `Column ${COLUMNS[x]}, row ${size - y}, ${description}`,
      );

      if (playing) point.removeAttribute('aria-disabled');
      else point.setAttribute('aria-disabled', 'true');
    }
  }

  container.replaceChildren(svg);

  return {
    render,
    focusPoint(index = 0) {
      points[index]?.focus();
    },
    element: svg,
  };
}
