/**
 * HTTP helpers for SmartCommission integration tests.
 * Tests run against a real Next.js server at TEST_BASE_URL.
 */

import * as fs from 'fs'
import { SESSIONS_FILE, TEST_BASE_URL, Role } from '../setup/constants'

let _sessions: Record<string, string> | null = null

export function sessions(): Record<Role, string> {
  if (!_sessions) _sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'))
  return _sessions as Record<Role, string>
}

export function sessionCookie(role: Role): string {
  return sessions()[role]
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function buildHeaders(role?: Role | null, extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra }
  if (role) headers['Cookie'] = `__session=${sessionCookie(role)}`
  return headers
}

export function get(path: string, role?: Role | null): Promise<Response> {
  return fetch(`${TEST_BASE_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(role),
  })
}

export function post(path: string, body: unknown = {}, role?: Role | null): Promise<Response> {
  return fetch(`${TEST_BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(role),
    body: JSON.stringify(body),
  })
}

export function patch(path: string, body: unknown = {}, role?: Role | null): Promise<Response> {
  return fetch(`${TEST_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: buildHeaders(role),
    body: JSON.stringify(body),
  })
}

export function del(path: string, role?: Role | null): Promise<Response> {
  return fetch(`${TEST_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(role),
  })
}

/** Assert expected status with a clear failure message. */
export function expectStatus(res: Response, expected: number, label?: string): void {
  if (res.status !== expected) {
    throw new Error(`${label ?? res.url} — expected HTTP ${expected}, got ${res.status}`)
  }
}
