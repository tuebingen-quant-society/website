import { LegalNotice } from "@/components/legal-notice";
import { PageFrame } from "@/components/page-frame";
import { wortmarke } from "@/config";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata(
  "en",
  "impressum",
  `Legal notice — ${wortmarke.lang}`,
  "Legal notice of the Tübingen Quant Society.",
);

export default function Page() {
  return (
    <div lang="en">
      <PageFrame locale="en" logicalPath="impressum">
        <LegalNotice locale="en" />
      </PageFrame>
    </div>
  );
}
