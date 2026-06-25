# SmartCommission — Changelog

All notable changes to SmartCommission are documented here.
Format: reverse-chronological `## YYYY-MM-DD` with Added / Changed / Fixed / Security / Removed subsections.

---

## 2026-06-26 (Session 10 — Expert Review)

### Added
- `apps/web/app/api/health/route.ts` — new `/api/health` endpoint (unauthenticated, DB probe via `SELECT 1`, returns `{ status, timestamp }` with `Cache-Control: no-store`). Fixes I-014 (health endpoint missing). Required for GCP Monitoring uptime alerts and Cloud Run readiness probes.
- `apps/web/tests/api/health.test.ts` — IT-HEALTH-001–003 integration tests covering unauthenticated access, response shape, and Cache-Control header.
- GCP Monitoring uptime check `smartcommission-api-health-bkZvLcNxj_k` created pointing to `https://smartcommission-1028287218164.australia-southeast1.run.app/api/health` (5-minute interval, SSL validation on).

### Changed
- `docs/features.md` — added I-014 (✅ Fixed), I-015, I-016, I-017, S-022, B-003; added R-113 (✅ DONE), R-114, R-115, R-116; extended QA gaps with health endpoint and dashboard stat card tests.
- `docs/changelog.md` — this entry.

### Notes
- **Build status:** Latest build `46e3013e` (2026-06-24) **SUCCEEDED**. Cloud Run service `smartcommission` is live at `https://smartcommission-1028287218164.australia-southeast1.run.app`. Root URL returns 307 redirect (→ /login). Previously-failing builds `7fea03f2` and `429b3a22` were Secret Manager permission issues on older commits — I-012/I-013 were resolved before the successful 2026-06-24 build.
- **GCP Monitoring:** Two alert policies confirmed active (5xx error rate, p95 latency). Uptime check added this session. Alert policy for the uptime check still needs to be linked (R-114, I-015).
- **npm audit:** 31 vulnerabilities (0 HIGH/CRITICAL, 1 low, 30 moderate) — all in `firebase-admin → uuid` dependency chain. No immediate action; monitor for firebase-admin patch. Logged as S-022.
- **`cloudbuild.yaml`:** Confirmed: `prisma generate --config prisma.config.ts` runs before migrations AND before `npm run build`. Standalone server started from `/workspace/apps/web/.next/standalone/` with `node server.js` (not `npm start`). Both CI/CD correctness requirements satisfied.
- **`scripts/dev-local.sh`:** Referenced in package.json but file does not exist. Logged as I-017. Running `npm run dev:local` will error.
- **Stack:** All canonical — Next.js 16.2.9, React 19.2.4, Tailwind v4, Prisma 7.8.0, Firebase 12.15.0, Firebase Admin 14.0.0.
- **No new UX regressions.** All previously fixed issues (ChevronLeft navigation, dark mode tokens, min-h-dvh, Toast/ConfirmDialog) remain in correct state.
- **Finance:** No new costs or revenue. GCP billing close not due (26th of month). All finance entries current.

---

## 2026-06-25 (Session 9 — Expert Review)

### Fixed
- `apps/web/app/(dashboard)/plans/[id]/page.tsx` — replaced `ArrowLeft` import with `ChevronLeft`; replaced canonical className on back-nav button; replaced text link "Back to Plans" in error state with ChevronLeft icon-only button + `aria-label` (U-009, U-010, R-111)

### Changed
- `docs/features.md` — added new issues I-013 (Cloud Build still failing 2026-06-24), U-009 (ArrowLeft icon violation), U-010 (text back link in error state); added roadmap items R-110 (Cloud Build IAM fix) and R-111 (ArrowLeft → ChevronLeft — now ✅ DONE 2026-06-25); marked U-009, U-010 as ✅ Fixed 2026-06-25.
- `docs/changelog.md` — this entry.

