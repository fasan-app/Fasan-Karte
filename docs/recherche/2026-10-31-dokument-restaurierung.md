# Bon wie gescannt: Knitter, Flecken, Schatten, Wölbung beheben (31.10.2026)

Wunsch: Bon begradigt und entknittert wie bei einem hochwertigen PDF-Scanner; wahlweise Original oder bereinigt,
auch nebeneinander.

## 1. Was es gibt (Stand der Technik)

| Verfahren | Was es behebt | Lizenz / Größe | Eignung für die App |
| --- | --- | --- | --- |
| Klassisch: Seite finden + perspektivisch entzerren | Schräglage, Perspektive | – | eingebaut (Papierkanten, sonst aus der Schrift) |
| Klassisch: Hintergrund schätzen und herausrechnen (Morphologie/Unschärfe, dann teilen) | Schatten, Vergilbung, leichte Knitter | – | eingebaut (`scanBild`) |
| Textzeilen-Entzerrung („page dewarping“, Zucker 2016: Textzeilen finden, Fläche anpassen, neu abtasten) | Wölbung, Wellen | – | eingebaut, vereinfacht (`glaetten`, siehe 2) |
| UVDoc (SIGGRAPH Asia 2023, Netz sagt je Gitterpunkt, wohin das Papier gehört) | Wölbung, Knicke | Code MIT; Lizenz der Gewichte nicht genannt; Python-Paket docuwarp (ONNX) 14,8 MB | möglich als ONNX im Handy; vor Einbau Gewichte-Lizenz klären |
| DocTr (Transformer: Entzerrung + Beleuchtung) | Wölbung, Schatten | Forschungscode | schwerer, nicht geprüft |
| DocRes (2024, ein Modell für Entzerren, Entschatten, Aussehen, Entschärfen, Binarisieren) | alles zusammen | Lizenz im Repository nicht angegeben | vorerst nicht nutzbar |

Neuronale Verfahren sind besser bei starken Knicken, brauchen aber ein weiteres Modell im Handy (mehr Download,
mehr Rechenzeit). Regel des Projekts: nur, was im Handy läuft und dessen Lizenz klar ist.

## 2. Umgesetzt (3.14)

1. Bon aus der Schrift bestimmen, perspektivisch entzerren (wie bisher).
2. **Glätten:** Jede gelesene Zeile müsste waagrecht sein. Aus den Wortkästen (Mitte, Neigung langer Kästen) ergibt
   sich je Stelle, wie weit die Schrift verschoben ist; daraus ein glattes Verschiebungsfeld (Gauß-gewichtet auf einem
   Gitter), das Bild wird neu abgetastet. Nur senkrecht: ein waagrechtes Feld aus Zeilenanfängen scherte zentrierte
   Zeilen kursiv (Test Markt B 2) und wurde verworfen.
3. Auf dem geglätteten Bild wird neu gelesen. Liest es schlechter, gewinnt die bessere Lesung, das angezeigte Bild ist
   trotzdem das geglättete (Kästen werden umgerechnet).
4. **Dokumentfilter für die Anzeige:** Hintergrund geteilt, dann helle Grautöne (Knicke, Knitterschatten) → weiß,
   Schrift bleibt schwarz. Für die Erkennung die milde Fassung (blasser Thermodruck soll bleiben).
5. Bon-Ansicht: **Bereinigt | Original | Nebeneinander** (Original = gleicher Ausschnitt ohne Filter, Kästen nur
   auf dem bereinigten Bild).

Verworfen: Finger/Tisch am Rand über die Farbsättigung weiß machen – unter warmem Licht ist auch das Papier gesättigt,
die Beträge rechts verschwanden (Test Green Soul).

## 3. Grenzen

- Scharfe Knicke werden nur geglättet, wo Schrift ist; zwischen den Zeilen und am Rand bleibt die Verformung.
- Finger und Untergrund am Rand bleiben sichtbar, wenn die Papierkante nicht gefunden wird.
- Nächster Schritt mit größter Wirkung: UVDoc als ONNX (nach Klärung der Gewichte-Lizenz).

