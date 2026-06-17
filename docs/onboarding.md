# SmartCommission — Onboarding

Last reviewed: 2026-06-18

---

## Goal

Get every new admin to their **first value moment** within the first session — completing their first calculation run successfully and seeing calculated earnings for at least one rep.

**First value moment:** "First commission calculation run completes successfully and the admin sees earnings records for their reps."

**Target time-to-first-value:** ≤ 30 minutes from account signup.

**Why this matters:** SmartCommission solves a data problem (commission calculations). Until the user sees a real calculation run with their own plan and data, the product is abstract. The calculation run is the "aha" moment — it replaces the spreadsheet. Everything before it is setup. Everything after it is value delivery.

---

## Onboarding Principles

1. **Minimal friction** — ask only what's needed to get to the first calculation. Defer optional configuration (advanced clawbacks, complex territory setups, integrations) until the core is working.
2. **Progressive disclosure** — the platform has many features; show them in context as the user reaches the relevant step.
3. **Immediate value** — show the product working as early as possible. The onboarding wizard has a "preview calculation" step before any data is imported, using sample data.
4. **Clear next action** — every onboarding step has exactly one primary CTA.
5. **Contextual help** — tooltips on plan builder fields explain ICM concepts (e.g. "What is a draw?" or "What's the difference between tiered progressive and tiered retroactive?"). No walls of text before the product.
6. **Admin-led setup** — the onboarding journey is admin-led. Reps receive a separate portal invitation once the admin has published a plan and run the first calculation.

---

## Signup Flow

### Steps

| Step | What we ask | Why we need it | Can it be skipped? |
|---|---|---|---|
| 1 | Email + password OR Google OAuth | Authentication | No |
| 2 | Full name | Personalisation of onboarding and plan documents | No |
| 3 | Organisation name | Creates the org; all data scoped to it | No |
| 4 | Country / primary currency | Sets the base currency for all calculations | No |
| 5 | Team size (number of sales reps) | Selects the right onboarding track (< 10 / 10–50 / 50–200 / 200+) | Yes — defaults to "1–10" |
| 6 | "What's your main commission challenge?" (radio: replacing spreadsheets / setting up a new team / migrating from another tool / just exploring) | Personalises onboarding flow and email sequence | Yes |

### Signup page checklist
- [ ] Google OAuth sign-in to reduce friction
- [ ] "No credit card required" prominent
- [ ] Password strength indicator
- [ ] Link to privacy policy and terms at bottom
- [ ] Clear error messages per field (not "invalid input")
- [ ] Email confirmation: skip for Google OAuth (trust established); send verification email for email/password signups, but allow access to onboarding wizard before verification (prompt to verify with a non-blocking banner)

---

## In-App Onboarding Flow (Admin)

### Onboarding Wizard — 6 Steps

After signup, the admin is taken to a step-by-step onboarding wizard at `/onboarding`. Progress is persisted — the admin can leave and return to where they left off.

#### Step 1 — Invite your team (or skip)

"Add the people you'll be tracking commissions for."
- Search bar: type name or email to add users
- Bulk invite: enter email addresses (comma-separated)
- Upload a roster CSV: name, email, role, manager
- Skip option: "I'll add my team later — continue with sample data"

**Best practice:** Allow admins to continue with sample reps (pre-populated with 3 fictional reps) if they want to test the platform before committing to importing their full team. This is how CaptivateIQ reduces early drop-off.

#### Step 2 — Create your first plan (simplified wizard)

"Let's build your first compensation plan. Start with the basics — you can always add more complexity later."

Simplified plan builder: fewer options than the full `/plans/new` flow. Wizard presents:
- Plan name (pre-filled: "[Org] Sales Commission Plan FY26")
- Commission type: "Commission on closed deals" (pre-selected), "Bonus", or "MBO"
- Simple rate: "Pay [X]% commission on every deal closed" — single flat rate input
- A toggle to "Add tiers (advanced)" that expands to the tiered configuration
- Quota: "Do you work to quotas?" Yes/No → if Yes, set a default monthly quota
- Participants: assign to all users added in Step 1 (or all 3 sample reps)

**Design principle:** Default to the simplest possible plan. A flat 5% commission plan is enough to demonstrate value. The admin can return to `/plans/:id` to add complexity after seeing the first calculation run.

#### Step 3 — Import your transactions (or use sample data)

"Now let's load some deals to calculate commissions on."

Options presented:
1. **Use sample data (recommended for first run)** — pre-loaded with 5 sample closed deals from the current month, distributed across the sample reps. Gets to first value moment fastest.
2. **Upload a CSV** — download the CSV template, fill in deal data, upload.
3. **Connect your CRM** — shortcut to the integrations setup (Salesforce, HubSpot, Pipedrive). A 15-minute setup that pulls live deals. Only shown for orgs > 10 reps (smaller orgs are guided to CSV).

