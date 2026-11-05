# Runbook: Corrupt or stuck saved game

## Symptoms

- The app starts a new game unexpectedly.
- The board shows an impossible position.
- The app reports it cannot resume.

## Expected behaviour

`storage.load()` validates the saved record and discards it on any mismatch. A corrupt save should result in a fresh, playable game, not a crash.

## Steps for a user

1. Open the app in the same browser.
2. Choose **New Game** (this replaces the saved game).
3. If the problem persists, clear site data for the app's origin:
   - Chrome/Edge: DevTools → Application → Storage → Clear site data.
   - Firefox: Settings → Privacy → Manage Data → remove the site.
   - Safari: Settings → Privacy → Manage Website Data → remove the site.

## Steps for a maintainer

1. Reproduce with the reported sequence.
2. Inspect `localStorage['demo:save:v1']` in DevTools.
3. Add or extend a `storage.test.js` case for the malformed shape.
4. Fix validation; require the test to fail before the fix and pass after.
5. Bump the save `version` only if the schema genuinely changed; otherwise keep `1`.
