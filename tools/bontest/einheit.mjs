// Einheitstests für den Leser: Zeilen als Text (ohne Bild), erwartete Posten und Summe
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage();
p.on('pageerror', (e) => console.log('FEHLER', String(e)));
await p.goto('http://localhost:8765/manifest.webmanifest');
await p.addScriptTag({ url: 'http://localhost:8765/speisen.js' });
await p.addScriptTag({ url: 'http://localhost:8765/bon.js' });
const r = await p.evaluate(() => {
  // Zeile aus Text; unsicher: { stelle: [p, alt, p2] }; x: Einrückung
  const Z = (t, y, unsicher = {}, x = 0) => ({ text: t, b: { x0: x, y0: y * 20, x1: 500, y1: y * 20 + 20 }, c: 95, zeichen: [...t].map((z, i) => unsicher[i] ? { z, p: unsicher[i][0], alt: unsicher[i][1], p2: unsicher[i][2] } : { z, p: 0.999 }) });
  const L = (...t) => t.map((x, i) => (typeof x === 'string' ? Z(x, i) : Z(x[0], i, x[1] || {}, x[2] || 0)));
  const fall = (name, zeilen, soll, qr) => {
    const x = window.Bon.liesAllgemein(zeilen, qr);
    const ist = x.posten.map((q) => `${q.t}=${q.b}${q.menge > 1 ? `[${q.menge}x${q.einzel}]` : ''}${(q.zusaetze || []).map((z) => `{${z.art}${z.b}}`).join('')}${q.kaution ? '{kaution}' : ''}${q.sicher ? '' : '?'}`).join(' | ') + ` · total ${x.total}${x.anzahlung ? ' · anzahlung ' + x.anzahlung : ''}`;
    return [ist === soll ? 'OK    ' : 'FEHLER', name.padEnd(16), ist, ist === soll ? '' : '\n        soll: ' + soll];
  };
  const out = [];
  out.push(fall('ziffer', L('2 x Weizenbier 9,80', ['Schnitzel 13,50', { 11: [0.6, '8', 0.35] }], 'Salat 6,50', 'Summe EUR 34,80'), 'Weizenbier=980[2x490] | Schnitzel=1850 | Salat=650 · total 3480'));
  out.push(fall('summe falsch', L('Weizenbier 9,80', 'Schnitzel 18,50', 'Salat 6,50', 'Summe 34,30', 'Karte 34,80'), 'Weizenbier=980 | Schnitzel=1850 | Salat=650 · total 3480'));
  out.push(fall('usa', L('Burger 13.95', 'Fries 4.50', 'Subtotal 18.45', 'Tax 1.29', 'Total 19.74'), 'Burger=1395 | Fries=450 | Tax=129 · total 1974'));
  out.push(fall('ohne summe', L('Burger 13,95', 'Fries 4,50'), 'Burger=1395? | Fries=450? · total null'));
  out.push(fall('menge', L('Weizenbier', '2 x 4,90 5,80', 'Salat 6,50', 'Summe 16,30'), 'Weizenbier=980[2x490] | Salat=650 · total 1630'));
  out.push(fall('rabatt+pfand', L('Kaese 1,78', 'Rabatt Kaese 0,30', 'Pfand 0,25', 'SUMME 1,73'), 'Kaese=148{rabatt-30} | Pfand=25 · total 173'));
  out.push(fall('passt nicht', L('A Essen 10,00', 'B Essen 20,00', 'Total 99,00'), 'A Essen=1000? | B Essen=2000? · total 9900'));
  out.push(fall('schweiz', L("Uhr 1'234.50", 'Band 15.50', "Total CHF 1'250.00"), 'Uhr=123450 | Band=1550 · total 125000'));
  // Supermarkt: Pfand unter dem Getränk (Markt B), Steuerbuchstaben
  out.push(fall('pfand unten', L('LEMON+KOFFEIN 1,09 A', 'PFAND 0,15 EUR 0,15 A *', 'ISO PINK GRAP 0,39 A', 'PFAND 0,25 EURO 0,25 A *', 'EXQUISA KOERN. 1,11 B', 'SUMME 2,99'), 'LEMON+KOFFEIN=124{pfand15} | ISO PINK GRAP=64{pfand25} | EXQUISA KOERN.=111 · total 299'));
  // Pfand über dem Getränk (anderer Kassentyp)
  out.push(fall('pfand oben', L('Brot 1,99 B', 'Pfand 0,25 A', 'Cola 1,29 A', 'Summe 3,53'), 'Brot=199 | Cola=154{pfand25} · total 353'));
  // Menge über, unter und neben dem Artikel
  out.push(fall('menge oben', L('2 x 1,29', 'Cola 2,58', 'Brot 1,99', 'Summe 4,57'), 'Cola=258[2x129] | Brot=199 · total 457'));
  out.push(fall('menge unten', L('Cola 2,58', '2 Stk x 1,29', 'Brot 1,99', 'Summe 4,57'), 'Cola=258[2x129] | Brot=199 · total 457'));
  out.push(fall('menge daneben', L('Cola 1,29 x 2 2,58', 'Brot 1,99', 'Summe 4,57'), 'Cola=258[2x129] | Brot=199 · total 457'));
  // Rabatt bei kurzer Haltbarkeit unter dem Artikel
  out.push(fall('mhd rabatt', L('Joghurt 0,99 B', 'MHD Rabatt 30% -0,30 B', 'Brot 1,99 B', 'Summe 2,68'), 'Joghurt=69{rabatt-30} | Brot=199 · total 268'));
  out.push(fall('storno', L('Cola 1,29', 'Chips 1,99', 'Storno Chips -1,99', 'Brot 1,99', 'Summe 3,28'), 'Cola=129 | Brot=199 · total 328'));
  out.push(fall('leergut', L('Cola 1,29', 'Leergut -0,75', 'Summe 0,54'), 'Cola=129 | Leergut=-75 · total 54'));
  out.push(fall('tanken', L('Super E10 42,35 l x 1,799 76,19', 'Kaffee 2,50', 'Summe 78,69'), 'Super E10=7619 | Kaffee=250 · total 7869'));
  out.push(fall('hotel', L('Übernachtung 3 Nächte x 120,00 360,00', 'Kurtaxe 6 x 4,00 24,00', 'Frühstück 2 x 15,00 30,00', 'Gesamt 414,00', 'Anzahlung 100,00', 'Offener Betrag 314,00'), 'Übernachtung=36000[3x12000] | Kurtaxe=2400[6x400] | Frühstück=3000[2x1500] · total 41400 · anzahlung 10000'));
  out.push(fall('mietwagen', L('Miete 5 Tage x 45,00 225,00', 'Vollkasko 5 x 12,00 60,00', 'Zusatzfahrer 25,00', 'Summe 310,00', 'Kaution 300,00 blockiert'), 'Miete=22500[5x4500] | Vollkasko=6000[5x1200] | Zusatzfahrer=2500 · total 31000'));
  out.push(fall('kaution posten', L('Fahrrad 2 Tage 30,00', 'Kaution 50,00', 'Summe 80,00'), 'Fahrrad 2 Tage=3000 | Kaution=5000{kaution} · total 8000'));
  out.push(fall('extras', L('Pizza Margherita 9,50', '+ Extra Käse 1,50', 'Cola 3,00', 'Coperto 2 x 2,00 4,00', 'Totale 18,00'), 'Pizza Margherita=1100{extra150} | Cola=300 | Coperto=400[2x200] · total 1800'));
  out.push(fall('menü', L('Menü des Tages 15,90', '- Suppe', '- Schnitzel', 'Wasser 2,50', 'Summe 18,40'), 'Menü des Tages=1590 | Wasser=250 · total 1840'));
  out.push(fall('usa tip', L('Burger 13.95', 'Subtotal 13.95', 'Tax 1.15', 'Total 15.10', 'Tip 3.00', 'Total 18.10'), 'Burger=1395 | Tax=115 | Tip=300 · total 1810'));
  out.push(fall('rundung nl', L('Kaas 2,99', 'Brood 1,99', 'Subtotaal 4,98', 'Afronding 0,02', 'Totaal 5,00'), 'Kaas=299 | Brood=199 | Rundung=2 · total 500'));
  // dreizeilig: Artikelnummer / Name / Einzelpreis Menge Steuer Betrag (Kassen mit Spalten)
  out.push(fall('dreizeilig', L('661', 'Clipper FFX', '3,00 €   7   A 21,00 €', '1086', 'Spezial Glitzer Clipper', '3,50 €   1   A 3,50 €', '662', 'Clipper', '2,00 €   2   A 4,00 €', 'Gesamt Brutto: 28,50 €'), 'Clipper FFX=2100[7x300] | Spezial Glitzer Clipper=350 | Clipper=400[2x200] · total 2850'));
  // Rabatt ohne Stichwort, nur Prozent (Markt B „RBW -10%“)
  out.push(fall('rabatt prozent', L('EIERSPAETZLE 1,59 B', 'VEGANE SCHNITZEL 3,39 B', ' RBW -10% -0,34 B', 'SUMME EUR 4,64'), 'EIERSPAETZLE=159 | VEGANE SCHNITZEL=305{rabatt-34} · total 464'));
  // 3.17: Summe ohne Summenwort (unbekannte Sprache, zweimal: Summe + Zahlung), Stückzahl-Summe, Rundung ohne Betrag, Währung im Wort
  out.push(fall('ohne summenwort', L('RAMEN 9,80', 'GYOZA 4,50', 'BIRU 5,20', 'GOKEI 19,50', 'KAADO 19,50'), 'RAMEN=980 | GYOZA=450 | BIRU=520 · total 1950'));
  out.push(fall('stueckzahl', L('PEN 1.50', 'BOOK 12.00', 'Total Qty 2 13.50', 'TOTAL 13.50'), 'PEN=150 | BOOK=1200 · total 1350'));
  out.push(fall('rundung 5 sen', L('TEA 3.11', 'BUN 4.62', 'TOTAL RM 7.73', 'ROUNDING ADJ', 'TOTAL ROUNDED 7.75'), 'TEA=311 | BUN=462 | Rundung=2 · total 775'));
  out.push(fall('waehrung im wort', L('KRAEUTERQUARK 1,30 B', 'FEUERZEUG 0,99 A', 'SUMME EUR 2,29'), 'KRAEUTERQUARK=130 | FEUERZEUG=99 · total 229'));
  return out;
});
let fehler = 0; for (const x of r) { if (x[0].startsWith('FEHLER')) fehler++; console.log(x.join(' ')); }
console.log(`GESAMT: ${r.length - fehler}/${r.length} Fälle richtig`);
await b.close();
