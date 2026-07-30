import { randomUUID } from "node:crypto";
import { SAML } from "@node-saml/node-saml";
import { NextRequest, NextResponse } from "next/server";
import { createSamlConfig, getSessionSecret } from "@/lib/saml/config";
import {
  REQUEST_COOKIE,
  REQUEST_TTL_SECONDS,
} from "@/lib/saml/constants";
import { sealCookie } from "@/lib/saml/cookie-crypto";
import { safeReturnPath, samlErrorResponse } from "@/lib/saml/http";
import { RequestCookieCache } from "@/lib/saml/request-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const relayState = randomUUID();
    const cache = new RequestCookieCache();
    const saml = new SAML(createSamlConfig(cache));
    const authorizeUrl = await saml.getAuthorizeUrlAsync(relayState, undefined, {});
    const token = sealCookie(
      {
        relayState,
        returnTo: safeReturnPath(request.nextUrl.searchParams.get("returnTo")),
        entries: cache.snapshot(),
        expiresAt: Date.now() + REQUEST_TTL_SECONDS * 1_000,
      },
      getSessionSecret(),
    );
    const response = NextResponse.redirect(authorizeUrl, 303);
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(REQUEST_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/api/auth/saml",
      maxAge: REQUEST_TTL_SECONDS,
    });
    return response;
  } catch (error) {
    return samlErrorResponse(error, "login");
  }
}
