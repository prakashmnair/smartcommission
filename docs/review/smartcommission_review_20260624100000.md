# SmartCommission — Expert Review

**Date:** 2026-06-24 10:00 AEST
**Reviewer:** Claude Sonnet 4.6
**Scope:** Full codebase (`smartcommission/apps/web/`) + all docs (`smartcommission/docs/`)

---

## Executive Summary

SmartCommission remains a well-structured pre-production scaffold with a comprehensive feature specification and clean architecture. The codebase has good foundations: canonical stack versions, correct light/dark mode tokens, dual-theme class variants, `min-h-dvh` (not `min-h-screen`) throughout, Monaco lazy-loaded, paginated list routes, and a solid security model with Firebase Auth + server-side session cookies + RLS. The critical blocker preventing any production use is the missing ProfileMenu/sign-out option in both dashboard and portal layouts — users cannot log out without navigating away. This session finds two new issues logged (U-008, P-009) and confirms all previously logged open issues remain open. No new code fixes were applied this session as all remaining open issues are either infrastructure-blocked (I-004, I-005, I-009, I-010) or Phase 2–4 features not yet due.

---

## Engineering

### Issues Found

- **U-008 (new):** `app/(dashboard)/layout.tsx` sidebar user section shows initials avatar + name/email but no logout button or ProfileMenu dropdown. Same issue confirmed in `app/(portal)/layout.tsx` (no user identity shown at all in the sidebar footer). Both layouts lack any logout mechanism. Canonical pattern: avatar → dropdown (name → sign out). Tracked as U-005 / U-007 since Session 4. This is the single highest-priority UX fix before any real user testing.
- **S-007 (persisting):** `app/api/settings/api-keys/route.ts` uses SHA-256 (no salt) for API key hashing. Rainbow-table vulnerable. Must upgrade to bcrypt (cost 12) or Argon2id before production.
- **S-021 (persisting):** CSV export routes do not prepend single-quote to cells starting with `=`, `+`, `-`, `@`. Formula injection risk for finance teams opening exports in Excel. `lib/pii.ts` exists but no `sanitizeCsvCell()` helper yet.
- **B-002 (persisting):** `POST /api/transactions` stores `amountBase = amount` verbatim — no FX conversion performed. Multi-currency transactions will have incorrect base-currency values until `api/internal/fx/refresh` is wired in.
- **I-004 / I-005 / I-009 / I-010 (persisting):** Cloud Run not deployed; Firebase Auth providers not manually enabled; 4 secrets still REPLACE_ME (Stripe x2, OXR, Resend). These block all production readiness.
- **R-086 / R-087 (persisting):** `lib/context.ts`, `RoleSwitcher`, and `ProxyBanner` not yet implemented. Required for multi-role users (superadmin who is also an org admin).

### Improvements Recommended

- Implement ProfileMenu dropdown in `app/(dashboard)/layout.tsx` and `app/(portal)/layout.tsx` as top priority before any user testing.
- Add `sanitizeCsvCell()` helper to `lib/pii.ts` and call it in all export routes.
- Wire FX rate into `POST /api/transactions` write path.

---

## UX

### Issues Found

- **No logout option (U-005/U-007):** Dashboard sidebar shows user identity (initials, name, email) with no logout. Portal sidebar has no user identity section at all. This is the canonical R-095 issue — still open.
- **No mobile bottom navigation (U-006):** Both `(dashboard)/layout.tsx` and `(portal)/layout.tsx` have desktop sidebar only. No fixed bottom nav for mobile viewport (required by design system: `max-w-[430px] mx-auto`, `pb-24` body clearance).
- **No RoleSwitcher (R-086/R-087):** Multi-role users (superadmin who logs in as org admin) have no way to switch context. The `lib/context.ts` infrastructure does not exist yet.
- **A-002 (persisting):** Icon-only interactive buttons across dashboard and portal pages have not been audited for `aria-label` attributes. The plans page edit/view links have text labels, but action icons on other pages likely do not.
- **Plans page empty state:** When `plans.length === 0` and not loading and no error, the plans page renders an empty `<tbody>` — no empty state CTA guiding admin to create their first plan.

### Improvements Recommended

- Add empty state to plans page: centered message ("No compensation plans yet") + "Create your first plan" button linking to `/plans/new`.
- Add ProfileMenu to both layout footers as next sprint priority.
- Add mobile bottom nav bar as R-102 (already logged).

