# SmartCommission — SSO (SP & IdP)

Last reviewed: 2026-06-22

---

## Overview

SmartCommission supports enterprise Single Sign-On at the organisation level. Enterprise customers (Growth+ plans) can configure their corporate identity provider (IdP) so their users log in via their company SSO rather than a username/password. Two modes are required:

- **SP mode (Service Provider):** Organisations configure their own IdP (Okta, Azure AD, Google Workspace, Ping) to authenticate their users into SmartCommission via SAML 2.0 or OIDC.
- **IdP mode (Identity Provider):** SmartCommission issues OIDC tokens for downstream integrations (e.g. CRM connectors or payroll tools that need to authenticate on behalf of a user).

SSO is particularly important for SmartCommission because:
- Finance and HR teams often have mandatory SSO policies
- SOC 2 Type II compliance requires supporting federated identity
- Enterprise customers require audit-logged SSO events for compliance

---

## Implementation Status

| Component | Status | Location |
|---|---|---|
| `SsoConfig` Prisma model | ✅ Implemented 2026-06-20 | `apps/web/prisma/schema.prisma` |
| `lib/sso.ts` SAML helper | ✅ Implemented 2026-06-20 | `apps/web/lib/sso.ts` |
| `GET /api/auth/sso/[orgSlug]/metadata` | ✅ Implemented 2026-06-20 | `apps/web/app/api/auth/sso/[orgSlug]/metadata/route.ts` |
| `GET /api/auth/sso/[orgSlug]/authorize` | ✅ Implemented 2026-06-20 | `apps/web/app/api/auth/sso/[orgSlug]/authorize/route.ts` |
| `POST /api/auth/sso/[orgSlug]/acs` | ✅ Implemented 2026-06-20 | `apps/web/app/api/auth/sso/[orgSlug]/acs/route.ts` |
| `GET /api/auth/sso/[orgSlug]/oidc/authorize` | ✅ Implemented 2026-06-20 | `apps/web/app/api/auth/sso/[orgSlug]/oidc/authorize/route.ts` |
| `GET /api/auth/sso/[orgSlug]/oidc/callback` | ✅ Implemented 2026-06-20 | `apps/web/app/api/auth/sso/[orgSlug]/oidc/callback/route.ts` |
| `GET /api/auth/sso/lookup` | ✅ Implemented 2026-06-20 | `apps/web/app/api/auth/sso/lookup/route.ts` |
| Admin SSO settings UI | ✅ Implemented 2026-06-20 | `apps/web/app/(dashboard)/settings/sso/page.tsx` |
| IdP mode endpoints (`/api/idp/*`) | ✅ Implemented 2026-06-20 | `apps/web/app/api/idp/` |
| Client-side SSO complete page | Open — to be built | `app/(auth)/auth/sso-complete/page.tsx` |

---

## Data Model

```prisma
model SsoConfig {
  id             String   @id @default(cuid())
  organisationId String   @unique
  organisation   Organisation @relation(fields: [organisationId], references: [id])
  protocol       String   @default("SAML")  // SAML | OIDC
  // SAML fields
  idpEntityId    String?
  idpSsoUrl      String?
  idpCertificate String?
  idpMetadataXml String?
  // OIDC fields
  oidcDiscoveryUrl    String?
  oidcClientId        String?
  oidcClientSecretEnc String?  // AES-256-GCM encrypted — never store plaintext
  oidcScopes          String[] @default(["openid", "email", "profile"])
  // SP identity
  spEntityId     String   // e.g. https://smartcommission.app/sso/{orgSlug}
  spAcsUrl       String   // assertion consumer service URL
  // Email domain enforcement
  emailDomain    String   // users with @this-domain.com auto-redirect to SSO
  forceSso       Boolean  @default(false)  // if true, password login disabled for this domain
  // State
  isEnabled      Boolean  @default(false)
  isVerified     Boolean  @default(false)
  // IdP mode
  isIdpEnabled   Boolean  @default(false)
  idpClients     Json?    // [{clientId, clientSecret(enc), redirectUris[], name}]
  // Audit
  createdById    String
  updatedById    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@map("sso_configs")
  @@index([organisationId])
  @@index([emailDomain])
}
```

