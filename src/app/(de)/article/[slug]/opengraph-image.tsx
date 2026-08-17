import { articlesContent } from "@/i18n/articles-content";
import { listArticles } from "@/lib/articles";
import { articleOgImage } from "@/lib/og/images";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og/theme";

export const alt = articlesContent.de.meta.cardAlt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Baked at build time, one card per published article — same list as the page. */
export async function generateStaticParams() {
  const articles = await listArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export const dynamicParams = false;

export default articleOgImage("de");
