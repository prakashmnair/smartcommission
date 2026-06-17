# SmartCommission — Architecture Decision Records

ADRs are numbered sequentially. Never delete or overwrite an ADR — supersede it with a new one.

---

## ADR-001: Multi-Tenant Architecture — Row-Level Tenancy

**Date:** 2026-06-18
**Status:** Accepted

### Context

SmartCommission is a SaaS platform serving multiple customer organisations. We need to choose a multi-tenancy strategy. The main options are:

1. **Separate databases per tenant** — Each org gets its own PostgreSQL database or schema. Strongest isolation; highest operational complexity; schema migrations must run N times; very high cost at scale.
2. **Separate schema per tenant** — Each org gets its own PostgreSQL schema within one database. Good isolation; moderate complexity; still requires per-schema migrations; schema limit in Postgres is ~10,000 before performance degrades.
3. **Row-level tenancy (shared schema)** — Single database, single schema. Every table has an `organisationId` column. Tenant isolation enforced at the application layer and optionally via PostgreSQL Row Level Security (RLS). Simplest to operate and scale; lowest cost; requires rigorous application-layer enforcement.

SmartCommission's early-stage target market is SMB to mid-market (dozens to hundreds of tenants with thousands of users), not hyperscale enterprise with tens of thousands of tenants. Operational simplicity and cost efficiency at this stage are critical. We are a small team.

### Decision

Use **row-level tenancy** (option 3): a single shared PostgreSQL schema where every table carries an `organisationId` foreign key. Every API route and service function receives an `organisationId` from the authenticated session and adds it as a filter on every query. PostgreSQL Row Level Security (RLS) is enabled as a defence-in-depth layer, enforced at the database level using `SET app.current_org_id = :orgId` before each query.

### Consequences

**Positive:**
- Dramatically simpler schema migrations — one migration runs once.
- Lower infrastructure cost — one Cloud SQL instance serves all tenants.
- Easier cross-org analytics (for superadmin and future consolidated reporting).
- Simpler backup/restore — one database to manage.
- Straightforward onboarding — no per-tenant provisioning delay.

**Negative / Trade-offs:**
- Application code must never forget the `organisationId` filter — a missed filter is a data leak. Mitigated by: (a) a mandatory `getEffectiveOrganisation()` helper that every route must call; (b) Prisma middleware that validates `organisationId` is present on every query to a tenanted table; (c) RLS as a database-level backstop.
- A single noisy tenant can affect database performance for all tenants. Mitigated by: Cloud SQL read replicas; connection pooling (PgBouncer); per-org query time limits.
- Enterprise prospects with strict data residency requirements may require schema or database isolation. Mitigated by: architecture supports migrating a single large tenant to an isolated schema if contractually required.

