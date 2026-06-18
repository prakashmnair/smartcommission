import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { validateSql, executeQuery, ALLOWED_TABLES } from '@/lib/query-safe'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

// Simple in-memory rate limiter for members (5 runs/min)
const rateLimiter = new Map<string, { count: number; resetAt: number }>()
function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now()
  const entry = rateLimiter.get(key)
  if (!entry || entry.resetAt < now) {
    rateLimiter.set(key, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const org = await getEffectiveOrganisation(req)
  if (!isOrgContext(org)) return org

  const limit = ['ADMIN', 'FINANCE'].includes(org.role) ? 10 : 5
  if (!checkRateLimit(`qcr:${org.userId}`, limit)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { id } = await params
  const q = await db.savedQuery.findFirst({
    where: { id, organisationId: org.organisationId, isPublished: true },
  })
  if (!q) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  const { parameters } = await req.json().catch(() => ({ parameters: undefined }))
  const validation = validateSql(q.sql, ALLOWED_TABLES)
  if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 })

  const run = await db.queryRun.create({
    data: {
      organisationId: org.organisationId,
      savedQueryId: id,
      sql: q.sql,
      parameters: parameters ?? undefined,
      status: 'RUNNING',
      columnNames: [],
      createdById: org.userId,
    },
  })

  try {
    const result = await executeQuery(q.sql, org.organisationId, ALLOWED_TABLES)
    await db.queryRun.update({
      where: { id: run.id },
      data: {
        status: 'COMPLETED',
        rowCount: result.rowCount,
        columnNames: result.columnNames,
        executionMs: result.executionMs,
        completedAt: new Date(),
      },
    })
    await db.savedQuery.update({
      where: { id },
      data: { runCount: { increment: 1 }, lastRunAt: new Date() },
    })
    await logAudit('QUERY.RUN', {
      userId: org.userId,
      userEmail: org.userEmail,
      tenantId: org.organisationId,
      entityType: 'QueryRun',
      entityId: run.id,
      ...getRequestContext(req),
    })
    return NextResponse.json({
      data: {
        runId: run.id,
        rows: result.rows,
        columnNames: result.columnNames,
        rowCount: result.rowCount,
        executionMs: result.executionMs,
        limitReached: result.rowCount === 1000,
      },
    })
  } catch (err) {
    await db.queryRun.update({
      where: { id: run.id },
      data: { status: 'FAILED', errorMessage: String(err), completedAt: new Date() },
    })
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
