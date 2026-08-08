Dokumentation "HOUSEHELD"
CAS AIMP - Viben und Coden / FS26
Sandro Müntener / 08. August 2026



App-Beschrieb: 	Hausheld ist ein Haushaltsaufgaben-Tracker für Familien/WGs. Aufgaben können mit mehreren Fotos dokumentiert, Personen zugewiesen und mit Tags kategorisiert werden.
Zielgruppe: 	Familien oder WGs, die anfallende Haushaltsaufgaben gemeinsam erfassen und verteilen wollen
Problem: 	Haushaltsaufgaben werden mündlich oder in Chats verteilt und gehen dabei unter. Es fehlt ein zentraler, einfacher Ort, um zu sehen, was zu tun ist, wo genau und wer zuständig ist.
Lösung: 	Eine einfache Web-App, in der Aufgaben mit Fotos, Zuweisung und Tags erfasst und übersichtlich dargestellt werden.



# Hausheld

Haushaltsaufgaben für Familien und WGs an einem Ort: mit Fotos der betroffenen Stelle, klaren
Zuständigkeiten und Tags zum Wiederfinden.

Übungsprojekt aus dem Modul „Viben und Coden“ – Next.js 15, React 19, Tailwind CSS v4,
TypeScript.

## Starten

```bash
npm install
```

```bash
npm run dev
```

Danach http://localhost:3000 öffnen. Unter **Einstellungen → Beispieldaten laden** entstehen
3 Personen und 8 Aufgaben zum Ausprobieren.

## Funktionsumfang

- Aufgaben mit Titel, Beschreibung, Fälligkeitsdatum, Priorität und Status
- Mehrere Fotos pro Aufgabe (max. 10, je max. 10 MB), jederzeit ergänz- und entfernbar; beim
  Upload automatisch verkleinert und komprimiert
- Zuweisung an keine, eine oder mehrere Personen; Personen-Filter wird lokal gemerkt
- Globale Tags mit 31 vordefinierten Einträgen, frei erweiterbar, mit Warnung beim Löschen
  verwendeter Tags
- Filter nach Status, Priorität, Person und Tag (innerhalb einer Kategorie ODER, zwischen
  Kategorien UND) sowie Volltextsuche
- Listen- und Board-Ansicht, Sortierung nach Fälligkeits- oder Erstelldatum
- Löschen mit Zwei-Klick-Bestätigung, ohne Papierkorb

## Datenspeicherung

Alle Daten – inklusive der Fotos – liegen ausschliesslich lokal im Browser (IndexedDB, Datenbank
`hausheld`). Es gibt keinen Server, keine Cloud, keine externen Dienste, kein Login und keine
KI-Funktionen. Ein anderer Browser oder ein anderes Gerät hat entsprechend einen eigenen,
unabhängigen Datenbestand.

## Deployment

Auf Vercel als Next.js-Projekt importieren – ohne Umgebungsvariablen und ohne weitere
Konfiguration. Alle Seiten werden statisch ausgeliefert.

Details zur Architektur und zu den fachlichen Regeln: [CLAUDE.md](CLAUDE.md).
