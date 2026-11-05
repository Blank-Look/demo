# Integrations — demo

## Summary

**None.** demo has no external integrations.

| Integration | Status | Notes |
|---|---|---|
| Freshservice | Not used | No service-management or CMDB dependency |
| Microsoft Entra ID | Not used | No accounts, sign-in, or roles |
| Microsoft Defender | Not used | No security telemetry source |
| Microsoft Graph | Not used | No directory or mail access |
| Databases | Not used | State lives in the browser |
| Analytics / telemetry | Not used | No tracking of students |
| Third-party scripts/fonts/CDNs | Not used | Everything is served with the app |

## Rationale

The product is a single-player learning aid with no shared state, no organisational data, and no server component. Integrating external systems would add permissions, secrets, privacy obligations, and operational burden without serving the product objective.

This is a deliberate departure from the delivery template's integration phases (Freshservice, Entra, Defender), which apply to the Asset Governance Manager and similar enterprise tools, not to this project.

## If integrations are ever proposed

Any future integration must:

1. Have a documented product need in `product-requirements.md`.
2. Be added via an ADR covering data flow, permissions, privacy, and failure handling.
3. Default to read-only and least privilege.
4. Never send student data off-device without explicit, documented consent and a lawful basis.
5. Keep the app fully usable offline if the integration is unavailable.

Until then, this file intentionally records the absence of integrations.
