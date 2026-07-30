import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/saml/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST() {
  const response = new NextResponse(null, { status: 204 });
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
