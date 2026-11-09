# Code-Umbau: englische Bezeichner, kleine Module (geplant nach 3.17)

Wunsch des Nutzers (31.10.2026): Der Code soll dem heutigen Industriestandard entsprechen. Er soll für Mensch und Maschine
schnell lesbar sein und Kommentare für spätere Bearbeiter haben. Er soll so modular sein, dass Änderungen wenig Tokens
und wenig Rechenzeit kosten.

## Regeln
- Bezeichner, Dateinamen, Kommentare im Code: Englisch. Texte für die Nutzer bleiben Deutsch, gesammelt in
  `i18n/de.js`, damit später weitere Sprachen dazukommen können.
- ES-Module (`import`/`export`), eine Aufgabe je Datei, möglichst unter 300 Zeilen. Kein globales `window.X`
  außer dem Einstieg.
- Jede Datei beginnt mit einem Kopfkommentar: Zweck, Eingaben/Ausgaben, Quellen/Tests. Funktionen bekommen JSDoc
  mit Typen, damit Editor und KI ohne Lesen des ganzen Codes prüfen können.
- Schlüsselwörter für Bons je Land/Sprache als Daten (`receipt/locales/*.json`), nicht im Code. Das ist die Grundlage
  für die Auswahl Reiseland/Heimat/Zwischenstopp/weltweit.
- Verhalten bleibt gleich: Jeder Schritt wird gegen `tools/bontest` geprüft (Einheiten, synthetische Bons, echte Bons,
  SROIE). Ergebnis muss Wort für Wort gleich sein.

## Zielaufbau Bon-Erkennung
| Datei | Inhalt (heute in) |
| --- | --- |
| `receipt/pipeline.js` | Ablauf der Durchläufe, Gewinner, Anzeige (bon.js `erkenne`) |
| `receipt/log.js` | Protokoll (bon.js `P`, `pl`, `pf`) |
| `receipt/ocr-engine.js`, `receipt/ocr-worker.js` | PaddleOCR/ONNX (ocr.js) |
| `receipt/dewarp.js` | UVDoc, Zeilen-Glätten, Scan-Filter (bon.js `entfalten`, `glaetten`, `scanBild`) |
| `receipt/page-detect.js` | Papierkanten, Entzerren (bonbild.js) |
| `receipt/layout.js` | Wörter → Zeilen, Spaltenpaarung (bon.js `zeilenAus`, `zeilenSpalten`) |
| `receipt/amounts.js` | Beträge, Dezimaltrenner, Alternativen, Stimmen |
| `receipt/classify.js` | Zeilenarten aus `locales/*.json` |
| `receipt/parse.js` | Posten, Mengen, Pfand/Rabatt (bon.js `liesAllgemein`, `zusaetzeZuordnen`) |
| `receipt/reconcile.js` | Abgleich mit der Summe (bon.js `abgleich`, Summen-Erweiterung, Rundung) |
| `receipt/qr.js` | QR-Codes (Portugal AT, …) |
| `ui/receipt-*.js` | Bon-Ablauf der App (app.js `rw*`) |

app.js (4700 Zeilen) folgt in gleicher Weise: Karte, Plan, Gruppe, Kosten, Abgleich, Einstellungen als eigene Module.

## Reihenfolge
1. Testnetz vervollständigen (Ausgaben einfrieren als Referenz).
2. Bon-Erkennung umbauen (größter Nutzen, meiste Änderungen).
3. App-Teil Kosten/Bon, danach der Rest von app.js.
