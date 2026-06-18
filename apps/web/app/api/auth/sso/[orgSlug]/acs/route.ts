import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateSamlResponse } from '@/lib/sso'
import { getFirebaseAdmin } from '@/lib/firebase/admin'
import { logSecurity } from '@/lib/security-log'
import { logAudit } from '@/lib/audit'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

async function findOrProvisionUser(organisationId: string, email: string, displayName?: string) {
  let user = await db.user.findFirst({ where: { email, organisationId } })
  if (!user) {
    let firebaseUid: string
    try {
      const existing = await getFirebaseAdmin().getUserByEmail(email)
      firebaseUid = existing.uid
    } catch {
      const created = await getFirebaseAdmin().createUser({ email, displayName: displayName ?? email })
      firebaseUid = created.uid
    }
    user = await db.user.create({
      data: {
        organisationId,
        email,
        firebaseUid,
        name: displayName ?? email,
        role: 'READ_ONLY',
        status: 'ACTIVE',
      },
    })
    await logSecurity('SSO_JIT_PROVISIONED', {
      userId: user.id,
      userEmail: email,
      tenantId: organisationId,
      severity: 'INFO',
      details: { source: 'SSO_JIT' },
    })
    await logAudit('SSO_CONFIG.JIT_PROVISION', {
      userId: user.id,
      userEmail: email,
      tenantId: organisationId,
      entityType: 'User',
      entityId: user.id,
    })
  }
  return user
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const org = await db.organisation.findUnique({
    where: { slug: orgSlug },
    include: { ssoConfig: true },
  })
  const config = org?.ssoConfig
  if (!config?.isEnabled) {
    return NextResponse.redirect(new URL('/login?error=sso_not_configured', BASE_URL))
  }

  try {
    const body = await req.text()
    const formData = new URLSearchParams(body)
    const samlResponse = formData.get('SAMLResponse') ?? ''

    const { profile } = await validateSamlResponse(config, samlResponse)

    const email =
      (profile as Record<string, unknown>)?.email as string ??
      (profile as Record<string, unknown>)?.nameID as string
    if (!email) {
      return NextResponse.redirect(new URL('/login?error=sso_no_email', BASE_URL))
    }

    const user = await findOrProvisionUser(
      config.organisationId,
      email,
      (profile as Record<string, unknown>)?.displayName as string | undefined
    )

    const customToken = await getFirebaseAdmin().createCustomToken(user.firebaseUid, { email })

    await logSecurity('SSO_LOGIN_SUCCESS', {
      userId: user.id,
      userEmail: email,
      tenantId: config.organisationId,
      severity: 'INFO',
      details: { protocol: 'SAML', orgSlug },
    })

    const redirectUrl = new URL('/auth/sso-complete', BASE_URL)
    redirectUrl.searchParams.set('token', customToken)
    redirectUrl.searchParams.set('next', '/dashboard')
    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    await logSecurity('SSO_LOGIN_FAILURE', {
      tenantId: config.organisationId,
      severity: 'WARNING',
      details: { protocol: 'SAML', orgSlug, error: String(err) },
    })
    return NextResponse.redirect(new URL('/login?error=sso_failed', BASE_URL))
  }
}
