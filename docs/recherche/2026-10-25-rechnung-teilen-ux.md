# Rechnung teilen: was am alten Ablauf falsch war (Stand 25.10.2026)

Anlass: Screenshot des Nutzers vom echten Bon (4 Personen, 8 gelesene „Posten“, fast alle Müll). Die Seite war rund 3000 px lang.

## Befunde am alten Ablauf (aus dem Screenshot, [Certain])
1. Eine einzige lange Seite für eine ganze Aufgabe. Es gibt keinen Anfang, kein Ende, keinen Fortschritt.
2. Zu Beginn steht Formular-Rahmen, nicht die Aufgabe: „Neue Ausgabe“, vier Aufteilungsarten, „Wofür?“, drei Foto-Knöpfe.
3. Der Erkennungstext wurde als Wahrheit gezeigt: 8 Posten mit Namen wie „1 "Preco:“ und Beträgen ohne Bezug zum Bon. Der Nutzer muss Müll aufräumen, das ist mehr Arbeit als von Hand eintragen.
4. Pro Posten ein eigener Block mit Betrag, Name, Löschen, 4 Personen-Chips und „Alle teilen“. 8 Posten × 6 Bedienelemente = 48 Ziele, dieselbe Entscheidung 8-mal.
5. Kein sofortiges Ergebnis: Wer wie viel zahlt, steht erst ganz unten, nachdem man alles durchgescrollt hat.
6. Fehlermeldung („Posten 1 … Wer hatte das?“) steht am Ende, weit weg von der Stelle, an der sie gebraucht wird.
7. Farben als Bedeutung (Grün, Orange, Blau im Foto) ohne Not, dazu kleine Zeichen „+/−“.
8. „Bezahlt von: Mehrere Personen“ stand vorausgewählt neben Pia: unklar, was gilt.
9. Das Foto, das die eigentliche Grundlage ist, war klein und lag zwischen Bedienelementen.

## Grundsätze und Belege
- **Hick'sches Gesetz**: Mehr Auswahl verlängert die Entscheidungszeit; hilft, Aufgaben in Stufen zu teilen und Häufiges voranzustellen (uxcel.com/blog/hicks-law-in-ux-design-simplifying-choices-for-faster-decisions, abgerufen 25.10.2026). Es heißt nicht „immer weniger“: gut gegliederte Auswahl zählt (ebd.).
- **Chunking und Fortschritt**: Mehrere kurze Schritte statt eines langen Formulars verringern die gefühlte Last; ein „Schritt n von m“ nutzt den Zielgradienten-Effekt (Hull 1934; Atticus Li, atticusli.com, 28.03.2026). Dort stehen Richtwerte: 2–4 Schritte, erster Schritt unter 30 s. Der Artikel nennt keine Messwerte.
- **Erkennung nie blind übernehmen**: Gelesene Werte mit Quelle zeigen (Original daneben), Rechenprobe immer, mittlere Sicherheit vorbelegen, niedrige nicht als Tatsache zeigen; Summe, die nicht zu den Posten passt, stoppt auch bei hoher Sicherheit (lilting.ch/en/articles/human-in-loop-document-extraction-confidence, abgerufen 25.10.2026).
- **Mitreisende ohne Aufwand**: Splitwise „Itemize“ (The Paypers, 16.10.2026): eine Person fotografiert, jede Person beansprucht ihre Posten, die App rechnet Anteile inkl. Steuer und Trinkgeld. Ob es einen Prüfschritt gibt, nennt der Artikel nicht.

## Folgerungen für Fasan Karte
- Eigener Vollbild-Ablauf statt Formular im Blatt: Summe → Wer/Wie → (Posten) → Bezahlt/Speichern.
- Häufigster Fall zuerst: „Gleich teilen“ ist ein Tipp. Posten nur auf Wunsch.
- Summe zuerst und groß; sie ist der Prüfwert für alles andere. Der Nutzer kann sie tippen, bevor die Erkennung fertig ist.
- Gelesene Posten nur vorbelegen, wenn ihre Summe exakt zum Bon passt. Sonst: Foto zum Nachlesen, schnelles Eintragen, gelesene Posten nur auf ausdrücklichen Wunsch.
- Zuordnen: eine Person wählen, dann Posten antippen (ein Ziel je Posten statt sechs). Obere Leiste zeigt je Person die laufende Summe.
- Nie Farbe allein: Zustand steht als Text und Zeichen da.
- „Nicht geprüft“: Ob Zuordnen per Person-zuerst für 4–6 Personen schneller ist als Posten-zuerst, ist hier nicht gemessen, nur aus Splitwise/Hick abgeleitet.
