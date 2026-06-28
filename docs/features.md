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
| **U-006** | Medium | ✅ Fixed 2026-06-29 | No mobile bottom navigation in dashboard or portal layouts | Mobile bottom nav confirmed implemented in `(dashboard)/layout.tsx`: fixed bottom bar with `max-w-[430px] mx-auto`, `env(safe-area-inset-bottom)` via inline style, and `pb-24` body clearance on main content. Verified in 2026-06-29 review. |
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
| **I-019** | Critical | Open | `/api/health` returning 404 in production — deployed revision stale | Health endpoint added 2026-06-26 but last deployment was 2026-06-24 (revision `smartcommission-00001-js2`). GCP Monitoring uptime check and Cloud Scheduler warmup job both receiving 404. Fix: push and deploy latest code. All code changes since 2026-06-24 are pending deployment. |
| **I-020** | Medium | Open | Cloud Scheduler warmup job ineffective — hitting 404 on `/api/health` | `smartcommission-warmup` (every 5 min) POST to health endpoint returns 404 in live revision. Zero warm-up benefit until I-019 is resolved. Will self-fix on next deploy. |
| **I-021** | Low | Open | Resend API key must be added to Cloud Build test step `secretEnv` when populated | When `smartcommission-resend-key` secret is populated (fixing I-010), it must also be declared in the `secretEnv` array of the Cloud Build test step to prevent test failures. Pattern confirmed necessary from SmartAssociation fix 2026-06-28. |
| **U-012** | Medium | Open | Superadmin loading spinners use `border-indigo-500` — must be `border-violet-500` | `/admin/orgs/page.tsx` line 36, `/admin/users/page.tsx` line 60, `/admin/logs/page.tsx` line 55 all use `border-indigo-500` spinner. Design system mandates `border-violet-500` in all superadmin/admin pages. `/admin/release-notes/page.tsx` already correct. Three one-line fixes. |
| **U-013** | Low | Open | Login page ThemeToggle visibility unconfirmed — investigate auth layout | Root layout's fixed ThemeToggle fires globally; however `app/(auth)/` route group layout may override or suppress it. Verify that ThemeToggle is accessible on the login page. |
| **U-014** | Low | Open | Dashboard sidebar shows username as plain text next to ProfileMenu trigger | Sidebar footer renders `{session.name || session.email}` in a `<p>` tag beside the ProfileMenu avatar trigger. Canonical pattern: name appears only inside the dropdown, not as a visible label outside the trigger. |
| **U-015** | Low | Open | R-102 roadmap item still marked Open but feature is already implemented | Mobile bottom nav confirmed present in `(dashboard)/layout.tsx`. R-102 and U-006 should be marked done. U-006 fixed 2026-06-29 in this file; R-102 also closed. |
| **S-023** | Medium | Open | `isSuperAdmin()` hardcoded email guard bypassed when `email` param omitted | `lib/auth/superadmin.ts` line 10: `if (email === PERMANENT_SUPERADMIN_EMAIL) return true` fires only when the optional `email` parameter is passed. All current call sites pass it. Future callers that omit `email` bypass the guard and rely solely on the DB. Add an inline code warning and consider making email mandatory. |

---

## Roadmap

Priority: **Critical** · **High** · **Medium** · **Low**
Status: **Open** · **In Progress** · **✅ DONE [date]** · **✅ Partially DONE [date]**

### Phase 1 — MVP: Core Calculation Engine

