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

In einer weiteren Session wurde ein manueller PageSpeed-Insights-Test (Mobile) auf der produktiven App ausgewertet: Performance 98, Accessibility 92, Best Practices 100, SEO 100, Agentisches Browsing 3/3. Die Auswertung der aufgelisteten „fehlerhaften Elemente" deckte dabei einen produktiv ausgelieferten Navigationsbug auf und führte ausserdem zu gezielten Barrierefreiheits-Korrekturen (siehe Bugfixes).

Nach den DE/EN- und SEO-Änderungen wurde die Security-Checkliste in einer weiteren Session ein zweites Mal komplett durchgearbeitet — diesmal zusätzlich live gegen die deployte App und über die öffentliche GitHub-API, nicht nur gegen den lokalen Code. Dabei kam ans Licht, dass das beim ersten Security-Durchgang eingerichtete Branch-Protection-Ruleset auf `main` zwar noch existierte, aber auf „disabled" stand und damit faktisch wirkungslos war. Als konkreter Fix wurden ausserdem die fehlenden Security-Headers ergänzt: `next.config.ts` setzt jetzt Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy und Permissions-Policy für alle Routen, mit einer CSP, die gezielt auf die tatsächlich verwendeten Ressourcen zugeschnitten ist (u. a. `blob:` für Foto-Vorschauen, `api.openverse.org` für die Demo-Bildersuche). Der Fix wurde vor dem Deploy gegen einen lokalen Produktions-Build verifiziert (Header per `curl` geprüft, Aufgabe anlegen und Demo-Daten laden inkl. Openverse-Aufruf im Browser getestet, keine CSP-Verletzung), nach dem Deploy bestätigte securityheaders.com die Note A. Bewusst nicht verschärft wurde die verbleibende `'unsafe-inline'`-Direktive im CSP-`script-src`: Eine strengere, nonce-basierte CSP hätte erfordert, die aktuell statisch prerenderten Seiten auf dynamisches Rendering pro Request umzustellen — ein Zielkonflikt mit der bestehenden Architektur-Entscheidung für statisches, gecachtes Prerendering, den der Nutzer bewusst zugunsten der Performance aufgelöst hat.

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
- PageSpeed-Insights-Audit deckte einen produktiv ausgelieferten Bug im Sprachumschalter auf: Ein Klick auf „EN" von einer deutschen Seite führte auf eine nicht existierende Route (z. B. `/en/de/personen` statt `/en/personen`) – 404. Ursache: `usePathname()` liefert nach dem Locale-Rewrite in `middleware.ts` den intern aufgelösten Pfad (z. B. `/de/personen`), nicht die sichtbare, präfixlose URL; die Pfad-Bereinigungsfunktion ging fälschlich davon aus, Deutsch habe nie ein Präfix, und hat es deshalb nur für Englisch entfernt. Als Nebeneffekt war dadurch auch die aktive Hervorhebung in der Navigation auf allen deutschen Seiten dauerhaft kaputt (nie markiert). Beide Symptome mit derselben Korrektur behoben und per DE↔EN-Roundtrip nachgetestet.
- Barrierefreiheit (PageSpeed-Score 92) korrigiert: Das Kontrastverhältnis von gedämpftem Sekundärtext (Fusszeile, Filterlabels, Zeitangaben u. a., 34 Stellen app-weit) lag mit `text-slate-400`/`text-slate-500` unter dem WCAG-AA-Mindestwert von 4,5:1; app-weit auf `text-slate-600` (~7:1) vereinheitlicht. Ausserdem waren einzelne Berührungszielbereiche (Filter-Chips, „Alle Tags anzeigen", Tag entfernen, „Alle Zuweisungen entfernen") mit rund 24 px zu knapp bemessen; Tap-Fläche per zusätzlichem Padding samt kompensierendem Negativ-Margin vergrössert, ohne das sichtbare Layout zu verschieben.

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

Danach folgte ein eigenständiger GEO-Audit anhand einer vorgegebenen Checkliste (siehe Abschnitt
oben). Jeder Punkt wurde einzeln geprüft – Code-Durchsicht, Live-Tests im Browser und, wo
sinnvoll, echte externe Werkzeuge statt blosser Einschätzung: die Schema-Markups wurden bei
validator.schema.org gegen die produktive URL validiert, nicht nur gegen lokal eingefügten Code.
Dabei kam ans Licht, dass die in den Metadaten hinterlegte Domain die ganze Zeit falsch war
(`hausheld-page` statt `househeld-page`) – ein reiner Tippfehler, der aber Canonical-URLs,
Open-Graph-Tags, Sitemap und sämtliche strukturierten Daten betraf und ohne den Audit
wahrscheinlich unentdeckt geblieben wäre. Nach der Korrektur und einem manuellen Deployment durch
den Nutzer liess sich die Seite erstmals vollständig live testen, inklusive eines
PageSpeed-Insights-Berichts, der zusätzlich noch unter dem Radar gebliebene
Kontrastprobleme sowie ein nicht spezifikationskonformes `llms.txt` aufdeckte – beides wurde im
Anschluss behoben und erneut verifiziert.

