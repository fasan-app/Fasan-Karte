# Länderdaten weltweit für die Fasan Karte (Grundinfos je Zielland, passend zum Herkunftsland)

Recherche vom 25.10.2026. Frage: Welche offenen, frei lizenzierten, maschinenlesbaren Quellen liefern weltweit pro Land belastbare Reise-Grundinfos, und wie holt man sie im Bauprozess (GitHub Actions → statische JSON)?

## 0. Grenzen dieser Recherche (zuerst lesen)

- **Kein Endpunkt wurde live getestet.** Der Sandbox-Proxy lieferte am 25.10.2026 für alle direkten Abrufe 403: auswaertiges-amt.de, query.wikidata.org, www.wikidata.org/w/api.php, *.wikivoyage.org, date.nager.at, raw.githubusercontent.com, ecb.europa.eu, data.iana.org, iec.ch, gov.uk, cdc.gov, washdata.org, eea.europa.eu, unicode.org (curl-Probe, Proxy-Protokoll `recentRelayFailures`). Alle URL-Muster unten sind daher aus gelesenen Seiten abgeleitet. Der erste Testlauf muss in GitHub Actions passieren (dort ist das Netz offen).
- Gelesen habe ich Seiten mit WebSearch und WebFetch. WebFetch fasst mit einem kleinen Modell zusammen. Wörtliche Zitate sind dort auf 125 Zeichen begrenzt. **Vor dem Einbau jeder Quelle den Lizenztext selbst im Original lesen.**
- Wikidata-Seiten (`www.wikidata.org/wiki/Property:…`, Q-Items) waren nicht abrufbar. Property-IDs habe ich nur über Titel von Suchtreffern und die Seite `MediaWiki:Wikibase-SortedProperties` bestätigt. **Wie viele Länder die Werte wirklich haben, ist nicht gemessen.**
- Umfang: 36 Suchen, 56 Abrufversuche (16 davon abgelehnt oder fehlgeschlagen). Das ist über der Vorgabe „etwa 35 Suchen“, wenn man Abrufe mitzählt.
- „gelesen“ heißt: Seite am 25.10.2026 abgerufen. „nicht geprüft“ heißt: Wissen aus dem Gedächtnis oder nur Suchtreffer-Titel. Keine Rechtsberatung; Lizenzvereinbarkeit ist meine Einschätzung.

## 1. Kurzfassung

| Thema | empfohlene Quelle | Lizenz | Abruf (URL/SPARQL/API) | Grenzen |
|---|---|---|---|---|
| 1 Stecker, Spannung, Frequenz | Wikidata P2853 (Stecker), P2884 (Spannung) als Basis; Gegenprüfung mit Wikipedia „Mains electricity by country“. IEC World Plugs nicht nutzen | Wikidata: CC0. Wikipedia: CC BY-SA. IEC: keine freie Lizenz belegt | SPARQL `https://query.wikidata.org/sparql` (nicht getestet) | Abdeckung nicht gemessen. P2885 (Frequenz) nicht bestätigt. IEC-Anleitung laut Wikipedia nicht mehr verfügbar |
| 2 Währung, Kurse | Wikidata P38 und CLDR `currencyData` (ISO 4217); Kurse: EZB-Referenzkurse | CC0; Unicode License v3 (MIT-ähnlich); EZB: frei mit Quellenangabe, Änderungen kennzeichnen | `cldr-json` (GitHub); `https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml` | EZB: nur 29 Währungen, „nur zur Information“, um 16 Uhr MEZ. Kein JSON |
| 3 Notruf | Wikidata P2852 plus 112-Hinweis; Stichproben von Hand | CC0 | SPARQL (nicht getestet) | Keine maschinenlesbare amtliche Gesamtliste gefunden. Je Dienst (Polizei, Rettung, Feuer) nicht geprüft |
| 4 Zeitzonen | IANA tzdb (Release 2026d, 11.09.2026) | Public Domain laut tz-README; IANA-Seite nennt keine Lizenz | `https://data.iana.org/time-zones/releases/tzdata2026d.tar.gz` | Land → mehrere Zonen. Regeln ändern sich oft (2026: a, c, d) |
| 5 Sprachen, Grüße | CLDR `territoryInfo` (Sprachen je Land); Wikivoyage-Phrasebooks (Grüße) | Unicode License v3; CC BY-SA | `cldr-json`; MediaWiki API `action=parse` (nicht getestet) | CLDR hat nach meiner Kenntnis keine Grußformeln (nicht geprüft). Phrasebooks sind Fließtext, nicht strukturiert |
| 6 Reise- und Sicherheitshinweise | Auswärtiges Amt OpenData (Herkunft DE); UK FCDO über GOV.UK Content API (Herkunft GB) | AA: eigene Nutzungsbedingungen, **keine** CC-Lizenz, Anmeldung per Formular. FCDO: OGL v3.0 | `https://www.auswaertiges-amt.de/opendata/travelwarning` und `/travelwarning/{id}`; `https://www.gov.uk/api/content/…` | AA-Webseite hat „Rechtliche Besonderheiten“ (unter Reiseinfos). „Medizinische Hinweise“ heißt dort „Gesundheit“; Merkblätter über `/healthcare`. AT, CH, US: keine Schnittstelle gefunden |
| 7 Trinkwasser | Keine belastbare Länderangabe „Leitungswasser trinkbar“. Nur Kontext: JMP „sicher bewirtschaftetes Trinkwasser“ (WHO-Portal) und allgemeiner CDC-Hinweis | WHO-Portal: CC BY 4.0 (mit WHO-Bedingungen). JMP- und CDC-Seite: nichts gefunden | WHO-Datenportal: CSV und API (Indikator 1548EA3) | Das ist ein Bevölkerungsanteil, kein Ja/Nein. Auf der Portalseite Stand 2019. Nur ortsbezogen belastbar |
| 8 Feiertage | Nager.Date Community-API v4 (mit Gegenprüfung) | Code: MIT. Daten: Lizenz nicht genannt | `https://nagerholidays.com/api/v3/publicholidays/{Jahr}/{ISO2}` | Datenquelle nicht genannt, Rate-Limit nicht genannt, Domain gewechselt |
| 9 Einreise, Visa | Amtlich: Länderseite des AA („Einreise und Zoll“) oder FCDO, nur als Link und Auszug. Orientierung: passport-index-dataset | Repo: MIT. Daten stammen von passportindex.org | CSV im Repo `ilyankou/passport-index-dataset` | Archiviert (12.01.2025). Nachfolger `imorte/passport-index-data` nicht geprüft. Nicht amtlich, ohne Bedingungen (Passgültigkeit, Transit) |
| 10 Verkehrsseite | Wikidata P1622 | CC0 | SPARQL (nicht getestet) | Abdeckung nicht gemessen |
| 11 Stadtwissen | Wikivoyage über MediaWiki API (Abschnitte lesen, kürzen, Quelle zeigen) | CC BY-SA (4.0 laut Wikipedia-Infobox). Namensnennung und Share-Alike | `https://{sprache}.wikivoyage.org/w/api.php?action=parse&prop=sections` (nicht getestet) | Abschnittsnamen je Sprache verschieden (nicht geprüft). Qualität schwankt. Kürzen = Bearbeitung |
| 12 Badestellen EU | EEA „Bathing Water Directive – Status of bathing water“ (Datensatz 2025, veröffentlicht 02.06.2026) | Auf der Seite nicht genannt; „EEA data policy“ nicht gelesen | Excel-Download auf der Datensatzseite; keine API gefunden | Saisonbewertung, nicht das Wasser von heute. Nur Excel |

