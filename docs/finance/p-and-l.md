# SmartCommission — Profit & Loss

> Updated: 2026-06-26 | Currency: AUD | Rate: 1 USD ≈ 1.55 AUD
> **Source files:** `docs/finance/expenses.csv` · `docs/finance/income.csv`
> **Aggregate view (all projects):** `admin/finance/p-and-l.md`

---

## Where to Find Actuals

| Metric | Source |
|---|---|
| GCP costs | GCP Billing Console → filter by project `smartcommission-prod` |
| Shared DB share | GCP Billing Console → filter by project `prakash-shared` ÷ 7 |
| Stripe revenue | dashboard.stripe.com → Revenue |

---

## June 2026

### Revenue

| Source | Amount (AUD) | Status |
|---|---|---|
| Stripe — plan fees | $0.00 | Pre-launch |
| **Total Revenue** | **$0.00** | |

### Costs

| Item | Est. Monthly (AUD) | Actual (AUD) | Notes |
|---|---|---|---|
| Cloud Run (deployed 2026-06-24) | ~$0.50 | ⏳ | min-instances=0; cost grows with traffic |
| Shared DB (1/7 of shared-db-sydney) | ~$4.00 | ⏳ | prakash-shared/shared-db-sydney |
| Cloud Storage (3 buckets) | $0.00 | ⏳ | Currently empty |
| Artifact Registry | ~$0.30 | ⏳ | |
| Cloud Build | ~$3.00 | ⏳ | Occasional build runs |
| Secret Manager | ~$2.00 | ⏳ | |
| Resend (email) | $0.00 | $0.00 | Free tier |
| **Total Costs** | **~$9.30** | **⏳ GCP pending** | |

### Net P&L

| | AUD |
|---|---|
| Revenue | $0.00 |
| Costs (est.) | ~$9.30/mo |
| **Net** | **~-$9.30/mo** |

---

## YTD 2026

| Month | Revenue | Costs | Net |
|---|---|---|---|
| June 2026 (partial) | $0.00 | ~$9.30 est. | ~-$9.30 |
| **YTD Total** | **$0.00** | **~$9.30** | **~-$9.30** |

---

## Revenue Stream Status

| Stream | Status | Next Action |
|---|---|---|
| Stripe subscriptions | 🔴 Pre-launch | Complete Firebase Auth + API keys setup, then deploy |

---

## Cost Optimisation Log

| Date | Action | Saving/mo |
|---|---|---|
| 2026-06-23 | DB migrated to shared-db on prakash-shared (from db-f1-micro) | ~$10 AUD |
| 2026-06-21 | DB downsized db-custom-2-7680 → db-g1-small → shared-db | ~$158 AUD total |
| 2026-06-23 | Artifact Registry cleanup policy (keep last 10 images) | ~$1–3 AUD growing |
