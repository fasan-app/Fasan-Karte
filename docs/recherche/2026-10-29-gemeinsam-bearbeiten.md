# Kassenzettel gemeinsam bearbeiten – mit und ohne Server (29.10.2026)

Ziel: Eine Person fotografiert den Bon und lädt ihn in die Gruppe, wählt, wer dabei war. Diese Personen werden benachrichtigt
und tragen sich selbst ein, gleichzeitig und auch später. Einladen und Entfernen jederzeit. Teilweise Eintragen wird gespeichert.

## 1. Was zu bedenken ist (gilt für beide Wege)

**Datenmodell, das ohne Konflikte auskommt.** Jede Person schreibt nur ihre eigenen Einträge („Posten X: ich hatte das“),
gespeichert je Paar (Posten, Person) mit Zeitstempel. Zwei Handys können dann nie denselben Wert gleichzeitig ändern; der Abgleich
ist „neuester Stand je Schlüssel gewinnt“. So vermeidet man eine CRDT-Bibliothek. Nur Posten-Name/-Betrag, „wer ist dabei“ und
„abgeschlossen“ ändern mehrere Personen; dort: neuester Stand gewinnt plus sichtbarer Verlauf („Mara hat 2,50 → 3,50 geändert“).
- Bon: id, Ersteller, Zeit, Art/Geschäft, Summe, Foto-Verweis, gelesene Zeilen mit Kästen, Posten (id, Name, Klarname, Betrag, Zeile).
- dabei: Liste der Personen (Ersteller pflegt; Entfernen gibt deren Posten wieder frei, mit Hinweis an alle).
- anspruch[posten][person] = { an, t }.
- Status: offen → vollständig (alles zugeordnet, Summe stimmt) → gebucht (als Ausgabe in „Kosten“).

**Rechte.** Ohne Konto gibt es keine echte Identität: Wer den Gruppenschlüssel hat, kann technisch alles schreiben. Für
Freundesgruppen genügt: jede Änderung trägt die Personen-ID, die App zeigt Verlauf und Rückgängig. Signaturen je Person
(Nostr-Schlüsselpaar je Handy) machen Fälschungen erkennbar – lohnt sich erst für größere/fremde Gruppen.

**Foto.** Ein Bon-Foto ist 150–500 kB. Nostr-Relays begrenzen die Nachrichtengröße (NIP-11 nennt als Beispielwerte 16 384,
65 535 und 524 288 Byte); unser Relaistest nahm 24 kB an. Darum nicht das ganze Foto schicken, sondern:
gelesene Zeilen + kleine Zeilenbilder je Posten (je 2–4 kB, gibt es schon) + Graustufen-Foto stark komprimiert in Stücken.
Das Foto ist verschlüsselt, Relays sehen nur Größe und Zeit.

**Benachrichtigung.** Push an eine geschlossene Web-App braucht immer einen sendenden Server (Web Push mit VAPID-Schlüssel);
auf iPhones nur, wenn die Web-App auf dem Home-Bildschirm liegt (ab iOS 16.4), Inhalt höchstens 4 KB.
Quelle: developer.apple.com, „Sending web push notifications in web apps and browsers“ (abgerufen 29.10.2026).

**Offline.** Jedes Handy hat eine eigene Kopie und arbeitet weiter; Abgleich, sobald Netz da ist (Prinzip „local-first“,
Ink & Switch 2019, inkandswitch.com/local-first).

**Datenschutz.** Bons enthalten Geschäft, Zeit, manchmal Kartenendziffern und Steuernummern. Ende-zu-Ende verschlüsselt teilen,
nach dem Buchen Foto auf Wunsch nur lokal behalten, Löschen muss alle Kopien erreichen (bei P2P nur „bitte löschen“-Nachricht
möglich, nicht erzwingbar – ehrlich in der App sagen).

## 2. Ohne Server (heutiger Weg: öffentliche Nostr-Relays, Ende-zu-Ende verschlüsselt)
- Bon und Einträge als verschlüsselte Ereignisse im Gruppen-Kanal (wie heute Kosten und Abstimmungen).
- **Problem 1 – Zustellung:** Wir senden heute flüchtige Ereignisse (Art 20777), Relays speichern sie nicht dauerhaft. Wer die App
  später öffnet, bekommt den Bon nur, wenn gerade ein anderes Gruppenmitglied online ist und den Stand erneut sendet.
  Abhilfe: für Bons gespeicherte Ereignisse mit Ablaufdatum (NIP-40) auf mehreren Relays. Wie lange fremde Relays sie
  wirklich halten, ist nicht zugesichert [Annahme].
