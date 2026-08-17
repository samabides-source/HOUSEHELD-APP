"use client";

import { useMemo, useState, type FormEvent } from "react";

import { useT } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";
import { TAG_CATEGORY_STYLE } from "@/lib/theme";
import {
  PRIORITIES,
  STATUSES,
  TAG_CATEGORIES,
  type Priority,
  type Status,
  type TagCategory,
  type Task,
} from "@/lib/types";
import { cn, newId, normalizeTagName } from "@/lib/utils";
import { Button } from "./Button";
import { PersonAvatar } from "./Chips";
import { ConfirmButton } from "./ConfirmButton";
import { Modal } from "./Modal";
import { PhotoManager } from "./Photos";

const FIELD =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500";

/**
 * Erfassen und Bearbeiten einer Aufgabe. Für neue Aufgaben wird die ID sofort
 * vergeben, damit Fotos schon vor dem Speichern hochgeladen werden können;
 * beim Abbrechen werden diese Fotos wieder entfernt.
 */
export function TaskDialog({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const store = useStore();
  const t = useT();
  const isNew = task === null;

  const [draftId] = useState(() => task?.id ?? newId());
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "mittel");
  const [status, setStatus] = useState<Status>(task?.status ?? "offen");
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task?.assigneeIds ?? []);
  const [tagIds, setTagIds] = useState<string[]>(task?.tagIds ?? []);
  const [tagQuery, setTagQuery] = useState("");
  const [newTagCategory, setNewTagCategory] = useState<TagCategory>("sonstiges");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const photos = store.photosForTask(draftId);

  const sortedTags = useMemo(
    () => [...store.tags].sort((a, b) => a.name.localeCompare(b.name, "de-CH")),
    [store.tags],
  );

  const filteredTags = useMemo(() => {
    const needle = normalizeTagName(tagQuery);
    if (!needle) return sortedTags;
    return sortedTags.filter((tag) => normalizeTagName(tag.name).includes(needle));
  }, [sortedTags, tagQuery]);

  const canCreateTag =
    tagQuery.trim().length > 0 &&
    !store.tags.some((tag) => normalizeTagName(tag.name) === normalizeTagName(tagQuery));

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];

  const handleCreateTag = async () => {
    const tag = await store.createTag(tagQuery, newTagCategory);
    setTagIds((current) => (current.includes(tag.id) ? current : [...current, tag.id]));
    setTagQuery("");
  };

  const handleCancel = async () => {
    // Fotos einer nie gespeicherten Aufgabe nicht als Waisen zurücklassen.
    if (isNew) await store.removePhotosOfTask(draftId);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (title.trim().length === 0) {
      setError(t.taskDialog.titleRequiredError);
      return;
    }

    setSaving(true);
    const input = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate ? dueDate : null,
      priority,
      status,
      assigneeIds,
      tagIds,
    };

    try {
      if (isNew) {
        await store.createTask(input, draftId);
      } else {
        await store.updateTask(task.id, input);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={isNew ? t.taskDialog.titleNew : t.taskDialog.titleEdit}
      onClose={handleCancel}
      footer={
        <>
          {!isNew && (
            <ConfirmButton
              label={t.taskDialog.deleteTask}
              confirmLabel={t.common.deleteConfirmFinal}
              size="md"
              className="mr-auto"
              onConfirm={async () => {
                await store.deleteTask(task.id);
                onClose();
              }}
            />
          )}
          <Button type="button" variant="secondary" onClick={handleCancel}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form="task-form" variant="primary" disabled={saving}>
            {saving ? t.common.saving : t.common.save}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="task-title" className="mb-1 block text-sm font-semibold">
            {t.taskDialog.titleFieldLabel} <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            className={FIELD}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError(null);
            }}
            placeholder={t.taskDialog.titlePlaceholder}
            autoFocus
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <div>
          <label htmlFor="task-description" className="mb-1 block text-sm font-semibold">
            {t.taskDialog.descriptionLabel}
          </label>
          <textarea
            id="task-description"
            className={cn(FIELD, "min-h-24 resize-y")}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t.taskDialog.descriptionPlaceholder}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="task-due" className="mb-1 block text-sm font-semibold">
              {t.taskDialog.dueDateLabel}
            </label>
            <input
              id="task-due"
              type="date"
              className={FIELD}
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <div>
            <span className="mb-1 block text-sm font-semibold">{t.taskDialog.priorityLabel}</span>
            <div className="flex gap-2">
              {PRIORITIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={cn(
                    "flex-1 rounded-xl border px-2 py-2 text-xs font-semibold transition",
                    priority === value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {t.labels.priority[value]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-semibold">{t.taskDialog.statusLabel}</span>
          <div className="flex gap-2">
            {STATUSES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={cn(
                  "flex-1 rounded-xl border px-2 py-2 text-xs font-semibold transition",
                  status === value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {t.labels.status[value]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">{t.taskDialog.assigneeLabel}</span>
            {assigneeIds.length > 0 && (
              <button
                type="button"
                onClick={() => setAssigneeIds([])}
                className="-mx-1.5 -my-1.5 rounded-md px-1.5 py-1.5 text-xs text-slate-600 underline underline-offset-2 hover:text-slate-800"
              >
                {t.taskDialog.removeAllAssignees}
              </button>
            )}
          </div>
          {store.persons.length === 0 ? (
            <p className="text-xs text-slate-600">{t.taskDialog.noPersonsHint}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {store.persons.map((person) => {
                const active = assigneeIds.includes(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setAssigneeIds((current) => toggle(current, person.id))}
                    className={cn(
                      "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition",
                      active
                        ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <PersonAvatar person={person} decorative />
                    {person.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold">{t.taskDialog.tagsLabel}</span>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              className={cn(FIELD, "sm:max-w-64")}
              value={tagQuery}
              onChange={(event) => setTagQuery(event.target.value)}
              placeholder={t.taskDialog.tagSearchPlaceholder}
            />
            {canCreateTag && (
              <>
                <select
                  className={cn(FIELD, "sm:max-w-44")}
                  value={newTagCategory}
                  onChange={(event) => setNewTagCategory(event.target.value as TagCategory)}
                  aria-label={t.taskDialog.tagCategoryAriaLabel}
                >
                  {TAG_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {t.labels.tagCategory[category]}
                    </option>
                  ))}
                </select>
                <Button type="button" size="sm" variant="primary" onClick={handleCreateTag}>
                  {t.taskDialog.createTagButton(tagQuery.trim())}
                </Button>
              </>
            )}
          </div>

          <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-2xl bg-slate-50 p-3">
            {filteredTags.length === 0 && (
              <p className="text-xs text-slate-600">{t.taskDialog.noMatchingTags}</p>
            )}
            {filteredTags.map((tag) => {
              const active = tagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setTagIds((current) => toggle(current, tag.id))}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium ring-2 ring-offset-1 transition",
                    TAG_CATEGORY_STYLE[tag.category].chip,
                    active ? "ring-indigo-500" : "opacity-60 ring-transparent hover:opacity-100",
                  )}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold">{t.taskDialog.photosLabel}</span>
          <PhotoManager taskId={draftId} photos={photos} taskTitle={title} />
        </div>
      </form>
    </Modal>
  );
}
