# Eigener Standort und Live-Standorte auf der Karte: Darstellung und Leaflet-Umsetzung

Stand: 2026-10-25 (Recherche begonnen 2026-10-24). Eine Frage.
Zielgruppe: 6 Reisende in Lissabon, 3 davon über 60. Leaflet 1.9.4, Android Chrome und iOS Safari. Live-Standort über Nostr.

Umfang: 31 Websuchen (Limit des Auftrags: 35), rund 40 Seitenabrufe (8 davon blockiert oder leer), 4 Quelltext-Klone (Organic Maps, MapLibre GL JS, WebKit, leaflet-locatecontrol) und das mitgelieferte Leaflet 1.9.4.

Lesehinweis:

- „Beleg“ heißt: gelesen, mit Quelle (Q1 bis Q35, Liste in Abschnitt 10).
- „Folgerung“ heißt: mein Schluss. Kein Zitat, nicht am Gerät getestet.
- „Nicht geprüft“ und „nicht gefunden“ heißt: Ich habe es nicht gelesen oder nicht gefunden.
- Was schon in `2026-10-24-karten-ux.md` steht (Sheet, Tippziele, Gesten, Filter), wiederhole ich nicht.
- Zeilennummern im Quelltext gelten für die genannten Commits. `site/app.js` wird parallel geändert. Dort nenne ich nur Funktionsnamen.

---

## 1. Kurzfassung: 12 Regeln für die Fasan-Karte

1. **Drei eigene Panes anlegen: `ichGenau` (z 450), `leute` (z 655), `ich` (z 660).**
   Beleg: Leaflet-Panes liegen bei 200, 400, 500, 600, 650, 700 (Q1). Das `zIndexOffset` eines Markers wirkt nur im `markerPane` (Q1: `icon.style.zIndex = y + offset`).
   Folgerung: Nur eine eigene Pane über 650 liegt über Pins und Namensschildern.

2. **Reihenfolge von oben: Ich, Leute, Pins, Namensschilder, Route, Karte. Der Genauigkeitskreis liegt unter den Pins.**
   Beleg: Organic Maps zeichnet den Standort als Letztes, nach Beschriftungen, Lesezeichen und Route (Q3). Apple und Google: nicht geprüft.
   Folgerung: Der Kreis unter den Pins färbt sie nicht ein. Organic Maps macht es anders (Kreis ganz oben, 8 % Deckung).

3. **Standortpunkt und Kreis nicht klickbar: `pointer-events: none` an der Pane, `interactive: false`, `keyboard: false`. SVG-Renderer, kein Canvas. Personen bleiben antippbar.**
   Beleg: Q1 (CSS und Renderer-Code), Q2 (Leaflet-Tutorial setzt `pointer-events: none` an der Pane).

4. **Eigener Punkt: Blau nur für „ich“, weißer Rand, Schatten. Außendurchmesser 24 bis 28 px.**
   Beleg: MapLibre 15 px plus 2 px weißer Rand, #1da1f2 (Q4). Organic Maps 20 px, #1e96f0, dunkelblauer Rand (Q3). leaflet-locatecontrol Radius 9, Rand 3, weiß (Q5). Maße von Apple und Google: nicht gefunden.
   Folgerung: Die 24 bis 28 px sind ein Vorschlag für Ältere. Am Gerät prüfen. Kein Pin und keine Person in Blau.

5. **Genauigkeitskreis: Radius = `coords.accuracy`, Füllung 6 bis 20 %, nur zeichnen, wenn größer als der Punkt. Bei sehr großem Radius stattdessen Text „Standort ungenau (± 400 m)“.**
   Beleg: `accuracy` ist 95 % Konfidenz in Metern (Q18). Füllung: Organic Maps 8 % (hell) und 6 % (dunkel), MapLibre 20 %, locatecontrol 15 %. Google: kleiner Kreis heißt sicherer (Q14).

