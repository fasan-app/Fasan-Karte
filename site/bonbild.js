'use strict';
/* Fasan Karte – Kassenzettel im Foto finden und gerade ziehen, ganz im Handy. MPL-2.0
 * Warum: Auf einem Tisch mit Muster (kariertes Tuch, Holz, Teller) findet die Texterkennung keine sauberen Zeilen, und die
 * Schräglagen-Messung über das ganze Foto richtet sich nach dem Muster statt nach dem Bon. Getestet am echten Bon
 * vom 24.10.2026 (kariertes Tuch, Foto schräg): ganzes Foto → Zeilen zerstört; entzerrter Ausschnitt → Zeilen und Beträge lesbar.
 * Vorgehen (eigenes Verfahren, keine Bibliothek):
 *  1. Foto auf 1400 px verkleinern. „Papier“ = glatt (örtliche Streuung 7×7 klein), hell und kaum bunt. Das Tuchmuster ist
 *     nicht glatt, Teller und Serviette sind glatt, aber ohne Schrift.
 *  2. Maske auf Blöcke verkleinern, Löcher (Schrift, QR) füllen, zusammenhängende Flächen suchen, jede nach Fläche und
 *     Schriftanteil bewerten. Die beste Fläche ist der Bon.
 *  3. Konvexe Hülle → kleinstes umschließendes Rechteck (Winkel −45° bis 45°) → vier Ecken (Perspektive bleibt erhalten).
 *  4. Vierpunkt-Entzerrung (Homographie), Hochskalieren auf etwa 1500 px Breite, Licht ausgleichen.
 */
