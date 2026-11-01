/* Fasan-Karte – receipt scan: straighten text lines, crop to the paper, flatten the lighting.
 *
 * Why: a phone photo of a receipt is rotated, seen in perspective and crumpled. Scanner apps (Apple Notes, Microsoft
 * Lens, Google ML Kit Document Scanner) find the page, correct the perspective and remove shadows. A crumpled
 * thermal receipt also has wavy lines, which a four-corner perspective correction cannot fix.
 *
 * Method (classical, no extra model): the OCR pass has already found every text line and its words. In a flat scan
 *  1. every text line is horizontal (all its words share one y),
 *  2. the left margin is a vertical line,
 *  3. the text has the same size everywhere.
 * We measure each line as a smooth curve, the left margin, and the text size (character pitch, perspective trend),
 * then fit a smooth surface (tensor-product cubic B-spline, robust least squares) that maps the flat scan to the photo.
 * Each output pixel is sampled from the photo through that mapping. This is the text-line constraint used by learned
 * rectifiers (Li et al., ICCV 2023, "Foreground and Text-lines Aware Document Image Rectification") and by the
 * cubic-sheet model of Zucker (page_dewarp, 2016), but with a free-form surface, so local wrinkles are corrected too.
 * Only the receipt's own lines count (text on the table or a poster in the photo is filtered out).
 *
 * Lighting: the paper brightness is estimated by a morphological closing (maximum, then minimum filter of about half a
 * text height) and divided out – the principle of the "document" filter of scanner apps.
 *
 * Public API (window.FasanScan):
 *   straighten(canvas, lines, opt) -> { canvas, toScan([x, y]), boxToScan(box), toSource([x, y]), paper, stats } | null
 *     lines: [{ w: [{ t, b: { x0, y0, x1, y1 }, neig }] }]  (output of zeilenAus in bon.js)
 *   documentLook(canvas, { textHeight, paper }) -> canvas   grayscale scan, white paper, dark text, soft edges
 *   lastError   why the last straighten() returned null (for the protocol)
 *
 * License: MPL-2.0 (Fasan-Karte). No third-party code.
 */
