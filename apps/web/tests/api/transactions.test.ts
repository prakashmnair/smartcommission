/**
 * IT-TXN — Transaction RBAC + CRUD
 *
 * Covers:
 * - IT-TXN-001: All roles can list transactions → 200
 * - IT-TXN-002: No session → 401
 * - IT-TXN-003: ADMIN can create a transaction → 201
 * - IT-TXN-004: FINANCE can create a transaction → 201
 * - IT-TXN-005: MANAGER can create a transaction → 201
 * - IT-TXN-006: REP cannot create a transaction → 403
 * - IT-TXN-007: READ_ONLY cannot create a transaction → 403
 * - IT-TXN-008: Missing required fields → 400
 * - IT-TXN-009: Pagination meta is returned
 * - IT-TXN-010: Filter by sourceSystem returns subset
 * - IT-TXN-011: SQL injection in ?sourceSystem → safe 200
 */

import { get, post } from '../helpers/request'

const validTxnBody = {
  dealName: 'Test Deal Integration',
  amount: 50000,
  currency: 'AUD',
  closeDate: '2026-07-15T00:00:00.000Z',
  type: 'DEAL',
  sourceSystem: 'MANUAL',
  accountName: 'Acme Corp',
  productName: 'Enterprise Suite',
}

describe('IT-TXN — GET /api/transactions RBAC', () => {
  it('IT-TXN-001: ADMIN → 200 with data and meta', async () => {
    const res = await get('/api/transactions', 'ADMIN')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('meta')
  })

  it('IT-TXN-001b: REP → 200', async () => {
    const res = await get('/api/transactions', 'REP')
    expect(res.status).toBe(200)
  })

  it('IT-TXN-001c: READ_ONLY → 200', async () => {
    const res = await get('/api/transactions', 'READ_ONLY')
    expect(res.status).toBe(200)
  })

  it('IT-TXN-002: No session → 401', async () => {
    const res = await get('/api/transactions', null)
    expect(res.status).toBe(401)
  })
})

describe('IT-TXN — POST /api/transactions RBAC', () => {
  it('IT-TXN-003: ADMIN can create a transaction → 201', async () => {
    const res = await post('/api/transactions', validTxnBody, 'ADMIN')
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toHaveProperty('id')
    expect(body.data.dealName).toBe('Test Deal Integration')
  })

  it('IT-TXN-004: FINANCE can create a transaction → 201', async () => {
    const res = await post('/api/transactions', {
      ...validTxnBody,
      dealName: 'Finance Created Deal',
    }, 'FINANCE')
    expect(res.status).toBe(201)
  })

  it('IT-TXN-005: MANAGER can create a transaction → 201', async () => {
    const res = await post('/api/transactions', {
      ...validTxnBody,
      dealName: 'Manager Created Deal',
    }, 'MANAGER')
    expect(res.status).toBe(201)
  })

  it('IT-TXN-006: REP cannot create a transaction → 403', async () => {
    const res = await post('/api/transactions', validTxnBody, 'REP')
    expect(res.status).toBe(403)
  })

  it('IT-TXN-007: READ_ONLY cannot create a transaction → 403', async () => {
    const res = await post('/api/transactions', validTxnBody, 'READ_ONLY')
    expect(res.status).toBe(403)
  })

  it('IT-TXN-008: Missing required fields → 400', async () => {
    const res = await post('/api/transactions', { dealName: 'Missing fields' }, 'ADMIN')
    expect(res.status).toBe(400)
  })
})

describe('IT-TXN — Filtering and pagination', () => {
  it('IT-TXN-009: Pagination meta returned correctly', async () => {
    const res = await get('/api/transactions?page=1&pageSize=10', 'ADMIN')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.meta.page).toBe(1)
    expect(body.meta.pageSize).toBe(10)
  })

  it('IT-TXN-010: Filter by sourceSystem=MANUAL returns 200', async () => {
    const res = await get('/api/transactions?sourceSystem=MANUAL', 'ADMIN')
    expect(res.status).toBe(200)
    const body = await res.json()
    // All results should have sourceSystem=MANUAL
    const data = body.data as Array<{ sourceSystem: string }>
    data.forEach(txn => expect(txn.sourceSystem).toBe('MANUAL'))
  })

  it('IT-TXN-011: SQL injection in ?sourceSystem returns safe 200', async () => {
    const res = await get(`/api/transactions?sourceSystem=${encodeURIComponent("' OR '1'='1")}`, 'ADMIN')
    // Prisma parameterises queries — should return 200 with empty or normal result, never 500
    expect(res.status).toBe(200)
  })
})
