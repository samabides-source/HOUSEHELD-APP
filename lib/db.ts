import type { Person, Photo, Tag, Task } from "./types";

export const DB_NAME = "househeld";
export const DB_VERSION = 1;

export const STORE = {
  persons: "persons",
  tags: "tags",
  tasks: "tasks",
  photos: "photos",
  photoBlobs: "photoBlobs",
  meta: "meta",
} as const;

type StoreName = (typeof STORE)[keyof typeof STORE];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB ist in dieser Umgebung nicht verfügbar."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE.persons)) {
        db.createObjectStore(STORE.persons, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE.tags)) {
        db.createObjectStore(STORE.tags, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE.tasks)) {
        db.createObjectStore(STORE.tasks, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE.photos)) {
        const photos = db.createObjectStore(STORE.photos, { keyPath: "id" });
        photos.createIndex("taskId", "taskId", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE.photoBlobs)) {
        // Schlüssel = Photo-ID, Wert = Blob
        db.createObjectStore(STORE.photoBlobs);
      }
      if (!db.objectStoreNames.contains(STORE.meta)) {
        db.createObjectStore(STORE.meta);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabase().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

function wrap<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await getDb();
  const tx = db.transaction(store, "readonly");
  const result = await wrap<T[]>(tx.objectStore(store).getAll());
  await done(tx);
  return result;
}

export async function getOne<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const db = await getDb();
  const tx = db.transaction(store, "readonly");
  const result = await wrap<T | undefined>(tx.objectStore(store).get(key));
  await done(tx);
  return result;
}

export async function putValue(store: StoreName, value: unknown, key?: IDBValidKey): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).put(value as never, key);
  await done(tx);
}

export async function putMany(store: StoreName, values: unknown[]): Promise<void> {
  if (values.length === 0) return;
  const db = await getDb();
  const tx = db.transaction(store, "readwrite");
  const objectStore = tx.objectStore(store);
  for (const value of values) objectStore.put(value as never);
  await done(tx);
}

export async function deleteValue(store: StoreName, key: IDBValidKey): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).delete(key);
  await done(tx);
}

/** Legt Foto-Metadaten und Binärdaten in einer gemeinsamen Transaktion ab. */
export async function putPhoto(photo: Photo, blob: Blob): Promise<void> {
  const db = await getDb();
  const tx = db.transaction([STORE.photos, STORE.photoBlobs], "readwrite");
  tx.objectStore(STORE.photos).put(photo);
  tx.objectStore(STORE.photoBlobs).put(blob, photo.id);
  await done(tx);
}

/** Entfernt Metadaten und Binärdaten eines Fotos. */
export async function deletePhoto(photoId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction([STORE.photos, STORE.photoBlobs], "readwrite");
  tx.objectStore(STORE.photos).delete(photoId);
  tx.objectStore(STORE.photoBlobs).delete(photoId);
  await done(tx);
}

/** Löscht eine Aufgabe samt aller zugehörigen Fotodatensätze und Binärdaten. */
export async function deleteTaskCascade(taskId: string, photoIds: string[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction([STORE.tasks, STORE.photos, STORE.photoBlobs], "readwrite");
  tx.objectStore(STORE.tasks).delete(taskId);
  const photos = tx.objectStore(STORE.photos);
  const blobs = tx.objectStore(STORE.photoBlobs);
  for (const id of photoIds) {
    photos.delete(id);
    blobs.delete(id);
  }
  await done(tx);
}

export async function getPhotoBlob(photoId: string): Promise<Blob | undefined> {
  return getOne<Blob>(STORE.photoBlobs, photoId);
}

export interface Snapshot {
  persons: Person[];
  tags: Tag[];
  tasks: Task[];
  photos: Photo[];
}

export async function loadSnapshot(): Promise<Snapshot> {
  const [persons, tags, tasks, photos] = await Promise.all([
    getAll<Person>(STORE.persons),
    getAll<Tag>(STORE.tags),
    getAll<Task>(STORE.tasks),
    getAll<Photo>(STORE.photos),
  ]);
  return { persons, tags, tasks, photos };
}

/** Setzt die gesamte lokale Datenbank zurück (inkl. Fotos). */
export async function clearAll(): Promise<void> {
  const db = await getDb();
  const stores = Object.values(STORE) as StoreName[];
  const tx = db.transaction(stores, "readwrite");
  for (const store of stores) tx.objectStore(store).clear();
  await done(tx);
}
