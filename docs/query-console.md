# SmartCommission — Query Console & Published Reports

Last reviewed: 2026-06-22

---

## Overview

SmartCommission provides an in-app query console so Finance and RevOps admins can run ad-hoc SQL queries against their organisation's commission data, export results, and publish reports for the broader team — without needing direct database access.

Three capabilities:

1. **Query Console** — Write and run read-only SQL against the org's data. Results exportable as CSV or JSON. Admin/Finance role only.
2. **Saved Queries** — Save a query with a name, description, and tags for reuse. Admin/Finance only.
3. **Published Reports** — Promote a saved query to a report that any org member can run and export (read-only, no SQL editing). Useful for sharing standard commission reports across the sales team.

---

## Implementation Status

| Component | Status | Location |
|---|---|---|
| `SavedQuery` Prisma model | ✅ Implemented 2026-06-20 | `apps/web/prisma/schema.prisma` |
| `QueryRun` Prisma model | ✅ Implemented 2026-06-20 | `apps/web/prisma/schema.prisma` |
| `lib/query-safe.ts` — `validateSql()` + `executeQuery()` | ✅ Implemented 2026-06-20 | `apps/web/lib/query-safe.ts` |
| `POST /api/query-console/run` | ✅ Implemented 2026-06-20 | `apps/web/app/api/query-console/run/route.ts` |
| `GET/POST /api/query-console/queries` | ✅ Implemented 2026-06-20 | `apps/web/app/api/query-console/queries/route.ts` |
| `GET /api/query-console/runs` | ✅ Implemented 2026-06-20 | `apps/web/app/api/query-console/runs/route.ts` |
| `GET /api/reports` | ✅ Implemented 2026-06-20 | `apps/web/app/api/reports/route.ts` |
| Query console UI (Monaco editor) | ✅ Implemented 2026-06-20 | `apps/web/app/(dashboard)/query-console/page.tsx` |
| Reports gallery UI | ✅ Implemented 2026-06-20 | `apps/web/app/(dashboard)/reports/page.tsx` |

---

## Data Models

```prisma
model SavedQuery {
  id             String   @id @default(cuid())
  organisationId String
  organisation   Organisation @relation(fields: [organisationId], references: [id])
  name           String
  description    String?
  sql            String   // raw SQL — validated read-only before execution
  parameters     Json?    // [{name, type: "TEXT"|"NUMBER"|"DATE", label, defaultValue?}]
  tags           String[]
  isPublished    Boolean  @default(false)
  publishedAt    DateTime?
  publishedById  String?
  visibility     String   @default("ADMIN")  // ADMIN | ORG_MEMBERS | SHARED_LINK
  shareToken     String?  @unique
  reportName     String?
  reportDesc     String?
  createdById    String
  updatedById    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  lastRunAt      DateTime?
  runCount       Int      @default(0)

  runs QueryRun[]

  @@map("saved_queries")
  @@index([organisationId])
  @@index([organisationId, isPublished])
  @@index([shareToken])
}

model QueryRun {
  id             String      @id @default(cuid())
  organisationId String
  savedQueryId   String?
  savedQuery     SavedQuery? @relation(fields: [savedQueryId], references: [id], onDelete: SetNull)
  sql            String      // actual SQL executed
  parameters     Json?
  status         String      @default("PENDING")  // PENDING | RUNNING | COMPLETED | FAILED | CANCELLED
  rowCount       Int?
  columnNames    String[]
  executionMs    Int?
  errorMessage   String?
  exportFormat   String?     // CSV | JSON
  exportedAt     DateTime?
  createdById    String
  createdAt      DateTime    @default(now())
  completedAt    DateTime?

  @@map("query_runs")
  @@index([organisationId])
  @@index([savedQueryId])
  @@index([createdById])
  @@index([createdAt])
}
```

---

## Dependencies

```bash
npm install @monaco-editor/react papaparse
```

- `@monaco-editor/react` — SQL editor with syntax highlighting. Always load with `next/dynamic({ ssr: false })` — never SSR.
- `papaparse` — CSV generation client-side or server-side.

---

## SmartCommission ALLOWED_TABLES

The `ALLOWED_TABLES` whitelist defines which tables the query console can access. Never include audit/security/credential tables.

```ts
// lib/query-safe.ts
export const ALLOWED_TABLES = [
  // Core commission data
  'compensation_plans',
  'plan_rules',
  'plan_participants',
  'quotas',
  'territories',
  'territory_assignments',
  'transactions',
  'credit_allocations',
  'calculation_runs',
  'earnings_records',
  'payment_runs',
  'payments',
  'disputes',
  'draw_balances',
  'plan_acknowledgments',
  'exchange_rates',
  // Organisation and users (for JOINs)
  'organisations',
  'users',
]

// NEVER include:
// audit_logs, security_logs, api_keys, sso_configs, saved_queries, query_runs
```

---

## SQL Safety Layer (`lib/query-safe.ts`)

Every query must pass through `validateSql()` before execution:

