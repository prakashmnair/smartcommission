import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decryptSecret } from '@/lib/crypto'
import { getFirebaseAdmin } from '@/lib/firebase/admin'
import { logSecurity } from '@/lib/security-log'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

async function findOrProvisionUser(organisationId: string, email: string, name?: string) {
  let user = await db.user.findFirst({ where: { email, organisationId } })
  if (!user) {
    let firebaseUid: string
    try {
      const existing = await getFirebaseAdmin().getUserByEmail(email)
      firebaseUid = existing.uid
    } catch {
      const created = await getFirebaseAdmin().createUser({ email, displayName: name ?? email })
      firebaseUid = created.uid
    }
    user = await db.user.create({
      data: { organisationId, email, firebaseUid, name: name ?? email, role: 'READ_ONLY', status: 'ACTIVE' },
    })
    await logSecurity('SSO_JIT_PROVISIONED', {
      userId: user.id,
      userEmail: email,
      tenantId: organisationId,
      severity: 'INFO',
      details: { source: 'SSO_JIT_OIDC' },
    })
  }
  return user
}

export async function GET(
  req: NextRequest,
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

  // Validate CSRF state
  const storedState = req.cookies.get('oidc_state')?.value
  const returnedState = req.nextUrl.searchParams.get('state')
  if (!storedState || storedState !== returnedState) {
    return NextResponse.redirect(new URL('/login?error=sso_state_mismatch', BASE_URL))
  }

  try {
    const { discovery, authorizationCodeGrant, fetchUserInfo } = await import('openid-client')
    const clientSecret = config.oidcClientSecretEnc ? decryptSecret(config.oidcClientSecretEnc) : undefined
    const callbackUrl = `${BASE_URL}/api/auth/sso/${orgSlug}/oidc/callback`

    const serverConfig = await discovery(
      new URL(config.oidcDiscoveryUrl!),
      config.oidcClientId!,
      clientSecret
    )

    const currentUrl = new URL(req.nextUrl.toString())
    const tokens = await authorizationCodeGrant(serverConfig, currentUrl, {
      pkceCodeVerifier: undefined,
      expectedState: storedState,
      expectedNonce: undefined,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userinfo = await fetchUserInfo(serverConfig, tokens.access_token!, undefined as any)
    const email = userinfo.email
    if (!email) {
      return NextResponse.redirect(new URL('/login?error=sso_no_email', BASE_URL))
    }

    const user = await findOrProvisionUser(config.organisationId, email, userinfo.name)
    const customToken = await getFirebaseAdmin().createCustomToken(user.firebaseUid, { email })

    await logSecurity('SSO_LOGIN_SUCCESS', {
      userId: user.id,
      userEmail: email,
      tenantId: config.organisationId,
      severity: 'INFO',
      details: { protocol: 'OIDC', orgSlug },
    })

    const redirectUrl = new URL('/auth/sso-complete', BASE_URL)
    redirectUrl.searchParams.set('token', customToken)
    redirectUrl.searchParams.set('next', '/dashboard')
    const res = NextResponse.redirect(redirectUrl)
    res.cookies.delete('oidc_state')
    res.cookies.delete('oidc_org')
    return res
  } catch (err) {
    await logSecurity('SSO_LOGIN_FAILURE', {
      tenantId: config.organisationId,
      severity: 'WARNING',
      details: { protocol: 'OIDC', orgSlug, error: String(err) },
    })
    return NextResponse.redirect(new URL('/login?error=sso_failed', BASE_URL))
  }
}
