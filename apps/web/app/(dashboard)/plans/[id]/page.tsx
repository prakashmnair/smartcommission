'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type Plan = {
  id: string
  name: string
  type: string
  status: string
  effectiveFrom: string
  effectiveTo: string | null
  description: string | null
  currency: string
  version: number
  rules: Array<{ id: string; type: string; description: string | null; config: Record<string, unknown> }>
  participants: Array<{ id: string; user: { id: string; name: string; email: string; role: string }; effectiveFrom: string }>
  _count: { participants: number }
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  REVIEW: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  APPROVED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  PUBLISHED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  ARCHIVED: 'bg-slate-100 dark:bg-slate-800 text-slate-400',
}

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'overview' | 'rules' | 'participants'>('overview')

  useEffect(() => {
    fetch(`/api/plans/${id}`)
      .then(r => r.json())
      .then(d => setPlan(d.data))
      .catch(() => setError('Failed to load plan'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 p-6">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="p-6">
        <Link
          href="/plans"
          aria-label="Back to Plans"
          className="p-1.5 -ml-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="text-center mt-8">
          <p className="text-red-500 text-sm">{error || 'Plan not found'}</p>
        </div>
      </div>
    )
  }

  const tabs = ['overview', 'rules', 'participants'] as const

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/plans"
          aria-label="Back to Plans"
          className="p-1.5 -ml-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{plan.name}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[plan.status] ?? ''}`}>
              {plan.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{plan.type} · v{plan.version}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['Name', plan.name],
              ['Type', plan.type],
              ['Status', plan.status],
              ['Currency', plan.currency],
              ['Effective From', new Date(plan.effectiveFrom).toLocaleDateString()],
              ['Effective To', plan.effectiveTo ? new Date(plan.effectiveTo).toLocaleDateString() : 'Open-ended'],
              ['Participants', String(plan._count.participants)],
              ['Description', plan.description ?? '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{label}</p>
                <p className="mt-0.5 text-sm text-slate-900 dark:text-slate-100">{value}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'rules' && (
          <div>
            {plan.rules.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No rules defined yet.</p>
            ) : (
              <div className="space-y-3">
                {plan.rules.map(rule => (
                  <div key={rule.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{rule.type}</p>
                      {rule.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rule.description}</p>}
                      <pre className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{JSON.stringify(rule.config, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'participants' && (
          <div>
            {plan.participants.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No participants assigned yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Name</th>
                      <th className="text-left py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Role</th>
                      <th className="text-left py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">From</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {plan.participants.map(p => (
                      <tr key={p.id}>
                        <td className="py-3 font-medium text-slate-900 dark:text-slate-100">{p.user.name}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{p.user.role}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{new Date(p.effectiveFrom).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
