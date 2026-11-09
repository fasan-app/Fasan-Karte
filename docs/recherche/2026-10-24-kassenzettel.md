# Kassenzettel lesen: OCR auf dem Gerät, QR-Summe, Prüfung durch Nutzer

Stand: 24.10.2026. Frage: Wie liest man portugiesische Restaurant- und Supermarkt-Bons am zuverlässigsten komplett auf dem Gerät (Browser, kein Cloud-Dienst)? Wie prüft und korrigiert der Nutzer das Ergebnis?

Kennzeichen in diesem Dokument:

- **[B]** belegt, mit Quelle (URL und Datum).
- **[L]** lokal geprüft (Vendor-Code in `site/vendor/tesseract`, oder Node-Test im Scratchpad).
- **[V]** Vorschlag oder Startwert. Kein Beleg. Am Messplan (Abschnitt 5) prüfen.

Aufwand der Recherche: 18 Suchen und 22 Abrufe (einer davon eine Fehlerseite). Dazu 9 Abrufe, die nicht freigegeben waren (u. a. tessdoc-Seiten, MDN, GitHub). Das Budget von ca. 35 ist um etwa 5 Aufrufe überschritten.

## Kurzfassung

1. Der QR-Code auf dem Bon (ATCUD-QR) liefert den **Gesamtbetrag (Feld O)** und die **IVA-Summen je Satz (I2–I8)** exakt. Er enthält **keine Positionen**. [B]
2. Der QR-Code ist Pflicht für Dokumente aus zertifizierter Software. Er kann trotzdem fehlen (Vorab-Rechnung, vorgedruckte Papiere, Ausland). Er ist ein Bonus, kein Ersatz für OCR. [B]
3. QR lesen geht im Browser ohne Cloud. Native `BarcodeDetector` gibt es auf Chrome Android, aber nicht verlässlich auf iOS Safari. Fallback: zxing-wasm (MIT/Apache-2.0) oder jsQR (Apache-2.0). [B]
4. Für OCR gibt es keine belegten Zahlen zu portugiesischen Bons. Die einzige gefundene Messung mit Tesseract auf Kassenzetteln (englisch, Standard-Einstellungen) ist schlecht: 33,6 % Zeichenfehler. Die Einordnung ist im Abschnitt 5. [B]
5. Deshalb gilt: **OCR liefert nur Vorschläge. Die Summenprüfung entscheidet, was der Nutzer prüfen muss.** Eigener Testsatz mit echten Bons ist Pflicht, bevor wir Zahlen versprechen.

---

## 0. QR-Code auf portugiesischen Rechnungen (Schlüsselfrage)

### Konkrete Vorgaben

**Rechtsgrundlage und Pflicht**

- Portaria 195/2020, Diário da República n.º 157/2020, Série I, 13.08.2020. Unterzeichnet 03.08.2020. In Kraft ab 01.01.2021. Art. 5: Der QR-Code muss den technischen Spezifikationen der AT entsprechen. [B] https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Portaria_195_2020.pdf (Stand 13.08.2020)
- Die Felder stehen **nicht** in der Portaria. Sie stehen in der AT-Spezifikation „Especificações Técnicas Código QR“, **Version 1.1, Oktober 2020** (erstellt 13.08.2020, aktualisiert 30.10.2020). [B] https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Novas_regras_faturacao/Documents/Especificacoes_Tecnicas_Codigo_QR.pdf
- AT-FAQ: QR-Pflicht gilt für Dokumente aus **AT-zertifizierter Software**. Unabhängig vom Empfänger. Auch wenn der Kunde keine NIF angibt. Vorgedruckte Papiere brauchen keinen QR, wenn keine zertifizierte Software im Spiel ist. Der QR muss sichtbar sein, auf der ersten oder letzten Seite. [B] https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/Pages/faqs-00879.aspx (Seite ohne Datum, abgerufen 24.10.2026)
- Zeitplan laut Vendus-Blog: QR „ab Januar 2022“. ATCUD Pflicht ab 01.01.2023. [B] https://www.vendus.pt/blog/qr-code-faturas/ (Artikel vom 15.12.2022). Die Quelle ist ein Software-Anbieter, nicht das Gesetz.

**Format der QR-Nachricht** [B] (AT-Spezifikation v1.1)

- Jedes Feld: `Code:Wert`. Felder mit `*` verbunden. Reihenfolge wie in der Tabelle. Feld S darf kein `*` enthalten.
- Beträge: Punkt als Dezimaltrenner, immer 2 Nachkommastellen, kein Tausendertrenner, in Euro.
- Mindestens ein Steuerraum (Gruppe I, J oder K), höchstens drei. Ohne IVA-Satz: `I1:0`.
- Felder N und O dürfen keine Werte enthalten, die das Dokument selbst nicht zeigt. Der QR-Gesamtbetrag ist also der gedruckte Gesamtbetrag.
- Beispiel (Anfang): `A:123456789*B:999999990*C:PT*D:FS*E:N*F:20190812*G:FS ...`

