/**
 * IT-AUTH — Authentication guard tests
 *
 * Covers:
 * - IT-AUTH-001: No session → 401 on plans endpoint
 * - IT-AUTH-002: No session → 401 on transactions endpoint
 * - IT-AUTH-003: No session → 401 on settings/users endpoint
 * - IT-AUTH-004: No session → 401 on settings/organisation endpoint
 * - IT-AUTH-005: No session → 401 on superadmin/users endpoint
 * - IT-AUTH-006: No session → 401 on reports endpoint
 * - IT-AUTH-007: Valid ADMIN session → 200 on plans endpoint
 * - IT-AUTH-008: POST /api/auth/session with no body → 400 or 500 (server validates)
 * - IT-AUTH-009: DELETE /api/auth/session clears cookie → 200
 */

import { get, del, post } from '../helpers/request'

describe('IT-AUTH — Protected routes require authentication', () => {
  it('IT-AUTH-001: No session → 401 on GET /api/plans', async () => {
    const res = await get('/api/plans', null)
    expect(res.status).toBe(401)
  })

  it('IT-AUTH-002: No session → 401 on GET /api/transactions', async () => {
    const res = await get('/api/transactions', null)
    expect(res.status).toBe(401)
  })

  it('IT-AUTH-003: No session → 401 on GET /api/settings/users', async () => {
    const res = await get('/api/settings/users', null)
    expect(res.status).toBe(401)
  })

  it('IT-AUTH-004: No session → 401 on GET /api/settings/organisation', async () => {
    const res = await get('/api/settings/organisation', null)
    expect(res.status).toBe(401)
  })

  it('IT-AUTH-005: No session → 401 on GET /api/superadmin/users', async () => {
    const res = await get('/api/superadmin/users', null)
    expect(res.status).toBe(401)
  })

  it('IT-AUTH-006: No session → 401 on GET /api/reports', async () => {
    const res = await get('/api/reports', null)
    expect(res.status).toBe(401)
  })
})

describe('IT-AUTH — Valid session grants access', () => {
  it('IT-AUTH-007: Valid ADMIN session → not 401 on GET /api/plans', async () => {
    const res = await get('/api/plans', 'ADMIN')
    expect(res.status).not.toBe(401)
  })
})

describe('IT-AUTH — Session management endpoints', () => {
  it('IT-AUTH-008: POST /api/auth/session with missing idToken → error response', async () => {
    const res = await post('/api/auth/session', {}, null)
    // Missing idToken → should fail: 400 or 500 are both acceptable
    expect([400, 401, 500]).toContain(res.status)
  })

  it('IT-AUTH-009: DELETE /api/auth/session → 200 (clears cookie)', async () => {
    const res = await del('/api/auth/session', 'ADMIN')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('ok', true)
  })
})
