export const TEST_ORG_ID   = 'test-integ-org-sc-00001'
export const TEST_ORG_SLUG = 'test-integ-org-sc'
export const TEST_ORG_NAME = 'Test Integration Org SC'

/**
 * One Firebase user per role under test.
 * UIDs and emails are stable across runs — global-setup creates/updates them,
 * global-teardown deletes them.
 */
export const TEST_USERS = {
  ADMIN:     { uid: 'test-sc-admin-integ-01',    email: 'test-admin@sc-integ.test' },
  FINANCE:   { uid: 'test-sc-finance-integ-01',  email: 'test-finance@sc-integ.test' },
  MANAGER:   { uid: 'test-sc-manager-integ-01',  email: 'test-manager@sc-integ.test' },
  REP:       { uid: 'test-sc-rep-integ-01',      email: 'test-rep@sc-integ.test' },
  READ_ONLY: { uid: 'test-sc-ro-integ-01',       email: 'test-readonly@sc-integ.test' },
  SUPERADMIN:{ uid: 'test-sc-superadmin-01',     email: 'test-superadmin@sc-integ.test' },
} as const

export type Role = keyof typeof TEST_USERS

export const SESSIONS_FILE = __dirname + '/.sessions.json'
export const TEST_BASE_URL = process.env.TEST_BASE_URL ?? 'http://localhost:3000'
