"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

const LocaleContext = createContext<Locale | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  const locale = useContext(LocaleContext);
  if (!locale) throw new Error("useLocale muss innerhalb von <I18nProvider> verwendet werden.");
  return locale;
}

export function useT(): Dictionary {
  const locale = useLocale();
  return useMemo(() => getDictionary(locale), [locale]);
}
