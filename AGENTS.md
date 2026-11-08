# Project Context

**demo** is a small, interactive web app that teaches students to play **9×9 Go** against a simple bot. It is a static site (HTML + CSS + vanilla JavaScript) hosted on GitHub Pages. There is no backend, no accounts, and no database.

The app exists to lower the barrier to learning Go: a small board, clear rules, undo and hints, and an approachable bot opponent.

**Name:** `demo`.

## Status

MVP implemented in `index.html`, `css/`, and `js/`. Unit tests in `tests/` cover the rules engine, bot, scoring, and persistence. Release hardening (CI workflow, GitHub Pages enablement, release tag) is pending; see `docs/implementation-plan.md`.

## Architecture (summary)

- Static, client-side only: `index.html`, `css/`, `js/`.
- Game rules, bot, and persistence all run in the browser.
- Persistence via `localStorage` (single saved game per browser).
- No network calls, no analytics, no third-party scripts.
- Hosted on GitHub Pages.

Full detail: `docs/architecture.md`.

## Repository Layout (target)

```
/
├── index.html            # app shell
├── css/
│   └── styles.css        # styling (Go board + UI)
├── js/
│   ├── app.js            # bootstrap, event wiring, UI state
│   ├── game.js           # rules engine (pure, no DOM)
│   ├── board.js          # board rendering (SVG/canvas)
│   ├── bot.js            # bot opponent (pure, no DOM)
│   ├── storage.js        # localStorage load/save
│   └── scoring.js        # territory + area scoring
├── tests/
│   ├── game.test.js      # rules-engine unit tests
│   ├── bot.test.js       # bot behaviour tests
│   ├── scoring.test.js   # scoring tests
│   └── storage.test.js   # persistence validation tests
├── docs/
│   ├── architecture.md
│   ├── product-requirements.md
│   ├── data-model.md
│   ├── integrations.md
│   ├── security-model.md
│   ├── threat-model.md
│   ├── implementation-plan.md
│   ├── assumptions-and-questions.md
│   ├── policy-traceability.md
│   ├── adr/
│   └── runbooks/
├── package.json          # ES module flag + test script
├── AGENTS.md
└── README.md
```

## Commands

No build step. Serve locally:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Run unit tests (Node's built-in test runner, no dependencies):

```bash
node --test tests/
```

## Coding Standards

- Vanilla ES modules (`<script type="module">`). No frameworks or bundler.
- Keep the rules engine (`game.js`) and bot (`bot.js`) **pure**: no DOM, no `localStorage`, no globals. They must be unit-testable in Node.
- The board renderer is the only code that touches SVG/canvas.
- Use `const`/`let`, strict equality, and explicit return values.
- Store board state as a flat array of 81 cells (`null | 'B' | 'W'`).
- Colours: Black = `'B'`, White = `'W'`, empty = `null`.
- Coordinates: internally 0-indexed `{x, y}` with `x` = column, `y` = row; display uses Go columns `A–J` (skipping `I`) and rows `9–1` top to bottom.
- Never mutate historical move history in place; append immutable move records.
- No comments unless they explain non-obvious Go rules or scoring.
- All UI copy must be original, student-friendly, and free of real names or identifiers.

## Game Rule Invariants (do not break)

- Board is 9×9. Star points (hoshi) at (2,2), (2,6), (6,2), (6,6), (4,4) zero-indexed.
- Illegal moves must be rejected without changing state: occupied point, suicide, and simple ko (positional superko for the immediately previous position).
- A move that captures one or more opposing groups is always legal even if it fills the last liberty of the played group.
- Two consecutive passes end the game and trigger scoring.
- Scoring is **area scoring** (Chinese-style): stones on board + empty points surrounded only by one colour. Komi default 6.5 for White.
- Captures are tracked per colour and displayed.
- Undo restores the full prior position, including captures, turn, and ko point.
- The bot must only choose from legal moves; if none exist it passes.
- A saved game must restore to a playable state or be discarded safely if invalid.

## UI Conventions

- Keep a restrained palette with a single accent colour (`--accent`).
- Board must be usable on desktop and tablet, and responsive on mobile.
- Intersections are keyboard-focusable; arrows move focus, Enter/Space place a stone.
- Announce turn changes, captures, passes, and game end to assistive technology via `aria-live`.
- Buttons: New Game, Undo, Pass, Resign, Hint (optional), Rules.
- Never rely on colour alone to distinguish players; include a stone shape/label cue.

## Definition of Done

A feature is complete only when:

- acceptance criteria in `docs/product-requirements.md` are met;
- rules-engine tests pass and cover the change;
- illegal moves and failure paths are handled;
- keyboard and screen-reader behaviour is preserved;
- the game state auto-saves and restores correctly;
- no external network requests or trackers are introduced;
- no real names, identifiers, or secrets are committed;
- unrelated files are not modified;
- docs and `README.md` are updated where behaviour changed.

## Security and Privacy

- Client-side only; no data leaves the browser.
- No accounts, no personal data collection, no cookies, no analytics.
- Any saved data is non-sensitive local game state.
- Treat all user-controlled input (if any is added later) as untrusted; avoid `innerHTML` with dynamic content.
- Do not add third-party libraries without an ADR and a supply-chain review.

See `docs/security-model.md` and `docs/threat-model.md`.
