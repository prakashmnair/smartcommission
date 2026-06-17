import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ThemeToggle } from '@/components/ThemeToggle'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
}

export const metadata: Metadata = {
  title: 'SmartCommission — Incentive Compensation Management',
  description: 'Design, calculate, and pay sales commissions accurately. Real-time visibility for every rep.',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'SmartCommission' },
  icons: { apple: '/icons/apple-touch-icon.png', icon: [{ url: '/icons/icon-192.png', sizes: '192x192' }] },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        <Providers>
          {children}
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
        </Providers>
      </body>
    </html>
  )
}
