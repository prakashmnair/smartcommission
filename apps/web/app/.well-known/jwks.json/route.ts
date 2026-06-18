import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  const publicKeyPem = process.env.OIDC_PUBLIC_KEY_PEM
  if (!publicKeyPem) {
    return NextResponse.json({ keys: [] })
  }

  try {
    const key = crypto.createPublicKey(publicKeyPem)
    const jwk = key.export({ format: 'jwk' }) as Record<string, unknown>
    return NextResponse.json({
      keys: [{ ...jwk, use: 'sig', alg: 'RS256', kid: 'smartcommission-oidc-key' }],
    })
  } catch {
    return NextResponse.json({ keys: [] })
  }
}
