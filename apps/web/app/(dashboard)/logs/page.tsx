'use client'
import { useEffect, useState, useCallback } from 'react'
import Papa from 'papaparse'
import { ScrollText, ChevronLeft, ChevronRight, Download } from 'lucide-react'

type AuditLog = {
  id: string
  action: string
  entityType: string
  entityId: string | null
  userId: string | null
  userEmail: string | null
  outcome: string
  createdAt: string
}

type SecurityLog = {
  id: string
  event: string
  severity: string
  userId: string | null
  userEmail: string | null
  details: Record<string, unknown> | null
  createdAt: string
}

type OrgOption = { id: string; name: string }

const tabs = ['Audit', 'Security'] as const
type Tab = typeof tabs[number]

const severityOptions = ['', 'INFO', 'WARNING', 'CRITICAL'] as const

export default function LogsPage() {
  const [tab, setTab] = useState<Tab>('Audit')
  const [orgId, setOrgId] = useState<string | null>(null)
  const [adminOrgs, setAdminOrgs] = useState<OrgOption[]>([])
  const [logs, setLogs] = useState<AuditLog[] | SecurityLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [actionFilter, setActionFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [fromFilter, setFromFilter] = useState('')
  const [toFilter, setToFilter] = useState('')

  const limit = 50

  // Fetch current org and role
  useEffect(() => {
    Promise.all([
      fetch('/api/settings/organisation').then(r => r.json()),
      fetch('/api/settings/users').then(r => r.json()),
    ]).then(([orgRes]) => {
      if (orgRes.data?.id) {
        setOrgId(orgRes.data.id)
        setAdminOrgs([{ id: orgRes.data.id, name: orgRes.data.name }])
      }
    }).catch(() => setError('Failed to load organisation'))
  }, [])

  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ page: String(page) })
    if (tab === 'Audit' && actionFilter) params.set('action', actionFilter)
    if (tab === 'Security' && actionFilter) params.set('event', actionFilter)
    if (tab === 'Security' && severityFilter) params.set('severity', severityFilter)
    if (fromFilter) params.set('from', fromFilter)
    if (toFilter) params.set('to', toFilter)
    return params
  }, [page, tab, actionFilter, severityFilter, fromFilter, toFilter])

  const fetchLogs = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    setError(null)
    const params = buildParams()
    const endpoint = tab === 'Audit'
      ? `/api/organisations/${orgId}/logs/audit?${params}`
      : `/api/organisations/${orgId}/logs/security?${params}`
    try {
      const res = await fetch(endpoint)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Failed to load logs')
        return
      }
      const data = await res.json()
      setLogs(data.data ?? [])
      setTotal(data.meta?.total ?? 0)
    } catch {
      setError('Failed to load logs')
    } finally {
      setLoading(false)
    }
  }, [orgId, tab, buildParams])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Reset page when filters or tab change
  useEffect(() => {
    setPage(1)
  }, [tab, actionFilter, severityFilter, fromFilter, toFilter])

  function handleExportCsv() {
    if (!logs.length) return
    const csv = Papa.unparse(
      logs.map((l) => {
        if (tab === 'Audit') {
          const al = l as AuditLog
          return {
            timestamp: al.createdAt,
            action: al.action,
            entityType: al.entityType,
            entityId: al.entityId ?? '',
            userId: al.userId ?? '',
            outcome: al.outcome,
          }
        } else {
          const sl = l as SecurityLog
          return {
            timestamp: sl.createdAt,
            event: sl.event,
            severity: sl.severity,
            userId: sl.userId ?? '',
            details: sl.details ? JSON.stringify(sl.details) : '',
          }
        }
      })
    )
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tab.toLowerCase()}-logs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText size={22} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Logs</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch-organisation dropdown — only shown if admin of 2+ orgs */}
          {adminOrgs.length > 1 && (
            <select
              className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              value={orgId ?? ''}
              onChange={e => { setOrgId(e.target.value); setPage(1) }}
            >
              {adminOrgs.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportCsv}
            disabled={logs.length === 0}
            className="flex items-center gap-2 rounded-xl font-bold px-5 py-2.5 text-sm transition-colors bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={tab === 'Audit' ? 'Filter by action…' : 'Filter by event…'}
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 w-48"
        />
        {tab === 'Security' && (
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          >
            <option value="">All severities</option>
            {severityOptions.filter(Boolean).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
        <input
          type="date"
          value={fromFilter}
          onChange={e => setFromFilter(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
        />
        <input
          type="date"
          value={toFilter}
          onChange={e => setToFilter(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
        />
        {(actionFilter || severityFilter || fromFilter || toFilter) && (
          <button
            onClick={() => { setActionFilter(''); setSeverityFilter(''); setFromFilter(''); setToFilter('') }}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-slate-500 dark:text-slate-400">{error}</p>
            <button
              onClick={fetchLogs}
              className="rounded-xl font-bold px-5 py-2.5 text-sm transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
          </div>
        ) : tab === 'Audit' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  {['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User ID', 'Outcome'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {(logs as AuditLog[]).length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">No audit logs found.</td></tr>
                ) : (logs as AuditLog[]).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-slate-100">{log.action}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.entityType}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{log.entityId?.slice(0, 8) ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{log.userId?.slice(0, 8) ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.outcome === 'SUCCESS'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {log.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  {['Timestamp', 'Event', 'Severity', 'User ID', 'Details'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {(logs as SecurityLog[]).length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">No security logs found.</td></tr>
                ) : (logs as SecurityLog[]).map(log => (
                  <tr key={log.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${log.severity === 'CRITICAL' ? 'bg-red-50 dark:bg-red-950' : ''}`}>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-slate-100">{log.event}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.severity === 'CRITICAL'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : log.severity === 'WARNING'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{log.userId?.slice(0, 8) ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1 rounded-xl font-bold px-4 py-2 text-sm transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} /> Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 rounded-xl font-bold px-4 py-2 text-sm transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
