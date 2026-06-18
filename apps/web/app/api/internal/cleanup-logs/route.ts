import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cleanup-secret')
  if (!process.env.CLEANUP_SECRET || secret !== process.env.CLEANUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 7 years for audit logs (SOX), 3 years for security logs (GDPR)
  const auditCutoff = new Date(Date.now() - 7 * 365.25 * 24 * 60 * 60 * 1000)
  const secCutoff = new Date(Date.now() - 3 * 365.25 * 24 * 60 * 60 * 1000)

  const [auditResult, secResult] = await Promise.all([
    db.auditLog.deleteMany({ where: { createdAt: { lt: auditCutoff } } }),
    db.securityLog.deleteMany({ where: { createdAt: { lt: secCutoff } } }),
  ])

  return NextResponse.json({
    data: {
      auditLogsDeleted: auditResult.count,
      securityLogsDeleted: secResult.count,
    },
  })
}
