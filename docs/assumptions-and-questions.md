# Assumptions and Questions — demo

## 1. Confirmed requirements

Confirmed by the product owner during Phase 0:

| # | Requirement |
|---|---|
| C-1 | The app is for students. |
| C-2 | It is an interactive 9×9 Go game. |
| C-3 | The opponent is a bot only (no hotseat or online multiplayer). |
| C-4 | No accounts; local save only. |
| C-5 | Stack: static HTML/CSS/JS hosted on GitHub Pages. |
| C-6 | Project name: `demo`. |
| C-7 | Deliver Phase 0 documentation first; implementation starts only after review. |

## 2. Material assumptions

These are the simplest reversible options. Each is documented so it can be challenged.

| # | Assumption | Why | Reversible? |
|---|---|---|---|
| A-1 | The student plays Black and moves first. | Conventional for teaching games. | Yes — a setting or a simple swap. |
| A-2 | Komi is 6.5 to White. | Standard small-board komi; avoids draws. | Yes — constant in `scoring.js`. |
| A-3 | Scoring is Chinese/area scoring. | Simpler to compute correctly than Japanese, and forgiving for beginners. | Yes — isolated in `scoring.js`. |
| A-4 | The MVP does not resolve dead stones or life-and-death; a scored game assumes both sides agree, or a player resigns. | Full life-and-death is out of scope for a simple learning app. | Yes — later phase can add marking. |
| A-5 | Simple ko (previous position), not full positional superko. | Sufficient for 9×9 teaching; simpler and testable. | Yes — hash check can expand. |
| A-6 | Display coordinates skip the letter I (`A–J`, rows 9–1). | Common Go convention. | Yes — display only. |
| A-7 | The bot is a deterministic heuristic opponent, not MCTS/neural. | Approachable, explainable, testable, no dependencies. | Yes — `bot.js` behind one function. |
| A-8 | There is a single saved game per browser. | "Resume where you left off" without accounts. | Yes — key can become a list. |
| A-9 | The app is English-only. | Single locale for MVP. | Yes — copy externalised later if needed. |
| A-10 | No service worker/offline install in MVP. | Keeps deploy simple; play works after first load. | Yes — can add later with an ADR. |
| A-11 | The repo is deployed from the repository root on GitHub Pages. | Matches the static layout. | Yes — could move to `/docs` if the repo grows. |
| A-12 | "demo" is an anonymised project name; no real organisational initials appear in UI copy. | Anonymity. | Yes — copy change. |
| A-13 | No third-party fonts, scripts, or analytics. | Privacy, security, and simplicity. | Yes — but requires an ADR + threat-model review. |
| A-14 | Target browsers are current evergreen versions with ES-module support. | Reasonable for students in 2026. | Yes — add a transpile step if legacy support is required. |
| A-15 | The board size is fixed at 9×9. | Core requirement. | Yes — but 13×13/19×19 is out of scope now. |

## 3. Open questions

Only questions that would materially change a secure or correct design. None block Phase 0; defaults above apply until answered.

| # | Question | Default if unanswered | Blocks? |
|---|---|---|---|
| Q-2 | Should the bot have selectable difficulty (easy/medium)? | Single approachable level. | No |
| Q-3 | Is a hint/liberties overlay desirable for teaching? | Include if cheap in Phase 3; otherwise defer. | No |
| Q-4 | Should the app support 13×13 or 19×19 later? | No; design keeps `size` as a parameter where free. | No |
| Q-5 | Does "students" imply specific branding to match? | Use a restrained style; no organisational claims. | No |
| Q-6 | Is offline install (PWA) wanted? | No service worker in MVP. | No |

If any answer contradicts an assumption, update this file, `product-requirements.md`, and the relevant ADR before implementation.

## 4. Top delivery risks

1. **Rules correctness** — ko, suicide, and capture interplay are easy to get subtly wrong. Mitigation: pure engine and exhaustive tests before UI.
2. **Bot legality and speed** — a bot that plays illegal moves or freezes the page ruins the lesson. Mitigation: reuse the engine for legality; benchmark; async if needed.
3. **Scoring expectations** — beginners may expect dead stones removed. Mitigation: explain area scoring and the MVP limitation in the result panel.
4. **Accessibility** — a click-only board excludes keyboard users. Mitigation: keyboard/ARIA acceptance criteria in Phase 3.
5. **Scope creep** — multiplayer, larger boards, SGF, strong AI. Mitigation: explicit out-of-scope list; ADR required to add.
6. **Over-engineering** — recreating the enterprise template's infrastructure. Mitigation: static stack; document deviations.
7. **Data leakage** — a well-meaning addition of analytics or a CDN. Mitigation: no-network definition of done; `connect-src 'none'`.
8. **Persist/restore bugs** — corrupt save crashes the app. Mitigation: strict validation and discard-on-error.
9. **Mobile usability** — a 9×9 board can become cramped. Mitigation: responsive SVG and tested breakpoints.
10. **Maintenance drift** — docs and code diverge. Mitigation: update docs in the same PR; Definition of Done includes docs.

## 5. What Phase 0 deliberately did not do

- No application HTML/CSS/JS was written.
- No infrastructure, secrets, or deployment configuration was created.
- No external service was contacted.
- No organisational policy was invented.

Implementation begins only after this plan and architecture are reviewed.
