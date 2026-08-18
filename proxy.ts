import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";

/**
 * Deutsch bleibt ohne Präfix (`/`, `/personen`, …) erreichbar – so bleiben
 * bestehende Links/Bookmarks gültig. Englisch liegt explizit unter `/en/…`.
 * Anfragen ohne Locale-Präfix werden intern (unsichtbar für die URL-Leiste)
 * auf `/de/…` umgeschrieben, damit beide Sprachen auf derselben
 * `app/[locale]/…`-Routenstruktur laufen.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocalePrefix = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocalePrefix) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
