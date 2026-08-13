import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/AppShell";
import { DEFAULT_LOCALE, LOCALES, resolveLocale } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { StoreProvider } from "@/lib/store";
import "../globals.css";

const SITE_URL = "https://househeld-app.vercel.app";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  const localePath = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.pages.tasks.title, template: dict.meta.titleTemplate },
    description: dict.pages.tasks.description,
    alternates: {
      canonical: localePath || "/",
      languages: {
        de: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      title: dict.pages.tasks.title,
      description: dict.pages.tasks.description,
      url: localePath || "/",
      siteName: dict.meta.siteName,
      locale: locale === "de" ? "de_CH" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.pages.tasks.title,
      description: dict.pages.tasks.description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: dict.meta.siteName,
    description: dict.meta.description,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Any (Web)",
    url: `${SITE_URL}${locale === DEFAULT_LOCALE ? "" : `/${locale}`}`,
    inLanguage: locale === "de" ? "de-CH" : "en",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CHF",
    },
  };

  return (
    <html lang={locale === "de" ? "de-CH" : "en"}>
      <body>
        {/* SoftwareApplication-Schema für Answer-/Generative-Engines (AEO/GEO) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <I18nProvider locale={locale}>
          <StoreProvider>
            <AppShell>{children}</AppShell>
          </StoreProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
