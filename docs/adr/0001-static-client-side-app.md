# ADR-0001: Static client-side application

## Status

Accepted — Phase 0.

## Context

demo is a 9×9 Go game for students. It is single-player against a bot, requires no accounts, and stores only non-sensitive local game state. The delivery template defaults to an ASP.NET Core modular monolith with PostgreSQL, Entra ID, and Azure Container Apps, but that default exists to satisfy multi-user governance requirements that do not apply here.

The template also instructs: choose the simplest reversible option, do not add infrastructure for hypothetical scale, and use a modular monolith unless a proven reason exists. For a static, offline-capable single-player game, the simplest option is no server at all.

## Decision

Build demo as a static site of HTML, CSS, and vanilla JavaScript ES modules, hosted on GitHub Pages. All logic runs in the browser. There is no backend, database, authentication, or infrastructure as code.

## Alternatives considered

1. **ASP.NET Core modular monolith** (template default) — satisfies a requirement set this product does not have; adds hosting cost, secrets, CI/CD, and operational burden.
2. **Node/Express with a small backend** — only justified for online multiplayer, accounts, or shared state; none are in scope.
3. **Static site with a build tool (bundler/framework)** — introduces dependencies and a build step without a demonstrated need.

## Consequences

**Positive**

- Zero hosting cost beyond GitHub Pages.
- No servers, databases, secrets, or auth to operate or secure.
- Fully client-side; playable offline after first load (assets cached by browser).
- Tiny attack surface; aligns with privacy goals.
- Simple local development (`python3 -m http.server`).

**Negative / trade-offs**

- No online multiplayer, accounts, or cross-device sync.
- No server-side analytics (intentional).
- All code is public and executable by anyone (acceptable for a game).

## Risks

| Risk | Mitigation |
|---|---|
| Static hosting cannot set custom security headers | Meta CSP; safe coding; documented limitation |
| Scope creep toward server features | Explicit out-of-scope list; ADR required to add backend |
| Large JS logic in one language without types | Pure modules + unit tests; JSDoc where helpful |

## Revisit if

- Online multiplayer, accounts, or shared leaderboards are required.
- Server-side persistence or cross-device sync becomes a requirement.
- An integration requiring secrets or privileged APIs is introduced.
- The app must set HTTP response security headers.
