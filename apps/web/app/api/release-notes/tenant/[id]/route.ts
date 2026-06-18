import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  if (!['ADMIN', 'OWNER'].includes(ctx.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const note = await db.releaseNote.findFirst({
    where: { id, type: 'TENANT', tenantId: ctx.organisationId },
  })

  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ data: note })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  if (!['ADMIN', 'OWNER'].includes(ctx.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const existing = await db.releaseNote.findFirst({
    where: { id, type: 'TENANT', tenantId: ctx.organisationId },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { title, summary, body: noteBody, category, isVisible, isPublished } = body

  const validCategories = ['FEATURE', 'IMPROVEMENT', 'FIX', 'SECURITY', 'BREAKING', 'DEPRECATION']
  if (category && !validCategories.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const wasPublished = !existing.isPublished && isPublished === true

  const note = await db.releaseNote.update({
    where: { id },
    data: {
      title: title?.trim() ?? existing.title,
      summary: summary?.trim() ?? existing.summary,
      body: noteBody !== undefined ? (noteBody?.trim() ?? null) : existing.body,
      category: category ?? existing.category,
      isVisible: isVisible !== undefined ? isVisible : existing.isVisible,
      isPublished: isPublished !== undefined ? isPublished : existing.isPublished,
      publishedAt: wasPublished ? new Date() : existing.publishedAt,
      updatedById: ctx.userId,
    },
  })

  const action = wasPublished
    ? 'RELEASE_NOTE.PUBLISH'
    : isVisible !== undefined
    ? isVisible ? 'RELEASE_NOTE.SHOW' : 'RELEASE_NOTE.HIDE'
    : 'RELEASE_NOTE.UPDATE'

  await logAudit(action, {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
    tenantId: ctx.organisationId,
    entityType: 'ReleaseNote',
    entityId: note.id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: note })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  if (!['ADMIN', 'OWNER'].includes(ctx.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const existing = await db.releaseNote.findFirst({
    where: { id, type: 'TENANT', tenantId: ctx.organisationId },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.releaseNote.delete({ where: { id } })

  await logAudit('RELEASE_NOTE.DELETE', {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
    tenantId: ctx.organisationId,
    entityType: 'ReleaseNote',
    entityId: id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: { id } })
}
