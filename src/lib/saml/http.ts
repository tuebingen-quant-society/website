import { NextResponse } from "next/server";
import { SamlConfigurationError } from "./config";

export type SamlErrorCode =
  | "SAML_ASSERTION_DECRYPTION_FAILED"
  | "SAML_ASSERTION_INVALID"
  | "SAML_ASSERTION_SIGNATURE_INVALID"
  | "SAML_NOT_CONFIGURED"
  | "SAML_PROFILE_INVALID"
  | "SAML_REQUEST_FAILED"
  | "SAML_RESPONSE_SIGNATURE_INVALID";

export function classifySamlError(error: unknown): SamlErrorCode {
  if (error instanceof SamlConfigurationError) return "SAML_NOT_CONFIGURED";
  const message = error instanceof Error ? error.message : "";

  if (message === "Invalid document signature") {
    return "SAML_RESPONSE_SIGNATURE_INVALID";
  }
  if (
    /decrypt|EncryptedAssertion|oaep decoding error|No decryption key/i.test(message)
  ) {
    return "SAML_ASSERTION_DECRYPTION_FAILED";
  }
  if (message === "Invalid signature" || message.includes("signature from encrypted assertion")) {
    return "SAML_ASSERTION_SIGNATURE_INVALID";
  }
  if (/attribute .* is required|Student affiliation is required/i.test(message)) {
    return "SAML_PROFILE_INVALID";
  }
  if (
    /SAML assertion|SAML issuer|audience|InResponseTo|subject confirmation|not yet valid|expired/i.test(
      message,
    )
  ) {
    return "SAML_ASSERTION_INVALID";
  }
  return "SAML_REQUEST_FAILED";
}

export function samlErrorResponse(error: unknown, context: string) {
  console.error(`[saml:${context}]`, error);
  const code = classifySamlError(error);
  const configurationError = code === "SAML_NOT_CONFIGURED";
  return NextResponse.json(
    {
      error: configurationError
        ? "SAML is not configured on this deployment"
        : "SAML request could not be processed",
      code,
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