A helper callout explains: "You can always connect your CRM later. For now, sample data or a CSV is the fastest path to your first calculation."

#### Step 4 — Run your first calculation

"Your plan is set. Your deals are in. Let's calculate your first commissions."

A single large "Run calculation" button with a brief explanation:
> "SmartCommission will apply your plan rules to each deal and calculate how much each rep earned this month. This takes a few seconds."

On click: animated progress (3–5 seconds for sample data). Then: success state showing a summary card per rep: "Alex Chen — AUD 6,240 earned on 2 deals at 87% attainment."

**This is the first value moment.** The animation and the summary card are designed to be satisfying — a mini-celebration (confetti animation, green check). The admin immediately understands what the platform does.

#### Step 5 — Review the results

"Here's what SmartCommission calculated. Let's check a deal together."

Highlights:
- Shows the summary card for each rep
- Prompts the admin to click on one rep to see the deal-level breakdown
- Highlights the audit trail: "Click 'View calculation' to see exactly how this commission was calculated — step by step. Every rep can see this in their portal."
- Shows the attainment gauge: "This is what your reps will see in their portal."

A tooltip appears on the audit trail: "This is SmartCommission's transparency advantage. No black box — every rep and auditor can trace every number."

#### Step 6 — Invite your reps to the portal

"Your reps can now log in and see their own earnings in real time."

- Button: "Send portal invitations" — sends an email to all participants with a magic link to their portal.
- Preview: shows a mockup of what the rep portal looks like with their calculated earnings.
- Toggle: "Require plan acknowledgment before reps can view earnings" — explained with tooltip.

After completing Step 6, admin is taken to `/dashboard` — their main workspace. The onboarding wizard is replaced by a "Getting started" checklist in the sidebar (see below).

---

### Getting Started Checklist (Post-Wizard)

Persistent checklist in the left sidebar nav, collapsed by default after first week:

| Step | Trigger | Status |
|---|---|---|
| Create your first plan | Plan published | ✅ Done |
| Import or connect your deals | First transaction in system | ✅ Done |
| Run your first calculation | First calculation run completed | ✅ Done |
| Invite your reps | First rep portal invitation sent | ✅ Done |
| Connect your CRM | Active integration configured | ⬜ Optional |
| Set up your quotas | Quota created for at least one rep | ⬜ Recommended |
| Configure your payment schedule | Payment schedule set | ⬜ Recommended |
| Publish your plan to reps | Plan status = PUBLISHED | ✅ Done |

Progress bar: 4/8 complete → 50% → fill to 100% over first 2 weeks.

---

### Tooltips & Contextual Help

ICM terminology is specialist — many admins may be new to formal commission plan design. Contextual tooltips are provided on all non-obvious terms:

| Term | Tooltip |
|---|---|
| Tiered progressive | "Reps earn different rates for different slices of their attainment. E.g. 0–50%: 0%, 51–100%: 5%, 101%+: 8%. Each tier applies only to the revenue within that range." |
| Tiered retroactive | "Once a rep crosses an attainment threshold, the new rate applies to ALL their revenue, not just the incremental amount. More motivating, but higher cost at the top." |
| Accelerator | "A multiplier that increases the commission rate above 100% attainment. E.g. 2× above 125% means the rep earns double their base rate on all revenue above 125% of quota." |
| Draw against commission | "An advance payment to the rep, recovered from future earnings. Recoverable = the rep must pay back the advance; Non-recoverable = the advance is a floor guarantee with no recovery." |
| Clawback | "If a customer cancels or doesn't pay, you can recover (claw back) previously paid commissions. Enforceability varies by jurisdiction — see Legal compliance." |
| ASC 606 | "US accounting standard for revenue recognition. Commissions paid to acquire a contract may need to be capitalised and amortised over the contract term rather than expensed immediately." |

---

## Post-Signup Email Sequence (Admin)

### Welcome email (sent immediately)
- Subject: "Your SmartCommission account is ready — let's calculate your first commission"
- Body: Personal welcome, one-liner value reminder, link to the onboarding wizard with a progress indicator ("You're on step 2 of 6"), link to getting-started guide.

### Day 1 — if wizard not completed
- Subject: "Your first commission calculation is one click away"
- Body: "You've created your account but haven't run your first calculation yet. It takes about 15 minutes — here's exactly what to do." Link to resume wizard.

### Day 3 — activation nudge (if no calculation run)
- Subject: "Still setting up? Here's a shortcut"
- Body: "Try with our sample data — you'll see a working commission calculation in 30 seconds. No data entry required." CTA: "Calculate with sample data."

