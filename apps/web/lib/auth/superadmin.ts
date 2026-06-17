import 'server-only'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { logSecurity } from '@/lib/security-log'
import { getRequestContext } from '@/lib/request-context'

const PERMANENT_SUPERADMIN_EMAIL = 'prakashmnair@gmail.com'

export async function isSuperAdmin(uid: string, email?: string): Promise<boolean> {
  if (email === PERMANENT_SUPERADMIN_EMAIL) return true
  const user = await db.user.findUnique({ where: { firebaseUid: uid }, select: { isSuperAdmin: true } })
  return !!user?.isSuperAdmin
}

export async function requireSuperAdmin(req: NextRequest): Promise<{ uid: string; email: string } | NextResponse> {
  const session = await getSessionUser(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const isAdmin = await isSuperAdmin(session.uid, session.email)
  if (!isAdmin) {
    await logSecurity('UNAUTHORIZED_ACCESS', {
      userId: session.uid,
      userEmail: session.email,
      severity: 'CRITICAL',
      details: { path: req.nextUrl.pathname },
      ...getRequestContext(req),
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return { uid: session.uid, email: session.email }
}
