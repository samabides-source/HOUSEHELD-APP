# Dokumentation "HOUSEHELD"
CAS AIMP - Viben und Coden / FS26

Sandro Müntener / 17. August 2026


### App-Beschrieb: ###
Househeld ist ein Haushaltsaufgaben-Tracker für Familien/WGs. Aufgaben können mit mehreren Fotos dokumentiert, Personen zugewiesen und mit Tags kategorisiert werden.

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
  - [Mein Aha-Moment](#mein-aha-moment)
  - [Neu gewonnene Learnings](#neu-gewonnene-learnings)
  - [Prompting-Strategien](#prompting-strategien)
- [Beispielprompt](#beispielprompt)
- [PRD-/SPEC-File](#prd-househeld--haushaltsaufgaben-tracker)
- [Security-Checkliste](#security-checkliste-für-vibe-coded-apps--ausgefüllt-für-househeld)

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

Im Rahmen der Vibe-Coding-Einführung entstand aus einer ersten Liste von fünf App-Ideen (u. a. Habit-Tracker, Rezeptbuch, Pomodoro-Timer, Haushaltsbuch, Kanban-Board) die konkrete Idee für einen Haushaltsaufgaben-Tracker.

**Meilensteine**
- Aus der Grundidee liess ich mir von Claude einen ausführlichen App-Beschrieb und ein erstes PRD erstellen, inkl. vordefinierter Tag-Liste (32 Tags in 5 Kategorien: Räume, Aussenbereich, Aufgabentyp, Technik & Geräte, Sonstiges).
- Eine parallel mit ChatGPT erstellte PRD-Version diente als Gegenprüfung und brachte weitere Präzisierungen (Foto-Limits, Filter-Logik, Standardsortierung u. a.).
- Tech-Stack (Node.js + Express mit lowdb) und Design-Richtung ("Verspielt & bunt": farbcodierte Tag-Kategorien, eigenes Prioritäts-Farbsystem, abgerundete Formen) wurden festgelegt.
- Ergebnis: ein finales PRD sowie zwei Agenten-Kontextdateien (CLAUDE.md für Claude Code, AGENTS.md für Cursor) als Grundlage für die Umsetzung.

**Wichtige Anpassungen**

- Mehrere, jederzeit austauschbare Fotos statt nur eines pro Aufgabe
- Personen löschen entfernt nur die Zuweisung, Aufgaben bleiben als "nicht zugewiesen" bestehen
- Warnhinweis statt stillschweigendem Löschen bei noch verwendeten Tags
- Klare Trennung zwischen Priorität "dringend" und Tags (kein Doppel-Konzept)
- Zweiter Klick als Löschbestätigung für Aufgaben (kein Papierkorb)
- Wechsel von SQLite auf lowdb als einfachere, lizenzkostenfreie Lösung fürs Lernprojekt

## Entwicklungsprozess APP

**Meilensteine**

Claude Code setzte die App in einer ersten Session komplett um: Next.js 15, React 19, Tailwind CSS v4, TypeScript. Dabei wich Claude bewusst vom PRD ab – statt Node.js/Express + lowdb wurde die Persistenz clientseitig über IndexedDB gelöst, weil Vercel (serverless, read-only Dateisystem) kein PRD-konformes Backend erlaubt. Konsequenz, von Anfang an transparent kommuniziert: Der Datenbestand liegt pro Browser/Gerät. Alle Kernfunktionen wurden danach im Browser end-to-end durchgetestet.

In einer grösseren Folgesession wurde die App auf SEO/AEO/GEO geprüft und zusätzlich vollständig zweisprachig gemacht (DE/EN), inkl. eigenem i18n-System, robots.ts/sitemap.ts, JSON-LD und dynamischen Vorschaubildern.

Danach wurde die App zweimal komplett gegen eine vorgegebene Security-Checkliste geprüft (siehe eigener Abschnitt weiter unten) – einmal lokal am Code, ein zweites Mal live gegen die deployte App und über die GitHub-API. Dabei kam u. a. ans Licht, dass eine zuvor eingerichtete Branch-Protection-Regel inaktiv war. Fehlende Security-Headers (CSP, HSTS u. a.) wurden ergänzt und mit securityheaders.com auf Note A verifiziert.

Ein manueller PageSpeed-Insights-Test deckte zusätzlich einen produktiv ausgelieferten Navigationsbug sowie Kontrast-/Bedienbarkeits-Probleme auf (siehe Bugfixes).

Nach einem Dependabot-Merge auf Next.js 16 wurde in einer kurzen Session geprüft, ob Build/Lint/Typecheck weiterhin sauber laufen: tsconfig.json musste dabei zwingend auf jsx: react-jsx angepasst und middleware.ts auf die neue proxy.ts-Konvention migriert werden (per offiziellem Codemod, Logik unverändert).

**Wichtige Anpassungen**

- Tag-Farben im Dialog „Neue Aufgabe" an die Kategorie-Farben angeglichen; Fotos in der Aufgabenübersicht anklickbar/vergrösserbar gemacht
- Layout-Fix für ein abgeschnittenes Filter-Label
- Beispieldaten auf 6 Personen/14 Aufgaben erweitert; die Symbolbilder liefen zunächst über eine automatische Live-Bildsuche, die zu oft thematisch unpassende Treffer lieferte – ersetzt durch von Hand kuratierte, lizenzgeprüfte Bild-Links (CC0/BY/BY-SA)
- Redundante Seite „Meine Aufgaben" entfernt zugunsten eines gespeicherten Personen-Filters auf der Aufgaben-Seite; Navigation entsprechend angepasst
- Diverse Textkürzungen (Einstellungen-Seite, README für Endnutzer:innen)

**Bugfixes**

- Beispieldaten-Downloads auf maximal 3 parallele Anfragen begrenzt, nachdem volle Parallelität in der Praxis grösstenteils fehlschlug
- Tags wurden beim Sprachwechsel nicht zuverlässig übersetzt (verlorener State beim Komponenten-Remount); gelöst über einen persistenten Marker in IndexedDB, inkl. eines Folgebugs nach „Alle Daten löschen"
- Automatische Freitext-Übersetzung geprüft, aber aus Datenschutzgründen bewusst nicht umgesetzt (als bekannte Einschränkung dokumentiert)
- Sprachumschalter führte von deutschen Seiten auf eine falsche, nicht existierende Route (404) und liess die Navigations-Hervorhebung auf Deutsch dauerhaft inaktiv – beides mit derselben Korrektur behoben
- Kontrastwerte und Berührungszielbereiche unter dem WCAG-AA-Minimum korrigiert
- Kuratierte Beispielfotos (siehe oben) fielen wegen der neu gehärteten CSP still auf den Platzhalter zurück, da sie direkt von Fremd-Hosts geladen wurden; gelöst über Openverses eigenen, bereits erlaubten Thumbnail-Proxy
- Über GitHub direkt angelegte SECURITY.md enthielt noch unausgefüllten Platzhaltertext mit fiktivem Versionsschema; durch eine zum Projekt passende Policy ersetzt

## Entwicklungsprozess SITE

**Meilensteine**

Die Marketingseite entstand als Grundgerüst mit fünf Seiten (Home, Features, FAQ, About, App testen) im Design der App, danach ergänzt um Kontaktangaben, Fotos und eine neu strukturierte About-Seite.

Der grösste Schritt war eine vollständige SEO-/AEO-/GEO-Überarbeitung samt kompletter englischer Version: getrennte, sprachspezifische Content-Dateien, strukturierte Daten, dynamische Vorschaubilder und eine maschinenlesbare Zusammenfassung für KI-Crawler. Die Verlinkung zur App wurde anschliessend ebenfalls sprachabhängig gemacht.

Ein eigenständiger GEO-Audit prüfte danach jeden Punkt einzeln, teils mit externen Werkzeugen statt blosser Einschätzung (u. a. Schema-Validierung bei validator.schema.org gegen die produktive URL). Dabei kam ein seit Langem falscher Domain-Tippfehler in den Metadaten ans Licht, der Canonical-URLs, Open-Graph und alle strukturierten Daten betraf. Ein anschliessender PageSpeed-Insights-Bericht deckte zusätzlich Kontrastprobleme und ein nicht spezifikationskonformes llms.txt auf.

Zum Abschluss wurde auch die Marketing-Seite gegen dieselbe Security-Checkliste geprüft (lokal, im Git-Verlauf, live gegen Deployment und Repo). Als echte Lücken fanden sich fehlende Security-Header und drei npm-Audit-Funde; die Header wurden ergänzt, ein Next.js-Update gegen die Audit-Funde aber wieder verworfen, da es die ESLint-Konfiguration brach. Dokumentiert als „Security-Checkliste (Selbst-Audit)" im README der Marketing-Seite.

**Wichtige Anpassungen**

- Home-Foto mehrfach ausgetauscht, Lizenz sauber pro Bild dokumentiert
- Inhalte von einer Content-Datei auf getrennte, sprachspezifische Dateien umgestellt (Grundlage für die Zweisprachigkeit)
- App-Verlinkung und -Mockup auf sprachabhängige Inhalte umgebaut
- Produktdefinition zusätzlich als lesbarer Fliesstext auf Home/About ergänzt (vorher nur in Meta-/strukturierten Daten)
- llms.txt vom Fliesstext- aufs offiziell erwartete Markdown-Format umgestellt

**Bugfixes**

- Bedeutungsloses, bei jedem Build neu gesetztes Sitemap-Datum fest gesetzt; Sprachangabe des Dokuments korrigiert; überflüssige Screenreader-Ausgaben unterdrückt
- Falsche Platzhalter-Domain in allen Metadaten und strukturierten Daten korrigiert
- Kontrastarme Text/Hintergrund-Kombinationen auf das WCAG-AA-Minimum angehoben
- Produktname war durchgehend als „Hausheld" statt „Househeld" gelandet (Titel, Meta-Daten, JSON-LD, Fliesstexte) – global korrigiert; die App selbst war davon nicht betroffen

## Reflexion
handgeschrieben ;-)

Beim ganzen Prozess - Ideenfindung, App-Entwicklung, Deployment, Checklisten - war ich immer wieder überrascht, als wie "menschlich" ich Claude wahrnahm. Die Kommunikation war sehr transparent: Gedankengänge, Auffälligkeiten oder Widersprüche hat mir Claude aktive mitgeteilt und wichtige Rückfragen direkt gestellt und mir die Entscheidung überlassen. Also exakt genau so, wie ich mir die Zusammenarbeit mit menschlichen Fachexpert:innen auch wünsche.
Besonders positiv überrascht hat mich, wie Claude im Repository auch selbständig Sachen gegencheckt oder updatet und sogar (technische) Fallback-Varianten für die App oder die Marketing-Seite für mich mitdenkt. Auch die live deployte Website hat Claude immer wieder geprüft.

Kritisch sehe ich, dass ich mit meinen quasi inexistenten Programmier-Kenntnissen lediglich das Endprodukt testen und beurteilen kann. Natürlich habe im Entwicklungsprozess gewisse Aspekte gelernt und zu verstehen gelernt (z.B. Design-Entwicklung oder GEO-optmierte Formatierung). Aber der ganze technische Hintergrund ist für mich eine riesige Blackbox.

<a id="mein-aha-moment"></a>
**Mein Aha-Moment**

CLAUDE.md ist die Referenz für die ganze Entwicklung. Das habe ich lange nicht verstanden, wahrscheinlich auch, weil es ein eher technisches Dokument ist. Gerade bei der Sicherheitsprüfung wie auch bei der GEO-Optimierung hat mich Claude mehrmals auf Konflikte/Widersprüche mit den ursprünglich definierten Parametern im CLAUDE.md-File hingewiesen.

Zweitens: Ich kann auch schreiben, warum mir eine Umsetzung / ein verwendetes Bild / etc. nicht gefällt. Lange habe ich jeweils nur geantwortet, "mach mir neue Vorschläge". Wenn ich meine Unzufriedenheit aber begründe, liefert Claude viel schneller bessere Ergebnisse.

Und drittens: langes Denken oder eine lange Antwort von Claude bedeutet nicht automatisch, dass auch der Code stark verändert wurde. Manchmal konnte ich in den Änderungen auf Github-Desktop erkennen, dass nur zwei neue Wörter im Code dazugekommen sind, um ein (in meinem Verständnis) grosses Problem zu lösen. Das war aus meiner Sicht sehr faszinierend. 

<a id="neu-gewonnene-learnings"></a>
**Neu gewonnene Learnings**

Ich brauche keine Vorkenntnisse und muss nicht in Fachsprache kommunizieren. Ganz grundsätzlich war ich überrascht, dass ich Wünsche, Problemeoder Anmerkungen in meiner "Laien-Sprache" beschreiben konnte und Claude hat die richtigen Schlüsse daraus gezogen. Und dasselbe galt auch umgekehrt: Ich schaue Claude beim Denkprozess zu und sehe ganz viele technische Begriffe und Beschreibungen, aber die Schlussantwort ist dann auch für mich mehrheitlich verständlich und nachvollziehbar. Einzig bei der Security-Checkliste habe ich mehrmals nicht mehr verstanden, was genau das Problem war und wie das jetzt gelöst wurde.

<a id="prompting-strategien"></a>
**Prompting-Strategien**

Ich habe bei den Iterationen lange unterschätzt, wie stark Claude mit Screenshots umgehen kann. Im fortgeschrittenen Entwicklungsstadium habe ich darum vermehrt damit gearbeitet und auch immer stark darauf geachtet, dass ich von Claude das exakte Wording übernehme, um z.B. ein Problem zu beschreiben.
Was auch sehr geholfen hat, war mein eigener klarer Rollenbeschrieb gleich zu Beginn. Claude wusste von Beginn weg, dass ich ein Laie bin und diese App bzw. Marketing-Site im Rahmen einer Weiterbildung entwickle. Auch du als Dozent spielst eine Rolle. Claude hat das mehrmals, vor allem bei der Dokumentation und dazugehöriger Kommunikation, mitgedacht.

## Beispielprompt
"Ich habe noch einen Bug entdeckt. Angelegte Aufgaben werden nur in derjenigen Sprache erfasst und gespeichert, welche beim Anlegen aktiv war. Wird die Sprache nach Anlegen der Aufgaben gewechselt, bleiben die Aufgaben in der Ursprungssprache und werden auch von den Tag-Filtern nicht mehr erkannt. Beim einem Sprachwechsel müssten also auch bereits angelegte Aufgaben mit übersetzt werden. Kannst du mir das umsetzen?"




# PRD: Househeld – Haushaltsaufgaben-Tracker

## 1. Übersicht

**Projektname:** Househeld
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




# Security-Checkliste für Vibe-coded Apps — ausgefüllt für **Househeld**

Erste Prüfung: 2026-08-08 (Commit `b0c51b1`).
Zweite Prüfung: 2026-08-18 (Commit `7adb95d`), nach Einführung von Mehrsprachigkeit (DE/EN),
`middleware.ts`, SEO-Routen (`robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.tsx`,
`apple-icon.tsx`) und `public/llms.txt` — diesmal zusätzlich gegen die live deployte App
(https://househeld-app.vercel.app/) und über die öffentliche, unauthentifizierte GitHub-API
geprüft, nicht nur gegen den lokalen Code.
Repo: `samabides-source/HOUSEHELD-APP`
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
> GitHub-Einstellungen wurden auf Wunsch des Nutzers im Gespräch trotzdem direkt behoben.
>
> **Zweite Prüfung (2026-08-18):** Wichtigster Fund war, dass die beim ersten Mal eingerichtete
> Branch-Protection auf `main` zwar noch existierte (Ruleset `main`), aber nicht mehr aktiv war
> (`enforcement: disabled`) — siehe Punkt 9. Ausserdem wurden auf Wunsch des Nutzers diesmal auch
> die fehlenden Security-Headers direkt behoben (siehe Punkt 12), inkl. Verifikation gegen einen
> lokalen Produktions-Build und anschliessender Note **A** auf securityheaders.com nach dem Deploy.
>
> **Nachtrag (2026-08-18):** Der Nutzer hat die beiden verbliebenen offenen Punkte aus Kapitel 9
> (Branch-Protection-Enforcement, Vercel-GitHub-App-Zugriffsumfang) ebenfalls behoben — Details
> und Verifikation direkt in Kapitel 9.

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
      Push protection **eingeschaltet** (2026-08-08, in der zweiten Prüfung nicht erneut verifiziert).

### 2. Keine Secrets im Client-Bundle

- [x] Keine `NEXT_PUBLIC_`/`VITE_`/`REACT_APP_`-Variable mit Geheimnis — es gibt keine einzige
      Umgebungsvariable im Code (bestätigt per Grep auf `process.env`, 0 Treffer).
- [x] Supabase anon/service_role-Trennung — entfällt, kein Supabase im Stack.
- [x] Build durchgeführt (`npm run build`) und `.next/static` nach `sk-`, `service_role`, `secret`
      durchsucht — keine Treffer (erwartbar, da keine Secrets existieren). Auch keine `.js.map`-
      Dateien im Build-Output (kein Source-Map-Leak).
- [x] Zusatzprüfung im Browser (Seitenquelltext auf publizierter URL) — am 2026-08-18 nachgeholt:
      HTML-Quelltext von https://househeld-app.vercel.app/ direkt abgerufen und nach denselben
      Mustern durchsucht — keine Treffer.

### 3. Login und Accounts nur über etablierte Mechanismen

- [x] **N/A** — laut CLAUDE.md explizit nicht im Umfang ("Nicht im Umfang: Auth"). Im Code kein
      Login-, Passwort- oder Session-Handling gefunden.

### 4. Datenbank-Zugriffsregeln aktiv

- [x] **N/A** — keine serverseitige Datenbank. Persistenz läuft ausschliesslich über IndexedDB im
      Browser des jeweiligen Geräts (`lib/db.ts`), pro Gerät isoliert. Row Level Security ist auf
      dieses Modell nicht anwendbar, da keine zentrale, mandantenfähige Datenbank existiert.

### 5. Jede API-Route prüft selbst

- [x] **N/A für Session/Autorisierung** — es gibt keine `app/api`-Routen und keine Server
      Actions; alle Seiten sind `"use client"` (bestätigt durch Durchsicht von `app/[locale]/`,
      inkl. der neuen i18n-Struktur).
- [x] File-Uploads sind begrenzt: `lib/photos.ts` erzwingt max. 10 MB/Datei
      (`MAX_PHOTO_BYTES`) und `lib/types.ts` max. 10 Fotos/Aufgabe (`MAX_PHOTOS_PER_TASK`),
      Typprüfung über `isAcceptedFile()`. Dateien landen nicht in einem öffentlichen Ordner,
      sondern als Blob in IndexedDB — nicht ausführbar, nicht über eine URL erreichbar.
- [ ] Neu geprüft (2026-08-18): Die Live-Antwort-Header enthalten `Access-Control-Allow-Origin: *`
      auf allen geprüften Seiten. Kein `next.config.ts`/`vercel.json` setzt das aktiv — vermutlich
      ein Vercel-Plattform-Default für prerendertes, statisches HTML. Da es keine API, keine
      Cookies/Sessions und ohnehin nur öffentliche Inhalte gibt, ist das praktisch risikolos,
      erfüllt aber wörtlich den Punkt "CORS steht nicht auf `*`" nicht. Identifiziert, nicht behoben.

### 6. Deployment-Schutz auf Vercel

- [x] Deployment Protection aktiviert — vom Nutzer im Vercel-Dashboard geprüft: Steht auf
      **"Standard Protection"**, das ist die von Vercel empfohlene Standardeinstellung
      (2026-08-08, in der zweiten Prüfung nicht erneut verifiziert).
- [x] Env-Variablen pro Umgebung getrennt — vom Nutzer geprüft: Unter Project Settings →
      Environments ist die Liste **leer**, es sind keine Variablen gesetzt. Das ist der erwartete
      Zustand, da die App laut CLAUDE.md keine Umgebungsvariablen benötigt (2026-08-08).
- [x] Publizierte URL geprüft — am 2026-08-18 unauthentifiziert per `curl` abgerufen (kein
      Inkognito-Fenster verfügbar): Inhalt entspricht dem erwarteten öffentlichen Zustand.
- [x] Admin-/Testseiten ohne Login erreichbar — es gibt keine Admin-Bereiche in der App; alle
      Seiten (`/`, `/personen`, `/tags`, `/einstellungen`, jeweils auch unter `/en/…`) sind
      bewusst öffentlich nutzbar (kein Auth im Scope), das ist also kein Leck, sondern Design.
      `robots.txt` und `sitemap.xml` live geprüft (2026-08-18): beide sauber, keine versehentlich
      gelisteten internen/Test-Pfade, korrekte hreflang-Alternates DE/EN.

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
- [ ] **`npm audit` liefert weiterhin 3 High-Findings**: `sharp <0.35.0` (transitive Abhängigkeit
      von `next`, für serverseitige Bildoptimierung) — CVE-2026-33327, CVE-2026-33328,
      CVE-2026-35590, CVE-2026-35591 in libvips (GHSA-f88m-g3jw-g9cj). Am 2026-08-18 mit frischem
      `npm ci` + `npm audit` erneut bestätigt, unverändert seit der ersten Prüfung. Ein Fix wäre
      nur über ein `next`-Major-Update (aktuell 16.3.1) verfügbar. **Nur identifiziert, nicht
      behoben.** Risiko dürfte in der Praxis gering sein, da die App laut CLAUDE.md bewusst `<img>`
      statt `next/image` verwendet und den Next-Image-Optimizer damit nicht aktiv nutzt — `sharp`
      bleibt aber als Dependency im Baum.
- [x] Dependabot Alerts / Security Updates aktiviert — vom Nutzer im Repo unter Settings →
      Advanced Security eingeschaltet (2026-08-08, in der zweiten Prüfung nicht erneut verifiziert).
      Die 3 High-Findings zu `sharp` (siehe oben) bleiben davon unberührt bestehen, da Dependabot
      keinen Fix für eine transitive `next`-Abhängigkeit automatisch bereitstellen kann, solange
      `next` selbst keine neue Version mit gepatchtem `sharp` zieht.

### 9. GitHub und Repo-Hygiene

- [x] Force-Push auf `main` blockiert — ursprünglich **nicht konfiguriert** ("Classic branch
      protections have not been configured"), vom Nutzer am 2026-08-08 eingerichtet, dann aber am
      2026-08-18 als `"enforcement": "disabled"` entdeckt (siehe oben, faktisch wirkungslos). **Vom
      Nutzer erneut gefixt (2026-08-18)** — unabhängig über die öffentliche GitHub-API
      (`/repos/…/rulesets`, ohne Login abrufbar) verifiziert: Ruleset `main` steht jetzt auf
      `"enforcement": "active"` (`updated_at: 2026-08-18T07:40:42Z`). ✅ Behoben und bestätigt.
- [x] Keine GitHub Actions im Repo (`.github/` existiert nicht) — Punkt zu gepinnten
      Third-Party-Actions entfällt damit vollständig.
- [x] Vercel-Integration / Repo-Zugriffsumfang — war auf "All repositories" gesetzt (weiter gefasst
      als nötig, aber kein akutes Risiko). **Vom Nutzer auf "Only select repositories" eingeschränkt
      (2026-08-18)**, laut Nutzerangabe auf HOUSEHELD-APP begrenzt. Diese Einstellung liegt in der
      GitHub-App-Installation und ist über die öffentliche API nicht unauthentifiziert einsehbar,
      daher hier nicht unabhängig nachprüfbar, nur auf Nutzerangabe gestützt. ✅ Behoben.

### 10. Umgang mit fremden Eingaben

- [x] Seit der ersten Prüfung ist ein `dangerouslySetInnerHTML` dazugekommen:
      `app/[locale]/layout.tsx` (Zeile 83), zum Einbetten des `SoftwareApplication`-JSON-LD-Skripts
      fürs SEO. Geprüft (2026-08-18): Der eingebettete Inhalt (`JSON.stringify(jsonLd)`) besteht
      ausschliesslich aus statischen, entwicklerkontrollierten Werten (Dictionary-Texte aus
      `lib/i18n/dictionaries.ts`, die feste `SITE_URL`-Konstante, das über eine feste Liste
      validierte `locale`) — keine Nutzereingaben fliessen hinein. Das ist das in Next.js übliche
      Muster für JSON-LD und in dieser Form unkritisch. Kein `eval(`/`innerHTML =`-Einsatz sonst
      im Code gefunden.
- [x] Keine SQL-Strings — App nutzt die IndexedDB-Objekt-Store-API (`lib/db.ts`), kein SQL im
      Einsatz, damit auch keine Injection-Fläche dieser Art.
- [ ] Verhalten bei leerer/sehr langer/HTML-haltiger Eingabe im UI **noch nicht aktiv
      durchgetestet**. Aus dem Code ersichtlich: Titel-Feld verlangt einen nicht-leeren,
      getrimmten Wert (`TaskDialog.tsx:85`), React escaped alle Ausgaben automatisch, HTML-Injection
      ist damit strukturell ausgeschlossen. Es gibt aber **keine Maximallänge** für
      Titel/Beschreibung — sehr lange Eingaben werden nicht begrenzt. Auswirkung ist gering, da
      rein lokal (kein Server, der dadurch belastet würde), aber als offener Punkt festgehalten.

### 11. Kosten- und Missbrauchsschutz

- [x] **Grösstenteils N/A** — kein Server, kein LLM-Aufruf, kein Mailversand. Die einzige externe
      Anfrage ist die Openverse-Bildersuche in `lib/demo-data.ts`, keyless und laut CLAUDE.md
      kostenlos, wird nur durch einen manuellen "Demo-Daten"-Klick ausgelöst und läuft mit
      5-Sekunden-Timeout (`FETCH_TIMEOUT_MS`). Kein Rate-Limiting vorhanden, aber auch kein
      Kostenrisiko, da der Aufruf clientseitig, unauthentifiziert und pro Nutzeraktion einmalig ist.
- [x] Vercel Spend Management / Usage Alerts — vom Nutzer geprüft: nicht konfiguriert, aber
      unkritisch, da das Projekt auf dem kostenlosen **Hobby-Plan** läuft. Spend Management ist
      ohnehin nur ein Pro/Enterprise-Feature; auf Hobby besteht kein nutzungsbasiertes
      Abrechnungsrisiko (2026-08-08, in der zweiten Prüfung nicht erneut verifiziert).
- [x] Hartes Ausgabenlimit bei externen API-Anbietern — entfällt, es gibt keinen kostenpflichtigen
      externen API-Anbieter im Stack.

### 12. Security Headers

- [x] **Behoben (2026-08-18):** `next.config.ts` setzt jetzt über `headers()` für alle Routen
      `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
      `Referrer-Policy: strict-origin-when-cross-origin` und `Permissions-Policy`
      (`camera=(), microphone=(), geolocation=(), payment=(), usb=()` — die App nutzt keine
      dieser Browser-APIs). `Strict-Transport-Security` war bereits vorher als Vercel-Plattform-
      Default vorhanden. Die CSP wurde bewusst gegen die tatsächlich genutzten Ressourcen der App
      geschnitten:
      `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; img-src 'self' blob:; font-src 'self'; connect-src 'self' https://api.openverse.org; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`.
      `'unsafe-inline'` bei `script-src` bleibt bewusst bestehen, weil Next.js' eigenes
      Hydration-Bootstrap-Script auf statisch prerendertem HTML ohne Nonce ausgeliefert wird — ein
      nonce-basiertes striktes CSP wäre mit dem prerendered/gecachten Static-HTML-Ansatz dieser App
      nicht kompatibel (würde die Seiten auf dynamisches Rendering pro Request umstellen, im
      Widerspruch zur in CLAUDE.md festgehaltenen Architektur-Entscheidung). Verifiziert gegen
      einen lokalen Produktions-Build (`npm run build` + `npm start`): Header per `curl` bestätigt,
      Aufgabe anlegen und Demo-Daten laden (inkl. Openverse-Netzwerkaufruf) funktionieren ohne
      CSP-Verletzung in der Konsole, `npm run typecheck` und `npm run lint` bleiben grün.
- [x] Gegenprüfung auf [securityheaders.com](https://securityheaders.com/?q=househeld-app.vercel.app)
      — durchgeführt am 2026-08-18, nachdem der Nutzer den Fix deployt hat: **Note A**. Zwei Punkte
      verhinderten A+: Permissions-Policy fehlte (daraufhin ergänzt, siehe oben) sowie eine Warnung,
      dass `script-src` `'unsafe-inline'` enthält — der oben beschriebene, bewusste Trade-off.

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


