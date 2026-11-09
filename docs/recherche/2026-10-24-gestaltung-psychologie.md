# Gestaltung aus Wahrnehmungspsychologie und HCI: Folgen für die Fasan Karte

Stand: 2026-10-24. Eine Recherche, 40 Websuchen und rund 55 Seitenabrufe (etwa 12 davon gesperrt oder leer).
Zielgruppe: 6 Reisende in Lissabon, 3 davon über 60. Mobile Web-App, draußen, oft im Gehen.

Lesehinweis:

- **Beleg** heißt: steht so in der Quelle. Das Kürzel (G1 …) verweist auf Abschnitt 12.
- **Folgerung** heißt: mein Schluss aus Belegen. Kein Zitat. Zahlen darin sind Vorschläge zum Prüfen am Gerät.
- **Nicht geprüft** heißt: gesucht und nicht gefunden, oder nicht lesbar, oder nur aus der Erinnerung bekannt.
- „KUX-F8“ und „NG-Q8“ verweisen auf die Belege in `2026-10-24-karten-ux.md` und `2026-10-24-natives-gefuehl.md`. Das dort Gesagte wiederhole ich nicht.
- Die Seiten wurden per WebFetch gelesen. Ein kleines Modell fasst sie dabei zusammen. Wo die Zusammenfassung unstimmig war, steht es dabei.
- Rechnungen (Kontrast, Schriftwinkel) sind meine eigenen. Sie sind je Zeile als „Rechnung“ gekennzeichnet.

---

## 0. Kurzfassung: 15 Regeln mit Beleg

1. **Pro Ansicht eine laute Sache.** Nur die Hauptaktion und die aktuelle Auswahl sind farbig gefüllt. Alles andere ist ruhig.
   Beleg: G1. Ein Ziel fällt auf, wenn es sich in einem Merkmal von den anderen unterscheidet. Je mehr verschiedene Ablenker, desto schlechter. Einen festen Höchstwert für Hervorhebungen nennt G1 nicht.
   Folgerung: Höchstens eine gefüllte Farbfläche je Blatt-Stufe. Der Wert „eine“ ist mein Vorschlag, nicht belegt.

2. **Gruppieren mit Abstand, nicht mit Rahmen.** Innen enger als außen. Rahmen oder Karte nur bei gemischtem Inhalt. Keine vollbreiten Farbflächen in Listen.
   Beleg: G2 (Nähe überstimmt Farbe und Form). G3 (Container nur, wenn Weißraum nicht reicht; vollbreite Abschnitte wirken wie „falsche Böden“).

3. **Wenige gleichrangige Wahlpunkte je Ebene (höchstens etwa 4), Rest eine Ebene tiefer.** Lange Listen sind erlaubt, wenn sie gruppiert und sortiert sind.
   Beleg: G4 (etwa 4 Einheiten im Arbeitsgedächtnis, nur für vertraute Einheiten). G5 (Hick-Gesetz taugt in der Oberflächengestaltung wenig als Zahlenregel). G6 (Wahlüberlastung im Mittel praktisch null, aber stark streuend). G7 (Nebensächliches auf Unterebene). G8 (Ältere: Überfrachtung ist ein Problem).
   Folgerung: Die „4“ ist abgeleitet, kein Studienwert für Knöpfe.

4. **Rückmeldung nach Zeitstufen.** Unter 1 s: keine Anzeige. 1 bis 10 s: Hinweis mit Wort am betroffenen Teil. Über 10 s: Fortschritt mit Schätzung, dazu ein Ausweg.
   Beleg: G9, G10 (0,1 / 1 / 10 s). G12 (unter 1 s weder Spinner noch Skeleton; 2 bis 10 s Spinner oder Skeleton; über 10 s Balken). G11 (400 ms, nur aus Sekundärquelle).
   Folgerung: Hinweis frühestens nach etwa 0,4 s, damit nichts flackert. Der Wert ist nicht belegt.

5. **Skeleton nur für ganze Ansichten. Spinner nur mit Wort. Kein Spielzeug im Warten.**
   Beleg: G12 (Skeleton „exclusively for full-page loads“). G14 (vage Wörter wie „loading“ vermeiden; Anzeigetyp nicht wechseln; Spiegel, nicht am Original geprüft). G13 (n = 410: wahrgenommene Wartezeit unterschied sich nicht zwischen Balken, Lesen und Wischen).
   Nicht geprüft: Studien zu optimistischer Anzeige. Keine gefunden.

6. **Status immer sichtbar, in Worten, mit Uhrzeit.** Drei Zustände für jede Live-Angabe: aktuell, veraltet, offline. Nie nur Farbe.
   Beleg: G30 (Farbe nicht als einziges Mittel; „many older users do not see color well“). G8 (kleine Änderungen für Ältere auffällig machen, Stichwort „change blindness“). G16 (Aussehen und Aufbau prägen Urteile über Glaubwürdigkeit, 46,1 % der Kommentare).
   Nicht geprüft: Studie speziell zu „veraltet“-Hinweisen. Keine gefunden. Der Rest ist Folgerung.

7. **GPS-Genauigkeit zeigen: Kreis mit Radius und Wort „ungenau, ±80 m“.** Nicht „du bist hier“ behaupten, wenn der Kreis groß ist.
   Beleg: G15 (accuracy = Radius in Metern, 95 % Vertrauensniveau).
   Folgerung: Schwelle für das Wort: die 50 m aus `ENTSCHEIDUNGEN.md` (Stadtführer). Das ist die eigene Entscheidung, kein Studienwert.

8. **Rückgängig statt Bestätigungsdialog.** Dialog nur bei Unumkehrbarem, dann mit dem Verb der Handlung („Gruppe verlassen“).
   Beleg: G17 (Gewohnheit: Dialoge werden reflexhaft bestätigt; Essay ohne Zahlen). G18 (fMRI: visuelle Aktivität sinkt bei Wiederholung; Gewöhnung liegt am Gehirn, nicht an Faulheit; Sicherheitswarnungen). KUX-F8 (Li 2017).
   Einordnung: G17 ist ein Essay. G18 betrifft Sicherheitswarnungen. Die Übertragung auf App-Dialoge ist eine Analogie.

9. **Kontrast draußen mit Reserve: Text mindestens 7:1, Nebentext mindestens 7:1, Bedienränder mindestens 3:1.**
   Beleg: G23 (4,5:1 gedacht für etwa 20/40 Sehen und Alterung; 7:1 für etwa 20/80; Umgebungslicht kommt als Betrachtungsbedingung nicht vor). G20 (bei 15.000 lx bevorzugten Beobachter einen hohen Hell-Dunkel-Unterschied). G26 (Testlicht 2012: Kontrast von Handys auf etwa 1,2 bis 3,3 gefallen).
   Folgerung: Helles Tageslicht verschleiert Kontrast (Rechnung in 6.1). Darum AAA (7:1) als Untergrenze draußen, nicht AA.

10. **Helle Oberfläche mit dunkler Schrift als Tag-Standard. Dunkel und Kontrast-Profil als Wahl anbieten.**
    Beleg: G21 (positive Polarität in allen Studien im Vorteil, auch für Ältere, dort kleiner; Labor im Dunkeln). G20 (ab 3.000 lx bevorzugten die Beobachter weiße Hintergründe; unter 1.500 lx schwarze). G22 (kein allgemeiner Sieger; individuelle Unterschiede; beide Paletten anbieten).
    Einordnung: G20 mit Beobachtern von 20 bis 25 Jahren, Komfort statt Leistung. G22 ohne Umgebungslicht.

11. **Farbe nie allein.** Jede Farbbedeutung bekommt Symbol, Zahl oder Wort. Höchstens 7 Kategorienfarben. Rot und Grün nie als einziges Paar.
    Beleg: G30. G32 (etwa 8 % der Männer, 0,5 % der Frauen; Sekundärquelle). G31 (Unterscheiden kleiner Farbunterschiede nimmt mit dem Alter ab, am stärksten blau-gelb). G1 (bis zu 7 Farben gleicher Helligkeit schnell unterscheidbar). G33 (Farbe durch Form, Unterstreichung, Rahmen ergänzen).
    Ist-Stand: 8 Kategorienfarben, darunter Rot (Essen) und Grün (Veggie). Symbole nach Typ gibt es schon (siehe 10).

