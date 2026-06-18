import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth/superadmin'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const existing = await db.releaseNote.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { version, title, summary, body: noteBody, category, isVisible, isPublished } = body

  const validCategories = ['FEATURE', 'IMPROVEMENT', 'FIX', 'SECURITY', 'BREAKING', 'DEPRECATION']
  if (category && !validCategories.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const wasPublished = !existing.isPublished && isPublished === true

  const note = await db.releaseNote.update({
    where: { id },
    data: {
      version: version !== undefined ? (version?.trim() ?? null) : existing.version,
      title: title?.trim() ?? existing.title,
      summary: summary?.trim() ?? existing.summary,
      body: noteBody !== undefined ? (noteBody?.trim() ?? null) : existing.body,
      category: category ?? existing.category,
      isVisible: isVisible !== undefined ? isVisible : existing.isVisible,
      isPublished: isPublished !== undefined ? isPublished : existing.isPublished,
      publishedAt: wasPublished ? new Date() : existing.publishedAt,
      updatedById: auth.uid,
    },
  })

  const action = wasPublished
    ? 'RELEASE_NOTE.PUBLISH'
    : isVisible !== undefined
    ? isVisible ? 'RELEASE_NOTE.SHOW' : 'RELEASE_NOTE.HIDE'
    : 'RELEASE_NOTE.UPDATE'

  await logAudit(action, {
    userId: auth.uid,
    userEmail: auth.email,
    entityType: 'ReleaseNote',
    entityId: note.id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: note })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const existing = await db.releaseNote.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.releaseNote.delete({ where: { id } })

  await logAudit('RELEASE_NOTE.DELETE', {
    userId: auth.uid,
    userEmail: auth.email,
    entityType: 'ReleaseNote',
    entityId: id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: { id } })
}
