# SmartCommission — Expert Review 2026-06-25T05:50:43

**Reviewer:** Claude Code (automated review agent)
**Session:** 9
**Date:** 2026-06-25
**Review type:** Daily comprehensive review

---

## Executive Summary

SmartCommission remains a pre-production codebase with well-structured scaffolding. The primary blocker remains a Critical infrastructure issue: the Cloud Build pipeline has failed on both the 2026-06-21 and the new 2026-06-24 build due to a Secret Manager IAM permission gap that has not yet been fixed. All application code is sound and consistent with canonical patterns; one UX standard violation (ArrowLeft instead of ChevronLeft in plans detail page) was found and fixed this session. No new security vulnerabilities discovered. Finance is unchanged from prior review.

---

## 1. GCP Logs & Infrastructure Audit

### Cloud Run logs

Cloud Run service not yet deployed — no application-layer logs available.

### Cloud Build

| Build ID | Date | Status | Error |
|---|---|---|---|
| `7fea03f2` | 2026-06-24 | FAILURE | `Permission 'secretmanager.versions.access' denied on resource projects/smartcommission-prod/secrets/smartcommission-firebase-api-key` |
| `429b3a22` | 2026-06-21 | FAILURE | Same error |

**Root cause:** Cloud Build service account `1028287218164@cloudbuild.gserviceaccount.com` lacks `roles/secretmanager.secretAccessor` on the Firebase secrets referenced in `cloudbuild.yaml` Step #0.

