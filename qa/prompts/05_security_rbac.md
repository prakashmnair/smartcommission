# QA Prompt — Security and RBAC Verification

**Scope:** Role-based access control, cross-tenant isolation, OWASP Top 10 checks
**Actor:** Multiple users with different roles
**Environment:** Staging / local dev

---

## Prerequisites

- Users configured for each role: SUPER_ADMIN, ADMIN, FINANCE, MANAGER, REP, READ_ONLY
- Two separate organisations (Org A and Org B)
- Representative data in both orgs

---

## Test Flow

### 1. REP Role Restrictions

1. Sign in as REP (Org A).
2. Attempt: GET `/api/earnings?userId=<other_rep_id>` → expect 403.
3. Attempt: GET `/api/admin/orgs` → expect 403.
4. Attempt: POST `/api/plans` → expect 403.
5. Attempt: POST `/api/payments/runs/:id/approve` → expect 403.
6. Verify: REP can access `/api/earnings?userId=<own_id>` → 200 OK.
7. Verify: REP can POST `/api/disputes` → 201 Created.

### 2. MANAGER Role Restrictions

1. Sign in as MANAGER (Org A).
2. Attempt: GET `/api/earnings?userId=<non-report_rep_id>` → expect 403.
3. Attempt: PATCH `/api/plans/:id` → expect 403.
4. Attempt: POST `/api/payments/runs/:id/approve` → expect 403.
5. Verify: MANAGER can GET `/api/earnings?userId=<direct_report_id>` → 200 OK.

### 3. FINANCE Role Restrictions

1. Sign in as FINANCE.
2. Attempt: PATCH `/api/plans/:id` (edit a plan) → expect 403.
3. Verify: FINANCE can POST `/api/payments/runs/:id/approve` → 200 OK.
4. Verify: FINANCE can GET `/api/earnings` for all reps → 200 OK.

### 4. Cross-Tenant Isolation (Critical)

1. Sign in as ADMIN of Org A.
2. List Org A's plan IDs (GET `/api/plans`).
3. List Org B's plan IDs (by any means — e.g. sequential ID guessing).
4. Attempt: GET `/api/plans/<orgB_plan_id>` → expect 404 or 403.
5. Attempt: GET `/api/earnings?organisationId=<orgB_id>` → expect 403 or only Org A data.
6. Attempt: GET `/api/transactions/<orgB_transaction_id>` → expect 404 or 403.
7. Verify: No Org B data is ever returned to an Org A session.

### 5. SUPER_ADMIN Self-Revoke Protection

1. Sign in as SUPER_ADMIN with email `prakashmnair@gmail.com`.
2. Attempt: POST `/api/admin/users/<own_user_id>/revoke-superadmin`.
3. Verify: 400 Bad Request returned with message "Cannot revoke your own superadmin access."

### 6. XSS Prevention

1. Sign in as ADMIN.
2. Create a plan with name: `<script>alert('XSS')</script>`.
3. Navigate to the plans list.
4. Verify: no alert fires; name is rendered as plain text (HTML-encoded).
5. Create a dispute with description containing `"><img src=x onerror=alert(1)>`.
6. Verify: stored and rendered as plain text; no XSS execution.

### 7. SQL Injection Prevention

1. Attempt API call: GET `/api/plans?status='; DROP TABLE plans; --`.
2. Verify: returns 400 or empty results; no database error; plans table intact.

### 8. Session Cookie Security

1. Sign in.
2. Inspect cookies in browser devtools.
3. Verify: session cookie has `HttpOnly`, `Secure`, `SameSite=Strict`.
4. Verify: session cookie is not accessible via `document.cookie` in browser console.

### 9. Rate Limiting on Dispute Endpoint

1. Submit 10 disputes as the same REP in rapid succession.
2. Attempt to submit an 11th dispute.
3. Verify: 429 Too Many Requests returned.

---

## Pass Criteria

- [ ] All role restrictions enforced server-side (not just UI)
- [ ] Cross-tenant isolation: 100% — no Org B data accessible to Org A
- [ ] SUPER_ADMIN self-revoke blocked
- [ ] XSS: all inputs sanitised; no script execution
- [ ] SQL injection: Prisma parameterisation protects all queries
- [ ] Session cookie flags verified
- [ ] Rate limiting on dispute endpoint enforced
- [ ] AuditLog entries for all SUPER_ADMIN actions
