import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/health
 *
 * Lightweight health-check endpoint used by:
 * - GCP Cloud Monitoring uptime checks
 * - Cloud Run readiness probes
 * - Local dev-local.sh warm-up loop
 *
 * Returns 200 { status: 'ok' } when DB is reachable.
 * Returns 503 { status: 'error' } when DB is unreachable.
 *
 * No authentication required — this must be publicly accessible
 * for uptime checks to work without credentials.
 */
export async function GET() {
  try {
    // Lightweight DB probe — a single raw query that costs almost nothing
    await db.$queryRaw`SELECT 1`
    return NextResponse.json(
      { status: 'ok', timestamp: new Date().toISOString() },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[health] DB unreachable:', err)
    return NextResponse.json(
      { status: 'error', message: 'Database unreachable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
