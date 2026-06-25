'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DollarSign, ArrowLeftRight, FileText, AlertCircle, BookOpen,
  ChevronLeft, LogOut, Shield, TrendingUp
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

/* ------------------------------------------------------------------ */
/* Nav items                                                            */
/* ------------------------------------------------------------------ */
type NavItem = { href: string; icon: React.ElementType; label: string }

const navItems: NavItem[] = [
  { href: '/portal', icon: DollarSign, label: 'Earnings' },
  { href: '/portal/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/portal/statements', icon: FileText, label: 'Statements' },
  { href: '/portal/disputes', icon: AlertCircle, label: 'Disputes' },
  { href: '/portal/plan', icon: BookOpen, label: 'My Plan' },
]

const mobileNavItems: NavItem[] = navItems // portal is compact enough to show all 5

/* ------------------------------------------------------------------ */
/* Profile dropdown                                                     */
/* ------------------------------------------------------------------ */
function ProfileMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const initials = (name || email).slice(0, 2).toUpperCase()

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {})
    router.push('/login')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Profile menu"
        aria-expanded={open}
        className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-700 transition-all flex-shrink-0"
      >
        {initials}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {name || email}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mobile bottom nav                                                    */
/* ------------------------------------------------------------------ */
function MobileBottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-[430px] mx-auto flex items-center justify-around px-2 py-2">
        {mobileNavItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/portal' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* Layout                                                               */
/* ------------------------------------------------------------------ */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<{ name: string; email: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => {
        if (!r.ok) throw new Error('unauth')
        return r.json()
      })
      .then(d => setSession(d.data))
      .catch(() => router.replace('/login'))
      .finally(() => setAuthLoading(false))
  }, [router])

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex min-h-dvh bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign className="text-white" size={14} />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">My Commissions</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/portal' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Back to admin + user footer */}
        <div className="px-3 pb-4 space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 p-1.5 -ml-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
            aria-label="Back to Dashboard"
          >
            <ChevronLeft size={16} />
            Admin Dashboard
          </Link>

          <div className="flex items-center gap-3 px-1">
            <ProfileMenu name={session.name} email={session.email} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {session.name || session.email}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.email}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-24 md:pb-0">{children}</main>

      <MobileBottomNav pathname={pathname} />
    </div>
  )
}