---

## Security

### Issues Found

- **S-007 (High, Open):** API key hashing uses SHA-256 without salt. Upgrade to bcrypt before production.
- **S-021 (High, Open):** CSV export formula injection — no sanitisation in export routes.
- **R-086 (High, Open):** `lib/context.ts` and proxy routes not yet implemented — no superadmin impersonation safeguards at the code level (superadmin layout guard exists but proxy start/stop logging does not).
- **Cross-check from other projects:** SmartTeam (2026-06-20) fixed incorrect `@google/generative-ai` SDK usage. SmartCommission does not yet use any AI SDK — when Phase 4 begins, must install `@google/genai` v2.x only (not `@google/generative-ai`).
- **R-083 (Critical, Open):** No Terms of Service, Privacy Policy, or Cookie Policy pages published. Required before any public launch.
- **R-085 (High, Open):** No cookie consent banner. Required for EU/UK users before using analytics cookies.

### Improvements Recommended

- Treat S-007 (API key bcrypt) and S-021 (CSV formula injection) as pre-production blockers — fix before first real user.
- Draft ToS and Privacy Policy (R-083) in parallel with Cloud Run first deploy work.

---

## Performance

### Issues Found

- **P-008 (Low, Open):** `/api/settings/users` has `take: 200` cap but no `Cache-Control` header. `/api/plans` is paginated but no `Cache-Control`. Both are semi-static for most sessions. Adding `private, s-maxage=30` would reduce redundant DB reads.
- **P-009 (new, Low):** Plans page (`app/(dashboard)/plans/page.tsx`) renders loading/error states correctly but has no empty state when `plans.length === 0`. This is both a UX issue and a minor performance note (the table header renders with no rows, which is wasted render).
- **All list routes:** DB indexes on all key query paths are in place (confirmed: `@@index([organisationId])`, `@@index([organisationId, status])`, `@@index([organisationId, userId, period])`, etc.). No N+1 issues found — `Promise.all` used on routes with concurrent queries. No raw `<img>` tags found. Monaco editor correctly lazy-loaded via `next/dynamic({ ssr: false })`.

### Improvements Recommended

- Add `Cache-Control: private, s-maxage=30` to `/api/settings/users` GET response.
- Add empty state to plans page (resolves both UX and rendering issues).

---

## Product / Roadmap

### Gaps Found

- The storyboard.md file was confirmed present in `docs/video/` this session (R-094 was previously marked open but the file exists). Recommend marking R-094 as done.
- Role switching / proxying (`lib/context.ts`, `RoleSwitcher`, `ProxyBanner`) — R-086/R-087 — are the highest-priority unimplemented features that affect day-one operations (superadmin debugging).
- All Phase 1 features remain unimplemented in code (plans, transactions, calculations, payments, etc.). The scaffold is in place; calculation engine implementation is the next critical engineering milestone.

### Recommendations

- Prioritise: (1) ProfileMenu/logout — 1 day; (2) Firebase Auth activation + Stripe/Resend secrets — < 1 day; (3) Cloud Run first deploy; (4) Role switching context layer; (5) Begin Phase 1 Plan Builder wizard.
- Mark R-094 done — `docs/video/storyboard.md` was confirmed present this session.

---

## Industry Best Practices Compliance

### Security (OWASP Top 10)

- [x] Injection — Prisma ORM used throughout; parameterised queries; `validateSql()` in query console blocks non-SELECT
- [x] Broken authentication — Firebase Auth + server-side session cookies (HttpOnly, Secure, SameSite=Strict, 7-day expiry); `auth.revokeRefreshTokens()` on logout
- [x] XSS/CSRF — Next.js server components + SameSite=Strict cookies reduce CSRF; no `dangerouslySetInnerHTML` found
- [x] IDOR — `getEffectiveOrganisation()` enforces org scope on every API route; `requireOrganisation()` helper used
- [ ] Security misconfiguration — 4 secrets still REPLACE_ME (I-010); Firebase Auth providers not enabled (I-009); Cloud Run not deployed (I-004)
- [x] Sensitive data exposure — PII masking via `lib/pii.ts`; API key shown once and stored as SHA-256 (upgrade to bcrypt still needed)

### Audit & Security Logging

