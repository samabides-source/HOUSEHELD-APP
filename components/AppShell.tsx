"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { LOCALES, localeHref, type Locale } from "@/lib/i18n/config";
import { useLocale, useT } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const LOCALE_LABEL: Record<Locale, string> = { de: "DE", en: "EN" };

function stripLocalePrefix(pathname: string, locale: Locale): string {
  if (locale === "de") return pathname;
  const prefix = `/${locale}`;
  if (pathname === prefix) return "/";
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}

function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useT();
  const currentPath = stripLocalePrefix(pathname, locale);

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 p-0.5"
      role="group"
      aria-label={t.languageSwitcher.ariaLabel}
    >
      {LOCALES.map((value) => (
        <Link
          key={value}
          href={localeHref(value, currentPath)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold transition",
            value === locale ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800",
          )}
          aria-current={value === locale ? "true" : undefined}
        >
          {LOCALE_LABEL[value]}
        </Link>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useT();
  const { ready, error } = useStore();

  const NAV = [
    { href: localeHref(locale, "/personen"), label: t.nav.persons },
    { href: localeHref(locale, "/tags"), label: t.nav.tags },
    { href: localeHref(locale, "/einstellungen"), label: t.nav.settings },
  ];
  const homeHref = localeHref(locale, "/");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={homeHref} className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-indigo-600 text-lg text-white">
              🏠
            </span>
            <span className="text-xl font-extrabold tracking-tight">{t.nav.brand}</span>
          </Link>

          <nav className="scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto px-1">
            <Link
              href={homeHref}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-base font-extrabold transition",
                pathname === homeHref
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
              )}
            >
              {t.nav.tasks}
            </Link>

            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition",
                    active ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error ? (
          <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 ring-1 ring-red-200">
            <p className="font-semibold">{t.appShell.storageErrorTitle}</p>
            <p className="mt-1">{error}</p>
            <p className="mt-1">{t.appShell.storageErrorHint}</p>
          </div>
        ) : !ready ? (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded-2xl bg-white" />
            <div className="h-40 animate-pulse rounded-2xl bg-white" />
          </div>
        ) : (
          children
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs text-slate-400">{t.appShell.footer}</footer>
    </div>
  );
}
