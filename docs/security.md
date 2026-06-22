# SmartCommission — Security Model

---

## Authentication

### Mechanism

SmartCommission uses **Firebase Authentication** as the identity provider. Users authenticate with:
- Email and password (with Firebase email verification)
- Google OAuth 2.0 (for organisations using Google Workspace)
- SAML 2.0 / OIDC (for enterprise SSO with Okta, Azure AD, etc. — Phase 3)

On successful Firebase Auth, the client receives a Firebase ID token (JWT). The Next.js server validates this token on every API request and exchanges it for a session cookie (HttpOnly, Secure, SameSite=Strict, 7-day expiry). Session cookies are used for all subsequent requests — not the Firebase ID token directly.

### Session / Token Handling

- **ID token validation:** Server-side, using the Firebase Admin SDK (`auth.verifyIdToken()`). Token is verified on every API request that requires authentication. Token expiry is 1 hour (Firebase default); the client refreshes automatically via Firebase SDK.
- **Session cookie:** Issued by the server via `auth.createSessionCookie()`. Stored as an HttpOnly, Secure, SameSite=Strict cookie. 7-day expiry. Revoked on explicit logout, password change, or account suspension.
- **Token storage:** ID token is stored only in memory on the client (never in localStorage or sessionStorage). Session cookie is HttpOnly and inaccessible to JavaScript.
- **Logout:** Calls `auth.revokeRefreshTokens()` to revoke all active sessions for the user, then clears the session cookie.

### Relevant Files

- `src/lib/auth/firebase-admin.ts` — Firebase Admin SDK initialisation
- `src/lib/auth/session.ts` — Session cookie creation, validation, and revocation
- `src/middleware.ts` — Next.js middleware: validates session cookie on all protected routes
- `src/lib/auth/get-user.ts` — `getUserFromRequest()` helper used in every API route

---

## Authorisation

### Role Hierarchy

Roles are stored on the `User` record and enforced server-side on every API route. The hierarchy from least to most privileged:

| Role | Capabilities |
|---|---|
| `REP` | View own earnings, commission statements, plan documents, quotas. Submit disputes. Use what-if calculator. Cannot view any other rep's data. |
| `READ_ONLY` | View all earnings, reports, and plan documents within their org. No write access. Used for executives and auditors. |
| `MANAGER` | All REP capabilities. View all direct reports' earnings and attainment. Cannot approve payment runs, edit plans, or view other managers' teams. |
| `FINANCE` | View all earnings, all reps. Create and approve payment runs. Manage manual adjustments. Resolve disputes. Cannot edit compensation plans. |
| `ADMIN` | Full access within their organisation. Create, edit, and publish plans. Manage quotas, territories, integrations, API keys, users. Cannot access other organisations. |
| `SUPER_ADMIN` | SmartCommission platform operator. Cross-org visibility. Can impersonate any user (with audit log). Access to the superadmin console at `/admin`. Not available to customer accounts. |

### Route-Level Enforcement

Every API route handler calls `getUserFromRequest(req)` first. This function:
1. Reads the session cookie
2. Validates it against Firebase Admin SDK
3. Fetches the `User` record from the database, including `role` and `organisationId`
4. Returns the authenticated user context

Routes then call role-check helpers:
- `requireRole(user, ['ADMIN', 'FINANCE'])` — throws 403 if not in the allowed roles
- `requireOrganisation(user, organisationId)` — throws 403 if the user's org doesn't match the resource's org
- `requireSelf(user, targetUserId)` — throws 403 if REP is trying to access another user's data

No route may rely on UI-level restrictions alone — server-side enforcement is mandatory on every route.

---

## Data Isolation

### Row-Level Tenancy with Defence-in-Depth

Every table that contains org-specific data has an `organisationId` column. Isolation is enforced in three layers:

