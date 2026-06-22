# SmartCommission — Release Notes

Last reviewed: 2026-06-22

---

## Overview

SmartCommission provides a release notes page accessible to all authenticated users. Two distinct streams:

1. **Platform release notes** — product updates shipped by the engineering team, versioned (semver). Managed by platform superadmin. Visible to all users across all organisations by default. Superadmin can hide/show individual items globally.
2. **Tenant release notes** — custom announcements written by org admins for their own users (e.g. "New commission plan published for Q3", "Payment schedule updated"). Visible only to users of that organisation. Org admin controls visibility per item.

---

## Implementation Status

| Component | Status | Location |
|---|---|---|
| `ReleaseNote` Prisma model | ✅ Implemented 2026-06-20 | `apps/web/prisma/schema.prisma` |
| `GET /api/release-notes` | ✅ Implemented 2026-06-20 | `apps/web/app/api/release-notes/route.ts` |
| Tenant admin CRUD routes | ✅ Implemented 2026-06-20 | `apps/web/app/api/release-notes/tenant/route.ts` |
| Superadmin CRUD routes | ✅ Implemented 2026-06-20 | `apps/web/app/api/superadmin/release-notes/route.ts` and `[id]/route.ts` |
| User-facing release notes page | ✅ Implemented 2026-06-20 | `apps/web/app/(dashboard)/release-notes/page.tsx` |
| Tenant admin management page | ✅ Implemented 2026-06-20 | `apps/web/app/(dashboard)/settings/release-notes/page.tsx` |
| Superadmin management page | ✅ Implemented 2026-06-20 | `apps/web/app/(superadmin)/admin/release-notes/page.tsx` |
| "What's New" nav link + badge | ✅ Implemented 2026-06-20 | `apps/web/components/WhatsNewNavLink.tsx` |

---

## Data Model

```prisma
model ReleaseNote {
  id          String    @id @default(cuid())
  // Platform release fields
  version     String?   // semver e.g. "1.0.0" — set for PLATFORM notes, null for TENANT notes
  // Content
  title       String
  summary     String    // one-liner shown in the list
  body        String?   // markdown — full detail, shown on expand
  type        String    @default("PLATFORM")  // PLATFORM | TENANT
  category    String    @default("FEATURE")   // FEATURE | IMPROVEMENT | FIX | SECURITY | BREAKING | DEPRECATION
  // Visibility
  isVisible   Boolean   @default(true)
  isPublished Boolean   @default(false)
  publishedAt DateTime?
  // Tenant scoping — null = platform-wide; set = org-specific
  tenantId    String?   // organisationId
  // Author
  createdById String
  updatedById String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("release_notes")
  @@index([type, isPublished, isVisible])
  @@index([tenantId])
  @@index([publishedAt])
}
```

Migration SQL:

```sql
CREATE TABLE "release_notes" (
  "id" TEXT NOT NULL,
  "version" TEXT,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "body" TEXT,
  "type" TEXT NOT NULL DEFAULT 'PLATFORM',
  "category" TEXT NOT NULL DEFAULT 'FEATURE',
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "tenantId" TEXT,
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "release_notes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "release_notes_type_published_visible_idx" ON "release_notes"("type", "isPublished", "isVisible");
CREATE INDEX "release_notes_tenantId_idx" ON "release_notes"("tenantId");
CREATE INDEX "release_notes_publishedAt_idx" ON "release_notes"("publishedAt");
```

---

## Category Badges

| Category | Colour | Meaning |
|---|---|---|
| `FEATURE` | indigo | New capability |
| `IMPROVEMENT` | blue | Enhancement to existing feature |
| `FIX` | green | Bug fixed |
| `SECURITY` | red | Security patch or improvement |
| `BREAKING` | orange | Breaking change — action may be required |
| `DEPRECATION` | amber | Feature being removed in a future version |

---

## API Routes

### Public — all authenticated users

**`GET /api/release-notes`**

