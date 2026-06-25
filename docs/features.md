# SmartCommission — Features, Issues & Roadmap

The most complete, transparent, and easy-to-use incentive compensation platform for sales teams of any size.

---

## Product Vision

SmartCommission is a self-contained incentive compensation management (ICM) platform that enables companies of all sizes to design, calculate, manage, and pay sales commissions accurately and transparently. Built for Sales Operations and Revenue Operations teams, it eliminates spreadsheet-based commission tracking, reduces disputes, and gives every sales rep real-time visibility into their earnings. The platform is designed to serve SMB and mid-market organisations immediately, with the architecture and depth to scale to enterprise.

---

## Platform Roadmap

| Phase | Platform | Status |
|---|---|---|
| 1 — MVP (Core Calculation Engine) | Web (Next.js) | ⬜ Planned |
| 2 — Participant Portal + Reporting | Web (Next.js) | ⬜ Planned |
| 3 — Integrations + Advanced Analytics | Web (Next.js) + API | ⬜ Planned |
| 4 — AI + Enterprise Features | Web (Next.js) + API + ML | ⬜ Planned |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router, Tailwind CSS v4, Geist font (next/font/google), lucide-react icons, next-themes (light/dark mode) |
| Auth | Firebase Auth (email/password, Google OAuth, SAML SSO), session cookies |
| Database | PostgreSQL (Cloud SQL), Prisma ORM |
| API | Next.js Route Handlers (REST), OpenAPI 3.0 spec |
| Background jobs | Cloud Tasks (GCP) |
| File storage | Cloud Storage (GCP) |
| CI/CD | Cloud Build → Cloud Run |
| Monitoring | Cloud Logging, Cloud Monitoring, Error Reporting |
| Email | Resend |
| Payments | Stripe (platform billing) |

---

## Pages / Screens

| Route / Screen | Description |
|---|---|
| `/` | Marketing landing page with value proposition, pricing, and CTA |
| `/login` | Sign in with email/password or Google OAuth |
| `/signup` | Create account — org name, admin email, password |
| `/onboarding` | Post-signup setup wizard (org → users → first plan → import) |
| `/dashboard` | Admin/manager overview: pipeline, accruals, team attainment |
| `/plans` | List of compensation plans |
| `/plans/new` | Plan builder — step-by-step wizard |
| `/plans/:id` | Plan detail and rule editor |
| `/plans/:id/versions` | Plan version history |
| `/quotas` | Quota assignment grid (by rep/territory/period) |
| `/territories` | Territory management |
| `/transactions` | Raw transaction feed (imported from CRM/ERP) |
| `/calculations` | Calculation run management |
| `/calculations/:runId` | Calculation run detail with audit trail |
| `/earnings` | Earnings ledger (admin view: all reps) |
| `/payments` | Payment run management |
| `/payments/:runId` | Payment run detail |
| `/disputes` | Dispute management queue |
| `/reports` | Pre-built and custom report library |
| `/reports/builder` | Custom report builder |
| `/integrations` | CRM/ERP/HRIS connector management |
| `/settings` | Org settings, roles, permissions, payment schedules |
| `/settings/api-keys` | API key management |
| `/portal` | Sales rep portal — earnings, attainment, statements |
| `/portal/earnings` | Rep earnings dashboard with YTD and period breakdowns |
| `/portal/statements/:id` | Individual commission statement |
| `/portal/disputes` | Rep dispute submission and tracking |
| `/portal/plan` | Plan document view and e-acknowledgment |
| `/admin/orgs` | Superadmin: all organisations |
| `/admin/users` | Superadmin: all users |

---

## Core Features

### A. Plan Design & Administration

- **Compensation plan builder** — Visual, step-by-step wizard for creating commission plans. Define plan type, effective dates, eligible participants, quota linkage, credit rules, payout schedule, and approval workflow in a single guided flow. Plans are versioned — every change creates a new version without overwriting history.
- **Plan types supported** — Commission (straight, tiered, accelerating), bonus pool distribution, Management by Objectives (MBO) with weighted goals, SPIFs (short-term performance incentives), team/overlay incentives, and recognition awards.
- **Quota management** — Assign quotas at individual, team, territory, and product-line level. Quota periods aligned to plan periods. Quota import via CSV or direct CRM/ERP sync. Quota history maintained for retroactive calculation.
- **Territory management** — Define territories by geography (country/state/region/postcode), named account lists, industry vertical, or product line. Assign reps to territories with effective dates. Territory changes tracked for credit allocation purposes.
- **Tiered commission structures** — Define unlimited tiers with attainment thresholds (e.g. 0–50%: 0%, 51–100%: 5%, 101–125%: 8%, 126%+: 12%). Each tier can be a different rate type (flat, percentage, absolute). Tiers apply to the incremental amount within the tier ("progressive") or to the entire amount once a tier is crossed ("retroactive cliff").
- **Accelerators and decelerators** — Automatically increase commission rate above 100% attainment (accelerators) or decrease rate below a floor threshold (decelerators). Common pattern: 1x rate at 0–100%, 1.5x at 101–125%, 2x at 126%+.
- **Caps and floors** — Maximum payout cap (absolute dollar or percentage of OTE) per period or per deal. Minimum guarantee floors. Caps can be soft (tracked, reported) or hard (payout truncated).
- **Clawback rules** — Define clawback triggers: customer cancels within X months, payment not received within X days, fraud/misrepresentation discovered. Clawback can recover full payout, pro-rated payout, or a fixed penalty. Jurisdiction-aware constraints (e.g. California prohibits clawbacks on vested commissions).
- **Holdback / reserve provisions** — Withhold a percentage of earned commission (e.g. 20%) until the customer reaches a milestone (e.g. 90 days post-close). Released automatically when the milestone triggers.
- **Draw against commission** — Configure recoverable draws (advance is deducted from future earnings) or non-recoverable draws (floor guarantee with no recovery). Draw reconciliation tracked per pay period.
- **Advance commission payments** — Pay a portion of estimated commission upon deal close; true-up at end of period when full calculation runs.
- **Split credit** — Assign multiple reps credit on a single transaction. Supports: percentage splits (primary 60% / overlay 40%), full-credit splits (multiple reps each receive 100%), and multi-level splits (territory rep + national account manager + overlay specialist).
- **Overlay and specialist credit types** — Define overlay roles (pre-sales, SE, CS) with separate credit rules that don't reduce the primary rep's credit. Overlay rules can be fixed % or quota-linked.
- **Multi-currency support** — Transactions stored in original currency and base currency. Exchange rates sourced daily from an external provider (configurable: XE, Open Exchange Rates, manual). Plans can pay out in a different currency than the deal currency. Exchange rate lock at deal close date or payment date (configurable).
- **Effective dating** — Every plan, quota, territory assignment, and rule carries a start and optional end date. Changes are applied prospectively or retroactively based on configuration. System re-calculates affected periods automatically.
- **Plan versioning** — Every save creates an immutable version snapshot with author, timestamp, and change summary. Versions can be compared side-by-side. Prior versions cannot be edited — only superseded.
- **Plan templates library** — Pre-built templates for common SaaS and enterprise sales roles: AE (new business), AE (expansion), SDR (meetings booked), CSM (renewal/NRR), Channel partner, Named account. Templates are a starting point — fully customisable.
- **ASC 606 / IFRS 15 alignment** — Commission cost capitalisation: plans can flag commissions as capitalised (amortised over contract period) vs expensed immediately. Amortisation schedule generated per deal. Supports Finance team's period-end accrual reporting.

### B. Data Integration

- **CRM connectors** — Native, managed connectors for Salesforce, HubSpot, Pipedrive, and Microsoft Dynamics 365. Sync opportunities, closed-won deals, products, accounts, contacts, and custom fields. Field mapping UI with preview. Delta sync (only changed records) on a configurable schedule (every 15 min / hourly / daily).
- **ERP connectors** — Connectors for SAP S/4HANA, Oracle NetSuite, Xero, and QuickBooks. Pull invoices, payments received, and revenue recognition events. Useful for cash-basis or payment-received commission triggers.
- **HRIS connectors** — Connectors for Workday, BambooHR, and ADP. Sync headcount: employee hire/termination dates, role, territory, manager hierarchy, quota start dates. Automatically deprovision reps when terminated.
- **CSV / Excel import** — Upload CSV or XLSX files. Visual field-mapping UI maps source columns to SmartCommission fields. Preview first 20 rows before confirming import. Validation runs before commit: duplicate detection, type checking, referential integrity.
- **REST API for real-time data feeds** — External systems can push transactions in real time via the public API. Idempotent transaction IDs prevent duplicates. Immediate calculation preview available post-ingest.
- **Webhook support** — Subscribe to inbound webhook events from CRM (e.g. Salesforce outbound messages on opportunity close). No polling required — event-driven architecture.
- **Data validation and error reporting** — Every import produces a structured error report: row number, field, error type (missing required field, invalid type, duplicate ID, referential integrity failure). Errors downloadable as CSV. Partial imports supported (valid rows committed, errors skipped with report).
- **Duplicate detection** — Configurable duplicate rules: exact match on external ID, fuzzy match on deal name + close date + amount. On detection: skip, update, or flag for manual review.
- **Historical data import** — Bulk import past periods for migration from spreadsheets or legacy systems. Supports backdated transactions with explicit historical-period flags to avoid re-triggering live calculation workflows.
- **Staging / sandbox environment** — Each organisation has a sandbox that mirrors their production configuration. Test imports, plan changes, and calculation runs without affecting live data. Sandbox can be reset or refreshed from production at any time.