| Code | Inhalt | Max. Länge | Pflicht |
|---|---|---|---|
| A | NIF des Emittenten | 9 | ja |
| B | NIF des Erwerbers (`999999990` = Endverbraucher) | 30 | ja |
| C | Land des Erwerbers | 12 | ja |
| D | Dokumenttyp (z. B. FT, FS, FR) | 2 | ja |
| E | Status (N = normal) | 1 | ja |
| F | Datum `YYYYMMDD` | 8 | ja |
| G | Eindeutige Dokument-ID (z. B. `FS 1/234`) | 60 | ja |
| H | ATCUD (z. B. `CSDF7T5H-0035`, ohne Serienvalidierung `0`) | 70 | ja |
| I1 | Steuerraum (`PT`) | 5 | ja |
| I2 | Basis, IVA-befreit | 16 | optional, aber setzen, wenn Daten da |
| I3 / I4 | Basis / IVA, **reduzierter** Satz | 16 | wie I2 |
| I5 / I6 | Basis / IVA, **mittlerer** Satz | 16 | wie I2 |
| I7 / I8 | Basis / IVA, **normaler** Satz | 16 | wie I2 |
| J1–J8 | wie I1–I8, Beispiel `J1:PT-AC` (Azoren) | 5 / 16 | optional |
| K1–K8 | wie I1–I8, Beispiel `K1:PT-MA` (Madeira) | 5 / 16 | optional |
| L | nicht steuerbar / andere Fälle | 16 | optional |
| M | Stempelsteuer | 16 | optional |
| N | Steuern gesamt (IVA + Stempelsteuer) | 16 | ja |
| **O** | **Gesamtbetrag mit Steuern (GrossTotal)** | 16 | **ja** |
| P | Quellensteuer | 16 | optional |
| Q | 4 Zeichen des Hash | 4 | ja |
| R | Zertifikatsnummer | 4 | ja |
| S | Sonstiges (Freitext, z. B. Zahlung `TB;PT000...;513500.58`) | 65 | optional |

- Positionen (Artikel, Mengen, Einzelpreise): **nicht enthalten.** Die Spezifikation hat nur Kopf-, Steuer- und Summenfelder. [B]
- Technik des Codes: Fehlerkorrektur **M**, Typ Byte, 2 Pixel je Modul, **Version mindestens 9**, Größe **mindestens 30 × 30 mm**, Rand 0,25 cm. [B]
- Version 9 hat 53 × 53 Module (Formel 17 + 4·v aus ISO 18004, aus dem Gedächtnis, nicht aus den abgerufenen Quellen). Bei 30 mm Kantenlänge ist ein Modul etwa 0,57 mm groß. [V] Das heißt: Das Foto muss den QR mit mindestens ca. 4 Pixel je Modul zeigen, also ca. 210 px Kantenlänge. Der Wert 4 px je Modul ist eine Faustregel ohne Beleg.
- IVA-Sätze: Festland 6 % (reduziert), 13 % (mittel), 23 % (normal). Madeira 4/12/22 %, Azoren 4/9/16 %. [B] https://www.vendus.pt/blog/taxas-de-iva-na-restauracao/ (19.11.2025, Blog, kein Gesetzestext)
- Abbildung auf Felder [V]: Festland-Bons nutzen I3/I4 = 6 %, I5/I6 = 13 %, I7/I8 = 23 %.

**QR im Browser lesen**

| Weg | Stand | Quelle |
|---|---|---|
| Native `BarcodeDetector` | Chrome Android: unterstützt. Samsung Internet 13–30: unterstützt. Firefox Android: nein. Safari iOS: „standardmäßig deaktiviert“ bis 27.2. | [B] https://caniuse.com/mdn-api_barcodedetector_detect (ohne Datum, abgerufen 24.10.2026) |
| Hinweise zur API | Auf Android sind Google Play Services nötig. Formate können je Plattform fehlen: vorher `getSupportedFormats()` prüfen und `qr_code` suchen. | [B] https://developer.chrome.com/docs/capabilities/shape-detection (Stand 07.01.2019) |
| Status laut MDN-Kopie | „Limited availability“, experimentell, nur sichere Kontexte (HTTPS). Diese Kopie nennt Safari ab 17 inklusive iOS. Das widerspricht caniuse. | [B] https://docs.w3cub.com/dom/barcodedetector (ohne Datum, abgerufen 24.10.2026) |
| `barcode-detector` (Sec-ant), Ponyfill auf Basis ZXing-C++ als WebAssembly | Lizenz MIT. Import `barcode-detector/ponyfill`. Gesehene Versionen 3.2.1 und 3.2.2. | [B] https://cdn.jsdelivr.net/npm/barcode-detector@3.2.1/README.md (ohne Datum) |
| `zxing-wasm` | Version 3.1.3 gesehen. Eigener Code MIT, zxing-cpp Apache-2.0, zint BSD-3 (nur Writer). Reader-Wasm ca. **1,04 MiB**. Jede Version hat eine eigene `.wasm`-Datei. | [B] https://cdn.jsdelivr.net/npm/zxing-wasm@3.1.3/README.md (ohne Datum) |
| `jsQR` | Version 1.4.0, Apache-2.0, ca. 280 kB, ohne Abhängigkeiten. Letzte Veröffentlichung laut Seite „vor fünf Jahren“, also nicht mehr gepflegt. | [B] https://www.jsdocs.io/package/jsqr (ohne Datum, abgerufen 24.10.2026) |

- Datenschutz-Falle: `barcode-detector` lädt die `.wasm` standardmäßig von jsDelivr. Das muss man abstellen, sonst geht beim Scannen eine Anfrage nach außen (nicht das Foto, aber die Nutzung) und es klappt nicht offline. Lösung: `.wasm` mitliefern und `prepareZXingModule({ overrides: { locateFile } })` auf die eigene Datei zeigen lassen. [B] gleiche README. `setZXingModuleOverrides` ist veraltet.
- `zxing-wasm` nimmt Blob, File, ArrayBuffer, Uint8Array oder ImageData. Beispiel-Optionen der README: `tryHarder: true`, `formats: ["QRCode"]`, `maxNumberOfSymbols: 1`. [B]
- `jsQR(data, width, height, { inversionAttempts: 'dontInvert' })` mit `Uint8ClampedArray` RGBA. Rückgabe `null` oder Objekt mit `data`. Standard `attemptBoth` halbiert die Geschwindigkeit. [B] https://cdn.jsdelivr.net/npm/only-temp-jsqr@1.3.1/README.md (Spiegel-README, ohne Datum)
- Alle drei Lizenzen (MIT, Apache-2.0) passen zu „keine GPL-Bausteine“. [V] Gilt nur, wenn die Fasan-Regeln (MPL-2.0) auch hier gelten.

**Empfohlener Ablauf** [V]

