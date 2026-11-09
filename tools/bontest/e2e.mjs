// Ende-zu-Ende: Bon.erkenne auf Testbildern, Vergleich mit der Wahrheit (Posten-Beträge als Menge, Summe)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const [,, motor, ...dateien] = process.argv;
const b = await chromium.launch(); const p = await b.newPage();
p.on('pageerror', (e) => console.log('FEHLER', String(e)));
await p.goto('http://localhost:8765/manifest.webmanifest');
await p.addScriptTag({ url: 'http://localhost:8765/bon.js' });
let gut = 0, summeGut = 0, alle = 0, postenRichtig = 0, postenAlle = 0;
for (const f of dateien) {
  const wahr = JSON.parse(fs.readFileSync(f.replace(/(-mild|-hart|-extrem|-kopf|-quer)?\.(png|jpg)$/, '.json'), 'utf8'));
  const d = `data:image/${f.endsWith('png') ? 'png' : 'jpeg'};base64,` + fs.readFileSync(f).toString('base64');
  const t0 = Date.now();
  const r = await p.evaluate(async ([d, motor]) => { const x = await window.Bon.erkenne(d, null, { motor }); return { posten: x.posten.map((q) => [q.t, q.b, q.sicher ? 1 : 0, q.rep || '', (q.zusaetze || []).map((z) => z.b)]), total: x.total, summe: x.summe, ok: x.pruefung && x.pruefung.gesamtOk, quelle: x.quelle, motor: x.motor, v: x.versuche }; }, [d, motor]);
  // Pfand/Rabatt/Extras hängen am Artikel (Betrag inklusive); für den Vergleich wieder getrennt
  const ist = r.posten.flatMap((q) => (q[4].length ? [q[1] - q[4].reduce((a, x) => a + x, 0), ...q[4]] : [q[1]])).sort((a, c) => a - c), soll = wahr.posten.slice().sort((a, c) => a - c);
  let treffer = 0; const rest = ist.slice(); for (const s of soll) { const k = rest.indexOf(s); if (k >= 0) { treffer++; rest.splice(k, 1); } }
  const alleRichtig = treffer === soll.length && rest.length === 0;
  alle++; if (alleRichtig && r.total === wahr.total) gut++; if (r.total === wahr.total) summeGut++; postenRichtig += treffer; postenAlle += soll.length;
  console.log(`${path.basename(f).padEnd(18)} ${r.motor} ${((Date.now() - t0) / 1000).toFixed(1)}s Posten ${treffer}/${soll.length}${rest.length ? ' +' + rest.length + ' falsch' : ''} Summe ${r.total === wahr.total ? 'ok' : r.total + '≠' + wahr.total} geprüft ${r.ok ? 'ja' : 'nein'} [${r.quelle}; ${r.v.join(' ')}]`);
  if (!alleRichtig || process.env.ALLE) console.log('   ', JSON.stringify(r.posten));
}
console.log(`GESAMT ${motor}: ${gut}/${alle} Bons komplett richtig, Summe ${summeGut}/${alle}, Posten ${postenRichtig}/${postenAlle}`);
await b.close();
