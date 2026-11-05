# Policy-to-System Traceability — demo

The delivery template's traceability table normally maps organisational policy to system entities, controls, workflows, and reports. demo has **no organisational policy, roles, workflows, or reports**. This file therefore traces each product requirement to its implementation module, test, and acceptance scenario, plus the security and template principles that apply.

## 1. Requirement traceability

| Req | Requirement summary | Module | Test | Acceptance scenario |
|---|---|---|---|---|
| PR-01 | 9×9 board and star points | `board.js`, `game.js` | render/init test | 1 |
| PR-02 | Alternate Black and White | `game.js` | `game.test.js` turn tests | 2 |
| PR-03 | Capture groups with no liberties | `game.js` | capture tests | 3 |
| PR-04 | Suicide illegal unless capture | `game.js` | suicide tests | 4 |
| PR-05 | Simple ko enforcement | `game.js` | ko tests | 5 |
| PR-06 | Pass; two passes end game | `game.js` | pass/scoring tests | 7 |
| PR-07 | Resign ends game | `game.js` | resign tests | 8 |
| PR-08 | Area scoring | `scoring.js` | scoring tests | 7 |
| PR-09 | Komi 6.5 | `scoring.js` | komi test | 7 |
| PR-10 | Capture counts shown | `app.js`, `board.js` | manual | 3 |
| PR-11 | Click/tap places stone + bot reply | `app.js`, `board.js`, `bot.js` | manual/e2e | 2 |
| PR-12 | Illegal move rejected, state unchanged | `game.js`, `app.js` | illegal-move tests | 4, 5 |
| PR-13 | Last move marked | `board.js` | manual | 2 |
| PR-14 | Turn + captures visible | `app.js`, `board.js` | manual | 1, 2 |
| PR-15 | Undo human + bot | `game.js`, `app.js` | undo tests | 6 |
| PR-16 | New Game resets with confirmation | `app.js`, `storage.js` | manual | 1 |
| PR-17 | Pass available | `app.js`, `game.js` | pass tests | 7 |
| PR-18 | Resign available | `app.js`, `game.js` | resign tests | 8 |
| PR-19 | Rules panel | `index.html`, `app.js` | manual | 1 |
| PR-20 | Bot only legal moves | `bot.js` | bot legality tests | 2 |
| PR-21 | Bot deterministic | `bot.js` | determinism test | 2 |
| PR-22 | Bot approachable, not random | `bot.js` | heuristic tests + manual | 2 |
| PR-23 | Bot does not stall UI | `app.js`, `bot.js` | timing/manual | 2 |
| PR-24 | Auto-save after each move | `storage.js`, `app.js` | storage round-trip | 9 |
| PR-25 | Restore valid save | `storage.js` | load test | 9 |
| PR-26 | Discard invalid save | `storage.js` | malformed-save tests | 10 |
| PR-27 | One save per browser | `storage.js` | key test | 9 |
| PR-28 | No data transmitted | CSP, code review | network check | 12 |
| PR-29 | Keyboard operable controls | `index.html`, `board.js` | manual | 11 |
| PR-30 | Keyboard board navigation | `board.js` | manual | 11 |
| PR-31 | `aria-live` announcements | `app.js` | manual SR check | 11 |
| PR-32 | Responsive 320 px+ | `styles.css` | manual | 11 |
| PR-33 | Distinguishable beyond colour | `board.js`, `styles.css` | manual | 11 |
| PR-34 | WCAG AA contrast | `styles.css` | manual/contrast tool | 11 |

## 2. Security principle traceability

| Principle | Implementation | Verification |
|---|---|---|
| Least privilege | No accounts; static site; no privileged operations | `security-model.md` |
| No secrets | Nothing secret in the app | `git grep` / review |
| Safe input handling | Board coords validated; save data validated | `storage.test.js` |
| No injection | DOM built with `createElement`/`textContent` | code review; lint |
| No exfiltration | No network calls; `connect-src 'none'` | network check; CSP |
| No third-party code | Zero dependencies | review; ADR gate |
| Integrity of deployed code | Branch protection; reviewed PRs | repo settings |
| Privacy | No personal data collection | design + review |

## 3. Delivery-template principle traceability

| Template principle | How demo honours it |
|---|---|
| Keep the architecture simple | Static client-side app; no backend |
| Deterministic behaviour over opaque AI | Deterministic heuristic bot, pure engine |
| Source systems authoritative | Not applicable (no integrations) |
| Role-based governance | Not applicable (no roles/accounts) |
| Phase-based delivery in vertical slices | Phases 1–5, each independently demonstrable |
| Phase 0 first; stop before code | Phase 0 documentation was prepared and accepted before implementation began |
| Definition of done | `AGENTS.md` + implementation plan |
| No secrets / no real data | Fictional content; no data collection |
| Explainability | Rules and bot heuristics are simple and documented |

## 4. Notes on absent template sections

The following template sections do not apply and are intentionally omitted or marked "none":

- Freshservice / Entra / Defender field mappings → `integrations.md` (none).
- Policy-to-system mapping of organisational controls → replaced by requirement traceability above.
- Permissions matrix of application roles → `security-model.md` §7 (no roles).
- AuditEvent / governance workflow → not applicable; move history is the only record.
- Bicep / Key Vault / Azure → not applicable; see ADR-0001.
