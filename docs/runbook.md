# SmartCommission — Runbook

Operational procedures for deploying, maintaining, and troubleshooting SmartCommission in production.

---

## Local Development Setup

### Prerequisites

- Node.js v22+ (via nvm: `nvm use 22`)
- PostgreSQL 15+ (local or Cloud SQL proxy)
- Firebase project (see `gcp-setup.md`)
- `.env.local` populated from Secret Manager (see `env-vars.md`)

### Steps

```bash
cd apps/web
npm install
npx prisma migrate dev
npm run dev
```

App runs at `http://localhost:3000`.

---

## Deployment

### Production deploy (Cloud Build → Cloud Run)

1. Merge PR to `main`.
2. Cloud Build trigger fires automatically.
3. Build runs: `npm run build` → Docker image pushed to Artifact Registry.
4. Cloud Run service updated with new image (zero-downtime rolling deploy).
5. Verify: check Cloud Run revision health in GCP console.

### Manual deploy (emergency)

```bash
PATH="/opt/homebrew/bin:/Users/prakashmnair/google-cloud-sdk/bin:$PATH"
gcloud run deploy smartcommission-web \
  --image gcr.io/smartcommission/web:latest \
  --region australia-southeast1 \
  --project smartcommission-prod
```

### Rollback

```bash
gcloud run services update-traffic smartcommission-web \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region australia-southeast1
```

Find the previous revision name in GCP Console → Cloud Run → Revisions.

---

## Database Migrations

### Run a migration

```bash
npx prisma migrate deploy
```

This runs all pending migrations. Run **before** deploying new code that depends on the schema change.

### Migration order (safe)

1. Deploy the migration to Cloud SQL first.
2. Wait for migration to complete.
3. Deploy the application code.
4. Never do it in reverse (code before schema).

### Rollback a migration

Prisma does not support automatic rollback. For rollback:
1. Revert the application code deploy (Cloud Run traffic rollback).
2. Manually run the down-migration SQL (written by hand in `/migrations/rollback/`).
3. Document the rollback in `changelog.md`.

---

## Secrets Management

All secrets stored in GCP Secret Manager. Never in `.env` files committed to git.

### Access a secret (local dev)

```bash
gcloud secrets versions access latest --secret="smartcommission-db-url"
```

### Rotate a secret

1. Create a new version in Secret Manager.
2. Update the Cloud Run service environment variable to point to the new secret version (or use `latest`).
3. Trigger a new Cloud Run revision.
4. Verify the app is healthy.
5. Disable the old secret version.

---

## Nightly Calculation Run

**Schedule:** 02:00 AEST daily via Cloud Scheduler.
**Job name:** `smartcommission-nightly-calc`

### Monitor a run

1. Check Cloud Logging: filter by `resource.type="cloud_run_revision"` and `jsonPayload.action="CALCULATION_RUN"`.
2. Check Cloud Tasks queue: `smartcommission-calc-queue` for pending/failed tasks.

### If a nightly run fails

1. Check Cloud Logging for error details.
2. If the failure is transient (Cloud SQL timeout, network blip): re-trigger manually from the admin UI at `/calculations` → "New Run" → DELTA.
3. If the failure is a code bug: roll back the last deployment and fix forward.
4. Notify affected org ADMINs and FINANCE users via the in-app notification system.

### If runs are failing for 3+ consecutive nights for any org

- Cloud Monitoring alert fires → on-call engineer receives PagerDuty alert.
- SmartCommission SUPER_ADMIN is also notified automatically.
- Investigate: check for org-specific data issues (e.g., broken plan rule config, missing exchange rate).

---

## Exchange Rate Updates

**Schedule:** Daily via Cloud Scheduler at 00:30 UTC.
**Source:** Open Exchange Rates API.

### If exchange rates are not updated

1. Check Cloud Logging for the rate-fetch job.
2. Check if Open Exchange Rates API key is valid (test: `curl https://openexchangerates.org/api/latest.json?app_id=<key>`).
3. If API is down: manually enter rates for affected currencies via Admin UI → Settings → Exchange Rates → Manual Entry.
4. Any transactions awaiting a rate are flagged in the exception queue — Finance can review and unblock.

---

## Database Operations

### Connection pooling

Uses PgBouncer (managed via Cloud SQL). If connection pool is exhausted:
1. Check `pg_stat_activity` for idle connections held open.
2. Increase pool size in Cloud SQL settings if sustained.
3. Check for connection leaks in application code (Prisma connection lifecycle).

### Slow queries

1. Enable `pg_stat_statements` in Cloud SQL.
2. Query `SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 20`.
3. For chronic slow queries: add indexes (see `data-model.md` → Indexes section), then run `ANALYZE`.

### Disk space

Cloud SQL autoscale handles storage growth. If approaching limits:
1. Check retention job is running (deletes records older than 7 years).
2. Archive large `audit_logs` exports to Cloud Storage if needed.

---

## Firebase Auth

### If users cannot log in

