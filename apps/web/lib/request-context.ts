import { NextRequest } from 'next/server'

export function getRequestContext(req: NextRequest) {
  return {
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
               ?? req.headers.get('x-real-ip')
               ?? undefined,
    userAgent: req.headers.get('user-agent') ?? undefined,
    requestId: req.headers.get('x-request-id') ?? crypto.randomUUID(),
  }
}
