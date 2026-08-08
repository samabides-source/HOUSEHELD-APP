# CLAUDE.md

Leitfaden für die Arbeit an **Hausheld** – einer App zum Erfassen und Verteilen von
Haushaltsaufgaben (Übungsprojekt, Modul „Viben und Coden“).

## Befehle

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run typecheck
```

```bash
npm run lint
```

Sprache im UI, in Kommentaren und in Commit-Messages: **Deutsch** (Schweizer Schreibweise, „ss“
statt „ß“).

## Architektur

Next.js 15 (App Router) + React 19 + Tailwind CSS v4 + TypeScript. **Es gibt keinen Server-Code
und keine API-Routen** – alle Seiten sind statisch, die gesamte Logik läuft im Browser.

```
app/                    Seiten (alle "use client")
  page.tsx              Alle Aufgaben (Liste + Board), Personen-Filter lokal gemerkt
  personen/             Personenverwaltung
  tags/                 Tagverwaltung inkl. Löschwarnung
  einstellungen/        Statistik, Beispieldaten, Reset
components/             UI-Bausteine (Chips, Modal, TaskCard, TaskDialog, …)
lib/
  db.ts                 IndexedDB-Zugriff (einzige Stelle mit IDB-API)
  store.tsx             React-Context: Zustand + alle Schreibaktionen
  types.ts              Domänentypen, Labels, Grenzwerte
  theme.ts              Farbzuordnung (Tag-Kategorie, Priorität, Status)
  filters.ts            Filter- und Sortierlogik (rein, ohne React)
  photos.ts             Bildverkleinerung/-komprimierung
  photo-url.ts          Object-URL-Cache + usePhotoUrl
  seed.ts               Vordefinierte Tags (einmaliges Seeding)
  demo-data.ts          Beispieldaten (lazy geladen)
