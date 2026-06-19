# SmartCommission — Design System

Last reviewed: 2026-06-19

---

## Overview

This document is SmartCommission's canonical UI/UX specification. All screens, components, and interactions must follow this spec. The canonical source is `admin/docs/templates/design-system.md` — this document adapts it for SmartCommission's specific pages and colour requirements.

---

## Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js App Router | Server + Client components |
| Styling | Tailwind CSS v4 | `@import "tailwindcss"` in globals.css |
| Font | Geist (sans) via `next/font/google` | Variable: `--font-geist` |
| Icons | `lucide-react` | Consistent stroke width, 16–20px default |
| Themes | `next-themes` | System default, user-overridable, persisted to localStorage |
| Animations | Tailwind + CSS keyframes | No external animation libraries |

---

## Implementation Status

| Component | Status | Notes |
|---|---|---|
| Next.js project scaffold | Open (R-076) | `apps/web/` directory does not yet exist |
| Tailwind v4 + Geist setup | Open | Required before any UI work |
| `globals.css` template | Open | Copy from this doc |
| `app/layout.tsx` with Providers | Open | Copy pattern from this doc |
| ThemeToggle component | Open | Required on every page |
| Light/dark mode | Open | Mandatory — every color must have both variants |
| PWA / Capacitor | Open | Required per CLAUDE.md cross-browser standard |

---

## Color Tokens

SmartCommission uses a **dual light/dark** color system. Every color class must have both light and dark variants. Never use dark-only classes.

### Page & Surface Backgrounds

| Role | Light | Dark | Usage |
|---|---|---|---|
| Page | `bg-slate-50` | `dark:bg-slate-950` | Body / outermost container |
| Card / Panel | `bg-white` | `dark:bg-slate-900` | Cards, sheets, sidebars |
| Elevated / Input | `bg-slate-100` | `dark:bg-slate-800` | Inputs, selected states, hover surfaces |
| Active / Selected | `bg-slate-200` | `dark:bg-slate-700` | Active nav items |

### Borders

| Role | Light | Dark |
|---|---|---|
| Default border | `border-slate-200` | `dark:border-slate-800` |
| Subtle divider | `border-slate-100` | `dark:border-slate-700` |
| Input border | `border-slate-300` | `dark:border-slate-700` |
| Input focus ring | `ring-indigo-500` | (same both modes) |

### Text

| Role | Light | Dark |
|---|---|---|
| Primary | `text-slate-900` | `dark:text-slate-100` |
| Secondary | `text-slate-600` | `dark:text-slate-400` |
| Muted | `text-slate-500` | `dark:text-slate-500` |
| Disabled | `text-slate-400` | `dark:text-slate-600` |
| Link / accent | `text-indigo-600` | `dark:text-indigo-400` |

### Primary Accent (Indigo — regular app UI)

| Role | Class |
|---|---|
| Primary action button | `bg-indigo-600 hover:bg-indigo-700` |
| Active / selected | `bg-indigo-500` |
| Badge background | `bg-indigo-100 dark:bg-indigo-950` |
| Badge text | `text-indigo-700 dark:text-indigo-300` |
| Spinner | `border-indigo-500 border-t-transparent` |
| Link / accent text | `text-indigo-600 dark:text-indigo-400` |

### Superadmin Accent (Violet — platform admin UI only)

| Role | Class |
|---|---|
| Superadmin header bar | `bg-violet-950 border-violet-800/60` |
| Superadmin text | `text-violet-400` |
| Superadmin spinner | `border-violet-500 border-t-transparent` |
| Admin button accent | `bg-violet-600 hover:bg-violet-700` |

### Semantic

| Role | Background | Text |
|---|---|---|
| Success | `bg-emerald-50 dark:bg-emerald-950/40` | `text-emerald-700 dark:text-emerald-300` |
| Warning | `bg-amber-50 dark:bg-amber-950/40` | `text-amber-700 dark:text-amber-300` |
| Danger / Error | `bg-red-50 dark:bg-red-950/40` | `text-red-700 dark:text-red-400` |
| Info | `bg-indigo-50 dark:bg-indigo-950/40` | `text-indigo-700 dark:text-indigo-300` |

### SmartCommission-Specific Status Colors

Used for attainment gauges, payment status badges, and calculation run status:

| Status | Light | Dark |
|---|---|---|
| On target (≥100%) | `bg-green-100 text-green-700` | `dark:bg-green-950/40 dark:text-green-300` |
| Near target (80–99%) | `bg-amber-100 text-amber-700` | `dark:bg-amber-950/40 dark:text-amber-300` |
| Below target (<80%) | `bg-red-100 text-red-700` | `dark:bg-red-950/40 dark:text-red-400` |
| Exceeding (≥125%) | `bg-yellow-100 text-yellow-700` | `dark:bg-yellow-950/40 dark:text-yellow-300` |

