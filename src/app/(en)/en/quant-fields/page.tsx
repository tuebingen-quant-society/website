import { PublicDirectoryPage } from "@/components/public-directory-page";
import { directoryCopy } from "@/i18n/public-directory-copy";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 86400;
export const metadata = pageMetadata(
  "en",
  "quant-fields",
  directoryCopy.en["quant-fields"].title,
  directoryCopy.en["quant-fields"].description,
  { keywords: ["quantitative careers", "maths careers", "energy trading", "insurance analytics", "quant finance"] },
);

export default function Page() {
  return <PublicDirectoryPage locale="en" kind="quant-fields" />;
}