```

**Demo-Daten und Netzwerk:** `demo-data.ts` versucht für jedes Beispielfoto ein passendes,
offen lizenziertes Bild über die Openverse-API (kostenlos, kein Key) zu laden. Schlägt das fehl
(offline, keine Treffer, Timeout) fällt die jeweilige Aufgabe automatisch auf ein generiertes
Farb-Platzhalterbild zurück – der Demo-Button darf dadurch nie hängen bleiben oder fehlschlagen.
Das ist die **einzige** Stelle in der App, die einen externen Netzwerkaufruf macht; die reguläre
Nutzung (eigene Aufgaben, eigene Fotos) bleibt vollständig lokal/offline-fähig.

### Persistenz

Alle Daten liegen in **IndexedDB** (Datenbank `hausheld`), Fotos als `Blob` im Store
`photoBlobs`, die Metadaten getrennt in `photos`. Zugriff **nur** über `lib/db.ts`; Komponenten
sprechen ausschliesslich mit `useStore()`.

`lib/store.tsx` hält den kompletten Zustand im Speicher und schreibt bei jeder Mutation zuerst in
IndexedDB, dann in den React-State. Neue Aktionen bitte nach diesem Muster ergänzen.

**Abweichung vom PRD:** Das PRD nennt Node.js + Express + lowdb + Fotos im Dateisystem. Da die App
auf Vercel deployt wird (serverless, read-only Dateisystem), ist die Persistenz clientseitig
umgesetzt. Konsequenz: Der Datenbestand ist pro Browser/Gerät, nicht geräteübergreifend geteilt.
Wer das ändern will, ersetzt `lib/db.ts` durch einen Adapter auf eine echte Datenbank – die
Store-Schnittstelle kann dabei unverändert bleiben.

## Fachliche Regeln (aus dem PRD)

- **Aufgaben** brauchen nur einen Titel. Zuweisung, Tags, Fotos und Fälligkeitsdatum sind optional.
- **Status** ist jederzeit frei änderbar, auch von `erledigt` zurück auf `offen`.
- **Personen löschen** entfernt nur die Zuweisungen; die Aufgaben bleiben und gelten danach als
  „nicht zugewiesen“.
- **Tags** sind global und eindeutig; verglichen wird über `normalizeTagName()` (trim + lowercase).
  Vordefinierte Tags haben keine Sonderrechte. Wird ein **verwendeter Tag gelöscht**, erscheint
  zuerst eine Warnung mit Anzahl betroffener Aufgaben; nach Bestätigung wird er überall entfernt.
- **Löschen von Aufgaben** verlangt einen zweiten Klick (`ConfirmButton`), ist endgültig und
  entfernt alle zugehörigen Fotos (Metadaten **und** Blobs).
- **Fotos**: max. 10 pro Aufgabe, max. 10 MB pro Datei, JPG/PNG/WebP/HEIC. Beim Upload wird auf
  1600 px längste Kante verkleinert und als WebP komprimiert. Kann der Browser das Format nicht
  dekodieren (HEIC ausserhalb von Safari), wird die Originaldatei gespeichert. Fehlt eine
  Blob-Datei, bleibt die Aufgabe nutzbar und das Foto wird als „nicht verfügbar“ angezeigt.
- **Filter**: innerhalb einer Kategorie ODER, zwischen Kategorien UND.
- **Standardsortierung**: Fälligkeitsdatum aufsteigend, Aufgaben ohne Datum danach (Erstelldatum
  absteigend). Umschaltbar auf Erstelldatum.
- **„dringend“ ist eine Priorität, kein Tag.** Nicht als Tag anlegen.
- Nicht im Umfang: Auth, KI-Funktionen, Push, Mehrsprachigkeit, Vorher-/Nachher-Fotos, Papierkorb,
  visuelle Kennzeichnung überfälliger Aufgaben.

## Design-Regeln

Farbe trägt Bedeutung, nicht Dekoration (PRD Abschnitt 6):

| Ebene | System |
|---|---|
| Tag-Kategorie | Räume = Blau, Aussenbereich = Grün, Aufgabentyp = Amber, Technik = Violett, Sonstiges = Pink – immer als **gefüllter Chip** |
| Priorität | niedrig = Grau, mittel = Amber, dringend = Rot – als **Outline-Pill mit Punkt** plus Farbstreifen links an der Karte |
| Status | bewusst dezent: graue Badges, nur ein kleiner Farbpunkt |
| Person | Initialen-Kreis, Farbe stabil aus der ID (`personColor()`), eigenes Palettensystem |

Alle Farbklassen stehen als **vollständige Klassennamen** in `lib/theme.ts` – niemals dynamisch
zusammensetzen (`bg-${x}-100` findet der Tailwind-Scanner nicht). Neue Tag-Kategorien immer dort
und in `TagCategory` (`lib/types.ts`) ergänzen.

Formen: abgerundete Ecken (Karten `rounded-2xl`, Chips/Buttons `rounded-full`). Typografie:
System-Sans-Serif über `--font-sans` in `app/globals.css`, Titel fett, Metadaten klein und
gedämpft. Bewusst keine Google-Font, damit der Build ohne Netzwerkzugriff funktioniert.

## Konventionen

- Alle Seiten und Komponenten sind Client-Komponenten (`"use client"`), weil sie den Store lesen.
- Imports über den Alias `@/` (siehe `tsconfig.json`).
- Reine Logik (Filter, Sortierung, Normalisierung) gehört nach `lib/` und bleibt React-frei.
- Für Fotos wird bewusst `<img>` statt `next/image` verwendet – die Quellen sind lokale
  Object-URLs, die der Image-Optimizer nicht verarbeiten kann.
- Neue Bilder-Object-URLs immer über `usePhotoUrl()` beziehen; beim Löschen `releasePhotoUrl()`
  aufrufen (passiert bereits im Store).
- Fotos einer noch nicht gespeicherten Aufgabe hängen an einer vorab erzeugten Task-ID; beim
  Abbrechen räumt `TaskDialog` sie über `removePhotosOfTask()` wieder weg.

## Deployment

Vercel, Framework-Preset „Next.js“, keine Umgebungsvariablen, kein Build-Override nötig. Da alles
statisch prerendered wird, gibt es keine Serverless-Functions und keine Datenbank-Anbindung.
