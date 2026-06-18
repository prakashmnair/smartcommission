import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'

export async function GET(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  const notes = await db.releaseNote.findMany({
    where: {
      isPublished: true,
      isVisible: true,
      OR: [
        { type: 'PLATFORM', tenantId: null },
        { type: 'TENANT', tenantId: ctx.organisationId },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ data: notes })
}