| Code | Priority | Status | Title | Description |
|---|---|---|---|---|
| **R-001** | Critical | Open | Project initialisation | Set up Next.js App Router project with Tailwind v4, Geist font, Prisma, Firebase Auth, and Cloud Run deployment. |
| **R-002** | Critical | Open | Database schema + migrations | Implement full Prisma schema per data-model.md. Set up Cloud SQL (PostgreSQL). |
| **R-003** | Critical | Open | **[MVP]** Authentication (Firebase Auth) | Email/password and Google OAuth sign-in. Session cookie middleware. Role-based access guard. |
| **R-004** | Critical | Open | **[MVP]** Multi-tenant organisation model | Create organisation, invite users, assign roles. Every API route scoped to organisationId. |
| **R-005** | Critical | Open | **[MVP]** Plan builder — basic wizard | Step-by-step wizard: plan name, type, effective dates, eligible participants. |
| **R-006** | Critical | Open | **[MVP]** Plan rules engine (tiers, rates, accelerators) | Core rule types: flat rate, tiered progressive, tiered retroactive, accelerator/decelerator. |
| **R-007** | Critical | Open | **[MVP]** Quota management | Create/edit/import quotas by rep, period, and territory. Quota history. |
| **R-008** | Critical | Open | **[MVP]** Transaction import (CSV) | Upload CSV, field mapping UI, validation, import job tracking. |
| **R-009** | Critical | Open | **[MVP]** Calculation engine v1 | Process transactions against plan rules, calculate earnings per rep per period. |
| **R-010** | Critical | Open | **[MVP]** Calculation audit trail | Every earnings record links to step-by-step audit log. |
| **R-011** | Critical | Open | **[MVP]** Split credit support | Multi-rep credit allocation on a single transaction. |
| **R-012** | Critical | Open | **[MVP]** Multi-currency (base + original) | Store transactions in both original and base currency. Exchange rate management. |
| **R-013** | Critical | Open | **[MVP]** Payment run workflow | DRAFT → APPROVED → EXPORTED → PAID lifecycle. |
| **R-014** | Critical | Open | Clawback rules | Time-based and event-based clawback configuration and enforcement. |
| **R-015** | Critical | Open | **[MVP]** RBAC enforcement | Six roles. All API routes enforce role and organisation scope. |
| **R-016** | High | Open | Plan approval workflow | DRAFT → REVIEW → APPROVED → PUBLISHED with configurable approvers. |
| **R-017** | High | Open | Draw against commission | Recoverable and non-recoverable draw configuration, reconciliation per period. |
| **R-018** | High | Open | Retroactive adjustments | Re-run past period calculations when source data changes. |
| **R-019** | High | Open | Period management | Support daily/weekly/monthly/quarterly/annual periods. Multiple overlapping periods. |
| **R-020** | High | Open | **[MVP]** Plan versioning + change history | Immutable plan versions. Compare versions. |
| **R-021** | Medium | Open | Plan templates library | 6 pre-built role templates: AE new biz, AE expansion, SDR, CSM, channel, named account. |
| **R-022** | Medium | Open | Exception flagging | Anomaly detection on calculation outputs. Route to Finance before payment approval. |
| **R-023** | Medium | Open | Territory management | Define territories, assign reps with effective dates. |
| **R-024** | Medium | Open | Holdback / reserve provisions | Withhold % of earnings until milestone. Auto-release. |
| **R-025** | Medium | Open | Advance commission payments | Pay portion upfront; true-up at period close. |
| **R-200** | Critical | Open | Ramp schedules for new hires | Structured ramp rates across the first N months of hire: e.g. Month 1 = 25% quota, Month 2 = 50%, Month 3 = 75%, Month 4+ = 100%. First-class model separate from pro-ration. Finance uses ramp schedules to model first-year OTE cost and comp admins use them to set fair quotas for new reps. |
| **R-201** | High | Open | Plan eligibility rules | Rule-based auto-assignment and eligibility enforcement: active status required (not on PIP, not on garden leave, not in probation), role code inclusion list, headcount type (FT only vs contractors), acknowledgment gate. Currently reps are added manually; eligibility should be enforced by rule. |
| **R-202** | High | Open | **[MVP]** Threshold to earn (minimum attainment gate) | Many plans have a binary gate — below 50% of quota, zero commission is earned. This is not a tier starting at 0%; it is a gate that must be crossed before any tier fires. Explicit configurable threshold per plan, separate from tier configuration. |
| **R-203** | Medium | Open | Kickers and deal multipliers | A bonus rate or flat amount applied on top of base commission when specific deal attributes are present: multi-year deal multiplier (1.2×), new logo bonus ($500 flat), strategic account rate boost (+2%), specific product line premium. Kickers are layered on the base plan result, not a separate plan. |
| **R-204** | Critical | Open | Crediting date choice — explicit per plan | Which date triggers credit is the #1 source of rep disputes. Each plan must specify: close date (CRM closed-won), contract signature date, invoice date, payment received date (cash basis), or revenue recognition date (ASC 606). Currently implied as close date — must be an explicit configurable field. |
| **R-205** | High | Open | TCV vs ACV commission choice on multi-year deals | A 3-year $300K contract can be commissioned on TCV ($300K), ACV ($100K/year), Year-1 ACV only ($100K), or a custom split. This is one of the most consequential plan design choices for rep motivation and Finance cash flow. Must be an explicit plan-level setting. |
| **R-206** | Critical | Open | Cumulative vs periodic attainment calculation | Periodic: each month resets. Cumulative YTD: attainment accumulates so a rep who hit 150% in January still earns at the accelerator rate in February. Most enterprise plans use cumulative YTD. This setting dramatically changes accelerator payouts and must be an explicit plan-level toggle. |
| **R-207** | High | Open | Crediting rules vs commission rules — explicit separation | Two distinct steps currently conflated in "split credit": (1) Crediting rules — which rep(s) get credit, and which portion of the deal amount is creditable (e.g. licence only, not services; renewal only, not upsell). (2) Commission rules — given a credited amount, what commission is earned under that rep's plan. Separating these resolves a structural ambiguity that causes plan configuration errors. |
| **R-208** | Critical | Open | **[MVP]** Multi-plan enrollment — rep on simultaneous plans | In practice, almost every rep is on 2–3 concurrent plans: a base new-business commission plan + an expansion overlay plan + a Q2 SPIF. Each plan calculates independently; total earnings = sum across all active enrollments. Portal shows a breakdown by plan. Currently the model has `PlanParticipant` but the calculation engine and portal must handle multi-plan output per rep per period. |
| **R-209** | High | Open | Commission accrual vs cash basis — explicit per-plan setting | Some orgs accrue commission when earned (P&L timing, typical for SaaS), others only pay when the invoice is collected (cash basis, common in services). This must be an explicit plan-level setting — not assumed. Finance uses this to control when the liability appears on the P&L. |
| **R-210** | Medium | Open | Conditional accelerators (product mix, new logo, strategic account) | Rate changes not just based on attainment but on meeting a secondary condition: e.g. "cross the 100% accelerator only if ≥30% of bookings are product X", "1.5× rate on new logo deals only", "2× rate on strategic account list only". These are layered conditions on accelerator eligibility, distinct from standard tiered progressive rules. |

### Phase 2 — Participant Portal + Reporting

