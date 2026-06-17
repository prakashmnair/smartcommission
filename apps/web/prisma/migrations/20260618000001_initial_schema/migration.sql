-- CreateTable: organisations
CREATE TABLE "organisations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'AUD',
    "timezone" TEXT NOT NULL DEFAULT 'Australia/Sydney',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "plan" TEXT NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'REP',
    "managerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "hireDate" TIMESTAMP(3),
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable: compensation_plans
CREATE TABLE "compensation_plans" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "compensation_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable: plan_rules
CREATE TABLE "plan_rules" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "plan_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable: plan_participants
CREATE TABLE "plan_participants" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plan_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable: quotas
CREATE TABLE "quotas" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "territoryId" TEXT,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable: territories
CREATE TABLE "territories" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "territories_pkey" PRIMARY KEY ("id")
);

-- CreateTable: territory_assignments
CREATE TABLE "territory_assignments" (
    "id" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "territory_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: transactions
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "externalId" TEXT,
    "sourceSystem" TEXT NOT NULL DEFAULT 'MANUAL',
    "type" TEXT NOT NULL DEFAULT 'DEAL',
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "amountBase" DECIMAL(15,2) NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "exchangeRate" DECIMAL(10,6) NOT NULL DEFAULT 1,
    "closeDate" TIMESTAMP(3) NOT NULL,
    "recognitionDate" TIMESTAMP(3),
    "dealName" TEXT NOT NULL,
    "accountName" TEXT,
    "productName" TEXT,
    "metadata" JSONB,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: credit_allocations
CREATE TABLE "credit_allocations" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "creditPercent" DECIMAL(5,2) NOT NULL,
    "creditAmount" DECIMAL(15,2) NOT NULL,
    "creditType" TEXT NOT NULL DEFAULT 'PRIMARY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "credit_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: calculation_runs
CREATE TABLE "calculation_runs" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "transactionsProcessed" INTEGER NOT NULL DEFAULT 0,
    "earningsCreated" INTEGER NOT NULL DEFAULT 0,
    "errorsCount" INTEGER NOT NULL DEFAULT 0,
    "errorDetails" JSONB,
    "initiatedById" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "calculation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: earnings_records
CREATE TABLE "earnings_records" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "calculationRunId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "grossEarnings" DECIMAL(15,2) NOT NULL,
    "adjustments" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "netEarnings" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "auditTrail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "earnings_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable: payment_runs
CREATE TABLE "payment_runs" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "exportedById" TEXT,
    "exportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payment_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: payments
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "paymentRunId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "earningsRecordId" TEXT NOT NULL,
    "grossAmount" DECIMAL(15,2) NOT NULL,
    "drawDeduction" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "holdReason" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: disputes
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "earningsRecordId" TEXT,
    "transactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "evidence" JSONB,
    "resolution" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "slaDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "tenantId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "metadata" JSONB,
    "outcome" TEXT NOT NULL DEFAULT 'SUCCESS',
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: security_logs
CREATE TABLE "security_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "tenantId" TEXT,
    "event" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: api_keys
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY['read']::TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_slug_key" UNIQUE ("slug");
ALTER TABLE "users" ADD CONSTRAINT "users_firebaseUid_key" UNIQUE ("firebaseUid");
ALTER TABLE "users" ADD CONSTRAINT "users_organisationId_email_key" UNIQUE ("organisationId", "email");
ALTER TABLE "plan_participants" ADD CONSTRAINT "plan_participants_planId_userId_key" UNIQUE ("planId", "userId");
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_keyPrefix_key" UNIQUE ("keyPrefix");

-- CreateIndex
CREATE INDEX "users_organisationId_idx" ON "users"("organisationId");
CREATE INDEX "users_firebaseUid_idx" ON "users"("firebaseUid");
CREATE INDEX "compensation_plans_organisationId_idx" ON "compensation_plans"("organisationId");
CREATE INDEX "compensation_plans_organisationId_status_idx" ON "compensation_plans"("organisationId", "status");
CREATE INDEX "plan_rules_planId_idx" ON "plan_rules"("planId");
CREATE INDEX "quotas_organisationId_idx" ON "quotas"("organisationId");
CREATE INDEX "quotas_organisationId_userId_period_idx" ON "quotas"("organisationId", "userId", "period");
CREATE INDEX "territories_organisationId_idx" ON "territories"("organisationId");
CREATE INDEX "transactions_organisationId_idx" ON "transactions"("organisationId");
CREATE INDEX "transactions_organisationId_closeDate_idx" ON "transactions"("organisationId", "closeDate");
CREATE INDEX "credit_allocations_transactionId_idx" ON "credit_allocations"("transactionId");
CREATE INDEX "credit_allocations_userId_idx" ON "credit_allocations"("userId");
CREATE INDEX "calculation_runs_organisationId_idx" ON "calculation_runs"("organisationId");
CREATE INDEX "calculation_runs_organisationId_period_idx" ON "calculation_runs"("organisationId", "period");
CREATE INDEX "earnings_records_organisationId_idx" ON "earnings_records"("organisationId");
CREATE INDEX "earnings_records_organisationId_userId_period_idx" ON "earnings_records"("organisationId", "userId", "period");
CREATE INDEX "payment_runs_organisationId_idx" ON "payment_runs"("organisationId");
CREATE INDEX "payments_paymentRunId_idx" ON "payments"("paymentRunId");
CREATE INDEX "payments_userId_idx" ON "payments"("userId");
CREATE INDEX "disputes_organisationId_idx" ON "disputes"("organisationId");
CREATE INDEX "disputes_raisedById_idx" ON "disputes"("raisedById");
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");
CREATE INDEX "audit_logs_tenantId_createdAt_idx" ON "audit_logs"("tenantId", "createdAt");
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX "security_logs_userId_idx" ON "security_logs"("userId");
CREATE INDEX "security_logs_tenantId_idx" ON "security_logs"("tenantId");
CREATE INDEX "security_logs_event_idx" ON "security_logs"("event");
CREATE INDEX "security_logs_severity_idx" ON "security_logs"("severity");
CREATE INDEX "security_logs_createdAt_idx" ON "security_logs"("createdAt");
CREATE INDEX "api_keys_organisationId_idx" ON "api_keys"("organisationId");
CREATE INDEX "api_keys_keyPrefix_idx" ON "api_keys"("keyPrefix");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "compensation_plans" ADD CONSTRAINT "compensation_plans_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "plan_rules" ADD CONSTRAINT "plan_rules_planId_fkey" FOREIGN KEY ("planId") REFERENCES "compensation_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "plan_participants" ADD CONSTRAINT "plan_participants_planId_fkey" FOREIGN KEY ("planId") REFERENCES "compensation_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "plan_participants" ADD CONSTRAINT "plan_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotas" ADD CONSTRAINT "quotas_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotas" ADD CONSTRAINT "quotas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON UPDATE CASCADE;
ALTER TABLE "territories" ADD CONSTRAINT "territories_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "territory_assignments" ADD CONSTRAINT "territory_assignments_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "territories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "territory_assignments" ADD CONSTRAINT "territory_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "credit_allocations" ADD CONSTRAINT "credit_allocations_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "calculation_runs" ADD CONSTRAINT "calculation_runs_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON UPDATE CASCADE;
ALTER TABLE "earnings_records" ADD CONSTRAINT "earnings_records_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON UPDATE CASCADE;
ALTER TABLE "earnings_records" ADD CONSTRAINT "earnings_records_calculationRunId_fkey" FOREIGN KEY ("calculationRunId") REFERENCES "calculation_runs"("id") ON UPDATE CASCADE;
ALTER TABLE "earnings_records" ADD CONSTRAINT "earnings_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON UPDATE CASCADE;
ALTER TABLE "earnings_records" ADD CONSTRAINT "earnings_records_planId_fkey" FOREIGN KEY ("planId") REFERENCES "compensation_plans"("id") ON UPDATE CASCADE;
ALTER TABLE "payment_runs" ADD CONSTRAINT "payment_runs_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_paymentRunId_fkey" FOREIGN KEY ("paymentRunId") REFERENCES "payment_runs"("id") ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_earningsRecordId_fkey" FOREIGN KEY ("earningsRecordId") REFERENCES "earnings_records"("id") ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "users"("id") ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_earningsRecordId_fkey" FOREIGN KEY ("earningsRecordId") REFERENCES "earnings_records"("id") ON UPDATE CASCADE;
