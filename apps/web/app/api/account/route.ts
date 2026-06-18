import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'
import { getFirebaseAdmin } from '@/lib/firebase/admin'
import { logSecurity } from '@/lib/security-log'
import { getRequestContext } from '@/lib/request-context'

export async function DELETE(req: NextRequest) {
  const session = await getSessionUser(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { firebaseUid: session.uid },
    select: { id: true, organisationId: true, email: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Log ACCOUNT_DELETED before deleting — so the log entry exists
  await logSecurity('ACCOUNT_DELETED', {
    userId: user.id,
    userEmail: user.email,
    tenantId: user.organisationId,
    severity: 'WARNING',
    ...getRequestContext(req),
  })

  // Anonymise log entries — never delete audit history
  await Promise.all([
    db.auditLog.updateMany({
      where: { userId: user.id },
      data: { userId: null, userEmail: '[deleted]' },
    }),
    db.securityLog.updateMany({
      where: { userId: user.id },
      data: { userId: null, userEmail: '[deleted]' },
    }),
  ])

  // Delete the Firebase Auth user
  try {
    const adminAuth = getFirebaseAdmin()
    await adminAuth.deleteUser(session.uid)
  } catch {
    // Non-fatal — continue with DB deletion even if Firebase user is already gone
    console.error('[account/delete] Firebase deleteUser failed for uid:', session.uid)
  }

  // Delete the DB user record (cascade will remove org-scoped records)
  await db.user.delete({ where: { id: user.id } })

  // Clear the session cookie
  const res = NextResponse.json({ ok: true })
  res.cookies.set('__session', '', { maxAge: 0, path: '/' })
  return res
}
