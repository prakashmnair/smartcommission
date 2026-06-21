import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

export async function GET(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  if (!['ADMIN', 'OWNER'].includes(ctx.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const notes = await db.releaseNote.findMany({
    where: { type: 'TENANT', tenantId: ctx.organisationId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json({ data: notes })
}

export async function POST(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  if (!['ADMIN', 'OWNER'].includes(ctx.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, summary, body: noteBody, category } = body

  if (!title?.trim() || !summary?.trim()) {
    return NextResponse.json({ error: 'title and summary are required' }, { status: 400 })
  }

  const validCategories = ['FEATURE', 'IMPROVEMENT', 'FIX', 'SECURITY', 'BREAKING', 'DEPRECATION']
  if (category && !validCategories.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const note = await db.releaseNote.create({
    data: {
      title: title.trim(),
      summary: summary.trim(),
      body: noteBody?.trim() ?? null,
      category: category ?? 'FEATURE',
      type: 'TENANT',
      tenantId: ctx.organisationId,
      createdById: ctx.userId,
    },
  })

  await logAudit('RELEASE_NOTE.CREATE', {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
    tenantId: ctx.organisationId,
    entityType: 'ReleaseNote',
    entityId: note.id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: note }, { status: 201 })
}
