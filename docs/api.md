# SmartCommission — API Route Reference

Internal API route reference for all Next.js Route Handler endpoints. For the public REST API spec, see `api-integration.md`.

---

## Authentication

All routes (except `/api/auth/*`) require a valid session cookie or Bearer API key. Routes are protected by `getUserFromRequest(req)` which:
1. Reads the session cookie (web requests) or `Authorization: Bearer <key>` header (API key requests).
2. Validates the credential.
3. Returns the authenticated User record with `id`, `role`, `organisationId`.

---

## Auth Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signin` | None | Exchange Firebase ID token for session cookie |
| `POST` | `/api/auth/signout` | Session | Revoke session cookie and Firebase refresh tokens |
| `GET` | `/api/auth/session` | Session | Return current user session info |

---

## Organisation Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/orgs/current` | Session | Get current user's organisation | All |
| `PATCH` | `/api/orgs/current` | Session | Update organisation settings | ADMIN |
| `GET` | `/api/orgs/current/users` | Session | List org users | ADMIN, FINANCE, MANAGER |
| `POST` | `/api/orgs/current/users` | Session | Invite a new user | ADMIN |
| `PATCH` | `/api/orgs/current/users/:id` | Session | Update user (role, status) | ADMIN |
| `POST` | `/api/orgs/current/users/:id/deactivate` | Session | Deactivate a user | ADMIN |

---

## Plan Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/plans` | Session | List all plans in org | All |
| `POST` | `/api/plans` | Session | Create a new plan | ADMIN |
| `GET` | `/api/plans/:id` | Session | Get plan by ID | All |
| `PATCH` | `/api/plans/:id` | Session | Update a plan (creates new version) | ADMIN |
| `POST` | `/api/plans/:id/submit` | Session | Submit plan for approval | ADMIN |
| `POST` | `/api/plans/:id/approve` | Session | Approve a plan | ADMIN, FINANCE |
| `POST` | `/api/plans/:id/publish` | Session | Publish an approved plan | ADMIN |
| `POST` | `/api/plans/:id/acknowledge` | Session | Rep acknowledges a plan | REP |
| `GET` | `/api/plans/:id/rules` | Session | Get plan rules | All |
| `POST` | `/api/plans/:id/rules` | Session | Add a rule to a plan | ADMIN |
| `PATCH` | `/api/plans/:id/rules/:ruleId` | Session | Update a rule | ADMIN |
| `DELETE` | `/api/plans/:id/rules/:ruleId` | Session | Delete a rule | ADMIN |
| `GET` | `/api/plans/:id/participants` | Session | Get plan participants | ADMIN, FINANCE, MANAGER |
| `POST` | `/api/plans/:id/participants` | Session | Add participant to plan | ADMIN |
| `DELETE` | `/api/plans/:id/participants/:userId` | Session | Remove participant from plan | ADMIN |
| `GET` | `/api/plans/:id/versions` | Session | Get plan version history | All |

---

## Quota Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/quotas` | Session | List quotas (filter: userId, period, territoryId) | ADMIN, FINANCE, MANAGER, REP (own) |
| `POST` | `/api/quotas` | Session | Create a quota | ADMIN |
| `GET` | `/api/quotas/:id` | Session | Get quota by ID | ADMIN, FINANCE, MANAGER, REP (own) |
| `PATCH` | `/api/quotas/:id` | Session | Update quota (creates new version) | ADMIN |
| `POST` | `/api/quotas/bulk` | Session | Bulk create/update quotas (up to 500) | ADMIN |

---

## Territory Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/territories` | Session | List territories | All |
| `POST` | `/api/territories` | Session | Create territory | ADMIN |
| `GET` | `/api/territories/:id` | Session | Get territory | All |
| `PATCH` | `/api/territories/:id` | Session | Update territory | ADMIN |
| `DELETE` | `/api/territories/:id` | Session | Delete territory | ADMIN |
| `GET` | `/api/territories/:id/assignments` | Session | Get territory rep assignments | ADMIN, MANAGER |
| `POST` | `/api/territories/:id/assignments` | Session | Assign rep to territory | ADMIN |
| `DELETE` | `/api/territories/:id/assignments/:userId` | Session | Remove rep from territory | ADMIN |