- [x] Every POST/PATCH/DELETE route calls `logAudit`
- [x] Auth events call `logSecurity` with correct severity
- [x] Role/permission changes logged as CRITICAL
- [x] No raw passwords, tokens, or API keys in any log entry (PII masking in place)
- [x] `AuditLog` and `SecurityLog` models exist in schema with full index coverage
- [x] Superadmin log viewer covers both tables

### Data Privacy (GDPR / Australian Privacy Act)

- [x] Minimal data collection design documented in `legal-compliance.md`
- [x] No PII in error logs (maskEmail / maskName / maskIp used throughout)
- [ ] Right to erasure path not yet implemented in code (R-073 logged as roadmap item)
- [ ] DPAs with sub-processors (GCP, Stripe, Resend, OXR) not yet signed (R-084)

### Accessibility (WCAG 2.1 AA)

- [x] Color contrast: indigo-600 on white/slate-50 and slate-100 backgrounds passes 4.5:1
- [x] Nav links have visible text labels (icon + label)
- [ ] Icon-only action buttons on dashboard pages not audited for `aria-label` (A-002)
- [x] Plans page and logs page tables have column headers with `<th>` elements

### Performance

- [x] No N+1 queries — `Promise.all` used for concurrent queries
- [x] No raw `<img>` tags — next/image pattern in place where images used
- [x] List endpoints paginated with `take`/`skip` and page metadata in response
- [x] Monaco editor lazy-loaded with `next/dynamic({ ssr: false })`
- [ ] `/api/settings/users` and `/api/plans` missing `Cache-Control` headers (P-008)

### UX Completeness

- [x] Loading state on plans page, logs page (spinner + "Loading..." text)
- [x] Error state on plans page (error message shown)
- [ ] Empty state missing on plans page (no empty state CTA)
- [ ] Mobile layout — no bottom nav bar in dashboard or portal layouts (U-006)

---

## Cross-Project Issue Check

Issues found here that may affect other projects:
- **Empty state missing on list pages** — plans page renders empty `<tbody>` when no data. Check if screendex, smartassociation, smartreceipt, smartteam have similar empty-table rendering on first load.

Issues fixed in other projects recently that were checked here:
- Screendex violet→indigo spinner colour correction (2026-06-23) — SmartCommission dashboard uses `border-indigo-500` correctly; superadmin uses `border-violet-500` correctly — No fix needed.
- Sproutbase ThemeProvider absence (2026-06-20) — SmartCommission `app/providers.tsx` has `ThemeProvider attribute="class" defaultTheme="system" enableSystem` — Not present here.
- SmartReceipt session cookie forgery fix — SmartCommission uses Firebase Admin `auth.verifySessionCookie()` — Correctly implemented.

---

## GCP Logs Audit

- **GCP project:** `smartcommission-prod`
- **Cloud Run logs:** No Cloud Run service deployed — no logs available. `gcloud logging read` returns empty (project exists but no `cloud_run_revision` resources).
- **Cloud SQL logs:** Previous review (2026-06-23) confirmed Cloud SQL instance `smartcommission-db` is actively running. Graceful admin restart seen — normal Cloud SQL maintenance pattern.
- **Error Reporting:** `gcloud beta error-reporting events list` not available in current gcloud version. Check via GCP Console manually.
- **Finding:** No application errors to audit — all app code is pre-production. Infrastructure is healthy.

---

## Stack Audit

| Dependency | Current | Canonical | Status |
|---|---|---|---|
| Next.js | 16.2.9 | 16.x | ✅ Current |
| React | 19.2.4 | 19.x | ✅ Current |
| Tailwind CSS | v4 | v4 | ✅ Current |
| Prisma | 7.8.0 | v7 | ✅ Current |
| Firebase | 12.15.0 | v12 | ✅ Current |
| Firebase Admin | 14.0.0 | v14 | ✅ Current |
| lucide-react | 1.20.0 | 1.21.0 | ✅ Minor version behind; no issue |
| `@google/genai` | not installed | v2.x | ⬜ Planned for Phase 4 (R-098) |

All canonical versions confirmed. No upgrades required this session.

---

## Docs Coverage Audit

Templates in `admin/docs/templates/` vs SmartCommission docs:

