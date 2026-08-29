import { MembersGate } from "@/components/members-gate";
import { kontakt } from "@/config";
import { localePath, type Locale } from "@/i18n";
import { creditPointsContent } from "@/i18n/credit-points-content";
import type { SessionPayload } from "@/lib/saml/session";

const ILIAS_COURSE_URL =
  "https://ovidius.uni-tuebingen.de/ilias3/goto.php?target=crs_1970388&client_id=pr02";

type CreditPointsContentProps = {
  locale: Locale;
  session: SessionPayload | null;
};

export function CreditPointsContent({ locale, session }: CreditPointsContentProps) {
  const copy = creditPointsContent[locale];
  const path = localePath(locale, "members/credit-points");

  if (!session) return <MembersGate locale={locale} returnTo={path} />;

  return (
    <article className="cp">
      <p className="cp__back">
        <a className="btn btn--secondary" href={localePath(locale, "members")}>
          <span aria-hidden="true">←</span>
          <span>{copy.back}</span>
        </a>
      </p>

      <header className="cp__head">
        <p className="cp__eyebrow">{copy.eyebrow}</p>
        <h1 className="cp__title">{copy.title}</h1>
        <p className="cp__lead">{copy.lead}</p>
        <p className="cp__meta">
          {copy.meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </p>
      </header>

      <div className="cp__body">
        <div className="cp__main">
          {/* The arithmetic first: everything below only makes sense once it is
              clear that the 10 CP are two separate quantities, not one. */}
          <section className="cp__section" aria-labelledby="cp-math">
            <h2 className="cp__section-title" id="cp-math">
              {copy.math.title}
            </h2>
            <ul className="cp__sum">
              {copy.math.items.map((item, index) => (
                <li
                  className={`cp__sum-item${index === copy.math.items.length - 1 ? " cp__sum-item--total" : ""}`}
                  key={item.label}
                >
                  <span className="cp__sum-value tnum">{item.value}</span>
                  <span className="cp__sum-label">{item.label}</span>
                  <span className="cp__sum-note">{item.note}</span>
                </li>
              ))}
            </ul>
            <p className="cp__note">{copy.math.note}</p>
          </section>

          <section className="cp__section" aria-labelledby="cp-steps">
            <h2 className="cp__section-title" id="cp-steps">
              {copy.steps.title}
            </h2>
            <p className="cp__note">{copy.steps.intro}</p>
            <ol className="cp__steps">
              {copy.steps.items.map((step, index) => (
                <li className="cp__step" key={step.title}>
                  <span className="cp__step-index tnum" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="cp__step-copy">
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <aside className="cp__callout">
              <h3>{copy.ilias.title}</h3>
              <p>{copy.ilias.body}</p>
              <a
                className="link link--arrow"
                href={ILIAS_COURSE_URL}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="link__label">{copy.ilias.linkLabel}</span>
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </aside>
          </section>

          <section className="cp__section" aria-labelledby="cp-roles">
            <h2 className="cp__section-title" id="cp-roles">
              {copy.roles.title}
            </h2>
            <p className="cp__note">{copy.roles.intro}</p>

            {/* Tabbable so the table stays reachable by keyboard once it scrolls. */}
            <div className="cp__tablewrap" role="region" aria-labelledby="cp-roles" tabIndex={0}>
              <table className="cp__table">
                <caption>{copy.roles.caption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{copy.roles.head.role}</th>
                    <th scope="col">{copy.roles.head.task}</th>
                    <th scope="col">{copy.roles.head.cp}</th>
                  </tr>
                </thead>
                <tbody>
                  {copy.roles.rows.map((row) => (
                    <tr key={row.role}>
                      <th className="cp__role" scope="row">
                        {row.role}
                      </th>
                      <td className="cp__task">{row.task}</td>
                      <td className="cp__cp tnum">{row.cp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="cp__rules cp__table-notes">
              {copy.roles.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>

            <aside className="cp__callout">
              <h3>{copy.roles.callout.title}</h3>
              <p>{copy.roles.callout.body}</p>
            </aside>
          </section>

          <section className="cp__section" aria-labelledby="cp-formalities">
            <h2 className="cp__section-title" id="cp-formalities">
              {copy.formalities.title}
            </h2>
            <dl className="cp__facts">
              {copy.formalities.facts.map((fact) => (
                <div className="cp__fact" key={fact.term}>
                  <dt>{fact.term}</dt>
                  <dd>{fact.detail}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="cp__sidebar" aria-labelledby="cp-links">
          <div className="cp__sidebar-panel">
            <h2 id="cp-links">{copy.links.title}</h2>
            <ul>
              {copy.links.items.map((item) => (
                <li key={item.href}>
                  <a className="link" href={item.href} rel="noopener noreferrer" target="_blank">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section className="cp__help" aria-labelledby="cp-help">
        <h2 id="cp-help">{copy.help.title}</h2>
        <p>{copy.help.body}</p>
        <a className="btn btn--secondary" href={`mailto:${kontakt.mail}`}>
          {copy.help.cta}
        </a>
      </section>

      <footer className="cp__source">
        <p>{copy.source}</p>
      </footer>
    </article>
  );
}
