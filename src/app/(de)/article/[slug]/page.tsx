import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article-view";
import { PageFrame } from "@/components/page-frame";
import { articlePath, getArticle, listArticles } from "@/lib/articles";
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
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const found = await getArticle(slug);
  if (!found) notFound();

  const { article } = found;

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
