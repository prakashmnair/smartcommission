import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

export async function GET(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '20', 10), 100)

  const where = {
    organisationId: ctx.organisationId,
    ...(status ? { status } : {}),
  }

  const [plans, total] = await Promise.all([
    db.compensationPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { participants: true } },
      },
    }),
    db.compensationPlan.count({ where }),
  ])

  return NextResponse.json({
    data: plans,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  })
}

export async function POST(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  // Only ADMIN/FINANCE can create plans
  if (!['ADMIN', 'FINANCE'].includes(ctx.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const body = await req.json()
  const { name, description, type, effectiveFrom, effectiveTo, currency } = body

  if (!name?.trim() || !type || !effectiveFrom) {
    return NextResponse.json({ error: 'name, type, and effectiveFrom are required' }, { status: 400 })
  }

  const plan = await db.compensationPlan.create({
    data: {
      organisationId: ctx.organisationId,
      name: name.trim(),
      description: description?.trim() ?? null,
      type,
      effectiveFrom: new Date(effectiveFrom),
      effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      currency: currency ?? 'AUD',
      createdById: ctx.userId,
    },
  })

  await logAudit('PLAN.CREATE', {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
    tenantId: ctx.organisationId,
    entityType: 'CompensationPlan',
    entityId: plan.id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: plan }, { status: 201 })
}
