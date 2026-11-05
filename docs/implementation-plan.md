# Implementation Plan — demo

This plan follows the delivery template's **Phase 0 first, then vertical slices** approach, right-sized for a static app.

## Progress

- [x] Phase 0 — planning and foundation
- [x] Phase 1 — playable core
- [x] Phase 2 — scoring and persistence
- [x] Phase 3 — learning and accessibility polish (optional hint overlay not included)
- [x] Phase 4 — bot tuning and hardening (automated tests pass; browser checks pending)
- [ ] Phase 5 — release readiness

## Phase 0 — Planning and foundation (complete)

Deliver (docs only, no app code):

- [x] `docs/product-requirements.md`
- [x] `docs/architecture.md` (+ Mermaid architecture and sequence diagrams)
- [x] `docs/data-model.md` (+ Mermaid ERD)
- [x] `docs/integrations.md` (explicitly none)
- [x] `docs/security-model.md`
- [x] `docs/threat-model.md`
- [x] `docs/implementation-plan.md`
- [x] `docs/assumptions-and-questions.md`
- [x] `docs/policy-traceability.md`
- [x] `docs/adr/` decision records
- [x] `AGENTS.md`
- [x] `README.md`

Phase 0 was reviewed and accepted before implementation began.

## Phase 1 — Playable core (vertical slice 1, complete)

Goal: a student can place stones and the bot replies, with correct capture and illegal-move handling. Not yet scored or saved.

Deliver:

- `index.html` shell with board container and controls (New Game, Undo, Pass, Resign, Rules).
- `css/styles.css` basic layout and board styling.
- `js/game.js`: newGame, place, capture, suicide, simple ko, pass, resign, undo, history.
- `js/board.js`: SVG board render + click handling + last-move marker.
- `js/bot.js`: legal-move enumeration + first heuristic pick.
- `js/app.js`: wiring, turn display, capture counts.
- `tests/game.test.js`, `tests/bot.test.js` core cases.

Acceptance: PR-01–PR-22, PR-11–PR-14. Play a full game by passing twice (scoring may be stubbed).

### Files created/changed in slice 1

```
index.html
css/styles.css
js/app.js
js/game.js
js/board.js
js/bot.js
tests/game.test.js
tests/bot.test.js
```

## Phase 2 — Scoring and persistence (vertical slice 2, complete)

Deliver:

- `js/scoring.js`: area scoring + komi, result object.
- `js/storage.js`: save/load/validate, corrupt-save discard.
- Result panel with black area, white area, komi, winner.
- Auto-save after each committed move; resume on load.
- `tests/scoring.test.js`, `tests/storage.test.js`.

Acceptance: PR-06, PR-08, PR-09, PR-24–PR-28; acceptance scenarios 7, 9, 10.

### Files created/changed in slice 2

```
js/scoring.js
js/storage.js
js/app.js
js/board.js
tests/scoring.test.js
tests/storage.test.js
```

## Phase 3 — Learning and accessibility polish (complete, except optional hint)

Deliver:

- Rules panel content in plain language.
- Keyboard navigation across intersections and controls.
- `aria-live` announcements (turn, capture, pass, illegal, end).
- Focus ring styles, responsive layout refinements.
- Hint toggle (show liberties / legal points) if cheap.
- Contrast check to WCAG 2.1 AA.

Acceptance: PR-16, PR-19, PR-29–PR-34; scenarios 11.

### Files created/changed in slice 3

```
index.html
css/styles.css
js/app.js
js/board.js
```

## Phase 4 — Bot tuning and hardening (complete for automated tests)

Deliver:

- Improve bot heuristics (captures, atari, self-atari avoidance, opening preference).
- Deterministic tie-breaking; bot-only-legal-move tests.
- Async "thinking" wrapper if profiling shows a stall.
- Full test pass, no console errors across a scripted game.
- README and docs updated.

Acceptance: PR-20–PR-23; scenario 2 timing.