## 2. Empfehlung für den Bauprozess (Skizze, nicht gebaut)

1. Ein Skript `tools/laenderdaten.py` (wie `tools/wetter.py` nur im Bauprozess) schreibt `site/laender/index.json` und `site/laender/{ISO2}.json`. Jede Datei trägt `quellen[]` mit Name, URL, Lizenz, Abrufdatum, Stand.
2. **Daten je Zielland, nicht je Länderpaar.** Die Handys rechnen den Vergleich selbst: Steckeradapter (Schnittmenge der Steckertypen von Herkunft und Ziel), Spannung, gleiche Währung, Linksverkehr. So bleiben die Dateien klein (Länderzahl statt Länderzahl²).
3. Hinweistexte (Auswärtiges Amt, FCDO, Wikivoyage) **nicht vorab für alle Länder in den Cache der App legen.** Größe nicht gemessen. Erst laden, wenn jemand ein Zielland wählt, und dann für die Reise offline halten.
4. Wikidata: eine SPARQL-Abfrage je Lauf, wöchentlich. Gute `User-Agent`-Kennung senden, bei Antwort 429 warten (Wikidata:Data access, gelesen).
5. Änderungen erkennen: AA liefert `lastModified` je Land. Nur geänderte Länder neu holen (Zwischenspeicher wie `data/cache.json`).
6. Vor dem Einbau je Quelle ein Lauf, der Zahl der Länder mit Wert zählt (Abdeckungstest). Fehlende Werte zeigt die App als „keine Angabe“, nie als Vermutung.
7. Jede Karte in der App zeigt „Quelle, Stand“ (Fasan-Regel: Fakten mit Quelle und Datum).

Zwei Fragen an dich:
- **Auswärtiges Amt:** Die Bedingungen sind keine freie Lizenz (Nutzung kann untersagt werden, Anmeldung nötig, Texte vollständig und aktuell halten). Soll das in eine FOSS-App? Alternative: nur Link auf die Länderseite plus Ampel aus dem Feed.
- **Steckerdaten:** Wenn Wikidata zu lückenhaft ist, ist eine von Hand gepflegte Tabelle (`data/strom.csv`, Quelle Wikipedia CC BY-SA) die ehrliche Lösung.

## 3. Details

### 3.1 Stecker, Spannung, Frequenz

