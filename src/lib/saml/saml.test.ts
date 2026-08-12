import assert from "node:assert/strict";
import test from "node:test";
import type { Profile } from "@node-saml/node-saml";
import { openCookie, sealCookie } from "./cookie-crypto";
import { createSamlConfig } from "./config";
import { ATTRIBUTE_NAMES } from "./constants";
import { safeReturnPath } from "./http";
import { generateMetadata } from "./metadata";
import { RequestCookieCache } from "./request-cache";
import { userFromProfile } from "./session";

const secret = "a".repeat(32);

test("encrypted cookies round-trip and reject tampering", () => {
  const token = sealCookie({ subject: "pairwise-user" }, secret);
  assert.deepEqual(openCookie(token, secret), { subject: "pairwise-user" });
  const [iv, ciphertext, tag] = token.split(".");
  const replacement = ciphertext.startsWith("A") ? "B" : "A";
  assert.equal(openCookie(`${iv}.${replacement}${ciphertext.slice(1)}.${tag}`, secret), null);
});

test("request cache can move between serverless invocations", async () => {
  const loginCache = new RequestCookieCache();
  await loginCache.saveAsync("_request-id", "2026-07-24T20:00:00.000Z");
  const acsCache = new RequestCookieCache(loginCache.snapshot());
  assert.equal(await acsCache.getAsync("_request-id"), "2026-07-24T20:00:00.000Z");
  assert.equal(await acsCache.removeAsync("_request-id"), "_request-id");
  assert.equal(await acsCache.getAsync("_request-id"), null);
});