1. QR **vor** der OCR-Vorverarbeitung lesen, am Originalfoto in voller Auflösung (nicht am binarisierten Bild).
2. Wenn `'BarcodeDetector' in window` und `getSupportedFormats()` enthält `qr_code`: nativ lesen. Sonst `zxing-wasm` (Reader, selbst gehostet). `jsQR` nur als letzter Notnagel.
3. Wenn nichts gefunden: Foto in 2 × 3 überlappende Kacheln teilen und je Kachel erneut versuchen. Dann dem Nutzer „QR näher fotografieren“ anbieten (Ausschnitt-Foto nur vom QR).
4. Parser (getestet mit Node 22): 
   ```js
   const f = Object.fromEntries(raw.split('*').map(s => { const i = s.indexOf(':'); return [s.slice(0, i), s.slice(i + 1)]; }));
   const cents = v => Math.round(parseFloat(v) * 100);   // f.O "58.70" -> 5870
   // Plausibilität: /^\d{9}$/.test(f.A), Feldcodes /^[A-S]\d?$/
   ```
5. Alle Beträge als ganze Cent speichern. Nie Fließkomma summieren.
6. **O ist die Soll-Summe** für die Summenprüfung. Wenn O fehlt oder der QR nicht lesbar ist: gedruckte TOTAL-Zeile (per OCR, vom Nutzer bestätigt).
7. Kreuzprüfung der IVA-Buchstaben: Je Buchstabe (A/B/C) die Summe der Zeilenbeträge bilden. Sie muss `Basis + IVA` eines Satzes aus dem QR entsprechen (z. B. Summe der Zeilen mit Buchstabe C = I5 + I6). So lernt die App, welcher Buchstabe welcher Satz ist. Die Zuordnung ist je Kassensystem verschieden und steht auf dem Bon.
8. Hypothese, nicht geprüft: `O ≈ I2 + I3 + I4 + I5 + I6 + I7 + I8 + L + M` (jeweils vorhandene Felder). Als Warnung nutzen, nicht als Fehler, mit Toleranz 0,02 €.

### Nicht geprüft

- Ob es nach Oktober 2020 eine neuere Fassung der QR-Spezifikation gibt (Felder oder Regeln geändert).
- Wie oft echte Bons (kleine Restaurants, Cafés, Supermärkte wie Continente, Pingo Doce, Lidl) den QR tatsächlich zeigen und wie groß er auf Thermopapier gedruckt ist.
- Ob Vorab-Rechnungen („Conta de mesa“, „Documento não válido como fatura“) keinen QR haben. Das ist nur eine Annahme.
- Ob `BarcodeDetector` auf iOS Safari in den aktuellen Versionen (26/27) wirklich nicht läuft. Die Quellen widersprechen sich (caniuse gegen MDN-Kopie). Auf einem echten iPhone testen.
- `zxing-js/library` (Apache-2.0): nicht abgerufen, Pflegestand unbekannt. Deshalb nicht empfohlen.
- Genaue Option-Namen (`tryRotate`, `tryInvert`, `tryDownscale`) in der gepinnten zxing-wasm-Version.
- Ob die Formel in Punkt 8 stimmt.

---

## 1. Bildvorverarbeitung im Canvas vor der OCR

### Konkrete Vorgaben

**Belegt** (Tesseract-Wiki „ImproveQuality“, zuletzt bearbeitet 24.10.2018, laut Hinweis seit 02.02.2020 nach tesseract-ocr.github.io umgezogen. Die neue Seite war nicht abrufbar.) https://github.com/tesseract-ocr/tesseract/wiki/ImproveQuality/5bc360ad90a69dd2c924066e7a50388b785f29b7

- Tesseract arbeitet am besten bei **mindestens 300 dpi**. Bilder dafür skalieren. [B]
- Tesseract binarisiert selbst. Bei ungleichmäßig dunklem Hintergrund wird das Ergebnis schlecht. [B]
- Zeilen müssen waagerecht sein. Schiefe Seiten verschlechtern die Zeilenerkennung. Es gibt keinen Grenzwinkel. [B]
- Dunkle Ränder werden als Zeichen gelesen. Fehlt ein Rand um den Text, einen weißen Rand ergänzen (Beispiel der Seite: 10 Pixel). [B]
- Eine feste Zeichenhöhe in Pixel nennt diese Seite **nicht**. [B]

**Ablauf mit Startwerten** [V]

1. Foto laden, EXIF-Drehung anwenden. Längste Seite auf höchstens 3000 px begrenzen (Speicher auf dem Telefon).
2. **Zuschnitt**: Nutzer zieht vier Eckgriffe auf den Bon. Das entfernt dunkle Ränder und Hintergrund. Auto-Vorschlag: größte helle Fläche. Der Zuschnitt ist die wichtigste Maßnahme gegen Randfehler.
3. **Graustufen**: `Y = 0,299 R + 0,587 G + 0,114 B`.
4. **Schatten und Papier ausgleichen** (Variante A, Startempfehlung): Hintergrund = Weichzeichner des Graubilds, Radius ca. 1,5 × Großbuchstabenhöhe (bei 30 px etwa 45 px). Ausgabe `= Grau / Hintergrund × 255`. Danach Kontrast strecken: 1-%-Perzentil auf 0, 99-%-Perzentil auf 255.
5. **Binarisieren** (Variante B, nur wenn A schlechter liest): Sauvola, `T = m · (1 + k · (s / R − 1))`, Startwerte `k = 0,2`, `R = 128`, Fenster ca. 1,5 × Großbuchstabenhöhe (ungerade, z. B. 45 px). Otsu global nur als Vergleich.
6. **Größe**: Ziel **Großbuchstabenhöhe ca. 30 px**. Herleitung: 300 dpi = 11,8 px/mm. Typische Bon-Großbuchstaben ca. 2,5 mm hoch (Annahme). Ergibt ca. 30 px. Zweistufig: erster schneller Durchlauf, dann Median der Zeilenhöhen aus `lines[].bbox` nehmen, Faktor `s = Ziel / Median`, begrenzt auf 0,5 bis 3. Zweiter Durchlauf mit skaliertem Bild. Wenn kein erster Durchlauf: Zuschnittbreite 1000 px (80-mm-Papier bei 300 dpi sind 80 / 25,4 × 300 = 945 px, 58-mm-Papier 685 px).
7. **Entzerren**: Winkel schätzen mit Projektionsprofil (Bild auf ca. 600 px verkleinern, −10° bis +10° in Schritten von 0,5°, Winkel mit größter Varianz der Zeilensummen). Alternativ Schieberegler für den Nutzer. Tesseract.js 5.1.1 kennt die Option `rotateAuto` im Code [L], die Wirkung ist nicht dokumentiert. Nicht darauf verlassen.
8. **Rand**: weiße Fläche 10 px um das Bild.
9. Ergebnis als PNG-Blob an Tesseract. Das Original bleibt unverändert im Speicher. Canvas-Neukodierung entfernt EXIF/GPS aus der Kopie.
10. Bild nie über das Netz senden. Absicherung: Content-Security-Policy mit `connect-src 'self'`, alle Modelle und Wasm-Dateien aus dem eigenen Ursprung. Im Entwicklerwerkzeug prüfen, dass beim Scannen keine Anfrage hinausgeht.

