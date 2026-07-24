import { SAML } from "@node-saml/node-saml";
import { kontakt, site, wortmarke } from "@/config";
import { ATTRIBUTE_NAMES, SP_ACS_URL, SP_ENTITY_ID } from "./constants";
import { getSpCredentials } from "./config";
import { RequestCookieCache } from "./request-cache";

const requestedAttributes = `
    <AttributeConsumingService index="1">
      <ServiceName xml:lang="de">${wortmarke.lang}</ServiceName>
      <ServiceName xml:lang="en">${wortmarke.lang}</ServiceName>
      <RequestedAttribute Name="${ATTRIBUTE_NAMES.pairwiseId}" FriendlyName="pairwise-id" isRequired="true"/>
      <RequestedAttribute Name="${ATTRIBUTE_NAMES.mail}" FriendlyName="mail" isRequired="true"/>
      <RequestedAttribute Name="${ATTRIBUTE_NAMES.affiliation}" FriendlyName="eduPersonScopedAffiliation" isRequired="true"/>
    </AttributeConsumingService>`;

export function generateMetadata() {
  const credentials = getSpCredentials();
  const saml = new SAML({
    ...credentials,
    issuer: SP_ENTITY_ID,
    callbackUrl: SP_ACS_URL,
    idpCert: credentials.publicCert,
    signatureAlgorithm: "sha256",
    digestAlgorithm: "sha256",
    identifierFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
    wantAssertionsSigned: true,
    signMetadata: false,
    cacheProvider: new RequestCookieCache(),
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
  });
  const xml = saml.generateServiceProviderMetadata(null, credentials.publicCert);
  const marker = /(<\/(?:md:)?SPSSODescriptor>)/;
  if (!marker.test(xml)) throw new Error("Could not add requested SAML attributes");
  return xml.replace(marker, `${requestedAttributes}\n  $1`);
}
