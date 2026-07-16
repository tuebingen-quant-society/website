/**
 * i18n plumbing (Spec §13 companion).
 *
 * The site is bilingual: German (default, served at "/") and English
 * (served at "/en/"). Routing is configured in astro.config.mjs; this module
 * provides the locale list, small type guards, and URL helpers used by the
 * layout, header toggle, and components.
 *
 * Translatable copy lives in ./content.ts. Truly shared config (URLs, brand,
 * contact, GBM params, legal-entity data) stays in ../config.ts.
 */
import { getRelativeLocaleUrl } from "astro:i18n";

export const locales = ["de", "en"] as const;
export type Locale = (typeof locales)[number];

/** Must match astro.config.mjs → i18n.defaultLocale. Served at the site root. */
export const defaultLocale: Locale = "de";

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}

/**
 * Astro.currentLocale is `string | undefined`; narrow it to our Locale union,
 * falling back to the default. Use in any .astro component:
 *   const locale = getLocale(Astro);
 *   const t = content[locale];
 */
export function getLocale(astro: { currentLocale?: string }): Locale {
  return isLocale(astro.currentLocale) ? astro.currentLocale : defaultLocale;
}

/**
 * Build a URL for a page in a given locale. `path` is the locale-agnostic
 * route without a leading slash: "" (home), "impressum", "datenschutz".
 * Handles the configured `base` and the default-locale-has-no-prefix rule.
 */
export function localePath(locale: Locale, path = ""): string {
  return getRelativeLocaleUrl(locale, path);
}

/**
 * Strip `base` and any leading locale segment from a pathname, yielding the
 * locale-agnostic route without a leading slash. Used to point the language
 * toggle and hreflang alternates at the *same* page in the other language.
 *   "/en/impressum" → "impressum"   "/impressum" → "impressum"
 *   "/en/" → ""                     "/" → ""
 */
export function logicalPath(pathname: string): string {
  const base = import.meta.env.BASE_URL;
  let rest = pathname;
  if (base !== "/" && rest.startsWith(base)) rest = rest.slice(base.length);
  const segments = rest.split("/").filter(Boolean);
  if (isLocale(segments[0]) && segments[0] !== defaultLocale) segments.shift();
  return segments.join("/");
}

export * from "./content";
