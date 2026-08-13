"use client";

import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/Button";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Modal } from "@/components/Modal";
import { useT } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";
import { TAG_CATEGORY_STYLE } from "@/lib/theme";
import { TAG_CATEGORIES, type Tag, type TagCategory } from "@/lib/types";
import { cn, normalizeTagName } from "@/lib/utils";

const FIELD =
  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500";

export default function TagsPage() {
  const { tags, createTag, updateTag, deleteTag, tasksUsingTag } = useStore();
  const t = useT();

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
      setHint(t.tags.duplicateHint(duplicate.name));
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
      setHint(t.tags.duplicateHint(duplicate.name));
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
        <h1 className="text-2xl font-extrabold tracking-tight">{t.tags.heading}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.tags.description}</p>
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
          placeholder={t.tags.namePlaceholder}
          className={cn(FIELD, "min-w-48 flex-1")}
          aria-label={t.tags.nameAriaLabel}
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as TagCategory)}
          className={FIELD}
          aria-label={t.tags.categoryAriaLabel}
        >
          {TAG_CATEGORIES.map((entry) => (
            <option key={entry} value={entry}>
              {t.labels.tagCategory[entry]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="primary" disabled={name.trim().length === 0}>
          {t.tags.createButton}
        </Button>
        {hint && <p className="w-full text-xs text-amber-700">{hint}</p>}
      </form>

      {grouped.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center text-sm text-slate-500">
          {t.tags.empty}
        </p>
      ) : (
        grouped.map((group) => (
          <section key={group.category} className="space-y-2">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              <span className={cn("size-2 rounded-full", TAG_CATEGORY_STYLE[group.category].dot)} />
              {t.labels.tagCategory[group.category]}
              <span className="font-normal normal-case text-slate-400">({group.entries.length})</span>
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
                          aria-label={t.tags.renameAriaLabel(tag.name)}
                          autoFocus
                        />
                        <Button type="button" size="sm" variant="primary" onClick={saveEdit}>
                          {t.common.save}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          {t.common.cancel}
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
                        <span className="text-xs text-slate-400">{t.tags.usageCount(usage)}</span>

                        <div className="ml-auto flex items-center gap-1">
                          <select
                            value={tag.category}
                            onChange={(event) =>
                              updateTag(tag.id, { category: event.target.value as TagCategory })
                            }
                            className="rounded-full border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-indigo-500"
                            aria-label={t.tags.categoryChangeAriaLabel(tag.name)}
                          >
                            {TAG_CATEGORIES.map((entry) => (
                              <option key={entry} value={entry}>
                                {t.labels.tagCategory[entry]}
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
                            {t.common.rename}
                          </Button>

                          {usage > 0 ? (
                            <Button type="button" size="sm" variant="ghost" onClick={() => setPendingDelete(tag)}>
                              {t.common.delete}
                            </Button>
                          ) : (
                            <ConfirmButton
                              label={t.common.delete}
                              confirmLabel={t.common.deleteConfirm}
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
        title={t.tags.usedWarningTitle}
        onClose={() => setPendingDelete(null)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)}>
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                if (pendingDelete) await deleteTag(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              {t.tags.deleteAnyway}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {t.tags.usedWarningIntro} <strong>{pendingDelete?.name}</strong>
          {t.tags.usedWarningBody(usageOfPending)} {t.tags.usedWarningNote}
        </p>
      </Modal>
    </div>
  );
}
