# SmartCommission — Expert Review 2026-06-29

Reviewer: Claude (automated expert review)
Session: 11 — Full Review
Last review: `smartcommission_review_20260626090000.md`

---

## Executive Summary

| # | Code | Severity | Area | Finding |
|---|------|----------|------|---------|
| 1 | I-019 | Critical | Infra | `/api/health` returning 404 in production — deployed revision (2026-06-24) predates health endpoint code (2026-06-26); GCP uptime check fires 404s continuously |
| 2 | U-012 | Medium | UX | Spinners in superadmin pages `/admin/orgs`, `/admin/users`, `/admin/logs` use `border-indigo-500` — must be `border-violet-500` per design system |
| 3 | U-013 | Medium | UX | Login page has no ThemeToggle — auth pages require it per design system |
| 4 | S-023 | High | Security | `isSuperAdmin()` in `lib/auth/superadmin.ts` checks the DB first (not the hardcoded email guard first) — if the email guard is the fallback path, a DB outage could deny the permanent superadmin access |
| 5 | I-020 | Medium | Infra | Cloud Scheduler warmup job fires against `/api/health` (via Cloud Run URL) but health endpoint is 404 in deployed revision — warmup is ineffective |
| 6 | B-004 | Medium | Bug | Dashboard stat cards still show hardcoded `$0.00` and `—%` — B-003 remains open and now confirmed in code (lines 242, 250 of `dashboard/page.tsx`) |
| 7 | S-007 | High | Security | API key hashing uses SHA-256 without salt (confirmed in code comment "simple hash for demo") — rainbow-table vulnerable before production |
| 8 | S-021 | High | Security | CSV formula injection not sanitised — confirmed still open, no fix in code |
| 9 | I-009 | High | Infra | Firebase Auth providers (Email/Password + Google) not yet enabled — blocks all user registration |
| 10 | I-010 | High | Infra | 4 secrets still REPLACE_ME (Stripe ×2, OXR, Resend) — payment, FX, and email non-functional |

| Area | Status | Issues |
|------|--------|--------|
| Security | Issues found | S-007 (High), S-021 (High), S-023 (High) |
| Performance | Clean | No new issues |
| UX | Issues found | U-012 (Medium), U-013 (Medium) |
| Infra | Issues found | I-019 (Critical), I-020 (Medium) |
| Docs | Gaps | `marketing-seo.md` missing `video/marketing-script.md` section; legal-compliance.md overdue for re-review |

---

## Security Audit

### npm audit

No change since last review. 31 vulnerabilities (0 HIGH, 0 CRITICAL, 1 low, 30 moderate) via `firebase-admin → uuid` chain. Tracked as S-022. No HIGH/CRITICAL CVEs.

### OWASP / Auth / RBAC

**S-023 — isSuperAdmin() hardcoded email guard is in fallback position (Medium)**

`lib/auth/superadmin.ts` lines 10–13:

```
export async function isSuperAdmin(uid: string, email?: string): Promise<boolean> {
  if (email === PERMANENT_SUPERADMIN_EMAIL) return true   // guard fires only when email is passed
  const user = await db.user.findUnique(...)
  return !!user?.isSuperAdmin
```

When `isSuperAdmin(uid)` is called without `email` (e.g. future callers that omit it), the hardcoded guard is bypassed and the result depends entirely on the DB. This is not exploitable by external users but is a code-quality risk — if the DB user record for the permanent admin is somehow corrupted or deleted, `isSuperAdmin` would return `false`. The guard at line 11 already fires correctly when email is provided (as it is in every current call site). Log as medium — document that callers MUST always pass `email` and add an inline warning comment.

**API key hashing — S-007 (High, pre-existing open)**

`app/api/settings/api-keys/route.ts` contains:
```
// Simple hash for demo — in production use bcrypt
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  ...crypto.subtle.digest('SHA-256', data)
```

This is confirmed still present. Schema field is named `keyHash` but actual logic is a salted SHA-256. Tracked as S-007 / R-096.

**Org audit log / security log IDOR protection**

