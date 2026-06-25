/**
 * IT-HEALTH — /api/health endpoint
 *
 * Covers:
 * - IT-HEALTH-001: GET /api/health → 200 without authentication (public endpoint)
 * - IT-HEALTH-002: Response has status: 'ok' and timestamp
 * - IT-HEALTH-003: Response has no-store Cache-Control header (no caching of health state)
 */

import { get } from '../helpers/request'

describe('IT-HEALTH — Health check endpoint', () => {
  it('IT-HEALTH-001: GET /api/health → 200 without session (public endpoint)', async () => {
    const res = await get('/api/health', null)
    expect(res.status).toBe(200)
  })

  it('IT-HEALTH-002: Response body has { status: "ok", timestamp }', async () => {
    const res = await get('/api/health', null)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.timestamp).toBeDefined()
    // timestamp should be a valid ISO 8601 string
    expect(new Date(body.timestamp).getTime()).not.toBeNaN()
  })

  it('IT-HEALTH-003: Cache-Control: no-store header is set', async () => {
    const res = await get('/api/health', null)
    const cc = res.headers.get('cache-control')
    expect(cc).toContain('no-store')
  })
})