6. **Eigenes Signal in drei Zuständen: aktuell, veraltet (30 s ohne Fix), kein Signal. Kein Dauerpuls.**
   Beleg: Organic Maps setzt nach 30 s „veraltet“ (Pfeil blass, #82AAC8 bei 72 %) (Q3). MapLibre färbt bei Fehler grau (#aaa) und lässt den weißen Rand weg (Q4). Google: Punkt grau oder fehlt heißt „Standort nicht gefunden“ (Q14). Puls: MapLibre endlos, 2 s, aus bei „Bewegung reduzieren“ (Q4). Organic Maps hat keinen Puls (Q3). Mapbox: Puls standardmäßig aus (Q7).
   Folgerung: Grau plus Text „Standort alt: vor 40 s“. Nie Farbe allein. Puls höchstens einmal beim ersten Fix.

7. **Blickrichtung nur nach Tipp. Android `deviceorientationabsolute`, iOS `webkitCompassHeading`. Ohne gültigen Kompass kein Kegel.**
   Beleg: iOS braucht `requestPermission()` aus einer Geste und HTTPS (Q6, Q17). Das Nordmaß ist magnetisch (Q6, Q20). Negative `webkitCompassAccuracy` heißt ungültig (Q12). Das Plugin blendet iOS-Werte über 45° aus (Q5). Google: Strahl wird breiter, wenn der Kompass unsicher ist (Q15).
   Folgerung: `360 − alpha` stimmt laut W3C nur bei flach liegendem Gerät (Q19). Fallstricke in Abschnitt 6.

8. **Person = ein Icon mit Kreis, Name und Alter („vor 2 Min.“) als Text. Name nicht als Tooltip. Alter aus Empfangszeit, nicht aus fremder Uhr.**
   Beleg: Google zeigt Name und Foto (Q29). Life360 zeigt „Location Sharing Paused“ unter dem Namen (Q31). Apple zeigt „No location found“ (Q24). Organic Maps vergleicht bewusst keine Gerätezeiten, weil fremde Uhren nicht verlässlich sind (Q3, Kommentar im Code).
   Folgerung: Sender schickt Alter beim Senden mit. Empfänger addiert die Zeit seit Empfang. Über 10 Minuten blass und „zuletzt vor 25 Min.“. Die 10 Minuten hat der Code schon.

9. **Liste ist der Hauptzugang, die Karte ergänzt. Die Personenleiste sitzt im Kopf des Blatts. Tipp auf eine Person = Kamera springt hin.**
   Beleg: Apple Find My: Personenliste, Tipp, dann Karte (Q24, Q25). Google: Abschnitt mit den Personen, auf den man tippt (Q27). WhatsApp: alle Teilnehmer auf einer gemeinsamen Karte (Q30).
   Folgerung: Keine zusätzliche Fläche über der Karte. Kein Beleg für eine Chip-Leiste am Kartenrand in diesen Apps.

10. **„Alle zeigen“: `fitBounds` mit `paddingBottomRight` = Blatthöhe und `maxZoom: 17`. Veraltete Personen nicht einrechnen.**
    Beleg: Leaflet kennt `paddingTopLeft`, `paddingBottomRight`, `maxZoom` (Q1). Ohne `maxZoom` zoomt eine Einzelperson auf den Höchstzoom der Karte (meine Herleitung aus `getBoundsZoom` in Q1: Größe 0 ergibt unendlichen Zoom, dann Klemmung; nicht getestet).

11. **Personen außerhalb des Ausschnitts: kleiner Kantenmarker mit Pfeil und Entfernung. Er ist nur Zusatz zur Liste.**
    Beleg: Halo war 16 bis 33 % schneller als Pfeile (Q33). Wedge war genauer als Halo und vermeidet Überlappung (Q34). Beides ohne Ältere getestet.
    Überlappung auf der Karte: In keiner der vier Apps dokumentiert (nicht gefunden). Folgerung: bei Abstand kleiner als Icon-Breite ein Stapel „+2“. Tipp zoomt auf die Gruppe. Kein Zahlen-Cluster für Pins (siehe karten-ux).

12. **Akku und Genauigkeit der anderen: Akku nur als kleine Textzeile, wenn der Sender ihn mitschickt. Genauigkeit als Text ab 100 m, Kreis erst nach Tipp.**
    Beleg: Google zeigt Akku in Prozent und Ladezustand neben der Entfernung, Stand beim letzten Update (Q28, Q29). Apple Find My: Akku in den gelesenen Seiten nicht gefunden. Genauigkeitskreis für andere: in keiner Quelle gefunden.
    Nicht geprüft: Ob `navigator.getBattery()` in iOS Safari existiert. Vor dem Einbau auf MDN lesen.

---

## 2. Ist-Stand im Code (2026-10-24)

Beleg: `site/app.js` und `site/style.css`, am 2026-10-24 gelesen.

- `zeichneIch()` legt `L.circle` und `L.circleMarker` (Radius 9, Rand 3, `interactive: false`) ohne `pane` an. Beide liegen damit im `overlayPane` (z 400). Das ist unter Pins (600) und Namensschildern (650). Genau das soll sich ändern.
- `zeichneLeute()` legt `L.marker` mit `zIndexOffset: 800` an (im `markerPane`) und hängt den Namen als permanenten Tooltip dran (`tooltipPane`, 650). Personen-Icons und Pins teilen sich also eine Pane. Pin-Namen können die Personen-Namen überdecken.
- Personen werden nach 600 000 ms (10 Minuten) blass (`alt`). Der Name zeigt `zeitHer(x.ts)`.
- Personen-Icon: 44 px groß, sichtbarer Kreis 36 px. Die Projektregel verlangt Ziele von mindestens 60 dp.
- `#karte` hat `position: fixed; z-index: 1`. Das ist ein eigener Stapelkontext. Kein z-index innerhalb der Karte kann Sheet oder Knöpfe (z 1100 und höher) überdecken.
- Der Standort wird mit `watchPosition` (`enableHighAccuracy`, `maximumAge` 10 s, `timeout` 30 s) geholt. Die Genauigkeit wird auf 2000 m gedeckelt. Kompass: nicht vorhanden.

---

## 3. Der eigene Punkt in führenden Karten-Apps

### 3.1 Vergleich

| | Organic Maps | MapLibre GL JS (GeolocateControl) | leaflet-locatecontrol | Google Maps | Apple Maps |
|---|---|---|---|---|---|
| Punkt | 20 × 20 px, Kreis r 9,5, Füllung #1e96f0 (Q3) | 15 px, #1da1f2 (Q4) | Radius 9, Füllung #2A93EE (Q5) | blauer Punkt (Q14), Maße nicht gefunden | nicht geprüft |
| Rand | Strich #1672b6, kein weißer Rand beim Punkt; Pfeil hat weißen Umriss #FFFFFF (Q3) | 2 px weiß, 19 px außen, Schatten 0 0 3px, 35 % schwarz (Q4) | weiß, Strichstärke 3 (Q5) | nicht gefunden | nicht geprüft |
| Kreis | Hell: schwarz 8 %. Dunkel: weiß 6 % (Q3) | #1da1f2 mit 20 % (Q4) | #136AEC mit 15 %, ohne Rand (Q5) | hellblauer Kreis, kleiner heißt sicherer (Q14) | nicht geprüft |
| Richtung | 3D-Pfeil, hell #50AAFF, dunkel #41C8FF, wenn Drehung verfügbar ist (Q3) | in der gelesenen Datei kein Heading-Code (Q4) | kleiner Pfeil im Abstand 9, Breite 9, Länge 6, nur bei gültigem Kompass (Q5) | blauer Strahl, Breite = Sicherheit (Q15, Sekundärquelle) | nicht geprüft |
| Veraltet / schlecht | nach 30 s „veraltet“: Pfeil #82AAC8 mit 72 % (Q3) | bei Fehler grau #aaa, weißer Rand weg (Q4) | Zähler für Zeitüberschreitungen; ab 3 Stück ein CSS-Zustand am Knopf (Q5) | Punkt grau oder fehlt: Standort nicht gefunden (Q14) | nicht geprüft |
| Puls | keiner im Quelltext (Q3) | endlos 2 s, Skalierung 1 bis 3, aus bei „Bewegung reduzieren“ (Q4) | nicht geprüft | nicht gefunden | nicht geprüft |

Mapbox (Android, Q7): Puls ist aus (Standard `false`), Pulsfarbe #4A90E2, Pulsradius 10 px. Der Genauigkeitsring ist aus (Standard `false`), Farbe #4d89cff0. Das ist eine dritte Quelle für „Puls ist optional“.

### 3.2 Einzelbelege

- **Organic Maps** (Q3, Commit d91dcea, 2026-10-24).
  - `my_position.cpp`: erst `RenderAccuracy`, dann `RenderMyPosition`. Ist die Drehung gültig, kommt der Pfeil (`Arrow3d`). Sonst kommt das Symbol `current-position`.
  - `my_position_controller.cpp`: `kMaxUpdateLocationInvervalSec = 30.0`. Danach `m_positionIsObsolete = true`. Jeder neue Fix setzt es zurück. Kommentar im Code: Der Fix-Zeitstempel wird nicht mit der Systemzeit verglichen, weil die Uhr des Geräts nicht verlässlich sein muss.
  - „Veraltet“ ändert nur den Pfeil (`Arrow3d::SetPositionObsolete`). Das Punkt-Symbol ändert sich nicht.
  - `style.mapcss` (hell): `MyPositionAccuracy` schwarz 0,08. `Arrow3D` #50AAFF. `Arrow3DObsolete` #82AAC8 mit 0,72. `Arrow3DOutline` #FFFFFF. Dunkel: `MyPositionAccuracy` weiß 0,06, `Arrow3D` #41C8FF.
- **MapLibre GL JS** (Q4, Commit 3ea36bb, 2026-10-24). Die Klasse `maplibregl-user-location-dot-stale` wird im Fehlerzweig gesetzt, solange die Verfolgung läuft. „Stale“ heißt dort also „Fehler oder Zeitüberschreitung“, nicht „Alter über Schwelle“. Voreinstellung: `enableHighAccuracy: false`, `timeout: 6000`.
- **Google Maps** (Q14, Q15). Offizielle Hilfe: Blauer Punkt, hellblauer Kreis bei Unsicherheit, grau oder fehlend heißt „nicht gefunden“. Strahl: breiter Strahl heißt Kompass vorübergehend nicht kalibriert; Abhilfe ist eine Achterbewegung (9to5google, 2016-09-20, Sekundärquelle für den Google-Blogbeitrag).
- **Apple Maps.** Die HIG-Seite „Maps“ (Q11) sagt nichts zum Standortpunkt. Sie nennt nur Annotationen und Overlays. `MKUserLocationView` (Q8) ist „die MapKit-Standarddarstellung“ und lässt sich konfigurieren, etwa über `zPriority`. Das Benutzerhandbuch (Q13) nennt weder Punkt noch Kegel. Größe, Rand, Kreis, Kegel und Puls von Apple Maps: **nicht gefunden, nicht geprüft.**
- **Material Design.** Eine Seite zum Standortpunkt: nicht gefunden (Suche in m2/m3.material.io ohne Treffer).

Folgerung für die Zustände (Vorschlag, nicht belegt):

| Zustand | Bedingung | Darstellung | Text |
|---|---|---|---|
| aktuell | Fix jünger als 30 s | blau, weißer Rand, Kreis | keiner |
| veraltet | 30 s bis 5 Min. ohne Fix | grau (#aaa wie MapLibre), Rand dünner, Kreis aus | „Standort alt: vor 40 s“ |
| kein Signal | Fehler oder über 5 Min. | Punkt weg oder sehr blass an letzter Stelle | „Kein Standort. Bist du drinnen?“ |
| aus | Nutzer hat nicht erlaubt | kein Punkt | Knopf „Standort erlauben“ |

---

## 4. Stapelreihenfolge: Liegt der Standort über Pins und Beschriftungen?

- **Organic Maps: ja.** Beleg: `frontend_renderer.cpp`, Abschnitt vor `m_guiRenderer->Render`. Reihenfolge: Kartenhintergrund, 2D-Ebene, Route, 3D, Overlay-Ebene (Beschriftungen, POI-Symbole), GPS-Spur, Benutzermarken (Lesezeichen, Routenmarken, Suchmarken). Danach `Clear(DepthBit)` und erst dann `m_myPositionController->Render(...)`. Nur die GUI kommt danach.
- **MapLibre:** Der Punkt ist ein normaler DOM-Marker. Die Reihenfolge gegenüber anderen Markern folgt der DOM-Reihenfolge. Das habe ich nicht gesondert geprüft.
- **Apple:** `MKUserLocationView` hat `zPriority`. Wie die Standardwerte liegen: **nicht in der Doku gefunden** (Q8, Q9). `MKAnnotationView` kennt außerdem `displayPriority`, `collisionMode` und `clusteringIdentifier`. Das ist Entwickler-Doku, kein Beleg für das Verhalten von Apple Maps.
- **Google:** nicht gefunden. Die Seite zur `Marker`-Klasse (Android) enthielt nichts dazu.

Folgerung: Der einzige harte Beleg (Organic Maps) sagt: Standort ganz oben, über Beschriftungen und Pins. Für eine Gruppe, die draußen sucht „Wo bin ich?“, passt das. Popups (z 700) und das Sheet bleiben darüber.

---

## 5. Leaflet technisch

### 5.1 Beleg (Leaflet 1.9.4, mitgeliefert unter `site/vendor/leaflet/`)

- `_initPanes` legt an: `tilePane` 200, `overlayPane` 400, `shadowPane` 500, `markerPane` 600, `tooltipPane` 650, `popupPane` 700 (Quelltext-Kommentare `@pane`, Z. 4255 bis 4275). CSS: `leaflet.css` Z. 107 bis 114. `.leaflet-pane` selbst hat z 400 und `position: absolute`.
- `createPane(name, container?)` erzeugt ein `div` mit Klasse `leaflet-pane leaflet-<name>-pane` im Karten-Pane (Z. 3916 bis 3927). Der z-index kommt aus der Standardregel (400). Man setzt ihn selbst: `map.getPane(name).style.zIndex`.
- Marker: Option `pane` (Standard `markerPane`, Z. 7747), `zIndexOffset` (Z. 7729), `interactive` (Standard `true`, Z. 7713). Der Icon-z-index ist `Breitenpixel + zIndexOffset` (Z. 7996, 8003). Er gilt nur innerhalb der Pane.
- Pfade (`L.circle`, `L.circleMarker`): Option `pane` (Standard `overlayPane`, Z. 6817). Für jede andere Pane erzeugt Leaflet einen eigenen Renderer (`getRenderer`, `_getPaneRenderer`, Z. 13402 bis 13430). Der SVG-Wurzelknoten hat `pointer-events="none"`, Kommentar: „makes it possible to click through svg root“ (Z. 13242).
- `pointer-events`: `leaflet.css` Z. 241 bis 256. `.leaflet-marker-icon`, `.leaflet-pane > svg path` und andere haben `none`. Erst die Klasse `leaflet-interactive` setzt `auto`. Ein Marker mit `interactive: false` bekommt die Klasse nicht (Z. 8015 bis 8017).
- Canvas-Renderer: Das `canvas`-Element hört auf `click` und `mousemove` (Z. 12632 bis 12641). Es setzt kein `pointer-events: none`.
- Tutorial „Map panes“ (Q2, Fassung zu Leaflet 1.0.1): `map.getPane('labels').style.zIndex = 650` und `pointer-events: none` an der Pane, damit Klicks zu Layern darunter durchgehen. Die Seite für 1.9 war nicht abrufbar (Weiterleitungsseite). Das Verhalten im 1.9.4-Quelltext stimmt mit dem Tutorial überein.
- `fitBounds`: `padding`, `paddingTopLeft`, `paddingBottomRight`, `maxZoom` (Z. 3365 bis 3407). `getBoundsZoom` klemmt auf den Zoom-Bereich der Karte (Z. 3978 bis 4002).

### 5.2 Folgerung

- Ein Marker im `markerPane` kann nie über das `tooltipPane` (650) kommen, egal wie groß `zIndexOffset` ist. Grund: `markerPane` ist ein positioniertes Element mit festem z-index. Das ist ein eigener Stapelkontext (CSS-Standard). Nicht geprüft: Ich habe die MDN-Seite zum Stapelkontext nicht lesen können, und es fehlt ein Browser-Test. Ein Test mit `zIndexOffset: 100000` bestätigt es in einer Minute.
- Darum drei Panes:

  | Pane | z | Inhalt | klickbar |
  |---|---|---|---|
  | `ichGenau` | 450 | Genauigkeitskreis (`L.circle`, SVG) | nein |
  | `leute` | 655 | Personen-Icons mit Name und Alter | ja |
  | `ich` | 660 | eigener Punkt mit Kegel (DivIcon) | nein |

- Skizze (Vorschlag, nicht ausgeführt):

```js
// einmal nach L.map(...)
for (const [name, z] of [['ichGenau', 450], ['leute', 655], ['ich', 660]]) {
  const pane = karte.createPane(name);
  pane.style.zIndex = String(z);
  pane.style.pointerEvents = 'none';          // Tutorial "Map panes"
}
L.circle(p, { pane: 'ichGenau', radius: acc, interactive: false, className: 'ich-genau' }).addTo(karte);
L.marker(p, { pane: 'ich', icon: ichIcon, interactive: false, keyboard: false }).addTo(karte);
L.marker(q, { pane: 'leute', icon: personIcon, zIndexOffset: rang }).addTo(karte); // antippbar
```

- Personen bleiben antippbar, obwohl die Pane `none` hat: `.leaflet-marker-icon.leaflet-interactive` setzt `auto` und gewinnt gegen die Vererbung.
- Immer ein eigenes `className` am `DivIcon` setzen. Der Standard `leaflet-div-icon` zeichnet ein weißes Quadrat mit Rand (Z. 11054 und 11075, `leaflet.css` Z. 569).
- In `leute`: Je weiter unten auf dem Bildschirm, desto weiter oben (Breitenpixel). Mit `zIndexOffset` nach Aktualität sortieren, damit die jüngste Position oben liegt.
- Der Name gehört ins Icon (HTML), nicht in `bindTooltip`. Sonst landet er im `tooltipPane` (650) unter den Personen-Icons und teilt sich die Ebene mit Pin-Namen.
- Canvas-Renderer (`preferCanvas`) in einer oberen Pane würde Antippen von Pins darunter blockieren, weil das `canvas` Ereignisse annimmt. Die App nutzt ihn nicht (`L.map` ohne `preferCanvas`). Folgerung aus dem Quelltext, nicht getestet.
- Das Plugin leaflet-locatecontrol (Q5) legt keine eigene Pane an (kein Treffer für „pane“ im Quelltext). Es hat dasselbe Reihenfolgeproblem wie unser Ist-Stand. Es ist keine Vorlage für die Reihenfolge.

---

## 6. Blickrichtung im Browser

### 6.1 Beleg

| | iOS Safari | Android Chrome |
|---|---|---|
| Ereignis | `deviceorientation`, Feld `webkitCompassHeading` | `deviceorientationabsolute`, Feld `alpha` |
| Bezug | magnetisch Nord (WebKit liest `CLHeading.magneticHeading`, Q6) | magnetisch Nord (Q20, Q21) |
| Erlaubnis | `DeviceOrientationEvent.requestPermission()`, nur aus einer Geste, nur HTTPS (Q6, Q17, Q23) | keine Abfrage nötig (Stand Januar 2024, Q20). Die Spezifikation enthält die Methode, das kann sich ändern. |
| Güte | `webkitCompassAccuracy` = `CLHeading.headingAccuracy`: maximale Abweichung in Grad, negativ heißt ungültig (unkalibriert oder starke Störung) (Q6, Q12). MDN: „meist 10“ (Q16). | kein Feld (Kommentar in Q5) |
| Chrome-Änderung | | Seit Chrome 50 ist `deviceorientation` nicht mehr absolut. Absolute Werte gibt es nur über `deviceorientationabsolute` (Q22, Stand 2016-03-14). |

Weitere Belege:

- Safari kennt `deviceorientationabsolute` nicht (Q20, Meldung vom 2024-01-31). Eine zukunftssichere Erkennung ist dort als offene Frage beschrieben (W3C-Ticket #137). Eine Lösung habe ich nicht gefunden.
- WebKit lehnt `requestPermission()` ohne Geste ab: Fehler `NotAllowedError`, Text „requires a user gesture“ (Q6, `DeviceOrientationEvent.cpp`). MDN: sicherer Kontext nötig (Q16, Q17).
- Spezifikation (Q19, Arbeitsentwurf vom 2023-01-30): `360 − alpha` ist der Kompasskurs bei flach liegendem Gerät. Anhang A gibt eine Formel für ein Gerät, dessen Bildschirm ungefähr senkrecht steht. Das Ereignis `deviceorientationabsolute` hat laut Entwurf „limited implementation experience“. Der Bezugsrahmen hängt nicht von der Bildschirmdrehung ab. Daten können sensibel sein und nur bei sichtbarer Seite fließen.
- leaflet-locatecontrol (Q5, Commit 5a87d67, 2026-10-19): nimmt `deviceorientationabsolute`, wenn es das gibt. Ruft `requestPermission()` auf, wenn die Funktion existiert. iOS: `webkitCompassHeading` plus `screen.orientation.angle`, Werte mit `webkitCompassAccuracy` über 45 oder unter 0 werden verworfen. Android: `360 − alpha`, ohne Filter. Der Winkel wird auf ganze Grad gerundet.
- Genauigkeit der GPS-Position: `coords.accuracy` ist 95 % Konfidenz in Metern (Q18).

### 6.2 Folgerungen und Fallstricke (nicht am Gerät getestet)

1. **Schräg gehaltenes Handy.** `360 − alpha` (so macht es das Plugin auf Android) gilt nur flach liegend. Unterwegs hält man das Handy schräg oder aufrecht. Die Formel aus Anhang A (Q19) nehmen und am Gerät gegen eine echte Kompass-App prüfen. Den Wortlaut der Formel konnte ich nicht abschreiben. Nicht geprüft.
2. **Bildschirmdrehung.** Der Rahmen ist unabhängig vom Bildschirm (Q19). Das Plugin rechnet den Winkel nur auf iOS ein. Entweder Hochformat festhalten oder `screen.orientation.angle` einrechnen und testen.
3. **Magnetische Störungen.** Absolute Werte sind anfällig für Magnetfelder (Q22). Google zeigt dann einen breiten Strahl (Q15). Apple liefert negative Genauigkeit (Q12). In Lissabon: Straßenbahnen, Autos, Eisen. Kegel bei ungültigem Wert ausblenden. Hinweis „Kompass kalibrieren: Handy in einer Acht bewegen“ (Q15).
4. **Magnetisch ist nicht geografisch.** Die Abweichung für Lissabon habe ich nicht nachgeschlagen. Nicht geprüft. Sie ist klein, aber real.
5. **Erlaubnis nur nach Tipp.** Eigener Knopf „Blickrichtung zeigen“ mit Text. Verweigerung oder Fehler zeigt Text, nicht nur ein ausgegrautes Symbol.
6. **Listener sparsam.** Nur anmelden, solange die Karte sichtbar ist und der Kegel gebraucht wird. Das passt zur Datenschutz-Begründung in Q19 und spart Akku.
7. **Glätten.** Das Plugin rundet nur und zeichnet per `requestAnimationFrame`. Eine Glättung gegen Zittern ist nicht belegt. Am Gerät entscheiden.
8. **Kurs aus GPS (`coords.heading`).** Gilt nur in Bewegung. Die MDN-Seite war nicht abrufbar. Nicht geprüft.
9. **Erlaubnis im Home-Bildschirm-Modus und Permissions-Policy:** nicht geprüft.

Gerätetest (Vorschlag): iPhone mit Safari und Android mit Chrome. Flach, schräg, aufrecht. Hochformat und gedreht. Neben Metall. Erlaubnis verweigert. Jeweils gegen eine Kompass-App vergleichen.

---

## 7. Live-Standorte anderer

Die offiziellen Hilfeseiten sind dünn. Vieles zur Optik steht nur in Screenshots. Was ich nicht lesen konnte, steht als „nicht gefunden“.

### Apple, Wo ist? / Find My

- Beleg: Personenliste, Tipp auf eine Person, dann die Karte (Q24, iOS-13-Handbuch). Kann man jemanden nicht orten, steht „No location found“ unter dem Namen (Q24).
- Beleg: Auf der Apple Watch zeigt die Liste „ungefähre Position und Entfernung“. Tipp zeigt Karte und ungefähre Adresse (Q25, watchOS 26).
- Beleg: In Nachrichten erscheint die grobe Position unter dem Namen, die Live-Position nach Tipp auf den Namen (Q26, Seite vom 2026-10-05).
- Nicht gefunden: Avatar-Aussehen, Zeitangabe („Jetzt“, „vor X Min.“), Akku, Genauigkeit, Verhalten bei Überlappung, „Alle zeigen“.

### Google Maps

- Beleg: Andere sehen Profilbild und Akkustatus (Q27, Google-Konto-Hilfe, ohne Datum). Bei vielen Personen gibt es einen Abschnitt mit den Personen, auf den man tippt (Q27).
- Beleg: Akku in Prozent und Ladezustand neben der Entfernung (Q28, Android Police 2018-08-02). Der Wert gilt „zum Zeitpunkt des letzten Updates“ (Q28).
- Beleg: Empfänger sehen Name und Foto, Akku und Ladezustand, bei Navigation Abfahrtszeit und Ankunft. Dauer von 15 Minuten bis zu einem Tag (Q29, Business Today 2024-01-03, Sekundärquelle).
- Nicht gefunden: Zeitangabe an der Person, Sprung auf die Person, Verhalten bei veralteten oder überlappenden Positionen, Genauigkeit für andere.

### WhatsApp Live-Standort

- Beleg: Alle, die im Chat teilen, erscheinen auf derselben Karte. Teilen endet per Timer oder jederzeit von Hand. Ende-zu-Ende verschlüsselt (Q30, Beitrag vom 2017-10-17).
- Nicht gefunden: Avatar-Aussehen, Alter der Position, Liste, Sprung, Akku, Überlappung. Die FAQ-Seite war nicht abrufbar.

### Life360

- Beleg: Andere sehen „Location Sharing Paused“ unter deinem Namen, wenn du das Teilen in diesem Kreis pausierst (Q31, ohne Datum, Seite 2025).
- Beleg: „Bubbles“ teilen nur ungefähre Position; andere sehen, dass du in einer Bubble bist (Q32).
- Nicht gefunden: Avatar-Aussehen, „zuletzt aktualisiert“, Akku, Genauigkeit, Überlappung, Liste gegen Karte. Die Support-Startseite war nicht freigegeben. Viele Suchtreffer zu Life360 waren Spam-Seiten und sind nicht verwendet.

### Was alle vier gemeinsam haben (Beleg) und was fehlt

- Gemeinsam: Name oder Bild an der Position, eine Liste oder gemeinsame Karte, zeitlich begrenztes Teilen mit Stopp.
- Lücke: Zeitangabe an der Person, Verhalten bei Überlappung und Genauigkeit für andere sind in keiner der gelesenen offiziellen Quellen beschrieben. Für Fasan gelten deshalb unsere eigenen Regeln 8, 11 und 12. Sie sind Folgerungen.

---

## 8. Live-Ansicht präsent machen, ohne die Karte zu verdecken

Beleg (was die Quellen hergeben):

- Apple und Google führen über die Liste zur Karte (Q24, Q25, Q27). WhatsApp zeigt eine gemeinsame Karte mit allen (Q30).
- Leaflet kann den Ausschnitt um ein überlagertes Bedienteil herum rechnen: `paddingBottomRight` (Q1).
- Halo und Wedge zeigen Ziele außerhalb des Ausschnitts am Rand (Q33, Q34). Halo war auf Karten-Aufgaben 16 bis 33 % schneller als Pfeile bei gleicher Fehlerrate in 3 von 4 Aufgaben. Wedge war genauer als Halo (Q33, Q34). Beide wurden nicht mit Älteren getestet. Q33 ist eine Zusammenfassung Dritter, das Original habe ich nicht gelesen.
- Dass eine Chip-Leiste am Kartenrand bei Apple, Google, WhatsApp oder Life360 vorkommt: **nicht gefunden.**

Folgerung (Vorschlag, alles ungetestet):

| Muster | Nutzen | Kosten | Urteil |
|---|---|---|---|
| Leiste im Kopf des Blatts (Rast „mini“): „5 live“ plus Avatare plus „Alle zeigen“ | verdeckt die Karte nicht zusätzlich; passt zum Blatt mit vier Rasten | bei 6 Avataren à 60 dp = 360 dp plus Lücken passt nicht in eine Zeile auf 360 bis 390 dp breiten Handys | **ja**, aber nur „Alle zeigen“ plus die 3 jüngsten, Rest hinter „Mehr (3)“ |
| Kamera folgt allen („Alle zeigen“) | ein Tipp, alle im Bild | springt, wenn jemand weit weg ist; Einzelperson zoomt zu nah | **ja**, als Tipp, nicht als Dauermodus. `fitBounds` mit Blatthöhe als Rand und `maxZoom: 17`. Veraltete weglassen. |
| Kantenmarker für Personen außerhalb | zeigt Richtung und Entfernung | verdeckt Ränder; Marker können sich häufen | **ja**, nur Zusatz. Höchstens 3. Mindestens 60 dp zum Antippen. |
| Dauerhafte Chip-Reihe über der Karte | immer sichtbar | verdeckt Karte; kein Beleg aus den Apps | **nein**, ohne Gerätetest |
| Namensschilder an allen Personen | sofort lesbar | Überlappung mit Pin-Namen | Namen nur beim Zoom ab Stufe X (Zahl am Gerät bestimmen); Initialen immer |

Sprung „Person auf der Karte zeigen“: Beleg bei Apple (Tipp in der Liste, Q24). Bei Google, WhatsApp, Life360 nicht gefunden. Folgerung: `flyTo` auf die Person mit Zoom mindestens 16, danach Person im Blatt. Zurück-Knopf mit Text „Alle zeigen“.

---

## 9. Offen und nicht geprüft

- Apple Maps: Punktgröße, Rand, Farbe, Kreis, Kegel, Puls, Verhalten bei schlechtem Signal. Keine offizielle Zahl gefunden.
- Google Maps: Punktgröße und Rand, Stapelreihenfolge zu Markern, Puls.
- Stapelkontext-Aussage (5.2): MDN nicht lesbar, Browser-Test fehlt.
- Formel für den Kompasskurs aus Anhang A (Q19): Wortlaut nicht übernommen.
- Abweichung magnetisch gegen geografisch Nord für Lissabon.
- `coords.heading` (MDN-Seite blockiert), `navigator.getBattery()` in Safari, Erlaubnis-Verhalten im Home-Bildschirm-Modus.
- WCAG 1.4.1 (Farbe allein) und 1.4.11 (Kontrast von Bedienelementen): Seite nicht freigegeben. Unsere Regel „Farbe plus Text“ folgt dem Sinn, aber ich habe den Wortlaut nicht gelesen.
- Leaflet-Dokumentation für 1.9 auf leafletjs.com: nicht abrufbar. Ersatz: Quelltext 1.9.4 und das Tutorial der Fassung 1.0.1.
- Life360 und WhatsApp: Optik und Zeitangaben nur aus Screenshots bekannt, nicht aus Quellen.
- Schwellenwerte 30 s, 5 Min., 10 Min., 100 m und die Größen 24 bis 28 px sind Vorschläge. Nur die 30 s haben einen Beleg (Organic Maps).
- Sender-Nutzlast: Es steht nicht fest, ob `acc`, Alter beim Senden und Akku im Nostr-Ereignis stehen. Vor Regel 8 und 12 in `site/funk.js` prüfen.

---

## 10. Quellen

Abrufdatum aller Seiten: 2026-10-24, wenn nicht anders genannt. „Ohne Datum“ heißt, die Seite nennt keines.

**Quelltexte (lokal gelesen)**

- Q1 Leaflet 1.9.4, mitgeliefert: `/home/claude/fasan-karte/site/vendor/leaflet/leaflet-src.js` und `leaflet.css` (Kopfzeile „Leaflet 1.9.4, (c) 2010-2023“). Upstream: https://github.com/Leaflet/Leaflet
- Q2 Leaflet-Tutorial „Map panes“, Fassung 1.0.1: https://unpkg.com/leaflet@1.0.1/docs/examples/map-panes/index.md (ohne Datum). https://leafletjs.com/examples/map-panes/ gab nur eine Weiterleitungsseite.
- Q3 Organic Maps, Commit d91dceadd1219ca910f70d935a11989aec98b27f (2026-10-24): `libs/drape_frontend/frontend_renderer.cpp`, `my_position.cpp`, `my_position_controller.cpp`, `arrow3d.cpp`, `data/styles/default/{light,dark}/style.mapcss`, `data/styles/default/light/symbols/current-position.svg`. https://github.com/organicmaps/organicmaps
- Q4 MapLibre GL JS, Commit 3ea36bb61fd93ed9f67e38091bdd8f12948b6cf1 (2026-10-24): `src/css/maplibre-gl.css`, `src/ui/control/geolocate_control.ts`. https://github.com/maplibre/maplibre-gl-js
- Q5 leaflet-locatecontrol, Commit 5a87d674eeb6bebbe8691032d6d3d48404bed3d3 (2026-10-19): `src/L.Control.Locate.js`. https://github.com/domoritz/leaflet-locatecontrol
- Q6 WebKit, Commit 80f763d1b3dab1119392303a1e764b8bb9216347 (2026-10-24): `Source/WebCore/platform/ios/WebCoreMotionManager.mm`, `Source/WebCore/dom/DeviceOrientationEvent.idl` und `.cpp`. https://github.com/WebKit/WebKit
- Q7 Mapbox Maps SDK Android, Einstellungen der Standortkomponente (Fassung „latest“, ohne Datum): https://docs.mapbox.com/android/maps/api/latest/mapbox-maps-android/com.mapbox.maps.plugin.locationcomponent.generated/-location-component-settings/

**Hersteller- und Standard-Dokumentation**

- Q8 Apple, `MKUserLocationView` (© 2026, ab iOS 14): https://developer.apple.com/documentation/mapkit/mkuserlocationview.md
- Q9 Apple, `MKAnnotationView` (© 2026): https://developer.apple.com/documentation/mapkit/mkannotationview.md
- Q10 Apple, `MKUserLocation` (© 2026): https://developer.apple.com/documentation/mapkit/mkuserlocation.md
- Q11 Apple, Human Interface Guidelines „Maps“ (Spiegel, ohne Datum): https://developer-mdn.apple.com/design/human-interface-guidelines/technologies/maps
- Q12 Apple, `CLHeading.headingAccuracy` (© 2026): https://developer.apple.com/documentation/corelocation/clheading/headingaccuracy.md
- Q13 Apple, iPhone-Benutzerhandbuch „Karten ansehen“, iOS 15 (ohne Datum): https://support.apple.com/en-asia/guide/iphone/view-maps-iph10d7bdf26/15.0/ios
- Q14 Google Maps Hilfe, Standortgenauigkeit (ohne Datum): https://support.google.com/maps/answer/2839911?hl=en
- Q15 Google-Maps-Strahl, 9to5google, 2016-09-20 (Sekundärquelle; der Google-Blogbeitrag war nicht freigegeben): https://9to5google.com/2016/09/20/google-maps-direction-beam-calibrate/
- Q16 MDN, `DeviceOrientationEvent` (zuletzt geändert 2026-08-04): https://developer.mozilla.org/docs/Web/API/DeviceOrientationEvent
- Q17 MDN, `DeviceOrientationEvent.requestPermission()` (2026-08-04): https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static
- Q18 MDN, `GeolocationCoordinates.accuracy` (2023-12-31): https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/accuracy
- Q19 W3C, DeviceOrientation Event Specification, Arbeitsentwurf 2023-01-30: https://www.w3.org/TR/2023/WD-orientation-event-20230130/
- Q20 W3C public-geolocation, Ticket #137 „how to acquire compass headings“, Autor juj, 2024-01-31: https://lists.w3.org/Archives/Public/public-geolocation/2024Jan/0035.html
- Q21 W3C public-geolocation, T. Volodine (Google), 2015-11: https://lists.w3.org/Archives/Public/public-geolocation/2015Nov/0001.html
- Q22 Chrome-Blog, „Device orientation changes in Chrome 50“, J. Posnick, zuletzt aktualisiert 2016-03-14: https://developer.chrome.com/blog/device-orientation-changes
- Q23 WebKit-Blog, „New WebKit Features in Safari 13“, 2019-12-20: https://webkit.org/blog/9674/new-webkit-features-in-safari-13/

**Live-Standorte**

- Q24 Apple, Find My im iPhone-Handbuch, iOS 13 (ohne Datum): https://support.apple.com/en-asia/guide/iphone/ipha24eb4a37/13.0/ios
- Q25 Apple, „Find People“ auf der Apple Watch, watchOS 26 (ohne Datum): https://support.apple.com/guide/watch/view-a-friends-location-apd1132106dc/watchos
- Q26 Apple, „Share your location with iPhone“, 2026-10-05: https://support.apple.com/en-us/105104
- Q27 Google-Konto-Hilfe „Manage your Location Sharing settings“ (die Adresse support.google.com/maps/answer/7326816 führte dorthin; ohne Datum): https://support.google.com/maps/answer/7326816?hl=en
- Q28 Android Police, Akkustand bei Google-Maps-Standortfreigabe, 2018-08-02 (Sekundärquelle): https://www.androidpolice.com/2018/08/02/google-maps-location-sharing-now-shows-contacts-battery-level
- Q29 Business Today, Google Maps Live-Standort, 2024-01-03 (Sekundärquelle): https://www.businesstoday.in/amp/technology/news/story/google-maps-gets-whatsapp-like-feature-to-share-live-location-on-android-and-ios-411716-2024-01-03
- Q30 WhatsApp-Blog, „Share your live location“, 2017-10-17: https://blog.whatsapp.com/share-your-live-location
- Q31 Life360-Support, „Share My Location“ (© 2025): https://support.life360.com/hc/en-us/articles/23053695148823-Share-My-Location
- Q32 Life360-Support, „Bubbles“ (© 2025): https://support.life360.com/hc/en-us/articles/23053376685463-Life360-Bubbles-Feature

**Forschung**

- Q33 Baudisch und Rosenholtz, „Halo: a technique for visualizing off-screen objects“, CHI 2003, S. 481 bis 488 (Zusammenfassung Dritter): https://scrapbox.io/UIPedia/Patrick_Baudisch:_Halo:_a_technique_for_visualizing_off-screen_objects
- Q34 „Wedge: clutter-free visualization of off-screen locations“, CHI '08, 2008-04-06 (Autoren auf der Seite nicht aufgeführt): https://dx.doi.org/10.1145/1357054.1357179

**Intern**

- Q35 `docs/recherche/2026-10-24-karten-ux.md` (nicht wiederholt), `docs/ENTSCHEIDUNGEN.md` (Blatt mit vier Rasten, Live-Abgleich über Nostr).

**Nicht erreichbar oder nicht freigegeben (nichts umgangen):** leafletjs.com (Referenz und Tutorial 1.9), unpkg Leaflet 1.9.4, blog.google, MDN (`GeolocationCoordinates.heading`, Stapelkontext), W3C WCAG-Seite, Life360-Support-Startseite, Apple `zPriority`-Seite, WhatsApp-FAQ, Google Android `Marker`-Seite (ohne Inhalt zum Thema).
