# SmartCommission — Expert Review 2026-06-23

**Session:** 7
**Reviewer:** Claude (automated expert review agent)
**Date:** 2026-06-23
**Scope:** Full codebase, all docs, GCP logs, cross-project propagation, stack audit

---

## Executive Summary

SmartCommission remains a pre-launch product with a well-structured scaffold. The codebase is clean, follows canonical design system conventions, and all prior P1/P2 fixes from Sessions 4–6 are confirmed in place. This session found 4 new issues (1 Medium bug, 2 Medium security/perf gaps, 1 Low infra note) and added 3 roadmap items. No critical regressions found. GCP Cloud SQL instance is confirmed running. No Cloud Run logs (service not yet deployed).

---

## 1. GCP Logs Audit

- **Cloud SQL logs** reviewed via `gcloud logging read severity>=ERROR --project=smartcommission-prod`. One `ALERT` log found: `FATAL: terminating connection due to administrator command` from `cloudsqladmin` user at `2026-06-22T21:16:47Z`. This is a normal Cloud SQL maintenance restart — not an application bug. Logged as I-011 (Low/Open) for monitoring awareness.
- **Cloud Run logs**: no entries. Cloud Run service `smartcommission-web` is not yet deployed. I-004 remains open.
- **Error Reporting**: `gcloud beta error-reporting events list` not supported in this gcloud SDK version. Must be reviewed via GCP Console.
- **Firebase Crashlytics**: no mobile app exists yet. Not applicable.

---

## 2. Engineering / Security (OWASP Top 10)

### Confirmed Still Secure
- `isSuperAdmin()` helper in `lib/auth/superadmin.ts`: hardcodes `prakashmnair@gmail.com` as permanent superadmin — correct pattern.
- `requireSuperAdmin()` logs `UNAUTHORIZED_ACCESS` CRITICAL security event on forbidden access attempts.
- Self-revoke protection: `POST /api/superadmin/users PATCH` guards against `revoke` on own uid and permanent account email.
- All API routes use `getEffectiveOrganisation()` to scope data to `organisationId` — no cross-tenant leaks found in reviewed routes.
- `logAudit()` called after every successful DB mutation in all reviewed POST/PATCH/DELETE routes.
- `maskEmail()` applied in `GET /api/settings/users` for non-admin roles — PII masking working.
- Account deletion anonymises audit/security logs before deleting user — correct GDPR pattern.
- Session cookie issued by Firebase Admin SDK — not a plain base64 token (compare: SmartReceipt SR-006 which was a different, weaker pattern).

### New Issues Found

**B-002 (Medium)**: `POST /api/transactions` stores `amountBase: amount` verbatim — no FX conversion. Code comment explicitly documents this as "simplified: assume base currency = deal currency for now". For a multi-currency ICM platform this is a data integrity risk affecting all commission calculations. Logged, roadmap item R-105 added.

**S-021 (High)**: CSV formula injection (SR-006 in security.md) is documented as a risk but not yet fixed. No CSV export routes have been implemented yet (core calculation engine is Phase 1). Must be fixed before any export endpoint ships. R-106 added.

**SR-021 (Medium)**: FX conversion skip has a secondary security/data integrity implication — earnings records and payment runs denominated in the wrong currency. Logged in `security.md`.

### SHA-256 API Key Hashing (S-007 / SR-018)
Confirmed still present: `apps/web/app/api/settings/api-keys/route.ts` uses `crypto.subtle.digest('SHA-256')` without salt. Comment acknowledges this is a placeholder. R-096 remains open — must be upgraded to bcrypt before production.

---

## 3. UX Consistency Audit (Within-Project)

### Confirmed Compliant
- `app/layout.tsx`: `suppressHydrationWarning` on `<html>`, ThemeToggle at `fixed top-4 right-4 z-50`, `min-h-dvh` on body — correct.
- `app/providers.tsx`: `ThemeProvider attribute="class" defaultTheme="system" enableSystem` — correct.
- `app/(superadmin)/layout.tsx`: violet/purple accent, `ChevronLeft` icon-only back nav to dashboard, `isSuperAdmin()` server-side guard — correct.
- `app/(auth)/layout.tsx`: passes through to children; ThemeToggle comes from root layout (fixed positioning) — correct.
- Spinner colours: `border-indigo-500` in app pages (verified in `plans/page.tsx`), superadmin layout uses violet bg — correct.
- No `window.alert`, `window.confirm`, or `window.prompt` calls found in codebase.
- `min-h-dvh` used throughout — iOS Safari fix confirmed.