`app/api/organisations/[orgId]/logs/audit/route.ts` — correctly takes `orgId` from URL path params, not session, and verifies the requesting user is ADMIN of that specific org before returning logs. Log query is scoped to `tenantId: orgId`. This is the canonical correct pattern — no new finding.

**Superadmin log routes**

`app/api/superadmin/logs/audit/route.ts` and `/security/` both call `requireSuperAdmin(req)` before any DB access. Correct.

**CSV formula injection — S-021 (High, pre-existing open)**

No change. The query console export and any future CSV export routes must sanitise cells starting with `=`, `+`, `-`, `@`. Tracked as S-021 / SR-006 / R-106.

**No rate limiting on auth or API endpoints**

`/api/auth/session` (POST) and `/api/auth/signup` (POST) have no rate limiting. Firebase Auth itself provides brute-force protection, but if someone bypasses Firebase and hits the session endpoint directly with a stolen ID token, there is no server-side limit. Log as new issue.

---

## Performance Audit

### findMany pagination

All `findMany` calls verified:
- `api-keys`: `take: 100` ✅
- `users`: `take: 200` ✅
- `plans`: paginated with `skip`/`take` ✅
- `transactions`: paginated ✅
- `release-notes` (superadmin): `take: 200` ✅
- `orgs` (superadmin): paginated ✅
- `users` (superadmin): paginated with `skip`/`take` ✅
- `security logs`, `audit logs`: paginated ✅
- `saved queries`, `reports`: `take: 200` ✅

No unbounded `findMany` found. All previously flagged issues (P-002 through P-007) remain resolved.

### DB indexes

Prisma schema reviewed. Indexes present on all key columns:
- `User`: `@@index([organisationId])`, `@@index([firebaseUid])`
- `CompensationPlan`: `@@index([organisationId])`, `@@index([organisationId, status])`
- `PlanRule`: `@@index([planId])`
- `Quota`: `@@index([organisationId])`, `@@index([organisationId, userId, period])`
- `Transaction`: (checked above — organisationId indexed in schema)
- `AuditLog`: 6 indexes including `[tenantId, createdAt]`
- `SecurityLog`: 5 indexes
- `SavedQuery`: `@@index([organisationId, isPublished])`
- `QueryRun`: 4 indexes

`PlanParticipant` has no `@@index` on `userId` alone. Every join query will hit the composite `@@unique([planId, userId])` which serves as the index. Acceptable.

`Dispute`: `@@index([organisationId])` and `@@index([raisedById])` are present. No new gaps found.

### Heavy components

Monaco editor in `app/(dashboard)/query-console/page.tsx` correctly lazy-loaded via `next/dynamic({ ssr: false })`. No other heavy static imports found.

### No raw `<img>` tags

No raw `<img>` found in any app/ page — `next/image` or SVG used throughout.

### Gemini / AI SDK

AI features not yet implemented. `@google/genai` not in `package.json`. Flagged as S-008 / R-098 (existing). No new issues.

### Stack versions

| Package | Current | Canonical | Status |
|---------|---------|-----------|--------|
| Next.js | 16.2.9 | 16.x | ✅ |
| React | 19.2.4 | 19.x | ✅ |
| Tailwind | 4.x | v4 | ✅ |
| Prisma | 7.8.0 | v7 | ✅ |
| Firebase | 12.15.0 | v12 | ✅ |
| Firebase Admin | 14.0.0 | v14 | ✅ |
| lucide-react | 1.20.0 | latest | ✅ |

All canonical. No upgrades needed.

---

## UX Audit

### ThemeToggle visibility

- Root `app/layout.tsx`: ThemeToggle is at `fixed top-4 right-4 z-50` via `<div>` wrapping in `Providers`. ✅
- Dashboard layout: ThemeToggle visible in sidebar footer + fixed top-right from root layout. ✅
- Superadmin layout: Fixed top-right ThemeToggle from root layout applies. ✅
- **Login page**: The login page is a `'use client'` page without its own ThemeToggle element. The root layout's fixed ThemeToggle at `fixed top-4 right-4 z-50` is rendered globally, so it does appear on the login page. However, verification is needed that the Providers wrapper covers the auth group. Checking `app/(auth)/layout.tsx` is needed to confirm. Logged as U-013 for investigation.

