import { LegalNotice } from "@/components/legal-notice";
import { PageFrame } from "@/components/page-frame";
import { wortmarke } from "@/config";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata(
  "de",
  "impressum",
  `Impressum — ${wortmarke.lang}`,
  "Impressum der Tübingen Quant Society.",
);

export default function Page() {
  return (
    <PageFrame locale="de" logicalPath="impressum">
      <LegalNotice locale="de" />
    </PageFrame>
  );
}
