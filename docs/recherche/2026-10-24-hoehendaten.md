# Höhendaten und Höhenmeter für Fußwege in Lissabon

Stand: 24./25.10.2026. Frage: Welche Höhendaten und welches Rechenverfahren liefern für Fußwege in Lissabon belastbare Höhenmeter? Lizenz und Zugriff aus GitHub Actions müssen geklärt sein.

Schreibweise: **Beleg** = steht in der genannten Quelle. **Folgerung** = mein Schluss daraus. „nicht geprüft“ = nicht belegt.

---

## Kurzfassung

### Empfehlung (Folgerung)

1. **Höhenraster aus Copernicus DEM GLO-30.** Der Bauprozess holt es einmal aus dem öffentlichen AWS-Bucket `copernicus-dem-30m`. Kein Konto, kein Schlüssel. Lizenz kostenlos, Namensnennung Pflicht.
2. **Eine Kachel genügt.** Ganz Lissabon liegt in `Copernicus_DSM_COG_10_N38_00_W010_00_DEM` (38–39 °N, 10–9 °W).
3. **Ausschnitt schneiden und als Int16 ausliefern.** Natives Raster 1″ (30,8 × 24,2 m): 1332 × 504 = 671 328 Zellen, 1,34 MB roh. Mit Differenzbildung und Kompression grob **0,3–0,8 MB** (Rechenprobe, siehe Abschnitt 4). Feiner als 30 m (10 m, 25 m) bringt keine neue Information. Es wird nur größer.
4. **Rechnung auf dem Gerät entlang des echten Wegs.** Die Valhalla-Polylinie lädt die App schon. Alle ~15 m bilinear aus dem Raster lesen, entlang des Wegs glätten (~60 m), dann Anstieg und Abstieg mit **Hysterese von ca. 2–3 m** summieren. Es geht keine zusätzliche Koordinate an einen Dienst. Die Zahlen 15 m / 60 m / 2–3 m sind **mein Vorschlag, nicht belegt**. Sie müssen an Referenzwegen kalibriert werden (Abschnitt 5).
5. **Nicht verwenden:** Open-Meteo Elevation (90 m, Koordinaten in Server-Logs), SRTM (älter, gleiche Auflösung, kein Vorteil), FABDEM (nur nicht-kommerziell), DGT-LiDAR im Bauprozess (Konto und Login nötig).
6. **DGT-LiDAR einmalig und von Hand** (Geländemodell, 2 m, CC BY 4.0, Genauigkeit 10 cm) als Prüfquelle für etwa 10 Testwege nutzen. Damit lässt sich Schwelle und Glättung messen statt raten.
7. **Grenze:** Copernicus ist ein Oberflächenmodell (DSM). Gebäude, Bäume und 30-m-Pixel glätten Treppen und enge Gassen. Erwartung: Gesamtanstieg längerer Wege ungefähr richtig, einzelne steile Gassen und Treppen zu flach, Höhenunterschied zwischen zwei Orten auf wenige Meter genau. Zahlen siehe Abschnitt 5.
8. **Luftlinie** taugt nur für den Höhenunterschied zwischen Start und Ziel. Für Anstieg und Abstieg braucht es den echten Weg.
9. **Valhalla/FOSSGIS:** `elevation_interval` und `/height` gibt es laut Doku. Ob valhalla1.openstreetmap.de Höhendaten geladen hat und `use_hills` wirkt, ist **nicht geprüft** (Server für mich gesperrt). Prüfbefehle in Abschnitt 2.5.

### Genaue URLs (Beleg, abgerufen 24.10.2026)

- AWS-Registry: https://registry.opendata.aws/copernicus-dem/
- Bucket GLO-30: `s3://copernicus-dem-30m` (ARN `arn:aws:s3:::copernicus-dem-30m`, Region `eu-central-1`). GLO-90: `s3://copernicus-dem-90m`.
- Zugriff ohne Konto: `aws s3 ls --no-sign-request s3://copernicus-dem-30m/` (Registry: „No AWS account required“).
- Schlüsselmuster (Beleg, Forum Sentinel Hub, andere Kachel): `Copernicus_DSM_COG_10_N00_00_E006_00_DEM/Copernicus_DSM_COG_10_N00_00_E006_00_DEM.tif`
- Benennung (Beleg, Produkthandbuch Abschnitt 1.2.8.1): Name = **untere linke Ecke** der Kachel.
- **Folgerung, nicht getestet:** `https://copernicus-dem-30m.s3.eu-central-1.amazonaws.com/Copernicus_DSM_COG_10_N38_00_W010_00_DEM/Copernicus_DSM_COG_10_N38_00_W010_00_DEM.tif`. Mein Sitzungs-Proxy sperrt den Host (403). Ich konnte die Datei nicht abrufen. Kachelgröße und Pixelzahl (3600 oder 3601) sind nicht geprüft.
- Doku des Buckets: https://copernicus-dem-30m.s3.amazonaws.com/readme.html (für mich nicht abrufbar)
- STAC: https://copernicus-dem-30m-stac.s3.amazonaws.com/
- Produkthandbuch: https://dataspace.copernicus.eu/sites/default/files/media/files/2024-06/geo1988-copernicusdem-spe-002_producthandbook_i5.0.pdf

**Ausschnitt schneiden (Folgerung, nicht getestet).** Als COG lässt sich per HTTP-Bereichsanfrage nur der Ausschnitt lesen. `tools/hoehe.py` macht das mit rasterio. Gleichwertig mit GDAL-Kommandozeile (`apt-get install gdal-bin`, nicht geprüft):
```
gdal_translate -projwin -9.45 38.80 -9.08 38.66 \
  /vsicurl/https://copernicus-dem-30m.s3.eu-central-1.amazonaws.com/Copernicus_DSM_COG_10_N38_00_W010_00_DEM/Copernicus_DSM_COG_10_N38_00_W010_00_DEM.tif \
  lissabon.tif
```

### Lizenztexte (Beleg: ESA-Lizenz COP-DEM-GLO-30-F)

Quelle: https://dataspace.copernicus.eu/sites/default/files/media/files/2025-06/copernicus_contributing_mission_data_access_v2_cop_dem_licenses.pdf. Der Wortlaut stammt aus einem Werkzeug-Auszug des PDF. **Vor Veröffentlichung das PDF selbst gegenlesen.**

