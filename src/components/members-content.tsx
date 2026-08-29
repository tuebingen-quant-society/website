import { MembersGate } from "@/components/members-gate";
import { QrCode } from "@/components/qr-code";
import { getWhatsappGruppe } from "@/config";
import { localePath, type Locale } from "@/i18n";
import { membersContent } from "@/i18n/members-content";
import type { SessionPayload } from "@/lib/saml/session";

type MembersContentProps = {
  locale: Locale;
  session: SessionPayload | null;
};

export function MembersContent({ locale, session }: MembersContentProps) {
  const copy = membersContent[locale];
  const whatsappLink = getWhatsappGruppe();
  const membersPath = locale === "de" ? "/members" : "/en/members";
  const returnTo = encodeURIComponent(membersPath);

  if (!session) return <MembersGate locale={locale} returnTo={membersPath} />;

  return (
    <div className="members">
      <section className="members__intro" aria-labelledby="members-title">
        <div>
          <p className="members__eyebrow">{copy.authenticated.eyebrow}</p>
          <h1 className="members__title" id="members-title">
            {copy.authenticated.title}
          </h1>
          <p className="members__lead">{copy.authenticated.body}</p>
        </div>

        <form action={`/api/auth/saml/logout?returnTo=${returnTo}`} method="post">
          <button className="btn btn--secondary" type="submit">
            {copy.authenticated.logout}
          </button>
        </form>
      </section>

      <section className="members__identity" aria-label={copy.authenticated.verified}>
        <div className="members__verified">
          <span className="members__verified-dot" aria-hidden="true" />
          {copy.authenticated.verified}
        </div>
        <div>
          <p className="members__label">{copy.authenticated.email}</p>
          <p className="members__email">{session.user.email}</p>
        </div>
      </section>

      {whatsappLink ? (
        <section className="members__whatsapp" aria-labelledby="members-whatsapp-title">
          <div className="members__whatsapp-copy">
            <p className="members__eyebrow">{copy.whatsapp.eyebrow}</p>
            <h2 id="members-whatsapp-title">{copy.whatsapp.title}</h2>
            <p>{copy.whatsapp.body}</p>
            <a
              className="btn btn--primary members__whatsapp-cta"
              href={whatsappLink}
              rel="noopener"
              target="_blank"
            >
              {copy.whatsapp.cta}
            </a>
          </div>

          <figure className="members__qr">
            <QrCode
              className="members__qr-code"
              label={copy.whatsapp.qrLabel}
              value={whatsappLink}
            />
            <figcaption className="members__label">{copy.whatsapp.scan}</figcaption>
          </figure>
        </section>
      ) : null}

      <section className="members__resources" aria-labelledby="members-resources-title">
        <h2 className="members__resources-title" id="members-resources-title">
          {copy.resources.title}
        </h2>

        <ul className="members__resource-list">
          {copy.resources.items.map((item) => (
            <li className="members__resource" key={item.path}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a className="btn btn--primary" href={localePath(locale, item.path)}>
                <span>{item.cta}</span>
                <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="members__events" aria-labelledby="members-events-title">
        <div className="members__section-heading">
          <h2 id="members-events-title">{copy.events.title}</h2>
          <p>{copy.events.body}</p>
        </div>

        <ol className="members__event-list">
          {copy.events.items.map((event, index) => (
            <li className="members__event" key={event.title}>
              <span className="members__event-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="members__event-copy">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
              <span className="members__event-status">{copy.events.status}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
