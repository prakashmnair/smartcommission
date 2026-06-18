import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const org = await getEffectiveOrganisation(req)
  if (!isOrgContext(org)) return org
  if (!['ADMIN', 'FINANCE'].includes(org.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const q = await db.savedQuery.findFirst({
    where: { id, organisationId: org.organisationId },
  })
  if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: q })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const org = await getEffectiveOrganisation(req)
  if (!isOrgContext(org)) return org
  if (!['ADMIN', 'FINANCE'].includes(org.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const existing = await db.savedQuery.findFirst({ where: { id, organisationId: org.organisationId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { name, description, sql, parameters, tags } = body

  const q = await db.savedQuery.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(sql !== undefined ? { sql: sql.trim() } : {}),
      ...(parameters !== undefined ? { parameters } : {}),
      ...(tags !== undefined ? { tags } : {}),
      updatedById: org.userId,
    },
  })

  await logAudit('QUERY.UPDATE', {
    userId: org.userId,
    userEmail: org.userEmail,
    tenantId: org.organisationId,
    entityType: 'SavedQuery',
    entityId: id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: q })
}

export async function DELETE(
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

  await db.savedQuery.delete({ where: { id } })

  await logAudit('QUERY.DELETE', {
    userId: org.userId,
    userEmail: org.userEmail,
    tenantId: org.organisationId,
    entityType: 'SavedQuery',
    entityId: id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: { ok: true } })
}
