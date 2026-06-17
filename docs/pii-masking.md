# SmartCommission — PII Masking

Guidelines and implementation spec for personally identifiable information (PII) handling across SmartCommission.

---

## PII Data Inventory

| Entity | Field | Classification | Masking Rule |
|---|---|---|---|
| User | `email` | PII | `ab***@***.com` (first 2 chars visible, domain TLD visible) |
| User | `name` | PII | `J*** S***` (first char of each word, rest masked) |
| User | `managerId` (resolved name) | PII | Same as `name` |
| User | `hireDate` | Sensitive | Year only in external exports |
| User | `terminationDate` | Sensitive | Year only in external exports |
| PlanAcknowledgment | `ipAddress` | PII | `192.168.***.***` (last two octets masked) |
| PlanAcknowledgment | `userAgent` | PII | Omit in exports |
| AuditLog | `ipAddress` | PII | `192.168.***.***` |
| AuditLog | `actorEmail` | PII | Masked same as User email |
| EarningsRecord | `grossEarnings`, `netEarnings` | Sensitive financial | Visible to REP (own), MANAGER (reports), FINANCE, ADMIN. Never in logs. |
| Payment | `netAmount` | Sensitive financial | Visible to REP (own), FINANCE, ADMIN. Never in logs. |
| Quota | `amount` | Sensitive financial | Visible to REP (own), MANAGER, FINANCE, ADMIN. Never in logs. |
| PlanParticipant | `oteBase`, `oteCommission` | Sensitive financial | Not shown to other REPs. MANAGER, FINANCE, ADMIN only. |
| Transaction | `amount`, `amountBase` | Sensitive financial | Not visible to REP directly; accessed only through CreditAllocation earnings view. |
| DrawBalance | `balance` | Sensitive financial | Visible to REP (own), FINANCE, ADMIN only. |

---

## Masking Strategies

### `maskEmail(email: string): string`

```typescript
// ab***@***.com
// rules: show first 2 chars of local part; mask rest with ***; show domain TLD
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  const maskedLocal = local.slice(0, 2) + '***'
  const domainParts = domain.split('.')
  const maskedDomain = '***.' + domainParts.slice(-1)[0]
  return `${maskedLocal}@${maskedDomain}`
}
```

### `maskName(name: string): string`

```typescript
// "John Smith" → "J*** S***"
export function maskName(name: string): string {
  return name.split(' ').map(word => word[0] + '***').join(' ')
}
```

### `maskIp(ip: string): string`

```typescript
// "192.168.1.100" → "192.168.***.***"
export function maskIp(ip: string): string {
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`
  }
  return '***.***.***,***'
}
```

### `maskPhone(phone: string): string`

```typescript
// "+61412345678" → "+614*****678"
export function maskPhone(phone: string): string {
  if (phone.length < 6) return '***'
  return phone.slice(0, 4) + '*'.repeat(phone.length - 7) + phone.slice(-3)
}
```

### `scrubPii(obj: Record<string, unknown>): Record<string, unknown>`

```typescript
// Deep-scrub an object before writing to logs
const PII_FIELDS = ['email', 'name', 'ipAddress', 'userAgent', 'phone']
export function scrubPii(obj: Record<string, unknown>): Record<string, unknown> {
  const scrubbed = { ...obj }
  for (const key of PII_FIELDS) {
    if (key in scrubbed) scrubbed[key] = '[REDACTED]'
  }
  return scrubbed
}
```

---

## Utility File Location

`apps/web/lib/pii.ts` — must export: `maskEmail`, `maskName`, `maskPhone`, `maskIp`, `scrubPii`

---

## Log Scrubbing Rules

1. **Never log `email`, `name`, `ipAddress`, `userAgent`, `phone`** — use `scrubPii()` on any object before logging.
2. **Never log `amount`, `grossEarnings`, `netEarnings`, `netAmount`** — sensitive financial data. Log entity IDs and actions only.
3. **Never log API keys, session tokens, or Firebase tokens** — even partially.
4. **Calculation audit trails** are stored in structured JSON on `EarningsRecord.auditTrail`, not in application logs.
5. **AuditLog `oldValue` / `newValue`** fields may contain PII — these are encrypted at the application layer and are only accessible to ADMIN/FINANCE/SUPER_ADMIN roles.

---

## Admin / Superadmin Views

- **By default, admin views mask PII** (email → `ab***@***.com`, name → `J*** S***`).
- An explicit **"Reveal PII" toggle** (eye icon) is available in admin user tables. Toggling it requires ADMIN or SUPER_ADMIN role and logs a `USER.PII_REVEALED` audit event with actor and timestamp.
- **Financial figures** (earnings, payments, quotas) are **never masked** for users with appropriate roles — masking financial data defeats the purpose of Finance dashboards.

---

## Data Export Masking

| Exporter | Masking behaviour |
|---|---|
| REP downloading their own statement | No masking — it is their own data |
| ADMIN exporting org user list | Email and name masked by default; CSV includes a note "PII masked; contact support to request unmasked export for compliance purposes" |
| ADMIN exporting audit log | Actor email masked; IP masked |
| SUPER_ADMIN exporting cross-org reports | All PII masked; internal tool access required for unmasked |
| API export (REP API key) | Only own data; no masking needed |
| API export (ADMIN API key) | PII masked by default; `?maskPii=false` with explicit consent required for unmasked export |

---

## Non-Production Environments

- All non-production environments (staging, sandbox, local dev) must use **synthetic or anonymised data only**.
- Real customer data must never be copied to a non-production environment.
- Sandbox data is factory-generated on reset; it contains no real user PII.
- If a production data restore is needed for debugging, PII must be anonymised using `scrubPii()` before loading into a non-prod environment.

---

## GDPR / Privacy Act: Right to Erasure

On account deletion:
1. User's `email` and `name` set to `[deleted]`.
2. `firebaseUid` set to null.
3. `AuditLog.actorEmail` set to `[deleted]`; `actorId` set to null — logs are retained (7 years) but de-identified.
4. `EarningsRecord`, `Payment`, `Dispute` records retained with `userId` preserved for financial integrity — these are not personal data per se (they are financial records) but are de-identified by the user email/name deletion.
5. `PlanAcknowledgment` record retained (legal requirement — evidence of signed agreement) but `ipAddress` and `userAgent` nulled.

---

## Masking Gaps (Known Issues)

| Code | Gap | Status |
|---|---|---|
| **B-001** | `lib/pii.ts` not yet implemented — no code exists yet | Open |
| **B-002** | Admin views not yet built — PII reveal toggle not yet implemented | Open |
| **B-003** | Log scrubbing not yet applied — no application code to scrub | Open |
