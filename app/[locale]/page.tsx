"use client";

import Link from "next/link";

import { TaskWorkspace } from "@/components/TaskWorkspace";
import { localeHref } from "@/lib/i18n/config";
import { useLocale, useT } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";

export default function TasksPage() {
  const { tasks, persons } = useStore();
  const t = useT();
  const locale = useLocale();

  const open = tasks.filter((task) => task.status === "offen").length;
  const inProgress = tasks.filter((task) => task.status === "in_arbeit").length;
  const done = tasks.filter((task) => task.status === "erledigt").length;

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t.home.heading}</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">{t.home.tagline}</p>
          <p className="mt-1 text-sm text-slate-600">{t.home.summary(open, inProgress, done)}</p>
        </div>
        {persons.length === 0 && (
          <p className="rounded-2xl bg-amber-50 px-4 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
            {t.home.onboardingPrefix}
            <Link href={localeHref(locale, "/personen")} className="font-semibold underline underline-offset-2">
              {t.home.onboardingLink}
            </Link>
            {t.home.onboardingSuffix}
          </p>
        )}
      </section>

      <TaskWorkspace tasks={tasks} emptyHint={t.home.emptyHint} />
    </div>
  );
}
