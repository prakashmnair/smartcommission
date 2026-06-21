# SmartCommission — Expert Review

**Date:** 2026-06-20 14:00 AEST
**Reviewer:** Claude Sonnet 4.6
**Scope:** Full docs, cross-project checks, GCP logs attempt, docs coverage audit

---

## Executive Summary

SmartCommission is a documentation-only project in pre-implementation Phase 0. No application code exists yet (B-001). The documentation suite is comprehensive and well-structured, with 27 docs covering the full canonical template set. The primary concerns are: (1) the GCP project `smartcommission-prod` does not exist and must be provisioned before any production testing; (2) the AuditLog schema in `data-model.md` deviates from the canonical `audit-logging.md` template and must be reconciled before Prisma implementation; (3) missing Prisma models for `SuperAdmin`, `SsoConfig`, `ReleaseNote`, `AiSession/AiMessage`, `SavedQuery/QueryRun` need to be added to `data-model.md`; (4) AI assistant must use `@google/genai` v2.x and `gemini-2.5-flash` — a cross-project error in SmartTeam using the wrong SDK was found and logged.

---

## Engineering

### Issues Found

- **I-007 (Medium):** GCP project `smartcommission-prod` does not exist. `gcloud logging read` returned `USER_PROJECT_DENIED` — project was never created. All GCP infrastructure (Cloud Run, Cloud SQL, Firebase, Cloud Storage, Cloud Tasks, Secret Manager) is unprovisioned. This blocks all production testing, log auditing, and Cloud Run deployment.
- **D-003 (Medium):** `data-model.md` AuditLog schema uses draft field names (`actorId`, `actorEmail`, `actionType`, `oldValue`, `newValue`) that differ from the canonical template in `audit-logging.md` (`userId`, `userEmail`, `action`, `changes`, `outcome`, `tenantId`). Must be reconciled before Prisma schema is written.
- **D-004 (Medium):** `data-model.md` is missing Prisma models for: `SuperAdmin`, `SsoConfig`, `ReleaseNote`, `AiSession`, `AiMessage`, `SavedQuery`, `QueryRun`. These are documented in their feature docs but the central ER diagram and tables section don't include them.
- **S-005 (Medium):** Cross-project check — SmartTeam initial scaffold used `@google/generative-ai` (wrong SDK). SmartCommission must use `@google/genai` v2.x at project init. Logged as S-005 to ensure it is caught at R-076 (project scaffold).
- **SR-019 (Critical):** No production environment exists — all security controls are design-only. Zero application code means zero verifiable security. Must verify every OWASP Top 10 control during implementation phase.

### Improvements Recommended

- Add `SuperAdmin`, `SsoConfig`, `ReleaseNote`, `AiSession/AiMessage`, `SavedQuery/QueryRun` to the ER diagram in `data-model.md` (added as text description in this session; full Mermaid ER update deferred to when Prisma schema is created).
- Align `data-model.md` AuditLog/SecurityLog field names with `audit-logging.md` canonical schema at Prisma implementation time (R-092).
- Create `docs/video/storyboard.md` — done in this session.

---

## UX

### Issues Found

- **U-003 (Low):** `docs/video/` was missing `storyboard.md`. Script and voiceover.txt existed but no visual production guide. Fixed: created `docs/video/storyboard.md` in this session.
- **U-001 (High, existing):** No application UI built. All UX patterns are documented and ready for implementation. See `ux-patterns.md` for canonical patterns that must be applied from the first screen.

### Improvements Recommended

- When `apps/web/` is created (R-076), enforce ThemeToggle at `fixed top-4 right-4 z-50` in root `app/layout.tsx` from day one — cross-project check: Sproutbase (2026-06-20) had to fix this retroactively (their U-16).
- Ensure `suppressHydrationWarning` on `<html>` tag is in the first commit.
- No `min-h-screen` — use `min-h-dvh` throughout (iOS Safari issue).

---

## Security

### Issues Found

- **SR-018 (High, new):** Risk that wrong AI SDK could expose API key in client bundle. `@google/genai` v2.x import must be server-only. Cross-project warning from SmartTeam's initial scaffold error.
- **SR-019 (Critical, new):** No production environment — zero ability to verify any security control. All mitigations are theoretical.
- All 17 previously documented security risks (SR-001 through SR-017) remain Open with no code to verify mitigations.

