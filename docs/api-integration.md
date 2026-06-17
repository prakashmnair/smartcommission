# SmartCommission — API Integration

Last reviewed: 2026-06-18

---

## Overview

A public REST API giving third-party systems, customer integrations, and automation tooling full access to SmartCommission's data and operations. Covers all product functions accessible via the UI. Follows REST conventions with JSON as the primary format; CSV and XML available for data exports.

The API is the foundation for:
- CRM/ERP integrations that push transactions into SmartCommission
- HRIS integrations that sync employee data
- Payroll system integrations that receive payment data
- Customer-built internal tooling (e.g. BI dashboards, internal commission trackers)
- Third-party iPaaS connectors (Zapier, Make, Workato)

---

## Authentication

### API Keys (primary)

```
Authorization: Bearer <api_key>
```

- Keys are created per-organisation from Settings → API Keys
- Each key has a user owner, an optional description, optional expiry date, and a scope set
- Keys can be scoped to specific permission sets: `read`, `write`, `admin`, `webhooks`
- Keys are displayed once at creation — not retrievable after
- Keys are prefixed for environment identification: `sc_live_` (production) or `sc_test_` (sandbox)
- Key is stored as a SHA-256 hash in the database; the prefix is stored for identification

### OAuth 2.0 (for third-party apps)

| Flow | Use case |
|---|---|
| Authorization Code + PKCE | Web and mobile apps acting on behalf of users (e.g. a Salesforce managed package) |
| Client Credentials | Server-to-server (e.g. a nightly ETL job pulling earnings data) |

OAuth 2.0 endpoints:
- `GET /api/v1/oauth/authorize` — redirect user to authorise
- `POST /api/v1/oauth/token` — exchange code for access token
- `POST /api/v1/oauth/revoke` — revoke a token

---

## Versioning

- Current version: `v1`
- Base URL: `https://app.smartcommission.app/api/v1/`
- Versioning via URL path (not headers)
- Minimum 12-month deprecation notice before removing a version
- Breaking changes trigger a new version; additive changes (new fields, new endpoints) are non-breaking and deployed to the current version

---

## Rate Limiting

| Tier | Limit | Window |
|---|---|---|
| Free | 100 requests | Per minute |
| Starter | 500 requests | Per minute |
| Growth | 1,000 requests | Per minute |
| Enterprise | Custom | — |

Headers returned on every response:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1750250400
```

HTTP 429 returned when limit exceeded. `Retry-After` header included.

---

## Request / Response Standards

### Request
- `Content-Type: application/json`
- All timestamps: ISO 8601 UTC (`2026-06-18T12:00:00Z`)
- Pagination: `?page=1&limit=50` (max 100 per page)
- Filtering: `?[field]=[value]` where documented per endpoint
- Sorting: `?sort=[field]&order=asc|desc`
- Decimal amounts: string format to preserve precision (e.g. `"amount": "125000.00"`)

### Response

Success (single object):
```json
{
  "data": { ... },
  "meta": {}
}
```

Success (list):
```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 243,
    "hasMore": true
  }
}
```

Error:
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "field": "validation detail"
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | No content (DELETE) |
| 400 | Bad request / validation error |
| 401 | Unauthenticated — missing or invalid API key |
| 403 | Forbidden — authenticated but not authorised for this resource |
| 404 | Not found |
| 409 | Conflict — duplicate external ID or state conflict |
| 422 | Unprocessable entity — valid JSON but business rule violation |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## API Key Management Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/keys` | API Key (admin scope) | List all API keys for the organisation |
| `POST` | `/api/v1/keys` | API Key (admin scope) | Create a new API key |
| `DELETE` | `/api/v1/keys/:id` | API Key (admin scope) | Revoke a key |

---

## Data Export Endpoints

| Method | Path | Formats | Auth | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/export/earnings` | `json`, `csv`, `xlsx` | API Key (read) | Export earnings records for a period |
| `GET` | `/api/v1/export/payments` | `json`, `csv` | API Key (read) | Export payment run data |
| `GET` | `/api/v1/export/transactions` | `json`, `csv` | API Key (read) | Export transaction records |
| `GET` | `/api/v1/export/audit-log` | `json`, `csv` | API Key (admin) | Export audit log for a date range |

Format specified via `Accept` header or `?format=json|csv|xlsx` query param.

### CSV export
```
Content-Type: text/csv
Content-Disposition: attachment; filename="earnings-2026-06-18.csv"
```
First row is header. All fields quoted. UTF-8 with BOM for Excel compatibility. Amounts as decimal strings (e.g. `"125000.00"`). Formulas stripped (cells starting with `=`, `+`, `-`, `@` are prefixed with a single quote).

### XML export
```xml
<?xml version="1.0" encoding="UTF-8"?>
<export>
  <meta>
    <generatedAt>2026-06-18T12:00:00Z</generatedAt>
    <resource>earnings</resource>
    <total>47</total>
  </meta>
  <items>
    <item>
      <id>clxyz123</id>
      <userId>clxyz456</userId>
      <period>2026-06</period>
      <netEarnings>6240.00</netEarnings>
      <currency>AUD</currency>
    </item>
  </items>