test("metadata publishes the exact SP contract and minimal attributes", () => {
  const originalBaseUrl = process.env.SAML_SP_BASE_URL;
  const originalKey = process.env.SAML_SP_PRIVATE_KEY;
  const originalCert = process.env.SAML_SP_CERT;
  process.env.SAML_SP_BASE_URL = "https://test.tuequant.de";
  process.env.SAML_SP_PRIVATE_KEY =
    "-----BEGIN PRIVATE KEY-----\na2V5\n-----END PRIVATE KEY-----";
  process.env.SAML_SP_CERT =
    "-----BEGIN CERTIFICATE-----\nY2VydA==\n-----END CERTIFICATE-----";
  try {
    const metadata = generateMetadata();
    assert.match(metadata, /entityID="https:\/\/test\.tuequant\.de\/api\/auth\/saml\/metadata"/);
    assert.match(metadata, /Location="https:\/\/test\.tuequant\.de\/api\/auth\/saml\/acs"/);
    assert.match(metadata, /KeyDescriptor use="signing"/);
    assert.match(metadata, /KeyDescriptor use="encryption"/);
    assert.match(metadata, new RegExp(ATTRIBUTE_NAMES.pairwiseId));
    assert.match(metadata, new RegExp(ATTRIBUTE_NAMES.mail));
    assert.match(metadata, new RegExp(ATTRIBUTE_NAMES.affiliation));
    assert.match(metadata, /AuthnRequestsSigned="true"/);
    // DFN-AAI requires UI information, contacts and the subject-id signal.
    assert.match(metadata, /<mdui:DisplayName xml:lang="de">/);
    assert.match(metadata, /<mdui:Description xml:lang="en">/);
    assert.match(metadata, /<mdui:PrivacyStatementURL xml:lang="de">https:\/\//);
    assert.match(metadata, /Name="urn:oasis:names:tc:SAML:profiles:subject-id:req"/);
    assert.match(metadata, /<saml:AttributeValue>pairwise-id<\/saml:AttributeValue>/);
    for (const type of ["technical", "support", "administrative"]) {
      assert.match(metadata, new RegExp(`contactType="${type}"`));
    }
    assert.match(metadata, /remd:contactType="http:\/\/refeds\.org\/metadata\/contactType\/security"/);
    // Both Extensions elements must precede their siblings to stay schema-valid.
    assert.ok(metadata.indexOf("mdattr:EntityAttributes") < metadata.indexOf("SPSSODescriptor"));
    assert.ok(metadata.indexOf("mdui:UIInfo") < metadata.indexOf("KeyDescriptor"));
    assert.ok(metadata.lastIndexOf("ContactPerson") > metadata.indexOf("</SPSSODescriptor>"));
  } finally {
    setOrDelete("SAML_SP_BASE_URL", originalBaseUrl);
    setOrDelete("SAML_SP_PRIVATE_KEY", originalKey);
    setOrDelete("SAML_SP_CERT", originalCert);
  }
});

test("SP metadata requires an explicit HTTPS origin", () => {
  const originalBaseUrl = process.env.SAML_SP_BASE_URL;
  const originalKey = process.env.SAML_SP_PRIVATE_KEY;
  const originalCert = process.env.SAML_SP_CERT;
  process.env.SAML_SP_PRIVATE_KEY =
    "-----BEGIN PRIVATE KEY-----\na2V5\n-----END PRIVATE KEY-----";
  process.env.SAML_SP_CERT =
    "-----BEGIN CERTIFICATE-----\nY2VydA==\n-----END CERTIFICATE-----";
  try {
    delete process.env.SAML_SP_BASE_URL;
    assert.throws(() => generateMetadata(), /SAML_SP_BASE_URL is required/);
    process.env.SAML_SP_BASE_URL = "http://test.tuequant.de";
    assert.throws(() => generateMetadata(), /SAML_SP_BASE_URL must be an HTTPS origin/);
  } finally {
    setOrDelete("SAML_SP_BASE_URL", originalBaseUrl);
    setOrDelete("SAML_SP_PRIVATE_KEY", originalKey);
    setOrDelete("SAML_SP_CERT", originalCert);
  }
});

test("SAML config uses the SP key to decrypt encrypted assertions", () => {
  const names = [
    "SAML_SP_BASE_URL",
    "SAML_SP_PRIVATE_KEY",
    "SAML_SP_CERT",
    "SAML_IDP_SSO_URL",
    "SAML_IDP_ISSUER",
    "SAML_IDP_CERT",
  ];
  const original = new Map(names.map((name) => [name, process.env[name]]));
  process.env.SAML_SP_BASE_URL = "https://test.tuequant.de";
  process.env.SAML_SP_PRIVATE_KEY =
    "-----BEGIN PRIVATE KEY-----\na2V5\n-----END PRIVATE KEY-----";
  process.env.SAML_SP_CERT =
    "-----BEGIN CERTIFICATE-----\nY2VydA==\n-----END CERTIFICATE-----";
  process.env.SAML_IDP_SSO_URL = "https://idp-test.uni-tuebingen.de/sso";
  process.env.SAML_IDP_ISSUER = "https://idp-test.uni-tuebingen.de/idp/shibboleth";
  process.env.SAML_IDP_CERT =
    "-----BEGIN CERTIFICATE-----\naWRw\n-----END CERTIFICATE-----";
  try {
    const config = createSamlConfig(new RequestCookieCache());
    assert.equal(config.issuer, "https://test.tuequant.de/api/auth/saml/metadata");
    assert.equal(config.callbackUrl, "https://test.tuequant.de/api/auth/saml/acs");
    assert.equal(config.decryptionPvk, process.env.SAML_SP_PRIVATE_KEY);
  } finally {
    for (const [name, value] of original) setOrDelete(name, value);
  }
});

test("profile mapping requires the student role and preserves the released profile", () => {
  const profile = {
    issuer: "https://idp.example",
    nameID: "opaque",
    nameIDFormat: "persistent",
    [ATTRIBUTE_NAMES.pairwiseId]: "pairwise-user",
    [ATTRIBUTE_NAMES.mail]: "user@student.uni-tuebingen.de",
    [ATTRIBUTE_NAMES.affiliation]: ["student@idp-scope.example", "member@idp-scope.example"],
  } satisfies Profile;
  assert.deepEqual(userFromProfile(profile), {
    subject: "pairwise-user",
    email: "user@student.uni-tuebingen.de",
    affiliations: ["student@idp-scope.example", "member@idp-scope.example"],
  });
  assert.throws(() => userFromProfile({ ...profile, [ATTRIBUTE_NAMES.mail]: undefined }));
  assert.throws(
    () => userFromProfile({ ...profile, [ATTRIBUTE_NAMES.affiliation]: "member@idp-scope.example" }),
    /Student affiliation is required/,
  );
});

test("sealed sessions are accepted only while intact and unexpired", async () => {
  const sessionModule = await import("./session");
  const readSessionToken = (sessionModule as Record<string, unknown>).readSessionToken;
  assert.equal(typeof readSessionToken, "function", "session reader is not implemented");
  if (typeof readSessionToken !== "function") return;

  const payload = {
    user: {
      subject: "pairwise-member",
      email: "member@student.uni-tuebingen.de",
      affiliations: ["student@uni-tuebingen.de"],
    },
    expiresAt: Date.now() + 60_000,
  };
  const token = sealCookie(payload, secret);
  assert.deepEqual(readSessionToken(token, secret), payload);
  assert.equal(readSessionToken(undefined, secret), null);

  const expired = sealCookie({ ...payload, expiresAt: Date.now() - 1 }, secret);
  assert.equal(readSessionToken(expired, secret), null);

  const [iv, ciphertext, tag] = token.split(".");
  const replacement = ciphertext.startsWith("A") ? "B" : "A";
  assert.equal(
    readSessionToken(`${iv}.${replacement}${ciphertext.slice(1)}.${tag}`, secret),
    null,
  );
});

test("return paths cannot redirect off site", () => {
  assert.equal(safeReturnPath("/members"), "/members");
  assert.equal(safeReturnPath("//evil.example"), "/");
  assert.equal(safeReturnPath("/\\evil.example"), "/");
  assert.equal(safeReturnPath("https://evil.example"), "/");
});

function setOrDelete(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
