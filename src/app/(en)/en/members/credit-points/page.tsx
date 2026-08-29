import { cookies } from "next/headers";
import { CreditPointsContent } from "@/components/credit-points-content";
import { PageFrame } from "@/components/page-frame";
import { pageMetadata } from "@/lib/page-metadata";
import { getSessionSecret } from "@/lib/saml/config";
import { SESSION_COOKIE } from "@/lib/saml/constants";
import { readSessionToken } from "@/lib/saml/session";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata(
  "en",
  "members/credit-points",
  "Credit points",
  "How work in the Tübingen Quant Society translates into credit points. Uni login required.",
  { noindex: true },
);

export default async function CreditPointsPage() {
  const cookieStore = await cookies();
  const session = readSessionToken(
    cookieStore.get(SESSION_COOKIE)?.value,
    getSessionSecret(),
  );

  return (
    <PageFrame locale="en" logicalPath="members/credit-points">
      <CreditPointsContent locale="en" session={session} />
    </PageFrame>
  );
}
