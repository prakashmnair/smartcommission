import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { validateSql, executeQuery, ALLOWED_TABLES } from '@/lib/query-safe'
import { logAudit } from '@/lib/audit'

// Simple in-memory rate limiter — replace with Redis in production
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

export async function POST(req: NextRequest) {
  const org = await getEffectiveOrganisation(req)
  if (!isOrgContext(org)) return org
  if (!['ADMIN', 'FINANCE'].includes(org.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Rate limiting: 10 queries/min for admins
  if (!checkRateLimit(`qc:${org.userId}`, 10)) {
    return NextResponse.json({ error: 'Rate limit exceeded — max 10 queries/minute' }, { status: 429 })
  }

  const { sql, parameters } = await req.json()
  const validation = validateSql(sql, ALLOWED_TABLES)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const run = await db.queryRun.create({
    data: {
      organisationId: org.organisationId,
      sql,
      parameters: parameters ?? undefined,
      status: 'RUNNING',
      columnNames: [],
      createdById: org.userId,
    },
  })

  try {
    const result = await executeQuery(sql, org.organisationId, ALLOWED_TABLES)
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
    await logAudit('QUERY.RUN', {
      userId: org.userId,
      userEmail: org.userEmail,
      tenantId: org.organisationId,
      entityType: 'QueryRun',
      entityId: run.id,
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