- Must start with `SELECT`
- No blocked keywords (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`, `ALTER`, `TRUNCATE`, `EXEC`, `GRANT`, `REVOKE`, etc.)
- No semicolons mid-statement (prevents statement stacking)
- Tables in `FROM`/`JOIN` clauses must be in `ALLOWED_TABLES`
- 30-second execution timeout
- Maximum 1,000 rows returned (hard cap)

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/query-console/run` | ADMIN or FINANCE | Run an ad-hoc query |
| `GET` | `/api/query-console/queries` | ADMIN or FINANCE | List saved queries |
| `POST` | `/api/query-console/queries` | ADMIN or FINANCE | Save a new query |
| `GET` | `/api/query-console/queries/[id]` | ADMIN or FINANCE | Get a saved query |
| `PATCH` | `/api/query-console/queries/[id]` | ADMIN or FINANCE | Update query |
| `DELETE` | `/api/query-console/queries/[id]` | ADMIN or FINANCE | Delete query |
| `POST` | `/api/query-console/queries/[id]/publish` | ADMIN | Publish as a report |
| `POST` | `/api/query-console/queries/[id]/unpublish` | ADMIN | Unpublish a report |
| `POST` | `/api/query-console/queries/[id]/run` | ADMIN or FINANCE | Run a saved query |
| `GET` | `/api/query-console/runs/[runId]/export` | ADMIN or FINANCE | Export results (CSV/JSON) |
| `GET` | `/api/reports` | Any authenticated org member | List published reports |
| `POST` | `/api/reports/[id]/run` | Any authenticated org member | Run a published report |
| `GET` | `/api/reports/[id]/runs/[runId]/export` | Any authenticated org member | Export report results |
| `GET` | `/api/reports/shared/[shareToken]` | No auth required | Shared link — report metadata |
| `POST` | `/api/reports/shared/[shareToken]/run` | No auth required (rate-limited) | Shared link — run report |

---

## Rate Limiting

| Role | Limit |
|---|---|
| ADMIN / FINANCE (query console) | 10 queries/minute per user |
| Any org member (published reports) | 5 runs/minute per user |
| Shared link | 10 runs/hour per IP |

---

## Pre-Built Commission Queries

Seed these as saved queries for every new organisation to get them started immediately:

| Query Name | Tags | Description |
|---|---|---|
| Earnings by Rep — Current Period | earnings, reps | Net earnings per rep for the current month |
| Quota Attainment Summary | attainment, quotas | Each rep's attainment % this quarter |
| Payment Run Summary | payments | All payments in the last payment run |
| Commission Accrual by Period | finance, accrual | Unpaid commission balances by period |
| Clawback Recovery Report | clawbacks | Clawback amounts owed by rep |
| Draw Balance Report | draws | Outstanding draw balances by rep |
| Plan Cost Analysis | plans | Commission cost as % of revenue by plan |
| Dispute Resolution Report | disputes | All open and resolved disputes by status |

---

## UI

### Query Console (`app/(dashboard)/query-console/page.tsx`)

- **Access:** ADMIN and FINANCE roles only
- **Editor:** Monaco SQL editor — loaded with `next/dynamic({ ssr: false })`
- **Keyboard shortcut:** `Cmd+Enter` / `Ctrl+Enter` to run query
- **Results:** Virtual-scrolling table, sticky header
- **Run indicator:** Row count badge — shows "(limit reached)" at 1,000 rows
- **Empty state:** "No results returned"
- **Error state:** Red banner with error message from `validateSql()` or DB
- **Export:** CSV and JSON download buttons below results

### Reports Gallery (`app/(dashboard)/reports/page.tsx`)

- **Access:** All authenticated org members
- **UI:** Grid of report cards — name, description, tags, "Run" button, last run timestamp
- **No SQL editor shown** — members only see run and export UI

---

## Export & Logging

Every export (CSV or JSON) generates a `DATA_EXPORTED` security event:

```ts
await logSecurity('DATA_EXPORTED', {
  userId: org.userId,
  userEmail: org.userEmail,
  tenantId: org.organisationId,
  severity: 'WARNING',
  details: { runId: params.runId, format, rowCount: result.rowCount },
})
```

---

## Security Rules

- SELECT-only queries enforced in `validateSql()` before any execution
- `ALLOWED_TABLES` whitelist — credential and audit tables excluded
- Tenant isolation: `organisationId` filter enforced for all queries
- Row cap: 1,000 rows per run (prevents bulk data extraction)
- 30s timeout (prevents resource exhaustion from slow queries)
- No raw SQL stored in audit logs — log `QueryRun.id` only

---

## Open Roadmap Items

| Code | Priority | Status | Title |
|---|---|---|---|
| R-086 | Medium | Open | Implement query console (Phase 3 alongside full API) |

---

## Checklist

- [ ] `SavedQuery` and `QueryRun` models added to schema, migration SQL created
- [ ] `lib/query-safe.ts` implemented with SmartCommission `ALLOWED_TABLES`
- [ ] `validateSql()` blocks all non-SELECT patterns and table whitelist enforced
- [ ] `POST /api/query-console/run` enforces ADMIN/FINANCE role + rate limit + validation
- [ ] Save/Publish/Unpublish API routes implemented with audit logging
- [ ] Export endpoint generates `DATA_EXPORTED` security event
- [ ] Monaco editor loaded with `next/dynamic({ ssr: false })`
- [ ] Query console UI: editor + results + save + publish flows
- [ ] Reports gallery UI visible to all org members
- [ ] Pre-built commission query seeds for new organisations
