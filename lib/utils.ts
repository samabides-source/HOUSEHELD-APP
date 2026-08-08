export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Vergleichsform für Tag-Namen: Gross-/Kleinschreibung und Rand-Leerzeichen
 * werden ignoriert (PRD 5.4).
 */
export function normalizeTagName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("de-CH");
}

const dateFormatter = new Intl.DateTimeFormat("de-CH", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Formatiert ein ISO-Datum (YYYY-MM-DD oder voller Zeitstempel) als TT.MM.JJJJ. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase("de-CH");
  return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase("de-CH");
}

/**
 * Farbpalette für Personen-Avatare – bewusst getrennt vom Tag-Farbsystem
 * (PRD 6). Die Farbe ergibt sich stabil aus der Personen-ID.
 */
export const PERSON_COLORS = [
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-cyan-600",
  "bg-fuchsia-500",
  "bg-lime-600",
  "bg-sky-600",
] as const;

export function personColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PERSON_COLORS[hash % PERSON_COLORS.length];
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Heutiges Datum als YYYY-MM-DD in lokaler Zeitzone. */
export function todayIsoDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** Datum relativ zu heute, als YYYY-MM-DD (für Beispieldaten). */
export function isoDateInDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
