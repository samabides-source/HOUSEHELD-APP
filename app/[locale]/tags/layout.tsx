import type { Metadata } from "next";

import { localeHref, resolveLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

const PATH = "/tags";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  return {
    title: dict.pages.tags.title,
    description: dict.pages.tags.description,
    alternates: {
      canonical: localeHref(locale, PATH),
      languages: { de: PATH, en: `/en${PATH}`, "x-default": PATH },
    },
  };
}

export default function TagsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
