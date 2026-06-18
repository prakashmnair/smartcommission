'use client'
import { useEffect, useState, Suspense } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

type ReleaseNote = {
  id: string
  version: string | null
  title: string
  summary: string
  body: string | null
  type: string
  category: string
  publishedAt: string | null
  tenantId: string | null
}

const categoryConfig: Record<string, { label: string; className: string }> = {
  FEATURE: { label: 'Feature', className: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' },
  IMPROVEMENT: { label: 'Improvement', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  FIX: { label: 'Fix', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  SECURITY: { label: 'Security', className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  BREAKING: { label: 'Breaking', className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
  DEPRECATION: { label: 'Deprecation', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
}

function CategoryBadge({ category }: { category: string }) {
  const cfg = categoryConfig[category] ?? { label: category, className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function NoteCard({ note }: { note: ReleaseNote }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <CategoryBadge category={note.category} />
            {note.publishedAt && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(note.publishedAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{note.title}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{note.summary}</p>
          {expanded && note.body && (
            <div className="mt-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
              {note.body}
            </div>
          )}
        </div>
        {note.body && (
          <button
            onClick={() => setExpanded(v => !v)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

function ReleaseNotesContent() {
  const [notes, setNotes] = useState<ReleaseNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    localStorage.setItem('lastReadReleaseNotes', new Date().toISOString())
    fetch('/api/release-notes')
      .then(r => r.json())
      .then(d => setNotes(d.data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const platformNotes = notes.filter(n => n.type === 'PLATFORM')
  const tenantNotes = notes.filter(n => n.type === 'TENANT')

  const byVersion = platformNotes.reduce<Record<string, ReleaseNote[]>>((acc, n) => {
    const key = n.version ?? 'Unversioned'
    if (!acc[key]) acc[key] = []
    acc[key].push(n)
    return acc
  }, {})

  const versionKeys = Object.keys(byVersion).sort((a, b) => {
    if (a === 'Unversioned') return 1
    if (b === 'Unversioned') return -1
    return b.localeCompare(a, undefined, { numeric: true })
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-slate-600 dark:text-slate-400">Failed to load release notes.</p>
        <button
          onClick={() => { setError(false); setLoading(true); fetch('/api/release-notes').then(r => r.json()).then(d => setNotes(d.data ?? [])).catch(() => setError(true)).finally(() => setLoading(false)) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  const isEmpty = notes.length === 0

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">What's New</h1>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2">
          <p className="text-slate-600 dark:text-slate-400 font-medium">All up to date — check back soon.</p>
        </div>
      ) : (
        <>
          {versionKeys.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Platform Updates</h2>
              {versionKeys.map(version => (
                <div key={version} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {version !== 'Unversioned' ? `v${version}` : 'Other Updates'}
                    </span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  </div>
                  {byVersion[version].map(note => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              ))}
            </section>
          )}

          {tenantNotes.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your Organisation's Updates</h2>
              {tenantNotes.map(note => (
                <NoteCard key={note.id} note={note} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default function ReleaseNotesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
      </div>
    }>
      <ReleaseNotesContent />
    </Suspense>
  )
}
