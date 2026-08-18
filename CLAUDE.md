# CLAUDE.md

Leitfaden für die Arbeit an **Househeld** – einer App zum Erfassen und Verteilen von
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
statt „ß“). Deutsch ist die **Quellsprache**: neue UI-Texte zuerst in `lib/i18n/dictionaries.ts`
unter `de` ergänzen, dann `en` nachziehen (TypeScript meldet fehlende Keys, weil `en` gegen den
Typ von `de` geprüft wird).

## Architektur

Next.js 15 (App Router) + React 19 + Tailwind CSS v4 + TypeScript. **Es gibt keinen eigenen
Backend-/API-Code** – die gesamte fachliche Logik läuft im Browser, IndexedDB ist der einzige
Datenspeicher. Für Mehrsprachigkeit und SEO-Metadaten kommen Next-eigene Edge-Mechanismen zum
Einsatz (`middleware.ts`, dynamische `opengraph-image`/`apple-icon`) – das sind Next.js-Bordmittel
ohne eigene Server-/Datenbank-Anbindung, kein Widerspruch zur „kein Backend“-Regel.

```
middleware.ts           Locale-Rewrite: "/" (ohne Präfix) → intern "/de", "/en/…" bleibt explizit
app/
  [locale]/              Seiten je Sprache (de = kein Präfix, en = "/en/…"), alle "use client"
    layout.tsx           Root-Layout: <html lang>, Metadata/JSON-LD, I18nProvider, StoreProvider
    page.tsx              Alle Aufgaben (Liste + Board), Personen-Filter lokal gemerkt
    personen/              Personenverwaltung (+ layout.tsx für Metadata, da page.tsx Client ist)
    tags/                  Tagverwaltung inkl. Löschwarnung (+ layout.tsx für Metadata)
    einstellungen/         Statistik, Beispieldaten, Reset (+ layout.tsx für Metadata)
  robots.ts              /robots.txt
  sitemap.ts             /sitemap.xml (mit hreflang-Alternates de/en)
  manifest.ts            Web App Manifest
  opengraph-image.tsx    OG-Bild (next/og, generisch für beide Sprachen)
  apple-icon.tsx         apple-touch-icon (180×180, aus app/icon.svg generiert)
components/             UI-Bausteine (Chips, Modal, TaskCard, TaskDialog, …) – lesen Texte über `useT()`
lib/
  i18n/
    config.ts            Locale-Typ, DEFAULT_LOCALE, `localeHref()`
    dictionaries.ts       Alle UI-Texte (de = Quelle, en typgeprüft dagegen)
    context.tsx           `I18nProvider`, `useLocale()`, `useT()`
  db.ts                 IndexedDB-Zugriff (einzige Stelle mit IDB-API)
  store.tsx             React-Context: Zustand + alle Schreibaktionen (locale-abhängiges Seeding)
  types.ts              Domänentypen, Grenzwerte (Anzeige-Labels liegen in den i18n-Dictionaries)
  theme.ts              Farbzuordnung (Tag-Kategorie, Priorität, Status)
  filters.ts            Filter- und Sortierlogik (rein, ohne React)
  photos.ts             Bildverkleinerung/-komprimierung
  photo-url.ts          Object-URL-Cache + usePhotoUrl
  seed.ts               Vordefinierte Tags je Sprache (einmaliges Seeding)
  demo-data.ts          Beispieldaten je Sprache (lazy geladen)
```

### Mehrsprachigkeit (DE/EN)

- Deutsch bleibt ohne URL-Präfix erreichbar (`/`, `/personen`, …), Englisch liegt explizit unter
  `/en/…`. `middleware.ts` schreibt präfixlose Pfade intern auf `/de/…` um (Rewrite, keine
  sichtbare Weiterleitung) – bestehende Links/Bookmarks bleiben gültig.
- Jede Route liegt unter `app/[locale]/…`; Seiten sind Client-Komponenten und lesen Texte über
  `useT()` (liefert das Dictionary der aktuellen Sprache) bzw. `useLocale()`.
- `personen/`, `tags/`, `einstellungen/` haben je ein schlankes Server-`layout.tsx` nur für
  `generateMetadata()` (Title/Description/hreflang) – die eigentliche Seite bleibt Client-Code.
- **Seed-Tags und Beispieldaten sind sprachabhängig** (`lib/seed.ts`, `lib/demo-data.ts`). Welche
  Sprachversion beim ersten Start bzw. beim Laden der Beispieldaten angelegt wird, hängt von der zu
  dem Zeitpunkt aktiven Sprache ab – die App hat nur **eine** IndexedDB pro Browser, nicht eine pro
  Sprache.