**Follow-up actions:**
- Implement Prisma middleware that enforces `organisationId` on all writes and reads.
- Implement PostgreSQL RLS policies for the `transactions`, `earnings_records`, `payments`, and `audit_logs` tables (highest risk tables).
- Add an automated test suite that verifies cross-tenant data isolation (attempt to read another org's data with a valid but wrong-org session token — must return 404 or empty).

---

## ADR-002: Calculation Engine — Rule-Based Engine (Not Spreadsheet-Based)

**Date:** 2026-06-18
**Status:** Accepted

### Context

Incentive compensation calculations range from simple (flat 5% of ARR) to extremely complex (tiered progressive rates with accelerators, overlay splits, clawbacks, MBO weightings, and holdbacks). We need to decide how to implement the calculation engine. The main options are:

1. **Spreadsheet-based engine** — Store formulas as spreadsheet-like expressions (similar to Excel/Google Sheets). CaptivateIQ uses this approach. Familiar to RevOps users; limited auditability; hard to scale; difficult to version-control; prone to formula reference errors.
2. **General-purpose formula language** — Build a custom expression language (like Anaplan's formula language or SAP Commissions' rules language). Very flexible; very high implementation complexity; steep learning curve for users.
3. **Structured rule-based engine** — Plan rules are stored as structured JSON configs (typed rule definitions: TIERED_PROGRESSIVE, ACCELERATOR, CAP, CLAWBACK, etc.). The engine executes rules sequentially and deterministically. Rules are configured through a visual UI, not by typing formulas.
4. **LLM-generated code** — Describe the plan in natural language; an LLM generates calculation code. Experimental; unpredictable; not auditable; not ready for financial-grade use.

Our primary users are RevOps and Finance professionals who need transparency, auditability, and correctness guarantees. They are familiar with compensation plan concepts but should not need to write code or complex formulas.

### Decision

Use **option 3: a structured rule-based engine**. Plan rules are stored as typed JSON configurations. The engine processes rules in a defined execution order: (1) credit allocation, (2) attainment calculation, (3) rate determination (tiers/accelerators), (4) gross earnings calculation, (5) adjustments (clawbacks, holdbacks, caps, floors), (6) audit trail generation.

For advanced use cases (Phase 4), a **formula builder** layer will be added that compiles visual formula expressions into the same structured rule JSON, extending the engine without replacing it.

### Consequences

**Positive:**
- Deterministic and auditable — every calculation step is logged and replayable.
- Version-controllable — rule configs are JSON stored in the database with full change history.
- Testable — individual rules can be unit-tested against fixture data.
- Performant — structured data is faster to process than interpreted formulas.
- UI-driven — RevOps can build plans without writing code; the visual plan builder generates the rule JSON.
- Extensible — new rule types can be added to the engine without changing the schema.

**Negative / Trade-offs:**
- Less flexible than a general-purpose formula language for extremely unusual plan structures. Mitigated by: a `CUSTOM_FORMULA` rule type that allows a sandboxed expression for edge cases (Phase 2).
- Higher initial implementation cost than a spreadsheet approach — requires building the rule type library.
- Upgrades to rule configs require data migration (if rule JSON schema changes). Mitigated by: versioned rule config schemas; migration scripts.

**Follow-up actions:**
- Define and implement the full rule type library for Phase 1 (FLAT_RATE, TIERED_PROGRESSIVE, TIERED_RETROACTIVE, ACCELERATOR, DECELERATOR, CAP, FLOOR, CLAWBACK, HOLDBACK, DRAW, BONUS_POOL, MBO, SPIF).
- Build the calculation audit trail writer (step-by-step trace stored on each EarningsRecord).
- Design the visual plan builder UI that generates rule JSON — no user should ever need to write raw JSON.
- Write a comprehensive test suite for the engine: unit tests per rule type; integration tests for complex multi-rule plans.

---

## ADR-003: Real-Time vs Batch Calculations

**Date:** 2026-06-18
**Status:** Accepted

### Context

Commissions can be calculated in two modes:

1. **Fully real-time** — Every time a transaction is created or updated, recalculate affected earnings immediately and synchronously. Reps see exact up-to-the-minute earnings. Very high computational load; risk of inconsistent state during concurrent updates; complex rollback handling.
2. **Fully batch** — Calculations run on a schedule (nightly, period-close). Reps see earnings that may be hours or days behind. Simple; predictable; scalable; but poor UX for real-time visibility.
3. **Hybrid: batch with real-time preview** — Primary calculation is batch (nightly delta + period-close). A lightweight real-time preview is available in the what-if calculator and on transaction ingestion (shows projected impact, not committed earnings). This is the approach used by Spiff and Xactly.

### Decision

Use the **hybrid approach (option 3)**: primary calculations are batch (automated nightly delta runs + manual period-close runs). Real-time previews are computed on-demand for the what-if calculator and shown as "projected" in the portal, clearly distinguished from "confirmed" earnings.

Nightly delta runs process only new and changed transactions since the last run (incremental processing). Period-close runs process all transactions for the period and produce the authoritative earnings records used for payment.

### Consequences

**Positive:**
- Batch processing is reliable, predictable, and scalable to 10M+ transactions.
- Simpler transactional model — no risk of partial updates from concurrent recalculations.
- Clear "projected vs confirmed" distinction in the portal aligns with how reps and Finance actually think about commissions.
- Nightly delta runs keep data fresh enough for daily portal use.
- Period-close runs provide the authoritative, auditable record for payment.

**Negative / Trade-offs:**
- Reps see "confirmed" earnings that are up to 24 hours behind. Mitigated by: real-time "projected" figures in the portal clearly labelled as estimates; nightly runs keep the lag short.
- Period-close runs are a manual step — Finance must trigger them before payment. Mitigated by: automated reminders; configurable auto-trigger on the last business day of the period.

**Follow-up actions:**
- Build a Cloud Tasks-based job queue for calculation runs (retry, monitoring, alerting on failure).
- Implement incremental (delta) calculation logic — track a `lastProcessedAt` watermark per org.
- Build the "projected earnings" API endpoint that runs a lightweight non-persisting calculation for portal previews and what-if queries.
- Add monitoring and alerting: alert on-call if a nightly run fails or takes >30 minutes.

---

## ADR-004: CRM Integration Strategy — Native Connectors (Not iPaaS)

**Date:** 2026-06-18
**Status:** Accepted

### Context

SmartCommission needs to ingest deal data from CRM systems (Salesforce, HubSpot, Pipedrive, Dynamics). Options:

1. **iPaaS (Zapier, Make, Workato, Boomi)** — Use a third-party integration platform. Low initial development effort; high per-org ongoing cost (iPaaS pricing scales with transaction volume); less control over error handling; dependent on third-party uptime; data passes through a third party (privacy/compliance concern).
2. **Native connectors (built in-house)** — Build and maintain direct API integrations with each CRM. Higher initial development effort; full control over data flow, error handling, field mapping, and sync frequency; lower marginal cost at scale; data stays in SmartCommission and the CRM only.
3. **Customer-managed CSV/API** — Require customers to push data via CSV upload or REST API. Lowest SmartCommission development effort; highest customer effort; poor UX; not viable for mid-market and enterprise customers.

### Decision

Build **native connectors** for the top 4 CRMs (Salesforce, HubSpot, Pipedrive, Microsoft Dynamics 365) in Phase 3. Phase 1 MVP uses CSV import and the public REST API as the integration path. Native connectors will not use an iPaaS layer.

Each native connector will:
- Use OAuth 2.0 to authenticate with the CRM
- Perform incremental delta syncs (only changed records since last sync)
- Use a field mapping UI for flexible configuration
- Store credentials in GCP Secret Manager (never in the database)
- Run syncs as Cloud Tasks jobs (asynchronous, retryable)

### Consequences

**Positive:**
- No per-transaction iPaaS cost — important for high-volume customers.
- Full control over sync logic, error handling, and retry behaviour.
- Data privacy: deal data only moves directly between the CRM and SmartCommission; no third-party processor in between.
- Better UX: managed connection with real-time sync status; no need for customer to configure Zapier.
- Competitive: native CRM connectors are a key differentiator vs smaller competitors that rely on iPaaS.

**Negative / Trade-offs:**
- Each native connector requires significant development effort and ongoing maintenance as CRM APIs change.
- We cover only 4 CRMs natively; customers on other systems must use CSV or API.
- CRM API rate limits must be managed carefully for high-volume orgs.

**Follow-up actions:**
- Phase 1: publish comprehensive CSV import and REST API documentation so early customers can self-integrate.
- Phase 3: build Salesforce connector first (largest addressable market), then HubSpot, Pipedrive, Dynamics.
- Design a common `IntegrationAdapter` interface so each connector implements the same interface — makes adding new connectors easier.
- Store all CRM OAuth tokens in GCP Secret Manager with automatic rotation reminders.
- Build a sync monitoring dashboard in the admin UI: last sync time, records synced, errors, manual re-sync button.

---

## ADR-005: Multi-Currency Handling — Store Both Original and Base Currency

**Date:** 2026-06-18
**Status:** Accepted

### Context

Sales teams operate globally. Deals are closed in local currencies (USD, AUD, GBP, EUR, SGD, etc.) but commission payout may be in a different currency. Exchange rates fluctuate. The handling of multi-currency data has significant implications for:

- Calculation accuracy (using the right rate at the right time)
- Financial reporting (consistent base currency for accruals)
- Rep transparency (understanding how their deal converted)
- Audit trail (which rate was used and when)

Options:

1. **Store amounts in base currency only (at import time)** — Convert all amounts to the org's base currency when the transaction is imported, using the current exchange rate. Simple; but rate is locked at import time regardless of when the deal closed; rep cannot see original currency amount.
2. **Store amounts in original currency only** — Keep amounts in the original transaction currency. Convert to base currency at calculation time. Exchange rate at calculation time may differ from deal close date — creates volatility in commission calculations.
3. **Store both original and base currency, with locked conversion rate** — Store the original amount and currency, the base amount, the exchange rate used, and the date of the rate. Rate is locked at a configurable point: deal close date (most common for revenue recognition), payment date, or import date.

### Decision

**Option 3: store both original currency and base currency** on every Transaction record. The conversion rate is locked at the **deal close date** by default (configurable per plan to use payment date instead). The exchange rate, its date, and its source are stored on the Transaction record.

Exchange rates are sourced daily from a configurable provider (Open Exchange Rates API initially; XE as premium option; manual override available). Rates are cached in the `exchange_rates` table. If no rate is available for the close date, the nearest prior rate within 7 days is used; otherwise, the import is flagged for manual review.

### Consequences

**Positive:**
- Full transparency: reps and Finance can see both the original currency amount and the converted amount, and exactly which rate was used.
- Accurate revenue recognition: deal close date is the correct economic event for locking exchange rates (aligns with ASC 606 / IFRS 15).
- Stable commission calculations: the rate is locked at deal close, so a commission calculated today will match one calculated next month.
- Audit-ready: every transaction carries its own exchange rate record.

**Negative / Trade-offs:**
- Slightly more complex data model (two amount columns per transaction).
- Exchange rate provider dependency: must handle API unavailability gracefully.
- Historical data migration must include exchange rates for past close dates — may require bulk-loading historical rates from the provider.

**Follow-up actions:**
- Build a daily Cloud Scheduler job to fetch and cache exchange rates from Open Exchange Rates API for all currency pairs used in active orgs.
- Store rates in the `exchange_rates` table; never fetch rates dynamically during a calculation run (use cached rates only — ensures reproducibility).
- For plan configuration: add a `exchangeRateLockDate` setting (CLOSE_DATE / PAYMENT_DATE / IMPORT_DATE).
- Build a "rate not found" exception in the calculation engine that flags the transaction for manual review rather than silently using a wrong rate.

---

## ADR-006: Separate AuditLog and SecurityLog Models

**Date:** 2026-06-18
**Status:** Accepted

### Context

The CLAUDE.md standard requires both `AuditLog` and `SecurityLog` Prisma models. The question is whether these should be a single table (with a type discriminator) or two separate tables.

**Option 1: Single table** — All events in one `logs` table with a `logType` column (AUDIT / SECURITY). Simple schema; harder to enforce separate retention periods and separate access controls.

**Option 2: Separate tables** — `AuditLog` for application-level changes (CRUD on plans, calculations, payments) and `SecurityLog` for security events (logins, permission changes, impersonation). More complex schema; cleaner separation of concerns; enables separate retention policies and separate RBAC controls.

### Decision

Use **separate tables** (Option 2). `AuditLog` and `SecurityLog` serve different purposes and different audiences:
- `AuditLog` is for operational audit (Finance, compliance review, SOX controls matrix).
- `SecurityLog` is for security monitoring (SUPER_ADMIN, security officers, SIEM integration).

CRITICAL `SecurityLog` events (SUPERADMIN_GRANTED, IMPERSONATION_STARTED) are additionally written to GCP Cloud Logging for tamper-evident off-database storage.

### Consequences

- Two separate Prisma models to maintain, but with independent retention rules (7yr audit vs 3yr security).
- Superadmin UI needs two separate filterable/searchable log viewer tabs.
- Security log queries are faster because the table is narrower and has fewer rows (security events are less frequent than every CRUD operation).

---

## ADR-007: Firebase Auth with Server-Side Session Cookies (Not JWT in Browser)

**Date:** 2026-06-18
**Status:** Accepted

### Context

Firebase Authentication provides ID tokens (JWTs) to the client after login. The question is how to handle these on the server for API authentication:

**Option 1: Pass Firebase ID token on every request** — Client sends the Firebase ID token as a `Bearer` token in the `Authorization` header on every API call. Server verifies with Firebase Admin SDK on every request. Simple; but ID tokens are short-lived (1 hour), client must handle refresh, tokens are accessible to JavaScript (XSS risk if stored in localStorage).

**Option 2: Exchange for server-side session cookie** — On login, client sends Firebase ID token to the server. Server verifies it, then issues its own HttpOnly session cookie (via Firebase `auth.createSessionCookie()`). Client uses the cookie for all subsequent requests. Cookie is HttpOnly and Secure — not accessible to JavaScript.

### Decision

Use **Option 2: server-side session cookies**. The key reasons:
- HttpOnly + Secure cookie prevents XSS token theft (ID tokens in localStorage are a common vulnerability).
- Session cookies can be explicitly revoked server-side on logout or account suspension (`auth.revokeRefreshTokens()`).
- Session lifetime is configurable (7 days default) and consistent.
- Standard web session semantics familiar to the Next.js middleware.

### Consequences

- Slightly more complex authentication flow (one extra round-trip to exchange token for cookie).
- SameSite=Strict cookie may interfere with some SSO redirect flows (documented in SR-011).
- Server-side session validation on every API request has negligible performance impact (Firebase Admin SDK caches the JWKS keys).
