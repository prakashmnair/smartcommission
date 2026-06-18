'use client'
import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { signInWithCustomToken, getIdToken } from 'firebase/auth'
import { getClientAuth } from '@/lib/firebase/client'

function SsoCompleteInner() {
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    async function exchange() {
      const token = params.get('token')
      const next = params.get('next') ?? '/dashboard'
      if (!token) {
        router.push('/login?error=sso_failed')
        return
      }
      try {
        const { user } = await signInWithCustomToken(getClientAuth(), token)
        const idToken = await getIdToken(user)
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        })
        if (!res.ok) throw new Error('Session creation failed')
        router.push(next)
      } catch {
        router.push('/login?error=sso_failed')
      }
    }
    exchange()
  }, [params, router])

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 text-sm">Completing sign-in…</p>
      </div>
    </div>
  )
}

export default function SsoCompletePage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full mx-auto" />
        </div>
      </div>
    }>
      <SsoCompleteInner />
    </Suspense>
  )
}
