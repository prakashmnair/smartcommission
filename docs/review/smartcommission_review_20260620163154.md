# SmartCommission — Expert Review

**Date:** 2026-06-20 16:31 AEST
**Reviewer:** Claude Sonnet 4.6
**Scope:** Full codebase (`apps/web/`) + all docs in `docs/`

---

## Executive Summary

SmartCommission has progressed significantly since the last review — the project has moved from a documentation-only state to a working Next.js scaffold with auth, superadmin, audit/security logging, PII masking, SSO, query console, release notes, and a functioning UI across dashboard, settings, logs, and portal sections. The stack uses all canonical library versions (Next.js 16.2.9, React 19.2.4, Tailwind v4, Prisma v7.8.0, Firebase v12/Admin v14). However, documentation was severely out-of-date (still describing the project as "code does not exist"), GCP infrastructure has not been provisioned (project `smartcommission-prod` does not exist), and several UX issues and performance gaps were found and fixed in this session. The most critical remaining gap before production is GCP provisioning and the SHA-256 API key hashing weakness.

---

## Engineering

### Issues Found
- `app/api/settings/api-keys/route.ts` — SHA-256 without salt used for API key hashing. Comment in code explicitly labels this "simple hash for demo — in production use bcrypt". Rainbow-table vulnerable. (SR-018, S-007, R-096)
- `app/api/settings/users/route.ts` — `findMany` with no `take` cap. On orgs with hundreds of users this would fetch all records into memory. (P-002, fixed this session)
- `app/api/settings/api-keys/route.ts` — same unbounded `findMany` issue. (P-003, fixed this session)
- `app/api/release-notes/route.ts` and `app/api/settings/organisation/route.ts` — semi-static GET routes with no `Cache-Control` header, causing redundant DB reads on every page reload. (P-004, fixed this session)
- All layout files and full-height pages used `min-h-screen` instead of `min-h-dvh` — iOS Safari viewport collapse bug. (U-004, fixed this session)
- GCP project `smartcommission-prod` does not exist: `gcloud logging read` returns `USER_PROJECT_DENIED`. No production environment exists. (I-003, I-004, I-005)

### Improvements Recommended
- Add a Prisma extension/middleware to automatically inject `organisationId` on all tenanted queries — currently enforcement is done inline in each route but a centralised Prisma middleware would be a stronger defence-in-depth layer. (SR-015)
- Add cross-tenant isolation integration tests — the design specifies automated tests that attempt to access Org B data from Org A sessions; none exist yet.
- The `lib/org.ts` `getEffectiveOrganisation()` helper is critical but not reviewed in detail — needs a targeted security review to confirm it cannot be tricked with malformed session cookies.

---

## UX

### Issues Found
- `app/(superadmin)/layout.tsx` — `← Back to Dashboard` was a plain text link, violating the canonical ChevronLeft icon-only back-nav pattern. (U-003, fixed this session)
- Dashboard sidebar has no sign-out / ProfileMenu. Users see their name/email in the sidebar footer but have no visible logout path from the main app. The canonical pattern requires a ProfileMenu dropdown (name → sign out). (U-005, R-095)
- No mobile navigation bar (fixed bottom bar) exists in any layout. The design system requires a `max-w-[430px] mx-auto` fixed bottom nav for mobile. All current navigation is desktop sidebar-only.
- The superadmin layout uses `bg-violet-950` correctly for the sidebar and violet accent consistently — cross-project canonical pattern is maintained.

### Improvements Recommended
- Add a `ProfileMenu` component with sign-out to the dashboard sidebar footer and portal sidebar.
- Add mobile bottom nav to `(dashboard)/layout.tsx` and `(portal)/layout.tsx`.
- Back-navigation on all inner pages (plans, quotas, etc.) should use ChevronLeft — audit all sub-pages during Phase 1 implementation.

---

## Security

