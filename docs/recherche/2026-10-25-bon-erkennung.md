# Bon-Erkennung am echten Kassenzettel (25.10.2026)

Testbon: Restaurant Beispiel, Lissabon, 24.10.2026, Foto 1659×2212 auf kariertem Tuch. Wahrheit: 11 Posten, 85,00 €.
QR (Portaria 195/2020): O 85,00 · N 11,08 · I5/I6 59,20/7,70 (13 %) · I7/I8 14,72/3,38 (23 %).

## Warum das alte Verfahren scheiterte
- Schräglagen-Messung über das ganze Foto richtete sich nach dem Tuchmuster (9,5°).
- Tesseract PSM 11 auf dem ganzen Foto: Bon nur ~30 % der Bildbreite, Zeilen zerstört → Summe 186,28 statt 85,00.

## Was jetzt passiert (alles im Handy, bonbild.js und bon.js)
1. Maske „Papier“: örtliche Streuung (7×7) klein, hell, kaum bunt → Tuch fällt weg (nicht glatt). Fläche mit Schriftanteil und rechteckiger Hülle gewinnt.
2. Kleinstes umschließendes Rechteck der Hülle → vier Ecken → Homographie → Breite ~1300 px.
3. Zeilen laufen danach oft noch schief (oben anders als unten): Streifenweise Winkelsuche, Gerade durch die Winkel, Scherung (zweimal).
4. Tesseract (por, PSM 6) auf dem Ausschnitt. Liegt der Bon quer: Ecken umordnen. Schlechtes Ergebnis: 180° gedreht, dann Gesamtfoto.
5. Parser: Menge, „Uni“, Name, Steuersatz (%-Zeichen oft als 4/8/fehlend gelesen), Betrag; „Preco: x/Uni“ je Zeile.
6. Prüfung: Summe je Steuersatz = QR-Brutto (Basis + IVA); genau ein unlesbarer Betrag wird aus dem Rest errechnet („bitte prüfen“); fehlende Zeilen → sichtbarer Posten „Nicht gelesen“; Gesamtsumme = QR O.

## Messung (Playwright, Chromium, Tesseract im Browser)
| Fall | Ergebnis |
| --- | --- |
| Original | 11/11 Posten, 85,00 = QR |
| 0,8× / 1,2× / 1,5× verkleinert/vergrößert, JPEG 80 | 11 Posten, Summe stimmt (je nach Lauf 0–1 „Nicht gelesen“) |
| 20° gedreht, dunkler Rand | alle 9 lesbaren Posten, Summe stimmt über QR-Rest |
| 8° gedreht, JPEG 75 | 11/11 |
| 90° quer | 11/11 |
| 35° gedreht | 8 Posten + 2× „Nicht gelesen“, Summe stimmt |
| Halbe Auflösung (830 px breit) | scheitert (Bon nur ~300 px breit) – nicht behoben |
| Starke Unschärfe (σ=2) | scheitert, Bon wird nicht gefunden – nicht behoben |

## Grenzen
- Eine einzige echte Vorlage (Zone-Soft-Drucker). Andere Drucker/Bons: nicht geprüft.
- Namen werden teils verstümmelt („COCA COLA“ → „OCACoL“). Beträge und Summe sind abgesichert, Namen nicht.
- Menge wird nur aus der Zeile gelesen; ohne lesbaren „Preco“ wird nicht je Stück aufgeteilt.
- Ohne QR bleibt nur die Steuer-Tabelle auf dem Bon als Prüfsumme (OCR-anfällig).

## Nachtrag Bon 2 (Tasca de Notícias, 24.10.2026, 8 Posten, 103,95 €)
- Zeilen und Bon wurden gefunden; die Fehler lagen bei Ziffern (7→1, 40→41, 13→„193“), „Preco“ als „Freco“, %-Zeichen als 4/8/g.
- Abhilfe: Betrag und Menge × Preco als zwei Lesungen, Auswahl über die QR-Summe je Steuersatz; Steuersatz-Kandidaten bei Lesefehlern; Namen nachlesen.
- Ergebnis: 8/8 Posten, Summe = QR; auch nach JPEG-Neukodierung (anderer QR-Pfad nötig, jsQR nur bei ~0,35× Verkleinerung).
- Neuronale Alternativen (PaddleOCR PP-OCRv4/v5 als ONNX mit onnxruntime-web, Apache-2.0): in dieser Sitzung nicht prüfbar, Modell-Hosts (GitHub-Releases, HuggingFace, jsDelivr, npm) vom Netz gesperrt. Nicht geprüft.