### Nicht geprüft

- Aktuelle tessdoc-Seite „ImproveQuality“ (Abschnitte zu Skalierung, Binarisierung, `thresholding_method`). Nicht abrufbar. Ob tesseract.js-core 5.1.1 den Parameter `thresholding_method` (Otsu/Sauvola) kennt: ungeprüft.
- Die Größe „30 px Großbuchstabenhöhe“. Sie ist hergeleitet, nicht belegt. Mit dem Messplan gegen 20, 25, 30, 40 px vergleichen.
- Sauvola-Werte (`k`, Fenster) aus der Literatur nicht geprüft. Die Studie arXiv 1501.07862 wurde gefunden, aber nicht gelesen.
- Ob Variante A (Hintergrunddivision) oder B (Sauvola) für Thermopapier besser ist. Kein Vergleich gefunden.
- Canvas-Größenlimits auf iOS Safari. Die 3000-px-Grenze ist ein Schätzwert.
- Verhalten von EXIF-Drehung in `createImageBitmap` je Browser.

---

## 2. Tesseract-Einstellungen für Bons

### Konkrete Vorgaben

**Lokal belegt** (vendorter Code `tesseract.js` 5.1.1 und `tesseract.js-core` 5.1.1 in `site/vendor/tesseract`, Sprachdaten `por` 4.0.0_best_int, 1,39 MB gz) [L]

- Konstanten: PSM `OSD_ONLY 0, AUTO_OSD 1, AUTO_ONLY 2, AUTO 3, SINGLE_COLUMN 4, SINGLE_BLOCK_VERT_TEXT 5, SINGLE_BLOCK 6, SINGLE_LINE 7, SINGLE_WORD 8, CIRCLE_WORD 9, SINGLE_CHAR 10, SPARSE_TEXT 11, SPARSE_TEXT_OSD 12, RAW_LINE 13`. OEM `TESSERACT_ONLY 0, LSTM_ONLY 1, TESSERACT_LSTM_COMBINED 2, DEFAULT 3`.
- `createWorker(langs, oem, options, config)`. Standard-PSM in tesseract.js ist `SINGLE_BLOCK` (6). Standard-Whitelist leer.
- `recognize(image, options, output)`: Optionen `rectangle` (`left, top, width, height`), `pdfTitle`, `pdfTextOnly`, `rotateAuto`, `rotateRadians`. Standard-Ausgabe im Client `{blocks:true, text:true, hocr:true, tsv:true}`.
- Ergebnisbaum: `blocks[] → paragraphs[] → lines[] → words[]`, dazu `symbols[]` mit `choices[]`. Zeilen und Wörter haben `confidence`, `bbox`, `baseline`. Zeilen haben `rowAttributes`.

**Belegt** (tesseract.js-Doku 5.1.1) https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/docs/api.md (ohne Datum, abgerufen 24.10.2026)

- „Init only“-Parameter lassen sich weder mit `setParameters` noch mit `recognize` ändern. Beispiele: `load_system_dawg`, `load_number_dawg`, `load_punc_dawg`. Sie gehören in das Argument `config` von `createWorker`. [B]
- `oem` gilt ab Start und ist nicht änderbar. [B]
- `user_defined_dpi` (Standard leer) behebt die Warnung „Invalid resolution 0 dpi. Using 70 instead.“ [B] Ein Canvas-PNG hat keine DPI-Angabe. Deshalb setzen.
- `tessedit_pageseg_mode` Standard `PSM.SINGLE_BLOCK`. [B]

**Belegt** (Tesseract-Wiki, 2018): Bei wenig Wörterbuch-Text `load_system_dawg` und `load_freq_dawg` auf `false`. Bei begrenztem Zeichensatz (z. B. nur Ziffern) `tessedit_char_whitelist`. PSM 3 = voll automatisch (Standard), 7 = eine Textzeile, 11 = spärlicher Text. [B]

**Startkonfiguration** [V]

```js
const worker = await Tesseract.createWorker('por', 1 /* LSTM_ONLY */, {
  workerPath: '/vendor/tesseract/worker.min.js',
  corePath:   '/vendor/tesseract/core/',
  langPath:   '/vendor/tesseract/lang/',   // por.traineddata.gz
}, {
  load_system_dawg: '0',   // init-only: nur über config
  load_freq_dawg:   '0',
});
await worker.setParameters({
  tessedit_pageseg_mode: '6',        // SINGLE_BLOCK; Vergleich mit '4' (SINGLE_COLUMN)
  user_defined_dpi: '300',
  preserve_interword_spaces: '1',    // Spaltenabstand behalten (Wirkung ungeprüft)
});
const { data } = await worker.recognize(canvas, {}, { blocks: true, text: true,
                                                      hocr: false, tsv: false });
```

