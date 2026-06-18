import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain')
  if (!domain) return NextResponse.json({ sso: false })

  const config = await db.ssoConfig.findFirst({
    where: { emailDomain: domain, isEnabled: true },
    include: { organisation: { select: { slug: true } } },
  })

  if (!config) return NextResponse.json({ sso: false })

  return NextResponse.json({
    sso: true,
    protocol: config.protocol,
    orgSlug: (config as typeof config & { organisation: { slug: string } }).organisation.slug,
  })
}
