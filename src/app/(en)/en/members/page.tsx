import { cookies } from "next/headers";
import { MembersContent } from "@/components/members-content";
import { PageFrame } from "@/components/page-frame";
import { pageMetadata } from "@/lib/page-metadata";
import { getSessionSecret } from "@/lib/saml/config";
import { SESSION_COOKIE } from "@/lib/saml/constants";
import { readSessionToken } from "@/lib/saml/session";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata(
  "en",
  "members",
  "Members",
  "Members area of the Tübingen Quant Society. Uni login required.",
  { noindex: true },
);

export default async function MembersPage() {
  const cookieStore = await cookies();
  const session = readSessionToken(
    cookieStore.get(SESSION_COOKIE)?.value,
    getSessionSecret(),
  );

  return (
    <PageFrame locale="en" logicalPath="members">
      <MembersContent locale="en" session={session} />
    </PageFrame>
  );
}
