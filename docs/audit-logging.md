# SmartCommission — Audit & Security Logging

Last reviewed: 2026-06-20

---

## Overview

SmartCommission handles sensitive financial data — commission earnings, payment runs, and personal compensation information. Every mutating action and every security-relevant event must be logged. Logs are append-only, immutable, and retained for a minimum of 7 years (SOX compliance) / 3 years (GDPR minimum). CRITICAL security events are additionally streamed to GCP Cloud Logging for tamper-evident off-process storage.

---

## Two Log Types

| Type | Purpose | Table |
|---|---|---|
| **Audit log** | Every create / update / delete on business data — who changed what, when, before/after | `audit_logs` |
| **Security log** | Authentication events, permission changes, suspicious activity, data exports | `security_logs` |

---

## Implementation Status

| Component | Status | Location |
|---|---|---|
| `AuditLog` Prisma model | ✅ Implemented — canonical column names (`userId`, `userEmail`, `action`) | `apps/web/prisma/schema.prisma` |
| `SecurityLog` Prisma model | ✅ Implemented | `apps/web/prisma/schema.prisma` |
| `lib/audit.ts` — `logAudit()` | ✅ Implemented | `apps/web/lib/audit.ts` |
| `lib/security-log.ts` — `logSecurity()` | ✅ Implemented (with CRITICAL→GCP Cloud Logging) | `apps/web/lib/security-log.ts` |
| `lib/request-context.ts` | ✅ Implemented | `apps/web/lib/request-context.ts` |
| Admin log viewer (tenant) | ✅ Implemented — filterable, paginated, CSV export | `apps/web/app/(dashboard)/logs/page.tsx` |
| Superadmin log viewer (all tenants) | ✅ Implemented | `apps/web/app/(superadmin)/admin/logs/page.tsx` |
| Every POST/PATCH/DELETE calls logAudit | ✅ All implemented routes call logAudit | All `app/api/` route handlers |
| Auth events call logSecurity | ✅ Implemented for signup, login, invite, SUPERADMIN_GRANTED/REVOKED | Auth routes |

---

## Data Models

The canonical schema from `admin/docs/templates/audit-logging.md` — use this, not the draft schema in `data-model.md`:

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  // Actor
  userId      String?          // null for system/automated actions (e.g. scheduled calculation runs)
  userEmail   String?          // denormalised for readability without joins
  sessionId   String?
  ipAddress   String?
  userAgent   String?
  // Multi-tenancy
  tenantId    String?          // organisationId — null = platform-level action
  // Action
  action      String           // format: "ENTITY.VERB" e.g. "PLAN.PUBLISH", "PAYMENT.APPROVE"
  entityType  String           // e.g. "CompensationPlan", "PaymentRun", "EarningsRecord"
  entityId    String?
  // Change detail
  changes     Json?            // { "field": { "old": X, "new": Y } } — omit sensitive values
  metadata    Json?            // extra context (e.g. plan version, period, calculation run ID)
  // Outcome
  outcome     String  @default("SUCCESS")  // SUCCESS | FAILURE | ERROR
  // Correlation
  requestId   String?
  // Timestamp
  createdAt   DateTime @default(now())

  @@map("audit_logs")
  @@index([userId])
  @@index([tenantId])
  @@index([tenantId, createdAt])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])
}

