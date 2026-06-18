CREATE TABLE "saved_queries" (
  "id" TEXT NOT NULL,
  "organisationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "sql" TEXT NOT NULL,
  "parameters" JSONB,
  "tags" TEXT[] DEFAULT '{}',
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "publishedById" TEXT,
  "visibility" TEXT NOT NULL DEFAULT 'ADMIN',
  "shareToken" TEXT,
  "reportName" TEXT,
  "reportDesc" TEXT,
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastRunAt" TIMESTAMP(3),
  "runCount" INT NOT NULL DEFAULT 0,
  CONSTRAINT "saved_queries_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "saved_queries_shareToken_key" UNIQUE ("shareToken")
);
CREATE INDEX "saved_queries_organisationId_idx" ON "saved_queries"("organisationId");
CREATE INDEX "saved_queries_organisationId_isPublished_idx" ON "saved_queries"("organisationId", "isPublished");
CREATE INDEX "saved_queries_shareToken_idx" ON "saved_queries"("shareToken");

CREATE TABLE "query_runs" (
  "id" TEXT NOT NULL,
  "organisationId" TEXT NOT NULL,
  "savedQueryId" TEXT,
  "sql" TEXT NOT NULL,
  "parameters" JSONB,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "rowCount" INT,
  "columnNames" TEXT[] DEFAULT '{}',
  "executionMs" INT,
  "errorMessage" TEXT,
  "exportFormat" TEXT,
  "exportedAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "query_runs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "query_runs_organisationId_idx" ON "query_runs"("organisationId");
CREATE INDEX "query_runs_savedQueryId_idx" ON "query_runs"("savedQueryId");
CREATE INDEX "query_runs_createdById_idx" ON "query_runs"("createdById");
CREATE INDEX "query_runs_createdAt_idx" ON "query_runs"("createdAt");
