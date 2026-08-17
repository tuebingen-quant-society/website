import { LegalNotice } from "@/components/legal-notice";
import { PageFrame } from "@/components/page-frame";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata(
  "en",
  "impressum",
  "Legal notice",
  "Legal notice of the Tübingen Quant Society.",
);

export default function Page() {
  return (
    <PageFrame locale="en" logicalPath="impressum">
      <LegalNotice locale="en" />
    </PageFrame>
  );
}
