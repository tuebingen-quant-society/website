// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { site } from "./src/config.ts";

export default defineConfig({
  site,
  // Temporary: GitHub Pages project site serves from /website/ until the
  // tuequant.de domain is live. Remove this line (and restore public/CNAME +
  // the `site` value in src/config.ts) once DNS is pointed at GitHub Pages.
  base: "/website",
  integrations: [sitemap()],
  build: {
    // A single CSS file instead of multiple requests (§10 performance).
    inlineStylesheets: "auto",
  },
});
