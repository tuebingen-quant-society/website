import { datenschutz, kontakt } from "@/config";
import { localePath, type Locale } from "@/i18n";

export function PrivacyPolicy({ locale }: { locale: Locale }) {
  return locale === "de" ? <GermanPolicy /> : <EnglishPolicy />;
}

function GermanPolicy() {
  return (
    <PolicySection title="Datenschutzerklärung">
      <Heading>Verantwortlicher</Heading>
      <Contact />
      <Heading>Hosting und Server-Logs</Heading>
      <p>
        Diese Website wird bei {datenschutz.hoster} gehostet. Beim Abruf verarbeitet der
        Hoster technisch notwendige Verbindungsdaten. Grundlage ist unser berechtigtes
        Interesse an einem sicheren und stabilen Betrieb (Art. 6 Abs. 1 lit. f DSGVO).
        Wir selbst führen diese Logs nicht mit anderen Daten zusammen.
      </p>
      <Heading>Hochschul-Login und Cookies</Heading>
      <p>
        Wenn du ausdrücklich den Hochschul-Login verwendest, verarbeitet unser
        SAML-Dienst die von der Universität übermittelten Anmeldeattribute. Wir fragen nur
        eine pseudonyme Kennung, deine E-Mail-Adresse und deine Hochschulzugehörigkeit an.
        Für die sichere Anmeldung setzen wir kurzlebige, technisch notwendige
        HttpOnly-Cookies; sie werden weder für Tracking noch für Werbung verwendet.
      </p>
      <Heading>Mailingliste</Heading>
      <p>
        Die Anmeldung zur Mailingliste ist derzeit deaktiviert. Sobald sie aktiviert wird,
        erfolgt sie per Double Opt-in. Die Datenschutzerklärung wird davor um Anbieter,
        Auftragsverarbeitung und Speicherdauer ergänzt.
      </p>
      <Heading>Reichweitenmessung</Heading>
      <p>Wir setzen derzeit keine Analyse- oder Tracking-Werkzeuge ein.</p>
      <Heading>Deine Rechte</Heading>
      <p>
        Du hast insbesondere Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung,
        Datenübertragbarkeit und Widerspruch nach Art. 15–21 DSGVO. Wende dich dafür an die
        oben genannte Adresse. Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde
        beschweren.
      </p>
    </PolicySection>
  );
}

function EnglishPolicy() {
  return (
    <PolicySection title="Privacy policy">
      <p className="hinweis">
        This is a convenience translation. The legally binding version is the{" "}
        <a className="link" href={localePath("de", "datenschutz")}>
          German privacy policy
        </a>.
      </p>
      <Heading>Controller</Heading>
      <Contact />
      <Heading>Hosting and server logs</Heading>
      <p>
        This website is hosted by {datenschutz.hoster}. The host processes technically
        necessary connection data when the site is accessed. The basis is our legitimate
        interest in a secure and stable operation (Art. 6(1)(f) GDPR). We do not combine
        these logs with other data.
      </p>
      <Heading>University login and cookies</Heading>
      <p>
        If you explicitly use the university login, our SAML service processes the login
        attributes supplied by the university. We request only a pseudonymous identifier,
        your email address, and your university affiliation. Short-lived, technically
        necessary HttpOnly cookies secure the login; they are not used for tracking or ads.
      </p>
      <Heading>Mailing list</Heading>
      <p>
        Mailing-list registration is currently disabled. Before it is enabled, it will use
        double opt-in and this policy will name the provider, processing agreement, and
        retention period.
      </p>
      <Heading>Analytics</Heading>
      <p>We currently use no analytics or tracking tools.</p>
      <Heading>Your rights</Heading>
      <p>
        You have the rights to access, rectification, erasure, restriction, portability,
        and objection under Articles 15–21 GDPR. Contact the address above to exercise them.
        You may also lodge a complaint with a data-protection supervisory authority.
      </p>
    </PolicySection>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section" aria-labelledby="privacy-headline">
      <div className="section__inner">
        <div className="prose">
          <h1 className="section-headline" id="privacy-headline">{title}</h1>
          <div className="body">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="h3">{children}</h2>;
}

function Contact() {
  return (
    <p>
      <a className="link" href={`mailto:${kontakt.mail}`}>{kontakt.mail}</a>
    </p>
  );
}
