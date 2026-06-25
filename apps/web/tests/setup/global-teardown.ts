/**
 * Jest global teardown — runs once after all tests.
 * Removes test Firebase users and DB records seeded in global-setup.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import pg from 'pg'

dotenv.config({ path: path.join(__dirname, '../../.env.local') })

import { TEST_ORG_ID, TEST_USERS, SESSIONS_FILE } from './constants'

function getAdminApp() {
  // Reuse the app created in global-setup if it exists
  const existing = getApps().find(a => a.name === 'sc-test-setup')
  if (existing) return existing
  if (getApps().length > 0) return getApp()
  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    }),
  }, 'sc-test-teardown')
}

export default async function globalTeardown() {
  console.log('\n[sc-test-teardown] Cleaning up Firebase users...')
  const auth = getAuth(getAdminApp())
  for (const { uid } of Object.values(TEST_USERS)) {
    try { await auth.deleteUser(uid) } catch { /* ignore if already gone */ }
  }

  console.log('[sc-test-teardown] Cleaning up DB records...')
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL! })
  await client.connect()
  try {
    // Delete in dependency order (child tables first)
    await client.query(`DELETE FROM users WHERE "organisationId" = $1`, [TEST_ORG_ID])
    await client.query(`DELETE FROM organisations WHERE id = $1`, [TEST_ORG_ID])
  } finally {
    await client.end()
  }

  // Remove session file
  try { fs.unlinkSync(SESSIONS_FILE) } catch { /* ignore */ }

  console.log('[sc-test-teardown] Done.\n')
}
