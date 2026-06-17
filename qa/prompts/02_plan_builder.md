# QA Prompt — Plan Builder and Approval Workflow

**Scope:** Creating a compensation plan through the approval workflow to PUBLISHED status
**Actor:** ADMIN user, then an approver
**Environment:** Staging / local dev

---

## Prerequisites

- ADMIN user signed in
- Organisation configured with at least 2 users (ADMIN + 1 approver)
- Approval chain configured in Settings

---

## Test Flow

### 1. Create a Tiered Commission Plan

1. Navigate to `/plans`.
2. Click "New Plan."
3. Step 1 — Basic info:
   - Enter plan name: "AE New Business Q3 FY26"
   - Select type: COMMISSION
   - Set effective dates: next quarter start / end
   - Select currency: AUD
4. Step 2 — Participants:
   - Add at least 2 users
   - Set OTE for each: $200,000 base, $100,000 target commission
5. Step 3 — Rules:
   - Add rule: "Tiered Progressive Commission"
   - Configure tiers: 0–50%=0%, 51–100%=5%, 101–125%=8%, 126%+=12%
   - Add accelerator: 2× multiplier above 150% attainment
6. Step 4 — Caps & Floors:
   - Add hard monthly cap: AUD 40,000
   - Add draw floor: AUD 2,000 (non-recoverable)
7. Step 5 — Clawbacks:
   - Add clawback: customer cancels within 90 days → recover 100%
8. Step 6 — Payment Schedule:
   - Monthly, payment on 15th of following month
9. Step 7 — Review:
   - Verify full plan summary displayed
   - Preview the plan document

### 2. Submit for Approval

1. Click "Submit for Approval."
2. Verify plan status changes to REVIEW.
3. Verify email notification sent to approver.

### 3. Approver Reviews and Approves

1. Sign in as the approver.
2. Navigate to `/plans/:id`.
3. Add a comment: "Please increase accelerator threshold to 160%."
4. Click "Approve."
5. Verify plan status changes to APPROVED.

### 4. Admin Publishes

1. Sign back in as ADMIN.
2. Navigate to the plan.
3. Verify VP comment visible.
4. Click "Publish."
5. Verify plan status changes to PUBLISHED.
6. Verify participant notifications sent.

---

## Edge Cases to Test

- [ ] Submit plan with no participants → error shown
- [ ] Try to publish without approval → publish button disabled
- [ ] Two overlapping plans for same participant → warning displayed
- [ ] Edit a PUBLISHED plan → new draft version created; original stays published
- [ ] California participant with clawback rule → legal warning displayed

---

## Pass Criteria

- [ ] Plan created correctly in DRAFT with all rule configs
- [ ] Tiered progressive tiers stored correctly in JSON config
- [ ] Status transitions: DRAFT → REVIEW → APPROVED → PUBLISHED
- [ ] AuditLog entry created at each transition
- [ ] Participants notified on PUBLISHED
- [ ] Plan document preview matches plan rules
- [ ] Plan versioning: each save creates an immutable version
