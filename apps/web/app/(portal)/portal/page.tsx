import { getSessionUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { DollarSign, TrendingUp, Calendar } from 'lucide-react'

export default async function PortalPage() {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  const firstName = session.name?.split(' ')[0] ?? 'there'

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Hi, {firstName}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your commission dashboard for the current period.</p>
      </div>

      {/* Attainment gauge placeholder */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-3">Quota Attainment</p>
        <div className="w-24 h-24 rounded-full border-8 border-slate-200 dark:border-slate-700 border-t-indigo-600 mx-auto flex items-center justify-center">
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">—%</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">No quota set for current period</p>
      </div>

      {/* Earnings cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Current Period', value: '$0.00', icon: DollarSign },
          { label: 'YTD Earnings', value: '$0.00', icon: TrendingUp },
          { label: 'Next Payment', value: '—', icon: Calendar },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="text-indigo-600 dark:text-indigo-400" size={16} />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Transactions</h2>
        </div>
        <div className="text-center py-10">
          <p className="text-sm text-slate-500 dark:text-slate-400">No transactions in this period.</p>
        </div>
      </div>
    </div>
  )
}