12. **Schrift: Fließtext 18 px, Nebentext 16 px, nichts Lesenswertes unter 14 px. Skalierbar (rem).**
    Beleg: G25 (Lesen ist schnell ab einer „kritischen Druckgröße“ von etwa 0,2° x-Höhe; Ältere leiden stärker bei schlechtem Licht, Blendung, schwachem Kontrast).
    Rechnung: Bei 1 CSS-px ≈ 0,16 mm (Annahme, nicht gemessen) und 40 cm Abstand ist die x-Höhe bei 16 px etwa 0,18° und bei 18 px etwa 0,20°. 14 px liegt bei etwa 0,16°.

13. **Wörter: kurz, wörtlich, bekannt. Verb im Knopf. Symbol immer mit Wort. Fehlertext: was passiert ist, was erhalten blieb, was jetzt zu tun ist.**
    Beleg: G43 (COGA-Entwurf 2020: Muster „Use Clear Words“, „Use Literal Language“, „Make it Easy to Undo Form Errors“, „Provide Feedback“; nur Überschriften gelesen). G8 (Pop-ups ganz zeigen; keine Doppelklicks). KUX-F6 (Wort statt Symbol).
    Einordnung: COGA betrifft kognitive Einschränkungen, nicht Alter an sich. G8 ist ein Entwurf von 2008.

14. **Im Gehen: kurze Hinweise, Ansage als Zusatz, nichts Tippendes erzwingen, nichts Neues vor Kreuzungen.**
    Beleg: G37 (Texten am stärksten schädlich: weniger Blick nach links und rechts, mehr Beinahe-Unfälle; Musik hören nicht; Beweislage mit Qualitätsmängeln). G40 (25 % bemerkten den Clown mit Handy, über 50 % ohne). G39 (Ältere zahlen beim Gehen und Texten draußen einen höheren Preis; 20 Ältere, eher fit). G42 (gesprochene Ansage: 3 Fehler, Vibration: 3, Standard-Vibrationsnavi: 8; 12 Personen).
    Folgerung: „Nichts Neues vor Kreuzungen“ ist ohne Beleg.

15. **Ruhige, einheitliche Optik hilft Vertrauen. Sie ersetzt keine Bedienbarkeit. Den Tagesabschluss bewusst gestalten.**
    Beleg: G34 (attraktiv wirkt nutzbarer, kann Probleme verdecken, verzeiht nur kleine Fehler). G35 (60 Jugendliche: schöne Variante höher bewertet und schneller). G36 (Meta-Analyse: Peak-End-Effekt groß, r = 0,581, aber vergleichbar mit dem Durchschnitt; Dauer ohne Effekt).
    Einordnung: Kein Beleg für Ältere oder für Reise-Apps. Peak-End ist Laborbefund.

---

## 1. Präattentive Merkmale, Hierarchie, Gestaltgesetze

### Beleg

- Aufgaben auf großen Anzeigen, die in unter 200 bis 250 ms gelingen, gelten als präattentiv. Das ist ein Blick. (G1, Abschn. 2)
- Der Text nennt als präattentiv: Farbton, Krümmung, Ausrichtung, Linienlänge, Größe, Dichte, Regelmäßigkeit. Die vollständige Liste steht in Abb. 2 und kam im Abruf nicht mit. (G1)
- Serielle Suche kostet etwa 40 bis 50 ms je Element. (G1, Abschn. 4.2)
- „Most conjunction targets cannot be detected preattentively.“ Ziele, die sich erst in der Kombination zweier Merkmale unterscheiden, werden meist seriell gesucht. (G1, Abschn. 2)
- Farbe wirkt stärker als Form. Die Störung ist asymmetrisch. (G1, Abschn. 3.7)
- Zufällige Farbtonschwankungen verschlechterten das Erkennen von Größe und Dichte. (G1, Abschn. 5.1.1)
- Je ähnlicher Ziel und Ablenker, desto langsamer die Suche. Je unähnlicher die Ablenker untereinander, desto langsamer die Suche. Beispiel im Text: 4,5 ms gegen 54,5 ms je Ablenker. (G1, Abschn. 3.3)
- „Viewers can rapidly choose between up to seven isoluminant colors.“ (G1, Abschn. 5.1.1)
- Das Wichtigste soll das auffälligste Merkmal bekommen. Nebenwerte dürfen es nicht verdecken. (G1, Abschn. 3.7)
- Eine feste Zahl erlaubter Hervorhebungen nennt G1 nicht.
- Nähe: „Items close together are likely to be perceived as part of the same group.“ Nähe „can overpower competing visual cues such as similarity of color or shape“. (G2)
- Gemeinsamer Bereich: Rahmen oder Hintergrund bilden eine Gruppe. Das ist stark, wenn Weißraum nicht reicht, etwa bei gemischtem Inhalt. Zu viele Rahmen machen das Bild unruhig. Vollbreite Farbbänder können „false floors“ erzeugen, die zum Aufhören beim Scrollen verleiten. (G3)

### Folgerung

- Antwort auf „Wie viele Hervorhebungen?“: Ein belegter Höchstwert fehlt. Belegt ist nur der Mechanismus. Jede weitere laute Sache macht die anderen leiser. Darum: eine Hauptaktion je Zustand, eine Auswahl, der Rest ruhig.
- Rangfolge der Mittel: Farbfläche (laut), Größe und Gewicht (mittel), Text und Umriss (leise). Das Wichtigste bekommt das lauteste Mittel, nicht mehrere.
- Die Kategorienfarben der Pins sind Farbton-Schwankung. Nach G1 5.1.1 können sie das Erkennen von Größe und Dichte stören, zum Beispiel von Häufungen. Die Farben dürfen also nur ein Zusatz sein. Symbol und Nummer tragen die Bedeutung.
- Listenzeile: Abstand innerhalb einer Zeile kleiner als zwischen Zeilen. Beispiel 8 px innen, 16 px zwischen den Zeilen. Die Zahlen sind mein Vorschlag, nicht belegt.
- Ortskarte im Blatt: Bild, Titel, Angaben in einer Karte. Die Gruppe „Zeiten“ und die Gruppe „Aktionen“ durch Abstand trennen, nicht durch Linien.
- Keine vollbreiten, farbigen Zwischenbänder in der Ortsliste. Sie könnten als Listenende gelesen werden.

### Nicht geprüft

- Originale: Treisman und Gelade 1980, Wolfe, Palmer 1992 zu „common region“.
- Gesetz der Verbundenheit und der Fortsetzung. Ob eine Linie zwischen nummerierten Pins die Reihenfolge trägt, ist plausibel, aber ohne gelesene Quelle.
- Abb. 2 aus G1 (vollständige Merkmalsliste).

---

## 2. Kognitive Last

### Beleg

- Cowan: Eine zentrale Grenze von etwa vier Einheiten („chunks“). Bevölkerungsmittel 3 bis 5, einzelne 2 bis 6. Sie gilt, wenn Umcodieren in größere Einheiten verhindert ist. Miller (1956) „was meant more as a rough estimate and a rhetorical device than as a real capacity limit“. (G4)
- Hick-Gesetz: Die Anwendung auf HCI sei umstritten und „often misunderstood“. Das Reiz-Reaktions-Muster passt selten zu HCI-Aufgaben. Für die meisten Aufgaben darf die Wahlzeit als konstant gelten. Das Gesetz stütze nicht „weniger ist mehr“. Für Gestaltung sei Blicksuche und Entscheidung wichtiger als Hick. (G5, nur Abstract gelesen)
- Wahlüberlastung: 63 Bedingungen aus 50 Experimenten, N = 5.036. Mittlerer Effekt „virtually zero“, mit großer Streuung zwischen den Studien. Bedingungen, unter denen sie auftritt, nennt die Seite nicht. (G6)
- Stufenweise Offenlegung: Sekundäres kommt auf einen Unterbildschirm, damit man zunächst nur Primäres sieht. Das macht Programme leichter lernbar und weniger fehleranfällig. (G7)
- Ältere: Überfrachtung, ablenkende Werbung und Bewegung, wechselnde Layouts und Navigation sind in der Literatur Probleme. Inhalt, Darstellung und Navigation wurden am meisten betont. (G8, Entwurf 2008)

### Folgerung

- „Wie viele Optionen je Ansicht?“ Eine belegte Zahl gibt es nicht. Brauchbar sind zwei Regeln. Erstens: Was man sich merken muss, höchstens etwa 4 Einheiten (G4). Zweitens: Was man nur auswählt, darf mehr sein, wenn es sortiert und gruppiert ist (G5, G6).
- Konkret: Das Blatt zeigt in Mini und Klein höchstens 3 bis 4 Aktionen. Das Gruppieren der Filter in „Wann“, „Was“, „Wo“ ist eine Ableitung aus Chunking. Alles Seltene in „Mehr“. (Vorschlag.)
- Der Kern der Tagesroute: Stopps als nummerierte Kette. Wer unterwegs sieht, soll nur „jetzt“ und „als Nächstes“ im Kopf halten.
- Hick nicht als Argument für „möglichst wenige Knöpfe“ zitieren. G5 sagt das Gegenteil.

