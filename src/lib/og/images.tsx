/**
 * The two generated Open Graph cards, as factories.
 *
 * Every card exists twice — once per language — and Next's file convention
 * wants one module per route. Rather than copying the same twenty lines into
 * four `opengraph-image.tsx` files, each route asks for its locale's card here.
 *
 * All of these are prerendered during `next build`: the routes that use them
 * are fully static (`dynamicParams = false`), so nothing rasterises at request
 * time and no image function is deployed.
 */
import { ImageResponse } from "next/og";
import { site, wortmarke } from "@/config";
import { content, type Locale } from "@/i18n";
import { articlesContent, fill, formatArticleDate } from "@/i18n/articles-content";
import { getArticle } from "@/lib/articles";
import { OgCard } from "./card";
import { articleFigureSvg, marketFigureSvg } from "./figures";
import { OG_SIZE, ogFonts, svgDataUri } from "./theme";

/** Bare host, e.g. "tuequant.de" — the card has to be attributable on its own. */
const domain = new URL(site).host;

/** The site-wide card, inherited by every route without one of its own. */
export function siteOgImage(locale: Locale) {
  return async function Image(): Promise<ImageResponse> {
    const copy = content[locale].meta.og;

    return new ImageResponse(
      (
        <OgCard
          eyebrow={copy.eyebrow}
          title={copy.headline}
          byline={copy.byline}
          figure={svgDataUri(marketFigureSvg())}
          wordmark={wortmarke.lang}
          domain={domain}
        />
      ),
      { ...OG_SIZE, fonts: await ogFonts() },
    );
  };
}

/**
 * One card per article, carrying the piece's own signature figure — the same
 * shape its card on /articles draws, so the preview and the page match.
 */
export function articleOgImage(locale: Locale) {
  return async function Image({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }): Promise<ImageResponse> {
    const { slug } = await params;
    const found = await getArticle(slug);
    const copy = articlesContent[locale];

    // Only reachable for a published slug (the page fixes the params), but the
    // card must not be the thing that fails the build if that ever changes.
    if (!found) return siteOgImage(locale)();

    const { article } = found;
    const eyebrow = [
      copy.kinds[article.kind],
      formatArticleDate(article.date, locale),
      fill(copy.readingTime, { n: article.readingMinutes }),
    ];
    const byline = article.authors?.length
      ? `${copy.authorsPrefix} ${article.authors.join(", ")}`
      : article.description;

    return new ImageResponse(
      (
        <OgCard
          eyebrow={eyebrow}
          title={article.title}
          byline={byline}
          figure={svgDataUri(articleFigureSvg(article.slug, article.kind))}
          wordmark={wortmarke.lang}
          domain={domain}
        />
      ),
      { ...OG_SIZE, fonts: await ogFonts() },
    );
  };
}
