import assert from "node:assert/strict";
import test from "node:test";
import { getHeaderAuthState } from "./header-auth";

test("authenticated visitors do not get a header login action", async () => {
  const state = await getHeaderAuthState(async (input, init) => {
    assert.equal(input, "/api/auth/saml/session");
    assert.equal(init?.cache, "no-store");
    return new Response(JSON.stringify({ authenticated: true }), { status: 200 });
  });

  assert.equal(state, "authenticated");
});

test("logged-out visitors get a header login action", async () => {
  const state = await getHeaderAuthState(async () =>
    new Response(JSON.stringify({ authenticated: false }), { status: 401 }),
  );

  assert.equal(state, "unauthenticated");
});

test("a failed session check does not present a misleading login action", async () => {
  const state = await getHeaderAuthState(async () => {
    throw new Error("network unavailable");
  });

  assert.equal(state, "indeterminate");
});
