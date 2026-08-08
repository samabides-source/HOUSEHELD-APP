"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/personen", label: "Personen" },
  { href: "/tags", label: "Tags" },
  { href: "/einstellungen", label: "Einstellungen" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { ready, error } = useStore();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-indigo-600 text-lg text-white">
              🏠
            </span>
            <span className="text-xl font-extrabold tracking-tight">Hausheld</span>
          </Link>

          <nav className="scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto px-1">
            <Link
              href="/"
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-base font-extrabold transition",
                pathname === "/"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
              )}
            >
              Aufgaben
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
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error ? (
          <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 ring-1 ring-red-200">
            <p className="font-semibold">Lokaler Speicher nicht verfügbar</p>
            <p className="mt-1">{error}</p>
            <p className="mt-1">
              Hausheld speichert alle Daten im Browser (IndexedDB). Im privaten Modus oder bei
              blockiertem Speicher funktioniert die App nicht.
            </p>
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

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs text-slate-400">
        Hausheld · Übungsprojekt · Daten werden ausschliesslich lokal im Browser gespeichert.
      </footer>
    </div>
  );
}
