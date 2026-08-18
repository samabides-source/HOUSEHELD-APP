import { STORE, getAll, putMany, putPhoto } from "./db";
import type { Locale } from "./i18n/config";
import { processImageFile } from "./photos";
import type { Person, Photo, Priority, Status, Tag, Task } from "./types";
import { isoDateInDays, newId, normalizeTagName, nowIso } from "./utils";

/**
 * Beispieldaten für den End-to-End-Durchlauf (PRD 10): 6 Personen, 14 Aufgaben,
 * gemischte Tags/Prioritäten/Status. Fotos verwenden – wo eine `photoUrl`
 * hinterlegt ist – ein von Hand kuratiertes, offen lizenziertes Openverse-Bild
 * (keine Live-Suche mehr: die Top-1-Trefferauswahl einer freien Textsuche war
 * zu unzuverlässig, siehe PhotoSpec unten). Schlägt der Abruf fehl (kein Netz,
 * Bild entfernt, Timeout) oder ist keine `photoUrl` gesetzt, fällt die
 * jeweilige Aufgabe auf ein generiertes Farb-Platzhalterbild zurück. Die
 * Daten werden ergänzt, nichts wird überschrieben.
 *
 * Es gibt eine Aufgaben-/Tag-Liste je Sprache; die Tag-Namen in `tags` müssen
 * exakt mit `PREDEFINED_TAGS` (lib/seed.ts) derselben Sprache übereinstimmen,
 * damit sie mit bereits vorhandenen Tags zusammengeführt werden.
 */

