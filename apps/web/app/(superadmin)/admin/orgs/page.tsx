'use client'
import { useEffect, useState } from 'react'

type Org = {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  createdAt: string
  _count: { users: number; compensationPlans: number; transactions: number }
}

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetch('/api/superadmin/orgs')
      .then(r => r.json())
      .then(d => { setOrgs(d.data ?? []); setTotal(d.meta?.total ?? 0) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Organisations</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{total} total</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  {['Name', 'Slug', 'Plan', 'Status', 'Users', 'Plans', 'Created'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {orgs.map(org => (
                  <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">{org.name}</td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{org.slug}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{org.plan}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${org.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{org._count.users}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{org._count.compensationPlans}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{new Date(org.createdAt).toLocaleDateString()}</td>
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
