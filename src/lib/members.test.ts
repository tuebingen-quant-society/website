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

const session: SessionPayload = {
  user: {
    subject: "private-pairwise-identifier",
    email: "member@student.uni-tuebingen.de",
    affiliations: ["student@uni-tuebingen.de"],
  },
  expiresAt: Date.now() + 60_000,
};

/** Renders the members view with WHATSAPP_GROUP_URL set to `value`. */
async function renderWithWhatsapp(value: string | undefined) {
  const MembersContent = await loadMembersContent();
  const previous = process.env.WHATSAPP_GROUP_URL;
  if (value === undefined) delete process.env.WHATSAPP_GROUP_URL;
  else process.env.WHATSAPP_GROUP_URL = value;
  try {
    return renderToStaticMarkup(createElement(MembersContent, { locale: "de", session }));
  } finally {
    if (previous === undefined) delete process.env.WHATSAPP_GROUP_URL;
    else process.env.WHATSAPP_GROUP_URL = previous;
  }
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

test("the WhatsApp section appears with a QR code once the invite link is configured", async () => {
  const link = "https://chat.whatsapp.com/ABCDEFGHIJKLMNOPQRSTUV";
  const html = await renderWithWhatsapp(link);

  assert.match(html, /WhatsApp-Gruppe/);
  assert.match(html, new RegExp(`href="${link}"`));
  assert.match(html, /<svg[^>]*aria-label="QR-Code zum Beitritt der WhatsApp-Gruppe"/);
  assert.match(html, /<path d="M\d+ \d+h/); // the generated modules
});

test("the WhatsApp section is dropped when the invite link is missing or unusable", async () => {
  for (const value of [undefined, "", "   ", "chat.whatsapp.com/ABC", "javascript:alert(1)"]) {
    const html = await renderWithWhatsapp(value);
    assert.doesNotMatch(html, /members__whatsapp/, `rendered for ${JSON.stringify(value)}`);
    assert.doesNotMatch(html, /<svg/, `rendered a QR code for ${JSON.stringify(value)}`);
  }
});
