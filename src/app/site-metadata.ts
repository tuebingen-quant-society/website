/**
 * The metadata every page starts from.
 *
 * Next merges a page's `metadata` export over its layout's, so anything that is
 * true site-wide belongs here and nowhere else: the base URL that resolves all
 * relative URLs, the title template, the robots policy, the icons, the brand
 * defaults for Open Graph and Twitter. A page then only states what makes it
 * different — see src/lib/page-metadata.ts.
 *
 * Note that `openGraph` and `twitter` are *replaced* rather than deep-merged
 * when a page sets them. The values here are the fallback for routes that set
 * no metadata of their own, not a base that pages extend.
 */
import type { Metadata, Viewport } from "next";
import { site, wortmarke } from "@/config";
import { content, localePath, type Locale } from "@/i18n";

export const siteViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#05070c" },
  ],
};

export function siteMetadata(locale: Locale): Metadata {
  const copy = content[locale].meta;

  return {
    /* Resolves every relative canonical, og:url and generated image URL below
       and in src/lib/page-metadata.ts. */
    metadataBase: new URL(site),

    title: {
      default: copy.titel,
      /* Pages set the bare page name — "Impressum", the article's headline —
         and the wordmark is appended here, once, for all of them. */
      template: `%s — ${wortmarke.lang}`,
    },
    description: copy.beschreibung,

    applicationName: wortmarke.lang,
    authors: [{ name: wortmarke.lang, url: site }],
    creator: wortmarke.lang,
    publisher: wortmarke.lang,

    icons: { icon: "/favicon.svg" },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        /* Full-size previews and untruncated snippets — the default is a
           thumbnail and ~160 characters, which wastes the generated card. */
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    /* Phone numbers and addresses in the legal notice are not links to dial. */
    formatDetection: { telephone: false, email: false, address: false },

    openGraph: {
      type: "website",
      siteName: wortmarke.lang,
      locale: copy.ogLocale,
      url: localePath(locale),
      title: copy.titel,
      description: copy.beschreibung,
    },
    twitter: {
      card: "summary_large_image",
      title: copy.titel,
      description: copy.beschreibung,
    },
  };
}
