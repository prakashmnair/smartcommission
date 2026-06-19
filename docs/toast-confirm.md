# SmartCommission — Toast & Confirm Dialog

Last reviewed: 2026-06-19

---

## Rule

Native browser popups (`window.alert`, `window.confirm`, `window.prompt`) are **forbidden** in SmartCommission. Replace them with:

- **Toast** — non-blocking notification for success / error / warning / info (replaces `window.alert`)
- **ConfirmDialog** — modal for destructive or irreversible actions (replaces `window.confirm`)
- **PromptDialog** — modal with a text input (replaces `window.prompt` — rare)

This matters particularly in SmartCommission because several actions are high-stakes financial operations (approving a payment run, resolving a dispute, voiding a transaction) that require clear confirmation UI — not a plain browser `confirm()` box.

---

## Implementation Status

| Component | Status | Location |
|---|---|---|
| `lib/toast.tsx` — ToastProvider + useToast | Open — not yet implemented | `lib/toast.tsx` |
| `lib/confirm.tsx` — ConfirmProvider + useConfirm | Open — not yet implemented | `lib/confirm.tsx` |
| `components/ui/Toaster.tsx` | Open — not yet implemented | `components/ui/Toaster.tsx` |
| `components/ui/ConfirmDialog.tsx` | Open — not yet implemented | `components/ui/ConfirmDialog.tsx` |
| Wired into root layout | Open — not yet implemented | `app/layout.tsx` |

---

## File Structure

```
components/
  ui/
    Toaster.tsx          ← renders toast stack (place once in app/layout.tsx)
    ConfirmDialog.tsx    ← controlled modal component
lib/
  toast.tsx              ← ToastContext + useToast hook
  confirm.tsx            ← useConfirm hook (promise-based, awaitable like window.confirm)
```

---

## Toast System

### `lib/toast.tsx`

```tsx
'use client'
import { createContext, useContext, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export interface ToastItem { id: string; type: ToastType; message: string; duration: number }

interface Ctx { toasts: ToastItem[]; add: (t: Omit<ToastItem, 'id'>) => void; remove: (id: string) => void }
const ToastContext = createContext<Ctx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const remove = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), [])
  const add = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(p => [...p, { ...t, id }])
    setTimeout(() => remove(id), t.duration ?? 4000)
  }, [remove])
  return <ToastContext.Provider value={{ toasts, add, remove }}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return {
    success: (message: string, duration = 4000) => ctx.add({ type: 'success', message, duration }),
    error:   (message: string, duration = 5000) => ctx.add({ type: 'error',   message, duration }),
    warning: (message: string, duration = 4000) => ctx.add({ type: 'warning', message, duration }),
    info:    (message: string, duration = 4000) => ctx.add({ type: 'info',    message, duration }),
  }
}

export function useToastItems() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastItems must be used within ToastProvider')
  return { toasts: ctx.toasts, remove: ctx.remove }
}
```

### Toast styles

| Type | Left border accent | Icon |
|---|---|---|
| `success` | `border-green-500` | `CheckCircle` (green) |
| `error` | `border-red-500` | `XCircle` (red) |
| `warning` | `border-amber-500` | `AlertTriangle` (amber) |
| `info` | `border-indigo-500` | `Info` (indigo) |

Background: `bg-white dark:bg-slate-900` with `border border-slate-200 dark:border-slate-800`.
Auto-dismiss: 4s for success/warning/info, 5s for error.

---

## ConfirmDialog

### `lib/confirm.tsx`

```tsx
'use client'
import { createContext, useContext, useState, useCallback } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
}
interface ConfirmState extends ConfirmOptions {
  open: boolean
  resolve: (ok: boolean) => void
}

interface Ctx { request: (opts: ConfirmOptions) => Promise<boolean>; state: ConfirmState | null; respond: (ok: boolean) => void }
const ConfirmContext = createContext<Ctx | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null)
  const request = useCallback((opts: ConfirmOptions): Promise<boolean> =>
    new Promise(resolve => setState({ ...opts, open: true, resolve })), [])
  const respond = useCallback((ok: boolean) => {
    state?.resolve(ok)
    setState(null)
  }, [state])
  return <ConfirmContext.Provider value={{ request, state, respond }}>{children}</ConfirmContext.Provider>
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx.request
}

export function useConfirmState() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirmState must be used within ConfirmProvider')
  return { state: ctx.state, respond: ctx.respond }
}
```

