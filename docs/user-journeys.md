# SmartCommission — User Journeys

---

## 1. Plan Admin: Design and Publish a Compensation Plan

**Actor:** Plan Admin (ADMIN role)
**Trigger:** A new fiscal year or quarter begins; a sales role changes; a new product is launched; the existing plan needs to be revised.
**Goal:** Create, get approval for, and publish a new compensation plan so that eligible reps are on the correct plan for the new period.
**Platforms:** Web

### Happy Path

1. Admin navigates to `/plans` and clicks "New Plan."
2. Step 1 — Basic info: Admin enters plan name ("AE New Business FY26 Q3"), selects plan type (COMMISSION), sets effective dates (July 1 – September 30, 2026), and selects the payout currency (AUD).
3. Step 2 — Participants: Admin searches for and adds eligible users. Can add by individual, by role, or by territory. Sets OTE and target commission for each participant.
4. Step 3 — Rules: Admin clicks "Add Rule." Selects "Tiered Progressive Commission." Configures four tiers: 0–50% attainment = 0%, 51–100% = 5%, 101–125% = 8%, 126%+ = 12%. Adds an accelerator multiplier: 2× above 150%.
5. Step 4 — Caps & Floors: Admin adds a monthly cap of AUD 40,000 (hard cap — payout truncated at this amount). Adds a minimum guarantee floor of AUD 2,000 (draws against future earnings if earnings fall below).
6. Step 5 — Clawbacks: Admin adds a clawback rule: if a customer cancels within 90 days of close, recover 100% of the commission paid on that deal.
7. Step 6 — Payment schedule: Admin selects "Monthly" with payment on the 15th of the following month.
8. Step 7 — Review: System shows a full summary of the plan. Admin previews the plan document that reps will see.
9. Admin clicks "Submit for Approval." Plan status changes to REVIEW.
10. The configured approver (VP Sales) receives an email notification: "A new compensation plan requires your approval."
11. VP Sales reviews the plan in `/plans/:id`, adds a comment ("Increase accelerator threshold to 160% per Q2 feedback"), and approves. Plan status changes to APPROVED.
12. Admin returns to the plan, sees the VP's comment, acknowledges it, and clicks "Publish." Plan status changes to PUBLISHED.
13. All participants receive an in-app notification: "Your compensation plan for Q3 FY26 has been published. Please review and acknowledge."
14. The plan is live and will be used in the next calculation run.

### Edge Cases

| Situation | Behaviour |
|---|---|
| Admin submits a plan with no participants | Validation error: "A plan must have at least one participant before it can be submitted for approval." |
| Admin tries to publish without approval | Publish button is disabled with tooltip: "This plan requires approval before it can be published." |
| Two plans overlap for the same participant | System warns: "User Jane Smith already has an active plan (AE Q2 2026) overlapping with this date range. Review participant assignments." |
| Effective date is in the past | System warns: "Effective date is in the past. This plan will be applied retroactively — a retroactive calculation run will be triggered on publish." |
| Approver is out-of-office with delegation set | Notification sent to the delegate approver. Original approver sees a "delegated" badge on the plan. |
| Admin edits a PUBLISHED plan | Editing creates a new draft version. The current published version remains live until the new version is published. |

### Error States

| Error | Message / Behaviour |
|---|---|
| Session expired during wizard | Form state saved as draft in localStorage. On re-login, banner: "You have an unsaved plan draft. Resume?" |
| Approval chain not configured | "Approval workflow is not configured for your organisation. Contact your SmartCommission administrator." |
| Participant not found | Search returns "No users found matching '[name]'. Ensure the user has been added to your organisation." |

---

## 2. Sales Rep: View My Earnings and Commission Statement

**Actor:** Sales Rep (REP role)
**Trigger:** Rep wants to check their current period earnings, verify a deal was credited, or download a statement.
**Goal:** Understand exactly how much commission has been earned, which deals contributed, and download a formal statement.
**Platforms:** Web (mobile-responsive)

### Happy Path

1. Rep logs into SmartCommission and is taken directly to `/portal` — their personal earnings dashboard.
2. Dashboard shows: current period name (e.g. "July 2026"), attainment gauge at 87% (amber), YTD earnings $42,310 AUD, and "Next estimated payment: AUD 6,450 on 15 Aug 2026."
3. Rep clicks "This Period" to see a breakdown: 3 deals credited, total credited revenue AUD 890,000, against quota of AUD 1,020,000 (87.3% attainment), gross commission AUD 44,500, less holdback AUD 4,450 (10% held pending 90-day milestone), net earnings AUD 40,050.
4. Rep clicks on a deal ("Acme Corp — $220,000 AUD") to see the deal-level detail: credit type PRIMARY, credit percentage 100%, amount credited AUD 220,000, tier applied "51–100%: 5%", commission earned AUD 11,000.
5. Rep clicks "View Calculation" and sees the full audit trail: step-by-step log of how the $11,000 was calculated — every rule that fired, every value used.
6. Rep navigates to "Statements" and sees all prior period statements listed. Clicks "July 2026 Statement" to download a PDF.
7. The PDF shows: rep name and ID, period, plan name, quota, actual, attainment %, deal list with individual commissions, adjustments, gross earnings, holdback, draw deduction (if any), net earnings, and payment date.

