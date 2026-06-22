# SmartCommission — Superuser Pattern

Last reviewed: 2026-06-20

---

## Overview

SmartCommission implements platform superadmin using an `isSuperAdmin` boolean column on the `User` model (simpler than a separate `SuperAdmin` table given the project's single-app architecture). The `SUPER_ADMIN` role value in `User.role` is **not used** — superadmin status is tracked via `User.isSuperAdmin`.

`prakashmnair@gmail.com` is always a platform superadmin — enforced in code via a hardcoded email check that bypasses the DB entirely.

---

## Implementation Status

| Component | Status | Location |
|---|---|---|
| `User.isSuperAdmin` boolean field | ✅ Implemented | `prisma/schema.prisma` line 49 |
| `isSuperAdmin()` helper | ✅ Implemented | `apps/web/lib/auth/superadmin.ts` |
| `requireSuperAdmin()` middleware | ✅ Implemented | `apps/web/lib/auth/superadmin.ts` |
| Superadmin layout guard | ✅ Implemented | `apps/web/app/(superadmin)/layout.tsx` |
| `PATCH /api/superadmin/users` (grant/revoke) | ✅ Implemented | `apps/web/app/api/superadmin/users/route.ts` |
| `GET /api/superadmin/users` | ✅ Implemented | `apps/web/app/api/superadmin/users/route.ts` |
| `GET /api/superadmin/orgs` | ✅ Implemented | `apps/web/app/api/superadmin/orgs/route.ts` |
| `/admin/orgs` superadmin console | ✅ Implemented | `apps/web/app/(superadmin)/admin/orgs/page.tsx` |
| `/admin/users` superadmin console | ✅ Implemented | `apps/web/app/(superadmin)/admin/users/page.tsx` |
| `/admin/logs` superadmin audit view | ✅ Implemented | `apps/web/app/(superadmin)/admin/logs/page.tsx` |
| `/admin/release-notes` | ✅ Implemented | `apps/web/app/(superadmin)/admin/release-notes/page.tsx` |
| Self-revoke protection | ✅ Implemented | `PATCH /api/superadmin/users` line 52 |
| Permanent-account protection | ✅ Implemented | `PATCH /api/superadmin/users` line 47 |
| Audit + security logging on grant/revoke | ✅ Implemented | `PATCH /api/superadmin/users` |

---

## Data Model

SmartCommission uses the `isSuperAdmin` boolean field on the `User` model — **no separate SuperAdmin table**. This is the simpler pattern suited to this project's single-app architecture.

```prisma
model User {
  // ...
  isSuperAdmin   Boolean   @default(false)
  // ...
}
```

Note: The `User.role` field with value `SUPER_ADMIN` is **not used** for platform superadmin — that value is vestigial. Superadmin status is tracked exclusively via `User.isSuperAdmin`. The `ADMIN` role in `User.role` is for org-level admins within their own `Organisation`. Do not conflate these.

---

## Auth Helper

```ts
// apps/web/lib/auth/superadmin.ts
import 'server-only'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { logSecurity } from '@/lib/security-log'
import { getRequestContext } from '@/lib/request-context'

const PERMANENT_SUPERADMIN_EMAIL = 'prakashmnair@gmail.com'

export async function isSuperAdmin(uid: string, email?: string): Promise<boolean> {
  // Hardcoded permanent superadmin — always true regardless of DB state
  if (email === PERMANENT_SUPERADMIN_EMAIL) return true
  // DB check for other platform superadmins via User.isSuperAdmin
  const user = await db.user.findUnique({ where: { firebaseUid: uid }, select: { isSuperAdmin: true } })
  return !!user?.isSuperAdmin
}

export async function requireSuperAdmin(req: NextRequest): Promise<{ uid: string; email: string } | NextResponse> {
  const session = await getSessionUser(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const isAdmin = await isSuperAdmin(session.uid, session.email)
  if (!isAdmin) {
    await logSecurity('UNAUTHORIZED_ACCESS', {
      userId: session.uid, userEmail: session.email,
      severity: 'CRITICAL',
      details: { path: req.nextUrl.pathname },
      ...getRequestContext(req),
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return { uid: session.uid, email: session.email }
}
```

---

## API Routes

### `GET /api/superadmin/users`

List all platform users (paginated). Requires platform superadmin.

### `GET /api/superadmin/orgs`

List all organisations. Requires platform superadmin.

### `POST /api/superadmin/grant`

Grant platform superadmin access.

```json
{ "userId": "...", "email": "..." }
```

Guards:
- Requester must be platform superadmin
- Target user must exist in the `users` table

### `POST /api/superadmin/revoke`

Revoke platform superadmin access.

```json
{ "userId": "..." }
```

Guards:
- Requester must be platform superadmin
- **Cannot revoke own access** → return 400 `"Cannot remove your own superadmin access"`
- **Cannot revoke `prakashmnair@gmail.com`** → return 400 `"This superadmin account cannot be removed"`

---

## UI

- Route group: `app/(superadmin)/` — protected by server-side layout guard
- Visual differentiator: violet/purple accent (not indigo — avoids confusion with regular org admin UI)
- Dashboard: `/admin/orgs` — all organisations, platform stats
- Users: `/admin/users` — all users across all orgs

### Superadmin layout guard

```tsx
// app/(superadmin)/layout.tsx
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/auth/superadmin'
import { getUserFromSession } from '@/lib/auth'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserFromSession()
  if (!user) redirect('/login')
  const ok = await isSuperAdmin(user.uid, user.email)
  if (!ok) redirect('/dashboard')
  return (
    <>
      <div className="bg-violet-950 border-b border-violet-800/60 px-4 py-1.5 flex items-center justify-between text-xs">
        <span className="text-violet-400 font-semibold tracking-wide">⚡ Platform Super Admin</span>
      </div>
      {children}
    </>
  )
}
```

---

## Seed / Bootstrap

The permanent superadmin (`prakashmnair@gmail.com`) does NOT need a DB row — `isSuperAdmin()` always returns true for that email because of the hardcoded check. No seeding required.

For other platform superadmins, grant access via `PATCH /api/superadmin/users` with `{ "isSuperAdmin": true }`. This sets `User.isSuperAdmin = true` in the database.

---

## Security Checklist

- [x] `User.isSuperAdmin` boolean added to `prisma/schema.prisma`
- [x] `isSuperAdmin()` helper implemented in `apps/web/lib/auth/superadmin.ts`
- [x] All `/api/superadmin/*` routes call `requireSuperAdmin()` before any logic
- [x] Self-revoke guard in `PATCH /api/superadmin/users`
- [x] Permanent email guard: cannot revoke `prakashmnair@gmail.com`
- [x] Audit log written for every grant/revoke action
- [x] Superadmin UI route group has a server-side layout guard at `app/(superadmin)/layout.tsx`
- [x] No superadmin capability accessible to regular users even if URL is guessed
- [x] `SUPER_ADMIN` value in `User.role` is NOT used for platform superadmin — status tracked via `User.isSuperAdmin` only

---

## Open Roadmap Items

| Code | Priority | Status | Title |
|---|---|---|---|
| **R-077** | Critical | ✅ DONE 2026-06-20 | Implement superuser pattern |