- **PSM**: Start mit 6 (Standard von tesseract.js, ein Block). Gegen 4 (eine Spalte, Zeilen unterschiedlich groß) und 11 (spärlich) am Testsatz vergleichen. Für Kopfzeilen mit großer Schrift eher 4 oder 11. Für den Positionsblock 6.
- **OEM**: `1` (LSTM_ONLY). Passt zu den LSTM-Sprachdaten `best_int` und zum kleineren Kern `tesseract-core-lstm`. Dass `best_int` nur LSTM enthält, ist angenommen, nicht geprüft.
- **Whitelist**: **keine** für den ganzen Bon (portugiesische Zeichen, Buchstabencodes). Zweiter Durchlauf nur für die Preisspalte, siehe unten.
- **Zweiter Durchlauf für Preise** [V]: Für jede Zeile, deren Preis-Token `confidence < 85` hat oder die Regex nicht besteht, den Ausschnitt rechts neu lesen. `recognize(canvas, { rectangle: { left, top, width, height } })` mit PSM `7`, Skalierung ×2, `tessedit_char_whitelist = '0123456789,.-€ABCDE%'`. Ergebnis nur nehmen, wenn die Regex besteht. Dann gilt, was näher an der Summenprüfung liegt.
- **Konfidenz-Schwellen** (kein belegter Standardwert, nur Startwerte) [V]: Wort `< 60` rot, `60–85` gelb, `≥ 85` grün. Zahlen-Token strenger: `< 90` gelb. Dazu Regeln, die unabhängig von der Konfidenz markieren: Regex schlägt fehl, Summenprüfung schlägt fehl, Zeile ohne Preis. Schwellen am Messplan so kalibrieren, dass mindestens 95 % der falschen Preise markiert sind.
- **Alternativen je Zeichen**: `symbols[].choices[]` ist in der Struktur vorhanden [L]. Ob es ohne `lstm_choice_mode` gefüllt ist, ist ungeprüft.
- **Nur `blocks` und `text` anfordern**: spart Arbeit (hocr, tsv sind im Client standardmäßig an [L]). Der Zeitgewinn ist nicht gemessen.

### Nicht geprüft

- Aktuelle tessdoc-Seiten zu PSM, Parametern und „user patterns“. Nicht abrufbar. Die PSM-Beschreibungen für 4 und 6 stammen nicht aus einer abgerufenen Quelle.
- Ob `tessedit_char_whitelist` bei der LSTM-Engine in Version 5.1.1 zuverlässig wirkt. Es gab dazu in früheren Versionen Fehler. Nicht belegt, am Testsatz prüfen.
- Ob `load_system_dawg = 0` die LSTM-Erkennung überhaupt beeinflusst.
- Wirkung von `preserve_interword_spaces`.
- Feldnamen der `bbox` (vermutlich `x0, y0, x1, y1`). Im Code nur `getBoundingBox` gesehen.
- Laufzeit und Speicher auf echten Telefonen (S23 und ein älteres Gerät). Nicht gemessen.
- Ob `best_int` gegenüber `best` messbar schlechter liest.
- GitHub-Issues zu Kassenzetteln in `naptha/tesseract.js` (nicht erreichbar).

---

## 3. Bonzeilen in Positionen zerlegen

### Konkrete Vorgaben

**Belegte Fachpunkte**

- IVA Festland 6/13/23 %. Essen im Lokal meist 13 %. Getränke wie Wein, alkoholische Getränke, Softdrinks, Säfte, Nektar und Sprudelwasser 23 %. Menüs mit Gesamtpreis darf man aufteilen (Speisen mittlerer Satz, Getränke normaler Satz). [B] https://www.vendus.pt/blog/taxas-de-iva-na-restauracao/ (19.11.2025). Der Artikel widerspricht sich bei Wein und Sprudelwasser. Nicht als Gesetzestext nehmen.
- **Couvert**: Muss in der Preisliste stehen. „Nenhum prato, produto alimentar ou bebida, incluindo o couvert, pode ser cobrado se não for solicitado pelo cliente.“ Wer es nicht bestellt und nicht anrührt, kann es abräumen lassen und muss es nicht zahlen. Was verzehrt wurde, muss man zahlen. [B] https://www.deco.proteste.pt/familia-consumo/ferias-lazer/dicas/restaurantes-regras-cobranca-entradas-gelo-copos-agua (18.06.2026). Die Seite nennt keinen Gesetzesartikel.
- Endverbraucher-NIF `999999990`. Rechnungen tragen immer eine NIF-Angabe. [B] https://invoicexpress.com/blog/elementos-obrigatorios-faturas/ (26.12.2025, aktualisiert 13.02.2026). Die Seite behandelt `fatura simplificada` und Art. 40 CIVA **nicht**. Pflichtfelder der Vereinfachten Rechnung: ungeprüft.

**Regex-Entwurf** [L] (in Node 22 gegen 17 Beispielzeilen getestet, siehe unten) [V] (Muster nicht an echten Bons geprüft)

Vor dem Matchen jede Zeile normalisieren: Unicode NFD, Akzente entfernen, Mehrfach-Leerzeichen zu einem. Für den Vergleich mit Schlüsselwörtern in Großbuchstaben. Danach Dezimalpunkt zu Komma, aber nur wenn die Zeile kein `,dd` hat:

```js
const fixDot = s => /,\d{2}\b/.test(s) ? s : s.replace(/(?<=\d)\.(?=\d{2}(?!\d))/g, ',');
```

