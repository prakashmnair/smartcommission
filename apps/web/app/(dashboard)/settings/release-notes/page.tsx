'use client'
import { useEffect, useState, Suspense } from 'react'
import { Plus, Eye, EyeOff, Pencil, Trash2, X, Check } from 'lucide-react'
import { useConfirm } from '@/lib/confirm'

type ReleaseNote = {
  id: string
  title: string
  summary: string
  body: string | null
  category: string
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
  title: string
  summary: string
  body: string
  category: string
}

const emptyForm: FormState = { title: '', summary: '', body: '', category: 'FEATURE' }

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
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
          placeholder="Release note title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Summary</label>
        <input
          value={form.summary}
          onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
          className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
          placeholder="Brief one-line description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Body (optional)</label>
        <textarea
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 resize-y"
          placeholder="Detailed description..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.title.trim() || !form.summary.trim()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
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

function TenantReleaseNotesContent() {
  const [notes, setNotes] = useState<ReleaseNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const confirm = useConfirm()

  function load() {
    setLoading(true)
    fetch('/api/release-notes/tenant')
      .then(r => r.json())
      .then(d => setNotes(d.data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleCreate(form: FormState) {
    setSaving(true)
    try {
      const res = await fetch('/api/release-notes/tenant', {
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
      const res = await fetch(`/api/release-notes/tenant/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const d = await res.json()
        setNotes(prev => prev.map(n => n.id === id ? d.data : n))
        setEditingId(null)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublish(note: ReleaseNote) {
    const res = await fetch(`/api/release-notes/tenant/${note.id}`, {
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
    const res = await fetch(`/api/release-notes/tenant/${note.id}`, {
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
    const ok = await confirm({ title: 'Delete release note', message: 'This action cannot be undone.', confirmLabel: 'Delete', variant: 'danger' })
    if (!ok) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/release-notes/tenant/${id}`, { method: 'DELETE' })
      if (res.ok) setNotes(prev => prev.filter(n => n.id !== id))
    } finally {
      setDeleting(null)
    }
  }

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
        <button onClick={load} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Organisation Release Notes</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null) }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          New note
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Create Release Note</h2>
          <NoteForm
            initial={emptyForm}
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No release notes yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {notes.map(note => (
              <div key={note.id} className="p-5">
                {editingId === note.id ? (
                  <NoteForm
                    initial={{ title: note.title, summary: note.summary, body: note.body ?? '', category: note.category }}
                    onSave={form => handleUpdate(note.id, form)}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{note.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{note.summary}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleTogglePublish(note)}
                        title={note.isPublished ? 'Unpublish' : 'Publish'}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label={note.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        <Check size={15} />
                      </button>
                      <button
                        onClick={() => handleToggleVisible(note)}
                        title={note.isVisible ? 'Hide' : 'Show'}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label={note.isVisible ? 'Hide' : 'Show'}
                      >
                        {note.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button
                        onClick={() => { setEditingId(note.id); setShowForm(false) }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        disabled={deleting === note.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                        aria-label="Delete"
                      >
                        {deleting === note.id ? <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent animate-spin rounded-full" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TenantReleaseNotesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
      </div>
    }>
      <TenantReleaseNotesContent />
    </Suspense>
  )
}
