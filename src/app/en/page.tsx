import { HomePage } from "@/components/home-page";
import { PageFrame } from "@/components/page-frame";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("en");

export default function Page() {
  return (
    <div lang="en">
      <PageFrame locale="en">
        <HomePage locale="en" />
      </PageFrame>
    </div>
  );
}
