import { SAML } from "@node-saml/node-saml";
import { NextRequest, NextResponse } from "next/server";
import { createSamlConfig, getSessionSecret } from "@/lib/saml/config";
import {
  REQUEST_COOKIE,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/saml/constants";
import { openCookie, sealCookie } from "@/lib/saml/cookie-crypto";
import { samlErrorResponse } from "@/lib/saml/http";
import { type CacheEntry, RequestCookieCache } from "@/lib/saml/request-cache";
import {
  createSessionPayload,
  userFromProfile,
} from "@/lib/saml/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestState = {
  relayState: string;
  returnTo: string;
  entries: CacheEntry[];
  expiresAt: number;
};

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const samlResponse = form.get("SAMLResponse");
    const relayState = form.get("RelayState");
    if (
      typeof samlResponse !== "string" ||
      samlResponse.length > 1_500_000 ||
      typeof relayState !== "string"
    ) {
      return NextResponse.json({ error: "Invalid SAML response" }, { status: 400 });
    }

    const secret = getSessionSecret();
    const state = openCookie<RequestState>(request.cookies.get(REQUEST_COOKIE)?.value, secret);
    if (
      !state ||
      state.expiresAt <= Date.now() ||
      state.relayState !== relayState ||
      !Array.isArray(state.entries)
    ) {
      return NextResponse.json({ error: "SAML request state is invalid or expired" }, { status: 400 });
    }

    const cache = new RequestCookieCache(state.entries);
    const saml = new SAML(createSamlConfig(cache));
    const result = await saml.validatePostResponseAsync({ SAMLResponse: samlResponse });
    if (result.loggedOut || !result.profile) {
      return NextResponse.json({ error: "SAML response did not contain a login" }, { status: 400 });
    }

    const session = sealCookie(
      createSessionPayload(userFromProfile(result.profile)),
      secret,
    );
    const response = NextResponse.redirect(new URL(state.returnTo, request.url), 303);
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    response.cookies.set(REQUEST_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/api/auth/saml",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return samlErrorResponse(error, "acs");
  }
}
