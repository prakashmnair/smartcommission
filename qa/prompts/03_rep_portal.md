# QA Prompt — Sales Rep Portal

**Scope:** Rep views earnings, commission statement, dispute workflow, and what-if calculator
**Actor:** REP user
**Environment:** Staging / local dev

---

## Prerequisites

- A published compensation plan with the REP as a participant
- At least one completed calculation run with earnings for the REP
- Plan acknowledgment configured (to test the gate)

---

## Test Flow

### 1. Rep Login and Acknowledgment Gate

1. Sign in as REP.
2. Navigate to `/portal`.
3. Verify if acknowledgment is required: full-screen acknowledgment prompt shown.
4. Read the plan document.
5. Click "Acknowledge" (e-sign).
6. Verify: `PlanAcknowledgment` record created with UTC timestamp and IP address.
7. Verify: portal dashboard now fully accessible.

### 2. Earnings Dashboard

1. Verify attainment gauge shows current period attainment (colour: red <50%, amber 50–99%, green 100%+, gold 125%+).
2. Verify YTD earnings total shown.
3. Verify "Next estimated payment" displayed with date and amount.
4. Click "This Period" breakdown.
5. Verify: deals listed, credited revenue total, quota, attainment %, gross commission, holdback (if any), net earnings.

### 3. Deal-Level Detail

1. Click on a specific deal in the earnings breakdown.
2. Verify deal detail shows: deal name, close date, credit type (PRIMARY/OVERLAY), credit %, credit amount, tier applied, commission earned.
3. Click "View calculation."
4. Verify full audit trail shown: every rule that fired, values used, intermediate calculations, final commission.

### 4. Commission Statement Download

1. Navigate to "Statements."
2. Click on the latest statement.
3. Download PDF.
4. Verify PDF contains: rep name, period, plan name, quota, actual, attainment %, deal list, adjustments, holdback, draw deduction (if any), net earnings, payment date.

### 5. What-If Calculator

1. Navigate to What-If calculator (in portal).
2. Enter: "If I close AUD 200,000 more this month."
3. Verify: projected earnings increase calculated correctly against actual plan rules.
4. Move the slider to different amounts and verify projections update.

### 6. Dispute Submission

1. Find a deal in the earnings breakdown.
2. Click three-dot menu → "Dispute this commission."
3. Select category: "Wrong split / credit allocation."
4. Enter description (20+ characters).
5. Attach a file (< 10 MB).
6. Submit.
7. Verify: dispute created with DIS-XXXX reference, status OPEN.
8. Verify: manager receives email notification.

---

## Edge Cases to Test

- [ ] Portal accessed without plan acknowledgment → gate shown
- [ ] Negative earnings (draw recovery) → shown in red with tooltip
- [ ] Calculation not yet run → "Projected" banner shown instead of confirmed earnings
- [ ] Multi-currency deal → original currency and converted amount both shown with rate and date
- [ ] Submit duplicate dispute for same transaction → warning shown with existing dispute reference

---

## Pass Criteria

- [ ] Acknowledgment timestamp captured correctly (ISO 8601 UTC)
- [ ] Attainment gauge colour-coded correctly
- [ ] Audit trail is complete and traceable
- [ ] PDF statement downloads correctly
- [ ] What-if results match manual calculation
- [ ] Dispute created and manager notified
- [ ] REP cannot see other reps' data (test by attempting to access another user's earnings URL)