### Nicht geprüft

- Hick 1952 und Hyman 1953 als Originale. Schneider und Anderson 2011 tauchte nur in einer Trefferliste auf.
- Miller 1956 als Original.
- Die Bedingungen für Wahlüberlastung in G6 (Seite nannte sie nicht).
- Studien zu Tabs, Chips oder Blättern mit Älteren.

---

## 3. Rückmeldezeiten

### Beleg

- 0,1 s fühlt sich sofort an, „direct manipulation“. 1 s hält den Gedankengang, man bemerkt die Verzögerung, behält aber die Kontrolle. 10 s ist die Grenze der Aufmerksamkeit. Danach denkt man an anderes. (G9, Nielsen, 2010-06-20)
- Die genauen Grenzen „vary by usage circumstances“. (G10, Nielsen, Video, 2019-10-25)
- 400 ms: Laut Laws of UX gehe die Zahl auf Doherty und Thadani zurück, 1982, und ersetze 2 s als Zielwert. Tipps dort: Rückmeldung innerhalb von 400 ms, Fortschrittsbalken machen Warten erträglicher auch bei ungenauer Anzeige. (G11, sekundär)
- Skeleton und Spinner nach NN/g (Tankala, 2023-06-04, geprüft 2026-09-02): unter 1 s unnötig und ablenkend; 2 bis 10 s Spinner oder Skeleton, Spinner für ein einzelnes Modul, Skeleton für volle Seiten; über 10 s Fortschrittsbalken mit Schätzung; Nicht-Seiten-Prozesse wie Uploads: Balken. Animation kann ablenken. Skeleton ersetzt keine Geschwindigkeit. (G12)
- Die einzige in G12 zitierte Studie (Mejtoft, Långström, Söderström 2018) wird nicht zusammengefasst. Die Aussagen beruhen also auf NN/g-Leitlinie, nicht auf berichteten Ergebnissen. (G12)
- Experiment, n = 410, Buchungs-App: Balken ohne Aktivität, Lesen, Wischen. Wahrgenommene Wartezeit ohne signifikanten Unterschied. Geschätzte Zeit: Lesen länger (10,5 s gegen 7,7 s). Freude: Balken allein am schlechtesten. Die Zusammenfassung des Abrufs nannte zwei gleiche Mittelwerte, wohl ein Druckfehler. (G13)
- Apple (Spiegel): Bestimmt, wenn die Dauer klar ist; unbestimmt bei Unquantifizierbarem. Nicht zwischen Kreis und Balken wechseln. „Avoid vague terms like loading“. Ein unbestimmter Anzeiger hilft nicht beim Abschätzen. (G14)

### Folgerung (Vorschlag, Werte nicht belegt)

| Dauer | Anzeige | Beispiel in der Karte |
|---|---|---|
| bis 0,1 s | Druckzustand (siehe NG-Q8) | Merken, Erledigt |
| bis etwa 1 s | nichts | Blatt öffnen, Filter anwenden |
| 1 bis 10 s | Wort am betroffenen Teil, Spinner | „Weg wird berechnet“ |
| ganze Ansicht, 2 bis 10 s | Skeleton der Liste | erster Start, Datenabruf |
| über 10 s | Balken mit Schätzung und „Abbrechen“ | Kartenpaket, Kassenzettel lesen |
| nach 10 s ohne Ergebnis | Ausweg anbieten | „Luftlinie zeigen“ statt Warten |

- Der Ausweg nach 10 s folgt aus G9 (Aufmerksamkeitsgrenze) und passt zur bestehenden Regel, bei Routing-Ausfall die Luftlinie zu zeigen.
- Nichts zum Zeitvertreib einbauen (G13).
- Lokale Aktionen (Merken, Erledigt, Ausblenden) brauchen kein „optimistisches UI“. Die Daten liegen im Gerät, das Ergebnis ist sofort da. Bei geteilten Markierungen (Live-Abgleich) zeigt die App den eigenen Stand sofort. Der Abgleich läuft im Hintergrund. Fehlt der Abgleich, zeigt ein kleiner Status „noch nicht bei allen“ (siehe 4).

### Nicht geprüft

- Studien zu optimistischer Anzeige. Keine gefunden.
- Doherty und Thadhani im Original. Die IBM-Seite zeigt nur Titel, Formnummer GE20-0752-00 und Jahr 1982. Laws of UX nennt „IBM Systems Journal“. Welche Angabe stimmt, ist ungeklärt. Der 400-ms-Text ist ungelesen.
- NN/g „Progress Indicators Make a Slow System Less Insufferable“ (Abruf gesperrt). Material-Design-Seite und Apple-HIG-Original waren nicht lesbar (Skript nötig, Seite nicht freigegeben).

---

## 4. Sichtbarkeit des Systemstatus und Vertrauen

### Beleg

- GPS: `accuracy` ist der Radius in Metern „with a 95% confidence level“. Die Seite sagt nichts darüber, wie gut der Wert in der Praxis ist. (G15, MDN)
- Aussehen und Aufbau: In einer Studie mit 2.684 Personen kam „design look“ in 46,1 % der Kommentare zur Glaubwürdigkeit vor. Das zeigt, was auffiel, nicht, was den Ausschlag gab. (G16, Consumer WebWatch, 2002-10-29)
- Ältere und „change blindness“: kleine Seitenänderungen auffällig machen. (G8)
- Farbe nicht als einziges Mittel. (G30)
- COGA-Entwurf (2020): Muster „Provide Feedback“ und „Avoid Data Loss and Time Outs“. Nur Überschriften gelesen. (G43)

### Folgerung

Zu Offline, veraltet und Synchronisation fand ich keine Studie. Die Regel stützt sich auf G8, G16, G30 und die allgemeine Linie „Zustand sichtbar machen“.

| Zustand | Zeichen | Beispieltext |
|---|---|---|
| aktuell | Häkchen oder nichts | „Stand 14:05“ |
| veraltet | Uhr-Symbol, Text, Rand | „Stand gestern 20:10, keine Verbindung“ |
| offline | Symbol und Text oben, bleibt stehen | „Offline. Karte und Orte funktionieren.“ |
| Gruppe verbunden | Zahl | „5 von 6 verbunden“ |
| Abgleich wartet | Uhr-Symbol | „Noch nicht bei allen angekommen“ |
| Standort ungenau | Kreis plus Wort | „Standort ungenau, ±80 m“ |

- Jede Live- oder Netzangabe trägt ihre Zeit und, wo es sie gibt, ihre Quelle. Das setzt die bestehende Entscheidung fort („Angaben tragen ihr Datum“).
- Zeit als Uhrzeit, nicht als „vor 3 Min.“, weil sie sich beim Lesen nicht verändert. (Vorschlag, ohne Beleg.)
- „Veraltet“ erst nach einer festen Frist je Datenart (Wetter, Öffnungszeiten, Gruppe). Die Fristen sind Entscheidung des Projekts, nicht Teil dieser Recherche.
- Der Statusstreifen bleibt an einer festen Stelle. Er verschiebt keine Bedienelemente. Wechselt er, ist die Änderung auffällig, aber nicht blinkend (G8).
- Vertrauen in Live-Daten: Zeigen, woher und wann. Fehlt das, stehen „keine aktuelle Info“ statt einer Zahl. Das ist schon Linie des Projekts (Preis- und Zeitangaben).

### Nicht geprüft

- Nielsens Heuristik „Visibility of system status“ im Wortlaut (Seite gesperrt).
- Studien zu „veraltet“-Hinweisen, Zeitstempeln, Offline-Streifen. Keine gefunden.
- Gestaltung des blauen Punkts mit Genauigkeitskreis bei Google und Apple. Nicht gelesen.
- Ob G16 (2002, Websites) auf eine Reise-App übertragbar ist.

---

## 5. Fehlervermeidung

### Beleg

