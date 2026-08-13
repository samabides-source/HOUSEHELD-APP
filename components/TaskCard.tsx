"use client";

import { useState } from "react";

import { useLocale, useT } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";
import { PRIORITY_STYLE } from "@/lib/theme";
import { STATUSES, type Photo, type Status, type Task } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { EmptyAvatar, PersonAvatar, PriorityPill, TagChip } from "./Chips";
import { ConfirmButton } from "./ConfirmButton";
import { Modal } from "./Modal";
import { PhotoImage, PhotoStrip } from "./Photos";

export function TaskCard({
  task,
  onEdit,
  compact = false,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  compact?: boolean;
}) {
  const { personById, tagById, photosForTask, updateTask, deleteTask } = useStore();
  const t = useT();
  const locale = useLocale();
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  const persons = task.assigneeIds.map(personById).filter((person) => person !== undefined);
  const tags = task.tagIds.map(tagById).filter((tag) => tag !== undefined);
  const photos = photosForTask(task.id);
  const photoAlt = t.photos.altText(task.title);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md",
        task.status === "erledigt" && "opacity-75",
      )}
    >
      {/* Prioritätsstreifen – eigenes Farbsystem, klar getrennt von Tag-Farben */}
      <span className={cn("absolute inset-y-0 left-0 w-1.5", PRIORITY_STYLE[task.priority].stripe)} />

      <div className="space-y-3 py-4 pl-5 pr-4">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="text-left text-base font-bold leading-snug hover:text-indigo-700"
          >
            {task.title}
          </button>
          <PriorityPill priority={task.priority} />
        </div>

        {task.description && !compact && (
          <p className="line-clamp-3 text-sm text-slate-600">{task.description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
          </div>
        )}

        {photos.length > 0 && (
          <PhotoStrip photos={photos} max={compact ? 3 : 4} onSelect={setPreviewPhoto} alt={photoAlt} />
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            {persons.length > 0 ? (
              <span className="flex -space-x-1.5">
                {persons.map((person) => (
                  <PersonAvatar key={person.id} person={person} />
                ))}
              </span>
            ) : (
              <>
                <EmptyAvatar />
                <span>{t.common.unassigned}</span>
              </>
            )}
          </span>

          {task.dueDate ? (
            <span>{t.taskCard.due(formatDate(task.dueDate, locale))}</span>
          ) : (
            <span>{t.taskCard.created(formatDate(task.createdAt, locale))}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <span className="sr-only sm:not-sr-only">{t.common.status}</span>
            <select
              value={task.status}
              onChange={(event) => updateTask(task.id, { status: event.target.value as Status })}
              className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus:border-indigo-500"
              aria-label={t.taskCard.statusAriaLabel(task.title)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t.labels.status[status]}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              {t.common.edit}
            </button>
            <ConfirmButton
              label={t.common.delete}
              confirmLabel={t.common.deleteConfirmFinal}
              onConfirm={() => deleteTask(task.id)}
            />
          </div>
        </div>
      </div>

      <Modal
        open={previewPhoto !== null}
        title={previewPhoto?.fileName ?? t.common.photoFallbackTitle}
        onClose={() => setPreviewPhoto(null)}
      >
        {previewPhoto && (
          <PhotoImage
            photo={previewPhoto}
            className="max-h-[70vh] w-full rounded-2xl"
            imageClassName="object-contain"
            alt={photoAlt}
          />
        )}
      </Modal>
    </article>
  );
}
