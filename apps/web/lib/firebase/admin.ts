import 'server-only'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'

let adminAuth: Auth | null = null

export function getFirebaseAdmin(): Auth {
  if (!adminAuth) {
    const app = getApps().find(a => a.name === 'smartcommission') ?? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    }, 'smartcommission')
    adminAuth = getAuth(app)
  }
  return adminAuth
}
