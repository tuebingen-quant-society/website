import { PageFrame } from "@/components/page-frame";
import { PrivacyPolicy } from "@/components/privacy-policy";
import { wortmarke } from "@/config";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata(
  "en",
  "datenschutz",
  `Privacy — ${wortmarke.lang}`,
  "Privacy policy of the Tübingen Quant Society.",
);

export default function Page() {
  return (
    <div lang="en">
      <PageFrame locale="en" logicalPath="datenschutz">
        <PrivacyPolicy locale="en" />
      </PageFrame>
    </div>
  );
}