- **Vordefinierte Tags werden beim Sprachwechsel automatisch mitübersetzt**
  (`translateKnownTagName()`/`reconcileTagLanguage()` in `lib/seed.ts`, aufgerufen aus
  `lib/store.tsx`): Jeder der 31 vordefinierten Tags ist in `PREDEFINED_TAG_ENTRIES` als
  DE/EN-Paar hinterlegt; stimmt ein gespeicherter Tag-Name exakt mit einer der beiden Varianten
  überein, wird er beim nächsten Start in die dann aktive Sprache umbenannt (gleiche ID, gleiche
  Zuordnung zu Aufgaben – nur der Name ändert sich). Die zuletzt aktive Sprache steht dafür in
  `meta.lastLocale`, **nicht** im React-State: Next.js mountet die Client-Komponenten des
  Locale-Layouts bei einem Sprachwechsel neu, ein `useRef`/`useState` würde die vorherige Sprache
  also verlieren.
  **Nicht** automatisch übersetzt werden selbst angelegte Tags sowie Aufgaben-Titel/-Beschreibungen
  – das sind Freitext-Nutzdaten, die sich ohne einen externen Übersetzungsdienst (Netzwerkaufruf,
  Widerspruch zum lokalen/privaten Charakter der App) nicht automatisch übersetzen lassen.
- Neue UI-Texte: Key zuerst in `de` (lib/i18n/dictionaries.ts) ergänzen, TypeScript zeigt dank
  `const en: typeof de = {…}` sofort, wo `en` nachgezogen werden muss.

**Demo-Daten und Netzwerk:** `demo-data.ts` lädt für jedes Beispielfoto ein von Hand kuratiertes,
offen lizenziertes Openverse-Bild über eine fest hinterlegte URL (`PhotoSpec.photoUrl`, kostenlos,
kein Key). Eine frühere Version nutzte stattdessen eine freie Live-Textsuche (Top-1-Treffer) – das
lieferte zu oft thematisch unpassende oder gar unangemessene Bilder, weil die Suche unkuratiert
ist und nur das erste Ergebnis verwendet wurde. Die `photoUrl`s zeigen bewusst auf Openverse's
eigenen Thumbnail-Proxy (`api.openverse.org/v1/images/{id}/thumb/`) statt auf den jeweiligen
Original-Host (Flickr, WordPress, …), damit der Abruf innerhalb der bestehenden CSP bleibt
(`connect-src` erlaubt nur `api.openverse.org`, siehe `next.config.ts`) und nicht pro Bild-Provider
eine neue Domain freigegeben werden muss. Die Bilder sind ausserdem bewusst mit CC0/BY/BY-SA-Lizenz
gewählt (keine ND-Klausel), weil die Upload-Pipeline jedes Bild verkleinert/komprimiert – das zählt
lizenzrechtlich als Bearbeitung. Schlägt der Abruf fehl (offline, Bild entfernt, Timeout) oder ist
keine `photoUrl` gesetzt, fällt die jeweilige Aufgabe automatisch auf ein generiertes
Farb-Platzhalterbild zurück – der Demo-Button darf dadurch nie hängen bleiben oder fehlschlagen.
Das ist die **einzige** Stelle in der App, die einen externen Netzwerkaufruf macht; die reguläre
Nutzung (eigene Aufgaben, eigene Fotos) bleibt vollständig lokal/offline-fähig.

### Persistenz

Alle Daten liegen in **IndexedDB** (Datenbank `househeld`), Fotos als `Blob` im Store
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
- Nicht im Umfang: Auth, KI-Funktionen, Push, Vorher-/Nachher-Fotos, Papierkorb, visuelle
  Kennzeichnung überfälliger Aufgaben. Mehrsprachigkeit (DE/EN) ist über das PRD hinaus ergänzt
  worden, siehe „Mehrsprachigkeit (DE/EN)“ oben.

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

Vercel, Framework-Preset „Next.js“, keine Umgebungsvariablen, kein Build-Override nötig, Domain
`https://househeld-app.vercel.app/`. Fachliche Seiten werden statisch prerendert (pro Locale, via
`generateStaticParams`); `middleware.ts` läuft als Edge-Function nur für das Locale-Rewriting,
`opengraph-image.tsx`/`apple-icon.tsx` generieren Bilder on-demand. Es gibt weiterhin **keine
Datenbank-Anbindung und keine eigene API** – diese Next-Mechanismen ersetzen keine
Server-Fachlogik, die bleibt vollständig im Client.

## SEO/AEO/GEO

- `app/robots.ts`, `app/sitemap.ts` (mit hreflang-Alternates de/en), `app/manifest.ts`,
  `app/opengraph-image.tsx`, `app/apple-icon.tsx`.
- `app/[locale]/layout.tsx` setzt `metadataBase`, Title-Template, Open-Graph/Twitter-Metadata und
  ein `SoftwareApplication`-JSON-LD (für Answer-/Generative-Engines) pro Sprache.
- `personen/`, `tags/`, `einstellungen/` haben eigene, sprachspezifische Title/Description über
  ihr jeweiliges `layout.tsx` (`generateMetadata`), statt den Root-Title zu erben.
- `public/llms.txt` beschreibt die App kurz für LLM-Crawler (GEO).
- Foto-Alt-Texte referenzieren den Aufgabentitel (`t.photos.altText`) statt des rohen Dateinamens.
