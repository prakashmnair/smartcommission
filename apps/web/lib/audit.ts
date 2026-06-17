import 'server-only'
import { db } from '@/lib/db'

interface AuditOptions {
  userId?: string
  userEmail?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  tenantId?: string
  entityType: string
  entityId?: string
  changes?: Record<string, { old: unknown; new: unknown }>
  metadata?: Record<string, unknown>
  outcome?: 'SUCCESS' | 'FAILURE' | 'ERROR'
  requestId?: string
}

export async function logAudit(action: string, opts: AuditOptions): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        action,
        userId: opts.userId,
        userEmail: opts.userEmail,
        sessionId: opts.sessionId,
        ipAddress: opts.ipAddress,
        userAgent: opts.userAgent,
        tenantId: opts.tenantId,
        entityType: opts.entityType,
        entityId: opts.entityId,
        changes: opts.changes ? (opts.changes as never) : undefined,
        metadata: opts.metadata ? (opts.metadata as never) : undefined,
        outcome: opts.outcome ?? 'SUCCESS',
        requestId: opts.requestId,
      },
    })
  } catch {
    // Never let audit logging failure break the main request
    console.error('[audit] Failed to write audit log:', action, opts.entityType, opts.entityId)
  }
}