interface PhotoSpec {
  /**
   * Link auf den Openverse-Thumbnail-Proxy (`api.openverse.org/v1/images/{id}/thumb/`)
   * eines kuratierten, offen lizenzierten Bilds (CC0/BY/BY-SA, bewusst ohne ND-Klausel,
   * weil die Upload-Pipeline das Bild verkleinert/komprimiert – das zählt lizenzrechtlich
   * als Bearbeitung). Bewusst der Proxy statt der Original-Host-URL (Flickr, WordPress,
   * …): so bleibt der Abruf innerhalb der bestehenden CSP (`connect-src` erlaubt nur
   * `api.openverse.org`), ohne für jeden Bild-Provider eine eigene Domain freizugeben.
   * Fehlt `photoUrl`, wird direkt das Platzhalterbild verwendet.
   */
  photoUrl?: string;
  /** Beschriftung auf dem Platzhalterbild, falls kein Online-Foto verwendet wird. */
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

const DEMO_TASKS_DE: DemoTask[] = [
  {
    title: "Tropfender Wasserhahn im Bad EG",
    description: "Tropft seit Montag durchgehend. Dichtung besorgen und ersetzen.",
    dueInDays: 2,
    priority: "dringend",
    status: "offen",
    assignees: ["Sandro"],
    tags: ["Bad EG", "Reparatur", "Sanitär/Wasser"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/87702f17-2435-408e-b17b-6ffb27df94b6/thumb/",
        label: "Wasserhahn",
        hue: 205,
      },
      { label: "Dichtung", hue: 262 },
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
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/d2fb3ca7-df0e-483b-b14c-927ed5ab8d82/thumb/",
        label: "Waesche",
        hue: 280,
      },
    ],
  },
  {
    title: "Grosseinkauf fürs Wochenende",
    description: "Liste liegt an der Kühlschranktür. Getränke nicht vergessen.",
    dueInDays: 3,
    priority: "mittel",
    status: "offen",
    assignees: ["Mira", "Jonas"],
    tags: ["Einkauf", "Küche"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/50ff8224-1d23-48d9-860f-86dc18259ed7/thumb/",
        label: "Einkauf",
        hue: 35,
      },
    ],
  },
  {
    title: "Heizung entlüften",
    description: "Radiator im Wohnzimmer wird oben nicht warm.",
    dueInDays: 7,
    priority: "niedrig",
    status: "offen",
    assignees: [],
    tags: ["Wohnzimmer", "Heizung", "Wartung"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/e907d624-6e4c-48f1-a9b8-b3066ea88ddb/thumb/",
        label: "Heizung",
        hue: 15,
      },
    ],
  },
  {
    title: "Zimmerpflanzen giessen",
    description: "Balkon OG und Wohnzimmer, ca. alle 4 Tage.",
    dueInDays: 1,
    priority: "niedrig",
    status: "offen",
    assignees: ["Jonas"],
    tags: ["Balkon OG", "Pflanzenpflege"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/6fc3b8c2-183d-4d6e-bf44-d3afa195aa53/thumb/",
        label: "Pflanzen",
        hue: 110,
      },
    ],
  },
  {
    title: "Altglas und Karton entsorgen",
    description: "Sammelstelle ist samstags bis 16 Uhr offen.",
    dueInDays: 5,
    priority: "mittel",
    status: "offen",
    assignees: ["Sandro"],
    tags: ["Garage", "Entsorgung"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/873ca172-fd21-4106-bc28-f169bec41c27/thumb/",
        label: "Altglas",
        hue: 145,
      },
    ],
  },
  {
    title: "Regal im Büro montieren",
    description: "Teile liegen noch verpackt hinter der Tür.",
    dueInDays: null,
    priority: "niedrig",
    status: "offen",
    assignees: [],
    tags: ["Büro", "Möbel"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/7f89daa2-7663-4319-90fb-7822361f646f/thumb/",
        label: "Regal",
        hue: 200,
      },
    ],
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
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/37799140-0427-4c37-a60b-7ec558b91883/thumb/",
        label: "Velo",
        hue: 20,
      },
    ],
  },
  {
    title: "Katzenklo reinigen",
    description: "Am besten jeden zweiten Tag, Streu liegt im Reduit.",
    dueInDays: 0,
    priority: "mittel",
    status: "offen",
    assignees: ["Lea"],
    tags: ["Tiere", "Reinigung"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/f8a4e9ea-c490-4402-9a60-3f8f0234a8d8/thumb/",
        label: "Katzenklo",
        hue: 30,
      },
    ],
  },
  {
    title: "Rasen mähen",
    description: "Vor dem angekündigten Regen am Wochenende noch erledigen.",
    dueInDays: 2,
    priority: "niedrig",
    status: "offen",
    assignees: ["Fabienne"],
    tags: ["Garten", "Pflanzenpflege"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/fb8ee7e1-cc15-43b5-abbc-448e10ba4f7b/thumb/",
        label: "Rasen",
        hue: 100,
      },
    ],
  },
  {
    title: "Waschmaschine reinigen",
    description: "Weisse Wäsche riecht leicht muffig – Leerlauf mit Essig fahren.",
    dueInDays: 6,
    priority: "mittel",
    status: "offen",
    assignees: ["Fabienne"],
    tags: ["Keller", "Reinigung", "Geräte/Elektronik"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/7150c7fd-639b-45b1-8982-fcd694c385f3/thumb/",
        label: "Waschmaschine",
        hue: 210,
      },
    ],
  },
  {
    title: "Lampe im Kinderzimmer 1 austauschen",
    description: "Glühbirne ist durchgebrannt, Ersatz liegt im Keller.",
    dueInDays: 1,
    priority: "dringend",
    status: "offen",
    assignees: ["Noah"],
    tags: ["Kinderzimmer 1", "Elektro", "Reparatur"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/6787a34f-4f0b-4905-b609-4cd236a1e6e2/thumb/",
        label: "Lampe",
        hue: 50,
      },
    ],
  },
  {
    title: "Fenster putzen im Wohnzimmer",
    description: "Aussenseite ist nach dem Sturm ziemlich verschmutzt.",
    dueInDays: 8,
    priority: "niedrig",
    status: "in_arbeit",
    assignees: ["Lea"],
    tags: ["Wohnzimmer", "Reinigung"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/c23a5a32-6272-45e6-a083-414b559aa665/thumb/",
        label: "Fenster",
        hue: 195,
      },
    ],
  },
];

