'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, FileText, ArrowLeftRight, Target, Calculator,
  DollarSign, CreditCard, AlertCircle, Settings, Database, BarChart3,
  ScrollText, Globe, LogOut, Shield, Sparkles
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import WhatsNewNavLink from '@/components/WhatsNewNavLink'

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */
type NavGroup = {
  label: string
  items: NavItem[]
}

type NavItem = {
  href: string
  icon: React.ElementType
  label: string
}

/* ------------------------------------------------------------------ */
/* Nav structure — grouped by domain                                    */
/* ------------------------------------------------------------------ */
const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Plan Design',
    items: [
      { href: '/plans', icon: FileText, label: 'Plans' },
      { href: '/quotas', icon: Target, label: 'Quotas' },
    ],
  },
  {
    label: 'Data & Calculation',
    items: [
      { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
      { href: '/calculations', icon: Calculator, label: 'Calculations' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/earnings', icon: DollarSign, label: 'Earnings' },
      { href: '/payments', icon: CreditCard, label: 'Payments' },
      { href: '/disputes', icon: AlertCircle, label: 'Disputes' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/reports', icon: BarChart3, label: 'Reports' },
      { href: '/query-console', icon: Database, label: 'Query Console' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/settings', icon: Settings, label: 'Settings' },
      { href: '/logs', icon: ScrollText, label: 'Audit Logs' },
    ],
  },
]

/* Mobile bottom bar — most-used shortcuts only */
const mobileNavItems: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/plans', icon: FileText, label: 'Plans' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/earnings', icon: DollarSign, label: 'Earnings' },
  { href: '/disputes', icon: AlertCircle, label: 'Disputes' },
]

/* ------------------------------------------------------------------ */
/* Profile dropdown                                                     */
/* ------------------------------------------------------------------ */
function ProfileMenu({
  name,
  email,
  isSuperAdmin,
}: {
  name: string
  email: string
  isSuperAdmin?: boolean
}) {
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
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown — opens upward from sidebar bottom */}
          <div className="absolute bottom-full left-0 mb-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {name || email}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</p>
            </div>
            {isSuperAdmin && (
              <Link
                href="/admin/orgs"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-violet-600 dark:text-violet-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Shield size={14} />
                Super Admin
              </Link>
            )}
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
/* Sidebar nav link                                                     */
/* ------------------------------------------------------------------ */
function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
}: NavItem & { active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={16} />
      <span className="flex-1">{label}</span>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                              */
/* ------------------------------------------------------------------ */
function Sidebar({
  pathname,
  session,
}: {
  pathname: string
  session: { name: string; email: string; isSuperAdmin?: boolean }
}) {
  return (
    <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <DollarSign className="text-white" size={16} />
        </div>
        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">SmartCommission</span>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <SidebarLink
                  key={item.href}
                  {...item}
                  active={
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  }
                />
              ))}
            </div>
          </div>
        ))}

        {/* Updates & portal */}
        <div>
          <p className="px-3 mb-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            More
          </p>
          <div className="space-y-0.5">
            <WhatsNewNavLink />
            <Link
              href="/portal"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Globe size={16} />
              Rep Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* User / Profile footer */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <ProfileMenu
            name={session.name}
            email={session.email}
            isSuperAdmin={session.isSuperAdmin}
          />
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
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
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
/* Layout root — client component (needs usePathname)                  */
/* ------------------------------------------------------------------ */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<{
    name: string
    email: string
    isSuperAdmin?: boolean
  } | null>(null)
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
      <Sidebar pathname={pathname} session={session} />

      {/* Main content — extra bottom padding on mobile for bottom nav */}
      <main className="flex-1 overflow-auto pb-24 md:pb-0">{children}</main>

      <MobileBottomNav pathname={pathname} />
    </div>
  )
}