- `danger` variant: red confirm button + `AlertTriangle` icon
- `default` variant: indigo confirm button

---

## Wire into `app/layout.tsx`

```tsx
import { ToastProvider } from '@/lib/toast'
import { ConfirmProvider } from '@/lib/confirm'
import { Toaster } from '@/components/ui/Toaster'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ConfirmProvider>
          <ToastProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
              <Toaster />
              <ConfirmDialog />
            </ThemeProvider>
          </ToastProvider>
        </ConfirmProvider>
      </body>
    </html>
  )
}
```

---

## Usage Examples

### Commission-specific toast usage

```tsx
const toast = useToast()

// Payment run approved
toast.success('Payment run approved. Exporting to payroll...')

// Calculation failed
toast.error('Calculation run failed — 3 errors found. See the run detail for more.')

// Quota changed mid-period
toast.warning('Quota updated mid-period. Earnings will be recalculated on the next run.')

// Import in progress
toast.info('Importing 1,243 transactions. You will be notified when complete.')
```

### High-stakes confirm dialogs

```tsx
const confirm = useConfirm()

// Approve a payment run
async function approvePaymentRun(runId: string) {
  const ok = await confirm({
    title: 'Approve Payment Run',
    message: 'This will mark the payment run as approved and make it available for payroll export. This action cannot be undone.',
    confirmLabel: 'Approve',
    variant: 'default',
  })
  if (!ok) return
  await approveRun(runId)
  toast.success('Payment run approved.')
}

// Void a transaction
async function voidTransaction(txId: string) {
  const ok = await confirm({
    title: 'Void Transaction',
    message: 'Voiding this transaction will trigger a recalculation and may reduce commission already earned. This cannot be undone.',
    confirmLabel: 'Void transaction',
    variant: 'danger',
  })
  if (!ok) return
  await voidTx(txId)
  toast.success('Transaction voided. Recalculation queued.')
}

// Terminate a user (removes from active calculations)
async function terminateUser(userId: string) {
  const ok = await confirm({
    title: 'Terminate Employee Access',
    message: 'This will remove the employee from active commission plans and future calculation runs. Historical earnings are preserved.',
    confirmLabel: 'Terminate',
    variant: 'danger',
  })
  if (!ok) return
  await terminateEmployee(userId)
  toast.success('Employee marked as terminated.')
}
```

---

## Key SmartCommission Actions Requiring ConfirmDialog

| Action | Variant | Notes |
|---|---|---|
| Approve payment run | `default` | High-value financial action |
| Export to payroll | `default` | Irreversible stage transition |
| Void transaction | `danger` | Triggers recalculation |
| Delete a compensation plan | `danger` | Destructive, may affect participants |
| Revoke API key | `danger` | Breaks integrations |
| Terminate employee | `danger` | Affects calculation participation |
| Resolve dispute (deny) | `default` | Final decision, rep-facing outcome |
| Run retroactive recalculation | `default` | Creates delta adjustments for pay period |
| Grant/revoke superadmin | `danger` | Privileged action |

---

## Open Roadmap Items

| Code | Priority | Status | Title |
|---|---|---|---|
| R-089 | High | Open | Implement toast & confirm system (prerequisite before any UI work) |

---

## Checklist

- [ ] `lib/toast.tsx` — ToastProvider + useToast + useToastItems
- [ ] `lib/confirm.tsx` — ConfirmProvider + useConfirm + useConfirmState
- [ ] `components/ui/Toaster.tsx` — fixed bottom-right toast stack
- [ ] `components/ui/ConfirmDialog.tsx` — modal overlay, danger and default variants
- [ ] Both providers + both render components wired into `app/layout.tsx`
- [ ] All `window.alert` replaced with `toast.*`
- [ ] All `window.confirm` replaced with `await confirm({ ... })`
- [ ] High-stakes actions (payment approval, transaction void, plan delete) use `ConfirmDialog`
- [ ] ESLint rule to forbid `window.alert` / `window.confirm` (optional)
