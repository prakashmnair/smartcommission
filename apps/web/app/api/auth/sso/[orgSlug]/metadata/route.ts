import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSpMetadata } from '@/lib/sso'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const org = await db.organisation.findUnique({
    where: { slug: orgSlug },
    include: { ssoConfig: true },
  })

  if (!org?.ssoConfig?.isEnabled) {
    return new NextResponse('Not found', { status: 404 })
  }

  const xml = getSpMetadata(org.ssoConfig)
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