const DEMO_TASKS_EN: DemoTask[] = [
  {
    title: "Dripping faucet in the ground floor bathroom",
    description: "Has been dripping continuously since Monday. Get a replacement washer and fit it.",
    dueInDays: 2,
    priority: "dringend",
    status: "offen",
    assignees: ["Sandro"],
    tags: ["Bathroom (Ground Floor)", "Repair", "Plumbing/Water"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/87702f17-2435-408e-b17b-6ffb27df94b6/thumb/",
        label: "Faucet",
        hue: 205,
      },
      { label: "Washer", hue: 262 },
    ],
  },
  {
    title: "Bring the laundry up from the basement",
    description: "It's been drying in the utility room since last night.",
    dueInDays: 0,
    priority: "mittel",
    status: "in_arbeit",
    assignees: ["Mira"],
    tags: ["Basement", "Laundry"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/d2fb3ca7-df0e-483b-b14c-927ed5ab8d82/thumb/",
        label: "Laundry",
        hue: 280,
      },
    ],
  },
  {
    title: "Big grocery shop for the weekend",
    description: "List is on the fridge door. Don't forget drinks.",
    dueInDays: 3,
    priority: "mittel",
    status: "offen",
    assignees: ["Mira", "Jonas"],
    tags: ["Shopping", "Kitchen"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/50ff8224-1d23-48d9-860f-86dc18259ed7/thumb/",
        label: "Groceries",
        hue: 35,
      },
    ],
  },
  {
    title: "Bleed the radiators",
    description: "The living room radiator isn't heating up at the top.",
    dueInDays: 7,
    priority: "niedrig",
    status: "offen",
    assignees: [],
    tags: ["Living Room", "Heating", "Maintenance"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/e907d624-6e4c-48f1-a9b8-b3066ea88ddb/thumb/",
        label: "Radiator",
        hue: 15,
      },
    ],
  },
  {
    title: "Water the houseplants",
    description: "Balcony and living room, roughly every 4 days.",
    dueInDays: 1,
    priority: "niedrig",
    status: "offen",
    assignees: ["Jonas"],
    tags: ["Balcony (Upper Floor)", "Plant Care"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/6fc3b8c2-183d-4d6e-bf44-d3afa195aa53/thumb/",
        label: "Plants",
        hue: 110,
      },
    ],
  },
  {
    title: "Take glass and cardboard to recycling",
    description: "Collection point is open until 4pm on Saturdays.",
    dueInDays: 5,
    priority: "mittel",
    status: "offen",
    assignees: ["Sandro"],
    tags: ["Garage", "Disposal"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/873ca172-fd21-4106-bc28-f169bec41c27/thumb/",
        label: "Glass recycling",
        hue: 145,
      },
    ],
  },
  {
    title: "Assemble the shelf in the home office",
    description: "Parts are still packed behind the door.",
    dueInDays: null,
    priority: "niedrig",
    status: "offen",
    assignees: [],
    tags: ["Home Office", "Furniture"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/7f89daa2-7663-4319-90fb-7822361f646f/thumb/",
        label: "Shelf",
        hue: 200,
      },
    ],
  },
  {
    title: "Confirm chimney sweep appointment",
    description: "Call back by end of week, letter is on the sideboard.",
    dueInDays: null,
    priority: "mittel",
    status: "erledigt",
    assignees: ["Mira"],
    tags: ["Appointments/Admin"],
  },
  {
    title: "Fix the bike in the garden",
    description: "Rear tire is flat, repair kit is in the garage.",
    dueInDays: 4,
    priority: "mittel",
    status: "offen",
    assignees: ["Noah"],
    tags: ["Garden", "Repair"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/37799140-0427-4c37-a60b-7ec558b91883/thumb/",
        label: "Bike",
        hue: 20,
      },
    ],
  },
  {
    title: "Clean the litter box",
    description: "Best done every other day, litter is in the utility room.",
    dueInDays: 0,
    priority: "mittel",
    status: "offen",
    assignees: ["Lea"],
    tags: ["Pets", "Cleaning"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/f8a4e9ea-c490-4402-9a60-3f8f0234a8d8/thumb/",
        label: "Litter box",
        hue: 30,
      },
    ],
  },
  {
    title: "Mow the lawn",
    description: "Get it done before the forecast rain this weekend.",
    dueInDays: 2,
    priority: "niedrig",
    status: "offen",
    assignees: ["Fabienne"],
    tags: ["Garden", "Plant Care"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/fb8ee7e1-cc15-43b5-abbc-448e10ba4f7b/thumb/",
        label: "Lawn",
        hue: 100,
      },
    ],
  },
  {
    title: "Clean the washing machine",
    description: "Whites smell slightly musty – run an empty cycle with vinegar.",
    dueInDays: 6,
    priority: "mittel",
    status: "offen",
    assignees: ["Fabienne"],
    tags: ["Basement", "Cleaning", "Appliances/Electronics"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/7150c7fd-639b-45b1-8982-fcd694c385f3/thumb/",
        label: "Washing machine",
        hue: 210,
      },
    ],
  },
  {
    title: "Replace the lamp in Kids' Room 1",
    description: "Bulb has blown, spare is in the basement.",
    dueInDays: 1,
    priority: "dringend",
    status: "offen",
    assignees: ["Noah"],
    tags: ["Kids' Room 1", "Electrical", "Repair"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/6787a34f-4f0b-4905-b609-4cd236a1e6e2/thumb/",
        label: "Lamp",
        hue: 50,
      },
    ],
  },
  {
    title: "Clean the living room windows",
    description: "Outside is pretty dirty after the storm.",
    dueInDays: 8,
    priority: "niedrig",
    status: "in_arbeit",
    assignees: ["Lea"],
    tags: ["Living Room", "Cleaning"],
    photos: [
      {
        photoUrl: "https://api.openverse.org/v1/images/c23a5a32-6272-45e6-a083-414b559aa665/thumb/",
        label: "Window",
        hue: 195,
      },
    ],
  },
];

