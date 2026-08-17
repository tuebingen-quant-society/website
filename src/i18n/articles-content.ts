/**
 * Copy for the public materials section (/articles and /article/…), keyed by
 * locale — same rules as ./content.ts: text lives here, never in components.
 *
 * The articles themselves are not translated here; each MDX file carries its
 * own language (see src/content/articles/README.md).
 */
import type { ArticleKind } from "@/lib/articles";
import type { Locale } from "./index";

type ArticlesCopy = {
  meta: {
    title: string;
    description: string;
    /** alt text of an article's generated share card (src/lib/og). */
    cardAlt: string;
  };
  eyebrow: string;
  headline: string;
  lead: string;
  /** Shown while nothing is published yet. */
  empty: { title: string; body: string };
  /** Kicker on every card and article header. */
  kinds: Record<ArticleKind, string>;
  /** Language names in this locale — used when an article is in the other one. */
  languages: Record<Locale, string>;
  /** "{language}" is replaced with the entry from `languages`. */
  languageNote: string;
  /** "{n}" is replaced with the estimated reading time in minutes. */
  readingTime: string;
  /** "{date}" is replaced with the formatted revision date. */
  updated: string;
  authorsPrefix: string;
  pagination: {
    aria: string;
    previous: string;
    next: string;
    /** "{page}" and "{total}" are replaced with the page numbers. */
    status: string;
  };
  backToIndex: string;
  resources: string;
  /** Teaser block on the home page, shown once something is published. */
  teaser: { headline: string; link: string };
};

/** Replace `{key}` placeholders in a copy string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

const dateLocale: Record<Locale, string> = { de: "de-DE", en: "en-GB" };

/**
 * Publication dates, spelled out in the reader's language. The ISO date is
 * pinned to midday UTC so the day never slips a step in another timezone.
 */
export function formatArticleDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(dateLocale[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

export const articlesContent: Record<Locale, ArticlesCopy> = {
  de: {
    meta: {
      title: "Veröffentlichungen",
      description:
        "Research-Notes, Workshop-Unterlagen und Artikel der Tübingen Quant Society. Frei zugänglich, ohne Login.",
      cardAlt: "Vorschaubild einer Veröffentlichung der Tübingen Quant Society",
    },
    eyebrow: "Öffentliche Materialien",
    headline: "Veröffentlichungen",
    lead: "Research-Notes, Workshop-Unterlagen und Artikel. Alles frei zugänglich, ohne Login.",
    empty: {
      title: "Ganz schön leer hier.",
      body: "Wir fangen gerade erst an. Sobald die ersten Research-Notes und Workshop-Unterlagen fertig sind, erscheinen sie hier.",
    },
    kinds: {
      "research-note": "Research-Note",
      workshop: "Workshop-Unterlagen",
      article: "Artikel",
    },
    languages: { de: "Deutsch", en: "Englisch" },
    languageNote: "Dieser Beitrag ist auf {language}.",
    readingTime: "{n} Min. Lesezeit",
    updated: "Aktualisiert am {date}",
    authorsPrefix: "von",
    pagination: {
      aria: "Seiten",
      previous: "Neuere",
      next: "Ältere",
      status: "Seite {page} von {total}",
    },
    backToIndex: "Alle Veröffentlichungen",
    resources: "Material zum Mitnehmen",
    teaser: {
      headline: "Zum Nachlesen.",
      link: "Alle Veröffentlichungen",
    },
  },

  en: {
    meta: {
      title: "Publications",
      description:
        "Research notes, workshop handouts and articles from the Tübingen Quant Society. Freely available, no login required.",
      cardAlt: "Preview card of a Tübingen Quant Society publication",
    },
    eyebrow: "Public materials",
    headline: "Publications",
    lead: "Research notes, workshop handouts and articles. All of it freely available, no login required.",
    empty: {
      title: "Nothing here yet.",
      body: "We're only just getting started. The first research notes and workshop handouts will show up right here once they're done.",
    },
    kinds: {
      "research-note": "Research note",
      workshop: "Workshop handout",
      article: "Article",
    },
    languages: { de: "German", en: "English" },
    languageNote: "This piece is written in {language}.",
    readingTime: "{n} min read",
    updated: "Updated {date}",
    authorsPrefix: "by",
    pagination: {
      aria: "Pages",
      previous: "Newer",
      next: "Older",
      status: "Page {page} of {total}",
    },
    backToIndex: "All publications",
    resources: "Material to take away",
    teaser: {
      headline: "Something to read.",
      link: "All publications",
    },
  },
};
