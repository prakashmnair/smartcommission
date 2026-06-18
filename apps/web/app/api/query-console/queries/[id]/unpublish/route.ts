import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const org = await getEffectiveOrganisation(req)
  if (!isOrgContext(org)) return org
  if (org.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const existing = await db.savedQuery.findFirst({ where: { id, organisationId: org.organisationId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.savedQuery.update({
    where: { id },
    data: {
      isPublished: false,
      shareToken: null,
      updatedById: org.userId,
    },
  })

  await logAudit('QUERY.UNPUBLISH', {
    userId: org.userId,
    userEmail: org.userEmail,
    tenantId: org.organisationId,
    entityType: 'SavedQuery',
    entityId: id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: { ok: true } })
}