const DEMO_TASKS: Record<Locale, DemoTask[]> = { de: DEMO_TASKS_DE, en: DEMO_TASKS_EN };

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
 * Lädt das für ein Beispielfoto kuratierte Openverse-Bild direkt über seine
 * URL (keine Live-Suche mehr, siehe PhotoSpec). Gibt `null` zurück, wenn der
 * Abruf fehlschlägt oder kein Bild liefert – der Aufrufer fällt dann auf das
 * generierte Platzhalterbild zurück.
 */
async function fetchPinnedPhoto(url: string): Promise<Blob | null> {
  try {
    const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    if (!res.ok) return null;

    const blob = await res.blob();
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
  if (!spec.photoUrl) return null;
  const online = await fetchPinnedPhoto(spec.photoUrl);
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
 * Löst ein Foto auf: fehlt `photoUrl`, direkt das Platzhalterbild; sonst
 * Abruf mit hartem Gesamt-Timeout, sonst ebenfalls Platzhalterbild. Das
 * äussere Timeout ist zusätzlich zum Timeout in `fetchPinnedPhoto` gedacht –
 * falls eine Anfrage aus irgendeinem Grund doch hängen bleibt, darf das nie
 * das ganze Beispieldaten-Laden blockieren.
 */
async function resolvePhoto(spec: PhotoSpec): Promise<ResolvedPhoto> {
  if (!spec.photoUrl) return resolvePhotoPlaceholder(spec);

  const online = await Promise.race([
    resolvePhotoOnline(spec),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), FETCH_TIMEOUT_MS + 1000)),
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

export async function seedDemoData(locale: Locale): Promise<void> {
  const demoTasks = DEMO_TASKS[locale];

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
  for (const demo of demoTasks) {
    for (const name of demo.tags) {
      const key = normalizeTagName(name);
      if (tagByName.has(key)) continue;
      const tag: Tag = { id: newId(), name, category: "sonstiges", createdAt };
      newTags.push(tag);
      tagByName.set(key, tag);
    }
  }

  const tasks: Task[] = demoTasks.map((demo) => ({
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
  const photoRequests = demoTasks.flatMap((demo, taskIndex) =>
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
