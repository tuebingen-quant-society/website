import type { MetadataRoute } from "next";
import { site } from "@/config";
import { locales, localePath } from "@/i18n";
import {
  articlePageCount,
  articlePath,
  articlesForLocale,
  articlesPath,
  listArticles,
} from "@/lib/articles";

const paths = ["", "/en", "/impressum", "/en/impressum", "/datenschutz", "/en/datenschutz"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const articles = await listArticles();

  const entries: MetadataRoute.Sitemap = paths.map((path) => ({
    url: `${site}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" || path === "/en" ? 1 : 0.3,
  }));

  for (const locale of locales) {
    const localizedArticles = articlesForLocale(articles, locale);
    const pageCount = await articlePageCount(locale);
    for (let page = 1; page <= pageCount; page += 1) {
      entries.push({
        url: `${site}${localePath(locale, articlesPath(page))}`,
        lastModified: localizedArticles[0] ? new Date(localizedArticles[0].date) : now,
        changeFrequency: "weekly",
        priority: page === 1 ? 0.6 : 0.3,
      });
    }

    for (const article of articles) {
      entries.push({
        url: `${site}${localePath(locale, articlePath(article.slug))}`,
        lastModified: new Date(article.updated ?? article.date),
        changeFrequency: "yearly",
        priority: 0.5,
      });
    }
  }

  return entries;
}
