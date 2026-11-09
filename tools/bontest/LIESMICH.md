# Bon-Test (Erkennung + Summenprüfung)

Künstliche Bons aus sechs Ländern (`bons/*.json`: Zeilen, richtige Posten in Cent, Summe), daraus Handyfoto-artige
Bilder in vier Stufen (mild, hart, extrem = blasser Thermodruck, dazu auf dem Kopf und quer).
Nur zur Regressionsprüfung: echte Bons sind schwerer, Zahlen hier sind optimistisch.

```sh
cd site && python3 -m http.server 8765 &          # App lokal
cd tools/bontest
for f in bons/*.json; do node bon-html.mjs $f ${f%.json}.png; done
n=0; for f in bons/*.png; do n=$((n+1)); python3 foto.py $f ${f%.png}-hart.jpg 1.0 $n; python3 foto.py $f ${f%.png}-extrem.jpg 1.5 $((n+20)); done
node e2e.mjs paddle bons/*.png bons/*-hart.jpg bons/*-extrem.jpg     # oder: tesseract
node einheit.mjs                                                      # Summenprüfung mit eingebauten Lesefehlern
```
Playwright wird unter `/opt/node-tools/node_modules/playwright` erwartet (Pfad in den .mjs-Dateien anpassen).

Pfand, Rabatt und Extras hängt die Erkennung an einen Artikel (Betrag inklusive, Feld `zusaetze`); `e2e.mjs` trennt sie für den Vergleich wieder ab.
