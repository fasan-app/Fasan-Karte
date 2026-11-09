# Natives iOS-Gefühl in einer mobilen Web-App (Leaflet + Bottom Sheet)

Stand: 2026-10-24. Eine Recherche, 35 Suchen.
Ziel: Safari iOS und Chrome Android, ohne Framework.
Zielgruppe der Fasan-Karte: 6 Reisende, 3 davon über 60. Ruhige Bewegung ist hier wichtiger als Effekt.

Lesehinweis:

- **Beleg** heißt: steht so in der Quelle. Das Kürzel (Q1 …) verweist auf Abschnitt 7.
- **Folgerung** heißt: mein Schluss aus Belegen. Kein Zitat.
- **Empfehlung** heißt: mein Vorschlag. Dafür gibt es keinen Beleg. Auf dem Gerät prüfen.
- **Nicht geprüft** heißt: gesucht, aber nicht gefunden, oder nicht gelesen.
- Ich habe jede Zahl, die ich nachrechnen konnte, nachgerechnet. Das ist je Zeile vermerkt.
- Die Seiten wurden per WebFetch gelesen. Ein kleines Modell fasst sie dabei zusammen. Wo eine Formel dort unstimmig kam, steht es dabei.

---

## 0. Kurzfassung: Startwerte

1. **Sheet:** 3 Rastpunkte (Peek, 50 %, voll). Es folgt dem Finger 1:1. Beim Loslassen wird die Endposition projiziert und der nächste Rastpunkt gewählt.
2. **Feder beim Einrasten:** response 0,35 s, Dämpfung 0,9. Nach langsamem Loslassen Dämpfung 1,0. Die Anfangsgeschwindigkeit der Geste fließt in die Feder.
3. **Gummiband** an den Enden: `(1 − 1/(x·0,55/d + 1))·d`, d = Höhe des sichtbaren Bereichs.
4. **Druckzustand:** sofort bei `pointerdown`. Skalierung 0,97 und 10 % Überlage. Zurück nach 150 bis 200 ms.
5. **Trefferfläche:** mindestens 44 pt (Apple) und 48 dp (Material). Das Fasan-Kamera-Repo nennt 60 dp.
6. **Haptik:** nur Zusatz, abschaltbar. Android: `navigator.vibrate`. iOS: kein offizieller Weg. Echte Schalter (`<input type="checkbox" switch>`) geben den Systemton selbst.
7. **Onboarding:** höchstens 3 Karten, immer überspringbar, Weiter-Knopf fest am unteren Rand. Standort erst beim Tippen auf „Mein Standort“.
8. **Bewegung reduzieren:** Gesten-Folgen bleiben. Federn ohne Überschwingen. Wechsel als Überblendung. Kein Skalieren, keine Dauerschleifen.

---

## 1. Bottom Sheet

### Konkrete Werte

**Rastpunkte (Detents)**

- Apple kennt zwei System-Rastpunkte. *large* ist die volle Höhe. *medium* ist „about half“ der vollen Höhe. Eigene Werte sind möglich. (Q1)
- Nur *medium* verhindert das Aufziehen auf volle Höhe. Medium eignet sich für stufenweise Offenlegung, z. B. Share-Sheet. (Q1)
- Die Apple-Abbildung zum *large*-Sheet beschreibt es als „almost all of the screen“. Es bleibt also ein Rand oben. (Q1, Bildbeschreibung)
- Material: `halfExpandedRatio` 0,5. `fitToContents` true. `expandedOffset` 0 dp. Die Peek-Höhe soll hoch genug sein, um weiteren Inhalt anzudeuten. (Q11)
- **Empfehlung:** Peek = Griff + Titelzeile + eine Zeile, etwa 88 bis 112 px. Medium = 50 % der sichtbaren Höhe. Voll = sichtbare Höhe − Safe-Area oben − 8 bis 16 px Rand.
- Sichtbare Höhe nicht mit `100vh` rechnen. Safari 17.4 hat einen Fehler bei `svh`/`dvh` behoben. Also gibt es beide Einheiten dort. (Q15)

**Ziehen folgt dem Finger**

- Beleg: „Everything needs to respond instantly.“ Der Zustand soll sofort beim Berühren reagieren. Timer und Verzögerungen vermeiden. (Q8)
- Beleg: Die Oberfläche soll jederzeit umlenkbar und unterbrechbar sein. (Q8)
- Beleg: Eine Feder, die mitten in der Bewegung ein neues Ziel bekommt, übernimmt ihre aktuelle Geschwindigkeit. Das fühlt sich glatt an. (Q3)
- **Folgerung:** Während der Finger unten ist, gilt `y = startY + dy`. Keine Transition, keine Feder. Beim Greifen einer laufenden Animation wird sie gestoppt und die aktuelle Position übernommen.
- Scrollender Inhalt: UIKit zieht ein Sheet von medium auf large auf, wenn der Inhalt am Rand scrollt. Das lässt sich abschalten (`prefersScrollingExpandsWhenScrolledToEdge`). (Q2)
- Material: `draggableOnNestedScroll` ist standardmäßig true. (Q11)
- **Empfehlung:** Inhalt scrollt nur, wenn das Sheet oben steht und `scrollTop > 0` gilt. Sonst bewegt die Geste das Sheet.

**Geschwindigkeit und Einrasten**

