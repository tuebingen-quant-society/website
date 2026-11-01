// Formulas in the article body are KaTeX markup rendered at build time.
import "katex/dist/katex.min.css";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleView } from "@/components/article-view";
import { PageFrame } from "@/components/page-frame";
import { localePath } from "@/i18n";
import { articleIn, articlePath, getArticle, listArticles } from "@/lib/articles";
import { pageMetadata } from "@/lib/page-metadata";
import { articleBreadcrumb, articleNode } from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

/** Drafts are not in this list, so they stay 404 until they are published. */
export async function generateStaticParams() {
  const articles = await listArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await getArticle(slug);
  if (!found) return {};

  const { article } = found;
  const articles = await listArticles();
  const pathIn = (locale: "de" | "en") =>
    articlePath((articleIn(articles, article, locale) ?? article).slug);
  return pageMetadata("de", articlePath(slug), article.title, article.description, {
    article: {
      publishedTime: article.date,
      modifiedTime: article.updated,
      authors: article.authors,
    },
    /* Title and description are the article's own words — og:locale names the
       language they are in, not the language of the chrome around them. */
    contentLocale: article.lang,
    keywords: article.topics,
    languagePaths: { de: pathIn("de"), en: pathIn("en") },
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const found = await getArticle(slug);
  if (!found) notFound();

  const { article } = found;

  // A piece written in the other language that has a translation into this
  // one: send readers to the translation (also what the language toggle hits).
  const own = articleIn(await listArticles(), article, "de");
  if (own && own !== article) permanentRedirect(localePath("de", articlePath(own.slug)));

  return (
    <PageFrame
      locale="de"
      logicalPath={articlePath(slug)}
      jsonLd={[articleNode(article, "de"), articleBreadcrumb(article, "de")]}
    >
      <ArticleView article={article} locale="de" Body={found.Body} />
    </PageFrame>
  );
}
