"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/Button";
import { PersonAvatar } from "@/components/Chips";
import { ConfirmButton } from "@/components/ConfirmButton";
import { useStore } from "@/lib/store";

export default function PersonsPage() {
  const { persons, tasks, createPerson, renamePerson, deletePerson } = useStore();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length === 0) return;
    await createPerson(name);
    setName("");
  };

  const startEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditingName(current);
  };

  const saveEdit = async () => {
    if (!editingId || editingName.trim().length === 0) {
      setEditingId(null);
      return;
    }
    await renamePerson(editingId, editingName);
    setEditingId(null);
  };

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-extrabold tracking-tight">Personen</h1>
        <p className="mt-1 text-sm text-slate-500">
          Haushaltsmitglieder verwalten. Wird eine Person gelöscht, bleiben ihre Aufgaben bestehen
          und gelten danach als „nicht zugewiesen“.
        </p>
      </section>

      <form
        onSubmit={handleCreate}
        className="flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70"
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name, z. B. Mira"
          className="min-w-48 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
          aria-label="Name der neuen Person"
        />
        <Button type="submit" variant="primary" disabled={name.trim().length === 0}>
          Person hinzufügen
        </Button>
      </form>

      {persons.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center text-sm text-slate-500">
          Noch keine Personen erfasst.
        </p>
      ) : (
        <ul className="space-y-2">
          {persons.map((person) => {
            const assigned = tasks.filter((task) => task.assigneeIds.includes(person.id));
            const openCount = assigned.filter((task) => task.status !== "erledigt").length;

            return (
              <li
                key={person.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70"
              >
                {editingId === person.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") saveEdit();
                        if (event.key === "Escape") setEditingId(null);
                      }}
                      className="min-w-40 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                      aria-label={`Name von ${person.name} ändern`}
                      autoFocus
                    />
                    <Button type="button" variant="primary" size="sm" onClick={saveEdit}>
                      Speichern
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Abbrechen
                    </Button>
                  </>
                ) : (
                  <>
                    <PersonAvatar person={person} size="md" decorative />
                    <div className="flex-1">
                      <p className="font-semibold">{person.name}</p>
                      <p className="text-xs text-slate-500">
                        {assigned.length} zugewiesene Aufgaben · {openCount} noch nicht erledigt
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => startEdit(person.id, person.name)}
                    >
                      Umbenennen
                    </Button>
                    <ConfirmButton
                      label="Löschen"
                      confirmLabel="Person wirklich löschen?"
                      onConfirm={() => deletePerson(person.id)}
                    />
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
