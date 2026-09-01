export type HeaderAuthState =
  | "authenticated"
  | "unauthenticated"
  | "indeterminate";

type FetchSession = (
  input: string,
  init?: RequestInit,
) => Promise<Pick<Response, "ok" | "status">>;

/** Resolve whether the header should offer login without exposing session data. */
export async function getHeaderAuthState(
  fetchSession: FetchSession = fetch,
): Promise<HeaderAuthState> {
  try {
    const response = await fetchSession("/api/auth/saml/session", {
      cache: "no-store",
    });
    if (response.ok) return "authenticated";
    if (response.status === 401) return "unauthenticated";
  } catch {
    // The header stays neutral when authentication cannot be determined.
  }
  return "indeterminate";
}