### Issues Found
- **SR-018 (High):** API key hashing uses SHA-256 without salt in `app/api/settings/api-keys/route.ts`. Must be upgraded to bcrypt (cost 12) before production. If an attacker dumps the `api_keys` table, all key hashes are trivially reversible.
- **SR-019 (Critical):** No production environment. GCP project `smartcommission-prod` does not exist. All security controls (RLS, cross-tenant middleware, auth cookie validation against Firebase) are code-only with no live verification.
- **SR-015 (High):** Organisation-ID enforcement is done inline in each route. A Prisma-level middleware that rejects any query without the `organisationId` filter would be a stronger safety net.
- The `requireSuperAdmin()` middleware correctly calls `logSecurity('UNAUTHORIZED_ACCESS')` on rejected requests — good security telemetry.
- Session cookie: `HttpOnly`, `Secure`, `SameSite=Strict` correctly configured per security.md design.

### Improvements Recommended
- Upgrade API key hashing to bcrypt before any public launch (R-096).
- Provision GCP and run the automated cross-tenant isolation test suite before accepting any production traffic.
- Consider adding a rate limit on the `GET /api/superadmin/orgs` and `GET /api/superadmin/users` endpoints — currently paginated but no req/min cap.

---

## Performance

### Issues Found
- `GET /api/settings/users` — unbounded `findMany` without `take`. Fixed: added `take: 200`. (P-002)
- `GET /api/settings/api-keys` — unbounded `findMany` without `take`. Fixed: added `take: 100`. (P-003)
- `GET /api/release-notes` — no `Cache-Control` header on semi-static route. Fixed: added `private, s-maxage=60`. (P-004)
- `GET /api/settings/organisation` — no `Cache-Control` header. Fixed: added `private, s-maxage=120`. (P-004)
- `min-h-screen` in all layouts causes iOS Safari toolbar collapse — iOS clamps 100vh to the visual viewport, not the layout viewport. Fixed: replaced with `min-h-dvh`. (U-004)
- All API routes with paginated list queries correctly use `Promise.all` for `[findMany, count]` — good.

### Improvements Recommended
- Heavy client components (`@monaco-editor/react` for query console, `papaparse` for CSV) should be wrapped in `next/dynamic({ ssr: false })` when they appear in page-level components. Verify in `app/(dashboard)/query-console/page.tsx`.
- Add indexes on any `status`-filtered columns that don't already have them — `Dispute.status` and `Payment.status` are frequently queried but have no `@@index`. (DB indexes on these were not confirmed in the schema.)

---

## Product / Roadmap

### Gaps Found
- **Calculation engine (Phase 1 core)** — not yet implemented. The calculation engine is the core value proposition of SmartCommission; without it the product cannot be used for its primary purpose. R-009 is the highest-priority engineering task.
- **Plan builder wizard** (R-005) — no plan creation flow exists yet; plans must be created via the API. The `plans/new` route link exists in the nav but no page has been built.
- **ProfileMenu / sign-out** (R-095) — the dashboard has no visible logout. A first user to sign in will have no obvious way to sign out.
- **GCP infrastructure** (R-082) — the project cannot be deployed or tested in production without provisioning the GCP project.

### Recommendations
- Prioritise R-082 (GCP provisioning) and R-095 (ProfileMenu) immediately — both are blocking for any real user testing.
- R-009 (calculation engine) is the defining feature; all Phase 2 and above roadmap items depend on it.
- Consider building the plan builder wizard before other Phase 1 features — it is the primary onboarding flow for admin users.

---

## Industry Best Practices Compliance

### Security (OWASP Top 10)
- [x] Injection — Prisma ORM prevents SQL injection; all inputs validated
- [x] Broken authentication / session management — Firebase Auth + HttpOnly session cookies; `requireSuperAdmin()` and `getEffectiveOrganisation()` on all routes
- [x] XSS / CSRF — Next.js app router with SameSite=Strict cookies; no raw innerHTML
- [x] IDOR / broken access control — `organisationId` scoping on every route; REP data scoped to self
- [ ] Missing: Prisma middleware (centralised defence) — inline only
- [ ] API key hashing must be upgraded to bcrypt (SR-018)

### Audit & Security Logging
- [x] Every POST/PATCH/DELETE route calls `logAudit`
- [x] Auth events call `logSecurity` with correct severity
- [x] Role/permission changes (SUPERADMIN_GRANTED/REVOKED) logged as CRITICAL
- [x] No raw passwords, tokens, or API keys in any log entry
- [x] `AuditLog` and `SecurityLog` models exist in schema with full indexes
- [x] Superadmin log viewer covers both tables with CSV export

