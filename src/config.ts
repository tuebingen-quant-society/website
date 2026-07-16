/**
 * Central content and configuration file (Spec §13).
 *
 * Layout files contain no content. Mission text, contact email,
 * social URLs, activities, and the form endpoint are changed
 * exclusively here.
 *
 * Anything marked with TODO is an open item from Spec §16 and
 * must be set before going live. Search for "TODO" to find all of them.
 */

export type Aktivitaet = {
  titel: string;
  beschreibung: string;
  geplant: boolean;
};

/**
 * Normalized `base` from astro.config.mjs, always with a trailing slash.
 * import.meta.env.BASE_URL omits it when `base` has none configured
 * (e.g. "/website" instead of "/website/") — use this instead of the raw
 * env var wherever a path is built by concatenation.
 */
const rawBase = import.meta.env.BASE_URL;
export const basePath = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

/** Used for canonical, OG URL, and sitemap.xml. */
export const site = "https://tuequant.de";

export const wortmarke = {
  lang: "Tübingen Quant Society",
  kurz: "TQS",
};

export const meta = {
  titel: "Tübingen Quant Society — Quantitative Finance an der Universität Tübingen",
  beschreibung:
    "Studentische Initiative für Quantitative Finance und algorithmisches Trading an der Universität Tübingen. Paper-Sessions, Workshops, Projekte. Keine Vorkenntnisse nötig.",
  sprache: "de",
};

/** TODO §16.2/§16.3 — enter real addresses. */
export const kontakt = {
    mail: "kontakt@tuequant.de",
    instagram: "https://instagram.com/tuebingen.quant",
  linkedin: "https://www.linkedin.com/company/t%C3%BCbingen-quant-society",
};

/**
 * TODO §16.4 — form backend endpoint (university mailman list, Formspree,
 * or Buttondown). As long as this is empty, the form runs in mock mode: all
 * five states from §6.6 can be triggered and tested, but nothing is sent.
 * As soon as a URL is set here, the form submits for real — no code change needed.
 */
export const formEndpoint = "";

export const nav = [
  { label: "Über uns", href: "#about" },
  { label: "Aktivitäten", href: "#activities" },
];

export const hero = {
  eyebrow: "STUDENTISCHE INITIATIVE · UNIVERSITÄT TÜBINGEN",
  headline: "Quantitative Finance, offen diskutiert.",
  subline:
    "Ein Ort an der Universität Tübingen, um Paper zu lesen, Projekte zu diskutieren und zu verstehen, wie datengetriebene Entscheidungen auf Finanzmärkten zustande kommen.",
  ctaPrimaer: { label: "Mitmachen", href: "#join" },
  ctaSekundaer: { label: "Was wir machen", href: "#activities" },
};

export const about = {
  eyebrow: "WARUM ES UNS GIBT",
  headline: "Zwischen Vorlesung und Praxis fehlt ein Raum.",
  absaetze: [
    "Quantitative Methoden prägen moderne Kapitalmärkte, sind für Außenstehende aber intransparent und faktisch großen Instituten vorbehalten. Wer sie verstehen will, findet im Studium selten einen Ort dafür.",
    "Tübingen ist ein herausragender Standort für Maschinelles Lernen, Mathematik und Data Science. Was fehlt, ist die Verbindung dieser methodischen Stärke mit angewandter, kritischer Marktkompetenz. Genau diese Lücke wollen wir schließen — als Bildungs- und Austauschformat, nicht als Anlageberatung.",
  ],
};

