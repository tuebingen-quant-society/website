export const SAML_PATH = "/api/auth/saml";

export function getSpUrls(environment: NodeJS.ProcessEnv = process.env) {
  const configured = environment.SAML_SP_BASE_URL?.trim();
  if (!configured) throw new Error("SAML_SP_BASE_URL is required");

  let baseUrl: URL;
  try {
    baseUrl = new URL(configured);
  } catch {
    throw new Error("SAML_SP_BASE_URL must be an HTTPS origin");
  }
  if (
    baseUrl.protocol !== "https:" ||
    baseUrl.username ||
    baseUrl.password ||
    baseUrl.pathname !== "/" ||
    baseUrl.search ||
    baseUrl.hash
  ) {
    throw new Error("SAML_SP_BASE_URL must be an HTTPS origin");
  }

  return {
    entityId: `${baseUrl.origin}${SAML_PATH}/metadata`,
    acsUrl: `${baseUrl.origin}${SAML_PATH}/acs`,
    loginUrl: `${baseUrl.origin}${SAML_PATH}/login`,
  };
}

export const REQUEST_COOKIE = "tqs_saml_request";
export const SESSION_COOKIE = "tqs_session";
export const REQUEST_TTL_SECONDS = 10 * 60;
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export const ATTRIBUTE_NAMES = {
  pairwiseId: "urn:oasis:names:tc:SAML:attribute:pairwise-id",
  mail: "urn:oid:0.9.2342.19200300.100.1.3",
  affiliation: "urn:oid:1.3.6.1.4.1.5923.1.1.1.9",
} as const;
