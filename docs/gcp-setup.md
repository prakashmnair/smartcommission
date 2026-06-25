# SmartCommission — GCP Setup

Infrastructure configuration for SmartCommission on Google Cloud Platform.

---

## GCP Project

| Setting | Value |
|---|---|
| Project ID | `smartcommission-prod` |
| Region | `australia-southeast1` (Sydney) |
| Billing account | `011DC4-850024-BD4F92` (My Billing Account) |
| Project number | `1028287218164` |

---

## Services Used

| Service | Purpose | Status |
|---|---|---|
| Cloud Run | Host the Next.js application | ✅ Deployed (2026-06-24, revision `smartcommission-00001-js2`) |
| Cloud SQL (PostgreSQL 15) | Primary database | 🔄 Provisioning (`smartcommission-db`) |
| Cloud Build | CI/CD pipeline | ✅ Trigger live (`smartcommission-deploy`, fires on push to `main`) |
| Artifact Registry | Docker image storage | ✅ Created (`smartcommission` repo) |
| Cloud Storage | Import files, exports, dispute evidence | ✅ Created (3 buckets) |
| Cloud Tasks | Background job queues (calc runs, import jobs) | ✅ Created (4 queues) |
| Cloud Scheduler | Nightly calculation run, FX rate refresh | ⬜ Pending |
| Secret Manager | All secrets and credentials | ✅ Created (9 secrets, values = REPLACE_ME) |
| Firebase Authentication | User identity management | ⬜ Pending |
| Cloud Logging | Application logs, audit logs | ✅ API enabled |
| Cloud Monitoring | Metrics, alerting, uptime checks | ✅ API enabled |
| Error Reporting | Automatic error aggregation | ✅ API enabled |

---

## Cloud Run

### Service Configuration

| Setting | Value |
|---|---|
| Service name | `smartcommission` |
| Region | `australia-southeast1` |
| Min instances | 0 (pre-launch: cost saving; increase to 1 when live users onboard) |
| Max instances | 5 (as deployed via cloudbuild.yaml — increase when traffic warrants) |
| Memory | 1 GiB |
| CPU | 1 vCPU (pre-launch; increase to 2 under load) |
| Concurrency | 80 |
| Timeout | 300s |
| Ingress | All (public internet) |
| Authentication | Allow unauthenticated (public app; auth handled in-app) |

### Deploy command

