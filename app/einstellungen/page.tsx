"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { ConfirmButton } from "@/components/ConfirmButton";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { tasks, persons, tags, photos, loadDemoData, resetEverything } = useStore();
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
        <h1 className="text-2xl font-extrabold tracking-tight">Einstellungen</h1>
        <p className="mt-1 text-sm text-slate-500">
          Übersicht über den lokalen Datenbestand und Werkzeuge zum Ausprobieren.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Aufgaben", value: tasks.length },
          { label: "Personen", value: persons.length },
          { label: "Tags", value: tags.length },
          { label: "Fotos", value: photos.length },
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
        <h2 className="text-lg font-bold">Beispieldaten</h2>
        <p className="text-sm text-slate-600">
          Legt 6 Personen und 14 Aufgaben mit gemischten Tags, Prioritäten und thematisch
          passenden Beispielfotos an – praktisch, um den Ablauf einmal durchzuspielen.
        </p>
        <Button
          type="button"
          variant="primary"
          disabled={busy !== null}
          onClick={() => run("demo", loadDemoData)}
        >
          {busy === "demo" ? "Wird geladen …" : "Beispieldaten laden"}
        </Button>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-red-200">
        <h2 className="text-lg font-bold text-red-700">Alles zurücksetzen</h2>
        <p className="text-sm text-slate-600">
          Löscht sämtliche Aufgaben, Personen, Tags und Fotos endgültig und legt danach die
          vordefinierten Tags neu an. Es gibt keinen Papierkorb.
        </p>
        <ConfirmButton
          label="Alle Daten löschen"
          confirmLabel="Wirklich alles löschen?"
          size="md"
          onConfirm={() => run("reset", resetEverything)}
        />
      </section>
    </div>
  );
}