- Nach vielen Klicks auf „OK“ klickt man reflexhaft erneut. Lautere oder schwerere Dialoge beschleunigen das Durchklicken. Raskin: „Never use a warning when you mean undo.“ Positives Beispiel: Gmail, gelöschte Mails bleiben mit Rückgängig im Papierkorb. Der Text ist ein Essay und nennt keine Zahlen. (G17, 2007)
- fMRI-Studie: Bei wiederholten Warnungen „neural activity in the visual processing centers sharply decreases“. Bei Sicherheitswarnungen stärker als bei normalen Programmbildern. Die Autoren: Gewöhnung liege am Gehirn, nicht an Faulheit. (G18, ICIS 2014)
- Bei häufigen Aktionen ist Rückgängig besser als Bestätigung. (KUX-F8, Li 2017)
- Zeitlimits: Nutzer können sie abschalten, anpassen (mindestens das Zehnfache) oder verlängern (Warnung davor, mindestens 20 s, mindestens zehnmal). Menschen mit Einschränkungen „often need more time to react“. Ältere nennt die Seite nicht. (G19, WCAG 2.2.1)
- COGA-Entwurf: Ziel 4 „Help Users Avoid Mistakes or Correct Them“, Muster „Make it Easy to Undo Form Errors“. Nur Überschriften gelesen. (G43)

### Folgerung

- Merken, Erledigt, Ausblenden, Abhaken, Stimme zurücknehmen: sofort ausführen, Rückgängig anbieten. Kein Dialog. (Das ist bereits Projektlinie.)
- Bestätigung nur bei Dingen, die nicht zurückzuholen sind, etwa „Gruppe verlassen“ (Schlüssel weg), „Alle Daten löschen“. Dann mit dem Verb im Knopf, nicht „OK“ und „Abbrechen“.
- Ein Rückgängig-Hinweis ist faktisch ein Zeitlimit. Ob WCAG 2.2.1 ihn erfasst, ist Auslegung (nicht geprüft). Die einfachste Lösung ohne Frist: Die letzten Aktionen stehen in einer Liste „Zuletzt“ und bleiben dort rückgängig zu machen. Der kurze Hinweis ist dann nur eine Abkürzung.
- Vermeiden statt warnen: Eingaben so beschränken, dass der Fehler nicht entsteht. Beispiel aus dem Projekt: Kosten werden nur gespeichert, wenn die Summen genau stimmen.
- Ausgeblendetes bleibt auffindbar („Ausgeblendete zeigen“, siehe KUX-Regel 10). Wer etwas nicht mehr sieht, glaubt sonst an Verlust.

### Nicht geprüft

- Nielsens Heuristiken 3 und 5 im Wortlaut (Seite gesperrt).
- Budiu zu Bestätigungsdialogen (NN/g). Brustoloni und Villamarín-Salomón 2007. Beide nicht gesucht.
- Ob WCAG 2.2.1 auf einen verschwindenden Rückgängig-Hinweis anzuwenden ist.
- Die längere fMRI-Arbeit (MISQ) aus der Trefferliste. Nicht gelesen.

---

## 6. Lesbarkeit draußen

### 6.1 Kontrast über WCAG hinaus

**Beleg**

- 4,5:1 soll den Verlust an Kontrastempfindlichkeit bei Sehen von etwa 20/40 ausgleichen, auch den „that typically accompanies aging“. 7:1 entspricht etwa 20/80. 3:1 ist das Minimum nach ISO 9241-3 und ANSI/HFES 100-1988. Umgebungslicht als Betrachtungsbedingung behandelt die Seite nicht. (G23, WCAG 2.2, Understanding 1.4.3)
- Tablet, 9,7 Zoll, 24 Beobachter von 20 bis 25 Jahren, Umgebungslicht 150, 1.500 und 15.000 lx. Bei 15.000 lx („observers tend to prefer a high text-background lightness difference“) war Schwarz auf hellem Grau (L* 75) am komfortabelsten. Unter 1.500 lx bevorzugte man schwarze Hintergründe, bei 3.000 und 15.000 lx weiße. Gemessen wurde Komfort, nicht Leseleistung, im Messraum. (G20, 2021)
- Lichttest 2012 mit fester Studiobeleuchtung („simulate sunlight“): Kontrastverhältnisse der damaligen Handys zwischen 1,2 und 3,3. Lux-Wert nicht genannt. (G26)
- NIST-Arbeit 2005 zur Messung von Kontrast bei Tageslicht und Sonne. Nur das Abstract gelesen, ohne Zahlen. (G27)
- APCA ist ein Wahrnehmungsmodell des W3C-Silver-Kreises. Die Seite (Stand 2023-11-20) nennt WCAG 2 „completely out of line with perception“, gibt Zuordnungen 3:1 ≈ Lc 45, 4,5:1 ≈ Lc 60, 7:1 ≈ Lc 75 und ist eine Benutzerseite, kein Standard. (G24)

**Folgerung**

- Warum Reserve: Helles Licht, das am Glas zurückgeworfen wird, legt einen Schleier über Hell und Dunkel. Das Verhältnis schrumpft. Rechnung mit angenommenem Schleier A (kein Messwert): effektiv = (Y_hell + A) / (Y_dunkel + A), Y relativ zu Weiß. Für einen Entwurf mit 4,5:1 und A = 0,2 bleiben etwa 3,1:1. Mit 7:1 etwa 4,0:1. Mit 10:1 etwa 4,7:1. Mit 21:1 etwa 6,0:1.
- Darum: Text mindestens 7:1 (AAA), Haupttext möglichst 10:1 oder mehr. Bedienränder und Symbole mindestens 3:1 (WCAG 1.4.11 nicht gelesen, Seite gesperrt; der Wert 3:1 steht in G23 für Text und ist hier für Ränder angenommen).
- Das „Gut lesbar“-Profil und das Kontrast-Theme sind der richtige Ort für diese Werte. Das Standard-Theme sollte sie auch für Nebentext erfüllen (siehe 10).
- APCA: nur als Zweitprüfung nutzen, nicht als Vorgabe. Status in WCAG 3 im Oktober 2026: nicht geprüft.

### 6.2 Hell oder Dunkel

**Beleg**

- Positive Polarität (dunkle Schrift, heller Grund) war in allen drei Experimenten im Vorteil. Der Vorteil wuchs, je kleiner die Schrift war, und kam mit der höheren Leuchtdichte (kleinere Pupille). Bei Älteren war er kleiner, aber vorhanden. Getestet im dunklen Raum. „dark characters on light background is recommended independent of an observer’s age“. (G21, Dissertation Piepenbrock 2014; darin Piepenbrock, Mayr, Mund, Buchner 2013, Ergonomics 56:1116–1124)
- Crowd-Studie, Prolific, unter 60 gegen ab 60, Balken-, Linien-, Streudiagramme: kein allgemeiner Sieger. Bei Genauigkeit war bei den Älteren für 48,1 % Hell besser, für 38,5 % Dunkel. Bei Jüngeren 30,7 % gegen 55,8 %. Die bessere Leistung deckte sich nicht immer mit dem Wunsch. Empfehlung: beide Paletten anbieten. Kein Beleg für eine Altersabhängigkeit. Umgebungslicht nicht untersucht. (G22, 2024)

**Folgerung**

- Tagsüber draußen: hell mit dunkler Schrift als Voreinstellung. Dunkel und „System“ bleiben wählbar, weil Wirkung und Wunsch individuell sind (G22).
- Der Wert „ab 3.000 lx weiß“ aus G20 ist an jungen Beobachtern gewonnen. Für Ältere nicht belegt.

### 6.3 Schrift

**Beleg**

- Die Lesegeschwindigkeit ist über einen Faktor 10 der x-Höhe maximal, etwa 0,2° bis 2°. Bei 40 cm sind das 1,4 mm (4 pt) bis 14 mm (40 pt). Unter der „kritischen Druckgröße“ (etwa 0,2°) sinkt die Geschwindigkeit stark, Lesen wird „slowed but does not stop“. Ältere „are more vulnerable to acuity reduction in poor lighting, in glare, or with low-contrast print“. Eine „Dreifach-Regel“ steht dort nicht. (G25, Legge und Bigelow 2011)
- Weitere Studien zu Schriftgrößen Älterer: schon in KUX-F9, KUX-F17, KUX-F18. Hier nicht wiederholt.

**Folgerung (Rechnung, nicht gemessen)**

- Annahme: 1 CSS-px ≈ 0,16 mm auf Handys. Diese Annahme deckt sich mit 60 dp ≈ 9,6 mm in der Fasan-Kamera-Regel, ist aber nicht an einem Gerät gemessen. x-Höhe ≈ 0,5 em.

| Schrift | x-Höhe | Winkel bei 35 cm | bei 40 cm | bei 45 cm |
|---|---|---|---|---|
| 14 px | 1,1 mm | 0,18° | 0,16° | 0,14° |
| 16 px | 1,3 mm | 0,21° | 0,18° | 0,16° |
| 18 px | 1,4 mm | 0,23° | 0,20° | 0,18° |
| 20 px | 1,6 mm | 0,26° | 0,23° | 0,20° |

