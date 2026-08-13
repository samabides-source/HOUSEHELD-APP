import type { MetadataRoute } from "next";

const SITE_URL = "https://househeld-app.vercel.app";
const PATHS = ["", "/personen", "/tags", "/einstellungen"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    alternates: {
      languages: {
        de: `${SITE_URL}${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
  }));
}