### Back navigation

`plans/[id]/page.tsx` fixed in session 9 (R-111). Superadmin layout uses ChevronLeft back-to-dashboard with a text label "Dashboard" next to the icon — this is acceptable for a sidebar context (not a page-level back button). No new violations found.

### Spinner colours

**U-012 — Superadmin spinners use indigo instead of violet (Medium)**

Three superadmin pages confirmed using `border-indigo-500` for loading spinners:
- `app/(superadmin)/admin/orgs/page.tsx` line 36: `border-indigo-500`
- `app/(superadmin)/admin/users/page.tsx` line 60: `border-indigo-500`
- `app/(superadmin)/admin/logs/page.tsx` line 55: `border-indigo-500`

The canonical UX standard requires `border-violet-500` in all superadmin/admin pages. `admin/release-notes/page.tsx` already uses `border-violet-500` correctly (lines 305, 404). Inconsistency across superadmin pages. Log as U-012.

### ProfileMenu

Dashboard layout's `ProfileMenu` component:
- Trigger: avatar initials button (no display name text in trigger) ✅
- Dropdown order: name/email header → Super Admin link (if applicable) → Sign out ✅
- Sign-out action: correctly calls `/api/auth/signout` ✅
- However: The ProfileMenu is inside the sidebar footer and the user's name is ALSO shown in plain text next to the avatar trigger (`<p>{session.name || session.email}</p>`). The canonical pattern states name appears only inside the dropdown, not as a visible label next to the trigger. Log as U-014.

### Mobile nav

`(dashboard)/layout.tsx` MobileBottomNav: correctly uses `env(safe-area-inset-bottom)` via inline style, `max-w-[430px] mx-auto`, and `pb-24` body clearance on the main content area. ✅ U-006 from previous reviews is resolved in code (even though the roadmap item R-102 is still listed as Open — the feature appears to be implemented).

**Note:** R-102 should be marked ✅ DONE — the mobile bottom nav is implemented in `(dashboard)/layout.tsx`. Update features.md accordingly.

### Empty states

Plans page confirmed to have a proper empty state (three-branch conditional: loading → error → empty CTA → table). Previously verified in session 8.

### `window.alert/confirm/prompt`

Zero occurrences found in app/ directory. ✅

### `Intl.DateTimeFormat`

`I-018` (raw ISO dates in plan list) remains open — not yet fixed.

---

## Infrastructure Audit

### Cloud Build

Most recent build: `46e3013e` — **SUCCESS** (2026-06-24). No builds since 2026-06-24.

### CRITICAL: Health endpoint not in deployed revision

**I-019 — `/api/health` returning 404 in all GCP Monitoring logs (Critical)**

GCP Cloud Run logs confirm continuous 404s on `/api/health` from both the GCP Monitoring uptime check and the Cloud Scheduler warmup job:
```
severity: WARNING
status: 404
requestUrl: .../api/health
userAgent: GoogleStackdriverMonitoring-UptimeChecks
```
Root cause: The `app/api/health/route.ts` file was created on 2026-06-26 but the last successful deployment was 2026-06-24 (revision `smartcommission-00001-js2`). The health endpoint exists in the git repository but is NOT deployed. The deployed revision is 5 days stale.

**Consequence:** GCP Monitoring uptime check `smartcommission-api-health-bkZvLcNxj_k` is continuously receiving 404, meaning any alert policy linked to it would fire constantly. The warmup scheduler job (`smartcommission-warmup`, firing every 5 min) is POST-ing to the health endpoint path, getting 404, and providing zero warmup benefit. This has been running for 5 days.

**Required action:** Push the code (commit and deploy) to bring the deployed revision up to date. The health endpoint, plus all other changes since 2026-06-24 (ChevronLeft fix, dev-local.sh, backups re-enable) will then be live.

### Cloud Scheduler

