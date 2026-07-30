/**
 * Central configuration file (Spec §13).
 *
 * This file holds everything that is *not* language-specific: canonical URL,
 * brand wordmark, contact addresses, the form endpoint, the GBM parameters of
 * the signature chart, and the legal-entity data behind Impressum/Datenschutz.
 *
 * All translatable copy (hero, sections, nav, form labels, ticker, meta text)
 * lives in src/i18n/content.ts, keyed by locale. See src/i18n/README notes.
 *
 * Anything marked with TODO is an open item from Spec §16 and must be set
 * before going live. Search for "TODO" to find all of them.
 */

/** Public assets are served from the domain root by Next.js. */
export const basePath = "/";

/** Used for canonical, OG URL, and sitemap.xml. */
export const site = "https://tuequant.de";

/** Brand wordmark — identical in every language. */
export const wortmarke = {
  lang: "Tübingen Quant Society",
  kurz: "TQS",
};

/** TODO §16.2/§16.3 — enter real addresses. */
export const kontakt = {
  mail: "kontakt@tuequant.de",
  instagram: "https://instagram.com/tuebingen.quant",
  linkedin: "https://www.linkedin.com/company/t%C3%BCbingen-quant-society",
};

/** Mailing-list sign-up stays disabled until its provider is selected. */
export const formEndpoint = "";

/**
 * GBM parameters of the signature chart (SignaturePlot.astro). Language-neutral
 * — the params string is the same everywhere; only ariaLabel/hinweis are
 * translated (see content.plot).
 */
export const plotParams = {
  titel: "TQS·SIM — GBM MONTE CARLO",
  live: "LIVE",
  params: "μ 0.08 · σ 0.20 · Δt 1/252",
};

/**
 * TODO §16.3 — legal notice per §5 DDG. As long as no registered association
 * (e.V.) exists, a natural person is responsible; a name and a postal
 * address valid for service of process are required. The site must not go
 * live publicly with these placeholders.
 */
export const impressum = {
  verantwortlich: "TODO: Vor- und Nachname",
  strasse: "TODO: Straße und Hausnummer",
  ort: "TODO: PLZ und Ort",
  land: "Deutschland",
};

/** TODO §16.4 — feeds the privacy policy; depends on the chosen form backend. */
export const datenschutz = {
  hoster: "Vercel Inc.",
  mailinglistenAnbieter: "TODO: Anbieter der Mailingliste eintragen",
  analytics: null as string | null,
};