---

## Typography

Font: **Geist** loaded via `next/font/google`, assigned to `--font-geist` CSS variable.

```tsx
// app/layout.tsx
import { Geist } from 'next/font/google'
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
```

```css
/* globals.css */
@theme inline {
  --font-sans: var(--font-geist);
}
body { font-family: var(--font-geist), system-ui, sans-serif; }
```

### Type Scale

| Class | Size | Weight | Usage |
|---|---|---|---|
| `text-xs` | 12px | — | Badges, labels, captions, table headers |
| `text-sm` | 14px | — | Body text, form labels, button text |
| `text-base` | 16px | — | Default body |
| `text-lg` | 18px | semibold | Card titles, section headers |
| `text-xl` | 20px | bold | Page subheadings |
| `text-2xl` | 24px | bold | Page headings |
| `text-3xl` | 30px | extrabold | Dashboard hero metrics |
| `text-4xl+` | 36px+ | extrabold | Marketing / landing only |

---

## globals.css Template

```css
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));

:root {
  --background: #ffffff;
  --foreground: #0f172a;
}

.dark {
  --background: #020617;
  --foreground: #f1f5f9;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist), system-ui, sans-serif;
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.scrollbar-none {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-none::-webkit-scrollbar { display: none; }

.min-h-screen-dvh { min-height: 100dvh; }
```

---

## Light/Dark Mode

Light/dark mode is **mandatory**. Every project component must have both light and dark color variants.

### Providers

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### ThemeToggle Component

ThemeToggle MUST appear on **every screen** — including auth pages, onboarding, landing, and error pages.

Place as `fixed top-4 right-4 z-50` in root `app/layout.tsx`. Do not rely solely on nav components.

```tsx
// components/ThemeToggle.tsx
'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle theme"
    >
      <Sun size={18} className="hidden dark:block" />
      <Moon size={18} className="block dark:hidden" />
    </button>
  )
}
```

---

## Component Patterns

### Primary Button

```tsx
<button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
  Label
</button>
```

### Secondary Button

```tsx
<button className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors border border-slate-300 dark:border-slate-700">
  Label
</button>
```

### Danger Button

```tsx
<button className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
  Delete
</button>
```

### Text Input

```tsx
<input
  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
  placeholder="..."
/>
```

### Card

```tsx
// Standard card
<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
  ...
</div>

// Interactive card (e.g. compensation plan card)
<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer">
  ...
</div>
```

### Loading Spinner

App pages (indigo):
```tsx
<div className="flex items-center justify-center min-h-[200px]">
  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
</div>
```

Admin / superadmin pages (violet):
```tsx
<div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
```

### Error State

```tsx
<div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-center px-6">
  <p className="text-slate-700 dark:text-slate-300 font-semibold">Something went wrong</p>
  <p className="text-slate-500 dark:text-slate-400 text-sm">Brief explanation of the error.</p>
  <button onClick={onRetry} className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
    Try again
  </button>
</div>
```

### Empty State

```tsx
<div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-center px-6">
  <p className="text-slate-600 dark:text-slate-400 font-semibold">No results yet</p>
  <p className="text-slate-500 dark:text-slate-500 text-sm">Helpful prompt to guide the user.</p>
  <button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
    CTA
  </button>
</div>
```

### Status Badge (commission-specific)

```tsx
// Use for PlanStatus, PaymentStatus, DisputeStatus, etc.
const planStatusBadge: Record<string, string> = {
  DRAFT:     'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  REVIEW:    'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  APPROVED:  'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
  PUBLISHED: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300',
  ARCHIVED:  'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500',
}

<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planStatusBadge[status]}`}>
  {status}
</span>
```

### Back Navigation

Always `<ChevronLeft size={20} />` icon-only — **never** `← Text` links.

```tsx
import { ChevronLeft } from 'lucide-react'

<button
  onClick={() => router.back()}
  className="p-1.5 -ml-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
  aria-label="Go back"
>
  <ChevronLeft size={20} />
</button>
```

### Header Layout

Every page header must use this pattern: back nav + title on the left, ThemeToggle + ProfileMenu on the right.

```tsx
<header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
  <div className="flex items-center gap-2 min-w-0">
    <button className="p-1.5 -ml-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
      <ChevronLeft size={20} />
    </button>
    <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">Page Title</h1>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    <ThemeToggle />
    <ProfileMenu />
  </div>
