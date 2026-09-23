import { PublicDirectoryPage } from "@/components/public-directory-page";
import { directoryCopy } from "@/i18n/public-directory-copy";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;
export const metadata = pageMetadata(
  "en",
  "quant-careers",
  directoryCopy.en["quant-careers"].title,
  directoryCopy.en["quant-careers"].description,
  { keywords: ["quant careers", "quantitative jobs", "quant firms", "energy trading", "actuarial careers"] },
);

export default function Page() {
  return <PublicDirectoryPage locale="en" kind="quant-careers" />;
}
