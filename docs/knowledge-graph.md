# SmartCommission — Knowledge Graph

Architecture, data model, and feature map for SmartCommission.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Layer"]
        WEB["Next.js App Router\n(Web Browser)"]
    end

    subgraph Auth["Authentication"]
        FBAUTH["Firebase Auth\n(email / Google OAuth / SAML)"]
        SESSION["Session Cookie\n(HttpOnly, Secure)"]
    end

    subgraph AppLayer["Application Layer (Cloud Run)"]
        NEXTJS["Next.js Server\nRoute Handlers + Server Components"]
        MIDDLEWARE["Next.js Middleware\n(Session validation)"]
        CALCENGINE["Calculation Engine\n(Rule-based, deterministic)"]
    end

    subgraph DataLayer["Data Layer"]
        PRISMA["Prisma ORM"]
        CLOUDSQL["Cloud SQL\n(PostgreSQL 15)"]
        RLS["Row Level Security\n(org isolation backstop)"]
    end

    subgraph JobQueue["Background Jobs"]
        CLOUDTASKS["Cloud Tasks Queue\n(calc runs, import jobs)"]
        CLOUDSCHEDULER["Cloud Scheduler\n(nightly calc, daily FX rates)"]
    end

    subgraph Storage["Storage"]
        GCS["Cloud Storage\n(import files, exports, evidence)"]
    end

    subgraph ExternalServices["External Services"]
        OXR["Open Exchange Rates API\n(daily FX rates)"]
        STRIPE["Stripe\n(platform billing)"]
        RESEND["Resend\n(transactional email)"]
        CRM["CRM APIs\n(Salesforce, HubSpot etc.)"]
    end

    subgraph SecretMgr["Secrets"]
        SECRETMGR["GCP Secret Manager"]
    end

    WEB -->|Firebase ID token| FBAUTH
    FBAUTH -->|Session cookie| SESSION
    SESSION -->|Validated by| MIDDLEWARE
    WEB -->|HTTPS API requests| NEXTJS
    MIDDLEWARE --> NEXTJS
    NEXTJS --> PRISMA
    NEXTJS --> CALCENGINE
    CALCENGINE --> PRISMA
    PRISMA --> CLOUDSQL
    CLOUDSQL --> RLS
    CLOUDSCHEDULER -->|Trigger| CLOUDTASKS
    CLOUDTASKS -->|Worker jobs| CALCENGINE
    NEXTJS --> GCS
    NEXTJS --> RESEND
    NEXTJS --> STRIPE
    CALCENGINE --> OXR
    NEXTJS --> CRM
    NEXTJS --> SECRETMGR
