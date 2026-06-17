import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'

export interface OrgContext {
  organisationId: string
  userId: string
  userEmail: string
  role: string
}

/**
 * Returns the organisation context for the authenticated user.
 * Must be called at the top of every API route that accesses tenanted data.
 * Returns a 401/403 NextResponse if not authenticated or not a member.
 */
export async function getEffectiveOrganisation(
  req: NextRequest
): Promise<OrgContext | NextResponse> {
  const session = await getSessionUser(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { firebaseUid: session.uid },
    select: { id: true, organisationId: true, email: true, role: true, status: true },
  })
  if (!user || user.status === 'TERMINATED') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return {
    organisationId: user.organisationId,
    userId: user.id,
    userEmail: user.email,
    role: user.role,
  }
}

export function isOrgContext(v: OrgContext | NextResponse): v is OrgContext {
  return !(v instanceof NextResponse) && 'organisationId' in v
}