</export>
```

---

## Data Import Endpoints

| Method | Path | Formats | Auth | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/import/transactions` | `json`, `csv` | API Key (write) | Import transaction records |
| `POST` | `/api/v1/import/quotas` | `json`, `csv` | API Key (write) | Import quota assignments |
| `POST` | `/api/v1/import/users` | `json`, `csv` | API Key (admin) | Bulk import/update users |
| `GET` | `/api/v1/import/:jobId` | — | API Key (read) | Poll import job status |

Import is asynchronous for files > 100 rows. Returns a job ID; poll the status endpoint. For ≤ 100 rows, import is synchronous and returns results immediately.

### Import rules
- Maximum file size: 50 MB
- CSV: first row must be a header matching documented field names
- Invalid rows are skipped; returned in the response as an `errors` array with row number, field, and error message
- Duplicate detection: configurable via `?onDuplicate=skip|update|error`
- Historical imports: include `?historical=true` to bypass calculation run triggers for past periods

---

## Webhooks

### Events

| Event | Payload | When fired |
|---|---|---|
| `transaction.created` | Full Transaction object | A transaction is created via API or import |
| `transaction.updated` | Full Transaction object + `changedFields` | A transaction is updated |
| `transaction.voided` | `{ id, voidedAt, voidReason }` | A transaction is voided |
| `calculation.started` | `{ runId, organisationId, period, type }` | A calculation run begins |
| `calculation.completed` | Full CalculationRun object + summary stats | A calculation run finishes successfully |
| `calculation.failed` | `{ runId, organisationId, period, error }` | A calculation run fails |
| `payment.approved` | Full PaymentRun object | A Finance user approves a payment run |
| `payment.processed` | `{ paymentRunId, organisationId, period, totalAmount }` | A payment run is marked as PAID |
| `dispute.raised` | Full Dispute object | A rep submits a dispute |
| `dispute.resolved` | Full Dispute object with resolution | A dispute is resolved |
| `plan.published` | Full CompensationPlan object | A plan is published |
| `user.invited` | `{ userId, email, role, organisationId }` | A new user is invited |
| `user.deactivated` | `{ userId, email, organisationId, deactivatedAt }` | A user is deactivated |

### Webhook delivery

- `POST` to the registered URL with `Content-Type: application/json`
- Signed with `X-Webhook-Signature: sha256=<hmac>` using the org's shared webhook secret
- `X-Webhook-Event: transaction.created`
- `X-Webhook-Delivery: <uuid>` (unique per delivery attempt; use for deduplication)
- Retry: 3 attempts with exponential backoff (5 seconds, 30 seconds, 5 minutes)
- Events stored for 72 hours; can be replayed from the dashboard (Settings → Webhooks → Delivery log)
- Webhook endpoint must return HTTP 200–299 within 10 seconds; otherwise considered failed

### Webhook registration

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/webhooks` | API Key (admin) | List webhook registrations |
| `POST` | `/api/v1/webhooks` | API Key (admin) | Register a new webhook endpoint |
| `DELETE` | `/api/v1/webhooks/:id` | API Key (admin) | Remove a webhook |
| `POST` | `/api/v1/webhooks/:id/test` | API Key (admin) | Send a test event |
| `GET` | `/api/v1/webhooks/:id/deliveries` | API Key (admin) | View delivery log |

---

## API Endpoint Reference

### Plans

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/plans` | API Key (read) | List all compensation plans |
| `POST` | `/api/v1/plans` | API Key (write) | Create a new plan |
| `GET` | `/api/v1/plans/:id` | API Key (read) | Get plan by ID |
| `PATCH` | `/api/v1/plans/:id` | API Key (write) | Update a plan (creates new version) |
| `POST` | `/api/v1/plans/:id/publish` | API Key (admin) | Publish a plan |
| `GET` | `/api/v1/plans/:id/rules` | API Key (read) | Get rules for a plan |
| `POST` | `/api/v1/plans/:id/rules` | API Key (write) | Add a rule to a plan |
| `PATCH` | `/api/v1/plans/:id/rules/:ruleId` | API Key (write) | Update a rule |
| `DELETE` | `/api/v1/plans/:id/rules/:ruleId` | API Key (write) | Delete a rule |
| `GET` | `/api/v1/plans/:id/participants` | API Key (read) | Get participants assigned to a plan |
| `POST` | `/api/v1/plans/:id/participants` | API Key (write) | Assign a participant to a plan |
| `DELETE` | `/api/v1/plans/:id/participants/:userId` | API Key (write) | Remove a participant |
| `GET` | `/api/v1/plans/:id/versions` | API Key (read) | Get version history |