- Projektion nach Gitter (Nachbau des WWDC-Vortrags): `project(v, rate) = (v / 1000) · rate / (1 − rate)`, v in px/s. Der nächste Rastpunkt zur Endposition `y + project(v, rate)` ist das Ziel. (Q9)
- Apple sagt dazu: Geschwindigkeit und Verzögerungsrate ergeben eine „projected position“. „Remember to project momentum. Don’t just use position.“ (Q8)
- Rate: Gitter nutzt `UIScrollView.DecelerationRate.normal`, nennt es „quite generous“, nennt aber keine Zahl. (Q9)
- Rate `fast`: 0,99 pro Millisekunde. Das ist rückgerechnet, nicht von Apple dokumentiert. (Q10)
- Eigene Rechnung: Rate 0,998 → Faktor 0,499 s. Das sind +499 px bei 1000 px/s. Rate 0,99 → Faktor 0,099 s. Das sind +99 px bei 1000 px/s.
- **Empfehlung:** Start mit 0,99. Ein sanfter Wisch soll nicht über zwei Rastpunkte springen. Auf dem Gerät nachstellen.
- Flick-Schwelle: Material nutzt `significantVelocityThreshold` = 500 px/s. (Q11)
- **Empfehlung:** Ab 500 px/s springt das Sheet mindestens einen Rastpunkt in Wischrichtung, auch wenn die Projektion kurz ist.
- Anfangsgeschwindigkeit der Feder = Geschwindigkeit geteilt durch den Restweg: `v / (ziel − aktuell)`, 0 bei Weg 0. (Q9: „Drawer: abs(yVelocity) / distanceRemaining“)
- Pausen-Erkennung nach Gitter: letzte 7 Geschwindigkeiten merken. Prüfen erst ab Offset ≥ 50 und |v| ≤ 100. Verhältnis `|erste − aktuelle| / |erste|` über 0,9 gilt als Pause, also kein Wurf. Gitter nennt das selbst unvollkommen. (Q9)
- Apple: Beim Anhalten des Fingers gibt es einen „huge spike“ in der Beschleunigung. Deshalb wird nicht nur die Geschwindigkeit am Ende genutzt. (Q8)

**Gummiband an den Enden**

- Apple: Rubberbanding zeigt Grenzen weich an. Beim Loslassen zieht Elastizität den Inhalt zurück. (Q8)
- Formel A (Gitter): `offset = offset > 0 ? offset^0,7 : −(−offset)^0,7`. Gitter schreibt selbst: So macht es Apple im Scroll-View nicht. (Q9)
- Formel B (rückgerechnet aus dem Scroll-View): `f(x) = (1 − 1 / (x · c / d + 1)) · d` mit c = 0,55 und d = Größe des Scroll-Views. Das c stammt aus einem Tweet, der Autor hat es nachgemessen. Nicht von Apple dokumentiert. (Q10)
- Stützpunkte bei d = 812: x = 500 → 205, 1000 → 328, 1500 → 409. (Q10) Ich habe nachgerechnet: 205,4 / 327,9 / 409,2.
- Rückfeder: Dämpfungsgrad 1 (kritisch gedämpft), kein Überschwingen. Rückgerechnet. (Q10)
- **Empfehlung:** Formel B mit d = sichtbare Höhe. Gilt oberhalb von „voll“ und unterhalb von „Peek“.

**Griff (Grabber)**

- Apple: kleine waagerechte Anzeige oben. Ziehen ändert die Größe. Tippen wechselt reihum die Rastpunkte. Er arbeitet mit VoiceOver. Resizable Sheets sollen einen Griff haben. (Q1)
- Apple nennt keine Pixelmaße für den Griff. (Q1)
- Material: Der Griff hat mindestens 48 dp Trefferfläche, „matching the minimum touch target“. Er arbeitet mit TalkBack. Tippen wechselt den Zustand. (Q11)
- Apple-Kontrollen: 44 × 44 pt Standard, 28 × 28 pt Minimum. (Q29)
- **Empfehlung:** Sichtbar 36 × 5 px, Radius 2,5 px, gedämpfte Farbe. Trefferfläche volle Breite × mindestens 48 px hoch. `role="button"`, `aria-label`, Tippen = nächster Rastpunkt, Enter/Leertaste auch.
- **Folgerung:** Zusätzlich ein sichtbarer Schließen-/Wechsel-Knopf. Das deckt „jede Geste hat einen sichtbaren Zwilling“ und Regel 3/4 aus `2026-10-24-karten-ux.md`.

**Mehr Platz für die Karte**

- Apple: In iOS kann ein Sheet nicht-modal sein. Man bedient die Ansicht dahinter, ohne das Sheet zu schließen. (Q1)
- UIKit: `smallestUndimmedDetentIdentifier = .medium` nimmt die Abdunklung bei medium weg. (Q2)
- Material: Ein Standard-Sheet „co-exists with the screen’s main UI region“. Kein Scrim. Modale Sheets blockieren den Rest. (Q11)
- Zu „Sheet klappt ein, wenn man die Karte schiebt“ habe ich keinen Beleg gefunden.
- **Empfehlung:**
  - Kein Abdunkeln. Karte immer bedienbar.
  - Beginnt der Finger auf der Karte zu ziehen (Schwelle etwa 10 px), springt das Sheet von voll/medium auf Peek. Feder wie beim Einrasten.
  - Kein Ausklappen von selbst. Nur durch Griff, Knopf oder Tippen auf einen Pin.
  - Bloßes Tippen oder Zoomen klappt nicht ein.
  - Ist ein Ort gewählt, bleibt der Peek mit Ortsname sichtbar.

### Belege

Q1, Q2, Q3, Q8, Q9, Q10, Q11, Q15, Q29.

### Nicht geprüft

- Pixelmaße von Griff, Eckenradius und Peek bei Apple. Nicht dokumentiert gefunden.
- Der Zahlenwert von `DecelerationRate.normal`. Aus dem Gedächtnis ist es 0,998. Das habe ich nicht belegt.
- Echte Schwellen in Apples Sheet. Nicht dokumentiert gefunden.
- Verhalten von Apple Maps und Google Maps bei Kartenschieben. Keine Primärquelle.
- Leaflet: Ereignisnamen (`dragstart`, `movestart`) und Touch-Verhalten gegen die Leaflet-Doku prüfen. Nicht gelesen.
- `touch-action`, Pointer Capture und `overscroll-behavior` in Safari iOS. Nicht gelesen.
- `visualViewport` und die einklappende Adressleiste in Safari iOS. Nicht geprüft.
- Wirkung auf Über-60-Jährige: keine Studie gefunden (siehe `2026-10-24-karten-ux.md`, Abschnitt 4).

---

## 2. Federn

### Konkrete Werte

