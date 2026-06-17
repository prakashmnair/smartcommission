'use client'
import { useEffect, useState } from 'react'

type OrgData = {
  id: string
  name: string
  baseCurrency: string
  timezone: string
  slug: string
  plan: string
}

type User = {
  id: string
  name: string
  email: string
  role: string
  status: string
}

const tabs = ['Organisation', 'Team', 'API Keys'] as const
type Tab = typeof tabs[number]

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('Organisation')
  const [org, setOrg] = useState<OrgData | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; keyPrefix: string; scopes: string[]; createdAt: string }>>([])
  const [loading, setLoading] = useState(true)

  // Org form
  const [orgName, setOrgName] = useState('')
  const [currency, setCurrency] = useState('')
  const [timezone, setTimezone] = useState('')
  const [saving, setSaving] = useState(false)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('REP')
  const [inviting, setInviting] = useState(false)

  // API key form
  const [keyName, setKeyName] = useState('')
  const [creatingKey, setCreatingKey] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/organisation').then(r => r.json()),
      fetch('/api/settings/users').then(r => r.json()),
      fetch('/api/settings/api-keys').then(r => r.json()),
    ]).then(([orgRes, usersRes, keysRes]) => {
      if (orgRes.data) {
        setOrg(orgRes.data)
        setOrgName(orgRes.data.name)
        setCurrency(orgRes.data.baseCurrency)
        setTimezone(orgRes.data.timezone)
      }
      setUsers(usersRes.data ?? [])
      setApiKeys(keysRes.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  async function handleSaveOrg(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/settings/organisation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName, baseCurrency: currency, timezone }),
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    try {
      const res = await fetch('/api/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(prev => [...prev, { id: data.data.id, name: inviteEmail, email: inviteEmail, role: inviteRole, status: 'INACTIVE' }])
        setInviteEmail('')
      }
    } finally {
      setInviting(false)
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault()
    setCreatingKey(true)
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName }),
      })
      const data = await res.json()
      if (res.ok) {
        setNewKey(data.data.key)
        setApiKeys(prev => [...prev, { id: data.data.id, name: keyName, keyPrefix: data.data.keyPrefix, scopes: ['read'], createdAt: new Date().toISOString() }])
        setKeyName('')
      }
    } finally {
      setCreatingKey(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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
        {tab === 'Organisation' && (
          <form onSubmit={handleSaveOrg} className="space-y-4 max-w-md">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Organisation Settings</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organisation name</label>
              <input value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Base currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100">
                <option>AUD</option><option>USD</option><option>GBP</option><option>EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Timezone</label>
              <input value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan</label>
              <p className="text-sm text-slate-900 dark:text-slate-100">{org?.plan ?? '—'}</p>
            </div>
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : null}
              Save changes
            </button>
          </form>
        )}

        {tab === 'Team' && (
          <div className="space-y-6">
            <form onSubmit={handleInvite} className="flex gap-3 items-end max-w-xl">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required placeholder="colleague@company.com" className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100">
                  <option value="REP">REP</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="FINANCE">FINANCE</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="READ_ONLY">READ_ONLY</option>
                </select>
              </div>
              <button type="submit" disabled={inviting} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 whitespace-nowrap">
                {inviting ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : null}
                Invite user
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    {['Name', 'Email', 'Role', 'Status'].map(h => (
                      <th key={h} className="text-left py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">{u.name}</td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">{u.role}</span>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{u.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'API Keys' && (
          <div className="space-y-6">
            {newKey && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Your new API key (copy now — shown once):</p>
                <code className="text-sm font-mono text-green-900 dark:text-green-100 break-all">{newKey}</code>
                <button onClick={() => setNewKey(null)} className="mt-2 block text-xs text-green-700 dark:text-green-400 hover:underline">Dismiss</button>
              </div>
            )}

            <form onSubmit={handleCreateKey} className="flex gap-3 items-end max-w-md">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key name</label>
                <input value={keyName} onChange={e => setKeyName(e.target.value)} required placeholder="e.g. CI/CD pipeline" className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100" />
              </div>
              <button type="submit" disabled={creatingKey} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 whitespace-nowrap">
                {creatingKey ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : null}
                Create key
              </button>
            </form>

            {apiKeys.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No API keys yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      {['Name', 'Prefix', 'Scopes', 'Created'].map(h => (
                        <th key={h} className="text-left py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {apiKeys.map(k => (
                      <tr key={k.id}>
                        <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">{k.name}</td>
                        <td className="py-3 pr-4 font-mono text-slate-600 dark:text-slate-400">{k.keyPrefix}…</td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{k.scopes.join(', ')}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{new Date(k.createdAt).toLocaleDateString()}</td>
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