```js
// Zeile mit Preis am Ende, optional Minus hinten, optional IVA-Kennung (Buchstabe oder 23%)
const LINE = /^(?<desc>.*?\S)\s+(?<price>-?\d{1,3}(?:\.\d{3})*,\d{2}|-?\d+,\d{2})\s*(?:€|EUR)?\s*(?<neg>-)?\s*(?<tax>[A-E]|\d{1,2}(?:[.,]\d{1,2})?\s?%)?$/i;
// Menge vorne: "2 X Couvert", "3 x Pao"
const QTY  = /^(?<qty>\d+(?:,\d{1,3})?)\s*[xX*]\s+(?<rest>.+)$/;
// Menge x Einzelpreis irgendwo in der Beschreibung: "2 x 1,20"
const QTYUNIT = /(?<qty>\d+)\s*[xX]\s*(?<unit>\d+,\d{2})/;
// Wiegeware: "0,534 kg x 3,99"
const WEIGHT = /(?<w>\d+,\d{3})\s*kg\s*[xX]\s*(?<p>\d+,\d{2})/i;
// Summenzeile
const TOTAL = /^(?:SUB\s*-?\s*)?TOTAL(?:\s+(?:A\s+PAGAR|EUR|\(EUR\)))?\b\D*(?<v>-?\d{1,3}(?:\.\d{3})*,\d{2}|-?\d+,\d{2})$/i;
// Betrag in Cent: Tausenderpunkt weg, Komma zu Punkt, runden
const cents = s => { const neg=/-/.test(s); const n=s.replace(/-/g,'').replace(/\./g,'').replace(',','.'); return (neg?-1:1)*Math.round(parseFloat(n)*100); };
```

Testergebnis (Auszug) [L]: `2 X Couvert 3,00 B` → Beschreibung `2 X Couvert`, 300 Cent, Kennung `B`, Menge 2. `Leite UHT 1L 1.234,50 A` → 123450 Cent. `DESCONTO 1,50-` und `DESCONTO -1,50` → −150. `TOTAL A PAGAR EUR 58,70` → 5870. `2 X Cafe 0,90 1,80 B` → 180 Cent, Menge 2 (Einzelpreis 0,90 steht in der Beschreibung). `Cafe 1.50 B` matcht erst nach `fixDot`.

**Ausschlussliste** (Zeile ist keine Position) [V]. Nach Normalisierung, Wortgrenzen, ohne Groß/Klein:

`TOTAL, SUBTOTAL, SUB-TOTAL, A PAGAR, IVA, BASE, MULTIBANCO, MB WAY, MBWAY, TROCO, NIF, CONTRIBUINTE, ATCUD, DINHEIRO, NUMERARIO, ENTREGUE, CARTAO, VISA, MASTERCARD, FATURA, FATURA SIMPLIFICADA, FATURA-RECIBO, ORIGINAL, OBRIGADO, PROCESSADO`

Zusätzlich ausschließen: Zeilen aus Strichen (`-----`), Zeilen mit Datum oder Uhrzeit, Zeilen mit nur Ziffern und `-` im Format ATCUD. Das Wort `DESCONTO` ist **keine** Ausschlusszeile, sondern eine Rabattzeile (siehe unten).

**Rabatte und Negativzeilen** [V]

- Negativ erkennen an `-1,50` oder `1,50-`. Schlüsselwörter: `DESCONTO, DESC, POUPANCA, PROMO, CUPAO, VALE, CAMPANHA`.
- Als eigene Zeile mit negativem Betrag speichern. Standardmäßig an die Zeile davor hängen (Nutzer kann lösen). Die Summe läuft mit Vorzeichen.

**Mengen** [V]

- Muster A: `2 X Name … 3,00`: unklar, ob 3,00 Einzel- oder Zeilenpreis ist. Beide Möglichkeiten halten (`price` und `qty`).
- Muster B: `Name 2 x 1,20 2,40`: der letzte Betrag ist der Zeilenpreis.
- Muster C (Waage, Supermarkt): Zeile mit `kg x Preis` gehört zur Zeile davor oder danach. Zeilenpreis ist der letzte Betrag.
- Bei Unklarheit die Variante wählen, die die Summe zum Soll bringt: Für bis zu 12 unklare Zeilen alle Kombinationen (2^12 = 4096) durchprobieren, ob Summe `= Soll`. Genau ein Treffer: übernehmen und als „automatisch gewählt“ kennzeichnen. Mehrere oder keiner: Nutzer fragen. Getestet am Testbon: Summe der 7 Zeilen = 5870 Cent, 1 Treffer. [L]

**IVA-Kennung am Zeilenende** [V]

- Buchstabe (`A`–`E`) oder `23%` am Ende. Die Zuordnung Buchstabe → Satz **nicht festverdrahten**. Sie steht auf dem Bon (Zeilen wie `IVA 13% Base 41,15 5,35`) und im QR (Abschnitt 0, Punkt 7).
- Der Testbon `site/bon-test.jpg` wirkt synthetisch (Platzhalter-NIF 123456789). Seine IVA-Zeilen passen nicht zu den Positionen (13 %: 41,15 + 5,35 = 46,50, die Zeilen mit `C` summieren 51,40). Nicht als Test der IVA-Prüfung verwenden.

**Summenprüfung** [V]

```
Soll    = QR.O  (falls gelesen)  sonst  gedrucktes TOTAL (vom Nutzer bestätigt)
Ist     = Summe aller Positionen (mit Vorzeichen), in Cent
Differenz = Soll − Ist    -> 0: grün; sonst Zeilen nach niedrigster Konfidenz vorschlagen
```

Versuchsreihenfolge bei Differenz: (1) mehrdeutige Mengen (oben), (2) niedrigste Konfidenz der Preis-Token, Ziffernverwechslungen `0↔O, 1↔l/I, 5↔S, 8↔B, 6↔G` in Zahlen-Token testen, (3) fehlende Zeile (Differenz als Vorschlag für eine neue Zeile). Nur anbieten, nie still ändern. Die Verwechslungspaare sind Erfahrungswerte, nicht belegt.

### Nicht geprüft

