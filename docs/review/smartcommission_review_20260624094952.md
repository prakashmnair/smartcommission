# SmartCommission — Expert Review

**Date:** 2026-06-24 09:49 AEST
**Reviewer:** Claude Sonnet 4.6
**Scope:** Full codebase (`smartcommission/apps/web/`) + all docs (`smartcommission/docs/`) + live GCP logs

---

## Executive Summary

SmartCommission is a well-structured pre-production scaffold in good shape architecturally. This session's most significant finding is a **live Cloud Build failure (2026-06-21, build `429b3a22`) that has not been documented** — the Cloud Build service account lacks `secretmanager.versions.access` permission on the `smartcommission-firebase-api-key` secret. This blocks all CI/CD. It is logged as I-012 (Critical) and should be fixed immediately. All previously logged open issues remain open. The plans page was confirmed to already have an empty state CTA (contrary to U-008/P-009 logged in the previous review — those should be marked resolved). No new code defects were found in the UI layer; all design tokens use `slate-*` (no `gray-*`), no `← Back` text links, no `window.alert/confirm/prompt` calls.

---

## Engineering

### Issues Found

- **I-012 (NEW — Critical):** Cloud Build build `429b3a22-89bb-453e-a7b7-1b0f062da23b` (2026-06-21) **FAILED** with `Permission 'secretmanager.versions.access' denied on resource projects/smartcommission-prod/secrets/smartcommission-firebase-api-key/versions/latest`. The Cloud Build service account `1028287218164@cloudbuild.gserviceaccount.com` does not have `roles/secretmanager.secretAccessor` on the `smartcommission-firebase-api-key` secret. This means the CI/CD pipeline cannot run at all. Fix: grant `secretmanager.secretAccessor` to the Cloud Build SA on all secrets used in `cloudbuild.yaml` step 0 (all Firebase `NEXT_PUBLIC_*` vars are injected via secret in the build step).
- **U-008/P-009 (CORRECTION — can be marked RESOLVED):** The 2026-06-24 10:00 review logged these as open issues (missing empty state on plans page). Code inspection today confirms `app/(dashboard)/plans/page.tsx` already has a proper empty state: `FileText` icon + "No plans yet" message + "Create plan" CTA button. These issues should be marked as resolved.
- **S-007 (persisting — High):** `app/api/settings/api-keys/route.ts` line 7 comment says "in production use bcrypt" but SHA-256 without salt is still in use. Rainbow-table vulnerable.
- **S-021 (persisting — High):** No `sanitizeCsvCell()` helper in `lib/pii.ts`. CSV export formula injection unmitigated.
- **B-002 (persisting — Medium):** `POST /api/transactions` line 68: `amountBase: amount` — FX conversion not performed. Multi-currency transactions have incorrect base-currency values.
- **R-086/R-087 (persisting):** `lib/context.ts`, `RoleSwitcher`, `ProxyBanner` not yet implemented.

### Items Confirmed OK (No Issues)

- **Design tokens:** No `bg-gray-*`, `text-gray-*`, `border-gray-*`, or `ring-gray-*` tokens found anywhere in `app/`. All colors use correct `slate-*` variants.
- **Back navigation:** No `← ` text links found. All back navigation uses `ChevronLeft` icon buttons.
- **Native browser popups:** No `window.alert`, `window.confirm`, or `window.prompt` calls in application code (only in `node_modules`).
- **Unbounded findMany:** All routes are paginated with `take`. `transactions` route: `take: pageSize` with max 100. `plans`: `take: pageSize`. `superadmin/orgs` and `superadmin/users`: `take: pageSize`. Log routes: `take: limit`. API keys: `take: 100`. Query console, reports, release-notes: all have `take: 200` (fixed in Session 5).
- **Stack versions:** Next.js 16.2.9, React 19.2.4, Tailwind v4, Prisma 7.8.0, Firebase 12.15.0, Firebase Admin 14.0.0 — all canonical. `lucide-react` at 1.20.0 (latest 1.21.0 — minor-only, no action needed).
- **Root layout:** `suppressHydrationWarning` on `<html>`, Geist font, `ThemeToggle` fixed at `top-4 right-4 z-50`, `viewport-fit=cover`, light/dark `themeColor` meta tags all correct.
- **Quota/calculation/earnings/payments/disputes pages:** Confirmed "Coming soon" stubs — acceptable for pre-production scaffold. These are Phase 1–2 deliverables.