---

## Transaction Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/transactions` | Session | List transactions (filter: period, userId, status) | ADMIN, FINANCE, MANAGER |
| `POST` | `/api/transactions` | Session | Create a transaction | ADMIN |
| `POST` | `/api/transactions/bulk` | Session | Bulk create transactions (up to 1,000) | ADMIN |
| `GET` | `/api/transactions/:id` | Session | Get transaction by ID | ADMIN, FINANCE |
| `PATCH` | `/api/transactions/:id` | Session | Update transaction | ADMIN |
| `POST` | `/api/transactions/:id/void` | Session | Void a transaction | ADMIN |
| `GET` | `/api/transactions/:id/credits` | Session | Get credit allocations | ADMIN, FINANCE, MANAGER |

---

## Calculation Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/calculations` | Session | List calculation runs | ADMIN, FINANCE |
| `POST` | `/api/calculations` | Session | Trigger a manual calculation run | ADMIN |
| `GET` | `/api/calculations/:id` | Session | Get calculation run status and stats | ADMIN, FINANCE |
| `POST` | `/api/calculations/:id/cancel` | Session | Cancel a running calculation | ADMIN |
| `POST` | `/api/calculations/preview` | Session | Run a non-persisted preview calculation | ADMIN, REP (own) |

---

## Earnings Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/earnings` | Session | List earnings records (filter: userId, period, status) | ADMIN, FINANCE, MANAGER (reports), REP (own) |
| `GET` | `/api/earnings/:id` | Session | Get earnings record | ADMIN, FINANCE, MANAGER (reports), REP (own) |
| `GET` | `/api/earnings/:id/audit-trail` | Session | Get step-by-step calculation audit trail | All (own); ADMIN, FINANCE (any) |
| `GET` | `/api/earnings/summary` | Session | Period summary (total, attainment, rep count) | ADMIN, FINANCE, MANAGER |

---

## Payment Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/payments/runs` | Session | List payment runs | ADMIN, FINANCE |
| `POST` | `/api/payments/runs` | Session | Create a payment run | ADMIN, FINANCE |
| `GET` | `/api/payments/runs/:id` | Session | Get payment run detail | ADMIN, FINANCE |
| `POST` | `/api/payments/runs/:id/approve` | Session | Approve a payment run | FINANCE |
| `GET` | `/api/payments/runs/:id/export` | Session | Export payment file | FINANCE |
| `POST` | `/api/payments/runs/:id/mark-paid` | Session | Mark run as paid | FINANCE |
| `GET` | `/api/payments` | Session | List individual payments | ADMIN, FINANCE, REP (own) |
| `POST` | `/api/payments/:id/hold` | Session | Place payment on hold | FINANCE |
| `POST` | `/api/payments/:id/release` | Session | Release payment hold | FINANCE |

---

## Dispute Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/disputes` | Session | List disputes (filter: status, userId, period) | ADMIN, FINANCE, MANAGER (reports), REP (own) |
| `POST` | `/api/disputes` | Session | Submit a dispute | REP |
| `GET` | `/api/disputes/:id` | Session | Get dispute detail | ADMIN, FINANCE, MANAGER (reports), REP (own) |
| `PATCH` | `/api/disputes/:id` | Session | Update dispute (add notes, advance status) | MANAGER, FINANCE |
| `POST` | `/api/disputes/:id/resolve` | Session | Resolve a dispute | FINANCE |

---

## Integration Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/integrations` | Session | List configured integrations | ADMIN |
| `POST` | `/api/integrations` | Session | Create integration | ADMIN |
| `GET` | `/api/integrations/:id` | Session | Get integration | ADMIN |
| `PATCH` | `/api/integrations/:id` | Session | Update integration config | ADMIN |
| `DELETE` | `/api/integrations/:id` | Session | Remove integration | ADMIN |
| `POST` | `/api/integrations/:id/sync` | Session | Trigger manual sync | ADMIN |
| `GET` | `/api/integrations/:id/jobs` | Session | Get import jobs | ADMIN |

