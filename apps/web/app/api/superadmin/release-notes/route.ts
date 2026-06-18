import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth/superadmin'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? undefined

  const notes = await db.releaseNote.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json({ data: notes })
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { version, title, summary, body: noteBody, category } = body

  if (!title?.trim() || !summary?.trim()) {
    return NextResponse.json({ error: 'title and summary are required' }, { status: 400 })
  }

  const validCategories = ['FEATURE', 'IMPROVEMENT', 'FIX', 'SECURITY', 'BREAKING', 'DEPRECATION']
  if (category && !validCategories.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const note = await db.releaseNote.create({
    data: {
      version: version?.trim() ?? null,
      title: title.trim(),
      summary: summary.trim(),
      body: noteBody?.trim() ?? null,
      category: category ?? 'FEATURE',
      type: 'PLATFORM',
      tenantId: null,
      createdById: auth.uid,
    },
  })

  await logAudit('RELEASE_NOTE.CREATE', {
    userId: auth.uid,
    userEmail: auth.email,
    entityType: 'ReleaseNote',
    entityId: note.id,
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: note }, { status: 201 })
}
