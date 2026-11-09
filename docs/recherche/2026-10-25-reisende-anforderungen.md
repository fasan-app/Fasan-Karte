# Was Reisende von Reise-Apps und Dienstleistern fordern

Stand: 2026-10-25. Eine Frage, 34 Suchen, rund 50 Seitenabrufe (Grenze: etwa 35).
Abgleich mit der Karte: README, `docs/ENTSCHEIDUNGEN.md`, `site/app.js`, `site/sw.js`, `site/orte.json` (per Stichwortsuche, nicht auf einem Gerät ausprobiert).

---

## 0. Kurzfassung

**Beleglage in einem Satz:** Es gibt gute Umfragen zu Technik, Beratern, Datenschutz und Zugang. Es gibt keine große, unabhängige, systematische Auswertung von App-Bewertungen für TripIt, Wanderlog, Polarsteps, Komoot, Splitwise, Citymapper oder Google Maps, die ich finden konnte. Für diese Apps habe ich nur kleine Stichproben (siehe Abschnitt 7).

**Was Reisende zuerst fordern (Priorität P1, meine Folgerung aus mehreren Quellen):**

1. Alles an einem Ort, ohne App-Wechsel (Applause 2022: 18 %).
2. Richtige, aktuelle Angaben. Falsche Angaben ärgern am meisten (Euan's Guide 2023: 76 % fanden Zugangsangaben falsch oder irreführend; Applause: 18 % fanden nötige Infos nicht).
3. Es funktioniert bei schlechter Verbindung (Holafly 2026, Hersteller: 86,7 % mit Verbindungsproblem; 43 % Signalverlust an Grenzen).
4. Kein Abo-Zwang für Kernfunktionen (Splitwise, Komoot, Wanderlog: wiederkehrende Kritik, aber nur kleine Stichproben).
5. Datenschutz, der hält. Neu und stark: Polarsteps-Leck, 04.–09.09.2026.
6. Einfache Bedienung. 38 % der Reisenden 50+ fühlen sich von der Zahl digitaler Werkzeuge überfordert (AARP 2024, n = 1.000).
7. Hilfe bei Störungen und im Notfall (Expedia 2024: 38 % nennen es als Grund für einen Berater; Applause: 37 % sagen, Apps halfen bei Störungen nicht).
8. Ein Länder- und Stadtsteckbrief mit Quelle und Stand (Einreise, Gesundheit, Geld, Sprache, Strom, Internet, Sitten).

**Abgleich (23 Anforderungen):** hat 7, teilweise 13, fehlt 3.
Größte Lücken: Steckbrief für Land und Stadt, Sprachhilfe, Offline-Karte zum Vorab-Laden, Prüfung der App-Barrierefreiheit, Reisetagebuch.
Gedeckt und durch Belege gestützt: kein Konto, kein Tracking, kein Abo, Notfallseite offline, Kosten teilen, Abstimmen, Wetter und Plan B.

**Wertschätzung:** Zeit und Geld sparen, alles gebündelt, Hilfe bei Änderungen, einfaches Teilen der Kosten, genaue Navigation ohne Werbung, Expertenrat und menschliche Nähe (Abschnitt 3).
**Ärger:** fehlende oder falsche Infos, Paywalls und Limits, Roaming und Funkloch, Überforderung, Betrug, Datenpannen, Erstattungschaos (Abschnitt 4).
**Länderinfos:** Direkte Umfragen mit Themenliste habe ich nicht gefunden. Belegt ist das Angebot von Behörden und Wikivoyage, dazu indirekte Nachfrage (Abschnitt 6). Einreiseregeln ändern sich schnell: immer mit Datum und Behördenlink.

**Grenzen:** Viele Umfragen stammen von Firmen mit Interesse (Expedia, Booking.com, Amadeus, Global Rescue, Holafly, Applause). Die meisten Zahlen kommen aus den USA, Großbritannien und China. Eine Umfrage unter deutschsprachigen Gruppenreisenden mit 60+ fand ich nicht.

---

## 1. Lesehinweis

- **Beleg** = was die Quelle sagt, mit Datum und Stichprobe. **Folgerung** = mein Schluss. **Setzung** = Wert von mir ohne Beleg. **Nicht geprüft** = nicht gelesen oder nicht gefunden.
- Kürzel `[Q12]` verweisen auf das Quellenverzeichnis (Abschnitt 9). Dort stehen URL, Datum, Stichprobe und Interessenlage.
- Belegstärke: **stark** = große Stichprobe, klare Methode. **mittel** = kleine oder einseitige Stichprobe, oder Herstellerumfrage. **schwach** = Vorschau, KI-Auswertung, Meinungstext, eigene Zählung kleiner Stichproben.
- Ältere Quellen als 2023 sind markiert. Ich nutze sie nur, wenn nichts Neueres da war.
- Prioritäten P1 bis P3 sind meine Folgerung: P1 = in mehreren unabhängigen Quellen belegt und Kernwert der Fasan Karte. P2 = belegt, aber enger oder dünner. P3 = dünn belegt.
- „Stand Karte“: hat / teilweise / fehlt. Grundlage: README, ENTSCHEIDUNGEN, Code. „Fehlt“ heißt: per Stichwortsuche nicht gefunden.
- Frühere Recherchen im Repo decken Gruppen, Kosten, Karten-UX und Ältere schon ab (`2026-10-24-gruppenreisen.md`, `-kosten-und-fuehrung.md`, `-karten-ux.md`). Ich wiederhole sie nicht, sondern verweise.

---

## 2. Priorisierte Anforderungen (23)

### P1: Kern

**1. Alles an einem Ort**
- Beleg: Applause, Aug. 2022, n > 5.000 (global, Testcommunity): 18 % wollen alle Reiseinfos an einem Ort. [Q3] Huang u. a. 2025, 13 Interviews, China: Reisende sollen nicht zwischen Apps wechseln müssen. [Q20] Phocuswright, Nov. 2024: Apps dienen vor allem Restaurantsuche, Check-in, Verkehr. Websites dienen Inspiration und Buchung. [Q9]
- Belegstärke: mittel (Applause älter als 2023, Firma verkauft App-Tests).
- Folgerung: Eine Reise-App gewinnt, wenn Plan, Karte, Geld, Wetter und Notfall zusammenliegen.
- Stand Karte: **teilweise.** Pläne, Karte, Kosten, Wetter, Notfall, Unterkunft sind da. Buchungen, Tickets, Dokumente: nicht gefunden.

**2. Richtige, datierte Angaben**
- Beleg: Euan's Guide Access Survey 2023, n > 6.000, UK (Seite von 2024): 76 % fanden Zugangsangaben auf Webseiten falsch, verwirrend oder irreführend. [Q17] Applause 2022: 18 % fanden die nötige Information nicht. [Q3] AARP, Juli 2024, n = 1.000 (50+): nur 36 % glauben, KI liefere die aktuellsten Reiseinfos. [Q1] Citymapper, KI-Auswertung 2026: Hauptkritik sind ungenaue Echtzeitdaten („ghost buses“). [Q42]
- Belegstärke: mittel bis stark (Euan's, AARP), schwach (Citymapper).
- Folgerung: Quelle und Stand je Angabe sind ein Wert, kein Schmuck.
- Stand Karte: **hat.** Preise mit Quelle und Datum, „keine aktuelle Info“, wenn kein Beleg (ENTSCHEIDUNGEN 24.10.).

**3. Funktioniert offline und bei schlechter Verbindung**
- Beleg: Holafly (eSIM-Hersteller), 02.02.2026, n nicht genannt: 86,7 % hatten mindestens ein Verbindungsproblem im Ausland, 43 % verloren das Signal an Grenzen, 44 % ärgern sich über Roaming-Kosten, 91 % verlassen sich auf das Smartphone, nur 3 % sind ganz offline. [Q15] Trustpilot Komoot, Aug. 2026, eigene Zählung von 20 Bewertungen: 2 loben Offline-Karten. [Q37] Citymapper: fehlender Offline-Betrieb vermerkt (KI-Auswertung). [Q42] Kumari und Memon 2022 (Daten 2010–2020, älter): Offline-Ankunftsinfos als Wunsch bei Zug-Apps in Russland. [Q19]
- Belegstärke: schwach bis mittel (Hersteller, kleine Stichproben).
- Folgerung: Offline ist ein Kriterium, aber die Umfrage dazu stammt von einem Verkäufer von Datenpaketen. Innerhalb der EU mildert „Roam like at home“ das Problem (in `gruppenreisen.md` belegt). Weltweit wird es wichtiger.
- Stand Karte: **teilweise.** App und Daten bleiben nach dem ersten Öffnen im Gerät. Kartenkacheln regelt nur der Browser-Cache, kein Vorab-Laden (`site/sw.js`, wegen OSM-Regeln).

**4. Kein Abo-Zwang für Kernfunktionen**
- Beleg: Splitwise: Seit Ende 2023 laut Presse nur 3–4 freie Einträge am Tag und 10 Sekunden Wartezeit, Pro kostet 5 $ im Monat oder 40 $ im Jahr (itvoice, 30.12.2023). [Q35] Trustpilot Splitwise: 2,0 von 5 bei 72 Bewertungen, 64 % mit einem Stern. In meiner Zählung der 20 sichtbaren Bewertungen (06.12.2023 bis 24.03.2025) nennen 12 Paywall oder Limit. [Q36] Kimola-Vorschau (30 Bewertungen, App Store, 2025): Limits, Paywall, Performance nach Updates. [Q41] Komoot Premium: etwa 60 € im Jahr, nur jährlich, Autor wünscht Monatsoption (GameStar, 04.03.2026). [Q38] Wanderlog: Nutzer wünschen Monatsabo statt Jahresabo (Kimola-Vorschau, 30 Bewertungen). [Q39]
- Belegstärke: schwach bis mittel. Gleiches Muster in drei Apps, aber jedes Mal kleine oder selbst ausgewählte Stichprobe.
- Folgerung: Die Fasan Karte hat hier einen echten Vorteil. Offen bleibt, wer die Server und Relays langfristig bezahlt (nicht geprüft).
- Stand Karte: **hat.** Frei, werbefrei, kein Konto.

**5. Datenschutz, der hält**
- Beleg: Polarsteps, FTM 05.09.2026, DutchNews 04.09.2026, itdaily 08.09.2026: Über eine API ohne ausreichende Zugriffskontrolle waren Standorte, Fotos und Fotodaten abrufbar, auch von Reisen, die nur für Follower oder privat waren. FTM nennt über 1 Mrd. GPS-Punkte, rund 230 Mio. Fotos und Videos, über 1 Mio. nur für Follower geteilte Reisen und über 30 Militärangehörige. Die niederländische Aufsicht sieht Verantwortung beim App-Betreiber. Polarsteps hatte laut FTM schon im Dez. 2025 eine Warnung. [Q22–Q24] Yuan u. a. (Daten Feb. 2023, n = 318, Prolific, Preprint): Reisende teilen Name und E-Mail leicht. Standort, Finanzdaten und Biometrie geben sie am ungernsten preis. [Q21] AARP 2024: 70 % der 50+ sorgen sich um KI-Datenschutz. [Q1] Phocuswright 2024: Reisende geben Daten nur für erkennbaren Nutzen, wünschen Apps mit weniger persönlichen Angaben. [Q9] Älter: Cornell 2015, n = 754: Abneigung gegen automatische Ortung. [Q43]
- Belegstärke: stark für das Leck (drei Medien plus Original, Zahlen der Medien weichen ab: DutchNews nennt „fast 2 Mio. Reisen“, FTM „23 Mio. Nutzer“). Mittel für die Umfragen.
- Folgerung: Jede App, die Standort oder Fotos teilt, wird an Polarsteps gemessen. Zuerst prüfen: Foto-Metadaten, Standardwerte beim Teilen, Sichtbarkeit für Fremde.
- Stand Karte: **hat.** Kein Konto, keine Statistik, Standort nur an die Gruppe, verschlüsselt, nur bei offener App; Kassenzettel-Fotos bleiben auf dem Handy (README, ENTSCHEIDUNGEN). Rest-Risiko laut README: Nostr-Relays sehen IP-Adresse und Zeitpunkt.

**6. Einfache Bedienung, keine Überforderung**
- Beleg: AARP 2024: 38 % fühlen sich von der Zahl der Werkzeuge überfordert, 13 % sagen, der Aufwand lohne nicht. [Q1] Phocuswright 2024: Einfachere Apps könnten die Nutzung steigern. [Q9] Huang u. a. 2025 (13 Interviews): überladene Informationsarchitektur, Wunsch nach modularen Inhalten. [Q20] Wanderlog: „überwältigendes Onboarding“ in der Kimola-Vorschau (30 Bewertungen, schwach). [Q39] Applause 2022: 14 % wünschen ein reibungsloses Erlebnis. [Q3]
- Belegstärke: mittel.
- Stand Karte: **hat.** Profil „Einfach“, Einführung in vier Seiten, Ziele ≥ 60 px. Wirkung im Test: nicht geprüft.

**7. Hilfe bei Störung und Notfall**
- Beleg: Expedia TAAP, Feld 19.09.–13.10.2024, n = 5.000 Berater-Kunden, 10 Märkte (auch Deutschland): 38 % nennen „Notfälle bewältigen“ als Grund für einen Berater. [Q4] Applause 2022: 37 % sagen, Apps halfen bei Störungen nicht, 63 % sagen, sie halfen. [Q3] Global Rescue, 09.–13.07.2024, n > 1.100 Mitglieder: 51 % nennen Verletzung oder Krankheit als größte Sorge. [Q13] TCS-Reisebarometer, Feld 24.02.–30.03.2025, n = 1.010 plus 1.009 (Schweiz): 76 % fühlen sich im Ausland (eher) sicher. Wichtig dafür sind verlässliche medizinische Versorgung, Rückholmöglichkeit und Infrastruktur. [Q12]
- Belegstärke: mittel (Berater- und Rettungsfirma haben Interesse).
- Stand Karte: **teilweise.** Notfallseite offline: 112, SNS 24, Botschaft, nächste Notaufnahmen und Apotheken aus OSM. Störungen der Reise (Streik, Ausfall, Umbuchung): nicht abgedeckt.

**8. Steckbrief zu Land und Stadt mit Quelle und Stand**
- Beleg: Siehe Abschnitt 6. Kurz: TCS 2025: Risikoinfos holen Schweizer vor allem von Behörden und Reiseportalen. [Q12] Auswärtiges Amt gliedert Länderseiten in Sicherheit, Natur und Klima, Reiseinfos, Einreise und Zoll, Gesundheit (Stand 24.10.2026). [Q32] Wikivoyage schreibt für Länder Einreise, Währung, Sprache, Sicherheit, Gesundheit, Sitten, Internet vor. [Q31]
- Belegstärke: mittel für das Angebot, schwach für die Nachfrage nach einzelnen Themen.
- Folgerung: Weil die Fasan Karte weltweit wachsen soll, braucht jede Stadt dasselbe Gerüst.
- Stand Karte: **teilweise.** Lissabon-Tipps (Fahren, Zeiten, Shoppen, Notfall, Vor Ort), Notfallseite, Stadtführer aus Wikipedia. Kein festes Gerüst für Einreise, Strom, Sprache, Internet, Geld.

**9. Kosten fair teilen**
- Beleg: Experian, Feld Juni 2025, Veröffentlichung 11.07.2025, n > 700 US-Erwachsene mit Reisen unter Freunden: Über die Hälfte der Gen Z und Millennials hatte Streit um Geld auf Reisen. Nur 1 von 4 Gruppen legt vorab ein Budget fest. Fair teilen und unerwartete Kosten sind die größten Stresspunkte. 35 % der Millennials nennen unterschiedliche Budgets als größte Hürde. [Q16] Splitwise-Kritik (Paywall, siehe Nr. 4). Früher: UX-Fallstudie 2017 (in `gruppenreisen.md`): Summen versteckt.
- Belegstärke: mittel (Kreditauskunft hat Interesse, US).
- Stand Karte: **hat.** Mehrere Zahler, vier Aufteilungsarten, Kassenzettel, exakter Ausgleich, Personen ohne App. Fremdwährung und Budget vorab: nicht gefunden.

**10. Gemeinsam planen und abstimmen**
- Beleg: Amadeus „Friction Removed“, 29.11.2024 (US, n nicht genannt): Wunsch nach mehr menschlicher Beteiligung in der Planung bei Familien 47 %, Reisen mit Barrierefreiheit 47 %, Alleinreisenden 43 %, Gruppen 40 %. [Q7] Folgerung: Auch Gruppen wollen Technik nicht allein entscheiden lassen. Booking.com Predictions 2026 (Teil für Asien-Pazifik): 63 % würden Apps nutzen, um Mitreisende zu finden. [Q34] Weitere Belege (Decrop 2005, Masthoff 2004, Delic 2016 u. a.) stehen in `2026-10-24-gruppenreisen.md`.
- Belegstärke: schwach in dieser Recherche, mittel in der früheren.
- Stand Karte: **hat.** Stimmen, Umfragen, Rangliste, Gruppenplan, Live-Abgleich, ohne Konto.

### P2: Wichtig, enger oder dünner belegt

**11. Zugang der Orte (stufenfrei, WC)**
- Beleg: Euan's Guide 2023, n > 6.000: 91 % suchen vor einem Besuch Zugangsangaben. 79 % hatten wegen schlechtem Zugang eine enttäuschende Reise oder änderten Pläne. 59 % meiden Orte ohne Angaben. 77 % besuchen eher einen neuen Ort, wenn sie passende Angaben finden. 62 % wollen sehen, was andere vorher schrieben. [Q17]
- Belegstärke: stark für UK, andere Länder nicht geprüft.
- Stand Karte: **teilweise.** Rollstuhl-Angabe aus dem OSM-Tag `wheelchair` („ja / teilweise / nein“) bei 25 von 104 Orten in `site/orte.json` (`tools/daten.py`). WC mit „rollstuhlgerecht“. Steigung, Treppen, Aufzug je Stopp: nicht gefunden (Vorschlag in `gruppenreisen.md`).

**12. Barrierefreie App (Schrift, Kontrast, Screenreader)**
- Beleg: Fernández-Díaz u. a. 2021 (älter), Apps und Webseiten portugiesischer und spanischer Tourismusorganisationen: sehr hohe Nichteinhaltung von WCAG 2.1. [Q27] Huang u. a. 2025: anpassbare Schriftgröße empfohlen. [Q20] Europäischer Rechtsakt zur Barrierefreiheit gilt seit 28.06.2025, technischer Standard EN 301 549 (Kanzleiartikel 2025). [Q28]
- Belegstärke: mittel.
- Stand Karte: **teilweise.** Profile „Einfach“ und „Gut lesbar“, Kontrast-Theme, Ziele ≥ 60 px, „Bewegung reduzieren“ wird befolgt (`style.css`). Screenreader und WCAG-Prüfung: nicht geprüft. Ob das Gesetz die freie, nicht kommerzielle App erfasst: nicht geprüft.

**13. Ältere: leichter Einstieg, Wahlfreiheit**
- Beleg: AARP 2024, n = 1.000 (50+, USA): 94 % sind einigermaßen vertraut mit Technik. Nutzung: 89 % für Planung, 87 % für Buchung, 80 % unterwegs. 77 % nutzen Navigations-Apps. Wer wenig Technik-Komfort hat, nutzt im Mittel 1,6 Werkzeuge, wer viel hat, 4,6. Etwa drei Viertel wollen dazulernen: Geübte bevorzugen Videos (47 %), Ungeübte Hilfe von Familie oder Freunden (39 %; Zahlen laut Pressemitteilung). [Q1, Q2] YouGov UK, 27.10.2025, n = 1.635: Nur 10 % der 55+ fühlen sich wohl mit KI-Reiseplanung, 58 % nicht. [Q8] Nur Abstract: Huang u. a. 2024 (Senioren in China): Personenmerkmale ändern, welche Funktionen Senioren wichtig sind. [Q25] Weitere Ältere-Belege in `gruppenreisen.md`.
- Belegstärke: stark für USA/UK, schwach für Deutschland.
- Stand Karte: **teilweise.** Profile, Teilen per QR oder Link. Hilfe zum Einstieg für Mitreisende (jemand führt die Älteren): Reiseführer-Modus ja. Anleitung oder Probemodus: nicht gefunden.

**14. Navigation zu Fuß und im Nahverkehr**
- Beleg: AARP 2024: 77 % nutzen „üblicherweise“ Navigations-Apps unterwegs. Der Bericht sagt zugleich, auf der letzten Reise habe kein einzelnes Werkzeug mehr als die Hälfte erreicht (Spannung in der Quelle, nicht geklärt). [Q1] Eurobarometer, Feld 28.08.–04.09.2024, n = 25.805 (EU): Für Regional- und Fernreisen sind Kosten (61 %), Dauer (47 %), Zeiten (36 %) und Komfort (29 %) die wichtigsten Faktoren. 76 % buchen schon online. [Q10] Citymapper (KI-Auswertung 2026, 120 von etwa 1.900 Bewertungen): gelobt werden genaue Navigation, Routenvergleich mit Kosten, keine Werbung. [Q42] Komoot, eigene Zählung von 20 Bewertungen (Aug. 2026): 3 loben Navigation, 1 klagt über Fehlleitung auf Autobahn. [Q37]
- Belegstärke: mittel für Nutzung, schwach für die Bewertungsinhalte.
- Stand Karte: **teilweise.** Fußweg in der App, Ansagen, Ankunft. Echtzeit im Nahverkehr: nicht gefunden (Fahrplan-Recherche vom 24.10. liegt vor).

**15. Betrug und Sicherheit unterwegs**
- Beleg: AARP 2024: Sorge vor Betrug oder digitaler Unsicherheit steigt von 38 % (Planung) über 50 % (Buchung) auf 59 % (unterwegs, vor allem Scams). Frauen mehr als Männer (63 % gegenüber 55 % unterwegs). [Q1] Global Rescue 2024: Unruhen und Terror nur 15 % als größte Sorge. [Q13]
- Belegstärke: mittel (USA, 50+).
- Stand Karte: **teilweise.** Notfall-Tipp zu Taschendieben laut Auswärtigem Amt, Couvert-Falle in Lissabon. Kein festes Feld „Betrug und Fallen“ je Stadt.

**16. Sprachhilfe**
- Beleg: YouGov UK, 27.10.2025: Übersetzung und Verständigung ist der häufigste Zweck von KI auf Reisen (26 %). [Q8] Global Rescue, Feld 24.–30.06.2025, n > 2.900 Mitglieder: 90 % finden Live-Übersetzung nützlich, 36 % sehr nützlich. [Q14]
- Belegstärke: mittel (UK, Mitglieder einer Rettungsfirma).
- Folgerung: Eine Übersetzung per Fremdanbieter widerspricht „keine fremden Netzwerkdienste“. Offline-Phrasenkarten sind schon als Idee in `gruppenreisen.md` vermerkt.
- Stand Karte: **fehlt.** Phrasen oder Übersetzung: nicht gefunden.

**17. Geld: Preise, Budget, Zahlung**
- Beleg: Applause 2022: 16 % wünschen gute Anbindung an Zahlungsmittel, 11 % hatten Probleme damit. [Q3] Expedia Traveler Value Index, 10.06.2025, n = 11.000 (11 Märkte): Fast 60 % erwarten, preisbewusster zu sein. [Q5] TCS 2025: Hohe Preise am Ziel gehören zu den häufigsten Ärgernissen, dazu Overtourismus und Wartezeiten. [Q12] Experian 2025: Nur 1 von 4 Gruppen legt Budget fest. [Q16]
- Belegstärke: mittel.
- Stand Karte: **teilweise.** Preise je Ort mit Quelle, Geldautomaten in der Nähe, Trinkgeld-Hinweis. Währungsrechner, Tagesbudget: nicht gefunden.

**18. Plan B bei Wetter und Änderungen**
- Beleg: AARP 2024: 77 % sagen, Technik helfe bei unerwarteten Änderungen. [Q1] Applause 2022: 63 % sagen, Apps halfen bei Absagen, Verspätungen oder Schließungen. [Q3] Komoot nennt Wetter je Etappe als Premium-Vorteil. [Q38]
- Belegstärke: mittel.
- Stand Karte: **hat.** Wetter je Tag und Stunde mit Stand, Plan A/B/C, Zeitleiste mit Tempi („Was ist noch machbar?“).

### P3: Dünn belegt oder Randbereich

**19. Vertrauen durch Urteile anderer Reisender**
- Beleg: Expedia 2025: 76 % würden für ein Hotel mit besseren Bewertungen mehr zahlen. Über 60 % nennen Soziale Medien als Inspiration (2023: 35 %). [Q5] Huang u. a. 2025: Misstrauen gegen retuschierte Fotos und unzuverlässige Bewertungen. [Q20] Euan's: 62 % wollen sehen, was andere schrieben. [Q17]
- Belegstärke: schwach bis mittel (Expedia verkauft Buchungen und Werbung).
- Stand Karte: **teilweise.** Eigene Bewertung und Notiz, Gruppenbewertung. Bewertungen Fremder fehlen, das ist ohne Konto auch schwer.

**20. Lokaler Rat und Geschichten (Insider)**
- Beleg: L.E.K., Feld Sept. 2025, veröffentlicht 08.01.2026, n = 1.000 US-Erwachsene: Reisende wollen Fachwissen vor Ort und Nähe zur lokalen Kultur. 28 % machten mehr Touren als im Vorjahr. [Q6] Expedia 2024: 52 % nennen Expertenrat. [Q4]
- Belegstärke: schwach bis mittel.
- Stand Karte: **teilweise.** Stadtführer aus 317 Wikipedia-Artikeln, Geheimtipps, Hinweis beim Vorbeigehen (dezent).

**21. Andrang und Wartezeiten vermeiden**
- Beleg: TCS 2025: Overtourismus und lange Wartezeiten gehören zu den häufigsten Ärgernissen. [Q12]
- Belegstärke: schwach (eine Umfrage, Schweiz).
- Stand Karte: **teilweise.** Öffnungszeiten, „jetzt offen“, Besuchsdauer. Andrang oder beste Uhrzeit: nicht gefunden.

**22. Erinnerung und Reisetagebuch**
- Beleg: Kimola-Vorschau Polarsteps (30 Bewertungen von Dez. 2023): gelobt werden Routenaufzeichnung, Foto-Ort-Verknüpfung, Teilen mit Familie. [Q40] Booking.com 2026 (Asien-Pazifik): 75 % würden KI-Ortung nutzen, um Erinnerungen nachzureisen. [Q34]
- Belegstärke: schwach (Vorschau, Anbieter mit Interesse).
- Folgerung: Polarsteps zeigt das Risiko dieser Funktion. Nur lokal speichern wäre der Fasan-Weg.
- Stand Karte: **fehlt.** „Erledigt“, Notiz und Bewertung sind da. Tagebuch oder Rückblick: nicht gefunden.

**23. Daten mitnehmen (Export)**
- Beleg: Trustpilot Komoot (Aug. 2026): 1 von 20 sichtbaren Bewertungen wünscht einfacheren GPX-Import. [Q37]
- Belegstärke: sehr schwach.
- Stand Karte: **fehlt.** Abrechnung als Text ist da. Export von Plan oder Orten: nicht gefunden.

---

## 3. Was Reisende besonders schätzen (Wertschätzung)

| Was | Beleg | Stärke |
| --- | --- | --- |
| Zeit und Geld sparen | AARP 2024 (n = 1.000, 50+): 85 % Geld, 77 % Zeit. [Q1] | mittel |
| Alles gebündelt, Erinnerungen per Nachricht, sichere Daten | Applause 2022 (n > 5.000): 18 %, 15 %, 14 %. [Q3] | mittel (älter) |
| Hilfe bei Änderungen | AARP: 77 %. Applause: 63 % sagen, Apps halfen. [Q1, Q3] | mittel |
| Einfaches Buchen | Booking.com, 1.000 Google-Play-Bewertungen, Dez. 2024: 81,9 % positiv, Themen „einfach, schnell, verlässlich“. [Q18] | mittel |
| Genaue Navigation, Routenvergleich, keine Werbung | Citymapper, KI-Auswertung 2026. [Q42] | schwach |
| Routen entdecken, klare Navigation, Offline-Karten | Komoot, Trustpilot Aug. 2026, eigene Zählung von 20: 6, 3, 2. [Q37] | schwach |
| Kosten leicht teilen | Splitwise, Trustpilot, eigene Zählung von 20 (selbst in schlechten Bewertungen): 8. [Q36] | schwach |
| Reiseplan ordnen, Buchungen einbinden | Wanderlog, Kimola-Vorschau (30). [Q39] | schwach |
| Expertenrat, Zeitersparnis, Personalisierung | Expedia 2024: 52 %, 52 %, 45 % (Berater-Kunden). [Q4] | mittel (Interesse) |
| Mensch an der Grenze und im Hotel | Amadeus 2024: 44 % und 43 %. [Q7] | mittel (Interesse) |
| Live-Übersetzung | Global Rescue 2025: 90 % nützlich. [Q14] | mittel (Mitglieder) |
| Zugangsangaben, die stimmen | Euan's 2023: 77 % besuchen eher, 76 % mehr Vertrauen. [Q17] | stark (UK) |
| Technik, die Datenmenge klein hält | Phocuswright 2024: Apps mit weniger persönlichen Angaben. [Q9] | mittel |

---

## 4. Was Reisende am meisten ärgert

| Was | Beleg | Stärke |
| --- | --- | --- |
| Nötige Information nicht finden oder falsch | Applause 2022: 18 %. Euan's 2023: 76 % falsche Angaben. [Q3, Q17] | mittel bis stark |
| Langsame Antwort, Lokalisierung, Zahlung | Applause 2022: 13 %, 12 %, 11 %. [Q3] | mittel (älter) |
| Stornierung und Erstattung | Expedia 37,8 % negative gegen Booking.com 8,4 % in je 1.000 Google-Play-Bewertungen, Dez. 2024 (Summen in der Quelle ergeben 101,6 %, Rundungsfehler). [Q18] | mittel |
| Paywall, Limits, Jahresabo | Splitwise, Wanderlog, Komoot (siehe Nr. 4). [Q35–Q39] | schwach bis mittel |
| Funkloch und Roaming | Holafly 2026: 86,7 %, 43 %, 44 %. [Q15] | mittel (Hersteller) |
| Überforderung | AARP 2024: 38 %. [Q1] | mittel |
| Betrug unterwegs | AARP 2024: 59 %. [Q1] | mittel |
| Datenpanne | Polarsteps, Sept. 2026. [Q22–Q24] | stark |
| Hohe Preise am Ziel, Overtourismus, Wartezeit | TCS 2025, n = 1.010 plus 1.009. [Q12] | mittel (Schweiz) |
| Retuschierte Fotos, unzuverlässige Bewertungen | Huang u. a. 2025, 13 Interviews. [Q20] | schwach |
| Umbauten und Updates, die Bedienung ändern | Komoot Trustpilot: 5 von 20 (eigene Zählung). Splitwise: Performance nach Updates (Kimola-Vorschau). [Q37, Q41] | schwach |
| Apps helfen bei Störungen nicht | Applause 2022: 37 %. [Q3] | mittel (älter) |
| Verlust des Zugriffs, wenn Handy leer oder weg | Global Rescue 2025: 35 % sorgen sich. [Q14] | mittel (Mitglieder) |

---

## 5. Menschliche Reiseleiter und Agenturen: Was schätzen Reisende, was kann eine App?

Interessenlage: Expedia verkauft Software an Berater. L.E.K. ist eine Beratung. Amadeus ist Reisetechnik. Meine Spalte „App kann“ ist Folgerung.

| Wertschätzung | Beleg | App kann es? | Fasan Karte |
| --- | --- | --- | --- |
| Expertenrat, gute Auswahl | Expedia 2024, n = 5.000: 52 %. Ideales Ziel und Unterkunft: 37 %. [Q4] | teilweise: kuratierte, geprüfte Orte und Pläne ja. Urteil im Einzelfall nein. | teilweise (Pläne A/B/C, Geheimtipps) |
| Zeitersparnis | Expedia 2024: 52 %. L.E.K. 2026: Zeit sparen, Stress vermeiden, sichere Erlebnisse. [Q4, Q6] | ja | hat (Pläne, Zeitleiste) |
| Exklusive Angebote | Expedia 2024: 45 %. [Q4] | nein, werbefrei und ohne Verkauf | bewusst nicht |
| Persönlicher Service | Expedia 2024: 45 %. [Q4] | nein, nur Gruppenchat | teilweise |
| Notfälle bewältigen | Expedia 2024: 38 %. [Q4] | teilweise: Wege zu Hilfe, Nummern, Adressen. Ein Mensch am Telefon nein. | teilweise |
| Menschlicher Kontakt | Amadeus 2024: 44 % und 43 %; Gruppen 40 %, Familien 47 %, Barrierefrei-Reisen 47 % wünschen mehr Menschen in der Planung. [Q7] | nein | teilweise (Nachrichten, Reiseführer-Modus) |
| Lokale Kultur, Geschichten | L.E.K. 2026: Fachwissen vor Ort und Nähe zur Kultur. [Q6] | teilweise: belegte Texte ja, Fragen und Erzählen nein. | teilweise (Stadtführer) |
| Führung, Tempo, Zusammenhalt der Gruppe | Reiseführer-Modus: Beleg in `2026-10-24-kosten-und-fuehrung.md`. | ja, in Teilen | hat |
| Respekt, Ehrlichkeit, Sicherheitshinweise | El-Sharkawy 2015 (älter), 150 Touristen in Ägypten: Respekt Mittelwert 4,7 von 5, Hinweise zu Sicherheit 4,5. [Q30] | teilweise: Sitten- und Sicherheitsfeld | teilweise |
| Rollen von Reiseleitern (Überblick) | Yu u. a. 2026, 267 Studien: neun Themen, darunter Rollen, Erwartungen, Wohlbefinden. Welche Rollen im Einzelnen, stand auf der Abstract-Seite nicht. [Q29] | nicht geprüft | nicht geprüft |

Befund: 85 % würden laut L.E.K. 2026 einen Berater neben KI weiter nutzen, 66 % hielten den Preis für fair. [Q6] Folgerung: Die App ersetzt keinen Berater, aber sie kann dessen Zeit- und Ordnungsleistung für Gruppen übernehmen.

---

## 6. Welche Informationen zu Land und Stadt Reisende erwarten

**Beleglage:** Eine Umfrage, die Reisende nach einer Themenliste (Einreise, Strom, Trinkwasser …) fragt, habe ich nicht gefunden. Es gibt zwei Arten von Belegen:

- **Angebot** (was Behörden und Community für nötig halten): Auswärtiges Amt, Wikivoyage. Das ist kein Beleg für die Nachfrage.
- **Indirekte Nachfrage** (Sorgen, Probleme, Nutzung): Umfragen aus Abschnitt 2.

**Vor und während der Reise (Beleg):** Phocuswright 2024: Websites für Inspiration, Recherche und Buchung, Apps für Restaurantsuche, Check-in und Verkehr. [Q9] AARP 2024: 89 % Technik für Planung, 87 % für Buchung, 80 % unterwegs. [Q1] **Folgerung:** Vorher gehören Einreise, Gesundheit, Geld, Strom, Sprache grob in die App. Während der Reise zählen Notfall, Verkehr, Betrug, Sitten, Trinkwasser, Öffnungszeiten.

| Thema | Angebot (Beleg) | Nachfrage (Beleg) | Ändert sich? | Stand Karte |
| --- | --- | --- | --- | --- |
| Einreise | AA-Länderseite hat „Einreise und Zoll“ (Stand 24.10.2026). [Q32] Wikivoyage: Länderartikel nennen Einreise und Visa. [Q31] | TCS 2025: Schweizer holen Risikoinfos von Behörden. [Q12] | schnell: EES voll in Betrieb seit 10.04.2026, ETIAS ohne Starttermin, „derzeit nicht in Betrieb“ (Gulf News, aktualisiert 11.08.2026; offizielle Seite nicht selbst geprüft). [Q33] | fehlt |
| Gesundheit | AA „Gesundheit“. Wikivoyage „Stay healthy“: Impfungen, Apotheken, Kosten der Versorgung. [Q31, Q32] | Global Rescue 2024: 51 % größte Sorge Krankheit oder Verletzung (Mitglieder). TCS: Medizin und Rückholung. [Q12, Q13] | langsam | teilweise (Apotheken, Notaufnahmen, SNS 24) |
| Geld | Wikivoyage „Buy“ verlangt Währung, Wechsel, Steuern, Geld von zu Hause. [Q31] | Applause: Zahlungsmittel 16 %. TCS: Preise am Ziel. [Q3, Q12] | mittel | teilweise (Geldautomaten, Trinkgeld, Preise) |
| Sprache | Wikivoyage „Talk“: wie weit Englisch reicht. [Q31] | YouGov: 26 % Übersetzung. Global Rescue: 90 % nützlich. [Q8, Q14] | kaum | fehlt |
| Sitten und Regeln | Wikivoyage „Respect“: Bräuche, die Besucher oft falsch machen. [Q31] | Nur Ältere/andere Gruppen: El-Sharkawy 2015 (Reiseleiter-Respekt). [Q30] | langsam | teilweise (Lissabon „Vor Ort“) |
| Notfall | Wikivoyage: 112 gehört in „Stay healthy“. AA-Seite führt Botschaften. [Q31, Q32] | siehe Nr. 7 | langsam | hat (Lissabon) |
| Strom | Wikivoyage-Vorgabe nennt Strom nicht ausdrücklich. [Q31] Gefunden: kein Beleg zur Nachfrage. | nicht geprüft | kaum | fehlt |
| Internet, SIM | Wikivoyage „Connect“: Netze, WLAN, SIM. [Q31] | Holafly 2026: 86,7 % Probleme, 26 % Schwierigkeiten mit SIM-Einrichtung (Hersteller). [Q15] | mittel (Preise, Regeln) | fehlt |
| Verkehr | Wikivoyage „Get around“. [Q31] | AARP: 77 % Navigation. Eurobarometer 2024: Kosten, Dauer, Zeiten. [Q1, Q10] | mittel (Preise, Fahrpläne) | teilweise |
| Trinkwasser | Wikivoyage-Vorgabe nennt Leitungswasser nicht ausdrücklich. [Q31] | nicht geprüft | kaum | teilweise (Stellen aus OSM; „Leitungswasser trinkbar?“ nicht gefunden) |
| Sicherheit | AA „Sicherheit“. Wikivoyage „Stay safe“. [Q31, Q32] | AARP: 59 % Betrugssorge unterwegs. [Q1] | mittel | teilweise (Taschendiebe) |
| Feiertage | Wikivoyage: Länderartikel führen Feiertage unter „Understand“. [Q31] | nicht geprüft | jährlich | fehlt als Feld. Öffnungszeiten übergehen Feiertagsregeln (`site/oeffnungszeiten.js`, Kommentar). |
| Klima, Wetter | AA „Natur und Klima“. Wikivoyage „Climate“. [Q31, Q32] | Komoot: Wetter je Etappe als Plus. [Q38] | täglich | hat (Wetter) |

**Folgerung für den Steckbrief:**

- Zwölf Felder: Einreise, Gesundheit, Geld, Sprache, Sitten, Notfall, Strom, Internet, Verkehr, Trinkwasser, Sicherheit, Feiertage. Dazu Wetter und Klima.
- Jede Aussage mit Quelle und Stand. Einreise nur mit Link zur Behörde und Datum. „Keine aktuelle Info“, wenn kein Beleg.
- Für Strom, Trinkwasser und Feiertage fand ich keine Umfragebelege. Sie gehören als Felder trotzdem hinein, weil sie in Wikivoyage oder amtlichen Seiten vorkommen. Das ist eine Setzung.

---

## 7. Quellenlage zu den genannten Apps (Bewertungsauswertungen)

Der direkte Abruf der App-Store-Bewertungen war gesperrt (Zugriff auf `itunes.apple.com` verweigert). Eigene Auswertung daher nicht möglich.

| App | Was ich fand | Stärke |
| --- | --- | --- |
| TripIt | nichts gefunden, nicht geprüft | keine |
| Wanderlog | Kimola-Vorschau, 30 Bewertungen, App Store, Jan.–Mai 2025: Lob für Oberfläche, Ordnen, Buchungen. Kritik an Tempo, Abstürzen, Onboarding, Jahresabo. [Q39] | schwach |
| Google Maps | nichts Auswertbares gelesen. Suche ergab nur Aggregator `unstar.app`, nicht geöffnet. | keine |
| Komoot | Trustpilot, 20 Bewertungen vom 14.–28.08.2026, eigene Zählung. 3,7 von 5. Kritik: Bedienung 5, Abo und Werbung 4, Support 3. Lob: Routen entdecken 6, Navigation 3, Offline 2. [Q37] GameStar 04.03.2026: Abo nur jährlich. [Q38] | schwach |
| Splitwise | Presse zu Limits 30.12.2023. [Q35] Trustpilot, 20 Bewertungen 2023–2025, eigene Zählung. [Q36] Kimola, 30 Bewertungen 2025. [Q41] | schwach bis mittel |
| Polarsteps | Kimola-Vorschau, 30 Bewertungen von Dez. 2023. [Q40] Dazu das Leck 2026. [Q22–Q24] | schwach (Bewertungen), stark (Leck) |
| Citymapper | Marlvel, KI-Auswertung, 120 von etwa 1.900 Bewertungen, Seite geändert 17.08.2026. Widerspruch in der Seite (120 gegen 1.926). [Q42] | schwach |
| Booking.com, Expedia | Çaylak u. a. 2024, 2.000 Google-Play-Bewertungen. [Q18] | mittel |
| Buchungs-Apps allgemein | Kumari und Memon 2022: Anforderungen unterscheiden sich nach Land. Keine Zahlen. [Q19] | schwach, älter |

Folgerung: Die Aussagen über Paywall, Offline und Bedienungswechsel sind Hinweise. Für Entscheidungen brauchen wir eine eigene Auswertung, wenn der Zugriff auf Store-Daten möglich ist (offene Frage).

---

## 8. Folgerungen für die Fasan Karte (meine, nicht belegt)

**Zuerst schließen (P1-Lücken):**
1. Steckbrief je Stadt und Land mit festen Feldern, Quelle und Stand (Nr. 8, Abschnitt 6).
2. Offline stärken: Karte für den Reiseort vorab laden, soweit die OSM-Regeln es erlauben (Nr. 3). Prüfen, ob ein eigener Kachelsatz oder Vektordaten zulässig sind (nicht geprüft).
3. Datenschutz sichtbar machen: kurze Erklärung, was wohin geht (FOSSGIS, Relays), und Prüfung der Foto-Metadaten und Standardwerte beim Teilen (Nr. 5).

**Danach (P2):**
4. Sprachhilfe als Offline-Phrasenkarten (Nr. 16).
5. Zugangsdaten je Stopp: Steigung, Treppen, Aufzug (Nr. 11).
6. Prüfung der App-Barrierefreiheit (Screenreader, Kontrast) und der Rechtslage (Nr. 12).
7. Währung und Tagesbudget (Nr. 17). Fremdwährung in „Kosten teilen“ (Nr. 9).

**Bestätigt durch Belege:** kein Konto, kein Tracking, kein Abo, Notfallseite offline, Wetter und Plan B, Kosten teilen, Abstimmen.

**Risiko:** Der Live-Standort und der Stadtführer-Hinweis sind das, was Polarsteps zum Verhängnis wurde: Standort plus Zeit plus Wohnort. Standort ist nur an die Gruppe und nur bei offener App. Das sollte im Test geprüft werden (nicht geprüft).

---

## 9. Quellenverzeichnis

Alle Seiten am 25.10.2026 abgerufen. Das Datum in der Tabelle ist das Datum der Quelle. „Interesse“ nennt, wer an dem Ergebnis verdient.

| Kürzel | Quelle | Datum, Stichprobe, Interesse |
| --- | --- | --- |
| Q1 | AARP Research, „Click, Book, Go“. https://www.aarp.org/pri/topics/social-leisure/travel/2024-travel-technology-older-adults/ | 03.10.2024. n = 1.000 US-Erwachsene 50+, Online, Juli 2024. Pressemitteilung (https://www.aarp.org/press/releases/2024-10-03-aarp-study-shows-older-adults-embracing-technology-to-enhance-their-travel-experiences.html) nennt leicht andere Zahlen für Hotel- und Fluglinien-Seiten (83 % und 73 % statt 87 % und 75 %). Ich nutze den Bericht. Interesse: Seniorenverband. |
| Q2 | AARP-Pressemitteilung zur selben Studie. https://www.aarp.org/press/releases/2024-10-03-aarp-study-shows-older-adults-embracing-technology-to-enhance-their-travel-experiences.html | 03.10.2024. Quelle der Zahlen 47 % (Videos) und 39 % (Hilfe von Freunden). |
| Q3 | Applause-Umfrage über PhocusWire. https://www.phocuswire.com/travel-apps-have-work-to-do-in-improving-customer-satisfaction und https://www.applause.com/blog/what-travelers-want-from-apps-convenience | 24.10.2022 / 13.10.2022. Feld Aug. 2022. n > 5.000, global, Testcommunity „uTest“. Älter als 2023. Interesse: Applause verkauft App-Tests. |
| Q4 | Expedia TAAP Traveler Research Report 2024. https://partner.expediagroup.com/content/dam/unified/partner/documents/reports/2024-reports/taap-traveler-research-report-2024_en-us.pdf. Gleiche Zahlen: https://openjaw.com/newsroom/retail/2025/02/19/expert-advice-among-top-reasons-travellers-use-advisors-survey | Feld 19.09.–13.10.2024. n = 5.000 Berater-Kunden, 10 Märkte (AU, BR, CA, DE, IN, IT, MX, ES, UK, US). Interesse: Expedia verkauft Berater-Software. |
| Q5 | Expedia Group, Traveler Value Index 2025. https://innovation.expediagroup.com/en-us/resources/blog/2025-traveler-value-index-highlights | 10.06.2025. n = 11.000, 11 Märkte, Wakefield Research. Fieldwork-Daten nicht genannt. Interesse: Expedia. |
| Q6 | L.E.K. Consulting, „In the Age of AI, Travel Agents and Guided Tours Still Have Value“. https://www.lek.com/insights/travel-transport-logistics/age-ai-travel-agents-and-guided-tours-still-have-value | 08.01.2026 (aktualisiert 12.01.2026). Feld Sept. 2025. n = 1.000 US-Erwachsene. Interesse: Beratung. |
| Q7 | Amadeus „Friction Removed“ über Asian Hospitality. https://asianhospitality.com/survey-technology-is-important-but-so-is-the-human-touch | 29.11.2024. USA. n nicht genannt. Interesse: Amadeus. |
| Q8 | YouGov UK. https://yougov.com/en-gb/articles/53267-brits-more-comfortable-using-ai-for-trip-planning-than-last-year2 | 27.10.2025. n = 2.098 (Apr. 2024) und 1.635 (Juli 2025), UK. |
| Q9 | Phocuswright, „Use of tech in trip planning is not one-size-fits-all“ (Report „Travelers and Tech 2024“). https://www.phocuswright.com/Travel-Research/Research-Updates/2024/use-of-tech-in-trip-planning-is-not-one-size-fits-all | Nov. 2024. Nur Zusammenfassung gelesen, keine Zahlen, n und Land nicht genannt. |
| Q10 | EU-Seite zum Eurobarometer. https://transition-pathways.europa.eu/tourism/knowledge-documents/eu-travel-habits-insights-latest-eurobarometer-survey | Seite vom 02.04.2025. Feld 28.08.–04.09.2024. n = 25.805 EU. Umfrage zu Reisen und Verkehr (Kennung 3178 laut Seite). Originalbericht nicht gelesen. |
| Q11 | Flash Eurobarometer „Attitudes of Europeans towards tourism“ (Ipsos). https://www.ipsos.com/en/node/847481 | Feld 18.–28.10.2021, n = 25.714, EU-27. Älter. Seite nennt keine Befunde zu Information und Planung. Nur in Abschnitt 10 erwähnt. |
| Q12 | TCS Reisebarometer 2025, gfs.bern. https://www.gfsbern.ch/en/news/tcs-travel-barometer-2025/ | 27.05.2025. Feld 24.02.–30.03.2025. n = 1.010 (Wohnbevölkerung) plus 1.009 (TCS-Mitglieder), ±3,1 Punkte. Schweiz. Interesse: Automobilclub. |
| Q13 | Global Rescue Umfrage 2024. https://www.globalrescue.com/grcom/grmkt_resources/pdfs/travel-survey-report-2024.pdf | 09.–13.07.2024. n > 1.100 aktuelle und frühere Mitglieder. Interesse: verkauft Rettung. Nicht repräsentativ. |
| Q14 | Global Rescue Umfrage 2025. https://www.globalrescue.com/common/blog/detail/travelers-embrace-digital-tools-but-concerns-remain-over-security-battery-life-and-access/ | Feld 24.–30.06.2025, Veröffentlichung 25.08.2025. n > 2.900 Mitglieder. Interesse wie Q13. |
| Q15 | Holafly Global eSIM & Travel Report. https://esim.holafly.com/inside/market-reports/connectivity-challenges-abroad-traveler-data/ | 02.02.2026. n und Länder nicht genannt. Interesse: eSIM-Verkäufer. |
| Q16 | Experian-Umfrage. https://www.experian.com/blogs/ask-experian/survey-financial-stress-of-traveling-with-friends/ | Feld Juni 2025, Veröffentlichung 11.07.2025. n > 700 US-Erwachsene. Diagramme nicht lesbar: nicht alle Prozentwerte verfügbar. Interesse: Kreditauskunft. |
| Q17 | Euan's Guide Access Survey. https://accesssurvey.euansguide.com/ | Seite zur Umfrage 2024. Genannte Zahlen stammen aus 2023: „6.000+“ Befragte. UK. Interesse: Bewertungsportal für Zugang, gemeinnützig. |
| Q18 | Çaylak u. a., Applied Sciences 14(24), 11800. https://www.mdpi.com/2076-3417/14/24/11800/htm. Prozentwerte: https://doaj.org/article/a810b09e603d43378dfea9ebbc53973b | Dez. 2024. 1.000 Google-Play-Bewertungen je App (Booking.com, Expedia), Zugriff 12.09.2024. Zeitraum der Bewertungen nicht genannt. Peer-Review. |
| Q19 | Kumari und Memon, Acta Scientiarum. Technology 44, e58658. https://periodicos.uem.br/actascitechnol/index.php/ActaSciTechnol/article/download/58658/751375153854/751375243700 | 2022. Bewertungen 01/2010–03/2020, 20 Apps, 5 Länder. Anzahl nicht genannt. Älter. |
| Q20 | Huang, Othman, Muhaiyuddin, IJACSA 16(11), 2025. https://thesai.org/Downloads/Volume16No11/Paper_28-User_Experience_Deficiencies_in_Mobile_Tourism_Applications.pdf | 2025. 13 Interviews (5 Praktiker, 8 Gen Z), China, März–Mai 2025. Vorstudie, keine Häufigkeiten. |
| Q21 | Yuan, Li, Gillani, Ma, arXiv 2603.01992. https://arxiv.org/pdf/2603.01992 | Preprint, Datum aus Kennung März 2026 abgeleitet. Daten Feb. 2023. n = 318 (Prolific, 66,4 % Europa, 30,1 % Südafrika). Peer-Review: nicht geprüft. |
| Q22 | Follow the Money, „Travel app Polarsteps lets people spy on soldiers“. https://www.ftm.eu/articles/travel-app-polarsteps-military-sensitive-data-leaked | 05.09.2026 (geändert 09.09.2026). Original der Untersuchung. |
| Q23 | DutchNews. https://www.dutchnews.nl/2026/09/amsterdam-travel-app-leaked-users-personal-data-for-months/ | 04.09.2026. Zahlen weichen von FTM ab (siehe Nr. 5). |
| Q24 | Itdaily. https://itdaily.com/blogs/beveiliging/polarsteps-leak-exact-location/ | 08.09.2026. Sekundärquelle. |
| Q25 | Huang, Pan, Peng, Lu, J. Retailing and Consumer Services 81 (2024). https://ideas.repec.org/a/eee/joreco/v81y2024ics0969698924003047.html | 2024. Nur Abstract. Senioren in Xiaogan, China, Best-Worst-Skalierung. n nicht lesbar. |
| Q26 | Xu, Shi, Qin, Inf. Technol. & Tourism 25(4), 2023. https://ideas.repec.org/a/spr/infott/v25y2023i4d10.1007_s40558-023-00270-z.html | 2023. Nur Abstract. Medienanalyse zu digitalen Hürden für ältere Touristen in China, 2020–2022. |
| Q27 | Fernández-Díaz, Correia, de Matos, JTAER 16(4), 2021. https://portaldelainvestigacion.uma.es/documentos/6631383938b3d85bb1450bba?lang=ca | 2021. Älter. Zahl der geprüften Apps nicht lesbar. |
| Q28 | Taylor Wessing, „The European Accessibility Act and its implementation“. https://www.taylorwessing.com/en/interface/2025/accessibility/the-european-accessibility-act-and-its-implementation | 2025. Kanzleiartikel. Ausnahme für Kleinstunternehmen auf der Seite nicht erwähnt. Rechtstext selbst nicht gelesen. |
| Q29 | Yu u. a., Tourism Review 81(1), 229–255. https://ro.ecu.edu.au/ecuworks2022-2026/7700 | online 05.03.2026. 267 Studien. Nur Abstract. |
| Q30 | El-Sharkawy, Tourismos 10(1), 2015. https://tourismosjournal.aegean.gr/article/download/428/380/751 | 2015. 150 Fragebögen, Ägypten, Daten um 2010–2012. Älter, nur Hintergrund. |
| Q31 | Wikivoyage, Abschnittsvorgaben. https://en.wikivoyage.org/wiki/Wikivoyage:Article_skeleton_templates/Sections | Abruf 25.10.2026, Seite ohne Datum. Beschreibt das Angebot der Community, keine Nachfrage. |
| Q32 | Auswärtiges Amt, Reise- und Sicherheitshinweise Portugal. https://www.auswaertiges-amt.de/de/reiseundsicherheit/portugalsicherheit/210900 | „Stand 24.10.2026“ (unverändert gültig seit 29.07.2026). Abschnitte nur gelesen, nicht inhaltlich ausgewertet. |
| Q33 | Gulf News zu ETIAS und EES. https://gulfnews.com/business/tourism/europe-scraps-2026-etias-launch-timeline-travellers-wont-need-permit-yet-1.500637255 | zuletzt aktualisiert 11.08.2026. Sekundärquelle. Offizielle ETIAS-Seite nicht selbst geprüft. |
| Q34 | Booking.com Travel Predictions 2026 über TTG Asia. https://www.ttgasia.com/2025/11/24/travel-in-2026-to-focus-on-individuality-booking-com-predicts/ | 24.11.2025. n > 29.000, 33 Länder. Artikel gibt Zahlen für Asien-Pazifik. Interesse: Booking.com. Nicht zu Planung, Vertrauen, Gebühren. |
| Q35 | ITVoice, Splitwise-Limits. https://www.itvoice.in/splitwise-has-introduced-restrictions-on-the-number-of-free-expenses-users-can-add | 30.12.2023. Presse. Genauer Wert (3 oder 4) in der Quelle widersprüchlich. |
| Q36 | Trustpilot Splitwise (Irland, Seite 2). https://ie.trustpilot.com/review/splitwise.com?page=2 | Abruf 25.10.2026. Eigene Zählung von 20 Bewertungen (06.12.2023–24.03.2025). Seitenangaben zur Gesamtzahl widersprüchlich (72 gegen 59). Selbst ausgewählte Stichprobe. |
| Q37 | Trustpilot Komoot (Australien, Seite 2). https://au.trustpilot.com/review/komoot.de?page=2 | 14.–28.08.2026. Eigene Zählung von 20 Bewertungen. 3,7 von 5, Gesamtzahl auf der Seite widersprüchlich. Selbst ausgewählt. |
| Q38 | GameStar zu Komoot Premium. https://www.gamestar.de/artikel/komoot-premium-vorteile-und-nachteile,3429457.html | 04.03.2026. Meinungsartikel eines Autors. |
| Q39 | Kimola, Wanderlog App Store. https://kimola.com/reports/wanderlog-app-feedback-report-in-depth-user-insights-app-store-gb-156376 | Vorschau mit 30 Bewertungen, sichtbare von 20.01.–23.05.2025. Methode nicht beschrieben. |
| Q40 | Kimola, Polarsteps Google Play. https://kimola.com/reports/unlock-travel-app-success-polarsteps-feedback-analysis-google-play-en-141063 | Vorschau mit 30 Bewertungen, sichtbare von 15.–19.12.2023. |
| Q41 | Kimola, Splitwise App Store. https://kimola.com/reports/explore-why-splitwise-users-are-drifting-away-get-insights-now-app-store-in-155789 | Vorschau mit 30 Bewertungen, sichtbare von 13.02.–06.03.2025. |
| Q42 | Marlvel, Citymapper. https://marlvel.ai/apps/azdev-citymapper/reviews | Seite geändert 17.08.2026. KI-Auswertung, 120 von etwa 1.900 Bewertungen. Selbst als fehleranfällig bezeichnet. |
| Q43 | Cornell-Studie über Hotelier Maldives. https://hoteliermaldives.com/cornell-study-finds-travellers-want-more-mobile-options/ | 24.05.2015. n = 754 US. Älter, nur Hintergrund. |

---

## 10. Nicht verwendet, nicht gefunden, offen

- **Nicht verwendet (zu alt oder zu dünn):** Travel Weekly 2009 (Zugang), Rösch 2012 (Bedürfnisse Touristen, Spotted by Locals), Ioannou u. a. 2020 (Datenschutz, n = 685), Booking.com- und Eurobarometer-2021-Befunde zu Nachhaltigkeit (Eurobarometer 2021: n = 25.714, 82 % bereit zu Änderungen; Seite nannte keine Befunde zu Information und Planung).
- **Nicht gefunden:** unabhängige, systematische Bewertungsauswertungen zu TripIt, Wanderlog, Polarsteps, Komoot, Citymapper, Google Maps; Skift-Research-Umfragen im Volltext (Bezahlschranke, nur Suchtreffer); Phocuswright-Zahlen (nur Zusammenfassung); Umfrage zu Strom, Trinkwasser, Feiertagen; Umfrage unter deutschsprachigen Gruppenreisenden 60+.
- **Nicht geprüft:** ob die Fasan Karte unter das europäische Barrierefreiheitsgesetz fällt; ob der ETIAS-Status heute noch stimmt (Stand 11.08.2026); Foto-Metadaten in der Fasan Karte; ob „fehlt“-Funktionen wirklich fehlen (nur Stichwortsuche im Code, nicht auf einem Gerät); Wirkung von Profil „Einfach“ im Test.
- **Blockiert:** Abruf der App-Store-Bewertungen über `itunes.apple.com` (Proxy). Wenn der Zugriff freigegeben wird, wäre eine eigene Auswertung von mindestens 500 Bewertungen je App möglich (Setzung).
- **Hinweis zu Q18:** Prozentwerte der Studie ergeben je App 101,6 %. Ursache in der Quelle: Rundung oder Fehler, nicht geklärt.
