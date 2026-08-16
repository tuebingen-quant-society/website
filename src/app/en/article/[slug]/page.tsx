import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article-view";
import { PageFrame } from "@/components/page-frame";
import { articlePath, getArticle, listArticles } from "@/lib/articles";
import { pageMetadata } from "@/lib/page-metadata";

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
  return pageMetadata("en", articlePath(slug), article.title, article.description, {
    article: {
      publishedTime: article.date,
      modifiedTime: article.updated,
      authors: article.authors,
    },
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const found = await getArticle(slug);
  if (!found) notFound();

  return (
    <div lang="en">
      <PageFrame locale="en" logicalPath={articlePath(slug)}>
        <ArticleView article={found.article} locale="en" Body={found.Body} />
      </PageFrame>
    </div>
  );
}