### Quotas

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/quotas` | API Key (read) | List quotas (filter by `?userId=` `?period=` `?territoryId=`) |
| `POST` | `/api/v1/quotas` | API Key (write) | Create a quota |
| `GET` | `/api/v1/quotas/:id` | API Key (read) | Get quota by ID |
| `PATCH` | `/api/v1/quotas/:id` | API Key (write) | Update a quota (creates new version) |
| `DELETE` | `/api/v1/quotas/:id` | API Key (write) | Delete / supersede a quota |
| `POST` | `/api/v1/quotas/bulk` | API Key (write) | Bulk create or update quotas (up to 500 per request) |

### Transactions

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/transactions` | API Key (read) | List transactions (filter by `?period=` `?userId=` `?status=`) |
| `POST` | `/api/v1/transactions` | API Key (write) | Create a single transaction |
| `POST` | `/api/v1/transactions/bulk` | API Key (write) | Bulk create transactions (up to 1,000 per request) |
| `GET` | `/api/v1/transactions/:id` | API Key (read) | Get transaction by ID |
| `PATCH` | `/api/v1/transactions/:id` | API Key (write) | Update a transaction |
| `POST` | `/api/v1/transactions/:id/void` | API Key (write) | Void a transaction |
| `GET` | `/api/v1/transactions/:id/credits` | API Key (read) | Get credit allocations for a transaction |

**Transaction create payload example:**
```json
{
  "externalId": "SF-OPP-001234",
  "sourceSystem": "SALESFORCE",
  "type": "CLOSED_WON",
  "amount": "125000.00",
  "currency": "AUD",
  "closeDate": "2026-06-15T00:00:00Z",
  "dealName": "Acme Corp — Enterprise Licence",
  "accountId": "ACME001",
  "accountName": "Acme Corp",
  "productId": "ENT-ANNUAL",
  "contractLength": 12,
  "isRecurring": true,
  "credits": [
    { "userId": "clxyz456", "creditPercent": 70, "creditType": "PRIMARY" },
    { "userId": "clxyz789", "creditPercent": 30, "creditType": "OVERLAY" }
  ]
}
```

### Earnings

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/earnings` | API Key (read) | List earnings records (filter by `?userId=` `?period=` `?status=`) |
| `GET` | `/api/v1/earnings/:id` | API Key (read) | Get earnings record by ID |
| `GET` | `/api/v1/earnings/:id/audit-trail` | API Key (read) | Get step-by-step calculation audit trail |
| `GET` | `/api/v1/earnings/summary` | API Key (read) | Period summary: total earnings, attainment, rep count |

### Calculation Runs

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/calculations` | API Key (read) | List calculation runs |
| `POST` | `/api/v1/calculations` | API Key (admin) | Trigger a manual calculation run |
| `GET` | `/api/v1/calculations/:id` | API Key (read) | Get calculation run status and stats |
| `POST` | `/api/v1/calculations/:id/cancel` | API Key (admin) | Cancel a running calculation |

**Calculation run create payload:**
```json
{
  "period": "2026-06",
  "type": "DELTA",
  "planIds": ["clxyz111", "clxyz222"]
}
```

### Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/payments/runs` | API Key (read) | List payment runs |
| `POST` | `/api/v1/payments/runs` | API Key (admin) | Create a payment run for a period |
| `GET` | `/api/v1/payments/runs/:id` | API Key (read) | Get payment run detail |
| `POST` | `/api/v1/payments/runs/:id/approve` | API Key (write — FINANCE role required) | Approve a payment run |
| `GET` | `/api/v1/payments/runs/:id/export` | API Key (read) | Export payment file (format via `?format=xero\|adp\|csv`) |
| `POST` | `/api/v1/payments/runs/:id/mark-paid` | API Key (write — FINANCE role required) | Mark a payment run as paid |
| `GET` | `/api/v1/payments` | API Key (read) | List individual payments (filter by `?userId=` `?runId=`) |
| `POST` | `/api/v1/payments/:id/hold` | API Key (write — FINANCE role required) | Place a hold on an individual payment |
| `POST` | `/api/v1/payments/:id/release` | API Key (write — FINANCE role required) | Release a payment hold |

