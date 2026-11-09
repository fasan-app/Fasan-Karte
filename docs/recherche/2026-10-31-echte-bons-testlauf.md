# Test mit echten Bons statt erfundener (31.10.2026)

Kritik des Nutzers: Künstliche Testbons sind zu leicht (sauber erzeugt), echte Fotos scheitern. Darum:

## Testmaterial
- **Eigene echte Fotos** (vom Nutzer, nur lokal, nicht im Repository): Markt B ×3, Green Soul, Confeitaria Belém,
  Restaurant Beispiel. Dazu je Varianten wie vom Handy: 3000 px, verkleinert (70–75 %), gedreht (2–3°).
- **SROIE 2019** (ICDAR, echte gescannte Kassenbons aus Malaysia, 626 Bilder mit Summe als Wahrheit), aus
  github.com/zzzDavid/ICDAR-2019-SROIE. Gescannt statt fotografiert, aber echte Kassen, echte Fehler.
- Gesucht, nicht nutzbar: deutsche Bon-Fotos im Repository ReceiptManager/receipt-parser-legacy (nur Git-LFS-Verweise,
  Inhalt hier nicht abrufbar); CORD-Bilder liegen bei Google Drive (gesperrt).

## Was die echten Bons zeigten und was geändert wurde
| Befund | Änderung |
| --- | --- |
| SROIE: „geprüft“, aber falsche Summe – Netto-Summe statt Endsumme (GST 6 % und Rundung kommen nach „Total excl. GST“) | Summe + Steuer-/Rundungszeilen nach der Summe ergeben eine größere gelesene Summe → die ist die Endsumme, die Zeilen werden anteilig verteilt; GST/SST/HST/PST als Steuerwörter |
| Markt B 3 verkleinert: Beträge eine Zeile höher als die Namen (Papierwölbung) | Spaltenpaarung je ganzzahligem Zeilenversatz (−2 … +2) als eigene Kandidaten; ein ganzer Versatz gilt nur, wenn die Summe ihn bestätigt |
| Markt B 3: „1,79“ als „70“ gelesen (dünne Eins und Komma fehlen) | Nachlesen über die ganze Betragsspalte; Nachlesungen akzeptieren „1.79“, „1 79“, „179“ |
| Erste Namenszeilen ohne Betrag wurden nicht nachgelesen | auch vor dem ersten Posten als „Name ohne Betrag“ markiert (wenn der Postenkopf erkannt ist) |
| „SUMME“ als „SLMMe“ gelesen → Summe als Posten | Summenwort mit einem Lesefehler (summe/total/gesamt) zählt |
| Papierkante innen gefunden → Zeilenanfang abgeschnitten („OLLKORNSANDWICH“) | Ausschnitt 8 % breiter, 3 % höher |
| Kopfzeilen (UID, Telefon) bekamen Beträge | Kopfzeilen nehmen beim Paaren keine Beträge |
| Malaysia: Name unter der Zeile mit Nr./Menge/Preis | Name auch aus der Zeile darunter |
| Antippen einer leeren Stelle legte ein Band über drei Zeilen | rastet auf das Zeilenraster des Bons ein (Zeilenabstand aus den gelesenen Zeilen), liest nur diese Zeile; Betrag einer auf derselben Druckzeile getrennt gelesenen Zeile wird vorgeschlagen |
| UVDoc auf dem ganzen Foto (Bon auf hellem Bettlaken) findet das Blatt nicht | bleibt als Kandidat, gewinnt nur, wenn er besser liest |

Ergebnisse siehe Entscheidungen (Version 3.16).
