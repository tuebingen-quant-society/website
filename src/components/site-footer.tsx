import { kontakt, wortmarke } from "@/config";
import { content, localePath, type Locale } from "@/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__cols">
          <div className="footer__col">
            <p className="footer__mark">{wortmarke.lang}</p>
            <p className="footer__einzeiler">{t.footer.einzeiler}</p>
          </div>
          <div className="footer__col">
            <a className="footer__link" href={`mailto:${kontakt.mail}`}>
              {kontakt.mail}
            </a>
          </div>
          <div className="footer__col footer__col--socials">
            <a className="footer__link" href={kontakt.instagram} rel="me noopener">
              Instagram
            </a>
            <a className="footer__link" href={kontakt.linkedin} rel="me noopener">
              LinkedIn
            </a>
          </div>
        </div>

        <div className="footer__unterzeile">
          <span>© {new Date().getFullYear()} {wortmarke.lang}</span>
          <span aria-hidden="true">·</span>
          <a className="footer__link" href={localePath(locale, "impressum")}>
            {t.footer.impressumLabel}
          </a>
          <span aria-hidden="true">·</span>
          <a className="footer__link" href={localePath(locale, "datenschutz")}>
            {t.footer.datenschutzLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}
