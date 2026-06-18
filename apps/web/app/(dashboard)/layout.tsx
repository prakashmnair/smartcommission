import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/session'
import Link from 'next/link'
import {
  LayoutDashboard, FileText, ArrowLeftRight, Target, Calculator,
  DollarSign, CreditCard, AlertCircle, Settings, Database, BarChart3, ScrollText
} from 'lucide-react'
import WhatsNewNavLink from '@/components/WhatsNewNavLink'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/plans', icon: FileText, label: 'Plans' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/quotas', icon: Target, label: 'Quotas' },
  { href: '/calculations', icon: Calculator, label: 'Calculations' },
  { href: '/earnings', icon: DollarSign, label: 'Earnings' },
  { href: '/payments', icon: CreditCard, label: 'Payments' },
  { href: '/disputes', icon: AlertCircle, label: 'Disputes' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/query-console', icon: Database, label: 'Query Console' },
  { href: '/logs', icon: ScrollText, label: 'Logs' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <DollarSign className="text-white" size={16} />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">SmartCommission</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <WhatsNewNavLink />
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                {session.email?.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{session.name ?? session.email}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
