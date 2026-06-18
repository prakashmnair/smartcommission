import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'

// In-memory auth code store (production: use Redis or DB)
const authCodes = new Map<string, { userId: string; email: string; orgId: string; clientId: string; redirectUri: string; expiry: number }>()

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('client_id')
  const redirectUri = req.nextUrl.searchParams.get('redirect_uri')
  const state = req.nextUrl.searchParams.get('state')

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  // Check user is authenticated
  const session = await getSessionUser(req)
  if (!session) {
    const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
    loginUrl.searchParams.set('next', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Verify client_id is registered in an org's idp clients
  const user = await db.user.findUnique({ where: { firebaseUid: session.uid } })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const ssoConfig = await db.ssoConfig.findUnique({ where: { organisationId: user.organisationId } })
  if (!ssoConfig?.isIdpEnabled) {
    return NextResponse.json({ error: 'idp_not_enabled' }, { status: 403 })
  }

  const idpClients = (ssoConfig.idpClients as Array<{ clientId: string; redirectUris: string[] }> | null) ?? []
  const registeredClient = idpClients.find(c => c.clientId === clientId)
  if (!registeredClient || !registeredClient.redirectUris.includes(redirectUri)) {
    return NextResponse.json({ error: 'unauthorized_client' }, { status: 403 })
  }

  // Issue auth code
  const code = crypto.randomUUID()
  authCodes.set(code, {
    userId: user.id,
    email: user.email,
    orgId: user.organisationId,
    clientId,
    redirectUri,
    expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
  })

  const callback = new URL(redirectUri)
  callback.searchParams.set('code', code)
  if (state) callback.searchParams.set('state', state)
  return NextResponse.redirect(callback)
}

// Export for use in token route
export { authCodes }