---

## UX

### Issues Found

- **U-005/U-007 (persisting — High):** `app/(dashboard)/layout.tsx` sidebar footer shows user initials + name/email but no logout button, no ProfileMenu dropdown. Portal layout has no user identity section at all. Canonical pattern requires avatar → dropdown (name → sign out). This is the single highest-priority UX fix before real user testing.
- **U-006 (persisting — Medium):** Both `(dashboard)/layout.tsx` and `(portal)/layout.tsx` use a desktop sidebar only. No fixed bottom navigation bar for mobile viewport (required: `max-w-[430px] mx-auto`, `pb-24` body clearance, `env(safe-area-inset-bottom)`).
- **A-002 (persisting — Medium):** Icon-only interactive buttons across dashboard pages have not been audited for `aria-label`. Full audit needed on `(dashboard)/`, `(superadmin)/`, and `(portal)/` pages.

### Items Confirmed OK

- `min-h-dvh` used correctly throughout (no `min-h-screen`).
- `bg-slate-50 dark:bg-slate-950` page background, `bg-white dark:bg-slate-900` cards, `bg-slate-100 dark:bg-slate-800` inputs — all correct.
- Loading and error states confirmed on plans, transactions, and logs pages.
- Plans page empty state: `FileText` icon + "No plans yet" + "Create plan" CTA — confirmed implemented (U-008/P-009 are already resolved).

---

## Security

### Issues Found

- **I-012 (NEW — Critical):** Cloud Build SA missing `secretmanager.versions.access` on Firebase API key secret. Blocks all CI/CD. Fix: run `gcloud secrets add-iam-policy-binding smartcommission-firebase-api-key --member="serviceAccount:1028287218164@cloudbuild.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=smartcommission-prod`. Verify all secrets used in Step 0 of cloudbuild.yaml have this binding.
- **S-007 (High — Open):** SHA-256 API key hashing — upgrade to bcrypt (cost 12) before production.
- **S-021 (High — Open):** CSV formula injection unmitigated.
- **R-083 (Critical — Open):** No ToS, Privacy Policy, or Cookie Policy pages published. Required before launch.
- **R-085 (High — Open):** No cookie consent banner. Required for EU/UK users.

### Items Confirmed OK

- Firebase Admin `verifySessionCookie()` used for all auth verification — correct.
- `logAudit` called on all POST/PATCH/DELETE routes.
- `logSecurity` called for auth and permission events with correct severity.
- PII masking (`maskEmail`, `maskName`, `maskIp`) used throughout.
- Prisma ORM used everywhere — no raw SQL injection risk in application code (`lib/query-safe.ts` enforces SELECT-only for query console).
- Session cookies: HttpOnly, Secure, SameSite=Strict, 7-day expiry.

---

## Performance

### Items Confirmed OK

- All `findMany` calls have `take` caps. No unbounded queries found.
- `Promise.all` used for concurrent queries.
- Monaco editor lazy-loaded with `next/dynamic({ ssr: false })`.
- No raw `<img>` tags — `next/image` pattern in place.
- DB indexes on all key columns confirmed in `prisma/schema.prisma`.

### Open Items

- **P-008 (Low — Open):** `/api/settings/users` and `/api/plans` missing `Cache-Control: private, s-maxage=30` headers.

---

## GCP Logs Audit

