import type { Locale } from "@/i18n";
import { membersContent } from "@/i18n/members-content";

/**
 * The logged-out state of anything behind the university login. Shared by every
 * members route so the wording of the invitation stays identical no matter
 * which page someone landed on; `returnTo` sends them back to that page after
 * the SAML round trip.
 */
export function MembersGate({
  locale,
  returnTo,
}: {
  locale: Locale;
  returnTo: string;
}) {
  const copy = membersContent[locale].gate;

  return (
    <section className="members members--gate" aria-labelledby="members-title">
      <div className="members__gate-inner">
        <p className="members__eyebrow">{copy.eyebrow}</p>
        <h1 className="members__title" id="members-title">
          {copy.title}
        </h1>
        <p className="members__lead">{copy.body}</p>
        <a
          className="btn btn--primary members__login"
          href={`/api/auth/saml/login?returnTo=${encodeURIComponent(returnTo)}`}
        >
          {copy.login}
        </a>
        <p className="members__privacy">{copy.note}</p>
      </div>
    </section>
  );
}
