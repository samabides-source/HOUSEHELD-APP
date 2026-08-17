"use client";

import { useT } from "@/lib/i18n/context";
import { PRIORITY_STYLE, STATUS_STYLE, TAG_CATEGORY_STYLE } from "@/lib/theme";
import type { Person, Priority, Status, Tag } from "@/lib/types";
import { cn, initials, personColor } from "@/lib/utils";

export function TagChip({
  tag,
  onRemove,
  className,
}: {
  tag: Tag;
  onRemove?: () => void;
  className?: string;
}) {
  const t = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        TAG_CATEGORY_STYLE[tag.category].chip,
        className,
      )}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="-my-1.5 -mr-1.5 rounded-full px-1.5 py-1.5 leading-none opacity-60 transition hover:opacity-100"
          aria-label={t.chips.removeTagAriaLabel(tag.name)}
        >
          ×
        </button>
      )}
    </span>
  );
}

export function PriorityPill({ priority }: { priority: Priority }) {
  const t = useT();
  const style = PRIORITY_STYLE[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        style.pill,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {t.labels.priority[priority]}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const t = useT();
  const style = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        style.badge,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {t.labels.status[status]}
    </span>
  );
}

/**
 * Initialen-Kreis mit stabiler Farbe pro Person. `decorative` unterdrückt den
 * Namen für Screenreader – dafür, wenn der Name direkt daneben ohnehin
 * sichtbar ist.
 */
export function PersonAvatar({
  person,
  size = "sm",
  decorative = false,
}: {
  person: Person;
  size?: "sm" | "md";
  decorative?: boolean;
}) {
  const avatar = (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        personColor(person.id),
        size === "sm" ? "size-7 text-[11px]" : "size-10 text-sm",
      )}
      aria-hidden="true"
    >
      {initials(person.name)}
    </span>
  );

  if (decorative) return avatar;

  return (
    <span className="inline-flex" title={person.name}>
      {avatar}
      <span className="sr-only">{person.name}</span>
    </span>
  );
}

export function EmptyAvatar({ label }: { label?: string }) {
  const t = useT();
  const resolvedLabel = label ?? t.common.unassigned;
  return (
    <span
      className="inline-flex size-7 items-center justify-center rounded-full border border-dashed border-slate-300 text-[11px] text-slate-600"
      title={resolvedLabel}
    >
      –
    </span>
  );
}
