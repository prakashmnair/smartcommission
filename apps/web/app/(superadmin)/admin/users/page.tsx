'use client'
import { useEffect, useState } from 'react'
import { Shield, ShieldOff } from 'lucide-react'

type User = {
  id: string
  name: string
  email: string
  role: string
  status: string
  isSuperAdmin: boolean
  organisation: { name: string; slug: string }
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [working, setWorking] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/superadmin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.data ?? []); setTotal(d.meta?.total ?? 0) })
      .finally(() => setLoading(false))
  }, [])

  async function toggleSuperAdmin(userId: string, current: boolean) {
    setWorking(userId)
    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: current ? 'revoke' : 'grant' }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isSuperAdmin: !current } : u))
      } else {
        const data = await res.json()
        alert(data.error ?? 'Failed')
      }
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Users</h1>
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
                  {['Name', 'Email', 'Org', 'Role', 'Status', 'Superadmin', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">{user.name}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{user.organisation?.name ?? '—'}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{user.role}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {user.isSuperAdmin ? (
                        <Shield className="text-violet-600 dark:text-violet-400" size={16} />
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSuperAdmin(user.id, user.isSuperAdmin)}
                        disabled={working === user.id}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${user.isSuperAdmin ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50'}`}
                      >
                        {user.isSuperAdmin ? <ShieldOff size={12} className="inline mr-1" /> : <Shield size={12} className="inline mr-1" />}
                        {user.isSuperAdmin ? 'Revoke' : 'Grant'}
                      </button>
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