---

## Dependencies

```bash
npm install @node-saml/node-saml openid-client
```

- `@node-saml/node-saml` v5 — SAML 2.0 SP assertion validation. Use `SAML` class directly — `ServiceProvider`/`IdentityProvider` do NOT exist in v5.
- `openid-client` v6 — OIDC SP flow. Use `discovery()` function — `Issuer.discover()` does NOT exist in v6.

---

## SP Mode — SAML 2.0

### Route summary

| Route | Method | Description |
|---|---|---|
| `/api/auth/sso/[orgSlug]/metadata` | GET | Return SP metadata XML for IdP configuration |
| `/api/auth/sso/[orgSlug]/authorize` | GET | Redirect to IdP for SP-initiated login |
| `/api/auth/sso/[orgSlug]/acs` | POST | Receive and validate SAML assertion from IdP |
| `/auth/sso-complete` | GET (page) | Client-side Firebase custom token exchange |

### Key implementation notes

- ACS endpoint validates: signature, `NotBefore`, `NotOnOrAfter`, audience restriction, recipient URL
- Firebase custom tokens cannot be exchanged server-side — redirect to client `sso-complete` page
- `sso-complete` page uses `signInWithCustomToken(auth, token)` then creates session cookie
- Wrap `useSearchParams` in `<Suspense>` in `sso-complete` — Next.js build fails otherwise

---

## SP Mode — OIDC

### Route summary

| Route | Method | Description |
|---|---|---|
| `/api/auth/sso/[orgSlug]/oidc/authorize` | GET | Redirect to IdP with PKCE |
| `/api/auth/sso/[orgSlug]/oidc/callback` | GET | Exchange code for tokens, provision user |

OIDC client secrets must be encrypted at rest using `ENCRYPTION_KEY` env var (AES-256-GCM). See `env-vars.md`.

---

## Email Domain Auto-Detection

On the login page when the user enters their email and clicks Continue:

1. Extract the domain from the email
2. `GET /api/auth/sso/lookup?domain={domain}`
3. If SSO config found and `isEnabled = true` → redirect to `/api/auth/sso/[orgSlug]/authorize`
4. Otherwise → show password field

```ts
// GET /api/auth/sso/lookup
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain')
  const config = await db.ssoConfig.findFirst({
    where: { emailDomain: domain, isEnabled: true },
    include: { organisation: { select: { slug: true } } },
  })
  if (!config) return NextResponse.json({ sso: false })
  return NextResponse.json({ sso: true, protocol: config.protocol, orgSlug: config.organisation.slug })
}
```

---

## IdP Mode — OIDC

When `isIdpEnabled = true`, SmartCommission issues OIDC tokens for registered downstream clients (e.g. CRM integrations, BI tools, or payroll systems).

### Endpoints required

| Route | Method | Description |
|---|---|---|
| `/.well-known/openid-configuration` | GET | OIDC discovery document |
| `/api/idp/authorize` | GET | Authorize registered downstream client |
| `/api/idp/token` | POST | Exchange authorization code for `id_token` + `access_token` |
| `/.well-known/jwks.json` | GET | Public key for JWT verification by downstream apps |

JWT payload: `{ sub: userId, email, name, org: organisationId, role: userRole }`

Private/public key pair stored in: `OIDC_PRIVATE_KEY_PEM`, `OIDC_PUBLIC_KEY_PEM` env vars.

---

## JIT User Provisioning

When a new user logs in via SSO for the first time, auto-provision them in the organisation:

```ts
async function findOrProvisionUser(organisationId: string, email: string, profile: { name?: string }) {
  const org = await db.organisation.findUnique({ where: { id: organisationId } })
  let user = await db.user.findFirst({ where: { email, organisationId } })
  if (!user) {
    const firebaseUser = await getFirebaseAdmin().getUserByEmail(email).catch(() => null)
    const firebaseUid = firebaseUser?.uid ?? (await getFirebaseAdmin().createUser({ email })).uid
    user = await db.user.create({
      data: {
        organisationId,
        email,
        firebaseUid,
        name: profile.name ?? email,
        role: 'READ_ONLY',  // default role — admin can elevate
        status: 'ACTIVE',
      },
    })
    await logSecurity('ACCOUNT_CREATED', {
      userId: user.id,
      userEmail: email,
      tenantId: organisationId,
      severity: 'INFO',
      details: { source: 'SSO_JIT' },
    })
  }
  return user
}
```

