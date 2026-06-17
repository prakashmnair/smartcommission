'use client'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
          <WifiOff className="text-slate-500 dark:text-slate-400" size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">You&apos;re offline</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          Check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
