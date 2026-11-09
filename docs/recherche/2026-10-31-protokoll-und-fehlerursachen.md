# Bon-Protokoll und gefundene Fehlerursachen (31.10.2026, Version 3.17)

Anlass: Handy-Test Markt B 3 (3 von 5 Posten, Hand sichtbar, nicht begradigt, „AEUTERQUARK“), Vorwurf „UVDoc bewirkt nichts“.

## Protokoll in der App
- Jede Erkennung schreibt ein Protokoll: App-/bon.js-Version, Gerät (Browser, Speicher, Kerne, Bildschirm), Motor
  (Worker oder direkt), Fotogröße, jeder Durchlauf (Name, Güte, Dauer, Wortzahl, Anteil sicherer Wörter, Posten,
  Summe, geprüft, gelesene Zeilen), UVDoc (geladen, Dauer, Ein-/Ausgabegröße), Glätten (Stärke), Ergebnis
  (Gewinner, Posten mit Betrag, alle Zeilen mit Einordnung), alle Fehler (vorher stillschweigend verschluckt),
  Seitenfehler, Vorschaubilder jedes Durchlaufs und des angezeigten Bilds.
- Liegt im Gerät (IndexedDB), die letzten 5. „Mehr → Bon-Protokolle → Teilen mit Foto / ohne Foto“ (Teilen-Menü,
  sonst Download als JSON). Nichts geht automatisch weg.
- Versionsmarke unten links auf jeder Seite; rot mit „!“, wenn bon.js aus einem alten Zwischenspeicher kommt.

## Ursachen, die das Protokoll sofort zeigte (Testrechner, gleiches Foto)
1. **UVDoc lief, verlor aber jedes Mal.** Das entfaltete Bild ist flach und ohne Hand, wurde aber in der Größe des
   verkleinerten Fotos ausgegeben (Bon nur ~800 px breit) → Erkennung las schlechter (4 statt 5 Posten), ein anderer
   Durchlauf gewann, angezeigt wurde dessen Bild mit Hand und Wellen. Jetzt: Ausgabegröße aus der Länge der
   Gitterlinien, abgetastet aus dem Foto in voller Auflösung, auf 1300 px Lesebreite gebracht → UVDoc-Durchlauf liest
   alle 5 Posten und gewinnt; angezeigt wird der entfaltete Bon.
2. **„AEUTERQUARK“:** Die Namensbereinigung entfernte Währungskürzel auch mitten im Wort („KR“aeuterquark,
   F„EUR“zeug). Jetzt nur als eigenes Wort.

## Summe ohne Summenwort und falsch „geprüfte“ Bons (SROIE)
- Stückzahl-Summen („Total Qty 2“, „Item(s): 5“) sind nie die Gesamtsumme.
- „Total incl. GST“, „Net Total“ sind die Gesamtsumme, keine Steuerzeile.
- „Total“-Zeilen in einer Steuer-Übersicht nach der Summe sind Steuersummen.
- Kopfzeilen mit drei Spaltenwörtern („QTY PRICE DISC AMT“) sind nie Posten, auch mit Zahl.
- Rundung auf 5/10 Cent: nur mit Rundungszeile; gerundeter Betrag muss später auf dem Bon stehen; Rundung wird ein
  eigener Posten.
- Gefundene Summe + Steuer/Service/Rundung danach = spätere Summe (auch kleiner, „Total Rounded“).
- **Ohne Summenwort** (weltweit): Beträge nach dem Postenblock, mindestens so groß wie jeder Posten, sind Kandidaten;
  zweimal vorkommend (Summe + Zahlung) günstiger. „Geprüft“ gibt es weiter nur, wenn die Posten genau aufgehen.

## Ergebnis 3.17
Einheiten 30/30, synthetische Bons 33/33 (195/195 Posten), echte Bons und Handy-Varianten richtig; offen: Markt B 1
auf 75 % verkleinert (Beträge eine halbe Zeile tiefer gedruckt, 4 von 5 Posten, ungeprüft gemeldet). SROIE 0–60: Summe
richtig 55/60 (3.16: 43), falsch „geprüft“ 0 (3.16: 9; Bon 033 hat keinen Wahrheitswert).

## Nachtrag: erstes geteiltes Handy-Protokoll (3.17, 31.10. abends)

Handy: Android 17, Firefox 158, 360×780 @3, 8 Kerne. Foto 2250×3000 (anderes Foto desselben Bons als im Test).

| Befund | Ursache | Abhilfe in 3.18 |
| --- | --- | --- |
| 7,11 statt 7,76 €, KRAEUTERQUARK 0,65 | Beträge 1,79/1,89/1,30 eng übereinander; die Erkennung verschmolz/zerriss sie in **allen** 8 Durchläufen („1,“ · „E79“ · „89“), 1,30 fehlte, Mengenzeile „2 Stk x 0,65“ wurde Posten | `spalteNeu`: Betragsspalte ausschneiden, Neigung aus dem Zeilenprofil, an Drucklücken teilen (Läufe aus k Zeilen an den k−1 schwächsten Stellen), jede Zeile einzeln lesen; nur als Rettung, wenn die normale Lesung nicht stimmt |
| Am Rechner mit diesem Foto: „geprüft“ mit verrutschten Namen | gleiche Beträge, falsch verteilt → Summe geht auf | Widersprüche: Mengenzeile N × P ≠ Betrag eines Nachbarpostens; namenloser Posten + Namenszeile ohne Betrag; großer Spaltenversatz kostet auch bei stimmender Summe |
| Angezeigter Bon schief, Betragsspalte gestaucht | angezeigt wurde ein geglättetes Bild aus einer verrutschten Zuordnung | Vorrang für den von UVDoc entfalteten, zugeschnittenen Bon; Glätten danach aus der endgültigen Zuordnung |
| 160 s Dauer | 8 Durchläufe à ~15 s | stimmt der erste Durchlauf, entfallen die Verbesserungs-Durchläufe; weiter offen |
