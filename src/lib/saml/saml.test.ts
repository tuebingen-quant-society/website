import assert from "node:assert/strict";
import test from "node:test";
import type { Profile } from "@node-saml/node-saml";
import { openCookie, sealCookie } from "./cookie-crypto";
import { ATTRIBUTE_NAMES, SP_ACS_URL, SP_ENTITY_ID } from "./constants";
import { safeReturnPath } from "./http";
import { generateMetadata } from "./metadata";
import { RequestCookieCache } from "./request-cache";
import { userFromProfile } from "./session";

const secret = "a".repeat(32);

test("encrypted cookies round-trip and reject tampering", () => {
  const token = sealCookie({ subject: "pairwise-user" }, secret);
  assert.deepEqual(openCookie(token, secret), { subject: "pairwise-user" });
  assert.equal(openCookie(`${token.slice(0, -1)}x`, secret), null);
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
  const originalKey = process.env.SAML_SP_PRIVATE_KEY;
  const originalCert = process.env.SAML_SP_CERT;
  process.env.SAML_SP_PRIVATE_KEY =
    "-----BEGIN PRIVATE KEY-----\na2V5\n-----END PRIVATE KEY-----";
  process.env.SAML_SP_CERT =
    "-----BEGIN CERTIFICATE-----\nY2VydA==\n-----END CERTIFICATE-----";
  try {
    const metadata = generateMetadata();
    assert.match(metadata, new RegExp(`entityID="${SP_ENTITY_ID}"`));
    assert.match(metadata, new RegExp(`Location="${SP_ACS_URL}"`));
    assert.match(metadata, new RegExp(ATTRIBUTE_NAMES.pairwiseId));
    assert.match(metadata, new RegExp(ATTRIBUTE_NAMES.mail));
    assert.match(metadata, new RegExp(ATTRIBUTE_NAMES.affiliation));
    assert.match(metadata, /AuthnRequestsSigned="true"/);
  } finally {
    setOrDelete("SAML_SP_PRIVATE_KEY", originalKey);
    setOrDelete("SAML_SP_CERT", originalCert);
  }
});

test("profile mapping requires the requested attributes", () => {
  const profile = {
    issuer: "https://idp.example",
    nameID: "opaque",
    nameIDFormat: "persistent",
    [ATTRIBUTE_NAMES.pairwiseId]: "pairwise-user",
    [ATTRIBUTE_NAMES.mail]: "student@example.edu",
    [ATTRIBUTE_NAMES.affiliation]: ["student@example.edu", "member@example.edu"],
  } satisfies Profile;
  assert.deepEqual(userFromProfile(profile), {
    subject: "pairwise-user",
    email: "student@example.edu",
    affiliations: ["student@example.edu", "member@example.edu"],
  });
  assert.throws(() => userFromProfile({ ...profile, [ATTRIBUTE_NAMES.mail]: undefined }));
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