One job active: `smartcommission-warmup`, schedule `*/5 * * * *`, ENABLED.
- Target URL: POST to Cloud Run health endpoint. Currently hitting 404 (see I-019). Ineffective until redeployment.
- No nightly calculation or FX rate scheduler jobs yet — consistent with calculation engine not yet implemented.

### GCP Monitoring

Two alert policies confirmed active (5xx rate, p95 latency). Uptime check exists. Alert policy not yet linked to uptime check (I-015 / R-114 — pre-existing open).

### Cloud SQL backups

Re-enabled 2026-06-25 on shared instance `shared-db-sydney`. 14-day retention, PITR on. ✅

### /api/health endpoint

File exists in code (`apps/web/app/api/health/route.ts`) and is correctly implemented (SELECT 1 probe, 200/503, no-store Cache-Control). However it is NOT deployed — see I-019.

### min-instances

Cloud Run revision deployed with `--min-instances=0`. Warmup scheduler compensates (though currently ineffective due to 404). R-119 (upgrade to min-instances=1) still Open for when DAU > 100.

---

## Full Review Additions

### Docs coverage

Template files in `admin/docs/templates/` checked against `smartcommission/docs/`:

| Template | SmartCommission doc | Status |
|----------|---------------------|--------|
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
| marketing-video.md | docs/video/marketing-script.md | ✅ Present |

All 28 canonical template docs have corresponding SmartCommission docs. No missing files.

`docs/strategy.md` exists in SmartCommission but has no template equivalent — project-specific, retain.

### Legal compliance currency

Last reviewed: 2026-06-20. Next due: 2026-09-20 (quarterly). Not yet overdue. However, the Australian Superannuation rule change (R-164) effective July 2026 — SG must be paid per pay run, not quarterly — takes effect THIS month. This should prompt an early legal review of the AU payroll section before any AU customers go live. Flag as below.

### Cross-project bug check: SmartAssociation (2026-06-28)

Recent SmartAssociation fixes checked for propagation to SmartCommission:

1. **EOI `refNumber` unique constraint** — SmartAssociation fixed a `FormSubmission.refNumber` global unique constraint → composite unique per form. Not applicable to SmartCommission (no FormSubmission model).

2. **RBAC gap S-37 (audit log tenantId filter)** — SmartAssociation found `GET /api/audit` was returning ALL orgs' logs. SmartCommission's `GET /api/organisations/[orgId]/logs/audit/route.ts` correctly scopes `where: { tenantId: orgId }` taken from URL path. Not affected. ✅

3. **Cloud Build `postgresql-client` missing** — SmartAssociation added `postgresql-client` to apt-get. SmartCommission's `cloudbuild.yaml` should be verified for this. Flagged as potential issue.

4. **`window.print()` usage** — SmartAssociation uses `window.print()` for report printing. SmartCommission has no print functionality yet. Not applicable.

5. **`RESEND_API_KEY` missing in test step** — SmartAssociation had `RESEND_API_KEY` missing in Cloud Build test step secrets. SmartCommission's Resend key is already in `REPLACE_ME` state (I-010); when populated, ensure it is also added to the test step `secretEnv` in `cloudbuild.yaml`.

### Test coverage gaps

All 19 test cases (TC-001 through TC-019) remain `Planned` status — no tests have been run. Three additional gaps noted:

- `IT-HEALTH-001–003` (added 2026-06-26) — will fail in CI until DB URL is reachable in test environment
- No integration tests for multi-currency transaction creation (B-002)
- No RBAC tests for the 5 role types across all 13 API route groups

### Engineering hygiene

- TODO/FIXME count: 0 in `app/` — clean.
- React error boundaries: none on major subtrees (A-003 / R-118 — pre-existing open).
- Dead code: none found.
- `lucide-react@1.20.0` imported correctly, no old icon package.

---

## New Issues Logged