model SecurityLog {
  id          String   @id @default(cuid())
  userId      String?
  userEmail   String?
  ipAddress   String?
  userAgent   String?
  tenantId    String?
  event       String           // see taxonomy below
  severity    String  @default("INFO")   // INFO | WARNING | CRITICAL
  details     Json?
  createdAt   DateTime @default(now())

  @@map("security_logs")
  @@index([userId])
  @@index([tenantId])
  @@index([event])
  @@index([severity])
  @@index([createdAt])
}
```

---

## SmartCommission Audit Action Taxonomy

Format: `ENTITY.VERB` — all uppercase.

| Entity | Verbs | Notes |
|---|---|---|
| `PLAN` | `CREATE` · `UPDATE` · `PUBLISH` · `ARCHIVE` · `APPROVE` · `DELETE` | Plan builder changes |
| `QUOTA` | `CREATE` · `UPDATE` · `APPROVE` · `DELETE` | Quota assignment changes |
| `TERRITORY` | `CREATE` · `UPDATE` · `DELETE` | Territory management |
| `TRANSACTION` | `CREATE` · `UPDATE` · `VOID` · `IMPORT` | Transaction data changes |
| `CALCULATION_RUN` | `START` · `COMPLETE` · `FAIL` · `CANCEL` | Calculation engine events |
| `EARNINGS_RECORD` | `CREATE` · `ADJUST` · `APPROVE` | Earnings mutations |
| `PAYMENT_RUN` | `CREATE` · `APPROVE` · `EXPORT` · `CONFIRM_PAID` · `CANCEL` | Payment workflow |
| `PAYMENT` | `HOLD` · `RELEASE` · `ADJUST` | Individual payment changes |
| `DISPUTE` | `CREATE` · `REVIEW` · `RESOLVE` · `CLOSE` | Dispute workflow |
| `PLAN_ACKNOWLEDGMENT` | `CREATE` | E-signature captured |
| `USER` | `CREATE` · `UPDATE` · `SUSPEND` · `TERMINATE` | User management |
| `INTEGRATION` | `CREATE` · `UPDATE` · `ENABLE` · `DISABLE` · `DELETE` | CRM/ERP connector changes |
| `IMPORT_JOB` | `START` · `COMPLETE` · `FAIL` | Data import events |
| `API_KEY` | `CREATE` · `REVOKE` | API key management |
| `RELEASE_NOTE` | `CREATE` · `UPDATE` · `PUBLISH` · `HIDE` · `SHOW` · `DELETE` | Release notes |
| `QUERY` | `RUN` | Query console execution |
| `AI` | `ACTION` | AI-assisted write actions |
| `EXPORT` | `CSV` · `JSON` · `PDF` | Data export events |

---

## Security Event Taxonomy

| Event | Severity | When to log |
|---|---|---|
| `LOGIN_SUCCESS` | INFO | User authenticates successfully |
| `LOGIN_FAILURE` | WARNING | Invalid credentials or token |
| `LOGOUT` | INFO | User explicitly signs out |
| `ACCOUNT_CREATED` | INFO | New user registered |
| `ACCOUNT_DELETED` | WARNING | Account deleted |
| `PASSWORD_RESET_REQUESTED` | INFO | Reset email sent |
| `PASSWORD_RESET_COMPLETED` | INFO | Password changed via reset link |
| `EMAIL_CHANGED` | WARNING | Account email address updated |
| `ROLE_GRANTED` | WARNING | User role elevated within org |
| `ROLE_REVOKED` | WARNING | User role removed |
| `SUPERADMIN_GRANTED` | CRITICAL | Platform superadmin access granted |
| `SUPERADMIN_REVOKED` | CRITICAL | Platform superadmin access revoked |
| `API_KEY_CREATED` | INFO | API key issued |
| `API_KEY_REVOKED` | WARNING | API key invalidated |
| `DATA_EXPORTED` | WARNING | User exported data (earnings, payment runs, audit logs) |
| `SSO_LOGIN_SUCCESS` | INFO | SSO assertion validated |
| `SSO_LOGIN_FAILURE` | WARNING | SSO assertion invalid or expired |
| `SSO_CONFIGURED` | WARNING | Admin saved SSO config |
| `SSO_ENABLED` | WARNING | SSO enabled for domain |
| `PROXY_STARTED` | CRITICAL | Platform superadmin began impersonating a user |
| `PROXY_STOPPED` | INFO | Impersonation session ended |
| `CONTEXT_SWITCH` | INFO | User switched active role/org context |
| `UNAUTHORIZED_ACCESS` | CRITICAL | Request to a route without permission |
| `SUSPICIOUS_ACTIVITY` | CRITICAL | Anomaly: 5+ failed logins in 5 min, impossible attainment submitted |
| `MFA_ENABLED` | INFO | MFA enabled for a user |
| `MFA_DISABLED` | WARNING | MFA disabled for a user |

---

## Utility Functions

### `lib/audit.ts`

```ts
import 'server-only'
import { db } from '@/lib/db'

interface AuditOptions {
  userId?: string
  userEmail?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  tenantId?: string   // organisationId
  entityType: string
  entityId?: string
  changes?: Record<string, { old: unknown; new: unknown }>
  metadata?: Record<string, unknown>
  outcome?: 'SUCCESS' | 'FAILURE' | 'ERROR'
  requestId?: string
}

export async function logAudit(action: string, opts: AuditOptions): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        action,
        userId: opts.userId,
        userEmail: opts.userEmail,
        sessionId: opts.sessionId,
        ipAddress: opts.ipAddress,
        userAgent: opts.userAgent,
        tenantId: opts.tenantId,
        entityType: opts.entityType,
        entityId: opts.entityId,
        changes: opts.changes ? (opts.changes as never) : undefined,
        metadata: opts.metadata ? (opts.metadata as never) : undefined,
        outcome: opts.outcome ?? 'SUCCESS',
        requestId: opts.requestId,
      },
    })
  } catch {
    // Never let audit logging failure break the main request
    console.error('[audit] Failed to write audit log:', action, opts.entityType, opts.entityId)
  }
}
```

### `lib/security-log.ts`

```ts
import 'server-only'
import { db } from '@/lib/db'

interface SecurityLogOptions {
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
  tenantId?: string
  severity?: 'INFO' | 'WARNING' | 'CRITICAL'
  details?: Record<string, unknown>
}

