import type { Priority, Status, TagCategory } from "./types";

/**
 * Zentrale Stelle für alle bedeutungstragenden Farben (PRD 6).
 * Wichtig: Die Klassennamen stehen als vollständige Literale hier drin, damit
 * der Tailwind-Scanner sie findet – niemals dynamisch zusammensetzen.
 */

export const TAG_CATEGORY_STYLE: Record<TagCategory, { chip: string; dot: string; soft: string }> = {
  raum: {
    chip: "bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200",
    dot: "bg-blue-500",
    soft: "bg-blue-50 text-blue-700",
  },
  aussen: {
    chip: "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200",
    dot: "bg-emerald-500",
    soft: "bg-emerald-50 text-emerald-700",
  },
  typ: {
    chip: "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-200",
    dot: "bg-amber-500",
    soft: "bg-amber-50 text-amber-800",
  },
  technik: {
    chip: "bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200",
    dot: "bg-violet-500",
    soft: "bg-violet-50 text-violet-700",
  },
  sonstiges: {
    chip: "bg-pink-100 text-pink-800 ring-1 ring-inset ring-pink-200",
    dot: "bg-pink-500",
    soft: "bg-pink-50 text-pink-700",
  },
};

/**
 * Prioritäten haben ein eigenes Farbsystem und eine eigene Form
 * (Outline-Pill mit Punkt statt gefülltem Chip), damit sie nicht mit
 * Tag-Chips verwechselt werden.
 */
export const PRIORITY_STYLE: Record<Priority, { pill: string; dot: string; stripe: string }> = {
  niedrig: {
    pill: "border border-slate-300 text-slate-600 bg-white",
    dot: "bg-slate-400",
    stripe: "bg-slate-300",
  },
  mittel: {
    pill: "border border-amber-400 text-amber-700 bg-white",
    dot: "bg-amber-500",
    stripe: "bg-amber-400",
  },
  dringend: {
    pill: "border border-red-400 text-red-700 bg-white",
    dot: "bg-red-500",
    stripe: "bg-red-500",
  },
};

/** Status bleibt bewusst dezent (Graustufen + kleiner Farbpunkt). */
export const STATUS_STYLE: Record<Status, { badge: string; dot: string; column: string }> = {
  offen: {
    badge: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
    column: "border-slate-200 bg-slate-50",
  },
  in_arbeit: {
    badge: "bg-slate-100 text-slate-700",
    dot: "bg-sky-500",
    column: "border-slate-200 bg-slate-50",
  },
  erledigt: {
    badge: "bg-slate-100 text-slate-500",
    dot: "bg-emerald-500",
    column: "border-slate-200 bg-slate-50",
  },
};