### C. Calculation Engine

- **Rule-based calculation engine** — Deterministic, auditable engine that processes rules sequentially. Not spreadsheet-based — every calculation is code-executed, version-controlled, and replayable. Rules are stored as structured JSON and evaluated against transaction and quota data.
- **Supported plan types** — Flat rate (% or $ per unit), tiered progressive, tiered retroactive, accelerating/decelerating, bonus pool (allocate a fixed pool by attainment rank), MBO (weighted goal scoring), SPIF (fixed reward on trigger event), team rollup (aggregate team attainment then distribute), and custom formula.
- **Complex formula builder** — Visual formula editor with a library of functions: `IF`, `SWITCH`, `MIN`, `MAX`, `SUM`, `AVERAGE`, `ROUND`, `LOOKUP`, `DATE_DIFF`, `ATTAINMENT_PCT`, `TIER_RATE`, `SPLIT_CREDIT`, and more. Formulas validated at save time with syntax checking and sample data preview.
- **Retroactive adjustments** — When a transaction is amended (e.g. deal size changed, close date corrected), the system can re-run the affected period's calculation and produce a delta adjustment record. Adjustments are tracked separately from original earnings and visible in the audit trail.
- **Team and hierarchy rollup** — Manager quotas and attainment calculated as the sum of all direct reports. Configurable: include/exclude specific subordinates. Supports multi-level hierarchy (rep → regional manager → VP).
- **Attainment % calculation** — `Attainment = (Actual Bookings / Quota) × 100`. Period-to-date and full-period projections. Handles partial periods (pro-rated quota for mid-period hires).
- **Credit split calculations** — Multi-rep credits processed atomically: each rep's share is calculated as their allocation % × transaction value, then run through their individual plan rules. Split totals validated to sum to ≤ 100% (or flagged if using full-credit splits that intentionally exceed 100%).
- **Bonus pool distribution** — Define a fixed budget pool (e.g. $500K for Q2). Distribute based on attainment rank, weighted attainment %, or forced distribution curve. Preview distribution before committing.
- **Real-time what-if preview** — On any transaction or quota change, show the projected payout impact before saving. Reps can use the what-if calculator in the portal to model "if I close $X more, I'll earn $Y."
- **Calculation audit trail** — Every earnings record links to a step-by-step audit trail: which transactions were included, which rules fired, what values were used, what the intermediate and final calculations were. No black box — every rep and auditor can trace exactly how a number was derived.
- **Period management** — Daily, weekly, bi-weekly, monthly, quarterly, and annual calculation periods. Multiple plan periods can coexist (e.g. a monthly commission with a quarterly bonus overlay). Period transitions handled automatically.
- **Calculation run scheduling** — Automated scheduled runs: nightly delta runs (process new transactions), period-close runs (final calculations for the period), and ad-hoc manual runs. Notifications on completion or failure.
- **Exception flagging** — Automatically flag anomalies: payout more than 3× the prior period average, attainment above 300%, zero attainment for a rep with transactions, negative earnings after adjustments. Exceptions routed to Finance for review before payment approval.
- **Performance** — Engine designed to process 10M+ transactions in a single run. Calculations run in parallel worker pools. Incremental processing (only re-calculate affected records on retroactive changes). Benchmark target: 1M transactions processed in under 5 minutes.

### D. Payments & Payroll

- **Payment schedule configuration** — Define payment frequency per plan: monthly (most common), semi-monthly (1st and 15th), bi-weekly, or quarterly. Payment dates configurable with lead time for payroll cutoff.
- **Payment run management** — Structured workflow: `DRAFT` (calculated, pending review) → `APPROVED` (Finance sign-off) → `EXPORTED` (sent to payroll) → `PAID` (confirmed). Each stage requires explicit action; cannot skip stages.
- **Payroll system integration** — Export payment files in the native format for: ADP (NACHA/EFT), Workday, MYOB, Xero, and generic CSV. Future: direct API push to payroll systems.
- **Manual payment adjustments** — Finance can add one-off adjustments to a payment run: correction payments, good-will payments, deductions. Each adjustment requires a reason code and an approver.
- **Payment holds and releases** — Hold an individual rep's payment (e.g. pending dispute resolution, terminated employee, compliance hold). Held payments accumulate and release in the next eligible run after the hold is lifted.
- **Draw reconciliation** — Recoverable draws tracked as a balance per rep. Each payment run deducts the outstanding draw balance from gross earnings. Draw balance report shows current exposure per rep.
- **Advance payment management** — Track advances paid mid-period. True-up at period close: if final earnings < advance paid, the difference is added to the outstanding balance (recoverable) or written off (non-recoverable).
- **Multi-currency payout** — Reps can be paid in their home currency. Conversion at the payment date exchange rate. Exchange rate variance tracked against the original calculation.
- **Tax withholding rules** — Configurable withholding rules by country/state: flat supplemental withholding rate (US: 22% federal supplemental), country-specific rates. Integration with payroll system passes gross commission; payroll handles withholding (SmartCommission does not remit taxes).
- **Payment history and audit** — Full history of every payment to every rep. Searchable by rep, period, plan, payment run. Exportable for payroll reconciliation.

### E. Participant Portal (Rep-facing)

- **Real-time earnings dashboard** — Rep sees their total earned commission YTD, current period earnings, and next estimated payment. Updates in near-real time as transactions are processed. Clear visual breakdown: base salary (if tracked) vs commission vs bonus.
- **Attainment gauge** — Visual gauge (0–150%+) showing current period attainment vs quota. Colour-coded: red (<50%), amber (50–99%), green (100%+), gold (125%+). Period-to-date and projected full-period attainment shown side by side.
- **YTD earnings breakdown** — Tabular and chart view of earnings by month and by plan component. Compare YTD to prior year. Export to PDF.
- **Commission statement by period** — Formal commission statement per pay period: earnings summary, transaction detail, adjustments, gross payout, deductions (draw recovery), net payment. Download as PDF. Legally formatted to meet statement requirements in AU/UK/US.
- **Deal-level earnings detail** — Every transaction that contributed to earnings shown with: deal name, close date, deal value, credit amount (after splits), commission rate applied, and commission earned. Rep can drill into the calculation audit trail for any deal.
- **Quota visibility** — Rep sees their quota per period, current attainment, and how many more deals/$ are needed to hit 100%, 125%, 150%. Quota changes are visible with the effective date and reason.
- **Plan document access and e-acknowledgment** — Rep views their current and historical plan documents. E-acknowledgment required before portal is fully accessible (configurable: optional vs mandatory). Timestamp, IP, and device captured on acknowledgment.
- **Dispute submission and tracking** — Rep can raise a dispute on any earnings line: select the transaction or period, describe the issue, attach evidence (screenshot, email). Dispute goes into a managed workflow with SLA tracking. Rep sees status updates in real time.
- **Mobile-responsive design** — Portal fully functional on mobile. Key screens optimised for phone: earnings gauge, recent transactions, dispute form.
- **Push notifications** — In-app and email notifications: payment processed, dispute status updated, new plan published, quota changed, acknowledgment required.
- **Leaderboards and gamification** — Opt-in leaderboards: team attainment ranking (anonymised or named, configurable by admin). Badges for milestones: first deal, 100% attainment, President's Club. Privacy controls: reps can opt out of public leaderboards.
- **Earnings forecast** — ML-powered forecast of full-period payout based on pipeline, historical close rates, and current attainment trajectory. Shown as a range (P10–P90) with a midpoint estimate.
- **What-if calculator** — Rep inputs: "if I close $X more deals at an average deal size of $Y, what will my commission be?" Runs against their actual plan rules and current attainment. Interactive slider interface.

### F. Manager & Finance Views

