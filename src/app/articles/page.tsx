import { notFound } from "next/navigation";
import { ArticlesIndex } from "@/components/articles-index";
import { PageFrame } from "@/components/page-frame";
import { articlesContent } from "@/i18n/articles-content";
import { articlesPath, getArticlePage } from "@/lib/articles";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata(
  "de",
  articlesPath(),
  articlesContent.de.meta.title,
  articlesContent.de.meta.description,
);

export default async function Page() {
  const page = await getArticlePage(1);
  if (!page) notFound();

  return (
    <PageFrame locale="de" logicalPath={articlesPath()}>
      <ArticlesIndex locale="de" page={page} />
    </PageFrame>
  );
}
