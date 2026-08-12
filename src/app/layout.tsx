import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/newsreader";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@/styles/fonts.css";
import "@/styles/global.css";
import "@/styles/header.css";
import "@/styles/footer.css";
import "@/styles/home.css";
import "@/styles/join-form.css";
import "@/styles/market-background.css";
import "@/styles/signature-plot.css";
import "@/styles/ticker.css";
import "@/styles/legal.css";
import "@/styles/members.css";

export const metadata: Metadata = {
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#0a0d12" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
