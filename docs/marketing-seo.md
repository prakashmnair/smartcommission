# SmartCommission — Marketing & SEO

Last reviewed: 2026-06-20

---

## Goals

- Acquire Sales Operations and Revenue Operations leaders at companies with 50–500 sales reps as paying customers
- Achieve 50 paying organisations within 12 months of launch
- Grow to 500 organisations by end of Year 2
- Target MRR of AUD 250K by end of Year 1
- Achieve NPS ≥ 50 (world-class category; competitors like Xactly struggle to break 30)

---

## Target Audience

| Segment | Description | Primary pain point | Channel |
|---|---|---|---|
| Primary | Sales Operations / Revenue Operations leaders (VP, Director, Manager) at SaaS and tech companies with 50–500 sales reps | Spreadsheet-based commission tracking is error-prone, opaque, and unsustainable at scale. Existing tools are too expensive or too complex to implement. | Google Ads (branded search vs competitors), LinkedIn targeting, G2/Capterra reviews |
| Secondary | CFOs and VP Finance at mid-market companies | Commission expense is material; no reliable system for accruals, audit trail, or SOX controls. | LinkedIn, CPA/finance industry publications |
| Tertiary | Sales reps (individual contributors) | No visibility into their earnings until the commission statement arrives. Disputes take weeks. "Black box" calculations erode trust. | Product virality — reps who love the portal bring SmartCommission to their next company |
| Influencer | Salesforce / HubSpot ecosystem consultants and RevOps consultants | Their clients ask them for ICM tool recommendations. | Partner program, revenue share |

---

## Value Proposition

**One-liner:** "Calculate, manage, and pay commissions accurately — in minutes, not days."

**Tagline:** "Commission confidence for your entire revenue team."

**Extended pitch for Sales Ops leaders:**
> Most teams run commissions in spreadsheets or cobble together a legacy ICM tool that costs $100K/year to implement and still requires a dedicated admin to maintain. SmartCommission gives you a modern, self-serve commission platform that your team can configure in an afternoon — with a rule-based calculation engine that's transparent enough for every rep to trust, and audit-ready enough for your Finance team to sign off on.

**Extended pitch for reps (portal focus):**
> Stop guessing what your commission check will be. SmartCommission gives you real-time visibility into your earnings, shows you exactly which deals paid what and why, and lets you model your own "what-if" scenarios. No more waiting for the end-of-month statement to find out if you missed target.

---

## Competitive Positioning

| Competitor | Their strength | Their weakness | SmartCommission's differentiator |
|---|---|---|---|
| SAP Commissions (CallidusCloud) | Enterprise depth, SAP ERP integration | 6–18 month implementation, $500K+ ACV, requires a dedicated admin team | Self-serve setup in < 1 day; modern UX; 10× lower TCO |
| Xactly | Market leader, strong AI features, Salesforce-native | Enterprise pricing ($150K+ ACV), complex UI, poor NPS (~25) | Transparent calculation engine (every rep sees the math); APAC-first compliance; fair pricing |
| Performio | Strong AU/APAC presence, good UX | Limited formula flexibility; mid-market ceiling; no public API | More flexible rule engine; open API; stronger analytics |
| Varicent | Strong analytics, enterprise | IBM-owned, complex, slow to innovate | Faster product velocity; modern stack; better rep portal UX |
| Spiff (Salesforce) | Modern UX, real-time calculations, SMB-friendly | Salesforce-only acquisition path; limited enterprise depth; limited APAC support | CRM-agnostic; APAC compliance (AU Fair Work, NZ, SG); deeper plan rule flexibility |
| CaptivateIQ | Spreadsheet-like familiarity | Scalability ceiling; spreadsheet model limits auditability; limited integrations | Rule-based engine (auditable, scalable, version-controlled); not a spreadsheet |
| QuotaPath | Simple, affordable, pipeline-connected | Very limited — no complex plan types, no multi-currency, no APAC | Full ICM platform (not just quota tracking); scales with growth |
| Everstage | Good gamification, modern SaaS | Limited enterprise depth; limited APAC support | Deeper compliance (SOX, GDPR); better audit trail; enterprise-ready |