1. Check Firebase Console → Authentication → Users for account status.
2. Check if the Firebase project is rate-limited (Firebase Authentication has per-project limits).
3. If "BLOCKING_FUNCTION_ERROR": check Cloud Functions logs for the Firebase Auth blocking function.

### Revoke all sessions for a user

```bash
# In Firebase Admin SDK (via a Cloud Run admin endpoint)
curl -X POST https://app.smartcommission.app/api/internal/auth/revoke-sessions \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>" \
  -d '{"userId": "<USER_ID>"}'
```

---

## Common Failure Modes

| Symptom | Likely cause | Fix |
|---|---|---|
| All API routes return 500 | Database connection failure | Check Cloud SQL status; check connection string in Secret Manager |
| Login fails with "session error" | Session cookie secret mismatch | Verify `smartcommission-session-secret` in Secret Manager matches running instance |
| Calculation run stuck in RUNNING | Worker crashed mid-run | Mark run as FAILED via admin SQL; re-trigger |
| CSV import stuck in PENDING | Cloud Tasks queue backed up | Check Cloud Tasks queue health; look for stuck tasks |
| Exchange rate not found errors | OXR API key expired or API down | Rotate API key; manually enter rates as interim fix |
| Webhook deliveries failing | Customer endpoint is down or returning non-200 | Check delivery log in Settings → Webhooks; customer to fix their endpoint; events stored for 72hr |
| Rep cannot see their portal | Plan acknowledgment required but not prompted | Check `PlanParticipant.planId` and `PlanAcknowledgment` records; ensure plan is PUBLISHED |
| Firebase Auth token error | Firebase service account key expired or rotated | Update `smartcommission-firebase-admin` secret in Secret Manager |

---

## Monitoring & Alerts

| Alert | Trigger | Severity | Responder |
|---|---|---|---|
| Calculation run failure | Any calc run fails | High | On-call engineer |
| 3+ consecutive nightly failures | 3 nights of failed delta runs for same org | Critical | On-call + SUPER_ADMIN |
| API error rate > 1% over 5 min | Cloud Monitoring SLO breach | High | On-call engineer |
| Database CPU > 80% | Cloud SQL monitoring | Medium | On-call engineer |
| Exchange rate fetch failed | Daily rate job fails | Medium | On-call engineer |
| Disk > 80% | Cloud SQL disk | High | On-call engineer |

Configure alerts in GCP Cloud Monitoring → Alerting Policies. PagerDuty or Google Chat integration for on-call.

---

## Backup & Recovery

| Data | Backup method | Frequency | Retention | Recovery |
|---|---|---|---|---|
| PostgreSQL (Cloud SQL) | Automated Cloud SQL backups | Daily (+ PITR) | 30 days | GCP Console → Cloud SQL → Restore |
| Cloud Storage files (imports, exports) | Multi-region bucket | Automatic | Lifecycle: 30 days for raw import files | Download from bucket |
| Audit logs | Included in Cloud SQL backup + exported monthly to Cloud Storage | Monthly export | 7 years | Restore from Cloud Storage export |

### Point-in-time recovery

Cloud SQL PITR is enabled. To restore to a specific timestamp:
```bash
gcloud sql instances restore-backup smartcommission-db \
  --restore-point-in-time "2026-06-18T10:00:00Z"
```

---

## Incident Response

1. **Detect:** Alert fires or user report.
2. **Assess severity:** P1 (all users affected / data loss risk) vs P2 (partial outage) vs P3 (single user / cosmetic).
3. **Communicate:** Post to status page (`status.smartcommission.app`) within 10 minutes of P1 detection.
4. **Mitigate:** Roll back or hotfix.
5. **Resolve:** Verify all systems healthy.
6. **Post-mortem:** Write blameless post-mortem within 48 hours. Add failure mode to this runbook. Update `security.md` if a security finding.

---

## Known Infrastructure Blockers (as at 2026-06-20)

| Blocker | Impact | Resolution |
|---|---|---|
| GCP project `smartcommission-prod` does not exist | Cannot deploy to Cloud Run, Cloud SQL, or Firebase. All GCP logging returns `USER_PROJECT_DENIED`. | Create the GCP project per `gcp-setup.md`. Run `gcloud projects create smartcommission-prod` then provision all services in order: Secret Manager → Cloud SQL → Cloud Run. |
| Cloud SQL instance not provisioned | No database; application cannot run in production | After GCP project creation, follow Cloud SQL setup steps in `gcp-setup.md`. Run `prisma migrate deploy` once Cloud SQL is reachable. |
| Firebase project not configured for production | Firebase Auth not wired; no production sign-in | Create Firebase project `smartcommission-prod`. Enable Email/Password + Google OAuth. Download service account JSON and store in Secret Manager. |

---

## Access Levels

| Role | Access |
|---|---|
| On-call engineer | GCP Console read/write, Cloud Run deploy, Secret Manager read |
| SUPER_ADMIN | SmartCommission admin console, impersonation (with audit log) |
| DBA | Direct Cloud SQL access (read-only in production) |
| Security officer | Cloud Logging read, audit log access |