- Alle Regexe und Stichwortlisten an echten portugiesischen Bons (Restaurants, Continente, Pingo Doce, Lidl, Auchan, Minipreço). Die 17 Testzeilen sind selbst geschrieben.
- Pflichtinhalte einer „fatura simplificada“ (Art. 40 CIVA) und ihre Betragsgrenze. Quelle gesucht, nicht gefunden.
- Ob Supermärkte Preise mit Punkt statt Komma drucken, ob Beträge in Spalten mit eigener Währungsangabe stehen, wie Pfand und Rundung aussehen.
- Wie `Poupança` (Rabatt) und Treuekarten-Zeilen genau aussehen.
- Ob `Couvert` je Kassensystem mit anderem Satz oder Namen auftaucht (`Entradas`, `Cobertura`).

---

## 4. Prüf- und Korrektur-Oberfläche

### Konkrete Vorgaben

**Belegt**

- Splitwise hat am 16.10.2026 „Itemize“ in den USA und Großbritannien gestartet: Eine Person fotografiert den Bon. Jeder am Tisch wählt seine Positionen und gemeinsame Positionen. Steuer und Trinkgeld werden anteilig verteilt. Der Teilnehmer kann ohne Konto per QR-Code beitreten. Ein eigener Prüfschritt ist im Artikel nicht beschrieben. Ob die Verarbeitung auf dem Gerät oder in der Cloud läuft, steht dort nicht. [B] https://thepaypers.com/payments/news/splitwise-launches-itemize-receipt-splitting-feature-in-the-us-and-uk (16.10.2026)
- Tricount, Splid, Settle Up, Google Lens: **nicht geprüft**. Aussagen, was Nutzer loben, gibt es hier **nicht**.

**Oberfläche** [V]

1. **Zwei Flächen**: oben das Foto (zoom- und verschiebbar), unten die Positionsliste. Antippen einer Zeile hebt ihren Kasten im Foto hervor und zoomt hin. Antippen eines Kastens im Foto springt zur Zeile.
2. **Kästen** aus `lines[].bbox` und `words[].bbox`. Koordinaten durch die Umkehr von Zuschnitt, Drehung und Skalierung zurück ins Originalfoto umrechnen. Dafür die Transformationsmatrix mitspeichern.
3. **Farben und zweiter Hinweis** (nicht nur Farbe): grün sicher, gelb unsicher (gestrichelter Rand), rot fehlerhaft (dicker Rand und Symbol). Schwellen siehe Abschnitt 2.
4. **Bearbeiten**: Tippen auf den Preis öffnet ein Zahlenfeld (`inputmode="decimal"`, Komma als Dezimalzeichen). Beschreibung, Menge, Zeile löschen, Zeile hinzufügen, zwei Zeilen zusammenfügen, „kein Artikel“ (z. B. `MULTIBANCO`). Vorschläge als Chips („1,80 statt 7,80?“), nie automatisch einsetzen.
5. **Summenleiste, immer sichtbar**: `Positionen 58,70 | Bon 58,70 | QR 58,70`. Bei Abweichung: Differenz in Cent und Knopf „Zur unsichersten Zeile“. Bevorzugte Quelle für Soll: QR O, dann gedrucktes TOTAL, dann Nutzerwert.
6. **Bestätigen** erst bei Differenz 0,00 oder wenn der Nutzer die Differenz bewusst als eigene Position (Trinkgeld, Rundung, Fehlendes) anlegt. Angelehnt an die anteilige Verteilung von Steuer und Trinkgeld bei Splitwise. [B]
7. **Couvert** als eigene Position mit Schalter „nicht bestellt, nicht angerührt“. Das stützt sich auf die DECO-Regel (Abschnitt 3). Kein Rechtsrat.
8. **Datenschutz sichtbar**: Hinweis „Das Foto verlässt dieses Gerät nicht.“ Foto nach der Bestätigung standardmäßig verwerfen. Aufbewahren nur auf ausdrücklichen Wunsch, dann lokal (IndexedDB).
9. **Bedienregeln der Fasan-Familie** (Ziele mindestens 60 dp, jede Geste mit sichtbarem Zwilling, Animation nur erklärend) gelten für Fasan Kamera. Ob sie für Fasan Karte gelten, ist ungeprüft. [V]

### Nicht geprüft

- Ablauf, Prüfschritt und Nutzerlob bei Splitwise, Tricount, Splid, Settle Up, Google Lens (Rezensionen, App-Store-Texte). Keine Quelle gelesen.
- Ob Splitwise lokal oder in der Cloud liest.
- Bedienbarkeit auf kleinen Telefonen: Foto und Liste gleichzeitig. Nur Entwurf, kein Test.
- Barrierefreiheit der Kästen im Foto (Screenreader). Nur Entwurf.

---

## 5. Realistische Genauigkeit von Tesseract auf Kassenzetteln

### Konkrete Vorgaben

**Belegt**

- **Messung ImageToTable.ai** (Läufe 11.–12.08.2026): Tesseract 5.3.4, **Standard-Einstellungen**, Datensatz SROIE 2019 (englische Bons), 361 Test-Bons. Zeichenfehlerrate **33,6 %** (95-%-Intervall 31,2–35,9), Wortfehlerrate **56,2 %** (53,4–58,9), Feld-F1 **23,2 %** (Firma, Datum, Adresse, Summe per fester Regex ausgelesen). Auf CORD v2 (indonesische Bons, 100 Stück) 95,2 % Zeichenfehler. Zum Vergleich auf SROIE (Zeichenfehler): docTR 19,7 %, PaddleOCR 20,5 %, EasyOCR 28,3 %. [B] https://imagetotable.ai/references/receipt-ocr-benchmark-results
  - Grenzen: Der Betreiber verkauft ein Produkt in diesem Markt (Eigenmessung). Rohdaten und Code sind „auf Anfrage“, nicht öffentlich. Alle Modelle in Standard-Einstellungen, ohne Vorverarbeitung. Die Regex-Auswertung verzerrt die F1-Werte. Kein Modell hat in einem Dokument alle vier Felder vollständig richtig. Die Zahlen sind für **englische** Bons und **nicht** für Portugiesisch.
