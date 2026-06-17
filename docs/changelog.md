# SmartCommission — Changelog

All notable changes to SmartCommission are documented here.
Format: reverse-chronological `## YYYY-MM-DD` with Added / Changed / Fixed / Security / Removed subsections.

---

## 2026-06-18 (Session 2 — Expert Review)

### Added
- `docs/runbook.md` — operational runbook: local dev setup, deployment, database migrations, secrets management, nightly calc run monitoring, exchange rate refresh, common failure modes, backup/recovery, incident response.
- `docs/knowledge-graph.md` — Mermaid system architecture diagram, ER diagram, feature mindmap, deployment architecture diagram, and RBAC permission hierarchy diagram.
- `docs/env-vars.md` — complete list of all environment variables, Secret Manager mapping, local dev template.
- `docs/pii-masking.md` — PII data inventory, masking strategy implementations (maskEmail, maskName, maskIp, maskPhone, scrubPii), log scrubbing rules, admin view masking behaviour, export masking policy, GDPR right-to-erasure procedure.
- `docs/api.md` — full internal API route reference: all Next.js Route Handlers with method, path, auth, description, and role requirements.
- `docs/gcp-setup.md` — GCP infrastructure specification: Cloud Run, Cloud SQL, Cloud Storage, Cloud Tasks, Cloud Scheduler, Secret Manager, Firebase, Cloud Build, IAM roles, DNS, cost estimate.
- `docs/test-cases.csv` — 75 test cases covering authentication, RBAC, multi-tenancy, plan builder, calculation engine, payment run, dispute workflow, rep portal, security, PII masking, performance, accessibility, and legal compliance.
- `qa/prompts/01_signup_onboarding.md` — QA browser prompt for signup and onboarding flow.
- `qa/prompts/02_plan_builder.md` — QA browser prompt for plan builder and approval workflow.
- `qa/prompts/03_rep_portal.md` — QA browser prompt for rep portal.
- `qa/prompts/04_finance_payment_run.md` — QA browser prompt for finance payment run workflow.
- `qa/prompts/05_security_rbac.md` — QA browser prompt for security and RBAC verification.
- `docs/review/smartcommission_review_20260618000000.md` — full timestamped expert review.

### Changed
- `docs/features.md` — added 12 new known issues (I-003 through I-005, B-001, S-001 through S-004, U-001, A-001, P-001, D-002); added Phase 0 pre-implementation roadmap items (R-076 through R-085).
- `docs/data-model.md` — added `SecurityLog` model (required by CLAUDE.md audit-logging standard) to schema diagram and table definitions.
- `docs/decisions.md` — added ADR-006 (separate AuditLog and SecurityLog models) and ADR-007 (Firebase Auth with server-side session cookies).
- `docs/security.md` — added SR-013 (SecurityLog not implemented), SR-014 (superuser pattern not implemented), SR-015 (no Prisma organisationId middleware yet).

---

## 2026-06-18

### Added
- Initial project documentation — comprehensive feature spec, data model, architecture decisions, user journeys, security model, legal compliance, marketing strategy, and onboarding flow.
- `docs/features.md` — full feature specification across 13 areas (Plan Design, Data Integration, Calculation Engine, Payments, Participant Portal, Manager Views, Reporting, Compliance, Workflows, Multi-Org, API, AI, Security). Includes Phase 1–4 roadmap (R-001 through R-075).
- `docs/data-model.md` — complete Prisma/PostgreSQL data model with 18 entities, full field definitions, Mermaid ER diagram, enums, indexes, and relationship descriptions.
- `docs/decisions.md` — five architecture decision records (ADR-001 through ADR-005): multi-tenant strategy, calculation engine approach, real-time vs batch calculations, CRM integration strategy, multi-currency handling.
- `docs/user-journeys.md` — six user journeys: plan admin publishes a plan, rep views earnings, rep submits a dispute, Finance runs the monthly payment, manager reviews team attainment, and the nightly automated calculation run.
- `docs/security.md` — security model covering Firebase Auth, session handling, RBAC (6 roles), data isolation (3-layer defence), input validation, secrets management, PII classification, and 12 known security risks (SR-001 through SR-012).
- `docs/legal-compliance.md` — ICM-specific compliance covering compensation data sensitivity, SOX requirements, tax implications, e-signature contract law, and wage payment laws by jurisdiction (AU Fair Work Act, US state laws including California, UK Employment Rights Act).
- `docs/marketing-seo.md` — full go-to-market strategy: value proposition, competitive positioning vs 8 competitors, SEO keyword targets, content strategy, pricing tiers, growth channels, and KPI targets.
- `docs/onboarding.md` — admin and rep onboarding flows: 6-step wizard, email sequences, first value moment definition (≤ 30 min to first calculation), help doc coverage requirements.
- `docs/api-integration.md` — public REST API specification: auth, versioning, rate limits, endpoints for all 8 resource groups, webhook events, export/import formats, OpenAPI spec reference.
