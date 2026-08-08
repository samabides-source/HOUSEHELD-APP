import type { Priority, Status, Task } from "./types";

export type SortKey = "dueDate" | "createdAt";

/** Pseudo-Wert für "nicht zugewiesen" im Personen-Filter. */
export const UNASSIGNED = "__unassigned__";

export interface Filters {
  personIds: string[];
  tagIds: string[];
  statuses: Status[];
  priorities: Priority[];
  search: string;
}

export const EMPTY_FILTERS: Filters = {
  personIds: [],
  tagIds: [],
  statuses: [],
  priorities: [],
  search: "",
};

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.personIds.length > 0 ||
    filters.tagIds.length > 0 ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.search.trim().length > 0
  );
}

/**
 * Filterlogik gemäss PRD 5.5: Werte innerhalb einer Kategorie werden mit ODER
 * verknüpft, verschiedene Kategorien mit UND.
 */
export function applyFilters(tasks: Task[], filters: Filters): Task[] {
  const needle = filters.search.trim().toLocaleLowerCase("de-CH");

  return tasks.filter((task) => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) return false;
    if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) return false;

    if (filters.tagIds.length > 0 && !filters.tagIds.some((id) => task.tagIds.includes(id))) {
      return false;
    }

    if (filters.personIds.length > 0) {
      const matches = filters.personIds.some((id) =>
        id === UNASSIGNED ? task.assigneeIds.length === 0 : task.assigneeIds.includes(id),
      );
      if (!matches) return false;
    }

    if (needle) {
      const haystack = `${task.title} ${task.description}`.toLocaleLowerCase("de-CH");
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });
}

/**
 * Sortierung gemäss PRD 5.5. Bei "dueDate": Fälligkeitsdatum aufsteigend,
 * Aufgaben ohne Fälligkeitsdatum danach, dort nach Erstelldatum absteigend.
 */
export function sortTasks(tasks: Task[], key: SortKey): Task[] {
  const sorted = [...tasks];

  if (key === "createdAt") {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted;
  }

  sorted.sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return b.createdAt.localeCompare(a.createdAt);
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return sorted;
}

export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}