---

## SEO Strategy

### Technical SEO
- [ ] `<title>` and `<meta name="description">` on every page (Next.js `generateMetadata`)
- [ ] OpenGraph tags (`og:title`, `og:description`, `og:image`, `og:url`) on every page
- [ ] Twitter card tags on every page
- [ ] Canonical URLs set to avoid duplicate content
- [ ] `sitemap.xml` generated and submitted to Google Search Console and Bing Webmaster Tools
- [ ] `robots.txt` configured: block `/api/`, `/admin/`, `/superadmin/`, `/portal/`
- [ ] Structured data (JSON-LD) on landing page: `SoftwareApplication` schema with aggregate rating
- [ ] Core Web Vitals: LCP < 2.5s, FID/INP < 100ms, CLS < 0.1
- [ ] Mobile-first design verified in Google PageSpeed Insights
- [ ] HTTPS enforced

### On-Page SEO

| Page | Target keyword | Title | Meta description |
|---|---|---|---|
| Home | commission management software | "SmartCommission — Commission Management Software for Sales Teams" | "Calculate, manage, and pay sales commissions accurately. No spreadsheets. Full audit trail. Trusted by revenue teams of 50–500 reps." |
| Alternatives: Xactly | xactly alternative | "The Best Xactly Alternative in 2026 — SmartCommission" | "Looking for an Xactly alternative? SmartCommission delivers enterprise-grade commission management at a fraction of the cost. Try it free." |
| Alternatives: Performio | performio alternative | "Performio Alternative — SmartCommission for AU/APAC Teams" | "Purpose-built for Australian and APAC sales teams. Compare SmartCommission vs Performio." |
| Alternatives: Spiff | spiff alternative | "Spiff Alternative — SmartCommission Without the Salesforce Lock-In" | "Works with Salesforce, HubSpot, or any CRM. Try SmartCommission free." |
| Feature: Calculation engine | commission calculation software | "Transparent Commission Calculation Engine — SmartCommission" | "Every rep can see exactly how their commission was calculated. Auditable, rule-based, no black box." |
| Feature: Rep portal | sales commission tracker | "Real-Time Commission Tracker for Sales Reps — SmartCommission" | "See your commission earnings in real time. Track attainment vs quota. Model what-if scenarios." |
| Feature: Integrations | salesforce commission management | "Salesforce Commission Management — SmartCommission Integration" | "Sync deals from Salesforce automatically. Calculate commissions in real time. No manual data entry." |
| Pricing | commission software pricing | "SmartCommission Pricing — Plans for Teams of 50 to 500+ Reps" | "Simple, transparent pricing. No surprise implementation fees. Try free for 30 days." |
| Blog | (long-tail, rotating) | Varies | Varies |

### Content Strategy

| Content type | Cadence | Goal | Distribution |
|---|---|---|---|
| Blog posts: ICM best practices | Bi-monthly | Organic search + thought leadership | Site + LinkedIn |
| Comparison pages (vs each competitor) | One-time + update quarterly | Capture competitor-intent searches | Site + Google Ads landing pages |
| Commission plan templates (downloadable) | One-time + update annually | Lead magnet + organic traffic | Site + LinkedIn + email |
| Case studies / customer stories | Quarterly (post-launch) | Trust + conversion | Site + email + LinkedIn ads |
| Webinars: "How to build a world-class commission plan" | Monthly (post-launch) | Lead generation + thought leadership | LinkedIn + email + YouTube |
| "State of Sales Compensation" annual report | Annually | PR + backlinks + brand authority | Site + PR wire + LinkedIn |

### Link Building
- [ ] G2 listing — get 10+ verified reviews in first 90 days post-launch (offer incentive: gift card for a verified review)
- [ ] Capterra listing — same
- [ ] Product Hunt launch (plan for a coordinated launch day)
- [ ] Salesforce AppExchange listing (Phase 3 — after native connector)
- [ ] Guest posts: RevOps.co, Sales Hacker, The RevOps Network
- [ ] Press release for launch — wire to Australian tech press (StartupDaily, TechCrunch AU)

