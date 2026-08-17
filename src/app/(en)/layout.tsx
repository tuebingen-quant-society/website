/**
 * Root layout of the English site, served under "/en". See the German one in
 * src/app/(de)/layout.tsx for why the two exist separately.
 */
import type { ReactNode } from "react";
import { content } from "@/i18n";
import "../global-styles";
import { siteMetadata, siteViewport } from "../site-metadata";

export const metadata = siteMetadata("en");
export const viewport = siteViewport;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={content.en.meta.sprache}>
      <body>{children}</body>
    </html>
  );
}
