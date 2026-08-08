import { STORE, getAll, putMany, putPhoto } from "./db";
import { processImageFile } from "./photos";
import type { Person, Photo, Priority, Status, Tag, Task } from "./types";
import { isoDateInDays, newId, normalizeTagName, nowIso } from "./utils";

/**
 * Beispieldaten für den End-to-End-Durchlauf (PRD 10): 6 Personen, 14 Aufgaben,
 * gemischte Tags/Prioritäten/Status. Fotos werden – wo ein Suchbegriff hinterlegt
 * ist – über die kostenlose, keyless Openverse-Bildersuche geladen; schlägt das
 * fehl (kein Netz, keine Treffer, Rate-Limit), fällt die jeweilige Aufgabe auf
 * ein generiertes Farb-Platzhalterbild zurück. Die Daten werden ergänzt, nichts
 * wird überschrieben.
 */

interface PhotoSpec {
  /** Suchbegriff für die Online-Bildersuche (Englisch liefert bessere Treffer). */
  query: string;
  /** Beschriftung auf dem Platzhalterbild, falls kein Online-Foto gefunden wird. */
  label: string;
  hue: number;
}

interface DemoTask {
  title: string;
  description: string;
  dueInDays: number | null;
  priority: Priority;
  status: Status;
  assignees: string[];
  tags: string[];
  photos?: PhotoSpec[];
}

const DEMO_PERSONS = ["Sandro", "Mira", "Jonas", "Lea", "Noah", "Fabienne"];

const DEMO_TASKS: DemoTask[] = [
  {
    title: "Tropfender Wasserhahn im Bad EG",
    description: "Tropft seit Montag durchgehend. Dichtung besorgen und ersetzen.",
    dueInDays: 2,
    priority: "dringend",
    status: "offen",
    assignees: ["Sandro"],
    tags: ["Bad EG", "Reparatur", "Sanitär/Wasser"],
    photos: [
      { query: "leaking faucet dripping tap", label: "Wasserhahn", hue: 205 },
      { query: "rubber washer plumbing seal", label: "Dichtung", hue: 262 },
    ],
  },
  {
    title: "Wäsche aus dem Keller holen",
    description: "Trocknet seit gestern Abend im Reduit.",
    dueInDays: 0,
    priority: "mittel",
    status: "in_arbeit",
    assignees: ["Mira"],
    tags: ["Keller", "Wäsche"],
    photos: [{ query: "laundry basket folded clothes", label: "Waesche", hue: 280 }],
  },
  {
    title: "Grosseinkauf fürs Wochenende",
    description: "Liste liegt an der Kühlschranktür. Getränke nicht vergessen.",
    dueInDays: 3,
    priority: "mittel",
    status: "offen",
    assignees: ["Mira", "Jonas"],
    tags: ["Einkauf", "Küche"],
    photos: [{ query: "grocery shopping paper bags", label: "Einkauf", hue: 35 }],
  },
  {
    title: "Heizung entlüften",
    description: "Radiator im Wohnzimmer wird oben nicht warm.",
    dueInDays: 7,
    priority: "niedrig",
    status: "offen",
    assignees: [],
    tags: ["Wohnzimmer", "Heizung", "Wartung"],
    photos: [{ query: "radiator heater bleed valve", label: "Heizung", hue: 15 }],
  },
  {
    title: "Zimmerpflanzen giessen",
    description: "Balkon OG und Wohnzimmer, ca. alle 4 Tage.",
    dueInDays: 1,
    priority: "niedrig",
    status: "offen",
    assignees: ["Jonas"],
    tags: ["Balkon OG", "Pflanzenpflege"],
    photos: [{ query: "watering can houseplant", label: "Pflanzen", hue: 110 }],
  },
  {
    title: "Altglas und Karton entsorgen",
    description: "Sammelstelle ist samstags bis 16 Uhr offen.",
    dueInDays: 5,
    priority: "mittel",
    status: "offen",
    assignees: ["Sandro"],
    tags: ["Garage", "Entsorgung"],
    photos: [{ query: "glass bottle recycling bin", label: "Altglas", hue: 145 }],
  },
  {
    title: "Regal im Büro montieren",
    description: "Teile liegen noch verpackt hinter der Tür.",
    dueInDays: null,
    priority: "niedrig",
    status: "offen",
    assignees: [],
    tags: ["Büro", "Möbel"],
    photos: [{ query: "flat pack shelf assembly furniture", label: "Regal", hue: 200 }],
  },
  {
    title: "Termin Kaminfeger bestätigen",
    description: "Rückruf bis Ende Woche, Brief liegt auf dem Sideboard.",
    dueInDays: null,
    priority: "mittel",
    status: "erledigt",
    assignees: ["Mira"],
    tags: ["Termine/Verwaltung"],
  },
  {
    title: "Velo im Garten reparieren",
    description: "Hinterreifen ist platt, Flickzeug liegt in der Garage.",
    dueInDays: 4,
    priority: "mittel",
    status: "offen",
    assignees: ["Noah"],
    tags: ["Garten", "Reparatur"],
    photos: [{ query: "bicycle tire repair", label: "Velo", hue: 20 }],
  },
  {
    title: "Katzenklo reinigen",
    description: "Am besten jeden zweiten Tag, Streu liegt im Reduit.",
    dueInDays: 0,
    priority: "mittel",
    status: "offen",
    assignees: ["Lea"],
    tags: ["Tiere", "Reinigung"],
    photos: [{ query: "cat litter box", label: "Katzenklo", hue: 30 }],
  },
  {
    title: "Rasen mähen",
    description: "Vor dem angekündigten Regen am Wochenende noch erledigen.",
    dueInDays: 2,
    priority: "niedrig",
    status: "offen",
    assignees: ["Fabienne"],
    tags: ["Garten", "Pflanzenpflege"],
    photos: [{ query: "lawn mower mowing grass", label: "Rasen", hue: 100 }],
  },
  {
    title: "Waschmaschine reinigen",
    description: "Weisse Wäsche riecht leicht muffig – Leerlauf mit Essig fahren.",
    dueInDays: 6,
    priority: "mittel",
    status: "offen",
    assignees: ["Fabienne"],
    tags: ["Keller", "Reinigung", "Geräte/Elektronik"],
    photos: [{ query: "washing machine laundry room", label: "Waschmaschine", hue: 210 }],
  },
  {
    title: "Lampe im Kinderzimmer 1 austauschen",
    description: "Glühbirne ist durchgebrannt, Ersatz liegt im Keller.",
    dueInDays: 1,
    priority: "dringend",
    status: "offen",
    assignees: ["Noah"],
    tags: ["Kinderzimmer 1", "Elektro", "Reparatur"],
    photos: [{ query: "light bulb ceiling lamp", label: "Lampe", hue: 50 }],
  },
  {
    title: "Fenster putzen im Wohnzimmer",
    description: "Aussenseite ist nach dem Sturm ziemlich verschmutzt.",
    dueInDays: 8,
    priority: "niedrig",
    status: "in_arbeit",
    assignees: ["Lea"],
    tags: ["Wohnzimmer", "Reinigung"],
    photos: [{ query: "window cleaning squeegee", label: "Fenster", hue: 195 }],
  },
];

