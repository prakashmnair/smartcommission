import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth/superadmin'

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenantId') ?? undefined
  const action = searchParams.get('action') ?? undefined
  const from = searchParams.get('from') ?? undefined
  const to = searchParams.get('to') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '50', 10), 200)

  const where = {
    ...(tenantId ? { tenantId } : {}),
    ...(action ? { action: { contains: action } } : {}),
    ...(from || to ? {
      createdAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    } : {}),
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.auditLog.count({ where }),
  ])

  return NextResponse.json({
    data: logs,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  })
}
