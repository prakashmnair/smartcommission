import { getSessionUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { DollarSign, TrendingUp, AlertCircle, Calendar } from 'lucide-react'

const statCards = [
  {
    label: 'Current Period Earnings',
    value: '$0.00',
    icon: DollarSign,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    label: 'Team Attainment',
    value: '—%',
    icon: TrendingUp,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    label: 'Active Disputes',
    value: '0',
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    label: 'Next Payment Date',
    value: '—',
    icon: Calendar,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800',
  },
]

export default async function DashboardPage() {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = session.name?.split(' ')[0] ?? session.email

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Here&apos;s what&apos;s happening with your commission plans today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={color} size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Transactions</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No transactions yet.</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
              Import transactions or add them manually to get started.
            </p>
          </div>
        </div>
      </div>

      {/* Plan health */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Plan Health</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No active plans.</p>
            <a
              href="/plans/new"
              className="mt-3 inline-flex bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Create your first plan
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
