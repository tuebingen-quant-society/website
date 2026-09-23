import { PublicDirectoryPage } from "@/components/public-directory-page";
import { directoryCopy } from "@/i18n/public-directory-copy";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 86400;
export const metadata = pageMetadata(
  "de",
  "quant-fields",
  directoryCopy.de["quant-fields"].title,
  directoryCopy.de["quant-fields"].description,
  { keywords: ["quantitative Berufe", "Mathematik Berufsfelder", "quantitative Finance", "Energiehandel", "Versicherung Mathematik"] },
);

export default function Page() {
  return <PublicDirectoryPage locale="de" kind="quant-fields" />;
}
