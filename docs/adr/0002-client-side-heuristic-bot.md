# ADR-0002: Deterministic client-side heuristic bot

## Status

Accepted — Phase 0.

## Context

The product requires a bot opponent (confirmed: bot only). It must be approachable for students, fast enough not to freeze the UI on a 9×9 board, and testable. The delivery template prefers deterministic, explainable behaviour over opaque AI, and discourages needless dependencies.

## Decision

Implement the bot as a deterministic heuristic move selector in `bot.js`:

1. Enumerate legal moves using the same rules engine used for the human.
2. Score candidates with a small, documented set of weighted heuristics (captures, saving groups in atari, avoiding self-atari, opening preferences, avoiding filling own territory late).
3. Choose the highest score; break ties deterministically.
4. Pass when no legal move exists.

No randomness, no MCTS, no neural network, no WebAssembly, no external AI service.

## Alternatives considered

1. **Random legal moves** — trivial but frustrating and unteachable.
2. **Monte Carlo Tree Search in the browser** — stronger, but heavier, less explainable, and unnecessary for a gentle opponent.
3. **Remote AI service** — violates the no-network/no-data-leaves-device posture and adds latency, cost, and privacy obligations.
4. **WASM Go engine** — large payload and complexity for a student demo.

## Consequences

**Positive**

- Deterministic and unit-testable for a given position.
- Explainable to maintainers and, eventually, to students.
- No dependencies or network.
- Fast on a 9×9 board.

**Negative / trade-offs**

- Weaker than a real engine; students will eventually outgrow it.
- Heuristic tuning is manual and somewhat subjective.
- Determinism can feel repetitive across identical openings.

## Risks

| Risk | Mitigation |
|---|---|
| Bot plays illegal moves | Always validate through the rules engine |
| Bot calculation stalls UI | Measure; wrap in async with "thinking" state if > ~50 ms |
| Bot feels unfair or too strong | Keep heuristics gentle; test playability manually |
| Heuristic regressions | Deterministic position fixtures in `bot.test.js` |

## Revisit if

- Difficulty levels are requested.
- Students need a stronger opponent.
- Measured bot latency exceeds the UI budget.