**Apple-Werte**

- SwiftUI `Animation.default` ist ab iOS 17 `spring(response: 0.55, dampingFraction: 1.0, blendDuration: 0.0)`. Vor iOS 17 war es `easeInOut`. (Q4)
- `interpolatingSpring(duration:bounce:initialVelocity:)` hat die Vorgaben `duration = 0.5`, `bounce = 0.0`. (Q6)
- WWDC23: Zwei Parameter, *duration* und *bounce*. Bounce liegt zwischen −1,0 und 1,0. (Q3)
- „When you’re not sure, use a spring with bounce 0.“ (Q3)
- Bounce 0,15 fühlt sich „not very bouncy yet“ an. Bounce 0,3 ist „noticeable“. Über etwa 0,4 wirkt es für UI-Elemente übertrieben. (Q3)
- Erst Dauer wählen, dann Bounce einstellen. (Q3)
- Bounce passt „at the end of a gesture“. (Q3)
- WWDC18: Dämpfung 100 % (kein Überschwingen) ist der Start für elastisches Verhalten. Hat die Geste Schwung, belohne ihn mit „a little bit of overshoot“. (Q8)
- Presets heißen `smooth` (kein Bounce), `snappy` (kleiner Bounce), `bouncy` (höherer Bounce). Zahlen dazu stehen in den Apple-Seiten nicht. (Q7)
- Beispielwerte von Gitter, seine eigenen, nicht Apples: Lampe 0,4 / 0,2; PiP 1 / 0,4; Schublade 0,8 / 0,3; Drehung 0,8 / 0,4 (Dämpfung / response). (Q9)

**Umrechnung in Physik** (Masse 1)

- Beleg (Gitter): `stiffness = (2π / response)²`, `damping = 4π · dampingFraction / response`. (Q9)
- Beleg (Apple-Beispiel): `Spring(duration: 0.5, bounce: 0.3)` ergibt mass 1,0 / stiffness 157,9 / damping 17,6. (Q5)
- Folgerung: Eigenfrequenz ω₀ = 2π / response (oder 2π / duration). Dämpfungsgrad ζ = dampingFraction, oder ζ = 1 − bounce für bounce ≥ 0.
- Gegenprobe zum Apple-Beispiel: ω₀² = 157,91. 2·ζ·ω₀ = 2 · 0,7 · 12,566 = 17,59. Stimmt.
- Hinweis: Der Abruf der WWDC-Seite gab die Formel für damping unstimmig wieder. Ich nutze sie nicht, sondern die selbst geprüfte Form.

**Rechenwerte (eigene Rechnung, Skript im Scratchpad)** — Ruhezeit = Zeit, nach der die Abweichung dauerhaft unter 0,2 % bleibt.

| Feder | ζ | Überschwingen | Ruhezeit |
|---|---|---|---|
| duration 0,5 / bounce 0 | 1,0 | 0 % | 0,67 s |
| duration 0,5 / bounce 0,15 | 0,85 | 0,6 % | 0,64 s |
| duration 0,5 / bounce 0,3 | 0,7 | 4,6 % | 0,73 s |
| response 0,55 / ζ 1 (SwiftUI-Vorgabe) | 1,0 | 0 % | 0,74 s |
| response 0,3 / ζ 0,8 (Gitter, Schublade) | 0,8 | 1,5 % | 0,38 s |
| response 0,4 / ζ 1 (Gitter, PiP) | 1,0 | 0 % | 0,54 s |
| response 0,35 / ζ 0,9 | 0,9 | 0,15 % | 0,32 s |
| response 0,25 / ζ 1 | 1,0 | 0 % | 0,34 s |

**Feder in JavaScript** (Zielwert 1, Start 0, `v0` in 1/s, Richtung Ziel positiv). Ich habe die Funktion mit Node getestet: Ableitung bei t = 0 ist gleich `v0`, Endwert 1.

```js
function makeSpring({ response, zeta, v0 = 0 }) {
  const w0 = 2 * Math.PI / response;
  if (zeta >= 1) return t => 1 - Math.exp(-w0 * t) * (1 + (w0 - v0) * t);
  const wd = w0 * Math.sqrt(1 - zeta * zeta);
  return t => 1 - Math.exp(-zeta * w0 * t) *
    (Math.cos(wd * t) + ((zeta * w0 - v0) / wd) * Math.sin(wd * t));
}
// Position: y(t) = y0 + (ziel - y0) * spring(t)
// Fertig, wenn |spring(t) - 1| < 0.002 und die Geschwindigkeit klein ist (Stop-Kriterium wählen).
```

- Warum JS: CSS kann keine Anfangsgeschwindigkeit übergeben. Apple sagt, die Feder soll dort weitermachen, „where the gesture ends“. (Q3)
- **Folgerung:** Loslassen nach Geste = JS-Feder (rAF oder Web Animations mit vorberechneten Keyframes). Feste Übergänge = CSS `linear()`.

**Feder in CSS mit `linear()`**

- Syntax: `linear(0, 0.25 75%, 1)`. Mindestens 2 Werte. Werte außerhalb 0 bis 1 sind erlaubt. Prozentwerte sind optional. Ohne Prozente sind die Punkte gleichmäßig verteilt. (Q12)
- Chrome: Bounce und Feder lassen sich „astonishingly well“ annähern. Doppelte Punktzahl glättet sichtbar. Ein Generator liegt unter linear-easing-generator.netlify.app. (Q14)
- Unterstützung laut caniuse: Chrome 113, Firefox 112, Safari 17.2, iOS Safari 17.2. Weltweite Nutzung 93,99 % (StatCounter, September 2026). (Q13)
- MDN: Baseline „widely available“, seit Dezember 2023 in allen Browsern. (Q12)
- Safari 17.4 meldet „Fixed CSS linear() easing“. Was genau, steht dort nicht. (Q15)
- **Empfehlung:** `CSS.supports('transition-timing-function', 'linear(0, 1)')` prüfen. Ohne Unterstützung `ease-out` nehmen.
- Eigene Werte, 24 Intervalle, selbst berechnet:

```css
:root {
  /* duration 0.5, bounce 0  -> Dauer 0.67s */
  --spring-smooth: linear(0, 0.0493, 0.1575, 0.2853, 0.4115, 0.5257, 0.624, 0.7058, 0.7721, 0.825, 0.8666, 0.8989, 0.9238, 0.9428, 0.9573, 0.9682, 0.9764, 0.9825, 0.9871, 0.9905, 0.993, 0.9949, 0.9962, 0.9972, 1);
  /* duration 0.5, bounce 0.15 -> Dauer 0.64s */
  --spring-snappy: linear(0, 0.0466, 0.154, 0.2866, 0.4222, 0.548, 0.6576, 0.7486, 0.8214, 0.8778, 0.92, 0.9507, 0.9722, 0.9868, 0.9961, 1.0017, 1.0047, 1.006, 1.0063, 1.0059, 1.0051, 1.0043, 1.0034, 1.0027, 1);
  /* response 0.35, zeta 0.9 -> Dauer 0.36s */
  --spring-sheet: linear(0, 0.0309, 0.1052, 0.2021, 0.3074, 0.4118, 0.5097, 0.598, 0.6753, 0.7415, 0.797, 0.8428, 0.88, 0.9097, 0.9332, 0.9515, 0.9655, 0.9761, 0.984, 0.9898, 0.9939, 0.9968, 0.9988, 1.0001, 1);
}
.panel { transition: transform 0.36s var(--spring-sheet); }
```

**Empfohlene Federn für die Fasan-Karte** (Empfehlung, abgeleitet aus den Belegen)

| Zweck | response | ζ |
|---|---|---|
| Sheet rastet nach Wisch ein | 0,35 s | 0,85 |
| Sheet rastet nach langsamem Loslassen ein | 0,35 s | 1,0 |
| Sheet klappt bei Kartenschieben auf Peek | 0,35 s | 1,0 |
| Rückfeder vom Gummiband | 0,3 s | 1,0 |
| Onboarding-Seite wechselt | `--spring-smooth` | – |
| Bounce über 0,3 | nie (Q3: über 0,4 übertrieben) | – |

### Belege

Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q12, Q13, Q14, Q15.

### Nicht geprüft

- Die Zahlen hinter `smooth`, `snappy`, `bouncy`. Aus dem Gedächtnis sind es Dauer 0,5 und Bounce 0 / 0,15 / 0,3. Apples Seiten nennen sie nicht.
- Die Formel für negativen Bounce (überdämpft). Nicht benötigt.
- Vorgabewerte von `spring()` ohne Argumente. Apple schreibt nur „uses the default parameter values“. (Q7)
- Ein Drittartikel nannte `response 0,55 / dampingFraction 0,75` als Vorgabe. Das widerspricht Apples Seite (1,0). Ich habe es verworfen.
- Was in Safari 17.4 bei `linear()` genau behoben wurde.
- caniuse zeigt für Chrome für Android nur Version 156. Wahrscheinlich ein Tabellenfehler. Auf einem Android-Gerät testen.
- Leistung: nur `transform` und `opacity` animieren. Das ist üblich, aber hier nicht belegt.

---

## 3. Touch-Feedback

### Konkrete Werte

**Zeitpunkt**

- Apple: „The button should highlight immediately when I touch down on it.“ Latenzen und Timer vermeiden. Beispiel: eine Verzögerung von etwa einer halben Sekunde durch Doppeltipp-Erkennung. (Q8)
- WebKit: `touch-action: manipulation` lässt Einzeltipps ohne Doppeltipp-Wartezeit durch. `width=device-width` im Viewport macht Einzeltipps bei Startzoom schnell. Ohne beides gilt eine Wartezeit von 350 ms. (Q34)
- **Empfehlung:** Zustand bei `pointerdown` setzen, nicht bei `click`. `touch-action: manipulation` auf allen Knöpfen. Zustand bei `pointerup`, `pointercancel` und beim Verlassen zurücknehmen. Beginnt eine Scroll-Geste, den Zustand abbrechen.

**Druckzustand**

- Material 3, Zustandsebene (State Layer): Druck 10 %, Hover 8 %, Fokus 10 %, Ziehen 16 %. Quelle ist die Flutter-Datei aus den M3-Tokens. (Q35)
- `transform: scale(0.97)` auf `:active`. Das ist eine Meinung des Autors, nicht gemessen. (Q36)
- Dauern nach dem Autor: 100 bis 150 ms für Mikro-Interaktionen, 150 bis 250 ms für Standard-UI, 200 bis 300 ms für Modale und Schubladen. Ausgang etwa 20 % schneller als Eingang. Gesamt unter 300 ms. (Q36, Meinung)
- Apple nennt keine Zahl für Skalierung oder Deckkraft beim Drücken. Nicht gefunden.
- **Empfehlung:**
  - Gefüllte Knöpfe: `scale(0.97)`, Überlage 10 %. Eingang höchstens 100 ms (ease-out), Ausgang 150 bis 200 ms.
  - Listenzeilen: nur 10 % Überlage, keine Skalierung.
  - Reine Text- oder Symbolknöpfe: Überlage als Kreis oder abgerundetes Rechteck um die Trefferfläche, Skalierung 0,97 nur am Symbol.
  - Der Zustand muss auch ohne Skalierung sichtbar sein (siehe Abschnitt 6).

**Mindestgrößen**

- Apple iOS/iPadOS: Standard 44 × 44 pt, Minimum 28 × 28 pt. Etwa 12 pt Abstand um Elemente mit Rahmen, etwa 24 pt um Elemente ohne Rahmen. (Q29)
- Material: 48 dp Mindest-Trefferfläche (so bezeichnet die Doku den Griff des Bottom Sheets). (Q11)
- Fasan Kamera (eigenes Repo): Ziele mindestens 9,6 mm (60 dp). Das habe ich nicht geprüft, ob die Karte es übernimmt. (Q39)
- **Empfehlung:** Alles Antippbare mindestens 48 px. Wichtige Knöpfe (Weiter, Standort, Ortswechsel) 56 bis 60 px. Abstand zwischen Zielen mindestens 8 px.