## Quellen (abgerufen 31.10.2026)
- UVDoc: arxiv.org/abs/2302.02887; github.com/tanguymagne/UVDoc (MIT); pypi.org/project/docuwarp
- DocTr: arxiv.org/pdf/2110.12942
- DocRes: arxiv.org/pdf/2405.04408
- Page dewarping: mzucker.github.io/2016/08/15/page-dewarping.html
- Hintergrund-Entfernung: schmijoe.github.io/2022/09/17/bg-removal

## 4. Wie Scanner-Dienste es lösen, woran OCR scheitert (Nachtrag 31.10.2026)

**Scanner-Dienste**
- Google ML Kit Document Scanner (Android): Zuschneiden/Kantenerkennung, Filter, Schatten-, Flecken- und
  Finger-Entfernung per ML, alles im Gerät, aber Modelle über Google Play-Dienste (developers.google.com/ml-kit/vision/doc-scanner)
  → passt nicht zu „keine Google-Dienste“, nur als Vergleich.
- Veryfi (Bon-Erkennung, Cloud): „Graph-Based Dewarping“ richtet Artikel, Preis und Summen auf eine gemeinsame Zeile aus
  und baut die Anordnung neu auf; Verfahren nicht offengelegt (faq.veryfi.com). Genau das Ziel: Zeilen, auf denen Name
  und Preis stehen, werden waagrecht gezogen.
- Offene Umsetzung des Zeilen-Ansatzes: page-dewarp (MIT, Python): Textflächen finden, zu Zeilen verbinden, Seite als
  kubische Fläche mit Kamera modellieren, Parameter optimieren, danach optional binarisieren (pypi.org/project/page-dewarp).

**Woran OCR bei Fotos häufig scheitert, und die Abhilfe** (imagetotable.ai, Übersicht):
zu geringe Auflösung (mind. ~300 dpi; sonst hochskalieren), Schräglage (vor dem Binarisieren begradigen), Rauschen
und JPEG-Blöcke (Median-/Bilateralfilter), blasse Schrift/Thermopapier (CLAHE, Sauvola-Schwellwert), Knicke/Schatten
(Inpainting, Dilatation). Reihenfolge: begradigen → entrauschen → Kontrast → reparieren → binarisieren.

**In der App (3.15):** Zeilen-Glättung jetzt in zwei Durchgängen – der zweite misst die Restwelle an den schon
gepaarten Zeilen (Name und Preis auf einer Zeile) und gleicht sie aus. Danach: Bon als Tabelle (CSV für Excel/LibreOffice:
Artikel, Klarname, Menge, Einzelpreis, Pfand/Rabatt, Betrag, Steuerbuchstabe, Personen) und als Volltext exportierbar.

**Offen:** starke Knicke zwischen den Zeilen; kubisches Flächenmodell mit Optimierer (page-dewarp) als Alternative zum
Gauß-Feld; UVDoc als ONNX nach Lizenzklärung.

Quellen: developers.google.com/ml-kit/vision/doc-scanner; faq.veryfi.com (Receipt Layout Correction); pypi.org/project/page-dewarp;
imagetotable.ai/blog/ocr-low-accuracy-scanned-documents

## 5. UVDoc eingebaut (3.16)

Vorgabe des Nutzers (31.10.): erst das beste Ergebnis, Downloadgröße und Lizenz später.
- Gewichte und Code aus github.com/tanguymagne/UVDoc (Repository MIT), Commit und SHA-256 festgenagelt.
- Umwandlung nach ONNX im GitHub-Workflow `modelle.yml` (Zweig `modelle`). Erster Versuch wich um 0,19 ab: In-place-ReLU
  wird beim Export falsch verkettet. Ohne In-place: Abweichung 3,3·10⁻⁶ zu PyTorch.
- In der App: Durchlauf „entfaltet“ (Gitter 31×45 → Bild neu abgetastet), danach Glätten aus den Zeilen. Bester
  Durchlauf gewinnt. Test: Markt B 2 (stark zerknittert) jetzt glatt und waagrecht; Markt B 1 liest UVDoc schlechter, dort
  gewinnt die Zeilen-Glättung.
- Größe 31,6 MB, lädt erst beim ersten Bon nach der Erkennung.

Noch nicht ausprobiert, Kandidaten für „bestes Ergebnis“: PaddleOCR-Server-Erkennungsmodell (größer, genauer als das
Mobil-Modell), DocRes (Entschatten/Aussehen; Lizenz im Repository nicht angegeben).
