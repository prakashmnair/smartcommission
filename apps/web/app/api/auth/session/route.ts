import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdmin } from '@/lib/firebase/admin'
import { logSecurity } from '@/lib/security-log'
import { getRequestContext } from '@/lib/request-context'

export async function POST(req: NextRequest) {
  const { idToken } = await req.json()
  try {
    const adminAuth = getFirebaseAdmin()
    const decoded = await adminAuth.verifyIdToken(idToken)
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: 60 * 60 * 24 * 14 * 1000 }) // 14 days

    await logSecurity('LOGIN_SUCCESS', {
      userId: decoded.uid,
      userEmail: decoded.email,
      severity: 'INFO',
      ...getRequestContext(req),
    })

    const res = NextResponse.json({ ok: true })
    res.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 14,
      path: '/',
      sameSite: 'lax',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('__session', '', { maxAge: 0, path: '/' })
  await logSecurity('LOGOUT', { severity: 'INFO', ...getRequestContext(req) })
  return res
}
