import type { MetadataRoute } from "next";
import { site } from "@/config";

const paths = ["", "/en", "/impressum", "/en/impressum", "/datenschutz", "/en/datenschutz"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${site}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" || path === "/en" ? 1 : 0.3,
  }));
}
