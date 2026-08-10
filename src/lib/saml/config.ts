import {
  ValidateInResponseTo,
  type CacheProvider,
  type SamlConfig,
} from "@node-saml/node-saml";
import { kontakt, site, wortmarke } from "@/config";
import { getSpUrls, REQUEST_TTL_SECONDS } from "./constants";

export class SamlConfigurationError extends Error {}

function required(name: string) {
  const value = process.env[name]?.replaceAll("\\n", "\n").trim();
  if (!value) throw new SamlConfigurationError(`${name} is required`);
  return value;
}

function requirePem(name: string, label: "CERTIFICATE" | "PRIVATE KEY") {
  const value = required(name);
  if (!value.includes(`BEGIN ${label}`)) {
    throw new SamlConfigurationError(`${name} must be PEM encoded`);
  }
  return value;
}

export function getSessionSecret() {
  const secret = required("SAML_SESSION_SECRET");
  if (Buffer.byteLength(secret) < 32) {
    throw new SamlConfigurationError("SAML_SESSION_SECRET must be at least 32 bytes");
  }
  return secret;
}

export function getSpCredentials() {
  return {
    privateKey: requirePem("SAML_SP_PRIVATE_KEY", "PRIVATE KEY"),
    publicCert: requirePem("SAML_SP_CERT", "CERTIFICATE"),
  };
}

export function createSamlConfig(cacheProvider: CacheProvider): SamlConfig {
  const credentials = getSpCredentials();
  const urls = getSpUrls();
  return {
    ...credentials,
    decryptionPvk: credentials.privateKey,
    issuer: urls.entityId,
    callbackUrl: urls.acsUrl,
    entryPoint: required("SAML_IDP_SSO_URL"),
    idpIssuer: required("SAML_IDP_ISSUER"),
    idpCert: requirePem("SAML_IDP_CERT", "CERTIFICATE"),
    audience: urls.entityId,
    identifierFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
    attributeConsumingServiceIndex: "1",
    signatureAlgorithm: "sha256",
    digestAlgorithm: "sha256",
    acceptedClockSkewMs: 5_000,
    maxAssertionAgeMs: 5 * 60 * 1_000,
    requestIdExpirationPeriodMs: REQUEST_TTL_SECONDS * 1_000,
    validateInResponseTo: ValidateInResponseTo.always,
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: true,
    disableRequestedAuthnContext: true,
    cacheProvider,
    signMetadata: false,
    metadataOrganization: {
      OrganizationName: [{ "@xml:lang": "de", "#text": wortmarke.lang }],
      OrganizationDisplayName: [{ "@xml:lang": "de", "#text": wortmarke.lang }],
      OrganizationURL: [{ "@xml:lang": "de", "#text": site }],
    },
    metadataContactPerson: [
      {
        "@contactType": "technical",
        Company: wortmarke.lang,
        EmailAddress: [`mailto:${kontakt.mail}`],
      },
    ],
  };
}