### Improvements Recommended

- Add ESLint rule at project init to flag any `GEMINI_API_KEY` or `FIREBASE_PRIVATE_KEY` in files under `public/` or any `NEXT_PUBLIC_` prefix.
- Consider using `server-only` package import guard on all lib/ files that handle secrets.

---

## Performance

### Issues Found

- **P-001 (Medium, existing):** No benchmarks verifiable without code.
- Design-level observations (must be enforced at implementation):
  - All `findMany` must have `take` from the first query written (cross-project: SmartReceipt found 2026-06-20 had unbounded queries).
  - All semi-static GET routes must have `Cache-Control` headers.
  - Heavy components (AiAssistant, Monaco, chart libs) must use `next/dynamic({ ssr: false })` — never static imports.
  - All independent DB queries must use `Promise.all`.

### Improvements Recommended

- Create a code review checklist (in `runbook.md` or `decisions.md`) that mandates these performance checks on every PR before code is written.

---

## Product / Roadmap

### Gaps Found

- R-092: Data model AuditLog reconciliation needed before Prisma implementation.
- R-093: Missing planned models need to be documented in ER diagram.
- R-094: Video storyboard was missing — now created.

### Recommendations

- Prioritise R-076 (project scaffold) → R-077 (superuser) → R-079 (audit/security logging) → R-080 (PII masking) → R-082 (GCP infra) as the critical path.
- The GCP project must be created (R-082) before any deployment or testing is possible.
- Legal docs (R-083) and DPA signing (R-084) should be initiated now — they don't depend on code.

---

## Industry Best Practices Compliance

### Security (OWASP Top 10)

- [ ] Injection — design calls for parameterised Prisma queries + `query-safe.ts` allowlist. Not yet implemented.
- [ ] Broken authentication — Firebase Auth + session cookies planned. Not yet implemented.
- [ ] XSS / CSRF — server-side session, HttpOnly cookies, SameSite=Strict planned. Not yet implemented.
- [ ] IDOR — org-scoped queries + RLS planned. Not yet implemented.
- [ ] Security misconfiguration — all configs are design specs. Not yet tested.
- [ ] Sensitive data exposure — PII masking lib planned (`pii.ts`). Not yet implemented.

### Audit & Security Logging

- [ ] Every new POST/PATCH/DELETE route calls `logAudit` — not applicable yet (no routes)
- [ ] New auth events call `logSecurity` with correct severity — not applicable yet
- [ ] Role/permission changes logged as CRITICAL — not applicable yet
- [x] `AuditLog` and `SecurityLog` schemas documented in `data-model.md` and `audit-logging.md`
- [ ] Superadmin log viewer — not applicable yet

### Data Privacy (GDPR / Australian Privacy Act)

- [x] `legal-compliance.md` up to date; last reviewed 2026-06-20
- [x] China geo-blocked (PIPL)
- [ ] DPAs with sub-processors not yet signed (R-084)
- [ ] Privacy Policy not yet published (R-083)
- [ ] Cookie consent banner not yet implemented (R-085)

### Accessibility (WCAG 2.1 AA)

- [ ] Not testable — no application code exists (A-001)

### Performance

- [ ] Not testable — no application code exists (P-001)

### UX Completeness

- [ ] Not testable — no application code exists (U-001)

---

## Docs Coverage Audit

Template files in `admin/docs/templates/` (excluding README.md and review.md):