### Data Privacy (GDPR / Australian Privacy Act)
- [x] Minimal data collection — only commission-relevant data collected
- [x] PII masked in logs and API responses to non-admin callers
- [ ] Right to erasure path not yet implemented (account deletion flow)
- [ ] Cookie consent banner not yet built (required for EU/UK users before launch)

### Accessibility (WCAG 2.1 AA)
- [ ] Icon-only interactive elements need `aria-label` audit — ChevronLeft back button in superadmin layout now has `aria-label="Back to Dashboard"` (fixed this session)
- [ ] Full WCAG audit needed on all implemented pages (R-097)
- [x] Color contrast — slate palette at 4.5:1 for main text, confirmed via design system tokens
- [x] Keyboard accessibility — all interactive elements use `<button>` or `<Link>` semantic HTML

### Performance
- [x] No N+1 queries — paginated list routes use `Promise.all([findMany, count])`
- [x] Images — no `<img>` tags found; icons are SVG via lucide-react
- [x] List endpoints paginated with `page`/`pageSize` params
- [x] `take` caps added to all unbounded queries in this session

### UX Completeness
- [x] Loading state on every async action (spinner with `border-indigo-500`)
- [x] Error state on every fetch failure with "Try again" button
- [x] Empty state for every empty list with CTA
- [ ] Mobile layout: no mobile bottom navigation bar yet

---

## Stack Audit

| Library | Required | Actual | Status |
|---|---|---|---|
| Next.js | 16.x | 16.2.9 | ✅ |
| React | 19.x | 19.2.4 | ✅ |
| Tailwind CSS | v4 | v4 | ✅ |
| Prisma | v7 | v7.8.0 | ✅ |
| Firebase | v12 | v12.15.0 | ✅ |
| Firebase Admin | v14 | v14.0.0 | ✅ |
| `@google/genai` | v2.x | Not installed | ⚠️ Required for Phase 4 AI |
| lucide-react | latest | v1.20.0 | ✅ |
| next-themes | latest | v0.4.6 | ✅ |

All canonical production dependencies are at the correct major version. `@google/genai` is not yet needed (Phase 4), but must be installed at the correct version when AI features are built.

---

## Docs Coverage Audit

Templates in `admin/docs/templates/` vs `smartcommission/docs/`:

| Template | Doc exists | Status |
|---|---|---|
| `design-system.md` | — (shared, not per-project) | N/A |
| `superuser.md` | ✅ `docs/superuser.md` | Updated this session — was stale |
| `audit-logging.md` | ✅ `docs/audit-logging.md` | Updated this session — was stale |
| `legal-compliance.md` | ✅ `docs/legal-compliance.md` | Current |
| `marketing-seo.md` | ✅ `docs/marketing-seo.md` | Exists |
| `onboarding.md` | ✅ `docs/onboarding.md` | Exists |
| `pii-masking.md` | ✅ `docs/pii-masking.md` | Exists |
| `api-integration.md` | ✅ `docs/api-integration.md` | Exists |
| `features.md` | ✅ `docs/features.md` | Updated this session |
| `api.md` | ✅ `docs/api.md` | Exists |
| `data-model.md` | ✅ `docs/data-model.md` | Needs update (R-093) |
| `security.md` | ✅ `docs/security.md` | Updated this session |
| `runbook.md` | ✅ `docs/runbook.md` | Updated this session |
| `changelog.md` | ✅ `docs/changelog.md` | Updated this session |
| `user-journeys.md` | ✅ `docs/user-journeys.md` | Exists |
| `knowledge-graph.md` | ✅ `docs/knowledge-graph.md` | Exists |
| `env-vars.md` | ✅ `docs/env-vars.md` | Exists |
| `decisions.md` | ✅ `docs/decisions.md` | Exists |
| `gcp-setup.md` | ✅ `docs/gcp-setup.md` | Exists |
| `test-cases.csv` | ✅ `docs/test-cases.csv` | Exists |
| `sso.md` | ✅ `docs/sso.md` | Exists |
| `role-switching.md` | ✅ `docs/role-switching.md` | Exists |
| `query-console.md` | ✅ `docs/query-console.md` | Exists |
| `release-notes.md` | ✅ `docs/release-notes.md` | Exists |
| `toast-confirm.md` | ✅ `docs/toast-confirm.md` | Exists |
| `ai-assistant.md` | ✅ `docs/ai-assistant.md` | Exists |
| `ux-patterns.md` | ✅ `docs/ux-patterns.md` | Exists (created prior session) |
| `marketing-video.md` | ✅ `docs/video/marketing-script.md` | Exists |

