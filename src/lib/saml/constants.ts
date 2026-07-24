import { site } from "@/config";

export const SAML_PATH = "/api/auth/saml";
export const SP_ENTITY_ID = `${site}${SAML_PATH}/metadata`;
export const SP_ACS_URL = `${site}${SAML_PATH}/acs`;
export const SP_LOGIN_URL = `${site}${SAML_PATH}/login`;

export const REQUEST_COOKIE = "tqs_saml_request";
export const SESSION_COOKIE = "tqs_session";
export const REQUEST_TTL_SECONDS = 10 * 60;
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export const ATTRIBUTE_NAMES = {
  pairwiseId: "urn:oasis:names:tc:SAML:attribute:pairwise-id",
  mail: "urn:oid:0.9.2342.19200300.100.1.3",
  affiliation: "urn:oid:1.3.6.1.4.1.5923.1.1.1.9",
} as const;