- Danach liegt 16 px an der Grenze, 14 px darunter. Fließtext 18 px, Nebentext 16 px. Profil „Gut lesbar“ 20 px und mehr.
- Nebenbefund derselben Annahme: 44 CSS-px sind dann etwa 7 mm. Das liegt unter den 9,6 mm (60 dp) der Fasan-Regel und weit unter den 14 mm von KUX-F14. 14 mm sind etwa 88 CSS-px. Die offene Frage 5 aus `karten-ux.md` (Umrechnung mm in px) bleibt damit offen, bis jemand am Gerät misst.
- Schrift in `rem`, damit die Geräteeinstellung wirkt (KUX-Regel 7).

**Nicht geprüft**

- Messung am Gerät. Das tatsächliche Verhältnis px zu mm je Handy der Mitreisenden.
- Studien zu Schrift draußen mit Älteren. Keine gefunden.

### 6.4 Beschriftungen auf der Karte (Halo)

**Beleg**

- Die WCAG-Erläuterung zählt einen breiten Rand um Buchstaben, der innere Details füllt, als Hintergrund. Gemessen wird gegen den Hintergrund, auf dem der Text gewöhnlich steht. (G23)
- Esri-Kartograf (Skinner, 2021-11-30): Halos halten Beschriftungen auf unruhigem Grund lesbar, ohne den Grund zu verdecken. So dünn wie möglich, in der Hintergrundfarbe, eher mit Transparenz. Ein zu breiter Halo wird zum Klotz. Reiner Weißhalo auf nicht weißem Grund wirkt hart. Ziel: Man liest, ohne den Halo zu bemerken. Praxisrat, keine Studie. (G28)
- EU-Leitfaden Datenvisualisierung: helle Halos für dunkle Schrift und umgekehrt, von „subtle“ bis „very strong“. Beispiele BBC, Washington Post, FiveThirtyEight. Keine Studie, keine Breitenangabe. (G29, © 2023)
- Experimentelle Belege für Halos fand ich nicht.

**Folgerung**

- Leaflet mit Rasterkacheln: Die Beschriftungen der Kacheln sind im Bild und nicht änderbar. Ein Halo gibt es nur für eigene Beschriftungen (Pin-Nummern, Namen am Pin, Orte der Tagesroute). Technisch: `text-shadow` oder `paint-order: stroke` mit Strichbreite von etwa 2 bis 3 px (Vorschlag).
- Halo in der Hintergrundfarbe des Blattes oder der Kachel, Schrift dunkel. Kontrast der Schrift 7:1 gegen den Halo, nicht gegen die Kachel (nach G23).
- Wenige eigene Beschriftungen zeigen. Mehr Text auf der Karte verschlechtert die Auffälligkeit der Pins (siehe 1).
- Kachelstil mit höherem Kontrast prüfen. Ob ein solcher OSM-Stil frei zur Verfügung steht, ist nicht geprüft.

### 6.5 Farbfehlsichtigkeit und Alter

**Beleg**

- Etwa 8 % der Männer („1 in 12“) und 0,5 % der Frauen; andere Quelle: 7 % und 0,4 %. Etwa 99 % davon rot-grün. Zahlen aus Sekundärseiten (Colblindor, HHMI), nicht aus einer Primärquelle. (G32)
- „Color is not used as the only visual means of conveying information.“ „Many older users do not see color well.“ (G30)
- 185 Beobachter von 18 bis 75: Der Farbeindruck blieb weitgehend stabil. Das Erkennen kleiner Farbunterschiede nahm ab, am stärksten entlang der blau-gelben Achse. (G31, Wuerger 2013)
- Bericht zu einer für alle Farbsehtypen unterscheidbaren Farbwahl (Fahrpläne, Neun-Personen-Stichprobe): Farbe durch Kursiv, Unterstreichung, Rahmen ergänzen; Farbnamen angeben; weißer Grund. (G33)

**Folgerung**

- Rot und Grün nie als einziges Paar. Essen (rot) und Veggie (grün) sind im Ist-Stand ein solches Paar. Sie werden durch Symbole getragen. Das sollte so bleiben, auch im Text („vegetarisch“ als Wort).
- Zwischen blau und gelb braucht es bei Älteren mehr Abstand in der Helligkeit, nicht nur im Farbton. Das ist eine Ableitung aus G31 und nicht belegt.
- Zustandsfarben (ok, Warnung, Fehler) nur mit Symbol und Wort.

**Nicht geprüft**

- Okabe-Ito-Palette im Original (Seite gesperrt). Ich nenne keine Farbwerte.
- Simulation des Ist-Stands für Protanopie und Deuteranopie. Nicht gerechnet.
- NEI-Zahlen zur Häufigkeit (Seite gesperrt).

---

## 7. Ältere Nutzer über 60 (nur Neues)

Schon in den anderen Dateien: Zielgröße 14 mm (KUX-F14), Schriftgröße (KUX-F9, F18), Gesten (KUX-F13), Text mit Symbol (KUX-F6, F13), Dauerprobleme Kleinschrift und helle Schrift (KUX-F9).

### Beleg

- Kontrastbedarf wächst mit dem Alter, Mindestwerte siehe 6.1 (G23). „Many older users do not see color well“ (G30). Farbunterscheidung nimmt ab (G31). Ältere leiden stärker bei Blendung und schwachem Kontrast (G25).
- Hell mit dunkler Schrift half auch Älteren, der Vorteil war kleiner (G21).
- Gehen und Texten draußen: Ältere haben höhere Kosten (G39).
- Aus der Literaturübersicht der W3C (Entwurf 2008-08-21, Arch): Überfrachtung vermeiden; keine Fly-out-Menüs; keine Doppelklicks; Pop-ups mit voller Meldung; keine grellen Leuchtfarben; auf zusätzlichen Fettdruck und Unterstreichung verzichten; kleine Seitenänderungen deutlich machen. Die Übersicht stammt aus der Desktop-Zeit. (G8)
- COGA-Entwurf (2020): Muster „Use Clear Words“, „Use Literal Language“, „Explain Implied Content“, „Use Clear Visible Labels“. Nur Überschriften gelesen. (G43)

### Folgerung: Wortwahl und Texte (Vorschläge, nicht belegt)

- Kurze Sätze, ein Gedanke je Satz, das Verb vorn: „Ort merken“, „Weg zeigen“, „Rückgängig“.
- Wörter aus dem Alltag, keine Fachwörter: „Standort“ statt „Position“, „Gemerkt“ statt „Favorit“ (Projektentscheidung, Name schon gewählt), „Karte mit Orten“ statt „Layer“.
- Keine Abkürzungen im Fließtext. Uhrzeit und Datum ausgeschrieben („heute, 14:05“).
- Wörtlich schreiben, keine Bilder („Ort schließt in 20 Minuten“ statt „Zeit wird knapp“).
- Fehlertext in drei Teilen: Was ist passiert? Was ist erhalten? Was tun? Beispiel: „Kein Netz. Deine Orte sind gespeichert. Karte und Liste gehen weiter.“
- Symbol steht mit Wort. Wenn es eng wird, fällt zuerst das Symbol weg, nicht das Wort. (Gegen KUX-F6 nicht widersprüchlich: dort steht „Wort statt kryptisches Symbol“.)
- Keine Doppeltipps, kein langes Drücken als einziger Weg (G8, KUX-Regel 4).

### Nicht geprüft

- COGA im Wortlaut (nur Überschriften).
- Studien zu Wortwahl in Karten-Apps mit Älteren. Keine gefunden.
- Ob die Übersicht von 2008 (G8) für heutige Touch-Geräte noch gilt.

---

## 8. Emotion und Erinnerung: was ist belastbar?

### Beleg

- Peak-End, Meta-Analyse, 174 Effektstärken: Der Peak-End-Effekt auf die Gesamtbewertung ist „large (r = 0.581, 95% CI 0.487–0.661)“. Er ist vergleichbar mit dem Durchschnitt aller Episoden und stärker als Trend, Schwankung, erste Episode und tiefster Punkt. Dauer hatte laut Abruf kaum Einfluss („duration neglect“ gestützt). Die Zusammenfassung des Abrufs war an einer Stelle verworren; die Aussage zur Dauer ist daher mit Vorsicht zu lesen. (G36, Alaybek u. a., 2022)
- Ästhetik-Nutzbarkeit-Effekt (Moran, 2024-02-03, geprüft 2026-09-01): Man hält schöne Dinge für nutzbarer. Kurosu und Kashimura 1995: 26 Geldautomaten-Entwürfe, 252 Personen, Schönheit hing stärker mit gedachter als mit tatsächlicher Bedienbarkeit zusammen. Der Effekt kann Probleme verdecken und verzeiht nur kleine Fehler. (G34)
- 60 Jugendliche (14 bis 17), zwei gleiche Handy-Simulationen, schön und unschön: Die schöne wurde als nutzbarer bewertet und führte zu kürzeren Aufgabenzeiten. Fehlerzahl und Schönheitsurteil nennt das Abstract ohne Ergebnis. (G35, 2010)

