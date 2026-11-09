# Kostenteilung, Teilgruppen, geführte Reisen und Nähe-Hinweise

Stand: 2026-10-24. Eine Recherche für die Fasan Karte (Web-App, offline zuerst, ohne eigenen Server, 6 Personen, eine Reise).

## Lesehinweis

- Jede Vorgabe trägt ein Kürzel:
  - **[B S4]** = Beleg aus Quelle S4 (Liste am Ende).
  - **[F]** = Folgerung. Das ist mein Schluss aus Belegen, kein Zitat.
  - **[S]** = Setzung. Zahl oder Regel von mir, ohne Beleg. Im Test prüfen.
- Seiten ohne Datum sind so markiert: „Seite ohne Datum, abgerufen 24.10.2026“.
- Zitate in Englisch stammen aus dem Abruf-Werkzeug. Es gibt Zusammenfassungen eines Hilfsmodells wieder. Ich habe die Seiten nicht Wort für Wort gegengelesen.
- Zählung: 50 Aufrufe (21 Suchen, 29 Seitenabrufe, davon 7 ohne Ergebnis). Das liegt über der Grenze von etwa 30. Grund: Teil 1 war breit. Teil 3 und 4 sind dünner belegt (siehe „Nicht geprüft“).
- Projektstand, auf den ich mich beziehe: `docs/ENTSCHEIDUNGEN.md` (Nostr-Abgleich, Schlüssel im Link, flüchtige Ereignisse, keine Benachrichtigung bei geschlossener App).
- Frühere Recherche zu Splitwise-Kritik: `docs/recherche/2026-10-24-gruppenreisen.md` (dort S8). Hier nicht neu abgerufen.

---

## 1. Kostenteilung

### 1.1 Eingabefelder

Was die Apps zeigen:

