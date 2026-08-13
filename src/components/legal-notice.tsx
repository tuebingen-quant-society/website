import { impressum, kontakt, wortmarke } from "@/config";
import { localePath, type Locale } from "@/i18n";

export function LegalNotice({ locale }: { locale: Locale }) {
  if (locale === "en") {
    return (
      <LegalSection title="Legal notice">
        <p className="legal__hinweis">
          This is a convenience translation. The legally binding version is the{" "}
          <a className="link" href={localePath("de", "impressum")}>
            German legal notice
          </a>.
        </p>
        <p>
          {wortmarke.lang}<br />
          A student initiative at the University of Tübingen<br />
          {impressum.land}
        </p>
        <Heading>Contact</Heading>
        <Contact />
        <Heading>Liability for content</Heading>
        <p>
          As a service provider, we are responsible for our own content on these pages
          under the general laws. We are not obliged to monitor transmitted or stored
          third-party information, or to investigate circumstances that indicate unlawful
          activity.
        </p>
        <Heading>Liability for links</Heading>
        <p>
          Our offering contains links to external third-party websites whose content we
          have no influence over. The respective provider or operator of the linked pages
          is always responsible for their content.
        </p>
        <Heading>Note on the University of Tübingen</Heading>
        <p>
          The {wortmarke.lang} is a student initiative at the University of Tübingen. It is
          not a body of the university, and the university is not responsible for its content.
        </p>
      </LegalSection>
    );
  }

  return (
    <LegalSection title="Impressum">
      <p>
        {wortmarke.lang}<br />
        Studentische Initiative an der Universität Tübingen<br />
        {impressum.land}
      </p>
      <Heading>Kontakt</Heading>
      <Contact />
      <Heading>Haftung für Inhalte</Heading>
      <p>
        Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den
        allgemeinen Gesetzen verantwortlich. Wir sind nicht verpflichtet, übermittelte
        oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
        forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </p>
      <Heading>Haftung für Links</Heading>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
        keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
        Anbieter oder Betreiber verantwortlich.
      </p>
      <Heading>Hinweis zur Universität Tübingen</Heading>
      <p>
        Die {wortmarke.lang} ist eine studentische Initiative an der Universität Tübingen.
        Sie ist kein Organ der Universität, und die Universität ist für ihre Inhalte nicht
        verantwortlich.
      </p>
    </LegalSection>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section" aria-labelledby="legal-headline">
      <div className="section__inner">
        <div className="legal">
          <h1 className="section-headline legal__head" id="legal-headline">{title}</h1>
          <div className="legal__body">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="legal__titel">{children}</h2>;
}

function Contact() {
  return (
    <p>
      <a className="link" href={`mailto:${kontakt.mail}`}>{kontakt.mail}</a>
    </p>
  );
}
