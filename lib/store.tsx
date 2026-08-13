"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  STORE,
  clearAll,
  deletePhoto as deletePhotoRecord,
  deleteTaskCascade,
  deleteValue,
  loadSnapshot,
  putPhoto,
  putValue,
} from "./db";
import { useLocale, useT } from "./i18n/context";
import { releaseAllPhotoUrls, releasePhotoUrl } from "./photo-url";
import { processImageFile, isAcceptedFile } from "./photos";
import { seedIfNeeded } from "./seed";
import {
  MAX_PHOTOS_PER_TASK,
  type Person,
  type Photo,
  type Tag,
  type TagCategory,
  type Task,
  type TaskInput,
} from "./types";
import { newId, normalizeTagName, nowIso } from "./utils";

interface StoreValue {
  ready: boolean;
  error: string | null;
  persons: Person[];
  tags: Tag[];
  tasks: Task[];
  photos: Photo[];
  photosForTask: (taskId: string) => Photo[];
  personById: (id: string) => Person | undefined;
  tagById: (id: string) => Tag | undefined;

  createTask: (input: TaskInput, id?: string) => Promise<Task>;
  updateTask: (id: string, patch: Partial<TaskInput>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  createPerson: (name: string) => Promise<Person>;
  renamePerson: (id: string, name: string) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;

  createTag: (name: string, category?: TagCategory) => Promise<Tag>;
  updateTag: (id: string, patch: { name?: string; category?: TagCategory }) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  tasksUsingTag: (id: string) => number;

  addPhotos: (taskId: string, files: File[]) => Promise<string[]>;
  removePhoto: (photoId: string) => Promise<void>;
  removePhotosOfTask: (taskId: string) => Promise<void>;

  loadDemoData: () => Promise<void>;
  resetEverything: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const locale = useLocale();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const initialised = useRef(false);

  const refresh = useCallback(async () => {
    const snapshot = await loadSnapshot();
    setPersons(snapshot.persons);
    setTags(snapshot.tags);
    setTasks(snapshot.tasks);
    setPhotos(snapshot.photos);
  }, []);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    (async () => {
      try {
        await seedIfNeeded(locale);
        await refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : t.errors.dbOpenFailed);
      } finally {
        setReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const photosForTask = useCallback(
    (taskId: string) =>
      photos.filter((photo) => photo.taskId === taskId).sort((a, b) => a.sortIndex - b.sortIndex),
    [photos],
  );

  const personById = useCallback(
    (id: string) => persons.find((person) => person.id === id),
    [persons],
  );

  const tagById = useCallback((id: string) => tags.find((tag) => tag.id === id), [tags]);

  // ---------------------------------------------------------------- Aufgaben

  const createTask = useCallback(async (input: TaskInput, id?: string) => {
    const task: Task = { ...input, id: id ?? newId(), createdAt: nowIso() };
    await putValue(STORE.tasks, task);
    setTasks((current) => [...current, task]);
    return task;
  }, []);

  const updateTask = useCallback(
    async (id: string, patch: Partial<TaskInput>) => {
      const current = tasks.find((task) => task.id === id);
      if (!current) return;
      const updated: Task = { ...current, ...patch };
      await putValue(STORE.tasks, updated);
      setTasks((list) => list.map((task) => (task.id === id ? updated : task)));
    },
    [tasks],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const photoIds = photos.filter((photo) => photo.taskId === id).map((photo) => photo.id);
      await deleteTaskCascade(id, photoIds);
      for (const photoId of photoIds) releasePhotoUrl(photoId);
      setTasks((current) => current.filter((task) => task.id !== id));
      setPhotos((current) => current.filter((photo) => photo.taskId !== id));
    },
    [photos],
  );

  // ---------------------------------------------------------------- Personen

  const createPerson = useCallback(async (name: string) => {
    const person: Person = { id: newId(), name: name.trim(), createdAt: nowIso() };
    await putValue(STORE.persons, person);
    setPersons((current) => [...current, person]);
    return person;
  }, []);

  const renamePerson = useCallback(
    async (id: string, name: string) => {
      const current = persons.find((person) => person.id === id);
      if (!current) return;
      const updated: Person = { ...current, name: name.trim() };
      await putValue(STORE.persons, updated);
      setPersons((list) => list.map((person) => (person.id === id ? updated : person)));
    },
    [persons],
  );

  /**
   * Löscht eine Person und entfernt ihre Zuweisungen. Die Aufgaben bleiben
   * bestehen und gelten danach als "nicht zugewiesen" (PRD 4).
   */
  const deletePerson = useCallback(
    async (id: string) => {
      const affected = tasks
        .filter((task) => task.assigneeIds.includes(id))
        .map((task) => ({ ...task, assigneeIds: task.assigneeIds.filter((a) => a !== id) }));

      await deleteValue(STORE.persons, id);
      for (const task of affected) await putValue(STORE.tasks, task);

      setPersons((current) => current.filter((person) => person.id !== id));
      setTasks((current) =>
        current.map((task) => affected.find((entry) => entry.id === task.id) ?? task),
      );
    },
    [tasks],
  );

  // -------------------------------------------------------------------- Tags

  /** Legt einen Tag an; existiert der Name bereits (normalisiert), wird er zurückgegeben. */
  const createTag = useCallback(
    async (name: string, category: TagCategory = "sonstiges") => {
      const trimmed = name.trim().replace(/\s+/g, " ");
      const normalized = normalizeTagName(trimmed);
      const existing = tags.find((tag) => normalizeTagName(tag.name) === normalized);
      if (existing) return existing;

      const tag: Tag = { id: newId(), name: trimmed, category, createdAt: nowIso() };
      await putValue(STORE.tags, tag);
      setTags((current) => [...current, tag]);
      return tag;
    },
    [tags],
  );

  const updateTag = useCallback(
    async (id: string, patch: { name?: string; category?: TagCategory }) => {
      const current = tags.find((tag) => tag.id === id);
      if (!current) return;
      const updated: Tag = {
        ...current,
        ...(patch.name !== undefined ? { name: patch.name.trim().replace(/\s+/g, " ") } : {}),
        ...(patch.category !== undefined ? { category: patch.category } : {}),
      };
      await putValue(STORE.tags, updated);
      setTags((list) => list.map((tag) => (tag.id === id ? updated : tag)));
    },
    [tags],
  );

  const tasksUsingTag = useCallback(
    (id: string) => tasks.filter((task) => task.tagIds.includes(id)).length,
    [tasks],
  );

  /** Entfernt den Tag und löst ihn aus allen Aufgaben (PRD 5.4). */
  const deleteTag = useCallback(
    async (id: string) => {
      const affected = tasks
        .filter((task) => task.tagIds.includes(id))
        .map((task) => ({ ...task, tagIds: task.tagIds.filter((t) => t !== id) }));

      await deleteValue(STORE.tags, id);
      for (const task of affected) await putValue(STORE.tasks, task);

      setTags((current) => current.filter((tag) => tag.id !== id));
      setTasks((current) =>
        current.map((task) => affected.find((entry) => entry.id === task.id) ?? task),
      );
    },
    [tasks],
  );

  // ------------------------------------------------------------------ Fotos

  /** Verarbeitet und speichert Dateien; gibt Fehlermeldungen für die UI zurück. */
  const addPhotos = useCallback(
    async (taskId: string, files: File[]) => {
      const errors: string[] = [];
      const existing = photos.filter((photo) => photo.taskId === taskId);
      let slots = MAX_PHOTOS_PER_TASK - existing.length;
      let sortIndex = existing.reduce((max, photo) => Math.max(max, photo.sortIndex + 1), 0);
      const created: Photo[] = [];

      for (const file of files) {
        if (slots <= 0) {
          errors.push(t.errors.tooManyPhotos(MAX_PHOTOS_PER_TASK, file.name));
          continue;
        }
        if (!isAcceptedFile(file)) {
          errors.push(t.errors.unsupportedFormat(file.name));
          continue;
        }

        try {
          const processed = await processImageFile(file, t.errors.fileTooLarge);
          const photo: Photo = {
            id: newId(),
            taskId,
            fileName: file.name,
            mimeType: processed.mimeType,
            size: processed.blob.size,
            width: processed.width,
            height: processed.height,
            createdAt: nowIso(),
            sortIndex: sortIndex++,
          };
          await putPhoto(photo, processed.blob);
          created.push(photo);
          slots -= 1;
        } catch (cause) {
          errors.push(cause instanceof Error ? cause.message : t.errors.saveFailed(file.name));
        }
      }

      if (created.length > 0) setPhotos((current) => [...current, ...created]);
      return errors;
    },
    [photos, t],
  );

  const removePhoto = useCallback(async (photoId: string) => {
    await deletePhotoRecord(photoId);
    releasePhotoUrl(photoId);
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
  }, []);

  const removePhotosOfTask = useCallback(
    async (taskId: string) => {
      const ids = photos.filter((photo) => photo.taskId === taskId).map((photo) => photo.id);
      for (const id of ids) {
        await deletePhotoRecord(id);
        releasePhotoUrl(id);
      }
      if (ids.length > 0) setPhotos((current) => current.filter((photo) => photo.taskId !== taskId));
    },
    [photos],
  );

  // ---------------------------------------------------------------- Wartung

  const loadDemoData = useCallback(async () => {
    const { seedDemoData } = await import("./demo-data");
    await seedDemoData(locale);
    await refresh();
  }, [refresh, locale]);

  const resetEverything = useCallback(async () => {
    await clearAll();
    releaseAllPhotoUrls();
    await seedIfNeeded(locale);
    await refresh();
  }, [refresh, locale]);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      error,
      persons,
      tags,
      tasks,
      photos,
      photosForTask,
      personById,
      tagById,
      createTask,
      updateTask,
      deleteTask,
      createPerson,
      renamePerson,
      deletePerson,
      createTag,
      updateTag,
      deleteTag,
      tasksUsingTag,
      addPhotos,
      removePhoto,
      removePhotosOfTask,
      loadDemoData,
      resetEverything,
    }),
    [
      ready,
      error,
      persons,
      tags,
      tasks,
      photos,
      photosForTask,
      personById,
      tagById,
      createTask,
      updateTask,
      deleteTask,
      createPerson,
      renamePerson,
      deletePerson,
      createTag,
      updateTag,
      deleteTag,
      tasksUsingTag,
      addPhotos,
      removePhoto,
      removePhotosOfTask,
      loadDemoData,
      resetEverything,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore muss innerhalb von <StoreProvider> verwendet werden.");
  return context;
}