### Edge Cases

| Situation | Behaviour |
|---|---|
| Calculation run hasn't run yet this period | Dashboard shows "Calculation pending — projected earnings: AUD ~38,000" in a dashed-border card labelled "Projected." |
| Rep has a negative earnings balance (draw recovery) | Net earnings shown in red. Tooltip: "A draw recovery of AUD 1,200 has been applied. Your advance draw balance is AUD 0." |
| Rep hasn't acknowledged their plan | Banner above portal: "You must acknowledge your compensation plan before viewing full earnings detail. Acknowledge now →" |
| Rep changes organisations (admin adjusts their org assignment) | Rep's historical earnings remain accessible; new org's portal is available. Cross-org data is never mixed. |
| Multi-currency deal in USD for an AUD-paid rep | Deal shown as USD 150,000 (AUD 225,000 at rate 1.50 on 2026-07-01). Commission shown in AUD. Rate and conversion date visible in deal detail. |

### Error States

| Error | Message / Behaviour |
|---|---|
| Portal unavailable (server error) | "Earnings data is temporarily unavailable. Please try again in a few minutes. If the issue persists, contact support." |
| Deal shows $0 commission unexpectedly | "This deal was processed but earned $0 commission. This may be because it fell below your minimum attainment threshold for this period. View the audit trail for details." |
| PDF generation timeout | "Statement is taking longer than usual to generate. We'll email it to you when ready." |

---

## 3. Sales Rep: Submit a Dispute on a Calculated Commission

**Actor:** Sales Rep (REP role)
**Trigger:** Rep believes a deal was credited incorrectly — wrong amount, wrong split, missing deal, or wrong rate applied.
**Goal:** Submit a formal dispute and track it to resolution.
**Platforms:** Web

### Happy Path

1. Rep is viewing their earnings for the period and notices that Deal "TechCorp Renewal" shows a commission of AUD 3,200 but they expected AUD 6,400 (they believe the split was wrong — they should have received 100%, not 50%).
2. Rep clicks the three-dot menu on that earnings line and selects "Dispute this commission."
3. Dispute form opens pre-populated with: period, plan, and the transaction reference.
4. Rep selects dispute category: "Wrong split / credit allocation."
5. Rep describes the issue: "I was the primary AE on this renewal — the split should be 100% to me. The 50/50 split appears to be an error as the overlay CSM (John Smith) was not involved in this renewal."
6. Rep attaches evidence: a screenshot of the email from their manager confirming they owned the renewal independently.
7. Rep submits. System creates a dispute with reference DIS-2026-0042. Status: OPEN. SLA deadline: 5 business days.
8. Rep's manager (Sarah Lee) receives an email notification: "A commission dispute has been submitted by Alex Chen for your review. Reference: DIS-2026-0042."
9. Sarah reviews the dispute in `/disputes`. She checks the original credit allocation in the system, confirms Alex was the sole owner, and approves the dispute with notes: "Confirmed — this renewal was Alex's solo. Split was applied in error. Approve adjustment."
10. Dispute moves to FINANCE_REVIEW. Finance receives notification.
11. Finance reviews, confirms the adjustment amount (AUD 3,200 additional commission), and resolves the dispute as APPROVED. A manual payment adjustment is created for the next payment run.
12. Alex receives notification: "Your dispute DIS-2026-0042 has been resolved. An adjustment of AUD 3,200 has been added to your next payment." Dispute status: RESOLVED.
13. Adjustment appears in Alex's portal earnings with a "Dispute Adjustment" label.

### Edge Cases

| Situation | Behaviour |
|---|---|
| SLA deadline breached by manager | System sends escalation email to manager's manager. Dispute flagged in red in the Finance queue. |
| Rep submits a dispute on an already-paid period | Dispute accepted. Adjustment will be applied to the next payment run. Note shown: "This period's payment has already been processed. Approved adjustments will be included in your next payment." |
| Duplicate dispute submitted (same transaction, same period) | System warns: "A dispute for this transaction is already open (DIS-2026-0039). Please track the existing dispute." |
| Dispute denied by Finance | Rep receives notification: "Your dispute DIS-2026-0042 has been denied. Reason: The 50/50 split was agreed in the Q3 overlay plan signed by your manager on 2026-06-01." Rep can reply with additional evidence for reconsideration. |
| Manager has no delegate and is out-of-office | System escalates to the manager's manager after 2 business days with no action. |

