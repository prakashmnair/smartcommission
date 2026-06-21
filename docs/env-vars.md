# SmartCommission — Environment Variables

All environment variables required to run SmartCommission. Server-only variables are never exposed to the browser.

---

## Variable Reference

| Variable | Required | Example | Description | Server / Public |
|---|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/smartcommission` | PostgreSQL connection string (via PgBouncer) | Server |
| `DIRECT_URL` | Yes | `postgresql://user:pass@host:5432/smartcommission` | Direct PostgreSQL URL for Prisma migrations (bypasses PgBouncer) | Server |
| `FIREBASE_PROJECT_ID` | Yes | `smartcommission-prod` | Firebase project ID | Server |
| `FIREBASE_CLIENT_EMAIL` | Yes | `firebase-adminsdk@...` | Firebase Admin SDK service account email | Server |
| `FIREBASE_PRIVATE_KEY` | Yes | `-----BEGIN RSA PRIVATE KEY-----...` | Firebase Admin SDK private key (newlines escaped as `\n`) | Server |
| `SESSION_SECRET` | Yes | `64-char random hex` | Secret for signing session cookies | Server |
| `SESSION_EXPIRY_DAYS` | No | `7` | Session cookie expiry in days (default: 7) | Server |
| `STRIPE_SECRET_KEY` | Yes | `sk_live_...` | Stripe platform secret key | Server |
| `STRIPE_WEBHOOK_SECRET` | Yes | `whsec_...` | Stripe webhook signing secret | Server |
| `OPEN_EXCHANGE_RATES_APP_ID` | Yes | `abc123...` | Open Exchange Rates API key | Server |
| `RESEND_API_KEY` | Yes | `re_...` | Resend transactional email API key | Server |
| `FROM_EMAIL` | Yes | `noreply@smartcommission.app` | From address for transactional emails | Server |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://app.smartcommission.app` | Public base URL of the app (used for redirects, links) | Public |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | `AIza...` | Firebase Web API key (client-side auth init) | Public |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | `smartcommission-prod.firebaseapp.com` | Firebase Auth domain | Public |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | `smartcommission-prod` | Firebase project ID (client-side) | Public |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | `smartcommission-prod.appspot.com` | Firebase Storage bucket | Public |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | `123456789` | Firebase Messaging sender ID | Public |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | `1:123456789:web:abc` | Firebase App ID | Public |
| `GCP_PROJECT_ID` | Yes | `smartcommission-prod` | GCP project ID | Server |
| `GCP_REGION` | Yes | `australia-southeast1` | GCP region for Cloud Run, Cloud Tasks | Server |
| `CLOUD_TASKS_QUEUE_CALC` | Yes | `smartcommission-calc-queue` | Cloud Tasks queue name for calculation jobs | Server |
| `CLOUD_TASKS_QUEUE_IMPORT` | Yes | `smartcommission-import-queue` | Cloud Tasks queue name for import jobs | Server |
| `GCS_BUCKET_IMPORTS` | Yes | `sc-imports` | Cloud Storage bucket for CSV imports | Server |
| `GCS_BUCKET_EXPORTS` | Yes | `sc-exports` | Cloud Storage bucket for generated exports | Server |
| `GCS_BUCKET_EVIDENCE` | Yes | `sc-evidence` | Cloud Storage bucket for dispute evidence | Server |
| `SIGNED_URL_EXPIRY_MINUTES` | No | `60` | Expiry for Cloud Storage signed URLs (default: 60) | Server |
| `CALCULATION_ENGINE_VERSION` | No | `1.0.0` | Pinned calculation engine version for reproducibility | Server |
| `MAX_IMPORT_FILE_SIZE_MB` | No | `50` | Maximum CSV import file size in MB (default: 50) | Server |
| `RATE_LIMIT_FREE` | No | `100` | API rate limit for free tier (requests/min, default: 100) | Server |
| `RATE_LIMIT_STARTER` | No | `500` | API rate limit for starter tier (requests/min, default: 500) | Server |
| `RATE_LIMIT_GROWTH` | No | `1000` | API rate limit for growth tier (requests/min, default: 1000) | Server |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | No | `G-XXXXXXXXXX` | Google Analytics 4 Measurement ID | Public |
| `NEXT_PUBLIC_INTERCOM_APP_ID` | No | `abc123` | Intercom App ID for in-app live chat | Public |
| `NODE_ENV` | Yes | `production` | Node environment (`development`, `test`, `production`) | Server |
| `GEMINI_API_KEY` | Yes (Phase 4) | `AIza...` | Google Gemini API key for AI assistant | Server |
| `CONTEXT_COOKIE_SECRET` | Yes | `64-char random hex` | Signing secret for the `__context` role-switching cookie | Server |
| `ENCRYPTION_KEY` | Yes | `32-byte base64` | AES-256-GCM key for SSO OIDC client secret encryption (role-switching.md, sso.md) | Server |

---

## Secret Manager Mapping

All secrets are fetched from GCP Secret Manager at runtime. Never commit secrets to git.

| Secret Manager Name | Maps to env var | Rotation |
|---|---|---|
| `smartcommission-db-url` | `DATABASE_URL` | Quarterly |
| `smartcommission-db-direct-url` | `DIRECT_URL` | Quarterly |
| `smartcommission-firebase-admin` | `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` | Annually |
| `smartcommission-session-secret` | `SESSION_SECRET` | Quarterly |
| `smartcommission-stripe-secret` | `STRIPE_SECRET_KEY` | Annually |
| `smartcommission-stripe-webhook` | `STRIPE_WEBHOOK_SECRET` | On webhook endpoint change |
| `smartcommission-oxr-key` | `OPEN_EXCHANGE_RATES_APP_ID` | Annually |
| `smartcommission-resend-key` | `RESEND_API_KEY` | Annually |

---

## Local Development

Use `.env.local` for local development. This file is gitignored.

```bash
# .env.local (template — never commit this file)
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartcommission_dev
DIRECT_URL=postgresql://postgres:password@localhost:5432/smartcommission_dev
FIREBASE_PROJECT_ID=smartcommission-dev
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@smartcommission-dev.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
SESSION_SECRET=dev-secret-do-not-use-in-production
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
OPEN_EXCHANGE_RATES_APP_ID=dev-app-id
RESEND_API_KEY=re_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=smartcommission-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=smartcommission-dev
GCP_PROJECT_ID=smartcommission-dev
GCP_REGION=australia-southeast1
NODE_ENV=development
```

---

## Cloud Run Environment

Cloud Run reads secrets from Secret Manager. Environment variable bindings are configured in the Cloud Run service YAML:

```yaml
env:
  - name: NODE_ENV
    value: production
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: smartcommission-db-url
        key: latest
```

See `gcp-setup.md` for full Cloud Run service configuration.
