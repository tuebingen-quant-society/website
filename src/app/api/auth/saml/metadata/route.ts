import { generateMetadata } from "@/lib/saml/metadata";
import { samlErrorResponse } from "@/lib/saml/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  try {
    return new Response(generateMetadata(), {
      headers: {
        "Content-Type": "application/samlmetadata+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return samlErrorResponse(error, "metadata");
  }
}
