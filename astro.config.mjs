// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { site } from "./src/config.ts";

export default defineConfig({
  site,
  // Bilingual: German (default) is served at "/", English at "/en/".
  // Content lives in src/i18n/content.ts; helpers in src/i18n/index.ts.
  i18n: {
    defaultLocale: "de",
    locales: ["de", "en"],
    routing: {
      // Default locale keeps clean, prefix-free URLs ("/", "/impressum").
      prefixDefaultLocale: false,
    },
  },
  integrations: [sitemap()],
  build: {
    // A single CSS file instead of multiple requests (§10 performance).
    inlineStylesheets: "auto",
  },
});
