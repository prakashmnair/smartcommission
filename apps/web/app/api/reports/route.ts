import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'

export async function GET(req: NextRequest) {
  const org = await getEffectiveOrganisation(req)
  if (!isOrgContext(org)) return org

  const reports = await db.savedQuery.findMany({
    where: {
      organisationId: org.organisationId,
      isPublished: true,
      visibility: { in: ['ORG_MEMBERS', 'SHARED_LINK'] },
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      reportName: true,
      reportDesc: true,
      tags: true,
      runCount: true,
      lastRunAt: true,
      publishedAt: true,
      parameters: true,
    },
  })

  return NextResponse.json({ data: reports })
}
