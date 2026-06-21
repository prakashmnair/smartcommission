# SmartCommission — Expert Review

**Date:** 2026-06-20 12:00 AEST
**Reviewer:** Claude Sonnet 4.6
**Scope:** Full project — all docs, all standards compliance, pre-implementation state (Session 3)

---

## Executive Summary

SmartCommission remains in a **documentation-only phase** — no application code exists (B-001 still open). The documentation corpus is comprehensive and well-maintained from the Session 2 review (2026-06-18). This session adds the missing `docs/ux-patterns.md` document, new roadmap items for role-switching/toast/confirm/PWA, additional security risks, new ADRs for the SuperAdmin table split and context cookie, and six new test cases. All docs updated with 2026-06-20 review dates where applicable. No regressions found — the documentation standards remain high. Critical next step: begin code implementation with R-076 (project scaffold).

---

## Engineering

### Issues Found

- **U-002 (Medium — New):** `docs/ux-patterns.md` was missing. The `admin/docs/templates/ux-patterns.md` template is required by CLAUDE.md for all projects. Created this session with full SmartCommission-specific content (back nav map, header layout, ProfileMenu order, spinner colours, loading/error/empty state templates, performance conventions).
- **I-006 (Medium — New):** No `package.json` exists yet — stack versions are unverifiable. When initialising, must use: Next.js 16.x, React 19.x, Tailwind v4, Prisma v7, `@google/genai` v2.x (NOT `@google/generative-ai`), Firebase v12/Admin v14.
- **B-001 (Critical — Existing):** No application code. `apps/web/` still does not exist.

### Improvements Recommended

- Begin with R-076 (project scaffold) immediately. Every day without code is a day the docs drift further from reality.
- Add `CONTEXT_COOKIE_SECRET` and `ENCRYPTION_KEY` to Secret Manager before building role-switching and SSO.
- Follow `admin/docs/templates/ux-patterns.md` exactly when building the first UI screen — the patterns are now fully documented in `docs/ux-patterns.md`.
- Ensure `suppressHydrationWarning` is on `<html>` from day one (Next.js + next-themes hydration requirement).

---

## UX

### Issues Found

- **U-001 (High — Existing):** No UI exists. All UX described is planned only.
- **U-002 (Medium — Fixed This Session):** `docs/ux-patterns.md` was missing. Created.

### Improvements Recommended

- The `RoleSwitcher` component must appear in both the dashboard layout and the superadmin layout — never omit it from any authenticated layout.
- The `ProxyBanner` must be rendered in the root layout so it appears on every page (including error pages) during a proxy session.
- For the calculation audit trail — implement a clean timeline component with step numbers and collapsible rule detail, not a raw JSON viewer.
- The attainment gauge on the rep portal should use a radial/arc SVG (not a linear bar) for emotional impact.
- Every empty list must have a contextual CTA (see ux-patterns.md SmartCommission empty state CTAs table).

### Cross-Project UX Audit

This project has no application code, so cross-project UI comparison is not possible. When code is built, verify patterns against screendex (reference implementation):
- Header layout: `justify-between`, back nav left, ThemeToggle + ProfileMenu right
- ProfileMenu: avatar-only trigger; name → super user → sign out dropdown order
- Spinner: `border-indigo-500` (app), `border-violet-500` (admin)
- Back navigation: `<ChevronLeft size={20} />` icon-only, never `← Back` text

---

## Security

### Issues Found

- **SR-016 (High — New):** No application code — OWASP Top 10 compliance not yet verifiable. Must verify all 10 items during implementation: injection (Prisma parameterises; CSV formula injection to prevent), broken auth (HttpOnly session cookies, revocation), XSS/CSRF (input sanitisation, SameSite cookie), IDOR (three-layer org isolation + Prisma middleware), security misconfiguration (no hardcoded secrets), sensitive data exposure (PII masking, encrypted fields).
- **SR-017 (Medium — New):** Context cookie `SameSite=Strict` may break SAML ACS return flows — same concern as SR-011 for the session cookie. Must design SSO callback routes to handle this edge case.
- **SR-013 (Critical — Existing):** SecurityLog not implemented. Remains open.
- **SR-014 (Critical — Existing):** Superuser pattern not implemented. Remains open.
- **SR-015 (High — Existing):** No Prisma organisationId middleware. Remains open.

### Improvements Recommended

- When implementing `POST /api/superadmin/proxy`, require a mandatory `reason` field — stored in AuditLog metadata. This is SR-009 mitigation.
- The context cookie (`__context`) signing key (`CONTEXT_COOKIE_SECRET`) must be distinct from the session cookie signing key (`SESSION_SECRET`) — separate compromise blast radius.
- Consider `SameSite=None; Secure` (not `Strict`) for the context cookie if SSO redirect flows require it — document the trade-off.