- **Team attainment dashboard** — Manager sees all direct reports: name, quota, YTD actual, attainment %, projected full-period attainment, earnings to date, and last-deal-closed date. Sortable and filterable.
- **Rep performance comparison** — Side-by-side comparison of multiple reps on key metrics: attainment, earnings, deal count, ACV. Trend lines over trailing 12 months.
- **Pipeline-to-commission projection** — Connect to CRM pipeline data (weighted by stage probability) to project likely commission expense for the current and next period. Scenario modelling: what if close rates increase by 10%?
- **Commission accrual reports** — Finance sees earned-but-unpaid commission balances for each rep and each period. Formatted for journal entry: debit commission expense, credit commission accrual liability. Export to CSV/Excel for ERP posting.
- **Forecasted vs actual commissions** — Track the variance between forecasted commission (at period start) and actual commission (at period close). Variance analysis by rep, plan, and territory.
- **Cost of sales analysis** — Commission expense as % of revenue, per rep, per territory, per product line. Trend over time. Benchmark against targets and industry norms.
- **Plan effectiveness metrics** — Are the plan mechanics driving the right behaviours? Metrics: % of reps at 100%+, % of reps above threshold to earn (participation rate), earnings distribution (Gini coefficient), over/under payout frequency.
- **Overpayment / underpayment analysis** — Identify reps who have been historically over- or underpaid due to retroactive adjustments. Exposure summary for Finance: total underpayments owed, total recoverable overpayments.
- **Budget vs actuals** — Track commission budget (set at the start of the period) vs actual commission expense. Alert when actuals exceed 90% of budget.

### G. Reporting & Analytics

- **Pre-built reports** — Standard library: Earnings by Rep (period), Earnings by Period (trend), Quota Attainment Summary, Plan Cost Analysis, Payment Run Summary, Dispute Resolution Report, Clawback Recovery Report, Draw Balance Report, ASC 606 Capitalisation Schedule.
- **Custom report builder** — Drag-and-drop report builder. Select dimensions (rep, period, plan, territory, product), metrics (earnings, attainment %, deal count, avg deal size), and filters. Save, share, and schedule reports.
- **Scheduled report delivery** — Configure any report to run on a schedule (daily, weekly, monthly) and deliver via email as PDF or CSV attachment.
- **Export formats** — CSV (for Excel/BI tools), Excel (.xlsx), PDF (formatted statements and management reports), JSON (for API consumers).
- **Interactive dashboards** — Filterable dashboards with drill-down. Click on a rep to see their detail; click on a period to drill into transactions. Date range picker, territory filter, plan filter, and role filter.
- **Trend analysis** — Month-over-month (MoM), quarter-over-quarter (QoQ), year-over-year (YoY) comparisons. Seasonality visualisation.
- **Cohort analysis** — Group reps by tenure cohort (month hired) and track earnings trajectory. Useful for understanding ramp time and plan effectiveness for new hires.
- **AI-powered insights** — Automated insight cards on the dashboard: "Rep X's Q3 earnings are 40% below their Q2 average — anomaly detected", "Plan Y is generating 3× more overpayment adjustments than Plan Z — review recommended", "5 reps are at 95%–99% attainment — at risk of missing target this period."

### H. Compliance & Audit

- **SOX compliance support** — Segregation of duties enforced via RBAC: plan designers cannot approve their own plans; Finance approvers cannot edit calculations they approve. Full calculation audit trail with immutable records. Approval workflows with digital signatures. All of this documented in a SOX controls matrix (exportable).
- **GDPR / Privacy compliance** — Consent management: reps can view what data is held about them, request correction, and request deletion (subject to retention requirements). Data export in machine-readable format (JSON/CSV). PII masking in logs and admin exports.
- **Electronic plan acknowledgment** — Reps e-sign their compensation plan with timestamp (ISO 8601 UTC), IP address, device fingerprint, and browser. Acknowledgment stored immutably. Legally equivalent to wet signature in supported jurisdictions.
- **Dispute resolution workflow** — Formal dispute process: rep raises dispute → manager reviews → Finance reviews → resolution (approved/denied) → rep notified. SLA tracking: each stage has a configurable SLA (e.g. manager must respond within 5 business days). Overdue disputes escalated automatically.
- **Historical recalculation** — Ability to re-run any past period's calculation (e.g. after a data correction or plan amendment). Historical recalculation creates a new version of the affected earnings records; original records preserved. Delta between old and new visible to auditors.
- **Change log** — Every create, update, and delete action on every entity is logged with: actor (user ID + email), action type, entity type, entity ID, timestamp, old value (JSON diff), new value (JSON diff), IP address, and session ID.
- **Role-based access control (RBAC)** — Six roles: SUPER_ADMIN, ADMIN, FINANCE, MANAGER, REP, READ_ONLY. Each role has a defined permission set. Permissions enforced at the API route level. No UI trick can bypass server-side enforcement.
- **Data retention policies** — Configurable retention periods per data category: earnings records (7 years default for financial compliance), audit logs (7 years), PII (configurable, minimum required by law). Automated deletion runs after retention period expires.
- **Export for external audit** — Auditors can be granted a temporary READ_ONLY role to access specific periods' data. Export package: calculation runs, earnings records, payment runs, audit logs, plan versions — all in structured JSON and CSV formats.

### I. Workflow & Approvals

- **Plan approval workflow** — Plans go through: `DRAFT` → `REVIEW` → `APPROVED` → `PUBLISHED`. Each transition requires a designated approver (configurable). Approvers receive email + in-app notification. Comments and inline changes tracked per version. Plans cannot be published without completing the approval chain.
- **Quota approval workflow** — Quotas require approval from the rep's manager (and optionally VP/Finance). Quota disputes raised by reps enter a separate workflow. All quota changes logged with reason codes.
- **Exception request workflow** — Any payout outside the defined plan rules (e.g. a one-off SPIF, a goodwill payment, a dispute resolution credit) requires a formal exception request: requestor → manager → Finance. Exception approved/denied with notes. Approved exceptions create a manual adjustment record in the payment run.
- **Dispute management workflow** — See Compliance & Audit section. Full SLA tracking.
- **Notification system** — In-app notification centre + email for: new plan published, quota assigned/changed, payment processed, dispute update, approval required, exception request status, acknowledgment required, calculation run completed, anomaly detected.
- **Configurable approval chains** — Admin defines approval chains per workflow type. Chains can be sequential (A then B then C) or parallel (A and B both must approve). Quorum approval supported (any 2 of 3 approvers).
- **Delegation rules** — Approvers can delegate to a backup approver for a specified date range (out-of-office). Delegations logged. System notifies both delegator and delegate.
- **SLA tracking** — Every approval task has a due date. Overdue tasks highlighted in the queue (amber at 75% of SLA, red at 100%). Escalation rules: notify next-level approver when SLA breached.

### J. Multi-Org / Multi-Tenant

- **Multiple business units** — A single SmartCommission account can manage multiple organisations or business units (BUs), each with full isolation. Useful for holding companies, PE portfolio companies, and enterprise divisions with separate commission structures.
- **Tenant isolation** — Each organisation's data is fully isolated at the database row level using `organisationId` on every table. API routes enforce organisation scope. No cross-tenant data leakage is architecturally possible.
- **Superadmin cross-org visibility** — SmartCommission platform operators have a superadmin console to view all organisations, manage billing, impersonate (with audit log), and investigate issues.
- **Shared plan templates** — Organisation-level ADMIN can share plan templates to all BUs within a holding-company account. Changes to a shared template prompt BU admins to review and re-publish their plans.
- **Consolidated reporting** — For holding companies or PE firms: aggregate earnings, accruals, and attainment across all BUs in a single consolidated report. Drill down to individual org from consolidated view.

### K. API & Integrations

- **REST API v1** — Full CRUD for all entities: plans, quotas, territories, transactions, earnings, payments, disputes. See `api-integration.md`.
- **Webhooks** — All lifecycle events fire webhooks: transaction.created, transaction.updated, calculation.completed, payment.processed, payment.approved, dispute.raised, dispute.resolved, plan.published.
- **API key management** — Per-organisation API keys with scopes (read, write, admin), optional expiry, and description. Keys shown once at creation.
- **OAuth 2.0** — Authorization Code + PKCE flow for third-party apps acting on behalf of users. Client Credentials for server-to-server.
- **Export formats** — JSON, CSV, Excel, XML. All exports respect the caller's permissions.
- **OpenAPI 3.0 spec** — Machine-readable spec at `/api/v1/openapi.json`. Interactive docs at `/api/docs`. Used to generate client SDKs.
- **Sandbox environment** — Each org has a sandbox. API keys can be sandbox-scoped. Sandbox data never affects production.
- **Rate limiting** — Free: 100 req/min. Paid: 1,000 req/min. Enterprise: custom. Standard rate limit headers on every response.

### L. AI & Intelligent Features

