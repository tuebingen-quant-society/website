/**
 * schema.org graphs (JSON-LD) for search engines.
 *
 * Every page emits one <script type="application/ld+json"> holding an @graph:
 * the organisation and the website are always in it, and a page adds its own
 * nodes on top (an Article, a breadcrumb trail). Nodes reference each other by
 * @id, so the publisher of an article is the same entity as the site's owner
 * rather than a second copy of it.
 *
 * This describes what is already on the page — the same titles, dates and
 * authors the reader sees. Nothing here is markup-only; that is what makes it
 * safe with Google's structured-data guidelines.
 */
import { kontakt, site, wortmarke } from "@/config";
import { content, localePath, type Locale } from "@/i18n";
import { articlesContent } from "@/i18n/articles-content";
import { articlePath, articlesPath, type Article } from "@/lib/articles";

export type JsonLdNode = Record<string, unknown>;

/** Stable @id anchors — the fragment makes the node addressable across pages. */
const ORGANISATION_ID = `${site}/#organisation`;
const WEBSITE_ID = `${site}/#website`;

/**
 * Absolute URL for a locale-agnostic route — schema.org wants no relative URLs.
 * The trailing slash of the German home page is dropped so the same page is not
 * named two ways across the sitemap, the canonical link and the graph.
 */
export function absoluteUrl(locale: Locale, logicalPath = ""): string {
  const url = new URL(localePath(locale, logicalPath), site).toString();
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function organisationNode(locale: Locale): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANISATION_ID,
    name: wortmarke.lang,
    alternateName: wortmarke.kurz,
    url: site,
    email: kontakt.mail,
    description: content[locale].meta.beschreibung,
    logo: { "@type": "ImageObject", url: `${site}/favicon.svg` },
    sameAs: [kontakt.instagram, kontakt.linkedin],
  };
}

function websiteNode(locale: Locale): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site,
    name: wortmarke.lang,
    description: content[locale].meta.beschreibung,
    inLanguage: locale,
    publisher: { "@id": ORGANISATION_ID },
  };
}

/** The two nodes every page carries. */
export function siteNodes(locale: Locale): JsonLdNode[] {
  return [organisationNode(locale), websiteNode(locale)];
}

/**
 * One article. `inLanguage` is the language the piece is *written* in, which is
 * not always the language of the page around it — a German note stays German
 * when it is read from the English side of the site.
 */
export function articleNode(article: Article, locale: Locale): JsonLdNode {
  const url = absoluteUrl(locale, articlePath(article.slug));

  return {
    "@type": article.kind === "research-note" ? "ScholarlyArticle" : "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: article.date,
    dateModified: article.updated ?? article.date,
    inLanguage: article.lang,
    /* No `image`: the generated card's URL carries a build hash Next does not
       expose (…/opengraph-image-fnutcz?…), so it cannot be named from here.
       og:image says the same thing and search engines read it. */
    articleSection: articlesContent[locale].kinds[article.kind],
    isAccessibleForFree: true,
    publisher: { "@id": ORGANISATION_ID },
    ...(article.authors?.length
      ? { author: article.authors.map((name) => ({ "@type": "Person", name })) }
      : { author: { "@id": ORGANISATION_ID } }),
    ...(article.topics?.length ? { keywords: article.topics.join(", ") } : {}),
  };
}

/**
 * A page of the publications listing: what the collection is, and which pieces
 * are on this page of it, in the order they are shown.
 */
export function articleListNode(
  articles: Article[],
  locale: Locale,
  logicalPath: string,
): JsonLdNode {
  const url = absoluteUrl(locale, logicalPath);
  const copy = articlesContent[locale];

  return {
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: copy.meta.title,
    description: copy.meta.description,
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: article.title,
        url: absoluteUrl(locale, articlePath(article.slug)),
      })),
    },
  };
}

/**
 * A breadcrumb trail. `items` are locale-agnostic routes with the label the
 * page itself shows for them, so the crumb and the link never disagree.
 */
export function breadcrumbNode(
  locale: Locale,
  items: { name: string; logicalPath: string }[],
): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(locale, item.logicalPath),
    })),
  };
}

/** A listing page and the trail that leads to it — page 1 and the archive alike. */
export function articlesIndexNodes(
  articles: Article[],
  locale: Locale,
  logicalPath: string,
): JsonLdNode[] {
  return [
    articleListNode(articles, locale, logicalPath),
    breadcrumbNode(locale, [
      { name: wortmarke.lang, logicalPath: "" },
      { name: articlesContent[locale].meta.title, logicalPath: articlesPath() },
    ]),
  ];
}

/** Home → Veröffentlichungen → <title>, the path an article actually sits on. */
export function articleBreadcrumb(article: Article, locale: Locale): JsonLdNode {
  return breadcrumbNode(locale, [
    { name: wortmarke.lang, logicalPath: "" },
    { name: articlesContent[locale].meta.title, logicalPath: articlesPath() },
    { name: article.title, logicalPath: articlePath(article.slug) },
  ]);
}
