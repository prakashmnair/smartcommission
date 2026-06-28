# SmartCommission — Product Strategy & Competitive Assessment

Last updated: 2026-06-26

---

## Product Vision

SmartCommission is a self-serve incentive compensation management (ICM) platform for sales teams of any size. It eliminates spreadsheet-based commission tracking, reduces disputes, and gives every rep real-time visibility into their earnings — without the 3–23 month implementation timelines, vendor lock-in, and opaque pricing of enterprise ICM tools.

---

## Market Assessment

### The Pain Is Real

Sales ops and RevOps teams universally hate their current commission tools. The ICM market has validated exits: Spiff acquired by Salesforce (~$419M), Xactly taken private ($1.7B), CaptivateIQ raised $100M+. Commission calculation is not a vitamin — it is a painkiller. Every company with a sales team has this problem.

### The Mid-Market Gap

Enterprise tools (Xactly, Varicent, SAP Commissions) are overbuilt for SMB and mid-market, require professional services engagements, and take 3–23 months to implement. Spreadsheet workarounds are universal in the 10–500 rep segment. CaptivateIQ and Spiff target this segment but remain US-centric and do not handle AU compliance.

### Australia Is a Priority Beachhead

Australia is underserved by all major ICM vendors. US-centric tools do not handle:
- Superannuation on commission (R-164, mandatory from July 2026)
- State-based payroll tax calculation (R-165)
- Fair Work Act earnings statement requirements (R-227)
- AU PAYG withholding on supplemental income (R-169)

A locally-built product that handles these natively creates a compliance moat for AU customers that US competitors cannot easily replicate. Win Australia thoroughly before expanding globally.

---

## Competitive Positioning

| Competitor | Strength | Their Weakness | Our Angle |
|---|---|---|---|
| **Xactly** | 20yr data moat, enterprise depth | 6–12 month implementation, opaque pricing, vendor lock-in | Self-serve, transparent pricing, < 2 week setup |
| **Varicent** | Broadest SPM suite | Slowest implementation in market, complex, expensive | Simplicity, modern UX, no professional services required |
| **CaptivateIQ** | Spreadsheet-formula model, RevOps-friendly | US-only, no AU compliance, formula-based engine limits auditability | AU-first, rule-based engine, full audit trail |
| **Salesforce Spiff** | Salesforce-native, large ecosystem | Requires Salesforce CRM, limited outside that ecosystem | CRM-agnostic, works with any CRM or CSV import |
| **Everstage** | Modern UX, no-code, ease of use | Thin audit trail, limited compliance features | Deeper compliance, better audit trail for Finance |
| **QuotaPath** | Simple, SMB-accessible | Too simple for real comp plans, no multi-currency, no AU | More powerful while staying self-serve |
| **Performio** | AU-based, component-based plans | Not modern, UI dated, no AI features | Modern stack, AI-native from day 1, better UX |
| **Forma.ai** | AI-first enterprise | Enterprise only, high cost, slow sales cycle | Mid-market accessible, faster time-to-value |

### Durable Differentiators

1. **Self-serve plan changes** — Comp admins change plans without vendor engagement. No other enterprise tool allows this.
2. **< 2 week setup** — From signup to first calculation run. Competitors measure in months.
3. **Transparent, predictable pricing** — No per-implementation fees, no professional services required.
4. **AU compliance built-in** — Super on commission, payroll tax by state, Fair Work Act statements — native, not bolted on.
5. **Open API + white-label** — Distribution through payroll bureaus, PEOs, and comp consultancies.
6. **Full calculation audit trail** — Every rep and every auditor can trace exactly how every number was derived. No black box.

---

## Structural Risks

### Risk 1 — Calculation Engine Correctness (Critical)

The ICM product graveyard is full of tools with beautiful UX that shipped calculation engines that occasionally produced wrong numbers. When a rep discovers a calculation error and has to explain to their sales team why their commission was wrong, the product is dead to that customer. Trust never fully recovers.

R-009 (Calculation engine v1) is a single roadmap item that represents multiple distinct engineering problems:
- Rule evaluator (fires PlanRules against a credited amount)
- Transaction processor (ingests a transaction, routes credits to enrolled reps across all active plans)
- Period aggregator (cumulative vs periodic, multi-period overlaps)
- Retroactive recalculation engine (reprocesses a period when source data changes)

**This must be decomposed, built slowly, and tested exhaustively on real edge cases before any customer sees it.** See ADR-010.

### Risk 2 — Sales Cycle Length

The buyer is Sales Ops or RevOps. They cannot self-serve a decision to switch ICM tools. They need to import their actual plans, run their last 3 months of deals through the engine, and verify outputs match what they have been paying. That is a 2–4 week evaluation cycle minimum. The trial experience must be designed around that evaluation flow — not a generic SaaS onboarding.

### Risk 3 — CSV Import Quality Determines Early Retention

