import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { logSecurity } from '@/lib/security-log'
import { encryptSecret } from '@/lib/crypto'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const org = await getEffectiveOrganisation(req)
  if (!isOrgContext(org)) return org
  if (!['ADMIN'].includes(org.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const config = await db.ssoConfig.findUnique({ where: { organisationId: org.organisationId } })
  if (!config) return NextResponse.json({ data: null })

  // Never return the encrypted secret to the client
  return NextResponse.json({
    data: {
      ...config,
      oidcClientSecretEnc: config.oidcClientSecretEnc ? '***' : null,
    },
  })
}

export async function POST(req: NextRequest) {
  const org = await getEffectiveOrganisation(req)
  if (!isOrgContext(org)) return org
  if (!['ADMIN'].includes(org.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    protocol, idpEntityId, idpSsoUrl, idpCertificate, idpMetadataXml,
    oidcDiscoveryUrl, oidcClientId, oidcClientSecret, oidcScopes,
    emailDomain, forceSso, isEnabled, isIdpEnabled, idpClients,
  } = body

  if (!emailDomain) return NextResponse.json({ error: 'emailDomain is required' }, { status: 400 })

  const spEntityId = `${BASE_URL}/sso/${org.organisationId}`
  const orgRecord = await db.organisation.findUnique({ where: { id: org.organisationId } })
  const spAcsUrl = `${BASE_URL}/api/auth/sso/${orgRecord?.slug ?? org.organisationId}/acs`

  const existing = await db.ssoConfig.findUnique({ where: { organisationId: org.organisationId } })

  const data = {
    protocol: protocol ?? 'SAML',
    idpEntityId: idpEntityId ?? null,
    idpSsoUrl: idpSsoUrl ?? null,
    idpCertificate: idpCertificate ?? null,
    idpMetadataXml: idpMetadataXml ?? null,
    oidcDiscoveryUrl: oidcDiscoveryUrl ?? null,
    oidcClientId: oidcClientId ?? null,
    ...(oidcClientSecret ? { oidcClientSecretEnc: encryptSecret(oidcClientSecret) } : {}),
    oidcScopes: oidcScopes ?? ['openid', 'email', 'profile'],
    spEntityId,
    spAcsUrl,
    emailDomain,
    forceSso: forceSso ?? false,
    isEnabled: isEnabled ?? false,
    isIdpEnabled: isIdpEnabled ?? false,
    idpClients: idpClients ?? null,
    updatedById: org.userId,
  }

  let config
  if (existing) {
    config = await db.ssoConfig.update({ where: { organisationId: org.organisationId }, data })
    await logAudit('SSO_CONFIG.UPDATE', { userId: org.userId, userEmail: org.userEmail, tenantId: org.organisationId, entityType: 'SsoConfig', entityId: config.id })
  } else {
    config = await db.ssoConfig.create({ data: { ...data, organisationId: org.organisationId, createdById: org.userId } })
    await logAudit('SSO_CONFIG.CREATE', { userId: org.userId, userEmail: org.userEmail, tenantId: org.organisationId, entityType: 'SsoConfig', entityId: config.id })
  }

  await logSecurity('SSO_CONFIGURED', { userId: org.userId, userEmail: org.userEmail, tenantId: org.organisationId, severity: 'WARNING', details: { protocol } })

  if (isEnabled) {
    await logSecurity('SSO_ENABLED', { userId: org.userId, userEmail: org.userEmail, tenantId: org.organisationId, severity: 'WARNING', details: { emailDomain } })
    await logAudit('SSO_CONFIG.ENABLE', { userId: org.userId, userEmail: org.userEmail, tenantId: org.organisationId, entityType: 'SsoConfig', entityId: config.id })
  }

  return NextResponse.json({ data: { ...config, oidcClientSecretEnc: config.oidcClientSecretEnc ? '***' : null } })
}