export async function logSecurity(event: string, opts: SecurityLogOptions = {}): Promise<void> {
  try {
    await db.securityLog.create({
      data: {
        event,
        userId: opts.userId,
        userEmail: opts.userEmail,
        ipAddress: opts.ipAddress,
        userAgent: opts.userAgent,
        tenantId: opts.tenantId,
        severity: opts.severity ?? 'INFO',
        details: opts.details ? (opts.details as never) : undefined,
      },
    })
    // Stream CRITICAL events to GCP Cloud Logging for tamper-evident storage
    if (opts.severity === 'CRITICAL') {
      console.error(JSON.stringify({
        severity: 'CRITICAL',
        message: `[security] ${event}`,
        userId: opts.userId,
        userEmail: opts.userEmail ? opts.userEmail.replace(/(.{3}).*@/, '$1***@') : undefined,
        ipAddress: opts.ipAddress,
        timestamp: new Date().toISOString(),
      }))
    }
  } catch {
    console.error('[security-log] Failed to write security log:', event)
  }
}
```

### `lib/request-context.ts`

```ts
import { NextRequest } from 'next/server'

export function getRequestContext(req: NextRequest) {
  return {
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
               ?? req.headers.get('x-real-ip')
               ?? 'unknown',
    userAgent: req.headers.get('user-agent') ?? undefined,
    requestId: req.headers.get('x-request-id') ?? crypto.randomUUID(),
  }
}
```

---

## Where to Log

### In every POST/PATCH/DELETE API route

```ts
// After a successful DB mutation in any route handler:
await logAudit('PLAN.PUBLISH', {
  userId: user.uid,
  userEmail: user.email,
  tenantId: org.organisationId,
  entityType: 'CompensationPlan',
  entityId: plan.id,
  changes: { status: { old: 'APPROVED', new: 'PUBLISHED' } },
  metadata: { planVersion: plan.version, planName: plan.name },
  ...getRequestContext(req),
})
```

### SmartCommission-specific logging notes

- **Calculation runs:** log `CALCULATION_RUN.START` and `CALCULATION_RUN.COMPLETE` with `transactionsProcessed`, `earningsCreated`
- **Payment runs:** log every stage transition (DRAFT→APPROVED→EXPORTED→PAID) with approver ID
- **Disputes:** log every state transition with notes
- **Data exports (earnings, payment CSVs):** call `logSecurity('DATA_EXPORTED', { severity: 'WARNING', details: { format, rowCount, period } })`
- **Never log** commission amounts, deal values, or salary figures in `changes` — these are PII/sensitive financial data. Log entity IDs and status changes only.

---

## Multi-Tenant Log Access

### Tenant admin (their org only)

Route: `app/(dashboard)/admin/logs/page.tsx` (ADMIN role required)

- API: `GET /api/[organisationId]/logs/audit` and `/api/[organisationId]/logs/security`
- **Always** take `organisationId` from URL path params — never from session
- Verify requesting user is ADMIN of that specific organisation

### Platform superadmin (all orgs)

Route: `app/(superadmin)/admin/logs/page.tsx`

- Can view all tenants' logs
- Org dropdown to filter by specific organisation
- Highlights CRITICAL severity events in red
- Suspicious Activity alerts: 5+ CRITICAL events from same IP in 1 hour

---

## PII Rules for SmartCommission

Commission-specific data to protect:
- **Never** log commission rates, earnings amounts, or quota values in `changes` — log entity IDs and status only
- **Never** log `netEarnings`, `grossEarnings`, `quotaAmount` values in audit log `changes`
- In `metadata`, use redacted references: `{ period: '2026-06', planId: 'xyz', userId: 'abc' }` not actual amounts
- `actorEmail` / `userEmail` in logs is acceptable (secured table, admin-only access)

---

## Retention Policy

| Log type | Minimum retention | Reason |
|---|---|---|
| Audit logs | 7 years | SOX compliance (commission payments are financial records) |
| Security logs | 3 years | GDPR / best practice |
| GCP Cloud Logging | 1 year | Operational |

On account / organisation deletion: anonymise logs (set `userId` → null, `userEmail` → `'[deleted]'`) — **never hard-delete** audit or security log history.

---

## Migration SQL

```sql
-- Run after creating the canonical AuditLog + SecurityLog models (replacing the draft schema)
-- See admin/docs/templates/audit-logging.md for full SQL
```

---

## Open Roadmap Items

| Code | Priority | Status | Title |
|---|---|---|---|
| **R-079** | Critical | Open | Implement lib/audit.ts and lib/security-log.ts |
| **R-078** | Critical | Open | Standardise SecurityLog Prisma model to canonical template |
| **R-081** | Critical | Open | Implement lib/request-context.ts |

---

## Review Checklist

- [ ] Every new POST/PATCH/DELETE route calls `logAudit`
- [ ] Auth events (login, logout, password change) call `logSecurity`
- [ ] Role/permission changes call `logSecurity` with CRITICAL severity
- [ ] No raw commission amounts, deal values, or salary data appear in log entries
- [ ] Superadmin log viewer shows both tables with filtering and CSV export
- [ ] Data export events are logged as `DATA_EXPORTED` (WARNING)
- [ ] Calculation run events logged with transaction and earnings counts
- [ ] Payment run stage transitions logged with approver ID