- **IEC World Plugs.** Die Wikipedia-Seite „Mains electricity by country“ nennt IEC World Plugs als „primary source of data“ und schreibt, die Anleitung sei dort „no longer available“, nachdem die IEC sie eingestellt habe (Wikipedia, gelesen 25.10.2026, https://en.wikipedia.org/wiki/Mains_electricity_by_country). Die alte Seite von 2018 hat eine Länderliste mit Typ, Spannung und Frequenz, aber keinen Urheberrechts- oder Lizenzhinweis; nur den Hinweis, ältere Steckdosen könnten noch vorkommen (Wayback, 19.08.2018: https://webcf.waybackmachine.org/web/20180819205425/http://www.iec.ch/worldplugs). `iec.ch/world-plugs` war nicht abrufbar. **Lizenz: nicht geprüft. Keine freie Lizenz belegt. Nicht verwenden.**
- **Wikidata.** Bestätigt: P2853 = electrical plug type, P2884 = mains voltage, P1622 = driving side, P38 = currency (Wikidata `MediaWiki:Wikibase-SortedProperties`, gelesen: https://m.wikidata.org/wiki/MediaWiki:Wikibase-SortedProperties). P2852 = emergency phone number (Titel des Suchtreffers https://www.wikidata.org/wiki/Property:P2852).
- **P2885 für Frequenz: nicht bestätigt.** Die Seite `SortedProperties` nennt P2885 nicht. Ein Suchtreffer zeigt „utility frequency“ als Item (Q1361387) und die allgemeine Eigenschaft P2144 „frequency“. Ob die Frequenz als Zusatz (Qualifier) an P2884 hängt, ist **nicht geprüft**. Im Abdeckungstest die Statements eines Landes ansehen, bevor die Abfrage fest wird.
- **Lizenz Wikidata:** „All structured data in the main, property and lexeme namespaces is made available under the Creative Commons CC0 License.“ (https://www.wikidata.org/wiki/Wikidata:Licensing, gelesen). Die Seite sagt nicht, ob Namensnennung nötig ist; CC0 gilt als Public-Domain-Widmung. Mit MPL-2.0 vereinbar (keine Bedingungen). Trotzdem Quelle nennen (Fasan-Regel).
- **Zugang:** SPARQL-Endpunkt `query.wikidata.org/sparql`; Einzel-Items per `Special:EntityData/Qxxx.json`; Dumps. Regeln: gute `User-Agent`-Kennung, nicht zu viele Anfragen gleichzeitig, bei 429 pausieren, niedrigste sinnvolle Zeitüberschreitung (https://www.wikidata.org/wiki/Wikidata:Data_access, gelesen).
- **Beispielabfrage, nicht getestet** (Q3624078 = souveräner Staat und P297 = ISO-3166-1-Alpha-2 aus meinem Gedächtnis, nicht geprüft):
  ```sparql
  SELECT ?iso2 ?plugLabel ?volt WHERE {
    ?c wdt:P31 wd:Q3624078 ; wdt:P297 ?iso2 .
    OPTIONAL { ?c wdt:P2853 ?plug }
    OPTIONAL { ?c wdt:P2884 ?volt }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
  }
  ```
- **Wikipedia-Tabelle als Gegenprüfung.** Quelle der Tabelle laut Seite: IEC World Plugs, IEC 60038 (Spannungen), IEC TR 60083 (Steckerblätter), dazu nationale Normen und WorldStandards.eu. Die gelesene Fassung enthält keinen Lizenzvermerk; Wikipedia-Text ist sonst CC BY-SA (nicht für diese Seite geprüft).
- **Nicht verwenden:** Die US-Handelsbehörden-Tabelle „Electric Current Abroad“ (https://legacy.trade.gov/mas/ian/ECW/all.html) hat Spalten für Strom, Frequenz, Spannung, Steckertypen, aber keine Quelle, kein Datum, keine Lizenz und viele leere Felder (gelesen). WorldStandards.eu: Lizenz nicht geprüft.
- **Rechenlogik auf dem Handy:** Ob Typ C in eine E/F-Steckdose passt, ist eine Verträglichkeitstabelle, die ich hier **nicht belegen konnte**. Sie braucht eine eigene Quelle, bevor die App „kein Adapter nötig“ sagt. Bei 230 V gegen 120 V: Hinweis „Gerät muss für beide Spannungen ausgelegt sein“ (Typenschild).

### 3.2 Währung und Wechselkurse

- **Zuordnung Land → Währung:** Wikidata P38 (CC0) oder CLDR `supplemental/currencyData.json` (Land → Währungen mit Zeiträumen; Dateistruktur aus meiner Kenntnis, **nicht geprüft**).
- **CLDR-Version:** Das npm-Paket `cldr-core` steht laut libraries.io auf 49.0.0 vom 22.10.2026, Repository https://github.com/unicode-org/cldr-json (gelesen, https://libraries.io/npm/cldr-core). Dort steht als Lizenz „Unicode-TOU“. Das passt nicht zur Unicode-FAQ („Most Unicode data files and software are released under the Unicode License“). **Im Bauprozess die `LICENSE`-Datei von `cldr-json` lesen** und den dort stehenden Text übernehmen.
- **Unicode License v3 (SPDX `Unicode-3.0`):** „a free and open-source license“, OSI-geprüft, „very closely based on the highly permissive MIT License“ (https://unicode.org/faq/unicode_license.html, gelesen). Bedingung: der Urheberrechts- und Erlaubnishinweis muss „with all copies of the Data Files or Software“ erscheinen (https://www.unicode.org/license.txt, gelesen; die weiteren Alternativen der Bedingung nicht gelesen). Hinweis: „Copyright © 1991-2026 Unicode, Inc.“ In `THIRD-PARTY-NOTICES` oder im Impressum der App aufnehmen. Mit MPL-2.0 vereinbar (permissiv, meine Einschätzung).
- **EZB-Referenzkurse** (https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html, gelesen 25.10.2026):
  - Aktualisierung „around 16:00 CET“ an Arbeitstagen, nicht an TARGET-Feiertagen.
  - „published for information purposes only“; „Using the rates for transaction purposes is strongly discouraged.“
  - 29 Währungen in der Tabelle. Der russische Rubel ist ausgesetzt. Ob die Zielländer der Gruppe abgedeckt sind: **nicht geprüft**.
  - Formate: PDF, CSV (.zip), XML, XML (SDMX-ML), RSS. Kein JSON.
  - URLs: `https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml` und `…/eurofxref-hist.xml` (auf der Seite hängt ein Zufallsparameter dran, der nur ein Cache-Schlüssel scheint; nicht geprüft).
  - **Nutzungsbedingungen** (https://www.ecb.europa.eu/home/disclaimer/html/index.en.html, gelesen): Urheberrecht EZB. Kostenlose Nutzung unter Bedingungen. „the ECB must be cited as the source“. Wer Informationen ändert, muss das „explicitly“ angeben. Keine CC-Lizenz genannt; allgemeine kommerzielle Nutzung wird nicht ausdrücklich geregelt. Haftung der EZB ausgeschlossen. Namensnennung in der App: „Quelle: Europäische Zentralbank, Euro-Referenzkurse, Stand TT.MM.JJJJ“.
  - Für die App: Kurse im Bauprozess holen, mit Stand anzeigen, als „Richtwert“ beschriften. Weitere Währungen (außerhalb der 29): **nicht recherchiert**.

### 3.3 Notrufnummern

- **Wikidata P2852** (CC0). Suchtreffer-Titel wie „112 – Wikidata“ (Q1061257), „90000“, „03“, „11“ deuten darauf, dass Nummern als Items modelliert sind. Das ist ein Hinweis, **nicht geprüft**. Ob Polizei, Rettung und Feuerwehr getrennt als Zusatz stehen, ist **nicht geprüft**.
- **EU 112:** „112 is the only number you can use to access the emergency services in all EU countries“, kostenlos. „In some EU countries, national emergency numbers are still in use together with 112.“ Es gibt keine Liste, nur Länder-Suchlinks (https://europa.eu/youreurope/citizens/travel/security-and-emergencies/emergency/index_en.htm, geprüft 22.06.2026 laut Seite). Nur diese Länder nutzen laut Kommission 112 als einzige nationale Nummer: Dänemark, Estland, Finnland, Malta, Niederlande, Portugal, Rumänien, Schweden. 112 wird auch außerhalb der EU genutzt, zum Beispiel Schweiz und Südafrika, und funktioniere „worldwide on GSM mobile networks“ (https://digital-strategy.ec.europa.eu/en/policies/112, gelesen, ohne Datum). Keine Lizenzangabe auf beiden Seiten.
- **Wikipedia „List of emergency telephone numbers“** hat Spalten Polizei, Rettung, Feuer je Land. Quellen laut Seite: ITU-T E.129, Regierungsseiten, EENA, Lonely Planet, US-Botschaft, CIA World Factbook. Kein Lizenzvermerk im gelesenen Text (https://en.wikipedia.org/wiki/List_of_emergency_telephone_numbers). Als Gegenprüfung brauchbar, nicht als Datenquelle (Fließtabelle).
- **Empfehlung:** P2852 holen, gegen Wikipedia-Liste stichprobenartig prüfen. In der App immer zuerst „112“ nennen, wo die Kommission das belegt. Sonst die Nummer aus der Quelle mit „Stand“. Ohne Wert: „keine Angabe“.

### 3.4 Zeitzonen (IANA tzdb)

- Aktuelles Release **2026d vom 11.09.2026** (https://www.iana.org/time-zones/releases/2026d, gelesen). Es gab 2026 mindestens die Releases a, c und d. Änderung in 2026d: Nordwest-Territorien (Kanada) bleiben ab 21.08.2026 ganzjährig auf UTC−6. → Regeln ändern sich kurzfristig. Bauprozess: wöchentlich prüfen.
- Download nur Daten: `https://data.iana.org/time-zones/releases/tzdata2026d.tar.gz` (468,2 KB); Code: `tzcode2026d.tar.gz`.
- **Lizenz:** Die IANA-Seite nennt keine Lizenz. Die tz-README (Kopie in der Rust-Bibliothek `time-tz`, Version unbekannt) sagt: „This file is in the public domain, so clarified as of 2009-05-17 by Arthur David Olson.“ und „The other files in this distribution are either public domain or BSD licensed; see the file LICENSE for details.“ (https://docs.rs/crate/time-tz/latest/source/tz/README, gelesen). **Die aktuelle `LICENSE` der Version 2026d nicht gelesen.** Für nur Daten (Zonen- und Länderdateien) ist Public Domain die belegte Aussage.
- Land → Zonen steht in den Dateien `zone1970.tab`, `zone.tab` und `iso3166.tab` (Dateinamen aus dem Titel einer tz-Mailinglisten-Diskussion, https://lists.iana.org/hyperkitty/list/tz@iana.org/thread/5FLLS2XXHEAO22HPQJXBVKKSJR3F44CG/; **Format und Unterschiede nicht gelesen**).
- **Grenze:** Ein Land hat oft mehrere Zonen. „Zeitunterschied zu Hause“ gilt darum nur für die gewählte Stadt. Die App rechnet die Uhrzeit mit der IANA-Kennung auf dem Handy (Browser-Zeitzonendaten; deren Aktualität je Gerät ist **nicht geprüft**).

### 3.5 Sprachen und Grußformeln

- **Sprachen je Land:** CLDR `supplemental/territoryInfo.json` mit Sprachanteilen und Amtsstatus (Struktur aus meiner Kenntnis, **nicht geprüft**). Lizenz siehe 3.2.
- **Grußformeln:** nach meiner Kenntnis nicht in CLDR (**nicht geprüft**). Wikivoyage-Phrasebooks sind die genannte Quelle.
- **Wikivoyage:** Lizenz „Creative Commons Attribution-ShareAlike“, Infobox nennt CC BY-SA 4.0 (https://en.wikipedia.org/wiki/Wikivoyage, gelesen). Das Wikivoyage-FAQ von 2021 nennt nur „Creative Commons by-sa“ ohne Version (Wayback 11.10.2021). 27 aktive Sprachversionen, 146.747 Artikel (Stand August 2026 laut Wikipedia). Phrasebooks gibt es laut Artikel. Wöchentliche Archive (Dumps) werden bereitgestellt.
- **API:** Die MediaWiki-Seite „API:Licensing“ (https://www.mediawiki.org/wiki/API:Licensing, gelesen) sagt: Über die API geholte Inhalte tragen in der Regel die Lizenz des Wikis. Man solle „properly provide credit“. Die Lizenz stehe in `siteinfo → rightsinfo`; sie könne je Seite oder Bereich abweichen. Meine Abfrage-Muster: `…/w/api.php?action=parse&page=Portuguese_phrasebook&prop=sections|text&format=json` und `action=query&meta=siteinfo&siprop=rightsinfo`. **Nicht getestet** (Wikivoyage vom Proxy blockiert).
- **Grenze:** Phrasebooks sind Wikitext in Listen; ein sauberes „Hallo, Danke, Bitte“ je Sprache braucht Parsen und Handprüfung. Besser: pro Sprache eine kleine, geprüfte Liste (3–8 Wörter) mit Quelle „Wikivoyage, Artikel, Version (revid)“. Das ist Bearbeitung und bleibt CC BY-SA.

### 3.6 Reise- und Sicherheitshinweise

**Auswärtiges Amt (Herkunft Deutschland)**

- Basis `https://www.auswaertiges-amt.de/opendata/` (Dokumentation: https://www.auswaertiges-amt.de/de/service/opendata/2412916-2412916, gelesen). Alle Endpunkte per GET, ohne Schlüssel (laut Paket-Seite https://pypi.org/project/de-travelwarning/, gelesen):

| Endpunkt | Inhalt |
|---|---|
| `/travelwarning` | Liste aller Reise- und Sicherheitshinweise |
| `/travelwarning/{contentId}` | ein Hinweis mit Inhalt |
| `/healthcare` | Merkblätter des Gesundheitsdienstes (Reisevorsorge); Typ „Publikation“ oder „Artikel“ |
| `/representativesInCountry` | deutsche Vertretungen im Ausland |
| `/representativesInGermany` | ausländische Vertretungen in Deutschland |
| `/stateNames` | Staatennamen in vier Sprachen |

- **Aufbau der Liste** (live gelesen 25.10.2026, https://www.auswaertiges-amt.de/opendata/travelwarning): Schlüssel `response` mit `lastModified` (Unix-Zeit), 200 Länderobjekte (Schlüssel = ID) und `contentList` (200 IDs). Je Land: `lastModified`, `effective`, `title`, `countryCode`, `iso3CountryCode`, `countryName`, `warning`, `partialWarning`, `situationWarning`, `situationPartWarning`. Beispiel Schweden (ID 210708): zuletzt geändert 13.10.2026. Neueste Änderung im Feed: Irak (ID 202738), 23.10.2026 16:22 UTC. Seit Version 1.2.5 (08.12.2021) steht `content` nicht mehr in der Liste, sondern nur im Einzel-Endpunkt (Paket-Seite). Den Einzel-Endpunkt konnte ich nicht lesen (nicht freigegeben), also **Feld `content` und sein Aufbau: nicht geprüft**.
- **Nutzungsbedingungen** (https://www.auswaertiges-amt.de/de/service/opendata/open-data-schnittstelle-736118, gelesen; Artikeldatum 27.08.2026; Wortlaut nur sinngemäß, WebFetch zitiert höchstens 125 Zeichen):
  - Keine CC- oder Datenlizenz benannt. Es sind Bedingungen: „Die entsprechenden Informationen werden jeweils komplett übernommen und über die Schnittstelle stets aktuell gehalten.“
  - Die Herkunft vom Auswärtigen Amt muss klar erkennbar sein.
  - Das AA pflegt die Inhalte sorgfältig, übernimmt aber keine Gewähr für Richtigkeit.
  - Wer Inhalte verändert, unvollständig, veraltet oder verzerrend darstellt, haftet selbst.
  - Das AA kann die Nutzung untersagen (auch bei Gefahr für das Ansehen).
  - **KI-Regeln (neu 27.08.2026):** KI-Dienste dürfen gezielt zum Originaltext führen. Wer Inhalte per KI zusammenfasst oder aufbereitet, haftet selbst für Verfälschungen und Folgen. Es braucht einen Warnhinweis und die ausdrückliche Empfehlung, den Originaltext zu lesen.
  - **Anmeldung:** Die Dokumentation gibt es über das Kontaktformular `www.diplo.de/kontakt` mit Angabe der Anwendung und Anerkennung der Bedingungen. Danach kommt man in einen Verteiler für Schnittstellenänderungen.
- **Was heißt das für Fasan?** (a) Anmeldung nötig → das muss der Nutzer tun. (b) „Komplett und aktuell“ passt schlecht zu Auszügen und zu Offline-Kopien. Lösung: Hinweis komplett und mit „Stand“ zeigen, Link zum Original, Warnzeile, Aktualisierung bei Netz. (c) Keine freie Lizenz → mit der FOSS-Haltung abwägen. (d) Eigene Zusammenfassungen durch Claude sind laut Bedingungen ausdrücklich mit Warnhinweis verbunden; am besten gar nicht zusammenfassen.
- **„Medizinische Hinweise“ und „Rechtliche Besonderheiten“?** Antwort für die **Webseite** (Portugal, Stand 24.10.2026, „Unverändert gültig seit 29.07.2026“, https://www.auswaertiges-amt.de/de/reiseundsicherheit/portugalsicherheit/210900, gelesen):
  - Gliederung: Info; Aktuelles; Sicherheit (Terrorismus, Kriminalität); Natur und Klima; **Reiseinfos** (Infrastruktur/Verkehr, Maut, Führerschein, LGBTIQ, **Rechtliche Besonderheiten**, Geld/Kreditkarten); **Einreise und Zoll** (Reisedokumente, Minderjährige, Einfuhrbestimmungen, Tiere); **Gesundheit** (Impfschutz, Medizinische Versorgung, bei Portugal auch Denguefieber); Länderinfos; Weitere Hinweise (Weltweiter Sicherheitshinweis, Krisenvorsorgeliste, Haftungsausschluss, Reisekrankenversicherung, „Reisemedizinische Hinweise“ …).
  - „Rechtliche Besonderheiten“ gibt es mit genau diesem Namen. Einen Abschnitt „Medizinische Hinweise“ gibt es **nicht** unter diesem Namen; die Inhalte stehen unter „Gesundheit“ und „Reisemedizinische Hinweise“. Die Merkblätter liegen zusätzlich im Endpunkt `/healthcare`.
  - **Ob das Feld `content` der API dieselben Abschnittsnamen hat: nicht geprüft.** Die Dokumentationsseite beschreibt die Inhalte nur als „Reise- und Sicherheitshinweise“, nicht als Abschnittsliste. Für Einreise und Visa nennt die Dokumentation keine eigene Kategorie; „Reisedokumente“ steht auf der Länderseite.
- **Aktualisierung:** Kein fester Rhythmus genannt, die Informationen sollen „stets aktuell“ sein. Zwei Stichproben im Feed: 13.10. und 23.10.2026.

**Andere Herkunftsländer**

- **Vereinigtes Königreich (FCDO): ja.** GOV.UK Content API, Basis `https://www.gov.uk/api/content` (https://www.api.gov.uk/gds/gov-uk-content/, gelesen; Dokumentation https://content-api.publishing.service.gov.uk/). Der Pfad ist der Seitenpfad. Für Portugal ist die Seite `https://www.gov.uk/foreign-travel-advice/portugal`, also wäre der API-Pfad `…/api/content/foreign-travel-advice/portugal` (**Schluss von mir, nicht getestet**).
  - Lizenz: „All content is available under the Open Government Licence v3.0, except where otherwise stated“, dazu „© Crown copyright“ (https://www.gov.uk/help/reuse-govuk-content, gelesen). Namensnennung: die OGL v3.0 verlangt einen Quellenhinweis; deren Text habe ich nicht abgerufen (**nicht geprüft**).
  - Zugriff: Scraping ist erlaubt, wenn `robots.txt` beachtet wird; bei zu vielen Anfragen wird gedrosselt. Die Search API ist „unsupported“.
  - Struktur (Portugal, Seite „Health“): Warnings and insurance; Entry requirements; Safety and security; Health (Emergency medical number, Vaccine recommendations and health risks, Medication, Healthcare, Health insurance cards, Travel and mental health); Getting help. Metadaten dort: `public-updated-at` 2026-08-11, `updated-at` 2026-10-19. Nur Englisch. Ein Abschnitt „Local laws and customs“ stand auf der Health-Seite nicht (die Seite „Safety and security“ nicht gelesen).
  - Mit MPL-2.0 vereinbar (Daten getrennt halten, Hinweis zeigen; meine Einschätzung).
- **USA (State Department):** Die Seite `travel.state.gov/content/travel/en/rss.html` nennt im gelesenen Text keine RSS-Feeds; Updates per Anmeldung bei `step.state.gov`. Keine Reuse-Aussage gefunden. Es gibt Scraper-Aktoren bei Apify (Suchtreffer), was auf keine offizielle API hindeutet. **Offizielle API: nicht gefunden. Lizenz: nicht geprüft.** (US-Bundesbehörden-Werke sind nach meiner Kenntnis gemeinfrei, Drittinhalte ausgenommen; nicht geprüft.)
- **Österreich (BMEIA):** `oesterreich.gv.at` nennt als Quelle das BMEIA und erwähnt weder Schnittstelle noch Open Data noch RSS. Seit 01.10.2025 gibt es ein Ampelsystem mit vier Stufen statt sechs; das Ministerium sagt, Texte würden „eins zu eins“ übernommen (vienna.at, 25.09.2025). Eine Schnittstelle erwähnt der Artikel nicht. **Schnittstelle: nicht gefunden.**
- **Schweiz (EDA):** Keine Schnittstelle in den Suchtreffern gefunden (Suche mit opendata.swiss-Bezug). **Nicht gefunden, nicht erschöpfend geprüft.**
- **Folge für die App:** Maschinenlesbare amtliche Hinweise nur für DE und GB. Für alle anderen Herkunftsländer: Link auf die amtliche Seite des Herkunftslandes (Wortlaut nicht kopieren) und neutrale Daten aus 3.1–3.5.

### 3.7 Trinkwasser (ehrlich bewertet)

**Ergebnis: Es gibt keine belastbare, offen lizenzierte Länderangabe „Leitungswasser trinkbar: ja/nein“.** Was ich fand:

- **WHO/UNICEF JMP, Indikator „sicher bewirtschaftetes Trinkwasser“ (SDG 6.1.1).** Definition laut WHO-Portal: Anteil der Menschen, die aus einer verbesserten Quelle trinken, die „accessible on premises, available when needed and free from faecal and priority chemical contamination“ ist. Datenquellen: Volkszählungen, Haushaltsbefragungen, Verwaltungsdaten. 196 Länder und Gebiete. **Auf der gelesenen Portalseite: letztes Jahr 2019, letzte Aktualisierung 08.01.2024.** Lizenz dort: „Attribution 4.0 International (CC BY 4.0)“ mit zusätzlichen WHO-Bedingungen; CSV und API (https://data.who.int/indicators/i/5131A52/1548EA3, gelesen). washdata.org zeigt „JMP 2025 progress update on WASH in households“; die Lizenz stand auf der Startseite nicht (https://washdata.org/, gelesen). Ich habe die Downloads-Seite nicht lesen können.
- **Warum das keine Trinkwasser-Angabe ist:** Es ist ein Bevölkerungsanteil im Landesdurchschnitt. Es sagt nichts über das Hotelwasser in Lissabon. (Eine Aufteilung nach Stadt/Land gibt es bei JMP nach meiner Kenntnis, **nicht geprüft**.)
- **CDC Travelers’ Health / Yellow Book:** Keine Länderliste. Die Seite „Food and Water Precautions for Travelers“ beschreibt Bedingungen, rät, Leitungswasser zu meiden, wenn man nicht „reasonably certain the water is safe“ ist, und warnt vor Eis. Zuletzt geprüft 23.04.2025; Metadaten „zuletzt veröffentlicht 2026-07-21“ (https://www.cdc.gov/yellow-book/hcp/preparing-international-travelers/food-and-water-precautions-for-travelers.html, gelesen). Eine Reuse-Aussage stand nicht im gelesenen Text. Länderseiten des Yellow Book gibt es (Mexiko, China als Suchtreffer); ob sie Wasserhinweise enthalten, habe ich **nicht geprüft**.
- **Empfehlung:** Keine Ja/Nein-Anzeige je Land. Stattdessen: (1) allgemeiner Hinweis mit Quelle, (2) Trinkwasser-Stellen aus OSM (`amenity=drinking_water`, in der App schon vorhanden), (3) für einzelne Städte von Hand geprüfte Angaben mit Beleg. EU-Rechtslage zur Leitungswasserqualität: **nicht recherchiert**.

### 3.8 Feiertage

- **Nager.Date** (https://github.com/nager/Nager.Date, gelesen): Code unter MIT. „over 200 countries“. Die Community-API steht jetzt unter `nagerholidays.com`, Beispiel `https://nagerholidays.com/api/v3/publicholidays/2022/US`; Dokumentation `nagerholidays.com/scalar/#community-api-v4`. Die README-Tabelle: „Community – WebApi v4“ Release 2026-06-30, „WebApi v3“ 2021-05-18. `date.nager.at` (die Domain, die in der Anfrage stand) kommt in der README nicht vor.
- **Offene Punkte:** Die README nennt **keine Datenquelle** der Feiertage, **keine Datenlizenz**, **keine Rate-Limits**, keine Regelung kommerzieller Nutzung. Die Offline-Varianten (Docker, NuGet) brauchen laut README einen Lizenzschlüssel, den Sponsoren erhalten. MIT gilt für den Code, nicht belegt für die Daten. → Nutzung im Bauprozess (einmal je Land und Jahr, wenige Hundert Anfragen) ist technisch einfach, **rechtlich nicht geklärt**. Nachfrage beim Projekt oder zweite Quelle.
- **Gegenprüfung für Heimatland und Ziel:** amtliche Seiten (Beispiel UK: Bank Holidays API von GOV.UK, nur England/Wales, Schottland, Nordirland, https://www.gov.uk/help/reuse-govuk-content). Wikidata-Feiertage: **nicht geprüft**. Andere Kandidaten **nicht geprüft** und nicht recherchiert: OpenHolidays API, Bibliotheken `python-holidays` und `date-holidays`.
- **Grenze:** Regionale Feiertage (Bundesländer, Städte) und bewegliche Feiertage nach Mondkalender hängen an der Datenqualität; nicht geprüft.

### 3.9 Einreise und Visa

- **passport-index-dataset** (https://github.com/ilyankou/passport-index-dataset, gelesen): Lizenz **MIT** (Datei `LICENSE`, Text nicht gelesen). Datenquelle: Passport Index (passportindex.org), „built with publicly available information“. **Archiviert, zuletzt aktualisiert am 12.01.2025.** Neuere Daten ab Februar 2026 sollen im Repo `imorte/passport-index-data` liegen; das habe ich **nicht lesen können** (Lizenz, Rhythmus, Quelle nicht geprüft). Dateien: Matrix und „tidy“ in drei Kodierungen (Name, ISO2, ISO3). Werte: Zahl 7–360 (visumfreie Tage), `visa free`, `visa on arrival`, `e-visa`, `eta` (neu seit 12.01.2025), `visa required`, `no admission`, `-1` (gleiches Land). 311 Sterne, 91 Forks, 103 Commits. Keine Haftungsklausel auf der Seite.
- **Grenzen, klar:**
  - Nicht amtlich. Kein Datum je Eintrag. Die MIT-Lizenz gilt für die Zusammenstellung; ob die Daten selbst Rechte Dritter berühren (Passport Index gehört nach meiner Kenntnis einem kommerziellen Anbieter), ist **nicht geprüft**.
  - Es fehlen: Passgültigkeit (zum Beispiel „sechs Monate über die Einreise hinaus“), Transit, Aufenthaltszweck, Impfnachweise, Rückreise-Ticket, Mindestbetrag, Kinder. Bei `eta` und `e-visa` Gebühr und Frist.
  - Für Deutsche in der EU ist der Fall anders (Freizügigkeit); der Datensatz nennt dafür `visa free` ohne Tage (README).
- **Amtlich:** Länderseite des AA, Abschnitt „Einreise und Zoll → Reisedokumente“ (bei Portugal gelesen). Für Briten FCDO „Entry requirements“. Für alle anderen: Link zur amtlichen Seite des Herkunftslandes.
- **Empfehlung:** Visa-Feld nur als Orientierung mit Hinweis „kein amtlicher Stand, vor Reise bei der Behörde prüfen“, Quelle und Datenstand sichtbar. Zusatz-Textzeile aus der amtlichen Quelle, wo es sie gibt. IATA Timatic ist nach meiner Kenntnis proprietär (nicht geprüft). Wikipedia-Listen „Visa requirements for … citizens“: **nicht geprüft**.

### 3.10 Linksverkehr/Rechtsverkehr

- Wikidata **P1622 „driving side“** (ID bestätigt über `SortedProperties`). Die Diskussionsseite (`Property_talk:P1622`) und die Werte-Items konnte ich nicht lesen. Das Klassen-Item „right- and left-hand traffic“ ist Q220656 (Titel eines Suchtreffers). Welche Items für „links“ und „rechts“ stehen: **nicht geprüft**. CC0 wie in 3.1. Abdeckung nicht gemessen.
- Gegenprüfung: Wikipedia-Liste (nicht gelesen). Für jedes Land ohne Wert: „keine Angabe“.

### 3.11 Stadtwissen aus Wikivoyage

- Lizenz und API wie in 3.5. Namensnennung: Titel des Artikels mit Link, „Wikivoyage-Autoren“ mit Link auf die Versionsgeschichte, Lizenz mit Link. Wer Auszüge kürzt oder zusammenfasst, bearbeitet; das Ergebnis bleibt unter CC BY-SA. Die Textdateien deshalb getrennt vom MPL-2.0-Code halten und mit Lizenzkopf kennzeichnen (MPL-2.0 steht nicht auf der mir bekannten Kompatibilitätsliste von CC BY-SA; **nicht geprüft**).
- **Abschnitte:** In Englisch heißen sie nach meiner Kenntnis „Understand“, „Stay safe“, „Stay healthy“, „Respect“, in anderen Sprachen anders. **Namen je Sprache nicht geprüft.** Die API liefert die Abschnittsliste (`action=parse&prop=sections`), die Auswahl läuft über Namen oder Indizes; die Namen müssen im Abdeckungstest geprüft werden.
- **Pflichtfelder je Auszug:** `revid` (Version), Abrufdatum, Sprache, Artikeltitel. So lässt sich ein veralteter Auszug erkennen.
- Qualität schwankt je Ort und Sprache. Für Lissabon, Venedig und andere Fasan-Ziele Stichprobe von Hand, bevor automatisch angezeigt wird.

### 3.12 Badestellen und Wasserqualität (EU)

- Datensatzseite „Bathing Water Directive – Status of bathing water“ (Prod-ID DAT-17-en), EEA/TC Vode (https://www.eea.europa.eu/data-and-maps/data/bathing-water-directive-status-of-bathing-water-7 und https://www.eea.europa.eu/en/datahub/datahubitem-view/c3858959-90da-4c1b-b9ca-492db0e514df, gelesen):
  - Datensatz 2025 (v1.0), **veröffentlicht 02.06.2026**; Seite zuletzt geändert 25.09.2026. Zeitraum 1990–2025. Badesaison Mai bis September.
  - Formate: Excel (.xls, .xlsx). **Keine API, kein WMS/WFS, kein Discodata-Link auf der Seite.** Zusätzlich eine interaktive Karte.
  - **Lizenz: auf beiden Seiten nicht genannt;** es gibt einen Link zur „EEA data policy“, deren Text ich nicht gelesen habe. (Nach meiner Kenntnis nutzt die EEA CC BY 4.0; **nicht geprüft**.)
  - Länder, Zahl der Badestellen, Spaltennamen (Koordinaten, Klasse): **nicht gelesen**.
- **Grenze:** Das ist eine Bewertung über die Saison(en), nicht die Wasserqualität heute. Wie die Klassen („ausgezeichnet“, „gut“ …) gebildet werden, habe ich nicht gelesen (**nicht geprüft**). Tagesaktuelle Werte liegen bei nationalen Stellen (Portugal, Italien usw.); **nicht recherchiert**.
- **Bauprozess:** Excel von der Datensatzseite laden (Direktlink beim Testlauf aus der Seite lesen), mit Python in JSON wandeln, nur Name, Koordinate, Klasse, Jahr behalten, mit Jahr und Stand anzeigen.

## 4. Quellen und Hinweise für die Lizenzseite der App

| Quelle | Pflichttext/Hinweis in der App |
|---|---|
| Wikidata | „Daten: Wikidata (CC0)“, Abrufdatum |
| Wikipedia/Wikivoyage | Artikel, Autoren (Versionsgeschichte), CC BY-SA, Änderungen kenntlich machen |
| CLDR | „Copyright © 1991-2026 Unicode, Inc.“ plus Lizenztext (Unicode License v3) |
| IANA tzdb | Public Domain (Hinweis freiwillig) |
| EZB | „Quelle: Europäische Zentralbank“, Änderungen nennen |
| Auswärtiges Amt | Herkunft klar erkennbar, vollständig, mit Stand, Warnhinweis, Link zum Original |
| GOV.UK (FCDO) | „Contains public sector information licensed under the Open Government Licence v3.0“ (Text aus OGL v3.0, **nicht abgerufen**) |
| WHO-Portal (JMP) | CC BY 4.0 plus WHO-Bedingungen, Quelle, Jahr |
| EEA | je nach „EEA data policy“, **zu klären** |

## 5. Nächste Schritte (alle ungeprüft, erst in GitHub Actions möglich)

1. Abdeckungstest Wikidata: Zahl der Länder mit P2853, P2884, P38, P2852, P1622; Statement-Aufbau von Frequenz prüfen.
2. AA: Formular `diplo.de/kontakt` ausfüllen; `/travelwarning/{id}` abrufen und `content` auf Abschnittsnamen prüfen (Gesundheit, Rechtliche Besonderheiten, Einreise).
3. Nager.Date: Datenquelle und Datenlizenz beim Projekt erfragen; Gegenprobe für zehn Länder.
4. `imorte/passport-index-data`: Lizenz, Quelle, Rhythmus lesen.
5. EEA: „EEA data policy“ lesen, Direktlink des Excels, Länder und Spalten.
6. CLDR `LICENSE` in `cldr-json` lesen; tz `LICENSE` der Version 2026d lesen.
7. Wikivoyage: Abschnittsnamen je Sprache (de, en, pt, it) prüfen; Wikimedia-`User-Agent`-Regeln lesen.

## 6. Gelesene Quellen (Abruf 25.10.2026)

- AA: https://www.auswaertiges-amt.de/de/service/opendata/open-data-schnittstelle-736118, https://www.auswaertiges-amt.de/de/service/opendata/2412916-2412916, https://www.auswaertiges-amt.de/opendata/travelwarning, https://www.auswaertiges-amt.de/de/reiseundsicherheit/portugalsicherheit/210900, https://www.auswaertiges-amt.de/de/service/fragenkatalog-node/02-medizinischehinweise/606386, https://pypi.org/project/de-travelwarning/
- Wikidata: https://www.wikidata.org/wiki/Wikidata:Licensing, https://www.wikidata.org/wiki/Wikidata:Data_access, https://m.wikidata.org/wiki/MediaWiki:Wikibase-SortedProperties, https://www.wikidata.org/wiki/Wikidata:Wikivoyage/Resources
- Wikipedia: https://en.wikipedia.org/wiki/Mains_electricity_by_country, https://en.wikipedia.org/wiki/List_of_emergency_telephone_numbers, https://en.wikipedia.org/wiki/Wikivoyage
- MediaWiki: https://www.mediawiki.org/wiki/API:Licensing; Wikivoyage-FAQ (Wayback 11.10.2021): https://webcf.waybackmachine.org/web/20211011120226/https://en.wikivoyage.org/wiki/Wikivoyage:FAQ
- IEC (Wayback 19.08.2018): https://webcf.waybackmachine.org/web/20180819205425/http://www.iec.ch/worldplugs; US-Tabelle: https://legacy.trade.gov/mas/ian/ECW/all.html
- ECB: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html, https://www.ecb.europa.eu/home/disclaimer/html/index.en.html
- Unicode/CLDR: https://unicode.org/faq/unicode_license.html, https://www.unicode.org/license.txt, https://libraries.io/npm/cldr-core
- IANA: https://www.iana.org/time-zones/releases/2026d, https://docs.rs/crate/time-tz/latest/source/tz/README
- Nager.Date: https://github.com/nager/Nager.Date
- GOV.UK: https://www.gov.uk/help/reuse-govuk-content, https://www.api.gov.uk/gds/gov-uk-content/, https://www.gov.uk/foreign-travel-advice/portugal/health
- US/AT: https://travel.state.gov/content/travel/en/rss.html, https://www.oesterreich.gv.at/de/themen/reisen_und_freizeit/reisen-und-ferien/Seite.2960800, https://www.vienna.at/reiseinfo-system-umstellung-steht-vor-der-tuer/9695450
- Passport Index: https://github.com/ilyankou/passport-index-dataset
- Wasser: https://data.who.int/indicators/i/5131A52/1548EA3, https://washdata.org/, https://www.cdc.gov/yellow-book/hcp/preparing-international-travelers/food-and-water-precautions-for-travelers.html
- Notruf EU: https://europa.eu/youreurope/citizens/travel/security-and-emergencies/emergency/index_en.htm, https://digital-strategy.ec.europa.eu/en/policies/112
- EEA: https://www.eea.europa.eu/data-and-maps/data/bathing-water-directive-status-of-bathing-water-7, https://www.eea.europa.eu/en/datahub/datahubitem-view/c3858959-90da-4c1b-b9ca-492db0e514df

Nicht lesbar (abgelehnt oder gesperrt): `iec.ch/world-plugs`, `www.wikidata.org/wiki/Property:…` und Q-Items, `de.wikivoyage.org`, `unicode.org/reports/tr35`, `github.com/unicode-org/cldr-json`, `github.com/imorte/passport-index-data`, `auswaertiges-amt.de/opendata/travelwarning/{id}`, `kg.jstor.org` (robots).
