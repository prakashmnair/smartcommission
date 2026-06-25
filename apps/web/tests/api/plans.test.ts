/**
 * IT-PLAN — Compensation plan RBAC + CRUD
 *
 * Covers:
 * - IT-PLAN-001: ADMIN can list plans → 200 with data + meta
 * - IT-PLAN-002: FINANCE can list plans → 200
 * - IT-PLAN-003: MANAGER can list plans → 200
 * - IT-PLAN-004: REP can list plans → 200 (read-only)
 * - IT-PLAN-005: READ_ONLY can list plans → 200
 * - IT-PLAN-006: No session → 401
 * - IT-PLAN-007: ADMIN can create a plan → 201
 * - IT-PLAN-008: FINANCE can create a plan → 201
 * - IT-PLAN-009: REP cannot create a plan → 403
 * - IT-PLAN-010: MANAGER cannot create a plan → 403
 * - IT-PLAN-011: READ_ONLY cannot create a plan → 403
 * - IT-PLAN-012: Create plan with missing required fields → 400
 * - IT-PLAN-013: GET /api/plans/[id] returns 404 for non-existent plan
 * - IT-PLAN-014: ADMIN can update a plan → 200
 * - IT-PLAN-015: REP cannot update a plan → 403
 * - IT-PLAN-016: Pagination meta is returned correctly
 */

import { get, post, patch } from '../helpers/request'

let createdPlanId: string | null = null

const validPlanBody = {
  name: 'Test Commission Plan Q3',
  description: 'Integration test plan',
  type: 'COMMISSION',
  effectiveFrom: '2026-07-01T00:00:00.000Z',
  currency: 'AUD',
}

describe('IT-PLAN — GET /api/plans RBAC', () => {
  it('IT-PLAN-001: ADMIN → 200 with data and meta', async () => {
    const res = await get('/api/plans', 'ADMIN')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('meta')
    expect(body.meta).toHaveProperty('total')
  })

  it('IT-PLAN-002: FINANCE → 200', async () => {
    const res = await get('/api/plans', 'FINANCE')
    expect(res.status).toBe(200)
  })

  it('IT-PLAN-003: MANAGER → 200', async () => {
    const res = await get('/api/plans', 'MANAGER')
    expect(res.status).toBe(200)
  })

  it('IT-PLAN-004: REP → 200 (read-only access)', async () => {
    const res = await get('/api/plans', 'REP')
    expect(res.status).toBe(200)
  })

  it('IT-PLAN-005: READ_ONLY → 200', async () => {
    const res = await get('/api/plans', 'READ_ONLY')
    expect(res.status).toBe(200)
  })

  it('IT-PLAN-006: No session → 401', async () => {
    const res = await get('/api/plans', null)
    expect(res.status).toBe(401)
  })
})

describe('IT-PLAN — POST /api/plans RBAC', () => {
  it('IT-PLAN-007: ADMIN can create a plan → 201', async () => {
    const res = await post('/api/plans', validPlanBody, 'ADMIN')
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(body.data).toHaveProperty('id')
    createdPlanId = body.data.id
  })

  it('IT-PLAN-008: FINANCE can create a plan → 201', async () => {
    const res = await post('/api/plans', {
      ...validPlanBody,
      name: 'Finance Created Plan',
    }, 'FINANCE')
    expect(res.status).toBe(201)
  })

  it('IT-PLAN-009: REP cannot create a plan → 403', async () => {
    const res = await post('/api/plans', validPlanBody, 'REP')
    expect(res.status).toBe(403)
  })

  it('IT-PLAN-010: MANAGER cannot create a plan → 403', async () => {
    const res = await post('/api/plans', validPlanBody, 'MANAGER')
    expect(res.status).toBe(403)
  })

  it('IT-PLAN-011: READ_ONLY cannot create a plan → 403', async () => {
    const res = await post('/api/plans', validPlanBody, 'READ_ONLY')
    expect(res.status).toBe(403)
  })

  it('IT-PLAN-012: Missing required fields → 400', async () => {
    const res = await post('/api/plans', { name: 'No type or date' }, 'ADMIN')
    expect(res.status).toBe(400)
  })
})

describe('IT-PLAN — GET /api/plans/[id]', () => {
  it('IT-PLAN-013: Non-existent plan → 404', async () => {
    const res = await get('/api/plans/non-existent-plan-id-00000', 'ADMIN')
    expect(res.status).toBe(404)
  })

  it('IT-PLAN-013b: Created plan is retrievable by ADMIN', async () => {
    if (!createdPlanId) {
      console.warn('[skip] IT-PLAN-013b: no plan created — IT-PLAN-007 must have passed first')
      return
    }
    const res = await get(`/api/plans/${createdPlanId}`, 'ADMIN')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe(createdPlanId)
    expect(body.data).toHaveProperty('rules')
    expect(body.data).toHaveProperty('participants')
  })
})

describe('IT-PLAN — PATCH /api/plans/[id] RBAC', () => {
  it('IT-PLAN-014: ADMIN can update a plan', async () => {
    if (!createdPlanId) {
      console.warn('[skip] IT-PLAN-014: no plan created')
      return
    }
    const res = await patch(`/api/plans/${createdPlanId}`, { name: 'Updated Plan Name' }, 'ADMIN')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.name).toBe('Updated Plan Name')
  })

  it('IT-PLAN-015: REP cannot update a plan → 403', async () => {
    if (!createdPlanId) {
      console.warn('[skip] IT-PLAN-015: no plan created')
      return
    }
    const res = await patch(`/api/plans/${createdPlanId}`, { name: 'Hacked Name' }, 'REP')
    expect(res.status).toBe(403)
  })
})

describe('IT-PLAN — Pagination', () => {
  it('IT-PLAN-016: Pagination meta is returned correctly', async () => {
    const res = await get('/api/plans?page=1&pageSize=5', 'ADMIN')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.meta).toHaveProperty('page', 1)
    expect(body.meta).toHaveProperty('pageSize', 5)
    expect(body.meta).toHaveProperty('totalPages')
  })
})
