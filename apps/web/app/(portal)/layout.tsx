import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/session'
import Link from 'next/link'
import { DollarSign, ArrowLeftRight, FileText, AlertCircle, BookOpen } from 'lucide-react'

const navItems = [
  { href: '/portal', icon: DollarSign, label: 'Earnings' },
  { href: '/portal/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/portal/statements', icon: FileText, label: 'Statements' },
  { href: '/portal/disputes', icon: AlertCircle, label: 'Disputes' },
  { href: '/portal/plan', icon: BookOpen, label: 'My Plan' },
]

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-dvh bg-slate-50 dark:bg-slate-950">
      {/* Light sidebar for rep portal */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <DollarSign className="text-white" size={14} />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">My Commissions</span>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