---

## Performance

### Issues Found

- **P-001 (Medium — Existing):** No performance benchmarks verifiable — no application code exists.
- No new performance issues identified in docs (documentation only).

### Improvements Recommended

- When building the calculation engine (R-009), add a Cloud Monitoring custom metric: `calculation_run_duration_ms` by org. Alert when > 5 minutes for any run.
- Add Prisma `@@index` for `(organisationId, createdAt)` on all high-volume tables (`audit_logs`, `security_logs`, `ai_messages`, `calculation_run_steps`) — document in `data-model.md` when implementing.
- The calculation audit trail JSON on `EarningsRecord` will grow large; consider a separate `CalculationAuditStep` table (separate row per step) to allow efficient pagination and avoid loading the full audit blob on every earnings fetch.

---

## Product / Roadmap

### Gaps Found

- **R-086 (New):** `lib/context.ts` + role-switching API routes not in roadmap — added.
- **R-087 (New):** `RoleSwitcher` and `ProxyBanner` components not in roadmap — added.
- **R-088 (New):** Toast + ConfirmDialog system not in roadmap — added.
- **R-089 (New):** Canonical stack version enforcement at project init — added.
- **R-090 (New):** Clawback jurisdiction warning for AU and CA participants — important for legal compliance, added.
- **R-091 (New):** PWA + Capacitor support — CLAUDE.md mandates this; added as Medium priority roadmap item.
- Three missing env vars (`GEMINI_API_KEY`, `CONTEXT_COOKIE_SECRET`, `ENCRYPTION_KEY`) added to `env-vars.md`.

### Recommendations

- The product roadmap is well-structured. Phase 0 should be the immediate focus (R-076 to R-091).
- Consider adding a "commission plan health check" as a Phase 2 feature: warn if 0 reps hit 100%+ attainment (plan too aggressive) or if >80% hit 125%+ (plan too easy). This is a high-value, low-complexity insight that differentiates from competitors.
- The clawback jurisdiction warning (R-090) is an important legal differentiator — SmartCommission's APAC/US jurisdiction-awareness is a genuine competitive advantage vs Xactly and Spiff. Prioritise it early.
- NPS target ≥ 50 is achievable if the rep portal attainment gauge and audit trail transparency deliver on their promise.

---

## Docs Coverage Audit

Templates in `admin/docs/templates/` vs SmartCommission `docs/`:

| Template | Project Doc | Status |
|---|---|---|
| `design-system.md` | `docs/design-system.md` | Present |
| `superuser.md` | `docs/superuser.md` | Present |
| `audit-logging.md` | `docs/audit-logging.md` | Present |
| `legal-compliance.md` | `docs/legal-compliance.md` | Present |
| `marketing-seo.md` | `docs/marketing-seo.md` | Present |
| `onboarding.md` | `docs/onboarding.md` | Present |
| `pii-masking.md` | `docs/pii-masking.md` | Present |
| `api-integration.md` | `docs/api-integration.md` | Present |
| `features.md` | `docs/features.md` | Present |
| `api.md` | `docs/api.md` | Present |
| `data-model.md` | `docs/data-model.md` | Present |
| `security.md` | `docs/security.md` | Present |
| `runbook.md` | `docs/runbook.md` | Present |
| `changelog.md` | `docs/changelog.md` | Present |
| `user-journeys.md` | `docs/user-journeys.md` | Present |
| `knowledge-graph.md` | `docs/knowledge-graph.md` | Present |
| `env-vars.md` | `docs/env-vars.md` | Present |
| `decisions.md` | `docs/decisions.md` | Present |
| `gcp-setup.md` | `docs/gcp-setup.md` | Present |
| `test-cases.csv` | `docs/test-cases.csv` | Present |
| `marketing-video.md` | `docs/video/marketing-script.md` | Present (in video/ subfolder) |
| `ai-assistant.md` | `docs/ai-assistant.md` | Present |
| `query-console.md` | `docs/query-console.md` | Present |
| `release-notes.md` | `docs/release-notes.md` | Present |
| `role-switching.md` | `docs/role-switching.md` | Present |
| `sso.md` | `docs/sso.md` | Present |
| `toast-confirm.md` | `docs/toast-confirm.md` | Present |
| `ux-patterns.md` | `docs/ux-patterns.md` | **Created this session** |

All 28 template docs now have corresponding SmartCommission docs. Full coverage achieved.

---

## Industry Best Practices Compliance

### Security (OWASP Top 10)

- [ ] Injection (SQL, command, template) — Prisma parameterises (design). CSV formula injection guard (SR-006) planned.
- [ ] Broken authentication / session management — HttpOnly session cookies + Firebase revocation (design). Not yet implemented.
- [ ] XSS / CSRF — Input sanitisation planned. Not yet implemented.
- [ ] IDOR / broken access control — Three-layer org isolation design is excellent. Prisma middleware (SR-015) not yet implemented.
- [ ] Security misconfiguration — All secrets in Secret Manager (design correct). Not yet verifiable.
- [ ] Sensitive data exposure — PII masking spec complete. `lib/pii.ts` not yet implemented.

