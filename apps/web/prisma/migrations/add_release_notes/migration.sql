CREATE TABLE "release_notes" (
  "id" TEXT NOT NULL,
  "version" TEXT,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "body" TEXT,
  "type" TEXT NOT NULL DEFAULT 'PLATFORM',
  "category" TEXT NOT NULL DEFAULT 'FEATURE',
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "tenantId" TEXT,
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "release_notes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "release_notes_type_published_visible_idx" ON "release_notes"("type", "isPublished", "isVisible");
CREATE INDEX "release_notes_tenantId_idx" ON "release_notes"("tenantId");
CREATE INDEX "release_notes_publishedAt_idx" ON "release_notes"("publishedAt");
