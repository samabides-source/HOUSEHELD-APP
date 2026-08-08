"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Kleiner localStorage-Hook. Der erste Render liefert immer den Default-Wert,
 * damit Server- und Client-Markup identisch sind; der gespeicherte Wert wird
 * direkt danach im Effekt nachgezogen.
 */
export function useLocalState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // Ungültiger Eintrag – Default behalten.
    }
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Speicher voll oder gesperrt – die App funktioniert trotzdem weiter.
      }
    },
    [key],
  );

  return [value, update];
}