| Template | SmartCommission Doc | Status |
|---|---|---|
| `ai-assistant.md` | `docs/ai-assistant.md` | Exists — comprehensive |
| `api-integration.md` | `docs/api-integration.md` | Exists — comprehensive |
| `api.md` | `docs/api.md` | Exists |
| `audit-logging.md` | `docs/audit-logging.md` | Exists — comprehensive |
| `changelog.md` | `docs/changelog.md` | Exists |
| `data-model.md` | `docs/data-model.md` | Exists — D-003 / D-004 schema gaps noted |
| `decisions.md` | `docs/decisions.md` | Exists — 7 ADRs |
| `design-system.md` | `docs/design-system.md` | Exists |
| `env-vars.md` | `docs/env-vars.md` | Exists |
| `features.md` | `docs/features.md` | Exists — updated this session |
| `gcp-setup.md` | `docs/gcp-setup.md` | Exists |
| `knowledge-graph.md` | `docs/knowledge-graph.md` | Exists |
| `legal-compliance.md` | `docs/legal-compliance.md` | Exists — reviewed 2026-06-20 |
| `marketing-seo.md` | `docs/marketing-seo.md` | Exists |
| `marketing-video.md` | `docs/video/marketing-script.md` + `voiceover.txt` | Exists; storyboard added this session |
| `onboarding.md` | `docs/onboarding.md` | Exists |
| `pii-masking.md` | `docs/pii-masking.md` | Exists |
| `query-console.md` | `docs/query-console.md` | Exists |
| `release-notes.md` | `docs/release-notes.md` | Exists |
| `role-switching.md` | `docs/role-switching.md` | Exists |
| `runbook.md` | `docs/runbook.md` | Exists |
| `security.md` | `docs/security.md` | Exists — SR-018, SR-019 added |
| `sso.md` | `docs/sso.md` | Exists |
| `superuser.md` | `docs/superuser.md` | Exists |
| `test-cases.csv` | `docs/test-cases.csv` | Exists — 75 test cases |
| `toast-confirm.md` | `docs/toast-confirm.md` | Exists |
| `user-journeys.md` | `docs/user-journeys.md` | Exists |
| `ux-patterns.md` | `docs/ux-patterns.md` | Exists — created 2026-06-20 |

**Docs coverage: 100% (all template docs present)**

---

## Cross-Project Issue Check

Issues found here that may affect other projects:

- **Schema field name drift** — If any other project has a `data-model.md` that differs from `audit-logging.md` canonical schema, it should be reconciled the same way as D-003.

Issues fixed in other projects recently that were checked here:

- **Sproutbase U-16 (2026-06-20):** `ThemeProvider` missing from `app/layout.tsx`, `ThemeToggle` absent — SmartCommission docs note this as a must-fix from day one of implementation.
- **SmartReceipt P-06 (2026-06-20):** Unbounded `findMany` without `take` — SmartCommission docs already include this in `ux-patterns.md` as a mandatory performance convention.
- **SmartTeam AI SDK error:** Used `@google/generative-ai` instead of `@google/genai` — logged as S-005 in SmartCommission `features.md`.
- **SmartAssociation/Screendex spinner colour fix (2026-06-18):** Confirmed SmartCommission's `ux-patterns.md` already specifies indigo for app spinners, violet for admin — consistent.

---

## GCP Logs Audit

- **`gcloud logging read`:** Returned `USER_PROJECT_DENIED` — project `smartcommission-prod` does not exist.
- **`gcloud beta error-reporting events list`:** Command requires interactive beta install prompt; not available in non-interactive session.
- **Conclusion:** No GCP infrastructure provisioned. No logs available. I-007 logged.

---

## Stack Version Audit

No `package.json` exists. Cannot verify versions. When created (R-076), must use:

| Dependency | Required version |
|---|---|
| `next` | 16.x |
| `react` | 19.x |
| `tailwindcss` | v4 |
| `prisma` | v7 |
| `@google/genai` | v2.x (NOT `@google/generative-ai`) |
| `firebase` | v12 |
| `firebase-admin` | v14 |
| `next-themes` | latest |
| `lucide-react` | latest |
| `@monaco-editor/react` | latest |
| `papaparse` | latest |

---

## Actions Taken This Review

- `features.md`: Added I-007, D-003, D-004, S-005, S-006, U-003, R-092, R-093, R-094
- `changelog.md`: Added Session 4 entry with cross-project findings
- `security.md`: Added SR-018, SR-019
- `ai-assistant.md`: Clarified model name (`gemini-2.5-flash`) and SDK warning
- `data-model.md`: Added "Additional Models (Planned)" section; added schema alignment note (D-003)
- `legal-compliance.md`: Updated last reviewed date to Session 4
- `docs/video/storyboard.md`: Created — 8-scene visual production guide (U-003 resolved)
- `docs/review/smartcommission_review_20260620140000.md`: This file
- All other docs: Reviewed and confirmed accurate — no changes required