**Fix required (not yet applied):**
```bash
gcloud projects add-iam-policy-binding smartcommission-prod \
  --member="serviceAccount:1028287218164@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**New issue logged:** I-013 (Critical) — supersedes I-012 (both open, same root cause, confirmed re-occurring).

### Cloud SQL

No new Cloud SQL log events since 2026-06-23. I-011 (graceful admin restart) remains Low / non-critical.

---

## 2. Stack Version Audit

| Dependency | Installed | Canonical | Status |
|---|---|---|---|
| Next.js | 16.2.9 | 16.x | ✅ Current |
| React | 19.2.4 | 19.x | ✅ Current |
| Tailwind CSS | ^4 | v4 | ✅ Current |
| Prisma | ^7.8.0 | v7 | ✅ Current |
| Firebase | ^12.15.0 | v12 | ✅ Current |
| Firebase Admin | ^14.0.0 | v14 | ✅ Current |
| `@google/genai` | Not installed | v2.x | ⚠️ Not needed until Phase 4 — S-008/R-098 tracked |

All canonical versions confirmed current. No upgrades needed.

---

## 3. UX Consistency Audit (Within-Project)

### Back navigation

- `app/(superadmin)/layout.tsx`: uses `ChevronLeft` with `aria-label="Back to Dashboard"` ✅
- `app/(dashboard)/plans/[id]/page.tsx`: was using `ArrowLeft` — **FIXED this session** (U-009, R-111) ✅ Fixed 2026-06-25
- Error state in plans/[id]: was showing text link "Back to Plans" — **FIXED this session** (U-010) ✅ Fixed 2026-06-25
- No other back-navigation text links found in codebase

### Spinner colours

- Dashboard pages use `border-indigo-500 border-t-transparent animate-spin` ✅
- Superadmin layout uses violet accent consistently ✅

### ProfileMenu / logout

- Dashboard sidebar (U-005, U-007): still shows user initials + email with NO logout/ProfileMenu ⚠️ Open (R-095)
- Portal sidebar: same issue ⚠️ Open

### Mobile bottom nav

- Both `(dashboard)/layout.tsx` and `(portal)/layout.tsx` have desktop sidebar only, no mobile bottom nav ⚠️ U-006 Open (R-102)

### ThemeToggle

- Root `app/layout.tsx` has `<ThemeToggle />` as `fixed top-4 right-4 z-50` ✅
- `suppressHydrationWarning` on `<html>` ✅
- Providers wrapper with `next-themes` `attribute="class" defaultTheme="system" enableSystem` ✅

### Color tokens

- Page bg: `bg-slate-50 dark:bg-slate-950` ✅
- Cards: `bg-white dark:bg-slate-900` ✅
- Inputs: `bg-slate-100 dark:bg-slate-800` ✅
- Primary: `indigo-600` / hover `indigo-700` ✅
- No `gray-950`, `zinc-950`, or custom hex found ✅

---

## 4. UX Consistency Audit (Cross-Project)

- ChevronLeft standard: confirmed in SmartCommission ✅ (after today's fix)
- ProfileMenu pattern (avatar-only trigger, name → sign out): missing in this project (U-005) — same pattern gap as seen in other projects; cross-propagation noted
- Superadmin violet accent: confirmed ✅
- `min-h-dvh` (not `min-h-screen`): confirmed throughout ✅

---

## 5. Performance Audit

### findMany queries — pagination/cap status

| Route | Cap | Pagination | Status |
|---|---|---|---|
| `GET /api/transactions` | pageSize ≤ 100 + Promise.all count | ✅ | ✅ |
| `GET /api/plans` | pageSize ≤ 100 + Promise.all count | ✅ | ✅ |
| `GET /api/settings/users` | take: 200 | — | ✅ |
| `GET /api/settings/api-keys` | take: 100 | — | ✅ |
| `GET /api/release-notes` | take: 200 | — | ✅ |
| `GET /api/release-notes/tenant` | take: 200 | — | ✅ |
| `GET /api/superadmin/users` | pageSize ≤ 200 + Promise.all count | ✅ | ✅ |
| `GET /api/superadmin/logs/audit` | pageSize ≤ 200 + Promise.all count | ✅ | ✅ |
| `GET /api/superadmin/logs/security` | pageSize ≤ 200 (confirmed below) | — | ✅ |
| `GET /api/superadmin/release-notes` | take: 200 | — | ✅ |
| `GET /api/query-console/queries` | take: 200 | — | ✅ |
| `GET /api/reports` | take: 200 | — | ✅ |

All findMany calls are properly capped. No unbounded queries found.

### Cache-Control

| Route | Cache-Control | Status |
|---|---|---|
| `GET /api/release-notes` | `private, s-maxage=60` | ✅ |
| `GET /api/settings/organisation` | `private, s-maxage=120` | ✅ |
| `GET /api/settings/users` | None | ⚠️ P-008 Open |
| `GET /api/plans` | None | ⚠️ P-008 Open |
| `GET /api/transactions` | None | ⚠️ P-008 Open |

P-008 remains open but Low priority. No new cache gaps found.

### Heavy imports

- Monaco editor: `next/dynamic({ ssr: false })` in query-console page ✅
- No other heavy client components statically imported in layouts ✅

### Image usage

- No raw `<img>` tags found in application code ✅
- No images currently used (pre-launch) ✅

### N+1 queries

- No N+1 patterns found. All multi-result fetches use `Promise.all` for parallel count + list queries ✅

---

## 6. Security Audit (OWASP Top 10)

| Risk | Status | Notes |
|---|---|---|
| A01 Broken Access Control | Partial | `getEffectiveOrganisation` enforces org scope on all routes; `requireSuperAdmin` on admin routes. Prisma org middleware (SR-015) still not a Prisma extension — inline enforcement only. |
| A02 Cryptographic Failures | Open | API key SHA-256 hashing without salt (S-007, SR-018) — upgrade to bcrypt before production |
| A03 Injection | Partial | Prisma ORM prevents SQL injection. CSV formula injection (SR-006/S-021) not yet fixed in export routes. |
| A04 Insecure Design | Open | No rate limiting on dispute submission (SR-008) |
| A05 Security Misconfiguration | Open | Cloud Build SA missing Secret Manager access (I-012/I-013) — critical blocker |
| A06 Vulnerable Components | OK | All deps on latest major versions |
| A07 Auth Failures | Open | Firebase session cookie not revoked on user deactivation (SR-005) |
| A08 Software/Data Integrity | Partial | Calculation audit trail mutable risk (SR-003) — no hash yet |
| A09 Security Logging | OK | AuditLog + SecurityLog implemented and called consistently |
| A10 SSRF | N/A | No outbound fetch from user-controlled URLs |

No new critical security vulnerabilities found this session.

---

## 7. Accessibility Audit (WCAG 2.1 AA)

- Superadmin back-nav button: `aria-label="Back to Dashboard"` ✅
- Plans detail back-nav: `aria-label="Back to Plans"` added this session ✅
- Plans detail error state back-nav: `aria-label="Back to Plans"` added this session ✅
- Dashboard pages: only 5 `aria-label` instances found (A-002 Open) — icon-only action buttons in list pages need audit (R-097, R-103)
- Color contrast: design tokens are canonical slate/indigo — assumed compliant; not verified with a tool this session

---

## 8. Docs Coverage Audit

Templates in `admin/docs/templates/` vs SmartCommission `docs/`:

| Template | Corresponding Doc | Status |
|---|---|---|
| `ai-assistant.md` | `docs/ai-assistant.md` | ✅ Present |
| `analytics.md` | `docs/analytics.md` | ✅ Present |
| `api-integration.md` | `docs/api-integration.md` | ✅ Present |
| `api.md` | `docs/api.md` | ✅ Present |
| `audit-logging.md` | `docs/audit-logging.md` | ✅ Present |
| `changelog.md` | `docs/changelog.md` | ✅ Present |
| `data-model.md` | `docs/data-model.md` | ✅ Present |
| `decisions.md` | `docs/decisions.md` | ✅ Present |
| `design-system.md` | `docs/design-system.md` | ✅ Present |
| `env-vars.md` | `docs/env-vars.md` | ✅ Present |
| `features.md` | `docs/features.md` | ✅ Present |
| `gcp-setup.md` | `docs/gcp-setup.md` | ✅ Present |
| `knowledge-graph.md` | `docs/knowledge-graph.md` | ✅ Present |
| `legal-compliance.md` | `docs/legal-compliance.md` | ✅ Present |
| `marketing-seo.md` | `docs/marketing-seo.md` | ✅ Present |
| `marketing-video.md` | `docs/video/marketing-script.md` | ✅ Present |
| `onboarding.md` | `docs/onboarding.md` | ✅ Present |
| `pii-masking.md` | `docs/pii-masking.md` | ✅ Present |
| `query-console.md` | `docs/query-console.md` | ✅ Present |
| `release-notes.md` | `docs/release-notes.md` | ✅ Present |
| `role-switching.md` | `docs/role-switching.md` | ✅ Present |
| `runbook.md` | `docs/runbook.md` | ✅ Present |
| `security.md` | `docs/security.md` | ✅ Present |
| `sso.md` | `docs/sso.md` | ✅ Present |
| `superuser.md` | `docs/superuser.md` | ✅ Present |
| `test-cases.csv` | `docs/test-cases.csv` | ✅ Present |
| `toast-confirm.md` | `docs/toast-confirm.md` | ✅ Present |
| `user-journeys.md` | `docs/user-journeys.md` | ✅ Present |
| `ux-patterns.md` | `docs/ux-patterns.md` | ✅ Present |
| `ads-strategy.md` | `docs/ads-strategy.md` | ✅ Present |

All canonical docs present. No missing docs this session.

---

## 9. Legal & Regulatory Compliance

- `docs/legal-compliance.md` exists ✅
- Last reviewed: 2026-06-20. Next review due: 2026-09-20.
- No new compliance gaps found this session.
- Key open items: DPAs with GCP/Stripe/Resend/OXR not yet signed (R-084); Privacy Policy/ToS not yet published (R-083); cookie consent banner not yet implemented (R-085).
- Singapore (PDPA) and Japan (APPI) remain "Not Assessed" — target Phase 3 APAC expansion. Monitor for early signups from these regions.

---

## 10. Finance Review

### Project-Level (SmartCommission)

**expenses.csv:** No new actual charges since 2026-06-23 review. Cloud Run not yet deployed — no additional Cloud Run costs. Shared DB estimate unchanged (~AUD $4/month proportional share).

**income.csv:** No revenue. Stripe subscription row remains Pending / Pre-launch.

**p-and-l.md:** No changes needed — mid-month, no new actuals.

**Summary:** SmartCommission estimated monthly burn remains ~AUD $9.30/month (pre-Cloud Run deployment). No income. Net: ~-$9.30/month.

### Aggregate (admin/finance)

No changes to admin-level finance files required — no new SmartCommission-specific costs or income since last sync.

**GCP billing close:** Today is 2026-06-25 (not 1st–3rd of month). No flag required.

---

## 11. New Issues Found This Session

| Code | Severity | Title |
|---|---|---|
| **I-013** | Critical | Cloud Build still failing on 2026-06-24 — same Secret Manager permission error (build `7fea03f2`) |
| **U-009** | Medium | `plans/[id]/page.tsx` used `ArrowLeft` icon instead of `ChevronLeft` — ✅ Fixed this session |
| **U-010** | Low | `plans/[id]/page.tsx` error state had text link "Back to Plans" — ✅ Fixed this session |

### Code Fixes Applied This Session

- `apps/web/app/(dashboard)/plans/[id]/page.tsx`: `ArrowLeft` → `ChevronLeft size={20}` with canonical className and `aria-label` on both nav button and error state button. (U-009, U-010, R-111)

---

## 12. Pre-Deploy Checklist (Unchanged Open Blockers)

| # | Issue | Severity |
|---|---|---|
| 1 | I-012 / I-013: Grant Cloud Build SA `roles/secretmanager.secretAccessor` | Critical |
| 2 | I-009: Enable Firebase Auth providers (Email/Password + Google) in console | High |
| 3 | I-010: Fill in 4 REPLACE_ME secrets (Stripe, OXR, Resend) | High |
| 4 | I-004: Deploy first Cloud Run service | High |
| 5 | S-007 / R-096: Upgrade API key hashing from SHA-256 to bcrypt | High |
| 6 | S-021 / R-106: Sanitise CSV export fields for formula injection | High |
| 7 | U-005 / R-095: Add ProfileMenu with logout to dashboard sidebar | Medium |
| 8 | R-099: Re-enable Cloud SQL PITR | Critical |

---

## 13. Recommendations for Next Session

1. **Fix Cloud Build SA IAM binding (I-012/I-013)** — this is blocking every deploy and has been open since 2026-06-21. Run: `gcloud projects add-iam-policy-binding smartcommission-prod --member="serviceAccount:1028287218164@cloudbuild.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"`
2. **Enable Firebase Auth** — go to Firebase Console and enable Email/Password + Google Sign-In
3. **Fill in the 4 REPLACE_ME secrets** in Secret Manager
4. **Add ProfileMenu with logout** to dashboard sidebar footer (R-095)
5. **Upgrade API key hashing to bcrypt** (R-096) — security pre-requisite before any production traffic

---

*Review completed 2026-06-25. Next review: 2026-06-26.*
