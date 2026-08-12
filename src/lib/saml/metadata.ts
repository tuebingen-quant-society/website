import { SAML } from "@node-saml/node-saml";
import { kontakt, site, wortmarke } from "@/config";
import { content } from "@/i18n/content";
import { ATTRIBUTE_NAMES, getSpUrls } from "./constants";
import { getSpCredentials } from "./config";
import { RequestCookieCache } from "./request-cache";

const NS = {
  mdui: "urn:oasis:names:tc:SAML:metadata:ui",
  mdattr: "urn:oasis:names:tc:SAML:metadata:attribute",
  saml: "urn:oasis:names:tc:SAML:2.0:assertion",
  remd: "http://refeds.org/metadata",
} as const;

/** Privacy statement per language, required for the DFN-AAI UI information. */
const PRIVACY_URLS = {
  de: `${site}/datenschutz`,
  en: `${site}/en/datenschutz`,
} as const;

function xml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Display name, description and privacy statement. DFN-AAI rejects entities in
 * productive federations without them, and node-saml does not emit mdui.
 */
const uiInfo = `
    <Extensions>
      <mdui:UIInfo xmlns:mdui="${NS.mdui}">
        <mdui:DisplayName xml:lang="de">${xml(wortmarke.lang)}</mdui:DisplayName>
        <mdui:DisplayName xml:lang="en">${xml(wortmarke.lang)}</mdui:DisplayName>
        <mdui:Description xml:lang="de">${xml(content.de.meta.beschreibung)}</mdui:Description>
        <mdui:Description xml:lang="en">${xml(content.en.meta.beschreibung)}</mdui:Description>
        <mdui:InformationURL xml:lang="de">${xml(site)}</mdui:InformationURL>
        <mdui:InformationURL xml:lang="en">${xml(`${site}/en`)}</mdui:InformationURL>
        <mdui:PrivacyStatementURL xml:lang="de">${xml(PRIVACY_URLS.de)}</mdui:PrivacyStatementURL>
        <mdui:PrivacyStatementURL xml:lang="en">${xml(PRIVACY_URLS.en)}</mdui:PrivacyStatementURL>
      </mdui:UIInfo>
    </Extensions>`;

/**
 * Signals that the pseudonymous pairwise-id, not a personal identifier, is the
 * subject identifier this service needs (SAML V2.0 Subject Identifier profile).
 */
const entityAttributes = `
  <Extensions>
    <mdattr:EntityAttributes xmlns:mdattr="${NS.mdattr}">
      <saml:Attribute xmlns:saml="${NS.saml}"
        Name="urn:oasis:names:tc:SAML:profiles:subject-id:req"
        NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
        <saml:AttributeValue>pairwise-id</saml:AttributeValue>
      </saml:Attribute>
    </mdattr:EntityAttributes>
  </Extensions>`;

/**
 * SAML 2.0 has no "security" contact type; REFEDS marks it on an "other"
 * contact, which is what the DFN incident-response process expects.
 */
const securityContact = `
  <ContactPerson xmlns:remd="${NS.remd}" contactType="other"
    remd:contactType="http://refeds.org/metadata/contactType/security">
    <Company>${xml(wortmarke.lang)}</Company>
    <EmailAddress>mailto:${xml(kontakt.mail)}</EmailAddress>
  </ContactPerson>`;

const requestedAttributes = `
    <AttributeConsumingService index="1">
      <ServiceName xml:lang="de">${wortmarke.lang}</ServiceName>
      <ServiceName xml:lang="en">${wortmarke.lang}</ServiceName>
      <RequestedAttribute Name="${ATTRIBUTE_NAMES.pairwiseId}" FriendlyName="pairwise-id" isRequired="true"/>
      <RequestedAttribute Name="${ATTRIBUTE_NAMES.mail}" FriendlyName="mail" isRequired="true"/>
      <RequestedAttribute Name="${ATTRIBUTE_NAMES.affiliation}" FriendlyName="eduPersonScopedAffiliation" isRequired="true"/>
    </AttributeConsumingService>`;

function insert(xmlDocument: string, marker: RegExp, addition: string, label: string) {
  if (!marker.test(xmlDocument)) throw new Error(`Could not add ${label} to SAML metadata`);
  return xmlDocument.replace(marker, addition);
}

export function generateMetadata() {
  const credentials = getSpCredentials();
  const urls = getSpUrls();
  const contact = {
    Company: wortmarke.lang,
    EmailAddress: [`mailto:${kontakt.mail}`] as [string],
  };
  const saml = new SAML({
    ...credentials,
    decryptionPvk: credentials.privateKey,
    issuer: urls.entityId,
    callbackUrl: urls.acsUrl,
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
      { "@contactType": "technical", ...contact },
      { "@contactType": "support", ...contact },
      { "@contactType": "administrative", ...contact },
    ],
  });

  let metadata = saml.generateServiceProviderMetadata(
    credentials.publicCert,
    credentials.publicCert,
  );

  // Element order follows the SAML metadata schema: both Extensions elements
  // come first inside their parent, ContactPerson last inside EntityDescriptor.
  metadata = insert(
    metadata,
    /(<(?:md:)?EntityDescriptor\b[^>]*>)/,
    `$1${entityAttributes}`,
    "entity attributes",
  );
  metadata = insert(
    metadata,
    /(<(?:md:)?SPSSODescriptor\b[^>]*>)/,
    `$1${uiInfo}`,
    "UI information",
  );
  metadata = insert(
    metadata,
    /(<\/(?:md:)?SPSSODescriptor>)/,
    `${requestedAttributes}\n  $1`,
    "requested attributes",
  );
  return insert(
    metadata,
    /(<\/(?:md:)?EntityDescriptor>)/,
    `${securityContact}\n$1`,
    "security contact",
  );
}
