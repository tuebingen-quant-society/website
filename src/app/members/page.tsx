import type { Metadata } from "next";
import { cookies } from "next/headers";
import { MembersContent } from "@/components/members-content";
import { PageFrame } from "@/components/page-frame";
import { getSessionSecret } from "@/lib/saml/config";
import { SESSION_COOKIE } from "@/lib/saml/constants";
import { readSessionToken } from "@/lib/saml/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mitgliederbereich | Tübingen Quant Society",
  robots: { index: false, follow: false },
};

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
