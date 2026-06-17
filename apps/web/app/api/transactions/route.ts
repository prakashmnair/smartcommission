import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

export async function GET(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  const { searchParams } = new URL(req.url)
  const sourceSystem = searchParams.get('sourceSystem') ?? undefined
  const type = searchParams.get('type') ?? undefined
  const from = searchParams.get('from') ?? undefined
  const to = searchParams.get('to') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '20', 10), 100)

  const where = {
    organisationId: ctx.organisationId,
    ...(sourceSystem ? { sourceSystem } : {}),
    ...(type ? { type } : {}),
    ...(from || to ? {
      closeDate: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    } : {}),
  }

  const [transactions, total] = await Promise.all([
    db.transaction.findMany({
      where,
      orderBy: { closeDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.transaction.count({ where }),
  ])

  return NextResponse.json({
    data: transactions,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  })
}

export async function POST(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  if (!['ADMIN', 'FINANCE', 'MANAGER'].includes(ctx.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const body = await req.json()
  const { dealName, amount, currency, closeDate, type, sourceSystem, accountName, productName, externalId } = body

  if (!dealName?.trim() || !amount || !currency || !closeDate) {
    return NextResponse.json({ error: 'dealName, amount, currency, and closeDate are required' }, { status: 400 })
  }

  const transaction = await db.transaction.create({
    data: {
      organisationId: ctx.organisationId,
      dealName: dealName.trim(),
      amount,
      currency,
      amountBase: amount, // simplified: assume base currency = deal currency for now
      baseCurrency: currency,
      closeDate: new Date(closeDate),
      type: type ?? 'DEAL',
      sourceSystem: sourceSystem ?? 'MANUAL',
      accountName: accountName?.trim() ?? null,
      productName: productName?.trim() ?? null,
      externalId: externalId ?? null,
    },
  })

  await logAudit('TRANSACTION.CREATE', {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
    tenantId: ctx.organisationId,
    entityType: 'Transaction',
    entityId: transaction.id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: transaction }, { status: 201 })
}
