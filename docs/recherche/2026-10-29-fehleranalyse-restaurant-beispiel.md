# Fehleranalyse: Bon „Restaurant Beispiel“ (24.10.2026, 85,00 €), Durchlauf 29.10.2026 mit 3.9

Ergebnis vorher: 2 von 11 Posten (Cola, Café), dazu zwei Platzhalter „Nicht gelesen (13 %) 65,10 €“ und „(23 %) 8,50 €“ ohne
Bild; im Bon ließen sich nicht alle Zeilen antippen. Nach 3.10: 11 von 11, Summe = QR 85,00 €, keine Korrektur nötig.

## Ursachen (gemessen, tools: diag.mjs/diag2.mjs/kaesten.mjs im Arbeitsordner)
1. **Falsche Zielsumme.** „TOTAL INCIDENCIAS: 11,08 73,92“ (Steuer und Netto) galt als Gesamtsumme. Der Abgleich fand eine
   „Lösung“ für 73,92: Salat gestrichen, Pizza auf 1 × 12,90, Steuerzeile 14,72 addiert – formal stimmig, inhaltlich Unsinn.
   → QR-Summe ist jetzt maßgeblich (einziges Ziel, wenn vorhanden); Summen mit Steuerwort (incid., base, netto, net, ht …) sind
   keine Gesamtsumme; bei mehreren Summenzeilen gewinnt die größte.
2. **Steuertabelle im Postenblock.** „13% 7,70 59,20“ stand vor der TOTAL-Zeile und wurde als Zuschlag behandelt.
   → Der Block endet an der Steuertabelle; Steuer zählt nur als Zuschlag, wenn es eine Zwischensumme gibt (USA).
3. **Zu viel Freiheit im Abgleich.** Posten mit lesbarem Namen konnten für 1,6 gestrichen werden. → jetzt 2,6 (praktisch nur
   noch, wenn der Betrag größer als jede Summe ist).
4. **Menge nicht gelesen.** Die schmale Mengen-Spalte („1“, „2“) erkennt PP-OCRv5 hier meist nicht. „Preco: 12,90/Uni“ unter
   25,80 erzeugte deshalb den Kandidaten 1 × 12,90. → Ist der Betrag ein Vielfaches des Einzelpreises, wird die Menge daraus
   abgeleitet.
5. **Dünne Ziffern.** „11,90“ wurde je nach Ausschnitt als „1,90“ gelesen (schmale Bon-Schrift). → Jeder Betrag im Block wird
   mit 3–5 Ausschnitten erneut gelesen, Mehrheit nach Konfidenz (Reul u. a. 2017, arXiv:1711.09670: Abstimmung nach Konfidenz
   senkt Fehler deutlich).
6. **Verschmolzene Kästen.** Die Erkennung legte „2,50“ und Teile der Nachbarzeilen in einen 109 px hohen Kasten (Zeilen sonst
   ~72 px) → „1,50“. → Nachlesen auf Höhe der übrigen Wörter der Zeile; zu hohe Kästen werden geteilt, wenn die Teile sicherer
   gelesen werden.
7. **Ausgleichende Fehler.** Zwischenstand: Brot 2,00 → 3,00 und Abatanado 2,50 → 1,50 ergaben zusammen wieder 85,00.
   Eine Summenprüfung kann das grundsätzlich nicht erkennen. Gegenmittel: gute Erstlesung (5., 6.), und jeder Betrag, der nicht
   aus der Mehrheit der Lesungen stammt, ist in der App als „bitte vergleichen“ markiert – mit Zeilenbild daneben.
8. **Platzhalter galten als geprüft.** Der portugiesische Weg füllte die Differenz mit „Nicht gelesen“-Posten und meldete
   „Summe stimmt“. → Platzhalter gibt es nicht mehr; Zeilen im Block ohne Betrag erscheinen als Posten „Betrag nicht gelesen“
   mit Bild.
9. **Bedienung.** Die Bon-Ansicht bot nur Zeilen mit erkanntem Betrag an. → Jede Zeile ist antippbar; leere Stelle antippen
   liest dort eine Zeile neu; andere Lesungen stehen als Ein-Tipp-Vorschläge im Blatt.

## Grenzen (ehrlich)
- Fehlerfrei kann keine Texterkennung zusagen. Zusagen kann die App: Ohne bestandene Prüfung wird nichts als „geprüft“ gezeigt,
  und jede Lesung steht mit ihrem Bildausschnitt daneben.
- Ohne QR-Code und ohne lesbare Summe gibt es keine Prüfung, dann ist alles „bitte vergleichen“.
- Dauer im Test-Chromium für diesen Bon: ~34 s (Mehrfachlesen eingeschlossen). Auf Handys nicht gemessen.
- PaddleOCR-Doku nennt für die Erkennung keine Richtung zu thresh/box_thresh/unclip_ratio (paddleocr.ai, text_detection,
  abgerufen 29.10.2026); deshalb keine Parameter geändert, sondern nachgelesen.