### Disputes

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/disputes` | API Key (read) | List disputes (filter by `?status=` `?userId=` `?period=`) |
| `POST` | `/api/v1/disputes` | API Key (write) | Submit a dispute (REP submitting their own) |
| `GET` | `/api/v1/disputes/:id` | API Key (read) | Get dispute by ID |
| `PATCH` | `/api/v1/disputes/:id` | API Key (write) | Update a dispute (add notes, advance status) |
| `POST` | `/api/v1/disputes/:id/resolve` | API Key (write — FINANCE role required) | Resolve a dispute |

### Users

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/users` | API Key (read) | List users in the organisation |
| `POST` | `/api/v1/users` | API Key (admin) | Invite a new user |
| `GET` | `/api/v1/users/:id` | API Key (read) | Get user by ID |
| `PATCH` | `/api/v1/users/:id` | API Key (admin) | Update a user |
| `POST` | `/api/v1/users/:id/deactivate` | API Key (admin) | Deactivate a user |
| `GET` | `/api/v1/users/:id/earnings` | API Key (read) | Get earnings history for a user |

### Territories

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/territories` | API Key (read) | List territories |
| `POST` | `/api/v1/territories` | API Key (admin) | Create a territory |
| `GET` | `/api/v1/territories/:id` | API Key (read) | Get territory by ID |
| `PATCH` | `/api/v1/territories/:id` | API Key (admin) | Update a territory |
| `DELETE` | `/api/v1/territories/:id` | API Key (admin) | Delete a territory |
| `GET` | `/api/v1/territories/:id/assignments` | API Key (read) | Get rep assignments for a territory |
| `POST` | `/api/v1/territories/:id/assignments` | API Key (admin) | Assign a rep to a territory |

### Integrations

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/integrations` | API Key (admin) | List configured integrations |
| `POST` | `/api/v1/integrations` | API Key (admin) | Create a new integration |
| `GET` | `/api/v1/integrations/:id` | API Key (admin) | Get integration by ID |
| `PATCH` | `/api/v1/integrations/:id` | API Key (admin) | Update integration config |
| `DELETE` | `/api/v1/integrations/:id` | API Key (admin) | Remove an integration |
| `POST` | `/api/v1/integrations/:id/sync` | API Key (admin) | Trigger a manual sync |
| `GET` | `/api/v1/integrations/:id/jobs` | API Key (admin) | Get import jobs for an integration |

---

## OpenAPI Specification

An OpenAPI 3.0 spec is maintained at `/api/v1/openapi.json` and the human-readable YAML at `docs/openapi.yaml`.

Interactive Swagger UI available at `/api/docs` (available in all environments including sandbox).

The spec is used to:
- Auto-generate interactive docs
- Generate client SDKs (TypeScript, Python, Ruby)
- Validate request/response shapes in integration tests

---

## SDK / Client Libraries

| Language | Status | Repository |
|---|---|---|
| JavaScript / TypeScript | Planned — Phase 3 | `smartcommission-sdk-js` |
| Python | Planned — Phase 3 | `smartcommission-sdk-python` |
| Ruby | Planned — Phase 4 | `smartcommission-sdk-ruby` |

---

## Security

- API keys never logged or returned in full after creation; only the `keyPrefix` is stored for display
- Keys invalidated immediately on revocation; on user deactivation, all keys for that user are auto-revoked
- All API requests validated for correct `organisationId` before reading or writing data
- Export endpoints respect the caller's role permissions: a REP API key can only export their own data; an ADMIN key exports all org data
- Webhook payloads signed with HMAC-SHA256; consumers must verify signature before processing
- Sandbox API keys (`sc_test_`) can only access sandbox data; cannot affect production
- See `security.md` for full PII handling rules in exports

---

## Sandbox / Test Environment

Every organisation has a sandbox environment:
- Base URL: `https://sandbox.smartcommission.app/api/v1/`
- Sandbox API keys prefixed: `sc_test_`
- Sandbox data is fully isolated from production
- Sandbox can be reset to empty or seeded with sample data via `POST /api/v1/sandbox/reset`
- All webhook events fire in sandbox; configure a separate webhook endpoint for test events

---

## Review Checklist

On each review:
- [ ] All new features have corresponding API endpoints documented here
- [ ] New endpoints added to the OpenAPI spec
- [ ] Rate limit headers present on all responses
- [ ] Export formats tested for correctness (CSV formula injection prevention, UTF-8 BOM, proper quoting)
- [ ] Import edge cases covered (empty file, duplicate, invalid format, >50MB, historical import)
- [ ] Webhook events added for new resource lifecycle events
- [ ] Sandbox environment verified to be isolated from production
