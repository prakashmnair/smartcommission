# SmartCommission — Role Switching & Proxying

Last reviewed: 2026-06-19

---

## Overview

SmartCommission is a multi-tenant SaaS platform. A single user account can simultaneously hold multiple roles across the platform:

| Role | Description |
|---|---|
| Platform Superadmin | Platform-wide access — manages all organisations, billing, logs, impersonation |
| Org Admin (`ADMIN`) | Administrator of a specific organisation |
| Org Finance (`FINANCE`) | Finance role within an organisation |
| Org Manager (`MANAGER`) | Manager role within an organisation |
| Org Rep (`REP`) | Sales rep within an organisation |
| Org Read-Only (`READ_ONLY`) | View-only within an organisation |

A user may be a platform superadmin and also an admin or member of multiple organisations. The **active context** (role + organisationId) determines which UI and data they see. They can switch context without logging out.

**Proxying** allows a platform superadmin to act as any user in any organisation to debug issues or provide support. A permanent amber banner is shown during proxying.

---

## Implementation Status

| Component | Status | Location |
|---|---|---|
| `lib/context.ts` — `getActiveContext()`, `buildContextCookie()` | Open — not yet implemented | `lib/context.ts` |
| `GET /api/context/available` | Open — not yet implemented | `app/api/context/available/route.ts` |
| `POST /api/context/switch` | Open — not yet implemented | `app/api/context/switch/route.ts` |
| `POST /api/superadmin/proxy` | Open — not yet implemented | `app/api/superadmin/proxy/route.ts` |
| `POST /api/superadmin/proxy/stop` | Open — not yet implemented | `app/api/superadmin/proxy/stop/route.ts` |
| `components/RoleSwitcher.tsx` | Open — not yet implemented | `components/RoleSwitcher.tsx` |
| `components/ProxyBanner.tsx` | Open — not yet implemented | `components/ProxyBanner.tsx` |
| RoleSwitcher wired into layouts | Open — not yet implemented | All layout files |

---

## Active Context

### Cookie: `__context`

A signed JSON cookie set server-side. Never trust client-supplied context — always re-validate against the DB on each request.

```ts
interface ActiveContext {
  role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'ORG_FINANCE' | 'ORG_MANAGER' | 'ORG_REP' | 'ORG_READ_ONLY'
  organisationId: string | null   // null when role is SUPER_ADMIN
  proxying: {
    uid: string
    email: string
    organisationId: string
    role: string
  } | null
}
```

Cookie settings: `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `maxAge: 60 * 60 * 8` (8 hours). During proxy session: `maxAge: 60 * 60 * 2` (2 hours max).

### `lib/context.ts`

```ts
import 'server-only'
import { cookies } from 'next/headers'
import { verifySessionCookie } from '@/lib/firebase/admin'
import { db } from '@/lib/db'
import { PERMANENT_SUPERADMIN_EMAIL } from '@/lib/auth/superadmin'

export interface ActiveContext {
  role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'ORG_FINANCE' | 'ORG_MANAGER' | 'ORG_REP' | 'ORG_READ_ONLY'
  organisationId: string | null
  proxying: { uid: string; email: string; organisationId: string; role: string } | null
}

export async function getActiveContext(): Promise<ActiveContext | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('__session')?.value
  if (!session) return null
  const decoded = await verifySessionCookie(session)
  if (!decoded) return null

  const raw = cookieStore.get('__context')?.value
  let ctx: ActiveContext | null = null
  if (raw) {
    try { ctx = JSON.parse(Buffer.from(raw, 'base64').toString()) } catch { ctx = null }
  }

  // Always validate claimed context against DB
  if (ctx?.role === 'SUPER_ADMIN') {
    const sa = await db.superAdmin.findUnique({ where: { firebaseUid: decoded.uid, active: true } })
    if (!sa && decoded.email !== PERMANENT_SUPERADMIN_EMAIL) return null
    return { role: 'SUPER_ADMIN', organisationId: null, proxying: ctx.proxying ?? null }
  }

  if (ctx?.organisationId) {
    const user = await db.user.findFirst({
      where: { firebaseUid: decoded.uid, organisationId: ctx.organisationId, status: 'ACTIVE' },
    })
    if (user) return { role: mapDbRoleToContext(user.role), organisationId: ctx.organisationId, proxying: null }
  }

  return deriveDefaultContext(decoded.uid, decoded.email)
}

function mapDbRoleToContext(dbRole: string): ActiveContext['role'] {
  const map: Record<string, ActiveContext['role']> = {
    ADMIN: 'ORG_ADMIN',
    FINANCE: 'ORG_FINANCE',
    MANAGER: 'ORG_MANAGER',
    REP: 'ORG_REP',
    READ_ONLY: 'ORG_READ_ONLY',
  }
  return map[dbRole] ?? 'ORG_REP'
}

