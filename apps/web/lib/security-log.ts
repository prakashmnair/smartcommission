import 'server-only'
import { db } from '@/lib/db'

interface SecurityLogOptions {
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
  tenantId?: string
  severity?: 'INFO' | 'WARNING' | 'CRITICAL'
  details?: Record<string, unknown>
}

export async function logSecurity(event: string, opts: SecurityLogOptions = {}): Promise<void> {
  try {
    await db.securityLog.create({
      data: {
        event,
        userId: opts.userId,
        userEmail: opts.userEmail,
        ipAddress: opts.ipAddress,
        userAgent: opts.userAgent,
        tenantId: opts.tenantId,
        severity: opts.severity ?? 'INFO',
        details: opts.details ? (opts.details as never) : undefined,
      },
    })

    // Stream CRITICAL events to GCP Cloud Logging for tamper-evident storage
    if (opts.severity === 'CRITICAL') {
      console.error(JSON.stringify({
        severity: 'CRITICAL',
        message: `[security] ${event}`,
        userId: opts.userId,
        userEmail: opts.userEmail ? opts.userEmail.replace(/(.{3}).*@/, '$1***@') : undefined,
        ipAddress: opts.ipAddress,
        timestamp: new Date().toISOString(),
      }))
    }
  } catch {
    // Never let logging failure break the main request
    console.error('[security-log] Failed to write security log:', event)
  }
}
