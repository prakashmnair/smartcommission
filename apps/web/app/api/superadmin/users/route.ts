import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth/superadmin'
import { logAudit } from '@/lib/audit'
import { logSecurity } from '@/lib/security-log'
import { getRequestContext } from '@/lib/request-context'

const PERMANENT_SUPERADMIN_EMAIL = 'prakashmnair@gmail.com'

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '50', 10), 200)

  const [users, total] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { organisation: { select: { name: true, slug: true } } },
    }),
    db.user.count(),
  ])

  return NextResponse.json({
    data: users,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { userId, action } = await req.json()
  if (!userId || !['grant', 'revoke'].includes(action)) {
    return NextResponse.json({ error: 'userId and action (grant|revoke) are required' }, { status: 400 })
  }

  const target = await db.user.findUnique({ where: { id: userId } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Protect permanent superadmin from revocation
  if (action === 'revoke' && target.email === PERMANENT_SUPERADMIN_EMAIL) {
    return NextResponse.json({ error: 'Cannot revoke the permanent superadmin account' }, { status: 400 })
  }

  // Self-revoke protection
  if (action === 'revoke' && target.firebaseUid === auth.uid) {
    return NextResponse.json({ error: 'Cannot revoke your own superadmin access' }, { status: 400 })
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: { isSuperAdmin: action === 'grant' },
  })

  const securityEvent = action === 'grant' ? 'SUPERADMIN_GRANTED' : 'SUPERADMIN_REVOKED'
  await logAudit(action === 'grant' ? 'USER.SUPERADMIN_GRANT' : 'USER.SUPERADMIN_REVOKE', {
    userId: auth.uid,
    userEmail: auth.email,
    entityType: 'User',
    entityId: userId,
    ...getRequestContext(req),
  })
  await logSecurity(securityEvent, {
    userId: auth.uid,
    userEmail: auth.email,
    severity: 'CRITICAL',
    details: { targetUserId: userId, targetEmail: target.email },
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: { id: updated.id, isSuperAdmin: updated.isSuperAdmin } })
}
