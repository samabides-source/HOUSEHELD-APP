import type { Locale } from "./config";

/**
 * Alle UI-Texte der App an einem Ort. Deutsch (`de`) ist die Quelle; `en` wird
 * über den Typ von `de` typgeprüft, damit keine Übersetzung vergessen geht.
 */
const de = {
  meta: {
    siteName: "Househeld",
    titleDefault: "Househeld – Haushaltsaufgaben im Griff",
    titleTemplate: "%s · Househeld",
    description:
      "Househeld sammelt alle Haushaltsaufgaben an einem Ort: mit Fotos, Zuständigkeiten und Tags. Kostenlos, ohne Konto – alle Daten bleiben lokal im Browser.",
    ogAlt: "Househeld – Haushaltsaufgaben im Griff",
  },
  pages: {
    tasks: {
      title: "Househeld – Haushaltsaufgaben im Griff",
    },
    persons: {
      title: "Personen",
      description: "Haushaltsmitglieder verwalten und Aufgaben zuweisen.",
    },
    tags: {
      title: "Tags",
      description: "Tags nach Räumen, Aufgabentyp und Technik verwalten.",
    },
    settings: {
      title: "Einstellungen",
      description: "Lokalen Datenbestand einsehen, Beispieldaten laden oder alles zurücksetzen.",
    },
  },
  nav: {
    brand: "Househeld",
    tasks: "Aufgaben",
    persons: "Personen",
    tags: "Tags",
    settings: "Einstellungen",
  },
  languageSwitcher: {
    ariaLabel: "Sprache wechseln",
  },
  appShell: {
    storageErrorTitle: "Lokaler Speicher nicht verfügbar",
    storageErrorHint:
      "Househeld speichert alle Daten im Browser (IndexedDB). Im privaten Modus oder bei blockiertem Speicher funktioniert die App nicht.",
    footer: "Househeld · Übungsprojekt · Daten werden ausschliesslich lokal im Browser gespeichert.",
  },
  common: {
    save: "Speichern",
    saving: "Speichern …",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    rename: "Umbenennen",
    delete: "Löschen",
    deleteConfirm: "Wirklich löschen?",
    deleteConfirmFinal: "Endgültig löschen?",
    status: "Status",
    unassigned: "Nicht zugewiesen",
    photoFallbackTitle: "Foto",
  },
  labels: {
    priority: {
      niedrig: "Niedrig",
      mittel: "Mittel",
      dringend: "Dringend",
    },
    status: {
      offen: "Offen",
      in_arbeit: "In Arbeit",
      erledigt: "Erledigt",
    },
    tagCategory: {
      raum: "Räume",
      aussen: "Aussenbereich",
      typ: "Aufgabentyp",
      technik: "Technik & Geräte",
      sonstiges: "Sonstiges",
    },
  },
  home: {
    heading: "Alle Aufgaben",
    tagline:
      "Househeld sammelt alle Haushaltsaufgaben an einem Ort – kostenlos, ohne Konto. Alle Daten bleiben lokal im Browser.",
    summary: (open: number, inProgress: number, done: number) =>
      `${open} offen · ${inProgress} in Arbeit · ${done} erledigt`,
    onboardingPrefix: "Noch keine Haushaltsmitglieder erfasst – ",
    onboardingLink: "jetzt anlegen",
    onboardingSuffix: ". Aufgaben lassen sich auch ohne Zuweisung erstellen.",
    emptyHint: "Noch keine Aufgaben erfasst – lege die erste an.",
  },
  taskWorkspace: {
    viewList: "Liste",
    viewBoard: "Board",
    countLabel: (visible: number, total: number) => `${visible} von ${total} Aufgaben`,
    newTask: "+ Neue Aufgabe",
    emptyFiltered: "Keine Aufgabe passt zu den gewählten Filtern.",
    emptyColumn: "Keine Aufgaben",
  },
  filterBar: {
    searchPlaceholder: "Aufgaben durchsuchen …",
    searchAriaLabel: "Aufgaben durchsuchen",
    sortLabel: "Sortierung",
    sortDueDate: "Fälligkeitsdatum",
    sortCreatedAt: "Erstelldatum (neuste zuerst)",
    resetFilters: (count: number) => `Filter zurücksetzen (${count})`,
    sectionStatus: "Status",
    sectionPriority: "Priorität",
    sectionPerson: "Person",
    showAllTags: "Alle Tags anzeigen",
    collapseTags: "Tags einklappen",
  },
  taskCard: {
    due: (date: string) => `Fällig: ${date}`,
    created: (date: string) => `Erstellt: ${date}`,
    statusAriaLabel: (title: string) => `Status von ${title} ändern`,
  },
  taskDialog: {
    titleNew: "Neue Aufgabe",
    titleEdit: "Aufgabe bearbeiten",
    deleteTask: "Aufgabe löschen",
    titleFieldLabel: "Titel",
    titlePlaceholder: "z. B. Tropfender Wasserhahn im Bad EG",
    titleRequiredError: "Bitte einen Titel eingeben.",
    descriptionLabel: "Beschreibung",
    descriptionPlaceholder: "Optional: Details, Ort, benötigtes Material …",
    dueDateLabel: "Fälligkeitsdatum",
    priorityLabel: "Priorität",
    statusLabel: "Status",
    assigneeLabel: "Zuständig",
    removeAllAssignees: "Alle Zuweisungen entfernen",
    noPersonsHint:
      "Noch keine Personen erfasst – unter „Personen“ anlegen. Aufgaben können auch ohne Zuweisung gespeichert werden.",
    tagsLabel: "Tags",
    tagSearchPlaceholder: "Tag suchen oder neu erstellen …",
    tagCategoryAriaLabel: "Farbbereich für neuen Tag",
    createTagButton: (name: string) => `„${name}“ erstellen`,
    noMatchingTags: "Keine passenden Tags gefunden.",
    photosLabel: "Fotos",
  },
  photos: {
    addPhotos: "Fotos hinzufügen",
    processing: "Wird verarbeitet …",
    countLabel: (count: number, max: number) => `${count}/${max} Fotos · JPG, PNG, WebP, HEIC · max. 10 MB`,
    notAvailable: "nicht verfügbar",
    notAvailableTitle: "Bilddatei nicht verfügbar",
    magnifyAriaLabel: (fileName: string) => `Foto ${fileName} vergrössern`,
    removeAriaLabel: (fileName: string) => `Foto ${fileName} entfernen`,
    emptyHint: "Noch keine Fotos – optional, jederzeit ergänzbar.",
    altFallback: "Foto",
    altText: (taskTitle: string) => `Foto zur Aufgabe „${taskTitle}“`,
  },
  chips: {
    removeTagAriaLabel: (name: string) => `Tag ${name} entfernen`,
  },
  modal: {
    closeOverlayAriaLabel: "Dialog schliessen",
    closeAriaLabel: "Schliessen",
  },
  persons: {
    heading: "Personen",
    description:
      "Haushaltsmitglieder verwalten. Wird eine Person gelöscht, bleiben ihre Aufgaben bestehen und gelten danach als „nicht zugewiesen“.",
    namePlaceholder: "Name, z. B. Mira",
    nameAriaLabel: "Name der neuen Person",
    addPerson: "Person hinzufügen",
    empty: "Noch keine Personen erfasst.",
    renameAriaLabel: (name: string) => `Name von ${name} ändern`,
    assignedCount: (assigned: number, open: number) => `${assigned} zugewiesene Aufgaben · ${open} noch nicht erledigt`,
    deleteConfirm: "Person wirklich löschen?",
  },
  tags: {
    heading: "Tags",
    description:
      "Tags gelten für die ganze Installation und sind eindeutig (Gross-/Kleinschreibung und Leerzeichen am Rand werden ignoriert). Der Farbbereich bestimmt die Chip-Farbe.",
    namePlaceholder: "Neuer Tag, z. B. Estrich",
    nameAriaLabel: "Name des neuen Tags",
    categoryAriaLabel: "Farbbereich",
    createButton: "Tag erstellen",
    duplicateHint: (name: string) => `„${name}“ existiert bereits – Tags sind eindeutig.`,
    empty: "Keine Tags vorhanden.",
    usageCount: (count: number) => (count === 0 ? "nicht verwendet" : `${count} ${count === 1 ? "Aufgabe" : "Aufgaben"}`),
    renameAriaLabel: (name: string) => `Tag ${name} umbenennen`,
    categoryChangeAriaLabel: (name: string) => `Farbbereich von ${name}`,
    deleteAnyway: "Trotzdem löschen",
    usedWarningTitle: "Tag wird noch verwendet",
    usedWarningIntro: "Der Tag",
    usedWarningBody: (count: number) => ` wird aktuell von ${count} ${count === 1 ? "Aufgabe" : "Aufgaben"} verwendet.`,
    usedWarningNote:
      "Beim Löschen wird er von allen betroffenen Aufgaben entfernt. Die Aufgaben selbst bleiben bestehen.",
  },
  settings: {
    heading: "Einstellungen",
    description: "Übersicht über den lokalen Datenbestand und Werkzeuge zum Ausprobieren.",
    statTasks: "Aufgaben",
    statPersons: "Personen",
    statTags: "Tags",
    statPhotos: "Fotos",
    demoHeading: "Beispieldaten",
    demoDescription:
      "Legt 6 Personen und 14 Aufgaben mit gemischten Tags, Prioritäten und thematisch passenden Beispielfotos an – praktisch, um den Ablauf einmal durchzuspielen.",
    demoButton: "Beispieldaten laden",
    demoLoading: "Wird geladen …",
    resetHeading: "Alles zurücksetzen",
    resetDescription:
      "Löscht sämtliche Aufgaben, Personen, Tags und Fotos endgültig und legt danach die vordefinierten Tags neu an. Es gibt keinen Papierkorb.",
    resetButton: "Alle Daten löschen",
    resetConfirm: "Wirklich alles löschen?",
  },
  errors: {
    dbOpenFailed: "Die lokale Datenbank konnte nicht geöffnet werden.",
    tooManyPhotos: (max: number, fileName: string) => `Maximal ${max} Fotos pro Aufgabe – "${fileName}" wurde ignoriert.`,
    unsupportedFormat: (fileName: string) => `"${fileName}" hat ein nicht unterstütztes Format (JPG, PNG, WebP, HEIC).`,
    saveFailed: (fileName: string) => `"${fileName}" konnte nicht gespeichert werden.`,
    fileTooLarge: (fileName: string, size: string) => `"${fileName}" ist ${size} gross – maximal 10 MB erlaubt.`,
  },
};