### Day 7 — feature highlight
- Subject: "One thing SmartCommission does that spreadsheets never could"
- Body: Highlight the calculation audit trail — "every rep can see exactly how their commission was calculated. This alone eliminates 80% of commission disputes." CTA: View an interactive demo.

### Day 14 — rep portal highlight
- Subject: "Have your reps seen their earnings yet?"
- Body: "Your reps can log in today and see their earnings in real time — no more end-of-month statements. Send them their portal invite." CTA: "Invite your reps."

### Day 30 — trial/upgrade prompt (if not upgraded)
- Subject: "Your SmartCommission trial ends in 7 days"
- Body: Summary of what they've accomplished (calculations run, reps invited, deals processed). Upgrade prompt with pricing comparison. "Lock in your annual rate — 2 months free."

---

## Post-Signup Email Sequence (Rep — portal invitation)

### Portal invitation email (sent when admin invites a rep)
- Subject: "[Manager Name] has given you access to your commission earnings"
- Body: "You now have real-time visibility into your commissions. See exactly which deals paid what, track your quota attainment, and model what you'll earn if you close more deals." CTA: "View my earnings" (magic link).

### Day 3 — if rep hasn't logged in
- Subject: "Your commission dashboard is waiting for you"
- Body: Preview screenshot of the attainment gauge and earnings breakdown. "Log in to see your real numbers." CTA: "View my earnings."

---

## Rep Portal Onboarding (First Login)

1. Rep follows magic link → lands on `/portal`.
2. If plan acknowledgment is required: full-screen acknowledgment screen — plan document, e-sign button. Cannot proceed without acknowledging.
3. After acknowledgment: portal dashboard appears. First-time tooltip sequence (max 4 steps, dismissible): (1) "This is your attainment gauge — it updates every day." (2) "Click any deal to see exactly how your commission was calculated." (3) "Use the What-If calculator to model your potential earnings." (4) "If something looks wrong, submit a dispute here."
4. Tooltips dismissed — portal in full use.

---

## Help & Support

| Channel | Description | Response SLA |
|---|---|---|
| In-app live chat | Intercom (or Crisp) chat widget, visible to admins in setup flow | < 2 hours during business hours |
| In-app feedback | "Give feedback" button in nav | Async; reviewed weekly |
| Email support | support@smartcommission.app | 24 hours weekdays, 48 hours weekends |
| Help centre | Intercom-powered help docs at `help.smartcommission.app` | Self-serve |
| Status page | `status.smartcommission.app` | Real-time |

### Help doc coverage (minimum at launch)
- [ ] Getting started guide (mirrors onboarding wizard steps)
- [ ] "How to build a compensation plan" (with example plan for each type)
- [ ] "How to import transactions from CSV" (with template download)
- [ ] "How the calculation engine works" (explain tiered, accelerators, splits)
- [ ] "How to run a payment run" (for Finance users)
- [ ] "How to submit a dispute" (for reps)
- [ ] FAQ: top 15 questions from beta users
- [ ] Troubleshooting: calculation run failed; CRM sync not working; rep can't access portal
- [ ] Account management: how to add/remove users; how to cancel; how to export all data

---

## Onboarding Metrics

| Metric | Current | Target | Notes |
|---|---|---|---|
| Signup completion rate (started → completed) | — | ≥ 85% | Short form; OAuth reduces drop-off |
| Wizard completion rate (signup → first calc run) | — | ≥ 55% | "Sample data" option is key to hitting this |
| Time to first calculation run | — | ≤ 30 min | Target for median admin |
| Day-1 return rate (returned same day or next day) | — | ≥ 50% | ICM setup is often multi-session |
| Day-7 retention | — | ≥ 40% | High — ICM tools are used daily once set up |
| Day-30 retention | — | ≥ 30% | By 30 days, most committed customers are locked in |
| Activation rate (reached first calculation run) | — | ≥ 55% | Primary activation metric |
| Rep portal activation rate (rep logged in after invite) | — | ≥ 70% | Reps are motivated to check their earnings |
| Onboarding checklist completion (8/8 steps) | — | ≥ 30% | Full setup takes 2–4 hours; many will stop at step 4 |

---

## Onboarding Review Checklist

Review monthly:
1. Check wizard drop-off by step — identify the biggest exit step and address the friction
2. Check activation rate — is the sample data shortcut being used? Is it sufficient?
3. Review support tickets from admins in their first 7 days — recurring confusion points
4. Review welcome email open and click rates
5. Test the full signup-to-first-calculation flow in an incognito window (fresh experience)
6. Review rep portal invitation acceptance rate
