# SmartCommission — Changelog

All notable changes to SmartCommission are documented here.
Format: reverse-chronological `## YYYY-MM-DD` with Added / Changed / Fixed / Security / Removed subsections.

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