- Art. 3: Rechte weltweit und „without limitation in time“.
- Art. 5: „The use rights granted under this licence are free of charge to the User.“
- Art. 4: Vervielfältigen, Verbreiten, öffentlich zugänglich machen, Anpassen und Kombinieren. Das Wort „commercial“ steht nicht im Text, es gibt keine Einschränkung nach Zweck.
- **Art. 6(a), Quellenhinweis bei Weitergabe:** „© DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.“
- **Art. 6(b), bei angepassten Daten:** „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved“
- **Art. 6(c), Haftungssatz für Weitergebende:** „The organisations in charge of the Copernicus programme by law or by delegation do not incur any liability for any use of the Copernicus WorldDEM-30.“
- Art. 6(d): nicht behaupten, Copernicus habe die Tätigkeit gebilligt. Art. 6(e): Folgenutzer an dieselben Pflichten binden. Art. 7: „as is“. Bei Verstoß kann der Lizenzgeber kündigen.
- **AWS-Zitierhinweis (Registry):** „Copernicus Digital Elevation Model (DEM) was accessed on `DATE` from https://registry.opendata.aws/copernicus-dem.“ Zitier-DOI: https://doi.org/10.5270/ESA-c5d3d65.
- **Folgerung:** Unser zugeschnittenes Raster ist „angepasst“. Wir brauchen Hinweis 6(b) und den Haftungssatz 6(c) in der App unter „Quellen“, dazu den AWS-Zitierhinweis mit Abrufdatum.
- **Folgerung zum FOSS-Grundsatz:** Die Lizenz ist kostenlos und erlaubt Weitergabe, hat aber Pflichten (6(e), Kündigungsrecht). Das Raster als Daten-Datei mit eigener Quellenangabe führen, nicht als MPL-Code. Ob das zur Linie „FOSS zuerst“ passt, ist eine Entscheidung für `ENTSCHEIDUNGEN.md`.

---

## 1. Datenquellen im Vergleich

| Quelle | Typ | Auflösung | Lizenz | Zugriff aus Actions | Eignung |
|---|---|---|---|---|---|
| Copernicus DEM GLO-30 | DSM | 1″ (30,8 × 24,2 m bei 38,7 °N) | kostenlos, Namensnennung | AWS S3, ohne Konto | **beste Wahl** |
| Copernicus DEM GLO-90 | DSM | 3″ (ca. 90 × 73 m) | wie GLO-30 | AWS S3, ohne Konto | zu grob |
| SRTM (GL1 v3) | DSM, Radar Feb. 2000 (nicht geprüft) | 1″ | nicht geprüft | nicht geprüft | kein Vorteil |
| AWS „skadi“ (Valhalla-Standard) | SRTM-Format, Mischquellen | 1″ | Joerd-Attribution | S3 öffentlich | nur falls Valhalla-Daten nötig |
| DGT LiDAR MDT / MDS | MDT = Gelände, MDS = Oberfläche | 0,5 m und 2 m | CC BY 4.0 | **Konto + Login** | genau, aber nicht für CI |
| Open-Meteo Elevation | DSM (Copernicus GLO-90) | 90 m | CC BY 4.0, frei nur nicht-kommerziell | HTTP-API | nein |
| FABDEM | aus Copernicus abgeleitet („Gelände“) | 1″ | nur nicht-kommerziell | nicht geprüft | nein |

### 1.1 Copernicus DEM GLO-30 und GLO-90

**Beleg, ESA-Seite** (https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM):
- „Digital Surface Model (DSM) which represents the top-reflective surface of the Earth“: Gebäude, Infrastruktur, Vegetation sind enthalten.
- Absolut vertikal „< 4m (90% linear error)“. Relativ „< 2m for slopes below or equal 20%“ und „< 4m for slopes above 20%“ (90 % punkt-zu-punkt, Gebiet 1° × 1°). Horizontal „< 6m (90% circular error)“.
- Höhen in EGM2008 (EPSG:3855), Meter. Pixelregistrierung „RasterPixelIsPoint“.
- Lizenz GLO-30/GLO-90: „available worldwide with a free license“. Ausgaben 2019_1 bis 2024_1.

**Beleg, Produkthandbuch Ausgabe 5.0** (Link oben):
- Tabelle 3: GLO-30 im Breitenband 0–50° hat **1″ × 1″** („~30.9m - ~19.9m“). Abschnitt 1.2.3: Breitenabstand 1″. Die Pixelzahl je Kachel ist nicht angegeben (3601 × 3601 ist meine Ableitung; die AWS-COGs können zugeschnitten sein).
- Tabelle 12, gemessener Mittelwert LE90 absolut: weltweit 2,57 m, ohne Grönland/Antarktis 1,92 m, **EEA39 (Europa) 1,66 m**.
- Tabelle 13: Anteil der Zellen, die die relative Vorgabe erfüllen: weltweit 94,4 %, ohne Grönland/Antarktis 96,8 %.
- Das Modell „represents the surface of the Earth including buildings, infrastructure and vegetation“ (S. 8). Das Handbuch nennt keine Fehlerwerte nach Landnutzung oder Gebäuden.
- Höhenfehler seien zufällig, nicht systematisch; Phasenfehler sind in der Fehlerkarte nicht enthalten (Abschnitt 1.2.5.3).

**Beleg, Earth Engine** (https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_DEM_GLO30_2024_1): Basis TanDEM-X-Radar, Aufnahmezeit 1.12.2010 bis 13.11.2020; abgeleitet vom bearbeiteten WorldDEM.