- Splitwise-API-Objekt (Python-Client, Herausgeber nicht geprüft, S8): `description`, `details`, `cost`, `currency_code`, `date`, `category`, `receipt`, `comments_count`, `payment`, `repeats`, `repeat_interval`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`, `users` (Liste „mit Salden“). Die Felder für gezahlten und geschuldeten Anteil definiert die Seite nicht.
- Splitwise App Store (S4): „Split expenses equally or unequally by percentages, shares, or exact amounts“. „100+ currencies“.
- Tricount (S2): Anteile („shares“) oder genaue Beträge. Beispiel: Miete 1.050 = 400 / 350 / 300. Prozent beschreibt die Seite nicht.
- Settle Up (S9, S10): Standardgewicht je Mitglied. „If you set it to 2 for example, this member will count as two in all new transactions.“ Außerdem „multiple people paying for one item“. Wiederkehrende Buchungen (Premium laut S10).
- Splid (S11, Aggregator des App-Store-Textes): „customizable percentage splits“, „more than 150 currencies“. Nutzerkritik: Kategorien sollten gruppenübergreifend gelten, vordefinierte lassen sich nicht löschen.

Konkrete Vorgaben:

- V1.1 Pflichtfelder: Zweck (Text), Betrag, Zahler, Teilnehmer, Datum. [F aus S4, S8]
- V1.2 Optional: Kategorie, Notiz. Kategorien sind eine frei umbenennbare Liste der Gruppe, nicht fest. [F aus S11-Kritik]
- V1.3 Mehrere Zahler je Eintrag sind möglich: Liste aus Person und Betrag, Summe = Gesamtbetrag. [B S10]
- V1.4 Aufteilungsarten: gleich, nach Anteilen, nach genauen Beträgen. Prozent ist ein Anteil mit Summe 100. Intern genügen Gewichte und Beträge. [B S4, S2; F]
- V1.5 Gleich = Gewicht 1 je Person. Standardgewicht je Person änderbar (Paar = 2). [B S9]
- V1.6 Ausgleichszahlung ist ein eigener Eintragstyp (Zahler, Empfänger, Betrag). Sie ist keine Ausgabe. Das API-Feld heißt `payment`. Seine Bedeutung ist auf der Seite nicht erklärt. [F aus S8, nicht geprüft]
- V1.7 Datum: Standard heute, änderbar. Es zählt das Datum, das die Person offline eingegeben hat, nicht die Sync-Zeit. [S]
- V1.8 Währung: Gruppenwährung als Standard. Je Eintrag darf eine andere stehen. Gespeichert werden Originalbetrag, Währung, Kurs und Betrag in Gruppenwährung. Es wird nie neu umgerechnet. [B S7 „do not re-convert“; S1: Kurs von Hand änderbar, Saldo in Standardwährung; S9: fester Kurs für die ganze Reise]
- V1.9 Der Kurs im Eintrag nennt seine Quelle (von Hand, Tabelle mit Datum). Offline gibt es keinen Live-Kurs. [S]

### 1.2 Anzeige der Salden

Was die Apps zeigen:

- Tricount: „The reimbursement suggestions and the balance are displayed in the default currency.“ (S1)
- Splitwise: „Simplify debts into the easiest repayment plan“. (S4)
- Kritik an Splitwise (Kumthekar 2017, über gruppenreisen S8): Summen versteckt, „Simplify debts“ vergraben, Barzahlungen werden oft nicht ausgeglichen.

Konkrete Vorgaben:

- V2.1 Startansicht: Gruppensumme, eigener Saldo (bekommt / schuldet) und die eigenen Überweisungen. [F aus Kritik]
- V2.2 Liste aller 6 Salden mit Vorzeichen und Text („bekommt“ / „schuldet“). Farbe allein trägt keine Bedeutung. [S]
- V2.3 Überweisungsvorschlag als Satz: „Anna zahlt Ben 23,40 €“. Knopf „Als bezahlt buchen“ erzeugt den Ausgleichseintrag. [F]
- V2.4 Schalter „Vereinfacht / Direkt“ in der Ansicht, nicht tief in Einstellungen. Direkt = je Person, wem sie wie viel aus echten Einträgen schuldet. [B S9: abschaltbar; S5: bei Splitwise nicht Standard, Vertrauensgründe]

### 1.3 „Schulden vereinfachen“

Was belegt ist:

- Splitwise-Beispiel (Nutzer joshstrange, 29.04.2014, S5): A schuldet B, B schuldet C, dann zeigt Splitwise „A owes C“. Die Funktion ist nicht Standard. Jon von Splitwise (urthos, 29.04.2014, S5): nicht an, weil Menschen verschieden stark vertrauen. Ein anderer Nutzer: „I really don't like that ‚simplification‘ of debts.“
- Der genaue Splitwise-Algorithmus steht in keiner gelesenen Quelle.
- Settle Up (S9): „It minimizes the number of transactions between people by transferring debts“. Abschaltbar, dann nur direkte Schulden. (S10): „calculates the fewest possible transfers“.
- Splid (S11): „as few payments as possible“.
- Mathematik (S6, Medium, 19.10.2017 laut Zeile, Metadaten sagen 19.05.2021): Problem ist NP-hart (Rückführung auf Teilmengensumme). Greedy (größter Schuldner an größten Gläubiger) ist nicht immer optimal. Gegenbeispiel: Schulden 10, 3, 3 und Guthaben 6, 5, 5. Greedy braucht 5 Überweisungen, das Optimum ist 4. Optimum = Personenzahl minus größte Zahl disjunkter Gruppen mit Summe 0.
- Interview-Blog (S7, 21.04.2026, keine Fachquelle): Greedy „works well and produces near-optimal results“. Exakt lösbar bis etwa 20 Personen mit Teilmengen-DP.
- Eigene Rechnung (24.10.2026, Python): Das Gegenbeispiel aus S6 stimmt (Greedy 5, optimal 4). Bei 20.000 zufälligen Salden für 6 Personen war Greedy in 3 Fällen schlechter, höchstens um 1 Überweisung. Zufallsdaten, keine echten Reisen.

Konkrete Vorgaben:

- V3.1 Saldo je Person in ganzen Cent: gezahlt minus Anteil. Die Summe aller Salden muss 0 sein. Sonst zeigt die App einen Fehler und rechnet nicht weiter. [F]
- V3.2 Für 6 Personen exakt rechnen. Alle 2^6 = 64 Teilmengen prüfen, größte Zahl disjunkter Gruppen mit Summe 0 finden. Eine Gruppe mit k Personen braucht höchstens k−1 Überweisungen. [B S6; F: jede Überweisung gleicht mindestens eine Person aus, die letzte zwei]
- V3.3 Innerhalb einer Gruppe: Greedy. Feste Reihenfolge bei Gleichstand: Betrag absteigend, dann Personen-ID aufsteigend. Dann rechnet jedes Handy dasselbe Ergebnis, ohne Server. [S]
- V3.4 Ab 12 Personen auf reines Greedy zurückfallen (Rechenzeit der Teilmengen steigt mit 3^n). [S]
- V3.5 Der Vorschlag ist nur Anzeige. Gebucht wird erst, wenn jemand „bezahlt“ tippt. Der Saldo ist immer aus dem Protokoll berechnet, nie gespeichert. [F]

### 1.4 Rundung von Cent

Was belegt ist:

- Interview-Blog (S7): Beträge in der kleinsten Einheit führen und Reste verteilen. Beispiel 10 durch 3 = 3,33 / 3,33 / 3,34.
- Nextcloud-Cospend (FOSS, S13): Ein Nutzer meldet kleine Cent-Unterschiede in den Salden („a matter of cents“). Auf der Seite steht keine Lösung.
- Rundungsregeln von Splitwise, Splid, Tricount und Settle Up: nicht gefunden.
- Eigene Rechnung (Größte-Rest-Verfahren, Python): 1000 Cent durch 3 = 334 / 333 / 333. 1000 Cent mit Gewichten 1 / 1 / 2 = 250 / 250 / 500. 1001 Cent durch 6 = fünfmal 167 und einmal 166. Die Summe stimmt jedes Mal.

Konkrete Vorgaben:

- V4.1 Alle Beträge sind ganze Cent (Integer). Keine Fließkommazahl im Datenmodell. [F]
- V4.2 Anteil_i = Abrundung von (Betrag × Gewicht_i ÷ Summe der Gewichte). Den Rest in Cent verteilt man je 1 Cent an die Personen mit dem größten Bruchrest. [S, Verfahren per Rechnung geprüft]
- V4.3 Gleichstand beim Bruchrest: kleinster Hash aus Eintrags-ID und Personen-ID. So zahlt nicht immer dieselbe Person den Extra-Cent. Jedes Handy kommt zum gleichen Ergebnis. [S]
- V4.4 Bei „genauen Beträgen“ muss die Summe den Betrag treffen. Sonst Knopf „Rest verteilen“ oder Fehlermeldung. [S]
- V4.5 Umrechnung in Gruppenwährung wird einmal beim Eintrag gerundet und dann gespeichert. [B S7]
- V4.6 Test: Beträge von 0,01 bis 1000,00 und 1 bis 6 Personen. Die Summe der Anteile muss immer den Betrag ergeben. [S]

### 1.5 Bearbeiten, Löschen, Verlauf

Was belegt ist:

- Splitwise App Store (S4): „View your edit history for changes to an expense.“ „Comment directly on expenses.“ „Activity feed and push notifications“. Pro: „Search full expense history“.
- Splitwise-API (S8): `updated_by`, `deleted_at`, `deleted_by`. Das zeigt weiches Löschen mit Autor. [F]
- Splid brachte die Ausgabensuche erst im Update vom 16.09.2018 (S12, nur Überschrift gelesen).

Konkrete Vorgaben:

- V5.1 Nie überschreiben. Jede Änderung ist ein neues Ereignis mit Autor, Zeit und alter Fassung. [F]
- V5.2 Löschen setzt nur die Marke `deleted_at` und `deleted_by`. Ansicht „Gelöschte Einträge“ mit „Wiederherstellen“. [B S8; F]
- V5.3 Verlauf je Eintrag: wer, wann, Feld alt → neu. [B S4]
- V5.4 Kurzer Kommentar je Eintrag. Das ist optional und kommt nach dem Kern. [B S4]
- V5.5 Suche über Zweck, Zahler und Betrag. Von Anfang an, nicht später. [B S12, S4]
- V5.6 Aktivitätsliste der Gruppe mit Punkt „neu seit deinem letzten Besuch“. [B S4]
- V5.7 Direkt nach Löschen 10 Sekunden „Rückgängig“. [S]

### 1.6 Offline und Konflikte

Was belegt ist:

- Splitwise: Eintrag offline möglich („support for offline entry“, S4).
- Tricount: „Add expenses without signal“, Sync, wenn wieder online (S3).
- Settle Up: „it works offline and syncs when you're back“. Sync über Android, iOS und Web (S10).
- Splid (S11): „Also works perfectly offline“. Offline-Gruppe möglich. „activate the sync to enter expenses together“. Gruppen online teilen ohne Anmeldung.
- Konfliktbehandlung: In keiner gelesenen Quelle beschrieben.
- Polarsteps Travel Together (S18, Seite ohne Datum, abgerufen 24.10.2026): „We do recommend that only one person in your trip group makes changes to the planned steps at a time.“ Alle sollen vorher synchronisieren. Abgleich von Hand über „Sync now“. Das ist ein dokumentiertes Muster zur Konfliktvermeidung. Es betrifft den Plan, nicht Kosten.
- Projekt: Relays halten flüchtige Ereignisse nur kurz (strfry: 300 s, ENTSCHEIDUNGEN 24.10.2026). Kosten müssen also auf jedem Handy dauerhaft liegen. [F]

Konkrete Vorgaben:

- V6.1 Jedes Handy hält das ganze Kostenprotokoll lokal (IndexedDB). Die App läuft ohne Netz. [F]
- V6.2 Das Protokoll wird nur angehängt. Ereignis: `{id, typ, eintragId, autor, zähler, zeit, daten}`. Zusammenführen heißt: Vereinigung nach `id`. Doppelte fallen weg. [S]
- V6.3 Reihenfolge: Lamport-Zähler, dann Geräte-ID. Die Handyuhr allein gilt nicht. [S]
- V6.4 Konflikt = zwei Änderungen am selben Eintrag auf Basis derselben Fassung. Die spätere (nach V6.3) gilt. Die andere bleibt im Verlauf, der Eintrag zeigt „2 Fassungen“ mit Knopf „Andere übernehmen“. [S]
- V6.5 Bearbeiten und Löschen zugleich: Löschen gilt. Der Eintrag bleibt wiederherstellbar. [S]
- V6.6 Abgleich beim Öffnen und bei Netz: erst „Stand“ tauschen (höchster Zähler je Gerät), dann nur fehlende Ereignisse. [S]
- V6.7 Sichtbarer Sync-Stand: „Alle 6 auf Stand“ oder „2 fehlen“. Zeitpunkt des letzten Abgleichs zeigen. [S]
- V6.8 Kostenereignisse laufen verschlüsselt wie beschlossen (Schlüssel im Link), aber nicht nur als flüchtige Ereignisse. Der dauerhafte Stand liegt auf den Handys. [F]

### 1.7 Lob und Kritik der Nutzer

- Kritik an Splitwise (Kumthekar, 16.09.2017, `https://uxdesign.cc/splitwise-a-ux-case-study-dc2581971226`): Summen versteckt, keine Suche, „Simplify debts“ vergraben, Barzahlungen werden nicht ausgeglichen, Erinnerungen nur per E-Mail. (Übernommen aus gruppenreisen S8.)
- Presse (Guardian Juni 2022, über Wikipedia, übernommen aus gruppenreisen): übergenau, besser für Paare als für Freundesgruppen.
- Nutzer 2014 (S5): Vereinfachung gefällt nicht allen. Anbieter: aus Vertrauensgründen nicht Standard.
- Splid-Nutzer (S11): Kategorien gruppenübergreifend, vordefinierte nicht löschbar.
- Lob: Ich habe nur Funktionslisten der Anbieter gelesen. Eine belastbare Auswertung von Nutzerlob liegt nicht vor.

