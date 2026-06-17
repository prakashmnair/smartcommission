'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

const PLAN_TYPES = ['COMMISSION', 'BONUS', 'MBO', 'SPIF', 'TEAM', 'RECOGNITION']
const RULE_TYPES = ['FLAT_RATE', 'TIERED_PROGRESSIVE', 'TIERED_RETROACTIVE', 'ACCELERATOR', 'CAP', 'FLOOR']

type Step = 1 | 2 | 3

export default function NewPlanPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [effectiveFrom, setEffectiveFrom] = useState('')
  const [effectiveTo, setEffectiveTo] = useState('')

  // Step 2 fields
  const [ruleType, setRuleType] = useState('')
  const [ruleRate, setRuleRate] = useState('')

  // Step 3
  const [planId, setPlanId] = useState<string | null>(null)

  async function handleCreatePlan() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, type, effectiveFrom, effectiveTo: effectiveTo || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create plan')
      setPlanId(data.data.id)

      // Optionally add a rule
      if (ruleType && ruleRate) {
        await fetch(`/api/plans/${data.data.id}/rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: ruleType, config: { rate: parseFloat(ruleRate) }, sortOrder: 0 }),
        })
      }

      setStep(3)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating plan')
    } finally {
      setLoading(false)
    }
  }

  const steps = ['Basics', 'Rules', 'Done']

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">New Compensation Plan</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((label, i) => {
          const s = (i + 1) as Step
          const active = step === s
          const done = step > s
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                done ? 'bg-indigo-600 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {done ? <Check size={14} /> : s}
              </div>
              <span className={`text-sm font-medium ${active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>{label}</span>
              {i < steps.length - 1 && <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />}
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Plan basics</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Q1 2026 Sales Commission"
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Optional description"
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan type *</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
              >
                <option value="">Select type</option>
                {PLAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Effective from *</label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={e => setEffectiveFrom(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Effective to</label>
                <input
                  type="date"
                  value={effectiveTo}
                  onChange={e => setEffectiveTo(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (!name.trim() || !type || !effectiveFrom) { setError('Name, type, and effective from are required'); return }
                  setError('')
                  setStep(2)
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Add a rule (optional)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Rules define how earnings are calculated. You can add more rules after creation.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rule type</label>
              <select
                value={ruleType}
                onChange={e => setRuleType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
              >
                <option value="">Skip (add later)</option>
                {RULE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {ruleType && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={ruleRate}
                  onChange={e => setRuleRate(e.target.value)}
                  placeholder="e.g. 5 for 5%"
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            )}
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium text-sm">
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : null}
                Create Plan
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <Check className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Plan created!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your compensation plan has been created in DRAFT status.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push('/plans')} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium text-sm border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-xl">
                All Plans
              </button>
              {planId && (
                <button onClick={() => router.push(`/plans/${planId}`)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                  View Plan
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