**Beleg, AWS-Registry** (https://registry.opendata.aws/copernicus-dem/): „The Copernicus DEM is a Digital Surface Model (DSM)“; GLO-30 Public („limited worldwide coverage“; einzelne Länder fehlen); Cloud Optimized GeoTIFF; Verwalter Sinergise; Aktualisierung „None, except GLO-30 Public can be updated if the public tile list changes“. Das Registry-YAML nennt „Copernicus DEM 2021 release“ (https://github.com/awslabs/open-data-registry/blob/main/datasets/copernicus-dem.yaml).

**Beleg, Forum** (https://forum.sentinel-hub.com/t/copernicus-dem-data-available-on-aws/3027): Beispielkachel Float32, DEFLATE, Blöcke 1024 × 1024, Höhen EGM2008.

**Folgerung:** Welche Länder in GLO-30 Public fehlen, habe ich nicht gelesen. Portugal ist sehr wahrscheinlich enthalten (nicht geprüft). Die Kachel `N38_00_W010_00` deckt den ganzen Bereich ab, weil sie von 38–39 °N und 10–9 °W reicht.

**Fehler in Städten (Beleg):**
- FABDEM-Artikel (Hawker u. a., Environmental Research Letters 2022, https://iopscience.iop.org/article/10.1088/1748-9326/ac4d4f): gegen LiDAR-Geländemodelle aus 12 Ländern hat Copernicus GLO-30 **in bebauten Flächen einen mittleren absoluten Fehler (MAE) von 1,61 m** und einen Bias von **+0,86 m** (zu hoch). Wald südlich 52 °N: MAE 5,15 m, Bias +2,93 m. Nach Entfernen von Gebäuden und Wald (FABDEM): bebaut MAE 1,12 m, Bias −0,08 m.
- ISPRS 2024 (https://isprs-archives.copernicus.org/articles/XLVIII-4-W9-2024/275/2024/), Kapstadt: eine Korrektur senkt den RMSE von Copernicus um „46–53 %“, besonders in Stadtgebieten. Absolute Werte stehen im Kurztext nicht.
- EGU 2023 (https://meetingorganizer.copernicus.org/EGU23/EGU23-10090.html), Rumänien: nennt für GLO-30 aus ICESat-Prüfung RMSE 1,68 m und LE90 2,17 m. Keine Stadtwerte.
- **Folgerung:** Das sind Mittel über viele bebaute Flächen, nicht über Lissabons Altstadt. Sie sagen etwas über die Höhe, nicht direkt über Anstieg. Der konstante Bias von +0,86 m fällt bei Höhenunterschieden weitgehend heraus. Rauschen, Gebäudekanten und Glättung durch 30-m-Pixel nicht. Für Lissabon-Altstadt habe ich **keine veröffentlichte Prüfung gefunden** (zwei Suchen, nichts Passendes). Das ist nicht geprüft.

### 1.2 SRTM

**Beleg** (Joerd-Doku, https://github.com/tilezen/joerd/blob/master/docs/data-sources.md, Repo-Stand 2017): „SRTM globally except high latitudes, 30 meters (90 meters nominal quality) in land areas“. Skadi-Kacheln sind „Essentially … the SRTMGL1 format tiles but with global coverage“ (16 Bit, Big-Endian, Voids −32768, Höhen EGM96; https://github.com/tilezen/joerd/blob/master/docs/formats.md).

**Nicht geprüft:** NASA-Angaben zu Genauigkeit und Nutzungsbedingungen. Der Abruf der NASA-Seite schlug fehl. Angaben zu Aufnahmejahr 2000 und Radar stammen aus meinem Vorwissen.

**Folgerung:** SRTM ist wie Copernicus ein Radar-Oberflächenmodell. Es hat dieselbe Rasterweite und keinen Zugriffsvorteil. Der Bucket `elevation-tiles-prod` ist öffentlich (Valhalla-Skript), aber die Quelle ist gröber dokumentiert.

### 1.3 DGT (Portugal), LiDAR-Geländemodell

**Beleg, DGT-Webinar 15.7.2025** (https://www.dgterritorio.gov.pt/sites/default/files/ficheiros-artigos/Apresentacoes/2025/5-Webinar_LiDAR_15jul2025.pdf):
- Abdeckung „Portugal continental“, PRR-Projekt. Lissabon wird nicht einzeln genannt.
- „Densidade Média: 10 pontos/ m2“.
- Produkte: MDT (Gelände) und MDS (Oberfläche), je 0,5 m und 2 m, GeoTIFF; Punktwolke LAZ (LAS 1.4).
- „Exatidão altimétrica: 10 cm“; Lagegenauigkeit 30 cm.
- Lizenz **CC-BY-4.0**, „Dados abertos de acesso publico sem restrições“.
- Plattform https://cdd.dgterritorio.gov.pt/: Ansehen frei, **Download nur nach Registrierung**. Kacheln 1 km × 1 km. Eine API war für die zweite Version „im letzten Quartal 2025“ angekündigt. Ob sie heute läuft: nicht geprüft.

**Beleg, Hydrographisches Institut** (https://www.hidrografico.pt/en/news/noticias-do-antigo-site/data-deliver-of-the-general-of-territorie-are-available/): Flüge 2024, gesamtes Festland, 10 Punkte/m², MDT/MDS als GeoTIFF mit 50 cm und 2 m, frei über SNIG und DGT-Datenplattform.

**Beleg, GMT.jl-Doku** (https://www.generic-mapping-tools.org/GMTjl_doc/tutorials/dgt_lidar/dgt_lidar.html): Sammlungen MDS-2m, MDT-2m, MDS-50cm, MDT-50cm, LAZ; Kachelnamen wie `MDS-50cm-124170-06-2024.tiff`; Projektion ETRS89/PT-TM06 (EPSG:3763); Download-Pfad `https://cdd.dgterritorio.gov.pt/dgt-be/v1/download/...`; Registrierung nötig.

**Beleg, QGIS-Plugin-Quelltext** (https://github.com/qgispt/dgtcd_downer, Stand 19.5.2026):
- Suche: `POST https://cdd.dgterritorio.gov.pt/dgt-be/v1/search` mit JSON `{"bbox":[…],"limit":1000,"collections":[…]}`. Sammlungsnamen z. B. `LAZ`, `MDT-50cm`.
- Anmeldung über OpenID Connect: `https://auth.cdd.dgterritorio.gov.pt/realms/dgterritorio/protocol/openid-connect`, Client `aai-oidc-dgt`. Das Plugin füllt das Anmeldeformular mit Benutzername und Passwort aus. Das ist **kein dokumentierter Maschinenzugang**.
- Weboberfläche: Bereiche bis 200 km².
- Das Plugin ist „community-developed and not affiliated with the DGT“ (https://plugins.qgis.org/plugins/dgt_cdd_downloader/).

**Beleg, dados.gov.pt** (https://dados.gov.pt/en/datasets/modelo-digital-do-terreno-resolucao-2-m-zonas-costeiras-de-portugal-continental-2014-2015): älterer MDT 2 m der Küstenzonen 2014–2015, CC BY 4.0. Ob Lissabon dazugehört und wo man ihn lädt: nicht geprüft.

**Beleg, Stadt Lissabon** (https://dados.gov.pt/en/datasets/cartografia-numerica-vetorial): „Cartografia Numérica Vetorial“ 1:1000, CC BY 4.0, DWG, Befliegung 2016. Die Seite nennt keine Höhenlinien, Höhenpunkte oder Geländemodell. Ob ein offenes Geländemodell der Stadt existiert: nicht geprüft.

**Folgerung:**
- MDT ist ein Geländemodell ohne Gebäude. Das passt für Straßen viel besser als ein DSM. Brücken und Viadukte erscheinen im MDT üblicherweise als Boden unter der Brücke (für Lissabon nicht geprüft).
- Für **GitHub Actions ungeeignet**: Konto nötig, Anmeldung per Formular, Zugangsdaten als Secret, dokumentierte API unsicher.
- 2-m-Daten für den ganzen Bereich: 500 km² / 4 m² = 125 Mio. Zellen. Viel zu groß für die Handys.
- Sinnvoll: einmal von Hand mit eigenem Konto holen und nur als Prüfquelle für Testwege verwenden. Die Namensnennung für DGT-Daten im Wortlaut: nicht geprüft.

### 1.4 Open-Meteo Elevation API

**Beleg** (https://open-meteo.com/en/docs/elevation-api):
- Endpunkt `https://api.open-meteo.com/v1/elevation?latitude=..&longitude=..`. „Up to 100 coordinates can be requested at once.“
- Quelle: **Copernicus DEM 2021 release GLO-90, 90 m**.
- Antwort `{"elevation":[…]}`; Fehler mit HTTP 400 und `reason`.
- Pflicht: „clear attribution to the Copernicus program as well as a reference to Open-Meteo“. Kommerziell nur mit API-Key.

**Beleg** (https://open-meteo.com/en/terms): frei nur nicht-kommerziell. Limits pro IP: 600/Minute, 5 000/Stunde, 10 000/Tag, 300 000/Monat. Sperre bei Missbrauch ohne Vorwarnung. Webserver-Logs „may contain sensitive information such as geographical coordinates“, Löschung nach 90 Tagen. Keine Gewähr.

**Folgerung:** 90 m ist für Gassen zu grob. Von den Handys aus widerspricht es der Datenschutz-Regel. Im Bauprozess ginge es technisch, bringt aber nichts, was die AWS-Kachel nicht besser liefert.

### 1.5 FABDEM

**Beleg** (ERL-Artikel): Daten „freely available for non-commercial use“. Ob zusätzlich ShareAlike gilt: nicht geprüft.
**Folgerung:** „Nicht-kommerziell“ passt nicht zum FOSS-Grundsatz. Nicht verwenden.

---

## 2. Valhalla

Quelltext und Doku lokal geklont und per grep gelesen: https://github.com/valhalla/valhalla, Commit `618cad5eb6a12c7787c3480851eda07c99eb5c74` vom 19.10.2026.

### 2.1 Route-API mit `elevation_interval`

**Beleg** (`docs/docs/api/route/api-reference.md`, Zeile 370): „Elevation interval (meters) for requesting elevation along the route. Valhalla data must have been generated with elevation data. If no `elevation_interval` is specified, no elevation will be returned for the route. An elevation interval of 30 meters is recommended when elevation along the route is desired, matching the default data source's resolution.“

**Beleg** (Zeile 440 und `src/tyr/route_serializer_valhalla.cc`, Zeilen 576–589): Mit `elevation_interval` enthält **jede Etappe** (`trip.legs[i]`) zwei Felder:
- `elevation_interval` (Meter; bei `units=miles` in Fuß),
- `elevation`: Array von Höhen mit einer Nachkommastelle, im Abstand `elevation_interval` entlang der Etappe.

**Beleg:** Es gibt in Doku und Ausgabe-Code **keine Summe für Anstieg und Abstieg**. Die App müsste sie aus dem Array selbst bilden.

**Folgerung:** `elevation_interval` im bestehenden Route-Aufruf mitzuschicken kostet keine zusätzliche Koordinate, weil die Anfrage ohnehin an FOSSGIS geht. Es wäre eine Gegenprobe oder ein Ersatz, falls das lokale Raster fehlt. Voraussetzung ist, dass der Server Höhendaten hat (Abschnitt 2.5).

### 2.2 Dienst `/height`

**Beleg** (`docs/docs/api/elevation.md`):
- Eingabe: `shape` (Liste `{lat,lon}`) **oder** `encoded_polyline` (mit `shape_format` = `polyline6` | `polyline5`, Standard polyline6).
- `range` (bool): `true` liefert `range_height` = `[[Strecke_m, Höhe], …]`, sonst `height` = `[Höhe, …]`. Wert `null`, wenn keine Daten vorliegen.
- `resample_distance` (Meter): gleichmäßiges Neuabtasten der Eingabe.
- `height_precision` 0, 1 oder 2 (Standard 0 = ganze Meter, ergibt „Treppenstufen“). Außerdem `id`, `warnings`.
- Datenquelle laut Doku: „Amazon Web Services Public Datasets“ (Terrain Tiles).
- Grenzen der Standardkonfiguration (`scripts/valhalla_build_config`): `service_limits.skadi`: `max_shape` 750 000, `min_resample` 10 m. Werte des FOSSGIS-Servers: nicht geprüft.

### 2.3 Welche Höhendaten benutzt Valhalla?

**Beleg:**
- `scripts/valhalla_build_elevation` lädt `https://elevation-tiles-prod.s3.us-east-1.amazonaws.com/skadi/{N|S}yy/{N|S}yy{E|W}xxx.hgt.gz`.
- `src/skadi/sample.cc`: Kacheln mit 3601 × 3601 Werten (1″, ca. 30 m), bilineare Interpolation, Voids als „no data“.
- Joerd-Doku: Skadi = SRTMGL1-Format, zusammengesetzt aus mehreren Quellen. Die Quellenliste nennt für Europa EU-DEM (30 m, Portugal enthalten). Die Zoom-Tabelle führt EU-DEM aber nur für Zoom 9 auf, für höhere Zoomstufen SRTM. Welche Quelle in Lissabon im 1″-Raster steckt: **nicht geprüft** (die Footprint-Datenbank der Joerd-Doku würde es zeigen).
- Attribution laut Valhalla (`docs/docs/contributing/data/attribution.md`): „© OpenStreetMap contributors, U.S. Geological Survey, and U.S. National Oceanic and Atmospheric Administration“.

### 2.4 Wie wirkt `use_hills` bei Fußgängern?

**Beleg** (`src/mjolnir/elevationbuilder.cc`, `src/skadi/util.cc`, `src/sif/pedestriancost.cc`, `src/baldr/directededge.cc`):
- Beim Bau der Kacheln wird jede Kante alle **60 m** abgetastet (`POSTING_INTERVAL = 60`). Daraus entstehen „weighted grade“ (Stufe 0–15, **6 = eben**), größte Steigung/Gefälle und mittlere Höhe.
- Kanten unter 10 m behalten Standardwerte. Brücken und Tunnel werden linear interpoliert und auf ±3 % begrenzt.
- Fußgänger-Kosten: `grade_penalty[stufe] = (1 − use_hills) × kAvoidHillsStrength[stufe]`. Zusätzlich ein Geschwindigkeitsfaktor je Stufe. Standard `use_hills` = 0,5 (Doku Zeile 243).
- Eine Kante ohne Höhendaten hat die Stufe 6 (`weighted_grade_ = 6` im Konstruktor). Für Stufe 6 ist die Strafe 0. **`use_hills` ist dann wirkungslos.**
- **Folgerung:** In der Altstadt sind viele Kanten kürzer als 60 m. Dort ist die Steigung grob geschätzt.

### 2.5 Hat valhalla1.openstreetmap.de Höhendaten? Wirkt `use_hills`?

**Beleg:**
- Valhalla-README: FOSSGIS e.V. betreibt einen öffentlichen Demo-Server „includes a full planet graph“. Fair-Use, Rate-Limits (Verweis auf https://github.com/valhalla/valhalla/discussions/3373, nicht gelesen).
- Die Demo-Oberfläche valhalla.openstreetmap.de (Repo https://github.com/gis-ops/valhalla-app, Stand 22.10.2026) nutzt `https://valhalla1.openstreetmap.de` und baut `/height`-Anfragen (`buildHeightRequest`: `range`, `shape`, `id`) für eine Höhenprofil-Grafik (`src/components/heightgraph.tsx`).
- Forum (https://community.openstreetmap.org/t/neue-routing-engine-valhalla/7204), „whb“, 23.12.2022: „Das Höhenprofil wird auch berücksichtigt.“ Ohne Quelle, ohne Datenangabe.

**Nicht geprüft:** ob der Server die Kacheln mit Höhendaten gebaut hat, welche Daten das sind, ob `use_hills` dort wirkt, ob `elevation_interval` Zahlen liefert. Ich konnte den Server nicht abfragen (Proxy sperrt den Host). Die FOSSGIS-Seite im OSM-Wiki (https://wiki.openstreetmap.org/wiki/Valhalla) sagt nichts dazu.

**Folgerung:** Wahrscheinlich ja, weil die Demo-Oberfläche ein Höhenprofil anzeigt. Beweis fehlt. **Prüfung in zwei Minuten von einem normalen Rechner:**
```
curl -s https://valhalla1.openstreetmap.de/height --data '{"range":true,"height_precision":1,"shape":[{"lat":38.7075,"lon":-9.1364},{"lat":38.7139,"lon":-9.1334}]}'
```
Zahlen in `range_height`: Höhendaten vorhanden. `null`: keine. Für `use_hills`: dieselbe Route (Baixa nach Castelo) mit `use_hills` 0 und 1 anfordern. Unterschiedliche Länge oder Form heißt: wirkt. Zusätzlich `"elevation_interval":30` ins Route-JSON: dann muss `trip.legs[0].elevation` ein Array mit Zahlen sein.

---

## 3. Rechenverfahren für Höhenmeter

### 3.1 Wie machen es andere? (Belege)

| Werkzeug | Verfahren | Zahlen | Quelle |
|---|---|---|---|
| **Strava** | Barometer-Daten der Datei, sonst Höhe aus eigener Höhenkarte (aus Community-Daten) je GPS-Punkt. „Smoothing“ mit Ausreißerentfernung, weniger bei Barometer. Es gibt eine Schwelle. | keine Zahlen veröffentlicht | https://support.strava.com/hc/en-us/articles/216919447-Elevation |
| **Garmin** | keine Primärquelle mit Zahlen gefunden | nicht geprüft | Handbücher nennen nur Barometer-Kalibrierung |
| **Komoot** | keine Primärquelle gefunden | nicht geprüft | |
| **BRouter** (OSM-Router) | Pufferverfahren (Hysterese): Höhenänderungen werden aufsummiert; ein positiver Saldo zählt als Anstieg, ein negativer Saldo wird bei einer Untergrenze abgeschnitten | **−5 m bei 1″-Daten, −10 m bei gröberen** | Quelltext `RoutingEngine.java`, `recalcTrack` und `elevationFilter` (Commit 2989810, 28.9.2026) |
| **GraphHopper** (OSM-Router) | Optional (Standard aus): `ramer` entfernt Schwankungen bis `max_elevation`, oder `moving_average` über ein Fenster entlang des Wegs. Bilineare Interpolation optional (Standard: nächster Nachbar). | **Ramer 5 m; Fenster 150 m** | `config-example.yml`, `OSMReaderConfig.java` (Commit 229ac50, 25.10.2026) |
| **gpx.studio** (offen) | Ramer-Douglas-Peucker auf dem Höhenprofil, dann Mittelwert über ein Distanzfenster innerhalb der Teilstücke, Anstieg = Summe der positiven Differenzen | **Toleranz 20 m (RDP); Fenster 100 m** | `gpx/src/gpx.ts`, `_elevationComputation` (Commit 6a0d434, 24.7.2026) |
| **Valhalla** | Abtastung alle 60 m je Kante, gewichtete Steigung für die Kosten. Keine Summe Anstieg/Abstieg in der Ausgabe. | 60 m | Quelltext, siehe Abschnitt 2.4 |
| **OpenRouteService** | Berücksichtigt nur den Höhenunterschied zwischen den Enden einer Kante. Ein Entwickler nennt SRTM mit „vertical imprecision of about 30 m“. Ein Nutzer fand für eine Route bei Nizza 1370 m (Komoot) und rund 600 m Abweichung zu ORS. | – | https://ask.openrouteservice.org/t/elevation-gain-compared/5870 (7.3.2024; Forenbeitrag) |
| **GPS Visualizer** (Webwerkzeug) | Schwelle für senkrechte Änderungen und für Punktabstand. Empfehlung: Punktabstand 5–10 m, **senkrechte Schwelle ca. 10 m**, in flachem Gelände weniger. 30-m-DEM (USGS NED) ergab auf einer 16-km-Runde 1434 m statt ca. 1080 m (+33 %). Auf flachem Boden erzeugen Punkte alle 5 m mit ±2 m Rauschen ca. 20 m falschen Anstieg je 100 m. | siehe Spalte | https://GPSVisualizer.com/tutorials/elevation_gain.html |
| **OSM-Tagebuch (Robhubi)** | Schwelle = p × Höhenunsicherheit (0,75 m). p = 0,67 gleicht beide Fehler aus; p = 2–3 unterdrückt Rauschen stärker. Garmin Oregon 650 verhalte sich wie p ≈ 3. Testrunde (Soll 29,19 m Anstieg): p=0: 38,9 m; p=0,67: 27,2 m; p=2: 11,1 m; p=3: 5,3 m. Lange Route (1773 m): p=0 1800,9 m, p=3 1733,6 m. | Schwelle 0,5–2,3 m | https://www.openstreetmap.org/user/Robhubi%20(inaktiv)/diary/393234 (Blog, Barometerdaten) |

**Beleg-Einordnung:** Die Zahlen stammen überwiegend aus Wander- und Radwerkzeugen mit langen Strecken. Das GPS-Visualizer-Beispiel und BRouter gelten für Berge oder Rad. Für kurze Stadtwege gibt es keine Veröffentlichung, die ich gefunden habe.

### 3.2 Folgerungen für Lissabon

- **Eine hohe Schwelle (10 m) löscht Stadttreppen.** Der Tagebuch-Test zeigt: Bei kleinen Gesamtanstiegen (29 m) ändert die Schwelle das Ergebnis um mehr als Faktor 7 (38,9 m gegen 5,3 m). Bei großen Strecken (1773 m) nur um 4 %. Ein Stadtweg hat 10–80 m Anstieg und liegt im empfindlichen Bereich.
- **Schwelle an der Rastergenauigkeit ausrichten.** Der Tagebuch-Ansatz „Schwelle = p × Unsicherheit“ passt. Unsicherheit relativ ca. 1–2 m (Abschnitt 5). Mit p ≈ 1,5 ergibt das 2–3 m. Das ist ein Vorschlag, nicht belegt.
- **Abtastung nicht feiner als das Raster.** 30-m-Pixel mit bilinearer Interpolation: Abtasten alle ~15 m (halbe Pixelbreite) ist genug. Feiner erzeugt nur Scheingenauigkeit. GPS-Visualizer: Punktabstand 5–10 m *bei GPS-Spuren*. Das gilt für GPS-Rauschen, nicht für ein glattes Raster.
- **Glättung entlang des Wegs ca. 60 m** (zwei Pixel). BRouter und andere nehmen 100–150 m. Das ist für Berge. In der Altstadt würde es Treppen von 10–20 m Höhe verwischen. Vorschlag, nicht belegt.
- **Brücken und Tunnel:** Valhalla klemmt sie auf ±3 % und interpoliert linear (Quelltext). Im DSM liegt eine Brücke auf Brückenhöhe, im MDT darunter. Wegen DSM: Brücken unproblematisch, Tunnel (Boden über dem Tunnel) können Hügelhöhe zeigen. Ob Lissabon Tunnelstrecken für Fußwege hat: nicht geprüft.
- **Kalibrieren statt raten:** Mit etwa 10 Testwegen (Baixa–Castelo, Alfama, Bairro Alto, Elevadores) Anstieg mit Copernicus-Raster und mehreren Schwellen (1, 2, 3, 5 m) rechnen und gegen das DGT-MDT (2 m) vergleichen. Die Schwelle mit dem kleinsten Fehler wählen. Aufwand einmalig, danach Konstanten im Code mit Verweis auf diese Messung.

### 3.3 Luftlinie statt echtem Weg?

- **Beleg:** Der Höhenunterschied zwischen Start und Ziel ist vom Weg unabhängig. Das folgt aus der Definition. Für Anstieg und Abstieg zählt der Weg (Strava, BRouter, GraphHopper, gpx.studio rechnen alle entlang der Spur).
- **Folgerung:** Auf der Luftlinie über Lissabons Hügel zählt man Hügel mit, die der echte Weg umgeht, und verpasst Umwege oder Treppenläufe, die der Weg macht. Es gibt keinen festen Bias, die Abweichung kann in beide Richtungen gehen. Ein Faktor lässt sich nicht angeben.
- **Beleg für das Problem bei Distanz:** Umwegfaktoren („circuity“, Netzdistanz durch Luftlinie) sind in der Literatur belegt (Boeing, 40 US-Städte, https://geoffboeing.com/publications/morphology-circuity-street-networks/). Zahlen dort habe ich nicht erhalten. Für Lissabon: nicht geprüft.
- **Empfehlung:** Ohne echten Weg nur anzeigen: „Luftlinie ca. X m, Höhenunterschied Start–Ziel ca. ±Y m“, klar beschriftet. Anstieg und Abstieg erst, wenn ein Weg vorliegt (Valhalla-Route oder später Routing auf dem Gerät). Das passt zur Regel, nur Funktionen zu zeigen, die wirklich funktionieren.

---

## 4. Rastergröße für Lissabon

Rechnung mit Python (WGS84-Standardformeln), Mittelbreite 38,73 °N: 1° Breite = 111 010 m, 1° Länge = 86 955 m.

**Bereich der Anfrage** 38,66–38,80 °N, −9,45 bis −9,08 °E: 15,5 km (N–S) × 32,2 km (O–W) = **500 km²**.

| Auflösung | Spalten × Zeilen | Zellen | Int16 roh | Int16 komprimiert (Spanne*) |
|---|---|---|---|---|
| 10 m | 3218 × 1555 | 5 003 990 | 10,0 MB | 2,0–5,5 MB |
| 25 m | 1287 × 622 | 800 514 | 1,60 MB | 0,32–0,88 MB |
| 30 m | 1073 × 519 | 556 887 | 1,11 MB | 0,22–0,61 MB |
| **GLO-30 nativ (1″ × 1″ = 30,8 × 24,2 m)** | 1332 × 504 | 671 328 | **1,34 MB** | **0,27–0,74 MB** |
| GLO-90 nativ (3″) | 444 × 168 | 74 592 | 0,15 MB | 0,03–0,08 MB |

\*Die Spanne ist Zellenzahl × 0,4–1,1 Byte je Zelle. Der Wert stammt aus meiner **Rechenprobe mit synthetischem Gelände** (glatte Hügel 0–250 m plus Gauß-Rauschen), nicht aus echten Copernicus-Daten. Echte Kacheln konnte ich nicht laden.

**Kern Lissabon** (Schätzung 38,68–38,80 °N, −9,25 bis −9,08 °E): 13,3 × 14,8 km = 197 km². GLO-30 nativ 612 × 432 = 264 384 Zellen = 0,53 MB roh, mit Kompression ca. 0,26–0,35 MB (Rechenprobe).

**Messung (synthetisch, Differenzbildung je Zeile, danach zlib/xz), volle Fläche, GLO-30 nativ:**

| Rauschen (σ) | Einheit | zlib | xz | Byte je Zelle (zlib) |
|---|---|---|---|---|
| 0,3 m | 0,1 m | 661 kB | 509 kB | 0,99 |
| 0,3 m | 0,5 m | 363 kB | 276 kB | 0,54 |
| 0,3 m | 1 m | 251 kB | 194 kB | 0,37 |
| 1,0 m | 0,1 m | 745 kB | 613 kB | 1,11 |
| 1,0 m | 0,5 m | 479 kB | 390 kB | 0,71 |
| 1,0 m | 1 m | 365 kB | 293 kB | 0,54 |

**Folgerung:** Die Größe ist kein Hindernis. `tools/hoehe.py` speichert 0,1 m (rund 0,7 MB nach der Rechenprobe). Optional: 0,5 m als Einheit (Int16, ±16 km Wertebereich reicht für 0–250 m) wäre etwa halb so groß, mit Rundungsfehler ±0,25 m, klein gegen den DEM-Fehler. Nötig ist das nicht. Das Raster liegt als eine Datei in `site/`. Im Service Worker mit zwischenspeichern. Ob der Browser `DecompressionStream('gzip')` für die Entpackung bietet, ist nicht geprüft; sonst reicht ein kleiner eigener Inflate-Block oder die Auslieferung als ungepackte Datei (1,3 MB).

---

## 5. Beste Empfehlung für unseren Fall, mit Grenzen

### 5.1 Aufbau

1. **Bauprozess** (GitHub Actions): GLO-30-Kachel `N38_00_W010_00` per HTTP-Bereichsanfrage auf 38,66–38,80 °N, −9,45 bis −9,08 °E zuschneiden, als Int16 mit Kopf (Ecke, Zellgröße, Spalten/Zeilen, Einheit) und Zeilen-Differenzen speichern. **Das setzt `tools/hoehe.py` schon so um** (rasterio über GDAL `/vsicurl/`, Einheit 0,1 m, `site/hoehe.bin` und `site/hoehe.json`, höchstens alle 30 Tage; in `pages.yml` eingebunden). Die Quelle ändert sich praktisch nicht („Update Frequency: None“), 30 Tage sind reichlich. Der Abruf aus Actions ist nicht geprüft; das Skript fängt Fehler ab und behält die alte Datei.
2. **Quellenangabe in der App** unter „Quellen“: Hinweis 6(b), Haftungssatz 6(c), AWS-Zitat mit Abrufdatum.
3. **Auf dem Gerät:** Polylinie der Valhalla-Route (Genauigkeit 6 Stellen) dekodieren → entlang des Wegs alle ~15 m bilinear aus dem Raster lesen → ~60 m glätten → Anstieg/Abstieg mit Hysterese 2–3 m. Die Konstanten (15 m, 60 m, 2–3 m) sind Vorschläge.
4. **Anzeige:** „ca. 45 m hoch, 12 m runter“, gerundet auf 5 m, mit Hinweis „grob, 30-m-Raster“. Bei sehr kurzen Wegen (< 100 m) nur den Höhenunterschied.
5. **Optional:** `elevation_interval: 30` im Route-Aufruf mitsenden und als Gegenprobe nutzen, wenn der Server Höhen liefert.
6. **Test in CI** (Plausibilität): Höhe an zwei bekannten Punkten (z. B. Praça do Comércio am Tejo nahe Meereshöhe; Castelo de São Jorge ca. 100 m, **nicht geprüft**, Werte vor Verwendung belegen) muss in einer Spanne liegen.

### 5.2 Wie genau? (Beleg und Folgerung)

**Beleg:**
- Absolut: Vorgabe < 4 m (LE90); gemessenes Mittel für Europa (EEA39) 1,66 m (Produkthandbuch Tabelle 12).
- Relativ: Vorgabe < 2 m bei Hängen ≤ 20 %, < 4 m darüber (LE90, Punktpaare im 1°-Feld). 94,4 % der Zellen weltweit erfüllen sie (Tabelle 13).
- Bebaute Flächen (Mittel über LiDAR-Referenzen aus 12 Ländern): MAE 1,61 m, Bias +0,86 m (ERL 2022).
- DEM mit 30 m auf einer Wanderstrecke: +33 % Anstieg ohne Schwelle (GPS Visualizer, andere Gegend).

**Folgerung (grobe Spannen, nicht belegt, bitte an Testwegen messen):**
- **Höhenunterschied zwischen zwei Orten:** wenige Meter genau. Aus zwei unabhängigen Höhenfehlern von je 1–2 m ergibt sich ein Fehler von ca. 1,5–3 m. Der Bias +0,86 m fällt heraus.
- **Gesamtanstieg eines Wegs von 1–2 km mit 40–80 m Hub:** vermutlich im Bereich ±20–30 % (Schätzung). Steile Abschnitte werden zu flach, weil ein 30-m-Pixel eine 15-m-Treppe nicht auflöst. Gebäude am Gassenrand heben den Gassenboden an. Hysterese mit zu kleiner Schwelle fügt Rauschen hinzu, mit zu großer löscht Treppen.
- **Einzelne Treppen und Gassen** (Alfama, Graça, Bairro Alto): nicht auflösbar. Das Raster zeigt dort Mittelwerte über 30 × 24 m, mitten durch Häuser.
- **Aktualität:** Aufnahmezeit 2010–2020. Neubauten und Erdarbeiten danach fehlen.
- **Aufzüge, Standseilbahnen und Tunnel** (z. B. Santa Justa, Elevadores): Der Fußweg im Valhalla-Ergebnis folgt dem Netz. Ob solche Abschnitte Höhen verfälschen, ist nicht geprüft.

### 5.3 Wann DGT-LiDAR trotzdem lohnt

Wenn die Fehler in Abschnitt 5.2 für die Reisegruppe stören: DGT-MDT mit 2 m einmal von Hand holen (eigenes Konto), auf 5–10 m verkleinern (Gebiet Lissabon-Kern ca. 200 km²: bei 10 m knapp 2 Mio. Zellen, ca. 1–2 MB komprimiert, Rechenprobe, nicht gemessen), im Repo ablegen mit DGT-Namensnennung (Wortlaut nicht geprüft). Vorteil: Geländemodell ohne Gebäude, 10 cm Höhengenauigkeit laut DGT. Nachteil: Konto, kein automatischer Bau, Aktualisierung von Hand.

### 5.4 Offene Punkte (nicht geprüft)

- Abruf der Kachel aus GitHub Actions (mein Proxy sperrt den Host). Kachelgröße, Pixelzahl, Nodata-Wert.
- Antworten von valhalla1.openstreetmap.de (Höhen, `use_hills`).
- NASA-Angaben zu SRTM.
- Primärquellen zu Komoot und Garmin (Zahlen).
- Offenes Geländemodell der Stadt Lissabon.
- Veröffentlichte Genauigkeitsprüfung von Copernicus DEM für die Lissabonner Altstadt.
- Umwegfaktoren (Zahlen) für Fußwege.

---

## Quellenliste

Abruf am 24./25.10.2026, soweit nicht anders vermerkt.

**Copernicus / AWS**
- Lizenz GLO-30/GLO-90: https://dataspace.copernicus.eu/sites/default/files/media/files/2025-06/copernicus_contributing_mission_data_access_v2_cop_dem_licenses.pdf
- Ältere Fassung GLO-30-Lizenz: https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/DEM/resources/license/License-COPDEM-30.pdf
- ESA COP-DEM: https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM
- Produkthandbuch 5.0: https://dataspace.copernicus.eu/sites/default/files/media/files/2024-06/geo1988-copernicusdem-spe-002_producthandbook_i5.0.pdf
- AWS-Registry: https://registry.opendata.aws/copernicus-dem/ ; YAML https://github.com/awslabs/open-data-registry/blob/main/datasets/copernicus-dem.yaml
- Earth Engine GLO-30: https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_DEM_GLO30_2024_1
- Sentinel-Hub-Forum: https://forum.sentinel-hub.com/t/copernicus-dem-data-available-on-aws/3027 ; https://forum.sentinel-hub.com/t/how-to-get-copernicus-dem-geotiffs-for-a-bounding-box-using-python/4418

**Genauigkeit**
- FABDEM / ERL 2022: https://iopscience.iop.org/article/10.1088/1748-9326/ac4d4f
- ISPRS 2024 (Kapstadt): https://isprs-archives.copernicus.org/articles/XLVIII-4-W9-2024/275/2024/
- EGU 2023 (Rumänien): https://meetingorganizer.copernicus.org/EGU23/EGU23-10090.html

**DGT / Portugal**
- DGT-Webinar: https://www.dgterritorio.gov.pt/sites/default/files/ficheiros-artigos/Apresentacoes/2025/5-Webinar_LiDAR_15jul2025.pdf
- Hydrographisches Institut: https://www.hidrografico.pt/en/news/noticias-do-antigo-site/data-deliver-of-the-general-of-territorie-are-available/
- GMT.jl: https://www.generic-mapping-tools.org/GMTjl_doc/tutorials/dgt_lidar/dgt_lidar.html
- QGIS-Plugin: https://plugins.qgis.org/plugins/dgt_cdd_downloader/ ; Quelltext https://github.com/qgispt/dgtcd_downer (Commit b6c0b34, 19.5.2026)
- dados.gov.pt MDT Küste: https://dados.gov.pt/en/datasets/modelo-digital-do-terreno-resolucao-2-m-zonas-costeiras-de-portugal-continental-2014-2015
- Stadt Lissabon, Vektorkarte: https://dados.gov.pt/en/datasets/cartografia-numerica-vetorial

**Open-Meteo**
- https://open-meteo.com/en/docs/elevation-api ; https://open-meteo.com/en/terms

**Valhalla**
- Quelltext/Doku: https://github.com/valhalla/valhalla (Commit 618cad5, 19.10.2026)
- Demo-App: https://github.com/gis-ops/valhalla-app (Commit 699e32f, 22.10.2026)
- Joerd / Terrain Tiles: https://github.com/tilezen/joerd (Commit 0b86765, 21.11.2017; docs/data-sources.md, formats.md, attribution.md) ; https://registry.opendata.aws/terrain-tiles
- OSM-Forum: https://community.openstreetmap.org/t/neue-routing-engine-valhalla/7204
- OSM-Wiki: https://wiki.openstreetmap.org/wiki/Valhalla

**Rechenverfahren**
- Strava: https://support.strava.com/hc/en-us/articles/216919447-Elevation
- BRouter: https://github.com/abrensch/brouter (Commit 2989810, 28.9.2026)
- GraphHopper: https://github.com/graphhopper/graphhopper (Commit 229ac50, 25.10.2026)
- gpx.studio: https://github.com/gpxstudio/gpx.studio (Commit 6a0d434, 24.7.2026)
- GPS Visualizer: https://GPSVisualizer.com/tutorials/elevation_gain.html
- OSM-Tagebuch Robhubi: https://www.openstreetmap.org/user/Robhubi%20(inaktiv)/diary/393234
- OpenRouteService-Forum: https://ask.openrouteservice.org/t/elevation-gain-compared/5870
- Boeing, Circuity: https://geoffboeing.com/publications/morphology-circuity-street-networks/

## Was ich nicht erreichen konnte

- Mein Sitzungs-Proxy lieferte 403 für `copernicus-dem-30m.s3.amazonaws.com`, `raw.githubusercontent.com` und `valhalla1.openstreetmap.de`. Ich habe das nicht umgangen. Stattdessen: Git-Klone der öffentlichen Repos und Seitenabruf.
- Die NASA-Seite zu SRTM und die Outdooractive-Seite konnten nicht gelesen werden.
- Folge: Kachelgröße, echte Kompression und Antworten von valhalla1 sind **nicht geprüft**. Die Kompressionswerte stammen aus einer Rechenprobe mit synthetischem Gelände (Skripte in der Sitzung, nicht im Repo).
