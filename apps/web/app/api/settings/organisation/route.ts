import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

export async function GET(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  const org = await db.organisation.findUnique({
    where: { id: ctx.organisationId },
    select: { id: true, name: true, slug: true, baseCurrency: true, timezone: true, status: true, plan: true, trialEndsAt: true, createdAt: true },
  })

  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: org }, {
    headers: { 'Cache-Control': 'private, s-maxage=120' },
  })
}

export async function PATCH(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  if (ctx.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only ADMIN can update organisation settings' }, { status: 403 })
  }

  const body = await req.json()
  const { name, baseCurrency, timezone } = body

  const org = await db.organisation.update({
    where: { id: ctx.organisationId },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(baseCurrency ? { baseCurrency } : {}),
      ...(timezone ? { timezone } : {}),
    },
  })

  await logAudit('ORGANISATION.UPDATE', {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
    tenantId: ctx.organisationId,
    entityType: 'Organisation',
    entityId: org.id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: org })
}
