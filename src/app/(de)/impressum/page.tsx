import { LegalNotice } from "@/components/legal-notice";
import { PageFrame } from "@/components/page-frame";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata(
  "de",
  "impressum",
  "Impressum",
  "Impressum der Tübingen Quant Society.",
);

export default function Page() {
  return (
    <PageFrame locale="de" logicalPath="impressum">
      <LegalNotice locale="de" />
    </PageFrame>
  );
}