---

## Import Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `POST` | `/api/import/transactions` | Session / API Key | Import transactions via CSV or JSON | ADMIN |
| `POST` | `/api/import/quotas` | Session / API Key | Import quotas via CSV or JSON | ADMIN |
| `POST` | `/api/import/users` | Session / API Key | Bulk import users | ADMIN |
| `GET` | `/api/import/:jobId` | Session / API Key | Poll import job status | ADMIN |

---

## Export Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/export/earnings` | Session / API Key | Export earnings (JSON, CSV, xlsx) | ADMIN, FINANCE, REP (own) |
| `GET` | `/api/export/payments` | Session / API Key | Export payment run data | ADMIN, FINANCE |
| `GET` | `/api/export/transactions` | Session / API Key | Export transactions | ADMIN, FINANCE |
| `GET` | `/api/export/audit-log` | Session / API Key (admin scope) | Export audit log | ADMIN, SUPER_ADMIN |

---

## API Key Management Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/keys` | Session | List API keys for org | ADMIN |
| `POST` | `/api/keys` | Session | Create API key | ADMIN |
| `DELETE` | `/api/keys/:id` | Session | Revoke API key | ADMIN |

---

## Webhook Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/webhooks` | Session | List webhook registrations | ADMIN |
| `POST` | `/api/webhooks` | Session | Register webhook endpoint | ADMIN |
| `DELETE` | `/api/webhooks/:id` | Session | Remove webhook | ADMIN |
| `POST` | `/api/webhooks/:id/test` | Session | Send test event | ADMIN |
| `GET` | `/api/webhooks/:id/deliveries` | Session | View delivery log | ADMIN |

---

## Report Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/reports` | Session | List available reports | All |
| `POST` | `/api/reports/run` | Session | Run a pre-built or custom report | All |
| `GET` | `/api/reports/saved` | Session | Get saved custom reports | All |
| `POST` | `/api/reports/saved` | Session | Save a custom report | ADMIN, FINANCE, MANAGER |
| `POST` | `/api/reports/schedule` | Session | Schedule a report for delivery | ADMIN, FINANCE |

---

## Superadmin Routes

| Method | Path | Auth | Description | Roles |
|---|---|---|---|---|
| `GET` | `/api/admin/orgs` | Session | List all organisations | SUPER_ADMIN |
| `GET` | `/api/admin/orgs/:id` | Session | Get organisation detail | SUPER_ADMIN |
| `PATCH` | `/api/admin/orgs/:id` | Session | Update organisation (plan tier, status) | SUPER_ADMIN |
| `GET` | `/api/admin/users` | Session | List all users across orgs | SUPER_ADMIN |
| `POST` | `/api/admin/users/:id/impersonate` | Session | Impersonate a user (with reason + audit log) | SUPER_ADMIN |
| `POST` | `/api/admin/users/:id/grant-superadmin` | Session | Grant SUPER_ADMIN role | SUPER_ADMIN |
| `POST` | `/api/admin/users/:id/revoke-superadmin` | Session | Revoke SUPER_ADMIN role (self-revoke blocked) | SUPER_ADMIN |
| `GET` | `/api/admin/audit-logs` | Session | View audit logs across all orgs | SUPER_ADMIN |
| `GET` | `/api/admin/security-logs` | Session | View security logs across all orgs | SUPER_ADMIN |

---

## Internal Routes (Not Public)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/internal/auth/revoke-sessions` | Internal token | Revoke all sessions for a user (called by worker) |
| `POST` | `/api/internal/calc/run` | Internal token | Worker endpoint for processing a calculation run |
| `POST` | `/api/internal/import/process` | Internal token | Worker endpoint for processing an import job |
| `POST` | `/api/internal/fx/refresh` | Internal token | Triggered by Cloud Scheduler to refresh FX rates |

---

## Public API (v1)

See `api-integration.md` for the full public API specification at `/api/v1/`.
The public API mirrors the internal routes but uses API key authentication and follows the `{ data, meta }` / `{ error, code }` response envelope.