```

---

## Data Model (Entity Relationships)

```mermaid
erDiagram
    Organisation ||--o{ User : "has"
    Organisation ||--o{ CompensationPlan : "owns"
    Organisation ||--o{ Quota : "owns"
    Organisation ||--o{ Territory : "owns"
    Organisation ||--o{ Transaction : "owns"
    Organisation ||--o{ CalculationRun : "owns"
    Organisation ||--o{ PaymentRun : "owns"
    Organisation ||--o{ AuditLog : "logs"
    Organisation ||--o{ SecurityLog : "logs"
    Organisation ||--o{ Integration : "has"
    Organisation ||--o{ ApiKey : "has"

    User }o--o| User : "manager-of"
    User ||--o{ PlanParticipant : "enrolled-in"
    User ||--o{ Quota : "assigned"
    User ||--o{ TerritoryAssignment : "assigned-to"
    User ||--o{ DrawBalance : "has"

    CompensationPlan ||--o{ PlanRule : "contains"
    CompensationPlan ||--o{ PlanParticipant : "assigns"
    CompensationPlan ||--o{ PlanAcknowledgment : "requires"
    CompensationPlan }o--o| CompensationPlan : "versions"

    Territory ||--o{ TerritoryAssignment : "has"

    Transaction ||--o{ CreditAllocation : "credited-to"
    CreditAllocation }o--|| User : "for-rep"
    CreditAllocation }o--|| CompensationPlan : "under-plan"

    CalculationRun ||--o{ EarningsRecord : "produces"
    EarningsRecord }o--|| User : "for-rep"
    EarningsRecord }o--|| CompensationPlan : "under-plan"
    EarningsRecord }o--o| EarningsRecord : "retroactive-of"

    PaymentRun ||--o{ Payment : "contains"
    Payment }o--|| User : "paid-to"
    Payment }o--o| EarningsRecord : "settles"

    Dispute }o--|| User : "raised-by"
    Dispute }o--o| EarningsRecord : "on-earnings"
    Dispute }o--o| Transaction : "on-transaction"

    Integration ||--o{ ImportJob : "runs"
```

---

## Feature Map

```mermaid
mindmap
  root((SmartCommission))
    Plan Design
      Plan builder wizard
      Plan types (Commission / Bonus / MBO / SPIF / Team)
      Tiered progressive & retroactive rules
      Accelerators & decelerators
      Caps & floors
      Clawback rules
      Holdback / reserve provisions
      Draw against commission
      Split credit
      Plan versioning
      Plan templates library
      Plan approval workflow
      E-acknowledgment
    Data Integration
      CSV / Excel import
      CRM connectors (Salesforce / HubSpot / Pipedrive / Dynamics)
      ERP connectors (NetSuite / Xero / QuickBooks)
      HRIS connectors (Workday / BambooHR / ADP)
      REST API ingest
      Webhooks inbound
      Duplicate detection
      Historical data import
      Staging / sandbox environment
    Calculation Engine
      Rule-based deterministic engine
      Multi-currency support
      Retroactive adjustments
      Team & hierarchy rollup
      Bonus pool distribution
      Real-time what-if preview
      Calculation audit trail
      Period management
      Exception flagging
      Anomaly detection
    Payments & Payroll
      Payment run workflow
      Payroll export (ADP / Xero / MYOB / Workday)
      Manual adjustments
      Payment holds & releases
      Draw reconciliation
      Advance payment management
      Multi-currency payout
    Participant Portal
      Real-time earnings dashboard
      Attainment gauge
      YTD earnings breakdown
      Commission statements (PDF)
      Deal-level earnings detail
      Quota visibility
      Plan document access
      Dispute submission & tracking
      Leaderboards & gamification
      What-if calculator
      Earnings forecast
    Manager & Finance Views
      Team attainment dashboard
      Rep performance comparison
      Pipeline-to-commission projection
      Commission accrual reports (ASC 606)
      Budget vs actuals tracking
      Exception queue review
    Reporting & Analytics
      Pre-built reports library
      Custom report builder
      Scheduled report delivery
      Interactive dashboards
      Trend analysis
      Cohort analysis
      AI-powered insights
    Compliance & Audit
      SOX support (segregation of duties)
      GDPR & Privacy compliance
      Calculation audit trail
      Immutable audit log
      Change log
      RBAC (6 roles)
      Data retention policies
      Export for external audit
    API & Integrations
      REST API v1 (full CRUD)
      Webhooks (all lifecycle events)
      API key management
      OAuth 2.0
      OpenAPI 3.0 spec
      SDK (JS / Python planned)
    AI Features
      ML earnings forecast
      Anomaly detection
      Plan optimisation recommendations
      Natural language query
      AI-assisted plan design
      Churn risk prediction
    Platform
      Multi-tenant (row-level isolation)
      Multi-org / multi-BU
      Superadmin console
      SSO (SAML / OIDC)
      MFA enforcement
      IP allowlisting
      SOC 2 Type II (planned)
```

---

## Deployment Architecture

```mermaid
flowchart LR
    subgraph GCP["GCP Project: smartcommission-prod"]
        subgraph CloudRun["Cloud Run (australia-southeast1)"]
            WEB_SVC["smartcommission-web\n(Next.js App Router)"]
        end
        subgraph CloudSQL["Cloud SQL"]
            DB["PostgreSQL 15\n(smartcommission-db)"]
            PGBOUNCER["PgBouncer\n(connection pooling)"]
        end
        subgraph CloudTasks["Cloud Tasks"]
            CALC_Q["smartcommission-calc-queue"]
            IMPORT_Q["smartcommission-import-queue"]
        end
        subgraph CloudStorage["Cloud Storage"]
            IMPORTS["sc-imports bucket\n(CSV files, 30-day TTL)"]
            EXPORTS["sc-exports bucket\n(generated exports)"]
            EVIDENCE["sc-evidence bucket\n(dispute attachments)"]
        end
        subgraph CloudScheduler["Cloud Scheduler"]
            NIGHTLY_CALC["Nightly delta calc\n(02:00 AEST)"]
            FX_RATES["FX rate fetch\n(00:30 UTC)"]
        end
        subgraph SecretManager["Secret Manager"]
            SECRETS["Firebase SA / DB URL /\nStripe / OXR / Session key"]
        end
        subgraph CloudBuild["Cloud Build"]
            CICD["CI/CD pipeline\n(main branch → deploy)"]
        end
        ARTIFACT["Artifact Registry\n(Docker images)"]
    end

    subgraph Firebase["Firebase (Google)"]
        FBAUTH["Firebase Authentication"]
        FBHOSTING["Firebase Hosting\n(optional CDN / static)"]
    end

    CICD --> ARTIFACT
    ARTIFACT --> WEB_SVC
    WEB_SVC --> PGBOUNCER
    PGBOUNCER --> DB
    WEB_SVC --> CALC_Q
    WEB_SVC --> IMPORT_Q
    NIGHTLY_CALC --> CALC_Q
    FX_RATES --> WEB_SVC
    WEB_SVC --> IMPORTS
    WEB_SVC --> EXPORTS
    WEB_SVC --> EVIDENCE
    WEB_SVC --> SECRETS
    WEB_SVC --> FBAUTH
```

---

## RBAC Permission Matrix

```mermaid
flowchart TD
    SA["SUPER_ADMIN\n(platform operator)"]
    AD["ADMIN\n(org administrator)"]
    FI["FINANCE\n(finance team)"]
    MG["MANAGER\n(sales manager)"]
    RP["REP\n(sales representative)"]
    RO["READ_ONLY\n(auditor / exec)"]

    SA -->|"All orgs + impersonate"| AD
    AD -->|"Own org: full access"| FI
    FI -->|"View all earnings\nApprove payments\nResolve disputes"| MG
    MG -->|"View direct reports\nView own earnings"| RP
    RP -->|"Own earnings only\nDispute submission"| RO
    RO -->|"View only"| RP
```
