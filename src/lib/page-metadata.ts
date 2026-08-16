import type { Metadata } from "next";
import { site, wortmarke } from "@/config";
import { content, localePath, type Locale } from "@/i18n";

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
};

export function pageMetadata(
  locale: Locale,
  logicalPath = "",
  title = content[locale].meta.titel,
  description = content[locale].meta.beschreibung,
  options: PageMetadataOptions = {},
): Metadata {
  const canonical = localePath(locale, logicalPath);
  const shared = {
    siteName: wortmarke.lang,
    locale: content[locale].meta.ogLocale,
    title,
    description,
    url: canonical,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: wortmarke.lang }],
  };

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        de: localePath("de", logicalPath),
        en: localePath("en", logicalPath),
        "x-default": localePath("de", logicalPath),
      },
    },
    openGraph: options.article
      ? { type: "article", ...shared, ...options.article }
      : { type: "website", ...shared },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
    metadataBase: new URL(site),
  };
}
