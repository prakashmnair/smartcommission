'use client'
import { useEffect, useState } from 'react'

type AuditLog = { id: string; action: string; entityType: string; userId: string | null; tenantId: string | null; outcome: string; createdAt: string }
type SecurityLog = { id: string; event: string; severity: string; userId: string | null; tenantId: string | null; createdAt: string }

const tabs = ['Audit', 'Security'] as const
type Tab = typeof tabs[number]

export default function AdminLogsPage() {
  const [tab, setTab] = useState<Tab>('Audit')
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tab === 'Audit' && auditLogs.length === 0) {
      setLoading(true)
      fetch('/api/superadmin/logs/audit')
        .then(r => r.json())
        .then(d => setAuditLogs(d.data ?? []))
        .finally(() => setLoading(false))
    } else if (tab === 'Security' && securityLogs.length === 0) {
      setLoading(true)
      fetch('/api/superadmin/logs/security')
        .then(r => r.json())
        .then(d => setSecurityLogs(d.data ?? []))
        .finally(() => setLoading(false))
    }
  }, [tab, auditLogs.length, securityLogs.length])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Logs</h1>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-violet-600 text-violet-700 dark:text-violet-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
          </div>
        ) : tab === 'Audit' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  {['Action', 'Entity', 'User', 'Tenant', 'Outcome', 'Time'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {auditLogs.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">No audit logs yet.</td></tr>
                ) : auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-slate-100">{log.action}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.entityType}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{log.userId?.slice(0, 8) ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{log.tenantId?.slice(0, 8) ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${log.outcome === 'SUCCESS' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {log.outcome}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
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
                  {['Event', 'Severity', 'User', 'Tenant', 'Time'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {securityLogs.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">No security logs yet.</td></tr>
                ) : securityLogs.map(log => (
                  <tr key={log.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${log.severity === 'CRITICAL' ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-slate-100">{log.event}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        log.severity === 'WARNING' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{log.userId?.slice(0, 8) ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{log.tenantId?.slice(0, 8) ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
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
