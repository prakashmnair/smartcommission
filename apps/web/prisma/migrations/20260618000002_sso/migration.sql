CREATE TABLE "sso_configs" (
  "id" TEXT NOT NULL,
  "organisationId" TEXT NOT NULL,
  "protocol" TEXT NOT NULL DEFAULT 'SAML',
  "idpEntityId" TEXT,
  "idpSsoUrl" TEXT,
  "idpCertificate" TEXT,
  "idpMetadataXml" TEXT,
  "oidcDiscoveryUrl" TEXT,
  "oidcClientId" TEXT,
  "oidcClientSecretEnc" TEXT,
  "oidcScopes" TEXT[] DEFAULT ARRAY['openid','email','profile'],
  "spEntityId" TEXT NOT NULL,
  "spAcsUrl" TEXT NOT NULL,
  "emailDomain" TEXT NOT NULL,
  "forceSso" BOOLEAN NOT NULL DEFAULT false,
  "isEnabled" BOOLEAN NOT NULL DEFAULT false,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "isIdpEnabled" BOOLEAN NOT NULL DEFAULT false,
  "idpClients" JSONB,
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sso_configs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sso_configs_organisationId_key" UNIQUE ("organisationId")
);
CREATE INDEX "sso_configs_organisationId_idx" ON "sso_configs"("organisationId");
CREATE INDEX "sso_configs_emailDomain_idx" ON "sso_configs"("emailDomain");
