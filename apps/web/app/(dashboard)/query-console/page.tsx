'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import {
  Play, Save, X, Database, ChevronRight, Download, Loader2,
  AlertCircle, CheckCircle, BookOpen, Share2, EyeOff
} from 'lucide-react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type SavedQuery = {
  id: string
  name: string
  description?: string | null
  tags: string[]
  isPublished: boolean
  visibility: string
  runCount: number
  lastRunAt?: string | null
  updatedAt: string
}

type RunResult = {
  runId: string
  rows: Record<string, unknown>[]
  columnNames: string[]
  rowCount: number
  executionMs: number
  limitReached: boolean
}

type ModalType = 'save' | 'publish' | null

export default function QueryConsolePage() {
  const { resolvedTheme } = useTheme()
  const [sql, setSql] = useState('SELECT * FROM organisations LIMIT 10')
  const [queries, setQueries] = useState<SavedQuery[]>([])
  const [selectedQuery, setSelectedQuery] = useState<SavedQuery | null>(null)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [runError, setRunError] = useState('')
  const [modal, setModal] = useState<ModalType>(null)
  const [loading, setLoading] = useState(true)

  // Save modal state
  const [saveName, setSaveName] = useState('')
  const [saveDesc, setSaveDesc] = useState('')
  const [saveTags, setSaveTags] = useState('')
  const [saving, setSaving] = useState(false)

  // Publish modal state
  const [reportName, setReportName] = useState('')
  const [reportDesc, setReportDesc] = useState('')
  const [visibility, setVisibility] = useState('ORG_MEMBERS')
  const [publishing, setPublishing] = useState(false)
  const [shareToken, setShareToken] = useState('')

  const editorRef = useRef<unknown>(null)

  useEffect(() => {
    fetchQueries()
  }, [])

  async function fetchQueries() {
    setLoading(true)
    try {
      const res = await fetch('/api/query-console/queries')
      const data = await res.json()
      if (res.ok) setQueries(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  const runQuery = useCallback(async () => {
    if (!sql.trim() || running) return
    setRunning(true)
    setRunError('')
    setResult(null)
    try {
      const res = await fetch('/api/query-console/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, savedQueryId: selectedQuery?.id }),
      })
      const data = await res.json()
      if (!res.ok) { setRunError(data.error ?? 'Query failed'); return }
      setResult(data.data)
    } catch {
      setRunError('Request failed')
    } finally {
      setRunning(false)
    }
  }, [sql, running, selectedQuery?.id])

  async function handleSave() {
    if (!saveName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(
        selectedQuery ? `/api/query-console/queries/${selectedQuery.id}` : '/api/query-console/queries',
        {
          method: selectedQuery ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: saveName,
            description: saveDesc || null,
            sql,
            tags: saveTags.split(',').map(t => t.trim()).filter(Boolean),
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) return
      setModal(null)
      await fetchQueries()
      if (!selectedQuery) setSelectedQuery(data.data)
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    if (!selectedQuery) return
    setPublishing(true)
    setShareToken('')
    try {
      const res = await fetch(`/api/query-console/queries/${selectedQuery.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportName, reportDesc, visibility }),
      })
      const data = await res.json()
      if (!res.ok) return
      if (data.data?.shareToken) setShareToken(data.data.shareToken)
      await fetchQueries()
      if (!data.data?.shareToken) setModal(null)
    } finally {
      setPublishing(false)
    }
  }

  async function handleUnpublish(id: string) {
    await fetch(`/api/query-console/queries/${id}/unpublish`, { method: 'POST' })
    await fetchQueries()
  }

  function loadQuery(q: SavedQuery) {
    setSelectedQuery(q)
    setSaveName(q.name)
    setSaveDesc(q.description ?? '')
    setSaveTags(q.tags.join(', '))
    // Load full SQL
    fetch(`/api/query-console/queries/${q.id}`)
      .then(r => r.json())
      .then(data => { if (data.data?.sql) setSql(data.data.sql) })
  }

  function openSaveModal() {
    setSaveName(selectedQuery?.name ?? '')
    setSaveDesc(selectedQuery?.description ?? '')
    setSaveTags(selectedQuery?.tags.join(', ') ?? '')
    setModal('save')
  }

  function openPublishModal() {
    setReportName(selectedQuery?.name ?? '')
    setReportDesc('')
    setVisibility('ORG_MEMBERS')
    setShareToken('')
    setModal('publish')
  }

  function handleEditorMount(editor: unknown) {
    editorRef.current = editor
    // Cmd+Enter / Ctrl+Enter to run
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = editor as any
    e.addCommand(
      // Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.Enter = 2048 | 3
      2048 | 3,
      () => runQuery()
    )
  }

  return (
    <div className="flex h-[calc(100dvh-0px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Saved Queries</span>
          </div>
          <button
            onClick={() => { setSelectedQuery(null); setSql(''); setResult(null); setRunError('') }}
            className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors"
          >
            <X size={12} /> New Query
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={16} className="animate-spin text-indigo-500" />
            </div>
          ) : queries.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No saved queries yet</p>
          ) : queries.map(q => (
            <button
              key={q.id}
              onClick={() => loadQuery(q)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors group ${
                selectedQuery?.id === q.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ChevronRight size={10} className="flex-shrink-0" />
                <span className="truncate font-medium">{q.name}</span>
                {q.isPublished && <Share2 size={10} className="flex-shrink-0 text-indigo-400" />}
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 pl-4">
                {q.runCount} runs
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Editor */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div style={{ height: 280 }}>
            <MonacoEditor
              height={280}
              language="sql"
              theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
              value={sql}
              onChange={v => setSql(v ?? '')}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={runQuery}
              disabled={running || !sql.trim()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors"
            >
              {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              Run
            </button>
            <button
              onClick={openSaveModal}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <Save size={14} /> Save
            </button>
            {selectedQuery && !selectedQuery.isPublished && (
              <button
                onClick={openPublishModal}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                <Share2 size={14} /> Publish
              </button>
            )}
            {selectedQuery?.isPublished && (
              <button
                onClick={() => handleUnpublish(selectedQuery.id)}
                className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 px-2 py-2 rounded-lg transition-colors"
              >
                <EyeOff size={14} /> Unpublish
              </button>
            )}
            <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
              Cmd+Enter to run
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 p-4">
          {running && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm py-8 justify-center">
              <Loader2 size={18} className="animate-spin text-indigo-500" />
              Running query…
            </div>
          )}

          {runError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              <AlertCircle size={16} />
              {runError}
            </div>
          )}

          {result && !running && (
            <div className="flex flex-col h-full">
              {/* Footer stats + export */}
              <div className="flex items-center gap-3 mb-2 flex-shrink-0">
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
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                  No results returned
                </div>
              ) : (
                <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <table className="text-xs w-full">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                      <tr>
                        {result.columnNames.map(col => (
                          <th
                            key={col}
                            className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap border-b border-slate-200 dark:border-slate-700"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          {result.columnNames.map(col => (
                            <td
                              key={col}
                              className="px-3 py-1.5 text-slate-700 dark:text-slate-300 whitespace-nowrap max-w-[200px] truncate"
                              title={String(row[col] ?? '')}
                            >
                              {row[col] === null ? (
                                <span className="text-slate-400 italic">null</span>
                              ) : (
                                String(row[col])
                              )}
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
            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-slate-400 dark:text-slate-500">
              <Database size={32} className="opacity-40" />
              <p className="text-sm">Write a query above and press Run</p>
              <p className="text-xs">Allowed tables: organisations, users, plans, transactions, earnings, disputes, …</p>
            </div>
          )}
        </div>
      </div>

      {/* Save modal */}
      {modal === 'save' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">
                {selectedQuery ? 'Update Query' : 'Save Query'}
              </h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
              <input
                type="text"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                placeholder="e.g. Revenue by rep Q1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <input
                type="text"
                value={saveDesc}
                onChange={e => setSaveDesc(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={saveTags}
                onChange={e => setSaveTags(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                placeholder="commissions, q1, finance"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !saveName.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
              <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish modal */}
      {modal === 'publish' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Publish as Report</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            {shareToken ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle size={16} /> Report published with shared link
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Share URL</label>
                  <code className="block w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs break-all text-slate-900 dark:text-slate-100">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/reports/shared/{shareToken}
                  </code>
                </div>
                <button onClick={() => setModal(null)} className="w-full px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Report name (shown to users)</label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={e => setReportName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <input
                    type="text"
                    value={reportDesc}
                    onChange={e => setReportDesc(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Visibility</label>
                  <select
                    value={visibility}
                    onChange={e => setVisibility(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  >
                    <option value="ORG_MEMBERS">All org members</option>
                    <option value="SHARED_LINK">Shared link (no auth required)</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {publishing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                    Publish
                  </button>
                  <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
