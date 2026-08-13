import { STORE, getOne, putMany, putValue } from "./db";
import type { Locale } from "./i18n/config";
import type { Tag, TagCategory } from "./types";
import { newId, nowIso } from "./utils";

/**
 * Vordefinierte Tags gemäss PRD 5.4 (32 Stück), je Sprache. Nach dem Seeding
 * sind sie ganz normale Tags – sie können umbenannt und gelöscht werden und
 * haben keine Sonderrechte. Welche Sprachversion angelegt wird, hängt davon
 * ab, in welcher Sprache die App beim ersten Start geöffnet wurde; einmal
 * gespeicherte Tag-Namen werden bei einem späteren Sprachwechsel nicht
 * nachträglich übersetzt (sie sind ab dann normale Nutzdaten).
 */
type SeedTag = { name: string; category: TagCategory };

const PREDEFINED_TAGS_DE: SeedTag[] = [
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

const PREDEFINED_TAGS_EN: SeedTag[] = [
  { name: "Kitchen", category: "raum" },
  { name: "Living Room", category: "raum" },
  { name: "Bedroom", category: "raum" },
  { name: "Bathroom (Ground Floor)", category: "raum" },
  { name: "Bathroom (Upper Floor)", category: "raum" },
  { name: "Kids' Room 1", category: "raum" },
  { name: "Kids' Room 2", category: "raum" },
  { name: "Home Office", category: "raum" },
  { name: "Basement", category: "raum" },
  { name: "Garage", category: "raum" },
  { name: "Utility Room", category: "raum" },

  { name: "Garden", category: "aussen" },
  { name: "Patio", category: "aussen" },
  { name: "Balcony (Upper Floor)", category: "aussen" },

  { name: "Repair", category: "typ" },
  { name: "Cleaning", category: "typ" },
  { name: "Shopping", category: "typ" },
  { name: "Maintenance", category: "typ" },
  { name: "Disposal", category: "typ" },
  { name: "Organizing", category: "typ" },
  { name: "Plant Care", category: "typ" },
  { name: "Laundry", category: "typ" },
  { name: "Furniture", category: "typ" },

  { name: "Electrical", category: "technik" },
  { name: "Plumbing/Water", category: "technik" },
  { name: "Heating", category: "technik" },
  { name: "Appliances/Electronics", category: "technik" },

  { name: "Appointments/Admin", category: "sonstiges" },
  { name: "Kids", category: "sonstiges" },
  { name: "Pets", category: "sonstiges" },
  { name: "Other", category: "sonstiges" },
];

export const PREDEFINED_TAGS: Record<Locale, SeedTag[]> = {
  de: PREDEFINED_TAGS_DE,
  en: PREDEFINED_TAGS_EN,
};

const SEED_KEY = "seedVersion";
const SEED_VERSION = 1;

/**
 * Legt die vordefinierten Tags genau einmal an. Ist die Markierung in `meta`
 * gesetzt, laufen spätere Starts ohne Seeding – gelöschte Tags kommen also
 * nicht zurück.
 */
export async function seedIfNeeded(locale: Locale): Promise<Tag[]> {
  const seeded = await getOne<number>(STORE.meta, SEED_KEY);
  if (seeded === SEED_VERSION) return [];

  const createdAt = nowIso();
  const tags: Tag[] = PREDEFINED_TAGS[locale].map((entry) => ({
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
