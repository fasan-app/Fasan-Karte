# Scan, Begradigung und Bedienung (01.11.2026)

Anlass: Handy-Protokoll 3.18 (REWE 3). Die Erkennung war richtig (5/5, 7,76 €), aber:
- Die Ansicht „Bereinigt“ war nur ein Schwarzweißbild. Begradigt sah man nichts.
- „Original“ zeigte das Foto unter Kästen aus einem anders verzerrten Bild. Tippte man auf den sichtbaren Text, landete
  man neben den Kasten, und die App bot VOLLKORNSANDWICH ein zweites Mal als Zeile an.
- Kräuterquark erschien als „(1/2)“ und „(2/2)“, die Zeile „2 Stk x 0,65“ als eigene antippbare Zeile.
- Die Ladeanzeige war zu groß und Wichtiges lag unter der Falz. Ein grauer „Weiter“-Knopf war während des Lesens sinnlos.
- Kopf und Fuß des Bons ließen sich einblenden, aber man fand nicht, wie man sie wieder ausblendet.

## 1. Begradigen und Aufbereiten (Dokumentscanner)

| Quelle | Aussage | Folge für Fasan |
| --- | --- | --- |
| Li et al., ICCV 2023, „Foreground and Text-lines Aware Document Image Rectification“ ([PDF](https://openaccess.thecvf.com/content/ICCV2023/papers/Li_Foreground_and_Text-lines_Aware_Document_Image_Rectification_ICCV_2023_paper.pdf)) | Textzeilen als Randbedingung: Text einer Zeile hat nach dem Entzerren dieselbe Höhe. Mit Textzeilen sinkt die OCR-Fehlerrate (CER 0,195 → 0,171). | Die Textzeilen, die die Erkennung ohnehin findet, sind die Grundlage. |
| Zucker, „Page dewarping“ (2016, [Blog](https://mzucker.github.io/2016/08/15/page-dewarping), [page-dewarp](https://github.com/lmmx/page-dewarp)) | Zeilenstücke finden, Seitenmodell (kubische Fläche) so anpassen, dass die Zeilen gerade werden. Grenzen: nur eine Krümmungsrichtung, waagrechte Verzerrung fehlt, Seitenrand nicht erkannt. | Gleiches Prinzip, aber freie glatte Fläche (B-Spline) statt einer Zylinderfläche, damit Knitter korrigiert werden. Waagrecht über die Bogenlänge ab dem linken Rand. |
| Hertlein et al., WACV 2025, „DocMatcher“ ([PDF](https://www.openaccess.thecvf.com/content/WACV2025/papers/Hertlein_DocMatcher_Document_Image_Dewarping_via_Structural_and_Textual_Line_Matching_WACV_2025_paper.pdf)) | Entzerren über zugeordnete Struktur- und Textlinien. | Bestätigt: Linien sind die verlässlichste Größe. |
| Zhang et al., CVPR 2024, „DocRes“ ([Paper](https://openaccess.thecvf.com/content/CVPR2024/html/Zhang_DocRes_A_Generalist_Model_Toward_Unifying_Document_Image_Restoration_Tasks_CVPR_2024_paper.html)) | Ein Netz für Entzerren, Schatten, Aufhellen, Entschärfen und Binarisieren. | Gewichte sind von hier aus nicht erreichbar (Hugging Face und Google Drive gesperrt). Später prüfen. |
| UVDoc (Verhoeven et al. 2023, schon in der App) | Netz sagt ein 45×31-Gitter vorher. | Auf dem Handy-Foto örtlich verzerrt (Schrift doppelt hoch, Fuß gestaucht). Darum nur noch als Lese-Durchlauf, nie als Grundlage für den Scan. |

**Umsetzung (scan.js, 3.19):**
1. Jede gelesene Zeile wird als glatte Kurve gemessen (Polynom über die Wortmitten, Ausreißer werden verworfen).
2. Der linke Rand wird robust geschätzt (eingerückte Zeilen zählen nicht).
3. Die Schriftgröße folgt einem Trend über die Bonlänge (Perspektive). Gemessen wird sie über den Zeichenabstand der
   Festbreitenschrift, nicht über die Kastenhöhe: schräge Kästen sind zu hoch.
4. Ziel jeder Zeile: eine waagrechte Linie. Waagrecht gilt die Bogenlänge ab dem linken Rand, senkrecht der
   senkrechte Abstand der Zeilen.
5. Eine glatte Fläche (kubischer B-Spline, robuste kleinste Quadrate) bildet Scan → Foto ab, eine zweite Foto → Scan
   (für die Kästen).
6. Zuschnitt aufs Papier: linker Rand bis kurz hinter die längste Zeile.
7. Nur der Bon zählt. Text auf Tisch und Plakaten wird über Zeilenhöhe, Spalte und Lücken ausgeschlossen (Belém:
   „SUPER BOCK“ auf dem Tisch).
8. Zwei Durchgänge: Auf dem ersten Scan sind die Zeilen besser bekannt, der zweite verfeinert.
9. Dokumentlook: Die Papierhelligkeit kommt aus einer morphologischen Schließung (Maximum, dann Minimum, halbe
   Zeilenhöhe), gerechnet wird Pixel geteilt durch Papier, mit weicher Tonkurve. Das Minimum ist nötig, weil
   Handykameras helle Schärfungsränder um die Schrift legen. Ein reines Maximum gab graue Höfe um jede Zeile.

**Gemessen (REWE 3, Handy-Foto):**

| Messung | Ergebnis |
| --- | --- |
| Zeilenstreuung nach dem Begradigen, Median | 0,04 Zeilenhöhen |
| Zeilenstreuung nach dem Begradigen, 90 % der Zeilen | 0,12 Zeilenhöhen |
| Rechenzeit Begradigung, Rechner | ≈ 0,3 s je Durchgang |

Zum Vergleich: Ohne Begradigung sind die Zeilen schräg und gewellt (bis mehrere Zeilenhöhen).

**Folge für die Anzeige:** Scan, Foto und Kästen haben dieselbe Geometrie. „Foto“ ist das begradigte Farbbild. So passt jeder
Kasten auf seine Zeile, und ein Tipp neben einen Kasten rastet auf die nächste Zeile ein.

## 2. Erkennungsmodelle

PaddleOCR hat im Juni 2026 PP-OCRv6 veröffentlicht ([Doku](http://www.paddleocr.ai/main/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html),
[Hugging Face Blog](https://huggingface.co/blog/PaddlePaddle/pp-ocrv6), [arXiv 2606.13108](https://arxiv.org/html/2606.13108v1)):
- Größen: tiny 1,5 M, small 7,7 M, medium 34,5 M Parameter.
- Medium gegenüber PP-OCRv5 server: Erkennung der Textstellen +4,6 Punkte, Lesen +5,1 Punkte (Hausbenchmark).
- 50 Sprachen, darunter Japanisch, Chinesisch und Lateinschriften.
- CTC-Kopf (paralleles Dekodieren), Eingabe 3×48×W.

ONNX-Dateien liegen in ppu-paddle-ocr-models (GitHub, über media.githubusercontent.com erreichbar). Offen ist, welche
lateinischen Sprachen dabei sind (Deutsch, Portugiesisch?) und welche Vorverarbeitung gilt. Beides vor dem Einbau aus
der Modellkonfiguration lesen und mit den Testbons messen; nicht raten. Für japanische Bons wäre das der Weg.

## 3. Bedienung: Studien und Leitlinien

| Quelle | Aussage | Umsetzung 3.19 |
| --- | --- | --- |
| Buell & Norton 2011, „The Labor Illusion“, Management Science 57(9):1564–1579 ([RePEc](https://econpapers.repec.org/RePEc:inm:ormnsc:v:57:y:2011:i:9:p:1564-1579)) | Sichtbar gemachte Arbeit lässt Wartezeit wertvoller und akzeptabler wirken als ein bloßer Ladekreis. | Die Ladeanzeige ist der Bon selbst: Ein Lichtband läuft darüber, gefundene Zeilen leuchten auf, dann erscheint der begradigte Scan. |
| Harrison et al., UIST 2007, „Rethinking the Progress Bar“ ([CMU](https://kilthub.cmu.edu/articles/journal_contribution/Rethinking_the_Progress_Bar/6470396/1)) | Gleiche Dauer wirkt je nach Verlauf des Balkens kürzer oder länger. Stocken und Verlangsamen am Ende wirken lang. | Ein Balken mit Prozent und Stufe; die Stufen sind gleichmäßig verteilt. |
| IHC 2025, Vergleich von Ladestrategien ([SBC](https://sol.sbc.org.br/index.php/ihc_estendido/article/view/37767)) | Bei 21 Personen und gleicher Ladezeit wirkte ein Skelett-Bildschirm am schnellsten, eine leere Seite am langsamsten. | Statt Leerfläche ist sofort das eigene Foto zu sehen, die Felder darunter sind sofort bedienbar. |
| Parhi, Karlson & Bederson, MobileHCI 2006 ([DOI](https://dx.doi.org/10.1145/1152215.1152260)) | Daumenbedienung: ab etwa 9,2 mm (einzelnes Ziel) kaum Fehler. | 44 px Ziel (≈ 7–9 mm je nach Gerät), Abstände dazwischen. „Groß“ in den Einstellungen gibt 56 px. |
| NN/g, „Illusion of Completeness“ ([Artikel](https://www.nngroup.com/articles/illusion-of-completeness/)) und „Scroll Fading 101“ ([Artikel](https://www.nngroup.com/articles/scroll-fading-101/)) | Nutzer scrollen nicht, wenn die Seite fertig aussieht. Große Lücken und Einblenden beim Scrollen verschlimmern das auf dem Handy. | Kopf- und Fußleiste bekommen einen Schatten, solange Inhalt darunter weitergeht. Personenleisten blenden am Rand aus. Keine großen Leerflächen. |
| Nielsen, Fehlervermeidung (Heuristik 5); Norman | Fehler verhindern statt melden; jede Aktion führt zum Ziel. | „Weiter“ ist nie ein toter grauer Knopf: Fehlt etwas, springt er zum ersten offenen Posten. Jede Bonzeile gibt es nur einmal. |
| Apple HIG, Liquid Glass (siehe Recherche 31.10.) | Inhalt zuerst, Bedienelemente zurückhaltend, Aktionen an vorhersehbarer Stelle. | Bon-Ansicht: immer der ganze Bon, Kopf und Fuß nur blasser. Es gibt keinen versteckten Zustand, den man zurückschalten muss. |

## 4. Offen

- Übrige Ansichten (Mehr, Gruppe, Karte) weiter verdichten. Die Meldungen sind schon kompakt, der Scan-Knopf ist einzeilig, Segmente lassen sich wischen.
- PP-OCRv6 medium messen (Latein, Japanisch) und einbauen, wenn es auf den Testbons besser liest.
- Laufzeit auf dem Handy: Die UVDoc-Durchläufe werden kaum noch gebraucht; nach Messung streichen.