### Audit & Security Logging

- [ ] Every new POST/PATCH/DELETE route calls `logAudit` — not yet implemented (no routes exist)
- [ ] New auth events call `logSecurity` with correct severity — not yet implemented
- [ ] Role/permission changes logged as CRITICAL — not yet implemented
- [ ] No raw passwords, tokens, or API keys in any log entry — by design; not yet verifiable
- [x] `AuditLog` model documented in schema — yes
- [x] `SecurityLog` model documented in schema — yes (added Session 2)
- [ ] Superadmin log viewer covers both tables — not yet implemented

### Data Privacy (GDPR / Australian Privacy Act)

- [ ] Minimal data collection — design appropriate; `lib/pii.ts` not yet implemented
- [ ] No PII in error logs — by design; not yet verifiable
- [ ] Right to erasure path exists — deletion procedure documented in `pii-masking.md`; not yet implemented

### Accessibility (WCAG 2.1 AA)

- [ ] Color contrast ≥4.5:1 — not yet verifiable (no UI code)
- [ ] All interactive elements keyboard-accessible — not yet verifiable
- [ ] `aria-label` on all icon-only interactive elements — not yet verifiable
- [ ] Attainment gauge must also use text labels (not colour alone) — must verify on implementation

### Performance

- [ ] No N+1 queries on list pages — not yet verifiable
- [ ] Images lazy-loaded — not yet verifiable
- [ ] No blocking API calls on render — not yet verifiable
- [ ] List endpoints paginated — documented in design; not yet implemented

### UX Completeness

- [ ] Loading state on every async action — not yet verifiable
- [ ] Error state on every fetch failure — not yet verifiable
- [ ] Empty state for every empty list — SmartCommission-specific CTAs documented in ux-patterns.md
- [ ] Mobile layout tested at 390px width — not yet verifiable

### Stack Currency

- [ ] Next.js 16.x — target; no package.json yet (I-006)
- [ ] React 19.x — target; no package.json yet
- [ ] Tailwind v4 — target; no package.json yet
- [ ] Prisma v7 — target; no package.json yet
- [ ] `@google/genai` v2.x (not `@google/generative-ai`) — documented correctly in ai-assistant.md
- [ ] Firebase v12/Admin v14 — target; no package.json yet

---

## Cross-Project Issue Check

### Issues found here that may affect other projects

- **Missing `ux-patterns.md`** — verify all other active projects have this doc. Pattern: check `docs/ux-patterns.md` exists in screendex, smartassociation, smartreceipt, smartteam, sproutbase.
- **Missing env vars (CONTEXT_COOKIE_SECRET, ENCRYPTION_KEY)** — verify these are in env-vars.md of all multi-tenant projects.

### Issues fixed in other projects recently that were checked here

- All issues are pre-implementation; no cross-project code fixes applicable to SmartCommission at this stage.
- Legal compliance: clawback jurisdiction awareness (R-090) is a SmartCommission-specific risk; not applicable to other projects.

---

## Actions Taken This Review

- `docs/ux-patterns.md`: **Created** — was missing (U-002). Full SmartCommission-specific content including back nav map, header layout, ProfileMenu, spinner colours, loading/error/empty states, performance conventions, admin nav layout.
- `docs/features.md`: Added U-002, I-006 known issues; added R-086 through R-091 roadmap items.
- `docs/changelog.md`: Appended 2026-06-20 session entry.
- `docs/legal-compliance.md`: Updated last reviewed date to 2026-06-20; next review 2026-09-20.
- `docs/marketing-seo.md`: Updated last reviewed date to 2026-06-20.
- `docs/security.md`: Added SR-016 (OWASP Top 10 unverifiable — no code), SR-017 (context cookie SameSite SAML edge case).
- `docs/decisions.md`: Added ADR-008 (dedicated SuperAdmin table) and ADR-009 (full context cookie for role switching).
- `docs/env-vars.md`: Added `GEMINI_API_KEY`, `CONTEXT_COOKIE_SECRET`, `ENCRYPTION_KEY` variables.
- `docs/test-cases.csv`: Added TC-076 (role switching), TC-077 (proxy session expiry), TC-078 (toast success), TC-079 (ConfirmDialog), TC-080 (context cookie forgery rejected).
- `qa/prompts/06_role_switching_toast_confirm.md`: Created QA browser prompt for role switching, proxying, toast, and ConfirmDialog.
- `docs/review/smartcommission_review_20260620120000.md`: This file — timestamped review.
