/**
 * IT-RN — Release notes RBAC
 *
 * Covers:
 * - IT-RN-001: All authenticated roles can list published platform release notes → 200
 * - IT-RN-002: No session → 401 on platform release notes
 * - IT-RN-003: SUPERADMIN can create a platform release note → 201
 * - IT-RN-004: ADMIN cannot create platform release notes → 403
 * - IT-RN-005: ADMIN can create tenant release notes → 201
 * - IT-RN-006: REP cannot create tenant release notes → 403
 * - IT-RN-007: SUPERADMIN can access all release note admin routes → 200
 */

import { get, post } from '../helpers/request'

describe('IT-RN — GET /api/release-notes (platform, all users)', () => {
  it('IT-RN-001a: ADMIN → 200', async () => {
    const res = await get('/api/release-notes', 'ADMIN')
    expect(res.status).toBe(200)
  })

  it('IT-RN-001b: REP → 200', async () => {
    const res = await get('/api/release-notes', 'REP')
    expect(res.status).toBe(200)
  })

  it('IT-RN-001c: READ_ONLY → 200', async () => {
    const res = await get('/api/release-notes', 'READ_ONLY')
    expect(res.status).toBe(200)
  })

  it('IT-RN-002: No session → 401', async () => {
    const res = await get('/api/release-notes', null)
    expect(res.status).toBe(401)
  })
})

describe('IT-RN — Platform release note management (superadmin only)', () => {
  let createdNoteId: string | null = null

  it('IT-RN-003: SUPERADMIN can create platform release note → 201', async () => {
    const res = await post('/api/superadmin/release-notes', {
      title: 'Test Release Note',
      summary: 'Integration test release note',
      body: 'This is a test release note body',
      category: 'FEATURE',
      version: '1.0.0-test',
    }, 'SUPERADMIN')
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toHaveProperty('id')
    createdNoteId = body.data.id
  })

  it('IT-RN-004: ADMIN cannot create platform release notes → 403', async () => {
    const res = await post('/api/superadmin/release-notes', {
      title: 'Unauthorized Note',
      summary: 'Should fail',
      category: 'FEATURE',
    }, 'ADMIN')
    expect(res.status).toBe(403)
  })

  it('IT-RN-007: SUPERADMIN can list platform release notes → 200', async () => {
    const res = await get('/api/superadmin/release-notes', 'SUPERADMIN')
    expect(res.status).toBe(200)
  })
})

describe('IT-RN — Tenant release note management (ADMIN only)', () => {
  it('IT-RN-005: ADMIN can create tenant release note → 201', async () => {
    const res = await post('/api/release-notes/tenant', {
      title: 'Tenant Test Note',
      summary: 'Integration test tenant note',
      category: 'IMPROVEMENT',
    }, 'ADMIN')
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toHaveProperty('id')
  })

  it('IT-RN-006: REP cannot create tenant release notes → 403', async () => {
    const res = await post('/api/release-notes/tenant', {
      title: 'Rep Note',
      summary: 'Should fail',
      category: 'FEATURE',
    }, 'REP')
    expect(res.status).toBe(403)
  })
})
