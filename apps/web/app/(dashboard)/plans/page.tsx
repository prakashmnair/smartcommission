'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'

type Plan = {
  id: string
  name: string
  type: string
  status: string
  effectiveFrom: string
  effectiveTo: string | null
  _count: { participants: number }
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  REVIEW: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  APPROVED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  PUBLISHED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  ARCHIVED: 'bg-slate-100 dark:bg-slate-800 text-slate-400',
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/plans')
      .then(r => r.json())
      .then(d => setPlans(d.data ?? []))
      .catch(() => setError('Failed to load plans'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Compensation Plans</h1>
        <Link
          href="/plans/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          New Plan
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium">Try again</button>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No plans yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Create your first compensation plan.</p>
            <Link href="/plans/new" className="mt-4 inline-flex bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Create plan
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Effective From</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Participants</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {plans.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{plan.name}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{plan.type}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[plan.status] ?? ''}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(plan.effectiveFrom).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{plan._count.participants}</td>
                    <td className="px-4 py-4">
                      <Link href={`/plans/${plan.id}`} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
