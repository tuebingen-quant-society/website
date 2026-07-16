// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { site } from "./src/config.ts";

export default defineConfig({
  site,
  integrations: [sitemap()],
  build: {
    // A single CSS file instead of multiple requests (§10 performance).
    inlineStylesheets: "auto",
  },
});
