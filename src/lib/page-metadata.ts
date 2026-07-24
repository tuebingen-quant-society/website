import type { Metadata } from "next";
import { site, wortmarke } from "@/config";
import { content, localePath, type Locale } from "@/i18n";

export function pageMetadata(
  locale: Locale,
  logicalPath = "",
  title = content[locale].meta.titel,
  description = content[locale].meta.beschreibung,
): Metadata {
  const canonical = localePath(locale, logicalPath);
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
    openGraph: {
      type: "website",
      siteName: wortmarke.lang,
      locale: content[locale].meta.ogLocale,
      title,
      description,
      url: canonical,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: wortmarke.lang }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
    metadataBase: new URL(site),
  };
}
