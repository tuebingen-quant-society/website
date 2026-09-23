import { careerFields, employers } from "@/i18n/career-directory";
import {
  beginnerResources,
  studentSocieties,
} from "@/i18n/opportunity-directory";
import {
  directoryCopy,
  roleSearchTerms,
  sharedMethods,
  type DirectoryKind,
} from "@/i18n/public-directory-copy";
import type { Locale } from "@/i18n";
import { PageFrame } from "@/components/page-frame";
import { currentEvents } from "@/lib/opportunity-status";
import { DirectoryStructuredData } from "./public-directory-structured-data";

type PublicDirectoryPageProps = {
  locale: Locale;
  kind: DirectoryKind;
};

export function PublicDirectoryPage({ locale, kind }: PublicDirectoryPageProps) {
  const copy = directoryCopy[locale][kind];

  return (
    <PageFrame locale={locale} logicalPath={kind}>
      <DirectoryStructuredData locale={locale} kind={kind} />
      <header className="directory-hero">
        <div className="directory-hero__inner">
          <p className="directory-eyebrow">TQS / {copy.eyebrow}</p>
          <h1 className="hero-headline">{copy.title}</h1>
          <p className="directory-intro lead">{copy.intro}</p>
          {kind !== "opportunities" && (
            <nav className="directory-jumps" aria-label={locale === "de" ? "Auf dieser Seite" : "On this page"}>
              {([
                ["quant-careers", locale === "de" ? "Karriere" : "Careers"],
                ["quant-fields", locale === "de" ? "Einsatzfelder" : "Fields"],
                ["opportunities", locale === "de" ? "Events & Rätsel" : "Events & puzzles"],
              ] as const).filter(([path]) => path !== kind).map(([path, label]) => (
                <a className="link" href={`/${locale === "en" ? "en/" : ""}${path}`} key={path}>{label}</a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {kind === "quant-careers" && <CareersContent locale={locale} />}
      {kind === "quant-fields" && <FieldsContent locale={locale} />}
      {kind === "opportunities" && <OpportunitiesContent locale={locale} />}
    </PageFrame>
  );
}

function CareersContent({ locale }: { locale: Locale }) {
  const copy = directoryCopy[locale]["quant-careers"];
  const areas = [...new Set(employers.map((firm) => firm.area[locale]))];

  return (
    <section className="section">
      <div className="section__inner">
        <h2 className="section-headline">{copy.sectionTitles[0]}</h2>
        <p className="directory-note">{locale === "de"
          ? "Direkte Links zu den Karriere- und Studierendenseiten der Arbeitgeber. Das sind Beispiele, keine Aussage über aktuell offene Stellen."
          : "Direct links to employer career and student pages. These are examples, not claims about current vacancies."}</p>
        {areas.map((area) => (
          <div className="directory-group" key={area}>
            <h3 className="directory-group__title">{area}</h3>
            <ul className="directory-grid">
              {employers.filter((firm) => firm.area[locale] === area).map((firm) => (
                <li className="directory-card card" key={firm.name}>
                  <a href={firm.href} target="_blank" rel="noopener noreferrer" className="directory-card__title">{firm.name}<span aria-hidden="true"> ↗</span></a>
                  <p className="directory-card__text">{firm.roles[locale]}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="directory-bottom">
          <h2 className="section-headline">{copy.sectionTitles[1]}</h2>
          <p className="directory-note">{locale === "de"
            ? "Rollen heißen je nach Firma und Branche anders. Suche auch nach diesen Begriffen:"
            : "Role names vary between firms and industries. Search for these terms too:"}</p>
          <ul className="directory-tags">{roleSearchTerms[locale].map((term) => <li key={term}>{term}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

function FieldsContent({ locale }: { locale: Locale }) {
  const copy = directoryCopy[locale]["quant-fields"];
  return (
    <section className="section">
      <div className="section__inner">
        <h2 className="section-headline">{copy.sectionTitles[0]}</h2>
        <ul className="directory-grid directory-grid--fields">
          {careerFields.map((field) => (
            <li className="directory-card card" key={field.title.en}>
              <h3 className="directory-card__title">{field.title[locale]}</h3>
              <p className="directory-card__text">{field.summary[locale]}</p>
              <dl className="directory-facts">
                <div><dt>{locale === "de" ? "Fragen" : "Problems"}</dt><dd>{field.work[locale]}</dd></div>
                <div><dt>{locale === "de" ? "Werkzeuge" : "Methods"}</dt><dd>{field.methods[locale]}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
        <div className="directory-bottom">
          <h2 className="section-headline">{copy.sectionTitles[1]}</h2>
          <p className="directory-note">{locale === "de"
            ? "Viele dieser Wege beginnen mit denselben Grundlagen. Je nach Rolle kommen Fachwissen und Domänenkenntnis dazu."
            : "Many of these paths start with the same foundations. Domain knowledge is added depending on the role."}</p>
          <ul className="directory-tags">{sharedMethods[locale].map((method) => <li key={method}>{method}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

function OpportunitiesContent({ locale }: { locale: Locale }) {
  const copy = directoryCopy[locale].opportunities;
  const activeEvents = currentEvents()
    .slice()
    .sort((left, right) => left.activeThrough.localeCompare(right.activeThrough));

  return (
    <>
      <section className="section">
        <div className="section__inner">
          <h2 className="section-headline">{copy.sectionTitles[0]}</h2>
        <p className="directory-note">{locale === "de"
            ? "Die Liste wird regelmäßig aktualisiert und datierte Einträge laufen nach Frist oder Veranstaltung aus. Prüfe Details und Teilnahmebedingungen immer beim Veranstalter."
            : "This list is refreshed regularly and dated entries expire after their deadline or event. Always confirm details and eligibility with the organizer."}</p>
          {activeEvents.length ? (
            <ul className="directory-grid">
              {activeEvents.map((event) => (
                <li className="directory-card card" key={event.name}>
                  <p className="directory-card__meta">{event.kind[locale]} · {event.status === "open"
                    ? (locale === "de" ? "Anmeldung offen" : "Registration open")
                    : (locale === "de" ? "Demnächst" : "Upcoming")}</p>
                  <a href={event.href} target="_blank" rel="noopener noreferrer" className="directory-card__title">{event.name}<span aria-hidden="true"> ↗</span></a>
                  <p className="directory-card__date">{event.dateLabel[locale]}</p>
                  <p className="directory-card__text">{event.audience[locale]}</p>
                  <p className="directory-card__text">{event.details[locale]}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="directory-note">{locale === "de" ? "Gerade sind keine datierten Einträge offen. Schau später wieder vorbei." : "There are no dated listings open right now. Check back later."}</p>
          )}
        </div>
      </section>
      <section className="section section--surface">
        <div className="section__inner">
          <h2 className="section-headline">{copy.sectionTitles[1]}</h2>
          <ul className="directory-grid">
            {beginnerResources.map((resource) => (
              <li className="directory-card card" key={resource.name}>
                <a href={resource.href} target="_blank" rel="noopener noreferrer" className="directory-card__title">{resource.name}<span aria-hidden="true"> ↗</span></a>
                <p className="directory-card__text">{resource.description[locale]}</p>
                <p className="directory-card__meta">{resource.access[locale]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section">
        <div className="section__inner">
          <h2 className="section-headline">{copy.sectionTitles[2]}</h2>
          <p className="directory-note">{locale === "de"
            ? "Einige Formate richten sich nur an Mitglieder der jeweiligen Uni. Öffentliche Wettbewerbe und interne Vereinsaktivitäten sind hier bewusst unterschieden."
            : "Some formats are only for members of the host university. Public competitions and internal society activities are distinguished here."}</p>
          <ul className="directory-grid">
            {studentSocieties.map((society) => (
              <li className="directory-card card" key={society.name}>
                <a href={society.href} target="_blank" rel="noopener noreferrer" className="directory-card__title">{society.name}<span aria-hidden="true"> ↗</span></a>
                <p className="directory-card__meta">{society.university}</p>
                <p className="directory-card__text">{society.format[locale]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
