"use client";

import { useMemo, useState } from "react";

import { EMPTY_FILTERS, UNASSIGNED, toggleValue, type Filters, type SortKey } from "@/lib/filters";
import { useT } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";
import { TAG_CATEGORY_STYLE } from "@/lib/theme";
import { PRIORITIES, STATUSES, TAG_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

function FilterChip({
  active,
  onClick,
  className,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium transition",
        active
          ? (className ?? "bg-indigo-600 text-white")
          : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-100",
      )}
    >
      {children}
    </button>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

/**
 * Filter gemäss PRD 5.5: innerhalb einer Kategorie ODER, zwischen den
 * Kategorien UND.
 */
export function FilterBar({
  filters,
  onChange,
  sort,
  onSortChange,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}) {
  const { persons, tags } = useStore();
  const t = useT();
  const [showAllTags, setShowAllTags] = useState(false);

  const tagsByCategory = useMemo(() => {
    return TAG_CATEGORIES.map((category) => ({
      category,
      entries: tags
        .filter((tag) => tag.category === category)
        .sort((a, b) => a.name.localeCompare(b.name, "de-CH")),
    })).filter((group) => group.entries.length > 0);
  }, [tags]);

  const active =
    filters.personIds.length +
    filters.tagIds.length +
    filters.statuses.length +
    filters.priorities.length +
    (filters.search.trim() ? 1 : 0);

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder={t.filterBar.searchPlaceholder}
          className="min-w-48 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
          aria-label={t.filterBar.searchAriaLabel}
        />

        <label className="flex items-center gap-2 text-xs text-slate-500">
          {t.filterBar.sortLabel}
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortKey)}
            className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="dueDate">{t.filterBar.sortDueDate}</option>
            <option value="createdAt">{t.filterBar.sortCreatedAt}</option>
          </select>
        </label>

        {active > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...EMPTY_FILTERS })}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
          >
            {t.filterBar.resetFilters(active)}
          </button>
        )}
      </div>

      <Section label={t.filterBar.sectionStatus}>
        {STATUSES.map((status) => (
          <FilterChip
            key={status}
            active={filters.statuses.includes(status)}
            onClick={() => onChange({ ...filters, statuses: toggleValue(filters.statuses, status) })}
          >
            {t.labels.status[status]}
          </FilterChip>
        ))}
      </Section>

      <Section label={t.filterBar.sectionPriority}>
        {PRIORITIES.map((priority) => (
          <FilterChip
            key={priority}
            active={filters.priorities.includes(priority)}
            onClick={() =>
              onChange({ ...filters, priorities: toggleValue(filters.priorities, priority) })
            }
            className={
              priority === "dringend"
                ? "bg-red-600 text-white"
                : priority === "mittel"
                  ? "bg-amber-500 text-white"
                  : "bg-slate-500 text-white"
            }
          >
            {t.labels.priority[priority]}
          </FilterChip>
        ))}
      </Section>

      <Section label={t.filterBar.sectionPerson}>
        {persons.map((person) => (
          <FilterChip
            key={person.id}
            active={filters.personIds.includes(person.id)}
            onClick={() =>
              onChange({ ...filters, personIds: toggleValue(filters.personIds, person.id) })
            }
          >
            {person.name}
          </FilterChip>
        ))}
        <FilterChip
          active={filters.personIds.includes(UNASSIGNED)}
          onClick={() =>
            onChange({ ...filters, personIds: toggleValue(filters.personIds, UNASSIGNED) })
          }
        >
          {t.common.unassigned}
        </FilterChip>
      </Section>

      <div className="space-y-2">
        <div className={cn("space-y-2 overflow-hidden", !showAllTags && "max-h-24")}>
          {tagsByCategory.map((group) => (
            <Section key={group.category} label={t.labels.tagCategory[group.category]}>
              {group.entries.map((tag) => (
                <FilterChip
                  key={tag.id}
                  active={filters.tagIds.includes(tag.id)}
                  onClick={() => onChange({ ...filters, tagIds: toggleValue(filters.tagIds, tag.id) })}
                  className={TAG_CATEGORY_STYLE[tag.category].chip}
                >
                  {tag.name}
                </FilterChip>
              ))}
            </Section>
          ))}
        </div>

        {tagsByCategory.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAllTags((value) => !value)}
            className="text-xs font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
          >
            {showAllTags ? t.filterBar.collapseTags : t.filterBar.showAllTags}
          </button>
        )}
      </div>
    </section>
  );
}
