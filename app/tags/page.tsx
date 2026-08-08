"use client";

import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/Button";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Modal } from "@/components/Modal";
import { useStore } from "@/lib/store";
import { TAG_CATEGORY_STYLE } from "@/lib/theme";
import {
  TAG_CATEGORIES,
  TAG_CATEGORY_LABEL,
  type Tag,
  type TagCategory,
} from "@/lib/types";
import { cn, normalizeTagName } from "@/lib/utils";

const FIELD =
  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500";

export default function TagsPage() {
  const { tags, createTag, updateTag, deleteTag, tasksUsingTag } = useStore();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<TagCategory>("sonstiges");
  const [hint, setHint] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);

  const grouped = useMemo(
    () =>
      TAG_CATEGORIES.map((entry) => ({
        category: entry,
        entries: tags
          .filter((tag) => tag.category === entry)
          .sort((a, b) => a.name.localeCompare(b.name, "de-CH")),
      })).filter((group) => group.entries.length > 0),
    [tags],
  );

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) return;

    const duplicate = tags.find((tag) => normalizeTagName(tag.name) === normalizeTagName(trimmed));
    if (duplicate) {
      setHint(`„${duplicate.name}“ existiert bereits – Tags sind eindeutig.`);
      return;
    }

    await createTag(trimmed, category);
    setName("");
    setHint(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const trimmed = editingName.trim();
    if (trimmed.length === 0) {
      setEditingId(null);
      return;
    }
    const duplicate = tags.find(
      (tag) => tag.id !== editingId && normalizeTagName(tag.name) === normalizeTagName(trimmed),
    );
    if (duplicate) {
      setHint(`„${duplicate.name}“ existiert bereits – Tags sind eindeutig.`);
      return;
    }
    await updateTag(editingId, { name: trimmed });
    setEditingId(null);
    setHint(null);
  };

  const usageOfPending = pendingDelete ? tasksUsingTag(pendingDelete.id) : 0;

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-extrabold tracking-tight">Tags</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tags gelten für die ganze Installation und sind eindeutig (Gross-/Kleinschreibung und
          Leerzeichen am Rand werden ignoriert). Der Farbbereich bestimmt die Chip-Farbe.
        </p>
      </section>

      <form
        onSubmit={handleCreate}
        className="flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70"
      >
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setHint(null);
          }}
          placeholder="Neuer Tag, z. B. Estrich"
          className={cn(FIELD, "min-w-48 flex-1")}
          aria-label="Name des neuen Tags"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as TagCategory)}
          className={FIELD}
          aria-label="Farbbereich"
        >
          {TAG_CATEGORIES.map((entry) => (
            <option key={entry} value={entry}>
              {TAG_CATEGORY_LABEL[entry]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="primary" disabled={name.trim().length === 0}>
          Tag erstellen
        </Button>
        {hint && <p className="w-full text-xs text-amber-700">{hint}</p>}
      </form>

      {grouped.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center text-sm text-slate-500">
          Keine Tags vorhanden.
        </p>
      ) : (
        grouped.map((group) => (
          <section key={group.category} className="space-y-2">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              <span className={cn("size-2 rounded-full", TAG_CATEGORY_STYLE[group.category].dot)} />
              {TAG_CATEGORY_LABEL[group.category]}
              <span className="font-normal normal-case text-slate-400">
                ({group.entries.length})
              </span>
            </h2>

            <ul className="grid gap-2 sm:grid-cols-2">
              {group.entries.map((tag) => {
                const usage = tasksUsingTag(tag.id);

                return (
                  <li
                    key={tag.id}
                    className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70"
                  >
                    {editingId === tag.id ? (
                      <>
                        <input
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") saveEdit();
                            if (event.key === "Escape") setEditingId(null);
                          }}
                          className={cn(FIELD, "min-w-32 flex-1")}
                          aria-label={`Tag ${tag.name} umbenennen`}
                          autoFocus
                        />
                        <Button type="button" size="sm" variant="primary" onClick={saveEdit}>
                          Speichern
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Abbrechen
                        </Button>
                      </>
                    ) : (
                      <>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            TAG_CATEGORY_STYLE[tag.category].chip,
                          )}
                        >
                          {tag.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {usage === 0
                            ? "nicht verwendet"
                            : `${usage} ${usage === 1 ? "Aufgabe" : "Aufgaben"}`}
                        </span>

                        <div className="ml-auto flex items-center gap-1">
                          <select
                            value={tag.category}
                            onChange={(event) =>
                              updateTag(tag.id, { category: event.target.value as TagCategory })
                            }
                            className="rounded-full border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-indigo-500"
                            aria-label={`Farbbereich von ${tag.name}`}
                          >
                            {TAG_CATEGORIES.map((entry) => (
                              <option key={entry} value={entry}>
                                {TAG_CATEGORY_LABEL[entry]}
                              </option>
                            ))}
                          </select>

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(tag.id);
                              setEditingName(tag.name);
                              setHint(null);
                            }}
                          >
                            Umbenennen
                          </Button>

                          {usage > 0 ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setPendingDelete(tag)}
                            >
                              Löschen
                            </Button>
                          ) : (
                            <ConfirmButton
                              label="Löschen"
                              confirmLabel="Wirklich löschen?"
                              onConfirm={() => deleteTag(tag.id)}
                            />
                          )}
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}

      {/* Warnhinweis beim Löschen eines noch verwendeten Tags (PRD 5.4) */}
      <Modal
        open={pendingDelete !== null}
        title="Tag wird noch verwendet"
        onClose={() => setPendingDelete(null)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)}>
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                if (pendingDelete) await deleteTag(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Trotzdem löschen
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Der Tag <strong>{pendingDelete?.name}</strong> wird aktuell von{" "}
          <strong>
            {usageOfPending} {usageOfPending === 1 ? "Aufgabe" : "Aufgaben"}
          </strong>{" "}
          verwendet. Beim Löschen wird er von allen betroffenen Aufgaben entfernt. Die Aufgaben
          selbst bleiben bestehen.
        </p>
      </Modal>
    </div>
  );
}
