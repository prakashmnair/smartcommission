# SmartCommission — GCP Setup

Infrastructure configuration for SmartCommission on Google Cloud Platform.

---

## GCP Project

| Setting | Value |
|---|---|
| Project ID | `smartcommission-prod` |
| Region | `australia-southeast1` (Sydney) |
| Billing account | [TBC at project creation] |
| Project number | [TBC at project creation] |

---

## Services Used

| Service | Purpose | Status |
|---|---|---|
| Cloud Run | Host the Next.js application | Planned |
| Cloud SQL (PostgreSQL 15) | Primary database | Planned |
| Cloud Build | CI/CD pipeline | Planned |
| Artifact Registry | Docker image storage | Planned |
| Cloud Storage | Import files, exports, dispute evidence | Planned |
| Cloud Tasks | Background job queues (calc runs, import jobs) | Planned |
| Cloud Scheduler | Nightly calculation run, FX rate refresh | Planned |
| Secret Manager | All secrets and credentials | Planned |
| Firebase Authentication | User identity management | Planned |
| Cloud Logging | Application logs, audit logs | Planned |
| Cloud Monitoring | Metrics, alerting, uptime checks | Planned |
| Error Reporting | Automatic error aggregation | Planned |

---

## Cloud Run

### Service Configuration

| Setting | Value |
|---|---|
| Service name | `smartcommission-web` |
| Region | `australia-southeast1` |
| Min instances | 1 (avoid cold starts) |
| Max instances | 10 (scale to demand) |
| Memory | 1 GiB |
| CPU | 2 vCPU |
| Concurrency | 80 |
| Timeout | 300s |
| Ingress | All (public internet) |
| Authentication | Allow unauthenticated (public app; auth handled in-app) |

### Deploy command

```bash
gcloud run deploy smartcommission-web \
  --image australia-southeast1-docker.pkg.dev/smartcommission-prod/smartcommission/web:latest \
  --region australia-southeast1 \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 10 \
  --concurrency 80 \
  --timeout 300 \
  --allow-unauthenticated \
  --set-secrets DATABASE_URL=smartcommission-db-url:latest,SESSION_SECRET=smartcommission-session-secret:latest
```

---

## Cloud SQL

### Instance Configuration

| Setting | Value |
|---|---|
| Instance name | `smartcommission-db` |
| Database version | PostgreSQL 15 |
| Tier | `db-standard-2` (2 vCPU, 7.5 GiB RAM) — scale up as needed |
| Region | `australia-southeast1` |
| Storage | 100 GiB SSD (autoscale enabled) |
| Backups | Automated daily backups, 30-day retention |
| PITR | Enabled (point-in-time recovery) |
| High Availability | Enabled in production |
| Authorised networks | Cloud Run service account only (private IP) |

### Database names

| Database | Purpose |
|---|---|
| `smartcommission_prod` | Production database |
| `smartcommission_staging` | Staging database (if staging env provisioned) |

### Connection pooling

Uses Cloud SQL Auth Proxy + PgBouncer for connection pooling. Max 100 connections per Cloud Run instance.

### Row Level Security (RLS)

RLS policies enabled on high-risk tables: `transactions`, `earnings_records`, `payments`, `audit_logs`.

```sql
-- Example RLS policy
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON transactions
  USING (organisation_id = current_setting('app.current_org_id'));
```

---

## Cloud Storage Buckets

| Bucket name | Purpose | Lifecycle rule |
|---|---|---|
| `sc-imports-prod` | CSV/Excel import files | Delete after 30 days |
| `sc-exports-prod` | Generated export files (CSV, PDF, xlsx) | Delete after 7 days |
| `sc-evidence-prod` | Dispute evidence attachments | Retain 7 years (financial records) |

All buckets: uniform access control, Cloud Storage encryption at rest, no public access.

Evidence files served via signed URLs (1-hour expiry) — never public URLs.

---

## Cloud Tasks Queues

| Queue name | Purpose | Max concurrent | Retry |
|---|---|---|---|
| `smartcommission-calc-queue` | Calculation run jobs | 10 | 3 retries with exponential backoff |
| `smartcommission-import-queue` | CSV import processing jobs | 20 | 3 retries with exponential backoff |
| `smartcommission-email-queue` | Transactional email dispatch | 50 | 2 retries |
| `smartcommission-webhook-queue` | Outbound webhook delivery | 50 | 3 retries (5s, 30s, 5min) |

---

## Cloud Scheduler Jobs

| Job name | Schedule | Target | Description |
|---|---|---|---|
| `nightly-calculation` | `0 16 * * *` (UTC = 02:00 AEST) | Cloud Tasks: calc queue | Trigger delta calculation runs for all active orgs |
| `fx-rate-refresh` | `30 0 * * *` (UTC = 00:30 UTC) | Cloud Run: `/api/internal/fx/refresh` | Fetch daily exchange rates from Open Exchange Rates |
| `audit-log-retention` | `0 3 1 * *` (1st of each month, 03:00 UTC) | Cloud Run: `/api/internal/retention/audit` | Delete audit logs older than 7 years |
| `security-log-retention` | `0 3 1 * *` | Cloud Run: `/api/internal/retention/security` | Delete security logs older than 3 years |

