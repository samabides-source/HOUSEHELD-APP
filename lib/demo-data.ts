import { STORE, getAll, putMany, putPhoto } from "./db";
import type { Person, Photo, Priority, Status, Tag, Task } from "./types";
import { isoDateInDays, newId, normalizeTagName, nowIso } from "./utils";

/**
 * Beispieldaten für den End-to-End-Durchlauf (PRD 10): 3 Personen, 8 Aufgaben,
 * gemischte Tags/Prioritäten/Status und zwei generierte Platzhalter-Fotos.
 * Die Daten werden ergänzt, nichts wird überschrieben.
 */

interface DemoTask {
  title: string;
  description: string;
  dueInDays: number | null;
  priority: Priority;
  status: Status;
  assignees: string[];
  tags: string[];
  photos?: Array<{ label: string; hue: number }>;
}

const DEMO_PERSONS = ["Sandro", "Mira", "Jonas"];

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
      { label: "Wasserhahn", hue: 205 },
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
  },
  {
    title: "Grosseinkauf fürs Wochenende",
    description: "Liste liegt an der Kühlschranktür. Getränke nicht vergessen.",
    dueInDays: 3,
    priority: "mittel",
    status: "offen",
    assignees: ["Mira", "Jonas"],
    tags: ["Einkauf", "Küche"],
  },
  {
    title: "Heizung entlüften",
    description: "Radiator im Wohnzimmer wird oben nicht warm.",
    dueInDays: 7,
    priority: "niedrig",
    status: "offen",
    assignees: [],
    tags: ["Wohnzimmer", "Heizung", "Wartung"],
  },
  {
    title: "Zimmerpflanzen giessen",
    description: "Balkon OG und Wohnzimmer, ca. alle 4 Tage.",
    dueInDays: 1,
    priority: "niedrig",
    status: "offen",
    assignees: ["Jonas"],
    tags: ["Balkon OG", "Pflanzenpflege"],
  },
  {
    title: "Altglas und Karton entsorgen",
    description: "Sammelstelle ist samstags bis 16 Uhr offen.",
    dueInDays: 5,
    priority: "mittel",
    status: "offen",
    assignees: ["Sandro"],
    tags: ["Garage", "Entsorgung"],
    photos: [{ label: "Altglas", hue: 145 }],
  },
  {
    title: "Regal im Büro montieren",
    description: "Teile liegen noch verpackt hinter der Tür.",
    dueInDays: null,
    priority: "niedrig",
    status: "offen",
    assignees: [],
    tags: ["Büro", "Möbel"],
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
];

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

  const tasks: Task[] = [];
  const photoJobs: Array<{ photo: Photo; blob: Blob }> = [];

  for (const demo of DEMO_TASKS) {
    const task: Task = {
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
    };
    tasks.push(task);

    if (!demo.photos) continue;
    let sortIndex = 0;
    for (const spec of demo.photos) {
      const blob = await createPlaceholderImage(spec.label, spec.hue);
      if (!blob) continue;
      photoJobs.push({
        photo: {
          id: newId(),
          taskId: task.id,
          fileName: `${spec.label.toLocaleLowerCase("de-CH")}.webp`,
          mimeType: blob.type || "image/webp",
          size: blob.size,
          width: 800,
          height: 600,
          createdAt,
          sortIndex: sortIndex++,
        },
        blob,
      });
    }
  }

  await putMany(STORE.persons, newPersons);
  await putMany(STORE.tags, newTags);
  await putMany(STORE.tasks, tasks);
  for (const job of photoJobs) await putPhoto(job.photo, job.blob);
}