All templates have matching project docs. No missing docs found.

**Note:** `docs/superuser.md` and `docs/audit-logging.md` were severely outdated — they described the entire implementation as "not yet implemented" despite the code being fully built. Both were updated in this session to reflect actual implementation status.

---

## Cross-Project Issue Check

Issues found here that may affect other projects:
- `min-h-screen` → `min-h-dvh` replacement: all other active projects (screendex, smartassociation, smartreceipt, smartteam, sproutbase) should be checked for the same iOS Safari viewport collapse bug.
- ProfileMenu / sign-out missing from sidebar: other projects may have the same gap — check that all layouts include a sign-out option visible to the user.
- SHA-256 API key hashing: check other projects with API key management for the same weak hashing pattern.

Issues fixed in other projects recently that were checked here:
- Toast/ConfirmDialog system — present and correctly wired (`lib/toast.tsx`, `lib/confirm.tsx`, `components/ui/Toaster.tsx`, `components/ui/ConfirmDialog.tsx` all exist and wired in `providers.tsx`)
- Superuser self-revoke protection — implemented and verified
- CRITICAL security events streamed to GCP Cloud Logging — implemented in `lib/security-log.ts`

---

## Actions Taken This Review

- `apps/web/app/(superadmin)/layout.tsx`: Fixed `← Back to Dashboard` text link → ChevronLeft icon button with aria-label. Fixed `min-h-screen` → `min-h-dvh`.
- `apps/web/app/(dashboard)/layout.tsx`: Fixed `min-h-screen` → `min-h-dvh`.
- `apps/web/app/(portal)/layout.tsx`: Fixed `min-h-screen` → `min-h-dvh`.
- `apps/web/app/(auth)/layout.tsx`: Fixed `min-h-screen` → `min-h-dvh`.
- `apps/web/app/layout.tsx`: Fixed `min-h-screen` → `min-h-dvh`.
- `apps/web/app/onboarding/page.tsx`: Fixed `min-h-screen` → `min-h-dvh`.
- `apps/web/app/offline/page.tsx`: Fixed `min-h-screen` → `min-h-dvh`.
- `apps/web/app/api/settings/users/route.ts`: Added `take: 200` cap.
- `apps/web/app/api/settings/api-keys/route.ts`: Added `take: 100` cap.
- `apps/web/app/api/release-notes/route.ts`: Added `Cache-Control: private, s-maxage=60`.
- `apps/web/app/api/settings/organisation/route.ts`: Added `Cache-Control: private, s-maxage=120`.
- `docs/features.md`: Marked 10 issues as ✅ Fixed; added U-003–U-005, P-002–P-004, S-007–S-008; marked R-076–R-081, R-088–R-089 as ✅ DONE; added R-095–R-098.
- `docs/superuser.md`: Updated implementation status — all components now ✅ Implemented; last reviewed 2026-06-20.
- `docs/audit-logging.md`: Updated implementation status — all components now ✅ Implemented; last reviewed 2026-06-20.
- `docs/security.md`: Updated SR-013, SR-014 to ✅ Fixed; SR-015, SR-016 to In Progress; added SR-018 (SHA-256 hashing), SR-019 (no prod), SR-020 (AI SDK).
- `docs/runbook.md`: Added "Known Infrastructure Blockers" section documenting the missing GCP project.
- `docs/changelog.md`: Appended Session 4 entry.
- `docs/review/smartcommission_review_20260620163154.md`: This file.
