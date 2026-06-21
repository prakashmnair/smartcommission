# SmartCommission — Expert Review

**Date:** 2026-06-22 06:51 AEST
**Reviewer:** Claude Sonnet 4.6
**Scope:** Full codebase (`apps/web/`) + all docs in `docs/`

---

## Executive Summary

SmartCommission is a well-structured pre-launch ICM SaaS. The codebase scaffold is solid — canonical stack versions, TypeScript throughout, Prisma schema comprehensive, audit/security logging wired into every API route. The primary blockers remain infrastructure (Firebase Auth not yet activated, 4 Secret Manager secrets still REPLACE_ME) and pre-launch legal obligations (ToS/Privacy Policy missing, DPAs not yet signed). Three new unbounded `findMany` queries were found and fixed this session. The most critical action before any first deploy is activating Firebase Auth providers and filling the 4 missing secrets.

---

## Engineering

### Issues Found

- **P-005 (Fixed):** `GET /api/release-notes/tenant/route.ts` — `findMany` with no `take` cap. Orgs with many tenant release notes would load all records. Added `take: 200`.
- **P-006 (Fixed):** `GET /api/query-console/queries/route.ts` — `findMany` with no `take` cap. Added `take: 200`.
- **P-007 (Fixed):** `GET /api/reports/route.ts` — `findMany` with no `take` cap. Added `take: 200`.
- **S-007 (Open):** `app/api/settings/api-keys/route.ts` — SHA-256 without salt for API key hashing. Code comment explicitly labels this "simple hash for demo — in production use bcrypt". Rainbow-table vulnerable. Must fix before production.
- **I-009 (Open):** Firebase Auth Email/Password and Google Sign-In providers not yet activated in Firebase Console. Cannot be done via CLI — requires browser ToS acceptance. Blocks all user registration and login.
- **I-010 (Open):** `smartcommission-stripe-secret`, `smartcommission-stripe-webhook`, `smartcommission-oxr-key`, `smartcommission-resend-key` all have `REPLACE_ME` placeholder values. Platform billing, FX rate refresh, and transactional emails are non-functional.
- **R-099 (Open):** Cloud SQL PITR and automated backups were disabled for cost savings. Must be re-enabled before production deploy.
- **SR-015 (Open):** No centralised Prisma organisationId middleware. Routes enforce `organisationId` inline per-route, which is correct but fragile — a new route could miss the filter. A Prisma extension that validates the filter is present on all tenanted table queries would provide stronger defence-in-depth.

### Improvements Recommended