Returns published + visible notes for the current user (platform notes + their org's tenant notes):

```ts
const notes = await db.releaseNote.findMany({
  where: {
    isPublished: true,
    isVisible: true,
    OR: [
      { type: 'PLATFORM' },
      { type: 'TENANT', tenantId: org.organisationId },
    ],
  },
  orderBy: { publishedAt: 'desc' },
  take: 100,
})
```

Add `Cache-Control: private, s-maxage=300` — notes change infrequently.

### Tenant admin — manage org release notes

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/release-notes/tenant` | List own org's notes (all, including drafts) |
| `POST` | `/api/release-notes/tenant` | Create a tenant note |
| `PATCH` | `/api/release-notes/tenant/[id]` | Update (title, body, category, isVisible, isPublished) |
| `DELETE` | `/api/release-notes/tenant/[id]` | Delete a tenant note |

All tenant routes: verify user is ADMIN of their org. Always scope `where: { tenantId: org.organisationId }`.

### Superadmin — manage platform release notes

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/superadmin/release-notes` | List all notes (platform + all tenants) |
| `POST` | `/api/superadmin/release-notes` | Create a platform note (type=PLATFORM, tenantId=null) |
| `PATCH` | `/api/superadmin/release-notes/[id]` | Update any note (including toggle isVisible/isPublished) |
| `DELETE` | `/api/superadmin/release-notes/[id]` | Delete any note |

All superadmin routes use `requireSuperAdmin()`.

---

## User-Facing Release Notes Page

Route: `app/(dashboard)/release-notes/page.tsx`

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  What's New                                             │
│  ─────────────────────────────────────────────────────  │
│  Filter: [All ▾]  [All categories ▾]                   │
│                                                         │
│  ── Platform Updates ────────────────────────────────   │
│  v1.0.0  •  DD Mon YYYY                                │
│  [FEATURE] Commission Plan Builder                      │
│  Design tiered commission plans with a step-by-step...  │
│                                                         │
│  ── Your Organisation's Updates ──────────────────────  │
│  [FEATURE] Q3 Commission Plans Published                │
│  Your admin has published the Q3 commission plans...   │
└─────────────────────────────────────────────────────────┘
```

Key behaviours:
- Only shows `isPublished: true, isVisible: true` items
- Platform section groups by version
- Tenant section shows by date (no version grouping)
- "New" badge: red dot on nav link if notes published in last 14 days not yet seen
- Click to expand full markdown `body` — collapsed by default showing only `summary`
- Empty state: "All up to date — check back soon."

### "New" Badge — Unread Tracking

localStorage key: `lastReadReleaseNotes_{organisationId}`. Compare against newest `publishedAt`. Show red dot if `newest > lastRead`.

---

## Tenant Admin Management Page

Route: `app/(dashboard)/settings/release-notes/page.tsx` (ADMIN role required)

- Header: "Organisation Updates" + "New Update" button
- Table: title, category badge, status (Draft / Published), visibility toggle, date, actions
- Eye/EyeOff toggle instantly toggles `isVisible` via PATCH
- Publish/Unpublish toggle

---

## Superadmin Management Page

Route: `app/(superadmin)/admin/release-notes/page.tsx`

Two tabs:
1. **Platform Updates** — create/edit/publish/hide platform-wide release notes with version number
2. **All Organisation Updates** — read-only view across all orgs, filterable by `tenantId`

---

## Audit Actions

| Action | When |
|---|---|
| `RELEASE_NOTE.CREATE` | Note created |
| `RELEASE_NOTE.UPDATE` | Note updated (incl. body changes) |
| `RELEASE_NOTE.PUBLISH` | Note published |
| `RELEASE_NOTE.UNPUBLISH` | Note unpublished |
| `RELEASE_NOTE.DELETE` | Note deleted |
| `RELEASE_NOTE.HIDE` | Visibility set to false |
| `RELEASE_NOTE.SHOW` | Visibility set to true |

---

## Nav Link Placement

- Add "What's New" to the main dashboard sidebar nav with a `Sparkles` or `Megaphone` icon
- Show red dot badge if there are unread notes (based on localStorage `lastReadReleaseNotes_{organisationId}`)
- Add "Release Notes" to the platform superadmin nav
- Add "Organisation Updates" to the admin settings nav sidebar

---

## Open Roadmap Items

| Code | Priority | Status | Title |
|---|---|---|---|
| R-087 | Medium | Open | Implement release notes system |

---

## Checklist

- [ ] `ReleaseNote` model added to schema, migration SQL run
- [ ] `GET /api/release-notes` returns platform + tenant notes for current user
- [ ] Tenant admin CRUD: create, update, publish, toggle visibility, delete
- [ ] Superadmin CRUD: same + manage platform notes
- [ ] User-facing page: two sections, version grouping, expand/collapse body
- [ ] Tenant admin settings page with eye/EyeOff toggle
- [ ] Superadmin management page with platform + all-org tabs
- [ ] "What's New" nav link + unread badge using localStorage
- [ ] All mutations audit-logged with `RELEASE_NOTE.*` actions
- [ ] `Cache-Control: private, s-maxage=300` on GET endpoint
