import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/session'
import { isSuperAdmin } from '@/lib/auth/superadmin'
import Link from 'next/link'
import { Building2, Users, ScrollText, Shield, Newspaper, ChevronLeft } from 'lucide-react'

const navItems = [
  { href: '/admin/orgs', icon: Building2, label: 'Organisations' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/logs', icon: ScrollText, label: 'Audit Logs' },
  { href: '/admin/release-notes', icon: Newspaper, label: 'Release Notes' },
]

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  const isAdmin = await isSuperAdmin(session.uid, session.email)
  if (!isAdmin) redirect('/dashboard')

  return (
    <div className="flex min-h-dvh bg-violet-950">
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-violet-900/60 border-r border-violet-800">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-violet-800">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Shield className="text-white" size={14} />
          </div>
          <span className="font-bold text-violet-100 text-sm">Superadmin</span>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-violet-300 hover:text-white hover:bg-violet-700/50 transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-violet-800">
          <Link
            href="/dashboard"
            aria-label="Back to Dashboard"
            className="flex items-center gap-1.5 p-1.5 -ml-1.5 rounded-lg text-violet-400 hover:text-white hover:bg-violet-700/50 transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-auto">{children}</main>
    </div>
  )
}
