Dokumentation "HOUSEHELD"
CAS AIMP - Viben und Coden / FS26
Sandro Müntener / 08. August 2026



App-Beschrieb: 	Hausheld ist ein Haushaltsaufgaben-Tracker für Familien/WGs. Aufgaben können mit mehreren Fotos dokumentiert, Personen zugewiesen und mit Tags kategorisiert werden.
Zielgruppe: 	Familien oder WGs, die anfallende Haushaltsaufgaben gemeinsam erfassen und verteilen wollen
Problem: 	Haushaltsaufgaben werden mündlich oder in Chats verteilt und gehen dabei unter. Es fehlt ein zentraler, einfacher Ort, um zu sehen, was zu tun ist, wo genau und wer zuständig ist.
Lösung: 	Eine einfache Web-App, in der Aufgaben mit Fotos, Zuweisung und Tags erfasst und übersichtlich dargestellt werden.



# Hausheld

Haushaltsaufgaben für Familien und WGs an einem Ort: mit Fotos, Zuständigkeiten und Tags.
Übungsprojekt (Modul „Viben und Coden“) – Next.js 15, React 19, Tailwind CSS v4, TypeScript.

## Starten

```bash
npm install
npm run dev
```

http://localhost:3000 öffnen. Unter **Einstellungen → Beispieldaten laden** gibt's 6 Personen
und 14 Aufgaben zum Ausprobieren.

## Funktionen

Aufgaben mit Titel, Fotos, Fälligkeitsdatum, Priorität, Status und Zuweisung an mehrere Personen ·
globale Tags mit Löschwarnung · Filter (Status/Priorität/Person/Tag) und Volltextsuche ·
Listen- und Board-Ansicht · Zwei-Klick-Löschen ohne Papierkorb.

## Daten

Alles liegt lokal im Browser (IndexedDB) – kein Server, keine Cloud, kein Login. Details zur
Architektur: [CLAUDE.md](CLAUDE.md).

## Deployment

Auf Vercel als Next.js-Projekt importieren, ohne weitere Konfiguration.
