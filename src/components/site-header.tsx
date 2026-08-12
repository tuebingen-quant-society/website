"use client";

import { useEffect } from "react";
import { wortmarke } from "@/config";
import { content, localePath, type Locale } from "@/i18n";

type SiteHeaderProps = {
  locale: Locale;
  logicalPath?: string;
};

export function SiteHeader({ locale, logicalPath = "" }: SiteHeaderProps) {
  const t = content[locale];
  const localeHome = localePath(locale);
  const onHome = logicalPath === "";
  const anchorBase = onHome ? "" : localeHome;

  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;
    const sync = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  return (
    <header className="header" id="site-header">
      <div className="header__inner">
        <a className="header__mark" href={onHome ? "#top" : localeHome}>
          <svg
            className="header__glyph"
            viewBox="0 0 24 24"
            width="20"
            height="20"
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
          <span className="header__mark-lang">{wortmarke.lang}</span>
          <span className="header__mark-kurz">{wortmarke.kurz}</span>
        </a>

        <nav
          className="header__nav"
          aria-label={locale === "de" ? "Hauptnavigation" : "Main navigation"}
        >
          {t.nav.map((item) => (
            <a className="header__link" href={`${anchorBase}${item.href}`} key={item.href}>
              {item.label}
            </a>
          ))}
          <a
            className="btn btn--primary header__cta"
            href={`${anchorBase}${t.hero.ctaPrimaer.href}`}
          >
            {t.hero.ctaPrimaer.label}
          </a>

          <a className="header__member" href={localePath(locale, "members")}>
            {t.memberLink}
          </a>

          <div className="header__lang" role="group" aria-label={t.langToggle.aria}>
            {(["de", "en"] as const).map((target) => (
              <a
                className={`header__lang-link${target === locale ? " is-active" : ""}`}
                href={localePath(target, logicalPath)}
                hrefLang={target}
                lang={target}
                aria-label={t.langToggle.to[target]}
                aria-current={target === locale ? "true" : undefined}
                key={target}
              >
                {target.toUpperCase()}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
