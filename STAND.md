# Stand Fasan Karte

Zuerst lesen: `../fasan/ENTSCHEIDUNGEN.md` (Familie), dann diese Datei, dann `docs/PLAN-FLUTTER.md`.

## Jetzt

- Web-App 3.19 live (GitHub Pages, `site/`): Bon-Scan aus Textzeilen (`scan.js`), Erkennung richtig auf dem Handy-Test
  REWE 3 (5/5, 7,76 €, 87 s auf dem S23). Bekommt ab jetzt nur noch Fehlerbehebungen.
- Entschieden 01.11.: Neubau als Flutter-App (Android, Web für iPhones, später iOS), Designpaket `fasan_ui`
  (eigenes Repo), Plan in `docs/PLAN-FLUTTER.md`.

## Rückmeldung 3.19 (Handy, 01.11.), die die Flutter-App lösen muss

- Bonzeilen bei voller Breite nur ~5 mm hoch, Tippflächen ohne Abstand: Tipp zwischen zwei Zeilen trifft eine davon.
- Posten über zwei Zeilen: zwei getrennte Kästen („zerrissen“); Kürzel und Personen am Rand abgeschnitten; leerer
  Rahmen rechts oben; graue Bänder im dunklen Design; geteilte Posten als unlesbare Farbstreifen.
- Gesamteindruck: noch nicht wie eine hochwertige App 2026 (Apple/Ive/Rams-Anspruch); zu wenig hochwertige Bewegung.

## Nächste Schritte

1. Netz: Nutzer schaltet Paketquellen frei (Flutter/Dart/Android). Sonst nur CI-Builds wie bei der Kamera.
2. Recherche Design (Ästhetik, Bewegung, Bedienpsychologie, Rams/Ive) → `docs/recherche/`.
3. `fasan_ui` anlegen: Tokens, Stile, Effekte, Bewegung, Bausteine; Galerie-App zum Vergleichen.
4. Karten-App `app/`: Grundgerüst, Rechnung mit vier umschaltbaren Zuordnen-Varianten, Erkennung nativ (ONNX Runtime).
5. VPS gemeinsam prüfen (nach dem letzten Neustart gab es Probleme), dann Dienste.
