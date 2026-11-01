'use strict';
/* Fasan Karte – Kassenzettel lesen, ganz im Handy. MPL-2.0
 * Texterkennung: PaddleOCR über ocr.js (seit 3.7, 29.10.2026), sonst tesseract.js 5.1.1 (Apache-2.0) mit portugiesischen
 * Sprachdaten (4.0.0_best_int), vendor/tesseract/. Lesen der Zeilen: liesAllgemein (alle Länder), liesPT (QR-Steuerklassen).
 * Vorgehen (getestet 24.10.2026 an zwei nachgebauten Bons, siehe docs/recherche/2026-10-24-kassenzettel.md):
 *  - PSM 11 (verstreuter Text) findet Namen und Preise auch über breite Lücken; PSM 4/6 verloren rechte Preisspalten.
 *  - Zeilen bauen wir selbst aus den Wort-Rahmen (gleiche Höhe = gleiche Zeile), das verträgt leicht schräge Fotos.
 *  - Jede Zeile behält ihren Rahmen im Foto: Die App zeigt sie dort an, man korrigiert direkt im Bild.
 * Das Foto verlässt das Gerät nie.
 */
window.Bon = (() => {
  let worker = null, laedt = null;
  const basis = () => new URL('vendor/tesseract/', location.href).href;

  function ladeSkript(src) {
    return new Promise((ok, fehler) => {
      if (window.Tesseract) { ok(); return; }
      const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => fehler(new Error('Texterkennung konnte nicht geladen werden'));
      document.head.append(s);
    });
  }
  async function bereit(melde) {
    if (worker) return worker;
    if (!laedt) {
      laedt = (async () => {
        await ladeSkript(basis() + 'tesseract.min.js');
        const w = await window.Tesseract.createWorker('por', 1, {
          workerPath: basis() + 'worker.min.js', corePath: basis() + 'core', langPath: basis() + 'lang', gzip: true,
          logger: (m) => melde && melde(m),
        });
        // user_defined_dpi: ohne Angabe fällt Tesseract auf 70 dpi zurück (Recherche kassenzettel.md)
        await w.setParameters({ tessedit_pageseg_mode: '11', preserve_interword_spaces: '1', user_defined_dpi: '300' });
        worker = w; return w;
      })().catch((e) => { laedt = null; throw e; });
    }
    return laedt;
  }

  // Bild vorbereiten (Tesseract „ImproveQuality“: Kontrast, Binarisierung, Schräglage):
  // 1. Graustufen, längste Seite 2200 px. 2. Licht ausgleichen: Pixel / örtlicher Mittelwert (Kasten-Unschärfe über
  // Integralbild), gegen Schatten und Verläufe. 3. Kontrast strecken (1.–99. Perzentil). 4. Schräglage per Projektionsprofil
  // (−10° bis +10°, Schritt 0,5°) messen und gerade drehen. Ergebnis: Leinwand für die Erkennung und als Anzeige-Bild.
  function grau(c) {
    const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height), p = d.data, n = c.width * c.height, y = new Float32Array(n);
    for (let i = 0; i < n; i++) y[i] = 0.299 * p[i * 4] + 0.587 * p[i * 4 + 1] + 0.114 * p[i * 4 + 2];
    return { y, d, g };
  }
  function lichtAusgleich(y, w, h) {
    const r = Math.max(8, Math.round(Math.min(w, h) / 30));
    const I = new Float64Array((w + 1) * (h + 1));
    for (let j = 0; j < h; j++) { let zs = 0; for (let i = 0; i < w; i++) { zs += y[j * w + i]; I[(j + 1) * (w + 1) + i + 1] = I[j * (w + 1) + i + 1] + zs; } }
    const out = new Float32Array(w * h);
    for (let j = 0; j < h; j++) {
      const a = Math.max(0, j - r), b = Math.min(h, j + r + 1);
      for (let i = 0; i < w; i++) {
        const l = Math.max(0, i - r), q = Math.min(w, i + r + 1);
        const m = (I[b * (w + 1) + q] - I[a * (w + 1) + q] - I[b * (w + 1) + l] + I[a * (w + 1) + l]) / ((b - a) * (q - l));
        out[j * w + i] = Math.min(255, (255 * y[j * w + i]) / Math.max(1, m * 1.02));
      }
    }
    return out;
  }
  function schraeglage(y, w, h, grenze = 10) {
    const f = Math.min(1, 700 / Math.max(w, h)), pts = [];
    for (let j = 0; j < h; j += Math.max(1, Math.round(1 / f))) for (let i = 0; i < w; i += Math.max(1, Math.round(1 / f))) if (y[j * w + i] < 110) pts.push(i * f, j * f);
    if (pts.length < 200) return 0;
    let besterW = 0, besteV = -1;
    for (let gr = -grenze; gr <= grenze; gr += 0.5) {
      const t = (gr * Math.PI) / 180, sin = Math.sin(t), cos = Math.cos(t), bins = new Map();
      for (let k = 0; k < pts.length; k += 2) { const r = Math.round(pts[k + 1] * cos - pts[k] * sin); bins.set(r, (bins.get(r) || 0) + 1); }
      let s = 0, s2 = 0; for (const v of bins.values()) { s += v; s2 += v * v; }
      const v = s2 / bins.size - (s / bins.size) ** 2;
      if (v > besteV) { besteV = v; besterW = gr; }
    }
    return besterW;
  }
  function vorbereiten(daten, gerade) {
    return new Promise((ok, fehler) => {
      const img = typeof daten === 'string' ? new Image() : daten;
      img.onload = () => {
        const f = gerade ? 1 : Math.min(2.5, 2200 / Math.max(img.width, img.height));
        let c = document.createElement('canvas'); c.width = Math.round(img.width * f); c.height = Math.round(img.height * f);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const { y, d, g } = grau(c);
        const flach = lichtAusgleich(y, c.width, c.height);
        const hist = new Uint32Array(256); for (const v of flach) hist[Math.round(v)] += 1;
        const n = flach.length; let lo = 0, hi = 255, s = 0;
        for (let v = 0; v < 256; v++) { s += hist[v]; if (s > n * 0.01) { lo = v; break; } }
        s = 0; for (let v = 255; v >= 0; v--) { s += hist[v]; if (s > n * 0.01) { hi = v; break; } }
        const sp = Math.max(1, hi - lo), p = d.data;
        for (let i = 0; i < n; i++) { const v = Math.max(0, Math.min(255, Math.round(((flach[i] - lo) * 255) / sp))); p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = v; p[i * 4 + 3] = 255; flach[i] = v; }
        g.putImageData(d, 0, 0);
        const winkel = schraeglage(flach, c.width, c.height, gerade ? 3 : 10);
        if (Math.abs(winkel) >= 0.5) {
          const t = (-winkel * Math.PI) / 180, cos = Math.abs(Math.cos(t)), sin = Math.abs(Math.sin(t));
          const r = document.createElement('canvas'); r.width = Math.round(c.width * cos + c.height * sin); r.height = Math.round(c.width * sin + c.height * cos);
          const rg = r.getContext('2d'); rg.fillStyle = '#fff'; rg.fillRect(0, 0, r.width, r.height);
          rg.translate(r.width / 2, r.height / 2); rg.rotate(t); rg.drawImage(c, -c.width / 2, -c.height / 2);
          c = r;
        }
        ok({ canvas: c, winkel });
      };
      img.onerror = () => fehler(new Error('Foto nicht lesbar'));
      if (typeof daten === 'string') img.src = daten; else img.onload();
    });
  }

  // Wörter zu Zeilen: gleiche Mittelhöhe (± 0,55 × Wort-Höhe), bezogen auf das nächste Wort links (verträgt Schräglage)
  // opt.gerade: Bild ist schon entzerrt/gerade gedreht. Dann stammt eine gemessene Neigung meist von gewelltem Papier (links
  // schräg, rechts flach) und darf nicht über die ganze Breite fortgesetzt werden (Test 30.10., REWE: Namen mit Neigung 0,05
  // → Betrag 40 px tiefer gesucht → jede Zeile bekam den Betrag der nächsten). Darum dort höchstens ±0,02 (≈ 1°).
  // Krümel: kleine Kästen mit geringer Sicherheit (Knick, Fleck, Stempelrest → „o“, „opi“). Sie stahlen beim Spaltenabgleich
  // den Betrag einer echten Zeile (Test 30.10., REWE gedreht: „o“ auf Höhe von „1,11“ → EXQUISA ohne Betrag).
  function ohneKrumen(woerter) {
    const w = woerter.filter((x) => x.t.trim() && x.c > 15), hs = w.map((x) => x.b.y1 - x.b.y0).sort((a, b) => a - b), mh = hs[hs.length >> 1] || 0;
    return w.filter((x) => !(x.c < 60 && x.t.replace(/[^A-Za-z0-9]/g, '').length <= 3 && x.b.y1 - x.b.y0 < 0.6 * mh));
  }
  function zeilenAus(woerter, opt = {}) {
    // Höhe ohne den Anteil, den die Schräglage zum Rahmen beiträgt (sonst würden Nachbarzeilen mitgefangen)
    const w = ohneKrumen(woerter).map((x) => ({ ...x, cy: (x.b.y0 + x.b.y1) / 2, h: Math.max(4, x.b.y1 - x.b.y0 - (x.neig ? Math.abs(x.neig) * (x.b.x1 - x.b.x0) : 0)) }));
    w.sort((a, b) => a.b.x0 - b.b.x0);
    // Neigung am Ort: Median der Neigungen langer Kästen in der Nähe (kurze Wörter haben keine verlässliche Richtung);
    // bei Perspektive ändert sich die Neigung über die Höhe des Bons, darum örtlich statt einer für alle.
    const lang = w.filter((x) => x.neig != null && x.b.x1 - x.b.x0 > 6 * x.h);
    const med = (v) => { v.sort((a, b) => a - b); return v.length ? v[v.length >> 1] : 0; };
    const alle = med(lang.map((q) => q.neig));
    const grenze = opt.gerade ? 0.02 : 1;
    const neigBei = (y, h) => { const v = lang.filter((q) => Math.abs(q.cy - y) < 5 * h).map((q) => q.neig); const n = v.length ? med(v) : alle; return Math.max(-grenze, Math.min(grenze, n)); };
    const zeilen = [];
    for (const x of w) {
      let beste = null, bestD = Infinity;
      for (const z of zeilen) {
        const letztes = z.w[z.w.length - 1];
        if (letztes.b.x1 > x.b.x0 + x.h) continue; // überlappt waagrecht: andere Zeile
        // Schräge Zeilen (PaddleOCR liefert die Neigung): Höhe des linken Wortes bis zur Mitte des neuen Wortes verlängern
        const n = neigBei(letztes.cy, letztes.h), dx = (x.b.x0 + x.b.x1) / 2 - (letztes.b.x0 + letztes.b.x1) / 2;
        const d = Math.abs(letztes.cy + n * dx - x.cy);
        if (d < 0.55 * Math.max(x.h, letztes.h) && d < bestD) { beste = z; bestD = d; }
      }
      if (beste) beste.w.push(x); else zeilen.push({ w: [x] });
    }
    for (const z of zeilen) zeileFertig(z);
    return zeilen.sort((a, b) => (a.b.y0 + a.b.y1) - (b.b.y0 + b.b.y1));
  }
  function zeileFertig(z) {
    z.w.sort((a, b) => a.b.x0 - b.b.x0);
    z.b = { x0: Math.min(...z.w.map((x) => x.b.x0)), y0: Math.min(...z.w.map((x) => x.b.y0)), x1: Math.max(...z.w.map((x) => x.b.x1)), y1: Math.max(...z.w.map((x) => x.b.y1)) };
    z.c = Math.min(...z.w.map((x) => x.c));
    // Zeichen mit Sicherheit und zweitbester Lesung (PaddleOCR); Text und Zeichenliste bleiben Stelle für Stelle gleich lang.
    // Schmale Bon-Schrift: die Erkennung trennt Beträge am Komma („1,“ | „11 B“) – dicht beieinander wieder ohne Leerzeichen.
    const zz = []; let vorher = null;
    for (const x of z.w) {
      const eigene = x.zeichen && x.zeichen.length ? x.zeichen.filter((q) => q.z) : [...x.t].map((ch) => ({ z: ch, p: (x.c || 0) / 100 }));
      let s = 0, e = eigene.length; while (s < e && eigene[s].z === ' ') s++; while (e > s && eigene[e - 1].z === ' ') e--;
      const teil = eigene.slice(s, e), hz = Math.max(4, x.b.y1 - x.b.y0);
      const kleben = vorher && /[.,]$/.test(vorher.t.trim()) && /^\d/.test(x.t.trim()) && x.b.x0 - vorher.b.x1 < hz * 0.9;
      if (zz.length && !kleben) zz.push({ z: ' ', p: 1 });
      zz.push(...teil); vorher = x;
    }
    z.zeichen = zz;
    z.text = zz.map((q) => q.z).join('');
    return z;
  }
  // ---------- Bon aus der Lage der Schrift finden (wie ein Dokumentscanner, aber ohne Papierkanten): Wenn der weiße Bon auf
  // hellem Grund liegt, findet bonbild.js ihn nicht. Dann bilden die Textzeilen das Viereck: linke Kante aus den linken
  // Zeilenanfängen, rechte aus den Zeilenenden (je robuste Gerade), oben/unten aus der Neigung der Textkästen.
  function textViereck(zeilen, W, H) {
    let z = zeilen.filter((q) => q.w.length && q.b.x1 - q.b.x0 > 2 * (q.b.y1 - q.b.y0));
    if (z.length < 6) return null;
    const med = (a) => { const v = [...a].sort((p, q) => p - q); return v.length ? v[v.length >> 1] : 0; };
    const h = med(z.map((q) => q.b.y1 - q.b.y0)), cy = (q) => (q.b.y0 + q.b.y1) / 2;
    // größte zusammenhängende Gruppe (Lücken unter 5 Zeilenhöhen) – Text außerhalb des Bons fällt weg
    z.sort((a, b) => cy(a) - cy(b)); const gruppen = [[z[0]]];
    for (let i = 1; i < z.length; i++) { if (cy(z[i]) - cy(z[i - 1]) > 5 * h) gruppen.push([]); gruppen[gruppen.length - 1].push(z[i]); }
    z = gruppen.sort((a, b) => b.length - a.length)[0]; if (z.length < 6) return null;
    const gerade = (pk) => { // x = a + b·y, zweimal Ausreißer entfernen
      let p = pk; for (let it = 0; it < 3; it++) {
        const n = p.length, sy = p.reduce((s2, q) => s2 + q[1], 0) / n, sx = p.reduce((s2, q) => s2 + q[0], 0) / n;
        let num = 0, den = 0; for (const [x, y] of p) { num += (y - sy) * (x - sx); den += (y - sy) ** 2; }
        const b = den ? num / den : 0, a = sx - b * sy, res = p.map(([x, y]) => Math.abs(x - (a + b * y))), m2 = med(res) * 2.5 + 1;
        if (it === 2 || p.length < 5) return { a, b }; p = p.filter((q, k) => res[k] <= m2);
      } return { a: 0, b: 0 };
    };
    const x0s = z.map((q) => q.b.x0), x1s = z.map((q) => q.b.x1), q30 = [...x0s].sort((a, b) => a - b)[Math.floor(z.length * 0.4)], q70 = [...x1s].sort((a, b) => a - b)[Math.floor(z.length * 0.6)];
    const li = gerade(z.filter((q) => q.b.x0 <= q30).map((q) => [q.b.x0 - 1.2 * h, cy(q)])), re = gerade(z.filter((q) => q.b.x1 >= q70).map((q) => [q.b.x1 + 1.2 * h, cy(q)]));
    const neig = (rows) => med(rows.flatMap((q) => q.w.filter((x) => x.neig != null && x.b.x1 - x.b.x0 > 4 * h).map((x) => x.neig))) || 0;
    const k4 = Math.max(2, Math.floor(z.length / 4)), oben = z.slice(0, k4), unten = z.slice(-k4), xc = med(z.map((q) => (q.b.x0 + q.b.x1) / 2));
    const yO = Math.min(...oben.map((q) => q.b.y0)) - 1.5 * h, yU = Math.max(...unten.map((q) => q.b.y1)) + 1.5 * h, sO = neig(oben), sU = neig(unten);
    const schnitt = (g, y0, sl) => { const x = (g.a + g.b * y0 - g.b * sl * xc) / (1 - g.b * sl); return [Math.max(0, Math.min(W, x)), Math.max(0, Math.min(H, y0 + sl * (x - xc)))]; };
    const ecken = [schnitt(li, yO, sO), schnitt(re, yO, sO), schnitt(re, yU, sU), schnitt(li, yU, sU)];
    const breite = Math.hypot(ecken[1][0] - ecken[0][0], ecken[1][1] - ecken[0][1]);
    return breite > 10 * h ? ecken : null;
  }
  // ---------- Entfalten mit UVDoc (neuronal): Knicke und Wölbung des ganzen Blatts, auch zwischen den Zeilen ----------
  // Das Netz sagt auf einem 31×45-Gitter, wo jeder Punkt des glatten Blatts im Foto liegt; das Bild wird danach neu
  // abgetastet (bilinear, wie grid_sample mit align_corners in UVDoc/utils.py).
  async function entfalten(c, quelle = c, zielBreite = 1300) {
    const da = window.FasanOCR && window.FasanOCR.uvdoc && (await window.FasanOCR.uvdocDa());
    if (!da) { pl('uvdoc', { da: false }); return null; }
    const ts = performance.now();
    const { gitter, dims } = await window.FasanOCR.uvdoc(c), gh = dims[2], gw = dims[3], W = c.width, H = c.height, n = gh * gw;
    // Gitter aus dem (verkleinerten) Bild c, abgetastet wird in der vollen Auflösung der Quelle
    const QW = quelle.width, QH = quelle.height;
    let src;
    { const q = quelle instanceof HTMLCanvasElement ? quelle : (() => { const t = document.createElement('canvas'); t.width = QW; t.height = QH; t.getContext('2d').drawImage(quelle, 0, 0); return t; })(); src = q.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, QW, QH).data; }
    // Ausgabegröße aus dem Gitter (Länge der Gitterlinien im Foto), nicht die Fotogröße: ein schmaler Bon in einem 3:4-Foto
    // würde sonst in die Breite gezogen (Schrift verzerrt)
    const px = (k) => [((gitter[k] + 1) / 2) * (QW - 1), ((gitter[n + k] + 1) / 2) * (QH - 1)];
    let lw = 0, lh = 0;
    for (let j = 0; j < gh; j++) for (let i = 0; i + 1 < gw; i++) { const a = px(j * gw + i), b = px(j * gw + i + 1); lw += Math.hypot(b[0] - a[0], b[1] - a[1]); }
    for (let i = 0; i < gw; i++) for (let j = 0; j + 1 < gh; j++) { const a = px(j * gw + i), b = px((j + 1) * gw + i); lh += Math.hypot(b[0] - a[0], b[1] - a[1]); }
    lw /= gh; lh /= gw;
    // auf die Lesebreite der übrigen Durchläufe bringen (kleine Schrift liest die Erkennung schlechter), höchstens 4500 px
    const f = Math.min(Math.max(1, zielBreite / lw), 4500 / Math.max(lw, lh)), OW = Math.max(32, Math.round(lw * f)), OH = Math.max(32, Math.round(lh * f));
    const out = document.createElement('canvas'); out.width = OW; out.height = OH;
    const og = out.getContext('2d'), od = og.createImageData(OW, OH), o = od.data;
    for (let y = 0; y < OH; y++) {
      const fy = (y / (OH - 1)) * (gh - 1), j = Math.min(gh - 2, fy | 0), v = fy - j;
      for (let x = 0; x < OW; x++) {
        const fx = (x / (OW - 1)) * (gw - 1), i = Math.min(gw - 2, fx | 0), u = fx - i, k0 = j * gw + i, k1 = k0 + gw;
        const gx = (gitter[k0] * (1 - u) + gitter[k0 + 1] * u) * (1 - v) + (gitter[k1] * (1 - u) + gitter[k1 + 1] * u) * v;
        const gy = (gitter[n + k0] * (1 - u) + gitter[n + k0 + 1] * u) * (1 - v) + (gitter[n + k1] * (1 - u) + gitter[n + k1 + 1] * u) * v;
        const X = Math.max(0, Math.min(QW - 1.001, ((gx + 1) / 2) * (QW - 1))), Y = Math.max(0, Math.min(QH - 1.001, ((gy + 1) / 2) * (QH - 1)));
        const xi = X | 0, yi = Y | 0, a = X - xi, b = Y - yi, p0 = (yi * QW + xi) * 4, p1 = p0 + QW * 4, q = (y * OW + x) * 4;
        for (let ch = 0; ch < 3; ch++) o[q + ch] = (src[p0 + ch] * (1 - a) + src[p0 + 4 + ch] * a) * (1 - b) + (src[p1 + ch] * (1 - a) + src[p1 + 4 + ch] * a) * b;
        o[q + 3] = 255;
      }
    }
    og.putImageData(od, 0, 0);
    pl('uvdoc', { da: true, ms: Math.round(performance.now() - ts), ein: `${W}×${H}`, quelle: `${QW}×${QH}`, aus: `${OW}×${OH}` });
    return out;
  }
  // ---------- Spaltenabgleich: Namen links und Beträge rechts getrennt zu Reihen bündeln und der Reihe nach paaren.
  // Hilft, wenn der Bon schräg/gewölbt fotografiert ist und die Betragsspalte gegenüber den Namen um bis zu eine Zeile
  // verrutscht (Test 30.10., REWE-Bon: Beträge eine halbe Zeile höher). Der beste gleichbleibende Versatz wird gesucht,
  // die Paarung ist eine Sequenz-Ausrichtung (Needleman-Wunsch) mit Lücken für Zeilen ohne Partner.
  // mehrere: je ganzzahligem Zeilenversatz (−2 … +2 Zeilen) die beste Paarung. Geometrie allein kann einen Versatz um eine
  // ganze Zeile nicht von „kein Versatz“ unterscheiden (Test 31.10., REWE 3 verkleinert: Beträge eine Zeile höher als die
  // Namen) – das entscheidet dann die Summenprüfung (lauf vergleicht alle Kandidaten).
  function zeilenSpalten(woerter, mehrere) {
    const w = ohneKrumen(woerter);
    const istBetrag = (t) => /-?\d+[.,]\s?\d{2}(?!\d)/.test(t) && !/[a-z]{4,}/i.test(t.replace(/euro?/gi, ''));
    const bet = w.filter((x) => istBetrag(x.t)); if (bet.length < 3) return null;
    const hs = w.map((x) => x.b.y1 - x.b.y0).sort((a, b) => a - b), h = hs[hs.length >> 1];
    const kanten = bet.map((x) => x.b.x1).sort((a, b) => a - b), kante = kanten[Math.floor(kanten.length * 0.7)];
    const rechts = w.filter((x) => (istBetrag(x.t) && Math.abs(x.b.x1 - kante) < 3 * h) || (x.b.x0 > kante - 0.6 * h && x.t.replace(/[^A-Za-z0-9*€]/g, '').length <= 3));
    if (rechts.filter((x) => istBetrag(x.t)).length < 3) return null;
    const links = w.filter((x) => !rechts.includes(x));
    const L = zeilenAus(links, { gerade: true }), R = zeilenAus(rechts, { gerade: true }); if (!L.length || !R.length) return null;
    const cy = (z) => (z.b.y0 + z.b.y1) / 2;
    const ly = L.map(cy), ab = ly.slice(1).map((y, i) => y - ly[i]).filter((d) => d > h * 0.4).sort((a, b) => a - b);
    const pitch = ab.length ? ab[ab.length >> 1] : h * 1.3;
    const bau = (best) => {
    const out = [], nimmR = new Set();
    for (const z of L) z.genommen = false;
    for (const [i, j] of best.paare) { out.push(zeileFertig({ w: [...L[i].w, ...R[j].w] })); nimmR.add(j); L[i].genommen = true; }
    for (const z of L) if (!z.genommen) out.push(z);
    R.forEach((z, j) => { if (!nimmR.has(j)) out.push(z); });
    out.spalten = { versatz: +(best.off / pitch).toFixed(2), paare: best.paare.length, pitch };
    return out.sort((a, b) => cy(a) - cy(b));
    };
    const je = new Map();
    for (let o = -2.4; o <= 2.4001; o += 0.05) { const a = reihenAbgleich(L, R, o * pitch, pitch), k = Math.round(o); if (!je.has(k) || a.kosten < je.get(k).kosten) je.set(k, a); }
    const sortiert = [...je.values()].sort((a, b) => a.kosten - b.kosten);
    if (!mehrere) return bau([...je.entries()].filter(([k]) => Math.abs(k) <= 1).map(([, a]) => a).sort((a, b) => a.kosten - b.kosten)[0]);
    return sortiert.slice(0, 4).map(bau);
  }
  // ---------- Betragsspalte neu zerlegen ----------
  // Engzeilig gedruckte, gewellte Bons: Die Texterkennung verschmilzt oder zerreißt die übereinanderstehenden Beträge
  // („1,“ | „E79“ | „89“, Test 31.10., Handy-Protokoll REWE 3: 1,30 fehlte in jedem Durchlauf). Hier wird die Spalte als
  // Streifen ausgeschnitten, ihre Neigung aus dem Zeilenprofil bestimmt (Projektionsprofil, klassische Zeilentrennung),
  // an den Lücken zwischen den Druckzeilen geteilt und jede Zeile einzeln gelesen. Rückgabe: neue Wortliste oder null.
  async function spalteNeu(c, woerter) {
    if (!window.FasanOCR || !window.FasanOCR.mehrfach || !c || !c.getContext) return null;
    const w = ohneKrumen(woerter), istB = (t) => /\d[.,]\s?\d{2}(?!\d)/.test(t) && !/[a-z]{4,}/i.test(t);
    const bet = w.filter((x) => istB(x.t)); if (bet.length < 3) return null;
    const med = (a) => [...a].sort((p, q) => p - q)[a.length >> 1], h = med(w.map((x) => x.b.y1 - x.b.y0));
    const kante = [...bet.map((x) => x.b.x1)].sort((p, q) => p - q)[Math.floor(bet.length * 0.7)];
    const spalte = w.filter((x) => x.b.x1 > kante - 2.5 * h && x.b.x1 < kante + 2 * h && /\d/.test(x.t) && !/[a-z]{3,}/i.test(x.t));
    if (spalte.length < 3) return null;
    // linker Rand: Kante minus die übliche Breite eines Betrags (nicht das am weitesten links reichende Wort – das ist oft ein
    // mit dem Namen verschmolzener Kasten)
    const breite = med(bet.map((x) => x.b.x1 - x.b.x0));
    const X0 = Math.max(0, Math.round(Math.max(Math.min(...spalte.map((x) => x.b.x0)), kante - 1.6 * breite) - 0.4 * h)), X1 = Math.min(c.width, Math.round(kante + 1.2 * h));
    const Y0 = Math.max(0, Math.round(Math.min(...spalte.map((x) => x.b.y0)) - h)), Y1 = Math.min(c.height, Math.round(Math.max(...spalte.map((x) => x.b.y1)) + h));
    const SW = X1 - X0, SH = Y1 - Y0; if (SW < 2 * h || SH < 3 * h) return null;
    // Graustufen und Schwelle (Otsu) im Streifen
    const roh = c.getContext('2d', { willReadFrequently: true }).getImageData(X0, Y0, SW, SH).data, grau = new Uint8Array(SW * SH), hist = new Float64Array(256);
    for (let i = 0; i < grau.length; i++) { const v = (roh[i * 4] * 3 + roh[i * 4 + 1] * 6 + roh[i * 4 + 2]) / 10 | 0; grau[i] = v; hist[v]++; }
    let schwelle = 128; { let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i]; let wB = 0, sB = 0, best = -1; for (let t = 0; t < 256; t++) { wB += hist[t]; if (!wB) continue; const wF = grau.length - wB; if (!wF) break; sB += t * hist[t]; const d = sB / wB - (sum - sB) / wF, v = wB * wF * d * d; if (v > best) { best = v; schwelle = t; } } }
    const dunkel = []; for (let y = 0; y < SH; y += 1) for (let x = 0; x < SW; x += 2) if (grau[y * SW + x] < schwelle) dunkel.push(x, y);
    if (dunkel.length < 40) return null;
    // Neigung: der Winkel, bei dem das Zeilenprofil am schärfsten ist
    let winkel = 0, bestS = -1;
    for (let a = -6; a <= 6.001; a += 0.25) { const t = Math.tan((a * Math.PI) / 180), pr = new Float64Array(SH + SW); for (let i = 0; i < dunkel.length; i += 2) { const yy = Math.round(dunkel[i + 1] - (dunkel[i] - SW / 2) * t + SW / 2); if (yy >= 0 && yy < pr.length) pr[yy]++; } let s2 = 0; for (const v of pr) s2 += v * v; if (s2 > bestS) { bestS = s2; winkel = a; } }
    // Streifen um die Neigung zurückdrehen, Profil neu messen, an den Lücken teilen
    const R = document.createElement('canvas'); R.width = SW; R.height = SH;
    const rg = R.getContext('2d', { willReadFrequently: true }); rg.fillStyle = '#fff'; rg.fillRect(0, 0, SW, SH);
    // Streifen ohne fremde Wörter (Namen, die in den Streifen ragen): diese Flächen werden weiß
    const S = document.createElement('canvas'); S.width = SW; S.height = SH; const sg = S.getContext('2d'); sg.drawImage(c, X0, Y0, SW, SH, 0, 0, SW, SH); sg.fillStyle = '#fff';
    for (const x of w) if (!spalte.includes(x) && /[a-z]{2,}/i.test(x.t) && x.b.x1 > X0 && x.b.x0 < X1 && x.b.y1 > Y0 && x.b.y0 < Y1) sg.fillRect(x.b.x0 - X0, x.b.y0 - Y0, x.b.x1 - x.b.x0, x.b.y1 - x.b.y0);
    rg.translate(SW / 2, SH / 2); rg.rotate((-winkel * Math.PI) / 180); rg.drawImage(S, -SW / 2, -SH / 2); rg.setTransform(1, 0, 0, 1, 0, 0);
    const rd = rg.getImageData(0, 0, SW, SH).data, prof = new Float64Array(SH), lx = new Int32Array(SH).fill(SW), rx = new Int32Array(SH).fill(-1);
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const o = (y * SW + x) * 4; if ((rd[o] * 3 + rd[o + 1] * 6 + rd[o + 2]) / 10 < schwelle) { prof[y]++; if (x < lx[y]) lx[y] = x; if (x > rx[y]) rx[y] = x; } }
    const gl = Float64Array.from(prof, (v, i) => (prof[Math.max(0, i - 1)] + v + prof[Math.min(SH - 1, i + 1)]) / 3);
    const grenze = Math.max(1.5, 0.06 * Math.max(...gl)), laeufe = [];
    for (let y = 0, a = -1; y <= SH; y++) { const an = y < SH && gl[y] > grenze; if (an && a < 0) a = y; if (!an && a >= 0) { laeufe.push([a, y]); a = -1; } }
    // zu hohe Läufe (zwei Zeilen ohne sichtbare Lücke) am schwächsten Punkt teilen, zu niedrige (Striche, Punkte) verwerfen
    // Druckzeilenhöhe aus den einzeln stehenden Läufen; ein Lauf aus k Zeilen wird an den k−1 schwächsten Stellen nahe den
    // erwarteten Grenzen geteilt
    const einzeln = laeufe.map(([a, b]) => b - a).filter((d) => d > 0.55 * h && d < 1.45 * h), hz = einzeln.length >= 2 ? med(einzeln) : h;
    const zeilen = [];
    for (const [a, b] of laeufe) {
      const k = Math.max(1, Math.round((b - a) / hz));
      if (k === 1) { if (b - a >= 0.45 * h) zeilen.push([a, b]); continue; }
      let start = a;
      for (let j = 1; j < k; j++) { const soll = a + ((b - a) * j) / k, r = 0.3 * hz; let m = Math.round(soll), mv = Infinity; for (let y = Math.round(soll - r); y <= soll + r; y++) if (y > start && y < b && gl[y] < mv) { mv = gl[y]; m = y; } zeilen.push([start, m]); start = m; }
      zeilen.push([start, b]);
    }
    if (zeilen.length < 3 || zeilen.length > 80) return null;
    const neu = [], cos = Math.cos((winkel * Math.PI) / 180), sin = Math.sin((winkel * Math.PI) / 180);
    for (const [a, b] of zeilen) {
      let l = SW, r = -1; for (let y = a; y < b; y++) { if (lx[y] < l) l = lx[y]; if (rx[y] > r) r = rx[y]; }
      if (r - l < 0.6 * h) continue;
      const k = { x0: Math.max(0, l - 0.3 * h), x1: Math.min(SW, r + 0.3 * h), y0: Math.max(0, a - 0.12 * h), y1: Math.min(SH, b + 0.12 * h) };
      let lesungen = [];
      try { lesungen = await window.FasanOCR.mehrfach(R, k, { varianten: [[0.12, 0], [0.3, 0], [0.2, 0, true]] }); } catch (e) { continue; }
      lesungen = lesungen.map((x) => ({ ...x, t: x.t.replace(/^[^\d-]+/, '').trim() })).filter((x) => x.t);
      const mitB = lesungen.filter((x) => istB(x.t)), wahl = (mitB.length ? mitB : lesungen).sort((p, q) => q.c - p.c)[0];
      if (!wahl || !/\d/.test(wahl.t)) continue;
      // Mitte zurück ins Bild (Drehung um die Streifenmitte)
      const mx = (k.x0 + k.x1) / 2 - SW / 2, my = (a + b) / 2 - SH / 2, ox = mx * cos - my * sin + SW / 2 + X0, oy = mx * sin + my * cos + SH / 2 + Y0, hw = (k.x1 - k.x0) / 2, hh = (b - a) / 2;
      neu.push({ t: wahl.t, c: wahl.c, b: { x0: ox - hw, x1: ox + hw, y0: oy - hh, y1: oy + hh }, spalte: true, mehr: lesungen.map((x) => x.t) });
    }
    if (neu.filter((x) => istB(x.t)).length < 3) return null;
    // alte Wörter der Spalte (Ziffern, Steuerbuchstaben) ersetzen; Wörter, die links aus dem Streifen ragen, bleiben
    const imStreifen = (x) => x.b.x0 >= X0 - 0.3 * h && x.b.x1 <= X1 + 0.5 * h && (x.b.y0 + x.b.y1) / 2 >= Y0 && (x.b.y0 + x.b.y1) / 2 <= Y1 && (/\d/.test(x.t) || x.t.trim().length <= 2) && !/[a-z]{3,}/i.test(x.t);
    pl('spalte', { winkel, zeilen: zeilen.length, gelesen: neu.length, betraege: neu.filter((x) => istB(x.t)).map((x) => x.t) });
    return [...woerter.filter((x) => !imStreifen(x)), ...neu];
  }
  function reihenAbgleich(L, R, off, pitch) {
    const n = L.length, m = R.length, cy = (z) => (z.b.y0 + z.b.y1) / 2, LUECKE_L = 0.45, LUECKE_R = 0.6;
    const D = Array.from({ length: n + 1 }, () => new Float64Array(m + 1)), W = Array.from({ length: n + 1 }, () => new Int8Array(m + 1));
    for (let i = 1; i <= n; i++) { D[i][0] = i * LUECKE_L; W[i][0] = 1; }
    for (let j = 1; j <= m; j++) { D[0][j] = j * LUECKE_R; W[0][j] = 2; }
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
      const d = Math.abs(cy(R[j - 1]) - cy(L[i - 1]) - off) / pitch, ohneName = (L[i - 1].text.match(/[A-Za-zÀ-ÿ]/g) || []).length < 2 ? 0.5 : istKopfzeile(L[i - 1].text) ? 2 : 0; // Kopfzeilen (UID, Tel.) haben keine Beträge
      const paar = d < 0.6 ? D[i - 1][j - 1] + d * d * 2 + ohneName : Infinity;
      const a = D[i - 1][j] + LUECKE_L, b = D[i][j - 1] + LUECKE_R;
      if (paar <= a && paar <= b) { D[i][j] = paar; W[i][j] = 0; } else if (a <= b) { D[i][j] = a; W[i][j] = 1; } else { D[i][j] = b; W[i][j] = 2; }
    }
    const paare = []; let i = n, j = m;
    while (i > 0 || j > 0) { const w = W[i][j]; if (w === 0) { paare.push([i - 1, j - 1]); i--; j--; } else if (w === 1) i--; else j--; }
    return { kosten: D[n][m], paare: paare.reverse(), off };
  }

  // Preise: 1,50 / 12,90 / 1.234,50 / -0,20; Buchstaben-Verwechsler zwischen Ziffern werden korrigiert
  const PREIS = /(-?\d{1,3}(?:[.\s]\d{3})*[,.]\d{2})(?!\d)/g;
  const NEIN = /\b(sub-?total|total|iva|taxa|base|multibanco|mb\s*way|visa|mastercard|maestro|cart[aã]o|troco|dinheiro|numer[aá]rio|pago|nif|contribuinte|atcud|fatura|factura|documento|original|data|hora|mesa|operador|obrigad|volte|saldo|acumulad|pontos|tel\.?|telefone|www\.|lda|s\.a\.|loja)\b/i;
  const TOTAL = /\btotal\b(?!\s*iva)/i;
  function zahl(t) {
    // ohne Lookbehind (ältere Safari-Fassungen kennen ihn nicht)
    const x = t.replace(/(\d)[oO](?=\d)/g, (m, d) => `${d}0`).replace(/(\d)[lI|](?=\d)/g, (m, d) => `${d}1`);
    return x;
  }
  function cent(s) { const neg = s.startsWith('-'); const v = Math.round(parseFloat(s.replace(/[-\s.](?=\d{3}\b)/g, '').replace(/^-/, '').replace(',', '.')) * 100); return neg ? -v : v; }
  const buchstaben = (t) => (t.replace(/\b(x|kg|eur|un|uni|l|cl|ml|g)\b/gi, '').match(/[a-zà-ÿ]/gi) || []).length;

  // ---------- Bons aus allen Ländern (lateinische Schrift) ----------
  // 1. Zahlenformat am Bon selbst erkennen: Komma oder Punkt als Dezimaltrenner (1.234,50 / 1,234.50 / 1'234.50).
  // 2. Zeilen einordnen: Posten, Summe, Zwischensumme, Steuer, Service, Zahlung, Rabatt, Sonstiges (Wörter in vielen Sprachen).
  // 3. Schiedsrichter: Die Posten müssen eine unabhängig gelesene Summe ergeben (Summenzeile, Kartenzahlung, gegeben − Rückgeld,
  //    QR-Code). Unsichere Ziffern haben eine zweitbeste Lesung (PaddleOCR), Menge × Einzelpreis ist eine weitere Lesung.
  //    Gewählt wird die Kombination mit den wenigsten Änderungen, die genau aufgeht. Geht nichts auf, bleibt die Lesung
  //    sichtbar unsicher und die App zeigt die Differenz – nichts wird schöngerechnet.
  const ohneAkz = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const W = {
    summe: /\b(total|totaal|totale|totalt|gesamt|gesamtbetrag|gesamtsumme|summe|endsumme|endbetrag|zu zahlen|zahlbetrag|importe|a pagar|montant|net a payer|te betalen|suma|razem|celkem|osszesen|yhteensa|att betala|i alt|ukupno|toplam|kokku|amount due|balance due)\b/,
    zwischen: /\b(sub-?total|subtotale|subtotaal|sous-?total|zwischensumme|zw\.? ?summe)\b/,
    steuer: /\b(mwst|mw\.?st|ust|vat|gst|sst|hst|pst|tax|taxes|sales tax|iva|tva|btw|moms|mva|alv|dph|pdv|kdv|steuer|netto|brutto|incid|incidencia|incidencias|imponible|imponibile|imposta|taxa iva|base|tributavel|ht|sem iva|net)\b/,
    service: /\b(service|serv|svc|bedienung|trinkgeld|tip|tips|gratuity|servizio|pourboire|fooi|propina)\b/,
    // Stückzahl-Summen („Total Qty 2“, „Item(s): 5“, „Total Points“): nie die Gesamtsumme (SROIE 003, 052, 054)
    anzahl: /\b(total\s*(qty|quantity|items?|pcs|points|pts)|items?\s*\(?s?\)?\.?\s*:|qty\s*\(?s?\)?\.?\s*:|item count|iten count|no\.? of items|anzahl artikel|artikelanzahl|anz\.? artikel)/,
    // „Total incl. GST“ ist die Gesamtsumme, keine Steuerzeile; „Net Total“ (Malaysia, Singapur) ebenso
    inklSteuer: /\b(incl|inkl|inclusive?|inclusiv\s+e|including|inc)\b\.?\s*(of\s*)?(gst|vat|tax|mwst|iva|tva|sst|ust)\b|\binclu\S{0,5}(\s+\S)?\s+(of\s*)?(gst|vat|tax|sst)\b|\b(net|nett)\s+total\b/, // „inclusiv• of GST“: Lesefehler im Wort (SROIE 003)
    // Kopf einer Steuer-Übersicht: Zeilen danach sind Steuertabelle, keine Summe (SROIE 031: „GST Summary … Total 70.75“)
    steuerTabelle: /\b(gst|tax|vat|mwst|iva|tva|sst|ust)\s*(summary|susmary|summ?ary|analysis|breakdown|code)\b|steuer\s*(ubersicht|aufstellung)|resumo (do )?iva|riepilogo iva|desglose iva/,
    zahlung: /\b(bar|gegeben|kartenzahlung|karte|ec|ec-cash|girocard|kreditkarte|visa|mastercard|maestro|amex|vpay|paypal|apple pay|google pay|cash|card|tendered|entregue|valor entregue|pago|pagamento|efectivo|tarjeta|especes|carte|cb|contanti|carta|bancomat|pin|contant|kaart|pinnen|multibanco|mb way|dinheiro|numerario|cartao|kontaktlos|contactless|bezahlt|paid)\b/,
    rueck: /\b(ruckgeld|wechselgeld|change|cambio|vuelto|rendu|resto|troco|wisselgeld)\b/,
    rabatt: /\b(rabatt|nachlass|coupon|gutschein|discount|desconto|descuento|sconto|remise|reduction|korting|preisvorteil|sofortrabatt|ersparnis|sie sparen|you save|reduziert|mhd|aktion|promo|promocao|oferta)\b/,
    // Rückgabe von Leergut: Gutschrift für früher gekaufte Flaschen, gehört keinem Artikel auf diesem Bon
    leergut: /\b(leergut|leergutbon|pfandbon|pfandruckgabe|pfand-?ruckgabe|pfandgutschrift|bottle return|statiegeld retour|retorno de vasilhame|devolucao de tara)\b/,
    // Storno: hebt einen Artikel weiter oben auf (beide Zeilen stehen auf dem Bon)
    storno: /\b(storno|storniert|stornierung|void|voided|anulad[oa]|anulacao|anulacion|annullat[oa]|annulation|annule|cancelled|canceled|cancelado|ruckbuchung|correcao)\b/,
    // Kaution: wird erstattet (Fahrrad, Schlüssel, Wohnung) – steht sie als Posten auf dem Bon, ist sie keine geteilte Ausgabe
    kaution: /\b(kaution|caucao|fianza|cauzione|security deposit|damage deposit|deposito de garantia|deposito caucao)\b/,
    // Nur blockiert/reserviert (Mietwagen, Hotel): wird nicht abgebucht, zählt nie
    vorab: /\b(vorautorisierung|vorautorisiert|pre-?auth\w*|pre-?autoriza\w*|blockiert|blockierung|reserviert|reservierung des betrags|hold|retencao|retid[oa]|cativo|cativa|bloqueado)\b/,
    // Anzahlung/Vorauszahlung: schon bezahlt, kein Artikel (Hotel, Mietwagen, Ferienwohnung)
    anzahlung: /\b(anzahlung|vorauszahlung|vorauskasse|bereits bezahlt|bereits gezahlt|advance payment|advance deposit|prepaid|pre-?payment|deposit paid|sinal|adiantamento|pagamento antecipado|acconto|anticipo|arrhes|acompte)\b/,
    ortstaxe: /\b(kurtaxe|ortstaxe|kurbeitrag|gastetaxe|city tax|tourist tax|tourism tax|taxa turistica|taxa municipal turistica|tassa di soggiorno|taxe de sejour|tasa turistica|toeristenbelasting)\b/,
    rundung: /\b(rundung|gerundet|rounding|arredondamento|redondeo|arrotondamento|arrondi|afronding|pyoristys|avrundning|oresavrundning)\b/,
    nein: /\b(uid|ust-?idnr|ust-?id|vat no|capital|social|registo|registro|contrib|contribuinte|conservatoria|matricula|e-?mail|iban|bic|swift|handelsregister|hrb|amtsgericht|geschaftsfuhrer|sede|datum|date|data|fecha|uhrzeit|hora|heure|ora|tisch|table|mesa|tavolo|kasse|kassierer|beleg|bon-?nr|receipt|recibo|ricevuta|tel|telefon|phone|fax|www|http|ust-?id|st\.?-?nr|steuer-?nr|steuernummer|nif|nipc|siret|cif|atcud|fatura|factura|rechnung|invoice|original|kopie|copy|operador|bediener|kellner|cashier|danke|thank|thanks|merci|grazie|gracias|obrigad[oa]|vielen|willkommen|welcome|gmbh|lda|srl|ltd|inc|ohg|tse|signatur|seriennummer|transaktion|terminal|trace|beleg-?nr|autorisierung|kartennummer)\b/,
    // Spaltenüberschrift über den Posten („Qt Descrição P.Unit. Tx Valor“, „Menge Artikel Preis Betrag“)
    kopf: /\b(qt|qtd|qty|qte|quant|amt|disc|quantidade|menge|anz|anzahl|descri[cç]?[aã]?o|descricao|descripcion|description|bezeichnung|artikel|artigo|article|articulo|produkt|produto|p\.?\s?unit|p\.?\s?u|preco|preis|price|prix|precio|prezzo|valor|betrag|amount|montant|importe|importo|tx|vat|mwst|einzel)\b/g,
    // Einzelpreis-Zeilen unter dem Posten („Preco: 12,90/Uni“, „à 2,50“, „je 1,99“, „@ 3.50“)
    einzel: /\b(pre[cç]o|preis|price|prix|precio|prezzo|prijs|je|a|à|@|ea|each|stuckpreis|einzelpreis|ep)\b\s*[:;.]?\s*$/,
  };
  const istKopfzeile = (t) => W.nein.test(ohneAkz(t || ''));
  // Summenwort mit einem Lesefehler („SLMMe“, „T0TAL“, „GESANT“): Abstand höchstens 1 zu summe/total/gesamt
  const abst1 = (a, b) => { if (Math.abs(a.length - b.length) > 1) return false; let i = 0, j = 0, f = 0; while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } if (++f > 1) return false; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } } return f + (a.length - i) + (b.length - j) <= 1; };
  const summeUnscharf = (n) => { const w = (n.replace(/0/g, 'o').match(/[a-z]{4,}/g) || []); return w.length > 0 && w.length <= 3 && w.some((x) => ['summe', 'total', 'gesamt', 'totale', 'totaal', 'gesamtsumme'].some((k) => abst1(x, k))) && !W.steuer.test(n) && !W.zahlung.test(n); };
  // Einheiten/Mengen, die keine Namen sind
  const MENGE_VORN = /^\s*(\d{1,3}(?:[.,]\d{1,3})?)\s*(?:x|×|\*|stk\.?|st\.?|pcs\.?|pc\.?|un\.?|uni|und\.?|pz\.?|kg|l)?\s*[x×*]?\s+/i;
  function dezimal(zeilen) {
    let k = 0, p = 0;
    for (const z of zeilen) { k += (z.text.match(/\d,\d{2}(?!\d)/g) || []).length; p += (z.text.match(/\d\.\d{2}(?!\d)/g) || []).length; }
    return p > k ? '.' : ',';
  }
  // Beträge einer Zeile mit Stelle im Text; „1,00-“ und „-1,00“ sind negativ; „19,00 %“ ist ein Steuersatz, kein Betrag
  // Der Dezimaltrenner ist immer der letzte Trenner vor genau zwei Ziffern; die Erkennung liest ein Komma auch mal als Punkt
  // („34.90“ auf einem Bon mit Kommas). Tausender-Gruppen nur mit dem jeweils anderen Zeichen (oder ' bzw. Leerzeichen).
  function betraege(t, dez) {
    const re = /(^|[^\d.,])(-\s?)?((?:\d{1,3}(?:[.,' ]\d{3})+|\d+)[.,] ?\d{2})(?!\d|[.,]\d)(\s?-(?![\d]))?/g;
    const out = []; let m;
    while ((m = re.exec(t))) {
      const start = m.index + m[1].length + (m[2] ? m[2].length : 0), ende = start + m[3].length;
      if (/^\s*%/.test(t.slice(ende))) continue;
      const roh = m[3].replace(/([.,]) (\d{2})$/, '$1$2'), d = roh.length - 3, ganz = roh.slice(0, d).replace(/[.,' ]/g, '');
      if (/[.,]/.test(roh.slice(0, d)) && roh.slice(0, d).replace(/\d/g, '').split('').some((c) => c === roh[d])) continue; // 1.234.56: unklar
      const v = Math.round(parseFloat(`${ganz}.${roh.slice(d + 1)}`) * 100);
      out.push({ v: m[2] || m[4] ? -v : v, start, ende, neg: !!(m[2] || m[4]) });
    }
    return out;
  }
  // Andere Lesungen eines Betrags aus den zweitbesten Ziffern (nur unsichere Ziffern, höchstens eine Änderung je Lesung)
  function alternativen(z, b, dez) {
    const out = [];
    if (!z.zeichen) return out;
    for (let i = b.start; i < b.ende; i++) {
      const q = z.zeichen[i]; if (!q || !/\d/.test(q.z) || q.p > 0.97 || !q.alt || !/\d/.test(q.alt) || q.p2 < 0.01) continue;
      const t = z.text.slice(b.start, i) + q.alt + z.text.slice(i + 1, b.ende);
      const v = Math.round(parseFloat(`${t.slice(0, t.length - 3).replace(/[.,' ]/g, '')}.${t.slice(-2)}`) * 100);
      if (Number.isFinite(v)) out.push({ v: b.neg ? -v : v, k: 1 + Math.max(0, Math.log10(q.p / Math.max(q.p2, 1e-4))) / 2, warum: 'Ziffer unsicher' });
    }
    return out;
  }
  const buchst = (t) => (ohneAkz(t).replace(/\b(x|kg|eur|euro|usd|chf|gbp|un|uni|stk|st|pcs|l|cl|ml|g)\b/g, '').match(/[a-z]/g) || []).length;
  function nameAus(t) {
    return t.replace(MENGE_VORN, '').replace(/^\s*(uni|un|jni|unl|und|unid|uds?|stk|pcs|pc)\b\.?\s*/i, '').replace(/\b\d{1,2}\s*%/g, '').replace(/[€$£¥₩₹]|(?<![\p{L}])(euro|eur|usd|chf|gbp|jpy|fr\.|kr|zł|kč|rm|myr|sgd|thb|idr|php|vnd|aud|nzd|cad|hkd|cny|rmb|krw|inr|try|pln|czk|huf|sek|nok|dkk|brl|mxn|zar|aed)(?![\p{L}])/giu, '') // Währung nur als eigenes Wort (sonst wurde KRAEUTERQUARK zu AEUTERQUARK, FEUERZEUG zu FEZEUG)
      .replace(/\s+\d+[.,]\d[a-z]?\s*$/i, '').replace(/\s+\d{3,5}\s?[A-D]\s*\*?\s*$/, '').replace(/\s+\d{1,3}\s\d{2}\s*[A-D]?\s*\*?\s*$/, '').replace(/\s+[A-Z0-9*]{1,2}\s*$/, '').replace(/^[^\wÀ-ÿ]+|[^\wÀ-ÿ.)]+$/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
  }

  // Stimmen aus mehreren Lesungen desselben Betrags (z.mehr, aus erkenne): Anteil der Stimmen → Kosten im Abgleich
  function stimmen(erst, mehr, dez) {
    const zaehl = new Map(); const add = (v, c) => zaehl.set(v, (zaehl.get(v) || 0) + Math.max(0.2, c / 100));
    if (erst != null) add(erst, 90);
    // Nachlesungen sind kurze Ausschnitte der Betragsspalte: auch „1.79“ bei Komma-Bons und „1 79“/„179“ (Komma nicht gelesen) zählen
    const anders = dez === ',' ? '.' : ',';
    for (const m of mehr || []) {
      let b = betraege(m.t, dez).pop() || betraege(m.t, anders).pop();
      if (!b) { const x = /^\s*(-?\d{1,3})\s?(\d{2})\s*[A-D*]?\s*\*?\s*$/.exec(m.t); if (x) b = { v: Math.round(+x[1] * 100 + Math.sign(+x[1] || 1) * +x[2]) }; }
      if (b) add(b.v, m.c * (betraege(m.t, dez).length ? 1 : 0.7));
    }
    const ges = [...zaehl.values()].reduce((a, x) => a + x, 0) || 1;
    return [...zaehl].sort((a, b) => b[1] - a[1]).map(([v, x]) => ({ v, k: +(0.7 * (1 - x / ges)).toFixed(3), anteil: x / ges, warum: v === erst ? undefined : 'nachgelesen' }));
  }
  // ---------- Zusatzzeilen: Pfand, Rabatt gehören zu einem Artikel – darüber oder darunter ----------
  const PFAND = /^\W*(pfand|einweg|mehrweg|einwegpfand|mehrwegpfand|flaschenpfand|dosenpfand|deposit|bottle deposit|crv|depot|statiegeld|pant|vasilhame|tara|dpg)(?![a-z])/;
  const GETRAENK = /\b(cola|coke|pepsi|fanta|sprite|limo\w*|lemon\w*|koffein|energy|red ?bull|monster|iso\w*|saft|nektar|juice|smoothie|wasser|water|sprudel|mineral\w*|bier|beer|pils\w*|radler|weizen|helles|lager|wein|wine|sekt|prosecco|tee|tea|eistee|mate|schorle|spezi|drink|getranke?|sumo|agua|cerveja|vinho|refrigerante)\b|\b\d[.,]?\d{0,2}\s?(l|ltr|ml|cl)\b|\b(pet|dose|flasche|fl\.|can|btl)\b/;
  const BON_RABATT = /\b(coupon|gutschein|bon-?rabatt|einkauf|gesamteinkauf|mitarbeiter|treue|payback|lidl plus|app-?rabatt|bonus|punkte|club|member|mitglied|warenkorb|einkaufswert)\b/;
  function getraenk(t) {
    const n = ohneAkz(t || '');
    if (GETRAENK.test(n)) return 1;
    // Obst zählt nicht als „kein Getränk“: Saft- und Limonadennamen heißen oft nach Früchten („TG Orange Mango“)
    if (typeof window !== 'undefined' && window.Speisen) { const r = window.Speisen.erkenne(t || ''); if (r) return /☕|🫖|🥛|💧|🥤|🧃|🍺|🍻|🍷|🥂|🍸|🍹|🥃|🧉/u.test(r.s) ? 1 : /🍎|🍏|🍊|🍋|🍓|🫐|🍇|🍑|🥭|🍍|🍒|🍌|🥥|🍉|🍐|🥝/u.test(r.s) ? 0 : -1; }
    return 0;
  }
  // Storno: „Artikel 1,29“ … „Storno 1,29-“ heben sich auf; beide verschwinden aus den Posten (Zeilen bleiben im Bild markiert)
  function stornoPaare(posten, info) {
    for (let k = posten.length - 1; k >= 0; k--) {
      const s = posten[k]; if (s.art2 !== 'storno' || s.weg) continue;
      let best = -1, bs = -1;
      for (let j = k - 1; j >= 0; j--) { const q = posten[j]; if (q.art2 || q.storniert || q.b !== -s.b) continue; const sim = woerterGleich(q.t, s.t); if (sim > bs) { bs = sim; best = j; } }
      if (best < 0) continue;
      const q = posten[best]; q.storniert = s.storniert = true; info[q.zeile].typ = info[s.zeile].typ = 'storno';
    }
    for (let k = posten.length - 1; k >= 0; k--) if (posten[k].storniert) posten.splice(k, 1);
  }
  const woerterGleich = (a, b) => { const A = new Set(ohneAkz(a || '').split(/\W+/).filter((x) => x.length > 2)), B = ohneAkz(b || '').split(/\W+/).filter((x) => x.length > 2); return B.filter((x) => A.has(x)).length; };
  // Abwägung je Zusatzzeile (Pfand > 0, Rabatt < 0) zwischen dem Artikel darüber und darunter (höchstens 2 Zeilen entfernt):
  // Lage (Pfand/Rabatt stehen meist unter dem Artikel), gleicher Steuerbuchstabe (Pfand hat den Steuersatz des Getränks),
  // Getränk (nur Getränke haben Pfand), Name im Rabatt-Text, Rabatt nie größer als der Artikel, Menge, schon belegt.
  // Unter einer Schwelle bleibt die Zeile ein eigener Posten; die App bietet die Kandidaten zum Zuordnen an.
  function zusaetzeZuordnen(posten, info) {
    const istPfand = (p) => p.b > 0 && p.b <= 1500 && PFAND.test(ohneAkz(p.t || '')) && !p.art2;
    const istRabatt = (p) => p.b < 0 && (!p.art2 || p.art2 === 'rabatt') && !BON_RABATT.test(ohneAkz(info[p.zeile].z.text));
    const artikel = (p) => p && !p.zuschlag && !p.art2 && !istPfand(p) && p.b > 0;
    const istExtra = (p) => p.b > 0 && !p.art2 && /^\s*(\+|extra\b|zusatz\b|mit\b|add\b|com\b|con\b|avec\b|plus\b|suppl\w*)/i.test(info[p.zeile].z.text);
    const zus = posten.filter((p) => istPfand(p) || istRabatt(p) || istExtra(p));
    for (const z of zus) {
      const k = posten.indexOf(z), art = istPfand(z) ? 'pfand' : istRabatt(z) ? 'rabatt' : 'extra';
      const letzteZeile = (p) => Math.max(p.zeile, ...info.filter((r) => r.typ === 'teil' && r.zu === posten.indexOf(p)).map((r) => r.i));
      const oben = [...posten.slice(0, k)].reverse().find((p) => artikel(p)), unten = posten.slice(k + 1).find((p) => artikel(p));
      const kand = [];
      if (oben && z.zeile - letzteZeile(oben) <= 2) kand.push({ p: oben, lage: 'oben', ab: z.zeile - letzteZeile(oben) });
      if (unten && unten.zeile - z.zeile <= 2 && art !== 'extra') kand.push({ p: unten, lage: 'unten', ab: unten.zeile - z.zeile });
      for (const c of kand) {
        let s = c.lage === 'oben' ? 1 : 0.3;
        s += c.ab === 1 ? 0.4 : -0.2;
        if (z.stb && c.p.stb) s += z.stb === c.p.stb ? 1.5 : -2;
        if (art === 'pfand') {
          const g = getraenk(c.p.t); s += g > 0 ? 1.2 : g < 0 ? -1 : 0;
          if ((c.p.zusaetze || []).some((x) => x.art === 'pfand') && !(c.p.menge > 1)) s -= 0.8;
          const n = z.menge > 1 ? z.menge : Math.round(z.b / 25) === z.b / 25 && z.b / 25 > 1 && z.b / 25 <= 24 ? z.b / 25 : 1;
          if (n > 1 && c.p.menge === n) s += 0.8;
        } else if (art === 'extra') {
          s += 1;
        } else {
          s += woerterGleich(c.p.t, info[z.zeile].z.text) ? 2 : 0;
          s += Math.abs(z.b) < c.p.b ? 0.5 : -3;
          // „RBW -10%  -0,34“ unter „VEGANE SCHNITZEL 3,39“: 10 % von 3,39 = 0,34 → gehört sicher dazu
          const pc = /(\d{1,2}(?:[.,]\d)?)\s*%/.exec(info[z.zeile].z.text);
          if (pc) { const soll = Math.round((c.p.b * parseFloat(pc[1].replace(',', '.'))) / 100); s += Math.abs(soll - Math.abs(z.b)) <= 1 ? 2.5 : -0.5; }
        }
        c.s = +s.toFixed(2);
      }
      kand.sort((a, b) => b.s - a.s);
      const wahl = kand[0] && kand[0].s >= 0.8 ? kand[0] : null;
      const alt = kand.filter((c) => c !== wahl).map((c) => ({ zeile: c.p.zeile, s: c.s }));
      if (!wahl) { z.zuKand = kand.map((c) => ({ zeile: c.p.zeile, s: c.s })); z.zusArt = art; continue; }
      const q = wahl.p;
      q.zusaetze = q.zusaetze || [];
      q.zusaetze.push({ art, b: z.b, zeile: z.zeile, t: art === 'pfand' ? 'Pfand' : art === 'extra' ? z.t.replace(/^\W+/, '') : (z.nameUnsicher ? 'Rabatt' : z.t), alt, s: wahl.s, sicher: !alt.length || wahl.s - alt[0].s >= 1.5, rahmen: z.rahmen });
      q.b += z.b; if (q.einzel) q.einzel = null; // Stückpreis gilt nicht mehr für den Betrag inkl. Pfand/Rabatt
      q.sicherheit = Math.min(q.sicherheit ?? 100, z.sicherheit ?? 100);
      q.rahmen = q.rahmen && z.rahmen ? { x0: Math.min(q.rahmen.x0, z.rahmen.x0), y0: Math.min(q.rahmen.y0, z.rahmen.y0), x1: Math.max(q.rahmen.x1, z.rahmen.x1), y1: Math.max(q.rahmen.y1, z.rahmen.y1) } : q.rahmen;
      q.vorschlag = []; info[z.zeile].typ = art; z.weg2 = true;
    }
    for (let k = posten.length - 1; k >= 0; k--) if (posten[k].weg2) posten.splice(k, 1);
    posten.forEach((p, i) => { info[p.zeile].zu = i; for (const x of p.zusaetze || []) info[x.zeile].zu = i; });
  }
  function liesAllgemein(zeilen, qr, art) {
    const dez = dezimal(zeilen);
    const info = zeilen.map((z, i) => {
      const n = ohneAkz(z.text), bt = betraege(z.text, dez);
      // Zeile ohne gelesenen Betrag, aber Betrag beim Nachlesen gefunden: am Zeilenende anhängen
      if (!bt.length && z.mehr && z.mehr.length) { const st = stimmen(null, z.mehr, dez); if (st.length && st[0].anteil >= 0.4) bt.push({ v: st[0].v, start: z.text.length, ende: z.text.length, neg: st[0].v < 0, nach: true }); }
      let mengeVorn = null;
      if (bt.length >= 2 && /^\W*$/.test(z.text.slice(0, bt[0].start)) && /^\s*[A-Za-zÀ-ÿ]/.test(z.text.slice(bt[0].ende)) && bt[0].v > 0 && bt[0].v <= 9900) { mengeVorn = bt[0].v / 100; bt.shift(); }
      const letzter = bt.length ? bt[bt.length - 1] : null;
      let art = 'sonst';
      if ((!bt.length && ((n.match(W.kopf) || []).length >= 2 || /^\W*(eur|euro|€|usd|chf|gbp)\W*$/.test(n))) || (n.match(W.kopf) || []).length >= 3) art = 'kopf';
      else if (W.anzahl.test(n)) art = 'nein';
      else if (W.zwischen.test(n)) art = 'zwischen';
      else if ((W.summe.test(n) && !W.steuer.test(n.replace(new RegExp(W.inklSteuer.source, 'g'), ' ').replace(W.summe, '').replace(/\bbrutto\b/, ''))) || (W.inklSteuer.test(n) && /\b(total|sales|amount|betrag|summe)\b/.test(n)) || (bt.length && summeUnscharf(n))) art = 'summe'; // „Gesamt Brutto“ ist die Summe; „SLMMe“ = SUMME
      else if (W.rueck.test(n)) art = 'rueck';
      else if (W.vorab.test(n)) art = 'vorab';
      else if (W.anzahlung.test(n)) art = 'anzahlung';
      else if (W.zahlung.test(n) && !/\d\s*[x×*]\s*\d/.test(n)) art = 'zahlung';
      else if (W.rundung.test(n)) art = 'rundung';
      else if (W.leergut.test(n)) art = 'leergut';
      else if (W.storno.test(n)) art = 'storno';
      else if (W.kaution.test(n)) art = 'kaution';
      else if (W.ortstaxe.test(n)) art = 'sonst'; // Kurtaxe/City Tax ist ein Posten (je Person und Nacht), keine Mehrwertsteuer
      else if (W.service.test(n)) art = 'service';
      else if (W.steuer.test(n) || /^\W*\d{1,2}([.,]\d+)?\s*%/.test(n)) art = 'steuer';
      else if (W.rabatt.test(n)) art = 'rabatt';
      else if (W.nein.test(n)) art = 'nein';
      // Artikelname mit Steuerwort aus der Spaltenüberschrift („REPAIR ENGINE POWER SPRAYER (1UNIT) Tax“, SROIE 006): ohne Betrag
      // und mit mindestens zwei weiteren Wörtern ist es keine Steuerzeile (beendete sonst den Postenblock)
      if (art === 'steuer' && !bt.length && (n.replace(new RegExp(W.steuer.source, 'g'), ' ').replace(W.kopf, ' ').match(/[a-z]{3,}/g) || []).length >= 2 && !W.steuerTabelle.test(n)) art = 'sonst';
      // Menge × Einzelpreis in der Zeile: „2 x 4,90“, „3 X 0,79 2,37“, „0,512 kg x 2,99 €/kg“; „0, 65“ (Lücke nach dem Komma) zählt mit
      let menge = null, einzel = null;
      const mx = new RegExp(`(\\d{1,3}(?:[.,]\\d{1,3})?)\\s*(?:stk\\.?|st\\.?|kg|pcs|un\\.?|uni|l|ltr|lt|liter|litros|lts|gal|n[aä]chte?|noites|nights|n\\.|tage|dias|days|pers\\.?|personen|pax)?\\s*[x×*]\\s*(\\d+\\${dez} ?\\d{2,3})(?!\\d)`, 'i').exec(z.text);
      const mx2 = !mx && new RegExp(`(\\d+\\${dez} ?\\d{2,3})\\s*(?:€|eur)?\\s*[x×*]\\s*(\\d{1,3})(?![.,]\\d)\\b`, 'i').exec(z.text); // „1,29 x 2“
      if (mx) { menge = parseFloat(mx[1].replace(',', '.')); einzel = parseFloat(mx[2].replace(' ', '').replace(dez, '.')) * 100; if (Math.abs(einzel - Math.round(einzel)) < 1e-6) einzel = Math.round(einzel); }
      else if (mx2) { menge = +mx2[2]; einzel = Math.round(parseFloat(mx2[1].replace(' ', '').replace(dez, '.')) * 100); }
      else if (mengeVorn) { menge = mengeVorn; if (bt.length >= 2) einzel = bt[bt.length - 2].v; }
      else if (bt.length >= 2 && letzter.v > 0) {
        // Einzelpreis … Menge … Betrag in einer Zeile (Kassen mit Spalten „Preis Anz. MwSt Betrag“)
        const e0 = bt[bt.length - 2], zw = z.text.slice(e0.ende, letzter.start), mm = zw.match(/(?:^|\s)(\d{1,3})(?=\s|$)/g) || [];
        for (const t of mm) { const n = +t.trim(); if (n >= 1 && Math.abs(e0.v * n - letzter.v) <= 1) { menge = n; einzel = e0.v; break; } }
      }
      else { const mv = /^\s*(\d{1,2})\s*(?:x|×|stk\.?|st\.?|pcs\.?|un\.?|uni|und\.?|pz\.?)?\s+[A-Za-zÀ-ÿ]/i.exec(z.text); if (mv && +mv[1] > 0) menge = +mv[1]; }
      const mxi = mx ? mx.index : mx2 ? mx2.index : Infinity;
      let name = letzter ? nameAus(z.text.slice(0, Math.min(mxi, bt[0].start))) : nameAus(z.text);
      // Betrag erst beim Nachlesen gefunden: übrig gebliebene Bruchstücke („70“, „B“) gehören nicht zum Namen
      if (letzter && letzter.nach) name = name.replace(/(\s+(\d{1,3}|[A-D]))+\s*$/, '');
      const satz = (/\b(\d{1,2})\s*%/.exec(z.text) || [])[1];
      let stb = letzter && !letzter.nach ? (/^\s*([A-D1-4])(?![A-Za-z0-9])/.exec(z.text.slice(letzter.ende)) || [])[1] || null : null;
      // Betrag erst beim Nachlesen gefunden: Steuerbuchstabe aus den Nachlesungen („1,39 A“)
      if (letzter && letzter.nach && z.mehr) { const zz = new Map(); for (const m of z.mehr) { const x = /\d[.,]\s?\d{2}\s*([A-D])(?![A-Za-z0-9])/.exec(m.t); if (x) zz.set(x[1], (zz.get(x[1]) || 0) + 1); } const top = [...zz].sort((p2, q2) => q2[1] - p2[1])[0]; if (top && top[1] >= 2) stb = top[0]; }
      return { i, z, n, bt, letzter, art, menge, einzel, name, stb, bu: buchst(name), satz: satz != null ? +satz : null, nurEinzel: W.einzel.test(ohneAkz(z.text.slice(0, bt.length ? bt[0].start : z.text.length))) };
    });
    // Steuertabelle nach einer Summe: deren „Total“-Zeilen sind Steuersummen, nicht die Gesamtsumme
    { const s0 = info.findIndex((r) => r.art === 'summe' || /\b(total|summe|gesamt)/.test(r.n)); if (s0 >= 0) { const t0 = info.findIndex((r, i) => i > s0 && W.steuerTabelle.test(r.n)); if (t0 > 0) for (let i = t0; i < info.length; i++) if (info[i].art === 'summe') info[i].art = 'steuer'; } }
    // Ende des Postenteils: erste Summenzeile mit Betrag (danach kommen Zahlung, Steuer, Fußtext)
    // (steht der Betrag der Summenzeile durch Schräglage eine Zeile tiefer, gilt die Zeile ohne Betrag als Ende)
    let ende = info.findIndex((r, i) => r.art === 'summe' && (r.letzter || (info[i + 1] && info[i + 1].letzter && info[i + 1].bu < 3)));
    if (ende < 0) ende = info.length;
    // Kein Summenwort gefunden (fremde Sprache/Schrift, Wort unlesbar): die erste Zeile, deren Betrag genau die Summe aller
    // Beträge darüber ist, ist die Summe (mindestens zwei Posten davor). Rein rechnerisch, unabhängig von der Sprache.
    if (ende === info.length && !(qr && qr.total)) {
      let summe = 0, n = 0;
      for (let i = 0; i < info.length; i++) {
        const r = info[i]; if (!r.letzter || ['kopf', 'nein', 'steuer', 'zahlung', 'rueck'].includes(r.art)) continue;
        if (n >= 2 && r.letzter.v === summe && summe > 0) { r.art = 'summe'; r.summeOhneWort = true; ende = i; break; }
        summe += r.letzter.v; n++;
      }
    }
    const kopfZ = info.findIndex((r, i) => i < ende && r.art === 'kopf');
    // Postenblock endet auch an der Steuertabelle („TAXA IVA INCID.“, „MwSt Netto Brutto“) – deren Beträge sind nie Posten.
    // Steuer/Service vor der Summe zählen nur, wenn es eine Zwischensumme gibt (USA); in Europa ist die Steuer enthalten.
    const mitZwischen = info.some((r, i) => i < ende && r.art === 'zwischen');
    { let gesehen = false; for (let i = kopfZ + 1; i < ende; i++) { const r = info[i]; if (r.letzter && r.art === 'sonst') gesehen = true; if (gesehen && ((r.art === 'steuer' && (!r.letzter || !mitZwischen)) || r.art === 'zwischen' && !mitZwischen)) { ende = i; break; } } }
    const posten = [], zuschlaege = [];
    // Einrückung: Zeilen deutlich rechts vom üblichen Zeilenanfang (Menü-Bestandteile, Extras) gehören zum Posten darüber
    const anfaenge = info.filter((r, i) => i > kopfZ && i < ende && r.letzter && r.z.b).map((r) => r.z.b.x0).sort((a, b) => a - b);
    const hBlock = info.filter((r) => r.z.b).map((r) => r.z.b.y1 - r.z.b.y0).sort((a, b) => a - b)[0] || 20;
    const einrueck = anfaenge.length >= 3 ? anfaenge[anfaenge.length >> 1] + 1.2 * hBlock : null;
    const letzteBelegt = (p) => Math.max(p.zeile, ...info.filter((r) => r.typ === 'teil' && r.zu === posten.indexOf(p)).map((r) => r.i));
    for (let i = kopfZ + 1; i < ende; i++) {
      const r = info[i];
      if (!r.letzter || r.art === 'nein' || r.art === 'zwischen' || r.art === 'vorab' || r.art === 'anzahlung' || (r.art === 'steuer' && !mitZwischen)) {
        // Zeile im Postenblock mit Namen, aber ohne Betrag: vermutlich ein Posten, dessen Betrag nicht gelesen wurde
        const vor = posten[posten.length - 1];
        if (!r.letzter && r.art === 'sonst' && vor && i - letzteBelegt(vor) <= 3 && (/^\s*[-+*•>·]/.test(r.z.text) || (einrueck && r.z.b.x0 > einrueck))) { r.typ = 'teil'; r.zu = posten.length - 1; r.bestandteil = true; continue; }
        if (!r.letzter && r.art === 'sonst' && r.bu >= 3 && !r.nurEinzel && !/pre[cç]o|preis|price|prix|precio/i.test(r.n) && (posten.length || kopfZ >= 0)) r.typ = 'unklar';
        continue;
      }
      if ((r.art === 'steuer' && mitZwischen) || r.art === 'service' || r.art === 'rundung') { zuschlaege.push({ t: r.art === 'service' ? (r.name || 'Service') : r.art === 'rundung' ? 'Rundung' : (r.name || 'Steuer'), art: r.art, zeile: i, kand: [{ v: r.letzter.v, k: 0 }, ...alternativen(r.z, r.letzter, dez)] }); continue; }
      // Einzelpreis- oder Mengenzeile ohne Namen („2 Stk x 1,29“, „à 1,29“): gehört zum Posten darüber oder darunter.
      // Entschieden wird nach der Rechnung (Menge × Preis = Betrag des Postens), sonst gilt der Posten darüber.
      const vorher = posten[posten.length - 1];
      const mengenZeile = r.nurEinzel || (r.bu < 2 && r.einzel && r.bt.length === 1);
      if (mengenZeile) {
        const e0 = r.nurEinzel ? r.letzter.v : r.einzel, gesamt = r.menge && e0 ? Math.round(r.menge * e0) : null;
        const oben = vorher && vorher.zeile === i - 1 ? vorher : null;
        const unten = info[i + 1] && info[i + 1].letzter && info[i + 1].bu >= 2 && !['nein', 'summe', 'zwischen', 'steuer'].includes(info[i + 1].art) ? info[i + 1] : null;
        const passt = (b) => gesamt != null && Math.abs(Math.abs(b) - gesamt) <= 1;
        if (unten && !(oben && passt(oben.b)) && (passt(unten.letzter.v) || !oben)) {
          // gehört zum Posten darunter (Menge steht über dem Artikel)
          r.typ = 'teil'; r.mengeFuer = { menge: r.menge, einzel: e0, zeile: i }; info[i + 1].mengeVon = r.mengeFuer; continue;
        }
      }
      if (vorher && vorher.zeile === i - 1 && mengenZeile) {
        const e = r.nurEinzel ? r.letzter.v : r.einzel; vorher.einzel = e;
        if (r.einzel && r.menge) vorher.menge = r.menge;
        // Betrag ist ein Vielfaches des Einzelpreises: Menge daraus (die Mengen-Spalte wird oft nicht gelesen)
        if (e && vorher.b % e === 0 && vorher.b / e >= 1 && vorher.b / e <= 50) { vorher.menge = vorher.b / e; vorher.mengeSicher = true; }
        else if (e) {
          const m = vorher.mengeGelesen || Math.max(1, Math.round(vorher.b / e));
          if (m * e !== vorher.b && m <= 50) vorher.kand.push({ v: Math.round(m * e), k: vorher.mengeGelesen ? 0.4 : 0.6, warum: 'Menge × Preis' });
        }
        r.typ = 'teil'; r.zu = posten.length - 1; continue;
      }
      let name = r.name, nameZeile = -1;
      // Name eine Zeile höher (Posten über zwei Zeilen: Name, darunter „2 x 4,90   9,80“)
      if (r.bu < 2) for (let k = i - 1; k >= Math.max(0, i - 2); k--) { const o = info[k]; if (o.letzter || o.art !== 'sonst' || (o.typ && o.typ !== 'unklar')) break; if (o.bu >= 3) { name = o.name; nameZeile = k; break; } }
      // Name eine Zeile tiefer (Kassen mit „Artikelnr. Menge Preis Betrag“ und darunter der Name, z. B. Malaysia)
      if (r.bu < 2 && nameZeile < 0) { const o = info[i + 1]; if (o && !o.letzter && o.art === 'sonst' && !o.typ && o.bu >= 3) { name = o.name.replace(/^[-–•*>\s]+/, ''); nameZeile = i + 1; } }
      let v = r.letzter.v;
      // mehrere Lesungen desselben Betrags: Mehrheit gewinnt, Abweichler bleiben als günstige Alternative
      const st = stimmen(r.letzter.nach ? null : v, r.z.mehr, dez);
      if (st.length && st[0].v !== v && st[0].anteil > 0.5) v = st[0].v;
      if (r.art === 'rabatt' && v > 0) v = -v;
      const kand = [{ v, k: 0 }];
      for (const a of [...st, ...alternativen(r.z, r.letzter, dez)]) { const w = r.art === 'rabatt' && a.v > 0 ? -a.v : a.v; if (!kand.some((x) => x.v === w)) kand.push({ v: w, k: Math.max(0.15, a.k), warum: a.warum || 'Ziffer unsicher' }); }
      if (r.art === 'storno' || r.art === 'leergut') v = -Math.abs(v);
      if (r.einzel && r.menge) { const mv = Math.round(r.menge * r.einzel); if (mv !== v && Math.abs(mv) < 1e6) kand.push({ v: mv, k: 0.6, warum: 'Menge × Preis' }); }
      if (r.mengeVon && !r.menge) { r.menge = r.mengeVon.menge; r.einzel = r.mengeVon.einzel; info[r.mengeVon.zeile].zu = posten.length; const mv = Math.round(r.menge * r.einzel); if (mv !== v && Math.abs(mv) < 1e6) kand.push({ v: mv, k: 0.6, warum: 'Menge × Preis' }); }
      if (nameZeile >= 0) { info[nameZeile].typ = 'teil'; info[nameZeile].zu = posten.length; }
      r.typ = 'posten'; r.zu = posten.length;
      const lesbar = buchst(name) >= 2;
      // Gastronomie: Zeilen ohne lesbaren Namen sind fast immer echte Posten (Tisch-Bons haben keine Gewichts-/Infozeilen);
      // Einkauf: namenlose Zeilen sind oft Gewicht/Pfand-Infos → leichter streichbar
      const gastro = art && ['restaurant', 'cafe', 'bar'].includes(art.id), einkauf = art && art.id === 'supermarkt';
      // Jede Zeile darf beim Abgleich wegfallen: ohne Namen billig, mit Namen teuer (die Summe muss dann trotzdem genau stimmen)
      // Posten mit lesbarem Namen nur im Ausnahmefall streichen (sonst „rechnet“ sich der Abgleich falsche Summen schön)
      // Zeilen mit lesbarem Namen und gelesenem Betrag werden nie gestrichen (Kosten über dem Höchstwert): lieber zeigt die App
      // eine Differenz, als dass sie Artikel und Preise falsch zuordnet (Handy-Test 30.10.: „TG ORANGE MANGO“ gestrichen,
      // dafür 1,11 → 2,50 – Summe stimmte, Zuordnung nicht)
      kand.push({ v: 0, k: lesbar ? 99 : gastro ? 1.5 : einkauf ? 0.9 : 1.2, warum: 'weg' });
      const mengeOk = r.menge && r.menge >= 1 && Number.isInteger(r.menge);
      posten.push({ t: lesbar ? name : r.art === 'leergut' ? 'Leergut' : (v < 0 ? 'Rabatt' : 'Posten'), b: v, menge: mengeOk ? r.menge : 1, mengeGelesen: mengeOk && r.menge > 1 ? r.menge : 0, einzel: r.einzel, satz: r.satz, stb: r.stb, zeile: i, c: r.z.c, rahmen: r.z.b, nameZeile, nameUnsicher: !lesbar && r.art !== 'leergut', kand,
        art2: ['rabatt', 'leergut', 'storno', 'kaution'].includes(r.art) ? r.art : null, kaution: r.art === 'kaution' || undefined,
        lesungen: st.map((x) => ({ v: x.v, anteil: +x.anteil.toFixed(3) })), lesbarAmount: r.z.mehr ? r.z.mehr.length + 1 : 1 });
    }
    // Summen-Kandidaten: Summenzeile(n), Kartenzahlung, gegeben − Rückgeld, QR-Code
    const ziele = [];
    const ziel = (v, k, quelle, zeile = -1) => { if (qr && qr.total && quelle !== 'qr') return; if (v > 0 && !ziele.some((z) => z.v === v && z.k <= k)) ziele.push({ v, k, quelle, zeile }); };
    // Rechnungs-QR (Prüfsumme der Steuerbehörde) ist maßgeblich: dann zählt nur seine Summe, nichts anderes
    if (qr && qr.total) ziel(qr.total, 0, 'qr');
    let totalZeile = -1, totalGelesen = null, anzahlung = 0;
    for (let i = ende; i < info.length; i++) {
      const r = info[i];
      // nach der Summe: Trinkgeld und Rundung kommen anteilig dazu (wahlweise), Anzahlung ist schon bezahlt (Hinweis für „Wer zahlt“)
      if (r.letzter && (r.art === 'service' || r.art === 'rundung')) { zuschlaege.push({ t: r.art === 'rundung' ? 'Rundung' : (r.name || 'Trinkgeld'), art: r.art === 'rundung' ? 'rundung' : 'trinkgeld', zeile: i, kand: [{ v: r.letzter.v, k: 0 }] }); r.typ = 'zuschlag'; continue; }
      if (r.letzter && r.art === 'anzahlung') { anzahlung += Math.abs(r.letzter.v); r.typ = 'anzahlung'; continue; }
      // Summenzeile ohne Betrag: Betrag der nächsten Zeile ist ein Kandidat (etwas teurer)
      if (r.art === 'summe' && !r.letzter && info[i + 1] && info[i + 1].letzter) { const q = info[i + 1]; ziel(q.letzter.v, 0.3, 'summe', i + 1); if (totalZeile < 0) { totalZeile = i; totalGelesen = q.letzter.v; } r.typ = 'summe'; continue; }
      if (!r.letzter) continue;
      if (r.art === 'summe') { if (totalZeile < 0) { totalZeile = i; totalGelesen = r.letzter.v; } ziel(r.letzter.v, 0, 'summe', i); for (const a of [...stimmen(r.letzter.v, r.z.mehr, dez).slice(1), ...alternativen(r.z, r.letzter, dez)]) ziel(a.v, Math.max(0.2, a.k), 'summe', i); r.typ = 'summe'; }
    }
    // Ohne Summenwort (weltweit: 合計, Σ, unbekannte Sprache, Summenwort unlesbar): Beträge nach dem Postenblock, die mindestens
    // so groß sind wie jeder Posten, sind Kandidaten – ein Betrag, der zweimal vorkommt (Summe + Zahlung), günstiger.
    // Der Abgleich verlangt trotzdem, dass die Posten genau aufgehen; ohne das gibt es kein „geprüft“.
    if (!ziele.some((z) => z.quelle === 'summe' || z.quelle === 'qr')) {
      const tab = info.findIndex((r, i) => i >= ende && W.steuerTabelle.test(r.n)), bis = tab >= 0 ? tab : info.length;
      const maxP = posten.reduce((a, p) => Math.max(a, Math.abs(p.b)), 0), nach = info.map((r, i) => ({ r, i })).filter(({ r, i }) => i >= ende && i < bis && r.letzter && r.letzter.v > 0 && r.letzter.v >= maxP && !['steuer', 'rueck', 'nein', 'rabatt'].includes(r.art));
      const anz = new Map(); for (const { r } of nach) anz.set(r.letzter.v, (anz.get(r.letzter.v) || 0) + 1);
      // ein einzelner Posten gleich einem einzelnen Betrag beweist nichts: dann nur wiederholte Beträge
      for (const { r, i } of nach) { const w = anz.get(r.letzter.v) >= 2; if (w || posten.length >= 2) ziel(r.letzter.v, w ? 0.5 : 1.0, w ? 'wiederholt' : 'betrag', i); }
    }
    // mehrere Summenzeilen: die größte ist die Gesamtsumme, kleinere (Teil-/Nettosummen) kosten mehr
    { const sz = ziele.filter((z) => z.quelle === 'summe'), max = sz.length ? Math.max(...sz.map((z) => z.v)) : 0; for (const z of sz) if (z.v < max) z.k += 0.8; }
    const gegeben = info.filter((r, i) => i >= ende && r.art === 'zahlung' && r.letzter).map((r) => r.letzter.v);
    const rueck = info.filter((r, i) => i >= ende && r.art === 'rueck' && r.letzter).map((r) => Math.abs(r.letzter.v));
    for (const g of gegeben) { ziel(g, 0.4, 'zahlung', ende); for (const q of rueck) if (g - q > 0) ziel(g - q, 0.4, 'zahlung'); }
    // Beträge größer als jede gelesene Summe können keine Posten sein (z. B. Stammkapital im Kopf): Streichen fast kostenlos
    const maxZiel = ziele.length ? Math.max(...ziele.map((z) => z.v)) : Infinity;
    for (const p of posten) if (Math.abs(p.b) > maxZiel) { const w = p.kand.find((c) => c.warum === 'weg'); if (w) w.k = 0.1; }
    const loesung = posten.length ? abgleich(posten, zuschlaege, ziele) : null;
    let total = null, gesamtOk = false;
    if (loesung) {
      posten.forEach((p, i) => { const c = p.kand[loesung.wahl[i]]; if (c.warum === 'weg') { p.weg = true; return; } if (c.v !== p.b) p.rep = c.warum || 'aus der Summe'; p.b = c.v; p.sicher = true; });
      for (let i = posten.length - 1; i >= 0; i--) if (posten[i].weg) { const z = info[posten[i].zeile]; z.typ = 'sonst'; posten.splice(i, 1); }
      posten.forEach((p, i) => { info[p.zeile].zu = i; if (p.nameZeile >= 0) info[p.nameZeile].zu = i; });
      loesung.zus.forEach((w, i) => { if (w >= 0) { const z = zuschlaege[i]; posten.push({ t: z.t, b: z.kand[w].v, menge: 1, zeile: z.zeile, c: 100, zuschlag: z.art, sicher: true, kand: [] }); info[z.zeile].typ = 'zuschlag'; } });
      total = loesung.ziel.v; gesamtOk = true;
      // Steuer/Rundung erst nach einer (Netto-)Summe: Malaysia „Total excl. GST“ → „GST 6 %“ → „Rounding“ → „Total incl. GST“,
      // ebenso USA ohne das Wort „Subtotal“. Ergibt die gefundene Summe plus solche Zeilen eine größere gelesene Summe, ist
      // die größere die Gesamtsumme und die Zeilen kommen anteilig dazu (Test 31.10., echte SROIE-Bons: 10 von 14 Fehlern).
      const extra = info.map((r2, i) => ({ r2, i })).filter(({ r2, i }) => i >= ende && r2.letzter && r2.r2 !== null && (r2.art === 'steuer' || r2.art === 'rundung' || r2.art === 'service') && Math.abs(r2.letzter.v) < total && (!r2.typ || (r2.typ === 'zuschlag' && !posten.some((p) => p.zuschlag && p.zeile === i)))).slice(0, 6);
      // Kandidaten: andere gelesene Summen/Beträge nach der gefundenen Summe (auch kleiner: Rundung −0,02 → „Total Rounded“)
      const zl0 = loesung.ziel.zeile, spaeter = info.map((r2, i) => ({ r2, i })).filter(({ r2, i }) => i > Math.max(zl0, ende - 1) && r2.letzter && r2.letzter.v > 0).map(({ r2 }) => r2.letzter.v);
      const andere = new Set([...ziele.filter((z) => z.v !== total && z.zeile > zl0 && z.quelle !== 'betrag').map((z) => z.v)]);
      // Rundung auf 5/10 Cent (Malaysia, Schweiz, Niederlande, Skandinavien …): nur, wenn eine Rundungszeile da ist
      const rundZeile = info.findIndex((r2, i) => i >= ende && (r2.art === 'rundung' || /\b(round|rundung|arrondi|afronding)/.test(r2.n)));
      let wahlE = null;
      for (let m = 0; m < 1 << extra.length; m++) {
        let sum = total; const teil = []; for (let k = 0; k < extra.length; k++) if (m & (1 << k)) { if (extra[k].r2.art === 'rundung' && extra[k].r2.letzter.v === 0) continue; sum += extra[k].r2.letzter.v; teil.push(extra[k]); }
        let ziel2 = andere.has(sum) && m ? sum : null, rund = 0;
        if (ziel2 == null && rundZeile >= 0) { const c = [...andere, ...spaeter].filter((x) => x % 5 === 0 && x !== sum && Math.abs(x - sum) <= 4).sort((a, b) => Math.abs(a - sum) - Math.abs(b - sum))[0]; if (c != null) { ziel2 = c; rund = c - sum; } }
        if (ziel2 == null) continue;
        const w = { sum: ziel2, teil, rund }, n = (x) => x.teil.length + (x.rund ? 1 : 0);
        if (!wahlE || w.sum > wahlE.sum || (w.sum === wahlE.sum && n(w) < n(wahlE))) wahlE = w;
      }
      if (wahlE) {
        for (const { r2, i } of wahlE.teil) { posten.push({ t: r2.art === 'rundung' ? 'Rundung' : r2.name || (r2.art === 'service' ? 'Service' : 'Steuer'), b: r2.letzter.v, menge: 1, zeile: i, c: 100, zuschlag: r2.art === 'rundung' ? 'rundung' : r2.art, sicher: true, kand: [] }); r2.typ = 'zuschlag'; }
        if (wahlE.rund) posten.push({ t: 'Rundung', b: wahlE.rund, menge: 1, zeile: rundZeile, c: 100, zuschlag: 'rundung', sicher: true, kand: [] });
        total = wahlE.sum;
      }
    } else {
      // Beste Summe ohne Abgleich: QR vor Summenzeile vor Zahlung; Posten bleiben unsicher
      total = qr && qr.total ? qr.total : totalGelesen != null ? totalGelesen : gegeben.length ? gegeben[0] - (rueck[0] || 0) : null;
      for (const p of posten) { p.sicher = false; if (p.kand.length > 2) p.vorschlag = p.kand.filter((c) => c.warum !== 'weg' && c.v !== p.b).slice(0, 3).map((c) => c.v); }
    }
    // Lesesicherheit je Posten: Anteil der Lesungen (gewichtet nach Konfidenz), die genau diesen Betrag ergaben.
    // Kein echtes Wahrscheinlichkeitsmaß, aber ehrlich: 100 % nur, wenn alle Lesungen übereinstimmen.
    for (const p of posten) {
      if (p.zuschlag) continue;
      // Vorzeichen zählt nicht: Nachlesungen von „-0,34“ verlieren oft das Minus
      const anteil = (p.lesungen || []).filter((x) => Math.abs(x.v) === Math.abs(p.b)).reduce((a, x) => a + x.anteil, 0);
      p.sicherheit = p.lesbarAmount > 1 ? Math.round(Math.min(1, anteil || 0.1) * 100) : Math.round(Math.min(95, (p.c || 80) * 0.95));
      p.vorschlag = [...new Set([...(p.lesungen || []).filter((x) => Math.abs(x.v) !== Math.abs(p.b)).map((x) => Math.abs(x.v)), ...p.kand.filter((c) => c.warum !== 'weg' && c.v > 0 && c.v !== Math.abs(p.b)).map((c) => c.v)])].slice(0, 4);
    }
    stornoPaare(posten, info);
    zusaetzeZuordnen(posten, info);
    // „3 x Espresso 7,50“ ohne gedruckten Einzelpreis: geht der Betrag glatt auf, je Stück teilbar machen
    for (const p of posten) if (!p.zuschlag && p.menge > 1 && !p.einzel && p.b > 0 && p.b % p.menge === 0) p.einzel = p.b / p.menge;
    const summe = posten.reduce((a, p) => a + p.b, 0);
    return { zeilen: info.map((r) => ({ text: r.z.text, b: r.z.b, c: r.z.c, typ: r.typ || (r.art === 'sonst' ? 'sonst' : r.art), zu: r.zu, block: r.i > kopfZ && r.i < ende })), posten, total, totalZeile, summe, dez, anzahlung: anzahlung || 0,
      pruefung: { gesamtOk: gesamtOk && summe === total, quelle: loesung ? loesung.ziel.quelle : null, korrigiert: posten.filter((p) => p.rep).length, ziele: ziele.length } };
  }
  // Kleinste Zahl an Änderungen, mit der die Posten (plus wahlweise Steuer/Service vor der Summe) eine der Summen ergeben.
  // Dynamische Programmierung über Cent-Summen; höchstens 3 Änderungen, sonst gilt der Bon als nicht abgeglichen.
  function abgleich(posten, zus, ziele) {
    if (!ziele.length) return null;
    const MAXK = 3, schichten = [];
    let dp = new Map([[0, { k: 0 }]]);
    const schritt = (optionen) => {
      const neu = new Map();
      for (const [s, e] of dp) for (const o of optionen) {
        const ns = s + o.v, nk = e.k + o.k; if (nk > MAXK) continue;
        const alt = neu.get(ns); if (!alt || nk < alt.k) neu.set(ns, { k: nk, vor: s, w: o.w });
      }
      // Speicher begrenzen: nur die günstigsten Summen behalten
      if (neu.size > 40000) { const sort = [...neu].sort((a, b) => a[1].k - b[1].k).slice(0, 40000); dp = new Map(sort); } else dp = neu;
      schichten.push(dp);
    };
    posten.forEach((p) => schritt(p.kand.map((c, w) => ({ v: c.v, k: c.k, w }))));
    // Steuer/Service: mitzählen (z. B. USA: Steuer kommt obendrauf) oder nicht (Europa: Steuer ist im Preis enthalten)
    zus.forEach((z) => schritt([{ v: 0, k: 0, w: -1 }, ...z.kand.map((c, w) => ({ v: c.v, k: c.k + 0.05, w }))]));
    let beste = null;
    for (const z of ziele) { const e = dp.get(z.v); if (e && (!beste || e.k + z.k < beste.k)) beste = { k: e.k + z.k, ziel: z }; }
    if (!beste) return null;
    // Rückwärts die Wahl je Zeile ablesen
    const wahl = [], zw = []; let s = beste.ziel.v;
    for (let i = schichten.length - 1; i >= 0; i--) { const e = schichten[i].get(s); if (i >= posten.length) zw.unshift(e.w); else wahl.unshift(e.w); s = e.vor; }
    return { wahl, zus: zw, ziel: beste.ziel, k: beste.k };
  }
  // ---------- Welche Art Bon? (Restaurant, Café, Bar, Supermarkt, Tankstelle, Apotheke, Fahrt, Unterkunft, Eintritt)
  // Stichwörter in vielen Sprachen plus Aufbau (Gewichtszeilen = Einkauf). Ergebnis steuert Regeln beim Lesen und Klassifizieren,
  // füllt „Wofür?“ vor (Geschäftsname aus dem Kopf) und wird in der App angezeigt.
  const ARTEN = [
    ['restaurant', 'Restaurant', /\b(mesa|tisch|table|tavolo|couvert|coperto|servico|servizio|bedienung|kellner|garcom|empregado|gorjeta|trinkgeld|gratuity|restaurante|restaurant|ristorante|trattoria|tasca|taberna|marisqueira|churrasqueira|pizzeria|brasserie|bistro|osteria|gasthaus|gaststatte)\b/g],
    ['cafe', 'Café', /\b(cafe|caffe|cafetaria|pastelaria|confeitaria|padaria|bakery|backerei|baeckerei|konditorei|patisserie|boulangerie|coffee|gelataria|eiscafe|pasticceria)\b/g],
    ['bar', 'Bar', /\b(bar|pub|cervejaria|kneipe|cocktail|lounge|taverna|biergarten)\b/g],
    ['supermarkt', 'Einkauf', /\b(supermercado|supermarket|supermarche|supermarkt|markt|mercado|rewe|edeka|lidl|aldi|pingo doce|continente|carrefour|minipreco|auchan|spar|netto|penny|kaufland|mercadona|coop|migros|tesco|sainsbury|intermarche|pfand|leergut|eur kg|kg x|stk|cartao continente|poupanca|artikel)\b/g],
    ['tanken', 'Tanken', /\b(diesel|gasoleo|gasolina|benzin|super e10|e10|sp95|sp98|litros|liter|ltr|zapfsaule|bomba|galp|repsol|shell|aral|esso|cepsa|adblue)\b/g],
    ['apotheke', 'Apotheke', /\b(farmacia|apotheke|pharmacy|pharmacie|parafarmacia|drogerie|dm-drogerie|rossmann)\b/g],
    ['fahrt', 'Fahrt', /\b(bilhete|fahrkarte|comboios|carris|metropolitano|uber|bolt|taxi|portagem|maut|estacionamento|parking|parkhaus)\b/g],
    ['unterkunft', 'Unterkunft', /\b(hotel|hostel|alojamento|pousada|check-?in|noites|nights|ubernachtung|city tax|taxa turistica|kurtaxe)\b/g],
    ['eintritt', 'Eintritt', /\b(museu|museum|museo|bilheteira|admission|eintritt|ingresso|monumento|palacio|castelo)\b/g],
  ];
  function bonArt(zeilen) {
    const kopf = zeilen.slice(0, Math.max(6, Math.ceil(zeilen.length * 0.35))).map((z) => ohneAkz(z.text)).join(' \n ');
    const alles = zeilen.map((z) => ohneAkz(z.text)).join(' \n ');
    const punkte = ARTEN.map(([id, name, re]) => {
      // Kopf (Geschäftsname, Adresse) zählt doppelt
      let p = (alles.match(re) || []).length + (kopf.match(re) || []).length;
      if (id === 'supermarkt') p += Math.min(4, (alles.match(/\d[.,]\d{2,3}\s*kg/g) || []).length);
      return { id, name, p };
    });
    // Speisen und Getränke unter den Zeilen sprechen für Gastronomie
    if (window.Speisen) { let essen = 0; for (const z of zeilen) { const k = window.Speisen.erkenne(z.text); if (k && !/Pfand|Service|Tanken|Fahrt|Eintritt/.test(k.n)) essen++; } punkte[0].p += essen * 0.3; punkte[1].p += essen * 0.3; }
    punkte.sort((a, b) => b.p - a.p);
    const beste = punkte[0];
    // Geschäftsname: erste Zeile im Kopf mit mehreren Buchstaben, die keine Adresse/Nummer ist
    const name = (zeilen.slice(0, 5).find((z) => buchst(z.text) >= 5 && !/\d{4}|tel|nif|www|@|rua |str\.|avenida|street/i.test(z.text)) || {}).text || '';
    return beste.p >= 2 ? { id: beste.id, name: beste.name, sicher: beste.p >= 4 && beste.p >= (punkte[1].p || 0) * 2, geschaeft: name.slice(0, 40) } : { id: 'unbekannt', name: '', sicher: false, geschaeft: name.slice(0, 40) };
  }
  function lies(zeilen, qr) {
    const art = bonArt(zeilen);
    const a = liesAllgemein(zeilen, qr, art); a.art = art;
    if (a.pruefung.gesamtOk) return a;
    // Portugiesische Bons mit Steuerklassen im QR-Code: eigener, an echten Bons geprüfter Weg (Version 3.6)
    let pt = null; try { pt = liesPT(zeilen, qr); } catch (e) { pt = null; }
    if (pt) {
      pt.art = art;
      // Block- und Zeilenarten vom allgemeinen Leser übernehmen (für Nachlesen und Anzeige)
      pt.zeilen = pt.zeilen.map((z, i) => ({ ...z, block: a.zeilen[i] ? a.zeilen[i].block : false, typ: z.typ === 'posten' ? 'posten' : a.zeilen[i] ? a.zeilen[i].typ : z.typ }));
      for (const p of pt.posten) if (p.sicherheit == null) p.sicherheit = p.rep || p.fehlt ? 30 : Math.round(Math.min(95, (p.c || 80) * 0.95));
    }
    if (pt && pt.pruefung && pt.pruefung.gesamtOk) return pt;
    return a.posten.length >= (pt ? pt.posten.length : 0) ? a : pt;
  }

  // ---------- Portugiesischer Bon (Zone Soft u. a.): „2 Uni PIZZA PEPPERONI 13% 25,80“, darunter „Preco: 12,90/Uni“.
  // Prüfen: Summe der Zeilen je Steuersatz gegen die Brutto-Beträge im QR-Code (oder die TAXA-Tabelle des Bons), Gesamtsumme gegen QR.
  const SAETZE = [0, 4, 5, 6, 8, 9, 12, 13, 16, 22, 23];
  // Das Prozentzeichen und die Ziffern davor werden oft falsch gelesen („193%“, „93%“, „3%“). Kandidaten: genauer Satz, sonst
  // alle Sätze der Steuerklassen des Bons (QR) bzw. 6/13/23, die höchstens einen Buchstaben/Ziffer abweichen.
  function abstand(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
  function satzKand(ziffern, moegliche) {
    if (SAETZE.includes(+ziffern) && ziffern.length <= 2) return [+ziffern];
    return moegliche.filter((x) => abstand(String(x), ziffern) <= 1);
  }
  function liesPT(zeilen, qr) {
    const posten = [];
    let tabelle = [];
    const moegl = qr && qr.klassen && qr.klassen.filter((k) => k.brutto > 0).length ? qr.klassen.filter((k) => k.brutto > 0).map((k) => k.satz) : [6, 13, 23];
    zeilen.forEach((z, i) => {
      const t = zahl(z.text);
      const kopf = /(?:^|[^A-Za-zÀ-ÿ])(Uni|Un|Kg|Lt)(?=[^a-z]|[a-z]?[A-Z])[\s'’|:.,;_-]*/i;
      let m = new RegExp(kopf.source + "(.+?)\\s+(\\d{1,3})\\s*[%gx]\\s*(.*)$", 'i').exec(t);
      // das %-Zeichen wird oft als 4, 8 oder gar nicht gelesen („134“, „23 3,50“): dann nur die bekannten Sätze zulassen
      if (!m) m = new RegExp(kopf.source + "(.+?)\\s+(0|4|5|6|8|9|12|13|16|22|23)[48]?\\s+(-?\\d[\\d.,]*)\\s*$", 'i').exec(t);
      const sk = m ? satzKand(m[3], moegl) : [];
      if (m && sk.length) {
        const vor = t.slice(0, m.index + (m[0].toLowerCase().startsWith(m[1].toLowerCase()) ? 0 : 1)), q = /(\d{1,3})\s*[^\d\w]*$/.exec(vor);
        const pr = [...m[4].matchAll(PREIS)].map((x) => cent(x[1]));
        let name = m[2].replace(/^d(?=[A-Z])/, '').replace(/^[^\wÀ-ÿ]+/, '').replace(/[^\wÀ-ÿ.)]+$/, '').replace(/\s+/g, ' ').trim();
        let menge = q ? +q[1] : 1; if (menge > 20) menge = 1;
        const lesbar = buchstaben(name) >= 3;
        posten.push({ t: lesbar ? name : 'Posten (Name nicht lesbar)', b: pr.length ? pr[pr.length - 1] : null, menge, einzel: null, mwst: sk[0], satzK: sk, zeile: i, c: z.c, rep: null, nameUnsicher: !lesbar, rahmen: z.b });
        return;
      }
      // Name nicht lesbar („Uni“ fehlt), aber Steuersatz und genau ein Betrag am Ende: Zeile gehört trotzdem zu den Posten
      const nr = /^(.*?)\b(\d{1,2})\s*%\s*(-?\d+[,.]\d{2})\s*$/.exec(t);
      if (nr && SAETZE.includes(+nr[2]) && /\d/.test(nr[1]) && !/[pf]re[cçg]o|total|incid/i.test(t)) {
        const q = /^\W*(\d{1,3})\b/.exec(nr[1]); let nm = nr[1].replace(/^\W*\d{1,3}\b/, '').replace(/[^\wÀ-ÿ]+/g, ' ').trim();
        const lesbar = buchstaben(nm) >= 3;
        posten.push({ t: lesbar ? nm : 'Posten (Name nicht lesbar)', b: cent(nr[3]), menge: q && +q[1] <= 20 ? +q[1] : 1, einzel: null, mwst: +nr[2], zeile: i, c: z.c, rep: null, nameUnsicher: !lesbar, rahmen: z.b });
        return;
      }
      const pe = /[pf]r[eé][cçg]o\s*[:;.]?\s*(\d+[,.]\d{2})/i.exec(t);
      if (pe && posten.length) { posten[posten.length - 1].einzel = cent(pe[1]); return; }
      const ta = /^\W*(\d{1,2})\s*%\s+(\d+[,.]\d{2})\s+(\d+[,.]\d{2})\s*$/.exec(t);
      if (ta && SAETZE.includes(+ta[1])) tabelle.push({ satz: +ta[1], brutto: cent(ta[2]) + cent(ta[3]) });
    });
    if (posten.length < 2) return null;
    // 1. Zwei Lesungen je Zeile: der Betrag am Zeilenende und Menge × „Preco“ (die Preco-Zeile ist meist besser gelesen).
    //    Die Menge wird auch aus Betrag ÷ Preco abgeleitet, falls sie falsch gelesen wurde.
    for (const p of posten) {
      p.kand = [];
      if (p.einzel) {
        if (p.menge && p.einzel * p.menge > 0) p.kand.push(p.einzel * p.menge);
        if (p.b != null && p.b % p.einzel === 0 && p.b / p.einzel <= 20 && !p.kand.includes(p.b)) p.kand.push(p.b);
      }
      if (p.b != null && !p.kand.includes(p.b)) p.kand.push(p.b);
      p.gelesen = p.b;
    }
    // 2. Klassen aus QR, sonst aus der Tabelle; je Steuersatz die Kombination der Lesungen suchen, die genau die Brutto-Summe ergibt
    const klassen = (qr && qr.klassen && qr.klassen.length ? qr.klassen : tabelle).map((k) => ({ ...k }));
    const quelleKl = qr && qr.klassen && qr.klassen.length ? 'qr' : tabelle.length ? 'tabelle' : null;
    // Lösung je Steuersatz, ohne etwas zu verändern: wählt je Zeile eine Lesung, sodass die Brutto-Summe genau stimmt
    const klasseLoesen = (k, mit) => {
      const feste = mit.filter((p) => p.kand.length), offen = mit.filter((p) => !p.kand.length);
      if (feste.length > 14 || offen.length > 1) return null;
      const n = feste.length, wahl = new Array(n).fill(0); let beste = null;
      const rek = (i, summe, abw) => {
        if (beste && abw > beste.abw) return;
        if (i === n) { const rest = k.brutto - summe; if (offen.length === 0 ? rest === 0 : rest > 0) if (!beste || abw < beste.abw) beste = { abw, wahl: wahl.slice(), rest, feste, offen }; return; }
        for (let c = 0; c < feste[i].kand.length; c++) { wahl[i] = c; rek(i + 1, summe + feste[i].kand[c], abw + (c ? 1 : 0)); }
      };
      rek(0, 0, 0); return beste;
    };
    // Zeilen mit mehreren möglichen Steuersätzen: alle Zuordnungen durchprobieren (höchstens 600), beste ohne Fehler nehmen
    const unklar = posten.filter((p) => p.satzK && p.satzK.length > 1);
    const zuordnungen = [[]]; for (const p of unklar) { const neuL = []; for (const z of zuordnungen) for (const s2 of p.satzK) neuL.push(z.concat(s2)); zuordnungen.splice(0, zuordnungen.length, ...neuL.slice(0, 600)); }
    let gewaehlt = null;
    if (klassen.length) {
      for (const z of zuordnungen) {
        unklar.forEach((p, i) => { p.mwst = z[i]; });
        const loesungen = klassen.map((k) => { const mit = posten.filter((p) => p.mwst === k.satz); return mit.length ? klasseLoesen(k, mit) : { leer: true }; });
        const fremd = posten.some((p) => !klassen.some((k) => k.satz === p.mwst));
        if (!fremd && loesungen.every(Boolean)) { gewaehlt = loesungen; break; }
      }
      if (!gewaehlt) unklar.forEach((p) => { p.mwst = p.satzK[0]; });
    }
    klassen.forEach((k, ki) => {
      const mit = posten.filter((p) => p.mwst === k.satz); if (!mit.length) { k.ist = 0; k.ok = k.brutto === 0; return; }
      const loesung = gewaehlt ? gewaehlt[ki] : klasseLoesen(k, mit);
      if (loesung && !loesung.leer) {
        loesung.feste.forEach((p, i) => { const v = p.kand[loesung.wahl[i]]; if (v !== p.gelesen) p.rep = p.einzel && v === p.einzel * p.menge ? 'Menge × Preis' : 'aus der Steuer-Summe'; p.b = v; p.sicher = true; });
        if (loesung.offen.length) { loesung.offen[0].b = loesung.rest; loesung.offen[0].rep = 'aus der Steuer-Summe'; loesung.offen[0].sicher = true; }
        k.ist = k.brutto; k.ok = true;
      } else {
        // keine Kombination passt: beste Einzellesung nehmen, Rest sichtbar machen, nichts schönreden
        for (const p of mit) { if (p.kand.length) p.b = p.kand[0]; p.sicher = false; }
        let ist = mit.reduce((a, p) => a + (p.b || 0), 0);
        if (ist < k.brutto) { posten.push({ t: `Nicht gelesen (${k.satz} %)`, b: k.brutto - ist, menge: 1, einzel: null, mwst: k.satz, zeile: -1, c: 0, rep: 'fehlender Rest', fehlt: true, sicher: false, kand: [] }); ist = k.brutto; }
        k.ist = ist; k.ok = false;
      }
    });
    if (!klassen.length) for (const p of posten) { if (p.b == null && p.kand.length) p.b = p.kand[0]; else if (p.kand.length && p.einzel && p.menge) p.b = p.kand[0]; }
    const total = qr ? qr.total : klassen.length && klassen.every((k) => k.ok) ? klassen.reduce((a, k) => a + k.brutto, 0) : null;
    const summe = posten.reduce((a, p) => a + (p.b || 0), 0);
    const nichtLesbar = posten.filter((p) => p.b == null).length;
    for (const p of posten) if (p.b == null) p.b = 0;
    return { zeilen: zeilen.map((z, i) => ({ text: z.text, b: z.b, c: z.c, typ: posten.some((p) => p.zeile === i) ? 'posten' : 'sonst', zu: posten.findIndex((p) => p.zeile === i) })), posten, total, totalZeile: -1, summe,
      // Platzhalter „Nicht gelesen“ machen die Summe künstlich passend: dann gilt der Bon NICHT als geprüft
      // Errechnete Beträge („aus der Steuer-Summe“, Menge × Preis gegen die Lesung) sind nicht gelesen → nicht geprüft
      pruefung: { klassen, quelle: quelleKl, gesamtOk: total != null && summe === total && !posten.some((p) => p.fehlt || p.rep) && klassen.every((k) => k.ok), nichtLesbar, repariert: posten.filter((p) => p.rep).length } };
  }

  // ---------- Rechnungs-QR-Code (AT-Spezifikation v1.1, Okt. 2020): Felder „Code:Wert“, mit * verbunden;
  // O = Gesamtbetrag mit Steuern, Punkt als Dezimaltrenner. Positionen stehen nicht darin. ----------
  function qrLesen(text) {
    if (!/^A:\d{9}\*/.test(text || '')) return null;
    const f = {};
    for (const teil of text.split('*')) { const i = teil.indexOf(':'); if (i > 0) f[teil.slice(0, i)] = teil.slice(i + 1); }
    if (!/^\d+\.\d{2}$/.test(f.O || '')) return null;
    const c = (k) => (/^\d+\.\d{2}$/.test(f[k] || '') ? Math.round(parseFloat(f[k]) * 100) : null);
    // Steuerklassen (Portaria 195/2020, Anlage): Region PT = I1; I2 befreit; I3/I4 Basis/IVA ermäßigt (6 %); I5/I6 mittel (13 %);
    // I7/I8 normal (23 %). Brutto je Klasse = Basis + IVA. Madeira I1→J…, Azoren K… (nicht geprüft, daher nur I-Felder).
    const kl = [];
    const klasse = (satz, b, v) => { if (b != null || v != null) kl.push({ satz, brutto: (b || 0) + (v || 0), basis: b, iva: v }); };
    if (f.I1 === 'PT' || f.I1 == null) { klasse(0, c('I2'), 0); klasse(6, c('I3'), c('I4')); klasse(13, c('I5'), c('I6')); klasse(23, c('I7'), c('I8')); }
    return { total: Math.round(parseFloat(f.O) * 100), nif: f.A, datum: f.F, dok: f.G, steuer: c('N'), klassen: kl };
  }
  async function ladeJsqr() {
    if (!window.jsQR) await new Promise((ok, fehler) => { const sc = document.createElement('script'); sc.src = basis().replace('tesseract/', 'jsqr/') + 'jsQR.js'; sc.onload = ok; sc.onerror = fehler; document.head.append(sc); });
  }
  // QR in einem großen, hohen Ausschnitt: in Kacheln in voller Auflösung absuchen (Verkleinern macht den Code unlesbar),
  // jede Kachel auch mit gestrecktem Kontrast und als Schwarz-Weiß-Bild
  // jsQR liest unscharfe Codes nur bei etwa 3–6 Pixeln je Modul: darum mehrere Verkleinerungen (0,35 zuerst: am Testbon die einzige, die ging)
  async function qrKacheln(c) {
    try {
      await ladeJsqr();
      const lies1 = (g, w, h, y) => { const d = g.getImageData(0, y, w, h), r = window.jsQR(d.data, d.width, d.height, { inversionAttempts: 'attemptBoth' }); return r && qrLesen(r.data); };
      for (const sk of [0.41, 0.35, 0.3, 0.5, 0.25, 0.6, 0.7, 1]) {
        const k = document.createElement('canvas'); k.width = Math.max(1, Math.round(c.width * sk)); k.height = Math.max(1, Math.round(c.height * sk));
        const g = k.getContext('2d', { willReadFrequently: true }); g.drawImage(c, 0, 0, k.width, k.height);
        if (k.height <= 2200) { const q = lies1(g, k.width, k.height, 0); if (q) return q; }
        const fh = Math.min(k.height, 900);
        for (let y = 0; y < k.height; y += 300) { const h = Math.min(fh, k.height - y), q = lies1(g, k.width, h, y); if (q) return q; if (y + h >= k.height) break; }
      }
    } catch (e) { /* kein QR */ }
    return null;
  }
  async function qrSuchen(daten) {
    const img = await new Promise((ok, fehler) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fehler; i.src = daten; });
    // 1. Eingebauter BarcodeDetector (Chrome Android); 2. jsQR 1.4.0 (Apache-2.0) für alle anderen, z. B. iOS Safari
    try {
      if ('BarcodeDetector' in window) {
        const d = new window.BarcodeDetector({ formats: ['qr_code'] });
        for (const c of await d.detect(img)) { const q = qrLesen(c.rawValue); if (q) return q; }
      }
    } catch (e) { /* weiter mit jsQR */ }
    try {
      if (!window.jsQR) await new Promise((ok, fehler) => { const sc = document.createElement('script'); sc.src = basis().replace('tesseract/', 'jsqr/') + 'jsQR.js'; sc.onload = ok; sc.onerror = fehler; document.head.append(sc); });
      for (const max of [1600, 2400, 1000]) {
        const f = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * f); c.height = Math.round(img.height * f);
        const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
        const r = window.jsQR(g.getImageData(0, 0, c.width, c.height).data, c.width, c.height, { inversionAttempts: 'dontInvert' });
        const q = r && qrLesen(r.data); if (q) return q;
      }
    } catch (e) { /* kein QR lesbar */ }
    return null;
  }

  function ladeScan() {
    if (window.FasanScan) return Promise.resolve();
    return new Promise((ok, fehler) => { const sc = document.createElement('script'); sc.src = new URL('scan.js', location.href).href; sc.onload = ok; sc.onerror = () => fehler(new Error('scan.js fehlt')); document.head.append(sc); });
  }
  function ladeBonbild() {
    if (window.BonBild) return Promise.resolve();
    return new Promise((ok, fehler) => { const sc = document.createElement('script'); sc.src = new URL('bonbild.js', location.href).href; sc.onload = ok; sc.onerror = () => fehler(new Error('bonbild.js fehlt')); document.head.append(sc); });
  }
  async function worterLesen(w, leinwand, psm) {
    await w.setParameters({ tessedit_pageseg_mode: String(psm) });
    const { data } = await w.recognize(leinwand, {}, { blocks: true, text: true });
    const woerter = [];
    for (const bl of data.blocks || []) for (const pa of bl.paragraphs || []) for (const li of pa.lines || []) for (const wo of li.words || []) woerter.push({ t: wo.text, c: wo.confidence, b: wo.bbox });
    return { woerter, roh: data.text || '' };
  }
  const drehen180 = (c) => { const o = document.createElement('canvas'); o.width = c.width; o.height = c.height; const g = o.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, o.width, o.height); g.translate(o.width, o.height); g.rotate(Math.PI); g.drawImage(c, 0, 0); return o; };
  // Güte eines Ergebnisses: Summe stimmt mit QR/Tabelle > sichere Posten > viele Posten > sichere Wörter
  // Widersprüche, die eine verrutschte Zuordnung verraten, obwohl die Summe aufgeht (gleiche Beträge, falsch verteilt):
  // 1. Pfandzeile „PFAND 0,25 EUR 0,39“: der genannte Pfandbetrag muss der Betrag der Zeile sein (Test: REWE gedreht).
  // 2. Mengenzeile „2 Stk x 0,65“: Menge × Einzelpreis muss der Betrag eines benachbarten Postens sein (Test 31.10., Handy-
  //    Protokoll REWE 3: Beträge eine Zeile verschoben, KRAEUTERQUARK ohne Betrag, Summe trotzdem 7,76).
  // 3. Posten ohne lesbaren Namen und zugleich eine Namenszeile ohne Betrag im Postenblock.
  const widersprueche = (r) => {
    const zl = r.zeilen || [];
    let n = zl.filter((z) => /pfand|deposit|statiegeld|vasilhame/i.test(z.text) && !/leergut|r[uü]ckgabe/i.test(z.text)).filter((z) => { const bt = betraege(z.text, r.dez || ','); return bt.length >= 2 && Math.abs(bt[0].v) !== Math.abs(bt[bt.length - 1].v); }).length;
    zl.forEach((z, i) => {
      const m = /^\s*(\d{1,3})\s*(?:stk|st|pcs?|pz|un|x|×)\.?\s*(?:x|×|à|a|@)?\s*(\d+[.,]\s?\d{2})(?!\d)/i.exec(z.text);
      if (!m) return; const soll = Math.round(+m[1] * cent(m[2].replace(/\s/g, '')));
      const nah = (r.posten || []).filter((p) => p.zeile != null && p.zeile >= i - 2 && p.zeile <= i + 1 && p.zeile !== i);
      if (nah.length && !nah.some((p) => Math.abs(Math.abs(p.b) - soll) <= 1)) n++;
    });
    const namenlos = (r.posten || []).some((p) => p.nameUnsicher && !p.fehlt), waise = zl.some((z) => z.typ === 'unklar');
    if (namenlos && waise) n++;
    return n;
  };
  // Gleichstand im Lesen: welches Bild der Nutzer sehen soll. Vorrang hat der vom Netz entfaltete, zugeschnittene Bon
  // („entfaltet“): flach und ohne Hand. Das Glätten aus den Zeilen wird danach aus der endgültigen (richtigen) Zuordnung
  // berechnet; ein früher geglättetes Bild trägt eine eventuell verrutschte Zuordnung in sich (Test 31.10., REWE 3:
  // Betragsspalte gestaucht).
  // 3.19: Vorrang hat der aus den Textzeilen begradigte Scan („gerade“, scan.js): Zeilen waagrecht, Rand senkrecht, auf das
  // Papier zugeschnitten. Er ist zugleich das angezeigte Bild, Kästen und Bild passen also immer genau aufeinander.
  const anzeigeBonus = (name, gerade) => /^gerade2/.test(name) ? 110 : /^gerade/.test(name) ? 100 : /^entfaltet(?!-foto)/.test(name) ? 45 : /^entfaltet/.test(name) ? 40 : gerade && name !== 'foto' ? 30 : 0;
  function guete(r, woerter) {
    const sicher = r.posten.filter((p) => p.sicher).length, gut = woerter.filter((x) => x.c > 70).length;
    // verrutschte Zuordnung (Betrag der Nachbarzeile) erzeugt Posten ohne Namen und Namenszeilen ohne Betrag – beides kostet
    const namenlos = r.posten.filter((p) => p.nameUnsicher && !p.fehlt).length, waisen = (r.zeilen || []).filter((z) => z.typ === 'unklar').length;
    // „Summe stimmt“ zählt nur voll, wenn die Zuordnung in sich stimmig ist (kein namenloser Posten, kein Name ohne Betrag) –
    // sonst kann eine zufällig passende Summe eine verrutschte Zuordnung gewinnen lassen
    // Widerspruch in der Zeile selbst: „PFAND 0,25 EUR 0,39“ – der genannte Pfandbetrag muss der Betrag der Zeile sein.
    // Verrutscht die Betragsspalte um eine Zeile, geht die Summe trotzdem auf (gleiche Beträge, falsch verteilt); das hier
    // merkt es (Test: REWE gedreht, alle Beträge eine Zeile zu hoch und trotzdem „geprüft“)
    const widerspruch = widersprueche(r);
    const stimmig = Math.max(0, 1 - 0.3 * (namenlos + waisen) - 0.5 * widerspruch);
    return (r.pruefung && r.pruefung.gesamtOk ? 10000 * stimmig : 0) + (r.total != null && r.summe === r.total ? 5000 * stimmig : 0) + sicher * 100 + r.posten.length * 20 + Math.min(gut, 400) * 0.1 - 150 * (namenlos + waisen) - 400 * widerspruch;
  }
  // Name aus einer neu gelesenen Zeile ziehen („… Uni NAME 13% …“)
  function nameAusZeile(t) {
    const m = /(?:^|[^A-Za-zÀ-ÿ])(Uni|Un|Kg|Lt)(?=[^a-z]|[a-z]?[A-Z])[\s'’|:.,;_-]*(.+?)\s+(?:\d{1,2}\s*[%gx48]|\d{1,2}\s+\d)/i.exec(t);
    if (!m) return null;
    const n = m[2].replace(/^d(?=[A-Z])/, '').replace(/^[^\wÀ-ÿ]+/, '').replace(/[^\wÀ-ÿ.)]+$/, '').replace(/\s+/g, ' ').trim();
    return buchstaben(n) >= 3 ? n : null;
  }
  // Zweiter, genauer Blick auf unsichere Zeilen: Zeile ausschneiden, 2,5-fach vergrößern, einzeln lesen (PSM 7)
  async function nachlesen(w, leinwand, posten) {
    for (const p of posten) {
      if (!p.rahmen || !(p.nameUnsicher || p.c < 80)) continue;
      const r = p.rahmen, pad = Math.round((r.y1 - r.y0) * 0.35), x0 = Math.max(0, r.x0 - pad), y0 = Math.max(0, r.y0 - pad), bw = Math.min(leinwand.width - x0, r.x1 - r.x0 + 2 * pad), bh = Math.min(leinwand.height - y0, r.y1 - r.y0 + 2 * pad);
      if (bw < 20 || bh < 10) continue;
      const k = 2.5, c = document.createElement('canvas'); c.width = Math.round(bw * k); c.height = Math.round(bh * k);
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(leinwand, x0, y0, bw, bh, 0, 0, c.width, c.height);
      try {
        const l = await worterLesen(w, c, 7), n = nameAusZeile(zeilenAus(l.woerter).map((z) => z.text).join(' '));
        if (n && (p.nameUnsicher || n !== p.t)) { const c2 = l.woerter.length ? l.woerter.reduce((a, x) => a + x.c, 0) / l.woerter.length : 0; const gleich = n.replace(/\s/g, '').toLowerCase() === p.t.replace(/\s/g, '').toLowerCase(); if (p.nameUnsicher || (!gleich && c2 > p.c + 10)) { p.t = n; p.nameUnsicher = false; } }
      } catch (e) { /* alter Name bleibt */ }
    }
  }
  // Bild verbessern für weitere Durchläufe (gleiche Größe, damit Kästen gültig bleiben):
  //  'kontrast': örtlicher Lichtausgleich (gegen Schatten) halb eingemischt + leichtes Schärfen (gegen Unschärfe)
  //  'dunkel':   Gammakurve 1,8 – blasser Thermodruck wird dunkler, Papier bleibt hell
  // Scan-Bild wie ein Dokumentscanner („Dokument“-Filter): Papierhelligkeit samt Schatten und Knicken schätzen und
  // herausrechnen → weißes Papier, gleichmäßig dunkle Schrift. Hintergrund = örtliches Maximum (die Schrift verschwindet,
  // Radius ≈ Zeilenhöhe) und Mittelung auf 1/6 Größe, wieder hochskaliert; dann Pixel ÷ Hintergrund, Kontrast gestreckt.
  // stark (Anzeige): leichte Grautöne (Knicke, Knitterschatten, Fingerabdrücke) werden weiß, Schrift bleibt schwarz –
  // wie der „Dokument“-Filter von Scanner-Apps. Für die Erkennung die milde Fassung (blasser Thermodruck soll bleiben).
  function scanBild(c, stark) {
    const w = c.width, h = c.height, { y, d } = grau(c), p = d.data, n = w * h;
    const sw = Math.max(8, Math.round(w / 6)), sh = Math.max(8, Math.round(h / 6));
    const k = document.createElement('canvas'); k.width = sw; k.height = sh;
    const kg = k.getContext('2d', { willReadFrequently: true }); kg.imageSmoothingQuality = 'high'; kg.drawImage(c, 0, 0, sw, sh);
    const kd = kg.getImageData(0, 0, sw, sh), kp = kd.data, m = sw * sh;
    let b = new Float32Array(m); const satt = new Float32Array(m);
    for (let i = 0; i < m; i++) { const R = kp[i * 4], G = kp[i * 4 + 1], B = kp[i * 4 + 2], mx = Math.max(R, G, B); b[i] = 0.299 * R + 0.587 * G + 0.114 * B; satt[i] = mx > 20 ? (mx - Math.min(R, G, B)) / mx : 0; }
    const r = Math.max(2, Math.round(Math.min(sw, sh) / 40));
    const lauf = (src, max, waag) => { // trennbarer Max- bzw. Mittelwertfilter
      const o = new Float32Array(m), L = waag ? sw : sh, Q = waag ? sh : sw;
      for (let q = 0; q < Q; q++) for (let l = 0; l < L; l++) {
        let a = max ? 0 : 0, z = 0;
        for (let t = Math.max(0, l - r); t <= Math.min(L - 1, l + r); t++) { const v = src[waag ? q * sw + t : t * sw + q]; if (max) { if (v > a) a = v; } else { a += v; z++; } }
        o[waag ? q * sw + l : l * sw + q] = max ? a : a / z;
      }
      return o;
    };
    b = lauf(lauf(lauf(lauf(b, true, true), true, false), false, true), false, false);
    for (let i = 0; i < m; i++) { kp[i * 4] = kp[i * 4 + 1] = kp[i * 4 + 2] = b[i]; kp[i * 4 + 3] = 255; }
    kg.putImageData(kd, 0, 0);
    const gross = document.createElement('canvas'); gross.width = w; gross.height = h;
    const gg = gross.getContext('2d', { willReadFrequently: true }); gg.imageSmoothingQuality = 'high'; gg.drawImage(k, 0, 0, w, h);
    const bg = gg.getImageData(0, 0, w, h).data;
    for (let i = 0; i < n; i++) {
      const v = (255 * y[i]) / Math.max(24, bg[i * 4]);
      let x;
      if (stark) {
        const t = Math.max(0, Math.min(1, (v - 85) / (205 - 85))); x = 255 * Math.pow(t, 0.85);
      }
      else x = Math.max(0, Math.min(255, ((v - 40) * 255) / 200));
      p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = x; p[i * 4 + 3] = 255;
    }
    gg.putImageData(d, 0, 0);
    return gross;
  }
  function verbessern(c, art) {
    if (art === 'scan') return scanBild(c);
    if (art === 'scanstark') return scanBild(c, true);
    const w = c.width, h = c.height, { y, d, g } = grau(c), p = d.data, n = w * h;
    let v = new Float32Array(n);
    if (art === 'dunkel') for (let i = 0; i < n; i++) v[i] = 255 * Math.pow(y[i] / 255, 1.8);
    else {
      const flach = lichtAusgleich(y, w, h);
      for (let i = 0; i < n; i++) v[i] = 0.5 * y[i] + 0.5 * flach[i];
      const s2 = new Float32Array(n);
      for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) { const k = j * w + i, m = (v[k - 1] + v[k + 1] + v[k - w] + v[k + w] + v[k]) / 5; s2[k] = v[k] + 0.7 * (v[k] - m); }
      v = s2;
    }
    for (let i = 0; i < n; i++) { const x = Math.max(0, Math.min(255, v[i])); p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = x; p[i * 4 + 3] = 255; }
    const o = document.createElement('canvas'); o.width = w; o.height = h; o.getContext('2d').putImageData(d, 0, 0);
    return o;
  }
  // Neuronale Erkennung (ocr.js, PaddleOCR) wenn ihre Dateien da sind, sonst Tesseract wie bisher
  let neuronal = null;
  async function paddleDa() {
    if (neuronal !== null) return neuronal;
    try {
      if (!window.FasanOCR) await new Promise((ok, fehler) => { const sc = document.createElement('script'); sc.src = new URL('ocr.js', location.href).href; sc.onload = ok; sc.onerror = fehler; document.head.append(sc); });
      neuronal = await window.FasanOCR.verfuegbar();
    } catch (e) { neuronal = false; }
    return neuronal;
  }
  function fotoLeinwand(img, max = 2200) {
    const f = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.round(img.width * f); c.height = Math.round(img.height * f); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c;
  }
  // Bildausschnitt der Zeile je Posten: In der App steht das Original direkt neben der Lesung, ein Blick genügt zum Prüfen
  function schnipsel(c, r) {
    if (!r) return null;
    // eng: PaddleOCR weitet Kästen auf (unclip 1,5), sonst ragen Nachbarzeilen ins Zeilenbild
    const h0 = r.y1 - r.y0, h = h0 * 0.76, pad = Math.round(h0 * 0.04), x0 = Math.max(0, Math.round(r.x0 - pad)), y0 = Math.max(0, Math.round(r.y0 + h0 * 0.12 - pad));
    const bw = Math.min(c.width - x0, Math.round(r.x1 - r.x0 + 2 * pad)), bh = Math.min(c.height - y0, Math.round(h + 2 * pad));
    if (bw < 8 || bh < 6) return null;
    const f = Math.min(1, 56 / bh), k = document.createElement('canvas'); k.width = Math.round(bw * f); k.height = Math.round(bh * f);
    k.getContext('2d').drawImage(c, x0, y0, bw, bh, 0, 0, k.width, k.height);
    return k.toDataURL('image/jpeg', 0.8);
  }
  // ---------- Protokoll: was die Erkennung auf dem Gerät tut (zum Teilen bei Fehlern; Fehler werden nicht mehr verschluckt) ----------
  let P = null;
  const t0 = () => (P ? Math.round(performance.now() - P.start) : 0);
  function pl(typ, d = {}) { if (P) P.schritte.push({ t: t0(), typ, ...d }); }
  function pf(wo, e) { if (P) P.fehler.push({ t: t0(), wo, text: String((e && e.message) || e), stack: e && e.stack ? String(e.stack).split('\n').slice(0, 4).join(' | ') : '' }); }
  function daumen(c, b = 360) { try { const f = Math.min(1, b / c.width), d = document.createElement('canvas'); d.width = Math.round(c.width * f); d.height = Math.round(c.height * f); d.getContext('2d').drawImage(c, 0, 0, d.width, d.height); return d.toDataURL('image/jpeg', 0.6); } catch (e) { return null; } }
  async function erkenne(daten, melde, opt = {}) {
    P = { start: performance.now(), schritte: [], fehler: [], bilder: [], zeit: new Date().toISOString(), geraet: { ua: navigator.userAgent, speicher: navigator.deviceMemory || null, kerne: navigator.hardwareConcurrency || null, bildschirm: `${screen.width}×${screen.height}@${devicePixelRatio}` }, optionen: { ...opt } };
    const paddle = opt.motor !== 'tesseract' && await paddleDa();
    pl('motor', { paddle, modus: window.FasanOCR ? window.FasanOCR.modus : null });
    // Fortschritt in Stufen (für Ladebalken in der App): jede Stufe meldet 0–1, hier auf den Gesamtweg umgerechnet
    const stufe = (text, a, b) => (m) => { if (melde) melde({ status: 'stufe', text, progress: a + (b - a) * Math.max(0, Math.min(1, (m && m.progress) || 0)), roh: m }); };
    const laden = stufe('Erkennung wird geladen', 0, 0.1);
    const w = paddle ? null : await bereit(melde);
    if (paddle) await window.FasanOCR.lade((m) => laden(m));
    // 1. Bon im Foto finden und entzerren (bonbild.js)
    stufe('Bon wird im Foto gesucht', 0.1, 0.14)({ progress: 0 });
    let ausschnitt = null, foto = null;
    try {
      await ladeBonbild();
      const BB = window.BonBild, img = await BB.laden(daten), f = BB.finde(img); foto = img;
      if (f) {
        let ec = f.ecken; const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
        // Rand dazugeben: die gefundene Papierkante liegt oft innen (Schatten, Knick) und schnitt den Zeilenanfang ab
        // (Test 31.10., REWE 3: „OLLKORNSANDWICH“). 4 % nach außen, im Bild begrenzt.
        { const mx = ec.reduce((a, p) => a + p[0], 0) / 4, my = ec.reduce((a, p) => a + p[1], 0) / 4; ec = ec.map(([x, y]) => [Math.max(0, Math.min(img.width - 1, mx + (x - mx) * 1.08)), Math.max(0, Math.min(img.height - 1, my + (y - my) * 1.03))]); }
        // Tesseract: Bon liegt quer, wenn er breiter als hoch ist. Mit PaddleOCR wird stattdessen die Schriftrichtung gemessen
        // (kurze Bons sind oft breiter als hoch und würden sonst um 90° falsch gedreht).
        if (!paddle && d(ec[0], ec[1]) > d(ec[0], ec[3])) ec = [ec[3], ec[0], ec[1], ec[2]];
        let e = BB.entzerre(img, ec), sc = BB.gerade(e.canvas);
        if (paddle && await window.FasanOCR.hochkant(e.canvas)) { ec = [ec[3], ec[0], ec[1], ec[2]]; e = BB.entzerre(img, ec); sc = BB.gerade(e.canvas); }
        ausschnitt = { canvas: sc.canvas, roh: e.canvas, ecken: ec };
      }
    } catch (e) { ausschnitt = null; pf('ausschnitt', e); }
    pl('foto', { breite: foto && foto.width, hoehe: foto && foto.height, ausschnitt: ausschnitt ? { breite: ausschnitt.canvas.width, hoehe: ausschnitt.canvas.height, ecken: ausschnitt.ecken.map((p) => p.map(Math.round)) } : null });
    let qr = await qrSuchen(daten);
    if (!qr && ausschnitt) qr = await qrKacheln(ausschnitt.roh) || await qrSuchen(ausschnitt.roh.toDataURL('image/jpeg', 0.9)) || await qrKacheln(ausschnitt.canvas);
    const versuche = [], alle = []; let beste = null;
    const scans = new Map(); // Leinwand → Scan-Objekt aus scan.js (für Anzeige und Papierrand)
    // lauf: leinwand wird gelesen, anzeige ist das Bild für die App (bei verbesserten Durchläufen das Original)
    const lauf = async (leinwand, psm, name, ecken, fort, anzeige, gerade = name !== 'foto') => {
      let v, woerter, roh = ''; const ts = performance.now();
      if (paddle) { v = { canvas: anzeige || leinwand, lese: leinwand, winkel: 0 }; woerter = await window.FasanOCR.woerter(leinwand, { melde: fort }); }
      else { v = await vorbereiten(leinwand, !!ecken); v.lese = v.canvas; const l = await worterLesen(w, v.canvas, psm); woerter = l.woerter; roh = l.roh; }
      let z = zeilenAus(woerter, { gerade }), r = lies(z, qr), g = guete(r, woerter);
      const zk = zeilenSpalten(woerter, true) || [];
      let zname = '';
      // Auch mit bestätigter Summe kostet ein großer Versatz: zwei stimmige Lesungen → die mit weniger Verschiebung gewinnt
      // (Test 31.10., Belém: um eine Zeile verschobene Beträge ergaben dieselbe Summe, Kopfzeile wurde zum Posten).
      // ein Versatz um ganze Zeilen nur, wenn die Summe ihn bestätigt; sonst gilt die geometrisch nächste Paarung (fehlt ein
      // Betrag, passt keine Summe – dann darf nicht die verschobene Paarung gewinnen)
      for (const z2 of zk) { const r2 = lies(z2, qr), ok2 = r2.pruefung && r2.pruefung.gesamtOk, g2 = guete(r2, woerter) - (ok2 ? 300 : 400) * Math.max(0, Math.abs(z2.spalten.versatz) - 0.6); if (g2 > g) { z = z2; r = r2; g = g2; zname = `+spalten(${z2.spalten.versatz})`; } }
      // Betragsspalte neu zerlegt und gelesen (siehe spalteNeu) – nur wenn die Lesung noch nicht stimmt: die Neuzerlegung
      // kann Namen benachbarter Zeilen vermischen (Test 31.10., Belém), sie ist die Rettung für verschmolzene Beträge
      if (paddle && !(r.pruefung && r.pruefung.gesamtOk)) { try { const w2 = await spalteNeu(leinwand, woerter); if (w2) { for (const z2 of [zeilenAus(w2, { gerade }), ...(zeilenSpalten(w2, true) || [])]) { const r2 = lies(z2, qr), ok2 = r2.pruefung && r2.pruefung.gesamtOk, vs = z2.spalten ? z2.spalten.versatz : 0, g2 = guete(r2, w2) - (ok2 ? 300 : 400) * Math.max(0, Math.abs(vs) - 0.6) - 150; /* Rettung: bei Gleichstand gilt die normale Lesung */ if (g2 > g) { z = z2; r = r2; g = g2; zname = `+spalte${z2.spalten ? `(${vs})` : ''}`; } } } } catch (e) { pf('spalte', e); } }
      name += zname;
      // Gleichstand: der entzerrte (und noch mehr der geglättete) Bon wird angezeigt – sieht aus wie gescannt
      g += anzeigeBonus(name, gerade);
      versuche.push(`${name}:${Math.round(g)}`);
      if (P) {
        const pr = r.pruefung || {};
        pl('lauf', { name, guete: Math.round(g), ms: Math.round(performance.now() - ts), breite: leinwand.width, hoehe: leinwand.height, woerter: woerter.length, sicher80: woerter.length ? +(woerter.filter((x) => x.c > 80).length / woerter.length).toFixed(2) : 0,
          posten: r.posten.length, ohneName: r.posten.filter((p) => !p.t).length, summe: r.summe, total: r.total, gesamtOk: !!pr.gesamtOk,
          zeilen: z.map((x) => x.text), woerter: woerter.map((x) => [x.t, Math.round(x.c), Math.round(x.b.x0), Math.round(x.b.y0), Math.round(x.b.x1), Math.round(x.b.y1)]) });
        if (leinwand.width) P.bilder.push({ name, bild: daumen(leinwand) });
      }
      const e = { g, r, v, roh, name, ecken, z, gerade }; alle.push(e);
      // Vorschau für die Ladeanzeige: erstes Bild mit den gefundenen Zeilen, dann der begradigte Scan (sichtbarer Fortschritt)
      if (melde && paddle && (alle.length === 1 || /^gerade/.test(name))) {
        try {
          const W0 = v.canvas.width, H0 = v.canvas.height, f = Math.min(1, 640 / W0), k = document.createElement('canvas');
          k.width = Math.round(W0 * f); k.height = Math.round(H0 * f); k.getContext('2d').drawImage(v.canvas, 0, 0, k.width, k.height);
          const sc = scans.get(v.canvas), bild = sc ? window.FasanScan.documentLook(k, { textHeight: sc.stats.textHeightOut * f }) : k;
          melde({ status: 'vorschau', name, gerade: !!sc, seiten: `${W0} / ${H0}`, ar: +(W0 / H0).toFixed(4), bild: bild.toDataURL('image/jpeg', 0.8),
            kaesten: woerter.slice(0, 400).map((x) => [x.b.x0 / W0, x.b.y0 / H0, x.b.x1 / W0, x.b.y1 / H0].map((q) => +q.toFixed(4))) });
        } catch (err) { /* Vorschau ist nur Anzeige */ }
      }
      if (!beste || g > beste.g) beste = e;
      lauf.lesbar = woerter.length ? woerter.filter((x) => x.c > 80).length / woerter.length : 0;
      return g;
    };
    // 2. Gerader Ausschnitt, bei schlechtem Ergebnis um 180° gedreht, zuletzt das ganze Foto. Bestes Ergebnis gewinnt.
    if (ausschnitt) {
      const g1 = await lauf(ausschnitt.canvas, 6, 'ausschnitt', ausschnitt.ecken, stufe('Bon wird gelesen', 0.14, 0.4));
      // um 180° nur, wenn die Schrift unlesbar war (auf dem Kopf); sonst lag es am Ausschnitt, nicht an der Richtung
      if (g1 < 5000 && (!paddle || lauf.lesbar < 0.5)) await lauf(drehen180(ausschnitt.canvas), 6, 'ausschnitt180', ausschnitt.ecken, stufe('Bon wird gedreht gelesen', 0.14, 0.4));
    }
    if (!beste || beste.g < 5000) {
      // ganzes Foto: PaddleOCR braucht keine Vorverarbeitung; schräge Zeilen fängt die Neigung je Textkasten auf (zeilenAus)
      if (paddle) {
        if (!foto) foto = await new Promise((ok, fehler) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fehler; i.src = daten; });
        const fl = fotoLeinwand(foto); await lauf(fl, 11, 'foto', null, stufe('Ganzes Foto wird gelesen', 0.14, 0.3));
        // Bon aus der Schrift bestimmen, entzerren und in voller Auflösung neu lesen (Dokumentscanner-Prinzip)
        const fp = alle[alle.length - 1], ec = fp && textViereck(fp.z, fl.width, fl.height);
        if (ec && window.BonBild) {
          const f = fl.width / foto.width, ecO = ec.map(([x, y]) => [x / f, y / f]);
          const e = window.BonBild.entzerre(foto, ecO), sc = window.BonBild.gerade(e.canvas);
          await lauf(sc.canvas, 6, 'begradigt', ecO, stufe('Bon wird begradigt und neu gelesen', 0.3, 0.4));
        }
      }
      else await lauf(daten, 11, 'foto', null);
    }
    // 2a. Entfalten (UVDoc, neuronal). Das Netz ist auf ganze Fotos mit Hintergrund trainiert: zuerst auf dem ganzen Foto
    //     (findet Blatt, Perspektive und Wölbung zugleich), dann auf dem besten entzerrten Durchlauf
    if (paddle) {
      try {
        if (!foto) foto = await new Promise((ok, fehler) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fehler; i.src = daten; });
        const ef = await entfalten(fotoLeinwand(foto), foto);
        if (ef) await lauf(ef, 6, 'entfaltet-foto', null, stufe('Blatt wird erkannt und entfaltet', 0.3, 0.33), null, true);
      } catch (e) { pf('uvdoc-foto', e); }
    }
    if (paddle && beste && beste.gerade && !/^entfaltet/.test(beste.name)) {
      try { const ef = await entfalten(beste.v.lese); if (ef) await lauf(ef, 6, 'entfaltet', beste.ecken, stufe('Knicke und Wölbung werden entfaltet', 0.33, 0.37), null, true); } catch (e) { pf('uvdoc', e); }
    }
    // 2b. Begradigen wie ein Dokumentscanner (scan.js): aus den gelesenen Textzeilen eine glatte Abbildung Foto → Scan
    //     (Zeilen waagrecht, linker Rand senkrecht, gleiche Schriftgröße), auf das Papier zugeschnitten. Danach neu lesen;
    //     auf dem begradigten Bild sind die Zeilen besser bekannt, darum ein zweiter, feinerer Durchgang.
    //     Ersetzt das frühere „Glätten“ (3.15–3.18), dessen Ergebnis auf dem Handy kaum sichtbar war.
    // Grundlage: bester Durchlauf auf dem Foto selbst (ganz oder perspektivisch entzerrt), nicht das UVDoc-Bild – dessen
    // Abtastung verzerrt die Schrift örtlich (Test 01.11., REWE 3: „TSE-Start“ doppelt so hoch, Fuß gestaucht)
    const basis = alle.filter((e) => e.z && !/^entfaltet/.test(e.name)).sort((a, b) => b.g - a.g)[0] || beste;
    if (paddle && basis && basis.z) {
      try {
        await ladeScan();
        const ts = performance.now(), s1 = window.FasanScan.straighten(basis.v.canvas, basis.z, { smooth: 0.05 });
        pl('gerade', { stufe: 1, quelle: basis.name, ms: Math.round(performance.now() - ts), ok: !!s1, grund: s1 ? null : window.FasanScan.lastError, ...(s1 ? s1.stats : {}) });
        if (s1) {
          scans.set(s1.canvas, s1);
          await lauf(s1.canvas, 6, 'gerade', null, stufe('Bon wird begradigt wie gescannt', 0.36, 0.42), null, true);
          const e1 = alle[alle.length - 1], ts2 = performance.now(), s2 = e1 && e1.z && window.FasanScan.straighten(s1.canvas, e1.z, { smooth: 0.05 });
          pl('gerade', { stufe: 2, ms: Math.round(performance.now() - ts2), ok: !!s2, grund: s2 ? null : window.FasanScan.lastError, ...(s2 ? s2.stats : {}) });
          if (s2) { scans.set(s2.canvas, s2); await lauf(s2.canvas, 6, 'gerade2', null, stufe('Feinere Begradigung', 0.42, 0.46), null, true); }
        }
      } catch (e) { pf('gerade', e); }
    }
    // 3. PaddleOCR, Summe noch nicht bestätigt: weitere Durchläufe mit verbessertem Bild (Kontrast/Schärfe, dunkler)
    if (paddle && !(beste.r.pruefung && beste.r.pruefung.gesamtOk)) {
      const quelle = beste.v.canvas;
      const gerade = beste.gerade;
      await lauf(verbessern(quelle, 'scan'), 6, 'scan', beste.ecken, stufe('Bon wird wie gescannt aufbereitet und neu gelesen', 0.4, 0.46), quelle, gerade);
      if (!(beste.r.pruefung && beste.r.pruefung.gesamtOk)) await lauf(verbessern(quelle, 'kontrast'), 6, 'kontrast', beste.ecken, stufe('Bild wird verbessert und neu gelesen', 0.46, 0.55), quelle, gerade);
      if (!(beste.r.pruefung && beste.r.pruefung.gesamtOk)) await lauf(verbessern(quelle, 'dunkel'), 6, 'dunkel', beste.ecken, stufe('Blasser Druck wird verstärkt gelesen', 0.55, 0.64), quelle, gerade);
    }
    if (!paddle && beste.name !== 'foto') await nachlesen(w, beste.v.canvas, beste.r.posten.filter((p) => !p.fehlt));
    // 4. PaddleOCR: jeden Betrag im Postenblock mehrfach lesen (auch wenn die Summe schon stimmt – zwei Lesefehler können sich
    //    aufheben, und die Lesesicherheit je Posten braucht mehrere Lesungen); Zeilen ohne Betrag rechts nachlesen
    window.__bonAlle = alle; // zur Fehlersuche (Testskripte)
    // Nachlesen auf dem ersten (Original-)Durchlauf und auf dem besten, falls verschieden; das bessere Endergebnis gewinnt
    const kandidaten = paddle ? [...new Set([alle[0], beste])] : [];
    let ende = beste;
    for (let ki = 0; ki < kandidaten.length; ki++) {
      const pass = kandidaten[ki], { v } = pass; let { r } = pass;
      const fort = stufe(kandidaten.length > 1 ? `Beträge werden mehrfach geprüft (${ki + 1}/${kandidaten.length})` : 'Beträge werden mehrfach geprüft', 0.64 + (0.34 * ki) / kandidaten.length, 0.64 + (0.34 * (ki + 1)) / kandidaten.length);
      const z = pass.z, gruppe = r.zeilen.map((x, i) => ({ x, i })).filter(({ x }) => x.block || x.typ === 'summe');
      const betragsWort = (zl) => (zl.w || []).filter((x) => /\d[.,]\s?\d{2}(?!\d)/.test(x.t)).pop();
      const kanten = gruppe.map(({ i }) => betragsWort(z[i])).filter(Boolean).map((x) => x.b.x1).sort((a, b) => a - b);
      const spalteR = kanten.length ? kanten[kanten.length >> 1] : v.canvas.width * 0.95;
      // Betragsspalte (x-Bereich) aus allen Ziffernkästen im Block – auch aus Bruchstücken wie „2,“ und „59“
      const ziffern = gruppe.flatMap(({ i }) => (z[i] && z[i].w ? z[i].w : []).filter((x) => /\d/.test(x.t) && !/[a-z]{3,}/i.test(x.t) && x.b.x0 > v.canvas.width * 0.45));
      const pct = (a, q) => { const s2 = [...a].sort((p, r) => p - r); return s2.length ? s2[Math.min(s2.length - 1, Math.floor(s2.length * q))] : null; };
      const spX0 = pct(ziffern.map((x) => x.b.x0), 0.15), spX1 = pct(ziffern.filter((x) => /\d$/.test(x.t.trim())).map((x) => x.b.x1), 0.85);
      const dunkel = verbessern(v.canvas, 'dunkel'), kontrast = verbessern(v.canvas, 'kontrast');
      let n = 0;
      for (const { x, i } of gruppe) {
        const zl = z[i]; if (!zl) continue;
        const bw = betragsWort(zl);
        let k = null, verschmolzen = false;
        // Zeilenhöhe aus den Wörtern links der Betragsspalte (Name): die Namen sind verlässlich, Betragskästen nicht immer
        const namen = (zl.w || []).filter((y) => spX0 == null || y.b.x1 < spX0 - 2), med2 = (a) => [...a].sort((p, q) => p - q)[a.length >> 1];
        // Nachlesen dort, wo der Betrag dieser Zeile steht (sein eigener Kasten): Auf gewelltem Papier liegt der Betrag nicht auf
        // der Höhe des Namens (Test 30.10., Handy-Foto: Nachlesen auf Namenshöhe las den Betrag der Nachbarzeile → 2,50 statt 1,11).
        const bruch = !bw && spX0 != null ? (zl.w || []).filter((y) => /\d/.test(y.t) && y.b.x0 >= spX0 - 2 && !/[a-z]{3,}/i.test(y.t)) : [];
        if (!bw && bruch.length) {
          // Betrag in Stücken („2,“ | „59“): Bereich der Stücke in ihrer eigenen Höhe
          // Stücke („79“ ohne „1,“ – dünne Eins und Komma nicht erkannt): Ausschnitt über die ganze Betragsspalte nach links
          const y0b = med2(bruch.map((y) => y.b.y0)), y1b = med2(bruch.map((y) => y.b.y1)), hb = y1b - y0b;
          k = { x0: Math.max(0, Math.min(Math.min(...bruch.map((y) => y.b.x0)) - 1.6 * hb, spX0 - 0.5 * hb)), x1: Math.min(v.canvas.width, Math.max(...bruch.map((y) => y.b.x1)) + 0.3 * hb), y0: y0b, y1: y1b };
        } else if (bw && namen.length) {
          const y0 = med2(namen.map((y) => y.b.y0)), y1 = med2(namen.map((y) => y.b.y1)), hz = y1 - y0, hb = bw.b.y1 - bw.b.y0;
          k = bw.b;
          // nur ein deutlich zu hoher Betragskasten (mit der Nachbarzeile verschmolzen) wird auf Zeilenhöhe beschnitten
          if (hb > 1.35 * hz) { const m = (bw.b.y0 + bw.b.y1) / 2, mn = (y0 + y1) / 2, c = Math.max(bw.b.y0 + hz / 2, Math.min(bw.b.y1 - hz / 2, mn)); k = { x0: bw.b.x0, x1: bw.b.x1, y0: c - hz / 2, y1: c + hz / 2 }; verschmolzen = Math.abs(m - c) > 0.2 * hz; }
        } else if (bw) {
          // Ist der Betragskasten deutlich höher als die übrigen Wörter der Zeile, hat die Erkennung ihn mit der Nachbarzeile
          // verschmolzen: dann auf Höhe der Zeile (Name, Steuersatz) nachlesen, nicht im eigenen Kasten
          const rest = (zl.w || []).filter((y) => y !== bw), med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
          k = bw.b;
          if (rest.length) { const y0 = med(rest.map((y) => y.b.y0)), y1 = med(rest.map((y) => y.b.y1)); if (bw.b.y1 - bw.b.y0 > 1.3 * (y1 - y0)) { k = { x0: bw.b.x0, x1: bw.b.x1, y0, y1 }; verschmolzen = true; } }
        } else if (x.typ === 'unklar') {
          const hz = zl.b.y1 - zl.b.y0; k = { x0: Math.max(0, spalteR - hz * 4.5), x1: Math.min(v.canvas.width, spalteR + hz * 0.3), y0: zl.b.y0, y1: zl.b.y1 };
        }
        if (k) {
          // Original (5 Ausschnitte) + dunkler und kontrastreicher (je 2): verschiedene Schriften reagieren verschieden
          zl.mehr = [...await window.FasanOCR.mehrfach(v.canvas, k),
            ...await window.FasanOCR.mehrfach(dunkel, k, { varianten: [[0.15, 0], [0.35, 0]] }),
            ...await window.FasanOCR.mehrfach(kontrast, k, { varianten: [[0.15, 0], [0.35, 0]] })];
          if (verschmolzen) zl.mehr = zl.mehr.concat(zl.mehr); // Lesungen auf Zeilenhöhe zählen doppelt gegen die verschmolzene
        }
        fort({ progress: ++n / gruppe.length });
      }
      const r2 = lies(z, qr);
      if (guete(r2, []) >= guete(r, [])) r = r2;
      const g2 = guete(r, []) + anzeigeBonus(pass.name, pass.gerade);
      if (ki === 0 || g2 > ende.gEnde) { ende = { ...pass, r, gEnde: g2 }; window.__bonZeilen = z; } // __bonZeilen: zur Fehlersuche (Testskripte)
    }
    if (paddle) { stufe('Fertig', 0.98, 1)({ progress: 1 }); if (window.FasanOCR.frei) window.FasanOCR.frei(); }
    let { r, v, roh, name, ecken } = ende;
    // Anzeige = begradigter Scan. War der Gewinner ein begradigter Durchlauf, ist sein Bild schon der Scan; sonst wird
    // das Bild des Gewinners jetzt aus dessen Zeilen begradigt und alle Kästen werden mit derselben Abbildung umgerechnet.
    let scan = scans.get(v.canvas) || scans.get(v.lese) || null;
    if (!scan && paddle && ende.z) {
      try {
        await ladeScan();
        const s3 = window.FasanScan.straighten(v.canvas, ende.z, { smooth: 0.05 });
        pl('gerade', { stufe: 'anzeige', quelle: name, ok: !!s3, grund: s3 ? null : window.FasanScan.lastError, ...(s3 ? s3.stats : {}) });
        if (s3) {
          const ab = s3.boxToScan;
          r = { ...r, zeilen: r.zeilen.map((z) => (z.b ? { ...z, b: ab(z.b) } : z)), posten: r.posten.map((p) => ({ ...p, rahmen: p.rahmen ? ab(p.rahmen) : p.rahmen, zusaetze: p.zusaetze ? p.zusaetze.map((x) => ({ ...x, rahmen: x.rahmen ? ab(x.rahmen) : x.rahmen })) : p.zusaetze })) };
          v = { ...v, canvas: s3.canvas, lese: s3.canvas }; scan = s3; name += '→gerade';
        }
      } catch (e) { pf('gerade-anzeige', e); }
    }
    // Scan-Ansicht: Graustufen, weißes Papier, dunkle Schrift, weiche Kanten (scan.js documentLook); Farbe bleibt als „Foto“
    let anzeige = v.canvas;
    if (paddle) { try { anzeige = scan ? window.FasanScan.documentLook(scan.canvas, { textHeight: scan.stats.textHeightOut, paper: scan.paper }) : scanBild(v.canvas, true); } catch (e) { anzeige = v.canvas; pf('scanbild', e); } }
    for (const p of r.posten) p.schnipsel = schnipsel(anzeige, p.rahmen || (r.zeilen[p.zeile] && r.zeilen[p.zeile].b));
    // Gewinner mit Widerspruch in einer Zeile: nie „geprüft“ melden, auch wenn die Summe aufgeht
    if (r.pruefung && r.pruefung.gesamtOk && widersprueche(r)) r = { ...r, pruefung: { ...r.pruefung, gesamtOk: false, widerspruch: true } };
    let protokoll = null;
    if (P) {
      pl('ergebnis', { gewinner: name, nachlesenAuf: kandidaten.map((k) => k.name), posten: r.posten.map((p) => ({ t: p.t, b: p.b, menge: p.menge, sicher: p.sicher, zeile: p.zeile, zus: (p.zusaetze || []).map((x) => `${x.art}:${x.betrag}`) })), summe: r.summe, total: r.total, gesamtOk: !!(r.pruefung && r.pruefung.gesamtOk),
        zeilen: r.zeilen.map((x) => `${x.typ}|${x.text}`) });
      P.bilder.push({ name: 'anzeige', bild: daumen(anzeige, 600) });
      P.dauer = t0(); protokoll = P; P = null;
    }
    return { ...r, protokoll, qr, quelle: name, motor: paddle ? 'paddle' : 'tesseract', versuche, breite: v.canvas.width, hoehe: v.canvas.height, bild: anzeige.toDataURL('image/jpeg', 0.85), bildOriginal: anzeige !== v.canvas ? v.canvas.toDataURL('image/jpeg', 0.82) : null, winkel: v.winkel, roh, ecken };
  }
  const VERSION = '3.19';
  return { VERSION, abbruchProtokoll: () => { const x = P; if (x) { x.dauer = t0(); P = null; } return x; }, erkenne, verbessern, bonArt, bereit, qrKacheln, vorbereiten, worterLesen, lies, liesAllgemein, abgleich, zeilenAus, zeilenSpalten, cent, qrLesen, qrSuchen, paddleDa };
})();
