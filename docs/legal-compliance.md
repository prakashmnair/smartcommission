# SmartCommission — Legal & Regulatory Compliance

Last reviewed: 2026-06-18 (Session 2 — Expert Review)
Next review due: 2026-09-18 (quarterly)

---

## Overview

This document tracks legal and regulatory compliance across all jurisdictions where SmartCommission operates or is accessible. SmartCommission processes highly sensitive compensation data — salary equivalents, commission rates, quota amounts, and individual deal values. This data carries stricter privacy obligations than typical SaaS products and intersects with employment law, financial reporting standards, and tax regulations in every jurisdiction.

If a specific law cannot be fully complied with, the product **must not be released or made accessible in that region** until compliance is achieved.

---

## Regional Law Assessment

### Privacy & Data Protection

| Jurisdiction | Law | Status | Notes |
|---|---|---|---|
| European Union | GDPR | Partial — data mapping incomplete | Compensation data may qualify as sensitive data requiring explicit consent or legitimate interest documentation. DPAs with sub-processors not yet signed. |
| United States — California | CCPA / CPRA | Partial — not assessed for employees | CCPA covers California employees as of 2023 (CPRA). Commission data is personal information. Employee privacy notice required. |
| Australia | Privacy Act 1988 + APPs | Partial — APP 3 consent review needed | APP 3 requires consent for collection. Commission data is sensitive (financial) — enhanced protections may apply under future reforms. |
| United Kingdom | UK GDPR | Partial — same gaps as EU GDPR | UK GDPR mirrors EU GDPR post-Brexit. Commission data = personal data. Same DPA/lawful basis documentation gaps apply. UK ICO is the supervisory authority. PAYE implications for commission payments (see Section 3). |
| Canada | PIPEDA / Law 25 (Quebec) | Not Assessed — flag if Canadian users sign up | Employee personal information covered by PIPEDA. Quebec Law 25 has additional requirements (privacy impact assessment). Not targeting Canada in Phase 1; monitor for Canadian signups. |
| Brazil | LGPD | Not Assessed | Not targeting Brazil market in Phase 1. |
| India | DPDP Act 2023 | Not Assessed | Not targeting India market in Phase 1. |
| China | PIPL | Blocked — geo-restricted | Cannot comply with PIPL data localisation requirements. Not targeting China market. |
| Singapore | PDPA | Not Assessed | APAC expansion target for Phase 3. |
| Japan | APPI | Not Assessed | APAC expansion target for Phase 3. |

---

### ICM-Specific Legal Issues

#### 1. Compensation Data Sensitivity

Commission data includes: individual quota amounts, earnings, deal values, payout rates, and OTE figures. This is equivalent to salary data in sensitivity and may be subject to:

