import { PageFrame } from "@/components/page-frame";
import { PrivacyPolicy } from "@/components/privacy-policy";
import { wortmarke } from "@/config";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata(
  "de",
  "datenschutz",
  `Datenschutz — ${wortmarke.lang}`,
  "Datenschutzerklärung der Tübingen Quant Society.",
);

export default function Page() {
  return (
    <PageFrame locale="de" logicalPath="datenschutz">
      <PrivacyPolicy locale="de" />
    </PageFrame>
  );
}
