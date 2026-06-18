'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function WhatsNewNavLink() {
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    const lastRead = localStorage.getItem('lastReadReleaseNotes')
    fetch('/api/release-notes')
      .then(r => r.json())
      .then(d => {
        const notes: Array<{ publishedAt: string | null }> = d.data ?? []
        if (notes.length === 0) return
        const newest = notes
          .map(n => n.publishedAt ? new Date(n.publishedAt).getTime() : 0)
          .reduce((a, b) => Math.max(a, b), 0)
        if (!lastRead || newest > new Date(lastRead).getTime()) {
          setHasUnread(true)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <Link
      href="/release-notes"
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <Sparkles size={18} />
      <span className="flex-1">What's New</span>
      {hasUnread && (
        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" aria-label="Unread updates" />
      )}
    </Link>
  )
}