| Code | Priority | Status | Title | Description |
|---|---|---|---|---|
| **R-026** | Critical | Open | **[MVP]** Participant portal — earnings dashboard | Real-time earnings, attainment gauge, YTD breakdown for reps. |
| **R-027** | Critical | Open | **[MVP]** Commission statements | Formal PDF statements per period. Downloadable. |
| **R-028** | Critical | Open | **[MVP]** Deal-level earnings detail | Rep can trace each transaction's contribution to their earnings. |
| **R-029** | Critical | Open | **[MVP]** E-acknowledgment | Plan doc display, e-sign with timestamp + IP capture. |
| **R-030** | Critical | Open | Dispute submission + workflow | Rep raises dispute; workflow to manager → Finance → resolution. SLA tracking. |
| **R-031** | High | Open | Manager team dashboard | All direct reports: quota, actual, attainment %, projected full-period. |
| **R-032** | High | Open | Commission accrual reports | Finance: earned-but-unpaid balances, formatted for journal entry. ASC 606 amortisation. |
| **R-033** | High | Open | **[MVP]** Pre-built reports library | 9 standard reports: earnings, quota attainment, plan cost, payment run, dispute, clawback, draw, capitalisation. MVP: ship Earnings by Rep and Payment Run Summary first. |
| **R-034** | High | Open | Custom report builder | Drag-and-drop builder. Save, share, schedule. Export CSV/Excel/PDF. |
| **R-035** | High | Open | What-if calculator (rep) | Rep models "if I close X more at $Y ACV, I earn $Z." |
| **R-036** | High | Open | Earnings forecast (basic) | Rule-based projection of full-period payout based on current trajectory. |
| **R-037** | Medium | Open | Leaderboards + gamification | Opt-in team attainment leaderboard. Milestone badges. Privacy controls. |
| **R-038** | Medium | Open | Push notifications (email + in-app) | Payment processed, dispute update, new plan, quota change, acknowledgment required. |
| **R-039** | Medium | Open | Pipeline-to-commission projection | Manager view: project commission expense from CRM pipeline. |
| **R-040** | Medium | Open | Budget vs actuals tracking | Commission budget set at period start; track vs actual. Alert at 90%. |
| **R-041** | Medium | Open | Quota visibility for reps | Rep sees quota history, changes, and reason codes. |
| **R-042** | Medium | Open | Interactive analytics dashboards | Filterable dashboards with drill-down, date range picker, territory/plan filter. |
| **R-143** | High | Open | Commission shadow tracker | Rep logs their own deal estimates alongside the official calculation. System shows side-by-side reconciliation with explanations for every difference. Builds trust instead of arguments. |
| **R-144** | High | Open | Real-time deal processing notification | Push alert to rep the moment a new deal is processed — not just when paid. Reps know instantly without checking the portal. |
| **R-145** | Medium | Open | Earnings ticker on portal home | Live counter showing commission accumulating in real time as deals close during the period. Motivational, not just informational. |
| **R-146** | Medium | Open | Dispute prediction — pre-emptive flagging | AI flags transactions likely to be disputed before the rep sees the statement. Finance can pre-emptively explain or correct, reducing formal dispute volume. |
| **R-147** | Medium | Open | Pre-close commission calculator | Rep enters a deal in progress: "If this closes at $120K by June 30, I earn an extra $4,800." Drives close behaviour by making the incentive concrete and immediate. |
| **R-183** | High | Open | Personal earnings goal | Rep sets a personal target ("I want to earn $150K this year"); system tracks progress vs that goal alongside quota attainment. More motivating than quota alone. |
| **R-184** | High | Open | Sprint / SPIF mode with live countdown | Time-limited SPIF with a live countdown timer and a real-time leaderboard. Ends and pays out automatically when the sprint period closes. |
| **R-185** | Medium | Open | "Chase the money" accelerator view | "You are $4,200 away from crossing the next accelerator tier. Close $52K more this month to get there." Specific, actionable, and updates in real time. |
| **R-186** | Medium | Open | Achievement certificates (PDF) | Downloadable PDF badge for: first deal closed, 100% attainment, President's Club, top performer of quarter. Reps share these — organic word-of-mouth. |
| **R-187** | Low | Open | Rep satisfaction pulse | One-question in-app survey after each payment: "How do you feel about your commission this period?" Sentiment tracked over time; anomalies flagged to managers before they become attrition signals. |
| **R-211** | High | Open | True-up recovery workflow | When a retroactive amendment creates an overpayment, the recovery path must be explicit: (1) offset against next payment (most common); (2) write-off for amounts below a configurable threshold (e.g. <$50); (3) standalone recovery request to payroll; (4) legal recovery for terminated reps with outstanding balances. Each path produces a distinct audit record. |
| **R-212** | High | Open | Terminated rep portal access and final statement | When a rep is terminated, they retain portal access for 90 days to download their final commission statements. In AU (Fair Work Act) and UK (Employment Rights Act), reps have a right to their earnings record. HRIS deprovisioning removes dashboard access but the portal remains read-only until the access window expires. |
| **R-213** | High | Open | **[MVP]** Next payment amount preview in portal | The single most-requested number from reps is "what will I actually receive next pay day." Portal home shows: "Your next payment on 31 Jul will be approximately $4,820 gross before tax withholding." Updates in real time as deals close and draws are reconciled. |
| **R-214** | Medium | Open | Earnings seasonality — 24-month personal history chart | Rep views their own 24-month rolling earnings history as a chart. Seasonal patterns (Q4 spike, summer trough), personal trajectory (improving / plateauing / declining), and best vs worst months at a glance. Contextualises the current period without needing manager intervention. |
| **R-215** | Medium | Open | Percentile ranking vs peer group (anonymised) | Without revealing individual peer data, show each rep where they sit vs their cohort: "You are in the 72nd percentile for attainment among AEs in APAC this quarter." Motivating for competitive reps; diagnostic for managers identifying reps who are falling behind. |
| **R-216** | High | Open | Plan summary in plain English | The legal comp plan document is written in legalese. The portal shows an AI-generated plain-English summary alongside the formal document: "You earn 5% on all bookings up to your quota. Once you exceed 100%, your rate increases to 8%. Above 125%, your rate increases to 12%." Generated from the plan rule JSON — always in sync, never manually maintained. |
| **R-217** | High | Open | Pipeline coverage ratio in manager view | Standard RevOps health metric: pipeline value ÷ remaining quota = coverage ratio. 3× is healthy; below 2× is at risk. Shown per rep and per team alongside attainment gauge. The earliest warning signal for a missed quarter. Requires CRM pipeline sync (R-043 or R-046). |
| **R-218** | High | Open | Attainment distribution bell curve | Visual histogram of where reps cluster in attainment. Healthy plan: normal curve centred around 90–110%. Warning signs: bimodal distribution (quota miscalibrated), heavy left-skew (quota too high, rep morale risk), heavy right-skew (quota too easy, Finance overpaying). Essential for RevOps to calibrate plan effectiveness each quarter. |
| **R-219** | High | Open | Plan amendment workflow | Plan changes mid-year are the most painful part of comp admin. A dedicated amendment workflow separate from the plan builder: propose change → change impact preview (R-135) → approval chain → grace period → effective date → rep notification → re-acknowledgment. Provides an auditable governance path for mid-year plan changes, distinct from creating a new plan version. |
| **R-220** | High | Open | Historical plan version linked to earnings statements | When a rep views an earnings statement from Q2 last year, the plan shown must be the plan that was in effect during Q2 last year — not the current plan. Statements link to the plan version ID at the time of calculation. Essential for dispute resolution and audit. Plan versioning exists; the statement-to-version linkage must be explicit. |