Konkrete Vorgaben:

- V7.1 Summen und eigener Saldo sofort sichtbar. Keine Suche nach der Abrechnung. [F]
- V7.2 „Vereinfacht“ und „Direkt“ nebeneinander wählbar. [F aus S5, S9]
- V7.3 Bar bezahlt: „Ausgleich buchen“ in höchstens 2 Tipps. [F]
- V7.4 Option „Vorschläge auf ganze Euro runden“. Der Rest bleibt als Saldo stehen. Gegen die Kritik „übergenau“. Im Test prüfen. [S]

### Nicht geprüft (Teil 1)

- Offizielle Splitwise-Hilfeseiten und die Splitwise-API-Doku waren nicht abrufbar. Der genaue Splitwise-Algorithmus ist unbekannt.
- Splid: Offline und Sync stammen aus einem Aggregator des App-Store-Textes (S11). Ein Splid-Hilfeartikel wurde nicht gelesen. Der Abruf der App-Store-Seite scheiterte.
- Dass eine Funktion auf einer Seite nicht steht (zum Beispiel Prozent bei Tricount, Verlauf, Kategorien), heißt nicht, dass sie fehlt.
- Konfliktbehandlung aller vier Apps: nicht gefunden.
- Rundungsregel der vier Apps: nicht gefunden.
- Bedeutung der API-Felder `payment` und `transaction_confirmed`: nicht geprüft.
- Splitwise-Gratis-Limits (ein Suchtreffer-Titel „without the Daily Cap“): Seite nicht gelesen.
- Akademische Quelle zum Mindestzahl-Problem (Harvard DASH): Abruf scheiterte.
- S6 hat widersprüchliche Daten (2017 und 2021).
- S7 ist ein Interview-Blog, keine Fachquelle.

