import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { getSamlAuthorizeUrl } from '@/lib/sso'

export async function POST(req: NextRequest) {
  const org = await getEffectiveOrganisation(req)
  if (!isOrgContext(org)) return org
  if (!['ADMIN'].includes(org.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const config = await db.ssoConfig.findUnique({ where: { organisationId: org.organisationId } })
  if (!config) return NextResponse.json({ error: 'SSO not configured' }, { status: 404 })

  try {
    if (config.protocol === 'SAML') {
      // Validate by generating an authorize URL — throws if config is invalid
      await getSamlAuthorizeUrl(config)
      return NextResponse.json({ data: { ok: true, message: 'SAML SP configuration is valid' } })
    } else if (config.protocol === 'OIDC') {
      const { discovery } = await import('openid-client')
      await discovery(new URL(config.oidcDiscoveryUrl!), config.oidcClientId ?? 'test')
      return NextResponse.json({ data: { ok: true, message: 'OIDC discovery endpoint reachable' } })
    }
    return NextResponse.json({ error: 'Unknown protocol' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
