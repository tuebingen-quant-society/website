/**
 * The global stylesheet, in cascade order — tokens first, then the components
 * that build on them.
 *
 * It sits in its own module because there is more than one root layout (one per
 * language, so each can set <html lang> correctly) and both need exactly this
 * list, in exactly this order.
 *
 * Self-hosted fonts, no Google Fonts CDN (Spec §11).
 */
import "@fontsource-variable/newsreader";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@/styles/fonts.css";
import "@/styles/global.css";
import "@/styles/header.css";
import "@/styles/footer.css";
import "@/styles/home.css";
import "@/styles/market-background.css";
import "@/styles/signature-plot.css";
import "@/styles/ticker.css";
import "@/styles/legal.css";
import "@/styles/members.css";
import "@/styles/credit-points.css";
import "@/styles/articles.css";