### Belege

Q8, Q11, Q29, Q34, Q35, Q36, Q39.

### Nicht geprüft

- Apples Zahlen für Highlight-Deckkraft in UIKit/SwiftUI. Nicht dokumentiert gefunden.
- `:active` und `-webkit-tap-highlight-color` in Safari iOS. Nicht gelesen.
- `@media (hover: hover)`, damit Hover-Stile auf Touch nicht kleben. Nicht gelesen.
- Q36 ist eine Meinungsseite ohne Datum. Q35 ist eine Quelldatei ohne Datum, nur mit Commit-Hash.
- Ob CSS-Pixel auf Android 1:1 dp entsprechen. Nicht geprüft.

---

## 4. Haptik im Web

### Konkrete Werte

**`navigator.vibrate`**

- MDN: Verfügbarkeit „Limited“, nicht Baseline. Es braucht „sticky user activation“. Rückgabe: Boolean. Muster = Array aus Dauer/Pause in ms. `0` oder `[]` bricht ab. Manche Geräte vibrieren nicht bei Stumm oder „Nicht stören“. (Q19)
- caniuse: Chrome ab 32. Firefox 11 bis 128, ab 129 nicht mehr. Samsung Internet 4 bis 30. **Safari und iOS Safari: nicht unterstützt** (gelistet 3.1/3.2 bis 27.2). Weltweit 77,63 %. (Q20)
- Für Chrome für Android listet caniuse nur Version 156 als unterstützt. (Q20)
- Beleg also: **iOS Safari unterstützt `navigator.vibrate` nicht.**

**iOS-Weg: `<input type="checkbox" switch>`**

- Safari 17.4 (5. März 2024): „Added support for `<input type="checkbox" switch>`.“ (Q15)
- Safari 18.0 (16. September 2024): „Added haptic feedback for `<input type=checkbox switch>` on iOS.“ (Q16)
- WebKit-Fehler 271711: Haptik für den Schalter. Gemeldet 26.03.2024, behoben 27.03.2024. (Q17)
- WebKit-Fehler 285120 (gemeldet 23.12.2024, behoben 03.01.2025): Der Melder schreibt, man könne die Funktion nutzen, um „vibrations from JavaScript“ zu erzeugen, und fordert User Activation. Was der Fix genau ändert, steht auf der Seite nicht. (Q18)
- Technik laut Drittquellen: Unsichtbarer `<input type="checkbox" switch>` mit `<label>`. `label.click()` löst die Standard-Haptik aus. Muster = mehrere Klicks nacheinander. (Q21, Q22)
- Drittquellen behaupten: Es geht auf iOS 17.4 bis 26.4. Apple habe es in iOS 26.5 geändert, sodass Skript-Aufrufe nicht mehr vibrieren. Ein echter Fingertipp auf einen echten Schalter funktioniere weiter. (Q23, Q24)
- Widerspruch: Die Primärquelle datiert die Haptik auf iOS 18.0, nicht 17.4. (Q16 gegen Q23/Q24)
- **Folgerung:** Der sichere Weg ist ein **echter, sichtbarer Schalter**, den die Person selbst antippt. Dann gibt das System die Haptik. Skript-Haptik ist ein Hack, der mit jedem iOS-Update brechen kann.

**Wann welche Haptik** (Apple, für Muster-Wahl)

- Kurze Haptik für einzelne Ereignisse. Lange Haptik verwässert. (Q25)
- Haptik ergänzt Optik. Stärke und Schärfe passen zur Animation. (Q25)
- Konsistent einsetzen: eine Haptik, eine Bedeutung. (Q25)
- Sparsam einsetzen. „Make haptics optional.“ Nutzer können sie abschalten. (Q25)
- Apple-Kategorien: *Impact* (Beispiel: „a tap when a view snaps into place“), *Selection* (Werte ändern sich), *Notification* (Erfolg, Warnung, Fehler). (Q25)

**Empfehlung für die Karte** (Android-Dauern ohne Beleg, auf Geräten prüfen)

| Ereignis | Apple-Kategorie | Android `vibrate` |
|---|---|---|
| Sheet rastet ein | Impact, leicht | 10 |
| Auswahl wechselt (Tab, Filter) | Selection | 6 |
| Aktion erfolgreich (gespeichert) | Notification, Erfolg | [10, 40, 10] |
| Fehler | Notification, Fehler | [30, 50, 30, 50, 30] |
| Weiter im Onboarding | Selection | 6 |

```js
const haptics = {
  on: true, // aus den Einstellungen laden (try/catch um localStorage)
  fire(pattern) {
    if (!this.on) return;
    if ('vibrate' in navigator) navigator.vibrate(pattern); // nur nach Nutzeraktion
    // iOS: keine Skript-Haptik. Echte <input type="checkbox" switch> geben sie selbst.
  }
};
```

- Einstellung „Haptik“ als echter Schalter anbieten. Das ist zugleich Apples „make haptics optional“ und liefert unter iOS die Systemhaptik beim Umschalten.

### Belege

Q15, Q16, Q17, Q18, Q19, Q20, Q21, Q22, Q23, Q24, Q25.

### Nicht geprüft

- Ob `label.click()` aus Skript in iOS 26.5 und iOS 27 noch Haptik auslöst. Nur Drittquellen. Auf dem echten Gerät testen.
- Was der Fix zu Fehler 285120 genau tut.
- Ob die Haptik im Home-Screen-Modus (PWA) gleich läuft. Q23 sagt ja. Keine Primärquelle.
- Einfluss von „Systemhaptik aus“ und Stumm-Schalter auf iOS. Q23 nennt beides. Keine Primärquelle.
- Behauptung in Q21, WebKit lehne die Vibration API ab. Ich habe die WebKit-Standardpositionen nicht gelesen.
- Dauern und Muster für Android. Reine Empfehlung. Geräte unterscheiden sich stark.
- Chrome-Android-Versionen für `vibrate`. Q20 zeigt nur 156.