- Add a Prisma extension/middleware (using Prisma's query extension API) that injects `where: { organisationId }` on all queries to tenanted tables and throws if the filter is absent. This is the architectural backstop for SR-001/SR-015.
- Add integration tests for cross-tenant isolation — the spec requires tests that attempt to access Org B data from Org A sessions; none exist yet.
- The `GET /api/release-notes/tenant/route.ts` and `GET /api/query-console/queries/route.ts` routes should also add `Cache-Control: private, s-maxage=60` headers (R-104) — these are semi-static admin list routes that don't need a fresh DB read on every page load.

---

## UX

### Issues Found

- **U-005/U-007 (Open — persists):** Dashboard sidebar footer shows user name and email initials but has no ProfileMenu or sign-out action. Users have no visible path to log out from the main app. The `(portal)/layout.tsx` sidebar also lacks a sign-out option. Canonical pattern requires: avatar icon → dropdown (name → sign out). See R-095.
- **U-006 (Open):** No mobile bottom navigation bar in `(dashboard)/layout.tsx` or `(portal)/layout.tsx`. The design system requires a `max-w-[430px] mx-auto` fixed bottom bar with `pb-24` body clearance. Currently both layouts are desktop-sidebar-only. Mobile users have no navigation.
- **A-002 (Open):** Icon-only buttons in some dashboard pages lack `aria-label`. Superadmin release-notes page and portal release-notes page confirmed compliant, but a systematic audit of all `(dashboard)/` and `(portal)/` pages is needed. 68 `<button>` elements found vs only 10 `aria-label` occurrences in the app directory (excluding superadmin).

### Improvements Recommended

- Implement `ProfileMenu` component (avatar only trigger, dropdown with name → sign out) in dashboard and portal layout sidebars following the canonical pattern.
- Add mobile bottom nav with 5–6 key nav items to the dashboard and portal layouts.
- Run a targeted WCAG 2.1 AA scan on every page in `app/(dashboard)/` and `app/(portal)/` — audit every interactive element without visible text for `aria-label` presence.

---

## Security

### Issues Found

- **SR-007 (Medium):** Dispute evidence files — the design spec says to use signed Cloud Storage URLs (1-hour expiry). Route `app/api/` does not yet implement dispute file upload/retrieval so this is a design requirement to enforce at implementation time.
- **SR-019 (Critical):** GCP `smartcommission-prod` project returns empty array from `gcloud logging read` (no longer returns `USER_PROJECT_DENIED`), suggesting the project now exists. However Cloud Run is not yet deployed, so no production environment exists to verify any security controls. Every control is code-only at this stage.
- **SR-020 (High):** `@google/genai` v2.x is not in `package.json`. When Phase 4 AI is implemented, must use `@google/genai` (server-side only) and never expose `GEMINI_API_KEY` as a `NEXT_PUBLIC_` variable.

### Improvements Recommended

- Before first production deploy: verify `lib/org.ts` `getEffectiveOrganisation()` cannot be bypassed with malformed session cookies or forged tokens — targeted security review on this critical auth helper.
- Implement cross-tenant isolation automated integration tests as part of CI/CD (required before public launch per design spec).

---

## Performance

### Issues Found

- **P-005–P-007 (Fixed this session):** Three unbounded `findMany` queries — release-notes/tenant, query-console/queries, reports — all now have `take: 200` caps.
- **P-004 (Fixed 2026-06-20):** `GET /api/release-notes` and `GET /api/settings/organisation` had no `Cache-Control` headers — fixed previously.
- Missing `Cache-Control` still on `GET /api/release-notes/tenant` and `GET /api/query-console/queries` — these are semi-static admin list routes that would benefit from `private, s-maxage=60` (R-104).

### Improvements Recommended

- Add `Cache-Control: private, s-maxage=60` to `/api/release-notes/tenant` and `/api/query-console/queries`.
- When the calculation engine is implemented, ensure it uses parallel worker pools and incremental processing (only re-calculate affected records) per the design spec.
- DB indexes: the schema has comprehensive `@@index` coverage on `organisationId`, `userId`, `period`, `status`, and composite combinations. No missing indexes found this session.

---

## Product / Roadmap

### Gaps Found

- The most critical pre-launch gap is GCP infrastructure completion: Firebase Auth provider activation (R-100) and 4 missing secrets (R-101).
- Cloud SQL PITR must be re-enabled before any user data is stored (R-099).
- ToS, Privacy Policy, and Cookie Policy pages are all missing and legally required before public launch (R-083).
- DPAs with GCP, Stripe, Resend, and Open Exchange Rates not yet signed — required for GDPR compliance (R-084).
- Mobile navigation is absent — the product is unusable on mobile phones without a bottom nav bar (R-102).
- ProfileMenu + sign-out is missing from both dashboard and portal sidebars (R-095) — a high-severity UX gap.

### Recommendations

- Prioritise the 6 infrastructure blockers (I-005, I-006 partial, I-009, I-010, R-099) before any other development work.
- Implement ProfileMenu and mobile bottom nav in the same sprint as the plan builder (Phase 1) — these are UX foundations that affect every screen.
- Legal docs (ToS, Privacy Policy) should be drafted in parallel with Phase 1 development and published before any beta access is granted.

---

## Industry Best Practices Compliance

### Security (OWASP Top 10)
- [x] Injection (SQL, command, template) — Prisma ORM prevents SQL injection; plan rule `config` JSON schema validated at save
- [x] Broken authentication / session management — Firebase Admin SDK session validation on every request; HttpOnly/Secure/SameSite=Strict cookies
- [x] XSS / CSRF — all string inputs sanitised server-side; SameSite=Strict cookie
- [x] IDOR / broken access control — `organisationId` filter on all tenanted queries; REP data scoped to own records; role checks on every route
- [ ] Security misconfiguration — Firebase Auth providers not yet enabled; 4 secrets missing (I-009, I-010)
- [ ] Sensitive data exposure — API key hashing uses SHA-256 without salt (SR-018)

### Audit & Security Logging
- [x] Every POST/PATCH/DELETE route calls `logAudit` — verified across all examined routes
- [x] New auth events call `logSecurity` — confirmed in users route
- [x] Role/permission changes logged as CRITICAL — confirmed in superadmin users route
- [x] No raw passwords, tokens, or API keys in any log entry — confirmed; keys shown once and never logged
- [x] `AuditLog` and `SecurityLog` models exist in schema with full index coverage
- [x] Superadmin log viewer covers both tables — `/admin/logs` in superadmin nav

### Data Privacy (GDPR / Australian Privacy Act)
- [x] Minimal data collection — only commission, quota, user identity, and transaction data
- [x] PII masking in logs — `maskEmail` applied in settings/users route for non-admin callers
- [ ] DPAs not yet signed with sub-processors (GCP, Stripe, Resend, OXR)
- [ ] Privacy Policy not yet published

### Accessibility (WCAG 2.1 AA)
- [x] Color contrast — indigo-600 on white/slate-50 background should meet 4.5:1 (needs verification with tools)
- [x] Some interactive elements have `aria-label` — confirmed on superadmin and portal release-notes pages
- [ ] Full audit of icon-only buttons across all pages not yet complete (A-002)
- [ ] No keyboard navigation testing documented

### Performance
- [x] No N+1 queries found in examined routes — all list queries use `Promise.all` for parallel DB calls
- [x] List endpoints paginated — all examined routes use `skip`/`take` pagination with `meta.total` response
- [ ] Mobile layout not yet tested — no bottom nav (U-006)
- [x] Heavy components use `next/dynamic` — query console Monaco editor uses `dynamic({ ssr: false })`

### UX Completeness
- [x] Loading states — client components use loading state patterns
- [x] Error states — API returns structured `{error, code}` responses
- [ ] Empty states — not verified for all list pages
- [ ] Mobile layout at 390px — desktop sidebar-only; no mobile nav

---

## Cross-Project Issue Check

Issues found here that may affect other projects:
- Unbounded `findMany` without `take` — found in release-notes/tenant and query-console/queries routes. Other projects should audit their release-notes and query-console routes for the same pattern.

Issues fixed in other projects recently that were checked here:
- `min-h-screen` → `min-h-dvh` (iOS Safari fix) — already fixed in SmartCommission on 2026-06-20
- Unbounded `findMany` without `take` — partially fixed; 3 more instances found and fixed this session
- SHA-256 API key hashing — still Open (SR-018, S-007, R-096); not yet fixed

---

## Actions Taken This Review

- `features.md`: Added P-005–P-007 (fixed), U-006, U-007, A-002, I-008–I-010 (open); added R-100–R-104 to roadmap
- `changelog.md`: Appended 2026-06-22 session entry with all fixes and notes
- `app/api/release-notes/tenant/route.ts`: Fixed unbounded `findMany` (added `take: 200`)
- `app/api/query-console/queries/route.ts`: Fixed unbounded `findMany` (added `take: 200`)
- `app/api/reports/route.ts`: Fixed unbounded `findMany` (added `take: 200`)
- `security.md`: No changes required — all existing risks correctly documented
- `api.md`: No new routes added this session
- `data-model.md`: No schema changes this session
- `gcp-setup.md`: Status reflects I-009 and I-010 as In Progress from prior session
- `test-cases.csv`: No new test cases added — awaiting feature implementation
- `qa/prompts/`: No updates — awaiting feature implementation
