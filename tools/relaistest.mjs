// Prüft öffentliche Nostr-Relays mit genau der Bibliothek, die die App ausliefert.
// Je Relay: flüchtiges Ereignis (Art 20777, NIP-01: 20000–29999 werden nicht gespeichert) senden,
// über eine zweite Verbindung empfangen, Größe 2 KB und 24 KB. Danach: kommt es später noch einmal? (soll nicht)
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Node: das Paket „ws“ statt des eingebauten WebSocket (der löst bei Verbindungsfehlern eine Endlosschleife in
// AbstractRelay.connect aus: onerror → ws.close() → onerror …; in Chromium geprüft: dort tritt das nicht auf, 24.10.2026).
globalThis.WebSocket = (await import('ws')).default;
process.on('uncaughtException', (e) => console.log('UNERWARTET', String(e).slice(0, 200)));
process.on('unhandledRejection', (e) => console.log('ABGELEHNT', String(e).slice(0, 200)));
vm.runInThisContext(readFileSync('site/vendor/nostr/nostr.bundle.js', 'utf8') + ';globalThis.NostrTools = NostrTools;');
const { SimplePool, generateSecretKey, finalizeEvent } = globalThis.NostrTools;

const RELAYS = process.argv.slice(2).length ? process.argv.slice(2) : [
  'wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.primal.net', 'wss://relay.nostr.band',
  'wss://nostr.mom', 'wss://relay.snort.social', 'wss://offchain.pub', 'wss://nostr.oxtr.dev',
  'wss://relay.nostr.bg', 'wss://nostr-pub.wellorder.net',
];
const ART = 20777;
const zufall = (n) => Buffer.from(Array.from({ length: n }, () => Math.floor(Math.random() * 256))).toString('base64url');
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

async function teste(url) {
  const ergebnis = { url };
  const leser = new SimplePool(), schreiber = new SimplePool();
  const thema = zufall(16);
  const empfangen = new Map();
  try {
    const t0 = Date.now();
    const sub = leser.subscribeMany([url], { kinds: [ART], '#t': [thema], since: Math.floor(Date.now() / 1000) - 60 }, {
      onevent: (e) => { empfangen.set(e.id, Date.now()); },
      maxWait: 6000,
    });
    await warte(2500);
    ergebnis.verbunden = [...leser.listConnectionStatus().values()].some(Boolean);
    for (const groesse of [2000, 24000]) {
      const ev = finalizeEvent({ kind: ART, created_at: Math.floor(Date.now() / 1000), tags: [['t', thema]], content: zufall(groesse) }, generateSecretKey());
      const ts = Date.now();
      try { ergebnis[`senden${groesse}`] = await Promise.race([schreiber.publish([url], ev)[0], warte(8000).then(() => 'zeitüberschreitung')]); }
      catch (e) { ergebnis[`senden${groesse}`] = 'FEHLER ' + String(e).slice(0, 120); }
      for (let i = 0; i < 40 && !empfangen.has(ev.id); i++) await warte(200);
      ergebnis[`empfangen${groesse}`] = empfangen.has(ev.id) ? `${empfangen.get(ev.id) - ts} ms` : 'NEIN';
    }
    sub.close();
    // Speichert das Relay flüchtige Ereignisse doch? Neue Abfrage nach dem Senden.
    const spaeter = [];
    const sub2 = leser.subscribeMany([url], { kinds: [ART], '#t': [thema] }, { onevent: (e) => spaeter.push(e.id), maxWait: 5000 });
    await warte(5000);
    sub2.close();
    ergebnis.gespeichert = spaeter.length ? `JA (${spaeter.length})` : 'nein';
    ergebnis.dauer = `${Date.now() - t0} ms`;
  } catch (e) {
    ergebnis.fehler = String(e).slice(0, 160);
  } finally {
    leser.destroy(); schreiber.destroy();
  }
  return ergebnis;
}

const alle = await Promise.all(RELAYS.map(teste));
console.log('RELAISTEST ' + new Date().toISOString());
for (const r of alle) console.log('RELAIS ' + JSON.stringify(r));
process.exit(0);