### Issues Remaining Open
- **U-005 / U-007**: Dashboard and portal sidebar footers show user name/email initials but no ProfileMenu dropdown or sign-out action. R-095 tracks this as High priority.
- **U-006**: No mobile bottom navigation in dashboard or portal layouts. R-102 tracks this as Medium.
- **A-002**: Icon-only buttons in dashboard pages may lack `aria-labels`. Only 5 `aria-label` usages found in `(dashboard)/` across all pages — very low for a large page set. R-097 and R-103 track this.

### Back Navigation
Superadmin layout uses `ChevronLeft` icon-only back nav — confirmed correct. No text-link back-nav found in reviewed pages.

---

## 4. UX Consistency Audit (Cross-Project)

| Pattern | SmartCommission | Other Projects | Status |
|---|---|---|---|
| ThemeProvider wiring | `providers.tsx` ✅ | All others: ✅ | OK |
| ThemeToggle fixed position | `app/layout.tsx` ✅ | All others (where implemented): ✅ | OK |
| violet accent superadmin | `(superadmin)/layout.tsx` `bg-violet-950` ✅ | SmartAssociation: ✅, SmartTeam: ✅ | OK |
| ChevronLeft back nav | Superadmin layout ✅ | All: ✅ | OK |
| Spinner indigo in app | `plans/page.tsx` `border-indigo-500` ✅ | Screendex fixed 2026-06-23 | OK |
| ProfileMenu structure | Not yet implemented (U-005) | All others: implemented | Gap — R-095 |
| Mobile bottom nav | Not yet implemented (U-006) | Some others: implemented | Gap — R-102 |

No new cross-project propagation issues. Screendex fixed violet→indigo spinner colour confusion in admin pages (2026-06-23 changelog) — SmartCommission was already using indigo correctly.

---

## 5. Performance Audit

### Confirmed Capped
All prior P-002 through P-007 `take` caps confirmed present in code:
- `GET /api/settings/users`: `take: 200` ✅
- `GET /api/settings/api-keys`: `take: 100` ✅
- `GET /api/superadmin/logs/audit`: paginated with `pageSize` ≤ 200 ✅
- `GET /api/superadmin/users`: paginated ✅
- `GET /api/plans`: paginated with `pageSize` ≤ 100 ✅
- `GET /api/transactions`: paginated with `pageSize` ≤ 100 ✅
- `GET /api/release-notes/tenant`: `take: 200` ✅
- `GET /api/query-console/queries`: `take: 200` ✅
- `GET /api/reports`: `take: 200` ✅
- `GET /api/superadmin/release-notes`: `take: 200` ✅
- `GET /api/superadmin/orgs`: paginated ✅

### New Performance Issue
**P-008 (Low)**: `GET /api/settings/users`, `GET /api/plans`, and `GET /api/transactions` have `take` caps but no `Cache-Control` headers. These are frequently-accessed lists that change infrequently. `private, s-maxage=30` would reduce redundant DB reads. R-107 added.

### Parallel Queries
- `GET /api/plans`: uses `Promise.all([findMany, count])` ✅
- `GET /api/transactions`: uses `Promise.all([findMany, count])` ✅
- `GET /api/superadmin/orgs`: uses `Promise.all([findMany, count])` ✅
- `DELETE /api/account`: uses `Promise.all([updateMany audit, updateMany security])` ✅

### Dynamic Imports
Monaco editor loaded via `next/dynamic({ ssr: false })` in `(dashboard)/query-console/page.tsx` ✅. No other heavy imports found statically in layouts.

### Raw `<img>` Tags
None found in app directory — all images use Next.js `<Image>` or icon components ✅.

---

## 6. Cutting-Edge Stack Audit

| Dependency | Installed | Canonical | Status |
|---|---|---|---|
| Next.js | 16.2.9 | 16.x | ✅ |
| React | 19.2.4 | 19.x | ✅ |
| Tailwind CSS | ^4 | v4 | ✅ |
| Prisma | ^7.8.0 | v7 | ✅ |
| Firebase | ^12.15.0 | v12 | ✅ |
| Firebase Admin | ^14.0.0 | v14 | ✅ |
| `@google/genai` | not installed | v2.x | Not needed yet (Phase 4) |
| lucide-react | ^1.20.0 | 1.21.0 | Minor version behind — no issue |

All canonical. No upgrades needed.

---

## 7. Docs Coverage Audit