---

## 2. Teilgruppen und „gesehen von“

Was belegt ist:

- Teilgruppen als eigenes Konzept: in keiner gelesenen Quelle gefunden. Der Splid-Aggregator (S11) nennt sie nicht.
- Teilgruppen laufen über Teilnehmerwahl und Gewichte je Eintrag (S2, S4, S9, siehe 1.1).
- Settle Up (S9): „Anyone can do this in the Edit group screen, when the debts are settled.“ (Gruppe archivieren). „Only the owner can restore the group.“
- Splitwise, Nutzeraussage 2014 (S5): Vereinfachung nur innerhalb einer Freundesgruppe.
- Google Maps Listen (S19, Seite ohne Datum, abgerufen 24.10.2026): „Anyone who can view your lists can also view the names and profile pictures of people who have joined the list.“ Betrachter sehen, „who has added or edited places and notes on the list“.
- Splitwise (S4): Aktivitätsfeed und Push.
- Lesebestätigungen („gesehen von“): in keiner gelesenen Quelle gefunden.

Konkrete Vorgaben:

- V8.1 Teilgruppe = Auswahl der Teilnehmer je Eintrag. Kein eigenes Untergruppen-Objekt. Salden bleiben in der Gesamtgruppe. [F]
- V8.2 Schnellwahl über dem Teilnehmerfeld: „Alle“, „Wie zuletzt“ und bis zu 5 benannte Auswahlen. [S]
- V8.3 Gewicht je Person (Paar = 2) gilt für neue Einträge. Alte Einträge ändern sich nicht. [B S9]
- V8.4 Verlässt jemand die Reise früher: Person „inaktiv ab Datum“. Alte Einträge bleiben. Neue schlagen sie nicht mehr vor. Eine Person wird nie gelöscht. [S]
- V8.5 Abschluss: Gruppe archivieren, wenn alle Salden 0 sind. In einer 6er-Gruppe dürfen alle archivieren und wiederherstellen. Beides steht im Verlauf. Das weicht von Settle Up ab (nur Besitzer stellt her). [S]
- V8.6 „Neu“-Punkt: Jedes Handy führt „gesehen bis Zähler N“. Einträge über N tragen einen Punkt. [F aus S4, S19]
- V8.7 „Gesehen von 4 von 6“ nur in der Detailansicht eines Eintrags. Dazu schickt jedes Handy höchstens einmal pro Minute ein kleines Ereignis „gesehen bis N“. Per Schalter abschaltbar, weil es Überwachung sein kann. [S]
- V8.8 Ausgleich in zwei Schritten ist optional: Zahler „bezahlt“, Empfänger „erhalten“. Erst mit beidem gilt die Schuld als erledigt. [S; das API-Feld `transaction_confirmed` deutet Ähnliches an, Bedeutung nicht geprüft]

