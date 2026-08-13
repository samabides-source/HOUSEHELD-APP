import { STORE, getAll, getOne, putMany, putValue } from "./db";
import type { Locale } from "./i18n/config";
import type { Tag, TagCategory } from "./types";
import { newId, normalizeTagName, nowIso } from "./utils";

/**
 * Vordefinierte Tags gemäss PRD 5.4 (31 Stück), als eine Liste mit beiden
 * Sprachvarianten pro Eintrag. Das ist die einzige Quelle für `PREDEFINED_TAGS`
 * (Seeding) UND für `translateKnownTagName()` (Übersetzung beim Sprachwechsel,
 * siehe `lib/store.tsx`): Ein vordefinierter Tag lässt sich anhand seines
 * Namens in jeder Sprache eindeutig demselben Eintrag zuordnen und damit in
 * die jeweils andere Sprache übersetzen. Nach dem Seeding sind es ganz normale
 * Tags – sie können umbenannt und gelöscht werden und haben keine
 * Sonderrechte; werden sie umbenannt, hört die automatische Übersetzung für
 * diesen Tag auf (der neue Name ist kein bekannter vordefinierter Name mehr).
 */
type SeedTagEntry = { category: TagCategory; de: string; en: string };

const PREDEFINED_TAG_ENTRIES: SeedTagEntry[] = [
  { category: "raum", de: "Küche", en: "Kitchen" },
  { category: "raum", de: "Wohnzimmer", en: "Living Room" },
  { category: "raum", de: "Schlafzimmer", en: "Bedroom" },
  { category: "raum", de: "Bad EG", en: "Bathroom (Ground Floor)" },
  { category: "raum", de: "Bad OG", en: "Bathroom (Upper Floor)" },
  { category: "raum", de: "Kinderzimmer 1", en: "Kids' Room 1" },
  { category: "raum", de: "Kinderzimmer 2", en: "Kids' Room 2" },
  { category: "raum", de: "Büro", en: "Home Office" },
  { category: "raum", de: "Keller", en: "Basement" },
  { category: "raum", de: "Garage", en: "Garage" },
  { category: "raum", de: "Reduit", en: "Utility Room" },

  { category: "aussen", de: "Garten", en: "Garden" },
  { category: "aussen", de: "Terrasse", en: "Patio" },
  { category: "aussen", de: "Balkon OG", en: "Balcony (Upper Floor)" },

  { category: "typ", de: "Reparatur", en: "Repair" },
  { category: "typ", de: "Reinigung", en: "Cleaning" },
  { category: "typ", de: "Einkauf", en: "Shopping" },
  { category: "typ", de: "Wartung", en: "Maintenance" },
  { category: "typ", de: "Entsorgung", en: "Disposal" },
  { category: "typ", de: "Organisation", en: "Organizing" },
  { category: "typ", de: "Pflanzenpflege", en: "Plant Care" },
  { category: "typ", de: "Wäsche", en: "Laundry" },
  { category: "typ", de: "Möbel", en: "Furniture" },

  { category: "technik", de: "Elektro", en: "Electrical" },
  { category: "technik", de: "Sanitär/Wasser", en: "Plumbing/Water" },
  { category: "technik", de: "Heizung", en: "Heating" },
  { category: "technik", de: "Geräte/Elektronik", en: "Appliances/Electronics" },

  { category: "sonstiges", de: "Termine/Verwaltung", en: "Appointments/Admin" },
  { category: "sonstiges", de: "Kinder", en: "Kids" },
  { category: "sonstiges", de: "Tiere", en: "Pets" },
  { category: "sonstiges", de: "Sonstiges", en: "Other" },
];

type SeedTag = { name: string; category: TagCategory };

export const PREDEFINED_TAGS: Record<Locale, SeedTag[]> = {
  de: PREDEFINED_TAG_ENTRIES.map((entry) => ({ name: entry.de, category: entry.category })),
  en: PREDEFINED_TAG_ENTRIES.map((entry) => ({ name: entry.en, category: entry.category })),
};

const TRANSLATION_LOOKUP = new Map<string, SeedTagEntry>();
for (const entry of PREDEFINED_TAG_ENTRIES) {
  TRANSLATION_LOOKUP.set(normalizeTagName(entry.de), entry);
  TRANSLATION_LOOKUP.set(normalizeTagName(entry.en), entry);
}

/**
 * Übersetzt einen Tag-Namen in die Zielsprache, sofern er (noch) exakt einem
 * vordefinierten Tag entspricht – unabhängig davon, in welcher der beiden
 * Sprachen er aktuell vorliegt. Gibt `null` zurück, wenn der Name nicht
 * bekannt ist (z. B. ein selbst erstellter Tag) oder bereits in der
 * Zielsprache vorliegt – dann bleibt der Name unverändert.
 */
export function translateKnownTagName(name: string, targetLocale: Locale): string | null {
  const entry = TRANSLATION_LOOKUP.get(normalizeTagName(name));
  if (!entry) return null;
  const translated = entry[targetLocale];
  return translated === name ? null : translated;
}

const LAST_LOCALE_KEY = "lastLocale";

/**
 * Übersetzt beim Sprachwechsel alle vorhandenen Tags, die (noch) exakt einem
 * vordefinierten Tag-Namen entsprechen (z. B. „Küche“ → „Kitchen“), damit sie
 * in Filtern/Board weiterhin korrekt einsortiert werden. Selbst erstellte Tags
 * sowie Aufgaben-Titel/-Beschreibungen lassen sich ohne externen
 * Übersetzungsdienst nicht automatisch übersetzen und bleiben unverändert.
 *
 * Die zuletzt aktive Sprache wird in `meta` gemerkt (nicht im React-State),
 * damit die Erkennung auch über volle Seitenaufrufe/Bookmarks hinweg
 * funktioniert – Next.js kann den Client-Zustand des Locale-Layouts beim
 * Sprachwechsel neu mounten, ein React-`useRef` würde diesen Wechsel also
 * nicht zuverlässig erkennen.
 */
export async function reconcileTagLanguage(locale: Locale): Promise<void> {
  const lastLocale = await getOne<Locale>(STORE.meta, LAST_LOCALE_KEY);

  if (lastLocale === undefined) {
    await putValue(STORE.meta, locale, LAST_LOCALE_KEY);
    return;
  }
  if (lastLocale === locale) return;

  const tags = await getAll<Tag>(STORE.tags);
  for (const tag of tags) {
    const translated = translateKnownTagName(tag.name, locale);
    if (!translated) continue;
    const collision = tags.some(
      (other) => other.id !== tag.id && normalizeTagName(other.name) === normalizeTagName(translated),
    );
    if (!collision) await putValue(STORE.tags, { ...tag, name: translated });
  }

  await putValue(STORE.meta, locale, LAST_LOCALE_KEY);
}

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
