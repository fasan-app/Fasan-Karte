# Fehleranalyse Markt B-Bon, Scanner-Bild und Zoom in der Bon-Ansicht (30.10.2026)

Anlass: echter Einkaufsbon Markt B Frankfurt (8 Zeilen, davon 3 Pfand, Summe 7,22 €). Ergebnis in 3.11: Beträge eine Zeile
verrutscht, Pfand nicht verstanden. Dazu Rückmeldung zur Bedienung: schmale Zeilen schwer zu treffen, Lupen-Knopf oben rechts
veraltet, Text soll wie bei einem Dokumentscanner begradigt und geglättet werden.

## 1. Was beim Markt B-Bon schiefging (gemessen, nicht vermutet)

| # | Fehler | Ursache | Behebung (3.12) |
| --- | --- | --- | --- |
| 1 | Bon im Foto nicht gefunden | Papierkanten-Suche (bonbild.js) scheitert auf hellem Untergrund | Bon aus der Lage der Schrift bestimmen (`textViereck`), entzerren, in voller Auflösung neu lesen („begradigt“) |
| 2 | Kästen 90 px hoch bei 46 px Zeilenabstand, Lesung aus zwei Zeilen gemischt | „unclip“ weitet Kästen auf; dichter Druck | Kastenhöhe auf den Abstand zur Nachbarzeile begrenzen (ocr.js, `woerter`) |
| 3 | Beträge fehlten ganz, nur „11“, „09“, „25“ | Festbreitenschrift: Zeichenabstand waagrecht größer als Zeilenabstand → die Texterkennung verbindet übereinander stehende Ziffern zu senkrechten „Zeilen“ (ein Kasten „1 2 1 0 0 0 1 0“, einer „B B A A A A A A“) | Senkrechte Kästen erkennen, Erkennung auf einem 2,2-fach senkrecht gestreckten Bild wiederholen und nur diesen Bereich ersetzen; dort noch verbundene Zeilen (Kopf „EUR“ + erster Betrag) am Zeilenraster der Nachbarn teilen. Ergebnis: alle 8 Beträge als ganze Zeile „1,11 B“ gelesen |
| 4 | Jede Zeile bekam den Betrag der nächsten | Papier gewellt: Namen links mit Neigung 0,04–0,07, Beträge rechts flach. Die Neigung der Namen wurde über 780 px fortgesetzt → 40 px = eine Zeile zu tief gesucht | Auf entzerrten Bildern Neigung beim Zusammensetzen der Zeilen auf ±0,02 begrenzen (Wellung ist örtlich, Schräglage ist schon entfernt) |
| 5 | Falsche Zuordnung gewann trotzdem („Summe stimmt“) | Bewertung kannte keine Strafe für Posten ohne Namen und Namenszeilen ohne Betrag – die Summe ging zufällig auf | Gütemaß: −150 je namenlosem Posten und je Zeile „Name ohne Betrag“ |
| 6 | Pfand als eigener Posten „PFAND_“ | Name mit Unterstrich, `\b` griff nicht | Pfand an den Artikel darüber hängen (Betrag inkl. Pfand, Hinweis „inkl. 0,25 € Pfand“); nie an Rabatt- oder negative Zeilen (Test: Rabatt −0,30 + Pfand 0,25 wurde −0,05) |

Ergebnis echter Markt B-Bon: 5 Posten (3 davon inkl. Pfand) = 7,22 €, Summe geprüft.

Nicht gelöst: echte Wellung wird nicht entzerrt (nur perspektivisch). Neuronale Entzerrung (UVDoc, DocTr) braucht ein
zusätzliches Modell (UVDoc ≈ 30 MB, Lizenz der Gewichte nicht geklärt) – vorerst nicht eingebaut; der Zeilenbau ist jetzt
tolerant gegen Wellung.

## 2. Scanner-Bild („begradigt und geglättet“)

Dokumentscanner-Apps machen drei Schritte: Seite finden → perspektivisch entzerren → Beleuchtung ausgleichen. Für den
dritten Schritt ist der übliche Weg: Hintergrund (leeres Papier mit Schatten/Knicken) schätzen, Bild durch den Hintergrund
teilen. Schätzung per Morphologie: hellstes Pixel der Umgebung (dünner Druck verschwindet), zur Beschleunigung verkleinert
gerechnet und wieder hochskaliert (schmijoe.github.io, „Background Removal for Scanned Documents“, 2022).

Umsetzung `scanBild` (bon.js): Graustufen, Hintergrund = Maximum über Radius ≈ Zeilenhöhe auf 1/6 Größe + Mittelung,
hochskaliert; Pixel ÷ Hintergrund, Kontrast gestreckt. ~0,5 s für 1300 × 3000 px im Test-Chromium. Verwendet für
(a) einen zusätzlichen Lesedurchlauf „scan“, (b) das angezeigte Bon-Bild und die Zeilenbilder je Posten.

## 3. Zoomen 2026: Gesten statt Lupen-Knopf

- Apple: Aufziehen/Zusammenziehen mit zwei Fingern; Doppeltippen zoomt hinein und beim nächsten Doppeltippen zurück
  (wie in Fotos) – developer.apple.com, „Zooming by Tapping“ (Scroll View Programming Guide).
- W3C WCAG 2.2, SC 2.5.1 „Pointer Gestures“: Was mit Mehrfinger-Gesten geht, muss auch mit einem Zeiger gehen; als
  Alternativen genannt: Tippen, Doppeltippen, Plus/Minus-Knöpfe (w3.org/WAI/WCAG21/Understanding/pointer-gestures).
- WCAG 2.2, SC 2.5.8: Ziele mindestens 24 × 24 CSS-px oder entsprechender Abstand.

Umsetzung (app.js, `rwBonZoomGesten`): zwei Finger (Stelle unter den Fingern bleibt stehen), Doppeltippen 1× ↔ 2,5×,
Strg/⌘ + Mausrad/Trackpad am Rechner, „⤢ Ganze Breite“ erscheint nur vergrößert. Doppeltippen nimmt den ersten Tipp zurück
(der hatte schon zugeordnet). Auf Posten mit mehreren Stücken bleibt schnelles Mehrfachtippen „ein Stück je Tipp“.

## 4. Schmale Zeilen treffen

Die Zeilen eines dichten Bons sind bei voller Breite auf dem Handy ~14 px hoch – unter 24 px. Größer geht nur mit Zoom
(dann fehlt die Betragsspalte) oder mit Korrektur in einem Tipp. Umgesetzt:
- Tippflächen reichen bis zur Mitte zur Nachbarzeile (keine Lücken, keine Überlappung) – war schon so.
- Nach jedem Tipp: Leiste mit dem getroffenen Zeilenbild, Name → Person, ▲/▼ verschiebt die Zuordnung auf den Posten
  darüber/darunter (44 px Knöpfe), Rückgängig.
- Ruhigere Kästen: dünne Linie statt 3 px gestrichelt (verdeckte die Schrift), zugeordnet mit Personenfarbe als Fläche
  und Balken links; Pfandzeile optisch mit ihrem Artikel verbunden.
