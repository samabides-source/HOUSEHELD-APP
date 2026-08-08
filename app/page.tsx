"use client";

import Link from "next/link";

import { TaskWorkspace } from "@/components/TaskWorkspace";
import { useStore } from "@/lib/store";

export default function TasksPage() {
  const { tasks, persons } = useStore();

  const open = tasks.filter((task) => task.status === "offen").length;
  const inProgress = tasks.filter((task) => task.status === "in_arbeit").length;
  const done = tasks.filter((task) => task.status === "erledigt").length;

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Alle Aufgaben</h1>
          <p className="mt-1 text-sm text-slate-500">
            {open} offen · {inProgress} in Arbeit · {done} erledigt
          </p>
        </div>
        {persons.length === 0 && (
          <p className="rounded-2xl bg-amber-50 px-4 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
            Noch keine Haushaltsmitglieder erfasst –{" "}
            <Link href="/personen" className="font-semibold underline underline-offset-2">
              jetzt anlegen
            </Link>
            . Aufgaben lassen sich auch ohne Zuweisung erstellen.
          </p>
        )}
      </section>

      <TaskWorkspace tasks={tasks} emptyHint="Noch keine Aufgaben erfasst – lege die erste an." />
    </div>
  );
}