- **GDPR Article 9 special categories** — Compensation data is not listed in Article 9 but may be treated as sensitive personal data under national law in some EU jurisdictions. Recommendation: treat it as sensitive and document the lawful basis for processing (employment contract or legitimate interest).
- **Wage confidentiality clauses** — Some employment contracts include confidentiality clauses around compensation. SmartCommission cannot enforce such clauses between employees but must ensure data is not exposed to inappropriate parties (e.g., a rep should never see another rep's earnings). Enforced via RBAC (see security.md).
- **Australian Privacy Act proposed reforms (2024)** — Proposed "sensitive information" expansion may capture financial personal data. Monitor for enactment.

#### 2. SOX Compliance (for publicly traded customers)

Customers who are US-listed public companies are subject to Sarbanes-Oxley Act (SOX) requirements. SmartCommission's role in SOX compliance:

- **Section 302/404 internal controls:** Commission expense is a material financial line item. The calculation process must have adequate internal controls. SmartCommission's audit trail, approval workflows, and segregation of duties support this.
- **Segregation of duties:** Plan designers (ADMIN) cannot approve payment runs (FINANCE). Finance approvers cannot edit the calculations they approve. This is enforced by RBAC.
- **Immutable audit trail:** Every calculation step, approval, and payment is logged immutably. Required for SOX Section 404 documentation.
- **Management representation:** Customers' Finance teams will use SmartCommission data in their SOX 404 assessments. SmartCommission should provide: a SOX controls summary document, evidence of our own SOX-equivalent internal controls, and SOC 2 Type II report (planned Phase 4).

SmartCommission does not currently have a SOC 2 Type II report. This is a blocker for enterprise customers in publicly traded companies. **Priority: Phase 4 (R-069).**

#### 3. Tax Implications of Commission Payments

Commission payments are employment income (or contractor income) in all jurisdictions. Tax implications:

- **US:** Commission income is subject to federal and state income tax withholding. The IRS supplemental wage withholding rate (22% flat for amounts ≤$1M) applies to commissions paid separately from regular wages. Commissions above $1M in a calendar year are withheld at 37%.
- **Australia:** Commissions are ordinary income under the Income Tax Assessment Act. PAYG withholding applies. Withholding rates depend on whether the commission is paid with regular salary (marginal rate) or as a lump sum (Schedule 5 rates apply for back payments and lump sums).
- **UK:** PAYE applies to all commission payments. If paid as a separate payment not alongside regular wages, employers must use the employee's tax code on the payment.
- **SmartCommission's responsibility:** SmartCommission calculates the gross commission amount. It does **not** calculate tax withholding — that is the payroll system's responsibility. SmartCommission exports gross figures to the payroll system (ADP, Xero, Workday etc.) which handles withholding and reporting.
- **Disclosure required:** SmartCommission's terms of service must clearly state that the platform calculates gross commission only and does not provide tax advice or withhold taxes. Customers must ensure their payroll systems handle withholding correctly.

#### 4. Contract Law: Commission Plan Acknowledgment

A compensation plan that is signed (acknowledged) by the employee creates a binding contract term in most common-law jurisdictions. Key requirements:

- **Written form:** The plan document must be in writing and clearly state the commission structure, eligibility, payment schedule, and any clawback terms.
- **Consideration:** The employee's continued employment (or execution of new employment duties) is typically the consideration for accepting a commission plan mid-employment.
- **Clear terms:** Ambiguous commission plan terms are typically construed against the employer in disputes. SmartCommission plan documents should be generated from the structured rule definitions, not free-form text, to minimise ambiguity.
- **SmartCommission e-acknowledgment:** The PlanAcknowledgment record (timestamp, IP, user agent) creates a record of acceptance. This should be sufficient for electronic contract formation in AU, US, UK, and EU under the respective e-signature laws (AU Electronic Transactions Act, US ESIGN Act, EU eIDAS Regulation).
- **Change management:** If a plan is modified mid-period, the employee must re-acknowledge. SmartCommission enforces re-acknowledgment on plan update (configurable: optional or mandatory).

#### 5. Wage Payment Laws — Commission Vesting and Clawback

This is the most legally complex area of ICM compliance. Rules differ significantly by jurisdiction:

**Australia — Fair Work Act 2009:**
- Commissions are "wages" under the Fair Work Act.
- Under the Act, an employer generally **cannot deduct** money from an employee's wages unless the deduction is authorised by the employee in writing or required by law.
- Clawback clauses that require repayment of commissions after they have been earned (i.e., after the deal closed and the rep performed) are legally uncertain in Australia.
- Best practice: clawbacks should be framed as "commission is contingent on [condition]" (i.e., the right to commission is not vested until the condition is met, rather than a post-vesting recovery). This distinction matters legally.
- SmartCommission must allow plan designers to frame clawback rules as "conditional vesting" (commission not earned until condition met) rather than "earned-then-recovered" — the latter is harder to enforce in Australia.
- **Action required:** Clawback rule UI should include a jurisdiction setting and display a warning when a "recovery after vesting" clawback is configured for Australian participants.

**United States — State Wage Payment Laws:**
- No federal law governs commission vesting. State laws vary dramatically.
- **California (strictest):** Labor Code §204 and §223 effectively mean commissions vest upon the performance of services that entitle the employee to the commission (typically, deal close). Once vested, the employer cannot reduce or withhold commissions without a written agreement in place at the time of the commission-earning event. California also requires a written commission plan agreement (Labor Code §2751). Clawbacks are generally unenforceable in California unless the plan clearly states the commission is conditional on a future event and the condition fails.
- **New York:** Commissions must be paid on a regular schedule. Wage Theft Prevention Act requires written notice of commission terms.
- **Illinois:** Wage Payment and Collection Act requires commissions to be paid within 13 days of the end of the pay period.
- **SmartCommission action:** Plans for US participants should have a "jurisdiction" setting. The system should warn if a clawback rule is configured for California participants in a way that may be legally unenforceable.

**United Kingdom:**
- The Employment Rights Act 1996 prohibits unlawful deduction from wages. Clawbacks are permissible if clearly documented in the employment contract or a signed commission agreement.
- Commission must be paid within the agreed payment period. Failure to pay is an unlawful deduction claim.

**General best practice for all jurisdictions:**
- Commission plans should be a signed written agreement (SmartCommission e-acknowledgment satisfies this).
- Any clawback terms must be clearly stated in the plan document before the commissions are earned.
- Retroactive plan changes that reduce commissions already earned are almost universally unenforceable.
- SmartCommission should never allow plan changes to retroactively reduce already-paid commissions — the platform enforces this by preventing edits to PAID EarningsRecords.

---

### Copyright & Intellectual Property

| Concern | Status | Notes |
|---|---|---|
| Third-party content licences | Not Assessed | Plan templates and any pre-built content must be original to SmartCommission or licensed. |
| Open-source licences | Partial — track on each dependency update | React, Next.js, Tailwind (MIT). Prisma (Apache 2.0). Firebase SDK (Apache 2.0). All safe. Review maintained per npm audit. |
| User-generated content ownership | Compliant | Customers own all their compensation plan data, transaction data, and earnings records. SmartCommission claims no rights over customer data. |
| Trademark usage | Open | Competitor names (Xactly, Performio etc.) used in marketing comparison content must comply with nominative fair use doctrine. |
| DMCA / copyright takedown process | Missing | Takedown process not yet established. Required before public launch. |

### Consumer Protection

| Jurisdiction | Law | Status | Notes |
|---|---|---|---|
| Australia | Australian Consumer Law (ACL) | Partial | ACL applies to B2B services where one party is a "consumer" (purchase price ≤AUD 100,000 or goods/services are of a kind ordinarily acquired for personal use). Subscription terms must not contain unfair contract terms. Cancellation and refund policy must be clear. |
| EU | Consumer Rights Directive | Not Applicable | B2B SaaS — Consumer Rights Directive does not apply to business purchasers. |
| US | FTC Act (unfair/deceptive practices) | Partial | Pricing must be transparent. Free trial terms must clearly disclose when billing begins. "No credit card required" if applicable must be true. |

### Financial / Payment Laws

| Concern | Status | Notes |
|---|---|---|
| PCI-DSS compliance | Compliant | SmartCommission does not store, process, or transmit payment card data. Platform billing is handled entirely by Stripe. SmartCommission is a SAQ A merchant (card data never touches our servers). |
| Subscription cancellation rights | Open | Cancellation process must be documented and easy. EU DSA compliance for EU customers. |
| Refund policy displayed | Open | Refund policy not yet published. Required before launch. |
| GST/VAT collection | Open | Stripe Tax handles GST (AU), VAT (EU/UK), and sales tax (US) collection. Must be configured before launch. |

---

## Geo-Blocking Policy

| Region | Reason for block | Blocked since | Review date |
|---|---|---|---|
| China | Cannot comply with PIPL data localisation requirements | 2026-06-18 (pre-launch) | 2027-06-18 |

---

## Privacy Requirements Checklist

### Data Collection & Consent
- [ ] Privacy policy published and linked from footer
- [ ] Cookie consent banner for EU/UK users
- [ ] Users can opt out of non-essential analytics data collection
- [ ] Data collected is minimal — commission calculations require financial and employment data; this is documented in the privacy policy
- [ ] Lawful basis documented for each data category (GDPR): employment contract (commission calculation), legitimate interest (fraud detection and anomaly detection), consent (gamification/leaderboards)

### Data Subject Rights
- [ ] Right to access: users can download all their personal data (earnings, disputes, acknowledgments) as JSON/CSV
- [ ] Right to erasure: account deletion removes personal data subject to retention requirements (earnings records retained 7 years per financial regulations)
- [ ] Right to portability: data export in machine-readable format (JSON/CSV)
- [ ] Right to rectification: users can correct their name, email, and contact details; financial data corrections go through the dispute workflow
- [ ] Response SLA: within 30 days of request

### Data Processing
- [ ] Data Processing Agreements (DPAs) signed with all sub-processors: GCP (Firebase, Cloud SQL, Cloud Run, Cloud Storage), Stripe, Resend, Open Exchange Rates
- [ ] Sub-processor list published in privacy policy or available on request
- [ ] Data retention policy: earnings records 7 years; audit logs 7 years; user accounts — PII deleted 90 days after account closure; raw import files 30 days
- [ ] PII masked in logs and admin views (see `security.md`)

### Security
- [ ] Data encrypted at rest (AES-256 via Cloud SQL encryption)
- [ ] Data encrypted in transit (TLS 1.3)
- [ ] Breach notification process: within 72 hours to relevant DPA (GDPR), as soon as practicable under Australian Privacy Act, without unreasonable delay under CCPA
- [ ] Security review completed (see `security.md`)

---

## Terms of Service & Legal Docs

| Document | Status | URL | Last updated |
|---|---|---|---|
| Terms of Service | Missing — required before launch | `/legal/terms` | — |
| Privacy Policy | Missing — required before launch | `/legal/privacy` | — |
| Cookie Policy | Missing — required before launch | `/legal/cookies` | — |
| Acceptable Use Policy | Missing — required before launch | `/legal/acceptable-use` | — |
| Refund Policy | Missing — required before launch | `/legal/refund` | — |
| Commission Plan Acknowledgment Legal Text | Missing — required before launch | Generated in-app | — |
| DPA (Data Processing Agreement for customers) | Missing — required for EU customers | Available on request | — |

---

## Review Schedule

Legal compliance must be reviewed quarterly. On each review:
1. Re-assess any `Not Assessed` jurisdictions where the user base is growing
2. Check for new laws or amendments: Australian Privacy Act reform, US state wage law changes, EU AI Act implications for ML features
3. Update checklist items and resolve any `Partial` statuses
4. Update "Last reviewed" and "Next review due" dates at the top of this document
5. Add an entry to `decisions.md` (ADR) for any significant compliance decisions
6. Add an entry to `changelog.md` under `## YYYY-MM-DD` → `### Security`

**Priority actions before public launch:**
1. Publish Terms of Service and Privacy Policy
2. Engage an employment law firm in AU and US to review clawback rule language
3. Sign DPAs with all sub-processors
4. Complete GDPR lawful basis documentation for all data categories
5. Implement cookie consent banner
6. Establish DMCA takedown process
