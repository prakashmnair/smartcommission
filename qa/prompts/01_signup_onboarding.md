# QA Prompt — Signup and Onboarding Flow

**Scope:** New user signup through to first commission calculation run
**Actor:** New admin user
**Environment:** Staging / local dev

---

## Test Flow

### 1. Landing Page

1. Open `http://localhost:3000` (or staging URL).
2. Verify the page loads without errors.
3. Verify the headline, value proposition, and "Start free" CTA are visible.
4. Verify the page has a `<title>` tag and `<meta name="description">`.
5. Verify ThemeToggle is visible at top-right (fixed position).
6. Verify light mode and dark mode toggle works correctly.

### 2. Signup

1. Click "Start free."
2. Verify signup form is at `/signup`.
3. Sign up with email and password: use a test email (e.g. `test+<timestamp>@example.com`).
4. Verify: password strength indicator shown, terms link present.
5. Submit form.
6. Verify: email verification banner shown (non-blocking).
7. Verify: redirected to `/onboarding`.

### 3. Onboarding Wizard — Step 1 (Team)

1. Verify step 1 shown: "Invite your team."
2. Click "Skip — I'll add my team later."
3. Verify sample reps (3 fictional reps) are populated.

### 4. Onboarding Wizard — Step 2 (Plan)

1. Verify plan form shown with pre-filled name.
2. Select "Commission on closed deals."
3. Enter 5% flat rate.
4. Click "Next."
5. Verify plan created in DRAFT status.

### 5. Onboarding Wizard — Step 3 (Transactions)

1. Select "Use sample data."
2. Verify 5 sample transactions are pre-loaded.
3. Click "Next."

### 6. Onboarding Wizard — Step 4 (First Calculation)

1. Click "Run calculation."
2. Verify loading animation shown.
3. Verify success state: summary cards per sample rep with earnings shown.
4. Verify confetti/celebration animation fires.

### 7. Onboarding Wizard — Step 5 (Review Results)

1. Click on a rep card to view deal-level detail.
2. Click "View calculation" to see the audit trail.
3. Verify audit trail shows step-by-step calculation.

### 8. Onboarding Wizard — Step 6 (Invite Reps)

1. Click "Send portal invitations."
2. Verify confirmation message.
3. Verify redirected to `/dashboard`.

### 9. Dashboard

1. Verify getting-started checklist visible in sidebar.
2. Verify 4 steps marked as done (Create plan, Import data, Run calculation, Invite reps).
3. Verify team earnings summary visible.

---

## Pass Criteria

- [ ] Full flow completes without errors
- [ ] First calculation run succeeds
- [ ] All page backgrounds use `bg-slate-50 dark:bg-slate-950`
- [ ] All cards use `bg-white dark:bg-slate-900`
- [ ] Primary buttons use `bg-indigo-600`
- [ ] ThemeToggle present on all screens
- [ ] `suppressHydrationWarning` on `<html>` element
- [ ] No console errors
- [ ] Welcome email received (check test email inbox)