### Einordnung

- Belastbar: Peak-End als Laborbefund über viele Studien. Aber: Der Durchschnitt erklärt die Bewertung ähnlich gut. „Nur Spitze und Ende zählen“ stimmt nicht.
- Belastbar: Schönheit prägt den Eindruck von Nutzbarkeit (G34, G35). Zugleich kann sie Mängel verdecken.
- Nicht belegt: Wirkung bei Über-60-Jährigen. Wirkung bei Reise-Apps im Freien. Wirkung auf Erinnerung an die Reise.

### Folgerung

- Zuerst die Hauptwege robust machen (Karte öffnen, Ort finden, Weg gehen). Optik ist kein Ersatz.
- Ruhige, einheitliche Optik (Fasan-Familie) ist nach G34 und G16 vertrauensbildend. Das ist die Begründung für „alle Apps sollen sich gleich anfühlen“.
- Peak-End praktisch: Der Tagesabschluss („Heute geschafft: 5 Orte“) und das Reiseende (Kosten teilen, exakt und ruhig) sind die „Enden“. Dort Fehler und Wartezeiten besonders sorgfältig behandeln. Mehr als diese Pflege würde ich daraus nicht ableiten.
- Keine Belohnungsanimationen zur Erinnerungspflege. Dafür gibt es keinen Beleg, und „Bewegung reduzieren“ gilt (NG-Regel 8).

### Nicht geprüft

- Tractinsky u. a. 2000 und Lindgaard u. a. 2006 (50-ms-Eindruck). Nicht gelesen.
- Kahneman u. a. 1993 als Original.
- UX-spezifische Studien zu Peak-End. Keine gefunden.

---

## 9. Ablenkung beim Gehen

### Beleg

- Meta-Analyse und Übersicht, 33 passende Studien, 14 gepoolt (872 Personen), 8 Beobachtungsstudien: Texten ist die schädlichste Tätigkeit. Weniger Blick nach links und rechts, mäßig mehr Beinahe-Unfälle, etwas längere und verpasste Überquerungen. Telefonieren: kleiner Zuwachs bei der Zeit bis zum Start und bei verpassten Gelegenheiten. Musik hören: kein erhöhtes Risiko. Zwischen 12 % und 45 % der Fußgänger waren abgelenkt. Die Autoren halten die Beweislage wegen Qualitätsproblemen für schwach und sagen, dass Hinweisschilder und Kampagnen das Verhalten nicht ändern. (G37, Injury Prevention 2020; Autoren auf der Seite nicht genannt)
- Beobachtung auf einem Campus: 25 % der Handynutzer bemerkten einen Einradclown, über 50 % der anderen. (G40, Hyman u. a. 2010; Zahlen aus ScienceDaily 2009-10-19, Stichprobengröße nicht genannt)
- 30 Junge (Ø 27,8 Jahre) und 20 Ältere (Ø 68,9 Jahre), Texten und Gehen, drinnen und draußen: Nur bei Älteren stieg drinnen die Gangvariabilität. Draußen waren die Altersunterschiede in Gangvariabilität, Tippgenauigkeit und Doppelaufgaben-Kosten größer. „Pay an additional price … especially outdoors“. Die ältere Gruppe war relativ fit, der Blick wurde nicht erfasst. (G39, Krasovsky u. a. 2018)
- 42 Arbeiten zu Maßnahmen für abgelenkte Fußgänger: Infrastruktur (Bodenleuchten), Apps mit Warnung, Gesetze und Aufklärung. Gesetze und Kampagnen sind nicht ausgewertet. Warnungen ignorieren oft, ob man das Handy nutzt. (G38, Arafat u. a. 2023)
- Navigation per Vibration (NaviRadar) im Freien, 12 Personen: Fehler gesprochene Ansage 3, NaviRadar 3, ein anderes Vibrationsnavi 8. Mit einer sichtbaren Karte wurde nicht verglichen, ihre Vorteile sind nur argumentiert. (G42, UIST 2011)
- Uhr gegen Handy beim Gehen, 10 junge Studierende mit Alterssimulation: Nachrichten dauerten 36,6 s statt 21,3 s. Kleine Stichprobe, junge Teilnehmer. Empfehlung der Autoren: Mikro-Interaktionen. (G41, Gerontechnology 2026)

### Folgerung

- Ein belegter Höchstwert für Blickzeiten beim Gehen fehlt. Die 2-Sekunden-Regel aus dem Autoverkehr habe ich nicht gesucht und würde sie nicht übertragen.
- Ansagen sind eine belegte Alternative zum Blick (G42, klein). Die App hat deutsche Ansagen. Sie bleiben Standard beim „Hinführen“.
- Beim Gehen zeigt das Blatt nur den nächsten Schritt groß (Pfeil, Meter, Straße). Die Anzeige verlangt kein Tippen. (Vorschlag.)
- Neue Hinweise nicht in den letzten Metern vor Kreuzungen. Kein Beleg, nur Vorsicht.
- Hinweise des Stadtführers: bleiben dezent (Ring auf der Karte, kein Text, keine Vibration), wie beschlossen. Texte erst nach Antippen.
- Texteingabe unterwegs vermeiden. Notiz und Suche gehen auch im Stehen. Bei Bewegung Eingabefelder nicht automatisch fokussieren. (Vorschlag.)
- Die Bedienung für Ältere beim Gehen: keine kleinen Ziele, keine Wischgesten als einziger Weg, große „Stopp“-artige Knöpfe. Das stützt sich auf G39 und die Zielgrößen in KUX-F14.
- Hinweisschilder helfen laut G37 nicht. Auch Warnungen in der App („Achtung Verkehr“) wären wirkungslos und werden zudem überlesen (G18). Darauf verzichten.

### Nicht geprüft

- Blickzeit-Normen (NHTSA) und deren Übertragbarkeit auf Fußgänger.
- Studien zu Gehen auf Kopfsteinpflaster (Lissabon) und Smartphone.
- Ob Stimme oder Vibration bei Lärm in Lissabons Straßen reicht.
- Vorteil sichtbarer Karten gegenüber Ansagen: nur argumentiert, nicht gemessen.
- Auswirkung von GPS-Navigation auf Orientierung und Erinnerung (Suchtreffer ungelesen).

---

## 10. Ist-Stand-Check (eigene Rechnung)

Quelle: `site/style.css`, Zeilen 6 bis 38, Farbwerte als Hex. Formel: WCAG-Kontrast (relative Luminanz). Gerechnet mit einem kleinen Skript, nicht an Pixeln gemessen. Keine Änderung am Code.

| Paar (helles Theme) | Kontrast | Bewertung nach Regel 9 |
|---|---|---|
| Text auf Hintergrund | 15,9:1 | gut |
| Nebentext auf Hintergrund | 6,7:1 | unter 7:1 |
| Nebentext auf Fläche (weiß) | 7,3:1 | gut |
| Nebentext auf „raised“ | 6,0:1 | unter 7:1 |
| Akzent auf Fläche | 6,2:1 | unter 7:1 |
| Gefahr auf Fläche | 6,5:1 | unter 7:1 |
| OK auf Fläche | 6,5:1 | unter 7:1 |
| „Stern“ auf Fläche | 3,6:1 | als Text zu schwach, als Symbol knapp über 3:1 |
| Linie auf Hintergrund | 1,4:1 | Trennlinie ohne Bedeutung: unkritisch; als Bedienrand zu schwach |

| Paar (dunkles Theme) | Kontrast |
|---|---|
| Nebentext auf Hintergrund | 8,0:1 |
| Akzent auf Fläche | 7,1:1 |
| Linie auf Hintergrund | 1,7:1 |