### Error States

| Error | Message / Behaviour |
|---|---|
| Evidence file too large | "Attachment must be under 10 MB. Please compress the file and try again." |
| Dispute submitted after the cut-off period | "Disputes for this period closed on 2026-08-15. Please contact Finance directly for late disputes." |

---

## 4. Finance: Run the Monthly Commission Payment

**Actor:** Finance team member (FINANCE role)
**Trigger:** End of month — the calculation run for the period has completed and Finance needs to review, approve, and export the payment file to payroll.
**Goal:** Verify all earnings, identify and resolve exceptions, approve the payment run, and export to payroll.
**Platforms:** Web

### Happy Path

1. Finance receives notification: "June 2026 calculation run completed. 47 earnings records produced. 3 exceptions flagged for review."
2. Finance navigates to `/calculations` and opens the June 2026 run. Reviews the summary: total earnings AUD 342,000 across 47 reps.
3. Finance clicks "Exceptions" to review the 3 flagged anomalies: (a) Rep Ben Carter: payout AUD 48,200 — 320% above his trailing average. (b) Rep Sara Ng: payout AUD 0 — 12 transactions processed but no earnings (possible floor rule issue). (c) Rep Tom Lee: negative earnings (-AUD 400) after draw recovery.
4. Finance investigates Ben's exception: clicks "View audit trail" and sees Ben closed a single enterprise deal worth AUD 2.1M in June. Payout is correct — the anomaly is explained by the deal size. Finance marks exception as "Reviewed — no action required."
5. Finance investigates Sara's exception: audit trail shows her quota was set to AUD 5M but her actual was AUD 1.9M (38% attainment) — below the 50% threshold to earn any commission. This is correct per the plan. Finance marks as "Reviewed — correct per plan."
6. Finance investigates Tom's exception: draw balance of AUD 400 remained from prior month, fully recovered this month. Correct. Finance marks as "Reviewed — no action required."
7. Finance navigates to `/payments` and clicks "Create Payment Run" for June 2026. System pre-populates from the approved earnings records. Run summary: 47 payments, AUD 342,000 total.
8. Finance reviews individual payments. Notices Rep Mike Walsh is on payment hold (flagged by HR — employment dispute). Finance confirms hold is still applicable, leaves hold in place. Mike's payment excluded from this run.
9. Finance clicks "Approve Payment Run." Run status: APPROVED.
10. Finance clicks "Export to Payroll" and selects format: Xero. System generates the payroll file and marks run as EXPORTED.
11. Finance uploads the file to Xero. After payroll processes, Finance returns to SmartCommission and marks the run as PAID, entering the Xero payment reference number.
12. All reps receive notification: "Your June 2026 commission payment of AUD [amount] has been processed."

### Edge Cases

| Situation | Behaviour |
|---|---|
| Finance tries to approve a run with unresolved exceptions | Warning banner: "3 exceptions have not been reviewed. You can still approve, but unreviewed exceptions will be noted in the audit log." Finance must confirm they want to proceed. |
| Two Finance users try to approve the same run simultaneously | Optimistic locking: second approver sees "This payment run was just approved by [name]. Refresh to see the latest status." |
| Calculation run for the period hasn't been run yet | "No calculation run found for June 2026. Run the period-close calculation first." Link to `/calculations/new`. |
| Export file format incompatible with payroll system version | Finance sees an error after attempting to import in Xero: returns to SmartCommission, opens a support ticket. Payroll export format versioning documented in runbook. |

### Error States

| Error | Message / Behaviour |
|---|---|
| Cloud Storage unavailable during export | "Unable to generate export file. Please try again. If the issue persists, download as CSV and import manually." |
| Earnings record for a rep is in DISPUTED status | Payment for that rep is automatically held. Finance sees: "Payment held: open dispute DIS-2026-0042. Resolve dispute before releasing payment." |

---

## 5. Manager: Review Team Attainment and Forecast

**Actor:** Sales Manager (MANAGER role)
**Trigger:** Ongoing (daily/weekly review); triggered by approaching quarter-end or a management meeting.
**Goal:** Understand which reps are on track, which are at risk, and what the projected commission expense will be for the period.
**Platforms:** Web

### Happy Path

