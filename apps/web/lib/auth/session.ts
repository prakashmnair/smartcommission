import 'server-only'
import { cookies } from 'next/headers'
import { getFirebaseAdmin } from '@/lib/firebase/admin'

export interface SessionUser {
  uid: string
  email: string
  name?: string
}

export async function getSessionUser(_req?: unknown): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('__session')?.value
    if (!sessionCookie) return null
    const adminAuth = getFirebaseAdmin()
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    return { uid: decoded.uid, email: decoded.email ?? '', name: decoded.name }
  } catch {
    return null
  }
}
