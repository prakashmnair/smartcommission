export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      {children}
    </div>
  )
}
