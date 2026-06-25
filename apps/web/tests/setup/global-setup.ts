/**
 * Jest global setup — runs once before all tests in a fresh Node.js process.
 *
 * Responsibilities:
 * 1. Create Firebase test users via Admin SDK
 * 2. Seed test organisation + user records in the DB
 * 3. Mint Firebase session cookies for each role
 * 4. Write sessions to a temp JSON file for tests to read
 *
 * Prerequisites:
 * - Environment must have FIREBASE_* vars and DATABASE_URL set
 * - The Next.js dev/prod server must be running at TEST_BASE_URL (default: localhost:3000)
 * - Cloud SQL proxy must be running if using local DB
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import pg from 'pg'

dotenv.config({ path: path.join(__dirname, '../../.env.local') })

import { TEST_ORG_ID, TEST_ORG_SLUG, TEST_ORG_NAME, TEST_USERS, SESSIONS_FILE } from './constants'

async function getAdminApp() {
  if (getApps().length > 0) return getApp()
  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    }),
  }, 'sc-test-setup')
}

async function getIdTokenFromCustomToken(customToken: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY not set')

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  )
  const data = await res.json() as { idToken?: string; error?: { message: string } }
  if (!data.idToken) throw new Error(`Firebase token exchange failed: ${JSON.stringify(data.error)}`)
  return data.idToken
}

async function seedDatabase(client: pg.Client) {
  // Create the test organisation
  await client.query(`
    INSERT INTO organisations (
      id, name, slug, "baseCurrency", timezone, status, plan, "trialEndsAt",
      "createdAt", "updatedAt"
    ) VALUES ($1, $2, $3, 'AUD', 'Australia/Sydney', 'ACTIVE', 'TRIAL',
      NOW() + INTERVAL '14 days', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `, [TEST_ORG_ID, TEST_ORG_NAME, TEST_ORG_SLUG])

  // Create one user per role
  const roleMap = {
    ADMIN:     'ADMIN',
    FINANCE:   'FINANCE',
    MANAGER:   'MANAGER',
    REP:       'REP',
    READ_ONLY: 'READ_ONLY',
    SUPERADMIN:'ADMIN',   // superadmin is also ADMIN role in the org; isSuperAdmin=true
  }

  for (const [key, { uid, email }] of Object.entries(TEST_USERS)) {
    const dbRole = roleMap[key as keyof typeof TEST_USERS]
    const isSuperAdmin = key === 'SUPERADMIN'
    await client.query(`
      INSERT INTO users (
        id, "organisationId", "firebaseUid", email, name, role, status, "isSuperAdmin",
        "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'ACTIVE', $7, NOW(), NOW()
      )
      ON CONFLICT ("firebaseUid") DO UPDATE
        SET "organisationId" = $2, email = $4, role = $6, "isSuperAdmin" = $7
    `, [`${TEST_ORG_ID}-user-${key.toLowerCase()}`, TEST_ORG_ID, uid, email, `Test ${key}`, dbRole, isSuperAdmin])
  }
}

export default async function globalSetup() {
  console.log('\n[sc-test-setup] Initialising Firebase Admin...')
  const app = await getAdminApp()
  const auth = getAuth(app)

  // Create or update Firebase test users
  console.log('[sc-test-setup] Creating Firebase test users...')
  for (const { uid, email } of Object.values(TEST_USERS)) {
    try {
      await auth.createUser({ uid, email, displayName: `Test ${uid.split('-')[2]}`, emailVerified: true })
    } catch (e: any) {
      if (e.code === 'auth/uid-already-exists') {
        await auth.updateUser(uid, { email, emailVerified: true })
      } else {
        throw e
      }
    }
  }

  // Mint session cookies for each role
  console.log('[sc-test-setup] Minting session cookies...')
  const sessions: Record<string, string> = {}
  const expiresIn = 60 * 60 * 24 * 14 * 1000 // 14 days

  for (const [role, { uid }] of Object.entries(TEST_USERS)) {
    const customToken = await auth.createCustomToken(uid)
    const idToken     = await getIdTokenFromCustomToken(customToken)
    const cookie      = await auth.createSessionCookie(idToken, { expiresIn })
    sessions[role]    = cookie
    console.log(`[sc-test-setup]   ${role}: cookie minted`)
  }

  // Seed database
  console.log('[sc-test-setup] Seeding test database...')
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL! })
  await client.connect()
  try {
    await seedDatabase(client)
  } finally {
    await client.end()
  }

  // Write session cookies for test files to read
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2))

  console.log('[sc-test-setup] Setup complete.\n')
}
