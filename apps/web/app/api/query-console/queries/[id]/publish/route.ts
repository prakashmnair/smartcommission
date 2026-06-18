import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { logSecurity } from '@/lib/security-log'
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

  const { reportName, reportDesc, visibility } = await req.json()
  const shareToken =
    visibility === 'SHARED_LINK'
      ? crypto.randomUUID().replace(/-/g, '')
      : undefined

  const q = await db.savedQuery.update({
    where: { id },
    data: {
      isPublished: true,
      publishedAt: new Date(),
      publishedById: org.userId,
      reportName: reportName?.trim() ?? existing.name,
      reportDesc: reportDesc ?? null,
      visibility: visibility ?? 'ORG_MEMBERS',
      shareToken: shareToken ?? undefined,
      updatedById: org.userId,
    },
  })

  await logAudit('QUERY.PUBLISH', {
    userId: org.userId,
    userEmail: org.userEmail,
    tenantId: org.organisationId,
    entityType: 'SavedQuery',
    entityId: id,
    ...getRequestContext(req),
  })
  await logSecurity('DATA_EXPORTED', {
    userId: org.userId,
    userEmail: org.userEmail,
    tenantId: org.organisationId,
    severity: 'WARNING',
    details: { action: 'QUERY_PUBLISHED', queryId: id, visibility },
  })

  return NextResponse.json({ data: { shareToken: q.shareToken } })
}