1. **Application layer (primary):** Every Prisma query includes a `where: { organisationId: user.organisationId }` clause, enforced by a Prisma middleware that validates the clause is present on all queries to tenanted tables.
2. **PostgreSQL Row Level Security (RLS) (secondary):** RLS policies are enabled on the highest-risk tables (`transactions`, `earnings_records`, `payments`, `audit_logs`). Before each query, the application sets `SET app.current_org_id = :orgId`. RLS policies enforce `organisationId = current_setting('app.current_org_id')`.
3. **Automated cross-tenant isolation tests (tertiary):** A suite of integration tests attempts to access Org B's data using a valid session for Org A. All such attempts must return 403 or empty results. These tests run on every CI/CD deployment.

### REP Data Scoping

Beyond org-level isolation, REP-role users can only read their own data:
- Earnings records: filtered to `userId = user.id`
- Transactions: filtered through CreditAllocations to `userId = user.id`
- Disputes: filtered to `raisedById = user.id`

MANAGER-role users can read data for their direct reports only (resolved recursively for multi-level hierarchies via `managerId` traversal, limited to 5 levels).

---

## Input Validation

| Field | Rule | Enforced In |
|---|---|---|
| `email` | Valid email format, max 320 chars | POST /api/v1/users, Firebase Auth |
| `organisationId` (all routes) | Must match authenticated user's org | Prisma middleware + route guards |
| `amount` (Transaction) | Must be a positive decimal, max 15 digits | POST /api/v1/transactions |
| `currency` | Must be a valid ISO 4217 code (3 uppercase chars from allowlist) | Transaction create/update |
| `effectiveFrom`, `effectiveTo` | Valid ISO 8601 dates; effectiveTo > effectiveFrom | Plan, Quota, Territory create/update |
| `creditPercent` (CreditAllocation) | 0–200 (allows full-credit splits up to 2×; >200 rejected) | Credit allocation create |
| `role` (User) | Must be one of the valid enum values; SUPER_ADMIN cannot be assigned via the UI | POST /api/v1/users |
| `planId` (EarningsRecord) | Must belong to the same org | Calculation engine |
| `description` (Dispute) | Min 20 chars, max 2,000 chars | POST /api/v1/disputes |
| `file` (CSV import) | Max 50 MB, must be text/csv or application/vnd.ms-excel | POST /api/v1/import |
| All string inputs | Sanitised with `DOMPurify` equivalent server-side; HTML tags stripped | All API routes |
| `config` (PlanRule) | Validated against per-rule-type JSON schema on save | Plan rule create/update |

---

## Secrets & Credentials

| Secret | Storage | Rotation |
|---|---|---|
| Firebase service account JSON | GCP Secret Manager (`smartcommission-firebase-admin`) | Annually or on team member departure |
| PostgreSQL connection string | GCP Secret Manager (`smartcommission-db-url`) | Quarterly |
| Stripe API key (platform billing) | GCP Secret Manager (`smartcommission-stripe-secret`) | Annually |
| Open Exchange Rates API key | GCP Secret Manager (`smartcommission-oxr-key`) | Annually |
| CRM OAuth client secrets (per integration) | GCP Secret Manager, one secret per integration per org | Per CRM provider requirements |
| HMAC webhook signing secrets | GCP Secret Manager, one per org | On request or every 12 months |
| Next.js session cookie secret | GCP Secret Manager (`smartcommission-session-secret`) | Quarterly |

No secrets are stored in environment variables in source code, `.env` files committed to git, or in the database. All secrets are fetched from Secret Manager at runtime.

---

## PII & Sensitive Data

### PII Fields

