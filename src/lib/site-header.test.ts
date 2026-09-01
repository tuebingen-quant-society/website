import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteHeader } from "../components/site-header";

test("the header contains only navigation, language and theme controls", () => {
  const html = renderToStaticMarkup(
    createElement(SiteHeader, { locale: "de", logicalPath: "members" }),
  );

  assert.doesNotMatch(html, /header__cta/);
  assert.doesNotMatch(html, /api\/auth\/saml\/session/);
  assert.match(html, /header__lang/);
  assert.match(html, /header__theme/);
});
