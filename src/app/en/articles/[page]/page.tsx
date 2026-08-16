import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlesIndex } from "@/components/articles-index";
import { PageFrame } from "@/components/page-frame";
import { articlesContent, fill } from "@/i18n/articles-content";
import { articlePageCount, articlesPath, getArticlePage } from "@/lib/articles";
import { pageMetadata } from "@/lib/page-metadata";

type Props = { params: Promise<{ page: string }> };

/** Page 1 lives at /en/articles, so only the archive pages are generated here. */
export async function generateStaticParams() {
  const pageCount = await articlePageCount();
  return Array.from({ length: pageCount - 1 }, (_, index) => ({ page: String(index + 2) }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const copy = articlesContent.en;
  const total = await articlePageCount();
  const status = fill(copy.pagination.status, { page, total });

  return pageMetadata(
    "en",
    articlesPath(Number(page)),
    `${copy.meta.title} (${status})`,
    copy.meta.description,
  );
}

export default async function Page({ params }: Props) {
  const { page } = await params;
  const archive = await getArticlePage(Number(page));
  if (!archive) notFound();

  return (
    <div lang="en">
      <PageFrame locale="en" logicalPath={articlesPath(archive.page)}>
        <ArticlesIndex locale="en" page={archive} />
      </PageFrame>
    </div>
  );
}
