# Bon-Ansicht, Klarnamen und Personenfarben (29.10.2026)

## 1. Was KI-Texterkennung (große Sprach-/Bildmodelle) anders macht
- **Ein Modell statt Kette:** Bild rein, fertiger Text bzw. Felder raus („end-to-end“). LightOnOCR-1B: „fully differentiable and
  easy to optimize end-to-end“; Ketten aus Erkennen + Lesen nennen sie „brittle“ und mit „multiple model calls per page“.
  5,71 Seiten/s auf einer H100-GPU. https://huggingface.co/blog/lightonai/lightonocr (abgerufen 29.10.2026)
- **Sprachwissen:** Das Modell weiß, welche Wörter und Werte wahrscheinlich sind, und „rät“ unleserliche Stellen aus dem Zusammenhang.
  Kehrseite: Es kann plausible, aber falsche Werte erzeugen (Halluzination) – darum prüfen auch diese Systeme Summen nach.
- **Wörterbuch beim Lesen:** Lexikon-gestützte Korrektur senkt Fehlerraten deutlich (Rijhwani u. a. 2021, TACL 9: 15–29 % relativ
  weniger Fehler). https://transacl.org/index.php/tacl/article/view/3193
- **Was wir übernehmen (ohne Cloud, ohne Riesenmodell):** Summe als Prüfung (hatten wir), Spaltenkopf und Firmenkopf erkennen
  (Layout), Wörterbuch für „Was war es?“ mit unscharfem Abgleich gegen Lesefehler (speisen.js), und der Mensch sieht immer das
  Original neben der Lesung. Ein Bild-Sprachmodell im Handy-Browser ist mit ~1 Mrd. Parametern zu groß/langsam [Annahme, nicht gemessen].

## 2. Gestaltung
- **Wiedererkennen statt Erinnern** (Nielsen, Heuristik 6): Original-Zeile und deutscher Klarname neben jedem Posten; der Bon ist
  jederzeit einen Tipp entfernt (Knopf oben + schwebender Knopf), im Bon wird direkt bearbeitet.
  https://thedecisionlab.com/reference-guide/design/recognition-rather-than-recall
- **Farbe hilft beim Suchen, wenn die Zielfarbe sich abhebt:** Suchzeit steigt stark, je mehr Elemente die Zielfarbe teilen und je
  ähnlicher andere Farben sind (Human Factors Society 1979, 23(1) 369–373). Übersicht über 42 Studien: Farbe kann sehr wirksam sein,
  unter manchen Bedingungen aber schaden (Human Factors 17(6), 1975, 542–570).
  https://scilit.com/publications/d002233a4e6fed15406979748ab43afd · https://scilit.com/publications/17ff1ae4b164881a6f549402f006c1b5
  → wenige, deutlich verschiedene Farben; eine Farbe je Person.
- **Nie Farbe allein** (WCAG 1.4.1): immer mit Kürzel. https://w3c.github.io/wcag/understanding/use-of-color.html
  Palette Okabe-Ito (für die häufigen Farbsehschwächen unterscheidbar).
- **Kürzel:** kürzester eindeutiger Namensanfang ab 2 Zeichen (Pia/Christina → „Pia“/„Christ“), gleiche Namen mit Nummer.

## Nicht belegt / offen
- Ob 8 Farben bei großen Gruppen reichen: ab der 9. Person wiederholen sich Farben, das Kürzel bleibt eindeutig.
- Wirkung im Feld nicht gemessen (kein Nutzertest).