---

## 5. Onboarding

### Konkrete Werte

**NN/g**

- Studie (NN/g, 08.03.2020): 70 Personen, 4 iOS-Apps, je zur Hälfte mit und ohne Tutorial. (Q30)
- Aufgabenerfolg: 91 % mit Tutorial, 94 % ohne. Kein signifikanter Unterschied. (Q30)
- Wahrgenommene Schwierigkeit: Tutorial-Leser fanden die Aufgaben schwerer (4,92 gegen 5,49 auf einer Skala 1 bis 7, signifikant). (Q30)
- Zeit: 93,49 s mit, 85,17 s ohne. Kein signifikanter Unterschied. Lesezeit war aus der Zeit herausgerechnet. (Q30)
- „many participants skip tutorials when they first download an app.“ (Q30)
- „Think twice about creating a tutorial for simple applications.“ Besser die UI einfach machen. Falls nötig, „interactive methods … like contextual help“. (Q30)
- Coach-Marks zeigten einen ähnlichen Effekt. (Q30)
- Grenze der Studie: nur 4 iOS-Apps. (Q30)
- NN/g-Video (15.01.2021): Anleitungen, die man vor der Nutzung lesen muss, „reduce usability“. „Should be avoided as much as possible.“ (Q31)
- NN/g-Video (30.07.2021): Onboarding besteht aus Funktionswerbung, Anpassung und Anleitung. Es soll einfach bleiben. (Q32)
- Zur Zahl der Karten und zum Überspringen-Knopf enthalten die gelesenen NN/g-Seiten **keine** Zahl und keine Regel.

**Apple HIG „Onboarding“** (letzter Eintrag im Änderungsprotokoll: 10.06.2024) (Q26)

- Ablauf „fast, fun, and optional“. Er kommt nach dem Start, nicht als Teil davon.
- „Teach through interactivity.“ Wer etwas selbst tut, behält es besser.
- Statt eines Ablaufs besser „context-specific tips“, nahe an dem Bereich, den sie erklären.
- Wenn ein Ablauf nötig ist: kurz und angenehm. Nichts zum Auswendiglernen.
- Ein eigenes Tutorial soll überspringbar sein. Wer es überspringt, bekommt es beim nächsten Start nicht wieder. Es muss später leicht zu finden sein, z. B. unter Hilfe oder Einstellungen.
- Nicht notwendige Einrichtung verschieben. Gute Standardwerte nutzen.
- Splash-Screen nur kurz.

**Berechtigung (Standort)**

- HIG Onboarding: Braucht die App private Daten, bevor sie funktioniert, darf die Anfrage in den Ablauf. „Otherwise“ die Anfrage erst zeigen, wenn die Person die Funktion zum ersten Mal nutzt. (Q26)
- HIG Privacy (Spiegel): „Ideally, wait to request permission until people actually use an app feature that requires access.“ Anfragen beim Start sind weniger störend, wenn der Grund klar ist, etwa Standort in einer Navigations-App. (Q28)
- Eigener Erklärbildschirm vor der Systemabfrage: nur ein Knopf, der klar die Systemabfrage öffnet. Kein „Allow“-Text. Die Systemabfrage nicht nachbilden. (Q28)
- Zweck-Text: ein kurzer, vollständiger Satz im Aktiv. (Q28)
- **Folgerung:** Die Fasan-Karte funktioniert ohne Standort. Also nicht beim Start fragen, sondern beim Tippen auf „Mein Standort“. Erst dann `navigator.geolocation` aufrufen.

**Aufbau von 3 bis 4 Seiten** (Empfehlung, abgeleitet; die Zahlen dazu sind nicht belegt)

- **Anzahl:** höchstens 3 Karten. HIG und NN/g nennen keine Zahl, aber „kurz“ und „vermeiden“.
- **Inhalt:** 1) Wofür die Karte da ist. 2) So bedienst du das Sheet (zum Ausprobieren, nicht nur Text). 3) Loslegen. Standort gehört nicht dazu.
- **Fortschritt:** Punkte plus Text „2 von 3“ (für Ältere). `aria-label="Schritt 2 von 3"`.
- **Weiter-Knopf:** fest am unteren Rand, volle Breite, 56 px hoch, `padding-bottom: max(16px, env(safe-area-inset-bottom))`. Er liegt nie im scrollenden Teil.
- **Layout gegen „unter dem Falz“:**

```css
.onboarding { display: flex; flex-direction: column; height: 100vh; height: 100dvh; }
.onboarding__body { flex: 1 1 auto; overflow-y: auto; min-height: 0; }
.onboarding__footer { flex: 0 0 auto; padding: 12px 16px max(16px, env(safe-area-inset-bottom)); }
```

- `dvh` gibt es in Safari mindestens seit 17.4 (Fehlerkorrektur in Q15). Die erste Version habe ich nicht geprüft. Deshalb die `vh`-Zeile davor.
- **Überspringen:** Text „Überspringen“ oben rechts, 48 px Trefferfläche, auf jeder Karte sichtbar. Auf der letzten Karte entfällt er.
- **Zwilling:** Wischen und Knöpfe gleichwertig.
- **Merken:** Flag in `localStorage`, mit try/catch. Nach Überspringen oder Ende nicht wieder zeigen. Unter „Hilfe“ erneut aufrufbar. (HIG, Q26)
- **Testgröße:** 320 × 568 px als kleinsten Fall (mein Vorschlag).
- **Kontext-Tipps statt Ablauf:** Beim ersten Öffnen des Sheets einmal ein Hinweis am Griff („Nach oben ziehen für mehr“). Antippen oder Zeitablauf blendet ihn aus. (HIG: context-specific tips, Q26)
- **Seitenwechsel:** Federübergang `--spring-smooth` oder Überblendung. Die View Transitions API ist seit Safari 18.0 dabei (Q16). Für Chrome habe ich die Version nicht geprüft.

### Belege

Q15, Q16, Q26, Q28, Q30, Q31, Q32.

### Nicht geprüft

