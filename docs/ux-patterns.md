# SmartCommission — UX Patterns & Performance Standards

Last reviewed: 2026-06-20

---

## Overview

This document defines the canonical UX interaction patterns and performance conventions for SmartCommission. Every screen, component, and interaction must follow this spec. The canonical source is `admin/docs/templates/ux-patterns.md` — this document adapts it with SmartCommission-specific route names and role context.

Read `design-system.md` for color tokens, typography, and component styles. This document covers **interaction patterns**, **header layout**, and **performance conventions**.

---

## Implementation Status

Note: SmartCommission has **no application code yet** (B-001). All patterns documented here are the standards to implement when code development begins (starting with R-076).

---

## Back Navigation

### Rule

All back navigation uses a `<ChevronLeft size={20} />` icon-only button. Never use text labels like `← Back`, `← Plans`, or `← Dashboard`.

### Implementation

```tsx
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

<Link
  href="/plans"
  className="p-1.5 -ml-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
  aria-label="Back"
>
  <ChevronLeft size={20} />
</Link>
```

### SmartCommission back navigation map

| Page | Back destination |
|---|---|
| `/plans/:id` | `/plans` |
| `/plans/:id/versions` | `/plans/:id` |
| `/calculations/:runId` | `/calculations` |
| `/payments/:runId` | `/payments` |
| `/portal/statements/:id` | `/portal/earnings` |
| `/reports/builder` | `/reports` |

---

## Header Layout

### Standard pattern

Every page header must follow this three-zone layout:

```
[ back nav icon ] [ page title ]    [ ThemeToggle ] [ ProfileMenu ]
      left              left/center                       right
```

```tsx
<header className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
  {/* Left zone */}
  <div className="flex items-center gap-4 min-w-0">
    <Link href="/parent" className="p-1.5 -ml-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <ChevronLeft size={20} />
    </Link>
    <div className="min-w-0">
      <h1 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">Plan Detail</h1>
    </div>
  </div>

  {/* Right zone */}
  <div className="flex items-center gap-3 shrink-0">
    <AppHeaderRight />
  </div>
</header>
```

### Rules

- `justify-between` on header — always.
- `shrink-0` on the right zone — prevents actions being squeezed by long titles.
- `min-w-0` + `truncate` on title — prevents long titles overflowing on mobile.
- Top-level pages (dashboard, plans list, earnings) omit the back nav — just title left + right zone.
- Admin pages: same pattern, `border-violet-*` accent on spinners, `AdminNav` in `app/(superadmin)/layout.tsx` — never repeated per-page.

---

## ProfileMenu

### Rule

The `ProfileMenu` trigger shows **avatar only** — no display name text next to it. The name appears inside the dropdown.

### Dropdown order (canonical)

1. **Name row** — navigates to `/settings/profile`
2. **Super User row** — violet, only shown if user is platform superadmin (`isSuperAdmin()` = true)
3. **Divider**
4. **Sign out** — always last, red text

```tsx
// ProfileMenu dropdown
<div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden py-1">
  {/* Name */}
  <button onClick={() => router.push('/settings/profile')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm ...">
    <User size={15} />
    <span className="truncate">{displayName}</span>
  </button>

  {/* Super user — violet */}
  {isSuperAdmin && (
    <button onClick={() => router.push('/admin/orgs')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-violet-600 dark:text-violet-400 ...">
      <Zap size={15} />
      Super User
    </button>
  )}

  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

  {/* Sign out */}
  <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 ...">
    <LogOut size={15} />
    Sign out
  </button>
</div>
```

---

## Spinner Colors

| Section | Spinner class |
|---|---|
| App pages (dashboard, portal, plans, payments) | `border-indigo-500 border-t-transparent animate-spin` |
| Admin / superadmin pages | `border-violet-500 border-t-transparent animate-spin` |

---

## Loading, Error & Empty States

Every async-loaded view must have all three states:

```tsx
if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /></div>
if (error) return <div className="text-center py-16 text-slate-500">Failed to load. <button onClick={retry} className="text-indigo-600 dark:text-indigo-400 underline">Try again</button></div>
if (!data?.length) return <div className="text-center py-16 text-slate-500">No plans yet. <Link href="/plans/new" className="text-indigo-600 dark:text-indigo-400 underline">Create your first plan</Link></div>
```

### SmartCommission empty state CTAs

