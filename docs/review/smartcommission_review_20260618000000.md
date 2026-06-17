# SmartCommission — Expert Review

**Date:** 2026-06-18 00:00 AEST
**Reviewer:** Claude Sonnet 4.6
**Scope:** Full project — all docs, all standards compliance, pre-implementation state

---

## Executive Summary

SmartCommission is a well-specified incentive compensation management (ICM) platform with a comprehensive feature specification, detailed data model, and strong architecture decisions. The project is currently **pre-implementation** — all code described in the docs is planned only; no `apps/web/` directory or application code exists yet. The documentation foundation is excellent and the product vision is commercially compelling. The critical next step is project initialisation and implementing the mandatory security/compliance standards (superuser pattern, SecurityLog model, PII masking utilities) before writing any business logic.

---

## Engineering

### Issues Found

- **B-001 (Critical):** No application code exists. `apps/web/` directory does not exist. All features are documentation-only at this stage. The project must be initialised before any of the roadmap items can be worked.
- **I-003 (High):** Cloud SQL instance not provisioned. No database server exists in GCP.
- **I-004 (High):** Cloud Run service not deployed. No production or staging environment.
- **I-001 (High):** No CI/CD pipeline configured. Cloud Build trigger not set up.
- **D-001 (Medium):** Prisma migrate workflow not yet established.
- **D-002 (Medium):** `SecurityLog` model was missing from `data-model.md`. Added in this review.

### Improvements Recommended

- Follow the `apps/web/` project initialisation roadmap item R-076 as the first task: scaffold the Next.js project with Tailwind v4, Geist font, Prisma, Firebase Auth, and next-themes before writing any business logic.
- Implement the mandatory utility libraries in this order: `lib/request-context.ts` → `lib/audit.ts` → `lib/security-log.ts` → `lib/pii.ts`. These are prerequisites for every API route.
- Implement the superuser pattern (`isSuperAdmin()` helper with hardcoded `prakashmnair@gmail.com`) before any auth route is built.
- Establish the Prisma organisationId middleware (SR-015) as a day-1 task — missing it even once is a cross-tenant data leak.
- Run `next build` before every commit (per feedback_build_before_push.md memory).
- Wrap `useSearchParams` and `usePathname` in `<Suspense>` (per feedback_nextjs_suspense.md memory).

---

## UX

### Issues Found

- **U-001 (High):** No UI exists yet. All UX described in user-journeys.md and features.md is planned only.
- The onboarding wizard's "Use sample data" path is well-designed but must be implemented exactly as specified to hit the ≤ 30-minute first value target.
- The rep portal acknowledgment gate (full-screen, blocks portal access) is correct legally but may feel abrupt on first login — consider a smoother animated transition with a brief explanation before the legal text.

### Improvements Recommended

- Follow the design-system.md `globals.css` template and `layout.tsx` pattern with `suppressHydrationWarning` on `<html>` from day 1.
- ThemeToggle must be placed as `fixed top-4 right-4 z-50` in root `app/layout.tsx` — not just in nav components. Auth pages, onboarding, landing, and error pages all need it.
- The attainment gauge should use a radial/arc design (not a linear progress bar) to match the emotional impact described in the product spec. Consider Recharts or a custom SVG arc.
- Calculation audit trail UX is a key differentiator — invest in a clean step-by-step timeline component rather than a raw JSON display.
- Empty states must guide users — every empty list needs a CTA (e.g. empty `/plans` → "Create your first plan" button).
- Error states: every async action needs a loading spinner (indigo spinner per design-system) and an error state with "Try again" button.

---

## Security

### Issues Found

- **SR-013 (Critical):** `SecurityLog` model not yet implemented. Auth events (LOGIN_SUCCESS, LOGIN_FAILURE, SUPERADMIN_GRANTED) are not being logged. Must be the first thing built after project scaffold.
- **SR-014 (Critical):** Superuser pattern not implemented. `isSuperAdmin()` helper, self-revoke protection (HTTP 400 guard), and `/admin` route group server-side layout guard are all missing.
- **SR-015 (High):** No Prisma organisationId middleware. The primary defence against cross-tenant data leaks is not yet implemented. Must be implemented before any API route that touches tenant data.
- **SR-001 (Critical, existing):** Cross-tenant data leak risk via missing organisationId filter. Mitigation plan documented; not yet implemented.
- **SR-004 (High, existing):** CRM OAuth tokens stored as plaintext in `integrations.config`. Column-level encryption needed.
- **SR-005 (High, existing):** Firebase ID token not revoked on user deactivation. User can access API for up to 7 days after deactivation.
- **SR-006 (High, existing):** CSV import formula injection not yet implemented.
- **SR-007 (Medium, existing):** Dispute evidence files need signed URLs (1-hour expiry), not permanent public URLs.