export const activities = {
  // §6.4 only specifies the cards. Eyebrow and headline therefore reuse
  // the nav item and section label from the IA (§3) verbatim, instead of
  // inventing new copy.
  eyebrow: "AKTIVITÄTEN",
  headline: "Was wir machen.",
  /** New card = one object. Do not touch the markup. */
  karten: [
    {
      titel: "Paper-Reading-Sessions",
      beschreibung:
        "Wir lesen und diskutieren gemeinsam wissenschaftliche Arbeiten und Marktstudien.",
      geplant: false,
    },
    {
      titel: "Projekt- & Ideenaustausch",
      beschreibung:
        "Eigene Projekte vorstellen und auseinandernehmen — Backtesting, Modellierung, Datenanalyse.",
      geplant: false,
    },
    {
      titel: "Einführungsworkshops",
      beschreibung:
        "Praxisnahe Formate zu Grundlagen: Programmierung, Statistik, Umgang mit Finanzdaten.",
      geplant: false,
    },
    {
      titel: "Gastvorträge",
      beschreibung: "Einblicke aus Forschung und Praxis.",
      geplant: true,
    },
    {
      titel: "Wettbewerbe",
      beschreibung: "Eigene Trading- und Data-Science-Challenges.",
      geplant: true,
    },
  ] satisfies Aktivitaet[],
};

export const open = {
  eyebrow: "FÜR WEN",
  headline: "Vorkenntnisse in Finance brauchst du nicht.",
  absatz:
    "Offen für alle Fachrichtungen und alle Semester. Ob du aus Mathe, Informatik, ML, Physik oder den Wirtschaftswissenschaften kommst — oder aus etwas ganz anderem: Wenn dich quantitative Methoden interessieren, bist du richtig. Fachliteratur und Materialien sind überwiegend englisch, die Treffen sind es auf Wunsch auch.",
};

export const join = {
  eyebrow: "MITMACHEN",
  headline: "Komm zum nächsten Treffen.",
  absatz:
    "Trag dich in die Mailingliste ein — wir schreiben, wenn das nächste Treffen ansteht. Kein Spam, keine Verpflichtung.",
  label: "E-Mail-Adresse",
  placeholder: "deine@uni-tuebingen.de",
  buttonIdle: "Eintragen",
  buttonPending: "Wird eingetragen …",
  erfolg: "Eingetragen. Du hörst von uns, sobald das nächste Treffen steht.",
  fehlerUngueltig: "Diese E-Mail-Adresse sieht nicht gültig aus.",
  /** {kontakt-mail} is replaced at runtime with kontakt.mail. */
  fehlerNetzwerk:
    "Das hat nicht geklappt. Versuch es nochmal oder schreib uns direkt: {kontakt-mail}.",
  instagramLink: "Oder folge uns auf Instagram",
  /** §11 requires a privacy policy link directly on the form. */
  datenschutzHinweis: "Wie wir deine Adresse verarbeiten, steht in der",
  datenschutzLinkText: "Datenschutzerklärung",
};

export const footer = {
  einzeiler: "Studentische Initiative an der Universität Tübingen.",
};

export const plot = {
  ariaLabel:
    "Animierter, simulierter Kurs-Chart — zufällig erzeugter Pfad ohne echte Marktdaten",
  titel: "TQS·SIM — GBM MONTE CARLO",
  live: "LIVE",
  params: "μ 0.08 · σ 0.20 · Δt 1/252",
  hinweis: "Simulation", // — no real market data.
};

/**
 * Ticker tape below the hero — purely decorative (aria-hidden) and
 * intentionally tongue-in-cheek: no real prices, no financial claims.
 * dir: "up" | "down" | "flat" controls color and arrow.
 */
export const ticker = [
  { sym: "PAPER-SESSION", val: "+1.00", dir: "up" },
  { sym: "VORKENNTNISSE", val: "0.00 NÖTIG", dir: "flat" },
  { sym: "NEUGIER", val: "+2.41", dir: "up" },
  { sym: "KAFFEE", val: "−0.87", dir: "down" },
  { sym: "P(MITMACHEN)", val: "→ 1", dir: "up" },
  { sym: "σ(IDEEN)", val: "+3.14", dir: "up" },
  { sym: "BACKTEST", val: "RUNNING", dir: "flat" },
  { sym: "OVERFITTING", val: "−1.29", dir: "down" },
  { sym: "SHARPE(TQS)", val: "+2.20", dir: "up" },
  { sym: "TÜBINGEN·QUANT", val: "OPEN", dir: "up" },
] as const;

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