### Notes
- GCP Cloud Build: build `7fea03f2` (2026-06-24) FAILED — same Secret Manager permission error as build `429b3a22` (2026-06-21). I-012 fix has NOT been applied. I-013 logged as new issue. Blocker: no deploys possible until Cloud Build SA gets `roles/secretmanager.secretAccessor`.
- Cloud Run: still not deployed. No application error logs available to review.
- Stack versions re-confirmed current: Next.js 16.2.9, React 19.2.4, Tailwind v4, Prisma v7.8.0, Firebase 12/Admin 14. All canonical.
- API routes: all findMany calls properly paginated or capped. Monaco editor lazy-loaded via `next/dynamic({ ssr: false })`. No `window.alert/confirm/prompt` in application code. No `min-h-screen` or `100vh` remaining.
- Docs coverage: all canonical template docs confirmed present. No missing doc files.
- Finance: no new costs or revenue since 2026-06-24. GCP billing close not due (mid-month). All finance entries current.
- Legal compliance: last reviewed 2026-06-20. Next review due 2026-09-20. No new gaps found.
- Remaining open critical/high issues before first deploy: I-012/I-013 (Cloud Build SA), I-004 (Cloud Run not deployed), I-009 (Firebase Auth), I-010 (4 missing secrets), U-005/U-007 (no logout), S-007 (bcrypt upgrade), S-021 (CSV formula injection), R-099 (PITR re-enable).

---

## 2026-06-24 (infra — Melbourne → Sydney DB migration + DB rename)

### Changed
- Cloud SQL database migrated from Melbourne (`prakash-shared:australia-southeast2:shared-db`) to Sydney (`prakash-shared:australia-southeast1:shared-db-sydney`) — 2026-06-24
- Database renamed from `smartcommission_prod` → `smartcommission` on new Sydney instance
- `smartcommission-db-url` secret updated to version 5 pointing to `shared-db-sydney` with db name `smartcommission`
- `cloudbuild.yaml` `_INSTANCE_CONNECTION_NAME` updated to `prakash-shared:australia-southeast1:shared-db-sydney`
- `gcp-setup.md` updated to reflect all infrastructure changes


## 2026-06-24 (Session 8 — Expert Review)

### Added
- `docs/review/smartcommission_review_20260624100000.md` — timestamped expert review for this session.

### Changed
- `docs/features.md` — added new issues U-008 (plans page missing empty state), P-009 (empty table header rendered with no rows); added roadmap items R-108 (add empty state CTA to plans page) and R-109 (audit all list pages for empty states); marked R-094 as ✅ DONE 2026-06-24 (storyboard.md confirmed present).
- `docs/changelog.md` — this entry.

### Notes
- GCP Cloud Run still not deployed — no Cloud Run logs available. Cloud SQL instance `smartcommission-db` confirmed running (no new errors since 2026-06-23 review).
- Stack versions re-confirmed current: Next.js 16.2.9, React 19.2.4, Tailwind v4, Prisma v7.8.0, Firebase 12/Admin 14. All canonical.
- Docs coverage: all canonical template docs confirmed present in `smartcommission/docs/`. `docs/video/storyboard.md` confirmed present — R-094 closed.
- Finance: no new costs or revenue since 2026-06-23. GCP billing close not due (mid-month). All finance entries current.
- Cross-project audit: no new patterns propagated to SmartCommission this session. Previously fixed patterns (ThemeProvider, session cookie, spinner colours) confirmed not present as issues here.
- Remaining open critical issues requiring action before first deploy: I-004 (Cloud Run), I-005/I-009 (Firebase Auth), I-010 (4 missing secrets), U-005/U-007 (no logout option), S-007 (API key bcrypt), S-021 (CSV formula injection).

---

## 2026-06-23 (Session 7 — Expert Review)

### Changed
- `docs/features.md` — added new issues B-002, S-021, P-008, I-011; added roadmap items R-105 through R-107; all prior fixes confirmed still in place
- `docs/security.md` — updated SR-019 (GCP project confirmed active, Cloud SQL logs verified), added note on CSV formula injection risk (SR-006 still open)
- `docs/changelog.md` — this entry

