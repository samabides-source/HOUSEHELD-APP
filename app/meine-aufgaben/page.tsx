"use client";

import Link from "next/link";
import { useMemo } from "react";

import { PersonAvatar } from "@/components/Chips";
import { TaskWorkspace } from "@/components/TaskWorkspace";
import { useStore } from "@/lib/store";
import { useLocalState } from "@/lib/use-local-state";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "hausheld.selectedPersonId";

/**
 * „Meine Aufgaben“ pro Person (PRD 5.3). Eine Aufgabe mit mehreren Zuweisungen
 * erscheint bei jeder zugewiesenen Person. Die Auswahl wird lokal im Browser
 * gespeichert.
 */
export default function MyTasksPage() {
  const { persons, tasks } = useStore();
  const [selectedId, setSelectedId] = useLocalState<string | null>(STORAGE_KEY, null);

  const selected = persons.find((person) => person.id === selectedId) ?? null;

  const myTasks = useMemo(
    () => (selected ? tasks.filter((task) => task.assigneeIds.includes(selected.id)) : []),
    [tasks, selected],
  );

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-extrabold tracking-tight">Meine Aufgaben</h1>
        <p className="mt-1 text-sm text-slate-500">
          Person auswählen – die Auswahl bleibt auf diesem Gerät gespeichert.
        </p>
      </section>

      {persons.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center text-sm text-slate-500">
          Noch keine Haushaltsmitglieder erfasst –{" "}
          <Link href="/personen" className="font-semibold text-indigo-600 underline underline-offset-2">
            jetzt anlegen
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {persons.map((person) => {
              const active = person.id === selected?.id;
              const count = tasks.filter(
                (task) => task.assigneeIds.includes(person.id) && task.status !== "erledigt",
              ).length;

              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setSelectedId(person.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-medium transition",
                    active
                      ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <PersonAvatar person={person} decorative />
                  {person.name}
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {selected ? (
            <TaskWorkspace
              tasks={myTasks}
              showPersonFilter={false}
              emptyHint={`${selected.name} hat aktuell keine zugewiesenen Aufgaben.`}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center text-sm text-slate-500">
              Bitte oben eine Person auswählen.
            </p>
          )}
        </>
      )}
    </div>
  );
}
