import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSamlAuthorizeUrl } from '@/lib/sso'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const org = await db.organisation.findUnique({
    where: { slug: orgSlug },
    include: { ssoConfig: true },
  })
  const config = org?.ssoConfig
  if (!config?.isEnabled || config.protocol !== 'SAML') {
    return NextResponse.redirect(new URL('/login?error=sso_not_configured', BASE_URL))
  }

  try {
    const authorizeUrl = await getSamlAuthorizeUrl(config)
    return NextResponse.redirect(authorizeUrl)
  } catch (err) {
    console.error('[SSO SAML authorize]', err)
    return NextResponse.redirect(new URL('/login?error=sso_failed', BASE_URL))
  }
}