---

## Admin UI — SSO Configuration

Route: `app/(dashboard)/settings/sso/page.tsx` (ADMIN role required)

### Tabs

1. **Setup** — Choose protocol (SAML / OIDC), enter email domain, force SSO toggle
2. **IdP Config** — Paste metadata XML (SAML) or discovery URL + credentials (OIDC)
3. **SP Config** — Download SP metadata XML, show SP Entity ID and ACS URL
4. **Test** — "Test SSO login" button (opens popup to run test auth flow)
5. **Status** — Enable/disable toggle, last verified timestamp, JIT provisioning count

### Availability

SSO is available on Growth and Enterprise plans only. Starter/Free plans see a plan upgrade prompt on the SSO settings page.

---

## Security Events to Log

| Event | Severity | When |
|---|---|---|
| `SSO_LOGIN_SUCCESS` | INFO | SAML/OIDC assertion validated |
| `SSO_LOGIN_FAILURE` | WARNING | Invalid assertion, expired, wrong audience |
| `SSO_CONFIGURED` | WARNING | Admin saves SSO config |
| `SSO_ENABLED` | WARNING | Admin enables SSO for domain |
| `SSO_DISABLED` | WARNING | Admin disables SSO |
| `SSO_JIT_PROVISIONED` | INFO | New user auto-created via SSO |

---

## Audit Actions to Log

| Action | When |
|---|---|
| `SSO_CONFIG.CREATE` | SSO config first saved |
| `SSO_CONFIG.UPDATE` | Config updated |
| `SSO_CONFIG.ENABLE` | SSO enabled for domain |
| `SSO_CONFIG.DISABLE` | SSO disabled |
| `SSO_CONFIG.DELETE` | Config deleted |

---

## Environment Variables

```
ENCRYPTION_KEY=           # 32-byte hex — used to encrypt OIDC client secrets at rest
OIDC_PRIVATE_KEY_PEM=     # IdP mode: private key PEM (generate with openssl)
OIDC_PUBLIC_KEY_PEM=      # IdP mode: corresponding public key PEM
OIDC_ISSUER=              # IdP mode: public base URL e.g. https://app.smartcommission.app
```

See `env-vars.md` for complete variable list.

---

## Security Rules

- Never store OIDC client secrets in plaintext — always encrypt with AES-256-GCM
- Validate SAML assertions: signature, timing windows, audience restriction, recipient URL
- Validate SAML certificate matches stored IdP certificate (prevent certificate substitution)
- Rate limit `/api/auth/sso/*/acs` — 20 requests/minute per IP
- Never expose SAML assertion XML or OIDC tokens in logs
- `forceSso = true` must block password login entirely for users in that email domain

---

## Open Roadmap Items

| Code | Priority | Status | Title |
|---|---|---|---|
| **R-048** | High | Open | SSO — SAML 2.0 and OIDC (Phase 3) |

---

## Checklist

- [ ] `SsoConfig` model added to schema, migration SQL created
- [ ] SP metadata endpoint returns valid XML
- [ ] SAML ACS validates assertion (signature + timing + audience)
- [ ] OIDC callback exchanges code for tokens
- [ ] Email domain lookup endpoint implemented
- [ ] Login page detects SSO domain and auto-redirects
- [ ] `sso-complete` page exchanges custom token for session cookie
- [ ] JIT user provisioning creates account on first SSO login with `READ_ONLY` default role
- [ ] Admin settings UI — all 5 tabs implemented
- [ ] OIDC client secrets encrypted at rest
- [ ] Security events logged for all auth outcomes
- [ ] Rate limiting on ACS endpoint
- [ ] `forceSso` blocks password login for the domain when enabled
- [ ] Plan gate: SSO only available on Growth+ plans