### Notes
- GCP Cloud SQL logs confirmed: instance `smartcommission-db` is actively running (graceful admin restart seen 2026-06-22 UTC — normal Cloud SQL maintenance pattern; no application errors).
- `gcloud beta error-reporting events list` command syntax not supported in this gcloud version (`list` is not a valid subcommand of `events`). Error Reporting must be checked via GCP Console.
- Cloud Run service still not deployed — no Cloud Run logs to review. All app code remains pre-production.
- Cross-project audit: Screendex fixed violet→indigo spinner colour correction (2026-06-23). SmartCommission dashboard app pages correctly use `border-indigo-500` — no propagation needed. Sproutbase fixed ThemeProvider absence (U-16) — SmartCommission confirms ThemeProvider is wired in `app/providers.tsx` with correct `attribute="class" defaultTheme="system" enableSystem` — no fix needed. SmartReceipt fixed session cookie forgery (I-06/SR-006) — SmartCommission uses Firebase Auth + server-side session cookies verified via `firebase-admin`, not plain base64 — confirmed secure.
- Stack versions re-confirmed current: Next.js 16.2.9, React 19.2.4, Tailwind v4, Prisma v7.8.0, Firebase 12/Admin 14, lucide-react 1.20.0. All canonical.
- `docs/video/` directory has `marketing-script.md` and `voiceover.txt` but is missing `storyboard.md` (R-094 remains open).
- All canonical template docs exist in `smartcommission/docs/`. Template `marketing-video.md` corresponds to `docs/video/marketing-script.md` — confirmed present. No missing doc files.

---

## 2026-06-22 (Session 6 — Docs Completeness Audit)

### Changed
- `docs/toast-confirm.md` — Updated implementation status to ✅ Implemented (all components exist in codebase). Updated checklist. Updated roadmap R-088 to DONE.
- `docs/pii-masking.md` — Updated masking gaps: B-001 fixed (lib/pii.ts exists), B-003 in progress.
- `docs/superuser.md` — Fixed Data Model section: no separate SuperAdmin table; project uses User.isSuperAdmin boolean. Updated Auth Helper to match actual `apps/web/lib/auth/superadmin.ts`. Fixed security checklist to checked state. Removed stale seed example using `db.superAdmin`.
- `docs/sso.md` — Updated implementation status: all SSO routes and lib/sso.ts confirmed implemented. Updated Last reviewed to 2026-06-22.
- `docs/query-console.md` — Updated implementation status: all query console components confirmed implemented. Updated Last reviewed.
- `docs/release-notes.md` — Updated implementation status: all release notes components confirmed implemented. Updated Last reviewed.
- `docs/data-model.md` — Fixed AuditLog and SecurityLog field names to match canonical schema (D-003). Updated ER diagram. Updated Additional Models section: removed phantom SuperAdmin table, added SsoConfig, ApiKey, marked SavedQuery/QueryRun/ReleaseNote as implemented.
- `docs/features.md` — Marked D-003, D-004, R-092, R-093 as ✅ DONE 2026-06-22.

---

## 2026-06-22 (Session 5 — Expert Review)

### Fixed
- `apps/web/app/api/release-notes/tenant/route.ts` — added `take: 200` cap to unbounded `findMany` (P-005)
- `apps/web/app/api/query-console/queries/route.ts` — added `take: 200` cap to unbounded `findMany` (P-006)
- `apps/web/app/api/reports/route.ts` — added `take: 200` cap to unbounded `findMany` (P-007)

### Changed
- `docs/features.md` — added new issues P-005 through P-007, U-006, U-007, A-002, I-008 through I-010; added roadmap items R-100 through R-104; confirmed all prior fixes still in place
- `docs/changelog.md` — this entry
- `docs/security.md` — updated SR-019 noting GCP still unprovisioned; no new security risks found this session

### Notes
- GCP project `smartcommission-prod` is provisioned (gcloud returns empty array rather than auth error) but Cloud Run service not yet deployed. Firebase Auth providers still pending manual activation (I-009). 4 secrets still REPLACE_ME (I-010).
- Docs coverage audit: all canonical template docs exist in `smartcommission/docs/`. No missing doc files found this session.
- Cross-project check: no new issues propagated from other projects this session.
- Stack versions confirmed current: Next.js 16.2.9, React 19.2.4, Tailwind v4, Prisma v7.8.0, Firebase v12/Admin v14, lucide-react 1.20.0 (latest: 1.21.0 — minor version, no issue).

---

## 2026-06-20 (Session 4 — Expert Review)