async function deriveDefaultContext(uid: string, email: string): Promise<ActiveContext | null> {
  if (email === PERMANENT_SUPERADMIN_EMAIL) {
    return { role: 'SUPER_ADMIN', organisationId: null, proxying: null }
  }
  const sa = await db.superAdmin.findUnique({ where: { firebaseUid: uid, active: true } })
  if (sa) return { role: 'SUPER_ADMIN', organisationId: null, proxying: null }

  // Default to first active org membership
  const user = await db.user.findFirst({
    where: { firebaseUid: uid, status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
  })
  if (user) return { role: mapDbRoleToContext(user.role), organisationId: user.organisationId, proxying: null }
  return null
}

export function buildContextCookie(ctx: ActiveContext): string {
  return Buffer.from(JSON.stringify(ctx)).toString('base64')
}
```

---

## API Routes

### `GET /api/context/available`

Returns all roles available to the current user — used by the `RoleSwitcher` dropdown.

Response shape:
```json
{
  "superAdmin": true,
  "orgs": [
    { "organisationId": "...", "name": "Acme Corp", "slug": "acme-corp", "role": "ADMIN" }
  ]
}
```

### `POST /api/context/switch`

Sets `__context` cookie to the requested role after validating against DB.

Request: `{ "role": "ORG_ADMIN", "organisationId": "..." }`

For switching to `SUPER_ADMIN`: validates via `isSuperAdmin(uid, email)`.
For switching to an org role: validates user has an `ACTIVE` record in `users` for that org.

### `POST /api/superadmin/proxy`

Platform superadmin only. Starts a proxy session as another user.

```json
{ "targetFirebaseUid": "...", "organisationId": "...", "targetRole": "ORG_REP" }
```

Guards:
- Requester must be platform superadmin (via `requireSuperAdmin()`)
- Cannot proxy another superadmin — return 400
- Cannot self-proxy — return 400
- Logs `PROXY_STARTED` (WARNING severity)
- Sets `__context` cookie with `maxAge: 60 * 60 * 2`

### `POST /api/superadmin/proxy/stop`

Ends proxy session, returns to `SUPER_ADMIN` context.

Logs `PROXY_STOPPED` (INFO severity).

---

## UI Components

### `components/RoleSwitcher.tsx`

Client component in every layout header (right side, alongside ThemeToggle and ProfileMenu):

- Violet styling when role is `SUPER_ADMIN`
- Amber styling when proxying
- Standard slate styling for org roles
- Dropdown lists all available orgs + SUPER_ADMIN option (if eligible)

### `components/ProxyBanner.tsx`

Fixed amber banner at top of page during proxy session:

- `fixed top-0 left-0 right-0 z-[9999]` — always visible
- Shows: "Proxying as [email] · [Org Name] ([Role])"
- "Stop proxying" button → calls `POST /api/superadmin/proxy/stop` and redirects to `/admin`
- When proxy banner is present, push content down by the banner height (use `pt-10` on body or layout)

---

## RoleSwitcher Placement in Layouts

The `RoleSwitcher` component must appear in every layout header:

- `app/(dashboard)/layout.tsx` — org member layouts
- `app/(superadmin)/layout.tsx` — superadmin layout
- The `ProxyBanner` renders above everything when `ctx.proxying` is set

```tsx
// In your layout server component:
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { ProxyBanner } from '@/components/ProxyBanner'
import { getActiveContext } from '@/lib/context'

const ctx = await getActiveContext()

// In JSX:
{ctx?.proxying && (
  <ProxyBanner
    targetEmail={ctx.proxying.email}
    orgName={organisation?.name ?? ''}
    role={ctx.proxying.role}
  />
)}

// In the header right zone:
<RoleSwitcher
  currentRole={ctx?.role ?? 'ORG_REP'}
  currentOrgName={organisation?.name}
  proxying={ctx?.proxying}
/>
```

---

## Security Rules

1. Never trust `__context` cookie alone — always re-validate against DB in `getActiveContext()`
2. Proxy session cookie expires in 2 hours (shorter than regular 8-hour context cookie)
3. Every proxy start/stop is logged as a security event
4. Cannot proxy another superadmin — return 400
5. Cannot self-proxy — return 400
6. During proxying: all DB queries use `ctx.proxying.organisationId`, not any user-supplied value
7. `CONTEXT_SWITCH` security event logged on every role switch

---

## Security Event Taxonomy

| Event | Severity | When |
|---|---|---|
| `PROXY_STARTED` | WARNING | Platform superadmin begins proxying as another user |
| `PROXY_STOPPED` | INFO | Proxy session ended |
| `CONTEXT_SWITCH` | INFO | User switches active org or role context |

---

## SmartCommission-Specific Notes

SmartCommission has RBAC at two levels:

1. **Platform level** — `SuperAdmin` table — cross-org platform operators
2. **Org level** — `User.role` field — `ADMIN`, `FINANCE`, `MANAGER`, `REP`, `READ_ONLY`

The `SUPER_ADMIN` value in `User.role` is **not used** — it was included in the schema during planning but conflicts with platform superadmin. Org-level admin is simply `ADMIN`. Do not use `User.role = 'SUPER_ADMIN'`.

For users who are members of multiple organisations (unlikely in practice but supported architecturally), the `RoleSwitcher` dropdown lists all their org memberships.

---

## Open Roadmap Items

| Code | Priority | Status | Title |
|---|---|---|---|
| R-088 | High | Open | Implement role switching and proxying (prerequisite for superadmin console) |

---

## Checklist

- [ ] `lib/context.ts` — `getActiveContext()`, `buildContextCookie()`, `ActiveContext` type
- [ ] `GET /api/context/available` — returns all orgs and superadmin status
- [ ] `POST /api/context/switch` — sets `__context` cookie (validates against DB)
- [ ] `POST /api/superadmin/proxy` — starts proxy session (superadmin only)
- [ ] `POST /api/superadmin/proxy/stop` — ends proxy session
- [ ] `components/RoleSwitcher.tsx` — dropdown in every layout header
- [ ] `components/ProxyBanner.tsx` — amber top banner during active proxy session
- [ ] Both components wired into dashboard and superadmin layouts
- [ ] `PROXY_STARTED` / `PROXY_STOPPED` / `CONTEXT_SWITCH` security log entries
- [ ] Cannot proxy another superadmin (400 guard)
- [ ] Cannot self-proxy (400 guard)
- [ ] Proxy cookie `maxAge` = 2 hours
- [ ] `User.role = 'SUPER_ADMIN'` enum value removed from schema (not used)
