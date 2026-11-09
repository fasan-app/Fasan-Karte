# Belegarten und Sonderfälle – was auf Bons, Quittungen und Rechnungen vorkommt (30.10.2026)

Anlass: Handy-Test Markt B (30.10.): erster Posten falsch zugeordnet, „TG ORANGE MANGO“ gestrichen, dafür ein Preis (2,50 €),
der nicht auf dem Bon steht – Summe stimmte trotzdem. Dazu: Pfand steht mal unter, mal über dem Artikel; Mengen (2 x) mit
Einzelpreis daneben/darunter/darüber; Rabatte (z. B. kurze Haltbarkeit); alle Belegarten (Restaurant, Supermarkt,
Autovermietung, Tankstelle, Unterkunft mit Kaution …) sollen verarbeitet und bearbeitet werden können.

## 0. Grundsatz (neu)

**Artikel und Preis müssen stimmen – lieber eine sichtbare Differenz als eine schöngerechnete Summe.**
- Zeilen mit lesbarem Namen und gelesenem Betrag werden beim Summenabgleich nie gestrichen (vorher: Kosten 2,6, also
  möglich, wenn ein zweiter Fehler die Summe „rettet“).
- Ein Betrag wird nur durch eine echte Lesung derselben Zeile ersetzt. Ursache des 2,50 €: das Nachlesen auf Höhe des
  Namens traf auf gewelltem Papier den Betrag der Nachbarzeile, und die Erstlesung (1,11) wurde verworfen. Jetzt wird im
  eigenen Betragskasten nachgelesen, die Erstlesung zählt immer mit.
- „Summe stimmt“ zählt bei der Wahl des besten Durchlaufs nur voll, wenn die Zuordnung in sich stimmig ist (kein Posten
  ohne Namen, kein Name ohne Betrag).
- Krümel (kleine, unsichere Kästen aus Knicken: „o“, „opi“) stehlen beim Spaltenabgleich keine Beträge mehr.
- Robustheitstest mit dem echten Markt B-Foto: Originalgröße, 3000 px (wie die App), 75 %, um 2,5° gedreht – alle 4 richtig.
  Vorher: gedreht war jede Zeile verrutscht und die Summe trotzdem „geprüft“.

## 1. Datensatz-Klassen als Checkliste

Der Bon-Datensatz CORD (Clova AI) unterscheidet u. a.: Name, Menge, Einzelpreis, Preis, **Unterposten** (Name, Menge,
Preis), **Rabattpreis** je Posten, Zwischensumme, **Rabatt auf die Zwischensumme**, **Service**, Steuer, Gesamt, Bar,
Rückgeld, Karte, E-Geld, Anzahl Artikel; dazu im Rohformat **stornierte Posten** (void_menu), Zusatzangaben je Posten
(menu.etc, vatyn) und sonstige Gebühren (othersvc_price). Quelle: CORD-Ladeskript (huggingface.co/datasets/katanaml/cord).
Daraus abgeleitet: Unterposten/Extras, Rabatt je Posten vs. Rabatt auf den Bon, Storno, Service, Gebühren.

Pflichtangaben deutscher Kassenbelege (§ 6 KassenSichV): u. a. Menge und Art der Gegenstände, Entgelt und Steuerbetrag
in einer Summe mit Steuersatz, Transaktionsnummer, TSE-Seriennummer und Signatur. → Menge steht auf deutschen Bons
immer irgendwo (oft eigene Zeile „2 Stk x 1,29“); TSE-/Signaturzeilen sind nie Posten (schon so).

## 2. Supermarkt / Discounter