- Kategorienfarben als Fläche mit weißer Schrift: 5,1:1 bis 8,2:1. Auf dem Hintergrund 4,7:1 bis 7,5:1. Die Farbe „Aussicht“ ist mit 5,1:1 (weiß darauf) und 4,7:1 (auf dem Hintergrund) am knappsten.
- Folgerung: Für „draußen“ lohnt es sich, Nebentext, Akzent, Gefahr und OK im Standard-Theme auf mindestens 7:1 zu ziehen, oder das Profil „Gut lesbar“ so zu belegen. Ob Linien, die ein Bedienelement begrenzen (Eingabefeld, Chip), 3:1 erreichen, ist am Code nicht geprüft.
- Nicht geprüft: Glas-Theme. Blattgrund über der Karte (halbtransparent?). Schriftgrößen im CSS (80 Treffer für `font-size`, nicht ausgewertet).

---

## 11. Offene Fragen und Grenzen

1. **Messung am Gerät.** Verhältnis px zu mm, Lesewinkel, Kontrast bei Sonne. Mit den drei älteren Mitreisenden draußen testen. Reihenfolge: Schrift 16 / 18 / 20 px, hell / dunkel / Kontrast.
2. **Keine Studie mit Über-60-Jährigen draußen im Sonnenlicht gefunden.** G20 und G21 betreffen Junge und Labor. G22 und G25 betreffen Ältere ohne Umgebungslicht.
3. **Offline- und Veraltet-Hinweise:** keine Studie gefunden.
4. **Optimistische Anzeige:** keine Studie gefunden.
5. **Halo:** nur Praxisrat (G28, G29), keine Studie.
6. **Gestalt „Fortsetzung“ und „Verbundenheit“** für Routenlinien: nicht gelesen.
7. **Gesperrte oder leere Seiten:** NN/g-Heuristiken, NN/g „Progress Indicators“, Apple HIG im Original, Material Design (Skript nötig), NEI, W3C Geolocation, WCAG 1.4.11, Okabe-Ito. Teilweise Ersatz durch Spiegel oder Zweitquellen, jeweils vermerkt.
8. **Alter der Quellen:** G8 (2008, Entwurf), G16 (2002), G26 (2012), G17 (2007), G13 und G18 (2014/2022 kleine Aufgaben). Neuere NN/g-Seiten sind „geprüft“ im Herbst 2026.
9. **Vertrauen in die Zusammenfassungen:** Zahlen und Zitate stammen aus der Zusammenfassung eines kleinen Modells. G9, G10, G12, G13, G20, G36, G39 sind dabei gut abgrenzbar. Wo der Abruf einen Widerspruch zeigte (G13, G36), steht es dort.
10. **Autoren fehlten** bei G16 (Consumer WebWatch 2002; aus der Erinnerung ein Stanford-Team um B. J. Fogg, nicht geprüft), G37 (Injury Prevention 2020; Titel und DOI stehen im Abruf).

---

## 12. Quellen

Datumsangaben stammen aus dem Seitenabruf.

### Wahrnehmung und Aufbau

| Kürzel | Quelle | Kernaussage | Link |
|---|---|---|---|
| G1 | Christopher Healey, James Enns, „Attention and Visual Memory in Visualization and Computer Graphics“, IEEE TVCG 18(7), Juli 2012, ab S. 1170 | Präattentive Merkmale unter 200 bis 250 ms, Konjunktionen seriell, Farbe vor Form, Ähnlichkeit, bis 7 Farben | https://www.csc2.ncsu.edu/faculty/healey/download/tvcg.12a.pdf |
| G2 | Aurora Harley, „Proximity Principle in Visual Design“, NN/g, 2020-08-02 | Nähe gruppiert und überstimmt Farbe und Form | https://www.nngroup.com/articles/gestalt-proximity/ |
| G3 | Aurora Harley, „The Principle of Common Region“, NN/g, 2020-07-12 | Container nur bei Bedarf, „false floors“ | https://www.nngroup.com/articles/common-region/ |

### Kognitive Last

| Kürzel | Quelle | Kernaussage | Link |
|---|---|---|---|
| G4 | Nelson Cowan, „The magical number 4 in short-term memory“, Behavioral and Brain Sciences 24(1), 2001 (PDF nennt 2000, S. 87–185 mit Kommentaren) | Etwa 4 Einheiten (3 bis 5), unter Bedingungen | https://memory.psych.missouri.edu/assets/doc/articles/2001/cowan-bbs-2001.pdf |
| G5 | Wanyu Liu, Julien Gori, Olivier Rioul, Michel Beaudouin-Lafon, Yves Guiard, „How Relevant is Hick’s Law for HCI?“, CHI 2020 (nur Abstract) | Hick für HCI wenig tragfähig, stützt nicht „weniger ist mehr“ | https://researchportal.ip-paris.fr/en/publications/how-relevant-is-hicks-law-for-hci/ |
| G6 | Benjamin Scheibehenne, Rainer Greifeneder, Peter Todd, „Can there ever be too many options?“, Journal of Consumer Research 37(3):409–425, 2010 | Mittlerer Effekt praktisch null, große Streuung | https://ideas.repec.org/a/oup/jconrs/v37y2010i3p409-425.html |
| G7 | Raluca Budiu, „Progressive Disclosure“ (Video), NN/g, 2022-07-15 | Sekundäres auf Unterbildschirm | https://www.nngroup.com/videos/progressive-disclosure/ |
| G8 | Andrew Arch (Hrsg.), „WAI-AGE Literature Review and Analysis: Observations and Conclusions“, W3C, Entwurf 2008-08-21 | Bedürfnisse Älterer, Überfrachtung, Änderungen auffällig machen | https://www.w3.org/WAI/WAI-AGE/conclude.html |

### Zeit und Anzeige

