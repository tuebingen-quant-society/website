import type { ReactNode } from "react";
import { content, type Locale } from "@/i18n";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type PageFrameProps = {
  children: ReactNode;
  locale: Locale;
  logicalPath?: string;
};

export function PageFrame({ children, locale, logicalPath = "" }: PageFrameProps) {
  return (
    <>
      <a className="skip-link" href="#main">
        {content[locale].skipLink}
      </a>
      <SiteHeader locale={locale} logicalPath={logicalPath} />
      <main id="main">{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
