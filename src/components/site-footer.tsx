import { kontakt, wortmarke } from "@/config";
import { content, localePath, type Locale } from "@/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__cols">
          <div className="footer__col footer__col--brand">
            <p className="footer__mark">
              <svg
                className="footer__glyph"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <polyline
                  points="2,17 7,11 10.5,14 16,6.5 21,9.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="21" cy="9.5" r="2.6" fill="currentColor" />
              </svg>
              {wortmarke.lang}
            </p>
            <p className="footer__einzeiler">{t.footer.einzeiler}</p>
          </div>

          <div className="footer__col">
            <h2 className="footer__titel">{t.footer.kontaktLabel}</h2>
            <a className="footer__link" href={`mailto:${kontakt.mail}`}>
              {kontakt.mail}
            </a>
          </div>

          <div className="footer__col">
            <h2 className="footer__titel">{t.footer.folgenLabel}</h2>
            <a className="footer__link" href={kontakt.instagram} rel="me noopener">
              Instagram
            </a>
            <a className="footer__link" href={kontakt.linkedin} rel="me noopener">
              LinkedIn
            </a>
          </div>
        </div>

        <div className="footer__unterzeile">
          <span className="footer__copy">
            © {new Date().getFullYear()} {wortmarke.lang}
          </span>
          <nav className="footer__legal" aria-label={t.footer.impressumLabel}>
            <a className="footer__link" href={localePath(locale, "impressum")}>
              {t.footer.impressumLabel}
            </a>
            <a className="footer__link" href={localePath(locale, "datenschutz")}>
              {t.footer.datenschutzLabel}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
