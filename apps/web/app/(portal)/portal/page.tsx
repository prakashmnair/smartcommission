'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign, TrendingUp, Calendar, ArrowLeftRight,
  FileText, AlertCircle, BookOpen, ChevronRight,
  Calculator
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */
type QuickTile = {
  href: string
  icon: React.ElementType
  label: string
  desc: string
  color: string
  bg: string
  border: string
}

/* ------------------------------------------------------------------ */
/* Quick-action tiles for reps                                          */
/* ------------------------------------------------------------------ */
const quickTiles: QuickTile[] = [
  {
    href: '/portal/transactions',
    icon: ArrowLeftRight,
    label: 'My Transactions',
    desc: 'View all deals credited to you',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  {
    href: '/portal/statements',
    icon: FileText,
    label: 'Statements',
    desc: 'Download your commission statements',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    href: '/portal/disputes',
    icon: AlertCircle,
    label: 'Disputes',
    desc: 'Raise or track a dispute',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800',
  },
  {
    href: '/portal/plan',
    icon: BookOpen,
    label: 'My Plan',
    desc: 'View your compensation plan',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-800',
  },
]

/* ------------------------------------------------------------------ */
/* Attainment gauge                                                     */
/* ------------------------------------------------------------------ */
function AttainmentGauge({ pct }: { pct: number | null }) {
  const label = pct === null ? '—%' : `${pct}%`
  const gaugeColor =
    pct === null
      ? 'border-slate-200 dark:border-slate-700'
      : pct >= 100
      ? 'border-green-500'
      : pct >= 50
      ? 'border-amber-500'
      : 'border-red-400'

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Quota Attainment
      </p>
      <div
        className={`w-24 h-24 rounded-full border-8 ${gaugeColor} border-t-transparent flex items-center justify-center`}
      >
        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{label}</span>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {pct === null ? 'No quota set for current period' : `${pct >= 100 ? 'On target' : 'Below target'} this period`}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Quick tile card                                                      */
/* ------------------------------------------------------------------ */
function QuickTileCard({ href, icon: Icon, label, desc, color, bg, border }: QuickTile) {
  return (
    <Link
      href={href}
      className={`bg-white dark:bg-slate-900 border ${border} rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all group`}
    >
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={color} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{desc}</p>
      </div>
      <ChevronRight
        className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0"
        size={16}
      />
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
export default function PortalPage() {
  const [firstName, setFirstName] = useState('there')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.data?.name) setFirstName(d.data.name.split(' ')[0])
        else if (d?.data?.email) setFirstName(d.data.email.split('@')[0])
      })
      .catch(() => {})
  }, [])

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Hi, {firstName}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your commission dashboard for the current period.
        </p>
      </div>

      {/* Earnings + attainment row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Attainment gauge card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-center">
          <AttainmentGauge pct={null} />
        </div>

        {/* Earnings summary */}
        <div className="space-y-3">
          {[
            {
              label: 'Current Period',
              value: '$0.00',
              icon: DollarSign,
              color: 'text-indigo-600 dark:text-indigo-400',
              bg: 'bg-indigo-50 dark:bg-indigo-900/20',
              href: '/portal',
            },
            {
              label: 'YTD Earnings',
              value: '$0.00',
              icon: TrendingUp,
              color: 'text-green-600 dark:text-green-400',
              bg: 'bg-green-50 dark:bg-green-900/20',
              href: '/portal/statements',
            },
            {
              label: 'Next Payment',
              value: '—',
              icon: Calendar,
              color: 'text-slate-600 dark:text-slate-400',
              bg: 'bg-slate-100 dark:bg-slate-800',
              href: '/portal',
            },
          ].map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link
              key={label}
              href={href}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                <Icon className={color} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{value}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick-action tiles */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickTiles.map(tile => (
            <QuickTileCard key={tile.href} {...tile} />
          ))}
        </div>
      </section>

      {/* Recent transactions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Recent Transactions
          </h2>
          <Link
            href="/portal/transactions"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="text-center py-10">
            <ArrowLeftRight className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={32} />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              No transactions this period
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Closed deals will appear here once processed.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