window.BonBild = (() => {
  const laden = (daten) => new Promise((ok, fehler) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => fehler(new Error('Foto nicht lesbar')); i.src = daten; });

  function integral(werte, w, h) {
    const I = new Float64Array((w + 1) * (h + 1));
    for (let j = 0; j < h; j++) { let z = 0; for (let i = 0; i < w; i++) { z += werte[j * w + i]; I[(j + 1) * (w + 1) + i + 1] = I[j * (w + 1) + i + 1] + z; } }
    return I;
  }
  const kasten = (I, w, h, i, j, r) => { const a = Math.max(0, j - r), b = Math.min(h, j + r + 1), l = Math.max(0, i - r), q = Math.min(w, i + r + 1); return (I[b * (w + 1) + q] - I[a * (w + 1) + q] - I[b * (w + 1) + l] + I[a * (w + 1) + l]) / ((b - a) * (q - l)); };

  // Maske „glatt, hell, unbunt“ auf Blöcken (BL × BL Pixel des verkleinerten Bildes)
  function maske(img, maxSeite = 1400, BL = 4) {
    const f = Math.min(1, maxSeite / Math.max(img.width, img.height));
    const w = Math.round(img.width * f), h = Math.round(img.height * f);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g2 = c.getContext('2d', { willReadFrequently: true }); g2.drawImage(img, 0, 0, w, h);
    const p = g2.getImageData(0, 0, w, h).data, n = w * h;
    const y = new Float32Array(n), y2 = new Float32Array(n), sat = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const r = p[i * 4], g = p[i * 4 + 1], b = p[i * 4 + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const v = 0.299 * r + 0.587 * g + 0.114 * b; y[i] = v; y2[i] = v * v; sat[i] = mx ? (mx - mn) / mx : 0;
    }
    const I1 = integral(y, w, h), I2 = integral(y2, w, h);
    const sd = new Float32Array(n);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const m = kasten(I1, w, h, i, j, 3), m2 = kasten(I2, w, h, i, j, 3); sd[j * w + i] = Math.sqrt(Math.max(0, m2 - m * m)); }
    const sortiert = Float32Array.from(y).sort(); const p98 = sortiert[Math.floor(n * 0.98)];
    return { f, w, h, y, sd, sat, p98, BL, canvas: c };
  }
  function blockMaske(m, sdT, hell) {
    const { w, h, y, sd, sat, BL } = m, bw = Math.ceil(w / BL), bh = Math.ceil(h / BL), out = new Uint8Array(bw * bh);
    for (let bj = 0; bj < bh; bj++) for (let bi = 0; bi < bw; bi++) {
      let ok = 0, tot = 0;
      for (let j = bj * BL; j < Math.min(h, bj * BL + BL); j++) for (let i = bi * BL; i < Math.min(w, bi * BL + BL); i++) { const k = j * w + i; tot++; if (sd[k] < sdT && sat[k] < 0.22 && y[k] > hell) ok++; }
      out[bj * bw + bi] = ok >= tot * 0.6 ? 1 : 0;
    }
    return { bw, bh, d: out };
  }
  function morph(d, bw, bh, dilate) {
    const o = new Uint8Array(d.length);
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) {
      let v = dilate ? 0 : 1;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const a = i + di, b = j + dj; const x = a < 0 || b < 0 || a >= bw || b >= bh ? (dilate ? 0 : 1) : d[b * bw + a];
        if (dilate) { if (x) v = 1; } else if (!x) v = 0;
      }
      o[j * bw + i] = v;
    }
    return o;
  }
  function fuelleLoecher(d, bw, bh) {
    const aussen = new Uint8Array(d.length), stapel = [];
    const start = (i, j) => { const k = j * bw + i; if (!d[k] && !aussen[k]) { aussen[k] = 1; stapel.push(k); } };
    for (let i = 0; i < bw; i++) { start(i, 0); start(i, bh - 1); } for (let j = 0; j < bh; j++) { start(0, j); start(bw - 1, j); }
    while (stapel.length) {
      const k = stapel.pop(), i = k % bw, j = (k / bw) | 0;
      if (i > 0) start(i - 1, j); if (i < bw - 1) start(i + 1, j); if (j > 0) start(i, j - 1); if (j < bh - 1) start(i, j + 1);
    }
    const o = new Uint8Array(d.length); for (let k = 0; k < d.length; k++) o[k] = aussen[k] ? 0 : 1; return o;
  }
  function flaechen(d, bw, bh) {
    const lab = new Int32Array(d.length), liste = []; let nr = 0;
    for (let s = 0; s < d.length; s++) {
      if (!d[s] || lab[s]) continue;
      nr++; const st = [s]; lab[s] = nr; const zellen = [];
      while (st.length) {
        const k = st.pop(); zellen.push(k); const i = k % bw, j = (k / bw) | 0;
        if (i > 0 && d[k - 1] && !lab[k - 1]) { lab[k - 1] = nr; st.push(k - 1); }
        if (i < bw - 1 && d[k + 1] && !lab[k + 1]) { lab[k + 1] = nr; st.push(k + 1); }
        if (j > 0 && d[k - bw] && !lab[k - bw]) { lab[k - bw] = nr; st.push(k - bw); }
        if (j < bh - 1 && d[k + bw] && !lab[k + bw]) { lab[k + bw] = nr; st.push(k + bw); }
      }
      liste.push({ nr, zellen });
    }
    return liste;
  }
  function huelle(pts) {
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const kreuz = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const unten = []; for (const p of pts) { while (unten.length >= 2 && kreuz(unten[unten.length - 2], unten[unten.length - 1], p) <= 0) unten.pop(); unten.push(p); }
    const oben = []; for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (oben.length >= 2 && kreuz(oben[oben.length - 2], oben[oben.length - 1], p) <= 0) oben.pop(); oben.push(p); }
    unten.pop(); oben.pop(); return unten.concat(oben);
  }
  // kleinstes Rechteck im Winkelbereich −45° … 45°, dann vier Ecken als Extrempunkte im gedrehten Rahmen
  function viereck(h) {
    let best = null;
    for (let gr = -45; gr < 45; gr += 0.5) {
      const t = (gr * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t);
      let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
      for (const [x, y] of h) { const u = x * c + y * s, v = -x * s + y * c; if (u < u0) u0 = u; if (u > u1) u1 = u; if (v < v0) v0 = v; if (v > v1) v1 = v; }
      const a = (u1 - u0) * (v1 - v0); if (!best || a < best.a) best = { a, gr, c, s };
    }
    const { c, s } = best, uv = h.map(([x, y]) => [x * c + y * s, -x * s + y * c, x, y]);
    const wahl = (fn) => uv.reduce((b, p) => (fn(p) < fn(b) ? p : b));
    const tl = wahl((p) => p[0] + p[1]), tr = wahl((p) => -(p[0] - p[1])), br = wahl((p) => -(p[0] + p[1])), bl = wahl((p) => p[0] - p[1]);
    return { winkel: best.gr, ecken: [tl, tr, br, bl].map((p) => [p[2], p[3]]) };
  }
  // Findet den Bon: liefert Ecken (TL, TR, BR, BL) in Pixeln des Originalfotos oder null
  function finde(img) {
    const m = maske(img);
    const hell = Math.max(110, 0.62 * m.p98);
    for (const sdT of [4.5, 8, 13]) {
      const bm = blockMaske(m, sdT, hell);
      let d = morph(morph(bm.d, bm.bw, bm.bh, true), bm.bw, bm.bh, true);
      d = morph(morph(d, bm.bw, bm.bh, false), bm.bw, bm.bh, false);
      d = fuelleLoecher(d, bm.bw, bm.bh);
      const alle = flaechen(d, bm.bw, bm.bh), gesamt = bm.bw * bm.bh;
      let beste = null;
      for (const fl of alle) {
        const anteil = fl.zellen.length / gesamt; if (anteil < 0.02 || anteil > 0.85) continue;
        // Schriftanteil: dunkle Pixel (< 110) in den Blöcken der Fläche
        let dunkel = 0, px = 0; const BL = m.BL;
        for (const k of fl.zellen) { const bi = k % bm.bw, bj = (k / bm.bw) | 0; for (let j = bj * BL; j < Math.min(m.h, bj * BL + BL); j++) for (let i = bi * BL; i < Math.min(m.w, bi * BL + BL); i++) { px++; if (m.y[j * m.w + i] < 110) dunkel++; } }
        const schrift = dunkel / px; if (schrift < 0.01 || schrift > 0.4) continue;
        // Rechteckigkeit: Fläche / Fläche des kleinsten Rechtecks
        const rand = []; for (const k of fl.zellen) { const bi = k % bm.bw, bj = (k / bm.bw) | 0; if (!bi || !bj || bi === bm.bw - 1 || bj === bm.bh - 1 || !d[k - 1] || !d[k + 1] || !d[k - bm.bw] || !d[k + bm.bw]) rand.push([bi + 0.5, bj + 0.5]); }
        if (rand.length < 8) continue;
        const hu = huelle(rand), vq = viereck(hu);
        const flH = Math.abs(hu.reduce((a, p, i) => { const q = hu[(i + 1) % hu.length]; return a + (p[0] * q[1] - q[0] * p[1]); }, 0)) / 2;
        const fuellung = fl.zellen.length / Math.max(1, flH);
        const wert = fl.zellen.length * Math.min(1, schrift / 0.03) * (fuellung > 0.8 ? 1 : 0.3);
        if (!beste || wert > beste.wert) beste = { wert, vq, anteil, schrift, fuellung };
      }
      if (beste) {
        const k = m.BL / m.f; // Blockkoordinate → Originalpixel
        return { ecken: beste.vq.ecken.map(([x, y]) => [x * k, y * k]), winkel: beste.vq.winkel, anteil: beste.anteil, schrift: beste.schrift, sdT };
      }
    }
    return null;
  }

  // Homographie Ausgabe(0,0 … W,H) → Quelle (vier Punkte); Gauß-Verfahren für 8 Unbekannte
  function homographie(q, W, H) {
    const z = [[0, 0], [W, 0], [W, H], [0, H]], A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = z[i], [u, v] = q[i];
      A.push([x, y, 1, 0, 0, 0, -x * u, -y * u]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -x * v, -y * v]); b.push(v);
    }
    for (let i = 0; i < 8; i++) {
      let p = i; for (let j = i + 1; j < 8; j++) if (Math.abs(A[j][i]) > Math.abs(A[p][i])) p = j;
      [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
      for (let j = i + 1; j < 8; j++) { const f = A[j][i] / A[i][i]; for (let k = i; k < 8; k++) A[j][k] -= f * A[i][k]; b[j] -= f * b[i]; }
    }
    const x = new Array(8).fill(0);
    for (let i = 7; i >= 0; i--) { let s = b[i]; for (let k = i + 1; k < 8; k++) s -= A[i][k] * x[k]; x[i] = s / A[i][i]; }
    return x;
  }
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  function entzerre(img, ecken, zielBreite = 1300) {
    const [tl, tr, br, bl] = ecken;
    let Wq = Math.max(dist(tl, tr), dist(bl, br)), Hq = Math.max(dist(tl, bl), dist(tr, br));
    const lang = Math.max(Wq, Hq), kurz = Math.min(Wq, Hq);
    // Skalierung: die kurze Seite (Bonbreite) auf etwa zielBreite, höchstens 3,5-fach, nie kleiner als 1
    const k = Math.max(1, Math.min(3.5, zielBreite / kurz));
    let W = Math.round(Wq * k), H = Math.round(Hq * k);
    const maxPx = 14e6; if (W * H > maxPx) { const r = Math.sqrt(maxPx / (W * H)); W = Math.round(W * r); H = Math.round(H * r); }
    const quelle = document.createElement('canvas'); quelle.width = img.width; quelle.height = img.height;
    const qg = quelle.getContext('2d', { willReadFrequently: true }); qg.drawImage(img, 0, 0);
    const sd = qg.getImageData(0, 0, img.width, img.height).data, sw = img.width, sh = img.height;
    const hg = homographie(ecken, W, H);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const cg = c.getContext('2d'), out = cg.createImageData(W, H), od = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const nenner = hg[6] * x + hg[7] * y + 1, u = (hg[0] * x + hg[1] * y + hg[2]) / nenner, v = (hg[3] * x + hg[4] * y + hg[5]) / nenner;
      const o = (y * W + x) * 4;
      if (u < 0 || v < 0 || u >= sw - 1 || v >= sh - 1) { od[o] = od[o + 1] = od[o + 2] = 255; od[o + 3] = 255; continue; }
      const x0 = u | 0, y0 = v | 0, fx = u - x0, fy = v - y0, i00 = (y0 * sw + x0) * 4, i10 = i00 + 4, i01 = i00 + sw * 4, i11 = i01 + 4;
      for (let ch = 0; ch < 3; ch++) od[o + ch] = sd[i00 + ch] * (1 - fx) * (1 - fy) + sd[i10 + ch] * fx * (1 - fy) + sd[i01 + ch] * (1 - fx) * fy + sd[i11 + ch] * fx * fy;
      od[o + 3] = 255;
    }
    cg.putImageData(out, 0, 0);
    return { canvas: c, skala: k, breite: W, hoehe: H };
  }
  // Rest-Schräglage: Nach der Vierpunkt-Entzerrung laufen die Zeilen oft noch schief, und zwar oben anders als unten (Ecken
  // ungenau, Papier gewölbt); die Spalten bleiben senkrecht. Darum Scherung, die sich mit der Höhe ändert:
  // je Streifen den Winkel (−25° … 25°) mit dem schärfsten Zeilenprofil der dunklen Pixel messen, eine Gerade durch die
  // Streifenwinkel legen (nach Gewicht), das Bild damit zeilenweise nachziehen. Zweimal, weil der erste Schritt die Höhen verschiebt.
  function streifenWinkel(c) {
    const f = Math.min(1, 520 / c.width), w = Math.round(c.width * f), h = Math.round(c.height * f);
    const k = document.createElement('canvas'); k.width = w; k.height = h; const kg = k.getContext('2d', { willReadFrequently: true }); kg.drawImage(c, 0, 0, w, h);
    const p = kg.getImageData(0, 0, w, h).data, hoehe = Math.max(160, Math.round(w * 0.5)), schritt = Math.round(hoehe / 2), erg = [];
    for (let y0 = 0; y0 + hoehe <= h + schritt / 2; y0 += schritt) {
      const pts = [], y1 = Math.min(h, y0 + hoehe);
      for (let j = y0; j < y1; j++) for (let i = Math.round(w * 0.1); i < Math.round(w * 0.95); i++) { const o = (j * w + i) * 4; if (0.299 * p[o] + 0.587 * p[o + 1] + 0.114 * p[o + 2] < 100) pts.push(i, j); }
      if (pts.length < 300) continue;
      let bw = 0, bv = -1, summe = 0, n = 0;
      for (let gr = -25; gr <= 25; gr += 0.5) {
        const m = Math.tan((gr * Math.PI) / 180), bins = new Map();
        for (let q = 0; q < pts.length; q += 2) { const r = Math.round(pts[q + 1] - pts[q] * m); bins.set(r, (bins.get(r) || 0) + 1); }
        let a = 0, a2 = 0; for (const v of bins.values()) { a += v; a2 += v * v; }
        const v = a2 / bins.size - (a / bins.size) ** 2; summe += v; n++; if (v > bv) { bv = v; bw = gr; }
      }
      if (bv > 1.6 * (summe / n)) erg.push({ y: ((y0 + y1) / 2) / f, m: Math.tan((bw * Math.PI) / 180), g: pts.length * (bv / (summe / n)) });
    }
    return erg;
  }
  function gerade(c) {
    let aktuell = c, summe = [];
    for (let durchgang = 0; durchgang < 2; durchgang++) {
      const sw = streifenWinkel(aktuell);
      if (sw.length < 2 && !(sw.length === 1)) break;
      // gewichtete Gerade m(y) = a + b·y
      let W = 0, Sy = 0, Sm = 0, Syy = 0, Sym = 0;
      for (const e of sw) { W += e.g; Sy += e.g * e.y; Sm += e.g * e.m; Syy += e.g * e.y * e.y; Sym += e.g * e.y * e.m; }
      const det = W * Syy - Sy * Sy; let a, b;
      if (sw.length < 2 || Math.abs(det) < 1e-6) { a = Sm / W; b = 0; } else { b = (W * Sym - Sy * Sm) / det; a = (Sm - b * Sy) / W; }
      const H = aktuell.height, Wd = aktuell.width, mAt = (y) => a + b * y;
      const mmax = Math.max(Math.abs(mAt(0)), Math.abs(mAt(H)));
      if (mmax < 0.007) break; // unter 0,4°: nichts zu tun
      const off = Math.ceil(Math.min(mmax, 0.6) * Wd), HH = H + 2 * off;
      const sg = aktuell.getContext('2d', { willReadFrequently: true }), sd = sg.getImageData(0, 0, Wd, H).data;
      const o = document.createElement('canvas'); o.width = Wd; o.height = HH;
      const og = o.getContext('2d'), out = og.createImageData(Wd, HH), od = out.data;
      for (let y = 0; y < HH; y++) {
        const ys0 = y - off, m = Math.max(-0.6, Math.min(0.6, mAt(Math.max(0, Math.min(H, ys0)))));
        for (let x = 0; x < Wd; x++) {
          const v = ys0 + x * m, p = (y * Wd + x) * 4;
          if (v < 0 || v >= H - 1) { od[p] = od[p + 1] = od[p + 2] = 255; od[p + 3] = 255; continue; }
          const y0 = v | 0, fy = v - y0, i0 = (y0 * Wd + x) * 4, i1 = i0 + Wd * 4;
          for (let ch = 0; ch < 3; ch++) od[p + ch] = sd[i0 + ch] * (1 - fy) + sd[i1 + ch] * fy;
          od[p + 3] = 255;
        }
      }
      og.putImageData(out, 0, 0); aktuell = o; summe.push([a, b]);
    }
    return { canvas: aktuell, schritte: summe };
  }
  return { laden, finde, entzerre, gerade, maske, huelle, viereck };
})();