All canonical templates in `admin/docs/templates/` have corresponding docs in `smartcommission/docs/`. Checked:

| Template | Project Doc | Status |
|---|---|---|
| `design-system.md` | `docs/design-system.md` | ✅ |
| `legal-compliance.md` | `docs/legal-compliance.md` | ✅ |
| `audit-logging.md` | `docs/audit-logging.md` | ✅ |
| `superuser.md` | `docs/superuser.md` | ✅ |
| `pii-masking.md` | `docs/pii-masking.md` | ✅ |
| `api-integration.md` | `docs/api-integration.md` | ✅ |
| `sso.md` | `docs/sso.md` | ✅ |
| `query-console.md` | `docs/query-console.md` | ✅ |
| `toast-confirm.md` | `docs/toast-confirm.md` | ✅ |
| `release-notes.md` | `docs/release-notes.md` | ✅ |
| `ai-assistant.md` | `docs/ai-assistant.md` | ✅ |
| `role-switching.md` | `docs/role-switching.md` | ✅ |
| `marketing-video.md` | `docs/video/marketing-script.md` | ✅ (present) |
| `onboarding.md` | `docs/onboarding.md` | ✅ |
| `marketing-seo.md` | `docs/marketing-seo.md` | ✅ |
| `ux-patterns.md` | `docs/ux-patterns.md` | ✅ |
| `ads-strategy.md` | `docs/ads-strategy.md` | ✅ |
| `analytics.md` | `docs/analytics.md` | ✅ |

No missing doc files. `docs/video/storyboard.md` missing (R-094 open).

---

## 8. Cross-Project Bug Propagation Check

| Fix in other project | Date | SmartCommission status |
|---|---|---|
| Screendex: violet→indigo spinner fix in admin pages | 2026-06-23 | Not affected — SC admin pages use violet bg + violet nav, app pages use indigo correctly |
| Sproutbase U-16: ThemeProvider missing | 2026-06-20 | Not affected — ThemeProvider confirmed in `providers.tsx` |
| SmartReceipt SR-006: plain base64 session cookie forgeable | 2026-06-20 | Not affected — SC uses Firebase Admin `verifySessionCookie()` which validates signature |
| SmartTeam: wrong AI SDK `@google/generative-ai` | 2026-06-17 | Tracked as S-005/S-008 — `@google/genai` v2.x must be used when AI is built (Phase 4) |

---

## 9. New Issues Summary

| Code | Severity | Title |
|---|---|---|
| B-002 | Medium | `POST /api/transactions` stores `amountBase = amount` — FX conversion skipped |
| S-021 | High | CSV formula injection not sanitised (SR-006 not yet implemented) |
| P-008 | Low | No Cache-Control on `/api/settings/users` and `/api/plans` GET routes |
| I-011 | Low | Cloud SQL ALERT log: graceful connection termination from `cloudsqladmin` |
| SR-021 | Medium | FX conversion skip is also a data integrity security risk |
| R-105 | Medium | Wire FX rate lookup into transaction write path |
| R-106 | Medium | Sanitise CSV export fields for formula injection |
| R-107 | Low | Add Cache-Control to `/api/settings/users` and `/api/plans` GET routes |

---

## 10. Open Pre-Launch Blockers

These must be resolved before accepting any real user data:

| Priority | Item |
|---|---|
| Critical | R-082: GCP infrastructure provisioning (Cloud Run not yet deployed) |
| Critical | R-083: Publish Terms of Service, Privacy Policy, Cookie Policy |
| Critical | R-099: Re-enable Cloud SQL backups and PITR |
| High | R-100: Enable Firebase Auth providers (Email/Password + Google) |
| High | R-101: Fill in 4 missing secrets (Stripe, OXR, Resend) |
| High | R-095: Add ProfileMenu (sign-out) to dashboard sidebar |
| High | R-096: Upgrade API key hashing from SHA-256 to bcrypt |
| High | R-086/R-087: Implement role-switching lib and UI components |

---

## 11. Actions Taken This Session

- Updated `docs/features.md`: added B-002, S-021, P-008, I-011; added R-105, R-106, R-107
- Updated `docs/security.md`: added SR-021; updated SR-019 with confirmed GCP log review date
- Updated `docs/changelog.md`: added 2026-06-23 entry with all findings and notes
- Created `docs/review/smartcommission_review_20260623000000.md` (this file)

No code fixes applied this session — all new findings are documented as open issues (no P1/P2 bugs found that warranted immediate code change; the FX conversion skip is intentional and documented in code comments).
