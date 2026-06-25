'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText, ArrowLeftRight, Target, Calculator,
  DollarSign, CreditCard, AlertCircle, BarChart3,
  Settings, Database, ScrollText, Users, Plug,
  TrendingUp, Calendar, ClipboardList, ChevronRight
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */
type PrimaryTile = {
  href: string
  icon: React.ElementType
  label: string
  desc: string
  color: string        // icon colour
  bg: string          // icon background
  border: string      // card accent border
}

type SecondaryTile = {
  href: string
  icon: React.ElementType
  label: string
}

type TileGroup = {
  label: string
  items: SecondaryTile[]
}

/* ------------------------------------------------------------------ */
/* Primary tiles — 6 most important features (2-col × 3-row grid)     */
/* ------------------------------------------------------------------ */
const primaryTiles: PrimaryTile[] = [
  {
    href: '/plans',
    icon: FileText,
    label: 'Plans',
    desc: 'Design & manage compensation plans',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  {
    href: '/transactions',
    icon: ArrowLeftRight,
    label: 'Transactions',
    desc: 'Import & review deal transactions',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/30',
    border: 'border-violet-200 dark:border-violet-800',
  },
  {
    href: '/calculations',
    icon: Calculator,
    label: 'Calculations',
    desc: 'Run & audit commission calculations',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    href: '/earnings',
    icon: DollarSign,
    label: 'Earnings',
    desc: 'View earnings ledger for all reps',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-800',
  },
  {
    href: '/disputes',
    icon: AlertCircle,
    label: 'Disputes',
    desc: 'Review & resolve earnings disputes',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800',
  },
  {
    href: '/payments',
    icon: CreditCard,
    label: 'Payments',
    desc: 'Approve & export payment runs',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/30',
    border: 'border-rose-200 dark:border-rose-800',
  },
]

/* ------------------------------------------------------------------ */
/* Secondary tiles — grouped by domain                                 */
/* ------------------------------------------------------------------ */
const secondaryGroups: TileGroup[] = [
  {
    label: 'Plan Design',
    items: [
      { href: '/quotas', icon: Target, label: 'Quotas' },
      { href: '/plans/new', icon: ClipboardList, label: 'New Plan' },
    ],
  },
  {
    label: 'Analytics & Reporting',
    items: [
      { href: '/reports', icon: BarChart3, label: 'Reports' },
      { href: '/query-console', icon: Database, label: 'Query Console' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/settings', icon: Settings, label: 'Settings' },
      { href: '/logs', icon: ScrollText, label: 'Audit Logs' },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Stat card                                                            */
/* ------------------------------------------------------------------ */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  href,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  bg: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group"
    >
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${bg} flex-shrink-0`}>
        <Icon className={color} size={20} />
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Primary tile                                                         */
/* ------------------------------------------------------------------ */
function PrimaryTileCard({
  href,
  icon: Icon,
  label,
  desc,
  color,
  bg,
  border,
}: PrimaryTile) {
  return (
    <Link
      href={href}
      className={`bg-white dark:bg-slate-900 border ${border} rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-all group`}
    >
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon className={color} size={20} />
      </div>
      <div>
        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <ChevronRight
        className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors self-end mt-auto"
        size={16}
      />
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Secondary tile                                                       */
/* ------------------------------------------------------------------ */
function SecondaryTileCard({ href, icon: Icon, label }: SecondaryTile) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
    >
      <Icon className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-shrink-0 transition-colors" size={16} />
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
        {label}
      </span>
      <ChevronRight className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 flex-shrink-0 transition-colors" size={14} />
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.data?.name) setUserName(d.data.name.split(' ')[0])
        else if (d?.data?.email) setUserName(d.data.email.split('@')[0])
      })
      .catch(() => {})
  }, [])

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {greeting}{userName ? `, ${userName}` : ''}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Commission management at a glance — select a section to get started.
        </p>
      </div>

      {/* KPI stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Period Earnings"
          value="$0.00"
          icon={DollarSign}
          color="text-indigo-600 dark:text-indigo-400"
          bg="bg-indigo-50 dark:bg-indigo-900/20"
          href="/earnings"
        />
        <StatCard
          label="Team Attainment"
          value="—%"
          icon={TrendingUp}
          color="text-green-600 dark:text-green-400"
          bg="bg-green-50 dark:bg-green-900/20"
          href="/calculations"
        />
        <StatCard
          label="Active Disputes"
          value="0"
          icon={AlertCircle}
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-50 dark:bg-amber-900/20"
          href="/disputes"
        />
        <StatCard
          label="Next Payment Date"
          value="—"
          icon={Calendar}
          color="text-slate-600 dark:text-slate-400"
          bg="bg-slate-100 dark:bg-slate-800"
          href="/payments"
        />
      </div>

      {/* Primary tiles — 2×3 grid */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Core Features
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {primaryTiles.map(tile => (
            <PrimaryTileCard key={tile.href} {...tile} />
          ))}
        </div>
      </section>

      {/* Secondary tiles — grouped */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {secondaryGroups.map(group => (
          <div key={group.label}>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              {group.label}
            </h3>
            <div className="space-y-2">
              {group.items.map(item => (
                <SecondaryTileCard key={item.href} {...item} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Quick-start CTA for empty orgs */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
          <FileText className="text-indigo-600 dark:text-indigo-400" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-indigo-900 dark:text-indigo-100 text-sm">
            Ready to set up commissions?
          </p>
          <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
            Start by creating a compensation plan, then import transactions and run your first calculation.
          </p>
        </div>
        <Link
          href="/plans/new"
          className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          Create a plan
        </Link>
      </div>
    </div>
  )
}