```bash
gcloud run deploy smartcommission \
  --image australia-southeast1-docker.pkg.dev/smartcommission-prod/smartcommission/app:latest \
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
| Instance name | `shared-db-sydney` *(prakash-shared — shared PostgreSQL instance)* |
| Database version | PostgreSQL 15 |
| Tier | `db-g1-small` |
| Region | `australia-southeast1` |
| Storage | 10 GiB SSD, auto-increase (recreated 2026-06-20 to replace 100 GiB pre-provisioned instance) |
| Backups | Automated daily backups, 30-day retention |
| PITR | Enabled (point-in-time recovery) |
| High Availability | ZONAL (HA not yet enabled — enable when prod traffic warrants it) |
| Authorised networks | Cloud Run service account only (private IP) |

### Database names

| Database | Purpose |
|---|---|
| `smartcommission` | Production database (on shared-db-sydney, prakash-shared) |
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
| `smartcommissionhook-queue` | Outbound webhook delivery | 50 | 3 retries (5s, 30s, 5min) |

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

| Secret name | Status | Rotation | Notes |
|---|---|---|---|
| `smartcommission-db-url` | ✅ Real value | Quarterly | PostgreSQL Unix socket URL for Cloud Run |
| `smartcommission-db-direct-url` | ✅ Real value | Quarterly | PostgreSQL TCP URL for Prisma migrations in Cloud Build |
| `smartcommission-session-secret` | ✅ Real value | Quarterly | 64-char hex secret for session cookies |
| `smartcommission-encryption-key` | ✅ Real value | Quarterly | 32-byte hex key for AES-256-GCM (SSO OIDC client secrets) |
| `smartcommission-cleanup-secret` | ✅ Real value | Quarterly | Bearer token for internal cron/cleanup endpoints |
| `smartcommission-oidc-private-key` | ✅ Real value | Annually | RSA-2048 private key PEM for OIDC IdP token signing |
| `smartcommission-oidc-public-key` | ✅ Real value | Annually | RSA-2048 public key PEM for OIDC JWKS endpoint |
| `smartcommission-firebase-project-id` | ✅ Real value | — | `smartcommission-prod` (also used as NEXT_PUBLIC_FIREBASE_PROJECT_ID) |
| `smartcommission-firebase-api-key` | ✅ Real value | — | Firebase web API key (NEXT_PUBLIC_FIREBASE_API_KEY) |
| `smartcommission-firebase-auth-domain` | ✅ Real value | — | `smartcommission-prod.firebaseapp.com` (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) |
| `smartcommission-firebase-storage-bucket` | ✅ Real value | — | `smartcommission-prod.firebasestorage.app` (NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) |
| `smartcommission-firebase-messaging-sender-id` | ✅ Real value | — | `1028287218164` (NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) |
| `smartcommission-firebase-app-id` | ✅ Real value | — | `1:1028287218164:web:39fe28ef5cfd941518f9a1` (NEXT_PUBLIC_FIREBASE_APP_ID) |
| `smartcommission-firebase-client-email` | ✅ Real value | Annually | `firebase-adminsdk-fbsvc@smartcommission-prod.iam.gserviceaccount.com` |
| `smartcommission-firebase-private-key` | ✅ Real value | Annually | Firebase Admin SDK RSA private key PEM |
| `smartcommission-gemini-key` | ✅ Real value | Annually | Google Gemini API key |
| `smartcommission-stripe-secret` | ⬜ REPLACE_ME | Annually | Stripe platform secret key |
| `smartcommission-stripe-webhook` | ⬜ REPLACE_ME | On change | Stripe webhook signing secret |
| `smartcommission-oxr-key` | ⬜ REPLACE_ME | Annually | Open Exchange Rates API key |
| `smartcommission-resend-key` | ⬜ REPLACE_ME | Annually | Resend transactional email API key |

---

## Firebase

| Setting | Value |
|---|---|
| Firebase project | `smartcommission-prod` ✅ Created |
| Web app | `SmartCommission Web` (ID: `1:1028287218164:web:39fe28ef5cfd941518f9a1`) ✅ Created |
| Auth providers | Email/password, Google OAuth — ⚠️ must enable manually (see I-005 below) |
| Auth domain | `smartcommission-prod.firebaseapp.com` |
| Admin SDK service account | `firebase-adminsdk-fbsvc@smartcommission-prod.iam.gserviceaccount.com` ✅ Key in Secret Manager |

Session cookies issued by the Next.js server (7-day expiry). Firebase ID tokens refreshed client-side. No Firebase Realtime Database or Firestore used (all data in Cloud SQL).

---

## Cloud Build

### CI/CD Pipeline

Trigger: push to `main` branch → `smartcommission-deploy` (trigger ID: `68198ff7-3b36-47f1-ad8f-db67352bdf56`).

GitHub connection: `prakashmnair-workspace` (2nd gen, `australia-southeast1`).
Repository linked: `prakashmnair/workspace`.
Build config: `smartcommission/cloudbuild.yaml`.

### Build steps
1. Write `apps/web/.env.production` from Secret Manager — injects `NEXT_PUBLIC_*` Firebase vars so they are baked into the Next.js bundle at build time
2. Docker build → tag with `$COMMIT_SHA` and `latest` → push to Artifact Registry
3. Run `prisma migrate deploy` via Cloud SQL Auth Proxy (uses `DATABASE_DIRECT_URL` secret)
4. `gcloud run deploy smartcommission` — attaches all runtime secrets + `OIDC_ISSUER` env var

### First deploy pre-requisites (still outstanding)
- Firebase project set up and all 8 `REPLACE_ME` Firebase secrets populated
- Remaining secrets: Gemini, Stripe, OXR, Resend keys populated

---

## IAM Roles

| Service account | Role | Purpose |
|---|---|---|
| `smartcommission-app@smartcommission-prod.iam.gserviceaccount.com` | `roles/cloudsql.client` | Connect to Cloud SQL |
| `smartcommission-app@smartcommission-prod.iam.gserviceaccount.com` | `roles/secretmanager.secretAccessor` | Read secrets |
| `smartcommission-app@smartcommission-prod.iam.gserviceaccount.com` | `roles/storage.objectAdmin` | Read/write Cloud Storage buckets |
| `smartcommission-app@smartcommission-prod.iam.gserviceaccount.com` | `roles/cloudtasks.enqueuer` | Enqueue Cloud Tasks |
| `smartcommission-app@smartcommission-prod.iam.gserviceaccount.com` | `roles/logging.logWriter` | Write to Cloud Logging |
| `smartcommission-app@smartcommission-prod.iam.gserviceaccount.com` | `roles/cloudscheduler.jobRunner` | Trigger Cloud Scheduler jobs |
| `1028287218164@cloudbuild.gserviceaccount.com` | `roles/run.admin` | Deploy Cloud Run services |
| `1028287218164@cloudbuild.gserviceaccount.com` | `roles/artifactregistry.writer` | Push Docker images |
| `1028287218164@cloudbuild.gserviceaccount.com` | `roles/iam.serviceAccountUser` | Act as app service account |
| `1028287218164@cloudbuild.gserviceaccount.com` | `roles/secretmanager.secretAccessor` | Read secrets for migrations |

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
| Cloud Run (1 min instance, when deployed) | ~AUD 40 |
| Cloud SQL shared-db-sydney (prakash-shared, shared cost) | ~AUD 0 additional |
| Cloud SQL disk storage | ~AUD 0 additional (shared instance) |
| Cloud Tasks | ~AUD 5 |
| Firebase Authentication | Free tier (up to 50K MAU) |
| Secret Manager | ~AUD 2 |
| Cloud Build (120 min/day) | ~AUD 15 |
| Cloud Logging | ~AUD 10 |
| **Total estimate (pre-launch)** | **~AUD 73/month** |
| **Total estimate (post-launch, scale up DB to db-custom-2-7680)** | **~AUD 260/month** |

Costs will increase significantly at scale. Review monthly and right-size as needed.

---

## Known Infrastructure Issues

| Code | Severity | Status | Title | Description |
|---|---|---|---|---|
| **I-001** | High | In Progress | No CI/CD pipeline yet | `cloudbuild.yaml` created. GitHub connection needs `secretmanager.admin` granted to `service-1028287218164@gcp-sa-cloudbuild.iam.gserviceaccount.com`, then trigger created via console/CLI. |
| **I-002** | Medium | Open | No staging environment | Staging environment not yet provisioned. All testing done locally. |
| **I-003** | High | ✅ Fixed 2026-06-20 | Cloud SQL provisioned | Migrated to shared instance `prakash-shared:australia-southeast1:shared-db-sydney` (PostgreSQL 15, `db-custom-2-7680`, `australia-southeast1`). Database `smartcommission` and user `smartcommission` created. DB URLs in Secret Manager (version 2). |
| **I-004** | High | Open | Cloud Run service not deployed | Waiting on Cloud SQL + Cloud Build trigger + real secrets before first deploy. |
| **I-005** | Low | In Progress | Firebase Auth providers not yet enabled | Firebase project created, Admin SDK key in Secret Manager. Must visit [Firebase Console → Authentication → Get started](https://console.firebase.google.com/project/smartcommission-prod/authentication) and enable Email/Password + Google Sign-In. Cannot be done via CLI (requires ToS acceptance in browser). |
| **I-006** | Medium | In Progress | Some secrets still need real values | Outstanding: Gemini key, Stripe secret, Stripe webhook secret, OXR key, Resend key. All Firebase secrets are now real values. |
