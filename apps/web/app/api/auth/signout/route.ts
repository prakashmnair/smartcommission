import { NextRequest, NextResponse } from 'next/server'
import { logSecurity } from '@/lib/security-log'
import { getSessionUser } from '@/lib/auth/session'
import { getRequestContext } from '@/lib/request-context'

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req)
  if (session) {
    await logSecurity('LOGOUT', {
      userId: session.uid,
      userEmail: session.email,
      severity: 'INFO',
      ...getRequestContext(req),
    })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('__session', '', { maxAge: 0, path: '/' })
  return res
}