### Phase 3 — Integrations + Advanced Analytics

| Code | Priority | Status | Title | Description |
|---|---|---|---|---|
| **R-043** | Critical | Open | Salesforce CRM connector | Sync opportunities, closed-won deals, accounts, products. Field mapping UI. Delta sync. |
| **R-044** | Critical | Open | REST API v1 (full public API) | Full CRUD for all entities. OpenAPI spec. Sandbox support. |
| **R-045** | Critical | Open | Webhooks | All lifecycle events. HMAC signing. Retry with backoff. 72hr replay. |
| **R-046** | High | Open | HubSpot CRM connector | Native connector for HubSpot deals and contacts. |
| **R-047** | High | Open | **[MVP]** Payroll export (ADP, Xero, MYOB) | Payment file export in payroll-native formats. MVP: ship generic structured CSV first; native ADP/Xero/MYOB formats post-MVP. |
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
| **R-120** | Critical | In Progress | **[MVP]** CSV import — transactions (inbound) | Upload CSV, auto-detect field mapping, validate rows, bulk insert with ImportJob tracking. Preview step shows sample rows + mapping before commit. |
| **R-121** | Critical | In Progress | CSV export — transactions (outbound) | Export filtered transactions as CSV. Formula injection sanitisation (fixes S-021). Supports date range, source, type filters. |
| **R-122** | Critical | In Progress | Bulk JSON API — transactions (inbound) | `POST /api/transactions/bulk` accepts JSON array. Idempotent via externalId. Returns import summary with per-row errors. Used by iPaaS connectors and custom integrations. |
| **R-123** | High | Open | SFTP/FTP inbound — scheduled file pickup | Connect to a customer SFTP server; poll on schedule; auto-import new CSV/TSV files. Credential stored encrypted. Supports key-based auth. |
| **R-124** | High | Open | SFTP/FTP outbound — payment file delivery | After payment run export, push the file to the customer's payroll SFTP server automatically. Used by ADP, SAP, and enterprise payroll systems that only accept SFTP. |
| **R-125** | High | Open | Direct DB connection (inbound) | Connect to a customer's PostgreSQL, MySQL, MSSQL, or Snowflake instance. Pull deals/transactions via a configurable SQL query. Runs on schedule. Read-only connection. Credentials in Secret Manager. |
| **R-126** | High | Open | Google Sheets sync (inbound + outbound) | Pull quota or transaction data from a named Google Sheet (OAuth). Push calculated earnings back to a Sheet for Finance teams. Configurable column mapping. |
| **R-127** | Medium | Open | iPaaS connectors — Zapier / Make / Workato | Zapier app with triggers (calculation.completed, payment.approved) and actions (create transaction, create quota). Make/Workato modules for the same. Hosted on respective marketplaces. |
| **R-128** | Medium | Open | BI tool connectors — Tableau / Power BI / Looker | Read-only SQL endpoint or connector manifest exposing earnings, quota, and attainment data. Tableau Web Data Connector + Power BI custom connector. |
| **R-129** | Medium | Open | Slack / Teams notifications (outbound) | Push attainment milestones, payment confirmations, dispute alerts, and anomaly flags to configured Slack channels or Teams webhooks. Per-org webhook URL config in Settings. |
| **R-130** | Medium | Open | ERP journal entry export — NetSuite / SAP / QuickBooks | Structured accrual export formatted for direct posting: NetSuite SuiteScript CSV, SAP IDoc CSV, QuickBooks IIF. Triggered from the payment run export workflow. |
| **R-131** | Low | Open | Email attachment parsing (inbound) | Forward a CRM report email to a per-org inbound address; system extracts CSV attachment and queues it as an import job. Reduces friction for orgs that receive CRM exports via email. |
| **R-132** | Low | Open | Real-time streaming (Kafka / GCP Pub-Sub) | For high-volume environments (10K+ transactions/day): consume from a Kafka topic or GCP Pub-Sub subscription. Idempotent processing. Backpressure-aware. Phase 4 prerequisite for ML pipeline. |
| **R-133** | High | Open | Payee auto-provisioning from HRIS | When a new hire syncs from Workday/BambooHR, automatically enrol them in the correct comp plan based on role + territory rules — zero manual admin step. Gap in CaptivateIQ that we fix natively. |
| **R-134** | High | Open | Reusable plan components library | Rate tables, tier structures, quota multipliers, and SPIF rules built as reusable building blocks. Drop into any plan. Change once → propagates to every plan using that component. |
| **R-135** | High | Open | Change impact preview before publish | Before publishing any plan amendment: show affected rep count, projected commission cost delta (±$), and reps who will cross tier or accelerator thresholds as a result. Publish with confidence. |
| **R-136** | High | Open | Revenue intelligence — pipeline-to-accrual forecast | Connect weighted CRM pipeline (by stage probability) to commission accrual forecast. Finance sees "projected commission expense next quarter: $1.2M ± $180K" before the period closes. |
| **R-137** | Medium | Open | MCP Server — expose SmartCommission as an AI tool | Implement a Model Context Protocol server so AI assistants (Claude, Copilot, ChatGPT) can query earnings, attainment, disputes, and quotas directly without logging into the app. Follows Performio's 2026 architecture lead. |
| **R-148** | High | Open | Channel partner portal | Separate login for resellers, distributors, and referral partners. Partners see their own registered deals, earned commissions, and statements — isolated from internal rep data. |
| **R-149** | High | Open | Deal registration | Partners register a deal before close to claim credit and prevent channel conflict. Includes approval workflow, expiry date, and conflict detection when two partners register the same prospect. |
| **R-150** | High | Open | Partner tiers — Gold / Silver / Bronze | Different commission rates, MDF budgets, and co-op fund eligibility per partner tier. Tier assignment rules based on trailing 12-month revenue or manual admin override. |
| **R-151** | Medium | Open | Marketing development funds (MDF) | Partners submit MDF / co-op marketing fund claims alongside commission. Admin approves or rejects with notes. Balance tracked per partner per period. |
| **R-152** | Medium | Open | Multi-partner deal splits | Two or more partners contributed to one deal — split credit with configurable rules (percentage, primary + overlay, full credit to all). |
| **R-153** | Medium | Open | Partner onboarding workflow | Application → approval → agreement e-sign → portal access → first commission in a single guided flow. Partner status tracked at each stage. |
| **R-154** | High | Open | Customer Success commission plans | Commission based on NRR, renewal rate, expansion bookings, and health score. CS reps have different data sources and metrics from AEs — first-class support for both. |
| **R-155** | High | Open | BDR / SDR commission plans | Commission on meetings booked, qualified pipeline generated, and conversion rate to AE. Upstream metrics tracked separately from closed revenue. |
| **R-156** | Medium | Open | Partnerships team commission | Revenue share and referral fees for partnership managers. Tracks co-sell and sourced revenue as distinct from direct sales. |
| **R-157** | Medium | Open | Recruitment commission | Placement fees, time-to-fill bonuses, and internal referral bounties. Separate plan type with different triggers (candidate placed, 90-day retention milestone). |
| **R-158** | Medium | Open | Any-metric plan support | The plan builder supports any measurable outcome as a commission trigger — not just CRM deal data. Admin defines the metric, the data source, and the calculation rule. Enables any team with a measurable target to have a commission plan. |
| **R-170** | Critical | Open | Compensation calendar | Visual timeline of all active plans, quota periods, payment dates, approval deadlines, and plan expiry dates across the whole org. Admin sees everything in one view. |
| **R-171** | High | Open | Mass quota update grid | Bulk-edit an entire team's quotas in a spreadsheet-style grid. Paste from Excel, edit inline, save all at once. No more one-rep-at-a-time quota entry. |
| **R-172** | High | Open | Plan duplication | Copy any existing plan as a starting point. Update effective dates and tweak rules — no rebuilding from scratch for the new fiscal year. |
| **R-173** | High | Open | Automated period rollover | New period auto-created with the same plan structure at the end of each period. Admin just reviews and publishes — no manual reconstruction. |
| **R-174** | High | Open | Month-end close checklist | Structured task list with owners and due dates: data import confirmed → calculation run → exceptions reviewed → Finance approved → payroll exported. Each step timestamped for audit. |
| **R-175** | Medium | Open | Plan expiry alerts | Notify admin X days before any plan expires so reps are never left without a live plan. Configurable lead time per org. |
| **R-176** | Medium | Open | Comp ops task manager | All recurring admin tasks (quota setting, plan launch, month-end close, payment run) in one queue with due dates, owners, and completion tracking. |
| **R-177** | Critical | Open | ASC 606 / AASB 15 capitalisation schedule | Automatically classify commissions as capitalised (multi-year contracts, amortised over term) vs immediately expensed. Generate the amortisation schedule per deal for Finance. |
| **R-178** | High | Open | Month-end accrual automation | Calculate earned-but-unpaid commission at any point-in-time and format as a ready-to-post journal entry. Finance runs this once at month-end — no manual calculation. |
| **R-179** | High | Open | Over/underpayment exposure report | Total dollars owed to reps from retroactive adjustments; total potentially recoverable from overpayments. Broken down by rep, period, and plan. |
| **R-180** | High | Open | Commission as % of ARR (unit economics) | For every $1 of ARR, we paid $X in commission. Broken down by product line, territory, rep tier, and deal source. CFO-level view of commission efficiency. |
| **R-181** | Medium | Open | Holdback liability report | Total commission held in reserve (pending milestone trigger or clawback window), aged by hold duration, by rep. Shows Finance the forward liability. |
| **R-182** | Medium | Open | Commission budget variance alert | When actual commission expense exceeds 90% of the period budget, auto-alert Finance with a breakdown of which reps and plans are driving overage. |
| **R-188** | High | Open | Ramp attainment curve | New hire commission by tenure month: "Month 1: 22% of quota, Month 6: 78%, Month 9: 100%." Helps Finance model ramp costs and set realistic first-year OTE. |
| **R-189** | High | Open | Plan ROI calculator | Is this plan design generating revenue above its cost? Calculation: incremental revenue attributable to plan incentives × gross margin − total commission spend = plan ROI. |
| **R-190** | High | Open | Win rate vs earnings correlation | Do higher-paid reps close more? Does attainment-linked pay actually drive performance? Prove it with data — or redesign the plan if it doesn't. |
| **R-191** | Medium | Open | Top performer DNA | What plan structures, territory sizes, and quota levels correlate with the highest attainment? Surfaces data-backed plan design recommendations. |
| **R-192** | Medium | Open | Territory white space analysis | Where are we under-invested vs pipeline density? Commission data + CRM territory data reveals coverage gaps and over-assignment. |
| **R-193** | Medium | Open | Cost of customer by channel | Commission spend per new logo, broken down by source: inbound, outbound, partner, event. Helps Marketing and RevOps allocate budget to highest-ROI channels. |
| **R-194** | High | Open | Custom fields on transactions | Orgs add their own fields (product family, deal source, segment, contract length) and use them directly in plan rules — no code changes, no professional services. |
| **R-195** | High | Open | Custom plan rule functions | Library of composable functions (like spreadsheet formulas) that admins chain together. Advanced orgs write their own logic without a developer or vendor engagement. |
| **R-196** | Medium | Open | Embeddable commission widget | JS snippet that embeds a rep's live earnings ticker into any internal tool — Notion, Confluence, internal portal, Slack canvas. Keeps reps motivated without requiring a portal login. |
| **R-197** | Medium | Open | Public developer portal | Docs, API explorer, SDKs in JS/Python/Go, sandbox environment, and webhook testing tool. Self-serve onboarding for technical customers and integration partners. |
| **R-198** | Medium | Open | White-label mode | PEOs, payroll bureaus, and comp consultancies run SmartCommission under their own brand for their clients. Custom domain, logo, and colour scheme. Revenue share model. |
| **R-199** | Low | Open | Compensation consultancy marketplace | Connect customers with verified comp design consultants who work directly inside the SmartCommission platform — see the data, build the plan, hand it over. |
| **R-221** | High | Open | Quota adequacy / calibration tools | Statistical analysis to help comp admins set quotas that are achievable but stretching: historical attainment distribution for this role/territory/period, suggested quota from trailing 4-quarter average × growth factor, projected % of reps hitting 100%+ at a given quota level, and quota-to-OTE ratio check (target: 5–6× OTE for AE roles). No ICM tool gives SMBs this analysis natively. |
| **R-222** | High | Open | Bad debt / AR-linked commission recovery | When a customer does not pay their invoice, the commission earned on that deal may need to be recovered (distinct from clawback, which is contract/behaviour-triggered). ERP connectors bring in invoice payment status — link unpaid invoices older than N days to the relevant commission record and flag for Finance review. Generate a bad-debt commission exposure report. |
| **R-223** | High | Open | Minimum wage reconciliation (AU + US state laws) | In AU (Fair Work Act) and several US states (CA, NY, IL), if total earnings in a pay period fall below the statutory minimum wage for hours worked, the employer must make up the difference. Flag payment runs where variable-only reps may be below minimum; generate a top-up adjustment record. Plan builder warns if a plan design could theoretically produce zero earnings in a period. |
| **R-224** | Medium | Open | Payroll garnishment accommodation | When a rep has a legal wage garnishment (AU ATO debt, US child support order, UK court judgment), the ICM export must accommodate it. Add a `garnishmentDeduction` field to payment records; payroll export includes a garnishment flag so the payroll system can apply the deduction after receiving the gross commission. SmartCommission does not calculate the garnishment — it provides the passthrough. |
| **R-225** | Medium | Open | Dispute root cause classification and analytics | After each dispute is resolved, classify the root cause: data mismatch (CRM vs ERP), territory overlap / ambiguous assignment, plan misunderstanding, calculation error, missing transaction, or other. Over time, surface a root cause trend report for comp admins: "60% of disputes in Q2 were data mismatch — fix the Salesforce integration." Drives process improvement rather than just closing tickets. |
| **R-226** | Medium | Open | E-signature jurisdiction validity guide | The e-acknowledgment UI informs the comp admin which jurisdictions treat electronic signatures as legally binding for commission plan acknowledgments: AU (Electronic Transactions Act 1999 ✅), US federal (ESIGN Act ✅), California (Labor Code §2751 — additional requirements apply ⚠️), UK (Electronic Communications Act 2000 ✅). Flags where wet signature or additional steps are required. |
| **R-227** | High | Open | Commission statement legally compliant format per jurisdiction | "Legally formatted" in R-027 is aspirational. This makes it explicit: AU (Fair Work Act pay slip requirements: pay period, gross, tax, net, employer super), UK (itemised pay statements under Employment Rights Act), California (Labor Code §2751: itemised commission statement requirements). Jurisdiction-aware PDF templates generated per payee based on their work location. |

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
| **R-138** | Critical | Open | Plan simulator — scenario modelling with cost impact | Before publishing, model "what if I change the accelerator threshold from 100% to 110%?" — shows projected cost change, % of reps hitting each tier, and attainment distribution shift. Competitive differentiator vs every mid-market tool. |
| **R-139** | Critical | Open | AI commission explainer for reps | Rep asks in natural language: "Why did I earn $8,200 this month instead of $10K?" AI traces the exact calculation — which deals included, which tier applied, which splits reduced the total — and explains in plain English. Reduces disputes significantly. Mirrors Spiff Assistant. |
| **R-140** | High | Open | Plan health score | AI scores every published plan on: participation rate, earnings distribution (Gini), attainment spread, cost efficiency vs OTE, and behavioural alignment. Flags plans likely to drive the wrong behaviours before reps feel the effect. |
| **R-141** | High | Open | Manager coaching panel | AI surfaces at-risk reps with suggested actions: "Rep A at 42% attainment with 8 days left — schedule pipeline review"; "Rep B hasn't logged a deal in 14 days"; "Rep C pacing 160% — verify data quality." Actionable, not just a leaderboard. |
| **R-142** | Medium | Open | In-app benchmarking — anonymised aggregate data | Over time, aggregate anonymised attainment, payout, and plan structure data across SmartCommission orgs. Surface benchmarks: "Your AE OTE is 12% below median for B2B SaaS in APAC." Long-term data moat — mirrors Xactly's 20-year dataset advantage. |
| **R-159** | High | Open | OTE dashboard | Rep sees: Base $120K + Variable target $80K = OTE $200K. Current period: 73% of OTE achieved. Makes the full earnings picture explicit, not hidden in offer letters. |
| **R-160** | High | Open | Total compensation view | Base + Commission YTD + Equity vesting schedule + Super/pension on one screen. Nobody in ICM bridges this gap today — all other tools stop at variable comp. |
| **R-161** | High | Open | Comp letter generation | System generates a formatted total compensation letter with OTE breakdown, plan summary, quota, and e-sign acknowledgment. Replaces manual HR/comp letter drafting. |
| **R-162** | Medium | Open | Equity alongside commission — RSU / options tracking | Track RSU vesting dates and unvested equity value alongside commission. Show reps their total annual comp including unvested equity. No ICM tool does this today. |
| **R-163** | Low | Open | Benefits cost visibility | Optional module: show employer cost vs employee-visible comp (super, health, leave loading). Full total cost of employment visible to Finance and optionally to reps. |
| **R-164** | Critical | Open | Australian superannuation on commission | Commission is SG-applicable in AU. From July 2026, SG must be paid per pay run (not quarterly). Track super liability per commission payment and include in payroll export. |
| **R-165** | Critical | Open | Australian payroll tax by state / territory | Variable rates and thresholds by AU state: NSW 5.45%, VIC 4.85%, QLD 4.75%, WA 5.5%, etc. Flag when a payment run crosses a state threshold. Generate a state-by-state payroll tax report. |
| **R-166** | High | Open | California clawback restriction guard | AB 1870 prohibits clawbacks on vested commissions for CA-based reps. Plan builder warns when a clawback rule would violate this. API blocks export of non-compliant clawbacks for CA payees. |
| **R-167** | High | Open | UK FCA-regulated commission deferral rules | Financial services roles in the UK have mandatory deferral and clawback requirements under FCA remuneration codes. Plan builder flags non-compliant structures for FCA-regulated orgs. |
| **R-168** | High | Open | US supplemental federal withholding tracking | Commission payments are subject to 22% federal supplemental withholding. Track gross vs net per rep per payment run; include in payroll export for ADP/Workday reconciliation. |
| **R-169** | Medium | Open | AU PAYG withholding on commission | Commissions are supplemental income in AU with specific PAYG withholding obligations. Track withholding per payment run and generate ATO-formatted payment summary data. |
| **R-228** | Medium | Open | President's Club as a formal plan type | President's Club is a budget-constrained recognition award for the top N% of reps by annual attainment. First-class plan type: define qualification threshold (e.g. top 10%), budget per qualifer, eligibility period (full calendar year), and distribution date. Tracks running qualification status for each rep throughout the year and awards formally when the period closes. |
| **R-229** | High | Open | Labour law floor check in plan builder | In AU (Fair Work Act), UK, and several US states, a commission plan cannot produce total earnings below the statutory minimum wage for hours worked. The plan builder analyses the plan structure and warns if a rep could theoretically earn zero commission in a period — making them reliant solely on base (or nothing, for commission-only reps). Required before plans go live in these jurisdictions. |

