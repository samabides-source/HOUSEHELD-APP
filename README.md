# Dokumentation "HOUSEHELD"
CAS AIMP - Viben und Coden / FS26

Sandro Müntener / 17. August 2026


### App-Beschrieb: ###
Hausheld ist ein Haushaltsaufgaben-Tracker für Familien/WGs. Aufgaben können mit mehreren Fotos dokumentiert, Personen zugewiesen und mit Tags kategorisiert werden.

### Zielgruppe: ###
Familien oder WGs, die anfallende Haushaltsaufgaben gemeinsam erfassen und verteilen wollen.

### Problem: ###
Haushaltsaufgaben werden mündlich oder in Chats verteilt und gehen dabei unter. Es fehlt ein zentraler, einfacher Ort, um zu sehen, was zu tun ist, wo genau und wer zuständig ist.

### Lösung: ###
Eine einfache Web-App, in der Aufgaben mit Fotos, Zuweisung und Tags erfasst und übersichtlich dargestellt werden.

## Inhaltsverzeichnis

- [Links](#links)
- [Ideenfindung & Entwicklung PRD](#ideenfindung--entwicklung-prd)
- [Entwicklungsprozess APP](#entwicklungsprozess-app)
- [Entwicklungsprozess SITE](#entwicklungsprozess-site)
- [Reflexion](#reflexion)
- [Beispielprompt](#beispielprompt)
- [PRD-/SPEC-File(#prd-hausheld--haushaltsaufgaben-tracker)
- [Security-Checkliste](#security-checkliste-für-vibe-coded-apps--ausgefüllt-für-hausheld)
- [Notes Sandro](#notes-sandro)

## Links
**App**
https://househeld-app.vercel.app/

Hinweis: Die App speichert alle Daten nur lokal im jeweiligen Browser. Damit du nicht mit einer leeren App startest: Rechts oben auf „Einstellungen" klicken und „Beispieldaten laden" drücken – dann sind Aufgaben, Personen und Fotos zum Ausprobieren da.

**Marketing-Seite**
https://househeld-page.vercel.app/

**Marketing-Seite: Github Repository**
https://github.com/samabides-source/HOUSEHELD-PAGE

**Video-Walkthrough**
Folgt noch. Aufzeichnung mit Teams. samuel@codecrush.ch einladen.

## Ideenfindung & Entwicklung PRD

**Ausgangslage & Ideenfindung**

Im Rahmen einer Vibe-Coding-Einführung sollte eine einfache, lokal hostbare App ohne KI-Funktionen entstehen – rein zu Ausbildungszwecken, ohne Veröffentlichung. Aus einer ersten Liste von fünf App-Vorschlägen (u. a. Habit-Tracker, Rezeptbuch, Pomodoro-Timer, Haushaltsbuch, Kanban-Board) entstand die konkrete Idee für einen Haushaltsaufgaben-Tracker: Aufgaben erfassen, mit Fotos dokumentieren, Personen zuweisen und mit Tags kategorisieren.

**Meilensteine**
- Konzeption: Aus der Grundidee wurde ein ausführlicher App-Beschrieb mit Kern-Features (Aufgaben, Fotos, Zuweisung, Tags, Filter) sowie möglichen späteren Erweiterungen entwickelt.
- Erstes PRD: Daraus entstand ein erstes, strukturiertes PRD-Dokument.
- Tag-System: Eine vordefinierte Tag-Liste wurde erarbeitet und iterativ verfeinert (Räume, Aussenbereich, Aufgabentyp, Technik & Geräte, Sonstiges) – am Ende 32 vordefinierte Tags, ergänzbar durch frei erstellbare.
- Zweite Iteration: Eine parallel mit ChatGPT erstellte, feinere PRD-Version brachte weitere Präzisierungen, die ins PRD übernommen wurden.
- Technische Ausrichtung: Als Tech-Stack wurde Node.js + Express mit lowdb (kostenlose, JSON-Datei-basierte Datenbank ohne SQL) festgelegt.
- Design: Aus fünf vorgeschlagenen Design-Richtungen wurde "Verspielt & bunt" gewählt: farbcodierte Tag-Kategorien, ein davon getrenntes Prioritäts-Farbsystem, abgerundete Formen, Avatar-Kreise für Personen.
- Ergebnis: Ein finales, in sich konsistentes PRD sowie zwei Agenten-Kontextdateien (CLAUDE.md für Claude Code, AGENTS.md für Cursor), die alle Business-Regeln, den Tech-Stack und die Design-Vorgaben zusammenfassen – bereit für die praktische Umsetzung mit Claude Code.

**Wichtige Anpassungen**

- Mehrere Fotos statt nur eines pro Aufgabe, jederzeit austauschbar oder entfernbar
- Verhalten beim Löschen von Personen: Aufgaben bleiben bestehen und werden automatisch "nicht zugewiesen"
- Warnhinweis beim Löschen noch verwendeter Tags, statt sie kommentarlos zu entfernen
- Klare Trennung zwischen Priorität "dringend" und Tags (kein Doppel-Konzept)
- Bestätigung per zweitem Klick beim Löschen von Aufgaben (kein versehentliches Löschen, kein Papierkorb)
- Präzisierungen aus der ChatGPT-Iteration: Foto-Formate/-Limits, Verhalten bei fehlenden Dateien, UND/ODER-Logik bei Filtern, Standardsortierung, Seed-Daten-Verhalten der Tags
- Wechsel von SQLite auf lowdb als einfachere, lizenzkostenfreie Datenbank-Lösung für das Lernprojekt

## Entwicklungsprozess APP

**Meilensteine**

Nach dem finalen PRD liess ich die App in einer ersten Session vollständig mit Claude Code umsetzen: Next.js 15 (App Router), React 19, Tailwind CSS v4, TypeScript. Dabei wich Claude bewusst vom PRD ab, das ein Backend mit Node.js/Express und der Datenbank lowdb vorsah – da die App auf Vercel (serverless, read-only Dateisystem) deployt werden sollte, wurde die Persistenz clientseitig über IndexedDB umgesetzt. Konsequenz, die von Anfang an transparent kommuniziert wurde: Der Datenbestand liegt pro Browser/Gerät, nicht geräteübergreifend geteilt. Alle PRD-Kernfunktionen (Aufgaben, Fotos, Personen, Tags, Filter, Löschbestätigung) wurden anschliessend im Browser end-to-end durchgetestet, inkl. Build/Lint/Typecheck.

In einer späteren, grösseren Session wurde die App auf SEO/AEO/GEO geprüft und auf Wunsch zusätzlich vollständig zweisprachig gemacht (DE/EN). Umgesetzt wurden u. a. robots.ts, sitemap.ts (mit hreflang-Alternates), ein Web App Manifest, JSON-LD (SoftwareApplication) pro Sprache, dynamische Open-Graph-/Apple-Touch-Icons sowie llms.txt für generative Suchmaschinen. Für die Übersetzung entstand ein eigenes i18n-System (lib/i18n/): Deutsch bleibt ohne URL-Präfix erreichbar, Englisch liegt unter /en/…, intern per middleware.ts umgeschrieben, damit bestehende Links gültig bleiben.

Zum Abschluss wurde in einer separaten Session eine vorgegebene Security-Checkliste für vibe-gecodete Apps durchgearbeitet (siehe eigener Abschnitt weiter unten im Dokument). Ergebnis: keine Secrets im Code, kein Server-/API-Code, der klassische Angriffsflächen böte; im Gespräch wurden zusätzlich GitHub-Repo-Einstellungen (Secret Scanning, Push Protection, Dependabot, Branch Protection) und die Vercel-Konfiguration (Deployment Protection, Environment Variables) gemeinsam geprüft und gehärtet.

**Wichtige Anpassungen**

Über mehrere Feedbackrunden hinweg wurden u. a. folgende Änderungen umgesetzt:
- Tag-Farben im Dialog „Neue Aufgabe" an die Kategorie-Farben aus der Tag-Verwaltung angeglichen (vorher nur einheitliches Grau).
- Fotos in der Aufgabenübersicht (Liste und Board) anklickbar/vergrösserbar gemacht (Modal), analog zur bereits bestehenden Ansicht im Bearbeiten-Dialog.
- Ein abgeschnittenes Filter-Label („Aussenbereich") behoben: Ursache war eine feste Breite kombiniert mit overflow-hidden des Einklapp-Containers; das Label steht seither auf einer eigenen Zeile.
- Beispieldaten von 3 Personen/8 Aufgaben auf 6 Personen/14 Aufgaben erweitert und um thematisch passende Symbolbilder ergänzt: Diese werden beim Laden der Beispieldaten über die kostenlose, keyless Openverse-API gesucht, mit automatischem Fallback auf ein generiertes Farb-Platzhalterbild, falls kein Internet verfügbar ist oder die Suche nichts liefert.
- Die Seite „Meine Aufgaben" wurde nach kurzer Rückfrage entfernt (redundant zum Personen-Filter auf der Aufgaben-Seite); stattdessen merkt sich die Aufgaben-Seite die zuletzt gewählte Person jetzt selbst lokal im Browser. Die Navigation wurde gleichzeitig so angepasst, dass „Aufgaben" optisch präsenter ist als „Personen", „Tags" und „Einstellungen".
- Texte auf der Einstellungen-Seite mehrfach gekürzt bzw. entfernt (u. a. der ganze Abschnitt „Speicherort" inkl. Speicherplatzanzeige), um die Seite schlanker zu halten.
- Das README wurde zwischendurch für Endnutzer:innen der App deutlich gekürzt (separat von diesem Kursdokumentations-Abschnitt).

**Bugfixes**

- Performance/Robustheit bei den Beispieldaten: Der erste Versuch, alle Symbolbilder gleichzeitig von Openverse zu laden, schlug in der Praxis grösstenteils fehl (zu viele parallele Verbindungen). Fix: Downloads auf maximal 3 gleichzeitige Anfragen begrenzt – dadurch zuverlässig und sogar schneller als der ursprüngliche Ansatz.
- Tags wurden beim Sprachwechsel nicht übersetzt: Ursache war, dass Next.js beim Sprachwechsel die Client-Komponenten neu mountet, wodurch ein zur Erkennung genutzter useRef jedes Mal zurückgesetzt wurde. Fix: Die zuletzt aktive Sprache wird seither in IndexedDB gespeichert (meta.lastLocale) statt im React-State, wodurch die Übersetzung der 31 vordefinierten Tags zuverlässig bei jedem Sprachwechsel greift.
- Folgebug, entdeckt nach dem ersten Fix: Nach „Alle Daten löschen" wurde auch der lastLocale-Marker gelöscht, wodurch der nächste Sprachwechsel die Tags nicht mehr übersetzte (erst der übernächste Wechsel „reparierte" es wieder) – reproduziert sowohl im Dev- als auch im Produktions-Build. Fix: resetEverything() setzt den Marker nach dem Neu-Seeding jetzt explizit wieder.
- Geprüft, aber bewusst nicht umgesetzt: eine echte automatische Übersetzung von frei eingegebenen Aufgaben-Titeln/-Beschreibungen. Recherchiert wurden die neue, rein lokale „Built-in Translator API" von Chrome/Edge (nur Desktop-Chrome/Edge) sowie externe Dienste wie MyMemory und LibreTranslate. Verworfen, weil externe Dienste Aufgabendaten an Dritte senden würden – ein Widerspruch zum Kernprinzip „alle Daten bleiben lokal im Browser". Als bekannte Einschränkung im README dokumentiert.

## Entwicklungsprozess SITE

**Meilensteine**

Die Marketingseite entstand als Grundgerüst mit fünf Seiten (Home, Features, FAQ, About, App
testen), im gleichen Design wie die App. Danach kamen eine Kontaktadresse auf der About-Seite
sowie Fotos auf Home und Features dazu, und die About-Seite wurde neu strukturiert: Projekt,
Technik und Hintergrundentscheide sind seither in einer aufklappbaren Kachel zusammengefasst.

Der grösste Schritt war eine vollständige SEO-, AEO- und GEO-Überarbeitung kombiniert mit dem
Aufbau einer kompletten englischen Sprachversion. Die Inhalte wurden dafür in getrennte deutsche
und englische Dateien mit gemeinsamer Struktur aufgeteilt, Deutsch ohne Präfix, Englisch unter
eigenem Pfad. Ergänzt wurden strukturierte Daten für Suchmaschinen und Sprachassistenten,
dynamisch generierte Vorschaubilder, eine maschinenlesbare Zusammenfassung für KI-Crawler sowie
Sprachverweise auf jeder Seite.

Zum Schluss wurde die Verlinkung zur App sprachabhängig gemacht, nachdem auch die App selbst eine
englische Version erhielt: Alle Links sowie das App-Mockup zeigen seither je nach gewählter
Sprache auf die passende Version.

**Wichtige Anpassungen**

- Das Home-Foto wurde mehrfach ausgetauscht, bis ein passendes Motiv gefunden war – die Lizenz
  wurde dabei sauber pro Bild dokumentiert.
- Die Inhalte wurden von einer einzelnen Content-Datei auf getrennte, sprachspezifische Dateien
  mit gemeinsamer Struktur umgestellt, als Grundlage für die Zweisprachigkeit.
- Die App-Verlinkung wurde von einer festen URL auf eine sprachabhängige Zuordnung umgebaut,
  ebenso das App-Mockup, das seither je nach Sprache passende Texte zeigt.

**Bugfixes**

- Ein bei jedem Build neu gesetztes, bedeutungsloses Datum in der Sitemap wurde fest gesetzt.
- Die Sprachangabe des Dokuments wurde korrigiert.
- Überflüssige Screenreader-Ausgaben bei den Logo-Symbolen wurden unterdrückt.
- Verwaiste Verweise auf die alte Content-Datei wurden bereinigt.
- Eine überholte Aussage zur App-Oberfläche wurde im Leitfaden korrigiert.

## Reflexion
Folgt noch... 
Positiv überrascht über die transparente Kommunikation. Und wie es Claude Sachen abcheckt, also mein Update im Readme. Denkt Fallback-Varianten mit (z.B. kein Internet, Datenbank lokal)

## Beispielprompt
"Ich muss die auf Vercel deployte App meinem Dozenten schicken. Dieser wird sie via URL aufrufen und anschauen. Nun erhält er aktuell eine "leere" App, ohne Aufgaben und ohne Personen. Ist es nicht doch irgendwie möglich, dass von mir erfasste Aufgaben und Personen an neue User weitergegeben werden? Mach mir Vorschläge, die für mich mit keinen Kosten verbunden sind."

# PRD: Hausheld – Haushaltsaufgaben-Tracker

## 1. Übersicht

**Projektname:** Hausheld
**Zweck:** Übungsprojekt (Vibe Coding), lokal hostbar, keine Veröffentlichung, keine AI-Tools
**Zielgruppe:** Familien oder WGs, die anfallende Haushaltsaufgaben gemeinsam erfassen und verteilen wollen

**Problem:** Haushaltsaufgaben werden mündlich oder in Chats verteilt und gehen dabei unter. Es fehlt ein zentraler, einfacher Ort, um zu sehen, was zu tun ist, wo genau und wer zuständig ist.

**Lösung:** Eine einfache Web-App, in der Aufgaben mit Fotos, Zuweisung und Tags erfasst und übersichtlich dargestellt werden.

## 2. Ziele

- Zentrale, übersichtliche Erfassung aller Haushaltsaufgaben
- Klare Zuständigkeiten durch Personenzuweisung
- Schnelles Wiederfinden von Aufgaben durch Tags/Filter
- Visuelle Klarheit durch Fotos der betroffenen Stelle

## 3. Nicht-Ziele (Out of Scope)

- Kein Login-/Auth-System (Personen sind vordefinierte Namen, kein Passwortschutz)
- Keine externe Bereitstellung/Deployment im Internet
- Keine KI-Funktionen (z. B. keine automatische Aufgabenerkennung aus Fotos)
- Keine Push-Benachrichtigungen oder externe Dienste
- Keine Mehrsprachigkeit (nur Deutsch)
- Kein Vorher-/Nachher-Foto-Feature

## 4. Nutzer & Rollen

- **Haushaltsmitglied**: kann Aufgaben erstellen, bearbeiten, sich selbst oder andere zuweisen, Status ändern
- Es gibt keine unterschiedlichen Berechtigungsstufen – alle Mitglieder haben dieselben Rechte
- Personen können angelegt, umbenannt und gelöscht werden
- **Wird eine Person gelöscht**, werden ihre Zuweisungen entfernt; die Aufgaben selbst bleiben bestehen und sind anschliessend "nicht zugewiesen"

## 5. Kern-Features

### 5.1 Aufgaben erfassen
- Titel (Pflichtfeld)
- Beschreibung (optional)
- Erstelldatum (automatisch)
- Fälligkeitsdatum (optional)
- Priorität: niedrig / mittel / dringend
- Status: offen / in Arbeit / erledigt
- Status kann jederzeit manuell geändert werden, auch von "erledigt" zurück auf "offen" oder "in Arbeit"
- Überfällige Aufgaben behalten ihren normalen Status; eine spezielle visuelle Kennzeichnung ist nicht Teil des ersten Wurfs
- Eine Aufgabe kann **ohne zugewiesene Person** angelegt werden

### 5.2 Foto-Anhang
- **Mehrere Fotos pro Aufgabe** können hochgeladen werden (z. B. Fotos der betroffenen Stelle)
- Fotos sind **jederzeit austauschbar, entfernbar oder neu hochladbar** (nicht nur beim Anlegen)
- Foto-Upload ist beim Anlegen einer Aufgabe **optional**
- Fotos werden lokal im Dateisystem gespeichert und als eigene Einträge mit Referenz zur Aufgabe verwaltet
- Unterstützte Bildformate: JPG/JPEG, PNG, WebP und HEIC
- Maximal 10 Fotos pro Aufgabe und 10 MB pro Foto
- Fotos werden beim Upload auf eine sinnvolle maximale Auflösung reduziert und komprimiert
- Beim Entfernen eines Fotos werden Referenz und physische Datei gelöscht
- Beim Löschen einer Aufgabe werden sämtliche zugehörigen Fotodateien und Referenzen gelöscht
- Fehlt eine referenzierte Fotodatei, bleibt die Aufgabe nutzbar; das fehlende Foto wird als nicht verfügbar behandelt und kann entfernt werden

### 5.3 Personenzuweisung
- Liste von Haushaltsmitgliedern kann verwaltet werden (anlegen, umbenennen, löschen)
- Eine Aufgabe kann keiner, einer oder mehreren Personen zugewiesen werden
- Jede Person besitzt eine eindeutige interne ID; der Name ist nur die Anzeige
- Eine Aufgabe kann jederzeit vollständig von allen Personen entkoppelt werden
- Ansicht "Meine Aufgaben" pro Person; eine Aufgabe mit mehreren Zuweisungen erscheint bei jeder zugewiesenen Person
- Die Auswahl der Person für "Meine Aufgaben" wird lokal im Browser gespeichert

### 5.4 Tags/Kategorien
- Tags sind global für die lokale Installation und frei definierbar bzw. neu erstellbar
- Tags sind eindeutig; Gross-/Kleinschreibung sowie führende/abschliessende Leerzeichen werden bei der Prüfung ignoriert
- Neue Tags können direkt in der Aufgabenmaske erstellt werden
- Zusätzlich existiert eine vordefinierte Tag-Datenbank (siehe unten)
- Eine Aufgabe kann mehrere Tags haben
- **Löschen eines Tags:** Ist der Tag noch in Gebrauch, erscheint ein Warnhinweis, dass der Tag noch verwendet wird. Bestätigt der Nutzer den Löschvorgang trotzdem, wird der Tag von allen betroffenen Aufgaben entfernt
- Vordefinierte Tags können ebenfalls gelöscht werden und unterliegen keinen Sonderrechten
- **Hinweis:** "dringend" ist ausschliesslich eine Priorität (siehe 5.1) und **kein Tag**

**Vordefinierte Tags:**

| Bereich | Tags |
|---|---|
| Räume | Küche, Wohnzimmer, Schlafzimmer, Bad EG, Bad OG, Kinderzimmer 1, Kinderzimmer 2, Büro, Keller, Garage, Reduit |
| Aussenbereich | Garten, Terrasse, Balkon OG |
| Aufgabentyp | Reparatur, Reinigung, Einkauf, Wartung, Entsorgung, Organisation, Pflanzenpflege, Wäsche, Möbel |
| Technik & Geräte | Elektro, Sanitär/Wasser, Heizung, Geräte/Elektronik |
| Sonstiges | Termine/Verwaltung, Kinder, Tiere, Sonstiges |

*(32 vordefinierte Tags total; die Liste ist nicht abschliessend, weitere Tags können frei erstellt werden.)*

### 5.5 Übersicht & Filter
- Standardansicht ist die Listenansicht; zusätzlich kann eine Board-Ansicht verwendet werden
- Filter nach Person, Tag, Status, Priorität
- Filter verschiedener Kategorien werden mit UND kombiniert
- Mehrere ausgewählte Werte innerhalb einer Kategorie werden mit ODER kombiniert
- Standardsortierung: Fälligkeitsdatum aufsteigend; Aufgaben ohne Fälligkeitsdatum anschliessend, dort nach Erstelldatum absteigend
- Sortierung kann nach Fälligkeitsdatum oder Erstelldatum geändert werden

### 5.6 Löschen von Aufgaben
- Das Löschen einer Aufgabe muss durch einen **zweiten Klick bestätigt werden** (keine versehentlichen Löschungen)
- Das Löschen ist endgültig; es gibt keinen Papierkorb

## 6. Design-Richtung

**Stil:** "Verspielt & bunt" – familienfreundlich und klar, mit eigener Farbe pro Tag-Kategorie. Zielgruppe sind die Erwachsenen im Haushalt (siehe Abschnitt 4), das Design soll deshalb zugänglich, aber nicht kindlich wirken.

- **Grundfarben:** helles Grau/Weiss als Hintergrund, dunkles Grau für Text – ruhige Basis, damit die Akzentfarben nicht überladen wirken
- **Akzentfarben pro Tag-Bereich** (konsistent als Chip-Hintergrund verwendet):
  - Räume → Blau
  - Aussenbereich → Grün
  - Aufgabentyp → Amber/Orange
  - Technik & Geräte → Violett
  - Sonstiges → Pink
- **Priorität:** eigenes Farbsystem, getrennt von den Tag-Farben, um Verwechslung zu vermeiden (z. B. niedrig = neutral/grau, mittel = amber, dringend = rot)
- **Formen:** abgerundete Ecken bei Karten, Chips und Buttons – kein scharfkantiges, technisches Erscheinungsbild
- **Fotos:** Vorschaubilder mit abgerundeten Ecken in der Aufgabenkarte; mehrere Fotos als kleine Thumbnail-Reihe
- **Personen:** Avatar-/Initialen-Kreis pro Person, eigene Farbe unabhängig vom Tag-Farbsystem
- **Typografie:** eine gut lesbare Sans-Serif-Schrift mit klarer Hierarchie (Titel grösser/fett, Metadaten wie Datum/Person kleiner und gedämpft)
- **Status-Anzeige:** Board-Spalten (offen / in Arbeit / erledigt) farblich dezent, nicht mit Tag- oder Prioritätsfarben verwechselbar
- **Grundprinzip:** Farbe trägt Bedeutung (Kategorie, Priorität, Person), nicht nur Dekoration – bei vielen Tags nicht mehr Farben einsetzen als nötig

## 7. User Stories

1. Als Haushaltsmitglied möchte ich eine neue Aufgabe mit Titel und Fotos erfassen, damit andere sehen, was zu tun ist und wo.
2. Als Haushaltsmitglied möchte ich eine Aufgabe einer Person zuweisen, damit klar ist, wer zuständig ist.
3. Als Haushaltsmitglied möchte ich eine Aufgabe auch ohne Zuweisung anlegen können, wenn noch unklar ist, wer sie übernimmt.
4. Als Haushaltsmitglied möchte ich Aufgaben mit Tags versehen, damit ich sie später leicht wiederfinde.
5. Als Haushaltsmitglied möchte ich alle Aufgaben mit Priorität "dringend" filtern können, um zu sehen, was zuerst erledigt werden muss.
6. Als Haushaltsmitglied möchte ich den Status einer Aufgabe ändern (z. B. auf "erledigt"), damit der Fortschritt sichtbar ist.
7. Als Haushaltsmitglied möchte ich eine Person auswählen und deren zugewiesene Aufgaben in einer separaten Ansicht sehen.
8. Als Haushaltsmitglied möchte ich Fotos einer Aufgabe jederzeit austauschen oder entfernen können, damit die Dokumentation aktuell bleibt.
9. Als Haushaltsmitglied möchte ich beim Löschen eines noch verwendeten Tags gewarnt werden, damit ich nicht versehentlich Kategorisierungen verliere.
10. Als Haushaltsmitglied möchte ich beim Löschen einer Aufgabe eine Bestätigung sehen, damit ich nichts versehentlich lösche.

## 8. Technische Rahmenbedingungen

- Muss vollständig lokal hostbar sein (kein Cloud-Deployment)
- Keine Nutzung von KI-Tools oder externen AI-APIs
- Backend: Node.js + Express
- Datenbank: lowdb (JSON-Datei-basiert, kostenloses npm-Paket, kein SQL); als reguläre Projekt-Abhängigkeit via `npm install lowdb` eingebunden, kein separater Installationsschritt für Endnutzer
- Vordefinierte Tags werden beim ersten Start als Seed-Daten angelegt und danach wie normale Tags behandelt
- Fotos werden lokal im Dateisystem gespeichert
- Kein Auth-System notwendig

## 9. Erweiterungen für später (nicht Teil des ersten Wurfs)

- Wiederkehrende Aufgaben (z. B. automatisches Neuanlegen alle 2 Wochen)
- Kommentare/Verlauf zu einer Aufgabe
- Einfache Punkte-/Bestenliste pro Person
- Export der Aufgabenliste als CSV/PDF
- Visuelle Kennzeichnung überfälliger Aufgaben

## 10. Erfolgskriterien (für dieses Übungsprojekt)

- App läuft lokal fehlerfrei
- Aufgaben können vollständig angelegt, bearbeitet, gefiltert und als erledigt markiert werden
- Foto-Upload (mehrere Fotos, jederzeit änderbar) funktioniert zuverlässig
- Zuweisung und Tags funktionieren wie beschrieben, inkl. Warnhinweis beim Löschen genutzter Tags
- Design folgt der festgelegten Richtung "Verspielt & bunt" (Tag-Farben, Formen, Typografie gemäss Abschnitt 6)
- Die App wird mit Testdaten durchgespielt (z. B. 5–10 Aufgaben, 2–3 Personen, mehrere Tags), um den Ablauf end-to-end zu prüfen


# Security-Checkliste für Vibe-coded Apps — ausgefüllt für **Hausheld**

Geprüft am: 2026-08-08
Repo: `samabides-source/HOUSEHELD-APP` (main, Stand Commit `b0c51b1`)
Stack laut `CLAUDE.md`: Next.js 15 App Router, **keine API-Routen, kein Server-Code**, keine
Datenbank, kein Auth — alle Daten liegen clientseitig in IndexedDB. Kein Supabase im Einsatz.

> Ursprünglich hatte ich keinen Zugriff auf GitHub-Repo-Einstellungen und das Vercel-Dashboard
> (kein `gh`-CLI, kein Vercel-Login in dieser Umgebung). Diese Punkte wurden danach gemeinsam mit
> dem Nutzer manuell durchgegangen, der direkt im GitHub-Repo (`Settings → Advanced Security`,
> `Settings → Branches`) und im Vercel-Dashboard nachgeschaut und dabei auch gleich Secret
> Scanning, Push Protection, Dependabot und Branch Protection auf `main` aktiviert hat
> (Stand 2026-08-08, alles unten entsprechend nachgetragen).
>
> Auftrag war ursprünglich, Probleme nur zu **identifizieren**, nicht zu beheben — die
> GitHub-Einstellungen wurden auf Wunsch des Nutzers im Gespräch trotzdem direkt behoben. Die
> restlichen, rein code-/dokumentationsseitigen Punkte (siehe Zusammenfassung unten) sind
> weiterhin nur identifiziert, nicht behoben.

---

## Kritische Punkte

### 1. Keine Secrets im Code oder Repo

- [x] Repo nach `key`, `secret`, `token`, `password`, `api` durchsucht — 19 Treffer, alles
      unkritisch (Funktions-/Variablennamen wie `isAcceptedFile`, die Openverse-API-URL). **Kein
      einziger `process.env`-Zugriff im gesamten Code** — die App braucht strukturell keine Secrets.
- [x] Keine `.env`-Datei im Repo. Volltextsuche über die komplette Commit-History
      (`git log --all -p`) nach Secret-Mustern (`sk-…`, `service_role`, `AKIA…`, `api_key=…`) —
      keine Treffer.
- [x] `.gitignore` enthält `.env*` (mit Ausnahme `.env.example`) — korrekt gesetzt.
- [x] API-Keys in Vercel Env Vars statt Code — entfällt, die App verwendet gar keine API-Keys (die
      Openverse-Bildersuche in `lib/demo-data.ts` ist laut CLAUDE.md bewusst keyless).
- [x] **GitHub Secret Scanning / Push Protection aktiviert** — vom Nutzer im Repo unter
      Settings → Advanced Security geprüft und eingeschaltet: Secret scanning **Enabled**,
      Push protection **eingeschaltet** (2026-08-08).

### 2. Keine Secrets im Client-Bundle

- [x] Keine `NEXT_PUBLIC_`/`VITE_`/`REACT_APP_`-Variable mit Geheimnis — es gibt keine einzige
      Umgebungsvariable im Code (bestätigt per Grep auf `process.env`, 0 Treffer).
- [x] Supabase anon/service_role-Trennung — entfällt, kein Supabase im Stack.
- [x] Build durchgeführt (`npm run build`) und `.next/static` nach `sk-`, `service_role`, `secret`
      durchsucht — keine Treffer (erwartbar, da keine Secrets existieren).
- [ ] Zusatzprüfung im Browser (Seitenquelltext auf publizierter URL) — **nicht durchgeführt**,
      da mir keine öffentliche Deployment-URL vorlag. Nach jedem Deploy einmal manuell empfohlen.

### 3. Login und Accounts nur über etablierte Mechanismen

- [x] **N/A** — laut CLAUDE.md explizit nicht im Umfang ("Nicht im Umfang: Auth"). Im Code kein
      Login-, Passwort- oder Session-Handling gefunden.

### 4. Datenbank-Zugriffsregeln aktiv

- [x] **N/A** — keine serverseitige Datenbank. Persistenz läuft ausschliesslich über IndexedDB im
      Browser des jeweiligen Geräts (`lib/db.ts`), pro Gerät isoliert. Row Level Security ist auf
      dieses Modell nicht anwendbar, da keine zentrale, mandantenfähige Datenbank existiert.

### 5. Jede API-Route prüft selbst

- [x] **N/A für Session/Autorisierung/CORS** — es gibt keine `app/api`-Routen und keine Server
      Actions; alle Seiten sind `"use client"` (bestätigt durch Durchsicht von `app/`).
- [x] File-Uploads sind begrenzt: `lib/photos.ts` erzwingt max. 10 MB/Datei
      (`MAX_PHOTO_BYTES`) und `lib/types.ts` max. 10 Fotos/Aufgabe (`MAX_PHOTOS_PER_TASK`),
      Typprüfung über `isAcceptedFile()`. Dateien landen nicht in einem öffentlichen Ordner,
      sondern als Blob in IndexedDB — nicht ausführbar, nicht über eine URL erreichbar.

### 6. Deployment-Schutz auf Vercel

- [x] Deployment Protection aktiviert — vom Nutzer im Vercel-Dashboard geprüft: Steht auf
      **"Standard Protection"**, das ist die von Vercel empfohlene Standardeinstellung (2026-08-08).
- [x] Env-Variablen pro Umgebung getrennt — vom Nutzer geprüft: Unter Project Settings →
      Environments ist die Liste **leer**, es sind keine Variablen gesetzt. Das ist der erwartete
      Zustand, da die App laut CLAUDE.md keine Umgebungsvariablen benötigt (2026-08-08).
- [ ] Publizierte URL im Inkognito-Fenster geprüft — nicht durchgeführt, keine URL bekannt.
- [x] Admin-/Testseiten ohne Login erreichbar — es gibt keine Admin-Bereiche in der App; alle
      Seiten (`/`, `/personen`, `/tags`, `/einstellungen`) sind bewusst öffentlich nutzbar
      (kein Auth im Scope), das ist also kein Leck, sondern Design.

---

## Empfohlene Punkte

### 7. Claude Code selbst absichern

- [x] `.claude/settings.local.json` geprüft: enthält ausschliesslich Allow-Regeln für
      `npm install/view/run` und `npx tsc` — keine Shell-Befehle mit Netzwerk-Schreibzugriff,
      **keine Hooks** konfiguriert.
- [x] Kein `.mcp.json` im Repo — keine MCP-Server-Anbindung im Projekt selbst hinterlegt.
- [ ] Nutzung von `--dangerously-skip-permissions` — von hier aus nicht rückwirkend prüfbar
      (liegt ausserhalb des Repo-Inhalts).

### 8. Abhängigkeiten

- [x] `package.json` geprüft: Produktions-Deps sind nur `next`, `react`, `react-dom`; Dev-Deps
      `eslint`, `eslint-config-next`, `tailwindcss`, `@tailwindcss/postcss`, `typescript`,
      `@types/*` — alles bekannte, plausible, weit verbreitete Pakete. Kein Slopsquatting-Verdacht.
- [x] `package-lock.json` ist committed.
- [ ] **`npm audit` liefert 3 High-Findings**: `sharp <0.35.0` (transitive Abhängigkeit von
      `next`, für serverseitige Bildoptimierung) — CVE-2026-33327, CVE-2026-33328, CVE-2026-35590,
      CVE-2026-35591 in libvips (GHSA-f88m-g3jw-g9cj). **Nur identifiziert, nicht behoben.**
      Risiko dürfte in der Praxis gering sein, da die App laut CLAUDE.md bewusst `<img>` statt
      `next/image` verwendet und den Next-Image-Optimizer damit nicht aktiv nutzt — `sharp` bleibt
      aber als Dependency im Baum.
- [x] Dependabot Alerts / Security Updates aktiviert — vom Nutzer im Repo unter Settings →
      Advanced Security eingeschaltet (2026-08-08). Die 3 High-Findings zu `sharp` (siehe oben)
      bleiben davon unberührt bestehen, da Dependabot keinen Fix für eine transitive
      `next`-Abhängigkeit automatisch bereitstellen kann, solange `next` selbst keine neue
      Version mit gepatchtem `sharp` zieht.

### 9. GitHub und Repo-Hygiene

- [x] Force-Push auf `main` blockiert — ursprünglich **nicht konfiguriert** ("Classic branch
      protections have not been configured"), vom Nutzer danach eingerichtet (2026-08-08).
- [x] Keine GitHub Actions im Repo (`.github/` existiert nicht) — Punkt zu gepinnten
      Third-Party-Actions entfällt damit vollständig.
- [ ] Vercel-Integration / Repo-Zugriffsumfang — vom Nutzer geprüft: Auf GitHub unter
      Settings → Applications → Installed GitHub Apps → Vercel steht **"All repositories"**.
      Die Vercel-App hat damit Zugriff auf **alle** Repos, nicht nur auf HOUSEHELD-APP. Kein
      akutes Risiko, aber weiter gefasst als nötig (Prinzip der minimalen Rechte). Optional auf
      "Only select repositories" einschränkbar. **Identifiziert, nicht behoben.**

### 10. Umgang mit fremden Eingaben

- [x] Kein `dangerouslySetInnerHTML`, kein `eval(`, kein `innerHTML =` im gesamten Code gefunden
      (Volltext-Grep über `app/`, `components/`, `lib/`).
- [x] Keine SQL-Strings — App nutzt die IndexedDB-Objekt-Store-API (`lib/db.ts`), kein SQL im
      Einsatz, damit auch keine Injection-Fläche dieser Art.
- [ ] Verhalten bei leerer/sehr langer/HTML-haltiger Eingabe im UI **noch nicht aktiv
      durchgetestet**. Aus dem Code ersichtlich: Titel-Feld verlangt einen nicht-leeren,
      getrimmten Wert (`TaskDialog.tsx:85`), React escaped alle Ausgaben automatisch (kein
      `dangerouslySetInnerHTML` vorhanden), HTML-Injection ist damit strukturell ausgeschlossen.
      Es gibt aber **keine Maximallänge** für Titel/Beschreibung — sehr lange Eingaben werden nicht
      begrenzt. Auswirkung ist gering, da rein lokal (kein Server, der dadurch belastet würde),
      aber als offener Punkt festgehalten.

### 11. Kosten- und Missbrauchsschutz

- [x] **Grösstenteils N/A** — kein Server, kein LLM-Aufruf, kein Mailversand. Die einzige externe
      Anfrage ist die Openverse-Bildersuche in `lib/demo-data.ts`, keyless und laut CLAUDE.md
      kostenlos, wird nur durch einen manuellen "Demo-Daten"-Klick ausgelöst und läuft mit
      5-Sekunden-Timeout (`FETCH_TIMEOUT_MS`). Kein Rate-Limiting vorhanden, aber auch kein
      Kostenrisiko, da der Aufruf clientseitig, unauthentifiziert und pro Nutzeraktion einmalig ist.
- [x] Vercel Spend Management / Usage Alerts — vom Nutzer geprüft: nicht konfiguriert, aber
      unkritisch, da das Projekt auf dem kostenlosen **Hobby-Plan** läuft. Spend Management ist
      ohnehin nur ein Pro/Enterprise-Feature; auf Hobby besteht kein nutzungsbasiertes
      Abrechnungsrisiko wie im PDF beschrieben (2026-08-08).
- [x] Hartes Ausgabenlimit bei externen API-Anbietern — entfällt, es gibt keinen kostenpflichtigen
      externen API-Anbieter im Stack.

### 12. Security Headers

- [ ] **Nicht gesetzt.** `next.config.ts` enthält nur `reactStrictMode: true`, keine
      Headers-Konfiguration. Es existiert kein `vercel.json`. Damit fehlen aktuell CSP,
      `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, HSTS und `Referrer-Policy`.
      **Identifiziert, nicht behoben.**
- [ ] Gegenprüfung auf securityheaders.com — nicht durchgeführt (keine öffentliche URL Teil dieser
      Prüfung).

### 13. Betrieb

- [x] Logs mit Tokens/Passwörtern — strukturell ausgeschlossen, da es keinen Server-Code gibt, der
      überhaupt Logs mit solchen Inhalten erzeugen könnte (rein statisches Deployment).
- [ ] Datenbank-Backup existiert und wurde zurückgespielt — **entfällt strukturell und ist bewusst
      so gewählt**: Daten liegen nur lokal im Browser (IndexedDB), es gibt laut CLAUDE.md
      ("Abweichung vom PRD") explizit kein zentrales Backup. Das ist kein technischer Fehler,
      sollte den Nutzenden aber bewusst sein: Browser-Daten löschen = Datenverlust ist endgültig.
- [ ] Notfallablauf (Key rotieren, Rollback, Datenidentifikation) dokumentiert — **nicht
      dokumentiert**. Da keine Keys/Secrets existieren, reduziert sich ein Notfall im
      Wesentlichen auf "Deployment auf Vercel zurückrollen".
- [x] Personendaten: Es werden nur lokal im Browser gespeicherte Namen/Fotos verwaltet, es gibt
      keine Übertragung an einen eigenen Server. Die einzige externe Anfrage (Openverse) sendet
      generische Suchbegriffe, keine Personendaten. Serverstandort/Auftragsverarbeitung damit für
      diese App nicht relevant.

---

## Wenn die Zeit knapp ist — die 3 wichtigsten Punkte

1. **Deployment Protection auf Vercel** — ✅ bestätigt: "Standard Protection" aktiv.
2. **Kein Secret hinter `NEXT_PUBLIC_`** — ✅ bestätigt: Es gibt im gesamten Code keine einzige
   Umgebungsvariable, und auf Vercel sind auch keine Environment Variables gesetzt.
3. **Autorisierung pro API-Route** — entfällt: Es existieren keine API-Routen oder Server Actions.

---

## Zusammenfassung: identifizierte offene Punkte (noch nicht behoben)

| # | Punkt | Kategorie | Schweregrad (grob) | Status |
|---|---|---|---|---|
| 1 | `npm audit`: 3× High in `sharp` (transitiv über `next`, Bildoptimierung) | 8 | gering–mittel (Feature ungenutzt) | offen |
| 2 | Keine Security-Headers (CSP, X-Frame-Options, HSTS, …) in `next.config.ts`/`vercel.json` | 12 | mittel | offen |
| 3 | Vercel-GitHub-App hat Zugriff auf "All repositories" statt nur HOUSEHELD-APP | 9 | gering | offen |
| 4 | Keine Maximallänge für Titel/Beschreibung von Aufgaben | 10 | gering | offen |
| 5 | Kein dokumentierter Notfallablauf | 13 | gering | offen |
| 6 | Kein Backup-Mechanismus für lokale Daten (bewusste Design-Entscheidung, aber Nutzer:innen sollten es wissen) | 13 | gering (bewusst) | offen (Design) |
| ~~7~~ | ~~GitHub Secret Scanning/Push Protection~~ | 1 | — | ✅ erledigt 2026-08-08 |
| ~~8~~ | ~~GitHub Dependabot Alerts/Security Updates~~ | 8 | — | ✅ erledigt 2026-08-08 |
| ~~9~~ | ~~GitHub Branch Protection auf `main`~~ | 9 | — | ✅ erledigt 2026-08-08 |
| ~~10~~ | ~~Vercel Deployment Protection~~ | 6 | — | ✅ bestätigt (Standard Protection) |
| ~~11~~ | ~~Vercel Environment Variables~~ | 6 | — | ✅ bestätigt (leer, wie erwartet) |
| ~~12~~ | ~~Vercel Spend Management~~ | 11 | — | ✅ unkritisch (Hobby-Plan) |

Alle anderen Punkte der Checkliste sind entweder erfüllt oder für diesen Stack (rein statische
App ohne Server, ohne Datenbank, ohne Auth, ohne Secrets) strukturell nicht anwendbar.


## Notes Sandro
Noch bestehende Bugs: Symbolbilder bei Beispieldaten unpassend.
Bereits für Ideenfindung Claude benutzt.