## Phase 5 — Release readiness (pending)

Deliver:

- GitHub Pages enablement (root or `/docs` — this project uses root).
- `.nojekyll`.
- CI workflow: run `node --test`, optional HTML/asset link check.
- Confirm CSP header meta and no external requests.
- Final security/threat review against `threat-model.md` triggers.
- Tag `v1.0.0`.

## Prioritised backlog

| # | Item | Phase | Priority | Requirement |
|---|---|---|---|---|
| 1 | Board state + renderer | 1 | Must | PR-01, PR-11 |
| 2 | Place/capture/suicide/ko rules | 1 | Must | PR-02–PR-05 |
| 3 | Turn + capture display, last move | 1 | Must | PR-13, PR-14 |
| 4 | Undo (human + bot) | 1 | Must | PR-15 |
| 5 | Bot legal move + reply | 1 | Must | PR-20–PR-22 |
| 6 | Pass / resign / game end | 1 | Must | PR-06, PR-07, PR-17, PR-18 |
| 7 | Area scoring + komi | 2 | Must | PR-08, PR-09 |
| 8 | Save/resume/validate | 2 | Must | PR-24–PR-28 |
| 9 | Rules panel | 3 | Should | PR-19 |
| 10 | Keyboard + ARIA | 3 | Must | PR-29–PR-31 |
| 11 | Responsive + contrast | 3 | Must | PR-32–PR-34 |
| 12 | Bot tuning | 4 | Should | PR-22 |
| 13 | Async bot indicator | 4 | Could | PR-23 |
| 14 | Hint / liberties overlay | 3 | Could | (nice-to-have) |
| 15 | SGF export | — | Won't (MVP) | out of scope |

## Test plan

**Unit (Node `--test`):**

- `game.js`: legal placement, capture single/multiple groups, suicide rejection, capture-allows-self-fill, ko rejection, pass, two passes → scored, resign, undo restores exact state.
- `bot.js`: always returns a legal move; passes with no legal moves; deterministic for same position; never returns an occupied point.
- `scoring.js`: stones count, single-colour surrounded region, mixed-border region is neutral, komi applied, empty board scoring.
- `storage.js`: round-trip save/load; reject each malformed field; reject wrong version/size; discard on corrupt JSON.

**Manual / browser:**

- Acceptance scenarios 1–12 from `product-requirements.md`.
- Keyboard-only playthrough.
- Screen-reader smoke test (NVDA/VoiceOver) for announcements.
- Offline-after-load playthrough.
- Responsive at 320 px, 768 px, 1280 px.

**CI:**

- `node --test tests/`
- Optional: fail on `eval(`, `innerHTML`, `http://`/`https://` external references in source.

## Validation commands

```bash
# 1. Docs present
ls docs docs/adr

# 2. Mermaid blocks are present in the docs (manual render check in GitHub)
grep -rl 'mermaid' docs

# 3. Once code exists
node --test tests/
python3 -m http.server 8080   # manual smoke test
```

## Definition of done (per slice)

Matches `AGENTS.md`: acceptance criteria, tests, failure paths, accessibility preserved, persistence safe, no network/external assets, no secrets, no unrelated files, docs updated.

## Delivery risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Rules edge cases (ko, suicide, capture interplay) | Medium | High | Pure engine + exhaustive unit tests before UI |
| Bot accidentally illegal or slow | Medium | Medium | Reuse engine for legality; benchmark; async if needed |
| Scoring confusion (dead stones) | Medium | Medium | Document MVP limitation clearly in result panel |
| Accessibility regressions | Medium | Medium | Keyboard/ARIA in Phase 3 acceptance, not an afterthought |
| Scope creep (multiplayer, 19×19, SGF) | High | Medium | Explicit out-of-scope list; require ADR to add |
| Over-engineering past the template's simplicity principle | Low | Medium | Static stack; no infra unless a requirement demands it |
