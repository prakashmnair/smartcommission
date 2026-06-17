import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEffectiveOrganisation, isOrgContext } from '@/lib/org'
import { logAudit } from '@/lib/audit'
import { logSecurity } from '@/lib/security-log'
import { getRequestContext } from '@/lib/request-context'
import { maskEmail } from '@/lib/pii'

export async function GET(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  const users = await db.user.findMany({
    where: { organisationId: ctx.organisationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      hireDate: true,
      createdAt: true,
      managerId: true,
    },
    orderBy: { name: 'asc' },
  })

  // Mask PII for non-admin roles
  const safeUsers = ctx.role === 'ADMIN' || ctx.role === 'FINANCE'
    ? users
    : users.map(u => ({ ...u, email: maskEmail(u.email) }))

  return NextResponse.json({ data: safeUsers })
}

export async function POST(req: NextRequest) {
  const ctx = await getEffectiveOrganisation(req)
  if (!isOrgContext(ctx)) return ctx

  if (ctx.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only ADMIN can invite users' }, { status: 403 })
  }

  const { email, name, role } = await req.json()
  if (!email?.trim() || !role) {
    return NextResponse.json({ error: 'email and role are required' }, { status: 400 })
  }

  const validRoles = ['ADMIN', 'FINANCE', 'MANAGER', 'REP', 'READ_ONLY']
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Check for duplicate in org
  const existing = await db.user.findFirst({
    where: { organisationId: ctx.organisationId, email: email.trim().toLowerCase() },
  })
  if (existing) return NextResponse.json({ error: 'User already exists in this organisation' }, { status: 409 })

  // Create a placeholder user (they'll complete their account on first login via OAuth)
  const user = await db.user.create({
    data: {
      organisationId: ctx.organisationId,
      firebaseUid: `pending_${crypto.randomUUID()}`,
      email: email.trim().toLowerCase(),
      name: name?.trim() ?? email.trim(),
      role,
      status: 'INACTIVE', // Active once they sign in
    },
  })

  await logAudit('USER.INVITE', {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
    tenantId: ctx.organisationId,
    entityType: 'User',
    entityId: user.id,
    ...getRequestContext(req),
  })
  await logSecurity('USER_INVITED', {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
    tenantId: ctx.organisationId,
    severity: 'INFO',
    details: { invitedEmail: maskEmail(user.email), role: user.role },
    ...getRequestContext(req),
  })

  return NextResponse.json({ data: { id: user.id, email: maskEmail(user.email), role: user.role } }, { status: 201 })
}
