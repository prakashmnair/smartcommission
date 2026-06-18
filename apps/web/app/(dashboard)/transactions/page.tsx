'use client'
import { useEffect, useState } from 'react'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { useToast } from '@/lib/toast'

type Transaction = {
  id: string
  dealName: string
  accountName: string | null
  amount: string
  currency: string
  closeDate: string
  sourceSystem: string
  type: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const toast = useToast()

  // Add form state
  const [dealName, setDealName] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('AUD')
  const [closeDate, setCloseDate] = useState('')
  const [accountName, setAccountName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch('/api/transactions')
      .then(r => r.json())
      .then(d => setTransactions(d.data ?? []))
      .catch(() => setError('Failed to load transactions'))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealName, amount: parseFloat(amount), currency, closeDate, accountName: accountName || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setTransactions(prev => [data.data, ...prev])
      setShowAdd(false)
      setDealName(''); setAmount(''); setCloseDate(''); setAccountName('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Transactions</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Add Transaction</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deal name *</label>
              <input value={dealName} onChange={e => setDealName(e.target.value)} required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account name</label>
              <input value={accountName} onChange={e => setAccountName(e.target.value)} className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount *</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Currency *</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100">
                <option>AUD</option><option>USD</option><option>GBP</option><option>EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Close date *</label>
              <input type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100" />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors">Cancel</button>
              <button type="submit" disabled={adding} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                {adding ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : null}
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <ArrowLeftRight className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No transactions yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Add transactions manually or import via CSV.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  {['Deal Name', 'Account', 'Close Date', 'Amount', 'Currency', 'Source'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{t.dealName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{t.accountName ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{new Date(t.closeDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-medium">{parseFloat(t.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{t.currency}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{t.sourceSystem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
