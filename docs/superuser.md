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

### SuperAdmin table (platform-level only)

```prisma
model SuperAdmin {
  id          String   @id @default(cuid())
  firebaseUid String   @unique
  email       String   @unique
  name        String
  grantedBy   String?  // firebaseUid of granting superadmin (null for seed record)
  grantedAt   DateTime @default(now())
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("super_admins")
}
```

Note: The `User` model already has a `role` field with `SUPER_ADMIN` as a value — this is used for **tenant-level** organisational admins (i.e. a user who is the primary admin of their `Organisation`). The `SuperAdmin` table is for platform-level operators with cross-org access. Do not conflate the two.

---

## Auth Helper

```ts
// lib/auth/superadmin.ts
import 'server-only'
import { db } from '@/lib/db'

const PERMANENT_SUPERADMIN_EMAIL = 'prakashmnair@gmail.com'

export async function isSuperAdmin(uid: string, email?: string): Promise<boolean> {
  // Hardcoded permanent superadmin — always true regardless of DB state
  if (email === PERMANENT_SUPERADMIN_EMAIL) return true
  // DB check for other platform superadmins
  const record = await db.superAdmin.findUnique({
    where: { firebaseUid: uid, active: true },
    select: { id: true },
  })
  return !!record
}

export async function requireSuperAdmin(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const ok = await isSuperAdmin(user.uid, user.email)
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return user
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

The permanent superadmin (`prakashmnair@gmail.com`) does NOT need a DB row — `isSuperAdmin()` always returns true for that email. Optionally insert a record on first login:

```ts
// In POST /api/auth/sync or sign-in handler:
if (user.email === 'prakashmnair@gmail.com') {
  await db.superAdmin.upsert({
    where: { firebaseUid: user.uid },
    create: { firebaseUid: user.uid, email: user.email, name: 'Prakash Nair', grantedBy: null, active: true },
    update: { active: true },
  })
}
```

---

## Security Checklist

- [ ] `SuperAdmin` model added to `prisma/schema.prisma`
- [ ] `isSuperAdmin()` helper implemented in `lib/auth/superadmin.ts`
- [ ] All `/api/superadmin/*` routes call `requireSuperAdmin()` before any logic
- [ ] Self-revoke guard in `POST /api/superadmin/revoke`
- [ ] Permanent email guard: cannot revoke `prakashmnair@gmail.com`
- [ ] Audit log written for every grant/revoke action
- [ ] Superadmin UI route group has a server-side layout guard at `app/(superadmin)/layout.tsx`
- [ ] No superadmin capability accessible to regular users even if URL is guessed
- [ ] `SUPER_ADMIN` role in `User.role` is tenant-level only — do not confuse with platform superadmin

---

## Open Roadmap Items

| Code | Priority | Status | Title |
|---|---|---|---|
| **R-077** | Critical | ✅ DONE 2026-06-20 | Implement superuser pattern |