### Nicht geprüft (Teil 2)

- Untergruppen bei Splid, Tricount, Settle Up: nur Aggregator-Texte und Funktionsseiten gelesen, keine Hilfeartikel.
- Rollen und Rechte bei Settle Up (wer darf Einträge bearbeiten): nicht gelesen.
- Ob irgendeine Kosten-App „gesehen von“ zeigt: nicht gefunden.

---

## 3. Geführte Reisen

Was belegt ist:

- Wanderlog (App Store, Seite ohne Datum, Version 2.226, abgerufen 24.10.2026, S17): „Like for Google Docs, everyone can collaborate in real-time.“ Rechte: „Set permissions and choose whether people can edit or just view your travel plans.“ Route: „try our route optimizer to automatically rearrange and plan your route to save travel time.“ „All your plans are automatically stored offline.“ Version 2.215 nennt Ziehen und Ablegen für Checklisten. Für Orte habe ich es nicht ausdrücklich gelesen. Benachrichtigungen und Abstimmen stehen nicht auf der Seite.
- Polarsteps Travel Together (S18): Mitreisende vor der Reise einladen. Nur eine Person ändert Schritte zur Zeit. Vorher synchronisieren. Abgleich von Hand („Sync now“). Live-Standort und Benachrichtigungen bei Änderungen stehen nicht auf der Seite.
- Google Maps Listen (S19): „Invite collaborators“. Ändern ausschalten über „Let others edit this list“. Reihenfolge ändern: „Customize list order“, dann halten und ziehen. Man sieht, wer Orte oder Notizen hinzugefügt oder geändert hat.
- VoiceMap (S14, 04.06.2026): „As you arrive at each one, the audio plays automatically.“ Die Tour hat eine feste Route mit Stopps. Alles liegt vorab lokal. Zwischen den Stopps gibt es Wegführung.
- VoiceMap-Doku (S15, 25.03.2026): „Nearly all our tours are sequential“. Es gibt auch Touren, bei denen ein Ort „in any order“ ausgelöst wird.
- Versionierung des Plans und Benachrichtigung über Planänderungen: in keiner gelesenen Quelle beschrieben.
- Eine App mit „Folge dem Führer“ in Echtzeit habe ich nicht gefunden.
- Splitwise schickt Push bei Kostenänderungen (S4). Für Pläne ist das nicht belegt.