---

### Phase 0 — Pre-Implementation (New — added 2026-06-18)

| Code | Priority | Status | Title | Description |
|---|---|---|---|---|
| **R-076** | Critical | ✅ DONE 2026-06-20 | **[MVP]** Create Next.js App Router project scaffold | `apps/web/` exists with Next.js 16, Tailwind v4, Geist font, Prisma 7, next-themes, all canonical dependencies. |
| **R-077** | Critical | ✅ DONE 2026-06-20 | Implement superuser pattern | `isSuperAdmin()`, self-revoke protection, superadmin console all implemented. |
| **R-078** | Critical | ✅ DONE 2026-06-20 | Add SecurityLog Prisma model | `SecurityLog` in `prisma/schema.prisma` with full index coverage. |
| **R-079** | Critical | ✅ DONE 2026-06-20 | Implement lib/audit.ts and lib/security-log.ts | Both utilities fully implemented. All API routes call logAudit. |
| **R-080** | Critical | ✅ DONE 2026-06-20 | Implement lib/pii.ts | All five masking functions implemented in `apps/web/lib/pii.ts`. |
| **R-081** | Critical | ✅ DONE 2026-06-20 | Implement lib/request-context.ts | Implemented in `apps/web/lib/request-context.ts`. |
| **R-082** | Critical | ✅ DONE 2026-06-24 | **[MVP]** GCP infrastructure provisioning | GCP project `smartcommission-prod` fully provisioned. Cloud Run deployed, Cloud SQL on shared instance, Artifact Registry, Cloud Build, Monitoring alerts, Uptime check (added 2026-06-26). |
| **R-083** | Critical | Open | **[MVP]** Publish Terms of Service, Privacy Policy, Cookie Policy | Required before any public launch. Engage legal review. See `legal-compliance.md`. |
| **R-084** | High | Open | Sign DPAs with all sub-processors | GCP, Stripe, Resend, Open Exchange Rates. Required for GDPR compliance. See `legal-compliance.md`. |
| **R-085** | High | Open | **[MVP]** Implement cookie consent banner | Required for EU/UK users. Needed before any analytics or non-essential cookies. |
| **R-086** | High | Open | Implement lib/context.ts + role-switching API routes | `getActiveContext()`, `buildContextCookie()`, `GET /api/context/available`, `POST /api/context/switch`. Required for multi-role users. See role-switching.md. |
| **R-087** | High | Open | Implement RoleSwitcher and ProxyBanner components | RoleSwitcher dropdown in every layout header; amber ProxyBanner during impersonation. See role-switching.md. |
| **R-088** | High | ✅ DONE 2026-06-20 | **[MVP]** Implement Toast + ConfirmDialog system | `lib/toast.tsx`, `lib/confirm.tsx`, `components/ui/Toaster.tsx`, `components/ui/ConfirmDialog.tsx` all implemented and wired into root layout. |
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
| **R-099** | **Critical** | ✅ DONE 2026-06-25 | **[MVP]** Re-enable Cloud SQL backups and PITR | ✅ Enabled on shared instance `shared-db-sydney` (prakash-shared): daily at 01:00, 14-day retention, PITR on. Verified via `gcloud sql instances describe`. |
| **R-100** | High | Open | **[MVP]** Enable Firebase Auth providers (Email/Password + Google) | Must visit Firebase Console → Authentication → Get started and enable providers manually. Cannot be automated. Blocks all user registration. See I-009. |
| **R-101** | High | Open | **[MVP]** Fill in 4 missing secrets in Secret Manager | Populate `smartcommission-stripe-secret`, `smartcommission-stripe-webhook`, `smartcommission-oxr-key`, `smartcommission-resend-key` in GCP Secret Manager before first deploy. See I-010. |
| **R-102** | Medium | ✅ DONE 2026-06-29 | Add mobile bottom navigation bar | Confirmed implemented in `(dashboard)/layout.tsx`: fixed bottom bar, `max-w-[430px] mx-auto`, `env(safe-area-inset-bottom)`, `pb-24` clearance. See U-006. |
| **R-103** | Medium | Open | Full WCAG 2.1 AA aria-label audit on dashboard and portal pages | Systematically audit every page in `app/(dashboard)/` and `app/(portal)/` for icon-only interactive elements missing `aria-label`. See A-002. |
| **R-104** | Low | Open | Add Cache-Control to /api/release-notes/tenant and /api/query-console/queries | Semi-static admin list routes should add `Cache-Control: private, s-maxage=60` to reduce redundant DB reads. Currently both routes lack this header. |
| **R-105** | Medium | Open | **[MVP]** Wire FX rate lookup into transaction write path | `POST /api/transactions` currently stores `amountBase = amount` (skipping FX conversion). When the `/api/internal/fx/refresh` endpoint is implemented, wire it into transaction creation so `amountBase` and `exchangeRate` reflect the actual conversion. See B-002. |
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
| R-119 | Medium | Open | Set min-instances=1 to eliminate cold starts | Current mitigation is a 5-min Cloud Scheduler warmup ping (`smartcommission-warmup`). Upgrade to `min-instances=1` when DAU > 100 to fully eliminate cold start latency (~$15–20 AUD/month extra). See `docs/runbook.md` → Cold Start Management for the exact command. |
| R-120 | Critical | Open | Deploy latest code to Cloud Run | Health endpoint, ChevronLeft fix, dev-local.sh, and backup re-enable changes have not been deployed since 2026-06-24. Push to main to trigger Cloud Build and deploy revision that includes `/api/health`. Resolves I-019, I-020. |
| R-121 | Medium | Open | Fix violet spinners in 3 superadmin pages | Replace `border-indigo-500` with `border-violet-500` in `/admin/orgs/page.tsx` line 36, `/admin/users/page.tsx` line 60, `/admin/logs/page.tsx` line 55. See U-012. |
| R-122 | Low | Open | Add `isSuperAdmin()` email guard robustness warning | Add `// IMPORTANT: email must always be passed — omitting it bypasses the permanent superadmin guard` inline comment in `lib/auth/superadmin.ts`. Consider making the parameter non-optional. See S-023. |
