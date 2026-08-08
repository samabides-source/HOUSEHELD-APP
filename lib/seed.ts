import { STORE, getOne, putMany, putValue } from "./db";
import type { Tag, TagCategory } from "./types";
import { newId, nowIso } from "./utils";

/**
 * Vordefinierte Tags gemäss PRD 5.4 (32 Stück). Nach dem Seeding sind sie ganz
 * normale Tags – sie können umbenannt und gelöscht werden und haben keine
 * Sonderrechte.
 */
export const PREDEFINED_TAGS: Array<{ name: string; category: TagCategory }> = [
  { name: "Küche", category: "raum" },
  { name: "Wohnzimmer", category: "raum" },
  { name: "Schlafzimmer", category: "raum" },
  { name: "Bad EG", category: "raum" },
  { name: "Bad OG", category: "raum" },
  { name: "Kinderzimmer 1", category: "raum" },
  { name: "Kinderzimmer 2", category: "raum" },
  { name: "Büro", category: "raum" },
  { name: "Keller", category: "raum" },
  { name: "Garage", category: "raum" },
  { name: "Reduit", category: "raum" },

  { name: "Garten", category: "aussen" },
  { name: "Terrasse", category: "aussen" },
  { name: "Balkon OG", category: "aussen" },

  { name: "Reparatur", category: "typ" },
  { name: "Reinigung", category: "typ" },
  { name: "Einkauf", category: "typ" },
  { name: "Wartung", category: "typ" },
  { name: "Entsorgung", category: "typ" },
  { name: "Organisation", category: "typ" },
  { name: "Pflanzenpflege", category: "typ" },
  { name: "Wäsche", category: "typ" },
  { name: "Möbel", category: "typ" },

  { name: "Elektro", category: "technik" },
  { name: "Sanitär/Wasser", category: "technik" },
  { name: "Heizung", category: "technik" },
  { name: "Geräte/Elektronik", category: "technik" },

  { name: "Termine/Verwaltung", category: "sonstiges" },
  { name: "Kinder", category: "sonstiges" },
  { name: "Tiere", category: "sonstiges" },
  { name: "Sonstiges", category: "sonstiges" },
];

const SEED_KEY = "seedVersion";
const SEED_VERSION = 1;

/**
 * Legt die vordefinierten Tags genau einmal an. Ist die Markierung in `meta`
 * gesetzt, laufen spätere Starts ohne Seeding – gelöschte Tags kommen also
 * nicht zurück.
 */
export async function seedIfNeeded(): Promise<Tag[]> {
  const seeded = await getOne<number>(STORE.meta, SEED_KEY);
  if (seeded === SEED_VERSION) return [];

  const createdAt = nowIso();
  const tags: Tag[] = PREDEFINED_TAGS.map((entry) => ({
    id: newId(),
    name: entry.name,
    category: entry.category,
    createdAt,
  }));

  await putMany(STORE.tags, tags);
  await putValue(STORE.meta, SEED_VERSION, SEED_KEY);
  return tags;
}

/** Erlaubt erneutes Seeding, z. B. nach einem Reset in den Einstellungen. */
export async function resetSeedMarker(): Promise<void> {
  await putValue(STORE.meta, 0, SEED_KEY);
}
