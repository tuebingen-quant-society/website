import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../app/api/auth/saml/logout/route";

test("logout clears the session and returns to the requested local page", () => {
  const response = POST(
    new NextRequest("https://tuequant.de/api/auth/saml/logout?returnTo=/members"),
  );

  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://tuequant.de/members");
  assert.match(response.headers.get("set-cookie") ?? "", /tqs_session=;/);
  assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/);
});

test("logout cannot redirect to another origin", () => {
  const response = POST(
    new NextRequest(
      "https://tuequant.de/api/auth/saml/logout?returnTo=https://evil.example",
    ),
  );

  assert.equal(response.headers.get("location"), "https://tuequant.de/");
});
