import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

export async function GET(req: NextRequest) {
  const org = await getEffectiveOrganisation(req)
  if (!isOrgContext(org)) return org
  if (!['ADMIN', 'FINANCE'].includes(org.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const queries = await db.savedQuery.findMany({
    where: { organisationId: org.organisationId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      tags: true,
      isPublished: true,
      visibility: true,
      runCount: true,
      lastRunAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ data: queries })
}

export async function POST(req: NextRequest) {
  const org = await getEffectiveOrganisation(req)
  if (!isOrgContext(org)) return org
  if (!['ADMIN', 'FINANCE'].includes(org.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, description, sql, parameters, tags } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
  if (!sql?.trim()) return NextResponse.json({ error: 'sql is required' }, { status: 400 })

  const q = await db.savedQuery.create({
    data: {
      organisationId: org.organisationId,
      name: name.trim(),
      description: description ?? null,
      sql: sql.trim(),
      parameters: parameters ?? undefined,
      tags: tags ?? [],
      createdById: org.userId,
    },
  })

  await logAudit('QUERY.CREATE', {
    userId: org.userId,
    userEmail: org.userEmail,
    tenantId: org.organisationId,
    entityType: 'SavedQuery',
    entityId: q.id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: q }, { status: 201 })
}
