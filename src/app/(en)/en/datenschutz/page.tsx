import { PageFrame } from "@/components/page-frame";
import { PrivacyPolicy } from "@/components/privacy-policy";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata(
  "en",
  "datenschutz",
  "Privacy",
  "Privacy policy of the Tübingen Quant Society.",
);

export default function Page() {
  return (
    <PageFrame locale="en" logicalPath="datenschutz">
      <PrivacyPolicy locale="en" />
    </PageFrame>
  );
}