| Page | Empty state CTA |
|---|---|
| `/plans` | "Create your first compensation plan" |
| `/quotas` | "Assign your first quota" |
| `/transactions` | "Import your first transactions" |
| `/disputes` | "No open disputes" (no CTA — this is positive) |
| `/portal/earnings` | "Your earnings will appear after the first calculation run" |

---

## Avatar Upload (Profile Page)

- Camera icon overlay on the profile avatar.
- Tapping opens a file picker.
- Upload to Firebase Storage at `avatars/{uid}`.
- 5 MB limit — show error if exceeded.
- Update both Firebase Auth `photoURL` and DB `User.avatarUrl`.

---

## Performance Conventions

### Parallelise DB queries

Use `Promise.all` for independent queries — never sequential `await` chains in a single request.

```ts
// ✅ Correct
const [plans, quotas, users] = await Promise.all([
  db.compensationPlan.findMany({ where: { organisationId }, take: 100 }),
  db.quota.findMany({ where: { organisationId }, take: 200 }),
  db.user.findMany({ where: { organisationId }, take: 200 }),
])

// ❌ Incorrect
const plans = await db.compensationPlan.findMany(...)
const quotas = await db.quota.findMany(...)
const users = await db.user.findMany(...)
```

### Cap findMany

Every unbounded list query must have `take`:

| List | Recommended `take` |
|---|---|
| Plans, territories, periods | 100 |
| Transactions, earnings records | 200 |
| Admin tables (users, orgs) | 50 |
| Superadmin tables | 50 |

### Cache-Control headers

Semi-static GET routes must include `Cache-Control`:

```ts
// In GET route handlers for semi-static data:
response.headers.set('Cache-Control', 'private, s-maxage=60, stale-while-revalidate=300')
```

Routes to cache: `GET /api/plans` (active plans list), `GET /api/territories`, `GET /api/release-notes`, `GET /api/orgs/current` (org settings).

### Lazy-load heavy components

```tsx
// In app/(dashboard)/layout.tsx
const AiAssistant = dynamic(() => import('@/components/AiAssistant'), { ssr: false })
// Custom report builder
const ReportBuilder = dynamic(() => import('@/components/ReportBuilder'), { ssr: false })
// Calculation audit trail viewer
const AuditTrailViewer = dynamic(() => import('@/components/AuditTrailViewer'), { ssr: false })
// Monaco SQL editor (query console)
const QueryConsole = dynamic(() => import('@/components/QueryConsole'), { ssr: false })
```

### AdminNav in shared layout

`AdminNav` (for the superadmin section) lives in `app/(superadmin)/layout.tsx` — never repeated per-page.

### DB indexes

All `@@index` on frequently-filtered columns (see `data-model.md` for the full list):

- `(organisationId)` on every tenant-scoped table
- `(organisationId, status)` on plans, payment runs, disputes
- `(userId, organisationId)` on earnings records, quotas
- `(organisationId, period)` on quotas, earnings records, calculation runs

---

## Admin Nav Layout

The superadmin navigation lives in `app/(superadmin)/layout.tsx`:

```tsx
// app/(superadmin)/layout.tsx
<nav className="border-b border-violet-800/60 bg-violet-950 px-6">
  <div className="flex gap-6">
    <NavLink href="/admin/orgs">Organisations</NavLink>
    <NavLink href="/admin/users">Users</NavLink>
    <NavLink href="/admin/release-notes">Release Notes</NavLink>
    <NavLink href="/admin/logs">Logs</NavLink>
  </div>
</nav>
```

Regular dashboard nav (`ADMIN`, `FINANCE`, `MANAGER`, `REP`) lives in `app/(dashboard)/layout.tsx`:

```tsx
// Main nav links for dashboard
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'FINANCE', 'MANAGER'] },
  { href: '/plans', label: 'Plans', roles: ['ADMIN', 'FINANCE'] },
  { href: '/calculations', label: 'Calculations', roles: ['ADMIN', 'FINANCE'] },
  { href: '/payments', label: 'Payments', roles: ['ADMIN', 'FINANCE'] },
  { href: '/disputes', label: 'Disputes', roles: ['ADMIN', 'FINANCE', 'MANAGER', 'REP'] },
  { href: '/reports', label: 'Reports', roles: ['ADMIN', 'FINANCE', 'MANAGER', 'READ_ONLY'] },
  { href: '/portal', label: 'My Portal', roles: ['REP'] },
]
```

---

## Open Roadmap Items

| Code | Priority | Status | Title |
|---|---|---|---|
| **R-076** | Critical | Open | Create Next.js App Router project scaffold — first UI will inherit all patterns from this doc |