For MVP customers, the first experience is a CSV import. If the field mapping is confusing, validation errors are cryptic, or the import produces wrong results because of a date format mismatch, the customer leaves immediately. The CSV import UX (field mapping, preview, error reporting, partial commit) is MVP-critical and consistently underinvested.

### Risk 4 — CRM Integration Window

MVP deliberately excludes CRM connectors. Customers who import CSV manually will tolerate it briefly — not permanently. The window to ship Salesforce connector (R-043) after launch is approximately 3–6 months before customer frustration becomes a retention problem.

### Risk 5 — Dispute Resolution by Email at MVP

Disputes are emotionally charged. A rep whose dispute resolution path is "email your comp admin" loses trust in the product even when the outcome is correct. R-030 (dispute workflow) was excluded from MVP. It must be the first feature added post-MVP, not the last.

### Risk 6 — AI Data Moat Requires Day-1 Data Strategy

The benchmarking feature (R-142) — "Your AE OTE is 12% below median for B2B SaaS in APAC" — is a long-term competitive moat mirroring Xactly's 20-year dataset. But it requires 2+ years of anonymised earnings data across hundreds of organisations before it becomes credible. The data strategy must be designed before the first customer signs up: what is collected, how it is anonymised, what consent the customer gives. This is a schema and legal question, not a Phase 4 question. See ADR-012.

### Risk 7 — Multi-Plan Enrollment Architecture

R-208 (multi-plan enrollment) is in the MVP scope. If the calculation engine is built for single-plan-per-rep first and multi-plan support is added later, the rewrite will be disruptive. The data model and execution model must be designed for multiple simultaneous plan enrollments from the first sprint. See ADR-010.

---

## What Would Make It Truly Great

### 1. Speed to First Correct Calculation

The moment a customer runs a calculation and the number matches what they have been doing in their spreadsheet, they are hooked. Design the entire onboarding flow backwards from that moment. Target: new customer reaches their first correct calculation run within 90 minutes of signup. Every minute beyond that reduces trial-to-paid conversion.

### 2. Trust Over Features, Always

Every feature prioritisation decision should be filtered through one question: does this make reps trust the number more? The audit trail, the shadow tracker (R-143), the plain-English plan summary (R-216), the calculation explainer (R-139) — these win. A beautiful analytics dashboard that sits on top of a calculation reps do not trust is worthless.

### 3. Win Australia Thoroughly Before Expanding

AU-first is a strategy, not a limitation. Own the AU market — compliance depth, local customer success, AU payroll integrations (Xero, MYOB, ADP AU), relationship with the ATO. Build the reference customers and case studies. Then expand to UK (similar regulatory complexity, underserved), then US. Attempting to be global from day 1 with an early-stage calculation engine is how products become mediocre everywhere.

### 4. The Open API and White-Label Mode Are Underrated

Payroll bureaus, PEOs, and comp consultancies serving SMBs are a high-value distribution channel that larger ICM vendors ignore. Getting 3–5 consultancy or PEO partners to use SmartCommission for all their clients could generate significant ARR without a traditional enterprise sales motion. R-197 (developer portal) and R-198 (white-label mode) are Phase 3 items but should be discussed with potential channel partners much earlier.

### 5. The Data Strategy Is the Long Game

Two years of anonymised earnings data across hundreds of organisations is worth more than any individual feature. Start collecting it on day 1, with proper consent and anonymisation. The benchmarking moat (R-142), plan optimisation (R-065), and top performer DNA (R-191) features all depend on this dataset. This is SmartCommission's version of Xactly's 20-year data advantage — but reachable in 2–3 years if the strategy is right from the start.

---

## Strategic Verdict

SmartCommission can be a great product. The domain analysis is unusually deep for an early-stage product. The differentiation is real, not invented. The market is large and the pain is chronic.

**It will be great if:**
- The calculation engine is built slowly and correctly — tested on real edge cases before any customer sees it
- The onboarding experience consistently gets customers to their first correct calculation in under 90 minutes
- Australia is owned thoroughly before global expansion is attempted
- The data strategy for the AI moat is locked in before the first customer signs up

**It will be average if:**
- The calculation engine ships fast and "mostly correct"
- Feature development outpaces the quality of the core loop
- Global expansion is attempted before AU is well-established

The difference between great and average in ICM is not the feature list. It is whether the number is right, every time, for every plan, and whether reps believe it without having to check.

---

## Related Documents

- [features.md](features.md) — Full roadmap with MVP-tagged items
- [decisions.md](decisions.md) — ADR-010 (Calculation Engine Quality), ADR-011 (AU-First Market Strategy), ADR-012 (Data Collection Strategy)
- [legal-compliance.md](legal-compliance.md) — AU/UK/US compliance requirements
- [marketing-seo.md](marketing-seo.md) — Go-to-market strategy and SEO plan
- [onboarding.md](onboarding.md) — First value moment design