'use strict';
window.FasanScan = (() => {
  const median = (values) => { if (!values.length) return 0; const s = [...values].sort((a, b) => a - b); return s[s.length >> 1]; };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // ---------- 1. Measure the text lines ----------
  // Text height of a word box without the slant contribution (long tilted words have tall axis-aligned boxes).
  const wordHeight = (w) => { const bh = w.b.y1 - w.b.y0, bw = w.b.x1 - w.b.x0; return Math.max(3, bw < 3 * bh || !w.neig ? bh : Math.max(0.5 * bh, bh - Math.abs(w.neig) * bw)); };
  // Character pitch of a word (monospaced receipt fonts): box width / (characters + ~1 for the detector's padding).
  // The best measure of perspective scale: heights of axis-aligned boxes are inflated by any tilt.
  const wordPitch = (w) => { const n = String(w.t || '').replace(/\s/g, '').length; return n >= 3 ? (w.b.x1 - w.b.x0) / (n + 0.8) : null; };

  // Sample points along a word: three along its own slope when it is long and the detector measured the slope.
  function wordPoints(w) {
    const cx = (w.b.x0 + w.b.x1) / 2, cy = (w.b.y0 + w.b.y1) / 2, ww = w.b.x1 - w.b.x0, h = wordHeight(w);
    if (w.neig != null && ww > 3 * h) return [0.15, 0.5, 0.85].map((f) => { const x = w.b.x0 + f * ww; return { x, y: cy + w.neig * (x - cx), h }; });
    return [{ x: cx, y: cy, h }];
  }

  // Least squares polynomial y = sum c_k (x - x0)^k, degree 1 or 2.
  function fitPoly(pts, degree, x0) {
    const n = degree + 1, A = Array.from({ length: n }, () => new Float64Array(n + 1));
    for (const p of pts) {
      const t = p.x - x0, pw = [1, t, t * t];
      for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] += pw[i] * pw[j]; A[i][n] += pw[i] * p.y; }
    }
    return solveDense(A, n);
  }
  // Gaussian elimination with partial pivoting on an augmented matrix (rows of length n + 1). Returns null if singular.
  function solveDense(A, n) {
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      if (Math.abs(A[piv][c]) < 1e-12) return null;
      if (piv !== c) { const t = A[c]; A[c] = A[piv]; A[piv] = t; }
      for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; if (!f) continue; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
    }
    const x = new Float64Array(n);
    for (let r = n - 1; r >= 0; r--) { let s = A[r][n]; for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k]; x[r] = s / A[r][r]; }
    return x;
  }

  // One text line as a curve y(x) over [xs, xe]; outside it continues straight with the end slope.
  function makeLine(words) {
    const pts = words.flatMap(wordPoints), h = median(words.map(wordHeight));
    const xs = Math.min(...words.map((w) => w.b.x0)), xe = Math.max(...words.map((w) => w.b.x1));
    const x0 = (xs + xe) / 2;
    let coef = null, kept = pts;
    for (let round = 0; round < 2; round++) {
      const span = Math.max(...kept.map((p) => p.x)) - Math.min(...kept.map((p) => p.x));
      const degree = kept.length >= 6 && span > 10 * h ? 2 : kept.length >= 2 && span > 1.5 * h ? 1 : 0;
      coef = degree ? fitPoly(kept, degree, x0) : null;
      if (!coef) coef = new Float64Array([median(kept.map((p) => p.y)), 0]);
      // curvature limit: a receipt line does not bend more than ~1.5 text heights over its length
      if (coef.length > 2) { const lim = (1.5 * h) / Math.max(1, ((xe - xs) / 2) ** 2); coef[2] = clamp(coef[2], -lim, lim); }
      const res = (p) => Math.abs(p.y - evalCoef(coef, p.x - x0));
      const next = kept.filter((p) => res(p) < 0.6 * h);
      if (next.length === kept.length || next.length < Math.max(1, kept.length * 0.6)) break;
      kept = next;
    }
    const pitches = words.map((w) => { const p = wordPitch(w); return p && p * Math.sqrt(1 + slopeCoef(coef, (w.b.x0 + w.b.x1) / 2 - x0) ** 2); }).filter(Boolean);
    return { words, pts: kept, h, xs, xe, x0, coef, slopeKnown: kept.length >= 2, pitch: pitches.length ? median(pitches) : null };
  }
  const evalCoef = (c, t) => c[0] + (c[1] || 0) * t + (c[2] || 0) * t * t;
  const slopeCoef = (c, t) => (c[1] || 0) + 2 * (c[2] || 0) * t;
  function lineY(L, x) {
    const t = clamp(x, L.xs, L.xe) - L.x0, y = evalCoef(L.coef, t), s = slopeCoef(L.coef, t);
    return y + s * (x - clamp(x, L.xs, L.xe));
  }
  const lineSlope = (L, x) => slopeCoef(L.coef, clamp(x, L.xs, L.xe) - L.x0);

  // ---------- 2. Smooth surface: tensor-product cubic B-spline, robust least squares ----------
  // Maps points of domain A (box [x0, y0, x1, y1]) to points of B. nu × nv control points; second differences of the
  // control points are penalised (smoothness). Iteratively reweighted (Cauchy) with scale = 0.35 text heights, so single
  // wrong points do not bend the surface.
  function fitSurface(A, B, H, box, nu, nv, smooth = 1, startWeights = null) {
    const [x0, y0, x1, y1] = box, su = (nu - 3) / Math.max(1e-6, x1 - x0), sv = (nv - 3) / Math.max(1e-6, y1 - y0), M = nu * nv;
    const basis = (t) => { const b0 = (1 - t) ** 3 / 6, b1 = (3 * t ** 3 - 6 * t * t + 4) / 6, b2 = (-3 * t ** 3 + 3 * t * t + 3 * t + 1) / 6, b3 = t ** 3 / 6; return [b0, b1, b2, b3]; };
    const locate = (x, y) => {
      const tu = clamp((x - x0) * su, 0, nu - 3), tv = clamp((y - y0) * sv, 0, nv - 3);
      const iu = Math.min(nu - 4, Math.floor(tu)), iv = Math.min(nv - 4, Math.floor(tv));
      // outside the box the surface continues linearly (no wild cubic extrapolation)
      return { iu, iv, bu: basis(tu - iu), bv: basis(tv - iv), ex: x - clamp(x, x0, x1), ey: y - clamp(y, y0, y1) };
    };
    const rows = A.map(([x, y]) => locate(x, y));
    let w = startWeights ? startWeights.slice() : A.map(() => 1), cx = null, cy = null;
    const lam = smooth * Math.max(1, A.length / M) * 0.5;
    for (let it = 0; it < 5; it++) {
      const N = Array.from({ length: M }, () => new Float64Array(M + 2));
      rows.forEach((r, i) => {
        const idx = [], val = [];
        for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) { idx.push((r.iv + a) * nu + r.iu + b); val.push(r.bv[a] * r.bu[b]); }
        for (let p = 0; p < 16; p++) { const row = N[idx[p]], vp = val[p] * w[i]; for (let q = 0; q < 16; q++) row[idx[q]] += vp * val[q]; row[M] += vp * B[i][0]; row[M + 1] += vp * B[i][1]; }
      });
      // smoothness: second differences along u and along v
      const pen = (k0, k1, k2) => { const ks = [k0, k1, k2], cs = [1, -2, 1]; for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) N[ks[p]][ks[q]] += lam * cs[p] * cs[q]; };
      for (let v = 0; v < nv; v++) for (let u = 1; u < nu - 1; u++) pen(v * nu + u - 1, v * nu + u, v * nu + u + 1);
      for (let u = 0; u < nu; u++) for (let v = 1; v < nv - 1; v++) pen((v - 1) * nu + u, v * nu + u, (v + 1) * nu + u);
      // tiny ridge so empty cells stay determined
      for (let k = 0; k < M; k++) N[k][k] += 1e-6;
      const sol = solveTwo(N, M); if (!sol) return null;
      [cx, cy] = sol;
      const at0 = (r) => { let x = 0, y = 0; for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) { const k = (r.iv + a) * nu + r.iu + b, f = r.bv[a] * r.bu[b]; x += f * cx[k]; y += f * cy[k]; } return [x, y]; };
      w = rows.map((r, i) => { const [x, y] = at0(r), d = Math.hypot(x - B[i][0], y - B[i][1]) / (0.35 * H[i]); return 1 / (1 + d * d); });
    }
    const at = (x, y) => {
      const r = locate(x, y); let px = 0, py = 0;
      for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) { const k = (r.iv + a) * nu + r.iu + b, f = r.bv[a] * r.bu[b]; px += f * cx[k]; py += f * cy[k]; }
      if (r.ex || r.ey) { // linear continuation with the local derivative at the border
        const e = 1, cxp = clamp(x, x0, x1), cyp = clamp(y, y0, y1);
        const p0 = atIn(cxp, cyp), pu = atIn(cxp - Math.sign(r.ex || 1) * e, cyp), pv = atIn(cxp, cyp - Math.sign(r.ey || 1) * e);
        px = p0[0] + (p0[0] - pu[0]) * Math.abs(r.ex) + (p0[0] - pv[0]) * Math.abs(r.ey);
        py = p0[1] + (p0[1] - pu[1]) * Math.abs(r.ex) + (p0[1] - pv[1]) * Math.abs(r.ey);
      }
      return [px, py];
    };
    const atIn = (x, y) => { const r = locate(x, y); let px = 0, py = 0; for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) { const k = (r.iv + a) * nu + r.iu + b, f = r.bv[a] * r.bu[b]; px += f * cx[k]; py += f * cy[k]; } return [px, py]; };
    return { at, weights: w };
  }
  function solveTwo(A, n) {
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      if (Math.abs(A[piv][c]) < 1e-14) return null;
      if (piv !== c) { const t = A[c]; A[c] = A[piv]; A[piv] = t; }
      const rc = A[c], inv = 1 / rc[c];
      for (let r = c + 1; r < n; r++) { const rr = A[r], f = rr[c] * inv; if (!f) continue; for (let k = c; k < n + 2; k++) rr[k] -= f * rc[k]; }
    }
    const x = new Float64Array(n), y = new Float64Array(n);
    for (let r = n - 1; r >= 0; r--) { let sx = A[r][n], sy = A[r][n + 1]; for (let k = r + 1; k < n; k++) { sx -= A[r][k] * x[k]; sy -= A[r][k] * y[k]; } x[r] = sx / A[r][r]; y[r] = sy / A[r][r]; }
    return [x, y];
  }

  // ---------- 3. Build the mapping from the lines ----------
  let lastError = '';
  const fail = (why) => { lastError = why; return null; };
  function straighten(canvas, lines, opt = {}) {
    lastError = '';
    const W = canvas.width, H = canvas.height;
    let L = (lines || []).map((z) => (z.w || []).filter((w) => w && w.b && w.b.x1 > w.b.x0 && w.b.y1 > w.b.y0)).filter((ws) => ws.length).map(makeLine);
    if (L.length < 4) return fail('few lines');
    let H0 = median(L.map((l) => l.h));
    // only the receipt: text printed on the table, a menu or a poster in the photo must not steer the mapping
    // (Test 01.11., Belém: "SUPER BOCK" on the table pulled the scan apart). Receipt lines have similar height, lie in one
    // vertical column and follow each other without large gaps.
    L = L.filter((l) => l.h < 2.6 * H0 && l.h > 0.35 * H0 && l.words.length);
    if (L.length >= 4) {
      const q = (a, f) => { const t = [...a].sort((x, y) => x - y); return t[Math.min(t.length - 1, Math.max(0, Math.floor(t.length * f)))]; };
      const colL = q(L.map((l) => l.xs), 0.2), colR = q(L.map((l) => l.xe), 0.8);
      L = L.filter((l) => Math.min(l.xe, colR + H0) - Math.max(l.xs, colL - H0) > 0.5 * (l.xe - l.xs));
      // vertical groups (split at gaps > 8 text heights, e.g. above a QR code); keep the largest and those in its column
      const ys = (l) => (lineY(l, l.xs) + lineY(l, l.xe)) / 2;
      const sorted = [...L].sort((a, b) => ys(a) - ys(b)), groups = [];
      for (const l of sorted) { const g = groups[groups.length - 1]; if (g && ys(l) - ys(g[g.length - 1]) < 8 * H0) g.push(l); else groups.push([l]); }
      const main = groups.reduce((a, g) => (g.length > a.length ? g : a), []);
      const mL = Math.min(...main.map((l) => l.xs)), mR = Math.max(...main.map((l) => l.xe));
      L = groups.filter((g) => g === main || g.every((l) => Math.min(l.xe, mR) - Math.max(l.xs, mL) > 0.6 * (l.xe - l.xs))).flat();
    }
    if (L.length < 4) return fail('few receipt lines');
    H0 = median(L.map((l) => l.h));
    // lines without a measured slope take the slope of their neighbours
    const xRef = median(L.flatMap((l) => l.pts.map((p) => p.x)));
    for (const l of L) l.yRef = lineY(l, xRef);
    L.sort((a, b) => a.yRef - b.yRef);
    for (const l of L) if (!l.slopeKnown) {
      const nb = L.filter((o) => o !== l && o.slopeKnown && Math.abs(o.yRef - l.yRef) < 6 * H0).map((o) => lineSlope(o, (l.xs + l.xe) / 2));
      if (nb.length) { l.coef = new Float64Array([l.coef[0], median(nb)]); l.yRef = lineY(l, xRef); }
    }
    L.sort((a, b) => a.yRef - b.yRef);
    // pieces of one printed line (name and price grouped apart) become one line
    for (let i = 0; i + 1 < L.length; i++) {
      const a = L[i], b = L[i + 1], overlapX = Math.min(a.xe, b.xe) - Math.max(a.xs, b.xs);
      const xm = overlapX > 0 ? (Math.max(a.xs, b.xs) + Math.min(a.xe, b.xe)) / 2 : (a.xe < b.xs ? (a.xe + b.xs) / 2 : (b.xe + a.xs) / 2);
      if (overlapX < 0.5 * H0 && Math.abs(lineY(a, xm) - lineY(b, xm)) < 0.35 * Math.min(a.h, b.h)) { L.splice(i, 2, makeLine([...a.words, ...b.words])); L[i].yRef = lineY(L[i], xRef); i--; }
    }
    if (L.length < 4) return fail('few lines after merge');

    // scale: text gets smaller with distance (perspective). Measured by the character pitch (monospaced font); a robust
    // straight-line trend over the receipt length (double-width lines such as "SUMME" are outliers and lose their weight).
    {
      const withP = L.filter((l) => l.pitch), P0 = median(withP.map((l) => l.pitch)) || 1, yc = median(L.map((l) => l.yRef));
      let c = [P0, 0], wts = withP.map(() => 1);
      for (let it = 0; it < 6 && withP.length >= 3; it++) {
        const f = fitPoly(withP.map((l, i) => ({ x: l.yRef, y: l.pitch, w: wts[i] })).filter((q) => q.w > 0.5), 1, yc);
        if (f) c = Array.from(f);
        wts = withP.map((l) => (Math.abs(l.pitch - evalCoef(c, l.yRef - yc)) < 0.15 * P0 ? 1 : 0));
      }
      const pAt = (y) => Math.max(0.3 * P0, evalCoef(c, y - yc)), Pref = pAt(yc);
      for (const l of L) l.scale = clamp(Pref / pAt(l.yRef), 0.6, 1.6);
    }

    // left margin x = m(y): robust fit through the line starts that are not indented
    const starts = L.map((l) => ({ y: lineY(l, l.xs), x: l.xs, h: l.h }));
    let mc = [median(starts.map((s) => s.x)), 0], y0m = median(starts.map((s) => s.y));
    let wts = starts.map(() => 1);
    for (let it = 0; it < 6; it++) {
      const use = starts.map((s, i) => ({ x: s.y, y: s.x, w: wts[i] })).filter((p) => p.w > 0.5);
      if (use.length >= 2) { const c = fitPoly(use, 1, y0m); if (c) mc = Array.from(c); }
      // the margin is the left edge: lines that start further right are indented (centred header, "2 Stk x")
      wts = starts.map((s) => (s.x - evalCoef(mc, s.y - y0m) < 0.9 * s.h ? 1 : 0));
    }
    const marginX = (y) => evalCoef(mc, y - y0m);

    // arc length along line l from the margin to x
    const arc = (l, xa, xb) => { const n = 8, d = (xb - xa) / n; let s = 0; for (let k = 0; k <= n; k++) { const f = k === 0 || k === n ? 1 : k % 2 ? 4 : 2, sl = lineSlope(l, xa + k * d); s += f * Math.sqrt(1 + sl * sl); } return (s * d) / 3; };
    for (const l of L) { let xm = marginX(l.yRef); for (let it = 0; it < 3; it++) xm = marginX(lineY(l, xm)); l.xm = xm; }
    const U = (l, x) => l.scale * arc(l, l.xm, x);

    // target rows: spacing = perpendicular distance between neighbouring line curves, scaled
    L[0].V = 0;
    for (let i = 1; i < L.length; i++) {
      const a = L[i - 1], b = L[i], ox0 = Math.max(a.xs, b.xs), ox1 = Math.min(a.xe, b.xe);
      const xm = ox1 > ox0 ? (ox0 + ox1) / 2 : xRef, sl = (lineSlope(a, xm) + lineSlope(b, xm)) / 2;
      const d = (lineY(b, xm) - lineY(a, xm)) / Math.sqrt(1 + sl * sl), s = (a.scale + b.scale) / 2;
      b.V = a.V + Math.max(0.6 * H0, s * d);
    }

    // control points: measured points on each line -> (arc length from the margin, row of the line)
    const T = [], S = [], Hs = [];
    for (const l of L) for (const p of l.pts) { T.push([U(l, p.x), l.V]); S.push([p.x, p.y]); Hs.push(l.h); }

    // output frame = the paper: a receipt is a rectangle whose printed area reaches close to the edges (≈ one character).
    // Left edge just before the margin, right edge just after the longest line; a little more room above and below.
    const padX = (opt.padX == null ? 0.9 : opt.padX) * H0, padY = (opt.padY == null ? 1.2 : opt.padY) * H0;
    const uMin = Math.min(0, ...L.map((l) => U(l, l.xs))) - padX, uMax = Math.max(...L.map((l) => U(l, l.xe))) + padX;
    const vMin = L[0].V - L[0].h / 2 - padY, vMax = L[L.length - 1].V + L[L.length - 1].h / 2 + padY;
    let OW = Math.round(uMax - uMin), OH = Math.round(vMax - vMin);
    const maxSide = opt.maxSide || 3600, k0 = Math.min(1, maxSide / Math.max(OW, OH), Math.sqrt((opt.maxPixels || 6e6) / (OW * OH)));
    OW = Math.max(16, Math.round(OW * k0)); OH = Math.max(16, Math.round(OH * k0));
    // smooth surfaces in both directions (robust least squares, outliers such as a word grouped into the wrong line lose
    // their weight); coarse grids keep the mapping free of swirls
    const nv = clamp(Math.round(L.length / 1.6), 5, 40), nu = clamp(Math.round((uMax - uMin) / (6 * H0)), 4, 10);
    const back = fitSurface(T, S, Hs, [uMin, vMin, uMax, vMax], nu, nv, opt.smooth);
    if (!back) return fail('surface singular');
    const ignored = back.weights.filter((w) => w < 0.3).length / Math.max(1, back.weights.length);
    if (ignored > (opt.maxIgnored == null ? 0.2 : opt.maxIgnored)) return fail(`inconsistent lines ${ignored.toFixed(2)}`);
    const sx0 = Math.min(...S.map((p) => p[0])) - 3 * H0, sy0 = Math.min(...S.map((p) => p[1])) - 3 * H0, sx1 = Math.max(...S.map((p) => p[0])) + 3 * H0, sy1 = Math.max(...S.map((p) => p[1])) + 3 * H0;
    const fwd = fitSurface(S, T, Hs, [sx0, sy0, sx1, sy1], clamp(Math.round((sx1 - sx0) / (6 * H0)), 4, 10), nv, opt.smooth, back.weights);
    if (!fwd) return fail('inverse surface singular');
    const toSource = ([ox, oy]) => back.at(uMin + ox / k0, vMin + oy / k0);
    const toScan = ([x, y]) => { const r = fwd.at(x, y); return [(r[0] - uMin) * k0, (r[1] - vMin) * k0]; };

    // ---------- 4. Render: mapping on a coarse grid, bilinear in between, bilinear sampling of the photo ----------
    const step = 8, gw = Math.ceil(OW / step) + 1, gh = Math.ceil(OH / step) + 1, gx = new Float32Array(gw * gh), gy = new Float32Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const [x, y] = toSource([i * step, j * step]); gx[j * gw + i] = x; gy[j * gw + i] = y; }
    // fold check: the mapping must keep its orientation (a fold means the lines contradicted each other)
    let folds = 0; const foldRows = new Int32Array(gh);
    for (let j = 0; j + 1 < gh; j++) for (let i = 0; i + 1 < gw; i++) {
      const a = j * gw + i, ax = gx[a + 1] - gx[a], ay = gy[a + 1] - gy[a], bx = gx[a + gw] - gx[a], by = gy[a + gw] - gy[a];
      if (ax * by - ay * bx <= 0) { folds++; foldRows[j]++; }
    }
    const foldShare = folds / ((gw - 1) * (gh - 1));
    if (foldShare > (opt.maxFolds == null ? 0.02 : opt.maxFolds)) return fail(`folds ${foldShare.toFixed(3)}`);
    const sctx = canvas.getContext('2d', { willReadFrequently: true }), sd = sctx.getImageData(0, 0, W, H).data;
    const out = document.createElement('canvas'); out.width = OW; out.height = OH;
    const octx = out.getContext('2d'), img = octx.createImageData(OW, OH), od = img.data;
    for (let y = 0; y < OH; y++) {
      const gj = y / step, j0 = Math.min(gh - 2, gj | 0), fy = gj - j0;
      for (let x = 0; x < OW; x++) {
        const gi = x / step, i0 = Math.min(gw - 2, gi | 0), fx = gi - i0, a = j0 * gw + i0;
        const sx = (gx[a] * (1 - fx) + gx[a + 1] * fx) * (1 - fy) + (gx[a + gw] * (1 - fx) + gx[a + gw + 1] * fx) * fy;
        const sy = (gy[a] * (1 - fx) + gy[a + 1] * fx) * (1 - fy) + (gy[a + gw] * (1 - fx) + gy[a + gw + 1] * fx) * fy;
        const o = (y * OW + x) * 4;
        if (sx < 0 || sy < 0 || sx >= W - 1 || sy >= H - 1) { od[o] = od[o + 1] = od[o + 2] = 255; od[o + 3] = 255; continue; }
        const x0 = sx | 0, y0 = sy | 0, ux = sx - x0, uy = sy - y0, p = (y0 * W + x0) * 4, q = p + W * 4;
        for (let c = 0; c < 3; c++) od[o + c] = (sd[p + c] * (1 - ux) + sd[p + 4 + c] * ux) * (1 - uy) + (sd[q + c] * (1 - ux) + sd[q + 4 + c] * ux) * uy;
        od[o + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    // residual straightness of the input lines (in text heights) – for the protocol
    const wav = median(L.map((l) => { const ys = l.pts.map((p) => p.y - lineY(l, p.x)); return Math.sqrt(ys.reduce((a, v) => a + v * v, 0) / Math.max(1, ys.length)) / l.h; }));
    // blank border: nothing is printed left of the margin, right of the longest line or outside the first/last line.
    // The document look paints these bands white (edge shadows, background past a bent edge). Inside the printed area
    // nothing is masked, so no printed character can ever be hidden.
    const paper = { left: (-0.3 * H0 - uMin) * k0, right: (Math.max(...L.map((l) => U(l, l.xe))) + 0.3 * H0 - uMin) * k0,
      top: (L[0].V - Math.max(L[0].h, H0) * 0.75 - vMin) * k0, bottom: (L[L.length - 1].V + Math.max(L[L.length - 1].h, H0) * 0.75 - vMin) * k0, feather: 0.3 * H0 * k0 };
    let debug = null;
    if (opt.debug) {
      debug = document.createElement('canvas'); debug.width = W; debug.height = H; const g = debug.getContext('2d'); g.drawImage(canvas, 0, 0); g.lineWidth = 2;
      for (const l of L) { g.strokeStyle = '#e00'; g.beginPath(); for (let x = l.xs; x <= l.xe; x += 4) { const y = lineY(l, x); if (x === l.xs) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); g.fillStyle = '#00f'; for (const p of l.pts) g.fillRect(p.x - 3, p.y - 3, 6, 6); }
      g.strokeStyle = '#0a0'; g.beginPath(); g.moveTo(marginX(0), 0); g.lineTo(marginX(H), H); g.stroke();
      g.strokeStyle = 'rgba(255,160,0,.8)'; g.lineWidth = 1; for (let v = 0; v <= OH; v += 40) { g.beginPath(); for (let u = 0; u <= OW; u += 20) { const [x, y] = toSource([u, v]); if (!u) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
    }
    return {
      canvas: out, toScan, toSource, debug, paper,
      // axis-aligned box in the photo -> axis-aligned box in the scan (corners and edge midpoints mapped)
      boxToScan: (b) => { const ps = [[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1], [(b.x0 + b.x1) / 2, b.y0], [(b.x0 + b.x1) / 2, b.y1]].map(toScan); return { x0: Math.max(0, Math.min(...ps.map((p) => p[0]))), y0: Math.max(0, Math.min(...ps.map((p) => p[1]))), x1: Math.min(OW, Math.max(...ps.map((p) => p[0]))), y1: Math.min(OH, Math.max(...ps.map((p) => p[1]))) }; },
      stats: { ignored: +ignored.toFixed(3), textHeightOut: Math.round(H0 * k0), lines: L.length, points: T.length, textHeight: Math.round(H0), size: `${OW}×${OH}`, folds: +foldShare.toFixed(4), lineFit: +wav.toFixed(3), perLine: opt.debug ? L.map((l) => [Math.round(l.yRef), +l.h.toFixed(1), +l.scale.toFixed(2), Math.round(l.V), l.pts.length]) : undefined, foldRows: opt.debug ? Array.from(foldRows) : undefined },
    };
  }

  // ---------- 5. Document look: white paper, dark text, no shadows ----------
  // background = brightness of the paper: max filter (text vanishes) on a 1/f copy, then a box blur, scaled back up.
  // ratio = pixel / background (1 = paper). Tone curve keeps soft (anti-aliased) edges instead of a hard threshold.
  function documentLook(canvas, opt = {}) {
    const w = canvas.width, h = canvas.height, ctx = canvas.getContext('2d', { willReadFrequently: true }), d = ctx.getImageData(0, 0, w, h), p = d.data;
    const textH = opt.textHeight || Math.max(12, Math.round(Math.min(w, h) / 45));
    // paper brightness by a morphological closing (maximum filter, then minimum filter, radius ≈ half a text height) on a
    // block-averaged copy, then a short blur: dark strokes narrower than the window vanish, the paper level and its
    // shading stay. The minimum step matters: phone photos have bright sharpening rims along strokes; a maximum alone
    // spreads them and leaves grey halos around the text.
    const f = Math.max(1, Math.round(textH / 10)), sw = Math.ceil(w / f), sh = Math.ceil(h / f);
    const lum = new Float32Array(w * h); for (let i = 0, o = 0; i < w * h; i++, o += 4) lum[i] = 0.299 * p[o] + 0.587 * p[o + 1] + 0.114 * p[o + 2];
    const small = new Float32Array(sw * sh), cnt = new Float32Array(sw * sh);
    for (let y = 0; y < h; y++) { const j = (y / f) | 0; for (let x = 0; x < w; x++) { const k = j * sw + ((x / f) | 0); small[k] += lum[y * w + x]; cnt[k]++; } }
    for (let k = 0; k < small.length; k++) small[k] /= Math.max(1, cnt[k]);
    const filt = (src, r, mode) => { // separable filter on the small grid: 'max', 'min' or 'mean'
      let a = src;
      for (const horiz of [true, false]) {
        const o = new Float32Array(sw * sh), L = horiz ? sw : sh, Q = horiz ? sh : sw;
        for (let q = 0; q < Q; q++) for (let l = 0; l < L; l++) {
          let acc = mode === 'min' ? 1e9 : 0, n = 0;
          for (let t = Math.max(0, l - r); t <= Math.min(L - 1, l + r); t++) { const v = a[horiz ? q * sw + t : t * sw + q]; if (mode === 'max') { if (v > acc) acc = v; } else if (mode === 'min') { if (v < acc) acc = v; } else { acc += v; n++; } }
          o[horiz ? q * sw + l : l * sw + q] = mode === 'mean' ? acc / n : acc;
        }
        a = o;
      }
      return a;
    };
    const rMax = Math.max(1, Math.round((opt.reach == null ? 0.6 : opt.reach) * textH / f));
    const bg = filt(filt(filt(small, rMax, 'max'), rMax, 'min'), Math.max(1, Math.round(rMax / 2)), 'mean');
    const pm = opt.paper || null, lo = opt.lo == null ? 0.55 : opt.lo, hi = opt.hi == null ? 0.85 : opt.hi, gamma = opt.gamma || 1.3;
    for (let y = 0; y < h; y++) {
      const gj = clamp(y / f - 0.5, 0, sh - 1), j0 = Math.min(Math.max(0, sh - 2), gj | 0), fy = sh < 2 ? 0 : gj - j0;
      for (let x = 0; x < w; x++) {
        const gi = clamp(x / f - 0.5, 0, sw - 1), i0 = Math.min(Math.max(0, sw - 2), gi | 0), fx = sw < 2 ? 0 : gi - i0, a = j0 * sw + i0;
        const b = sh < 2 || sw < 2 ? bg[0] : (bg[a] * (1 - fx) + bg[a + 1] * fx) * (1 - fy) + (bg[a + sw] * (1 - fx) + bg[a + sw + 1] * fx) * fy;
        const o = (y * w + x) * 4, v = lum[y * w + x] / Math.max(30, b);
        let t = clamp((v - lo) / (hi - lo), 0, 1);
        if (pm) { const dOut = Math.max(pm.left - x, x - pm.right, pm.top - y, y - pm.bottom), al = clamp((dOut + 0.5 * pm.feather) / pm.feather, 0, 1); if (al > 0) t = t + al * (1 - t); }
        const g = 255 * Math.pow(t, gamma);
        p[o] = p[o + 1] = p[o + 2] = g; p[o + 3] = 255;
      }
    }
    const out = document.createElement('canvas'); out.width = w; out.height = h; out.getContext('2d').putImageData(d, 0, 0);
    return out;
  }

  return { straighten, documentLook, get lastError() { return lastError; } };
})();