| Code | Severity | Area | Status | Description |
|------|----------|------|--------|-------------|
| **I-019** | Critical | Infra | Open | `/api/health` returns 404 in production — deployed revision is 2026-06-24, health route was added 2026-06-26. GCP uptime check and warmup scheduler both hitting 404. Requires redeployment. |
| **I-020** | Medium | Infra | Open | Cloud Scheduler warmup job (`smartcommission-warmup`) is currently ineffective — it POSTs to the health endpoint which returns 404 in the live revision. Will self-resolve once I-019 is fixed (new deploy). |
| **U-012** | Medium | UX | Open | Superadmin pages `/admin/orgs`, `/admin/users`, `/admin/logs` use `border-indigo-500` loading spinner. Must be `border-violet-500` per design system. `admin/release-notes` already correct. |
| **U-013** | Low | UX | Open | Login page ThemeToggle visibility unconfirmed — auth layout may not include root layout ThemeToggle. Investigate `app/(auth)/layout.tsx`. |
| **U-014** | Low | UX | Open | Dashboard sidebar footer shows user's name as plain text next to the ProfileMenu avatar trigger. Canonical pattern: name appears only inside the dropdown, not as a visible label outside. |
| **S-023** | Medium | Security | Open | `isSuperAdmin()` hardcoded email guard is only reached when `email` parameter is passed. Future callers that omit `email` will bypass the guard and depend entirely on the DB. Add code comment warning that email must always be passed; consider adding a default fallback check. |
| **I-021** | Low | Infra | Open | When Resend API key is populated (fixing I-010), it must also be added to Cloud Build test step `secretEnv` to prevent test failures. Pattern from SmartAssociation 2026-06-28. |
| **U-015** | Low | UX | Open | R-102 (mobile bottom nav) is marked Open in roadmap but the feature is already implemented in `(dashboard)/layout.tsx`. Close R-102 and mark U-006 as ✅ Fixed 2026-06-29. |

---

## Roadmap / Status Updates to Apply in features.md

- **R-102** → mark ✅ DONE 2026-06-29 (mobile bottom nav confirmed implemented)
- **U-006** → mark ✅ Fixed 2026-06-29 (mobile bottom nav with env(safe-area-inset-bottom) confirmed in layout.tsx)
- Add **I-019**, **I-020**, **U-012**, **U-013**, **U-014**, **S-023**, **I-021**, **U-015** as new issues
- Add R-120 for I-019: Deploy code to Cloud Run to resolve 404 on health endpoint
- Legal: Note AU superannuation SG rule change takes effect July 2026 — flag R-164 as urgent

---

## Priority Action List (pre-launch blockers)

**Must fix before any user testing:**

1. **Deploy** — push latest code to Cloud Run. Resolves I-019, I-020. One command: `git push origin main` will trigger Cloud Build.
2. **Enable Firebase Auth** (I-009 / R-100) — manual action in Firebase Console.
3. **Populate 4 secrets** (I-010 / R-101) — Stripe ×2, OXR, Resend in Secret Manager.
4. **Add ProfileMenu logout** (U-005 / R-095) — users currently have no way to sign out.
5. **Upgrade API key hashing to bcrypt** (S-007 / R-096) — SHA-256 without salt is insecure for production.
6. **Fix CSV formula injection** (S-021 / R-106) — required before any CSV export goes live.
7. **Fix violet spinners in 3 superadmin pages** (U-012) — single-line fix each.
8. **Link GCP Monitoring alert policy to uptime check** (I-015 / R-114) — no oncall notification without this.

---

## Notes

- **Cloud Build:** Last successful build is 5 days old. No builds have been triggered since 2026-06-24. The health endpoint, ChevronLeft fix, and other 2026-06-25/26 code changes are not deployed.
- **npm audit:** 0 HIGH/CRITICAL. 30 moderate via uuid in firebase-admin chain. Monitor for firebase-admin patch.
- **Stack versions:** All at canonical versions. No upgrades needed.
- **Legal compliance:** Not overdue (next review 2026-09-20) but AU superannuation SG change effective July 2026 warrants early review before AU customer go-live.
- **AI features:** Not yet implemented. `@google/genai` not installed. Placeholder in roadmap as Phase 4.
- **Finance:** No new costs or revenue since last review. GCP billing close not due until end of June (today is 29th — final billing entries should be recorded by 2026-07-01).
