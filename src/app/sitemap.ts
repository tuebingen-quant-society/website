import type { MetadataRoute } from "next";
import { site } from "@/config";
import { locales, localePath } from "@/i18n";
import { articlePageCount, articlePath, articlesPath, listArticles } from "@/lib/articles";

const paths = ["", "/en", "/impressum", "/en/impressum", "/datenschutz", "/en/datenschutz"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [articles, pageCount] = await Promise.all([listArticles(), articlePageCount()]);

  const entries: MetadataRoute.Sitemap = paths.map((path) => ({
    url: `${site}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" || path === "/en" ? 1 : 0.3,
  }));

  /* Both languages serve the same archive — the pages differ only in chrome,
     and each carries its hreflang alternates. */
  for (const locale of locales) {
    for (let page = 1; page <= pageCount; page += 1) {
      entries.push({
        url: `${site}${localePath(locale, articlesPath(page))}`,
        lastModified: articles[0] ? new Date(articles[0].date) : now,
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
