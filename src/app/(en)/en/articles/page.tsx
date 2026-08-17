import { notFound } from "next/navigation";
import { ArticlesIndex } from "@/components/articles-index";
import { PageFrame } from "@/components/page-frame";
import { articlesContent } from "@/i18n/articles-content";
import { articlesPath, getArticlePage } from "@/lib/articles";
import { pageMetadata } from "@/lib/page-metadata";
import { articlesIndexNodes } from "@/lib/structured-data";

export const metadata = pageMetadata(
  "en",
  articlesPath(),
  articlesContent.en.meta.title,
  articlesContent.en.meta.description,
);

export default async function Page() {
  const page = await getArticlePage(1);
  if (!page) notFound();

  return (
    <PageFrame
      locale="en"
      logicalPath={articlesPath()}
      jsonLd={articlesIndexNodes(page.items, "en", articlesPath())}
    >
      <ArticlesIndex locale="en" page={page} />
    </PageFrame>
  );
}
