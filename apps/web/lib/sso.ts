import { SAML, generateServiceProviderMetadata } from '@node-saml/node-saml'
import type { SsoConfig } from '@prisma/client'

function getSamlConfig(config: SsoConfig) {
  return {
    entryPoint: config.idpSsoUrl ?? '',
    issuer: config.spEntityId,
    callbackUrl: config.spAcsUrl,
    idpCert: config.idpCertificate ?? '',
    wantAuthnResponseSigned: false,
    wantAssertionsSigned: true,
    idpIssuer: config.idpEntityId ?? undefined,
  }
}

/** Build a SAML instance for the given config */
export function buildSaml(config: SsoConfig) {
  return new SAML(getSamlConfig(config))
}

/** Get the SAML SP authorize redirect URL */
export async function getSamlAuthorizeUrl(config: SsoConfig): Promise<string> {
  const saml = buildSaml(config)
  return saml.getAuthorizeUrlAsync('', undefined, {})
}

/** Validate an incoming SAML POST response */
export async function validateSamlResponse(config: SsoConfig, samlResponse: string) {
  const saml = buildSaml(config)
  return saml.validatePostResponseAsync({ SAMLResponse: samlResponse })
}

/** Generate SP metadata XML */
export function getSpMetadata(config: SsoConfig): string {
  return generateServiceProviderMetadata({
    callbackUrl: config.spAcsUrl,
    issuer: config.spEntityId,
    wantAssertionsSigned: true,
  })
}

// Legacy exports — used by existing ACS route which calls buildSp(config)
// Redirect to the unified SAML helper
export const buildSp = buildSaml
// buildIdp is no longer needed — node-saml v5 uses inline cert config
export const buildIdp = (_config: SsoConfig) => null