- **SROIE-Wettbewerb ICDAR 2019** (arXiv 2103.10213, Eintrag vom März 2021 laut Nummer): 1000 gescannte Bons (600 Training, 400 Test). Bei der Texterkennung (Aufgabe 2) erreichten 7 Teams F1 über 90 %. Selbst die beste Methode liegt unter 99 %. Bei der Schlüsselinformation (Aufgabe 3) übertraf nur ein Verfahren 90 % (90,49 %), über die Hälfte lag unter 80 %. Genannte Schwierigkeiten: schlechtes Papier, schlechte Druck- und Tintenqualität, Scanner mit niedriger Auflösung und Verzerrung, gefaltete Bons, viel störender Text, kleine Schrift. Kein Tesseract-Vergleichswert. [B] https://arxiv.org/pdf/2103.10213
  - Wichtig: Das waren spezialisierte Deep-Learning-Systeme, nicht Tesseract. Tesseract liegt voraussichtlich darunter. Das ist eine Vermutung.

**Was wir ehrlich sagen können** [V]

- „Die Texterkennung auf dem Gerät macht Fehler, besonders bei zerknitterten, verblassten oder schräg fotografierten Bons.“
- „Deshalb prüft die App die Summe und markiert unsichere Zeilen. Du bestätigst jede Position.“
- Keine Prozentzahl in der Oberfläche, bevor der Messplan gelaufen ist.

### Messplan (Eigenentwurf) [V]

- Mindestens 30 echte Bons: 15 Restaurant, 15 Supermarkt. Mischung: neu, verblasst, zerknittert, schräg, Schatten, schlechtes Licht, Kassensysteme verschiedener Anbieter.
- Ground Truth von Hand: Positionen, Mengen, Zeilenpreise, Total, QR-Inhalt.
- Kennzahlen: (a) Anteil Bons mit richtig gelesenem Total, (b) Anteil Zeilenpreise exakt richtig, (c) Anteil falscher Preise, die markiert wurden (Soll ≥ 95 %), (d) Anteil Bons, bei denen die Summenprüfung ohne Handarbeit aufgeht, (e) QR-Lesequote, (f) Laufzeit auf S23 und einem älteren Telefon.
- Varianten: Vorverarbeitung A gegen B, Zeichenhöhe 20/25/30/40 px, PSM 4/6/11, mit und ohne Zweit-Durchlauf für Preise.
- Grenzen vorab festlegen, ab wann eine Variante verworfen wird. Wert ist offen.

### Nicht geprüft

- Genauigkeit von Tesseract 5.1.1 mit `por best_int` auf portugiesischen Thermobons. Keine Zahl gefunden.
- Ob ImageToTable mit Standard-Seitenmodus auf Ganzseitenbild arbeitete (das würde die hohe Fehlerrate erklären). Nicht angegeben.
- Weitere Messungen (z. B. Vergleich Tesseract gegen andere Systeme auf Fotos statt Scans). Nicht gesucht.
- Ob Fotos mit Telefonkamera (statt Scans) schlechter oder besser abschneiden als SROIE-Scans.

---

## Quellen (mit Datum)

| Quelle | Datum |
|---|---|
| AT, Especificações Técnicas Código QR v1.1 (info.portaldasfinancas.gov.pt, `.../Especificacoes_Tecnicas_Codigo_QR.pdf`) | Oktober 2020 |
| Portaria 195/2020 (`.../Portaria_195_2020.pdf`) | 13.08.2020 |
| AT-FAQ 00879 (`.../faqs-00879.aspx`) | ohne Datum, abgerufen 24.10.2026 |
| Vendus, QR Code Faturas | 15.12.2022 |
| Vendus, Taxas de IVA na restauração | 19.11.2025 |
| InvoiceXpress, Elementos obrigatórios | 26.12.2025, aktualisiert 13.02.2026 |
| DECO PROteste, Regras couvert | 18.06.2026 |
| caniuse, BarcodeDetector detect | ohne Datum, abgerufen 24.10.2026 |
| Chrome for Developers, Shape Detection API | 07.01.2019 |
| w3cub (MDN-Kopie), BarcodeDetector | ohne Datum, abgerufen 24.10.2026 |
| barcode-detector README 3.2.1 (jsDelivr) | ohne Datum, abgerufen 24.10.2026 |
| zxing-wasm README 3.1.3 (jsDelivr) | ohne Datum, abgerufen 24.10.2026 |
| jsQR 1.4.0 (jsdocs.io) und README-Spiegel 1.3.1 (jsDelivr) | ohne Datum, abgerufen 24.10.2026 |
| Tesseract-Wiki ImproveQuality (GitHub-Stand) | 24.10.2018 |
| tesseract.js docs/api.md 5.1.1 (jsDelivr) | ohne Datum, abgerufen 24.10.2026 |
| Vendor-Code `site/vendor/tesseract` (tesseract.js 5.1.1, core 5.1.1, por 4.0.0_best_int) | lokal, Stand 24.10.2026 |
| SROIE, arXiv 2103.10213 | März 2021 (aus der Nummer) |
| ImageToTable.ai, Receipt OCR Benchmark | 11.–12.08.2026 |
| The Paypers, Splitwise Itemize | 16.10.2026 |

## Offene Folgerecherche (nur nach Rückfrage, je eine Frage)

1. Aktuelle tessdoc-Seiten (ImproveQuality, PSM, Parameter) von tesseract-ocr.github.io. Diese Domain war im Sitzungsfilter nicht freigegeben.
2. Pflichtinhalt „fatura simplificada“ (Art. 40 CIVA) und Betragsgrenze beim Portal das Finanças.
3. Aktuelle Fassung der QR-Spezifikation nach v1.1.
4. Test von `BarcodeDetector` und zxing-wasm auf einem echten iPhone.
