"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { ConfirmButton } from "@/components/ConfirmButton";
import { useT } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { tasks, persons, tags, photos, loadDemoData, resetEverything } = useStore();
  const t = useT();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (label: string, action: () => Promise<void>) => {
    setBusy(label);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-extrabold tracking-tight">{t.settings.heading}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.settings.description}</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-4">
        {[
          { label: t.settings.statTasks, value: tasks.length },
          { label: t.settings.statPersons, value: persons.length },
          { label: t.settings.statTags, value: tags.length },
          { label: t.settings.statPhotos, value: photos.length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200/70"
          >
            <p className="text-2xl font-extrabold">{stat.value}</p>
            <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
        <h2 className="text-lg font-bold">{t.settings.demoHeading}</h2>
        <p className="text-sm text-slate-600">{t.settings.demoDescription}</p>
        <Button
          type="button"
          variant="primary"
          disabled={busy !== null}
          onClick={() => run("demo", loadDemoData)}
        >
          {busy === "demo" ? t.settings.demoLoading : t.settings.demoButton}
        </Button>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-red-200">
        <h2 className="text-lg font-bold text-red-700">{t.settings.resetHeading}</h2>
        <p className="text-sm text-slate-600">{t.settings.resetDescription}</p>
        <ConfirmButton
          label={t.settings.resetButton}
          confirmLabel={t.settings.resetConfirm}
          size="md"
          onConfirm={() => run("reset", resetEverything)}
        />
      </section>
    </div>
  );
}
