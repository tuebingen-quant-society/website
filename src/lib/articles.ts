/**
 * The article index — public materials per spec: research notes, workshop
 * handouts and articles on tuequant.de.
 *
 * Adding an article is one file: drop `<slug>.mdx` into src/content/articles/
 * (see the README there). This module discovers those files, reads their
 * `meta` export and turns them into the list behind /articles and /article/…
 * Nothing else needs to be registered.
 *
 * Everything here runs at build time: the listing and every article page are
 * statically generated, so the filesystem read never happens at request time.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { ComponentType } from "react";
import { locales, type Locale } from "@/i18n";

/** Articles per listing page (spec: 10). */
export const ARTICLES_PER_PAGE = 10;

const ARTICLES_DIR = path.join(process.cwd(), "src", "content", "articles");

/** Rough reading speed for prose with the occasional formula in it. */
const WORDS_PER_MINUTE = 200;

export const articleKinds = ["research-note", "workshop", "article"] as const;
export type ArticleKind = (typeof articleKinds)[number];

/** The `meta` export every article file must provide. */
export type ArticleMeta = {
  title: string;
  /** One or two sentences — used on the card, in <meta> and for OG. */
  description: string;
  /** ISO date (YYYY-MM-DD), the publication date. */
  date: string;
  /** ISO date — set when a published piece is revised. */
  updated?: string;
  /** The language the article itself is written in. */
  lang: Locale;
  kind: ArticleKind;
  authors?: string[];
  /** Free-form subject tags, shown under the title. */
  topics?: string[];
  /** Slides, notebooks, datasets — anything that belongs to the piece. */
  resources?: { label: string; href: string }[];
  /** Set to false when the article should use a text-only card and header. */
  preview?: boolean;
  /** Drafts stay out of the listing, the sitemap and the routes (404). */
  draft?: boolean;
};

/** An article's metadata plus everything derived from the file itself. */
export type Article = ArticleMeta & {
  slug: string;
  readingMinutes: number;
};

type ArticleModule = {
  default: ComponentType;
  meta: ArticleMeta;
};

/**
 * Load one article's module. The static `@/content/articles/` prefix is what
 * lets the bundler resolve the dynamic segment — keep it inline, a variable
 * path would break the build.
 */
async function importArticle(slug: string): Promise<ArticleModule> {
  return (await import(`@/content/articles/${slug}.mdx`)) as ArticleModule;
}

function fail(slug: string, problem: string): never {
  throw new Error(`Article "${slug}.mdx": ${problem}`);
}

/** Fail the build on a malformed `meta` rather than shipping a broken card. */
function validate(slug: string, meta: ArticleMeta): ArticleMeta {
  if (!meta) fail(slug, "no `export const meta` found");
  for (const field of ["title", "description", "date"] as const) {
    if (!meta[field]?.trim()) fail(slug, `meta.${field} is required`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) {
    fail(slug, `meta.date must be YYYY-MM-DD, got "${meta.date}"`);
  }
  if (!(locales as readonly string[]).includes(meta.lang)) {
    fail(slug, `meta.lang must be one of ${locales.join(", ")}`);
  }
  if (!(articleKinds as readonly string[]).includes(meta.kind)) {
    fail(slug, `meta.kind must be one of ${articleKinds.join(", ")}`);
  }
  return meta;
}

/**
 * Word count of the prose only: the `export`/`import` block at the top of the
 * file and fenced code blocks are not what a reader spends their minutes on.
 */
function readingMinutes(source: string): number {
  const prose = source
    .replace(/^(import|export)\s[\s\S]*?(\n\n|$)/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`|-]/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Newest first; same-day pieces fall back to a stable alphabetical order. */
function byDateDesc(a: Article, b: Article): number {
  return b.date.localeCompare(a.date) || a.title.localeCompare(b.title);
}

/**
 * Every published article, newest first. Cached per render pass so the listing
 * and the home teaser share one filesystem walk.
 */
export const listArticles = cache(async (): Promise<Article[]> => {
  let files: string[];
  try {
    files = await readdir(ARTICLES_DIR);
  } catch {
    // No content directory yet — the listing renders its empty state.
    return [];
  }

  const slugs = files
    .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
    .map((file) => file.replace(/\.mdx$/, ""));

  const articles = await Promise.all(
    slugs.map(async (slug): Promise<Article> => {
      const { meta } = await importArticle(slug);
      const source = await readFile(path.join(ARTICLES_DIR, `${slug}.mdx`), "utf8");
      return { ...validate(slug, meta), slug, readingMinutes: readingMinutes(source) };
    }),
  );

  return articles.filter((article) => !article.draft).sort(byDateDesc);
});

/** Keep an archive and its pagination scoped to the language being viewed. */
export function articlesForLocale(articles: Article[], locale: Locale): Article[] {
  return articles.filter((article) => article.lang === locale);
}

/**
 * One article with its rendered body, or null when the slug is unknown or the
 * piece is still a draft — the route turns that into a 404.
 */
export async function getArticle(
  slug: string,
): Promise<{ article: Article; Body: ComponentType } | null> {
  const published = await listArticles();
  const article = published.find((candidate) => candidate.slug === slug);
  if (!article) return null;
  const { default: Body } = await importArticle(slug);
  return { article, Body };
}

export type ArticlePage = {
  items: Article[];
  page: number;
  pageCount: number;
};

/** Total number of listing pages — always at least one, for the empty state. */
export async function articlePageCount(locale: Locale): Promise<number> {
  const articles = articlesForLocale(await listArticles(), locale);
  return Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE));
}

/** Slice the archive for listing page `page` (1-based), or null if out of range. */
export async function getArticlePage(locale: Locale, page: number): Promise<ArticlePage | null> {
  const articles = articlesForLocale(await listArticles(), locale);
  const pageCount = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE));
  if (!Number.isInteger(page) || page < 1 || page > pageCount) return null;
  const start = (page - 1) * ARTICLES_PER_PAGE;
  return {
    items: articles.slice(start, start + ARTICLES_PER_PAGE),
    page,
    pageCount,
  };
}

/**
 * Locale-agnostic route of a listing page: "articles" for the first page,
 * "articles/3" after that. Feeds localePath(), the header and hreflang.
 */
export function articlesPath(page = 1): string {
  return page <= 1 ? "articles" : `articles/${page}`;
}

/** Locale-agnostic route of a single article. */
export function articlePath(slug: string): string {
  return `article/${slug}`;
}
