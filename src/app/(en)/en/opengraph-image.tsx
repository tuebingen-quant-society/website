import { content } from "@/i18n";
import { siteOgImage } from "@/lib/og/images";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og/theme";

/** The share card for every English route that does not generate its own. */
export const alt = content.en.meta.og.alt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default siteOgImage("en");
