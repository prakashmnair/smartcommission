import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decryptSecret } from '@/lib/crypto'

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
  if (!config?.isEnabled || config.protocol !== 'OIDC') {
    return NextResponse.redirect(new URL('/login?error=sso_not_configured', BASE_URL))
  }

  try {
    const { discovery, buildAuthorizationUrl, randomState } = await import('openid-client')
    const clientSecret = config.oidcClientSecretEnc ? decryptSecret(config.oidcClientSecretEnc) : undefined
    const callbackUrl = `${BASE_URL}/api/auth/sso/${orgSlug}/oidc/callback`

    const serverConfig = await discovery(
      new URL(config.oidcDiscoveryUrl!),
      config.oidcClientId!,
      clientSecret
    )

    const state = randomState()
    const authUrl = buildAuthorizationUrl(serverConfig, {
      scope: config.oidcScopes.join(' '),
      redirect_uri: callbackUrl,
      state,
    })

    const res = NextResponse.redirect(authUrl.href)
    res.cookies.set('oidc_state', state, { httpOnly: true, maxAge: 300, path: '/', sameSite: 'lax' })
    res.cookies.set('oidc_org', orgSlug, { httpOnly: true, maxAge: 300, path: '/', sameSite: 'lax' })
    return res
  } catch (err) {
    console.error('[SSO OIDC authorize]', err)
    return NextResponse.redirect(new URL('/login?error=sso_failed', BASE_URL))
  }
}