| Fall | Beispiel | Verarbeitung (3.13) |
| --- | --- | --- |
| Pfand unter dem Artikel | `COLA 1,49 A` / `PFAND 0,25 A *` | Abwägung, hängt an der Cola, Hinweis „inkl. 0,25 € Pfand“ |
| Pfand über dem Artikel | `Pfand 0,25 A` / `Cola 1,29 A` | Abwägung wählt die Cola (Steuerbuchstabe, Getränk) |
| Pfandhöhen DE | Einweg 0,25 €; Mehrweg Glas Bier 0,08 €, Wasser/Erfrischung meist 0,15 € (verbraucherzentrale.de) | Mehrfache von 0,25 € → Menge (2 Dosen = 0,50 €) |
| Leergutbon | `Leergut -1,50` | eigener negativer Posten, nie an einen Artikel (Gutschrift für früher gekaufte Flaschen) |
| Menge daneben | `Cola 1,29 x 2 2,58` / `2 x 1,29 2,58` | Menge und Stückpreis aus der Zeile |
| Menge darunter | `Cola 2,58` / `  2 Stk x 1,29` | Zeile wird dem Posten zugeordnet, für den die Rechnung aufgeht |
| Menge darüber | `2 x 1,29` / `Cola 2,58` | ebenso (neu), Stücke einzeln zuordenbar |
| Gewicht | `0,790 kg x 1,99 EUR/kg` | wie Menge, Info-Zeile |
| Rabatt kurze Haltbarkeit | `Joghurt 0,99 B` / `MHD Rabatt 30% -0,30 B` | Abwägung, hängt am Joghurt („inkl. −0,30 € Rabatt“) |
| Rabatt mit Namen | `RABATT FRISCHKAESE -0,30` | Name im Rabatttext → an den Frischkäse |
| Bon-Rabatt / Coupon / App | `Lidl Plus Coupon -1,00`, `Mitarbeiterrabatt` | eigener negativer Posten (kein einzelner Artikel) |
| Storno | `Chips 1,79` … `Storno Chips -1,79` | beide Zeilen heben sich auf, verschwinden aus den Posten |
| Tüte, Pfand ohne Getränk daneben | `Tragetasche 0,20` | normaler Posten; Pfand ohne passenden Artikel bleibt eigener Posten mit Vorschlägen |

**Abwägung Pfand/Rabatt → Artikel darüber oder darunter** (je höchstens 2 Zeilen): Lage (Zusatz unter dem Artikel ist
häufiger: +1,0, darüber +0,3), direkt benachbart (+0,4), gleicher Steuerbuchstabe (+1,5, verschieden −2; Pfand hat den
Steuersatz des Getränks), Getränk (+1,2; Speise −1, Obst neutral wegen Saftnamen), Rabatt: Name im Rabatttext (+2), nie
größer als der Artikel (−3). Unter 0,8 bleibt die Zeile ein eigener Posten. Die App zeigt in jedem Fall die anderen
Kandidaten: „Pfand 0,25 € gehört zu: [Cola] [Wasser] [Eigener Posten]“.

Lage „unter dem Artikel“ als Vorrang ist eine Annahme aus den vorliegenden Bons (Markt B, Testbons); belastbare Zahlen je
Kassensystem habe ich nicht gefunden [Annahme]. Darum entscheiden Steuerbuchstabe und Getränk stärker als die Lage.

## 3. Restaurant / Café / Bar

| Fall | Beispiel | Verarbeitung |
| --- | --- | --- |
| Gedeck/Couvert/Coperto | `2 Coperto 4,00` | Posten, je Stück teilbar. PT: Couvert darf nur berechnet werden, wenn bestellt (DECO Proteste); IT: zulässig, wenn auf der Karte (money.it) |
| Extras zum Gericht | `+ Bufala 2,00` | hängt am Gericht darüber („inkl. Bufala 2,00 €“), umhängbar |
| Menü-Bestandteile ohne Preis | `Menu del giorno 15,00` / `- Primo` / `- Secondo` | Bestandteile gehören zum Menü, keine „Posten ohne Betrag“ |
| Service (EU/UK) | `Servizio 10 %`, `Service 12,5 %` | Zuschlag, anteilig nach Posten verteilt |
| Steuer obendrauf (USA) | `Subtotal` / `Tax` / `Total` | Zuschlag, anteilig |
| Trinkgeld auf dem Beleg | `Tip 3.00` / `Total 18.10` | Zuschlag (wahlweise), beide Summen sind Ziele |
| Mehrere Durchgänge / Teilrechnung | „Split“ | je Beleg einzeln erfassen [nicht automatisch] |

## 4. Tankstelle

`Super E10 42,35 l x 1,799 76,19`: Liter × Literpreis mit 3 Nachkommastellen werden erkannt (Literpreis ist kein Betrag),
Shop-Artikel sind normale Posten. Bon-Art „Tanken“ (schon vorhanden).

## 5. Unterkunft

