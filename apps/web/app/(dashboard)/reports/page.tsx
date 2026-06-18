'use client'
import { useEffect, useState } from 'react'
import { BarChart3, Play, Download, Tag, Clock, Loader2, X, AlertCircle, CheckCircle } from 'lucide-react'

type Report = {
  id: string
  reportName: string | null
  reportDesc: string | null
  tags: string[]
  runCount: number
  lastRunAt: string | null
  publishedAt: string | null
  parameters: unknown
}

type RunResult = {
  runId: string
  rows: Record<string, unknown>[]
  columnNames: string[]
  rowCount: number
  executionMs: number
  limitReached: boolean
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Report | null>(null)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [runError, setRunError] = useState('')

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then(data => { if (data.data) setReports(data.data) })
      .finally(() => setLoading(false))
  }, [])

  async function runReport(report: Report) {
    setSelected(report)
    setRunning(true)
    setRunError('')
    setResult(null)
    try {
      const res = await fetch(`/api/query-console/queries/${report.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) { setRunError(data.error ?? 'Failed'); return }
      setResult(data.data)
    } catch {
      setRunError('Request failed')
    } finally {
      setRunning(false)
    }
  }

  function closeModal() {
    setSelected(null)
    setResult(null)
    setRunError('')
    setRunning(false)
  }

  function formatDate(d: string | null) {
    if (!d) return 'Never'
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
          <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Run published reports — no SQL needed</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <BarChart3 size={40} className="text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No reports published yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Admins can publish saved queries as reports from the Query Console.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(report => (
            <div
              key={report.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {report.reportName ?? 'Untitled Report'}
                </h3>
                {report.reportDesc && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{report.reportDesc}</p>
                )}
              </div>

              {report.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {report.tags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full"
                    >
                      <Tag size={8} />{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                <Clock size={10} />
                Last run: {formatDate(report.lastRunAt)}
                <span className="ml-auto">{report.runCount} runs</span>
              </div>

              <button
                onClick={() => runReport(report)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                <Play size={14} /> Run
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Run modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90dvh] flex flex-col gap-4">
            <div className="flex items-center justify-between flex-shrink-0">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">
                {selected.reportName ?? 'Run Report'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {running && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm py-8 justify-center">
                <Loader2 size={18} className="animate-spin text-indigo-500" />
                Running…
              </div>
            )}

            {runError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                <AlertCircle size={16} />{runError}
              </div>
            )}

            {result && !running && (
              <div className="flex flex-col gap-3 flex-1 min-h-0">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-500" />
                    {result.rowCount} rows &bull; {result.executionMs}ms
                  </span>
                  {result.limitReached && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                      1,000 rows (limit reached)
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <a
                      href={`/api/query-console/runs/${result.runId}/export?format=csv`}
                      className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download size={12} /> CSV
                    </a>
                    <a
                      href={`/api/query-console/runs/${result.runId}/export?format=json`}
                      className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download size={12} /> JSON
                    </a>
                  </div>
                </div>

                {result.rows.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">No results returned</div>
                ) : (
                  <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 flex-1">
                    <table className="text-xs w-full">
                      <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                        <tr>
                          {result.columnNames.map(col => (
                            <th key={col} className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap border-b border-slate-200 dark:border-slate-700">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            {result.columnNames.map(col => (
                              <td key={col} className="px-3 py-1.5 text-slate-700 dark:text-slate-300 whitespace-nowrap max-w-[200px] truncate" title={String(row[col] ?? '')}>
                                {row[col] === null ? <span className="text-slate-400 italic">null</span> : String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {!result && !running && !runError && (
              <button
                onClick={() => runReport(selected)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <Play size={14} /> Run Report
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
