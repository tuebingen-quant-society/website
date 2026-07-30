import { NextResponse } from "next/server";
import { SamlConfigurationError } from "./config";

export function samlErrorResponse(error: unknown, context: string) {
  console.error(`[saml:${context}]`, error);
  const configurationError = error instanceof SamlConfigurationError;
  return NextResponse.json(
    {
      error: configurationError
        ? "SAML is not configured on this deployment"
        : "SAML request could not be processed",
    },
    {
      status: configurationError ? 503 : 400,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  return value;
}
