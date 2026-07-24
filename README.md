# Tübingen Quant Society website

Bilingual Next.js App Router site for [tuequant.de](https://tuequant.de), including a
SAML 2.0 service-provider backend for university login.

## Local development

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

## SAML service-provider contract

These values are fixed to the production domain so they can be registered once:

| Field | Value |
| --- | --- |
| Service name | Tübingen Quant Society |
| Service URL | `https://tuequant.de` |
| Entity ID / metadata URL | `https://tuequant.de/api/auth/saml/metadata` |
| Assertion Consumer Service | `https://tuequant.de/api/auth/saml/acs` |
| ACS binding | SAML 2.0 HTTP-POST |
| Login endpoint | `https://tuequant.de/api/auth/saml/login` |
| Session endpoint | `https://tuequant.de/api/auth/saml/session` |
| NameID format | transient |
| Signed requests | RSA-SHA256 |

Requested attributes:

- `urn:oasis:names:tc:SAML:attribute:pairwise-id` — pseudonymous stable user ID
- `urn:oid:0.9.2342.19200300.100.1.3` — email address
- `urn:oid:1.3.6.1.4.1.5923.1.1.1.9` — scoped university affiliation

The email address is not used as a stable identifier. The SAML profile mapper rejects
responses that omit any requested attribute.

## Vercel configuration

Generate a dedicated service-provider certificate locally:

```bash
openssl req -x509 -newkey rsa:3072 -keyout saml-sp-key.pem \
  -out saml-sp-cert.pem -sha256 -days 730 -nodes \
  -subj "/CN=tuequant.de"
openssl rand -base64 48
```

Set the values from `.env.example` in Vercel's Production environment:

- `SAML_SP_PRIVATE_KEY`: contents of `saml-sp-key.pem`
- `SAML_SP_CERT`: contents of `saml-sp-cert.pem`
- `SAML_SESSION_SECRET`: output of `openssl rand -base64 48`
- `SAML_IDP_SSO_URL`: supplied by the university IdP team
- `SAML_IDP_ISSUER`: supplied by the university IdP team
- `SAML_IDP_CERT`: supplied by the university IdP team

Never commit the generated private key or session secret. After the SP key and
certificate are configured and the production deployment is live, the metadata URL is
ready for the university. After they return the IdP values, configure them in Vercel and
redeploy.

## Authentication flow

1. Redirect the user to
   `/api/auth/saml/login?returnTo=/chatbot`.
2. The login route creates a signed AuthnRequest and stores its request ID in a
   short-lived encrypted HttpOnly cookie. This preserves `InResponseTo` validation across
   serverless invocations.
3. The ACS validates the response signature, assertion signature, issuer, audience,
   timestamps, RelayState, and request ID.
4. A successful login creates an encrypted, eight-hour HttpOnly session cookie.
5. The chatbot backend calls `GET /api/auth/saml/session`. It receives either:

```json
{
  "authenticated": true,
  "user": {
    "subject": "pairwise identifier",
    "email": "student@uni-tuebingen.de",
    "affiliations": ["student@uni-tuebingen.de"]
  }
}
```

or HTTP `401` with `{"authenticated":false}`. Logout is
`POST /api/auth/saml/logout`.

## Content

Translated site copy lives in `src/i18n/content.ts`. Shared contact and legal
configuration lives in `src/config.ts`. The mailing-list form remains disabled until a
provider and Double Opt-in process are confirmed.
