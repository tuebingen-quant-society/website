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
export const locales = ["de", "en"] as const;
export type Locale = (typeof locales)[number];

/** Must match astro.config.mjs → i18n.defaultLocale. Served at the site root. */
export const defaultLocale: Locale = "de";

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}

/**
 * Build a URL for a page in a given locale. `path` is the locale-agnostic
 * route without a leading slash: "" (home), "impressum", "datenschutz".
 */
export function localePath(locale: Locale, path = ""): string {
  const suffix = path ? `/${path}` : "";
  return locale === defaultLocale ? suffix || "/" : `/${locale}${suffix}`;
}

/**
 * Strip `base` and any leading locale segment from a pathname, yielding the
 * locale-agnostic route without a leading slash. Used to point the language
 * toggle and hreflang alternates at the *same* page in the other language.
 *   "/en/impressum" → "impressum"   "/impressum" → "impressum"
 *   "/en/" → ""                     "/" → ""
 */
export function logicalPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (isLocale(segments[0]) && segments[0] !== defaultLocale) segments.shift();
  return segments.join("/");
}

export * from "./content";
