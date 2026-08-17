import { cookies } from "next/headers";
import { MembersContent } from "@/components/members-content";
import { PageFrame } from "@/components/page-frame";
import { pageMetadata } from "@/lib/page-metadata";
import { getSessionSecret } from "@/lib/saml/config";
import { SESSION_COOKIE } from "@/lib/saml/constants";
import { readSessionToken } from "@/lib/saml/session";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata(
  "de",
  "members",
  "Mitgliederbereich",
  "Interner Bereich der Tübingen Quant Society. Zugang nur mit Uni-Login.",
  { noindex: true },
);

export default async function MembersPage() {
  const cookieStore = await cookies();
  const session = readSessionToken(
    cookieStore.get(SESSION_COOKIE)?.value,
    getSessionSecret(),
  );

  return (
    <PageFrame locale="de" logicalPath="members">
      <MembersContent locale="de" session={session} />
    </PageFrame>
  );
}