- Wie Safari iOS und Chrome Android die Standort-Abfrage zeigen, speichern und nach Ablehnung wieder anbieten. MDN-Geolocation nicht gelesen.
- NN/g-Quellen zu Fortschrittsanzeige, Anzahl Karten oder Überspringen-Knopf. Nicht gefunden.
- HIG Privacy und HIG Accessibility habe ich nur über einen Spiegel (glama.ai) gelesen, nicht von developer.apple.com. Der Spiegel nennt als Quelle die Apple-Seite.
- Ob Über-60-Jährige Tutorials anders nutzen. Keine Quelle.
- Erste Safari-Version mit `dvh` und `env(safe-area-inset-*)`. Nicht geprüft.
- `localStorage` im privaten iOS-Modus. Nicht geprüft (Seite muss ohne Speicher laufen).

---

## 6. Bewegung reduzieren (`prefers-reduced-motion`)

### Konkrete Werte

- MDN: `reduce` heißt, die Person möchte eine Oberfläche, die Bewegung „removes, reduces, or replaces“. Skalieren und Verschieben großer Objekte kann Beschwerden bei Gleichgewichtsstörungen auslösen. Das Beispiel ersetzt eine Skalierung durch eine Überblendung. (Q33)
- MDN: Baseline „widely available“, seit Januar 2020 in allen Browsern. (Q33)
- Apple HIG Accessibility, wenn „Reduce Motion“ aktiv ist (Q29):
  - automatische und sich wiederholende Animationen verringern, auch Zoomen, Skalieren und Randbewegung;
  - Federn straffen, damit sie weniger springen;
  - Animationen direkt an die Geste koppeln;
  - Tiefenbewegung (z-Achse) vermeiden;
  - Wechsel in x, y und z durch Überblendungen ersetzen;
  - keine Animation in oder aus Unschärfe.
- Apple HIG Motion (letzter Eintrag 09.09.2025): Bewegung soll optional sein. Nie der einzige Weg, etwas mitzuteilen. Ergänzen durch Haptik oder Ton. Bewegung abbrechbar machen. Nicht auf häufige Interaktionen legen. (Q27)

**Empfehlung: Umschalttabelle**

| Element | Normal | Bei `reduce` |
|---|---|---|
| Sheet folgt dem Finger | 1:1 | unverändert (Gesten-Bindung ist erlaubt) |
| Sheet rastet ein | Feder, ζ 0,85 bis 1,0 | Feder mit ζ 1,0, kein Überschwingen |
| Gummiband | wie Abschnitt 1 | unverändert, Rückfeder ζ 1,0 |
| Sheet klappt bei Kartenschieben ein | Feder | Feder ζ 1,0, response höchstens 0,3 s |
| Onboarding-Seitenwechsel | Wischen/Federn | Überblendung 150 bis 200 ms |
| Druckzustand | Skalierung 0,97 + Überlage 10 % | nur Überlage 10 % |
| Hinweise, Pulsieren, Dauerschleifen | optional | keine |
| Kartenzoom und -flug | animiert | ohne Animation (Leaflet-Optionen prüfen) |
| Haptik | an | unverändert, eigener Schalter |

```js
const mq = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = mq.matches;
mq.addEventListener('change', e => { reduced = e.matches; });
// Bei Federn: zeta = reduced ? 1 : zeta;  Seitenwechsel: reduced ? fade() : spring();
```

```css
@media (prefers-reduced-motion: reduce) {
  .btn:active { transform: none; }
  .page-enter { animation: fade-in 0.18s ease-out; }
}
```

- Die Dauer 150 bis 250 ms für Standard-UI stammt aus Q36 (Meinung). Die Überblendung bei `reduce` leite ich daraus ab.

### Belege

Q16, Q27, Q29, Q33, Q36.

### Nicht geprüft

- Ob iOS-„Bewegung reduzieren“ und Android-„Animationen entfernen“ in Safari iOS und Chrome Android sicher die Media Query setzen. MDN sagt Baseline. Gerätetest fehlt.
- Die iOS-Einstellung „Überblendung bevorzugen“. Nicht gelesen.
- Leaflet-Optionen für Zoom-/Fade-/Marker-Animation und Trägheit. Nicht gelesen.
- Chrome-Version für View Transitions. Nicht geprüft.
- Ob ein manueller App-Schalter „Bewegung reduzieren“ nötig ist. Eine Empfehlung wäre, ihn anzubieten (HIG Motion: optional). Nicht belegt, wie viele Personen ihn brauchen.

---

## 7. Quellen

Alle Seiten abgerufen am 24.10.2026. „Ohne Datum“ heißt: Seite ohne Datum.

