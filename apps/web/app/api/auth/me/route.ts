import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { isSuperAdmin } from '@/lib/auth/superadmin'

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const superAdmin = await isSuperAdmin(session.uid, session.email)

  return NextResponse.json({
    data: {
      uid: session.uid,
      email: session.email,
      name: session.name ?? '',
      isSuperAdmin: superAdmin,
    },
  })
}
