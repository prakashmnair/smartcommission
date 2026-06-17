import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdmin } from '@/lib/firebase/admin'
import { db } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { logSecurity } from '@/lib/security-log'
import { getRequestContext } from '@/lib/request-context'

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function POST(req: NextRequest) {
  const { idToken, orgName } = await req.json()
  if (!idToken || !orgName?.trim()) {
    return NextResponse.json({ error: 'idToken and orgName are required' }, { status: 400 })
  }

  try {
    const adminAuth = getFirebaseAdmin()
    const decoded = await adminAuth.verifyIdToken(idToken)

    // Check if user already has an account
    const existing = await db.user.findUnique({ where: { firebaseUid: decoded.uid } })
    if (existing) return NextResponse.json({ error: 'Account already exists' }, { status: 409 })

    // Create org + user, ensuring unique slug
    const baseSlug = slugify(orgName)
    let slug = baseSlug
    let attempt = 0
    while (await db.organisation.findUnique({ where: { slug } })) {
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    const org = await db.organisation.create({
      data: { name: orgName.trim(), slug, trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    })
    const user = await db.user.create({
      data: {
        organisationId: org.id,
        firebaseUid: decoded.uid,
        email: decoded.email ?? '',
        name: decoded.name ?? decoded.email ?? '',
        role: 'ADMIN',
        isSuperAdmin: decoded.email === 'prakashmnair@gmail.com',
      },
    })

    await logAudit('ORGANISATION.CREATE', {
      userId: user.id,
      userEmail: user.email,
      tenantId: org.id,
      entityType: 'Organisation',
      entityId: org.id,
      ...getRequestContext(req),
    })
    await logSecurity('ACCOUNT_CREATED', {
      userId: user.id,
      userEmail: user.email,
      tenantId: org.id,
      severity: 'INFO',
      ...getRequestContext(req),
    })

    return NextResponse.json({ ok: true, organisationId: org.id, slug: org.slug })
  } catch (err) {
    console.error('[signup] Error:', err)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
