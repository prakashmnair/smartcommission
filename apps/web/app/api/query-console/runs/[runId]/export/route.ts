import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { executeQuery, ALLOWED_TABLES } from '@/lib/query-safe'
import { logSecurity } from '@/lib/security-log'
import { getRequestContext } from '@/lib/request-context'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const org = await getEffectiveOrganisation(req)
  if (!isOrgContext(org)) return org

  const { runId } = await params
  const run = await db.queryRun.findFirst({
    where: { id: runId, organisationId: org.organisationId },
  })
  if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const format = req.nextUrl.searchParams.get('format') ?? 'csv'

  // Re-execute to get fresh data
  const result = await executeQuery(run.sql, org.organisationId, ALLOWED_TABLES)

  await logSecurity('DATA_EXPORTED', {
    userId: org.userId,
    userEmail: org.userEmail,
    tenantId: org.organisationId,
    severity: 'WARNING',
    details: { runId, format, rowCount: result.rowCount },
    ...getRequestContext(req),
  })
  await db.queryRun.update({
    where: { id: runId },
    data: { exportFormat: format, exportedAt: new Date() },
  })

  if (format === 'json') {
    const body = JSON.stringify({
      data: result.rows,
      meta: { rowCount: result.rowCount, columns: result.columnNames },
    })
    return new Response(body, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="export-${runId}.json"`,
      },
    })
  }

  // CSV
  const header = result.columnNames.join(',')
  const rows = (result.rows as Record<string, unknown>[]).map(r =>
    result.columnNames
      .map(c => {
        const val = r[c]
        if (val === null || val === undefined) return ''
        const s = String(val)
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"`
          : s
      })
      .join(',')
  )
  const csv = [header, ...rows].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="export-${runId}.csv"`,
    },
  })
}
