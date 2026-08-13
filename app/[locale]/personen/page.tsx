"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/Button";
import { PersonAvatar } from "@/components/Chips";
import { ConfirmButton } from "@/components/ConfirmButton";
import { useT } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";

export default function PersonsPage() {
  const { persons, tasks, createPerson, renamePerson, deletePerson } = useStore();
  const t = useT();
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
        <h1 className="text-2xl font-extrabold tracking-tight">{t.persons.heading}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.persons.description}</p>
      </section>

      <form
        onSubmit={handleCreate}
        className="flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70"
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t.persons.namePlaceholder}
          className="min-w-48 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
          aria-label={t.persons.nameAriaLabel}
        />
        <Button type="submit" variant="primary" disabled={name.trim().length === 0}>
          {t.persons.addPerson}
        </Button>
      </form>

      {persons.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center text-sm text-slate-500">
          {t.persons.empty}
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
                      aria-label={t.persons.renameAriaLabel(person.name)}
                      autoFocus
                    />
                    <Button type="button" variant="primary" size="sm" onClick={saveEdit}>
                      {t.common.save}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      {t.common.cancel}
                    </Button>
                  </>
                ) : (
                  <>
                    <PersonAvatar person={person} size="md" decorative />
                    <div className="flex-1">
                      <p className="font-semibold">{person.name}</p>
                      <p className="text-xs text-slate-500">{t.persons.assignedCount(assigned.length, openCount)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => startEdit(person.id, person.name)}
                    >
                      {t.common.rename}
                    </Button>
                    <ConfirmButton
                      label={t.common.delete}
                      confirmLabel={t.persons.deleteConfirm}
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
