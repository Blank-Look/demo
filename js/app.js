import { createGame, place, pass, resign, undo, other } from './game.js';
import { chooseMove } from './bot.js';
import { createBoard, coordinateLabel } from './board.js';
import { load, save } from './storage.js';

const boardMount = document.getElementById('board');
const turnEl = document.getElementById('turn');
const captureBlackEl = document.getElementById('captures-black');
const captureWhiteEl = document.getElementById('captures-white');
const messageEl = document.getElementById('message');
const resultEl = document.getElementById('result');
const resultTitleEl = document.getElementById('result-title');
const resultScoreEl = document.getElementById('result-score');
const resultNoteEl = document.getElementById('result-note');
const newButton = document.getElementById('new-game');
const undoButton = document.getElementById('undo');
const passButton = document.getElementById('pass');
const resignButton = document.getElementById('resign');
const rulesButton = document.getElementById('open-rules');
const rulesDialog = document.getElementById('rules-dialog');
const rulesClose = document.getElementById('close-rules');

let state = load() ?? createGame();
let thinking = false;
let botTimer = null;

const board = createBoard(boardMount, {
  size: state.size,
  onPlay: handlePlay,
});

function name(color) {
  return color === 'B' ? 'Black' : 'White';
}

function format(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function announce(text) {
  messageEl.textContent = '';
  window.requestAnimationFrame(() => {
    messageEl.textContent = text;
  });
}

function resultSummary() {
  const result = state.result;
  if (!result) return 'Game over.';
  if (result.reason === 'resign') {
    return `${name(result.winner)} wins by resignation.`;
  }
  return `${name(result.winner)} wins. Black ${format(result.blackArea)}, White ${format(result.whiteArea)}.`;
}

function renderResult() {
  if (state.status === 'playing' || !state.result) {
    resultEl.hidden = true;
    return;
  }

  resultEl.hidden = false;
  const result = state.result;

  if (result.reason === 'resign') {
    resultTitleEl.textContent = `${name(result.winner)} wins by resignation`;
    resultScoreEl.textContent = `${name(other(result.winner))} resigned.`;
    resultNoteEl.textContent = '';
    return;
  }

  resultTitleEl.textContent = `${name(result.winner)} wins`;
  resultScoreEl.textContent = `Black area ${format(result.blackArea)} — White area ${format(result.whiteArea)} (includes ${format(result.komi)} komi).`;
  resultNoteEl.textContent = 'Area scoring. Dead stones are not removed automatically.';
}

function updateUI() {
  board.render(state);

  const playing = state.status === 'playing';

  if (!playing) turnEl.textContent = 'Game over';
  else if (state.turn === 'B') turnEl.textContent = 'Your turn — Black';
  else if (thinking) turnEl.textContent = 'Bot thinking — White';
  else turnEl.textContent = 'Bot turn — White';

  turnEl.dataset.turn = state.turn;
  captureBlackEl.textContent = String(state.captures.B);
  captureWhiteEl.textContent = String(state.captures.W);

  undoButton.disabled = state.history.length === 0;
  passButton.disabled = !playing || state.turn !== 'B' || thinking;
  resignButton.disabled = !playing || thinking;

  renderResult();
}

function persistAndRender() {
  save(state);
  updateUI();
}

function scheduleBot() {
  if (state.status !== 'playing' || state.turn !== 'W') return;

  thinking = true;
  updateUI();

  botTimer = window.setTimeout(() => {
    botTimer = null;

    if (state.status !== 'playing' || state.turn !== 'W') {
      thinking = false;
      updateUI();
      return;
    }

    const move = chooseMove(state);
    const result = move === null ? pass(state) : place(state, move);

    if (result.error) {
      const fallback = pass(state);
      if (!fallback.error) state = fallback.state;
    } else {
      state = result.state;
    }

    thinking = false;
    persistAndRender();

    const last = state.history[state.history.length - 1];

    if (state.status === 'scored') {
      announce(`The bot passed. ${resultSummary()}`);
    } else if (last && last.type === 'pass') {
      announce('The bot passed. Your turn.');
    } else if (last && last.type === 'place') {
      let text = `The bot played ${coordinateLabel(last.index, state.size)}.`;
      if (last.captured.length > 0) {
        text += ` Captured ${last.captured.length} stone${last.captured.length === 1 ? '' : 's'}.`;
      }
      announce(text);
    } else {
      announce('Your turn.');
    }
  }, 350);
}

function handlePlay(index) {
  if (thinking) return;

  if (state.status !== 'playing') {
    announce('The game is over. Choose New Game to play again.');
    return;
  }

  if (state.turn !== 'B') {
    announce('It is the bot’s turn.');
    return;
  }

  const result = place(state, index);
  if (result.error) {
    announce(result.error);
    return;
  }

  state = result.state;
  persistAndRender();

  const last = state.history[state.history.length - 1];
  let text = `You played ${coordinateLabel(last.index, state.size)}.`;
  if (last.captured.length > 0) {
    text += ` Captured ${last.captured.length} stone${last.captured.length === 1 ? '' : 's'}.`;
  }
  announce(text);

  if (state.status === 'playing' && state.turn === 'W') scheduleBot();
}

function handlePass() {
  if (thinking) return;

  if (state.status !== 'playing' || state.turn !== 'B') {
    announce('You can only pass on your turn.');
    return;
  }

  const result = pass(state);
  if (result.error) {
    announce(result.error);
    return;
  }

  state = result.state;
  persistAndRender();
  announce('You passed.');

  if (state.status === 'playing' && state.turn === 'W') scheduleBot();
  else if (state.status === 'scored') announce(`You passed. ${resultSummary()}`);
}

function handleResign() {
  if (thinking) return;

  if (state.status !== 'playing') {
    announce('The game is already over.');
    return;
  }

  if (!window.confirm('Resign this game?')) return;

  const result = resign(state);
  if (result.error) {
    announce(result.error);
    return;
  }

  state = result.state;
  persistAndRender();
  announce(resultSummary());
}

function handleUndo() {
  if (botTimer) {
    window.clearTimeout(botTimer);
    botTimer = null;
    thinking = false;
  }

  if (state.history.length === 0) {
    announce('There is no move to undo.');
    return;
  }

  let changed = false;

  if (state.history[state.history.length - 1].color === 'W') {
    const result = undo(state);
    if (!result.error) {
      state = result.state;
      changed = true;
    }
  }

  if (state.history.length > 0 && state.history[state.history.length - 1].color === 'B') {
    const result = undo(state);
    if (!result.error) {
      state = result.state;
      changed = true;
    }
  }

  if (!changed) {
    const result = undo(state);
    if (!result.error) {
      state = result.state;
      changed = true;
    }
  }

  persistAndRender();
  announce(changed ? 'Move undone.' : 'Nothing to undo.');
}

function handleNew() {
  if (state.history.length > 0 && !window.confirm('Start a new game? The current game will be lost.')) {
    return;
  }

  if (botTimer) {
    window.clearTimeout(botTimer);
    botTimer = null;
  }

  thinking = false;
  state = createGame();
  persistAndRender();
  announce('New game. You play Black.');
}

newButton.addEventListener('click', handleNew);
undoButton.addEventListener('click', handleUndo);
passButton.addEventListener('click', handlePass);
resignButton.addEventListener('click', handleResign);

rulesButton.addEventListener('click', () => rulesDialog.showModal());
rulesClose.addEventListener('click', () => rulesDialog.close());
rulesDialog.addEventListener('click', (event) => {
  if (event.target === rulesDialog) rulesDialog.close();
});

updateUI();

if (state.status === 'playing') {
  if (state.turn === 'W') {
    announce('Game restored. The bot moves first.');
    scheduleBot();
  } else {
    announce(state.history.length > 0 ? 'Game restored. Your turn.' : 'New game. You play Black.');
  }
} else {
  announce(resultSummary());
}
