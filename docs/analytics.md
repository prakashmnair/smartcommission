# SmartCommission — Analytics

---

## Overview

| Field | Value |
|---|---|
| GA4 Measurement ID | `G-XXXXXXXXXX` *(create property in GA4 console)* |
| GA4 Property Name | SmartCommission — Production |
| GA4 Account | prakashmnair@gmail.com |
| Status | Pending — env var not yet set |
| Last reviewed | 2026-06-23 |

---

## GA4 Setup

### Environment variable

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Add to `.env.local` and Secret Manager (`ga-measurement-id`) for production.

### Integration status

- Script tags added to `apps/web/app/layout.tsx` ✅
- `apps/web/lib/analytics.ts` created ✅
- `NEXT_PUBLIC_GA_ID` in Secret Manager ☐
- Conversion events configured ☐
- Custom dimensions configured ☐

---

## Standard Events

| Event name | When to fire | Component/file |
|---|---|---|
| `sign_up` | After account registration | `app/(auth)/` pages |
| `login` | After successful login | `app/(auth)/` pages |
| `logout` | After sign out | ProfileMenu |
| `subscription_start` | After plan activated | Stripe webhook |
| `subscription_cancel` | After plan cancelled | Stripe webhook |
| `feature_used` | Key ICM action completed | Key action handlers |

---

## Project-Specific Events

| Event name | When to fire | Params |
|---|---|---|
| `plan_created` | Admin creates commission plan | — |
| `plan_published` | Commission plan published to reps | — |
| `commission_calculated` | Batch commission run triggered | `rep_count: number` |
| `payout_exported` | Payout file exported | `format: string` |
| `rep_viewed_statement` | Rep opens their commission statement | — |
| `dispute_raised` | Rep raises a commission dispute | — |
| `dispute_resolved` | Admin resolves dispute | `outcome: 'approved' \| 'rejected'` |

---

## Conversions

Configure in GA4 → Admin → Conversions:

- `sign_up`
- `subscription_start`
- `plan_published`

---

## Custom Dimensions

| Dimension name | Scope | Description |
|---|---|---|
| `plan` | User | `free`, `starter`, `pro`, `enterprise` |
| `role` | User | `ADMIN`, `MANAGER`, `REP` |
| `org_id` | User | Organisation ID |

---

## Key Funnels

1. **Signup:** Landing → Signup → Dashboard → `plan_created` (activation)
2. **Subscription:** Free → Upgrade page → Checkout → `subscription_start`
3. **Rep engagement:** Login → View statement → Dispute or acknowledge

---

## Consent & Privacy

- No PII in event params — use org IDs, plan codes, not names/emails
- Add consent banner for EU users
- Cookie: `_ga` (2-year expiry) — declare in Privacy Policy

---

## Status

| Item | Status |
|---|---|
| GA4 property created | ☐ |
| `NEXT_PUBLIC_GA_ID` in Secret Manager | ☐ |
| Script tags in layout.tsx | ✅ 2026-06-23 |
| `lib/analytics.ts` created | ✅ 2026-06-23 |
| `trackEvent` calls on key actions | ☐ |
| Conversion events configured in GA4 | ☐ |
| Custom dimensions configured | ☐ |
| Privacy Policy updated | ☐ |
