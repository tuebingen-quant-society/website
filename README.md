# Tübingen Quant Society website

Bilingual Next.js App Router site for [tuequant.de](https://tuequant.de), including a
SAML 2.0 service-provider backend for university login.

## Local development

Requires Node.js 24.x, matching the Vercel runtime.

```bash
npm install
npm run dev
```

Use the deployed `https://test.tuequant.de` service provider for real IdP login tests.
A localhost callback is not a stable, registered SAML entity and cannot complete the
same cookie-bound `InResponseTo` flow.

Quality checks:

```bash
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

## SAML service-provider contract

The endpoints are derived from the required `SAML_SP_BASE_URL` environment variable.
Keep that origin stable after registering each entity:

| Field | Production | Test |
| --- | --- | --- |
| Service URL | `https://tuequant.de` | `https://test.tuequant.de` |
| Entity ID / metadata | `https://tuequant.de/api/auth/saml/metadata` | `https://test.tuequant.de/api/auth/saml/metadata` |
| Assertion Consumer Service | `https://tuequant.de/api/auth/saml/acs` | `https://test.tuequant.de/api/auth/saml/acs` |
| Login endpoint | `https://tuequant.de/api/auth/saml/login` | `https://test.tuequant.de/api/auth/saml/login` |
| Session endpoint | `https://tuequant.de/api/auth/saml/session` | `https://test.tuequant.de/api/auth/saml/session` |

Both entities use the service name Tübingen Quant Society, SAML 2.0 HTTP-POST for
the ACS, transient NameID, signed RSA-SHA256 AuthnRequests, and signing plus
encryption metadata.

The metadata also carries the entries DFN-AAI requires for productive
federations: `mdui:UIInfo` (display name, description, information and privacy
statement URL per language), technical, support and administrative contacts, a
REFEDS security contact, and the entity attribute
`urn:oasis:names:tc:SAML:profiles:subject-id:req` with value `pairwise-id`.
There is no SAML Single Logout endpoint; logout only clears the local session
cookie.

Requested attributes:

- `urn:oasis:names:tc:SAML:attribute:pairwise-id` — pseudonymous stable user ID
- `urn:oid:0.9.2342.19200300.100.1.3` — email address
- `urn:oid:1.3.6.1.4.1.5923.1.1.1.9` — scoped university affiliation

The email address is not used as a stable identifier. The SAML profile mapper rejects
responses that omit any requested attribute or whose scoped affiliation does not have
the role component `student`. The affiliation scope is supplied by the IdP and is not
derived from or compared with the user's email address.

## Vercel configuration

Generate a dedicated service-provider certificate locally:

```bash
openssl req -x509 -newkey rsa:3072 -keyout saml-sp-key.pem \
  -out saml-sp-cert.pem -sha256 -days 730 -nodes \
  -subj "/CN=tuequant.de"
openssl rand -base64 48
```

Set the values from `.env.example` in each Vercel project/environment:

- `SAML_SP_BASE_URL`: the exact public origin, without a path
- `SAML_SP_PRIVATE_KEY`: contents of `saml-sp-key.pem`
- `SAML_SP_CERT`: contents of `saml-sp-cert.pem`
- `SAML_SESSION_SECRET`: output of `openssl rand -base64 48`
- `SAML_IDP_SSO_URL`: supplied by the university IdP team
- `SAML_IDP_ISSUER`: supplied by the university IdP team
- `SAML_IDP_CERT`: supplied by the university IdP team

Optional:

- `WHATSAPP_GROUP_URL`: invite link to the members-only WhatsApp group. The members
  page renders the group link and a QR code generated from it; while the variable is
  unset, blank, or not an http(s) URL, that section is left out entirely. It is not a
  `NEXT_PUBLIC_` variable, so the invite stays server-side and reaches only visitors
  who have completed the university login.

The non-secret environment-specific values are:

| Variable | Production | Test |
| --- | --- | --- |
| `SAML_SP_BASE_URL` | `https://tuequant.de` | `https://test.tuequant.de` |
| `SAML_IDP_SSO_URL` | `https://idp.uni-tuebingen.de/idp/profile/SAML2/Redirect/SSO` | `https://idp-test.uni-tuebingen.de/idp/profile/SAML2/Redirect/SSO` |
| `SAML_IDP_ISSUER` | `https://idp.uni-tuebingen.de/shibboleth` | `https://idp-test.uni-tuebingen.de/idp/shibboleth` |

Use the matching IdP certificate and separate SP key pair and session secret for each
environment. Do not expose `.env` files or private keys in chat or commits.

Never commit the generated private key or session secret. After the SP key and
certificate are configured and the production deployment is live, the metadata URL is
ready for the university. After they return the IdP values, configure them in Vercel and
redeploy.

## DFN-AAI registration

Each environment is a separate entity and belongs to a different federation:
the production entity to DFN-AAI, the test entity to DFN-AAI-Test. Fill each
entity in the DFN metadata portal from that entity's own metadata URL — use the
portal's XML import if it offers one, otherwise copy the values field by field.
The portal, not our metadata URL, is what the federation publishes, so repeat
this after every change to the SP certificate or the requested attributes.

Both SP certificates are self-signed and have a fixed lifetime. Generate the
replacement, deploy it, and re-import the metadata before the old one expires.

## Authentication flow

1. Redirect the user to
   `/api/auth/saml/login?returnTo=/members`.
2. The login route creates a signed AuthnRequest and stores its request ID in a
   short-lived encrypted HttpOnly cookie. This preserves `InResponseTo` validation across
   serverless invocations.
3. The ACS validates the response signature, assertion signature, issuer, audience,
   timestamps, RelayState, and request ID.
4. A successful login creates an encrypted, eight-hour HttpOnly session cookie.
5. The members-only area calls `GET /api/auth/saml/session` before serving
   protected content. It receives either:

```json
{
  "authenticated": true,
  "user": {
    "subject": "pairwise identifier",
    "email": "user@student.uni-tuebingen.de",
    "affiliations": ["student@idp-scope.example"]
  }
}
```

or HTTP `401` with `{"authenticated":false}`. Logout is
`POST /api/auth/saml/logout`.

## Content

Translated site copy lives in `src/i18n/content.ts`. Shared contact and legal
configuration lives in `src/config.ts`. There is no mailing list: the only way to get
involved is the university login. The header carries a direct login button into
`/members` for people who already have an account; the hero's "Mitmachen" scrolls to
the closing section, which explains the login before asking for it.
