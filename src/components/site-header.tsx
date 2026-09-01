"use client";

import { useEffect, useState } from "react";
import { wortmarke } from "@/config";
import { content, localePath, type Locale } from "@/i18n";
import {
  getHeaderAuthState,
  type HeaderAuthState,
} from "@/lib/header-auth";
import { SignInGlyph } from "./sign-in-glyph";

type SiteHeaderProps = {
  locale: Locale;
  logicalPath?: string;
};

export function SiteHeader({ locale, logicalPath = "" }: SiteHeaderProps) {
  const t = content[locale];
  const localeHome = localePath(locale);
  const onHome = logicalPath === "";
  const anchorBase = onHome ? "" : localeHome;
  const [authState, setAuthState] = useState<HeaderAuthState>("indeterminate");

  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;
    const sync = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  useEffect(() => {
    let active = true;
    void getHeaderAuthState().then((state) => {
      if (active) setAuthState(state);
    });
    return () => {
      active = false;
    };
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
          {t.nav.map((item) => {
            /* Anchors point back at the home page from anywhere; page entries
               resolve to the current language's route. */
            const isAnchor = item.href.startsWith("#");
            const href = isAnchor
              ? `${anchorBase}${item.href}`
              : localePath(locale, item.href);
            const current =
              !isAnchor &&
              [item.href, item.activeFor].some(
                (route) =>
                  route !== undefined &&
                  (logicalPath === route || logicalPath.startsWith(`${route}/`)),
              );

            return (
              <a
                className="header__link"
                href={href}
                aria-current={current ? "page" : undefined}
                key={item.href}
              >
                {item.label}
              </a>
            );
          })}
          {authState === "unauthenticated" ? (
            <a
              className="btn btn--secondary header__cta"
              href={localePath(locale, "members")}
            >
              <SignInGlyph />
              {t.loginCta.label}
            </a>
          ) : null}

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