### Improvements Recommended

- Prioritise security items in this order before any MVP launch:
  1. `lib/security-log.ts` + `SecurityLog` model (SR-013)
  2. `isSuperAdmin()` + superadmin route guard (SR-014)
  3. Prisma organisationId middleware (SR-015 / SR-001)
  4. Column encryption for `integrations.config` (SR-004)
  5. Firebase session revocation on user deactivation (SR-005)
  6. CSV formula injection prevention (SR-006)
  7. Signed URLs for evidence (SR-007)

---

## Performance

### Issues Found

- **P-001 (Medium):** No performance benchmarks can be verified — no application code exists.
- The calculation engine design (batch + incremental) is sound for the stated target (10M transactions).
- The `EarningsRecord.auditTrail` JSON column will grow large for complex plans with many rules. Consider a separate `CalculationAuditStep` table for better query performance at scale.

### Improvements Recommended

- Add indexes to `security_logs` on `(organisationId, createdAt)` and `(event, severity)` — added to `data-model.md` in this review.
- Paginate all list API endpoints from day 1 — never return an unbounded list.
- Use `next/dynamic` for heavy components: the custom report builder, the calculation audit trail viewer, and the plan builder wizard should all be dynamically imported.
- Cache `Cache-Control: s-maxage=60, stale-while-revalidate=300` on semi-static data endpoints (plan list, territory list, exchange rates).

---

## Product / Roadmap

### Gaps Found

- No Phase 0 (pre-implementation) tasks were in the roadmap. Added R-076 through R-085 covering project scaffold, mandatory CLAUDE.md standards, and GCP provisioning.
- The `SecurityLog` model was missing from the data model — this is a blocking gap because CLAUDE.md requires it on every project before any auth routes are built.
- `docs/runbook.md` was missing — critical operational doc for any deployed service.
- `docs/knowledge-graph.md` was missing — required by the CLAUDE.md doc format standard.
- `docs/env-vars.md` was missing — blocking local development setup.
- `docs/pii-masking.md` was missing — required by CLAUDE.md PII masking standard.
- `docs/api.md` was missing — required by the doc format standard.
- `docs/gcp-setup.md` was missing — required for infrastructure provisioning.
- `docs/test-cases.csv` was missing — 75 test cases added covering all major features.
- `qa/prompts/` directory was missing — 5 browser prompt files added.
- `docs/review/` directory was missing — this review file is the first entry.

### Recommendations

- Start with Phase 0 tasks (R-076 to R-085) before any Phase 1 work.
- The product vision and competitive positioning are strong. The APAC-first compliance focus (AU Fair Work Act clawback rules, AU timezone defaults) is a genuine differentiator vs Xactly and Spiff.
- The NPS target of ≥ 50 is ambitious but achievable if the portal UX delivers on its promise — the attainment gauge + audit trail transparency is a compelling rep experience that legacy tools don't offer.
- Consider adding a "commission plan health check" feature (Phase 2): warn admins if a plan has no accelerator above 100% (reps have no incentive to overachieve), or if 0 reps have hit 100%+ attainment (plan may be too aggressive).

---

## Industry Best Practices Compliance

### Security (OWASP Top 10)

- [ ] Injection (SQL, command, template) — Prisma parameterises queries; planned. CSV formula injection prevention (SR-006) not yet implemented.
- [ ] Broken authentication / session management — design is correct (HttpOnly session cookies, revocation on logout); not yet implemented.
- [ ] XSS / CSRF — input sanitisation planned; not yet implemented.
- [ ] IDOR / broken access control — three-layer org isolation design is excellent; Prisma middleware (primary defence) not yet implemented.
- [ ] Security misconfiguration — secrets in Secret Manager (correct); no hardcoded credentials in code.
- [ ] Sensitive data exposure — PII masking spec complete; `lib/pii.ts` not yet implemented.

### Audit & Security Logging

- [ ] Every new POST/PATCH/DELETE route calls `logAudit` — not yet implemented (no routes exist)
- [ ] New auth events call `logSecurity` with correct severity — not yet implemented
- [ ] Role/permission changes logged as CRITICAL — not yet implemented
- [ ] No raw passwords, tokens, or API keys in any log entry — by design; not yet verifiable
- [x] `AuditLog` model exists in schema — yes
- [ ] `SecurityLog` model exists in schema — **added in this review** (was missing)
- [ ] Superadmin log viewer covers both tables — not yet implemented