- **Problem 2 – Benachrichtigung:** Ohne Server keine Push-Nachricht bei geschlossener App. Möglich:
  a) Hinweis in der App, sobald sie offen ist (Abzeichen am Gruppen-Reiter, Ton/Vibration);
  b) „Einladen“-Knopf, der über die Teilen-Funktion des Handys einen Link in WhatsApp/Signal/SMS schickt – die Benachrichtigung
     kommt dann vom Messenger; der Link öffnet direkt den Bon. Kein eigener Dienst nötig.
  c) Fremder Push-Dienst (z. B. öffentliches ntfy.sh) nur mit leerer/verschlüsselter Nachricht – ein Dritter sieht dann, dass und
     wann jemand benachrichtigt wird.
- Fazit: funktioniert für Gruppen, die ohnehin zusammen sind; zuverlässige Benachrichtigung nur über den Messenger-Link.

## 3. Mit eigenem Server
- **Eigenes Nostr-Relay mit Speicherung** (auf dem VPS läuft bereits eines): Bons bleiben, bis sie gebucht oder abgelaufen sind;
  Handys holen beim Öffnen nach. Daten bleiben Ende-zu-Ende verschlüsselt, der Server sieht keinen Inhalt.
- **Push:** kleiner Dienst, der Web Push (VAPID) an Browser/Home-Bildschirm-Apps sendet; für Android-Apps zusätzlich
  UnifiedPush über ntfy (selbst gehostet; F-Droid-Fassung von ntfy ohne Firebase, sofortige Zustellung über Dauerverbindung,
  docs.ntfy.sh/subscribe/phone). iOS-Apps brauchen Apples Push-Dienst (APNs) mit Entwicklerzugang.
- **Fotos:** verschlüsselte Blobs (z. B. Blossom-Server, Nostr-Ökosystem) statt Stücke im Relay.
- **Sicherheit – wichtig:** Der VPS cx43-falk ist als „höchstes Vertrauen, kein Zugriff von außen“ festgelegt. Ein Relay/Push-Dienst
  für Gruppenmitglieder ist genau solcher Zugriff von außen. Empfehlung: diese öffentlichen Dienste auf einem getrennten, kleinen
  Server (ohne Schlüssel, ohne Daten des Haupt-Servers) oder als „Briefkasten“, den der Haupt-Server nur von innen abruft.

## 4. Eine App, nicht zwei
Statt zwei getrennter Apps (mit/ohne Server) eine Codebasis mit Einstellung „Server: keiner / eigener (Adresse)“.
Alles läuft ohne Server; ein eingetragener Server ergänzt Speicherung und Push. Zwei Apps verdoppeln Tests und Fehler.

## 5. Web und fest installiert
- Web-App (wie jetzt, GitHub Pages) bleibt die Grundlage.
- Android/iOS: dieselbe Web-App in eine Hülle packen. Capacitor (iOS, Android) ist für Mobil ausgereift, mit Push-Plugins;
  Tauri 2 deckt Windows, macOS, Linux und seit 2.0 auch Android/iOS ab, auf Mobil jünger (alternativeto.net, Okt. 2024).
  Vorschlag: Capacitor für Handys, Tauri oder installierbare PWA für Rechner. Nicht geprüft: Store-Regeln für Web-Hüllen [Annahme].
- Fasan Kamera ist Flutter – für die Karte lohnt ein Neuschreiben nicht; die Web-App ist schon da.

## 6. Reihenfolge (Vorschlag)
1. Datenmodell mit Ansprüchen je Person, Entwürfe synchronisieren (ohne Server, gespeicherte Ereignisse + Messenger-Link).
2. In-App-Hinweise und Einladen/Entfernen.
3. Getrennter kleiner Server: Relay mit Speicherung + Web Push + ntfy.
4. Capacitor-Hülle für Android, dann iOS.
