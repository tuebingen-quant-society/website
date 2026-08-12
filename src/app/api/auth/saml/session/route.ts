import { NextRequest, NextResponse } from "next/server";
import { getSessionSecret } from "@/lib/saml/config";
import { SESSION_COOKIE } from "@/lib/saml/constants";
import { samlErrorResponse } from "@/lib/saml/http";
import { readSessionToken } from "@/lib/saml/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  try {
    const session = readSessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
      getSessionSecret(),
    );
    if (!session) {
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