1. Manager logs in and is taken to `/dashboard` — their team view.
2. Dashboard shows a table of all 8 direct reports with: name, quota (AUD), YTD actual (AUD), attainment %, projected full-period attainment, earnings to date (AUD), last deal closed date.
3. Manager sees 3 reps above 100% (green), 3 between 50–99% (amber), and 2 below 50% (red).
4. Manager clicks on a red rep (James Park, 31% attainment) to open his detail view: quota AUD 800K, actual AUD 248K, 3 deals closed, next deal in pipeline $150K (60-day weighted). Projected full period: 51%.
5. Manager sees the "Pipeline-to-commission" projection: if all pipeline deals close at their weighted probability, James will end the quarter at 55% attainment — below the threshold to earn accelerated commission.
6. Manager uses the "What if" button to model: "If James closes the $150K deal and one more at $100K" — projected earnings change from AUD 12,400 to AUD 28,500. Manager uses this insight for the 1:1 coaching conversation.
7. Manager navigates to "Team Forecast" tab: see the total projected commission expense for all 8 reps. Actual to date: AUD 180,000. Projected: AUD 295,000. Budget: AUD 310,000. On track.
8. Manager exports the team attainment report as a PDF for the quarterly business review deck.

### Edge Cases

| Situation | Behaviour |
|---|---|
| Manager has no direct reports configured | Dashboard shows empty state: "No direct reports found. Contact your administrator to set up your reporting hierarchy." |
| A rep's quota has been revised mid-period | Attainment % shown with a footnote: "Quota revised on 2026-06-15 (was AUD 1.2M, now AUD 900K). Attainment calculated against revised quota." |
| Pipeline data is stale (CRM sync failed overnight) | Yellow banner: "Pipeline data was last synced 36 hours ago. Projections may be outdated. Check integration status." |
| Manager tries to view another manager's team | Returns their own team only. 403 if they attempt to access a direct URL for another manager's report. |

### Error States

| Error | Message / Behaviour |
|---|---|
| Manager role not assigned to any users yet | "Your manager hierarchy is not yet configured. Reports will appear here once your administrator assigns direct reports to your account." |
| Report export times out | "Report generation is taking longer than expected. We'll email you the PDF when it's ready." |

---

## 6. System: Nightly Calculation Run

**Actor:** System (automated, no human trigger required)
**Trigger:** Cloud Scheduler triggers nightly at 02:00 AEST (daily).
**Goal:** Process all new and changed transactions since the last run; update earnings projections for all active reps; flag anomalies; send relevant notifications.
**Platforms:** Backend (no user interaction during run)

### Happy Path

1. Cloud Scheduler fires at 02:00 AEST. Publishes a `calculation.run.delta` message to the Cloud Tasks queue.
2. Calculation worker picks up the job. For each active organisation:
   a. Creates a new `CalculationRun` record (type: DELTA, status: RUNNING).
   b. Identifies all transactions with `createdAt` or `updatedAt` > last run's `completedAt`.
   c. Identifies all affected reps (those with CreditAllocations on the changed transactions).
   d. For each affected rep: retrieves active plan and rules, retrieves period quota, calculates gross earnings, applies adjustments, writes a new `EarningsRecord` (or updates existing one if period is still open), writes the step-by-step audit trail.
   e. Runs anomaly detection on all new/updated EarningsRecords. Flags outliers.
   f. Updates CalculationRun: status COMPLETED, transactionsProcessed, earningsCreated, errorsCount.
3. System sends "Calculation run completed" notification to ADMIN and FINANCE roles.
4. Any anomalies flagged are sent to the Finance exception queue with details.
5. Portal earnings for affected reps are refreshed (cache invalidated). Reps who check their portal will see up-to-date figures marked as "PROJECTED" (not yet period-close confirmed).
6. Total run time for a typical org (10K transactions/month): under 3 minutes.

### Edge Cases

| Situation | Behaviour |
|---|---|
| No new transactions since last run | Calculation run completes immediately with 0 transactions processed. No notifications sent (to avoid alert fatigue). |
| Transaction references a plan that has been archived | Transaction flagged as an exception: "No active plan found for [rep] at close date [date]." Added to exception queue. Run continues for other transactions. |
| A rep's quota for the current period has not been set | Earnings calculated as "no quota assigned — attainment cannot be calculated." Flat-rate rules (not quota-dependent) still fire. Exception flagged to ADMIN. |
| Run takes >30 minutes (SLA breach) | Cloud Monitoring alert fires. On-call engineer receives PagerDuty notification. Run continues unless manually cancelled. |
| Cloud SQL connection failure mid-run | Worker retries 3 times with exponential backoff. If still failing, run status set to FAILED. ADMIN and FINANCE notified. Run can be manually retriggered from the UI. |
| Exchange rate not found for a transaction's currency | Transaction flagged as exception. Run continues for other transactions. FINANCE notified: "Exchange rate for AUD→JPY on 2026-07-14 not found. Please manually set a rate or the transaction will be excluded from this period's calculation." |

### Error States

| Error | Message / Behaviour |
|---|---|
| All calculation runs for an org failing for 3+ consecutive nights | System sends escalation alert to SUPER_ADMIN. Org's ADMIN also notified with support ticket ID. |
| Calculation engine version mismatch (deployment during run) | The in-flight run uses the version it started with (stateless worker, image tag pinned at job dispatch time). New runs after deployment use the new engine version. |
