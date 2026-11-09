# Fahrplandaten Lisboa (GTFS) für „nächste Abfahrten“ offline

Recherche vom 24.10.2026. Frage: Wo gibt es offizielle, offen lizenzierte GTFS-Daten (statisch, wenn möglich Echtzeit) für Metro, Carris, CP Linha de Cascais und Transtejo/Soflusa?

Grenzen dieser Recherche:
- Etwa 35 Abrufe statt der geplanten ~30. Davon liefen etwa 12 ins Leere (nicht erlaubt, robots.txt, Weiterleitung oder abgelehnte Suche).
- Die Seiten von dados.gov.pt, carris.pt, gateway.carris.pt und carrismetropolitana.pt/open-data waren nicht abrufbar.
- Fast alle Angaben stammen deshalb von Seiten der Mobility Database (mobilitydatabase.org). Das ist ein Verzeichnis. Es ist keine Primärquelle des Betreibers.
- Die Download-URLs selbst konnte ich nicht testen. Der Sandbox-Proxy lieferte 403 für gateway.carris.pt, metrolisboa.pt und api.carrismetropolitana.pt (24.10.2026).

## 1. Kurzfassung

1. Für Metro, Carris und CP nennt die Mobility Database einen GTFS-Feed, gültig über 24.–26.10.2026. Für Transtejo/Soflusa gibt es einen Feed (mdb-2921), aber URL und Gültigkeit habe ich nicht gefunden.
2. Die Lizenz ist die größte Lücke. Nur der alte, ersetzte Carris-Feed (v2.8) nennt CC0. Für die aktuellen Feeds nennt keine geprüfte Seite eine Lizenz.
3. Kein geprüfter Eintrag nennt einen API-Schlüssel oder eine Registrierung für die GTFS-Downloads. Direkt getestet habe ich das nicht.
4. Der Carris-Feed ist groß (45,7 MB gepackt, 151,7 MB entpackt). Für die Offline-Web-App sollte er vorab auf Haltestellen und Abfahrten reduziert werden. Straßenbahnen und Aufzüge sind nicht bestätigt (die Seite nennt „Bus, 176 Routen“).
5. Echtzeit: Für diese vier Betreiber habe ich keinen GTFS-Realtime-Feed gefunden. CORS ist nicht geprüft.

## 2. Tabelle

24.10.2026 ist ein Samstag, 25.10. Sonntag, 26.10. Montag. „Gültig“ ist der Datumsbereich, den die Mobility-Database-Seite für den neuesten Feed zeigt. Ob an den drei Tagen wirklich Fahrten im Feed stehen, habe ich nicht geprüft.

| Betreiber | GTFS-URL | Lizenz | Schlüssel nötig | Gültig bis / Stand | Größe | Quelle | Stand |
|---|---|---|---|---|---|---|---|
| Metro de Lisboa | https://www.metrolisboa.pt/google_transit/googleTransit.zip | Seite nennt keine. Nicht geprüft. | Seite nennt keinen. Nicht getestet. | Gültig 01.01.2026 bis 31.12.2026. Letzter gelisteter Download 01.05.2026. Deckt 24.–26.10.2026 ab. | 0,48 MB gepackt, 3,44 MB entpackt | https://mobilitydatabase.org/feeds/gtfs/tld-716 | Seite abgerufen 24.10.2026 |
| Carris (Stadt: Bus, evtl. Tram/Aufzüge) | https://gateway.carris.pt/gateway/gtfs/api/v2.11/GTFS | Seite nennt keine. Der alte Feed v2.8 nannte CC0 (siehe Datenqualität). Für v2.11 nicht bestätigt. | Seite nennt keinen. Nicht getestet. | Gültig 06.06.2026 bis 31.12.2026. Download 22.10.2026. Deckt 24.–26.10.2026 ab. | 45,71 MB gepackt, 151,69 MB entpackt | https://mobilitydatabase.org/feeds/gtfs/mdb-2929 | Seite abgerufen 24.10.2026 |
| CP (Linha de Cascais) | https://publico.cp.pt/gtfs/gtfs.zip | Seite nennt keine. Nicht geprüft. | Seite nennt keinen. Nicht getestet. | Gültig 14.12.2025 bis 12.12.2026. Download 23.10.2026. Deckt 24.–26.10.2026 ab. | 0,3 MB gepackt, 2,39 MB entpackt | https://mobilitydatabase.org/feeds/gtfs/mdb-2057 | Seite abgerufen 24.10.2026 |
| Transtejo/Soflusa (TTSL), Cais do Sodré – Cacilhas | Nicht ermittelt. Feed existiert als mdb-2921. | Nicht ermittelt. | Nicht ermittelt. | Nicht ermittelt. | Nicht ermittelt. | https://mobilitydatabase.org/feeds/gtfs/mdb-2921/map | Seite abgerufen 24.10.2026 |