| Entity | Field | Classification | Notes |
|---|---|---|---|
| User | `email` | PII | Masked in logs as `ab***@***.com` |
| User | `name` | PII | Masked in exports when shared externally |
| EarningsRecord | `grossEarnings`, `netEarnings` | Sensitive financial data | Visible to REP (own only), MANAGER (direct reports), FINANCE (all), ADMIN (all) |
| Transaction | `amount`, `amountBase` | Sensitive financial data | Not visible to REP directly; visible through CreditAllocation earnings |
| Quota | `amount` | Sensitive financial data | Visible to REP (own), MANAGER, FINANCE, ADMIN |
| Payment | `netAmount` | Sensitive financial data | Visible to REP (own), FINANCE, ADMIN |
| PlanParticipant | `oteBase`, `oteCommission` | Sensitive financial data | Not shown to other REPs; visible to MANAGER, FINANCE, ADMIN |

### Data in Logs

- All logs scrubbed of PII before writing (email addresses, amounts over $1 replaced with `[REDACTED]`).
- Calculation audit trails stored in structured JSON on EarningsRecords, not in application logs.
- AuditLog `oldValue`/`newValue` fields encrypted at rest; only accessible to ADMIN/FINANCE/SUPER_ADMIN.

---

## Known Risks

Severity: **Critical** · **High** · **Medium** · **Low**
Status: **Open** · **Mitigated** · **Accepted** · **✅ Fixed [date]**

| Code | Severity | Status | Description | Mitigation |
|---|---|---|---|---|
| **SR-001** | Critical | Open | Missing `organisationId` filter in a query allows cross-tenant data leak | Implement Prisma middleware to validate organisationId on all writes/reads; add RLS as backstop; automated cross-tenant isolation test suite |
| **SR-002** | Critical | Open | Plan rule JSON config not validated — malformed config could crash the calculation engine | Implement per-rule-type JSON schema validation on save; calculation engine to handle invalid configs gracefully with exception flagging |
| **SR-003** | High | Open | Calculation audit trail stored in JSON on the EarningsRecord — could be modified after the fact | Audit trail should be append-only; consider a separate immutable `calculation_audit_steps` table; hash the audit trail JSON and store the hash in the AuditLog |
| **SR-004** | High | Open | CRM OAuth tokens stored as plaintext in the `integrations.config` JSON column | Encrypt the `config` column contents at the application layer using a KMS-managed key before writing to database |
| **SR-005** | High | Open | Firebase ID token not revoked server-side on user deactivation — a deactivated user with a valid session cookie can still access the API for up to 7 days | On user status change to INACTIVE/TERMINATED, call `auth.revokeRefreshTokens()` and purge the session cookie from the revocation list |
| **SR-006** | High | Open | CSV import does not sanitise formula injection (cells starting with =, +, -, @) — exported CSVs could execute formulas in Excel | Prepend a single-quote to any cell value starting with `=`, `+`, `-`, or `@` before writing to CSV exports |
| **SR-007** | Medium | Open | Dispute evidence files stored in Cloud Storage with public URLs — another user who guesses the URL can access the file | Use signed Cloud Storage URLs with 1-hour expiry; never serve file directly via a permanent public URL |
| **SR-008** | Medium | Open | No rate limiting on the dispute submission endpoint — a rep could flood the system with disputes | Add rate limiting: maximum 10 disputes per rep per day; 429 on breach |
| **SR-009** | Medium | Open | SUPER_ADMIN impersonation is not tied to a named impersonation purpose — hard to audit why impersonation occurred | Require SUPER_ADMIN to enter an impersonation reason before gaining access; store reason in AuditLog |
| **SR-010** | Medium | Open | No IP allowlisting for FINANCE role API access | Build IP allowlisting feature (Phase 3) and recommend FINANCE roles configure it |
| **SR-011** | Low | Open | Session cookie SameSite=Strict prevents OAuth redirect flows from working in some browsers | Document the known browser behaviour; test SAML SSO flows specifically; may need SameSite=Lax for SSO return URLs |
| **SR-012** | Low | Open | Plan rule `config` JSON stored unencrypted — commission rates are sensitive business information | Consider encrypting the `config` column using a per-org encryption key; lower priority than token encryption (SR-004) |
| **SR-013** | Critical | ✅ Fixed 2026-06-20 | SecurityLog model not yet implemented | `SecurityLog` Prisma model and `lib/security-log.ts` implemented. Auth events logged. |
| **SR-014** | Critical | ✅ Fixed 2026-06-20 | Superuser pattern not yet implemented | `isSuperAdmin()`, self-revoke protection, and superadmin console fully implemented. |
| **SR-015** | High | Open | No application-layer Prisma organisationId middleware yet | The Prisma middleware that validates `organisationId` is present on all tenanted table queries (primary defence against cross-tenant leaks) is planned but not yet implemented as a Prisma extension. Routes currently do this inline. |
| **SR-016** | High | In Progress | OWASP Top 10 verification needed on implemented routes | Auth guards, IDOR protection, and input validation are implemented on existing routes. Full OWASP audit should run as part of pre-launch security review. |
| **SR-017** | Medium | Open | Context cookie (`__context`) not yet designed for SSO redirect edge cases | `SameSite=Strict` on the context cookie may break SAML ACS return flows. Design must account for SSO redirect flows (similar concern to SR-011 on session cookie). |
| **SR-018** | High | Open | API key hashing uses SHA-256 without salt — rainbow-table vulnerable | `apps/web/app/api/settings/api-keys/route.ts` uses `crypto.subtle.digest('SHA-256')` for key hashing. Comments note this is a demo placeholder. Must upgrade to bcrypt (cost 12) or argon2 before production. |
| **SR-019** | Critical | Open | No production environment — zero ability to verify security controls in prod | GCP project `smartcommission-prod` exists and Cloud SQL instance is running (logs confirmed 2026-06-23). Cloud Run not yet deployed. Firebase Auth not yet activated. All security controls remain code-only. Cross-tenant isolation tests not yet implemented. Must verify every control before first user data is stored. Last checked: 2026-06-23. |
| **SR-020** | High | Open | Wrong AI SDK could leak API key in client bundle | SmartCommission must use `@google/genai` v2.x server-side only. `GEMINI_API_KEY` must never appear in any `NEXT_PUBLIC_` var or client component. Flag during Phase 4 AI implementation. |
| **SR-021** | Medium | Open | `POST /api/transactions` skips FX conversion — `amountBase` equals `amount` regardless of currency | Code comment explicitly notes "simplified: assume base currency = deal currency for now". In a multi-currency ICM platform this is a data integrity risk — financial reports and payouts denominated in base currency will be wrong for non-base-currency deals until the FX lookup is wired in. See B-002 and R-105. |

