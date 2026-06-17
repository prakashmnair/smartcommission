import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  const { id } = await params
  const plan = await db.compensationPlan.findFirst({
    where: { id, organisationId: ctx.organisationId },
    include: {
      rules: { orderBy: { sortOrder: 'asc' } },
      participants: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      _count: { select: { participants: true } },
    },
  })

  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: plan })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  if (!['ADMIN', 'FINANCE'].includes(ctx.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const { id } = await params
  const existing = await db.compensationPlan.findFirst({
    where: { id, organisationId: ctx.organisationId },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const plan = await db.compensationPlan.update({
    where: { id },
    data: {
      name: body.name?.trim() ?? existing.name,
      description: body.description !== undefined ? body.description?.trim() : existing.description,
      status: body.status ?? existing.status,
      effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : existing.effectiveFrom,
      effectiveTo: body.effectiveTo !== undefined ? (body.effectiveTo ? new Date(body.effectiveTo) : null) : existing.effectiveTo,
    },
  })

  await logAudit('PLAN.UPDATE', {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
    tenantId: ctx.organisationId,
    entityType: 'CompensationPlan',
    entityId: plan.id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: plan })
}