</header>
```

### ProfileMenu

- Trigger: avatar icon only — **no display name text** in the button
- Dropdown order: name → "Super Admin" (if applicable) → Sign out

---

## SmartCommission Page-Specific Patterns

### Attainment Gauge

```tsx
// Colour-coded progress bar for attainment %
function AttainmentGauge({ pct }: { pct: number }) {
  const colour =
    pct >= 125 ? 'bg-yellow-500' :
    pct >= 100 ? 'bg-green-500' :
    pct >= 80  ? 'bg-amber-500' :
                 'bg-red-500'
  return (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${colour}`}
        style={{ width: `${Math.min(pct, 150)}%` }}
      />
    </div>
  )
}
```

### Data Table (for earnings, transactions, payment runs)

```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-slate-200 dark:border-slate-800">
        <th className="text-left px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Column</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">Value</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Layout Patterns

### Authenticated App Layout

```
┌──────────────────────────────────────┐
│  ProxyBanner (if proxying)           │  fixed top, amber
├──────────────────────────────────────┤
│  Header: back nav | title | ThemeToggle + RoleSwitcher + ProfileMenu │
├──────┬───────────────────────────────┤
│ Sidebar Nav │ Main content           │
│ (desktop)   │                        │
│             │                        │
└──────┴───────────────────────────────┘
│  Bottom nav (mobile only)            │  fixed bottom
└──────────────────────────────────────┘
```

### Mobile Navigation (bottom tab bar)

SmartCommission's mobile nav for the main app (REP portal):

Tabs: Dashboard | Earnings | Disputes | Portal | More

```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 px-2 z-50"
  style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
  {tabs.map(tab => (
    <Link key={tab.href} href={tab.href}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
        isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
      }`}>
      <tab.Icon size={20} />
      <span className="text-[10px] font-medium">{tab.label}</span>
    </Link>
  ))}
</nav>
```

Body must have `pb-24` clearance below the bottom nav.

---

## Cross-Browser & PWA Requirements

### Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

`viewport-fit=cover` required for `env(safe-area-inset-*)` to work on notched iPhones.

### Full-height Layouts

Always use `100dvh` instead of `100vh` to avoid iOS Safari toolbar collapse:

```tsx
// Bad
<div className="min-h-screen">
// Good
<div className="min-h-[100dvh]">
```

### Required PWA Files

- `public/manifest.json` — app manifest
- `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png`
- `public/apple-touch-icon.png` (180×180)
- `public/favicon.ico`
- `app/offline/page.tsx` — offline fallback page
- Service worker via `next-pwa`

### Theme Color Meta

```html
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#020617" media="(prefers-color-scheme: dark)" />
```

---

## Accessibility

- Color contrast ≥4.5:1 for body text (WCAG 2.1 AA)
- All interactive elements keyboard-accessible (Tab + Enter/Space)
- `aria-label` on all icon-only buttons (`ChevronLeft`, `ThemeToggle`, close buttons)
- Spinners need `role="status"` + `aria-label="Loading"`
- No color as the only signal (status badges use text + color)

---

## Admin / Superadmin Panel Differences

| Aspect | App (user/rep/manager) | Admin (org admin/finance) | Superadmin (platform) |
|---|---|---|---|
| Primary accent | Indigo | Indigo | Violet/Purple |
| Spinner color | `border-indigo-500` | `border-indigo-500` | `border-violet-500` |
| Header bar | White/slate | White/slate | `bg-violet-950` |
| Section label | — | — | "⚡ Platform Super Admin" |
| Navigation | Bottom tab bar (mobile) | Sidebar `app/admin/layout.tsx` | Sidebar `app/(superadmin)/layout.tsx` |

---

## Open Roadmap Items

| Code | Priority | Status | Title |
|---|---|---|---|
| **R-076** | Critical | Open | Create Next.js App Router project scaffold |

---

## Checklist

When creating any new screen or component:
- [ ] Read this doc before writing UI code
- [ ] Use `globals.css` template above
- [ ] Use `app/layout.tsx` pattern with `suppressHydrationWarning` and `ThemeProvider`
- [ ] Every color class has both light and dark variants
- [ ] ThemeToggle placed as `fixed top-4 right-4 z-50` in root layout
- [ ] Back navigation uses `<ChevronLeft size={20} />` icon-only — never text links
- [ ] Header layout: back nav + title left, ThemeToggle + ProfileMenu right
- [ ] ProfileMenu trigger is avatar-only (no name text in button)
- [ ] Spinner uses `border-indigo-500` in app pages, `border-violet-500` in admin/superadmin pages
- [ ] Full-height containers use `100dvh` not `100vh`
- [ ] `viewport-fit=cover` in viewport meta tag
- [ ] `env(safe-area-inset-bottom)` on fixed bottom nav
- [ ] Loading, error, and empty states on every async-loaded view
- [ ] Icons from `lucide-react` only — no other icon library
