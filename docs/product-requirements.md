# Product Requirements — demo

## 1. Product objective

Build a simple, interactive web app that lets students play and learn **9×9 Go** against a bot. The app should make the rules understandable, forgive mistakes through undo, and work on any device with a modern browser — with no sign-up.

Success looks like: a student opens the page, reads a short rules card, plays a complete 9×9 game against the bot, and ends with a clear result and a better understanding of capture, territory, and passing.

## 2. Users

| User | Context | Needs |
|---|---|---|
| Student (primary) | Laptop, tablet, or phone; new to Go | Clear board, legal moves, undo, friendly bot, simple explanations |
| Teacher / facilitator | Demonstrating on a projector or shared tablet | Readable board, predictable controls, no setup or accounts |
| Returning student | Same browser | Resume an in-progress game |

There are no administrators, no accounts, and no per-user data.

## 3. Confirmed requirements

### 3.1 Game rules

- **PR-01** The board is 9×9 intersections with the five star points marked.
- **PR-02** Players alternate placing Black (human, first) and White (bot) stones.
- **PR-03** Stones are removed when a connected group has no liberties (capture).
- **PR-04** Suicide is illegal unless the move captures.
- **PR-05** Simple ko is enforced: a move may not recreate the immediately previous board position.
- **PR-06** A player may pass. Two consecutive passes end the game.
- **PR-07** A player may resign; the game ends immediately.
- **PR-08** Scoring is area scoring (Chinese-style): stones on the board plus empty points surrounded exclusively by one colour.
- **PR-09** Komi is 6.5 points to White, displayed in the result.
- **PR-10** Captures are counted per colour and shown during play.

### 3.2 Interaction

- **PR-11** Clicking/tapping a legal intersection places the current player's stone and triggers the bot's reply.
- **PR-12** Illegal moves are rejected with a brief, non-blocking explanation; board state does not change.
- **PR-13** The last move is clearly marked.
- **PR-14** The current turn and capture counts are always visible.
- **PR-15** Undo reverts the human's last move and the bot's reply, restoring captures, turn, and ko point.
- **PR-16** New Game resets the board after confirmation when a game is in progress.
- **PR-17** Pass is available to the human and ends the game after the bot also passes.
- **PR-18** Resign ends the game with a clear result.
- **PR-19** A Rules panel explains the goal, capture, ko, pass, and scoring in plain language.

### 3.3 Bot opponent

- **PR-20** The bot plays only legal moves and passes when none exist.
- **PR-21** The bot is deterministic for a given position and difficulty (no unseeded randomness), so behaviour is testable.
- **PR-22** The bot is "approachable": it should not be trivially random, and it should occasionally make imperfect but legal moves.
- **PR-23** The bot must not stall the UI; if it calculates for more than ~50 ms it runs asynchronously and the UI shows "thinking".

### 3.4 Persistence

- **PR-24** The current game auto-saves to `localStorage` after each move.
- **PR-25** On load, a valid saved game is restored in a playable state.
- **PR-26** An invalid or incompatible saved game is discarded safely and a fresh game starts.
- **PR-27** There is exactly one saved game per browser; starting a new game replaces it.
- **PR-28** No data is transmitted anywhere.

### 3.5 Accessibility and responsiveness

- **PR-29** All controls are reachable and operable by keyboard.
- **PR-30** Board intersections are keyboard-focusable with arrow-key navigation; Enter/Space places a stone.
- **PR-31** Turn changes, captures, passes, illegal moves, and game end are announced via an `aria-live` region.
- **PR-32** The board is legible and usable from 320 px wide up to desktop.
- **PR-33** Players are distinguishable by more than colour (stone label or shape cue).
- **PR-34** Colour contrast meets WCAG 2.1 AA for text and controls.

## 4. Assumptions (see also `assumptions-and-questions.md`)

- The primary learning mode is single-player versus bot. Hotseat two-player is a nice-to-have, not in MVP.
- The bot opponent is local and intentionally modest; strength tuning is out of scope for the MVP.
- Games are short (9×9), so area scoring is computed on demand at game end rather than continuously.
- The app is English-only for the MVP.
- The project is presented simply as "demo"; UI copy stays generic and free of real names or identifiers.

## 5. Out of scope (MVP)

- Accounts, login, profiles, or cloud sync.
- Online or hotseat multiplayer.
- 13×13 or 19×19 boards.
- Detailed Japanese scoring, handicap, or komi configuration by the user.
- SGF import/export.
- Strong AI (MCTS/neural nets), difficulty selection beyond a single approachable level.
- Leaderboards, analytics, notifications, or social features.
- Native mobile apps.
- Internationalisation.

## 6. Acceptance scenarios

1. **Fresh game** — Opening the page with no save shows an empty 9×9 board, Black to play, captures 0–0.
2. **Legal move and reply** — Clicking an empty point places a black stone and the bot replies with a white stone within 1 second.
3. **Capture** — Surrounding a white stone with black removes it and increments Black's capture count.
4. **Suicide rejected** — Clicking a point that would leave the group without liberties is rejected and the board is unchanged.
5. **Ko rejected** — Recreating the previous position is rejected with an explanation.
6. **Undo** — Undo returns to the position before the human's last move, including captures and turn.
7. **Pass and score** — Two consecutive passes show a scored result with black area, white area, komi, and winner.
8. **Resign** — Resigning ends the game with a clear result and no further moves accepted.
9. **Resume** — Reloading after several moves restores the exact board, turn, captures, and history.
10. **Corrupt save** — A malformed saved game is ignored and a fresh game starts without an error dialog.
11. **Keyboard only** — A student can complete a move and reach all controls using only the keyboard.
12. **No network** — With the network disabled after load, the game remains fully playable.

## 7. Non-functional requirements

- **NFR-01** First load transfers no third-party resources; no external fonts or scripts required (a system font stack is acceptable).
- **NFR-02** Page remains responsive with the board at common desktop and tablet sizes.
- **NFR-03** Core rules, bot, and scoring modules have unit tests; illegal-move and capture scenarios are covered.
- **NFR-04** No secrets, credentials, or real identifiers in source or docs.
- **NFR-05** Works in current evergreen browsers (Chrome, Edge, Firefox, Safari).
- **NFR-06** No use of `eval`, `innerHTML` with dynamic data, or remote code.
- **NFR-07** Accessible name and role for every interactive element.

## 8. Success measures (lightweight)

- A new student can complete a game without external help.
- No console errors during a full game.
- Rules tests pass in CI.
- The app loads and plays with zero network requests beyond the initial static assets.
