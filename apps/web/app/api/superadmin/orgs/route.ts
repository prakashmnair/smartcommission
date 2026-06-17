import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth/superadmin'

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '50', 10), 200)

  const [orgs, total] = await Promise.all([
    db.organisation.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { users: true, compensationPlans: true, transactions: true } },
      },
    }),
    db.organisation.count(),
  ])

  return NextResponse.json({
    data: orgs,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  })
}
