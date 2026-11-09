'use strict';
/* Fasan Karte – neuronale Texterkennung im Handy. MPL-2.0
 * Modelle: PaddleOCR PP-OCRv5 (Apache-2.0), Erkennung „mobile det“ und Latein-Leser (32 Sprachen, u. a. DE, PT, ES, FR, IT, EN),
 * als ONNX aus ppu-paddle-ocr-models, ausgeführt mit onnxruntime-web (MIT). Dateien: vendor/paddle/ (siehe DATEIEN.txt).
 * Parameter aus der offiziellen PaddleOCR-Konfiguration (configs/det/PP-OCRv5/PP-OCRv5_mobile_det.yml,
 * configs/rec/PP-OCRv5/multi_language/latin_PP-OCRv5_mobile_rec.yml, abgerufen 29.10.2026):
 *  - Erkennung: Bild BGR, (x/255 − Mittel)/Streuung mit Mittel 0,485/0,456/0,406 und Streuung 0,229/0,224/0,225,
 *    Seiten auf Vielfache von 32; Nachbearbeitung DB: Schwelle 0,3, Kasten-Schwelle 0,6, Aufweitung 1,5.
 *  - Lesen: Höhe 48 px, Breite nach Seitenverhältnis, (x/255 − 0,5)/0,5; CTC mit Leerzeichen-Klasse (use_space_char).
 * Zusätzlich liefert jedes Zeichen die zweitbeste Lesung mit Wahrscheinlichkeit: Daraus baut bon.js Alternativen für
 * unsichere Ziffern, die Summenprüfung wählt dann die passende.
 * Das Foto verlässt das Gerät nie; ohne Threads (GitHub Pages kann keine COOP/COEP-Header setzen).
 */