- **GCP project:** `smartcommission-prod`
- **Cloud Run logs:** No Cloud Run service deployed — zero logs available. `gcloud logging read` returns empty JSON array.
- **Cloud Build:** One build found: `429b3a22-89bb-453e-a7b7-1b0f062da23b` — **STATUS: FAILURE** (2026-06-21). Root cause: `Permission 'secretmanager.versions.access' denied` on `smartcommission-firebase-api-key`. This build was the first (and only) deploy attempt. Cloud Build SA needs `roles/secretmanager.secretAccessor` bound on each secret used in the build. Logged as I-012.
- **Error Reporting:** Empty (no Cloud Run service running to generate errors).
- **Firebase Crashlytics:** Not applicable (no mobile app yet).

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
| lucide-react | 1.20.0 | 1.21.0 | ✅ Minor version only; no action |
| `@google/genai` | not installed | v2.x | ⬜ Planned for Phase 4 (R-098) |

All canonical versions confirmed. No upgrades required this session.

---

## Docs Coverage Audit

All canonical template docs confirmed present from previous session. No missing docs. No new templates added to `admin/docs/templates/` since 2026-06-24 10:00 review.

**Correction from previous review:** U-008 (missing empty state on plans page) and P-009 (empty table header with no rows) were logged as open in the 20260624100000 review. Code inspection today shows the plans page already has a proper three-branch conditional: loading → error → empty state (FileText icon + "No plans yet" + CTA) → table. These were false positives. Marking both as resolved.

---

## Finance Review

### Costs (June 2026)

No new GCP charges since 2026-06-23 mid-month reading ($19.75 AUD combined for all projects). SmartCommission's proportional share: ~$4.00 AUD (1/7 of shared-db + Artifact Registry + Secret Manager + Cloud Build occasional runs). GCP billing close not due (24th of month). No new domain, subscription, or API cost for SmartCommission.

- `smartcommission/docs/finance/expenses.csv` — no new rows to add.
- `admin/finance/expenses.csv` — no new rows to add.

### Revenue (June 2026)

Pre-launch. No revenue. `smartcommission/docs/finance/income.csv` Pending row for June 2026 is current.

### P&L

- `smartcommission/docs/finance/p-and-l.md` — Estimates current. Net ~-$9.30 AUD/mo (est.). No changes needed.
- `admin/finance/p-and-l.md` — SmartCommission row shows ~$0 cost (shared DB not broken out separately). Row is accurate for current status. No changes needed.

---

## Cross-Project Issue Check

- **I-012 (Cloud Build IAM):** This is a Cloud Build service account permission issue specific to `smartcommission-prod`. Other active projects with Cloud Build triggers should be checked for similar IAM bindings, but this is a GCP project-scoped issue — each project has its own SA. No propagation needed.
- **Plans empty state false positive (U-008/P-009):** Confirmed plans page has empty state. Check if other projects have similar correct implementations.
- No new patterns introduced this session that need back-porting.

---

## Actions Taken This Review

- `docs/review/smartcommission_review_20260624094952.md` — Created this review file
- `docs/features.md` — Added I-012 (Cloud Build IAM failure); corrected U-008 and P-009 as resolved
- `docs/changelog.md` — Appended 2026-06-24 entry (this review)
- `docs/gcp-setup.md` — Added Cloud Build failure to Known Infrastructure Issues section
- No code changes this session (remaining open issues are infrastructure-blocked or Phase 2–4 features; I-012 requires GCP console action, not code change)
- Finance files: no changes needed — all entries current

---

## Priority Action List (Before First Deploy)

1. **I-012 (Critical — Fix now):** Grant Cloud Build SA `secretmanager.secretAccessor` on all secrets used in `cloudbuild.yaml`. Run the `gcloud secrets add-iam-policy-binding` command for each Firebase secret in the build step.
2. **I-009/R-100 (Critical):** Enable Firebase Auth providers (Email/Password + Google Sign-In) in Firebase Console manually.
3. **I-010/R-101 (High):** Fill in 4 missing secrets: Stripe ×2, OXR, Resend.
4. **U-005/R-095 (High):** Add ProfileMenu + sign-out to dashboard sidebar footer.
5. **S-007/R-096 (High):** Upgrade API key hashing from SHA-256 to bcrypt (cost 12) before any real users.
6. **S-021/R-106 (High):** Add `sanitizeCsvCell()` to `lib/pii.ts` and call in all export routes.
7. **R-083 (Critical):** Draft and publish ToS + Privacy Policy before public access.
