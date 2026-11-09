# Bon-Erkennung weltweit (29.10.2026)

## Frage
Kassenzettel aus allen Ländern (lateinische Schrift) im Handy lesen, ohne Cloud, ohne QR-Code als Voraussetzung.

## Gewählt
- **PaddleOCR PP-OCRv5** (Apache-2.0): Erkennung „mobile det“ + Latein-Leser (32 Sprachen, u. a. DE, PT, ES, FR, IT, NL, PL).
  Laut PaddleOCR-Doku Latein v5 84,7 % gegenüber 37,9 % bei v3 (eigener Testdatensatz von PaddleOCR).
  Quelle: https://www.paddleocr.ai/main/en/version3.x/algorithm/PP-OCRv5/PP-OCRv5_multi_languages.html (abgerufen 29.10.2026)
- ONNX-Fassungen aus https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models (Git LFS, SHA-256 in pages.yml fest).
- **onnxruntime-web 1.31.1** (MIT), nur WASM ohne Threads (GitHub Pages setzt keine COOP/COEP-Header).
- Parameter aus der offiziellen PaddleOCR-Konfiguration (configs/det/PP-OCRv5/PP-OCRv5_mobile_det.yml: DB 0,3 / 0,6 / 1,5;
  configs/rec/PP-OCRv5/multi_language/latin_PP-OCRv5_mobile_rec.yml: Höhe 48, Leerzeichen-Klasse).
- Eigene Umsetzung (site/ocr.js) statt der Bibliothek ppu-paddle-ocr: kleiner, ohne OpenCV, und jede Zeile ist hier prüfbar.

## Verworfen
- Spliit, BillSplit u. a.: Bon-Scan über Cloud-KI (OpenAI, Together.ai) – Foto würde das Gerät verlassen.
- Florence-2 (Transformers.js): braucht WebGPU, deutlich größer.
- Mehrere OCR-Programme parallel mit Abstimmung: doppelte Ladezeit; Fehler bei schlechten Fotos treffen meist beide.
  Stattdessen Summenprüfung als Schiedsrichter (bon.js, `abgleich`).

## Messung (tools/bontest, künstliche Bons aus 6 Ländern, 29.10.2026)
| Satz | PaddleOCR + neuer Leser | Tesseract + neuer Leser |
| --- | --- | --- |
| sauber, mild, hart (18) | 18/18 komplett richtig | 15/18 |
| blasser Thermodruck „extrem“ (6) | 5/6 | 0/6 |
| auf dem Kopf, quer (2) | 2/2 | – |
Einschränkung: künstliche Bons mit sauberer Schrift; echte Thermobons sind schwerer. Echte Bons nachtesten.

## Kosten
Download einmalig ~28 MB (WASM 14,8 MB, Modelle 4,7 + 8,1 MB), danach offline (Service Worker, eigener Speicher).
Dauer im Test-Chromium 4–27 s je Bon (ein Kern); auf Handys nicht gemessen.

## Grenzen
- Nur lateinische Schrift (Kyrillisch, Griechisch, Arabisch, Thai, CJK haben eigene Modelle: später je Reiseland nachladen).
- Beträge ohne Nachkommastellen (JPY, HUF, KRW, ISK) werden nicht als Preise erkannt.
- Währungsanzeige in der App ist noch Euro.