(function (G) {
const imArbeiter = typeof document === 'undefined';
// Leinwand für Bildausschnitte: OffscreenCanvas (auch im Web Worker), sonst normales Canvas
const neueLeinwand = () => (typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : neueLeinwand());
const motor = (() => {
  const basis = () => new URL('vendor/paddle/', G.location.href).href;
  let laedt = null, M = null;

  function skript(src) {
    return new Promise((ok, fehler) => {
      if (G.ort) { ok(); return; }
      if (imArbeiter) { try { G.importScripts(src); ok(); } catch (e) { fehler(new Error('onnxruntime fehlt')); } return; }
      const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => fehler(new Error('onnxruntime fehlt'));
      document.head.append(s);
    });
  }
  // Datei laden mit Fortschritt (Modelle sind 5–8 MB, beim ersten Mal sichtbar)
  async function holen(url, melde, anteil, start) {
    const r = await fetch(url); if (!r.ok) throw new Error(`${url}: ${r.status}`);
    const gesamt = +r.headers.get('content-length') || 0;
    if (!r.body || !gesamt || !melde) return new Uint8Array(await r.arrayBuffer());
    const leser = r.body.getReader(), teile = []; let n = 0;
    for (;;) { const { done, value } = await leser.read(); if (done) break; teile.push(value); n += value.length; melde({ status: 'loading paddle', progress: start + anteil * Math.min(1, n / gesamt) }); }
    const out = new Uint8Array(n); let o = 0; for (const t of teile) { out.set(t, o); o += t.length; } return out;
  }
  async function lade(melde) {
    if (M) return M;
    if (!laedt) {
      laedt = (async () => {
        await skript(basis() + 'ort.wasm.min.js');
        const ort = G.ort;
        ort.env.wasm.wasmPaths = basis(); ort.env.wasm.numThreads = 1;
        const [det, rec, dictText] = await Promise.all([
          holen(basis() + 'det.onnx', melde, 0.4, 0), holen(basis() + 'rec-latin.onnx', melde, 0.6, 0.4),
          fetch(basis() + 'dict-latin.txt').then((r) => { if (!r.ok) throw new Error('Wörterbuch fehlt'); return r.text(); })]);
        const opt = { executionProviders: ['wasm'], graphOptimizationLevel: 'all' };
        const sDet = await ort.InferenceSession.create(det, opt), sRec = await ort.InferenceSession.create(rec, opt);
        // Wörterbuch: eine Zeile je Zeichen; leere Zeilen am Ende weg. Klassen = Leer-Klasse + Zeichen + Leerzeichen.
        const zeichen = dictText.replace(/\r/g, '').split('\n'); while (zeichen.length && zeichen[zeichen.length - 1] === '') zeichen.pop();
        M = { ort, sDet, sRec, zeichen, klassen: null };
        return M;
      })().catch((e) => { laedt = null; throw e; });
    }
    return laedt;
  }
  async function verfuegbar() {
    try { const r = await fetch(basis() + 'DATEIEN.txt', { method: 'HEAD' }); return r.ok; } catch (e) { return false; }
  }

  // ---------- Erkennung (wo steht Text?) ----------
  function bgrTensor(g, w, h, mittel, streu) {
    const p = g.getImageData(0, 0, w, h).data, n = w * h, t = new Float32Array(3 * n);
    // Reihenfolge B, G, R wie in PaddleOCR (cv2 liest BGR); Mittel/Streuung in derselben Reihenfolge angewendet
    for (let i = 0, j = 0; i < n; i++, j += 4) {
      t[i] = (p[j + 2] / 255 - mittel[0]) / streu[0];
      t[n + i] = (p[j + 1] / 255 - mittel[1]) / streu[1];
      t[2 * n + i] = (p[j] / 255 - mittel[2]) / streu[2];
    }
    return t;
  }
  // Größe für die Erkennung: höchstens ~2,4 Mio. Pixel und 2560 px lange Seite (Speicher im Handy), mindestens 32
  // dehnen > 1: Bild für die Erkennung senkrecht strecken. Kassenbons in Festbreitenschrift haben weite Zeichen- und enge
  // Zeilenabstände; dann verbindet die Texterkennung übereinander stehende Ziffern zu senkrechten „Zeilen“ (Spalte „1 2 1 0 …“).
  // Gestreckt wird der Zeilenabstand größer als der Zeichenabstand und jede Zeile wird wieder ein eigener Kasten.
  function detGroesse(w, h, dehnen = 1) {
    let f = Math.min(1, 2560 / Math.max(w, h * dehnen), Math.sqrt(2.4e6 / (w * h * dehnen)));
    const ww = Math.max(32, Math.round((w * f) / 32) * 32), hh = Math.max(32, Math.round((h * f * dehnen) / 32) * 32);
    return { ww, hh, fx: ww / w, fy: hh / h };
  }
  async function finde(leinwand, opt = {}) {
    const m = await lade(opt.melde);
    let ww, hh, fx, fy;
    if (opt.skala) { // feste Maßstäbe [x, y] (Ausschnitt einer Betragsspalte, siehe woerter)
      ww = Math.max(32, Math.round((leinwand.width * opt.skala[0]) / 32) * 32); hh = Math.max(32, Math.round((leinwand.height * opt.skala[1]) / 32) * 32);
      fx = ww / leinwand.width; fy = hh / leinwand.height;
    } else ({ ww, hh, fx, fy } = detGroesse(leinwand.width, leinwand.height, opt.dehnen || 1));
    const c = neueLeinwand(); c.width = ww; c.height = hh;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(leinwand, 0, 0, ww, hh);
    const x = new m.ort.Tensor('float32', bgrTensor(g, ww, hh, [0.485, 0.456, 0.406], [0.229, 0.224, 0.225]), [1, 3, hh, ww]);
    const aus = await m.sDet.run({ [m.sDet.inputNames[0]]: x });
    const karte = aus[m.sDet.outputNames[0]].data; // 1×1×hh×ww, Wahrscheinlichkeit „Text“
    return kaesten(karte, ww, hh, opt).map((k) => ({ ...k, x0: k.x0 / fx, x1: k.x1 / fx, y0: k.y0 / fy, y1: k.y1 / fy, neig: k.neig == null ? null : (k.neig * fx) / fy }));
  }
  // DB-Nachbearbeitung: Schwelle 0,3 → zusammenhängende Flächen (4er-Nachbarschaft) → mittlere Wahrscheinlichkeit ≥ 0,6 →
  // Rechteck aufweiten um Fläche × 1,5 / Umfang (wie „unclip“ im Original, für achsenparallele Rechtecke).
  // Der Bon ist vorher entzerrt und gerade gedreht (bonbild.js), daher genügen achsenparallele Kästen.
  function kaesten(p, w, h, opt) {
    const schwelle = opt.schwelle || 0.3, kastenSchwelle = opt.kastenSchwelle || 0.6, auf = opt.aufweiten || 1.5;
    const marke = new Int32Array(w * h), stapel = new Int32Array(w * h), out = [];
    let nr = 0;
    for (let s = 0; s < w * h; s++) {
      if (marke[s] || p[s] <= schwelle) continue;
      nr++; let oben = 0; stapel[oben++] = s; marke[s] = nr;
      let x0 = w, y0 = h, x1 = 0, y1 = 0, summe = 0, anzahl = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
      while (oben) {
        const i = stapel[--oben], x = i % w, y = (i - x) / w;
        summe += p[i]; anzahl++; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (x > 0 && !marke[i - 1] && p[i - 1] > schwelle) { marke[i - 1] = nr; stapel[oben++] = i - 1; }
        if (x < w - 1 && !marke[i + 1] && p[i + 1] > schwelle) { marke[i + 1] = nr; stapel[oben++] = i + 1; }
        if (y > 0 && !marke[i - w] && p[i - w] > schwelle) { marke[i - w] = nr; stapel[oben++] = i - w; }
        if (y < h - 1 && !marke[i + w] && p[i + w] > schwelle) { marke[i + w] = nr; stapel[oben++] = i + w; }
      }
      const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
      if (anzahl < 12 || Math.min(bw, bh) < 3) continue;
      const guete = summe / anzahl; if (guete < kastenSchwelle) continue;
      const d = (bw * bh * auf) / (2 * (bw + bh));
      // Neigung der Textzeile aus den Momenten der Fläche (Hauptachse); nur bei langen Flächen verlässlich.
      // Damit bleiben Name und Preis auch bei schräg fotografierten Bons in derselben Zeile (bon.js, zeilenAus).
      const mx = sx / anzahl, my = sy / anzahl, cxx = sxx / anzahl - mx * mx, cyy = syy / anzahl - my * my, cxy = sxy / anzahl - mx * my;
      const th = 0.5 * Math.atan2(2 * cxy, cxx - cyy), neig = bw > 2.5 * bh && Math.abs(th) < 0.35 ? Math.tan(th) : null;
      out.push({ x0: Math.max(0, x0 - d), y0: Math.max(0, y0 - d), x1: Math.min(w, x1 + 1 + d), y1: Math.min(h, y1 + 1 + d), guete, neig });
    }
    return out;
  }

  // ---------- Lesen (was steht im Kasten?) ----------
  async function liesKasten(leinwand, k, m) {
    const kh = k.y1 - k.y0, kw = k.x1 - k.x0; if (kh < 4 || kw < 4) return null;
    const H = 48, W = Math.max(16, Math.min(1600, Math.round((H * kw) / kh)));
    const c = neueLeinwand(); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true }); g.imageSmoothingQuality = 'high'; g.drawImage(leinwand, k.x0, k.y0, kw, kh, 0, 0, W, H);
    const t = bgrTensor(g, W, H, [0.5, 0.5, 0.5], [0.5, 0.5, 0.5]);
    const aus = await m.sRec.run({ [m.sRec.inputNames[0]]: new m.ort.Tensor('float32', t, [1, 3, H, W]) });
    const o = aus[m.sRec.outputNames[0]], [, T, C] = o.dims, d = o.data;
    if (!m.klassen) {
      // Klassen an die Ausgabe anpassen: Leer-Klasse vorn, Leerzeichen hinten (falls die Ausgabe eine Klasse mehr hat)
      // (die Latein-Datei aus ppu-paddle-ocr-models beginnt schon mit einer leeren Zeile für die Leer-Klasse)
      m.klassen = m.zeichen[0] === '' ? m.zeichen.slice() : ['', ...m.zeichen]; if (C === m.klassen.length + 1) m.klassen.push(' ');
      if (C !== m.klassen.length) console.warn('Wörterbuch passt nicht zum Modell', C, m.klassen.length);
    }
    const zeichen = []; let vorher = 0, summe = 0;
    for (let i = 0; i < T; i++) {
      let b1 = 0, p1 = -1, b2 = 0, p2 = -1; const o0 = i * C;
      for (let j = 0; j < C; j++) { const v = d[o0 + j]; if (v > p1) { b2 = b1; p2 = p1; b1 = j; p1 = v; } else if (v > p2) { b2 = j; p2 = v; } }
      if (b1 !== 0 && b1 !== vorher) { zeichen.push({ z: m.klassen[b1] || '', p: p1, alt: b2 ? m.klassen[b2] || '' : '', p2, pos: i / T }); summe += p1; }
      vorher = b1;
    }
    const text = zeichen.map((z) => z.z).join('');
    return { t: text.trim(), c: zeichen.length ? (summe / zeichen.length) * 100 : 0, zeichen };
  }
  // Ganze Seite: Kästen finden, jeden lesen. Ergebnis wie Tesseract-Wörter: { t, c (0–100), b: {x0,y0,x1,y1}, zeichen }
  async function woerter(leinwand, opt = {}) {
    const m = await lade(opt.melde);
    let k = await finde(leinwand, opt); const out = [];
    // Festbreitenschrift mit engem Zeilenabstand (deutsche Supermarkt-Bons): übereinander stehende Ziffern/Steuerbuchstaben
    // werden zu hohen, schmalen Kästen verbunden (Test 30.10., REWE: Spalte „1 2 1 0 0 0 1 0“ als ein Kasten, Beträge fehlten).
    // Dann die Erkennung auf einem senkrecht gestreckten Bild wiederholen und nur diese Bereiche durch deren Kästen ersetzen
    // (gestreckt trennen sich die Zeilen; doppelt hohe Schrift wie „SUMME“ zerfällt dort aber, darum nicht überall).
    if (opt.dehnen == null) {
      const fl = (q) => Math.max(1, (q.x1 - q.x0) * (q.y1 - q.y0));
      const schnitt = (q, r) => Math.max(0, Math.min(q.x1, r.x1) - Math.max(q.x0, r.x0)) * Math.max(0, Math.min(q.y1, r.y1) - Math.max(q.y0, r.y0));
      const hs0 = k.filter((q) => q.x1 - q.x0 > 1.5 * (q.y1 - q.y0)).map((q) => q.y1 - q.y0).sort((a, b) => a - b), med0 = hs0.length ? hs0[hs0.length >> 1] : 0;
      const hoch = med0 ? k.filter((q) => q.y1 - q.y0 > 2.2 * med0 && q.y1 - q.y0 > 0.8 * (q.x1 - q.x0)) : [];
      if (hoch.length) {
        const k2 = await finde(leinwand, { ...opt, dehnen: 2.2 });
        let neu = k2.filter((q) => hoch.some((t) => schnitt(q, t) > 0.25 * fl(q)));
        // oben/unten anschließende Kästen derselben Spalte mitnehmen (die senkrechte Fläche beginnt oft erst in der 2. Zeile)
        const sx0 = Math.min(...hoch.map((q) => q.x0)), sx1 = Math.max(...hoch.map((q) => q.x1));
        for (let mehr = neu.length > 0; mehr;) {
          mehr = false; const oben = Math.min(...neu.map((q) => q.y0)), unten = Math.max(...neu.map((q) => q.y1)), tol = 0.05 * med0;
          for (const q of k2) {
            if (neu.includes(q) || Math.min(q.x1, sx1) - Math.max(q.x0, sx0) < 0.5 * (q.x1 - q.x0)) continue;
            if ((q.y0 < oben && q.y1 >= oben - tol) || (q.y1 > unten && q.y0 <= unten + tol)) { neu.push(q); mehr = true; }
          }
        }
        // auch gestreckt bleiben manchmal zwei Zeilen verbunden (Kopf „EUR“ über dem ersten Betrag): solche hohen Kästen am
        // Zeilenraster der gut getrennten Nachbarn teilen (Mitte = Nachbarmitte + k × Zeilenabstand)
        const hN = neu.map((q) => q.y1 - q.y0).sort((a, b) => a - b)[neu.length >> 1] || 0;
        const gut = neu.filter((q) => q.y1 - q.y0 < 1.5 * hN).sort((a, b) => a.y0 + a.y1 - b.y0 - b.y1);
        const abst = gut.slice(1).map((q, i) => (q.y0 + q.y1 - gut[i].y0 - gut[i].y1) / 2).filter((d) => d > 0.5 * hN && d < 1.6 * hN).sort((a, b) => a - b);
        const p = abst[abst.length >> 1];
        if (p) neu = neu.flatMap((t) => {
          if (t.y1 - t.y0 < 1.5 * hN) return [t];
          const g = gut.reduce((b, q) => (!b || Math.abs(q.y0 + q.y1 - t.y0 - t.y1) < Math.abs(b.y0 + b.y1 - t.y0 - t.y1) ? q : b), null); if (!g) return [];
          const out2 = [], c0 = (g.y0 + g.y1) / 2;
          for (let j = Math.ceil((t.y0 + 0.3 * p - c0) / p); c0 + j * p <= t.y1 - 0.3 * p; j++) { const c = c0 + j * p; out2.push({ ...t, y0: c - hN / 2, y1: c + hN / 2, geteiltRaster: true }); }
          return out2;
        });
        if (neu.length >= hoch.length) k = k.filter((q) => !hoch.includes(q) && !neu.some((n) => schnitt(q, n) > 0.3 * fl(q))).concat(neu);
      }
    }
    // Dicht gedruckte Bons: aufgeweitete Kästen (unclip) reichen in die Nachbarzeilen, besonders auf vergrößerten Bildern
    // (Test 30.10.: Kästen 90 px hoch bei 46 px Zeilenabstand → Lesung aus zwei Zeilen gemischt). Höhe jedes Kastens auf
    // den Abstand zur nächsten Zeile darüber/darunter (mit waagrechter Überlappung) begrenzen.
    for (const q of k) {
      const cy = (q.y0 + q.y1) / 2; let ab = Infinity;
      for (const r of k) {
        if (r === q) continue;
        const ueber = Math.min(q.x1, r.x1) - Math.max(q.x0, r.x0); if (ueber < 0.3 * Math.min(q.x1 - q.x0, r.x1 - r.x0)) continue;
        const d = Math.abs((r.y0 + r.y1) / 2 - cy); if (d > 2 && d < ab) ab = d;
      }
      if (ab < Infinity && q.y1 - q.y0 > 1.12 * ab) { const hh = Math.max(ab * 1.04, 8) / 2; q.y0 = cy - hh; q.y1 = cy + hh; q.begrenzt = true; }
    }
    // Typische Zeilenhöhe (Median der breiten Kästen). Dicht gedruckte Bons: die Erkennung verschmilzt manchmal zwei
    // übereinander stehende Beträge zu einem hohen Kasten, der dann Unsinn liest (Test 29.10., „2,50“ → „1,50“).
    const hs = k.filter((q) => q.x1 - q.x0 > 1.5 * (q.y1 - q.y0)).map((q) => q.y1 - q.y0).sort((a, b) => a - b);
    const med = hs.length ? hs[hs.length >> 1] : 0;
    for (let i = 0; i < k.length; i++) {
      const q = k[i], h = q.y1 - q.y0;
      let r = await liesKasten(leinwand, q, m), teile = null;
      // Zu hoher Kasten mit mäßiger Sicherheit: in n gleich hohe Streifen teilen und einzeln lesen; nur übernehmen, wenn die
      // Teile sicherer gelesen werden (große Schrift wie „TOTAL“ liest ganz sicherer und bleibt ganz)
      if (med && h > 1.45 * med && (!r || r.c < 93)) {
        const n = Math.max(2, Math.round(h / med)), sh = h / n, liste = [];
        for (let j = 0; j < n; j++) { const t = { x0: q.x0, x1: q.x1, y0: q.y0 + j * sh - sh * 0.08, y1: q.y0 + (j + 1) * sh + sh * 0.08 }; const l = await liesKasten(leinwand, t, m); if (l && l.t) liste.push({ l, t }); }
        const mittel = liste.length ? liste.reduce((a, x) => a + x.l.c, 0) / liste.length : 0;
        if (liste.length >= 2 && mittel > (r ? r.c : 0) + 3) teile = liste;
      }
      if (teile) for (const { l, t } of teile) out.push({ t: l.t, c: l.c, b: t, zeichen: l.zeichen, kg: q.guete, neig: q.neig, geteilt: true });
      else if (r && r.t) out.push({ t: r.t, c: r.c, b: { x0: q.x0, y0: q.y0, x1: q.x1, y1: q.y1 }, zeichen: r.zeichen, kg: q.guete, neig: q.neig });
      if (opt.melde && (i % 4 === 0 || i === k.length - 1)) opt.melde({ status: 'recognizing paddle', progress: (i + 1) / k.length });
    }
    return out;
  }
  // Liegt der Text quer? Erkennung auf einer kleinen Fassung: Textzeilen sind breite Kästen; überwiegen hohe, schmale Kästen,
  // steht der Bon um 90° gedreht im Bild.
  async function hochkant(leinwand) {
    const f = Math.min(1, 960 / Math.max(leinwand.width, leinwand.height)), c = neueLeinwand();
    c.width = Math.round(leinwand.width * f); c.height = Math.round(leinwand.height * f); c.getContext('2d').drawImage(leinwand, 0, 0, c.width, c.height);
    const k = await finde(c); let breit = 0, hoch = 0;
    for (const q of k) { const w = q.x1 - q.x0, h = q.y1 - q.y0; if (w > 1.6 * h) breit++; else if (h > 1.6 * w) hoch++; }
    return hoch > Math.max(3, breit * 1.5);
  }
  // Mehrfach lesen (Abstimmung nach Konfidenz, vgl. Reul u. a. 2017, arXiv:1711.09670): denselben Bereich mit
  // verschiedenen Ausschnitten lesen (Rand eng/weit, oben/unten etwas weniger, Kontrast gestreckt). Dünne Ziffern in schmaler
  // Bon-Schrift („1“) fallen sonst je nach Ausschnitt mal weg. Rückgabe: alle Lesungen mit Konfidenz.
  async function mehrfach(leinwand, k, opt = {}) {
    const m = await lade(), h = k.y1 - k.y0, w = k.x1 - k.x0, out = [];
    const varianten = opt.varianten || [[0.12, 0], [0.3, 0], [0.12, 0.1], [0.45, -0.05], [0.2, 0, true]];
    for (const [rand, ein, kontrast] of varianten) {
      const r = { x0: Math.max(0, k.x0 - h * rand), x1: Math.min(leinwand.width, k.x1 + h * rand), y0: Math.max(0, k.y0 - h * (rand * 0.5 - ein)), y1: Math.min(leinwand.height, k.y1 + h * (rand * 0.5 - ein)) };
      let quelle = leinwand;
      if (kontrast) {
        const c = neueLeinwand(); c.width = Math.round(r.x1 - r.x0); c.height = Math.round(r.y1 - r.y0);
        const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(leinwand, r.x0, r.y0, c.width, c.height, 0, 0, c.width, c.height);
        const d = g.getImageData(0, 0, c.width, c.height), px = d.data; let lo = 255, hi = 0;
        for (let i = 0; i < px.length; i += 4) { const v = (px[i] + px[i + 1] + px[i + 2]) / 3; if (v < lo) lo = v; if (v > hi) hi = v; }
        const sp = Math.max(1, hi - lo); for (let i = 0; i < px.length; i += 4) { const v = Math.max(0, Math.min(255, (((px[i] + px[i + 1] + px[i + 2]) / 3 - lo) * 255) / sp)); px[i] = px[i + 1] = px[i + 2] = v; }
        g.putImageData(d, 0, 0); quelle = c; r.x1 -= r.x0; r.y1 -= r.y0; r.x0 = 0; r.y0 = 0;
      }
      try { const l = await liesKasten(quelle, r, m); if (l && l.t) out.push({ t: l.t, c: l.c }); } catch (e) { /* nächste Variante */ }
    }
    return out;
  }
  // Einen Streifen quer über den Bon lesen (z. B. eine Zeile, deren Betrag fehlte): erst Kästen finden, dann lesen
  async function streifen(leinwand, y0, y1) {
    const c = neueLeinwand(), h = Math.max(8, Math.round(y1 - y0)), pad = Math.round(h * 0.4);
    c.width = leinwand.width; c.height = h + 2 * pad;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(leinwand, 0, Math.max(0, y0 - pad), c.width, c.height, 0, 0, c.width, c.height);
    const w = await woerter(c);
    return w.map((x) => ({ ...x, b: { x0: x.b.x0, x1: x.b.x1, y0: x.b.y0 + Math.max(0, y0 - pad), y1: x.b.y1 + Math.max(0, y0 - pad) } }));
  }
  // ---------- Entzerren mit UVDoc (Verhoeven, Magne, Sorkine-Hornung 2023, MIT; vendor/uvdoc/uvdoc.onnx) ----------
  // Eingang: RGB 488×712, Werte 0–1 (wie demo.py im UVDoc-Repository). Ausgang: Gitter 2×45×31 mit Quellkoordinaten
  // in [-1, 1] (grid_sample, align_corners) – für jeden Punkt des glatten Bildes, wo er im Foto liegt.
  let uv = null;
  async function uvdoc(leinwand) {
    const m = await lade();
    if (!uv) uv = (async () => { const b = await holen(new URL('vendor/uvdoc/uvdoc.onnx', G.location.href).href); return m.ort.InferenceSession.create(b, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' }); })().catch((e) => { uv = null; throw e; });
    const s = await uv, W = 488, H = 712, c = neueLeinwand(); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(leinwand, 0, 0, W, H);
    const p = g.getImageData(0, 0, W, H).data, n = W * H, t = new Float32Array(3 * n);
    for (let i = 0, j = 0; i < n; i++, j += 4) { t[i] = p[j] / 255; t[n + i] = p[j + 1] / 255; t[2 * n + i] = p[j + 2] / 255; }
    const aus = await s.run({ [s.inputNames[0]]: new m.ort.Tensor('float32', t, [1, 3, H, W]) }), o = aus[s.outputNames[0]];
    return { gitter: Array.from(o.data), dims: o.dims };
  }
  async function uvdocDa() { try { const r = await fetch(new URL('vendor/uvdoc/uvdoc.onnx', G.location.href).href, { method: 'HEAD' }); return r.ok; } catch (e) { return false; } }
  return { lade, verfuegbar, finde, hochkant, woerter, mehrfach, streifen, uvdoc, uvdocDa, liesKasten: async (c, k) => liesKasten(c, k, await lade()) };
})();

// ---------- Im Web Worker: Rechnen, ohne die Oberfläche zu blockieren (Animation und Bedienung bleiben flüssig) ----------
// Bilder werden einmal als ImageBitmap übergeben und per Nummer angesprochen; nach dem Lesen gibt die App sie wieder frei.
if (imArbeiter) {
  const bilder = new Map();
  G.onmessage = async (e) => {
    const { n, fn, a } = e.data;
    const melde = (m) => G.postMessage({ n, melde: { status: m.status, progress: m.progress } });
    try {
      let r = null;
      if (fn === 'bild') bilder.set(a.id, a.bild);
      else if (fn === 'frei') { for (const b of bilder.values()) if (b.close) b.close(); bilder.clear(); }
      else if (fn === 'lade') { await motor.lade(melde); r = true; }
      else {
        const q = bilder.get(a.id); if (!q) throw new Error('Bild fehlt');
        if (fn === 'woerter') r = await motor.woerter(q, { ...(a.opt || {}), melde });
        else if (fn === 'finde') r = await motor.finde(q, a.opt || {});
        else if (fn === 'hochkant') r = await motor.hochkant(q);
        else if (fn === 'mehrfach') r = await motor.mehrfach(q, a.k, a.opt || {});
        else if (fn === 'streifen') r = await motor.streifen(q, a.y0, a.y1);
        else if (fn === 'uvdoc') r = await motor.uvdoc(q);
        else throw new Error('unbekannt: ' + fn);
      }
      G.postMessage({ n, r });
    } catch (err) { G.postMessage({ n, fehler: String((err && err.message) || err) }); }
  };
  return;
}

// ---------- Im Fenster: FasanOCR leitet an den Worker weiter; geht das nicht (alter Browser), rechnet es hier ----------
let arbeiter = null, nr = 0, kaputt = false;
const offen = new Map(); let ids = new WeakMap(), idz = 0;
function ruf(fn, a, melde, transfer) {
  if (!arbeiter) {
    arbeiter = new Worker(new URL('ocr.js', G.location.href));
    arbeiter.onmessage = (e) => { const d = e.data, o = offen.get(d.n); if (!o) return; if (d.melde) { if (o.melde) o.melde(d.melde); return; } offen.delete(d.n); if (d.fehler) o.nein(new Error(d.fehler)); else o.ja(d.r); };
    arbeiter.onerror = (e) => { kaputt = true; for (const o of offen.values()) o.nein(new Error('Worker: ' + (e.message || 'Fehler'))); offen.clear(); };
  }
  return new Promise((ja, nein) => { const k = ++nr; offen.set(k, { ja, nein, melde }); arbeiter.postMessage({ n: k, fn, a }, transfer || []); });
}
async function bildNr(c) {
  if (ids.has(c)) return ids.get(c);
  const id = ++idz, bild = await createImageBitmap(c);
  await ruf('bild', { id, bild }, null, [bild]); ids.set(c, id); return id;
}
const moeglich = typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined' && typeof createImageBitmap !== 'undefined';
let modus = moeglich ? 'arbeiter' : 'direkt';
// erster Aufruf entscheidet: lädt der Worker, bleibt es dabei; sonst direkt im Fenster
async function bereit(melde) {
  if (modus === 'arbeiter') { try { await ruf('lade', {}, melde); return; } catch (e) { modus = 'direkt'; kaputt = true; } }
  await motor.lade(melde);
}
const ohneFn = (o) => { const x = { ...(o || {}) }; delete x.melde; return x; };
G.FasanOCR = {
  verfuegbar: motor.verfuegbar,
  get modus() { return modus; },
  lade: (melde) => bereit(melde),
  async woerter(c, opt = {}) { await bereit(opt.melde); return modus === 'arbeiter' ? ruf('woerter', { id: await bildNr(c), opt: ohneFn(opt) }, opt.melde) : motor.woerter(c, opt); },
  async finde(c, opt = {}) { await bereit(); return modus === 'arbeiter' ? ruf('finde', { id: await bildNr(c), opt: ohneFn(opt) }) : motor.finde(c, opt); },
  async hochkant(c) { await bereit(); return modus === 'arbeiter' ? ruf('hochkant', { id: await bildNr(c) }) : motor.hochkant(c); },
  async mehrfach(c, k, opt = {}) { await bereit(); return modus === 'arbeiter' ? ruf('mehrfach', { id: await bildNr(c), k, opt: ohneFn(opt) }) : motor.mehrfach(c, k, opt); },
  uvdocDa: motor.uvdocDa,
  async uvdoc(c) { await bereit(); return modus === 'arbeiter' ? ruf('uvdoc', { id: await bildNr(c) }) : motor.uvdoc(c); },
  async streifen(c, y0, y1) { await bereit(); return modus === 'arbeiter' ? ruf('streifen', { id: await bildNr(c), y0, y1 }) : motor.streifen(c, y0, y1); },
  // Speicher im Worker freigeben (Bilder eines Bons sind zusammen schnell 100 MB)
  frei() { ids = new WeakMap(); if (arbeiter && !kaputt) ruf('frei', {}).catch(() => null); },
};
})(self);