const en: typeof de = {
  meta: {
    siteName: "Househeld",
    titleDefault: "Househeld – Household Tasks Under Control",
    titleTemplate: "%s · Househeld",
    description:
      "Househeld collects every household task in one place: with photos, ownership and tags. Free, no account needed – all data stays local in your browser.",
    ogAlt: "Househeld – Household Tasks Under Control",
  },
  pages: {
    tasks: {
      title: "Househeld – Household Tasks Under Control",
    },
    persons: {
      title: "People",
      description: "Manage household members and assign tasks.",
    },
    tags: {
      title: "Tags",
      description: "Manage tags by room, task type and equipment.",
    },
    settings: {
      title: "Settings",
      description: "Review the local data, load sample data or reset everything.",
    },
  },
  nav: {
    brand: "Househeld",
    tasks: "Tasks",
    persons: "People",
    tags: "Tags",
    settings: "Settings",
  },
  languageSwitcher: {
    ariaLabel: "Switch language",
  },
  appShell: {
    storageErrorTitle: "Local storage unavailable",
    storageErrorHint:
      "Househeld stores all data in the browser (IndexedDB). It won't work in private browsing mode or if storage is blocked.",
    footer: "Househeld · Practice project · Data is stored exclusively in your local browser.",
  },
  common: {
    save: "Save",
    saving: "Saving …",
    cancel: "Cancel",
    edit: "Edit",
    rename: "Rename",
    delete: "Delete",
    deleteConfirm: "Really delete?",
    deleteConfirmFinal: "Delete permanently?",
    status: "Status",
    unassigned: "Unassigned",
    photoFallbackTitle: "Photo",
  },
  labels: {
    priority: {
      niedrig: "Low",
      mittel: "Medium",
      dringend: "Urgent",
    },
    status: {
      offen: "Open",
      in_arbeit: "In Progress",
      erledigt: "Done",
    },
    tagCategory: {
      raum: "Rooms",
      aussen: "Outdoor",
      typ: "Task Type",
      technik: "Appliances & Tech",
      sonstiges: "Other",
    },
  },
  home: {
    heading: "All Tasks",
    tagline:
      "Househeld collects every household task in one place – free, no account. All data stays local in your browser.",
    summary: (open: number, inProgress: number, done: number) =>
      `${open} open · ${inProgress} in progress · ${done} done`,
    onboardingPrefix: "No household members yet – ",
    onboardingLink: "add one now",
    onboardingSuffix: ". Tasks can also be created without an assignee.",
    emptyHint: "No tasks yet – create the first one.",
  },
  taskWorkspace: {
    viewList: "List",
    viewBoard: "Board",
    countLabel: (visible: number, total: number) => `${visible} of ${total} tasks`,
    newTask: "+ New Task",
    emptyFiltered: "No task matches the selected filters.",
    emptyColumn: "No tasks",
  },
  filterBar: {
    searchPlaceholder: "Search tasks …",
    searchAriaLabel: "Search tasks",
    sortLabel: "Sort",
    sortDueDate: "Due date",
    sortCreatedAt: "Created date (newest first)",
    resetFilters: (count: number) => `Reset filters (${count})`,
    sectionStatus: "Status",
    sectionPriority: "Priority",
    sectionPerson: "Person",
    showAllTags: "Show all tags",
    collapseTags: "Collapse tags",
  },
  taskCard: {
    due: (date: string) => `Due: ${date}`,
    created: (date: string) => `Created: ${date}`,
    statusAriaLabel: (title: string) => `Change status of ${title}`,
  },
  taskDialog: {
    titleNew: "New Task",
    titleEdit: "Edit Task",
    deleteTask: "Delete Task",
    titleFieldLabel: "Title",
    titlePlaceholder: "e.g. Dripping faucet in the ground floor bathroom",
    titleRequiredError: "Please enter a title.",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Optional: details, location, materials needed …",
    dueDateLabel: "Due Date",
    priorityLabel: "Priority",
    statusLabel: "Status",
    assigneeLabel: "Assignee",
    removeAllAssignees: "Remove all assignees",
    noPersonsHint:
      "No people yet – add them under \"People\". Tasks can also be saved without an assignee.",
    tagsLabel: "Tags",
    tagSearchPlaceholder: "Search or create a tag …",
    tagCategoryAriaLabel: "Color category for the new tag",
    createTagButton: (name: string) => `Create "${name}"`,
    noMatchingTags: "No matching tags found.",
    photosLabel: "Photos",
  },
  photos: {
    addPhotos: "Add Photos",
    processing: "Processing …",
    countLabel: (count: number, max: number) => `${count}/${max} photos · JPG, PNG, WebP, HEIC · max. 10 MB`,
    notAvailable: "unavailable",
    notAvailableTitle: "Image file unavailable",
    magnifyAriaLabel: (fileName: string) => `Enlarge photo ${fileName}`,
    removeAriaLabel: (fileName: string) => `Remove photo ${fileName}`,
    emptyHint: "No photos yet – optional, can be added anytime.",
    altFallback: "Photo",
    altText: (taskTitle: string) => `Photo for the task "${taskTitle}"`,
  },
  chips: {
    removeTagAriaLabel: (name: string) => `Remove tag ${name}`,
  },
  modal: {
    closeOverlayAriaLabel: "Close dialog",
    closeAriaLabel: "Close",
  },
  persons: {
    heading: "People",
    description:
      "Manage household members. Deleting a person keeps their tasks, which then show as \"unassigned\".",
    namePlaceholder: "Name, e.g. Mira",
    nameAriaLabel: "Name of the new person",
    addPerson: "Add Person",
    empty: "No people yet.",
    renameAriaLabel: (name: string) => `Change name of ${name}`,
    assignedCount: (assigned: number, open: number) => `${assigned} assigned tasks · ${open} not yet done`,
    deleteConfirm: "Really delete this person?",
  },
  tags: {
    heading: "Tags",
    description:
      "Tags apply to the whole installation and are unique (capitalization and leading/trailing spaces are ignored). The color category determines the chip color.",
    namePlaceholder: "New tag, e.g. Attic",
    nameAriaLabel: "Name of the new tag",
    categoryAriaLabel: "Color category",
    createButton: "Create Tag",
    duplicateHint: (name: string) => `"${name}" already exists – tags are unique.`,
    empty: "No tags yet.",
    usageCount: (count: number) => (count === 0 ? "unused" : `${count} ${count === 1 ? "task" : "tasks"}`),
    renameAriaLabel: (name: string) => `Rename tag ${name}`,
    categoryChangeAriaLabel: (name: string) => `Color category of ${name}`,
    deleteAnyway: "Delete Anyway",
    usedWarningTitle: "Tag is still in use",
    usedWarningIntro: "The tag",
    usedWarningBody: (count: number) => ` is currently used by ${count} ${count === 1 ? "task" : "tasks"}.`,
    usedWarningNote: "Deleting it removes it from all affected tasks. The tasks themselves remain.",
  },
  settings: {
    heading: "Settings",
    description: "Overview of the local data and tools for trying things out.",
    statTasks: "Tasks",
    statPersons: "People",
    statTags: "Tags",
    statPhotos: "Photos",
    demoHeading: "Sample Data",
    demoDescription:
      "Creates 6 people and 14 tasks with mixed tags, priorities and matching sample photos – a quick way to try the whole flow.",
    demoButton: "Load Sample Data",
    demoLoading: "Loading …",
    resetHeading: "Reset Everything",
    resetDescription:
      "Permanently deletes all tasks, people, tags and photos, then recreates the predefined tags. There is no trash bin.",
    resetButton: "Delete All Data",
    resetConfirm: "Really delete everything?",
  },
  errors: {
    dbOpenFailed: "The local database could not be opened.",
    tooManyPhotos: (max: number, fileName: string) => `Maximum ${max} photos per task – "${fileName}" was ignored.`,
    unsupportedFormat: (fileName: string) => `"${fileName}" has an unsupported format (JPG, PNG, WebP, HEIC).`,
    saveFailed: (fileName: string) => `"${fileName}" could not be saved.`,
    fileTooLarge: (fileName: string, size: string) => `"${fileName}" is ${size} – maximum 10 MB allowed.`,
  },
};

export type Dictionary = typeof de;

const dictionaries: Record<Locale, Dictionary> = { de, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
