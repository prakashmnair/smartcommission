import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/session'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function OnboardingPage() {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  const firstName = session.name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome, {firstName}!</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Your SmartCommission account is ready. You&apos;re on a 14-day free trial.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-left space-y-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Get started in 3 steps</p>
          {[
            'Create a compensation plan',
            'Add your team members',
            'Import your first transactions',
          ].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {i + 1}
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300">{step}</span>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors w-full"
        >
          Go to Dashboard <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
