import { NextRequest, NextResponse } from "next/server";
import { getSessionSecret } from "@/lib/saml/config";
import { SESSION_COOKIE } from "@/lib/saml/constants";
import { openCookie } from "@/lib/saml/cookie-crypto";
import { samlErrorResponse } from "@/lib/saml/http";
import { isValidSession, type SessionPayload } from "@/lib/saml/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  try {
    const session = openCookie<SessionPayload>(
      request.cookies.get(SESSION_COOKIE)?.value,
      getSessionSecret(),
    );
    if (!isValidSession(session)) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { authenticated: true, user: session.user },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return samlErrorResponse(error, "session");
  }
}
