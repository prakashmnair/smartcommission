import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { getRequestContext } from '@/lib/request-context'

// Simple hash for demo — in production use bcrypt
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function GET(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  if (ctx.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only ADMIN can manage API keys' }, { status: 403 })
  }

  const keys = await db.apiKey.findMany({
    where: { organisationId: ctx.organisationId, revokedAt: null },
    select: { id: true, name: true, keyPrefix: true, scopes: true, lastUsedAt: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: keys })
}

export async function POST(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  if (ctx.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only ADMIN can create API keys' }, { status: 403 })
  }

  const { name, scopes, expiresAt } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  // Generate key: sc_<random>
  const rawKey = `sc_${crypto.randomUUID().replace(/-/g, '')}`
  const prefix = rawKey.slice(0, 12) // sc_ + 9 chars
  const hash = await hashKey(rawKey)

  const key = await db.apiKey.create({
    data: {
      organisationId: ctx.organisationId,
      name: name.trim(),
      keyPrefix: prefix,
      keyHash: hash,
      scopes: scopes ?? ['read'],
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdById: ctx.userId,
    },
  })

  await logAudit('APIKEY.CREATE', {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
    tenantId: ctx.organisationId,
    entityType: 'ApiKey',
    entityId: key.id,
    ...getRequestContext(req),
  })

  // Return full key ONCE — never stored in plaintext
  return NextResponse.json({ data: { id: key.id, name: key.name, key: rawKey, keyPrefix: prefix } }, { status: 201 })
}