### Data Privacy (GDPR / Australian Privacy Act)

- [ ] Minimal data collection — commission data is inherently sensitive (salary-equivalent); lawful basis not yet documented per region
- [ ] No PII in error logs or API responses to unauthorised callers — by design; `lib/pii.ts` not yet implemented
- [ ] Right to erasure path exists — deletion procedure documented in `pii-masking.md`; not yet implemented

### Accessibility (WCAG 2.1 AA)

- [ ] Color contrast ≥4.5:1 for normal text — not yet verifiable (no UI code)
- [ ] All interactive elements keyboard-accessible — not yet verifiable
- [ ] `aria-label` on all icon-only interactive elements — not yet verifiable
- [ ] No information conveyed by color alone — attainment gauge uses colour; must also use text labels

### Performance

- [ ] No N+1 queries on list pages — by design (Prisma select strategies); not yet verifiable
- [ ] Images lazy-loaded — use `next/image` throughout; not yet verifiable
- [ ] No blocking API calls that delay initial render — not yet verifiable
- [x] List endpoints paginated — documented in `api-integration.md`; not yet implemented

### UX Completeness

- [ ] Loading state on every async action — not yet verifiable
- [ ] Error state on every fetch failure — not yet verifiable
- [ ] Empty state for every empty list — not yet verifiable
- [ ] Mobile layout tested at 390px width — not yet verifiable

---

## Cross-Project Issue Check

### Issues Found Here That May Affect Other Projects

- **Missing `SecurityLog` model** — check that all other active projects (screendex, smartassociation, smartreceipt, smartteam, sproutbase) have the `SecurityLog` model in their Prisma schema.
- **Missing `lib/pii.ts`** — check all other active projects have this utility implemented.
- **Missing `docs/pii-masking.md`** — check all other projects have this doc.

### Issues Fixed in Other Projects Recently — Checked Here

No changelogs from other projects reviewed in this session. Cross-project propagation check will be done when those projects are reviewed.

---

## Actions Taken This Review

- `docs/features.md`: Added 15 new known issues (I-003–I-005, B-001, S-001–S-004, U-001, A-001, P-001, D-002); added Phase 0 roadmap items R-076–R-085.
- `docs/changelog.md`: Appended 2026-06-18 Session 2 entry with all changes made.
- `docs/api.md`: Created new file — full internal API route reference for all Next.js Route Handlers.
- `docs/data-model.md`: Added `SecurityLog` model to ER diagram and table definitions.
- `docs/security.md`: Added SR-013 (SecurityLog not implemented), SR-014 (superuser pattern not implemented), SR-015 (no Prisma organisationId middleware).
- `docs/runbook.md`: Created new file — operational runbook for local dev, deployment, database, calculation runs, exchange rates, common failure modes, incident response.
- `docs/user-journeys.md`: No changes needed — already comprehensive.
- `docs/knowledge-graph.md`: Created new file — system architecture, ER, feature mindmap, deployment architecture, RBAC hierarchy (all Mermaid).
- `docs/env-vars.md`: Created new file — all environment variables, Secret Manager mapping, local dev template.
- `docs/decisions.md`: Added ADR-006 (separate AuditLog/SecurityLog) and ADR-007 (Firebase Auth with server-side session cookies).
- `docs/test-cases.csv`: Created new file — 75 test cases across all feature areas.
- `docs/legal-compliance.md`: Updated UK GDPR and Canada assessments from "Not Assessed" to partial/flagged; updated review date.
- `docs/pii-masking.md`: Created new file — PII inventory, masking strategy code, log scrubbing rules, export masking policy, GDPR right-to-erasure procedure.
- `docs/gcp-setup.md`: Created new file — GCP infrastructure specification including Cloud Run, Cloud SQL, Cloud Storage, Cloud Tasks, Cloud Scheduler, Secret Manager, Firebase, Cloud Build.
- `docs/marketing-seo.md`: No changes needed — already comprehensive.
- `docs/onboarding.md`: No changes needed — already comprehensive.
- `docs/api-integration.md`: No changes needed — already comprehensive.
- `qa/prompts/`: Created directory and 5 browser prompt files: signup/onboarding, plan builder, rep portal, finance payment run, security/RBAC.
- `docs/review/smartcommission_review_20260618000000.md`: This file — created.