const OPENVERSE_SEARCH_URL = "https://api.openverse.org/v1/images/";
const FETCH_TIMEOUT_MS = 5000;

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sucht ein thematisch passendes, offen lizenziertes Foto über die
 * Openverse-API (kostenlos, ohne API-Key). Gibt `null` zurück, wenn die Suche
 * fehlschlägt, nichts findet oder das Bild nicht geladen werden kann – der
 * Aufrufer fällt dann auf das generierte Platzhalterbild zurück.
 */
async function fetchStockPhoto(query: string): Promise<Blob | null> {
  try {
    const searchUrl = `${OPENVERSE_SEARCH_URL}?q=${encodeURIComponent(query)}&page_size=1&mature=false`;
    const searchRes = await fetchWithTimeout(searchUrl, FETCH_TIMEOUT_MS);
    if (!searchRes.ok) return null;

    const data = (await searchRes.json()) as { results?: Array<{ url?: string; thumbnail?: string }> };
    const result = data.results?.[0];
    const imageUrl = result?.thumbnail ?? result?.url;
    if (!imageUrl) return null;

    const imageRes = await fetchWithTimeout(imageUrl, FETCH_TIMEOUT_MS);
    if (!imageRes.ok) return null;

    const blob = await imageRes.blob();
    return blob.size > 0 && blob.type.startsWith("image/") ? blob : null;
  } catch {
    return null;
  }
}

