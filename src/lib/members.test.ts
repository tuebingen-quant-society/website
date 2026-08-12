import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { SessionPayload } from "./saml/session";

const componentUrl = new URL("../components/members-content.tsx", import.meta.url);

async function loadMembersContent() {
  assert.equal(existsSync(componentUrl), true, "members view is not implemented");
  const componentModule = await import("../components/members-content");
  return componentModule.MembersContent;
}

test("members content stays hidden until the visitor authenticates", async () => {
  const MembersContent = await loadMembersContent();
  const html = renderToStaticMarkup(
    createElement(MembersContent, { locale: "de", session: null }),
  );

  assert.match(html, /Mit Uni-Account anmelden/);
  assert.match(html, /\/api\/auth\/saml\/login\?returnTo=%2Fmembers/);
  assert.doesNotMatch(html, /Paper-Reading-Session/);
  assert.doesNotMatch(html, /member@student\.uni-tuebingen\.de/);
});

test("authenticated members see their verified profile and planned formats", async () => {
  const MembersContent = await loadMembersContent();
  const session: SessionPayload = {
    user: {
      subject: "private-pairwise-identifier",
      email: "member@student.uni-tuebingen.de",
      affiliations: ["student@uni-tuebingen.de"],
    },
    expiresAt: Date.now() + 60_000,
  };
  const html = renderToStaticMarkup(
    createElement(MembersContent, { locale: "de", session }),
  );

  assert.match(html, /member@student\.uni-tuebingen\.de/);
  assert.match(html, /Studierendenstatus bestätigt/);
  assert.match(html, /Paper-Reading-Session/);
  assert.match(html, /Einführungsworkshop/);
  assert.match(html, /action="\/api\/auth\/saml\/logout\?returnTo=%2Fmembers"/);
  assert.doesNotMatch(html, /private-pairwise-identifier/);
});