---

## Growth Channels

| Channel | Priority | Status | Owner | Notes |
|---|---|---|---|---|
| Organic search (SEO) | High | Open | Marketing | Focus on competitor alternative pages and feature keywords |
| Google Ads — competitor keywords | High | Open | Marketing | Target "Xactly alternative", "Performio alternative", "commission management software" |
| LinkedIn Ads — RevOps/SalesOps targeting | High | Open | Marketing | Target VP/Director Sales Ops, RevOps Manager, VP Sales at 50–500 employee tech companies |
| G2 / Capterra reviews | Critical | Open | Marketing + CS | Social proof is critical for this category — buyers research heavily on review sites |
| Product Hunt launch | Medium | Open | Marketing | One-time event; drive to free trial |
| Salesforce AppExchange (Phase 3) | High | Open | Marketing + Eng | Major distribution channel for the Salesforce ecosystem |
| RevOps community (RevOps Co-op, Pavilion) | Medium | Open | Marketing | Participate, share value, no hard sell |
| Partner / referral program | Medium | Open | Partnerships | Revenue-share with RevOps consultants who recommend SmartCommission to clients |
| Email marketing | High | Open | Marketing | Nurture trial users to conversion; onboarding sequence |
| Content marketing (blog, templates, reports) | Medium | Open | Marketing | Long-term organic growth channel |

---

## Landing Page Optimisation

### Above the fold
- Headline: "Commission confidence for your entire revenue team."
- Subtitle: "Stop running commissions in spreadsheets. SmartCommission calculates, tracks, and pays sales commissions accurately — with a transparent audit trail every rep can trust."
- Primary CTA: "Start free — no credit card required" (indigo-600 button, prominent)
- Secondary CTA: "Book a demo" (ghost button)
- Hero: screenshot of the rep portal attainment gauge + earnings dashboard

### Social proof
- "Trusted by sales teams at [logos]" — 5–10 company logos (sourced from launch customers)
- G2 star rating (target: 4.8/5 within 6 months)
- Pull quote from a Sales Ops leader customer
- "Calculated $X million in commissions" — social proof metric

### Pricing
- [ ] Pricing page exists at `/pricing`
- [ ] Free tier: 1 plan, up to 5 reps, 3 months free (seed sales teams)
- [ ] Starter: AUD 25/rep/month — up to 50 reps, core features
- [ ] Growth: AUD 45/rep/month — up to 500 reps, integrations, SSO, advanced reports
- [ ] Enterprise: custom — unlimited reps, multi-org, dedicated support, SOC 2
- [ ] Annual billing discount: 2 months free (16.7%)
- [ ] Feature comparison table on pricing page
- [ ] "No implementation fees" prominently stated (vs competitors charging $10K–$50K for implementation)

### Conversion flow

1. Visitor lands on page from Google search (e.g. "xactly alternative" or "commission management software")
2. Reads headline + value prop; sees hero screenshot
3. Sees G2 rating and customer logos (social proof)
4. Clicks "Start free" → signup form (email, name, organisation name)
5. Completes onboarding wizard (< 30 minutes to first calculation)
6. Reaches first value moment: first calculation run completes
7. After 14-day trial: prompted to upgrade; 30-day trial if connected to a CRM integration

### A/B testing opportunities
- Headline: "Calculate commissions in minutes" vs "Commission confidence for your entire revenue team"
- CTA text: "Start free" vs "Get started free" vs "Try it free"
- Social proof placement: above vs below fold
- Hero image: rep portal screenshot vs calculation audit trail vs team dashboard

---

## Email Marketing

| Sequence | Trigger | Emails | Goal |
|---|---|---|---|
| Welcome sequence (admin) | Admin signup | 5 over 7 days | Get to first calculation run; activate |
| Welcome sequence (rep) | Rep invited to portal | 2 over 3 days | Portal activation; view earnings |
| Activation nudge (admin) | No calculation run after 5 days | 2 emails | Drive first calculation run |
| Integration nudge | Signed up but no CRM connected after 7 days | 1 email | Drive CRM connection |
| Trial conversion | Trial expiring in 7 days | 3 emails: 7 days before, 2 days before, day of expiry | Convert to paid |
| Win-back | No login for 21 days | 2 emails | Re-engage; highlight new features |
| Monthly newsletter | Monthly (paying customers) | 1/month | Retention; feature adoption; upsell |
| Annual benchmark report | Annually | 1 email | Thought leadership; low-churn signal |

