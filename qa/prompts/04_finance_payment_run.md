# QA Prompt — Finance Payment Run Workflow

**Scope:** Finance reviews exceptions, approves, exports, and marks payment run as PAID
**Actor:** FINANCE user
**Environment:** Staging / local dev

---

## Prerequisites

- At least one completed (COMPLETED) period-close calculation run
- At least 5 earnings records in DRAFT/APPROVED status
- One rep on payment hold
- At least one exception-flagged earnings record
- FINANCE user configured

---

## Test Flow

### 1. Review Calculation Exceptions

1. Sign in as FINANCE.
2. Navigate to `/calculations`.
3. Open the most recent completed calculation run.
4. Click "Exceptions" tab.
5. For each exception:
   - Click "View audit trail" to investigate.
   - Mark as "Reviewed — no action required" or "Reviewed — adjustment needed."
6. Verify: all exceptions marked as reviewed before proceeding.

### 2. Create a Payment Run

1. Navigate to `/payments`.
2. Click "Create Payment Run."
3. Select period (e.g. "June 2026").
4. Verify system pre-populates payments from approved earnings records.
5. Verify total amount shown.

### 3. Review Individual Payments

1. Review the payments list.
2. Find the rep on payment hold.
3. Verify their payment is excluded from the run (or flagged as HELD).
4. Review any rep with a negative earnings balance (draw recovery) — verify the deduction is shown.

### 4. Approve the Payment Run

1. Click "Approve Payment Run."
2. Verify status changes to APPROVED.
3. Verify AuditLog entry created with actor, timestamp, and run ID.
4. Verify: attempt to approve a second time shows "already approved" message.

### 5. Export to Payroll

1. Click "Export to Payroll."
2. Select format: "Xero CSV."
3. Verify: file downloads.
4. Open the CSV and verify: column headers, rep details (masked PII), gross amounts, net amounts, currency.
5. Verify: run status changes to EXPORTED.

### 6. Mark as Paid

1. After "uploading" to payroll (simulate), return to SmartCommission.
2. Click "Mark as Paid."
3. Enter payroll reference number.
4. Verify: run status changes to PAID.
5. Verify: rep notifications sent ("Your June 2026 commission of AUD X has been processed.").

---

## Edge Cases to Test

- [ ] Try to approve run with unreviewed exceptions → warning banner shown; confirm required
- [ ] Two FINANCE users approve simultaneously → second user sees "already approved" message
- [ ] Rep with open dispute → payment held automatically; Finance sees dispute reference
- [ ] Export when Cloud Storage unavailable → error shown with "Download as CSV" fallback
- [ ] MANAGER tries to approve payment run → 403 Forbidden

---

## Pass Criteria

- [ ] Payment run lifecycle: DRAFT → APPROVED → EXPORTED → PAID
- [ ] AuditLog entries at each transition
- [ ] FINANCE role enforcement: MANAGER and ADMIN cannot approve
- [ ] Export CSV includes all payments; formula injection prevented
- [ ] Held payments excluded from run
- [ ] Rep notifications sent on PAID status
