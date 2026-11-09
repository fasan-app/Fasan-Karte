'use strict';
/* Liest OSM-Öffnungszeiten (opening_hours) in einer bewusst kleinen Teilmenge:
   Wochentage, Bereiche (Mo-Fr), Listen, Zeiten (09:00-12:00,14:00-18:00), über Mitternacht, off/closed, 24/7.
   PH-Regeln (Feiertage) werden übergangen. Alles andere (Monate, Daten, Sonnenzeiten) -> null = unbekannt.
   Spezifikation: https://wiki.openstreetmap.org/wiki/Key:opening_hours/specification
   Fasan-Regel: Was nicht sicher stimmt, wird nicht als „geöffnet/geschlossen“ gezeigt. */
window.Oeffnung = (() => {
  const CODES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];            // Index wie Date.getDay()
  const DE = { Mo: 'Mo', Tu: 'Di', We: 'Mi', Th: 'Do', Fr: 'Fr', Sa: 'Sa', Su: 'So', PH: 'Feiertag' };
  const REIHE = [1, 2, 3, 4, 5, 6, 0];                                   // Anzeige Mo..So
  const TAG = '(?:Mo|Tu|We|Th|Fr|Sa|Su)';
  const TAGE_RE = new RegExp(`^(${TAG}(?:-${TAG})?(?:,${TAG}(?:-${TAG})?)*)(?:\\s+|$)`);

  function tage(teil) {
    const out = new Set();
    for (const stueck of teil.split(',')) {
      const [a, b] = stueck.split('-');
      const i = CODES.indexOf(a), j = b ? CODES.indexOf(b) : i;
      if (i < 0 || j < 0) return null;
      for (let k = i; ; k = (k + 1) % 7) { out.add(k); if (k === j) break; }
    }
    return [...out];
  }

  function minuten(t) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t);
    if (!m) return null;
    const h = +m[1], mi = +m[2];
    if (h > 24 || mi > 59) return null;
    return h * 60 + mi;
  }

  function zeiten(teil) {
    const out = [];
    for (const z of teil.split(',')) {
      const [a, b] = z.trim().split('-');
      const von = minuten(a), bis0 = minuten(b || '');
      if (von == null || bis0 == null) return null;
      out.push([von, bis0 <= von ? bis0 + 1440 : bis0]);
    }
    return out;
  }

  function lies(text) {
    if (!text) return null;
    const s = text.trim();
    if (s === '24/7') return { woche: Array.from({ length: 7 }, () => [[0, 1440]]) };
    const woche = Array.from({ length: 7 }, () => []);
    const regeln = s.split(/\s*;\s*|,\s*(?=(?:Mo|Tu|We|Th|Fr|Sa|Su|PH)\b)/).filter(Boolean);
    let irgendwas = false;
    for (const r of regeln) {
      if (/^PH\b/.test(r)) continue;
      const m = TAGE_RE.exec(r);
      const ts = m ? tage(m[1]) : [0, 1, 2, 3, 4, 5, 6];
      const rest = (m ? r.slice(m[0].length) : r).trim();
      if (!ts) return null;
      if (/^(off|closed)$/.test(rest)) { ts.forEach((t) => { woche[t] = []; }); irgendwas = true; continue; }
      if (rest === '24/7' || rest === '00:00-24:00') { ts.forEach((t) => { woche[t] = [[0, 1440]]; }); irgendwas = true; continue; }
      const z = zeiten(rest);
      if (!z) return null;
      ts.forEach((t) => { woche[t] = z; });
      irgendwas = true;
    }
    return irgendwas ? { woche } : null;
  }

  const hhmm = (m) => `${String(Math.floor((m % 1440) / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  /* -> { offen: bool, bis: 'HH:MM' } | { offen: false, naechste: 'Mo 09:00' | 'heute 18:00' } | null */
  function status(text, jetzt = new Date()) {
    const o = lies(text);
    if (!o) return null;
    const d = jetzt.getDay(), m = jetzt.getHours() * 60 + jetzt.getMinutes();
    for (const [a, b] of o.woche[d]) if (m >= a && m < b) return { offen: true, bis: b >= 1440 && b - 1440 === 0 ? '24:00' : hhmm(b) };
    for (const [a, b] of o.woche[(d + 6) % 7]) if (b > 1440 && m < b - 1440) return { offen: true, bis: hhmm(b - 1440) };
    for (let k = 0; k < 7; k++) {
      const tag = (d + k) % 7;
      const spaeter = o.woche[tag].map(([a]) => a).filter((a) => k > 0 || a > m).sort((x, y) => x - y);
      if (spaeter.length) {
        const wann = k === 0 ? 'heute' : k === 1 ? 'morgen' : DE[CODES[tag]];
        return { offen: false, naechste: `${wann} ${hhmm(spaeter[0])}` };
      }
    }
    return { offen: false, naechste: null };
  }

  /* Wochenliste zum Anzeigen: [{ tag: 'Mo', text: '09:00–18:00', heute: bool }] oder null */
  function woche(text, jetzt = new Date()) {
    const o = lies(text);
    if (!o) return null;
    return REIHE.map((t) => ({
      tag: DE[CODES[t]], heute: t === jetzt.getDay(),
      text: o.woche[t].length ? o.woche[t].map(([a, b]) => `${hhmm(a)}–${b === 1440 ? '24:00' : hhmm(b)}`).join(', ') : 'geschlossen',
    }));
  }

  /* Rohtext lesbar machen, wenn die Teilmenge nicht reicht */
  function roh(text) {
    const MON = { Mar: 'Mär', May: 'Mai', Oct: 'Okt', Dec: 'Dez' };
    return (text || '').replace(/\b(Mar|May|Oct|Dec)\b/g, (k) => MON[k]).replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|PH)\b/g, (k) => DE[k]).replace(/\boff\b|\bclosed\b/g, 'geschlossen')
      .replace(/(\d)-(\d)/g, '$1–$2').replace(/;\s*/g, '; ');
  }

  return { status, woche, roh, lies };
})();