Konkrete Vorgaben:

- V9.1 Zwei Rollen: Führer:in (bearbeitet den Plan) und Mitreisende (ansehen, abstimmen, markieren). Handys übernehmen Plan-Änderungen nur von der Führer-Rolle. Das ist Vertrauen, keine Sicherheit. Für 6 Personen reicht das. [S]
- V9.2 Übergabe der Führung mit einem Tipp. Ereignis „Führung an X“ im Protokoll. [S]
- V9.3 Nur eine Person ändert den Plan zur Zeit. [B S18]
- V9.4 Plan-Editor: Stopp hinzufügen, entfernen, umsortieren, Zeit und Notiz. Umsortieren per Ziehen und mit Auf/Ab-Tasten als sichtbarem Zwilling. [B S17, S19; Fasan-Regel „Jede Geste hat einen sichtbaren Zwilling“ aus `fasan-camera/CLAUDE.md`]
- V9.5 Entwurf und Veröffentlichen: Änderungen sammeln, dann „Plan veröffentlichen“. Das ergibt Version N+1 mit Änderungsliste (neu, entfernt, verschoben). So gibt es keine Flut an Meldungen. [S]
- V9.6 Version = ganze Zahl, Zeit, Autor, Änderungsliste. Die letzten 10 Versionen bleiben lokal. Führer:in kann zu einer alten Version zurück. [S]
- V9.7 Mitreisende sehen ein Banner: „Plan v7: Stopp 3 verschoben, Stopp 5 neu“ mit „Ansehen“. Das Banner bleibt, bis es bestätigt ist. [S]
- V9.8 „Nächster Stopp“ steht oben: Name, geplante Zeit, Weg. Führer:in setzt den aktuellen Stopp (Wechsel als Ereignis im Protokoll, Live-Anzeige über den bestehenden Abgleich). [S]
- V9.9 Mitreisende können „Ich komme später“ markieren (Markierung wie bestehende Stimmen). [S]
- V9.10 Unterwegs ändern: „Stopp überspringen“ (bleibt im Plan, Status „übersprungen“) und „Neuer Stopp jetzt“. Wirkt sofort bei allen, die online sind. [S]
- V9.11 Keine Benachrichtigung bei geschlossener App (beschlossen am 24.10.2026). Stattdessen Punkt „Plan geändert“ und Banner beim Öffnen. [B ENTSCHEIDUNGEN; S]
- V9.12 Offline: Der Plan liegt lokal. Ist er nicht aktuell, steht „Stand: v7 von 10:42“ sichtbar dort. [B S17, S14; S]
- V9.13 Option „Reihenfolge fest“ oder „frei“ je Tag. Fest = wie bei VoiceMap-Touren. [B S15; F]

### Nicht geprüft (Teil 3)

- TripIt: nicht gelesen.
- Wanderlog: nur der App-Store-Text, kein Hilfecenter. Wie Änderungen anderen angezeigt werden, ist offen.
- Google Maps „Gruppenplanung“ mit Abstimmen und Emoji-Reaktionen: nur ein Suchtreffer-Titel gesehen (neowin), Seite nicht gelesen.
- Polarsteps: Live-Standort und Folgen-Funktion nicht geprüft.
- Reiseführer-Apps mit Live-„Folge dem Führer“: nichts gefunden.
- Alle Zahlen und Abläufe zu Versionen und Bannern sind Setzungen.

---

## 4. Nähe-Hinweise („Du bist nah an X“)

Was belegt ist:

