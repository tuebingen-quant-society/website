import { HomePage } from "@/components/home-page";
import { PageFrame } from "@/components/page-frame";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("de");

export default function Page() {
  return (
    <PageFrame locale="de">
      <HomePage locale="de" />
    </PageFrame>
  );
}
