# demo

A small, interactive **9×9 Go** web app for students. Play against a simple bot, learn the rules, undo mistakes, and resume where you left off — all in the browser.

- Static site: HTML + CSS + vanilla JavaScript
- No accounts, no backend, no tracking
- Progress saved locally in `localStorage`
- Hosted on GitHub Pages

## Status

**MVP implemented.** The playable app, bot, area scoring, local save/resume, rules panel, and keyboard support are in place. Unit tests cover the rules engine, bot, scoring, and persistence. Release hardening (CI workflow, GitHub Pages enablement, release tag) remains; see `docs/implementation-plan.md`.

## Run locally

No build step or dependencies required.

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## Run Remote

<https://blank-look.github.com/demo>

## Test

Rules, bot, and scoring are pure modules tested with Node's built-in runner:

```bash
node --test tests/
```

Requires Node.js 20+.

## Documentation

| Document | Purpose |
|---|---|
| [AGENTS.md](AGENTS.md) | Conventions and working agreement for contributors |
| [docs/product-requirements.md](docs/product-requirements.md) | What the app must do |
| [docs/architecture.md](docs/architecture.md) | How it is structured |
| [docs/data-model.md](docs/data-model.md) | In-memory and saved game state |
| [docs/security-model.md](docs/security-model.md) | Privacy and security posture |
| [docs/threat-model.md](docs/threat-model.md) | STRIDE analysis |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Phases, slices, backlog |
| [docs/assumptions-and-questions.md](docs/assumptions-and-questions.md) | Assumptions and open questions |
| [docs/policy-traceability.md](docs/policy-traceability.md) | Requirement → implementation trace |
| [docs/adr/](docs/adr/) | Architecture decision records |

## Why static?

This is a student learning aid, not a multi-user service. A static site is the simplest reversible option and matches the existing portal hosting model. See [ADR-0001](docs/adr/0001-static-client-side-app.md).

## Licence and data

All content is original and fictional. No real names, identifiers, or organisational data are used.