Tools: Resend (transactional) + customer.io or Loops (lifecycle / marketing)

---

## Analytics & KPIs

### Setup
- [ ] Google Analytics 4 installed and configured
- [ ] Google Search Console verified and sitemap submitted
- [ ] Conversion goals in GA4: signup completed, first calculation run, CRM connection, upgrade to paid
- [ ] Funnels: landing → signup → onboarding → first calculation → paid
- [ ] G2 review tracking

### Key Metrics

| Metric | Current | Target (12 months post-launch) | Notes |
|---|---|---|---|
| Monthly organic search clicks | — | 5,000 | Build through SEO content strategy |
| Signup conversion rate (visitor → registered) | — | ≥ 8% | ICM is high-intent category; expect higher than average |
| Activation rate (registered → first calculation run) | — | ≥ 55% | First calc run = first value moment |
| Trial-to-paid conversion | — | ≥ 25% | High-intent B2B; expect above average |
| Monthly churn rate | — | ≤ 2% | ICM is sticky (data + workflow lock-in) |
| MRR (Month 12 post-launch) | — | AUD 250,000 | ~200 orgs × avg AUD 1,250/month |
| ARPU | — | AUD 1,250/month | Mid-market average: 50 reps × AUD 25/rep |
| NPS | — | ≥ 50 | Excellent; category benchmark is ~25–30 |

---

## Competitor Analysis

| Competitor | Strengths | Weaknesses | Our differentiator |
|---|---|---|---|
| SAP Commissions | Enterprise depth, SAP integration, global | Extreme complexity, $500K+ implementation, requires dedicated admin | 10× lower TCO; self-serve; modern UX |
| Xactly | Market leader, AI features, Salesforce native | Poor NPS (~25), complex UI, expensive, US-centric | Transparent calculation; APAC compliance; better portal UX |
| Performio | APAC presence, good UX, mid-market focus | Limited API/integrations, mid-market ceiling, limited plan flexibility | Open API; stronger enterprise features; better analytics |
| Varicent | Strong analytics, enterprise | IBM-owned, slow, no modern UX | Fast product velocity; modern SaaS stack; better pricing |
| Spiff | Modern UX, Salesforce-native, real-time calc | Salesforce-dependent; limited APAC; limited plan complexity | CRM-agnostic; APAC-first; complex plan support |
| CaptivateIQ | Spreadsheet-familiar, SMB-friendly | Scalability ceiling; limited auditability; limited integrations | Rule-based auditable engine; scales to 500+ reps |
| QuotaPath | Simple, affordable | Quota tracking only; not full ICM | Full ICM platform |
| Everstage | Gamification, modern, growing | Limited enterprise features; limited APAC | SOX/GDPR compliance; deeper audit trail |

---

## Localisation

| Language / Region | Status | Priority |
|---|---|---|
| English (global) | Live | — |
| English (AU/NZ specific) | Live — AU-specific compliance features | High — primary market |
| English (UK specific) | Planned — UK GDPR, PAYE compliance | High — Phase 3 |
| English (US — state law warnings) | Partial — California clawback warnings | High — Phase 2 |
| Simplified Chinese | Blocked — PIPL compliance not achievable | — |
| Japanese | Planned | Low — Phase 4 |
| German | Planned | Low — Phase 4 |

---

## Review Cadence

Marketing and SEO reviewed monthly:
1. Check Google Search Console for new keyword opportunities and crawl errors
2. Review GA4 funnel metrics — identify drop-off points
3. Update KPIs table with current values
4. Identify one A/B test to run
5. Check G2/Capterra review count and rating — request reviews from satisfied customers if below target
6. Ensure no legal/compliance issues with new content (see `legal-compliance.md`)
