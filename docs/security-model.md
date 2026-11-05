# Security Model — demo

## 1. Posture

demo is a **client-side-only static site**. It processes no personal data, has no accounts, and communicates with no backend. The attack surface is limited to the browser rendering static assets and the integrity of the code served from GitHub Pages.

Security goals, in priority order:

1. Students' data never leaves their device.
2. The app cannot be used to exfiltrate data or execute injected code.
3. Served content is trustworthy and unchanged between builds.
4. The game remains playable offline and cannot be corrupted into an unsafe state.

## 2. Data classification

| Data | Classification | Location | Notes |
|---|---|---|---|
| Board position, move history, captures, result | Non-sensitive | Browser memory + `localStorage` | Purely game state |
| Bot settings / difficulty | Non-sensitive | Browser memory | Not personal |
| Any student identity | Not collected | — | No accounts, no names, no email |

No personal, sensitive, confidential, or regulated data is collected or stored.

## 3. Authentication and authorisation

- No authentication.
- No authorisation model, roles, or sessions.
- No cookies.
- The app is public and read-only; any visitor can play.

## 4. Data protection

- `localStorage` holds only non-sensitive game state.
- Users can clear it via browser settings at any time.
- No server retention, no backups, no cloud sync.
- No data is shared with third parties.

## 5. Client-side security controls

| Control | Implementation |
|---|---|
| No dynamic HTML injection | Build the DOM with `createElement`/`textContent`; never pass user/dynamic data to `innerHTML` |
| No remote code | No external scripts, CDNs, `<iframe>`s, or `eval` |
| No `eval` / `Function` | Lint rule forbids it |
| Safe storage parsing | Validate every field of the saved game before use; discard on any mismatch |
| Strict input handling | Board input is limited to valid integer coordinates on a 9×9 grid |
| No secrets | Nothing secret is present; no keys, tokens, or credentials |
| Dependency minimisation | Zero runtime dependencies; no supply-chain surface |
| Content Security Policy | Add a `<meta http-equiv="Content-Security-Policy">` allowing only self-hosted assets (see below) |

### 5.1 Proposed Content Security Policy

```
default-src 'self';
script-src 'self';
style-src 'self';
img-src 'self' data:;
font-src 'self';
connect-src 'none';
object-src 'none';
base-uri 'none';
form-action 'none';
frame-ancestors 'none';
```

Notes:

- `connect-src 'none'` means the app cannot make network requests, enforcing no-exfiltration even if a bug or injected script is introduced.
- Inline styles/scripts must be avoided so `'unsafe-inline'` is never needed. If the MVP needs a tiny inline bootstrap, prefer moving it to a file rather than loosening the policy.
- GitHub Pages does not allow custom HTTP response headers, so CSP is delivered via `<meta>`; document this limitation.

## 6. Transport and hosting

- Served over HTTPS by GitHub Pages.
- No server-side processing.
- Enable GitHub branch protection on the default branch and require review for changes, to protect code integrity.
- Optionally enable GitHub secret scanning and Dependabot (no dependencies today, but keeps the repo clean).

## 7. Permissions matrix

Because there are no accounts, the "permission matrix" is a browser-capability table:

| Actor | Can play | Can read rules | Can reset save | Can modify source |
|---|---|---|---|---|
| Student (any visitor) | Yes | Yes | Yes (New Game / browser settings) | No |
| Teacher (any visitor) | Yes | Yes | Yes | No |
| Contributor | Yes | Yes | Yes | Yes, via reviewed pull request |
| Maintainer | Yes | Yes | Yes | Yes, merge rights |

There are no privileged application roles.

## 8. Logging and monitoring

- No application logging to a server.
- No analytics or telemetry.
- Errors are handled in the UI; developer diagnostics, if added, must be behind a non-default debug flag and must not transmit data.

## 9. Secure development

- Unit tests for rules, scoring, storage validation, and bot legality.
- Review checklist in `AGENTS.md` (Definition of Done).
- No secrets in source; no environment files.
- Dependency review required before adding any library (see ADR requirement).
- Threat model maintained in `threat-model.md`.

## 10. Incident response

For a static, data-free app, an incident is limited to a bad deployment or compromised repository.

1. Revert the offending commit on the default branch (Pages redeploys automatically).
2. Verify the live site serves the reverted assets.
3. Review GitHub audit log and repository access.
4. Record what happened and update the threat model if a new class of issue was found.

## 11. Known limitations

- CSP via `<meta>` may not cover every directive in all browsers; it is defence-in-depth, not a substitute for safe code.
- GitHub Pages cannot set `Strict-Transport-Security`, `X-Frame-Options`, or other headers. `frame-ancestors` in a meta CSP is not honoured by all browsers.
- `localStorage` is per-browser and can be cleared; there is no recovery of a lost game.
