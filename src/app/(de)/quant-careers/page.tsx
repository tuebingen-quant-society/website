import { PublicDirectoryPage } from "@/components/public-directory-page";
import { directoryCopy } from "@/i18n/public-directory-copy";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;
export const metadata = pageMetadata(
  "de",
  "quant-careers",
  directoryCopy.de["quant-careers"].title,
  directoryCopy.de["quant-careers"].description,
  { keywords: ["Quant Karriere", "quantitative Berufe", "Quant Firmen", "Energy Trading", "Aktuariat"] },
);

export default function Page() {
  return <PublicDirectoryPage locale="de" kind="quant-careers" />;
}