Was die Seiten zum Inhalt sagen:
- **Metro:** Seite führt den Feed als „Official“, Validierung „No errors“ (Quelle: tld-716, 24.10.2026).
- **Carris:** Seite nennt „Carris GTFS Schedule feed, Bus, 176 routes“, 37 Orte in Portugal. Straßenbahnen (12E, 15E, 24E, 28E) und Aufzüge/Standseilbahnen sind auf der Seite nicht genannt. Nicht bestätigt (Quelle: mdb-2929, 24.10.2026).
- **CP:** Der Feed ist landesweit (343 Orte, 186 Bahn-Routen). Die Linha de Cascais wird auf der Seite nicht erwähnt. Nicht bestätigt (Quelle: mdb-2057, 24.10.2026).
- **TTSL:** Die Routenliste enthält „5_0 – Cacilhas – Cais do Sodré“. Außerdem Montijo, Seixal und Barreiro–Terreiro do Paço (Quelle: mdb-2921/map, 24.10.2026).

### Datenqualität und Fallstricke

- **Alter Carris-Feed ersetzt.** Der Eintrag mdb-1032 (URL …/api/v2.8/GTFS) trägt den Hinweis „replaced with a different producer URL“. Sein Zeitraum endete am 31.12.2025. Er nannte die Lizenz CC0 (http://opendefinition.org/licenses/cc-zero/). Quelle: https://mobilitydatabase.org/feeds/gtfs/mdb-1032, abgerufen 24.10.2026.
- **Versionsnummer in der Carris-URL.** Sie sprang von v2.8 auf v2.11. Folgerung: Die URL kann sich wieder ändern. Nicht fest verdrahten, regelmäßig prüfen.
- **Carris-Validierung.** Die Seite zeigt 1 Fehler im Bericht. Die Art des Fehlers habe ich nicht gelesen (Quelle: mdb-2929, 24.10.2026).
- **Metro-Historie uneinheitlich.** Ältere Einträge haben keinen Datumsbereich oder einen seltsamen (07.08.2023 bis 31.12.2031). Der neueste Feed ist sauber (Quelle: tld-716, 24.10.2026). Der letzte gelistete Download ist vom 01.05.2026. Ob Metro seitdem Änderungen veröffentlicht hat, ist offen.
- **Lizenz des CP-Feeds und des Metro-Feeds** steht nirgends auf den geprüften Seiten. Vor einer Veröffentlichung klären.
- **Größe.** Carris entpackt 151,7 MB. Folgerung: Im Browser nicht roh laden. Vorab (CI oder Skript) auf Haltestellen und Abfahrtszeiten reduzieren.
- **Sommerzeit-Ende.** Eigene Anmerkung, ohne Quelle aus dieser Recherche: Die Uhren werden vermutlich am Sonntag 25.10.2026 zurückgestellt (EU-Regel: letzter Sonntag im Oktober). Das betrifft Nachtfahrten nach Mitternacht. Beim Bau der Abfahrtsliste testen.

### Gefunden, aber nicht gefragt

- **Carris Metropolitana** ist der Vorortbetreiber, nicht die Stadt-Carris. Feed: https://api.carrismetropolitana.pt/gtfs. Gültig 01.01.2026 bis 30.06.2027, Download 23.10.2026, 74,62 MB gepackt, 930,24 MB entpackt, 2 Fehler. Lizenz: Die Seite verlinkt nur das GitHub-Repo https://github.com/carrismetropolitana/gtfs, ohne Lizenzname. Quelle: https://mobilitydatabase.org/feeds/gtfs/mdb-2027, abgerufen 24.10.2026.
- **TML (Transportes Metropolitanos de Lisboa).** Feed: https://go.tmlmobilidade.pt/hub/api/v1/plans/gtfs. Gültig 06.05.2020 bis 01.01.2030, Download 24.10.2026, 106,59 MB gepackt, 6 Fehler. Die Seite verlinkt AGPL-3.0 des Projekts. Das ist eine Software-Lizenz, keine Daten-Lizenz. Ob dieser Feed Metro, CP oder Carris enthält, ist nicht geprüft. Quelle: https://mobilitydatabase.org/feeds/gtfs/mdb-3412, abgerufen 24.10.2026.
- **Dataset „Informação sobre Transportes Públicos da Cidade de Lisboa – Carris“** gibt es auf dados.gov.pt: https://dados.gov.pt/pt/datasets/informacao-sobre-transportes-publicos-da-cidade-de-lisboa-carris/ (Titel aus Suchergebnis, 24.10.2026). Inhalt und Lizenz nicht lesbar (robots.txt sperrt den Abruf).

## 3. Echtzeit

- **Carris:** Die Mobility-Database-Seite listet nur einen Schedule-Feed, keinen GTFS-Realtime-Feed. Links zu GTFS-RT gibt es dort nicht (Quelle: mdb-2929, 24.10.2026). Das heißt nur: Dort ist keiner eingetragen. Ob Carris eine Echtzeit-Schnittstelle hat, ist offen.
- **Metro, CP, Transtejo/Soflusa:** Keine Echtzeit-Quelle gefunden. Nicht geprüft.
- **CORS:** Nicht geprüft, für keinen Endpunkt. Der Proxy dieser Sitzung blockiert die Hosts. Ohne Test gilt: Direkter Browserzugriff auf die GTFS-ZIPs ist nicht belegt. Folgerung: Die Daten im Build-Schritt holen und als eigene Dateien ausliefern. Das hängt aber von der Lizenz ab (siehe unten).
- **Folgerung für „nächste Abfahrten offline“:** Mit den statischen Feeds ist das möglich. Es zeigt dann Fahrplanzeiten, keine Verspätungen. Das sollte die App so beschriften.

## 4. Nicht geprüft

- **Lizenzen** der aktuellen Feeds von Carris (v2.11), Metro, CP, Transtejo/Soflusa. Pflicht vor jeder Weitergabe der Daten in der App. Quellen dafür: die Betreiber-Seiten und dados.gov.pt (nicht abrufbar).
- **Direkter Download** aller URLs, Dateikopfzeilen, Größen, ob ein Schlüssel nötig ist. Sandbox-Proxy lieferte 403.
- **Inhalt der Feeds:** ob Straßenbahnen 12E, 15E, 24E, 28E und die Aufzüge/Standseilbahnen im Carris-Feed stehen. Ob die Linha de Cascais im CP-Feed steht. Ob Cais do Sodré – Cacilhas im TTSL-Feed Fahrten für 24.–26.10.2026 hat.
- **Transtejo/Soflusa:** URL, Lizenz, Gültigkeit, Größe. Nächster Schritt: ttsl.pt oder die Mobility-Database-Hauptseite mdb-2921 (der Abruf war nicht erlaubt).
- **Offizielle Betreiber-Seiten:** metrolisboa.pt (Entwickler-Seite), carris.pt, cp.pt, ttsl.pt. Ich habe keine davon gelesen.
- **Echtzeit-Schnittstellen:** Spuren aus der Erinnerung, ohne Beleg: Metro de Lisboa und Carris könnten APIs mit Registrierung anbieten. Nicht geprüft, nicht als Fakt zu verwenden.
- **Fehler in den Validierungsberichten** (Carris 1, Carris Metropolitana 2, TML 6): Art und Schwere nicht gelesen.
- **Transitland (transit.land):** nicht abgefragt.
- **Carris Metropolitana:** Seite https://carrismetropolitana.pt/open-data (Weiterleitung von docs.carrismetropolitana.pt/open-data) nicht abrufbar. Lizenz, Schlüssel, Echtzeit-Endpunkte und CORS unbekannt.