Als Abschluss haben wir die Marketing-Seite anhand einer Security-Checkliste geprüft – lokal,
im Git-Verlauf und live gegen Deployment und GitHub-Repo. Da die Seite rein statisch ist
(kein Backend, keine DB, kein Login), entfielen die meisten kritischen Punkte;
als echte Lücke fehlten Security-Header und drei npm-Audit-Funde in Next.js-Abhängigkeiten.
Die Header wurden ergänzt und verifiziert, ein Next.js-Update gegen die Audit-Funde aber
wieder verworfen, da es die ESLint-Konfiguration brach.
Das Ergebnis ist als „Security-Checkliste (Selbst-Audit)“ im README der Marketing-Seite dokumentiert.

**Wichtige Anpassungen**

- Das Home-Foto wurde mehrfach ausgetauscht, bis ein passendes Motiv gefunden war – die Lizenz
  wurde dabei sauber pro Bild dokumentiert.
- Die Inhalte wurden von einer einzelnen Content-Datei auf getrennte, sprachspezifische Dateien
  mit gemeinsamer Struktur umgestellt, als Grundlage für die Zweisprachigkeit.
- Die App-Verlinkung wurde von einer festen URL auf eine sprachabhängige Zuordnung umgebaut,
  ebenso das App-Mockup, das seither je nach Sprache passende Texte zeigt.
- Die Produktdefinition stand bisher nur in Meta-Daten und strukturierten Daten, nie im
  sichtbaren Seitentext – auf Home und About wurde je ein Satz ergänzt, der das direkt und
  eigenständig lesbar macht.
- Auf der Features-Seite wurde eine Zwischenüberschrift vor dem Funktions-Raster ergänzt, damit
  die Überschriftenhierarchie keinen Sprung mehr macht.
- `llms.txt` wurde vom reinen Fliesstext-Format auf das offiziell erwartete Markdown-Format mit
  echten Links umgestellt.

**Bugfixes**

- Ein bei jedem Build neu gesetztes, bedeutungsloses Datum in der Sitemap wurde fest gesetzt.
- Die Sprachangabe des Dokuments wurde korrigiert.
- Überflüssige Screenreader-Ausgaben bei den Logo-Symbolen wurden unterdrückt.
- Verwaiste Verweise auf die alte Content-Datei wurden bereinigt.
- Eine überholte Aussage zur App-Oberfläche wurde im Leitfaden korrigiert.
- Eine falsche Platzhalter-Domain in den Metadaten wurde korrigiert – betraf Canonical-URLs,
  Open-Graph-Tags, Sitemap und alle strukturierten Daten der ganzen Seite.
- Mehrere Text/Hintergrund-Kombinationen mit zu geringem Kontrast (teils nur 2.5:1) wurden auf
  das WCAG-AA-Minimum von 4.5:1 angehoben.
- Der Produktname war – vermutlich aus der DE/EN-Aufteilung der Inhalte hervorgegangen – auf der
  gesamten Seite als „Hausheld" statt „Househeld" gelandet (Titel, Meta-Description, OG-Bilder,
  JSON-LD, sämtliche Fliesstexte in beiden Sprachen, `llms.txt`). Auf GitHub-Repo-Namen, Live-
  Domain und die verlinkte App als Referenz durchgehend auf „Househeld" korrigiert; die App selbst
  wurde dabei nicht angefasst.

## Reflexion
Folgt noch... 
Positiv überrascht über die transparente Kommunikation. Und wie es Claude Sachen abcheckt, also mein Update im Readme. Denkt Fallback-Varianten mit (z.B. kein Internet, Datenbank lokal)

<a id="mein-aha-moment"></a>
**Mein Aha-Moment**

folgt noch

<a id="neu-gewonnene-learnings"></a>
**Neu gewonnene Learnings**
folgt noch

<a id="prompting-strategien"></a>
**Prompting-Strategien**
folgt noch

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

- [x] **✅ Behoben (2026-08-18):** `next.config.ts` setzt jetzt über `headers()` für alle Routen
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


