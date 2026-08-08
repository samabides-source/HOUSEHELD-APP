"use client";

import { useEffect, useState } from "react";
import { getPhotoBlob } from "./db";

/**
 * Object-URLs für Foto-Blobs. Der Cache verhindert, dass dasselbe Bild in
 * Liste, Board und Detailansicht mehrfach geladen wird.
 */
const cache = new Map<string, string>();

export function releasePhotoUrl(photoId: string): void {
  const url = cache.get(photoId);
  if (!url) return;
  URL.revokeObjectURL(url);
  cache.delete(photoId);
}

export function releaseAllPhotoUrls(): void {
  for (const url of cache.values()) URL.revokeObjectURL(url);
  cache.clear();
}

export type PhotoUrlState = "loading" | "ready" | "missing";

/**
 * Lädt die Binärdaten eines Fotos. Fehlt die Datei, bleibt die Aufgabe nutzbar
 * und das Foto wird als "nicht verfügbar" gemeldet (PRD 5.2).
 */
export function usePhotoUrl(photoId: string): { url: string | null; state: PhotoUrlState } {
  const [url, setUrl] = useState<string | null>(() => cache.get(photoId) ?? null);
  const [state, setState] = useState<PhotoUrlState>(() => (cache.has(photoId) ? "ready" : "loading"));

  useEffect(() => {
    const cached = cache.get(photoId);
    if (cached) {
      setUrl(cached);
      setState("ready");
      return;
    }

    let cancelled = false;
    setState("loading");

    getPhotoBlob(photoId)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) {
          setUrl(null);
          setState("missing");
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        cache.set(photoId, objectUrl);
        setUrl(objectUrl);
        setState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setUrl(null);
        setState("missing");
      });

    return () => {
      cancelled = true;
    };
  }, [photoId]);

  return { url, state };
}
