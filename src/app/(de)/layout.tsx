/**
 * Root layout of the German site, served at "/".
 *
 * There are two root layouts, one per language, because only a root layout may
 * render <html> — and <html lang> has to name the language of the page, which a
 * single shared root could not do for both. The (de)/(en) route groups do not
 * appear in any URL; the English tree keeps its "/en" prefix through its own
 * folder inside src/app/(en).
 */
import type { ReactNode } from "react";
import { content } from "@/i18n";
import { themeBootstrapScript } from "@/lib/theme";
import "../global-styles";
import { siteMetadata, siteViewport } from "../site-metadata";

export const metadata = siteMetadata("de");
export const viewport = siteViewport;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={content.de.meta.sprache} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
