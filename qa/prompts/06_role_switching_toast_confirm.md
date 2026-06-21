# SmartCommission — QA Prompt: Role Switching, Proxying, Toast & Confirm Dialog

## Scope

Verify that multi-role context switching, superadmin proxying, and the custom toast/confirm system all work correctly. These replace native browser `alert`/`confirm` and ensure superadmin impersonation is audited.

---

## Pre-conditions

- Application is running locally with a multi-role user account (platform superadmin + org admin of at least one org)
- `prakashmnair@gmail.com` is confirmed as platform superadmin
- At least one test organisation exists with at least one non-superadmin user

---

## Test 1: RoleSwitcher — Context Switching

1. Log in as `prakashmnair@gmail.com`
2. Verify the `RoleSwitcher` component appears in the layout header (right side, near ThemeToggle)
3. Verify current context is shown (e.g. "Platform Admin" in violet)
4. Click RoleSwitcher → select an org admin context
5. Verify the header context indicator changes to reflect the org admin role
6. Verify data scope changes: you now see only that org's plans, users, and earnings
7. Verify `CONTEXT_SWITCH` event is recorded in security logs

**Expected:** Context switches cleanly; data scope changes; no page reload required; no cross-org data visible.

---

## Test 2: Superadmin Proxy

1. As superadmin, navigate to `/admin/users`
2. Find a non-superadmin user in any org and click "Proxy as this user"
3. Verify the amber `ProxyBanner` appears at the top of every page with the proxied user's name and a "Stop proxying" button
4. Verify you can navigate the app as that user and see only their data
5. Verify `PROXY_STARTED` is recorded in security logs with severity `CRITICAL`
6. Click "Stop proxying" in the ProxyBanner
7. Verify you return to your superadmin context
8. Verify `PROXY_STOPPED` is recorded in security logs

**Expected:** Proxy session works; amber banner always visible during proxy; cannot proxy another superadmin; proxy cookie expires after 2 hours.

---

## Test 3: Toast Notifications

1. Publish a compensation plan (POST /api/plans/:id/publish)
2. Verify a green success toast appears at the bottom-right of the screen
3. Verify the toast auto-dismisses after 4 seconds
4. Force an error (e.g. try to publish an already-published plan)
5. Verify a red error toast appears; verify it auto-dismisses after 5 seconds
6. Verify `window.alert` is **never** called — check browser console for no `window.alert` usage

**Expected:** Custom toast system works; no native browser popups; correct colour coding (green/red/amber/indigo).

---

## Test 4: ConfirmDialog — Destructive Actions

1. Navigate to `/payments` and open a payment run
2. Click "Cancel payment run" or "Delete"
3. Verify a modal ConfirmDialog appears with:
   - Title describing the action
   - Description of what will be deleted/cancelled
   - Red "Confirm" button with AlertTriangle icon
   - "Cancel" button
4. Click Cancel — verify no action is taken
5. Repeat step 2–3, then click Confirm
6. Verify the action executes and a success toast appears

**Expected:** ConfirmDialog blocks destructive actions; `window.confirm` is never called; cancel is safe.

---

## Test 5: ProfileMenu Structure

1. On any authenticated page, click the avatar in the top-right corner
2. Verify the dropdown shows (in order):
   - Name row (navigates to `/settings/profile`)
   - "Super User" row in violet (only visible if superadmin)
   - Divider
   - "Sign out" in red

**Expected:** Canonical dropdown order matches `admin/docs/templates/ux-patterns.md`; no display name text next to avatar trigger.

---

## Pass/Fail Criteria

| Test | Pass condition |
|---|---|
| Role switching | Context switches; CONTEXT_SWITCH logged |
| Proxy session | Amber banner shows; PROXY_STARTED CRITICAL logged |
| Proxy stop | Returns to superadmin; PROXY_STOPPED logged |
| Toast success | Green toast; auto-dismiss 4s; no window.alert |
| Toast error | Red toast; auto-dismiss 5s |
| ConfirmDialog | Modal appears; cancel is safe; window.confirm never called |
| ProfileMenu | Correct order; avatar-only trigger |
