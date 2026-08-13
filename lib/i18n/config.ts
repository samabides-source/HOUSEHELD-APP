/** Unterstützte Sprachen. Deutsch bleibt Standard- und Quellsprache (siehe CLAUDE.md). */
export const LOCALES = ["de", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Next tippt `params.locale` in Layouts/Pages als `string` – hier auf `Locale` einengen. */
export function resolveLocale(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Baut einen internen Link für eine Sprache. Deutsch bleibt ohne Präfix
 * (siehe `middleware.ts`), alle anderen Sprachen erhalten `/<locale>` voran.
 */
export function localeHref(locale: Locale, path: string): string {
  const cleanPath = path === "/" ? "" : path;
  return locale === DEFAULT_LOCALE ? cleanPath || "/" : `/${locale}${cleanPath}`;
}
