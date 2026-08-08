import { ACCEPTED_IMAGE_EXTENSIONS, ACCEPTED_IMAGE_TYPES, MAX_PHOTO_BYTES } from "./types";
import { formatBytes } from "./utils";

/** Längste Kante nach der Verkleinerung (PRD 5.2: "sinnvolle maximale Auflösung"). */
const MAX_EDGE = 1600;
const OUTPUT_TYPE = "image/webp";
const OUTPUT_QUALITY = 0.82;

export interface ProcessedImage {
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
}

export function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return true;
  // HEIC liefert in manchen Browsern einen leeren MIME-Type – dann zählt die Endung.
  const lower = file.name.toLocaleLowerCase();
  return ACCEPTED_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Verkleinert und komprimiert ein Bild im Browser. Kann der Browser das Format
 * nicht dekodieren (typisch für HEIC ausserhalb von Safari), wird die
 * Originaldatei unverändert übernommen – die Aufgabe bleibt so nutzbar.
 */
export async function processImageFile(file: File): Promise<ProcessedImage> {
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error(`"${file.name}" ist ${formatBytes(file.size)} gross – maximal 10 MB erlaubt.`);
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas nicht verfügbar");
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, OUTPUT_TYPE, OUTPUT_QUALITY);
    });
    if (!blob) throw new Error("Komprimierung fehlgeschlagen");

    return { blob, mimeType: blob.type || OUTPUT_TYPE, width, height };
  } catch {
    return { blob: file, mimeType: file.type || "application/octet-stream", width: 0, height: 0 };
  }
}