---

## Secret Manager

All secrets stored in GCP Secret Manager, project `smartcommission-prod`.

| Secret name | Rotation | Notes |
|---|---|---|
| `smartcommission-db-url` | Quarterly | PostgreSQL connection string |
| `smartcommission-db-direct-url` | Quarterly | Direct PostgreSQL URL (for Prisma migrations) |
| `smartcommission-firebase-admin` | Annually | Firebase Admin SDK service account JSON |
| `smartcommission-session-secret` | Quarterly | 64-char hex secret for session cookies |
| `smartcommission-stripe-secret` | Annually | Stripe platform secret key |
| `smartcommission-stripe-webhook` | On change | Stripe webhook signing secret |
| `smartcommission-oxr-key` | Annually | Open Exchange Rates API key |
| `smartcommission-resend-key` | Annually | Resend transactional email API key |

---

## Firebase

| Setting | Value |
|---|---|
| Firebase project | `smartcommission-prod` |
| Auth providers | Email/password, Google OAuth |
| Auth domain | `smartcommission-prod.firebaseapp.com` |
| Service account | `firebase-adminsdk@smartcommission-prod.iam.gserviceaccount.com` |

Session cookies issued by the Next.js server (7-day expiry). Firebase ID tokens refreshed client-side. No Firebase Realtime Database or Firestore used (all data in Cloud SQL).

---

## Cloud Build

### CI/CD Pipeline

Trigger: push to `main` branch.

```yaml
# cloudbuild.yaml (planned)
steps:
  - name: node:22
    entrypoint: npm
    args: ['install']
    dir: apps/web
  - name: node:22
    entrypoint: npm
    args: ['run', 'build']
    dir: apps/web
  - name: gcr.io/cloud-builders/docker
    args: ['build', '-t', 'australia-southeast1-docker.pkg.dev/smartcommission-prod/smartcommission/web:$SHORT_SHA', '.']
  - name: gcr.io/cloud-builders/docker
    args: ['push', 'australia-southeast1-docker.pkg.dev/smartcommission-prod/smartcommission/web:$SHORT_SHA']
  - name: gcr.io/google.com/cloudsdktool/cloud-sdk
    args: ['run', 'deploy', 'smartcommission-web', '--image', 'australia-southeast1-docker.pkg.dev/smartcommission-prod/smartcommission/web:$SHORT_SHA', '--region', 'australia-southeast1']
```

---

## IAM Roles

| Service account | Role | Purpose |
|---|---|---|
| Cloud Run service account | `roles/cloudsql.client` | Connect to Cloud SQL |
| Cloud Run service account | `roles/secretmanager.secretAccessor` | Read secrets |
| Cloud Run service account | `roles/storage.objectAdmin` | Read/write Cloud Storage buckets |
| Cloud Run service account | `roles/cloudtasks.enqueuer` | Enqueue Cloud Tasks |
| Cloud Run service account | `roles/logging.logWriter` | Write to Cloud Logging |
| Cloud Build service account | `roles/run.admin` | Deploy Cloud Run services |
| Cloud Build service account | `roles/artifactregistry.writer` | Push Docker images |

---

## DNS & Domain

| Domain | Purpose | DNS host |
|---|---|---|
| `app.smartcommission.app` | Primary application | Cloudflare (planned) |
| `sandbox.smartcommission.app` | Sandbox environment | Cloudflare (planned) |
| `api.smartcommission.app` | API (CNAME to app) | Cloudflare (planned) |
| `status.smartcommission.app` | Status page (BetterStack/Atlassian Status) | Cloudflare (planned) |
| `help.smartcommission.app` | Help centre (Intercom) | Cloudflare (planned) |

---

## Cost Estimate (Phase 1 MVP, low traffic)

| Service | Estimated monthly cost (AUD) |
|---|---|
| Cloud Run (1 min instance) | ~AUD 40 |
| Cloud SQL (db-standard-2, HA) | ~AUD 350 |
| Cloud Storage (10 GB) | ~AUD 5 |
| Cloud Tasks | ~AUD 5 |
| Firebase Authentication | Free tier (up to 50K MAU) |
| Secret Manager | ~AUD 2 |
| Cloud Build (120 min/day) | ~AUD 15 |
| Cloud Logging | ~AUD 10 |
| **Total estimate** | **~AUD 427/month** |

Costs will increase significantly at scale. Review monthly and right-size as needed.

---

## Known Infrastructure Issues

| Code | Severity | Status | Title | Description |
|---|---|---|---|---|
| **I-001** | High | Open | No CI/CD pipeline yet | Cloud Build pipeline not yet configured. Deployments are manual. |
| **I-002** | Medium | Open | No staging environment | Staging environment not yet provisioned. All testing done locally. |
| **I-003** | High | Open | Cloud SQL not provisioned | Database instance not yet created. |
| **I-004** | High | Open | Cloud Run service not deployed | Application not yet deployed to Cloud Run. |
| **I-005** | Medium | Open | Firebase project not configured | Firebase project not yet set up for production. |
