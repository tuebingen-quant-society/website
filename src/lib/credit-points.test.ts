import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CreditPointsContent } from "../components/credit-points-content";
import type { SessionPayload } from "./saml/session";

const session: SessionPayload = {
  user: {
    subject: "private-pairwise-identifier",
    email: "member@student.uni-tuebingen.de",
    affiliations: ["student@uni-tuebingen.de"],
  },
  expiresAt: Date.now() + 60_000,
};

test("the credit-points guide stays behind the login", () => {
  const html = renderToStaticMarkup(
    createElement(CreditPointsContent, { locale: "de", session: null }),
  );

  assert.match(html, /Mit Uni-Account anmelden/);
  /* Back to this page, not to the members index, after the SAML round trip. */
  assert.match(html, /returnTo=%2Fmembers%2Fcredit-points/);
  assert.doesNotMatch(html, /Reflexionseinheit/);
});

test("members see the procedure, the roles table and the source note", () => {
  const html = renderToStaticMarkup(
    createElement(CreditPointsContent, { locale: "de", session }),
  );

  assert.match(html, /Reflexionseinheit/);
  assert.match(html, /Aktives Mitglied/);
  assert.match(html, /Projekt-, Event- und Wettbewerbsleitung/);
  assert.match(html, /1–2 pro Projekt \/ Treffen/);
  assert.match(html, /civic-engagement@tracs\.uni-tuebingen\.de/);
  assert.match(html, /Leitfaden/);
});

test("the English page links back into the English members area", () => {
  const html = renderToStaticMarkup(
    createElement(CreditPointsContent, { locale: "en", session }),
  );

  assert.match(html, /href="\/en\/members"/);
  assert.doesNotMatch(html, /href="\/members"/);
});