- Android (S16, „Last updated 2026-10-23 UTC“): „For best results, the minimum radius of the geofence should be set between 100 - 150 meters.“ Höchstens 100 Geofences je App und Nutzer. „Notification responsiveness“: höherer Wert spart Strom, erhöht aber die Verzögerung. Beispiel: 5 Minuten. Es gibt eine „loitering delay“ (Verweilzeit). Einen Standardwert nennt die Seite nicht.
- VoiceMap (S14, 04.06.2026): Audio startet bei Ankunft automatisch. Es braucht kein Tippen und keinen eingeschalteten Bildschirm. Alles liegt lokal.
- VoiceMap-Doku (S15, 25.03.2026): Sobald ein Ort betreten wird, „the audio begins to play, and will play until it's finished.“ „GPS doesn't work indoors.“ Einen Auslöseradius und eine Abklingzeit nennt die Seite nicht.
- Ablenkung beim Gehen: Monash, Osborne, Horberry, Young, Oktober 2020 (S20). Beobachtungsstudie in Melbourne, Befragungen, Expertenworkshop. Die Seite empfiehlt Aufklärung und Infrastruktur. Zahlen stehen nicht auf der Seite.
- Eine App-Richtlinie zu Sicherheit beim Gehen habe ich nicht gefunden.
- Projekt: Ohne offene App wird nichts gesendet (ENTSCHEIDUNGEN 24.10.2026). Nähe-Hinweise gibt es also nur bei offener App. [F]

Konkrete Vorgaben (alle Zahlen sind Setzungen, im Test prüfen):

- V10.1 Standardradius 100 m. Weitläufige Orte (Park, Platz, Aussichtspunkt) bekommen in der Datenspalte `Radius` bis 150 m. Kein Radius unter 100 m. [B S16 als Untergrenze für Geofences; Übertragung auf die Web-App ist eine Analogie]
- V10.2 Austritt (Hysterese) bei 150 m. So flackert ein Ort an der Grenze nicht. [S]
- V10.3 Hinweis nur, wenn die gemeldete Genauigkeit der Position kleiner ist als der Radius. Sonst „Standort ungenau“ in der Statuszeile, kein Hinweis. [S, Geolocation-API nicht geprüft]
- V10.4 Verweilzeit: Der Hinweis kommt erst nach 15 Sekunden im Radius. So löst Vorbeigehen im Verkehr nichts aus. [S, nach dem Begriff „loitering delay“ in S16]
- V10.5 Einmal je Ort und Reisetag. Dazu je Ort „Nicht mehr zeigen“. [S]
- V10.6 Gesamtbremse: höchstens 1 Hinweis alle 3 Minuten und 6 je Stunde. Liegen mehrere Orte im Radius, kommt nur der nächste. Die anderen stehen in der Liste „In der Nähe“. [S]
- V10.7 Geführter Tag: Nähe-Hinweise nur für Orte im Plan und für gemerkte Orte. Der „Nächste Stopp“ hat Vorrang. [S]
- V10.8 Darstellung: schmale Karte unten, höchstens 12 Wörter, verschwindet nach 8 Sekunden, kein Dialog, keine Pflicht-Eingabe. Ton und Vibration nur, wenn die Person sie einschaltet. [S; B S14: Audio ohne Tippen als Gegenbild]
- V10.9 Bei Geschwindigkeit über 3 m/s (Fahrzeug, wenn die Position sie liefert): stumm. [S]
- V10.10 Schalter „Nähe-Hinweise“ je Person. Standard aus, bis die Person Standort freigibt. Standort bleibt auf dem Handy, außer die Person teilt ihn (bestehende Regel zum geteilten Standort). [S]
- V10.11 Kein Hinweis verlangt den Blick auf den Bildschirm. Wichtiges zuerst, Text kurz, große Schrift. [S, gestützt auf S20 nur als Hintergrund]

### Nicht geprüft (Teil 4)

- GPSmyCity: Abruf der App-Store-Seite scheiterte. Smartify und Google-Maps-„In der Nähe“: nicht gesucht.
- VoiceMap: Auslöseradius nicht veröffentlicht in den gelesenen Seiten. Die Seiten „Testing“, „Manual locations“ und „The lost alert“ der Doku habe ich nicht gelesen.
- Web-Geolocation-API (MDN): Abruf nicht erlaubt. Genauigkeit, Hintergrundverhalten und Energieverbrauch bei `watchPosition` sind nicht belegt.
- iOS-Regionenüberwachung (Apple-Doku): nicht gelesen.
- Abklingzeiten und Spam-Grenzen aus Praxis oder Studien: nichts gefunden. V10.4 bis V10.6 sind reine Setzungen.
- Ablenkungsstudie: nur Zusammenfassungsseite, Volltext (PDF) nicht gelesen.