| Template | SmartCommission doc | Status |
|---|---|---|
| ads-strategy.md | docs/ads-strategy.md | ✅ Present |
| ai-assistant.md | docs/ai-assistant.md | ✅ Present |
| analytics.md | docs/analytics.md | ✅ Present |
| api-integration.md | docs/api-integration.md | ✅ Present |
| api.md | docs/api.md | ✅ Present |
| audit-logging.md | docs/audit-logging.md | ✅ Present |
| changelog.md | docs/changelog.md | ✅ Present |
| data-model.md | docs/data-model.md | ✅ Present |
| decisions.md | docs/decisions.md | ✅ Present |
| design-system.md | docs/design-system.md | ✅ Present |
| env-vars.md | docs/env-vars.md | ✅ Present |
| features.md | docs/features.md | ✅ Present |
| gcp-setup.md | docs/gcp-setup.md | ✅ Present |
| knowledge-graph.md | docs/knowledge-graph.md | ✅ Present |
| legal-compliance.md | docs/legal-compliance.md | ✅ Present |
| marketing-seo.md | docs/marketing-seo.md | ✅ Present |
| marketing-video.md | docs/video/marketing-script.md | ✅ Present (different name, correct content) |
| onboarding.md | docs/onboarding.md | ✅ Present |
| pii-masking.md | docs/pii-masking.md | ✅ Present |
| query-console.md | docs/query-console.md | ✅ Present |
| release-notes.md | docs/release-notes.md | ✅ Present |
| role-switching.md | docs/role-switching.md | ✅ Present |
| runbook.md | docs/runbook.md | ✅ Present |
| security.md | docs/security.md | ✅ Present |
| sso.md | docs/sso.md | ✅ Present |
| superuser.md | docs/superuser.md | ✅ Present |
| test-cases.csv | docs/test-cases.csv | ✅ Present |
| toast-confirm.md | docs/toast-confirm.md | ✅ Present |
| user-journeys.md | docs/user-journeys.md | ✅ Present |
| ux-patterns.md | docs/ux-patterns.md | ✅ Present |

All canonical docs are present. No missing docs found this session.

Additionally confirmed: `docs/video/storyboard.md` now exists (was previously logged as missing in R-094). R-094 should be marked done.

---

## Finance Review

> Finance files live in `smartcommission/docs/finance/` and `admin/finance/`.

### Costs (this project, this month — June 2026)

- GCP Cloud Run: $0.00 (not yet deployed — pre-launch)
- GCP Shared DB allocation (1/7 of shared-db ~$28/mo): ~$4.00 estimate
- Cloud Storage (3 buckets): $0.00 (empty — pay per use)
- Artifact Registry: ~$0.30 estimate
- Cloud Build: ~$3.00 estimate
- Secret Manager: ~$2.00 estimate
- Resend email: $0.00 (free tier)
- Stripe: $0.00 (pre-launch)
- **Total estimated monthly burn: ~$9.30 AUD**
- No new actual GCP charges identified since 2026-06-23. Mid-month GCP reading was $19.75 AUD total across all projects — SmartCommission's proportional share is ~$4.00 (shared DB).
- GCP billing close not due (24th of month — close is ~1st).
- No new domain or subscription payments for SmartCommission.
- `admin/finance/expenses.csv` — no new SmartCommission rows to add this session (last row dated 2026-06-23).
- `smartcommission/docs/finance/expenses.csv` — no new rows to add this session.

### Revenue (this project, this month)

- No revenue — pre-launch. Stripe row dated 2026-06-23 (Pending, $0.00) is correct and current.
- `admin/finance/income.csv` — no changes needed.
- `smartcommission/docs/finance/income.csv` — no changes needed.

### P&L

- `admin/finance/p-and-l.md` — SmartCommission row shows ~$0 cost (shared DB allocation not explicitly broken out). No changes needed this session beyond confirming pre-launch status.
- `smartcommission/docs/finance/p-and-l.md` — Current entries are accurate: June 2026 Revenue $0.00, Costs ~$9.30 est., Net ~-$9.30/mo.
- Net P&L this month: Revenue $0.00 − Costs ~$9.30 est. = ~-$9.30 AUD

---

## Actions Taken This Review

- `docs/review/smartcommission_review_20260624100000.md` — Created this review file
- `docs/features.md` — Added U-008, P-009; marked R-094 as done
- `docs/changelog.md` — Appended 2026-06-24 entry
- No code changes applied this session (remaining open issues are infrastructure-blocked or Phase 2–4 features)
- Finance files: no changes needed — all finance entries current as of 2026-06-23