### Fixed
- `apps/web/app/(superadmin)/layout.tsx` — replaced `← Back to Dashboard` text link with ChevronLeft icon + "Dashboard" label (U-003, canonical back-nav pattern)
- `apps/web/app/(superadmin)/layout.tsx`, `(dashboard)/layout.tsx`, `(portal)/layout.tsx`, `(auth)/layout.tsx`, `app/layout.tsx`, `app/onboarding/page.tsx`, `app/offline/page.tsx` — replaced all `min-h-screen` with `min-h-dvh` to fix iOS Safari viewport collapse bug (U-004)
- `apps/web/app/api/settings/users/route.ts` — added `take: 200` cap to unbounded `findMany` (P-002)
- `apps/web/app/api/settings/api-keys/route.ts` — added `take: 100` cap to unbounded `findMany` (P-003)
- `apps/web/app/api/release-notes/route.ts` — added `Cache-Control: private, s-maxage=60` header (P-004)
- `apps/web/app/api/settings/organisation/route.ts` — added `Cache-Control: private, s-maxage=120` header (P-004)

### Changed
- `docs/features.md` — marked B-001, S-001–S-004, U-001–U-002, D-002, I-006 as ✅ Fixed; added new issues U-003 through U-005, P-002–P-004, S-007–S-008; added roadmap items R-095–R-098; marked R-076–R-081, R-088–R-089 as ✅ DONE.
- `docs/superuser.md` — updated implementation status table to reflect fully-implemented superuser pattern; last reviewed 2026-06-20.
- `docs/audit-logging.md` — updated implementation status table to reflect fully-implemented audit/security logging; last reviewed 2026-06-20.
- `docs/security.md` — added SR-018 for SHA-256 API key hashing weakness.
- `docs/changelog.md` — this entry.

---

## 2026-06-20 (Session 4 — Expert Review)

### Added
- `docs/review/smartcommission_review_20260620140000.md` — timestamped expert review for this session (Session 4).

### Changed
- `docs/features.md` — added 7 new issues (I-007, D-003, D-004, S-005, S-006, U-003) and 4 new roadmap items (R-092 through R-094); all pre-existing issues confirmed still Open; no code exists to fix yet.
- `docs/changelog.md` — this entry.

### Notes
- GCP project `smartcommission-prod` not yet created (I-007 confirmed via `gcloud logging read` attempt).
- Cross-project check: screendex (2026-06-18), smartassociation (2026-06-18), smartreceipt (2026-06-20), smartteam (2026-06-17), sproutbase (2026-06-20) changelogs reviewed. SmartCommission-specific patterns confirmed:
  - SmartTeam used wrong AI SDK (`@google/generative-ai`) — S-005 logged.
  - Sproutbase session 2026-06-20 fixed ThemeProvider absence (U-16) and ThemeToggle missing — SmartCommission must ensure same pattern when code is created.
  - SmartReceipt 2026-06-20 fixed unbounded `findMany` and missing `Cache-Control` — SmartCommission must enforce `take` limits and cache headers from day one.

---

## 2026-06-20 (Session 3 — Expert Review)

### Added
- `docs/ux-patterns.md` — UX patterns and performance standards doc was missing (U-002); created with full SmartCommission-specific content: back navigation map, header layout pattern, ProfileMenu dropdown order, spinner colour rules, loading/error/empty state templates, performance conventions (parallelise queries, cap findMany, Cache-Control headers, lazy-load heavy components), and admin nav layout.
- `docs/review/smartcommission_review_20260620120000.md` — timestamped expert review for this session.

### Changed
- `docs/features.md` — added 3 new issues (U-002 missing ux-patterns.md, I-006 stack version audit, tracking); added 7 new roadmap items (R-086 role-switching API, R-087 RoleSwitcher/ProxyBanner, R-088 Toast/ConfirmDialog, R-089 canonical stack versions, R-090 clawback jurisdiction warning, R-091 PWA/Capacitor). Legal compliance updated: last reviewed date updated to 2026-06-20.
- `docs/changelog.md` — this entry.
- `docs/legal-compliance.md` — updated last reviewed date to 2026-06-20; next review 2026-09-20.

---

## 2026-06-18 (Session 2 — Expert Review)

