/**
 * robots.txt (§10). Implemented as an endpoint instead of a static file so
 * the domain lives in exactly one place — src/config.ts (§13).
 */
import type { APIRoute } from "astro";
import { site } from "../config";

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap-index.xml", site).href}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
