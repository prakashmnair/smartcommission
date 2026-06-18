import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'
import { isSuperAdmin } from '@/lib/auth/superadmin'

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const session = await getSessionUser(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isSa = await isSuperAdmin(session.uid, session.email)
  if (!isSa) {
    // Verify user is ADMIN of THIS specific org (from URL, not session)
    const user = await db.user.findFirst({
      where: { firebaseUid: session.uid, organisationId: orgId, role: 'ADMIN' },
    })
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 50
  const event = searchParams.get('event')
  const severity = searchParams.get('severity')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const validSeverities = ['INFO', 'WARNING', 'CRITICAL']

  const where = {
    tenantId: orgId, // always scoped to this org — never from session
    ...(event ? { event: { contains: event, mode: 'insensitive' as const } } : {}),
    ...(severity && validSeverities.includes(severity) ? { severity } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  }

  const [logs, total] = await Promise.all([
    db.securityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.securityLog.count({ where }),
  ])

  return NextResponse.json({ data: logs, meta: { total, page, limit } })
}