---

## Audit Trail

Every create, update, delete, approval, calculation, and export action is written to the `audit_logs` table with:
- Actor: `userId`, `actorEmail` (denormalised to survive user deletion)
- Action: typed `actionType` (CREATE, UPDATE, DELETE, APPROVE, EXPORT, LOGIN, LOGOUT, CALCULATE, IMPERSONATE)
- Entity: `entityType` + `entityId`
- Before/after state: `oldValue` / `newValue` JSON diffs
- Request context: `ipAddress`, `userAgent`, `sessionId`, `requestId`
- Timestamp: `createdAt` (immutable — never updated)

The `audit_logs` table is:
- **Append-only** — no UPDATE or DELETE operations permitted via the application; enforced by a PostgreSQL trigger that prevents updates and deletes.
- **Retained for 7 years** — to meet financial records retention requirements (SOX, Australian tax law, UK Companies Act).
- **Exportable** — ADMIN and SUPER_ADMIN can export audit logs for a date range as JSON or CSV for external audit.
- **Encrypted at rest** — Cloud SQL encryption at rest (AES-256); `oldValue`/`newValue` fields additionally encrypted at the application layer.

Log retention is enforced by a Cloud Scheduler job that runs monthly and deletes records older than the configured retention period (default 7 years). Deletion itself is logged in a separate retention audit log.
