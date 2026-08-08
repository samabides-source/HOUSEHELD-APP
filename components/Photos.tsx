"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { usePhotoUrl } from "@/lib/photo-url";
import { useStore } from "@/lib/store";
import { MAX_PHOTOS_PER_TASK, type Photo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Modal } from "./Modal";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";

/** Bild aus IndexedDB. Fehlt die Datei, wird das Foto als nicht verfügbar markiert. */
export function PhotoImage({
  photo,
  className,
  imageClassName,
}: {
  photo: Photo;
  className?: string;
  imageClassName?: string;
}) {
  const { url, state } = usePhotoUrl(photo.id);

  if (state === "loading") {
    return <div className={cn("animate-pulse bg-slate-200", className)} />;
  }

  if (state === "missing" || !url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-slate-100 p-1 text-center text-[10px] leading-tight text-slate-400",
          className,
        )}
        title="Bilddatei nicht verfügbar"
      >
        nicht verfügbar
      </div>
    );
  }

  // Bewusst <img>: die Blobs liegen lokal im Browser, next/image bringt hier
  // keinen Vorteil und kann Object-URLs nicht optimieren.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={photo.fileName} className={cn("object-cover", className, imageClassName)} />;
}

/**
 * Thumbnail-Reihe für Aufgabenkarten. Mit `onSelect` wird jedes Thumbnail
 * klickbar, um das Foto vergrössert anzuzeigen.
 */
export function PhotoStrip({
  photos,
  max = 4,
  onSelect,
}: {
  photos: Photo[];
  max?: number;
  onSelect?: (photo: Photo) => void;
}) {
  if (photos.length === 0) return null;
  const visible = photos.slice(0, max);
  const rest = photos.length - visible.length;

  return (
    <div className="flex items-center gap-2">
      {visible.map((photo) =>
        onSelect ? (
          <button
            key={photo.id}
            type="button"
            onClick={() => onSelect(photo)}
            className="overflow-hidden rounded-xl border border-slate-200 transition hover:opacity-80"
            aria-label={`Foto ${photo.fileName} vergrössern`}
          >
            <PhotoImage photo={photo} className="size-14" />
          </button>
        ) : (
          <PhotoImage key={photo.id} photo={photo} className="size-14 rounded-xl border border-slate-200" />
        ),
      )}
      {rest > 0 && (
        <span className="flex size-14 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-500">
          +{rest}
        </span>
      )}
    </div>
  );
}

/**
 * Foto-Verwaltung einer Aufgabe: hinzufügen, ansehen, entfernen – jederzeit,
 * nicht nur beim Anlegen (PRD 5.2).
 */
export function PhotoManager({ taskId, photos }: { taskId: string; photos: Photo[] }) {
  const { addPhotos, removePhoto } = useStore();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<Photo | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_PHOTOS_PER_TASK - photos.length;

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setBusy(true);
    setErrors([]);
    try {
      const problems = await addPhotos(taskId, files);
      setErrors(problems);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={busy || remaining <= 0}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Wird verarbeitet …" : "Fotos hinzufügen"}
        </Button>
        <span className="text-xs text-slate-500">
          {photos.length}/{MAX_PHOTOS_PER_TASK} Fotos · JPG, PNG, WebP, HEIC · max. 10 MB
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {photos.length > 0 ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <li key={photo.id} className="group relative">
              <button
                type="button"
                onClick={() => setPreview(photo)}
                className="block w-full overflow-hidden rounded-2xl border border-slate-200"
                title={photo.fileName}
              >
                <PhotoImage photo={photo} className="aspect-square w-full" />
              </button>
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-white text-sm leading-none text-slate-500 shadow ring-1 ring-slate-200 transition hover:bg-red-600 hover:text-white"
                aria-label={`Foto ${photo.fileName} entfernen`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400">
          Noch keine Fotos – optional, jederzeit ergänzbar.
        </p>
      )}

      <Modal open={preview !== null} title={preview?.fileName ?? "Foto"} onClose={() => setPreview(null)}>
        {preview && (
          <PhotoImage photo={preview} className="max-h-[70vh] w-full rounded-2xl" imageClassName="object-contain" />
        )}
      </Modal>
    </div>
  );
}
