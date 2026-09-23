import { PublicDirectoryPage } from "@/components/public-directory-page";
import { directoryCopy } from "@/i18n/public-directory-copy";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 300;
export const metadata = pageMetadata(
  "en",
  "opportunities",
  directoryCopy.en.opportunities.title,
  directoryCopy.en.opportunities.description,
  { keywords: ["quant competitions", "student trading competition", "quant hackathon", "math puzzles", "quant events"] },
);

export default function Page() {
  return <PublicDirectoryPage locale="en" kind="opportunities" />;
}