---

## Quellen

| ID | Quelle | Datum | URL |
| --- | --- | --- | --- |
| S1 | Tricount, mehrere Währungen | Seite ohne Datum, abgerufen 24.10.2026 | https://tricount.com/en/manage-a-tricount-with-many-currencies |
| S2 | Tricount, ungleich teilen | Seite ohne Datum, abgerufen 24.10.2026 | https://tricount.com/en/split-expense-unevenly |
| S3 | Tricount, Funktionen | Seite ohne Datum, abgerufen 24.10.2026 | https://tricount.com/features |
| S4 | Splitwise, App Store (Version 25.7.1) | Seite ohne Datum, abgerufen 24.10.2026 | https://apps.apple.com/app/splitwise-bill-splitter/id458023433 |
| S5 | Hacker-News-Faden Nr. 7666501 (Spiegelserver), Kommentare von joshstrange, urthos (Jon von Splitwise), peruser | 29.04.2014 | https://home5.southeastasia.cloudapp.azure.com/item?id=7666501 |
| S6 | Medium, „Adventures in programming interviews“ (NP-hart, Greedy-Gegenbeispiel) | 19.10.2017 laut Zeile, Metadaten 19.05.2021 | https://medium.com/@FallingForFallacies/adventures-in-programming-interviews-misleadingly-difficult-np-hard-problem-43092597018c |
| S7 | techinterview.org, Splitwise-Systementwurf (Interview-Blog) | 21.04.2026 | https://www.techinterview.org/post/3233474468/system-design-design-splitwise-expense-sharing-debt-simplification-group-balances-payment-integration-currency-conversion/ |
| S8 | Python-Client Splitwise, Objekt `Expense` | Seite ohne Datum, abgerufen 24.10.2026 | https://splitwise.readthedocs.io/en/latest/_modules/splitwise/expense.html |
| S9 | Settle Up, Tipps | Seite ohne Datum (Copyright 2025), abgerufen 24.10.2026 | https://settleup.io/tips |
| S10 | Settle Up, App Store (Version 3.16.1) | Seite ohne Datum, abgerufen 24.10.2026 | https://apps.apple.com/app/id737534985 |
| S11 | Splid, App-Store-Text über Aggregator mwm.ai | Seite ohne Datum, abgerufen 24.10.2026 | `https://mwm.ai/>/apps/splid-split-group-bills/991473495` (so abgerufen, mit „>“) |
| S12 | appgefahren.de, „Splid liefert Ausgabensuche nach“ (nur Überschrift und Einleitung gelesen) | 16.09.2018 | https://www.appgefahren.de/?p=231169 |
| S13 | Nextcloud Cospend, Issue 203 (Cent-Unterschiede) | Seite ohne Datum, abgerufen 24.10.2026 | https://github.com/julien-nc/cospend-nc/issues/203 |
| S14 | VoiceMap Support, „How does a VoiceMap tour work“ | 04.06.2026 | https://support.voicemap.me/how-does-a-voicemap-tour-work/ |
| S15 | VoiceMap Doku, Tour- und Transportarten | 25.03.2026 | https://docs.voicemap.me/tour-publishers/tour-and-transport-types/ |
| S16 | Android Developers, Create and monitor geofences | Stand 23.10.2026 (Seitenangabe) | https://developer.android.com/training/location/geofencing |
| S17 | Wanderlog, App Store (Version 2.226) | Seite ohne Datum, abgerufen 24.10.2026 | https://apps.apple.com/bs/app/id1476732439 |
| S18 | Polarsteps Support, Travel Together | Seite ohne Datum, abgerufen 24.10.2026 | https://support.polarsteps.com/hc/en-us/articles/24266937975570-Can-we-plan-a-trip-with-Travel-Together |
| S19 | Google Maps Hilfe, Liste von Orten teilen | Seite ohne Datum, abgerufen 24.10.2026 | https://support.google.com/maps/answer/7280933?hl=en |
| S20 | Monash University, Osborne, Horberry, Young, „Pedestrian distraction from smartphones“ | Oktober 2020 | https://research.monash.edu/en/publications/pedestrian-distraction-from-smartphones/ |

Eigene Rechnung (Greedy gegen Optimum, Größte-Rest-Rundung): Python-Skript im Arbeitsordner der Sitzung, nicht im Repo. Ergebnisse stehen in 1.3 und 1.4.