/** Erzeugt ein einfaches farbiges Platzhalterbild (kein externes Asset nötig). */
async function createPlaceholderImage(label: string, hue: number): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, `hsl(${hue} 70% 78%)`);
  gradient.addColorStop(1, `hsl(${(hue + 40) % 360} 65% 58%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "bold 56px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, canvas.width / 2, canvas.height / 2);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.8));
}

interface ResolvedPhoto {
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
}

/** Lädt ein Online-Symbolbild und komprimiert es über dieselbe Pipeline wie echte Uploads. */
async function resolvePhotoOnline(spec: PhotoSpec): Promise<ResolvedPhoto | null> {
  const online = await fetchStockPhoto(spec.query);
  if (!online) return null;

  try {
    const file = new File([online], `${spec.label}.jpg`, { type: online.type || "image/jpeg" });
    const processed = await processImageFile(file);
    return { blob: processed.blob, mimeType: processed.mimeType, width: processed.width, height: processed.height };
  } catch {
    return null;
  }
}

async function resolvePhotoPlaceholder(spec: PhotoSpec): Promise<ResolvedPhoto> {
  const placeholder = await createPlaceholderImage(spec.label, spec.hue);
  return {
    blob: placeholder ?? new Blob(),
    mimeType: placeholder?.type || "image/webp",
    width: 800,
    height: 600,
  };
}

/**
 * Löst ein Foto auf: Online-Suche mit hartem Gesamt-Timeout, sonst
 * Platzhalterbild. Das äussere Timeout ist zusätzlich zu den Timeouts in
 * `fetchStockPhoto` gedacht – falls eine Anfrage aus irgendeinem Grund doch
 * hängen bleibt, darf das nie das ganze Beispieldaten-Laden blockieren.
 */
async function resolvePhoto(spec: PhotoSpec): Promise<ResolvedPhoto> {
  const online = await Promise.race([
    resolvePhotoOnline(spec),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), FETCH_TIMEOUT_MS * 2 + 1000)),
  ]);
  return online ?? resolvePhotoPlaceholder(spec);
}

/** Führt asynchrone Aufgaben mit begrenzter Parallelität aus (schont die Foto-API). */
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function seedDemoData(): Promise<void> {
  const [existingPersons, existingTags] = await Promise.all([
    getAll<Person>(STORE.persons),
    getAll<Tag>(STORE.tags),
  ]);

  const createdAt = nowIso();

  const personByName = new Map(existingPersons.map((p) => [p.name.toLocaleLowerCase("de-CH"), p]));
  const newPersons: Person[] = [];
  for (const name of DEMO_PERSONS) {
    if (personByName.has(name.toLocaleLowerCase("de-CH"))) continue;
    const person: Person = { id: newId(), name, createdAt };
    newPersons.push(person);
    personByName.set(name.toLocaleLowerCase("de-CH"), person);
  }

  const tagByName = new Map(existingTags.map((t) => [normalizeTagName(t.name), t]));
  const newTags: Tag[] = [];
  for (const demo of DEMO_TASKS) {
    for (const name of demo.tags) {
      const key = normalizeTagName(name);
      if (tagByName.has(key)) continue;
      const tag: Tag = { id: newId(), name, category: "sonstiges", createdAt };
      newTags.push(tag);
      tagByName.set(key, tag);
    }
  }

  const tasks: Task[] = DEMO_TASKS.map((demo) => ({
    id: newId(),
    title: demo.title,
    description: demo.description,
    createdAt,
    dueDate: demo.dueInDays === null ? null : isoDateInDays(demo.dueInDays),
    priority: demo.priority,
    status: demo.status,
    assigneeIds: demo.assignees
      .map((name) => personByName.get(name.toLocaleLowerCase("de-CH"))?.id)
      .filter((id): id is string => Boolean(id)),
    tagIds: demo.tags
      .map((name) => tagByName.get(normalizeTagName(name))?.id)
      .filter((id): id is string => Boolean(id)),
  }));

  // Bildanfragen mit begrenzter Parallelität auflösen: schnell genug, aber
  // ohne die Foto-API mit 14+ gleichzeitigen Anfragen zu überlasten.
  const photoRequests = DEMO_TASKS.flatMap((demo, taskIndex) =>
    (demo.photos ?? []).map((spec, sortIndex) => ({ taskId: tasks[taskIndex].id, spec, sortIndex })),
  );

  const photoJobs = await mapWithConcurrency(
    photoRequests,
    3,
    async ({ taskId, spec, sortIndex }) => {
      const resolved = await resolvePhoto(spec);
      const photo: Photo = {
        id: newId(),
        taskId,
        fileName: `${spec.label.toLocaleLowerCase("de-CH")}.webp`,
        mimeType: resolved.mimeType,
        size: resolved.blob.size,
        width: resolved.width,
        height: resolved.height,
        createdAt,
        sortIndex,
      };
      return { photo, blob: resolved.blob };
    },
  );

  await putMany(STORE.persons, newPersons);
  await putMany(STORE.tags, newTags);
  await putMany(STORE.tasks, tasks);
  for (const job of photoJobs) {
    if (job.blob.size > 0) await putPhoto(job.photo, job.blob);
  }
}
