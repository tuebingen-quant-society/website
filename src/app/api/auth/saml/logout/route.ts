import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/saml/constants";
import { safeReturnPath } from "@/lib/saml/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(request: NextRequest) {
  const returnTo = safeReturnPath(request.nextUrl.searchParams.get("returnTo"));
  const response = NextResponse.redirect(new URL(returnTo, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
