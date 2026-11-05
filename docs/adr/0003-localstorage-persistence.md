# ADR-0003: Local-only persistence via localStorage

## Status

Accepted — Phase 0.

## Context

Students should be able to resume an in-progress game without creating an account (confirmed: no accounts, local save only). The state is non-sensitive: a board position, move history, captures, and result. Cloud persistence would require a backend, authentication, and data handling obligations for no product benefit.

## Decision

Persist exactly one game per browser in `localStorage` under the key `demo:save:v1`, as a versioned JSON object. Save after every committed move. Validate the full record on load; on any mismatch, remove it and start a fresh game. Provide no server-side storage.

## Alternatives considered

1. **No persistence** — fails the resume requirement.
2. **IndexedDB** — unnecessary complexity for a small single record.
3. **Cloud sync / accounts** — out of scope; adds privacy and operational burden.
4. **URL-encoded game state** — leaks state into history/sharing and has size limits; not a substitute for a save.

## Consequences

**Positive**

- No backend, accounts, or personal data.
- Resume works instantly and offline.
- Easy to clear; no server retention.

**Negative / trade-offs**

- Not portable across devices or browsers.
- Can be lost if the user clears site data or uses private mode.
- Storage can be unavailable or full (quota).

## Risks

| Risk | Mitigation |
|---|---|
| Corrupt/tampered save crashes the app | Strict validation; discard on any mismatch |
| `localStorage` unavailable (private mode/quota) | Catch errors; play continues with saving disabled + quiet notice |
| Schema drift across versions | `version` field; migrate or discard old saves |
| Save contains unintended data | Only game state is serialised; no PII |

## Revisit if

- Cross-device progress or accounts are requested.
- Multiple saved games or replay library is requested.
- The saved payload grows beyond what `localStorage` comfortably holds.
