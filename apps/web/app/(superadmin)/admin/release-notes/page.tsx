'use client'
import { useEffect, useState, Suspense } from 'react'
import { Plus, Eye, EyeOff, Pencil, Trash2, X, Check } from 'lucide-react'

type ReleaseNote = {
  id: string
  version: string | null
  title: string
  summary: string
  body: string | null
  category: string
  type: string
  tenantId: string | null
  isVisible: boolean
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
}

const categories = ['FEATURE', 'IMPROVEMENT', 'FIX', 'SECURITY', 'BREAKING', 'DEPRECATION']

const categoryConfig: Record<string, { label: string; className: string }> = {
  FEATURE: { label: 'Feature', className: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' },
  IMPROVEMENT: { label: 'Improvement', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  FIX: { label: 'Fix', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  SECURITY: { label: 'Security', className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  BREAKING: { label: 'Breaking', className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
  DEPRECATION: { label: 'Deprecation', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
}

type FormState = {
  version: string
  title: string
  summary: string
  body: string
  category: string
}

const emptyForm: FormState = { version: '', title: '', summary: '', body: '', category: 'FEATURE' }

function NoteForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormState
  onSave: (f: FormState) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState(initial)
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Version (optional)</label>
        <input
          value={form.version}
          onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
          className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-slate-100"
          placeholder="e.g. 1.4.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-slate-100"
          placeholder="Release note title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Summary</label>
        <input
          value={form.summary}
          onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
          className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-slate-100"
          placeholder="Brief one-line description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Body (optional)</label>
        <textarea
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-slate-100 resize-y"
          placeholder="Detailed description..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-slate-100"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.title.trim() || !form.summary.trim()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Check size={14} />}
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium px-4 py-2.5 rounded-xl text-sm transition-colors border border-slate-300 dark:border-slate-700"
        >
          <X size={14} />
          Cancel
        </button>
      </div>
    </div>
  )
}

const tabs = ['Platform Updates', 'All Organisation Updates'] as const
type Tab = typeof tabs[number]

function NoteRow({
  note,
  onTogglePublish,
  onToggleVisible,
  onEdit,
  onDelete,
  deleting,
}: {
  note: ReleaseNote
  onTogglePublish: (n: ReleaseNote) => void
  onToggleVisible: (n: ReleaseNote) => void
  onEdit: (n: ReleaseNote) => void
  onDelete: (id: string) => void
  deleting: string | null
}) {
  return (
    <div className="p-5 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {note.version && (
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">v{note.version}</span>
          )}
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${(categoryConfig[note.category] ?? { className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' }).className}`}>
            {categoryConfig[note.category]?.label ?? note.category}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${note.isPublished ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
            {note.isPublished ? 'Published' : 'Draft'}
          </span>
          {!note.isVisible && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              Hidden
            </span>
          )}
          {note.tenantId && (
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{note.tenantId.slice(0, 8)}</span>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{note.title}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{note.summary}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onTogglePublish(note)}
          title={note.isPublished ? 'Unpublish' : 'Publish'}
          className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={note.isPublished ? 'Unpublish' : 'Publish'}
        >
          <Check size={15} />
        </button>
        <button
          onClick={() => onToggleVisible(note)}
          title={note.isVisible ? 'Hide' : 'Show'}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={note.isVisible ? 'Hide' : 'Show'}
        >
          {note.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
        <button
          onClick={() => onEdit(note)}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Edit"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(note.id)}
          disabled={deleting === note.id}
          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          aria-label="Delete"
        >
          {deleting === note.id ? <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent animate-spin rounded-full" /> : <Trash2 size={15} />}
        </button>
      </div>
    </div>
  )
}

function AdminReleaseNotesContent() {
  const [tab, setTab] = useState<Tab>('Platform Updates')
  const [notes, setNotes] = useState<ReleaseNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<ReleaseNote | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  function load() {
    setLoading(true)
    fetch('/api/superadmin/release-notes')
      .then(r => r.json())
      .then(d => setNotes(d.data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleCreate(form: FormState) {
    setSaving(true)
    try {
      const res = await fetch('/api/superadmin/release-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const d = await res.json()
        setNotes(prev => [d.data, ...prev])
        setShowForm(false)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: string, form: FormState) {
    setSaving(true)
    try {
      const res = await fetch(`/api/superadmin/release-notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const d = await res.json()
        setNotes(prev => prev.map(n => n.id === id ? d.data : n))
        setEditingNote(null)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublish(note: ReleaseNote) {
    const res = await fetch(`/api/superadmin/release-notes/${note.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !note.isPublished }),
    })
    if (res.ok) {
      const d = await res.json()
      setNotes(prev => prev.map(n => n.id === note.id ? d.data : n))
    }
  }

  async function handleToggleVisible(note: ReleaseNote) {
    const res = await fetch(`/api/superadmin/release-notes/${note.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !note.isVisible }),
    })
    if (res.ok) {
      const d = await res.json()
      setNotes(prev => prev.map(n => n.id === note.id ? d.data : n))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this release note?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/superadmin/release-notes/${id}`, { method: 'DELETE' })
      if (res.ok) setNotes(prev => prev.filter(n => n.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const platformNotes = notes.filter(n => n.type === 'PLATFORM')
  const tenantNotes = notes.filter(n => n.type === 'TENANT')
  const displayed = tab === 'Platform Updates' ? platformNotes : tenantNotes

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent animate-spin rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-slate-600 dark:text-slate-400">Failed to load release notes.</p>
        <button onClick={load} className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Release Notes</h1>
        {tab === 'Platform Updates' && (
          <button
            onClick={() => { setShowForm(true); setEditingNote(null) }}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus size={16} />
            New platform note
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setShowForm(false); setEditingNote(null) }}
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

      {showForm && tab === 'Platform Updates' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Create Platform Release Note</h2>
          <NoteForm
            initial={emptyForm}
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No release notes in this section.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {displayed.map(note => (
              editingNote?.id === note.id ? (
                <div key={note.id} className="p-5">
                  <NoteForm
                    initial={{ version: note.version ?? '', title: note.title, summary: note.summary, body: note.body ?? '', category: note.category }}
                    onSave={form => handleUpdate(note.id, form)}
                    onCancel={() => setEditingNote(null)}
                    saving={saving}
                  />
                </div>
              ) : (
                <NoteRow
                  key={note.id}
                  note={note}
                  onTogglePublish={handleTogglePublish}
                  onToggleVisible={handleToggleVisible}
                  onEdit={n => { setEditingNote(n); setShowForm(false) }}
                  onDelete={handleDelete}
                  deleting={deleting}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminReleaseNotesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent animate-spin rounded-full" />
      </div>
    }>
      <AdminReleaseNotesContent />
    </Suspense>
  )
}
