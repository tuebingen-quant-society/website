/**
 * Per-page metadata, on top of the defaults in src/app/site-metadata.ts.
 *
 * The root layout carries everything that is true everywhere — metadataBase,
 * the title template, the robots policy, the site name. What is left for a page
 * is what actually distinguishes it: its title, its description, its canonical
 * URL and the hreflang pair pointing at the same page in the other language.
 *
 * Share images are *not* set here. They come from the `opengraph-image` file
 * convention (see src/lib/og), and an explicit `images` entry would silently
 * take precedence over the generated card.
 */
import type { Metadata } from "next";
import { wortmarke } from "@/config";
import { content, locales, localePath, type Locale } from "@/i18n";

type PageMetadataOptions = {
  /**
   * Set on single articles: switches Open Graph from "website" to "article"
   * and carries the publication dates into the share card.
   */
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    authors?: string[];
  };
  /**
   * The language the *content* is written in, when it differs from the language
   * of the page around it — an article keeps its own language on both sides of
   * the site, and og:title/og:description are the article's words.
   */
  contentLocale?: Locale;
  /** Free-form subject tags. Cheap to emit, occasionally still read. */
  keywords?: string[];
  /** Anything behind the login: indexed nowhere, followed nowhere. */
  noindex?: boolean;
};

export function pageMetadata(
  locale: Locale,
  logicalPath = "",
  title = content[locale].meta.titel,
  description = content[locale].meta.beschreibung,
  options: PageMetadataOptions = {},
): Metadata {
  const canonical = localePath(locale, logicalPath);

  /* The home page's title is already the full brand line. Letting the root
     template append the wordmark again would read as a stutter, so that one
     opts out and everything else gets it added. */
  const carriesBrand = title.includes(wortmarke.lang);
  const branded = carriesBrand ? title : `${title} — ${wortmarke.lang}`;

  const contentLocale = options.contentLocale ?? locale;
  const authors = options.article?.authors;

  return {
    title: carriesBrand ? { absolute: title } : title,
    description,
    ...(options.keywords?.length ? { keywords: options.keywords } : {}),
    ...(authors?.length ? { authors: authors.map((name) => ({ name })) } : {}),
    alternates: {
      canonical,
      languages: {
        de: localePath("de", logicalPath),
        en: localePath("en", logicalPath),
        "x-default": localePath("de", logicalPath),
      },
    },
    ...(options.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: options.article ? "article" : "website",
      siteName: wortmarke.lang,
      locale: content[contentLocale].meta.ogLocale,
      alternateLocale: locales
        .filter((other) => other !== contentLocale)
        .map((other) => content[other].meta.ogLocale),
      url: canonical,
      title: branded,
      description,
      ...options.article,
    },
    twitter: {
      card: "summary_large_image",
      title: branded,
      description,
    },
  };
}