| Kürzel | Quelle | Kernaussage | Link |
|---|---|---|---|
| G9 | Jakob Nielsen, „Website Response Times“, NN/g, 2010-06-20 | 0,1 / 1 / 10 s | https://nngroup.com/articles/website-response-times/ |
| G10 | Jakob Nielsen, „The 3 Response Time Limits in Interaction Design“ (Video), NN/g, 2019-10-25 | Grenzen schwanken je nach Lage | https://www.nngroup.com/videos/3-response-time-limits-interaction-design/ |
| G11 | Jon Yablonski, „Doherty Threshold“, Laws of UX (undatiert, © 2026); Original: W. Doherty, A. Thadhani, „The Economic Value of Rapid Response Time“, IBM, 1982 (nur Titelseite gelesen: https://www.vm.ibm.com/devpages/jelliott/evrrt1.html?lnk=hmhm) | 400 ms (sekundär) | https://lawsofux.com/doherty-threshold/ |
| G12 | Samhita Tankala, „Skeleton Screens 101“, NN/g, 2023-06-04, geprüft 2026-09-02 | Zeitstufen für Spinner, Skeleton, Balken | https://nngroup.com/articles/skeleton-screens/ |
| G13 | Christof van Nimwegen, Emiel van Rijn, „Time for a change: Reducing perceived waiting time by making it more active“, ECCE 2022 | n = 410, kein Unterschied der wahrgenommenen Wartezeit | https://dspace.library.uu.nl/bitstream/handle/1874/431886/3552327.3552329.pdf?sequence=1 |
| G14 | Apple HIG „Progress indicators“ (Spiegel auf glama.ai, Original nicht abrufbar) | Bestimmt wenn möglich, nicht wechseln, keine vagen Wörter | https://glama.ai/mcp/servers/@tmaasen/apple-dev-mcp/blob/b82f0efe2115dc4539c83a2374a714a84aeb350a/content/universal/progress-indicators.md |

### Status und Vertrauen

| Kürzel | Quelle | Kernaussage | Link |
|---|---|---|---|
| G15 | MDN, „GeolocationCoordinates: accuracy“ | Radius in m, 95 % | https://developer.mozilla.org/en-US/docs/Web/API/Coordinates/accuracy |
| G16 | „How Do People Evaluate a Web Site’s Credibility?“, Consumer WebWatch / Stanford, 2002-10-29 (Autoren auf der Seite nicht genannt) | N = 2.684; „design look“ in 46,1 % der Kommentare | https://advocacy.consumerreports.org/research/how-do-people-evaluate-a-web-sites-credibility |

### Fehler

| Kürzel | Quelle | Kernaussage | Link |
|---|---|---|---|
| G17 | Aza Raskin, „Never Use a Warning When You Mean Undo“, A List Apart Nr. 241, Juli 2007 | Gewöhnung an Dialoge; Rückgängig statt Warnung (Essay) | https://alistapart.com/article/neveruseawarning |
| G18 | Bonnie Anderson, Anthony Vance, Brock Kirwan, David Eargle, Seth Howard, „Users Aren’t (Necessarily) Lazy“, ICIS 2014 | fMRI: Aktivität sinkt bei Wiederholung | https://scholarsarchive.byu.edu/facpub/9305 |
| G19 | W3C, WCAG 2.2, Understanding SC 2.2.1 Timing Adjustable | Zeitlimits: abschalten, anpassen, verlängern (20 s) | https://w3c.github.io/wcag/understanding/timing-adjustable.html |

### Lesbarkeit

| Kürzel | Quelle | Kernaussage | Link |
|---|---|---|---|
| G20 | Hsin-Pou Huang, Minchen Wei, Hung-Chung Li, Li-Chen Ou, „Visual Comfort of Tablet Devices under a Wide Range of Ambient Light Levels“, Applied Sciences 11, 8679, 2021-09-17 | 24 Beobachter (20–25 J.), bis 15.000 lx, Komfort | https://mdpi-res.com/d_attachment/applsci/applsci-11-08679/article_deploy/applsci-11-08679.pdf |
| G21 | Cosima Piepenbrock, Dissertation, Univ. Düsseldorf, 2014 (enthält Piepenbrock, Mayr, Mund, Buchner 2013, Ergonomics 56:1116–1124) | Positive Polarität im Vorteil, auch bei Älteren | https://docserv.uni-duesseldorf.de/servlets/DerivateServlet/Derivate-31413 |
| G22 | Zack While, Ali Sarvghad, „Dark Mode or Light Mode?“, arXiv 2409.10841, 2024 | Kein allgemeiner Sieger; beide anbieten | https://www.arxiv.org/pdf/2409.10841 |
| G23 | W3C, WCAG 2.2, Understanding SC 1.4.3 Contrast (Minimum) | 4,5:1 / 3:1 / 7:1 und Begründung | https://w3.org/WAI/WCAG22/Understanding/contrast-minimum.html |
| G24 | Myndex, „APCA model“, W3C Silver Wiki, zuletzt 2023-11-20 | Wahrnehmungsmodell; Benutzerseite, kein Standard | https://www.w3.org/WAI/GL/task-forces/silver/wiki/Visual_Contrast_of_Text_Subgroup/APCA_model |
| G25 | Gordon Legge, Charles Bigelow, „Does print size matter for reading?“, Journal of Vision 11(5):8, 2011 | Fließender Bereich 0,2° bis 2°, kritische Größe | https://legge.dl8.umn.edu/sites/legge.psych.umn.edu/files/2020-08/Legge%20Bigelow%202011%20Does%20size%20matter%20for%20reading%3F%20A%20review%20of%20findings%20from%20vision%20science%20and%20typography.pdf |
| G26 | GSMArena, „Sunlit legibility display test“, 2012-04-17 | Kontrast der Handys unter Testlicht 1,2 bis 3,3 | https://www.gsmarena.com/gsmarena_labs_announces_sunlit_legibility_display_test-news-4105.php |
| G27 | E. Kelley, M. Lindfors, J. Penczek, „Display Daylight Ambient Contrast Measurement Methods and Daylight Readability“, J. SID, NIST, 2005-10-25 (nur Abstract) | Messmethode für Tageslicht | https://www.nist.gov/node/756926 |
| G28 | Andy Skinner, „Polishing Your Halo“, Esri ArcUser, 2021-11-30 | Halo dünn, in Hintergrundfarbe; Praxisrat | https://www.esri.com/about/newsroom/arcuser/polishing-your-halo |
| G29 | eu | academy, „Text halos“, Data Visualisation Guide, © 2023 | Helle Halos für dunkle Schrift; keine Studie | https://data.europa.eu/apps/data-visualisation-guide/text-halos |
| G30 | W3C, WCAG 2.2, Understanding SC 1.4.1 Use of Color | Farbe nie allein; „many older users do not see color well“ | https://w3.org/WAI/WCAG22/Understanding/use-of-color.html |
| G31 | Sophie Wuerger, „Colour Constancy Across the Life Span“, PLoS ONE 8(5):e63921, 2013 | Farbunterscheidung nimmt ab, am stärksten blau-gelb | https://pmc.ncbi.nlm.nih.gov/articles/PMC3648508 |
| G32 | BYU 3DRST, „Color blindness“ (Sekundärseite; Zahlen von Colblindor und HHMI) | 8 % / 0,5 %; 99 % rot-grün | https://3drst.byu.edu/0000018f-880a-d757-a1cf-efdecaab0001/color-blindness |
| G33 | Y. Ichihara, M. Okabe, K. Iga, Y. Tanaka, K. Musha, K. Ito, „The Selection of Four Easily Distinguishable Colors for all Color Vision Types“ (Jahr nicht angegeben) | Farbe durch Form ergänzen | https://jfly.uni-koeln.de/color/ichihara_etal_2008.pdf |

### Emotion und Erinnerung

| Kürzel | Quelle | Kernaussage | Link |
|---|---|---|---|
| G34 | Kate Moran, „The Aesthetic-Usability Effect“, NN/g, 2024-02-03, geprüft 2026-09-01 | Schön wirkt nutzbarer; kann Probleme verdecken | https://www.nngroup.com/articles/aesthetic-usability-effect/ |
| G35 | Andreas Sonderegger, Jürgen Sauer, Applied Ergonomics, 2010 (Abstract) | 60 Jugendliche; schöne Variante höher bewertet und schneller | https://folia.unifr.ch/unifr/documents/302271 |
| G36 | Balca Alaybek u. a., „All’s well that ends (and peaks) well?“, Organizational Behavior and Human Decision Processes 170, 2022, DOI 10.1016/j.obhdp.2022.104149 | r = 0,581; vergleichbar mit Durchschnitt | https://ideas.repec.org/a/eee/jobhdp/v170y2022ics0749597822000334.html |

### Gehen und Ablenkung

| Kürzel | Quelle | Kernaussage | Link |
|---|---|---|---|
| G37 | „Plight of the distracted pedestrian“, Injury Prevention, 2020, DOI 10.1136/injuryprev-2019-043426 (Pressemitteilung BMJ, 2020-02-03; Autoren dort nicht genannt) | Texten am schädlichsten; Musik nicht | https://beta-www.bmj.com/company/?p=12282 |
| G38 | Md Eaysir Arafat, Grégoire Larue, Sepehr Ghasemi Dehkordi, „Effectiveness of interventions for mobile phone distracted pedestrians“, Journal of Safety Research 84:330–346, 2023 | Maßnahmen kaum ausgewertet | https://research.usc.edu.au/esploro/outputs/journalArticle/Effectiveness-of-interventions-for-mobile-phone/99695749802621 |
| G39 | Tal Krasovsky, Patrice Weiss, Rachel Kizony, „Older adults pay an additional cost when texting and walking“, Physical Therapy 98(7):549–559, 2018 | Ältere zahlen draußen mehr | https://cris.iucc.ac.il/en/publications/older-adults-pay-an-additional-cost-when-texting-and-walking-effe/ |
| G40 | Ira Hyman u. a., „Did you see the unicycling clown?“, Applied Cognitive Psychology 24:596–607, 2010 (Zahlen via ScienceDaily, 2009-10-19) | 25 % bemerkten den Clown mit Handy | https://sciencedaily.com/releases/2009/10/091019172628.htm ; https://www.psichi.org/page/244EyeSummer20Hyman |
| G41 | F. Medola u. a., „Effects of smartphone and smartwatch use while walking“, Gerontechnology 25(s), 2026 | n = 10, junge Teilnehmer, Alterssimulation; schwach | https://journal.gerontechnology.org/currentIssueContent.aspx?aid=4948 |
| G42 | Sonja Rümelin, Enrico Rukzio, Robert Hardy, „NaviRadar“, UIST 2011 | Ansage und Vibration gleich viele Fehler | https://www.medien.ifi.lmu.de/pubdb/publications/pub/ruemelin2011uist/ruemelin2011uist.pdf |

### Wortwahl

| Kürzel | Quelle | Kernaussage | Link |
|---|---|---|---|
| G43 | W3C COGA, „Making Content Usable for People with Cognitive and Learning Disabilities“, Arbeitsentwurf 2020-12-11 (nur Überschriften gelesen) | Muster: klare Wörter, wörtlich, Rückgängig, Rückmeldung | https://www.w3.org/TR/2020/WD-coga-usable-20201211/Overview-mutiple-pages.html |

---

## 13. Zählung

- 40 Websuchen. Rund 55 Seitenabrufe, etwa 12 davon gesperrt, leer oder ohne Inhalt.
- Eine eigene Rechnung mit Python für die Kontraste in Abschnitt 10 und die Winkel in 6.3. Skripte lagen im Arbeitsordner der Sitzung, nicht im Repo.
- Keine Dateien des Projekts außer dieser geändert.
