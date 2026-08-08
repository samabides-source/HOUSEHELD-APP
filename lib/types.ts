export type Priority = "niedrig" | "mittel" | "dringend";
export type Status = "offen" | "in_arbeit" | "erledigt";

/** Farbbereiche gemäss PRD 6 – jede Kategorie hat eine eigene Akzentfarbe. */
export type TagCategory = "raum" | "aussen" | "typ" | "technik" | "sonstiges";

export const PRIORITIES: Priority[] = ["niedrig", "mittel", "dringend"];
export const STATUSES: Status[] = ["offen", "in_arbeit", "erledigt"];
export const TAG_CATEGORIES: TagCategory[] = ["raum", "aussen", "typ", "technik", "sonstiges"];

export const PRIORITY_LABEL: Record<Priority, string> = {
  niedrig: "Niedrig",
  mittel: "Mittel",
  dringend: "Dringend",
};

export const STATUS_LABEL: Record<Status, string> = {
  offen: "Offen",
  in_arbeit: "In Arbeit",
  erledigt: "Erledigt",
};

export const TAG_CATEGORY_LABEL: Record<TagCategory, string> = {
  raum: "Räume",
  aussen: "Aussenbereich",
  typ: "Aufgabentyp",
  technik: "Technik & Geräte",
  sonstiges: "Sonstiges",
};

export interface Person {
  id: string;
  name: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  /** ISO-Datum (YYYY-MM-DD) oder null */
  dueDate: string | null;
  priority: Priority;
  status: Status;
  assigneeIds: string[];
  tagIds: string[];
}

/**
 * Foto-Metadaten. Der eigentliche Binärinhalt liegt getrennt im Store
 * `photoBlobs` (gleicher Schlüssel), damit die Übersicht geladen werden
 * kann, ohne alle Bilddaten in den Speicher zu ziehen.
 */
export interface Photo {
  id: string;
  taskId: string;
  fileName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  createdAt: string;
  sortIndex: number;
}

export type TaskInput = Omit<Task, "id" | "createdAt">;

/** Grenzwerte gemäss PRD 5.2 */
export const MAX_PHOTOS_PER_TASK = 10;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
