# Threat Model — demo

Method: **STRIDE**, scoped to a static client-side app served by GitHub Pages.

## 1. Scope and assets

### In scope

- Static application files served to the browser.
- In-browser game state and the single `localStorage` record.
- The GitHub repository and Pages deployment pipeline.

### Assets

| Asset | Sensitivity | Why it matters |
|---|---|---|
| Served code (HTML/CSS/JS) | High integrity | Injected/modified code runs in every student's browser |
| Repository and deploy rights | High | Control of what is served |
| `localStorage` game state | Low | Non-sensitive; corrupting it only affects one browser |
| Student privacy | High | The app must not begin collecting or leaking data |

### Trust boundaries

1. GitHub Pages → browser (network, HTTPS).
2. Repository contributors → default branch (source integrity).
3. Browser → `localStorage` (untrusted serialised data read back).

## 2. Threats and mitigations

### Spoofing

| ID | Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| S-1 | Attacker impersonates the site via lookalike domain | Low | Medium | Use the canonical Pages URL; document it; no credentials to phish |
| S-2 | Unauthorised contributor impersonates a maintainer | Low | High | Enforce MFA on GitHub accounts and branch protection |

### Tampering

| ID | Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| T-1 | Malicious commit changes served JS | Low | High | Branch protection, review, least-privilege repo access |
| T-2 | Tampered `localStorage` feeds invalid data into the engine | Medium | Low | Validate all saved fields; discard on mismatch |
| T-3 | CDN/third-party script compromise | N/A | — | No third-party scripts; CSP `script-src 'self'` |
| T-4 | Dependency compromise | Low | Medium | Zero runtime dependencies; ADR + review before adding any |

### Repudiation

| ID | Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-1 | Dispute over who changed deployed code | Low | Low | Git history and GitHub audit log |

No in-app audit trail is required because there are no users, roles, or governance actions.

### Information disclosure

| ID | Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| I-1 | Accidental collection/transmission of student data | Low | High | No analytics, no network calls, `connect-src 'none'` |
| I-2 | Real names/identifiers committed to a public repo | Low | Medium | AGENTS.md rule; review checklist; fictional content only |
| I-3 | Gemini/LLM or tooling inadvertently adds a tracker | Low | High | Explicit "no external requests" definition of done |

### Denial of service

| ID | Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| D-1 | Giant/corrupt save causes a crash loop | Low | Low | Validate and size-check saves; discard invalid |
| D-2 | Bot calculation freezes the UI | Low | Low | Small board; measure; move async if needed with "thinking" state |
| D-3 | GitHub Pages outage | Low | Low | Out of our control; app is intermittently unavailable |

### Elevation of privilege

| ID | Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| E-1 | Injected script gains capabilities | Low | High | No `innerHTML` with dynamic data; CSP; no remote scripts |
| E-2 | Contributor gains deploy rights beyond intent | Low | High | Least-privilege repo roles; protected environment for Pages if configured |

## 3. Out-of-scope threats

- Server-side attacks (no server).
- Authentication/session attacks (no auth).
- Multi-tenant data isolation (no tenants).
- Payment, PII, or regulatory data breaches (no such data).
- Native app threats (web only).

## 4. Residual risks

| Risk | Residual level | Acceptance |
|---|---|---|
| GitHub account compromise leading to defacement | Low–Medium | Accepted; mitigated by MFA and branch protection |
| Meta-CSP not honoured uniformly | Low | Accepted; safe coding remains primary control |
| Corrupt save edge cases | Low | Accepted; game restarts cleanly |
| No offline cache (service worker) means no play without first load | Low | Accepted for MVP; revisit if requested |

## 5. Review triggers

Re-run this threat model if any of the following occur:

- Any backend, API, account, or database is added.
- Any third-party script, font, or CDN is introduced.
- A service worker / offline cache is added.
- The app starts storing anything beyond game state.
- The board size or online multiplayer is added.
