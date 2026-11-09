# Fasan Karte

Reisekarte der Fasan-Familie. Läuft im Handy-Browser, ohne Installation und ohne Konto. Erste Reise: Lissabon, 24.–26. Oktober 2026.

**Öffnen:** https://fasan-app.github.io/Fasan-Karte/ – im Browser-Menü „Zum Startbildschirm“ hinzufügen, dann startet sie wie eine App.

## Was sie kann

- Tagespläne (Plan A, B, C und Gruppenplan aus Stimmen) mit nummerierten Stopps; „Hinführen“ navigiert in der App (Fußweg, Ansagen, Ankunft), ohne fremde Karten-Apps
- Alle Orte mit Suche, Kategorien, Filtern (Geheimtipps, jetzt offen, nicht erledigt, gemerkt, ausgeblendet) und Sortierung nach Nähe
- Ortsseite mit Foto, Wikipedia-Text, Öffnungszeiten, Webseite, Zugang, eigener Notiz und Bewertung
- Merken, Erledigt, Ausblenden – mit Rückgängig
- Gruppe: Stimmen je Ort (Will hin / Lieber nicht), Umfragen, gemeinsame Rangliste, Nachrichten, Angepinntes; einmal per QR-Code oder Link verbinden, danach live und verschlüsselt über Nostr (`site/funk.js`)
- Standort mit der Gruppe teilen (1 Stunde oder bis Mitternacht), nur solange die App offen ist
- Wetter je Tag und Stunde (IPMA, Open-Meteo) mit Stand
- Profile Standard, Einfach, Gut lesbar; Themes System, Hell, Dunkel, Kontrast, Glas
- Offline: App und Daten bleiben nach dem ersten Öffnen im Gerät

## Aufbau

| Datei | Zweck |
| --- | --- |
| `data/orte.csv` | Orte: Name, Adresse, Kategorie, Notiz; optional `Lat`/`Lon` (geprüfte Position) und `Zeiten` (eigene Öffnungszeiten, `-` blendet OSM aus) |
| `site/plaene.json` | Tagespläne, verweisen auf Ortsnamen |
| `tools/wetter.py` | Holt das Wetter (nur im Bauprozess) |
| `tools/relaistest.mjs` | Prüft die Nostr-Relays (Protokoll im Branch `ci-logs`) |
| `tools/daten.py` | Prüft Positionen (OSM-Name, OSM-Adresse, Wikidata), holt Infos, Wikipedia-Text und freie Bilder |
| `data/pruefbericht.md` | Ergebnis der Prüfung je Ort |
| `.github/workflows/pages.yml` | Bei jedem Push: Daten aktualisieren, veröffentlichen |
| `docs/ENTSCHEIDUNGEN.md` | Was beschlossen ist |

## Ort hinzufügen

`data/orte.csv` auf GitHub bearbeiten, Zeile anhängen, speichern. Nach drei bis vier Minuten ist die Karte aktuell. Steht der Ort im Prüfbericht mit Hinweis, `Lat` und `Lon` von Hand eintragen.

## Datenschutz

Keine Konten, keine Statistik. Markierungen, Notizen und Unterkunft bleiben im Gerät. Der Standort geht nur an FOSSGIS (beim Hinführen) und verschlüsselt an die eigene Gruppe (beim Teilen). Nostr-Relays sehen IP-Adresse und Zeitpunkt, nicht den Inhalt. Die Seite ist öffentlich, deshalb steht die Unterkunft nicht im Repo.

Kartendaten © OpenStreetMap-Mitwirkende (ODbL). Texte Wikipedia (CC BY-SA). Fotos Wikimedia Commons, Lizenz je Bild. Karte: Leaflet (BSD-2). Code: MPL-2.0.