| Fall | Beispiel | Verarbeitung |
| --- | --- | --- |
| Nächte × Preis | `Alojamento 3 noites x 120,00 360,00` | Menge × Preis |
| Kurtaxe / City Tax | `Taxa Turística 2 pax x 3 x 4,00 24,00` | **Posten**, nicht Mehrwertsteuer (vorher: „taxa“/„tax“ beendete den Postenblock). Lissabon: 4 € je Nacht (Forbes PT, 2024), Kinder bis 13 frei |
| Anzahlung | `Sinal pago 100,00`, `Anzahlung` | kein Posten; Hinweis bei „Wer hat bezahlt?“, wenn jemand anderes angezahlt hat |
| Restbetrag | `Valor a pagar 322,50`, `Balance due` | kleinere Summe; Ziel bleibt die Gesamtsumme |
| Kaution als Posten | `Kaution 50,00` | eigener Posten, standardmäßig ausgeblendet („wird erstattet, nicht geteilt“), Summenprüfung zählt sie als erklärt |
| Kaution nur blockiert | `Caução retida 500,00`, `Vorautorisierung` | zählt nie (wird nicht abgebucht; ADAC) |
| Folio-Aufbau | Zimmer je Nacht, Steuern/Gebühren, F&B, Minibar, Zahlungen, Saldo (pricelabs) | Zahlungen/Saldo nach der Summe sind keine Posten |

## 6. Autovermietung

Miettage × Tagespreis, Versicherung je Tag, Zusatzfahrer, Einwegmiete, Flughafengebühr („Taxa aeroporto“ = Posten),
Tankregelung, Kaution als Blockierung auf der Kreditkarte (wird nicht belastet, nach Rückgabe freigegeben; bei Schaden
bis zu 6 Monate einbehalten – ADAC). → Gebühren sind Posten, Blockierung zählt nie.

## 7. Weitere Fälle

| Fall | Verarbeitung |
| --- | --- |
| Rundung (NL, BE, FI, IE, CH bar auf 0,05; nur Barzahlung – Wikipedia „Cash rounding“) | `Afronding 0,02` als Zuschlag, anteilig |
| Gutschein als Zahlung nach der Summe | Zahlung, kein Rabatt |
| Fremdwährung (DCC): Betrag in zwei Währungen | Summe in Bon-Währung zählt; andere Beträge passen nicht zu den Posten |
| Kartenbeleg ohne Posten | nur Summe; Posten von Hand |
| Pfand im Ausland (NL statiegeld, Skandinavien pant, US CRV/bottle deposit) | wie Pfand |

## 8. Bedienung

- **Großer Speichern-Knopf** in jedem Schritt und in der Bon-Ansicht: sichert den Entwurf und schließt; weiter unter
  „Kosten → Angefangen“. Das endgültige Eintragen heißt jetzt „Ausgabe eintragen“ (nicht verwechselbar).
- Zusatzzeilen umhängen: im Bon-Blatt „gehört zu: [Artikel] [anderer Artikel] [Eigener Posten]“; eigener Pfand-Posten:
  „einem Artikel zuordnen“. Liste zeigt „inkl. 0,15 € Pfand“.
- Zeilen eines Postens (Artikel + Pfand/Rabatt, oben oder unten) sind im Bild als eine Gruppe umrandet.

## 9. Nicht gelöst / offen

- Gewelltes Papier wird nicht entzerrt (siehe 2026-10-30-fehleranalyse-markt-b-und-bon-ansicht.md).
- Mehrere Bons auf einem Foto, Teilrechnungen, handschriftliches Trinkgeld.
- Pfand-Reihenfolge je Kassensystem nicht belegt [Annahme, siehe 2].

## Quellen (abgerufen 30.10.2026)
- CORD-Ladeskript: huggingface.co/datasets/katanaml/cord (cord.py)
- § 6 KassenSichV: gesetze-im-internet.de/kassensichv/__6.html
- Pfandhöhen: verbraucherzentrale.de/mehrweg
- Couvert PT: deco.proteste.pt (Restaurantes: regras para a cobrança de entradas, gelo e copos de água)
- Coperto IT: money.it (Cos’è il coperto al ristorante e quando è legale farlo pagare)
- Kurtaxe Lissabon: forbespt.com (Taxa turística em Lisboa aumenta para quatro euros por noite)
- Mietwagen-Kaution: adac.de (Kreditkarte beim Mietwagen)
- Hotel-Folio: hotels.pricelabs.co (What is a Hotel Folio?)
- Rundung: en.wikipedia.org/wiki/Cash_rounding
- Trinkgeld-Vorschläge: support.toasttab.com (Display Suggested Tip Amounts)
