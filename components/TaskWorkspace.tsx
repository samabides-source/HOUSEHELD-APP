"use client";

import { useMemo, useState } from "react";

import { EMPTY_FILTERS, applyFilters, sortTasks, type Filters, type SortKey } from "@/lib/filters";
import { useT } from "@/lib/i18n/context";
import { STATUS_STYLE } from "@/lib/theme";
import { STATUSES, type Task } from "@/lib/types";
import { useLocalState } from "@/lib/use-local-state";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { FilterBar } from "./FilterBar";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";

type View = "liste" | "board";

const PERSON_FILTER_STORAGE_KEY = "househeld.taskFilters.personIds";

/**
 * Arbeitsfläche für die Aufgaben-Übersicht: Filterleiste, Ansichtswechsel
 * (Liste ist Standard, PRD 5.5) und Dialog. Der Personen-Filter wird lokal
 * gemerkt, damit man beim erneuten Öffnen nicht jedes Mal neu auf sich selbst
 * filtern muss; die übrigen Filter setzen sich pro Sitzung zurück.
 */
export function TaskWorkspace({ tasks, emptyHint }: { tasks: Task[]; emptyHint: string }) {
  const t = useT();
  const [personIds, setPersonIds] = useLocalState<string[]>(PERSON_FILTER_STORAGE_KEY, []);
  const [otherFilters, setOtherFilters] = useState<Omit<Filters, "personIds">>({
    tagIds: EMPTY_FILTERS.tagIds,
    statuses: EMPTY_FILTERS.statuses,
    priorities: EMPTY_FILTERS.priorities,
    search: EMPTY_FILTERS.search,
  });
  const filters: Filters = useMemo(() => ({ ...otherFilters, personIds }), [otherFilters, personIds]);
  const handleFiltersChange = ({ personIds: nextPersonIds, ...rest }: Filters) => {
    setPersonIds(nextPersonIds);
    setOtherFilters(rest);
  };
  const [sort, setSort] = useState<SortKey>("dueDate");
  const [view, setView] = useState<View>("liste");
  const [dialogTask, setDialogTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const visible = useMemo(
    () => sortTasks(applyFilters(tasks, filters), sort),
    [tasks, filters, sort],
  );

  const openNew = () => {
    setDialogTask(null);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setDialogTask(task);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200/70">
          {(["liste", "board"] as View[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                view === value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {value === "liste" ? t.taskWorkspace.viewList : t.taskWorkspace.viewBoard}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600">{t.taskWorkspace.countLabel(visible.length, tasks.length)}</span>
          <Button variant="primary" onClick={openNew}>
            {t.taskWorkspace.newTask}
          </Button>
        </div>
      </div>

      <FilterBar filters={filters} onChange={handleFiltersChange} sort={sort} onSortChange={setSort} />

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center text-sm text-slate-600">
          {tasks.length === 0 ? emptyHint : t.taskWorkspace.emptyFiltered}
        </p>
      ) : view === "liste" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {visible.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={openEdit} />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {STATUSES.map((status) => {
            const column = visible.filter((task) => task.status === status);
            return (
              <section
                key={status}
                className={cn("space-y-3 rounded-2xl border p-3", STATUS_STYLE[status].column)}
              >
                <header className="flex items-center justify-between px-1">
                  <h3 className="flex items-center gap-2 text-sm font-bold">
                    <span className={cn("size-2 rounded-full", STATUS_STYLE[status].dot)} />
                    {t.labels.status[status]}
                  </h3>
                  <span className="text-xs text-slate-600">{column.length}</span>
                </header>
                <div className="space-y-3">
                  {column.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={openEdit} compact />
                  ))}
                  {column.length === 0 && (
                    <p className="px-1 pb-2 text-xs text-slate-600">{t.taskWorkspace.emptyColumn}</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {dialogOpen && <TaskDialog task={dialogTask} onClose={() => setDialogOpen(false)} />}
    </div>
  );
}
