import { PublicDirectoryPage } from "@/components/public-directory-page";
import { directoryCopy } from "@/i18n/public-directory-copy";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 300;
export const metadata = pageMetadata(
  "de",
  "opportunities",
  directoryCopy.de.opportunities.title,
  directoryCopy.de.opportunities.description,
  { keywords: ["Quant Wettbewerbe", "Trading Wettbewerb Studierende", "Quant Hackathon", "Mathe Rätsel", "Quant Events"] },
);

export default function Page() {
  return <PublicDirectoryPage locale="de" kind="opportunities" />;
}
