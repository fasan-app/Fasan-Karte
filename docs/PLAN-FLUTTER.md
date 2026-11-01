# Plan: Fasan Karte als Flutter-App (Stand 01.11.2026)

Entscheidungen des Nutzers vom 01.11.; Familienregeln in `CUK999/Fasan`. Ungeprüftes ist als „nicht geprüft“ markiert.

## Ziel

Eine App für Android, Web (iPhones zuerst über die Web-Fassung) und später iOS, aus einem Flutter-Code. Anspruch:
wirkt wie von Apple gestaltet (Rams, Bauhaus, Ive). Bedienung führt, lässt keine Fehlbedienung zu und ist an
Studien belegt.

## Bausteine

| Teil | Wo | Inhalt |
| --- | --- | --- |
| `fasan_ui` | eigenes Repo, MPL-2.0 | Tokens (Farbe, Schrift, Abstände, Radien), Stile, Filmeffekte als Shader, Bewegung (Federn, gemeinsame Übergänge), Bausteine (Leisten, Blätter, Segmente, Personen-Chips, Fortschritt), Haptik/Ton, Akku-Stufen |
| Karten-App | `app/` in diesem Repo | Rechnung, Karte, Plan, Orte, Gruppe, Mehr; Gerätecheck und Diagnose |
| Erkennung | in der App (Dart) | Leser-Logik aus `site/bon.js` und `site/scan.js` nach Dart übertragen. Die bestehenden Tests dienen als Vergleich (Einheit, synthetisch, echte Bons, SROIE). Modelle über ONNX Runtime nativ (nicht geprüft, welches Flutter-Paket; erst Doku lesen) |
| Web-App | `site/` | bleibt live, nur Fehlerbehebungen, bis Flutter Web sie ersetzt |

## Stile und Effekte (alle umschaltbar)

- **Stile:**
  - Ruhe + Glas (Standard)
  - Streng Braun/Bauhaus
  - volles Glas
  - filmisch: Maschinen-Overlay (Eckklammern, Datenlabels, Analyse-Animationen), Sci-Fi, Spionage. Ernst und hochwertig, nichts aus Serien übernommen.
- **Filmeffekte:** Glow, Halation, Grain, Light Bleeding, Bildstandwackeln. Standard subtil an, Regler je Effekt.
- **Wählbar:** je drei Akzentfarben und drei Schriften (Inter, Systemschrift, Geist/IBM Plex).
- **Akku:** Bei wenig Akku und im Energiesparmodus werden Effekte reduziert. „Akku maximal“ nutzt alle Sparmöglichkeiten des Geräts (erst offizielle Android-Doku lesen). Die Wahl bleibt immer beim Nutzer.
- **Bewegung:** Folgt der Systemoption „Animationen entfernen“ und der App-Einstellung „Weniger Bewegung“.
- **Tippziele:** kompakt sichtbar, Tippfläche mindestens 48 dp; Profil „Einfach“ 60 dp.

## Rechnung (erste APK)

1. **Scan:** Kamera oder Foto. Der Bon ist live begradigt zu sehen; Zeilen leuchten auf, sobald sie gelesen sind.
2. **Summe und Zweck.**
3. **Wer war dabei.**
4. **Zuordnen in vier umschaltbaren Varianten** zum Vergleichen:
   - Fokus: eine Zeile groß, Personen antippen, nächste Zeile gleitet nach
   - Liste mit Zeilenbild
   - Bon direkt, automatisch gezoomt, sodass jede Zeile mindestens 48 dp hoch ist
   - Karten wischen

   Posten über mehrere Zeilen sind **eine** durchgehende Form. Geteilte Posten zeigen die Personen als Avatare, nicht als Farbstreifen.
5. **Wer hat bezahlt, Speichern, Export** (CSV).

## Netz und Server

- **Ohne VPS:** Abgleich über Nostr-Relays und Einladen per Link oder QR.
- **Mit VPS (erst nach gemeinsamer Prüfung des Servers):**
  - Gruppen-Relay, Ende-zu-Ende verschlüsselt
  - ntfy/UnifiedPush
  - Diagnose-Briefkasten: Das Token liegt nur auf dem Server, die Protokolle landen im privaten Repo `fasan-diagnose`; Hochladen nur nach Zustimmung
  - Traccar
- **Push:** zuerst der FOSS-Weg (ntfy). FCM als zweite Fassung später.
- **Standort im Hintergrund:** nur während einer Freigabe, mit dauerhafter Benachrichtigung (Foreground Service; erst offizielle Doku lesen).
- **Benachrichtigungen:** neuer Bon zum Eintragen, Abstimmung oder Planänderung, Standort oder Treffpunkt, Chat.
- **Offline-Karte:** Vektordatei (PMTiles aus OSM-Daten) je Reiseziel.

## Bauen und Verteilen

- **Bauen:** nur in GitHub Actions, wie bei der Kamera (Flutter 3.47.7 stable, `flutter create --org app.fasan`). Lokal nur, wenn der Nutzer die Paketquellen freischaltet.
- **App-Kennung:** `app.fasan.karte`.
- **Android:** mindestens Android 10.
- **Signieren:** Schlüssel als GitHub-Secret, Offline-Kopie beim Nutzer.
- **Verteilen:** GitHub Releases, Obtainium, später F-Droid (ohne Google-Bibliotheken) und Google Play.
- **Tests:** Vor jeder Veröffentlichung müssen `flutter test`, die Erkennungs-Regression und Emulator-Bildschirmfotos grün sein.

## Offen

- Paketquellen freischalten (Nutzer).
- Umzug der Repos in eine eigene GitHub-Organisation (Nutzer); vorher offizielle Doku zu Umleitungen prüfen.
- VPS-Prüfung und Subdomains.
- Play- und Apple-Konten (am Ende).
