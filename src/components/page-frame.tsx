import type { ReactNode } from "react";
import { content, type Locale } from "@/i18n";
import { siteNodes, type JsonLdNode } from "@/lib/structured-data";
import { JsonLd } from "./json-ld";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type PageFrameProps = {
  children: ReactNode;
  locale: Locale;
  logicalPath?: string;
  /**
   * schema.org nodes this page adds on top of the organisation and the website,
   * which every page carries. See src/lib/structured-data.ts.
   */
  jsonLd?: JsonLdNode[];
};

export function PageFrame({
  children,
  locale,
  logicalPath = "",
  jsonLd = [],
}: PageFrameProps) {
  return (
    <>
      <JsonLd nodes={[...siteNodes(locale), ...jsonLd]} />
      <a className="skip-link" href="#main">
        {content[locale].skipLink}
      </a>
      <SiteHeader locale={locale} logicalPath={logicalPath} />
      <main id="main">{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