### Added
- `docs/runbook.md` — operational runbook: local dev setup, deployment, database migrations, secrets management, nightly calc run monitoring, exchange rate refresh, common failure modes, backup/recovery, incident response.
- `docs/knowledge-graph.md` — Mermaid system architecture diagram, ER diagram, feature mindmap, deployment architecture diagram, and RBAC permission hierarchy diagram.
- `docs/env-vars.md` — complete list of all environment variables, Secret Manager mapping, local dev template.
- `docs/pii-masking.md` — PII data inventory, masking strategy implementations (maskEmail, maskName, maskIp, maskPhone, scrubPii), log scrubbing rules, admin view masking behaviour, export masking policy, GDPR right-to-erasure procedure.
- `docs/api.md` — full internal API route reference: all Next.js Route Handlers with method, path, auth, description, and role requirements.
- `docs/gcp-setup.md` — GCP infrastructure specification: Cloud Run, Cloud SQL, Cloud Storage, Cloud Tasks, Cloud Scheduler, Secret Manager, Firebase, Cloud Build, IAM roles, DNS, cost estimate.
- `docs/test-cases.csv` — 75 test cases covering authentication, RBAC, multi-tenancy, plan builder, calculation engine, payment run, dispute workflow, rep portal, security, PII masking, performance, accessibility, and legal compliance.
- `qa/prompts/01_signup_onboarding.md` — QA browser prompt for signup and onboarding flow.
- `qa/prompts/02_plan_builder.md` — QA browser prompt for plan builder and approval workflow.
- `qa/prompts/03_rep_portal.md` — QA browser prompt for rep portal.
- `qa/prompts/04_finance_payment_run.md` — QA browser prompt for finance payment run workflow.
- `qa/prompts/05_security_rbac.md` — QA browser prompt for security and RBAC verification.
- `docs/review/smartcommission_review_20260618000000.md` — full timestamped expert review.

### Changed
- `docs/features.md` — added 12 new known issues (I-003 through I-005, B-001, S-001 through S-004, U-001, A-001, P-001, D-002); added Phase 0 pre-implementation roadmap items (R-076 through R-085).
- `docs/data-model.md` — added `SecurityLog` model (required by CLAUDE.md audit-logging standard) to schema diagram and table definitions.
- `docs/decisions.md` — added ADR-006 (separate AuditLog and SecurityLog models) and ADR-007 (Firebase Auth with server-side session cookies).
- `docs/security.md` — added SR-013 (SecurityLog not implemented), SR-014 (superuser pattern not implemented), SR-015 (no Prisma organisationId middleware yet).

---

## 2026-06-18

### Added
- Initial project documentation — comprehensive feature spec, data model, architecture decisions, user journeys, security model, legal compliance, marketing strategy, and onboarding flow.
- `docs/features.md` — full feature specification across 13 areas (Plan Design, Data Integration, Calculation Engine, Payments, Participant Portal, Manager Views, Reporting, Compliance, Workflows, Multi-Org, API, AI, Security). Includes Phase 1–4 roadmap (R-001 through R-075).
- `docs/data-model.md` — complete Prisma/PostgreSQL data model with 18 entities, full field definitions, Mermaid ER diagram, enums, indexes, and relationship descriptions.
- `docs/decisions.md` — five architecture decision records (ADR-001 through ADR-005): multi-tenant strategy, calculation engine approach, real-time vs batch calculations, CRM integration strategy, multi-currency handling.
- `docs/user-journeys.md` — six user journeys: plan admin publishes a plan, rep views earnings, rep submits a dispute, Finance runs the monthly payment, manager reviews team attainment, and the nightly automated calculation run.
- `docs/security.md` — security model covering Firebase Auth, session handling, RBAC (6 roles), data isolation (3-layer defence), input validation, secrets management, PII classification, and 12 known security risks (SR-001 through SR-012).
- `docs/legal-compliance.md` — ICM-specific compliance covering compensation data sensitivity, SOX requirements, tax implications, e-signature contract law, and wage payment laws by jurisdiction (AU Fair Work Act, US state laws including California, UK Employment Rights Act).
- `docs/marketing-seo.md` — full go-to-market strategy: value proposition, competitive positioning vs 8 competitors, SEO keyword targets, content strategy, pricing tiers, growth channels, and KPI targets.
- `docs/onboarding.md` — admin and rep onboarding flows: 6-step wizard, email sequences, first value moment definition (≤ 30 min to first calculation), help doc coverage requirements.
- `docs/api-integration.md` — public REST API specification: auth, versioning, rate limits, endpoints for all 8 resource groups, webhook events, export/import formats, OpenAPI spec reference.