- **Earnings forecast** — ML model trained on historical pipeline close rates, seasonal patterns, and current-period activity to forecast full-period commission payout per rep and team. Refreshed daily. Shown as P10/P50/P90 confidence range.
- **Anomaly detection** — Statistical model flags outlier payouts (>2 standard deviations from rep's trailing 6-month average), impossible attainment (>500%), and duplicate transactions. Anomalies routed to Finance exception queue before payment approval.
- **Plan optimisation recommendations** — Model different plan structures against historical data: "if you set the accelerator at 110% instead of 100%, projected plan cost increases by 8% but reps achieving 100%+ attainment increases from 34% to 51%." Helps RevOps design more effective plans.
- **Natural language query** — Ask questions in plain English: "Show me Q2 attainment for enterprise reps in APAC", "Which reps are at risk of missing target this month?", "What is our total commission accrual for December?" Returns a table or chart with the answer.
- **AI-assisted plan design** — During plan creation, the AI suggests accelerator thresholds, tier breakpoints, and cap levels based on historical attainment distributions and industry benchmarks. Suggestions shown inline with explanations.
- **Churn risk prediction** — Track rep satisfaction signals: dispute frequency, portal login frequency, earnings-to-OTE ratio trends. Score each rep's churn risk. Alert managers when a high-performing rep shows elevated churn risk signals.

### M. Security & Compliance

- **SSO** — SAML 2.0 and OIDC integration with corporate identity providers (Okta, Azure AD, Google Workspace). SSO available on Growth+ plans.
- **MFA enforcement** — TOTP (Google Authenticator) and SMS OTP. ADMIN and FINANCE roles can have MFA enforcement mandated by the org admin. Passkey (WebAuthn) support planned.
- **IP allowlisting** — Restrict portal and API access to specified IP ranges or CIDR blocks. Configurable per role (e.g. Finance must access from office IPs only).
- **SOC 2 Type II alignment** — Architecture, processes, and controls designed to meet SOC 2 Trust Services Criteria (Security, Availability, Confidentiality). Third-party audit planned for Year 1 post-MVP.
- **GDPR, CCPA, Australian Privacy Act** — See `legal-compliance.md` for full compliance detail.
- **Audit log** — Immutable, append-only log of all actions. Stored separately from application data. Exportable for external audit. 7-year retention.
- **End-to-end encryption** — All data encrypted in transit (TLS 1.3) and at rest (AES-256 via Cloud SQL encryption). Sensitive fields (compensation rates, salary) encrypted at the application layer with a KMS-managed key.
- **PII masking** — Compensation amounts, deal values, and personal data masked in logs, admin exports, and non-production environments. See `pii-masking.md`.

---

## Feature Status

Status legend: ✅ Done · ⬜ Planned · 🔧 In Progress · — Not applicable

| Feature | Web | API | Phase |
|---|---|---|---|
| Plan builder (wizard) | ⬜ | ⬜ | 1 |
| Tiered commission rules | ⬜ | ⬜ | 1 |
| Quota management | ⬜ | ⬜ | 1 |
| Territory management | ⬜ | ⬜ | 1 |
| Transaction import (CSV) | ⬜ | ⬜ | 1 |
| Calculation engine (core) | ⬜ | ⬜ | 1 |
| Calculation audit trail | ⬜ | ⬜ | 1 |
| Period management | ⬜ | ⬜ | 1 |
| Split credit | ⬜ | ⬜ | 1 |
| Multi-currency support | ⬜ | ⬜ | 1 |
| Payment run management | ⬜ | ⬜ | 1 |
| Clawback rules | ⬜ | ⬜ | 1 |
| Draw against commission | ⬜ | ⬜ | 1 |
| RBAC (6 roles) | ⬜ | ⬜ | 1 |
| Plan approval workflow | ⬜ | ⬜ | 1 |
| Participant portal — earnings dashboard | ⬜ | — | 2 |
| Participant portal — attainment gauge | ⬜ | — | 2 |
| Participant portal — commission statements | ⬜ | — | 2 |
| Participant portal — deal-level detail | ⬜ | — | 2 |
| E-acknowledgment | ⬜ | — | 2 |
| Dispute submission + workflow | ⬜ | ⬜ | 2 |
| Manager team dashboard | ⬜ | — | 2 |
| Pre-built reports library | ⬜ | ⬜ | 2 |
| Custom report builder | ⬜ | — | 2 |
| Scheduled report delivery | ⬜ | — | 2 |
| Commission accrual reports (ASC 606) | ⬜ | ⬜ | 2 |
| Leaderboards + gamification | ⬜ | — | 2 |
| What-if calculator | ⬜ | — | 2 |
| Salesforce connector | ⬜ | ⬜ | 3 |
| HubSpot connector | ⬜ | ⬜ | 3 |
| Workday HRIS connector | ⬜ | ⬜ | 3 |
| REST API v1 (full) | — | ⬜ | 3 |
| Webhooks | — | ⬜ | 3 |
| Payroll export (ADP, Xero, MYOB) | ⬜ | ⬜ | 3 |
| SSO (SAML / OIDC) | ⬜ | — | 3 |
| Advanced analytics dashboard | ⬜ | — | 3 |
| Multi-org / multi-tenant | ⬜ | ⬜ | 3 |
| AI earnings forecast | ⬜ | — | 4 |
| Anomaly detection | ⬜ | — | 4 |
| Plan optimisation recommendations | ⬜ | — | 4 |
| Natural language query | ⬜ | — | 4 |
| Churn risk prediction | ⬜ | — | 4 |
| SOC 2 Type II audit | — | — | 4 |

---

## Known Issues

Severity: **Critical** · **High** · **Medium** · **Low**
Status: **Open** · **In Progress** · **✅ Fixed [date]** · **✅ Verified Non-Issue [date]** · **✅ Partially Fixed [date]**
Codes: **B** = Bug · **S** = Security · **P** = Performance · **U** = UX · **A** = Accessibility · **I** = Infrastructure · **D** = Data

| Code | Severity | Status | Title | Description |
|---|---|---|---|---|
| **I-001** | High | ✅ Fixed 2026-06-24 | No CI/CD pipeline yet | Cloud Build trigger `smartcommission-deploy` is live and fires on push to `main`. Latest successful build: `46e3013e` (2026-06-24). |
| **I-002** | Medium | Open | No staging environment | Staging environment not yet provisioned. All testing done locally. |
| **I-003** | High | ✅ Fixed 2026-06-20 | Cloud SQL instance not provisioned | Instance `smartcommission-db` created (PostgreSQL 15, `db-custom-2-7680`, `australia-southeast1`). DB URLs in Secret Manager. |
| **I-004** | High | ✅ Fixed 2026-06-24 | Cloud Run service not deployed | Cloud Run service `smartcommission` deployed 2026-06-24 (revision `smartcommission-00001-js2`). URL: `https://smartcommission-1028287218164.australia-southeast1.run.app`. Redirects to `/login` on root. |
| **I-005** | Medium | In Progress | Firebase Auth providers not yet enabled | Firebase project created; Admin SDK key in Secret Manager. Must activate Email/Password and Google Sign-In manually in Firebase Console. Cannot be done via CLI. |
| **D-001** | Medium | Open | No database migrations tooling | Prisma migrate workflow not yet established. Schema changes risk data loss. |
| **B-001** | Critical | ✅ Fixed 2026-06-20 | No application code exists — all features planned only | `apps/web/` fully scaffolded with Next.js 16, Tailwind v4, Prisma 7, Firebase 12, all core libraries and pages. |
| **S-001** | High | ✅ Fixed 2026-06-20 | Superuser pattern not yet implemented | `isSuperAdmin()`, `requireSuperAdmin()`, self-revoke protection, and superadmin console all implemented. |
| **S-002** | High | ✅ Fixed 2026-06-20 | SecurityLog model not yet implemented | `SecurityLog` Prisma model and `lib/security-log.ts` fully implemented. |
| **S-003** | High | ✅ Fixed 2026-06-20 | lib/audit.ts and lib/security-log.ts not yet implemented | Both utilities implemented; every API route calls logAudit. |
| **S-004** | High | ✅ Fixed 2026-06-20 | lib/pii.ts not yet implemented | PII masking utilities fully implemented in `apps/web/lib/pii.ts`. |
| **U-001** | High | ✅ Fixed 2026-06-20 | No application UI built | Core UI built: dashboard, plans, transactions, settings, logs, portal, onboarding, auth, superadmin. |
| **A-001** | Medium | In Progress | Accessibility not yet audited on implemented code | Core UI exists. WCAG 2.1 AA audit needed — icon-only buttons may lack aria-labels; color contrast must be verified. |
| **P-001** | Medium | Open | No performance benchmarks established | Calculation engine performance targets (1M transactions < 5 minutes) not yet verifiable — engine not yet implemented. |
| **D-002** | Medium | ✅ Fixed 2026-06-20 | SecurityLog not in data model | `SecurityLog` model added to `prisma/schema.prisma`. |
| **U-002** | Medium | ✅ Fixed 2026-06-20 | `docs/ux-patterns.md` was missing | Created 2026-06-20 with SmartCommission-specific content. |
| **I-006** | Medium | ✅ Fixed 2026-06-20 | Stack version audit — all versions unverifiable | `package.json` confirmed: Next.js 16.2.9, React 19.2.4, Tailwind v4, Prisma v7.8.0, Firebase v12/Admin v14. All canonical. |
| **U-003** | Medium | ✅ Fixed 2026-06-20 | `← Back to Dashboard` text link in superadmin layout (UX standard violation) | Replaced with ChevronLeft icon + "Dashboard" label in `app/(superadmin)/layout.tsx`. |
| **U-004** | Medium | ✅ Fixed 2026-06-20 | `min-h-screen` used throughout — iOS Safari `100vh` collapse bug | Replaced with `min-h-dvh` across all 6 layout files and full-height pages. |
| **P-002** | Medium | ✅ Fixed 2026-06-20 | `GET /api/settings/users` has no `take` cap — unbounded query | Added `take: 200` to prevent unbounded query on orgs with large user lists. |
| **P-003** | Medium | ✅ Fixed 2026-06-20 | `GET /api/settings/api-keys` has no `take` cap | Added `take: 100` to prevent unbounded query. |
| **P-004** | Medium | ✅ Fixed 2026-06-20 | `GET /api/release-notes` and `GET /api/settings/organisation` have no Cache-Control headers | Added `Cache-Control: private, s-maxage=60/120` headers to reduce repeated DB reads on semi-static routes. |
| **S-007** | High | Open | API key hash uses SHA-256 not bcrypt — weak hashing | `app/api/settings/api-keys/route.ts` comment: "simple hash for demo — in production use bcrypt". SHA-256 without salt is rainbow-table vulnerable. Upgrade to bcrypt/argon2 before production. |
| **U-005** | Medium | Open | No sign-out option in dashboard sidebar | The sidebar user section shows name and email initials but no logout/profile menu. Users cannot sign out from the main app without navigating away. Needs a ProfileMenu dropdown. |
| **S-008** | Low | Open | `@google/genai` v2.x not installed — incorrect SDK will be used when AI built | `package.json` does not include `@google/genai`. When Phase 4 AI features are implemented, must install `@google/genai` v2.x and NOT the deprecated `@google/generative-ai`. |
| **I-007** | Medium | Open | GCP project `smartcommission-prod` not yet created | `gcloud logging read` returns `USER_PROJECT_DENIED` — project doesn't exist. Cloud Run, Cloud SQL, Firebase, and all GCP infrastructure are still unprovisioned. Blocks all production testing and log auditing. |
| **D-003** | Medium | ✅ Fixed 2026-06-22 | `data-model.md` AuditLog schema deviates from canonical template | `data-model.md` updated 2026-06-22 — AuditLog and SecurityLog field names now match `audit-logging.md` and `prisma/schema.prisma`. ER diagram and table reference both updated. |
| **D-004** | Medium | ✅ Fixed 2026-06-22 | Missing Prisma models for new features | All models now present in `prisma/schema.prisma`: `SsoConfig`, `SavedQuery`, `QueryRun`, `ReleaseNote`, `ApiKey`, `AuditLog`, `SecurityLog`. `AiSession` and `AiMessage` not yet added (Phase 4). `data-model.md` Additional Models section updated to reflect implementation status. |
| **S-005** | Medium | Open | Cross-project: SmartTeam uses `@google/generative-ai` — wrong SDK | Cross-project check: SmartTeam changelog shows initial scaffold used `@google/generative-ai`. SmartCommission must use `@google/genai` v2.x per CLAUDE.md. Flag at project init. |
| **S-006** | Medium | Open | `ai-assistant.md` model discrepancy | CLAUDE.md mandates `gemini-2.5-flash` but the SmartCommission `ai-assistant.md` (line 48) states `gemini-2.5-flash` — this is correct. However, verify it is consistent with MEMORY.md. |
| **U-003** | Low | Open | `docs/video/` missing storyboard and voiceover files | `docs/video/` has `marketing-script.md` and `voiceover.txt` but template requires `storyboard.md` and a rendered MP4. Add storyboard and note MP4 as pending production. |
| **P-005** | Medium | ✅ Fixed 2026-06-22 | `GET /api/release-notes/tenant` has no `take` cap — unbounded query | Added `take: 200` to `app/api/release-notes/tenant/route.ts`. Orgs with many tenant release notes would load all records. |
| **P-006** | Medium | ✅ Fixed 2026-06-22 | `GET /api/query-console/queries` has no `take` cap — unbounded query | Added `take: 200` to `app/api/query-console/queries/route.ts`. |
| **P-007** | Medium | ✅ Fixed 2026-06-22 | `GET /api/reports` has no `take` cap — unbounded query | Added `take: 200` to `app/api/reports/route.ts`. |
| **U-006** | Medium | Open | No mobile bottom navigation in dashboard or portal layouts | Both `(dashboard)/layout.tsx` and `(portal)/layout.tsx` use a desktop sidebar only. No fixed bottom nav for mobile (required by design system). `max-w-[430px] mx-auto` fixed bottom bar with `pb-24` body clearance is missing. |
| **A-002** | Medium | Open | Icon-only buttons in dashboard pages lack aria-labels | Several interactive icon-only buttons in dashboard pages (e.g., edit/delete/action icons on list pages) may not have `aria-label` attributes. Only superadmin release notes page and portal release notes page were confirmed compliant. Full audit of `(dashboard)/` and `(portal)/` pages needed. |
| **U-007** | Low | Open | Dashboard sidebar user footer shows name/email but no logout | U-005 persists from previous review. Dashboard and portal sidebar footers display user identity but have no ProfileMenu or sign-out action. Canonical pattern: avatar → dropdown (name → sign out). See R-095. |
| **I-008** | Medium | ✅ Fixed 2026-06-25 | Cloud SQL backups and PITR disabled (cost saving measure) — critical risk before launch | ✅ Fixed — shared instance `shared-db-sydney` (prakash-shared) now has backups enabled: daily at 01:00, 14-day retention, PITR on. See R-099. |
| **I-009** | High | Open | Firebase Auth providers not yet enabled in console | I-005 in gcp-setup.md: Email/Password and Google Sign-In must be activated manually in Firebase Console. Blocks all user registration and login. Cannot be done via CLI. |
| **I-010** | High | Open | 4 critical secrets missing — Stripe, OXR, Resend keys are REPLACE_ME | `smartcommission-stripe-secret`, `smartcommission-stripe-webhook`, `smartcommission-oxr-key`, `smartcommission-resend-key` all have placeholder values. Platform billing, FX rates, and email are non-functional until filled. |
| **B-002** | Medium | Open | `POST /api/transactions` always stores `amountBase = amount` — FX conversion skipped | `apps/web/app/api/transactions/route.ts` line 68: `amountBase: amount` and `baseCurrency: currency` are copied verbatim from the deal currency. No exchange rate lookup is performed. Multi-currency transactions will have incorrect base-currency values until the FX rate refresh endpoint is wired into the transaction write path. |
| **S-021** | High | Open | CSV import formula injection not sanitised — exported CSVs may execute formulas in Excel | SR-006 is documented in `security.md` but not yet fixed in code. Any CSV export route that echoes back imported data must prepend a single-quote to cells starting with `=`, `+`, `-`, or `@`. Risk: financial analysts opening exports in Excel could trigger malicious formula execution. |
| **P-008** | Low | Open | No `Cache-Control` on `/api/settings/users` and other semi-static admin list routes | `GET /api/settings/users` (P-002 capped but no cache header), `GET /api/plans` (paginated but no cache), and `GET /api/transactions` (paginated but no cache) all serve frequently-accessed data with no caching instructions. Adding `Cache-Control: private, s-maxage=30` to user and plan lists would reduce redundant DB reads. |
| **I-011** | Low | Open | Cloud SQL ALERT log: graceful connection terminations from `cloudsqladmin` | GCP logs (2026-06-22) show `FATAL: terminating connection due to administrator command` from the `cloudsqladmin` user. This is a normal Cloud SQL maintenance restart pattern, not an application error, but confirms the Cloud SQL instance is actively running and should be monitored for unexpected frequency. |
| **I-012** | Critical | ✅ Fixed 2026-06-24 | Cloud Build SA missing Secret Manager access — CI/CD pipeline blocked | Build `46e3013e` (2026-06-24) **SUCCEEDED** — Secret Manager access issue was resolved. IAM binding applied for Cloud Build SA. Cloud Run deployed successfully. |
| **U-008** | Medium | ✅ Fixed 2026-06-24 | Plans page missing empty state CTA | Confirmed resolved during 2026-06-24 review. `app/(dashboard)/plans/page.tsx` has a three-branch conditional: loading → error → empty state (FileText icon + "No plans yet" + "Create plan" CTA) → table. This was a false positive in the prior review. |
| **P-009** | Low | ✅ Fixed 2026-06-24 | Plans page renders empty table header with no rows (UX + render waste) | Confirmed resolved — plans page correctly shows an empty state component (not table headers) when `plans.length === 0`. The table is only rendered when there is data. False positive from prior review. |
| **I-013** | Critical | ✅ Fixed 2026-06-24 | Cloud Build still failing on earlier 2026-06-24 build — same Secret Manager permission error | Subsequent build `46e3013e` (2026-06-24) **SUCCEEDED** — IAM binding was applied between build `7fea03f2` (failed) and `46e3013e` (succeeded). Cloud Run now live. |
| **U-009** | Medium | ✅ Fixed 2026-06-25 | `plans/[id]/page.tsx` uses `ArrowLeft` icon not `ChevronLeft` — UX standard violation | Fixed in 2026-06-25 review: replaced `ArrowLeft` with `ChevronLeft size={20}` using canonical className in `app/(dashboard)/plans/[id]/page.tsx`. |
| **U-010** | Low | ✅ Fixed 2026-06-25 | `plans/[id]/page.tsx` error state shows text link "Back to Plans" instead of ChevronLeft button | Fixed in 2026-06-25 review: error state now uses ChevronLeft icon-only button with `aria-label="Back to Plans"` — no text link. |
| **I-014** | Critical | ✅ Fixed 2026-06-26 | `/api/health` endpoint missing — GCP Monitoring uptime alerts were firing against a non-existent path (returned 404) | Created `apps/web/app/api/health/route.ts` with DB probe (`SELECT 1`); returns `{ status: 'ok', timestamp }` on 200 or `{ status: 'error' }` on 503. GCP Monitoring uptime check also created (`smartcommission-api-health-bkZvLcNxj_k`). |
| **I-015** | Medium | Open | GCP Monitoring uptime alert policy not linked — no notification channel fires when health check fails | Alert policies for 5xx and p95 latency exist. A dedicated uptime alert policy tied to the new uptime check still needs to be created in Cloud Monitoring UI and linked to the email notification channel. |
| **S-022** | Medium | Open | `npm audit` reports 31 vulnerabilities (1 low, 30 moderate) via `uuid` in `firebase-admin` dependency chain | `firebase-admin@>=11.0.0` depends on a vulnerable `uuid` version. No HIGH/CRITICAL CVEs present. Cannot upgrade `firebase-admin` without breaking changes (downgrade to 10.x). Monitor for a `firebase-admin@14.x` patch that resolves the `uuid` chain. |
| **I-016** | Low | Open | `cloudbuild.yaml` Cloud Run config diverges from `gcp-setup.md` — min-instances=0 in build, gcp-setup.md says min=1 | `cloudbuild.yaml` deploys with `--min-instances=0` and `--cpu=1`, but `docs/gcp-setup.md` documents min-instances=1 and cpu=2. Decide canonical config and reconcile both files. Pre-launch `min-instances=0` is cost-appropriate but must be documented. |
| **I-017** | Medium | ✅ Verified Non-Issue 2026-06-26 | `scripts/dev-local.sh` referenced in package.json — file confirmed to exist | `apps/web/scripts/dev-local.sh` exists and is correctly implemented. Starts Cloud SQL proxy on port 5433 and then starts `npm run dev`. |
| **B-003** | Medium | Open | `dashboard/page.tsx` stat cards show hardcoded `$0.00`, `—%`, `0` values — no live data fetch | The dashboard page displays static placeholder values for Current Period Earnings, Team Attainment, Active Disputes, and Next Payment Date. These should fetch live data from API routes. Acceptable for MVP scaffold but must be resolved before user testing. |
| **U-011** | Low | Open | Generic error messages on list pages — "Failed to load plans" lacks recovery guidance | Plans page error: "Failed to load plans". Does not tell the user what to do. Should be: "Unable to load compensation plans — check your network and try again." Same pattern likely on transactions, earnings, disputes pages. |
| **A-003** | Medium | Open | No React error boundaries on any major component subtree | All layout, dashboard, admin, and portal subtrees are unguarded. A thrown exception anywhere shows a blank Next.js error page — not a user-friendly fallback. Add `ErrorBoundary` wrappers with retry buttons to all major subtrees. See R-118. |
| **I-018** | Low | Open | Raw ISO date strings rendered in plan list — must use `Intl.DateTimeFormat` | `effectiveFrom` and `effectiveTo` on the plans page are rendered as raw ISO strings. Must use `Intl.DateTimeFormat` with user's locale for production. |

---

## Roadmap

Priority: **Critical** · **High** · **Medium** · **Low**
Status: **Open** · **In Progress** · **✅ DONE [date]** · **✅ Partially DONE [date]**

### Phase 1 — MVP: Core Calculation Engine

| Code | Priority | Status | Title | Description |
|---|---|---|---|---|
| **R-001** | Critical | Open | Project initialisation | Set up Next.js App Router project with Tailwind v4, Geist font, Prisma, Firebase Auth, and Cloud Run deployment. |
| **R-002** | Critical | Open | Database schema + migrations | Implement full Prisma schema per data-model.md. Set up Cloud SQL (PostgreSQL). |
| **R-003** | Critical | Open | Authentication (Firebase Auth) | Email/password and Google OAuth sign-in. Session cookie middleware. Role-based access guard. |
| **R-004** | Critical | Open | Multi-tenant organisation model | Create organisation, invite users, assign roles. Every API route scoped to organisationId. |
| **R-005** | Critical | Open | Plan builder — basic wizard | Step-by-step wizard: plan name, type, effective dates, eligible participants. |
| **R-006** | Critical | Open | Plan rules engine (tiers, rates, accelerators) | Core rule types: flat rate, tiered progressive, tiered retroactive, accelerator/decelerator. |
| **R-007** | Critical | Open | Quota management | Create/edit/import quotas by rep, period, and territory. Quota history. |
| **R-008** | Critical | Open | Transaction import (CSV) | Upload CSV, field mapping UI, validation, import job tracking. |
| **R-009** | Critical | Open | Calculation engine v1 | Process transactions against plan rules, calculate earnings per rep per period. |
| **R-010** | Critical | Open | Calculation audit trail | Every earnings record links to step-by-step audit log. |
| **R-011** | Critical | Open | Split credit support | Multi-rep credit allocation on a single transaction. |
| **R-012** | Critical | Open | Multi-currency (base + original) | Store transactions in both original and base currency. Exchange rate management. |
| **R-013** | Critical | Open | Payment run workflow | DRAFT → APPROVED → EXPORTED → PAID lifecycle. |
| **R-014** | Critical | Open | Clawback rules | Time-based and event-based clawback configuration and enforcement. |
| **R-015** | Critical | Open | RBAC enforcement | Six roles. All API routes enforce role and organisation scope. |
| **R-016** | High | Open | Plan approval workflow | DRAFT → REVIEW → APPROVED → PUBLISHED with configurable approvers. |
| **R-017** | High | Open | Draw against commission | Recoverable and non-recoverable draw configuration, reconciliation per period. |
| **R-018** | High | Open | Retroactive adjustments | Re-run past period calculations when source data changes. |
| **R-019** | High | Open | Period management | Support daily/weekly/monthly/quarterly/annual periods. Multiple overlapping periods. |
| **R-020** | High | Open | Plan versioning + change history | Immutable plan versions. Compare versions. |
| **R-021** | Medium | Open | Plan templates library | 6 pre-built role templates: AE new biz, AE expansion, SDR, CSM, channel, named account. |
| **R-022** | Medium | Open | Exception flagging | Anomaly detection on calculation outputs. Route to Finance before payment approval. |
| **R-023** | Medium | Open | Territory management | Define territories, assign reps with effective dates. |
| **R-024** | Medium | Open | Holdback / reserve provisions | Withhold % of earnings until milestone. Auto-release. |
| **R-025** | Medium | Open | Advance commission payments | Pay portion upfront; true-up at period close. |

### Phase 2 — Participant Portal + Reporting

| Code | Priority | Status | Title | Description |
|---|---|---|---|---|
| **R-026** | Critical | Open | Participant portal — earnings dashboard | Real-time earnings, attainment gauge, YTD breakdown for reps. |
| **R-027** | Critical | Open | Commission statements | Formal PDF statements per period. Downloadable. |
| **R-028** | Critical | Open | Deal-level earnings detail | Rep can trace each transaction's contribution to their earnings. |
| **R-029** | Critical | Open | E-acknowledgment | Plan doc display, e-sign with timestamp + IP capture. |
| **R-030** | Critical | Open | Dispute submission + workflow | Rep raises dispute; workflow to manager → Finance → resolution. SLA tracking. |
| **R-031** | High | Open | Manager team dashboard | All direct reports: quota, actual, attainment %, projected full-period. |
| **R-032** | High | Open | Commission accrual reports | Finance: earned-but-unpaid balances, formatted for journal entry. ASC 606 amortisation. |
| **R-033** | High | Open | Pre-built reports library | 9 standard reports: earnings, quota attainment, plan cost, payment run, dispute, clawback, draw, capitalisation. |
| **R-034** | High | Open | Custom report builder | Drag-and-drop builder. Save, share, schedule. Export CSV/Excel/PDF. |
| **R-035** | High | Open | What-if calculator (rep) | Rep models "if I close X more at $Y ACV, I earn $Z." |
| **R-036** | High | Open | Earnings forecast (basic) | Rule-based projection of full-period payout based on current trajectory. |
| **R-037** | Medium | Open | Leaderboards + gamification | Opt-in team attainment leaderboard. Milestone badges. Privacy controls. |
| **R-038** | Medium | Open | Push notifications (email + in-app) | Payment processed, dispute update, new plan, quota change, acknowledgment required. |
| **R-039** | Medium | Open | Pipeline-to-commission projection | Manager view: project commission expense from CRM pipeline. |
| **R-040** | Medium | Open | Budget vs actuals tracking | Commission budget set at period start; track vs actual. Alert at 90%. |
| **R-041** | Medium | Open | Quota visibility for reps | Rep sees quota history, changes, and reason codes. |
| **R-042** | Medium | Open | Interactive analytics dashboards | Filterable dashboards with drill-down, date range picker, territory/plan filter. |

### Phase 3 — Integrations + Advanced Analytics

| Code | Priority | Status | Title | Description |
|---|---|---|---|---|
| **R-043** | Critical | Open | Salesforce CRM connector | Sync opportunities, closed-won deals, accounts, products. Field mapping UI. Delta sync. |
| **R-044** | Critical | Open | REST API v1 (full public API) | Full CRUD for all entities. OpenAPI spec. Sandbox support. |
| **R-045** | Critical | Open | Webhooks | All lifecycle events. HMAC signing. Retry with backoff. 72hr replay. |
| **R-046** | High | Open | HubSpot CRM connector | Native connector for HubSpot deals and contacts. |
| **R-047** | High | Open | Payroll export (ADP, Xero, MYOB) | Payment file export in payroll-native formats. |
| **R-048** | High | Open | SSO — SAML 2.0 and OIDC | Enterprise identity provider integration. Okta, Azure AD, Google Workspace. |
| **R-049** | High | Open | Workday HRIS connector | Sync employee records, org hierarchy, role changes. |
| **R-050** | High | Open | BambooHR HRIS connector | Sync for SMB customers using BambooHR. |
| **R-051** | Medium | Open | Pipedrive CRM connector | Native connector for Pipedrive. |
| **R-052** | Medium | Open | Microsoft Dynamics 365 connector | Connector for Microsoft-centric customers. |
| **R-053** | Medium | Open | NetSuite ERP connector | Pull invoices and payments received for payment-basis commission triggers. |
| **R-054** | Medium | Open | Xero ERP connector | Pull invoices for SMB customers on Xero. |
| **R-055** | Medium | Open | Historical data import (migration) | Bulk import past periods from spreadsheets or legacy ICM systems. |
| **R-056** | Medium | Open | Trend analysis reports | MoM, QoQ, YoY trend charts. Seasonality visualisation. |
| **R-057** | Medium | Open | Cohort analysis | Rep cohort earnings trajectory by tenure. |
| **R-058** | Medium | Open | Multi-org / multi-BU support | Holding company / PE firm: multiple orgs in one account. Consolidated reporting. |
| **R-059** | Medium | Open | IP allowlisting | Restrict portal/API access by IP/CIDR. |
| **R-060** | Low | Open | Webhook event replay UI | UI to inspect and replay webhook deliveries from the dashboard. |
| **R-061** | Low | Open | ADP HRIS connector | Sync headcount from ADP Workforce Now. |
| **R-062** | Low | Open | QuickBooks ERP connector | Pull payments for SMB customers on QuickBooks. |

### Phase 4 — AI + Enterprise Features

| Code | Priority | Status | Title | Description |
|---|---|---|---|---|
| **R-063** | High | Open | AI earnings forecast (ML) | ML model trained on pipeline, historical close rates, seasonality. P10/P50/P90 range. |
| **R-064** | High | Open | Anomaly detection (ML) | Statistical outlier detection on payouts. Auto-flag to Finance. |
| **R-065** | High | Open | Plan optimisation recommendations | Model different plan structures against historical data. Scenario comparison. |
| **R-066** | High | Open | Natural language query | Plain-English queries answered with tables/charts. Powered by LLM. |
| **R-067** | Medium | Open | AI-assisted plan design | Suggest accelerator thresholds, tier breakpoints, and caps based on history. |
| **R-068** | Medium | Open | Churn risk prediction | Score rep churn risk from satisfaction signals. Alert managers. |
| **R-069** | Medium | Open | SOC 2 Type II audit | Third-party SOC 2 audit engagement. |
| **R-070** | Medium | Open | MFA enforcement (admin mandate) | Org admin can enforce MFA for ADMIN/FINANCE roles. |
| **R-071** | Medium | Open | Passkey / WebAuthn support | Passwordless authentication for supported devices. |
| **R-072** | Medium | Open | Bonus pool distribution (advanced) | Forced distribution curves. Quartile-based allocation. |
| **R-073** | Low | Open | DMCA / privacy request portal | Self-serve portal for data subject access requests (DSAR). |
| **R-074** | Low | Open | Consolidated cross-org reporting | PE/holding company consolidated earnings and accrual view. |
| **R-075** | Low | Open | SOX controls matrix export | Export a structured SOX controls mapping for enterprise compliance teams. |

---

### Phase 0 — Pre-Implementation (New — added 2026-06-18)

| Code | Priority | Status | Title | Description |
|---|---|---|---|---|
| **R-076** | Critical | ✅ DONE 2026-06-20 | Create Next.js App Router project scaffold | `apps/web/` exists with Next.js 16, Tailwind v4, Geist font, Prisma 7, next-themes, all canonical dependencies. |
| **R-077** | Critical | ✅ DONE 2026-06-20 | Implement superuser pattern | `isSuperAdmin()`, self-revoke protection, superadmin console all implemented. |
| **R-078** | Critical | ✅ DONE 2026-06-20 | Add SecurityLog Prisma model | `SecurityLog` in `prisma/schema.prisma` with full index coverage. |
| **R-079** | Critical | ✅ DONE 2026-06-20 | Implement lib/audit.ts and lib/security-log.ts | Both utilities fully implemented. All API routes call logAudit. |
| **R-080** | Critical | ✅ DONE 2026-06-20 | Implement lib/pii.ts | All five masking functions implemented in `apps/web/lib/pii.ts`. |
| **R-081** | Critical | ✅ DONE 2026-06-20 | Implement lib/request-context.ts | Implemented in `apps/web/lib/request-context.ts`. |
| **R-082** | Critical | ✅ DONE 2026-06-24 | GCP infrastructure provisioning | GCP project `smartcommission-prod` fully provisioned. Cloud Run deployed, Cloud SQL on shared instance, Artifact Registry, Cloud Build, Monitoring alerts, Uptime check (added 2026-06-26). |
| **R-083** | Critical | Open | Publish Terms of Service, Privacy Policy, Cookie Policy | Required before any public launch. Engage legal review. See `legal-compliance.md`. |
| **R-084** | High | Open | Sign DPAs with all sub-processors | GCP, Stripe, Resend, Open Exchange Rates. Required for GDPR compliance. See `legal-compliance.md`. |
| **R-085** | High | Open | Implement cookie consent banner | Required for EU/UK users. Needed before any analytics or non-essential cookies. |
| **R-086** | High | Open | Implement lib/context.ts + role-switching API routes | `getActiveContext()`, `buildContextCookie()`, `GET /api/context/available`, `POST /api/context/switch`. Required for multi-role users. See role-switching.md. |
| **R-087** | High | Open | Implement RoleSwitcher and ProxyBanner components | RoleSwitcher dropdown in every layout header; amber ProxyBanner during impersonation. See role-switching.md. |
| **R-088** | High | ✅ DONE 2026-06-20 | Implement Toast + ConfirmDialog system | `lib/toast.tsx`, `lib/confirm.tsx`, `components/ui/Toaster.tsx`, `components/ui/ConfirmDialog.tsx` all implemented and wired into root layout. |
| **R-089** | Medium | ✅ DONE 2026-06-20 | Ensure stack uses canonical versions at project init | Confirmed: Next.js 16.2.9, React 19.2.4, Tailwind v4, Prisma v7.8.0, Firebase v12/Admin v14. All canonical. |
| **R-090** | Medium | Open | Clawback jurisdiction warning in plan builder UI | Warn when a "recovery after vesting" clawback is configured for Australian or California participants. See legal-compliance.md. |
| **R-091** | Medium | Open | PWA and Capacitor support | `public/manifest.json`, icons, `next-pwa`, offline fallback page, Capacitor for App Store distribution. See design-system.md PWA section. |
| **R-092** | Medium | ✅ DONE 2026-06-22 | Reconcile data-model.md with canonical audit-logging schema | AuditLog and SecurityLog field names in `data-model.md` updated to match `audit-logging.md` canonical schema. ER diagram, table reference, and alignment notes all updated. |
| **R-093** | Medium | ✅ DONE 2026-06-22 | Add missing Prisma models to data-model.md | `SsoConfig`, `ReleaseNote`, `ApiKey`, `SavedQuery`, `QueryRun` all added/updated. `SuperAdmin` section updated to note that `User.isSuperAdmin` boolean is used instead. `AiSession`/`AiMessage` remain planned for Phase 4. |
| **R-094** | Low | ✅ DONE 2026-06-24 | Create `docs/video/storyboard.md` | Confirmed present in `docs/video/storyboard.md` during 2026-06-24 review. |
| **R-095** | High | Open | Add ProfileMenu (sign-out) to dashboard sidebar | Dashboard layout has user info but no logout. Add a ProfileMenu dropdown (avatar → name → sign out) to the sidebar footer following the canonical UX pattern. See U-005. |
| **R-096** | High | Open | Upgrade API key hashing from SHA-256 to bcrypt | `app/api/settings/api-keys/route.ts` uses SHA-256 without salt — rainbow-table vulnerable. Upgrade to bcrypt (cost factor 12) before production. See S-007. |
| **R-097** | Medium | Open | Add aria-labels to all icon-only interactive elements | WCAG 2.1 AA requires `aria-label` on every button/link that has only an icon and no visible text. Audit all pages in `app/(dashboard)/`, `app/(superadmin)/`, and `app/(portal)/`. |
| **R-098** | Medium | Open | Add `@google/genai` v2.x when implementing AI features | `package.json` does not include the AI SDK. Must install `@google/genai` v2.x (not `@google/generative-ai`) when implementing Phase 4 AI features. See S-008. |
| **R-099** | **Critical** | ✅ DONE 2026-06-25 | Re-enable Cloud SQL backups and PITR | ✅ Enabled on shared instance `shared-db-sydney` (prakash-shared): daily at 01:00, 14-day retention, PITR on. Verified via `gcloud sql instances describe`. |
| **R-100** | High | Open | Enable Firebase Auth providers (Email/Password + Google) | Must visit Firebase Console → Authentication → Get started and enable providers manually. Cannot be automated. Blocks all user registration. See I-009. |
| **R-101** | High | Open | Fill in 4 missing secrets in Secret Manager | Populate `smartcommission-stripe-secret`, `smartcommission-stripe-webhook`, `smartcommission-oxr-key`, `smartcommission-resend-key` in GCP Secret Manager before first deploy. See I-010. |
| **R-102** | Medium | Open | Add mobile bottom navigation bar | Add fixed bottom nav (`max-w-[430px] mx-auto`) to `(dashboard)/layout.tsx` and `(portal)/layout.tsx` per design system requirement. Add `pb-24` body clearance. See U-006. |
| **R-103** | Medium | Open | Full WCAG 2.1 AA aria-label audit on dashboard and portal pages | Systematically audit every page in `app/(dashboard)/` and `app/(portal)/` for icon-only interactive elements missing `aria-label`. See A-002. |
| **R-104** | Low | Open | Add Cache-Control to /api/release-notes/tenant and /api/query-console/queries | Semi-static admin list routes should add `Cache-Control: private, s-maxage=60` to reduce redundant DB reads. Currently both routes lack this header. |
| **R-105** | Medium | Open | Wire FX rate lookup into transaction write path | `POST /api/transactions` currently stores `amountBase = amount` (skipping FX conversion). When the `/api/internal/fx/refresh` endpoint is implemented, wire it into transaction creation so `amountBase` and `exchangeRate` reflect the actual conversion. See B-002. |
| **R-106** | Medium | Open | Sanitise CSV export fields for formula injection (SR-006) | Before any CSV export is served, prepend a single-quote to cell values starting with `=`, `+`, `-`, or `@`. Required for OWASP-compliant data exports. See S-021 and SR-006 in `security.md`. |
| **R-107** | Low | Open | Add Cache-Control to `/api/settings/users` and `/api/plans` GET routes | These semi-static admin routes have `take` caps but no caching headers. `private, s-maxage=30` would reduce DB reads on repeat navigation. See P-008. |
| **R-108** | Medium | Open | Add empty state CTA to plans page | `app/(dashboard)/plans/page.tsx` shows empty table when no plans exist. Replace with centred message ("No compensation plans yet") and "Create your first plan" button. See U-008. |
| **R-109** | Low | Open | Add empty state audit across all list pages | After R-108, audit all other dashboard list pages (transactions, quotas, calculations, earnings, payments, disputes) for missing empty states. Every list must show a guiding CTA when empty. |
| **R-110** | High | ✅ DONE 2026-06-24 | Fix Cloud Build Secret Manager IAM binding (I-013) | IAM binding applied — build `46e3013e` succeeded and Cloud Run deployed. CI/CD pipeline unblocked. |
| **R-111** | Medium | ✅ DONE 2026-06-25 | Replace `ArrowLeft` with `ChevronLeft` in plans/[id]/page.tsx | Fixed in 2026-06-25 review: `ArrowLeft` replaced with `ChevronLeft size={20}`, error state text link replaced with canonical ChevronLeft icon button with `aria-label`. See U-009, U-010. |
| **R-113** | Critical | ✅ DONE 2026-06-26 | Create `/api/health` endpoint for GCP Monitoring and readiness probes | Created `apps/web/app/api/health/route.ts` — unauthenticated, queries DB with `SELECT 1`, returns 200/503. GCP uptime check created. Health test suite `tests/api/health.test.ts` added (IT-HEALTH-001–003). See I-014. |
| **R-114** | Medium | Open | Create GCP Monitoring uptime alert policy tied to the new uptime check | Uptime check exists (`smartcommission-api-health-bkZvLcNxj_k`) but no alert policy is linked to notify on failure. Create in Cloud Monitoring → Alerting → Create Policy → Uptime Check. See I-015. |
| **R-115** | Low | ✅ DONE 2026-06-26 | `apps/web/scripts/dev-local.sh` confirmed present | File exists and works correctly: starts Cloud SQL proxy on port 5433, then runs `npm run dev`. See I-017 (verified non-issue). |
| **R-116** | Medium | Open | Replace hardcoded dashboard stat cards with live API data | `dashboard/page.tsx` shows static $0.00 / —% / 0 values. Wire up live fetches to earnings, attainment, disputes, and payment schedule endpoints. See B-003. |
| **R-117** | Low | Open | Add in-app support widget (Intercom/Crisp) | `NEXT_PUBLIC_INTERCOM_APP_ID` env var is documented but no widget is implemented. Users have no in-app path to report bugs or get help. Add Intercom or Crisp chat widget to authenticated layouts. |
| **R-118** | Medium | Open | Add React error boundaries to all major component subtrees | All layout, dashboard, admin, portal subtrees are unguarded. A thrown exception shows a blank Next.js error page. Wrap each major subtree with an ErrorBoundary that shows a user-friendly message with a retry/reload button. See A-003. |

---

## QA Gaps

- [ ] Calculation engine: test all plan types with edge cases (zero quota, 0% attainment, multi-currency rounding, retroactive adjustments crossing period boundaries)
- [ ] Split credit: test splits summing to <100%, exactly 100%, and full-credit splits >100%
- [ ] Clawback: test time-based, event-based, and partial recovery scenarios
- [ ] Draw reconciliation: test recoverable and non-recoverable draw across multiple periods
- [ ] Multi-currency: test exchange rate changes between calculation date and payment date
- [ ] E-acknowledgment: test timestamp + IP capture under different network conditions
- [ ] Dispute workflow: test all state transitions including SLA breach and escalation
- [ ] Payment run: test hold/release, manual adjustments, and multi-currency payout
- [ ] RBAC: test all six roles for each API route to confirm no privilege escalation
- [ ] Retroactive adjustments: test re-calculation accuracy and audit trail completeness
- [ ] CSV import: test malformed files, duplicate rows, missing required fields, 100K+ row files
- [ ] Portal e-acknowledgment: test legal validity requirements per jurisdiction (AU, US, UK)
- [ ] What-if calculator: validate against actual calculation engine output for accuracy
- [ ] AI forecast: backtest accuracy on historical data before going live
- [ ] Health endpoint: IT-HEALTH-001–003 must pass in CI environment once Firebase Auth is active (currently DB probe will fail without DB URL)
- [ ] Dashboard stat cards: once live data is wired in, test with zero-data org, one-rep org, multi-rep org

| R-112 | Low | Open | Shared component library | Extract ThemeToggle, ProfileMenu, ConfirmDialog, Toaster, and ChevronLeft back-nav into a shared `@shared/ui` npm package (private). All 7 projects depend on it. Bug fixes and design system updates propagate once instead of 7×. Phase 1: extract components. Phase 2: publish to private registry. Phase 3: migrate all projects. |