| Kürzel | Quelle | Datum |
|---|---|---|
| Q1 | Apple HIG Sheets, https://developer.apple.com/design/human-interface-guidelines/sheets.md | letzter Eintrag im Änderungsprotokoll 24.03.2026 |
| Q2 | WWDC21 10063, Customize and resize sheets in UIKit, https://developer.apple.com/la/videos/play/wwdc2021/10063/ (nur Code-Beschriftungen gelesen) | Jahr 2021 laut URL, sonst ohne Datum |
| Q3 | WWDC23 10158, Animate with springs, https://developer.apple.com/videos/play/wwdc2023/10158/ ; Notizen https://wwdcnotes.com/notes/wwdc23/10158 | Jahr 2023 laut URL, sonst ohne Datum |
| Q4 | SwiftUI `Animation.default`, https://developer.apple.com/documentation/swiftui/animation/default.md | ohne Datum |
| Q5 | SwiftUI `Spring`, https://developer.apple.com/documentation/swiftui/spring.md | ohne Datum |
| Q6 | SwiftUI `interpolatingSpring(duration:bounce:initialVelocity:)`, https://developer.apple.com/documentation/swiftui/animation/interpolatingspring(duration:bounce:initialvelocity:).md | ohne Datum |
| Q7 | SwiftUI `Animation` und `Animation.spring`, https://developer.apple.com/documentation/swiftui/animation.md ; https://developer.apple.com/documentation/swiftui/animation/spring.md | ohne Datum |
| Q8 | WWDC18 803, Designing Fluid Interfaces, https://developer.apple.com/wwdc18/803 (Transkript) | Jahr 2018 laut URL, sonst ohne Datum |
| Q9 | Nathan Gitter, Building Fluid Interfaces, https://medium.com/@nathangitter/building-fluid-interfaces-ios-swift-9732bb934bf5 | 05.08.2018 |
| Q10 | How UIScrollView works, https://teletype.in/@swift-discipline/how-uiscrollview-works | 25.05.2025 |
| Q11 | Material Components Android, Bottom Sheet (Spiegel), https://gitea.com/784622644/material-components-android/src/branch/master/docs/components/BottomSheet.md | ohne Datum |
| Q12 | MDN `linear()`, https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/linear | zuletzt geändert 18.04.2026 |
| Q13 | caniuse linear() easing, https://caniuse.com/wf-linear-easing | Nutzungsdaten StatCounter 09/2026 |
| Q14 | Chrome for Developers, linear() easing, https://developer.chrome.com/docs/css-ui/css-linear-easing-function | zuletzt aktualisiert 25.05.2023 |
| Q15 | Safari 17.4 Release Notes, https://developer.apple.com/documentation/safari-release-notes/safari-17_4-release-notes.md | veröffentlicht 05.03.2024 |
| Q16 | Safari 18 Release Notes, https://developer.apple.com/documentation/safari-release-notes/safari-18-release-notes.md | veröffentlicht 16.09.2024 |
| Q17 | WebKit Bug 271711, https://bugs.webkit.org/show_bug.cgi?id=271711 | gemeldet 26.03.2024, behoben 27.03.2024 |
| Q18 | WebKit Bug 285120, https://bugs.webkit.org/show_bug.cgi?id=285120 | gemeldet 23.12.2024, behoben 03.01.2025 |
| Q19 | MDN `Navigator.vibrate()`, https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate | zuletzt geändert 30.11.2025 |
| Q20 | caniuse `navigator.vibrate`, https://caniuse.com/mdn-api_navigator_vibrate | ohne Datum |
| Q21 | WebHaptics-Artikel, https://azukiazusa.dev/en/blog/ios-safari-web-haptics | 04.03.2026 |
| Q22 | Ionic-Issue 29942, https://github.com/ionic-team/ionic-framework/issues/29942 | ohne Datum |
| Q23 | iOS Haptics Tester, https://rapidtoolset.com/en/tool/ios-haptics-tester | erstellt 30.04.2026, geändert 08.05.2026 |
| Q24 | ios-haptics README 3.1.1, https://unpkg.com/ios-haptics@3.1.1/README.md | ohne Datum |
| Q25 | Apple HIG Playing haptics, https://developer.apple.com/design/human-interface-guidelines/playing-haptics.md | letzter Eintrag 07.05.2024 |
| Q26 | Apple HIG Onboarding, https://developer.apple.com/design/human-interface-guidelines/onboarding.md | letzter Eintrag 10.06.2024 |
| Q27 | Apple HIG Motion, https://developer.apple.com/design/human-interface-guidelines/motion.md | letzter Eintrag 09.09.2025 |
| Q28 | Apple HIG Privacy (Spiegel), https://glama.ai/mcp/servers/@tmaasen/apple-dev-mcp/blob/b82f0efe2115dc4539c83a2374a714a84aeb350a/content/universal/privacy.md | Spiegel „zuletzt aktualisiert 20.07.2025“ |
| Q29 | Apple HIG Accessibility (Spiegel), https://glama.ai/mcp/servers/@tmaasen/apple-dev-mcp/blob/b82f0efe2115dc4539c83a2374a714a84aeb350a/content/universal/accessibility.md | Seitenhinweis 09.06.2025, Spiegel 20.07.2025 |
| Q30 | NN/g, Mobile Tutorials, https://www.nngroup.com/articles/mobile-tutorials/ | 08.03.2020 |
| Q31 | NN/g, Onboarding: Skip it When Possible, https://www.nngroup.com/videos/onboarding-skip-it-when-possible/ | 15.01.2021 |
| Q32 | NN/g, 3 Ways to Onboard New Users, https://www.nngroup.com/videos/onboarding-new-users/ | 30.07.2021 |
| Q33 | MDN `prefers-reduced-motion`, https://developer.mozilla.org/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion | zuletzt geändert 10.06.2026 |
| Q34 | WebKit-Blog, More Responsive Tapping on iOS, https://webkit.org/blog/5610/more-responsive-tapping-on-iOS/ | 15.12.2015 (geändert 23.03.2016) |
| Q35 | Flutter `state.json` (M3-Zustandsebenen), https://flutter.googlesource.com/mirrors/flutter/+/df64ca0b111147d4ebc71bc8775823617faa82e4/dev/tools/gen_defaults/data/state.json | ohne Datum |
| Q36 | Emil Kowalski, Agents with taste, https://emilkowal.ski/ui/agents-with-taste | ohne Datum, Meinungsseite |
| Q39 | Eigenes Repo, `/home/claude/fasan-camera/CLAUDE.md` (Regel: Ziele mindestens 9,6 mm / 60 dp) | ohne Datum, lokale Datei |

## 8. Grenzen dieser Recherche

- 35 Suchen. Weitere Seiten über WebFetch. Direkte curl-Abrufe sind in dieser Umgebung gesperrt. Ich habe nichts umgangen.
- Material 3 (m3.material.io) habe ich nicht direkt gelesen. Die Material-Werte stammen aus der Android-Komponenten-Doku (Q11) und einer Flutter-Datei (Q35).
- Die Drittseiten Q21 bis Q24 zur iOS-Haptik sind sekundär. Der Stand nach iOS 26.5 ist unbelegt.
- Alle Zahlen im Abschnitt „Empfehlung“ sind Startwerte. Sie gehören auf ein echtes iPhone und ein echtes Android-Gerät, bevor sie in `ENTSCHEIDUNGEN.md` landen.
