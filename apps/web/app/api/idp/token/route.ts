import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

// Auth code store shared with authorize route (in-memory; use Redis in production)
const authCodes = new Map<string, {
  userId: string
  email: string
  orgId: string
  clientId: string
  redirectUri: string
  expiry: number
}>()

function signJwt(payload: Record<string, unknown>): string {
  const privateKeyPem = process.env.OIDC_PRIVATE_KEY_PEM
  if (!privateKeyPem) throw new Error('OIDC_PRIVATE_KEY_PEM not configured')

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'smartcommission-oidc-key' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signingInput = `${header}.${body}`

  const signature = crypto.sign('sha256', Buffer.from(signingInput), {
    key: privateKeyPem,
    padding: crypto.constants.RSA_PKCS1_PADDING,
  }).toString('base64url')

  return `${signingInput}.${signature}`
}

export async function POST(req: NextRequest) {
  let params: URLSearchParams
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('application/x-www-form-urlencoded')) {
    params = new URLSearchParams(await req.text())
  } else {
    const body = await req.json()
    params = new URLSearchParams(body)
  }

  const grantType = params.get('grant_type')
  const code = params.get('code')
  const clientId = params.get('client_id')
  const redirectUri = params.get('redirect_uri')

  if (grantType !== 'authorization_code' || !code || !clientId || !redirectUri) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const stored = authCodes.get(code)
  if (!stored || stored.expiry < Date.now() || stored.clientId !== clientId || stored.redirectUri !== redirectUri) {
    return NextResponse.json({ error: 'invalid_grant' }, { status: 400 })
  }
  authCodes.delete(code)

  const user = await db.user.findUnique({ where: { id: stored.userId } })
  if (!user) return NextResponse.json({ error: 'invalid_grant' }, { status: 400 })

  const ISSUER = process.env.OIDC_ISSUER ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const now = Math.floor(Date.now() / 1000)
  const idToken = signJwt({
    iss: ISSUER,
    sub: user.id,
    aud: clientId,
    iat: now,
    exp: now + 3600,
    email: user.email,
    name: user.name,
    org: user.organisationId,
    roles: [user.role],
  })

  const accessToken = crypto.randomBytes(32).toString('hex')

  return NextResponse.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    id_token: idToken,
  })
}
