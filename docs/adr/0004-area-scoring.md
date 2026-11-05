# ADR-0004: Area (Chinese) scoring with 6.5 komi

## Status

Accepted — Phase 0.

## Context

A scored result is required when the game ends by two passes. Go has multiple scoring systems. The app targets beginners on a 9×9 board, so correctness, simplicity, and forgiveness matter more than matching a particular tournament ruleset.

## Decision

Use **area scoring** (Chinese-style): each player's score is their stones on the board plus empty points surrounded exclusively by their colour. White receives 6.5 komi. The MVP does not automatically remove dead stones; a scored game assumes both players agree on the position, or a player resigns. This limitation is stated in the result panel and rules.

## Alternatives considered

1. **Japanese/territory scoring** — requires prisoner accounting and, in practice, dead-stone agreement; more edge cases for beginners.
2. **No scoring; resign only** — fails the pass-to-end requirement and gives no learning feedback.
3. **AI/vision dead-stone detection** — out of scope and opaque.

## Consequences

**Positive**

- Simple, deterministic, and testable.
- Forgiving for beginners (area scoring is less sensitive to certain play styles).
- No dead-stone algorithm required for MVP.

**Negative / trade-offs**

- Does not resolve life-and-death; scores may overcount dead stones left on the board.
- Komi fixed rather than configurable.

## Risks

| Risk | Mitigation |
|---|---|
| Students expect dead stones removed | Explain clearly in rules/result; later phase can add marking |
| Scoring bugs on mixed-border regions | Flood-fill tests, including neutral dame regions |
| Confusion with other rulesets | State "area scoring, komi 6.5" in the result |

## Revisit if

- Dead-stone marking is added.
- Configurable rulesets or komi are requested.
- The app expands to 13×13/19×19 where scoring differences matter more.
