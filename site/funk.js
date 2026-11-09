'use strict';
/* Fasan Karte – Gruppenfunk: Live-Abgleich über öffentliche Nostr-Relays. MPL-2.0
 *
 * Belege:
 * - NIP-01 (github.com/nostr-protocol/nips, 01.md, „Kinds“): Arten 20000 ≤ n < 30000 sind flüchtig,
 *   „not expected to be stored by relays“. Wir senden Art 20777.
 * - Relaistest 24.10.2026 (tools/relaistest.mjs, Protokoll im Branch ci-logs): relay.snort.social antwortet
 *   „ephemeral: will not be stored“, nostr-pub.wellorder.net lieferte nichts nach. nos.lol und relay.primal.net lieferten
 *   die Ereignisse bei einer neuen Abfrage noch aus. strfry hält flüchtige Ereignisse in der Grundeinstellung 300 s
 *   (strfry.conf, ephemeralEventsLifetimeSeconds). Schutz ist deshalb die Verschlüsselung, nicht die Speicherregel.
 * - nostr-tools 2.25.2 (Unlicense), Datei vendor/nostr/nostr.bundle.js: SimplePool.subscribeMany(relays, filter, {onevent}),
 *   SimplePool.publish(relays, event) → Promise je Relay, finalizeEvent(vorlage, geheimschluessel), generateSecretKey().
 * - Inhalt: AES-GCM 256 bit über WebCrypto (SubtleCrypto.encrypt), IV 12 Byte zufällig je Nachricht.
 *   Der Schlüssel steht nur im Gruppen-Link bzw. QR-Code. Relays sehen: Zeit, Größe, zufälligen Absender-Schlüssel,
 *   Thema-Kennung (SHA-256 über den Schlüssel) und die IP-Adresse des Handys – nie Inhalt oder Standort.
 */
window.Funk = (() => {
  const ART = 20777;
  // Öffentliche Relays; geprüft mit tools/relaistest.mjs in GitHub Actions (senden, empfangen, nicht speichern).
  // Gewählt nach dem Test: erreichbar, nehmen 24-KB-Ereignisse an, liefern in unter 1 s aus.
  const RELAYS = ['wss://relay.snort.social', 'wss://nostr-pub.wellorder.net', 'wss://nos.lol', 'wss://relay.primal.net'];
  const NT = window.NostrTools;
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = {
    enc(bytes) { let s = ''; bytes.forEach((b) => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
    dec(str) { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)); return Uint8Array.from(s, (c) => c.charCodeAt(0)); },
  };
  let pool = null, sk = null, pub = null, abo = null, kanaele = [], aufEmpfang = null, aufStatus = null, uhr = null;
  let gesendet = { ok: 0, t: 0 };
  const gesehen = new Set();

  const moeglich = () => !!(NT && NT.SimplePool && window.crypto && crypto.subtle && 'WebSocket' in window);

  async function kanal(schluessel) {
    const roh = b64.dec(schluessel);
    const key = await crypto.subtle.importKey('raw', roh, 'AES-GCM', false, ['encrypt', 'decrypt']);
    const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array([...enc.encode('fasan-karte/1:'), ...roh])));
    const thema = Array.from(h.slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
    return { schluessel, key, thema };
  }
  async function zu(k, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k.key, enc.encode(JSON.stringify(obj))));
    return `${b64.enc(iv)}.${b64.enc(ct)}`;
  }
  async function auf(k, text) {
    const [a, b] = String(text).split('.');
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64.dec(a) }, k.key, b64.dec(b));
    return JSON.parse(dec.decode(pt));
  }

  function zustand() {
    const st = pool ? [...pool.listConnectionStatus().values()] : [];
    return { an: !!pool, verbunden: st.filter(Boolean).length, gesamt: RELAYS.length, gesendet };
  }
  const melde = () => { if (aufStatus) aufStatus(zustand()); };

  async function neu(ev) {
    if (!ev || gesehen.has(ev.id)) return;
    gesehen.add(ev.id); if (gesehen.size > 3000) gesehen.clear();
    if (ev.pubkey === pub) return;
    const t = ((ev.tags || []).find((x) => x[0] === 't') || [])[1];
    const k = kanaele.find((x) => x.thema === t);
    if (!k) return;
    let obj;
    try { obj = await auf(k, ev.content); } catch (e) { return; } // nicht für uns oder beschädigt
    try { aufEmpfang(obj, k.schluessel); } catch (e) { console.warn('Funk', e); }
  }

  async function starte(schluesselListe, opt) {
    stoppe();
    if (!moeglich()) return false;
    aufEmpfang = opt.empfang; aufStatus = opt.status;
    try { kanaele = await Promise.all(schluesselListe.filter(Boolean).map(kanal)); } catch (e) { kanaele = []; return false; }
    if (!kanaele.length) return false;
    sk = NT.generateSecretKey(); pub = NT.getPublicKey(sk); // neuer Absender je Start: Relays können Sitzungen nicht verknüpfen
    pool = new NT.SimplePool({ enableReconnect: true });
    abo = pool.subscribeMany(RELAYS, { kinds: [ART], '#t': kanaele.map((k) => k.thema), since: Math.floor(Date.now() / 1000) - 120 }, { onevent: neu });
    uhr = setInterval(melde, 4000); setTimeout(melde, 1200);
    return true;
  }
  function stoppe() {
    try { if (abo) abo.close(); } catch (e) { /* egal */ }
    try { if (pool) pool.destroy(); } catch (e) { /* egal */ }
    clearInterval(uhr); abo = null; pool = null; kanaele = [];
    melde();
  }
  async function sende(obj, schluessel) {
    if (!pool || !kanaele.length) return 0;
    const k = (schluessel && kanaele.find((x) => x.schluessel === schluessel)) || kanaele[0];
    const ev = NT.finalizeEvent({ kind: ART, created_at: Math.floor(Date.now() / 1000), tags: [['t', k.thema]], content: await zu(k, obj) }, sk);
    gesehen.add(ev.id);
    const r = await Promise.allSettled(pool.publish(RELAYS, ev));
    gesendet = { ok: r.filter((x) => x.status === 'fulfilled').length, t: Date.now() };
    melde();
    return gesendet.ok;
  }
  // Nach dem Aufwachen (Handy war gesperrt) neu verbinden, falls alle Verbindungen weg sind
  function pruefe() { if (pool && zustand().verbunden === 0 && kanaele.length && aufEmpfang) { const l = kanaele.map((k) => k.schluessel); starte(l, { empfang: aufEmpfang, status: aufStatus }); } }

  return { moeglich, starte, stoppe, sende, pruefe, zustand, RELAYS, _intern: { kanal, zu, auf } };
})();
