# Dokumentation "HOUSEHELD"
CAS AIMP - Viben und Coden / FS26
Sandro Müntener / 08. August 2026
https://github.com/samabides-source


### App-Beschrieb:
Hausheld ist ein Haushaltsaufgaben-Tracker für Familien/WGs. Aufgaben können mit mehreren Fotos dokumentiert, Personen zugewiesen und mit Tags kategorisiert werden.
### Zielgruppe:
Familien oder WGs, die anfallende Haushaltsaufgaben gemeinsam erfassen und verteilen wollen
### Problem:
Haushaltsaufgaben werden mündlich oder in Chats verteilt und gehen dabei unter. Es fehlt ein zentraler, einfacher Ort, um zu sehen, was zu tun ist, wo genau und wer zuständig ist.
### Lösung:
Eine einfache Web-App, in der Aufgaben mit Fotos, Zuweisung und Tags erfasst und übersichtlich dargestellt werden.

## Links
App: 			househeld-app.vercel.app
Hinweis: Die App speichert alle Daten nur lokal im jeweiligen Browser. Damit du nicht mit einer leeren App startest: Oben auf „Einstellungen" klicken und „Beispieldaten laden" drücken – dann sind Aufgaben, Personen und Fotos zum Ausprobieren da.

Marketing-Seite: 	househeld-page.vercel.app
Video-Walkthrough:	Foglt noch. Aufzeichnung mit Teams. samuel@codecrush.ch einladen.


## Entwicklungsprozess APP
Von der Idee zum PRD
Zu Beginn nutzte ich das LLM von Claude für die grundlegende Ideenfindung. Ich beschrieb den Kontext (Ausbildung CAS) sowie meine Aufgabe, eine App mittels Vibe Coding zu erstellen. Inspiriert von Claude's Vorschläge, entwickelte ich eine eigene Idee für eine App zur Erfassung und Verwaltung von anstehenden Haushaltsaufgaben.
In einem zweiten Schritt liess ich mir einen ausführlichen App-Beschrieb inkl. Features und technischem Grobentwurf generieren sowie ein zugehöriges PRD-File.
Zur Verfeinerung des PRD-Files machte ich mehrere Kontroll-/Rückfragen-/Feedback-Runden mit Claude und zusätzliche mit ChatGPT, bis ich schliesslich das finale PRD-File hatte (siehe Link).

Vom PRD zur App
App gemäss Workflow von Claude Code erstellen lassen und ausführlich getestet. Alle Funktionen ausprobiert.
Erste Feedbackrunde mit Rückmeldungen zu Farbgebung Tags, Foto-Handling und Lesbarkeit Text. Änderungen tiptop umgesetzt.
Zweite Feedbackrunde zum Hauptproblem: Datenbank lokal, also Datenbestand pro Browser/Gerät und nicht zwischen Haushaltmitgliedern geteilt. Als Endnutzer gedacht und Claude konkret mein Problem beschrieben. In Absprache mit Samuel lassen wir es bei der bereits installierten Möglichkeit, Beispieldaten zu generieren.
Weitere Feedbackrunden mit Detailarbeiten an Gestaltung, Bedienung und Struktur.

Zum Abschluss in neuem Chat: Security-Checkliste
Viele Iterationen inkl. Screenshots nötig, damit die Liste bestmöglich ausgefüllt werden kann (von Claude). Betraf vor allem GitHub und Vercel.

## Entwicklungsprozess SITE
Mittels simplem Prompt, Verlinkung zur App und einigen technischen Angaben habe ich mir eine erste Fassung der Marketing-Seite erstellen lassen. Design und beschriebene Funktionen stimmen mit der App überein.

## Reflexion
Schon vor dem Deploy ein Problemhinweis bzgl. Datenbank erhalten: Es liegt alles clientseitig in IndexedDB.D er Datenbestand ist pro Browser/Gerät, nicht zwischen Haushaltsmitgliedern geteilt.
Positiv überrascht über die transparente Kommunikation. Und wie es Claude Sachen abcheckt, also mein Update im Readme. Denkt Fallback-Varianten mit (z.B. kein Internet, Datenbank lokal)

## Beispielprompt
folgt noch

## SPEC-/PRD-FILE
folgt noch

## Security-Checkliste:
Checkliste verstehen und mit Claude durchgehen. Neues Chat-Fenster innerhalb derselben Session (mit Link zu Repository) und Check-Liste hochladen. Allfällige Sicherheitslücken sollen erkannt, müssen aber nicht gefixt werden.
folgt noch

## Notes Sandro
KOMMENTARE / WICHITGE AUSSAGEN CLAUDE
Persistenz weicht ab (wie eingangs erklärt): statt Express + lowdb + Dateisystem liegt alles clientseitig in IndexedDB. Auf Vercel ginge die PRD-Variante nicht — Uploads und JSON-Datei wären nach jedem Request weg. Konsequenz: Der Datenbestand ist pro Browser/Gerät, nicht zwischen Haushaltsmitgliedern geteilt. In CLAUDE.md ist dokumentiert, wie lib/db.ts gegen eine echte DB getauscht wird, ohne die Store-Schnittstelle anzufassen.

LÖSUNG: EINBAU TESTDATEN GENERIEREN.
