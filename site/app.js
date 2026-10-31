'use strict';
/* Fasan Karte – Logik. Keine Konten, keine Statistik; Markierungen bleiben auf dem Gerät (localStorage). */
(() => {
  const VERSION = '3.18';
  const STAND_NOTIZEN = '23.10.2026'; // Recherche der Notizen ohne eigene Quelle. Preise und Gratis-Angaben tragen seit 24.10.2026 eigene Quellen.
  const datumDe = (iso) => (iso ? iso.split('-').reverse().join('.') : '');
  const TAGE = [
    { id: 'sa', kurz: 'Sa 24.', lang: 'Samstag, 24. Oktober', datum: '2026-10-24' },
    { id: 'so', kurz: 'So 25.', lang: 'Sonntag, 25. Oktober', datum: '2026-10-25' },
    { id: 'mo', kurz: 'Mo 26.', lang: 'Montag, 26. Oktober', datum: '2026-10-26' },
  ];
  const SVG = {
    sehen: '<path d="M3 21h18M5 10h14M6 10v8M10 10v8M14 10v8M18 10v8M3 10l9-6 9 6"/>',
    aussicht: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    essen: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.5 1.5-4 4-4 8h4"/>',
    veggie: '<path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15zM5 19l8-8"/>',
    abends: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    verkehr: '<rect x="6" y="4" width="12" height="13" rx="2.5"/><path d="M6 11h12M9 20l-1.5 2M15 20l1.5 2M9.5 14.5h.01M14.5 14.5h.01"/>',
    plan: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3"/>',
    live: '<path d="M12 3 19 20l-7-3.6L5 20z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    orte: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    herz: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.1a4.3 4.3 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20z"/>',
    mehr: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    standort: '<circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r="8"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>',
    suche: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    zurueck: '<path d="M15 5l-7 7 7 7"/>',
    rueck: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    vor: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    ganz: '<path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"/>',
    kaesten: '<rect x="3" y="5" width="18" height="5" rx="1.5"/><rect x="3" y="14" width="18" height="5" rx="1.5"/>',
    stift: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    haken: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    sichern: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4"/><path d="M8 20v-6h8v6"/>',
    aus: '<path d="M3 3l18 18M10.6 5.2A9.9 9.9 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    teilen: '<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    route: '<path d="M3 11.5 21 3l-8.5 18-2-7.5z"/>',
    stern: '<path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3L2.8 9.5l6.4-.9z"/>',
    kopie: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    notiz: '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
    haus: '<path d="M3 11 12 4l9 7M5.5 9.5V20h13V9.5"/>',
    ton: '<path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    tonAus: '<path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6"/>',
    gruppe: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14c2.4.2 4 1.9 4.5 4.5"/>',
    qr: '<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h3v3h-3zM17.5 17.5h3v3h-3zM14 20.5h.01M20.5 14h.01"/>',
    hoch: '<path d="M7 11v9H4v-9zM7 11l4-7c1.5 0 2.5 1 2.2 2.6L12.6 10H19a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.8 20H7"/>',
    foto: '<path d="M3.5 8.5h3.5l1.8-2.5h6.4l1.8 2.5h3.5V19h-17z"/><circle cx="12" cy="13" r="3.5"/>',
    pin: '<path d="M9 3.5h6l-1 5.5 3.5 3.5h-11L10 9zM12 12.5V21"/>',
    runter: '<path d="M7 13V4H4v9zM7 13l4 7c1.5 0 2.5-1 2.2-2.6l-.6-3.4H19a2 2 0 0 0 2-2.3l-1.2-6A2 2 0 0 0 17.8 4H7"/>',
  };
  // Symbole je Ortstyp (Farbe = Gruppe, Form = Typ; nie Farbe allein)
  const SYMBOL = {
    restaurant: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.5 1.5-4 4-4 8h4"/>',
    cafe: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3c-.8 1 .8 2 0 3M12 3c-.8 1 .8 2 0 3"/>',
    bar: '<path d="M5 4h14l-7 8zM12 12v8M8 20h8"/>',
    fado: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    museum: '<path d="M3 21h18M4 10h16M12 3 3 8h18zM6 10v8M10 10v8M14 10v8M18 10v8"/>',
    kirche: '<path d="M12 2v4M10 4h4M6 21V11l6-4 6 4v10M3 21h18M10 21v-4a2 2 0 0 1 4 0v4"/>',
    aussicht: '<circle cx="6.5" cy="15.5" r="3.5"/><circle cx="17.5" cy="15.5" r="3.5"/><path d="M10 15.5h4M4 13l2.5-8h3l1 8M20 13l-2.5-8h-3l-1 8"/>',
    park: '<path d="M12 22v-6M12 3a5 5 0 0 0-5 5 4 4 0 0 0-1 7.5h12A4 4 0 0 0 17 8a5 5 0 0 0-5-5z"/>',
    markt: '<path d="M4 9h16l-1.5-5h-13zM4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9M5 11v9h14v-9M10 20v-5h4v5"/>',
    platz: '<path d="M12 3v6M8.5 6.5C9 4.5 10.5 3.5 12 3c1.5.5 3 1.5 3.5 3.5M4 13h16M6 13v2.5c0 2 2.7 3.5 6 3.5s6-1.5 6-3.5V13M3 21h18"/>',
    friedhof: '<path d="M6 21V9a6 6 0 0 1 12 0v12M3 21h18M12 8v6M9.5 10.5h5"/>',
    tram: '<rect x="6" y="5" width="12" height="12" rx="2.5"/><path d="M6 11h12M9 20l-1.5 2M15 20l1.5 2M9 2h6M12 2v3M9.5 14.5h.01M14.5 14.5h.01"/>',
    metro: '<circle cx="12" cy="12" r="9"/><path d="M8 16V8l4 5 4-5v8"/>',
    bahn: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M8 21l2-4M16 21l-2-4M9 13.5h.01M15 13.5h.01"/>',
    aufzug: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 9l3-3 3 3M9 15l3 3 3-3"/>',
    faehre: '<path d="M3 18c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0M5 15l1.5-5h11L19 15M12 10V4M9 6h6"/>',
    denkmal: '<path d="M10 21V9l2-6 2 6v12M7 21h10M9 13h6"/>',
    turm: '<path d="M7 21V9h10v12M5 9h14M7 9V4h2v2h2V4h2v2h2V4h2v5M10 21v-4h4v4M3 21h18"/>',
    buch: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zM4 20V5M8 7h7"/>',
    weg: '<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2-6-3-3 1.5-5 3.5 2 2 3M8 12l-2 2M14 15l2 6"/>',
    kueste: '<path d="M3 9c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0M3 14c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0M3 19c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0"/>',
    treff: '<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>',
    haus: '<path d="M3 11 12 4l9 7M5.5 9.5V20h13V9.5M10 20v-5h4v5"/>',
    shop: '<path d="M5 8h14l-1 13H6zM9 8V6.5a3 3 0 0 1 6 0V8M9 11.5v.01M15 11.5v.01"/>',
    foto: '<path d="M3.5 8.5h3.5l1.8-2.5h6.4l1.8 2.5h3.5V19h-17z"/><circle cx="12" cy="13" r="3.5"/>',
    korb: '<path d="M3 9h18l-2 10.5H5zM8 9l3-5M16 9l-3-5M9 13v3M15 13v3M12 13v3"/>',
    wc: '<circle cx="7.5" cy="5" r="1.8"/><circle cx="16.5" cy="5" r="1.8"/><path d="M5.5 21v-6H4.5l1-6.5h4l1 6.5h-1v6M14.5 21v-5h-2l2.5-7.5h3l2.5 7.5h-2v5M12 3v18"/>',
    apo: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>',
    geld: '<rect x="2.5" y="6.5" width="19" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 10v4M18 10v4"/>',
    wasser: '<path d="M12 3c3.5 4.6 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6.4 6-11z"/>',
  };
  const TYP_NAME = { restaurant: 'Restaurant', cafe: 'Café', bar: 'Bar', fado: 'Fado', museum: 'Museum', kirche: 'Kirche', aussicht: 'Aussicht', park: 'Park', markt: 'Markt',
    platz: 'Platz', friedhof: 'Friedhof', tram: 'Tram', metro: 'Metro', bahn: 'Bahn', aufzug: 'Aufzug, Standseilbahn', faehre: 'Fähre', denkmal: 'Denkmal', turm: 'Turm', buch: 'Bücher, Kultur', weg: 'Spazierweg', kueste: 'Küste', shop: 'Shoppen', haus: 'Unterkunft', foto: 'Foto-Spot',
    korb: 'Supermarkt', wc: 'Toilette', apo: 'Apotheke', geld: 'Geldautomat', wasser: 'Trinkwasser' };
  // „In der Nähe“: Alltagsorte aus OpenStreetMap (umgebung.json, im Bauprozess geholt)
  const NAH = [
    { id: 's', typ: 'korb', label: 'Supermarkt', titel: 'Supermärkte' },
    { id: 'wc', typ: 'wc', label: 'Toilette', titel: 'Toiletten' },
    { id: 'apo', typ: 'apo', label: 'Apotheke', titel: 'Apotheken' },
    { id: 'atm', typ: 'geld', label: 'Geld', titel: 'Geldautomaten' },
    { id: 'wasser', typ: 'wasser', label: 'Wasser', titel: 'Trinkwasser' },
    { id: 'wiki', typ: 'buch', label: 'Wissenswert', titel: 'Wissenswertes' },
  ];
  const GRUPPEN = [
    { id: 'sehen', label: 'Sehen', kats: ['Sehenswürdigkeit', 'Museum', 'Markt', 'Event'] },
    { id: 'aussicht', label: 'Aussicht', kats: ['Aussichtspunkt'] },
    { id: 'essen', label: 'Essen', kats: ['Essen für alle', 'Café'] },
    { id: 'veggie', label: 'Veggie', kats: ['Vegan portugiesisch', 'Vegetarisch'] },
    { id: 'abends', label: 'Abends', kats: ['Bar', 'Fado', 'Getränk'] },
    { id: 'verkehr', label: 'Verkehr', kats: ['Verkehr'] },
    { id: 'shoppen', label: 'Shoppen', kats: ['Shoppen'] },
    { id: 'strand', label: 'Strand', kats: ['Strand'] },
    { id: 'foto', label: 'Foto', kats: ['Foto'] }, // eigene Ebene: nur sichtbar, wenn „Foto“ gewählt ist
  ];
  const THEMES = [
    ['system', 'System', 'Folgt Hell und Dunkel deines Handys.'],
    ['hell', 'Hell', 'Dunkle Schrift auf hellem Grund. Draußen am besten lesbar.'],
    ['dunkel', 'Dunkel', 'Helle Schrift auf dunklem Grund, angenehm am Abend.'],
    ['kontrast', 'Kontrast', 'Größtmöglicher Kontrast (mindestens 7:1), für schlechtes Sehen oder grelles Licht.'],
    ['glas', 'Glas', 'Durchscheinende Flächen; die Bedienung schwebt als Glas über der Karte.'],
  ];
  const PROFILE = [
    ['standard', 'Standard', 'Alle Funktionen.'],
    ['einfach', 'Groß', 'Größere Schrift und Schaltflächen, weniger Auswahl.'],
    ['lesbar', 'Gut lesbar', 'Kontrast 7:1 und die größte Schrift.'],
  ];
  const UA = navigator.userAgent;
  const IOS = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const ANDROID = /Android/.test(UA);
  const LISSABON = [38.7139, -9.1394];

  // ---------- Werkzeuge ----------
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  function el(tag, attrs, ...kinder) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const kind of kinder.flat(Infinity)) {
      if (kind == null || kind === false) continue;
      e.append(kind.nodeType ? kind : String(kind));
    }
    return e;
  }
  const setze = (box, ...kinder) => box.replaceChildren(...kinder.flat(Infinity).filter((k) => k != null && k !== false));
  const ic = (name, cls) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    if (cls) s.setAttribute('class', cls);
    s.innerHTML = SVG[name] || SYMBOL[name] || '';
    return s;
  };
  const fasan = (cls) => { const t = $('#tpl-fasan').content.firstElementChild.cloneNode(true); t.classList.add('fasan'); if (cls) t.classList.add(cls); return t; };
  const speicher = {
    get(k, d) { try { const v = localStorage.getItem('fk:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('fk:' + k, JSON.stringify(v)); } catch (e) { /* privater Modus: nur für diese Sitzung */ } },
  };
  const falte = (s) => (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const symbolSvg = (o) => SYMBOL[o.typ] || SVG[gruppeVon(o.kategorie)];
  const symbol = (o) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = symbolSvg(o); return s; };
  // Bild des Ortes, sonst eine Kachel mit großem Symbol in der Gruppenfarbe
  const bildKachel = (o, cls) => (o.bild
    ? el('span', { class: 'kachel ' + (cls || '') }, el('img', { src: o.bild.src, alt: '', loading: 'lazy', decoding: 'async' }))
    : el('span', { class: `kachel ohne g-${gruppeVon(o.kategorie)} ${cls || ''}` }, symbol(o)));
  const gruppeVon = (kat) => (GRUPPEN.find((g) => g.kats.includes(kat)) || GRUPPEN[0]).id;
  const hatPos = (o) => o && typeof o.lat === 'number' && typeof o.lon === 'number';
  const istTipp = (o) => /Geheimtipp/.test(o.notiz || '');
  const notizText = (o) => (o.notiz || '').replace(/\s*\(Geheimtipp\)/, '');
  function meter(a, b) {
    const r = Math.PI / 180, p1 = a.lat * r, p2 = b.lat * r;
    const h = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(h));
  }
  const strecke = (m) => (m < 950 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(m < 9500 ? 1 : 0).replace('.', ',')} km`);
  const gehzeit = (m) => Math.max(1, Math.round((m * 1.3) / 67)); // Fußweg ≈ 1,3 × Luftlinie, 4 km/h

  // ---------- Einstellungen und Zustand ----------
  const E = Object.assign({ profil: 'standard', theme: 'system', ansage: true, tempo: 'normal', steigung: false }, speicher.get('einstellungen', {}));
  const S = {
    tab: speicher.get('tab', 'plan'), plan: speicher.get('plan', 'A'), tag: speicher.get('tag', 'sa'),
    gruppen: new Set(speicher.get('gruppen', [])), extra: new Set(speicher.get('extra', [])),
    sort: speicher.get('sort', 'naehe'), suche: '', ort: null, hoehe: 'klein',
    me: null, meAlt: null, follow: false, watchId: null, fehlerZeit: 0, gTeil: speicher.get('gTeil', 'unterwegs'),
  };
  const heute = new Date();
  const iso = `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, '0')}-${String(heute.getDate()).padStart(2, '0')}`;
  const heuteTag = TAGE.find((t) => t.datum === iso);
  if (heuteTag) S.tag = heuteTag.id;
  if (!['A', 'B', 'C', 'G'].includes(S.plan) && !String(S.plan).startsWith('P:')) S.plan = 'A';
  if (!['live', 'plan', 'orte', 'gruppe', 'gemerkt', 'mehr', 'info'].includes(S.tab)) S.tab = 'plan';

  let M = speicher.get('markierungen', {});
  const mk = (id) => M[id] || {};
  function markiere(id, patch) {
    const neu = Object.assign({}, mk(id), patch, { t: Date.now() });
    const leer = !neu.fav && !neu.fertig && !neu.aus && !neu.notiz && !neu.sterne;
    if (leer) delete M[id]; else M[id] = neu;
    speicher.set('markierungen', M);
    teileMarkierungen();
  }
  // Markierungen für die Gruppe: Merken, Erledigt, Sterne, Notiz. „Ausgeblendet“ bleibt privat. Abschaltbar unter „Gemerkt“.
  function teileMarkierungen() {
    if (!G.ich || !G.ich.name) return;
    const me = ich(), m = {};
    if (E.markTeilen !== false) {
      for (const [id, x] of Object.entries(M)) if (x.fav || x.fertig || x.sterne || x.notiz) m[id] = [x.fav ? 1 : 0, x.fertig ? 1 : 0, x.sterne || 0, (x.notiz || '').slice(0, 300)];
    }
    if (JSON.stringify(me.m || {}) === JSON.stringify(m)) return;
    me.m = m; me.t = Date.now(); speichereG();
  }
  // Was die anderen bei einem Ort markiert haben
  function gruppeMark(ortId) {
    const r = { fav: [], fertig: [], sterne: [], notizen: [] };
    for (const [id, p] of Object.entries(G.leute)) {
      if (G.ich && id === G.ich.id) continue;
      const x = p.m && p.m[ortId];
      if (!Array.isArray(x)) continue;
      const n = p.name || 'Jemand';
      if (x[0]) r.fav.push(n);
      if (x[1]) r.fertig.push(n);
      if (x[2]) r.sterne.push([n, x[2]]);
      if (x[3]) r.notizen.push([n, x[3]]);
    }
    return r;
  }

  let ORTE = [], NACH_NAME = new Map(), NACH_ID = new Map(), PLAENE = {};

  // ---------- Gruppe: Abgleich ohne Server ----------
  // Jedes Handy hält, was es kennt. Ein Paket (Link oder QR) trägt alles davon. Zusammenführen je Person: neuere Fassung gewinnt.
  // Die Daten stehen im Teil hinter „#“; der wird beim Laden der Seite nicht an den Server geschickt (RFC 3986, Abschnitt 3.5).
  let G = Object.assign({ ich: null, leute: {}, umfragen: {}, nachrichten: {}, kosten: {} }, speicher.get('gruppe', {}));
  if (!G.nachrichten) G.nachrichten = {};
  if (!G.kosten) G.kosten = {};
  if (!G.plaene) G.plaene = {};
  if (!G.gesehen) G.gesehen = {};
  if (!G.einkauf) G.einkauf = {};
  if (!G.eigene) G.eigene = {};
  const neueId = () => (crypto.getRandomValues ? Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 10) : Math.random().toString(36).slice(2, 12));
  // Live-Abgleich (Funk, siehe funk.js): Zustand nur im Speicher
  const F = { an: false, sig: null, timer: {}, leuteOrt: new Map(), gehoert: new Map(), status: { an: false, verbunden: 0, gesamt: 0 }, ortT: 0, ortP: null, warteZeichnen: false };
  const speichereG = () => { speicher.set('gruppe', G); funkVoll(); };
  const MAX_NACHRICHTEN = 80;
  function ich() {
    if (!G.ich) { G.ich = { id: neueId(), name: '' }; }
    if (!G.leute[G.ich.id]) G.leute[G.ich.id] = { name: G.ich.name, s: {}, a: {}, t: Date.now() };
    return G.leute[G.ich.id];
  }
  const meinName = () => (G.ich && G.ich.name) || 'Ich';
  function stimme(ortId, wert) {
    const me = ich();
    if (wert) me.s[ortId] = wert; else delete me.s[ortId];
    me.t = Date.now(); speichereG();
  }
  const meineStimme = (ortId) => (G.ich && G.leute[G.ich.id] && G.leute[G.ich.id].s[ortId]) || 0;
  function gruppenStimmen(ortId) {
    const ja = [], nein = [];
    for (const [id, p] of Object.entries(G.leute)) {
      const v = p.s && p.s[ortId];
      const n = id === (G.ich && G.ich.id) ? meinName() : p.name || 'Jemand';
      if (v === 1) ja.push(n); else if (v === -1) nein.push(n);
    }
    return { ja, nein };
  }
  function rangliste() {
    return ORTE.map((o) => ({ o, ...gruppenStimmen(o.id) })).filter((x) => x.ja.length || x.nein.length)
      .sort((a, b) => (b.ja.length - b.nein.length) - (a.ja.length - a.nein.length) || b.ja.length - a.ja.length || a.o.name.localeCompare(b.o.name, 'pt'));
  }

  const b64u = {
    enc(bytes) { let s = ''; bytes.forEach((b) => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
    dec(str) { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)); return Uint8Array.from(s, (c) => c.charCodeAt(0)); },
  };
  // Gruppenschlüssel für den Live-Abgleich: 32 Zufallsbytes. Treffen zwei Schlüssel aufeinander, gewinnt der ältere,
  // damit alle Handys beim selben Kanal landen. Alte Schlüssel hört das Handy noch eine Weile mit.
  function sichereSchluessel() {
    if (!G.k) { G.k = [b64u.enc(crypto.getRandomValues(new Uint8Array(32))), Date.now()]; speicher.set('gruppe', G); }
    return G.k;
  }
  // Nachrichten: die neuesten MAX_NACHRICHTEN, Reihenfolge fest (Zeit, dann Kennung), damit alle dieselben behalten
  const nachrichtenListe = () => Object.entries(G.nachrichten).sort((a, b) => (b[1].t - a[1].t) || (a[0] < b[0] ? 1 : -1)).slice(0, MAX_NACHRICHTEN);
  async function packe(opt = {}) {
    if (G.ich) { const me = ich(); me.name = G.ich.name; }
    if (G.ich && G.ich.name && window.crypto && crypto.getRandomValues) sichereSchluessel();
    const l = {};
    for (const [id, p] of Object.entries(G.leute)) if (!opt.nurIch || (G.ich && id === G.ich.id)) l[id] = [p.name || '', p.t || 0, p.s || {}, p.a || {}, p.m || {}, p.ohne ? 1 : 0];
    const u = {};
    for (const [id, x] of Object.entries(G.umfragen)) u[id] = [x.von, x.frage, x.o, x.t];
    const tp = G.treff ? [G.treff.name || '', G.treff.lat || 0, G.treff.lon || 0, G.treff.zeit || '', G.treff.von || '', G.treff.t || 0, G.treff.geloescht ? 1 : 0] : null;
    const pn = G.pin ? [G.pin.x || '', G.pin.von || '', G.pin.n || '', G.pin.t || 0, G.pin.weg ? 1 : 0] : null;
    const n = opt.chat ? nachrichtenListe().map(([id, x]) => (x.o ? [id, x.von, x.n, x.x, x.t, x.o] : [id, x.von, x.n, x.x, x.t])) : undefined;
    const ko = {};
    for (const [id, x] of Object.entries(G.kosten)) ko[id] = [x.v, x.b, x.z, x.f, x.t, x.m, x.x ? 1 : 0, x.a ? 1 : 0, x.an || 0, x.za || 0, x.art || '', x.pos || 0, x.tip || 0];
    const ep = {};
    for (const [id, x] of Object.entries(G.plaene)) ep[id] = [x.n, x.von, x.tag, x.s, x.d, x.t, x.x ? 1 : 0, x.e || x.von];
    const gs = {};
    for (const [id, x] of Object.entries(G.gesehen)) gs[id] = [x.w, x.t];
    const ek = {};
    for (const [id, x] of Object.entries(G.einkauf)) ek[id] = [x.t, x.von, x.d ? 1 : 0, x.m, x.x ? 1 : 0];
    const eo = {};
    for (const [id, x] of Object.entries(G.eigene)) eo[id] = [x.n, x.k, x.y, x.lat, x.lon, x.x || '', x.von, x.t, x.w ? 1 : 0, x.q || '', x.a || '', x.oh || ''];
    const roh = new TextEncoder().encode(JSON.stringify(opt.nurIch ? { v: 1, l, k: G.k || null } : { v: 1, l, u, tp, pn, k: G.k || null, n, ko, ep, gs, ek, eo }));
    if ('CompressionStream' in window) {
      try {
        const z = new Uint8Array(await new Response(new Blob([roh]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
        return 'z' + b64u.enc(z);
      } catch (e) { /* ohne Kompression weiter */ }
    }
    return 'j' + b64u.enc(roh);
  }
  async function entpacke(text) {
    let bytes = b64u.dec(text.slice(1));
    if (text[0] === 'z') bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    const d = JSON.parse(new TextDecoder().decode(bytes));
    if (!d || d.v !== 1) throw new Error('Format');
    return d;
  }
  function fuehreZusammen(d) {
    const neu = [];
    neu.eigene = 0;
    for (const [id, x] of Object.entries(d.eo && typeof d.eo === 'object' ? d.eo : {})) {
      if (!Array.isArray(x) || id.length > 20) continue;
      const [n, k, y, lat, lon, notiz, von, t, weg, q, a, oh] = x;
      const alt = G.eigene[id];
      if (alt && (+t || 0) <= (alt.t || 0)) continue;
      if (typeof n !== 'string' || !n.trim() || !(+lat > -90 && +lat < 90 && +lon > -180 && +lon < 180)) continue;
      G.eigene[id] = { n: n.trim().slice(0, 80), k: EIGEN_KATS.some((e) => e[0] === k) ? k : EIGEN_KATS[0][0], y: TYP_NAME[y] ? y : '', lat: +lat, lon: +lon, x: String(notiz || '').slice(0, 300),
        von: String(von || '').slice(0, 16), t: +t || 0, w: weg ? 1 : 0, q: String(q || '').slice(0, 40), a: String(a || '').slice(0, 120), oh: String(oh || '').slice(0, 200) };
      neu.eigene += 1;
    }
    if (neu.eigene) eigeneEinbauen();
    for (const [id, p] of Object.entries(d.l || {})) {
      if (G.ich && id === G.ich.id) continue; // eigene Daten bleiben maßgeblich
      if (!Array.isArray(p)) continue;
      const [name, t, s, a, m] = p;
      const alt = G.leute[id];
      if (!alt || (t || 0) > (alt.t || 0)) {
        const mk2 = {};
        if (m && typeof m === 'object') for (const [oid, x] of Object.entries(m)) if (Array.isArray(x) && NACH_ID.has(oid)) mk2[oid] = [x[0] ? 1 : 0, x[1] ? 1 : 0, Math.max(0, Math.min(5, +x[2] || 0)), String(x[3] || '').slice(0, 300)];
        G.leute[id] = { name: String(name || '').slice(0, 40), t: +t || 0, s: s && typeof s === 'object' ? s : {}, a: a && typeof a === 'object' ? a : {}, m: p.length > 4 ? mk2 : (alt && alt.m) || {}, ohne: p[5] ? 1 : 0 };
        neu.push(String(name || 'Jemand').slice(0, 40));
      }
    }
    for (const [id, x] of Object.entries(d.u || {})) {
      if (!G.umfragen[id] && Array.isArray(x)) G.umfragen[id] = { von: x[0], frage: String(x[1] || '').slice(0, 120), o: (x[2] || []).filter((oid) => NACH_ID.has(oid)).slice(0, 8), t: +x[3] || 0 };
    }
    if (Array.isArray(d.tp) && (!G.treff || (+d.tp[5] || 0) > (G.treff.t || 0))) {
      const [name, lat, lon, zeit, von, t, weg] = d.tp;
      G.treff = weg ? { geloescht: true, von, t: +t || 0 } : { name: String(name).slice(0, 80), lat: +lat, lon: +lon, zeit: String(zeit).slice(0, 5), von, t: +t || 0 };
      if (!weg) neu.push('Treffpunkt');
    }
    if (Array.isArray(d.pn) && (+d.pn[3] || 0) > ((G.pin && G.pin.t) || 0)) {
      const [x, von, n, t, weg] = d.pn;
      G.pin = weg ? { weg: 1, von: String(von).slice(0, 12), n: String(n || '').slice(0, 40), t: +t } : { x: String(x || '').slice(0, 300), von: String(von).slice(0, 12), n: String(n || '').slice(0, 40), t: +t };
      neu.pin = !weg;
    }
    neu.nachrichten = [];
    for (const x of Array.isArray(d.n) ? d.n : []) {
      if (!Array.isArray(x) || typeof x[0] !== 'string' || G.nachrichten[x[0]]) continue;
      const [id, von, n, text, t, ort] = x;
      if (!text || !(+t)) continue;
      G.nachrichten[id.slice(0, 16)] = { von: String(von || '').slice(0, 12), n: String(n || '').slice(0, 40), x: String(text).slice(0, 360), t: +t };
      if (typeof ort === 'string' && NACH_ID.has(ort)) G.nachrichten[id.slice(0, 16)].o = ort;
      neu.nachrichten.push(G.nachrichten[id.slice(0, 16)]);
    }
    const behalten = new Set(nachrichtenListe().map(([id]) => id));
    for (const id of Object.keys(G.nachrichten)) if (!behalten.has(id)) delete G.nachrichten[id];
    neu.nachrichten = neu.nachrichten.filter((x) => Object.values(G.nachrichten).includes(x));
    if (Array.isArray(d.k) && typeof d.k[0] === 'string' && /^[A-Za-z0-9_-]{43}$/.test(d.k[0]) && +d.k[1] > 0) {
      const [kk, kt] = d.k;
      if (!G.k || +kt < G.k[1] || (+kt === G.k[1] && kk < G.k[0])) {
        if (G.k && G.k[0] !== kk) G.altK = [G.k[0], ...(G.altK || []).filter((x) => x !== kk && x !== G.k[0])].slice(0, 4);
        G.k = [kk, +kt]; neu.schluessel = true;
      }
    }
    neu.kosten = 0;
    for (const [id, x] of Object.entries(d.ko && typeof d.ko === 'object' ? d.ko : {})) {
      if (!Array.isArray(x) || typeof id !== 'string' || id.length > 20) continue;
      const [v, b, z, f, t, m, weg, ausgleich, an, za, art, pos, tip] = x;
      const alt = G.kosten[id];
      if (alt && (+m || 0) <= (alt.m || 0)) continue;
      if (typeof v !== 'string' || !(Number.isInteger(+b) && +b > 0 && +b < 10000000) || !Array.isArray(f) || !f.length) continue;
      G.kosten[id] = { v: v.slice(0, 16), b: +b, z: String(z || '').slice(0, 60), f: f.filter((y) => typeof y === 'string').slice(0, 30).map((y) => y.slice(0, 16)), t: +t || 0, m: +m || 0, x: weg ? 1 : 0, a: ausgleich ? 1 : 0,
        an: centMap(an, +b), za: centMap(za, +b), art: ['gleich', 'betrag', 'anteile', 'posten'].includes(art) ? art : '',
        pos: Array.isArray(pos) ? pos.filter((q) => Array.isArray(q) && Number.isInteger(q[1]) && Array.isArray(q[2])).slice(0, 80).map((q) => [String(q[0] || '').slice(0, 40), q[1], q[2].filter((y) => typeof y === 'string').slice(0, 30)]) : null,
        tip: Array.isArray(tip) && ['%', '€'].includes(tip[0]) && Number.isFinite(+tip[1]) ? [tip[0], +tip[1]] : null };
      neu.kosten += 1;
    }
    neu.plaene = [];
    for (const [id, x] of Object.entries(d.ep && typeof d.ep === 'object' ? d.ep : {})) {
      if (!Array.isArray(x) || id.length > 20) continue;
      const [n, von, tag, st, dn, t, weg, bearb] = x;
      const alt = G.plaene[id];
      if (alt && (+t || 0) <= (alt.t || 0)) continue;
      if (!['sa', 'so', 'mo'].includes(tag) || !Array.isArray(st)) continue;
      G.plaene[id] = { n: String(n || 'Plan').slice(0, 40), von: String(von || '').slice(0, 16), tag, s: st.filter((y) => NACH_ID.has(y)).slice(0, 40), d: (Array.isArray(dn) ? dn : []).filter((y) => NACH_ID.has(y)), t: +t || 0, x: weg ? 1 : 0, e: String(bearb || von || '').slice(0, 16) };
      neu.plaene.push(id);
    }
    neu.gesehen = 0;
    for (const [id, x] of Object.entries(d.gs && typeof d.gs === 'object' ? d.gs : {})) {
      if (!Array.isArray(x) || !NACH_ID.has(id)) continue;
      const alt = G.gesehen[id];
      if (alt && (+x[1] || 0) <= (alt.t || 0)) continue;
      G.gesehen[id] = { w: (Array.isArray(x[0]) ? x[0] : []).filter((y) => typeof y === 'string').slice(0, 30), t: +x[1] || 0 };
      neu.gesehen += 1;
    }
    neu.einkauf = 0;
    for (const [id, x] of Object.entries(d.ek && typeof d.ek === 'object' ? d.ek : {})) {
      if (!Array.isArray(x) || id.length > 20) continue;
      const alt = G.einkauf[id];
      if (alt && (+x[3] || 0) <= (alt.m || 0)) continue;
      G.einkauf[id] = { t: String(x[0] || '').slice(0, 60), von: String(x[1] || '').slice(0, 16), d: x[2] ? 1 : 0, m: +x[3] || 0, x: x[4] ? 1 : 0 };
      neu.einkauf += 1;
    }
    speicher.set('gruppe', G); // nicht speichereG: Empfangenes löst kein eigenes Senden aus
    return neu;
  }
  // Hat die Gegenseite etwas nicht, das dieses Handy kennt? Dann antwortet es mit seinem Stand.
  function ihnenFehlt(d) {
    const l = d.l || {};
    for (const [id, p] of Object.entries(G.leute)) { const x = l[id]; if (!Array.isArray(x) || (+x[1] || 0) < (p.t || 0)) return true; }
    const u = d.u || {};
    for (const id of Object.keys(G.umfragen)) if (!u[id]) return true;
    if (G.treff && (!Array.isArray(d.tp) || (+d.tp[5] || 0) < (G.treff.t || 0))) return true;
    if (G.pin && (!Array.isArray(d.pn) || (+d.pn[3] || 0) < (G.pin.t || 0))) return true;
    if (G.k && (!Array.isArray(d.k) || d.k[0] !== G.k[0])) return true;
    if (Array.isArray(d.n)) { const ihre = new Set(d.n.map((x) => x && x[0])); for (const [id] of nachrichtenListe()) if (!ihre.has(id)) return true; }
    if (d.ko && typeof d.ko === 'object') for (const [id, x] of Object.entries(G.kosten)) { const y = d.ko[id]; if (!Array.isArray(y) || (+y[5] || 0) < (x.m || 0)) return true; }
    if (d.ep && typeof d.ep === 'object') for (const [id, x] of Object.entries(G.plaene)) { const y = d.ep[id]; if (!Array.isArray(y) || (+y[5] || 0) < (x.t || 0)) return true; }
    if (d.gs && typeof d.gs === 'object') for (const [id, x] of Object.entries(G.gesehen)) { const y = d.gs[id]; if (!Array.isArray(y) || (+y[1] || 0) < (x.t || 0)) return true; }
    if (d.ek && typeof d.ek === 'object') for (const [id, x] of Object.entries(G.einkauf)) { const y = d.ek[id]; if (!Array.isArray(y) || (+y[3] || 0) < (x.m || 0)) return true; }
    if (d.eo && typeof d.eo === 'object') for (const [id, x] of Object.entries(G.eigene)) { const y = d.eo[id]; if (!Array.isArray(y) || (+y[7] || 0) < (x.t || 0)) return true; }
    return false;
  }
  const paketLink = async () => `${location.origin}${location.pathname}#g=${await packe()}`;
  async function importiereAusHash() {
    const m = /^#g=([zj][A-Za-z0-9_-]+)$/.exec(location.hash);
    if (!m) return false;
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* egal */ }
    try {
      const neu = fuehreZusammen(await entpacke(m[1]));
      if (neu.schluessel) funkStart(); else funkVoll(800); // Neues aus dem Link gleich an die anderen weiterreichen
      S.tab = 'gruppe'; speicher.set('tab', 'gruppe'); S.ort = null; hoehe('gross'); zeichne({ anpassen: true });
      toast(neu.length ? `Abgeglichen: ${neu.join(', ')}.` : 'Abgeglichen. Es war nichts Neues dabei.');
    } catch (e) { toast('Dieser Gruppen-Link ist beschädigt. Bitte neu senden lassen.'); }
    return true;
  }
  addEventListener('hashchange', () => { if (/^#g=/.test(location.hash)) importiereAusHash(); });

  // ---------- Live-Abgleich über Nostr (funk.js) ----------
  // Jedes offene Handy sendet seinen Stand bei Änderungen und alle 2 Minuten. Wer etwas Neueres kennt, antwortet.
  // So reicht ein offenes Handy, damit Stimmen, Umfragen, Treffpunkt und Nachrichten weiterwandern.
  const funkErlaubt = () => !!(window.Funk && Funk.moeglich() && E.funk !== false && G.ich && G.ich.name);
  async function funkStart() {
    if (!funkErlaubt()) { funkStopp(); return; }
    const k = sichereSchluessel();
    const liste = [k[0], ...(G.altK || [])];
    const sig = liste.join(',');
    if (F.an && F.sig === sig) return;
    F.sig = sig;
    F.an = await Funk.starte(liste, { empfang: funkEmpfang, status: (s) => { const vorher = F.status.verbunden; F.status = s; if (!!vorher !== !!s.verbunden) funkAnzeige(); } });
    if (F.an) { funkVoll(1500); if (teileOrt() && S.me) funkOrt(S.me, true); }
    funkAnzeige();
  }
  function funkStopp() { if (window.Funk) Funk.stoppe(); F.an = false; F.sig = null; F.status = { an: false, verbunden: 0, gesamt: 0 }; }
  function funkVoll(ms = 1500, schluessel) {
    if (!F.an) return;
    const kanal = schluessel || 'aktuell';
    clearTimeout(F.timer[kanal]);
    F.timer[kanal] = setTimeout(async () => {
      delete F.timer[kanal];
      try { await Funk.sende({ v: 1, a: 'z', von: G.ich && G.ich.id, d: await packe({ chat: true }) }, schluessel); } catch (e) { /* nächster Versuch beim nächsten Anlass */ }
    }, ms);
  }
  const teileOrt = () => !!(E.teilenBis && Date.now() < E.teilenBis);
  function funkOrt(p, sofort) {
    if (!F.an || !G.ich || !p) return;
    const jetzt = Date.now();
    if (!sofort && jetzt - F.ortT < 15000) return;
    if (!sofort && F.ortP && meter(F.ortP, p) < 25 && jetzt - F.ortT < 60000) return;
    F.ortT = jetzt; F.ortP = p;
    Funk.sende({ v: 1, a: 'o', id: G.ich.id, n: meinName(), lat: +p.lat.toFixed(5), lon: +p.lon.toFixed(5), acc: Math.round(p.acc || 0), ts: jetzt }).catch(() => {});
  }
  function teilenEnde(stumm) {
    E.teilenBis = 0; speichereE();
    if (F.an && G.ich) Funk.sende({ v: 1, a: 'o', id: G.ich.id, aus: 1, ts: Date.now() }).catch(() => {});
    if (!stumm) toast('Du teilst deinen Standort nicht mehr.');
  }
  async function funkEmpfang(m, schluessel) {
    if (!m || m.v !== 1) return;
    if (typeof m.von === 'string' || typeof m.id === 'string') F.gehoert.set(m.von || m.id, Date.now());
    if (m.a === 'z' && typeof m.d === 'string') {
      let d; try { d = await entpacke(m.d); } catch (e) { return; }
      const neu = fuehreZusammen(d);
      const alt = G.k && schluessel !== G.k[0];
      if (alt || ihnenFehlt(d)) funkVoll(800 + Math.random() * 2500, alt ? schluessel : undefined);
      else if (F.timer.aktuell && !neu.length && !neu.nachrichten.length) { /* andere haben schon denselben Stand gesendet */ clearTimeout(F.timer.aktuell); delete F.timer.aktuell; }
      if (neu.schluessel) funkStart();
      const fremde = neu.nachrichten.filter((x) => !G.ich || x.von !== G.ich.id);
      if (fremde.length) {
        const x = fremde[fremde.length - 1];
        if (!(S.tab === 'gruppe' && !S.ort && document.visibilityState === 'visible')) {
          toast(`${x.n || 'Jemand'}: ${x.x}`, x.o ? { aktion: 'Ansehen', fn: () => oeffneOrt(x.o) } : { aktion: 'Öffnen', fn: () => { S.tab = 'gruppe'; S.ort = null; hoehe('gross'); zeichne(); } });
          try { if (navigator.vibrate) navigator.vibrate(60); } catch (e) { /* egal */ }
        }
      } else if (neu.pin) toast(`Angepinnt von ${G.pin.n || 'jemandem'}: ${G.pin.x}`);
      const aktiv = aktiverEigenplan();
      if (aktiv && neu.plaene.includes(S.plan.slice(2)) && aktiv.e !== (G.ich && G.ich.id)) toast(aktiv.x ? `${personName(aktiv.e)} hat den Plan „${aktiv.n}“ gelöscht.` : `${personName(aktiv.e)} hat den Plan „${aktiv.n}“ geändert.`);
      if (neu.length || neu.nachrichten.length || neu.pin !== undefined || neu.kosten || neu.plaene.length || neu.gesehen || neu.einkauf || neu.eigene) neuZeichnen();
      if (neu.eigene && !S.ort) karteZeichnen();
      leisteZahl();
      return;
    }
    if (m.a === 'w' && typeof m.von === 'string' && (!G.ich || m.von !== G.ich.id) && +m.ts > Date.now() - 600000) { woFrage(String(m.n || 'Jemand').slice(0, 40)); return; }
    if (m.a === 'o' && typeof m.id === 'string' && (!G.ich || m.id !== G.ich.id)) {
      if (m.aus) { F.leuteOrt.delete(m.id); zeichneLeute(); return; }
      const lat = +m.lat, lon = +m.lon, ts = +m.ts;
      if (!(lat > -90 && lat < 90 && lon > -180 && lon < 180) || !(ts > Date.now() - 3 * 3600e3 && ts < Date.now() + 300e3)) return;
      const alt = F.leuteOrt.get(m.id);
      if (alt && alt.ts >= ts) return;
      F.leuteOrt.set(m.id, { n: String(m.n || 'Jemand').slice(0, 40), lat, lon, acc: Math.min(+m.acc || 0, 2000), ts, r: Date.now() });
      zeichneLeute();
      if ((S.tab === 'gruppe' || S.tab === 'live') && !S.ort) neuZeichnen();
    }
  }
  // Nicht mitten ins Tippen hinein neu zeichnen
  function neuZeichnen() {
    const a = document.activeElement;
    if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && $('#blatt').contains(a)) { F.warteZeichnen = true; return; }
    if (!S.ort) zeichne({ scroll: true, karte: S.tab === 'plan' && S.plan === 'G' });
  }
  document.addEventListener('focusout', () => { if (F.warteZeichnen) setTimeout(() => { if (F.warteZeichnen) { F.warteZeichnen = false; neuZeichnen(); } }, 300); });
  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    if (teileOrt() && S.me) funkOrt(S.me); else if (E.teilenBis && !teileOrt()) teilenEnde(false);
    for (const [id, x] of F.leuteOrt) if (Date.now() - x.ts > 3 * 3600e3) F.leuteOrt.delete(id);
  }, 20000);
  setInterval(() => { if (document.visibilityState === 'visible' && F.an) funkVoll(Math.random() * 3000); }, 120000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (!F.an) funkStart(); else { Funk.pruefe(); funkVoll(1000); }
  });

  // Ort in der Gruppe teilen: Nachricht mit Ortsbezug. Der Text beginnt mit „📍 Name“, damit auch ältere Fassungen ihn verstehen.
  function nachrichtSenden(text, ortId) {
    const o = ortId && NACH_ID.get(ortId);
    let x = String(text || '').trim().slice(0, 300);
    if (o) x = x ? `📍 ${o.name}: ${x}` : `📍 ${o.name}`;
    if (!x) return false;
    const me = ich();
    const id = neueId() + Date.now().toString(36).slice(-4);
    G.nachrichten[id] = { von: G.ich.id, n: meinName(), x, t: Date.now() };
    if (o) G.nachrichten[id].o = o.id;
    me.t = Date.now();
    speichereG();
    return true;
  }
  function anpinnen(text) {
    G.pin = text ? { x: String(text).slice(0, 300), von: G.ich.id, n: meinName(), t: Date.now() } : { weg: 1, von: G.ich.id, n: meinName(), t: Date.now() };
    ich().t = Date.now(); speichereG();
  }
  const ungelesen = () => Object.values(G.nachrichten).filter((x) => (!G.ich || x.von !== G.ich.id) && x.t > speicher.get('gelesen', 0)).length;
  function leisteZahl() {
    const b = $('#leiste [data-tab="gruppe"] .pille');
    if (!b) return;
    let z = b.querySelector('.zahl');
    const n = ungelesen();
    if (!n) { if (z) z.remove(); return; }
    if (!z) { z = el('span', { class: 'zahl', 'aria-hidden': 'true' }); b.append(z); }
    z.textContent = n > 9 ? '9+' : String(n);
    $('#leiste [data-tab="gruppe"]').setAttribute('aria-label', `Gruppe, ${n} neue ${n === 1 ? 'Nachricht' : 'Nachrichten'}`);
  }

  async function teileGruppe() {
    if (!G.ich || !G.ich.name) { toast('Gib zuerst deinen Namen ein.'); return; }
    const url = await paketLink();
    const text = `${meinName()} lädt dich in unsere Lissabon-Gruppe ein. Antippen zum Beitreten:`;
    if (navigator.share) navigator.share({ title: 'Fasan Karte · Gruppe', text, url }).catch(() => {});
    else kopiere(`${text} ${url}`, 'Link kopiert. Jetzt in WhatsApp einfügen.');
  }
  async function zeigeQr() {
    if (!G.ich || !G.ich.name) { toast('Gib zuerst deinen Namen ein.'); return; }
    const url = await paketLink();
    const box = $('#qr');
    let inhalt;
    try {
      if (!window.qrcode) throw new Error('fehlt');
      let qr = window.qrcode(0, 'L');
      try { qr.addData(url); qr.make(); } catch (e) {
        // Zu viele Daten: nur Schlüssel und eigener Stand; den Rest bringt der Live-Abgleich
        qr = window.qrcode(0, 'L'); qr.addData(`${location.origin}${location.pathname}#g=${await packe({ nurIch: true })}`); qr.make();
      }
      const n = qr.getModuleCount(), rand = 4, groesse = Math.min(innerWidth - 48, innerHeight - 260, 420);
      const zelle = Math.max(1, Math.floor(groesse / (n + rand * 2)));
      const cv = el('canvas', { width: (n + rand * 2) * zelle, height: (n + rand * 2) * zelle, 'aria-label': 'QR-Code mit deinen Gruppen-Daten', role: 'img' });
      const c = cv.getContext('2d');
      c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height); c.fillStyle = '#000';
      for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (qr.isDark(r, k)) c.fillRect((k + rand) * zelle, (r + rand) * zelle, zelle, zelle);
      inhalt = cv;
    } catch (e) {
      inhalt = el('p', { style: 'max-width:320px;text-align:center' }, e.message === 'fehlt' ? 'Der QR-Code lädt nicht. Schick den Link per WhatsApp.' : 'Zu viele Daten für einen QR-Code. Schick den Link per WhatsApp.');
    }
    setze(box, el('div', { class: 'qr-karte', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'QR-Code zeigen' },
      el('strong', { style: 'font-size:var(--fs-t)' }, `${meinName()} · Gruppe`),
      inhalt,
      el('p', { style: 'margin:0;text-align:center' }, 'Die anderen öffnen ihre Handy-Kamera und richten sie auf den Code. Dann den Link antippen.'),
      el('p', { class: 'klein', style: 'margin:0;text-align:center;opacity:.75' }, 'Tipp: Bildschirm heller stellen.'),
      el('button', { type: 'button', class: 'knopf haupt breit', onclick: () => { box.hidden = true; } }, 'Fertig')));
    box.hidden = false;
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(() => {}); } catch (e) { /* egal */ }
  }

  // ---------- Aussehen ----------
  const dunkelMq = matchMedia('(prefers-color-scheme: dark)');
  function wendeAn() {
    const r = document.documentElement;
    let t = E.theme === 'system' ? (dunkelMq.matches ? 'dunkel' : 'hell') : E.theme;
    if (E.profil === 'lesbar' && E.theme === 'system') t = 'kontrast';
    r.dataset.theme = t;
    r.dataset.profil = E.profil;
    // „Weniger Bewegung“ in den Einstellungen, zusätzlich zur Systemeinstellung (prefers-reduced-motion)
    if (E.bewegung === 'wenig') r.dataset.bewegung = 'wenig'; else delete r.dataset.bewegung;
    const mc = { hell: '#F6F5F1', dunkel: '#111211', kontrast: '#000000', glas: '#0E1218' }[t];
    $$('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', mc));
  }
  dunkelMq.addEventListener('change', () => { if (E.theme === 'system') wendeAn(); });
  const speichereE = () => speicher.set('einstellungen', E);

  // Alles läuft in der App: keine Übergabe an Google Maps oder Apple Karten (Wunsch des Nutzers, 24.10.2026)
  function zielText(o) {
    if (/[()]|\sund\s|^Tram |^Fähre /.test(o.name) || o.adresse.startsWith(o.name)) return o.adresse;
    return `${o.name}, ${o.adresse}`;
  }

  // ---------- Daten ----------
  // Eigene Pläne (Reiseführer-Modus): Wer einen Plan baut, führt; alle mit offener App sehen Änderungen sofort
  const aktiverEigenplan = () => (String(S.plan).startsWith('P:') ? G.plaene[S.plan.slice(2)] || null : null);
  function fertig(o) { const p = S.tab === 'plan' || S.tab === 'live' || S.tab === undefined ? aktiverEigenplan() : null; return p && p.s.includes(o.id) ? p.d.includes(o.id) : !!mk(o.id).fertig; }
  const allePersonen = () => Object.keys(G.leute);
  const gesehenVon = (ortId) => ((G.gesehen[ortId] && G.gesehen[ortId].w) || []).filter((id) => G.leute[id]);
  const vonAllenGesehen = (ortId) => { const a = allePersonen(); const w = gesehenVon(ortId); return a.length > 1 && a.every((id) => w.includes(id)); };
  function setzeGesehen(ortId, wer) { G.gesehen[ortId] = { w: [...new Set(wer)], t: Date.now() }; speichereG(); }
  function schritte(plan = S.plan, tag = S.tag) {
    if (plan === 'G') return ORTE.length ? gruppenplan()[tag] || [] : [];
    if (String(plan).startsWith('P:')) { const p = G.plaene[plan.slice(2)]; return p && !p.x ? p.s.map((id) => NACH_ID.get(id)).filter(Boolean).map((o) => ({ ort: o.name })) : []; }
    let s = PLAENE[plan] && PLAENE[plan].tage && PLAENE[plan].tage[tag];
    if (typeof s === 'string') s = PLAENE[s] && PLAENE[s].tage && PLAENE[s].tage[tag];
    return Array.isArray(s) ? s : [];
  }
  function planStopps() {
    return schritte().filter((s) => s.ort && NACH_NAME.has(s.ort)).map((s, i) => ({ s, o: NACH_NAME.get(s.ort), nr: i + 1 }));
  }
  function inPlaenen(o) {
    const out = [];
    if (o.eigen) return out;
    for (const p of ['A', 'B', 'C']) for (const t of TAGE) {
      const st = schritte(p, t.id).filter((s) => s.ort);
      const i = st.findIndex((s) => s.ort === o.name || (s.alt || []).includes(o.name));
      if (i >= 0 && !(typeof (PLAENE[p].tage || {})[t.id] === 'string')) out.push(`Plan ${p} · ${t.kurz} · Stopp ${i + 1}`);
    }
    return out;
  }
  function status(o) {
    const z = o.infos && o.infos.oeffnungszeiten;
    return z ? window.Oeffnung.status(z) : null;
  }
  function gefiltert() {
    const q = falte(S.suche.trim());
    return ORTE.filter((o) => {
      const m = mk(o.id);
      if (m.aus && !S.extra.has('aus')) return false;
      if (q && !falte(`${o.name} ${o.kategorie} ${o.notiz} ${o.adresse} ${m.notiz || ''}`).includes(q)) return false;
      if (q) return true; // Suche schlägt Filter
      const gr = gruppeVon(o.kategorie);
      if (gr === 'foto' && !S.gruppen.has('foto')) return false; // Foto-Spots nur auf Wunsch
      if (S.gruppen.size && !S.gruppen.has(gr) && !(S.gruppen.has('foto') && o.foto)) return false;
      if (S.extra.has('tipp') && !istTipp(o)) return false;
      if (S.extra.has('fav') && !m.fav) return false;
      if (S.extra.has('offen')) { const st = status(o); if (!st || !st.offen) return false; }
      if (S.extra.has('offenNicht') && m.fertig) return false;
      if (S.extra.has('gruppe') && !gruppenStimmen(o.id).ja.length) return false;
      if (S.extra.has('eigen') && !o.eigen) return false;
      return true;
    });
  }
  function sortiert(liste) {
    const r = GRUPPEN.map((g) => g.id);
    if (S.sort === 'naehe' && S.me) return liste.slice().sort((a, b) => (hatPos(a) ? meter(S.me, a) : 1e9) - (hatPos(b) ? meter(S.me, b) : 1e9));
    return liste.slice().sort((a, b) => a.name.localeCompare(b.name, 'pt'));
  }

  // ---------- Karte ----------
  let karte = null, ebene = null, leuteEbene = null, ichPunkt = null, ichKreis = null;
  const marker = new Map();
  if (window.L) {
    karte = L.map('karte', { zoomControl: false, attributionControl: true }).setView(LISSABON, 14);
    karte.attributionControl.setPosition('topright').setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    }).addTo(karte);
    ebene = L.layerGroup().addTo(karte);
    leuteEbene = L.layerGroup().addTo(karte);
    karte.on('dragstart', () => {
      if (S.follow) { S.follow = false; gpsKnopf(); }
      if (S.ort || N.aktiv || innerWidth >= 760) return;
      if ((S.tab === 'orte' || S.tab === 'live') && S.hoehe !== 'mini') hoehe('mini');
      else if (S.hoehe === 'mitte' || S.hoehe === 'gross') hoehe('klein');
    });
    karte.on('zoomend', () => namenZoom());
    // Langes Drücken auf die Karte: hier einen eigenen Ort eintragen (sichtbarer Zwilling: „Eigenen Ort eintragen“ → „Auf der Karte wählen“)
    karte.on('contextmenu', (e) => { if (N.aktiv) return; haptik(20); eigenNeu({ lat: e.latlng.lat, lon: e.latlng.lng, plan: S.tab === 'plan' && planerOffen() ? S.planEdit : undefined }); });
    karte.on('click', () => { if (S.ort) schliesseOrt(); else if (S.tab === 'orte' || S.tab === 'live') hoehe(S.hoehe === 'mini' ? 'klein' : 'mini'); else if (S.hoehe !== 'klein') hoehe('klein'); });
  }

  // Mitreisende mit geteiltem Standort: Kreis mit Initialen, Name daneben; nach 10 Minuten blass
  function zeichneLeute() {
    if (!leuteEbene) return;
    leuteEbene.clearLayers();
    if (!karte.getPane('leute')) { const pane = karte.createPane('leute'); pane.style.zIndex = 655; }
    for (const [, x] of F.leuteOrt) {
      const alt = Date.now() - (x.r || x.ts) > 600000;
      L.marker([x.lat, x.lon], { pane: 'leute', icon: L.divIcon({ className: 'punkt person-punkt' + (alt ? ' alt' : ''), html: `<span class="p">${initialen(x.n).replace(/[<>&"]/g, '')}</span>`, iconSize: [44, 44], iconAnchor: [22, 22] }), title: x.n, zIndexOffset: 800, keyboard: false })
        .bindTooltip(`${x.n.replace(/[<>&"]/g, '')} · ${zeitHer(x.r || x.ts)}`, { permanent: true, direction: 'right', offset: [14, 0], className: 'name-label person-label', interactive: false })
        .addTo(leuteEbene);
    }
  }
  setInterval(() => { if (F.leuteOrt.size && document.visibilityState === 'visible') zeichneLeute(); }, 60000);

  function punktIcon(o, nr, opt = {}) {
    const m = mk(o.id), g = o.nah ? 'nah' : gruppeVon(o.kategorie);
    const kl = ['punkt', 'g-' + g, nr ? 'nr' : '', (o.nah ? m.fertig : fertig(o)) ? 'erledigt' : '', S.ort === o.id ? 'gewaehlt' : '', opt.naechster ? 'naechster' : ''].filter(Boolean).join(' ');
    const innen = `<svg viewBox="0 0 24 24">${symbolSvg(o)}</svg>` + (nr ? `<span class="nummer">${nr}</span>` : '');
    const marke = m.fav ? `<span class="marke herz"><svg viewBox="0 0 24 24">${SVG.herz}</svg></span>`
      : istTipp(o) ? `<span class="marke tipp"><svg viewBox="0 0 24 24">${SVG.stern}</svg></span>` : '';
    return L.divIcon({ className: kl + (opt.alt ? ' alt' : ''), html: `<span class="p">${innen}</span>${marke}`, iconSize: [60, 60], iconAnchor: [30, 30] });
  }

  function karteZeichnen(anpassen) {
    if (!karte) return;
    ebene.clearLayers(); marker.clear();
    let orte = [], nummern = new Map(), linie = [];
    let naechsterId = null;
    if (N.aktiv && N.ziel) {
      if (N.ziel.id !== 'treff') { orte.push(N.ziel); naechsterId = N.ziel.id; }
    } else if (S.tab === 'plan') {
      const nx = planStopps().find(({ o }) => !fertig(o));
      naechsterId = nx ? nx.o.id : null;
      for (const { o, nr, s } of planStopps()) {
        orte.push(o); nummern.set(o.id, nr);
        if (hatPos(o)) linie.push([o.lat, o.lon]);
        (s.alt || []).map((n) => NACH_NAME.get(n)).filter(Boolean).forEach((a) => { if (!orte.includes(a)) orte.push(a); });
      }
    } else if (S.tab === 'gruppe') {
      rangliste().forEach(({ o }, i) => { orte.push(o); nummern.set(o.id, i + 1); });
      for (const u of Object.values(G.umfragen)) u.o.map((id) => NACH_ID.get(id)).filter(Boolean).forEach((o) => { if (!orte.includes(o)) orte.push(o); });
    } else if (S.tab === 'gemerkt') {
      orte = ORTE.filter((o) => { const m = mk(o.id); return !m.aus && (m.fav || m.notiz || m.sterne || m.fertig); });
    } else if (S.tab === 'live' && !S.nah) {
      orte = ORTE.filter((o) => hatPos(o) && !mk(o.id).aus);
      const nx = liveNaechster(); naechsterId = nx ? nx.o.id : null;
    } else if (S.nah) {
      orte = [];
    } else {
      orte = gefiltert();
    }
    if (S.ort && !orte.some((o) => o.id === S.ort)) orte.push(NACH_ID.get(S.ort));
    if (linie.length > 1) L.polyline(linie, { className: 'route', color: '#9A4A1C', weight: 4, opacity: 0.85, dashArray: '1 10', lineCap: 'round', interactive: false }).addTo(ebene);
    const punkte = [];
    // Unter Live nur die Namen der nächsten Orte, sonst überdecken sich die Schilder
    const mitNamen = S.tab === 'live' && S.me ? new Set(orte.filter(hatPos).map((o) => [o.id, meter(S.me, o)]).sort((a, b) => a[1] - b[1]).slice(0, 5).map(([id]) => id).concat(naechsterId ? [naechsterId] : [])) : null;
    for (const o of orte) {
      if (!hatPos(o)) continue;
      const nr = nummern.get(o.id);
      const mm = L.marker([o.lat, o.lon], { icon: punktIcon(o, nr, { naechster: o.id === naechsterId }), title: o.name, alt: o.name, keyboard: true, riseOnHover: true, zIndexOffset: o.id === naechsterId ? 800 : nr ? 400 : 0 })
        .on('click', (e) => { L.DomEvent.stopPropagation(e); oeffneOrt(o.id); })
        .addTo(ebene);
      if (!mitNamen || mitNamen.has(o.id)) mm.bindTooltip(o.name, { permanent: true, direction: 'right', offset: [18, 0], className: 'name-label', interactive: false });
      marker.set(o.id, mm);
      punkte.push([o.lat, o.lon]);
    }
    const tp = treffOrt();
    if (tp) L.marker([tp.lat, tp.lon], { icon: L.divIcon({ className: 'punkt treffpunkt', html: `<span class="p"><svg viewBox="0 0 24 24">${SYMBOL.treff}</svg></span>`, iconSize: [60, 60], iconAnchor: [30, 30] }), title: tp.name, zIndexOffset: 900 })
      .bindTooltip(`${G.treff.zeit} · ${G.treff.name}`, { permanent: true, direction: 'right', offset: [18, 0], className: 'name-label treff-label', interactive: false })
      .on('click', (e) => { L.DomEvent.stopPropagation(e); starteNavi(tp, true); }).addTo(ebene);
    if ((S.tab === 'orte' || S.tab === 'live') && S.nah && !S.ort && !N.aktiv) {
      const l = nahListe(S.nah);
      l.forEach((o, i) => {
        const mm = L.marker([o.lat, o.lon], { icon: L.divIcon({ className: 'punkt g-nah nah-punkt' + (S.nahWahl === o.id ? ' gewaehlt' : ''), html: `<span class="p"><svg viewBox="0 0 24 24">${SYMBOL[o.typ]}</svg></span>`, iconSize: [52, 52], iconAnchor: [26, 26] }), title: o.name, alt: o.name, keyboard: true, zIndexOffset: S.nahWahl === o.id ? 900 : 300 - i })
          .on('click', (e) => { L.DomEvent.stopPropagation(e); waehleNah(o, true); })
          .addTo(ebene);
        // Namen nur an den drei nächsten und am gewählten, sonst überdecken sie sich
        if (i < 3 || S.nahWahl === o.id) mm.bindTooltip(o.name.replace(/[<>&"]/g, ''), { permanent: true, direction: 'right', offset: [16, 0], className: 'name-label', interactive: false });
      });
      if (anpassen && l.length) passeAn(l.slice(0, 6).map((o) => [o.lat, o.lon]));
    }
    if (eigenAktiv() && S.eigen.lat != null && !S.ort) {
      const nadel = L.marker([S.eigen.lat, S.eigen.lon], { draggable: true, autoPan: true, zIndexOffset: 1200, title: 'Neuer Ort, zum Verschieben ziehen', alt: 'Neuer Ort',
        icon: L.divIcon({ className: 'eigen-nadel', html: '<span class="kopf"></span><span class="spitze"></span>', iconSize: [60, 60], iconAnchor: [30, 56] }) })
        .on('dragend', (e) => { const ll = e.target.getLatLng(); S.eigen.lat = ll.lat; S.eigen.lon = ll.lng; haptik(); })
        .addTo(ebene);
      if (anpassen) zeigeAufKarte(S.eigen, Math.max(karte.getZoom(), 17));
      void nadel;
    }
    if (anpassen && punkte.length && !S.follow && !S.ort && S.tab !== 'live' && !S.eigen) passeAn(punkte);
    namenZoom();
  }
  // Namen an den Punkten erst ab näherem Zoom, sonst wird es unübersichtlich
  function namenZoom() {
    if (!karte) return;
    const z = karte.getZoom(), k = karte.getContainer().classList;
    k.toggle('namen', z >= (S.tab === 'plan' || N.aktiv ? 15 : 16));
    // Weit draußen überlagern sich 60-px-Symbole; dann kleinere Punkte (Trefferfläche bleibt 60 px)
    k.toggle('weit', z <= 14); k.toggle('mittel', z === 15);
  }

  function blattPx() { return $('#blatt').getBoundingClientRect().height; }
  function passeAn(punkte) {
    // Eigener Standort bleibt sichtbar, wenn er in der Nähe ist (sonst verschwindet beim Planwechsel der blaue Punkt)
    if (S.me && punkte.length && meter(S.me, { lat: punkte[0][0], lon: punkte[0][1] }) < 15000) punkte = punkte.concat([[S.me.lat, S.me.lon]]);
    const unten = blattPx() + $('#leiste').offsetHeight + 12;
    if (punkte.length === 1) { zeigeAufKarte({ lat: punkte[0][0], lon: punkte[0][1] }, 16); return; }
    karte.fitBounds(punkte, { paddingTopLeft: [28, 48], paddingBottomRight: [28 + (innerWidth >= 760 ? 440 : 0), unten], maxZoom: 16, animate: true });
  }
  // Kartenmitte so verschieben, dass der Punkt im sichtbaren Teil über dem Blatt liegt
  function mitteFuer(o, z) {
    const versatz = innerWidth >= 760 ? [-220, 0] : [0, (blattPx() + $('#leiste').offsetHeight - 48) / 2];
    return karte.unproject(karte.project([o.lat, o.lon], z).add(versatz), z);
  }
  function zeigeAufKarte(o, zoom) {
    if (!karte || !hatPos(o)) return;
    const z = zoom || Math.max(karte.getZoom(), 16);
    karte.setView(mitteFuer(o, z), z, { animate: true });
  }

  // ---------- Blatt ----------
  // Rasten wie bei Apple Karten: mini (Suche und Kategorien), klein (Vorschau mit Aktion), mitte, groß.
  // Recherche: docs/recherche/2026-10-24-natives-gefuehl.md
  const STUFEN = ['mini', 'klein', 'mitte', 'gross'];
  function stufenPx() {
    const vh = innerHeight, nav = $('#leiste').offsetHeight, extra = E.profil === 'standard' ? 0 : 36;
    const oben = parseFloat(getComputedStyle(document.documentElement).paddingTop) || 0;
    const gross = vh - nav - (innerWidth >= 760 ? 48 : 56 + oben);
    return { mini: Math.min(miniPx(), 300), klein: Math.min(300 + extra, gross), mitte: Math.round(vh * 0.55), gross };
  }
  // Mini: Griff, Suche und unter „Orte“ die erste Zeile (Kategorien bzw. „In der Nähe“)
  function miniPx() {
    const blatt = $('#blatt'), ansicht = $('#ansicht');
    const kopf = ansicht.getBoundingClientRect().top - blatt.getBoundingClientRect().top;
    const erstes = S.ort ? null : S.tab === 'orte' ? ansicht.querySelector('.chips') : S.tab === 'live' && !S.nah ? ansicht.querySelector('.live-mini') : null;
    return Math.round(Math.max(110, kopf + (erstes ? erstes.getBoundingClientRect().height + 4 : 6)));
  }
  function setzeBlatt(px) { document.documentElement.style.setProperty('--blatt-h', `${Math.round(px)}px`); }
  function hoehe(h, opt = {}) {
    if (!STUFEN.includes(h)) h = 'klein';
    const vorher = S.hoehe;
    S.hoehe = h;
    if (h === 'mini') $('#ansicht').scrollTop = 0;
    setzeBlatt(stufenPx()[h]);
    document.body.dataset.blatt = h;
    if (h === 'klein') passeKleinAn();
    $('#griff').setAttribute('aria-label', h === 'gross' ? 'Blatt verkleinern' : 'Blatt vergrößern');
    if (opt.spuerbar && vorher !== h) haptik();
  }
  // Im kleinen Zustand soll der wichtigste Knopf ganz zu sehen sein (Google-Maps-Muster: Vorschau mit Aktion)
  function passeKleinAn() {
    if (S.hoehe !== 'klein' || innerWidth >= 760) return;
    requestAnimationFrame(() => {
      const ziel = $('#ansicht .zusammen .knopf.haupt') || $('#ansicht .zusammen');
      if (!ziel) return;
      const kopf = $('#ansicht').getBoundingClientRect().top - $('#blatt').getBoundingClientRect().top;
      const unten = ziel.getBoundingClientRect().bottom - $('#ansicht').getBoundingClientRect().top + $('#ansicht').scrollTop;
      setzeBlatt(Math.min(Math.round(innerHeight * 0.5), Math.max(200, Math.round(kopf + unten + 14))));
    });
  }
  const groesser = () => hoehe(STUFEN[Math.min(3, STUFEN.indexOf(S.hoehe) + 1)], { spuerbar: true });
  const kleiner = () => hoehe(STUFEN[Math.max(0, STUFEN.indexOf(S.hoehe) - 1)], { spuerbar: true });

  // Spürbare Rückmeldung (Android; iOS Safari kennt navigator.vibrate nicht)
  function haptik(ms = 8) { try { if (navigator.vibrate && !matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate(ms); } catch (e) { /* egal */ } }

  // Feder als CSS-Kurve: gedämpfte Schwingung x(t) = 1 − e^(−ζωt)(cos ω_d t + ζω/ω_d · sin ω_d t), als linear()-Punkte
  (function feder() {
    // Werte laut Recherche (natives-gefuehl.md): response 0,35 s, Dämpfung 0,85–1; bei „Bewegung reduzieren“ ohne Überschwingen
    const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const antwort = 0.35, daempfung = ruhig ? 1 : 0.88;
    const w = (2 * Math.PI) / antwort, wd = w * Math.sqrt(Math.max(1e-6, 1 - daempfung ** 2));
    const x = daempfung >= 1 ? (t) => 1 - Math.exp(-w * t) * (1 + w * t)
      : (t) => 1 - Math.exp(-daempfung * w * t) * (Math.cos(wd * t) + ((daempfung * w) / wd) * Math.sin(wd * t));
    let dauer = 0.2;
    while (dauer < 1.5 && (Math.abs(1 - x(dauer)) > 0.002 || Math.abs(1 - x(dauer - 0.05)) > 0.002)) dauer += 0.02;
    const punkte = []; for (let i = 0; i <= 32; i++) punkte.push(+x((dauer * i) / 32).toFixed(4));
    punkte[punkte.length - 1] = 1;
    if (window.CSS && CSS.supports && CSS.supports('transition-timing-function', 'linear(0, 1)')) {
      document.documentElement.style.setProperty('--feder', `linear(${punkte.join(', ')})`);
      document.documentElement.style.setProperty('--feder-zeit', `${Math.round(dauer * 1000)}ms`);
    }
  })();

  // ---------- Ansichten ----------
  function zeichne(opt = {}) {
    const leisteTab = S.tab === 'gemerkt' ? 'orte' : S.tab === 'info' ? 'mehr' : S.tab;
    $$('#leiste [data-tab]').forEach((b) => { if (b.dataset.tab === leisteTab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    const box = $('#ansicht');
    const scroll = opt.scroll ? box.scrollTop : 0;
    const ansichtNeu = `${S.tab}|${S.ort || ''}|${S.nah || ''}|${planerOffen() ? 'pl' + PL.modus : ''}|${eigenAktiv() ? 'e' : ''}`;
    if (S.letzteAnsicht && S.letzteAnsicht !== ansichtNeu) { box.classList.remove('neu'); void box.offsetWidth; box.classList.add('neu'); }
    S.letzteAnsicht = ansichtNeu;
    // Suchfeld nur, wo gesucht wird (Plan, Orte); unter Live, Gruppe und Mehr wäre es nur Ablenkung
    $('.blatt-kopf').hidden = !!S.ort || ['live', 'gruppe', 'mehr', 'info'].includes(S.tab) || eigenAktiv() || (S.tab === 'plan' && planerOffen());
    if (S.ort) zeichneOrt(box);
    else if (S.tab === 'plan') (eigenAktiv() ? zeichneEigen(box) : planerOffen() ? zeichnePlaner(box) : zeichnePlan(box));
    else if (S.tab === 'live') (S.nah ? zeichneNah(box) : zeichneLive(box));
    else if (S.tab === 'info') zeichneInfo(box);
    else if (S.tab === 'orte') (eigenAktiv() ? zeichneEigen(box) : S.nah ? zeichneNah(box) : zeichneOrte(box));
    else if (S.tab === 'gemerkt') zeichneGemerkt(box);
    else if (S.tab === 'gruppe') zeichneGruppe(box);
    else zeichneMehr(box);
    box.scrollTop = scroll;
    passeKleinAn();
    if (S.hoehe === 'mini') setzeBlatt(stufenPx().mini);
    if (opt.karte !== false) karteZeichnen(opt.anpassen);
  }

  function eintragOrt(o, opt = {}) {
    const m = mk(o.id), g = gruppeVon(o.kategorie), st = status(o);
    const unter = [o.kategorie];
    if (o.ort && o.ort !== 'Lisboa') unter.push(o.ort);
    if (S.me && hatPos(o)) { const d = meter(S.me, o); unter.push(d > 2500 ? `${strecke(d)} · Bahn oder Bus` : `${strecke(d)} · ${gehzeit(d)} Min.`); }
    if (o.dauer) unter.push(`vor Ort ${o.dauer} Min.`);
    if (o.eigen) unter.push('eigener Ort');
    // Essen laut „Über dich“: vegetarische/vegane Angebote laut OpenStreetMap hervorheben
    if ((E.essen === 'vegetarisch' || E.essen === 'vegan') && o.infos && ['essen', 'veggie'].includes(gruppeVon(o.kategorie))) {
      const vg = E.essen === 'vegan' ? o.infos.vegan : o.infos.vegetarisch || o.infos.vegan;
      if (vg === 'yes' || vg === 'only') unter.push(E.essen === 'vegan' ? 'vegan möglich (OSM)' : 'vegetarisch möglich (OSM)');
    }
    const gm = gruppeMark(o.id).fav.length;
    if (gm) unter.push(`♥ ${gm} in der Gruppe`);
    const gw = gesehenVon(o.id).length, ga = allePersonen().length;
    if (gw && ga > 1) unter.push(gw >= ga ? 'alle waren da' : `${gw} von ${ga} waren da`);
    const gs = gruppenStimmen(o.id);
    if (gs.ja.length || gs.nein.length) unter.push(`👍 ${gs.ja.length}${gs.nein.length ? ` 👎 ${gs.nein.length}` : ''}`);
    const offen = st ? el('span', { class: 'status ' + (st.offen ? 'offen' : 'zu') }, st.offen ? `offen bis ${st.bis}` : st.naechste ? `zu, öffnet ${st.naechste}` : 'geschlossen') : null;
    const zeichen = el('span', { class: 'zeichen' },
      m.fav ? ic('herz') : null, istTipp(o) ? ic('stern') : null, m.notiz ? ic('notiz') : null);
    zeichen.querySelectorAll('svg').forEach((s, i) => { s.style.fill = 'none'; s.style.stroke = 'currentColor'; s.style.strokeWidth = '2'; });
    const marker = el('span', { class: 'marker g-' + g }, symbol(o), opt.nr ? el('span', { class: 'nummer' }, String(opt.nr)) : null);
    const li = el('li', { class: 'eintrag' + (fertig(o) ? ' erledigt' : '') },
      el('button', { type: 'button', class: 'auf', onclick: () => oeffneOrt(o.id, true) },
        marker,
        el('span', { class: 'text' },
          el('span', { class: 'titel' }, opt.zeit ? el('span', { class: 'zeit' }, opt.zeit + ' ') : null, o.name, zeichen),
          opt.text ? el('span', { class: 'unter', style: 'color:var(--text);font-weight:600' }, opt.text) : null,
          el('span', { class: 'unter' }, unter.join(' · '), offen ? ' · ' : '', offen)),
        opt.ohneBild ? null : bildKachel(o)),
      opt.haken ? el('button', {
        type: 'button', class: 'haken', 'aria-pressed': String(fertig(o)), 'aria-label': `${o.name} als erledigt markieren`,
        onclick: () => schalteErledigt(o),
      }, ic('haken')) : null);
    return li;
  }

  function schalteErledigt(o) {
    const p = aktiverEigenplan(), imPlan = p && p.s.includes(o.id) && S.tab === 'plan';
    const vorher = fertig(o);
    markiere(o.id, { fertig: !vorher });
    if (imPlan) { p.d = !vorher ? [...new Set([...p.d, o.id])] : p.d.filter((x) => x !== o.id); p.t = Date.now(); p.e = G.ich && G.ich.id; }
    const gruppe = G.ich && G.ich.name && allePersonen().length > 1;
    if (G.ich && G.ich.name) { const w = gesehenVon(o.id); setzeGesehen(o.id, !vorher ? [...w, G.ich.id] : w.filter((x) => x !== G.ich.id)); } else if (imPlan) speichereG();
    haptik(12);
    zeichne({ scroll: true });
    const n = !vorher && S.tab === 'plan' ? planStopps().find(({ o: x }) => !fertig(x)) : null;
    if (!vorher && gruppe) {
      toast(`Erledigt${n ? `. Weiter: ${n.o.name}` : ''}. Waren alle dabei?`, { aktion: 'Alle dabei', fn: () => { setzeGesehen(o.id, allePersonen()); zeichne({ scroll: true }); toast('Für alle als gesehen markiert.'); } });
    } else {
      toast(!vorher ? (n ? `Erledigt. Weiter zu: ${n.o.name}` : 'Erledigt.') : 'Wieder offen.', { aktion: 'Rückgängig', fn: () => schalteErledigt(o) });
    }
  }
  // „Gesehen von“: wer bei einem Ort dabei war, wenn sich die Gruppe teilt
  function gesehenBlock(o) {
    const alle = allePersonen();
    if (!G.ich || !G.ich.name || alle.length < 2) return null;
    const w = gesehenVon(o.id), fehlt = alle.filter((id) => !w.includes(id));
    const satz = !w.length ? 'Noch von niemandem gesehen.' : !fehlt.length ? 'Von allen gesehen.' : `Gesehen von ${w.map(personName).join(', ')}. Noch nicht: ${fehlt.map(personName).join(', ')}.`;
    return el('section', { class: 'abschnitt' }, el('h3', {}, 'Wer war schon da?'),
      el('p', { style: 'margin:0 0 8px' }, satz),
      el('div', { class: 'chips' },
        alle.map((id) => el('button', { type: 'button', class: 'chip', 'aria-pressed': String(w.includes(id)), onclick: () => { setzeGesehen(o.id, w.includes(id) ? w.filter((x) => x !== id) : [...w, id]); haptik(); zeichne({ scroll: true, karte: false }); } }, personName(id))),
        el('button', { type: 'button', class: 'chip', onclick: () => { setzeGesehen(o.id, fehlt.length ? alle : []); haptik(); zeichne({ scroll: true, karte: false }); } }, fehlt.length ? 'Alle' : 'Keiner')),
      el('p', { class: 'leise klein', style: 'margin:6px 0 0' }, 'Was nicht alle gesehen haben, schlägt der Gruppenplan weiter vor.'));
  }

  // ---------- Wetter: wetter.json entsteht im Bauprozess (tools/wetter.py), die Handys fragen keinen Wetterdienst ----------
  let W = null;
  // WMO-Wettercodes laut Open-Meteo-Doku (open-meteo-website, wmo-codes-table.svelte, abgerufen 24.10.2026)
  const WMO = (c) => (c === 0 ? ['☀️', 'Klar'] : c === 1 ? ['🌤️', 'Überwiegend klar'] : c === 2 ? ['⛅', 'Teils bewölkt'] : c === 3 ? ['☁️', 'Bedeckt']
    : c === 45 || c === 48 ? ['🌫️', 'Nebel'] : c >= 51 && c <= 57 ? ['🌦️', 'Niesel'] : c >= 61 && c <= 67 ? ['🌧️', 'Regen']
      : (c >= 71 && c <= 77) || c === 85 || c === 86 ? ['🌨️', 'Schnee'] : c >= 80 && c <= 82 ? ['🌦️', 'Schauer'] : c >= 95 ? ['⛈️', 'Gewitter'] : ['', '']);
  const zeitpunkt = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(s || ''); return m ? `${m[3]}.${m[2]}. ${m[4]}:${m[5]}` : ''; };
  function wetterTeil(tagId) {
    if (!W) return null;
    const tag = TAGE.find((t) => t.id === tagId);
    const ip = W.ipma && (W.ipma.tage || []).find((x) => x.datum === tag.datum);
    const std = ((W.om && W.om.stunden) || []).filter((x) => x.t.startsWith(tag.datum) && +x.t.slice(11, 13) >= 8 && +x.t.slice(11, 13) <= 22);
    const sonne = ((W.om && W.om.sonne) || []).find((x) => x.datum === tag.datum);
    if (!ip && !std.length) return null;
    const jetztH = tag.datum === iso ? new Date().getHours() : 0;
    const regenAb = std.find((x) => x.regen >= 60 && +x.t.slice(11, 13) >= jetztH);
    const mittag = std.filter((x) => +x.t.slice(11, 13) >= 10 && +x.t.slice(11, 13) <= 18).map((x) => x.code);
    const haeufig = mittag.sort((a, b) => mittag.filter((v) => v === b).length - mittag.filter((v) => v === a).length)[0];
    const [emo] = WMO(haeufig != null ? haeufig : -1);
    const alt = W.stand && Date.now() - Date.parse(W.stand) > 6 * 3600e3;
    const kopf = [ip ? `${Math.round(ip.min)}–${Math.round(ip.max)} °C` : null, ip ? `Regen ${ip.regen} %` : null, ip && ip.text ? ip.text : null].filter(Boolean).join(' · ');
    return el('section', { class: 'wetter' + (alt ? ' alt' : ''), 'aria-label': `Wetter ${tag.lang}` },
      el('div', { class: 'w-kopf' }, emo ? el('span', { class: 'w-emo', 'aria-hidden': 'true' }, emo) : null,
        el('div', {}, el('strong', {}, kopf || 'Wetter'), sonne ? el('small', {}, `Sonnenaufgang ${sonne.auf} · Sonnenuntergang ${sonne.unter}`) : null)),
      std.length ? el('ol', { class: 'w-stunden', 'aria-label': 'Stündlich' }, std.filter((x, i) => i % 2 === 0).map((x) => {
        const [e, txt] = WMO(x.code);
        return el('li', { 'aria-label': `${x.t.slice(11, 13)} Uhr: ${txt}, ${Math.round(x.temp)} Grad, Regen ${x.regen} Prozent` },
          el('small', {}, x.t.slice(11, 13)), el('span', { 'aria-hidden': 'true' }, e), el('b', {}, `${Math.round(x.temp)}°`), el('small', { class: x.regen >= 50 ? 'nass' : '' }, x.regen >= 20 ? `${x.regen} %` : ' '));
      })) : null,
      regenAb ? el('p', { class: 'hilfe', style: 'margin:0' }, el('span', {}, `Regen wahrscheinlich ab ${+regenAb.t.slice(11, 13)} Uhr (${regenAb.regen} %). Für drinnen: Museen, Markthallen, Shoppen.`)) : null,
      tagId === 'sa' ? el('p', { class: 'klein', style: 'margin:0' }, 'Heute Nacht endet die Sommerzeit: Um 2 Uhr springen die Uhren auf 1 Uhr zurück. Handys stellen sich selbst um. Ab Sonntag wird es eine Stunde früher dunkel (EU-Richtlinie 2000/84/EG).') : null,
      el('p', { class: 'leise klein', style: 'margin:0' }, alt ? el('b', {}, 'Veraltet. ') : null,
        [ip ? `Tag: IPMA${W.ipma.aktualisiert ? `, Stand ${zeitpunkt(W.ipma.aktualisiert)}` : ''}` : null, std.length ? `Stunden: Open-Meteo (CC BY 4.0)` : null].filter(Boolean).join(' · '),
        W.stand ? ` · abgerufen ${uhrzeit(Date.parse(W.stand))}` : ''));
  }

  function zeichnePlan(box) {
    const ep = aktiverEigenplan();
    const plan = S.plan === 'G' ? { titel: 'Gruppenplan', untertitel: '' } : ep ? { titel: `„${ep.n}“`, untertitel: `Reiseführer: ${personName(ep.von)}` } : PLAENE[S.plan] || { titel: 'Plan ' + S.plan, untertitel: '' };
    const tag = TAGE.find((t) => t.id === S.tag);
    const stopps = planStopps();
    const nFertig = stopps.filter(({ o }) => fertig(o)).length;
    const naechster = stopps.find(({ o }) => !fertig(o));

    let zusammen;
    if (naechster) {
      const { o, s, nr } = naechster;
      const d = S.me && hatPos(o) ? meter(S.me, o) : null;
      zusammen = el('div', { class: 'zusammen' },
        el('button', { type: 'button', class: 'naechst-karte g-' + gruppeVon(o.kategorie), onclick: () => oeffneOrt(o.id, true), 'aria-label': `Nächster Stopp: ${o.name}. Details öffnen` },
          bildKachel(o, 'gross'),
          el('span', { class: 'naechst-text' },
            el('small', {}, `Nächster Stopp ${nr} von ${stopps.length}${s.zeit ? ` · ${s.zeit} Uhr` : ''}`),
            el('strong', {}, o.name),
            el('span', { class: 'naechst-art' }, el('span', { class: 'marker g-' + gruppeVon(o.kategorie) }, symbol(o)), TYP_NAME[o.typ] || o.kategorie,
              d != null ? (d > 2500 ? ` · ${strecke(d)}, besser mit Bahn oder Bus` : ` · ${gehzeit(d)} Min. zu Fuß`) : ''))),
        el('button', { type: 'button', class: 'knopf haupt breit', onclick: () => starteNavi(o) }, ic('route'), 'Hinführen'),
        hilfe('hinfuehren', '„Hinführen“ zeigt den Fußweg auf der Karte und sagt jede Abbiegung an. Am Ziel hakst du den Stopp ab.'));
    } else if (S.plan === 'G' && !stopps.length) {
      zusammen = el('div', { class: 'leer' }, fasan(), el('strong', {}, 'Der Gruppenplan entsteht aus euren Stimmen.'),
        el('span', {}, 'Stimmt bei Orten mit „Will hin“ ab. Unter „Gruppe“ gleicht sich das ab. Dann baut die App die Tage: passende Orte nach Nähe, Öffnungstagen und mit Essen.'),
        el('button', { type: 'button', class: 'knopf', onclick: () => { S.tab = 'gruppe'; hoehe('gross'); zeichne(); } }, ic('gruppe'), 'Zur Gruppe'));
    } else {
      zusammen = el('div', { class: 'leer' }, fasan(), el('strong', {}, stopps.length ? 'Alles erledigt für heute.' : 'Für diesen Tag gibt es keine Stopps.'));
    }

    const tageSeg = el('div', { class: 'segmente', role: 'group', 'aria-label': 'Tag' },
      TAGE.map((t) => el('button', { type: 'button', 'aria-pressed': String(t.id === S.tag), onclick: () => { S.tag = t.id; speicher.set('tag', S.tag); zeichne({ anpassen: true }); } }, t.kurz)));
    const waehle = (p) => { S.plan = p; S.planEdit = null; speicher.set('plan', p); haptik(); zeichne({ anpassen: true }); };
    const eigene = Object.entries(G.plaene).filter(([, x]) => !x.x).sort((a, b) => b[1].t - a[1].t);
    const planSeg = el('div', { class: 'chips plan-chips', role: 'group', 'aria-label': 'Plan' },
      ['A', 'B', 'C', 'G'].map((p) => el('button', { type: 'button', class: 'chip', 'aria-pressed': String(p === S.plan), onclick: () => waehle(p) }, p === 'G' ? 'Gruppenplan' : 'Plan ' + p)),
      eigene.map(([id, x]) => el('button', { type: 'button', class: 'chip eigen', 'aria-pressed': String(S.plan === 'P:' + id), onclick: () => waehle('P:' + id) }, el('span', { class: 'marker person mini' }, initialen(personName(x.von))), x.n)),
      el('button', { type: 'button', class: 'chip', onclick: () => neuerPlan() }, '+ Eigener Plan'));
    const editor = ep ? el('div', { class: 'reihe', style: 'margin-top:8px' },
      el('button', { type: 'button', class: 'knopf haupt breit', onclick: () => { S.planEdit = S.plan.slice(2); PL.modus = 'liste'; hoehe('mitte'); zeichne({ karte: false }); } }, ic('notiz'), 'Plan bearbeiten')) : null;

    const liste = el('ol', { class: 'liste' });
    let nr = 0, vorher = null;
    for (const s of schritte()) {
      if (s.hinweis) { liste.append(el('li', { class: 'hinweis' }, el('span', { class: 'pfeil' }, '↓'), s.hinweis)); continue; }
      const o = NACH_NAME.get(s.ort);
      if (!o) continue;
      const w = vorher ? wegInfo(vorher, o) : null;
      if (w) liste.append(el('li', { class: 'weg-zeile' + (w.art === 'weg' ? '' : ' geschaetzt') }, el('span', { class: 'pfeil' }, '↓'), wegText(w)));
      vorher = o;
      nr += 1;
      liste.append(eintragOrt(o, { nr, zeit: s.zeit, text: s.text, haken: true }));
      for (const a of (s.alt || []).map((n) => NACH_NAME.get(n)).filter(Boolean)) {
        const alt = eintragOrt(a, { text: 'Oder hier' });
        alt.style.paddingLeft = '28px';
        liste.append(alt);
      }
    }
    setze(box,
      pinKarte(),
      treffKarte(),
      zusammen,
      el('div', { class: 'abschnitt', style: 'display:grid;gap:8px' }, tageSeg, planSeg),
      editor,
      wetterTeil(S.tag),
      el('p', { class: 'leise klein', style: 'margin:12px 0 0' }, S.plan === 'G' ? `Gruppenplan aus ${Object.keys(G.leute).length} ${Object.keys(G.leute).length === 1 ? 'Person' : 'Personen'}: passt sich bei jedem Abgleich an. Zeiten sind geschätzt. ${tag.lang}.` : `${plan.titel}: ${plan.untertitel}. ${tag.lang}.`),
      stopps.length ? el('div', { class: 'fortschritt', style: 'margin-top:10px', 'aria-label': `${nFertig} von ${stopps.length} erledigt` }, el('span', { style: `width:${(nFertig / stopps.length) * 100}%` })) : null,
      stopps.length ? el('p', { class: 'leise klein', style: 'margin:10px 0 0' }, 'Die App führt euch Stopp für Stopp. Am Ziel geht es mit einem Tipp zum nächsten.') : null,
      stopps.length ? zeitleisteTeil(stopps) : null,
      streckeTeil(stopps),
      el('div', { class: 'reihe', style: 'margin-top:12px' }, heimKnopf()),
      bonKnopf({ klein: true, titel: 'Kassenzettel scannen und teilen' }),
      liste);
  }

  // ---------- Strecke und Höhenmeter (Wunsch 24.10.2026) ----------
  // Feste Pläne: Fußwege, Länge, Zeit, Anstieg und Abstieg rechnet der Bauprozess (wege.json, tools/wege.py).
  // Sonst: Luftlinie × 1,3 als Schätzung und nur der Höhenunterschied Start–Ziel, denn Anstieg und Abstieg brauchen
  // den echten Weg (Recherche hoehendaten.md, Abschnitt 3). „Genaue Wege berechnen“ holt Fußwege bei Valhalla (FOSSGIS)
  // und rechnet die Höhenmeter hier aus dem Raster (Copernicus GLO-30): alle 15 m abtasten, Hysterese 5 m (BRouter).
  let WEGE = null, wegeLaedt = false, RASTER = null, rasterLaedt = null;
  const TEMPO_KMH = () => (E.tempo === 'gemuetlich' ? 4 : 5.1);
  function ladeWege() {
    if (WEGE || wegeLaedt) return;
    wegeLaedt = true;
    fetch('wege.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).then((d) => { WEGE = d && d.wege ? d : { wege: {}, h: {} }; })
      .catch(() => { WEGE = { wege: {}, h: {} }; })
      .finally(() => { wegeLaedt = false; if ((S.tab === 'plan' || S.tab === 'live') && !S.ort) zeichne({ scroll: true, karte: false }); });
  }
  function ladeRaster() {
    if (RASTER) return Promise.resolve(RASTER);
    if (!rasterLaedt) rasterLaedt = (async () => {
      const k = await fetch('hoehe.json').then((r) => r.json());
      const gz = await fetch('hoehe.bin').then((r) => r.arrayBuffer());
      const roh = await new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      const a = new Int16Array(roh);
      for (let r = 0; r < k.hoehe; r++) { const o = r * k.breite; for (let c = 1; c < k.breite; c++) a[o + c] += a[o + c - 1]; }
      RASTER = { k, a }; return RASTER;
    })().catch((e) => { rasterLaedt = null; throw e; });
    return rasterLaedt;
  }
  function hoeheAn(R, lat, lon) {
    const k = R.k, x = (lon - k.west) / k.dx - 0.5, y = (k.nord - lat) / k.dy - 0.5;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    if (x0 < 0 || y0 < 0 || x0 + 1 >= k.breite || y0 + 1 >= k.hoehe) return null;
    const fx = x - x0, fy = y - y0, g = (r, c) => R.a[r * k.breite + c] * k.skala;
    return g(y0, x0) * (1 - fx) * (1 - fy) + g(y0, x0 + 1) * fx * (1 - fy) + g(y0 + 1, x0) * (1 - fx) * fy + g(y0 + 1, x0 + 1) * fx * fy;
  }
  function hoehenmeter(R, pts) {
    const hs = []; let rest = 0;
    hs.push(hoeheAn(R, pts[0][0], pts[0][1]));
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], d = meter({ lat: a[0], lon: a[1] }, { lat: b[0], lon: b[1] });
      let t = 15 - rest;
      while (t <= d) { const f = t / d; hs.push(hoeheAn(R, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)); t += 15; }
      rest = d - (t - 15);
    }
    hs.push(hoeheAn(R, pts[pts.length - 1][0], pts[pts.length - 1][1]));
    const h = hs.filter((x) => x != null);
    let auf = 0, ab = 0, ref = h[0];
    for (const x of h.slice(1)) { if (x - ref >= 5) { auf += x - ref; ref = x; } else if (ref - x >= 5) { ab += ref - x; ref = x; } }
    return { auf: Math.round(auf), ab: Math.round(ab) };
  }
  const wegCache = () => speicher.get('wege', {});
  function hoeheVon(o) { const h = WEGE && WEGE.h && WEGE.h[o.id]; return h != null ? h : RASTER ? hoeheAn(RASTER, o.lat, o.lon) : null; }
  function wegInfo(a, b) {
    if (!hatPos(a) || !hatPos(b) || a.id === b.id) return null;
    const key = `${a.id}>${b.id}`, luft = meter(a, b);
    const w = (WEGE && WEGE.wege[key]) || wegCache()[key];
    if (w) return { art: 'weg', m: w[0], min: Math.max(1, Math.round((w[1] / 60) * (5.1 / TEMPO_KMH()))), auf: w[2], ab: w[3], key };
    if (luft > 2500) return { art: 'bahn', m: luft, key };
    const ha = hoeheVon(a), hb = hoeheVon(b);
    return { art: 'luft', m: luft * 1.3, min: gehzeit(luft), dh: ha != null && hb != null ? Math.round(hb - ha) : null, key, a, b };
  }
  function wegText(w) {
    if (w.art === 'weg') return `${w.min} Min. · ${strecke(w.m)} · ↑ ${w.auf} m ↓ ${w.ab} m`;
    if (w.art === 'bahn') return `${strecke(w.m)} Luftlinie · besser mit Bahn oder Bus`;
    return `etwa ${strecke(w.m)} · ${w.min} Min. (geschätzt)${w.dh != null ? ` · Höhe ${w.dh >= 0 ? '+' : '−'}${Math.abs(w.dh)} m` : ''}`;
  }
  function tagesStrecke(stopps) {
    let m = 0, auf = 0, ab = 0, geschaetzt = [], bahn = 0;
    for (let i = 1; i < stopps.length; i++) {
      const w = wegInfo(stopps[i - 1].o, stopps[i].o); if (!w) continue;
      if (w.art === 'weg') { m += w.m; auf += w.auf; ab += w.ab; } else if (w.art === 'luft') { m += w.m; geschaetzt.push(w); } else bahn += 1;
    }
    return { m, auf, ab, geschaetzt, bahn };
  }
  async function wegeBerechnen(liste) {
    if (!liste.length) return;
    S.wegeRechnen = { fertig: 0, gesamt: liste.length }; zeichne({ scroll: true, karte: false });
    try {
      const R = await ladeRaster();
      const c = wegCache();
      for (const w of liste) {
        try {
          const r = await holeRoute(w.a, w.b);
          const hm2 = hoehenmeter(R, r.pts);
          c[w.key] = [Math.round(r.laenge), Math.round(r.zeit * (TEMPO_KMH() / 5.1)), hm2.auf, hm2.ab];
          speicher.set('wege', c);
        } catch (e) { /* einzelner Weg fehlt: bleibt geschätzt */ }
        S.wegeRechnen.fertig += 1; zeichne({ scroll: true, karte: false });
      }
    } catch (e) { toast('Die Höhendaten konnten nicht geladen werden.'); }
    S.wegeRechnen = null; zeichne({ scroll: true, karte: false });
  }
  function streckeTeil(stopps) {
    ladeWege();
    if (stopps.length < 2) return null;
    const t = tagesStrecke(stopps);
    const rechnet = S.wegeRechnen;
    return el('div', { class: 'strecke-teil' },
      el('div', { class: 'strecke-werte' },
        el('span', {}, el('small', {}, 'Zu Fuß'), el('strong', {}, strecke(t.m))),
        el('span', {}, el('small', {}, 'Anstieg'), el('strong', {}, `↑ ${t.auf} m`)),
        el('span', {}, el('small', {}, 'Abstieg'), el('strong', {}, `↓ ${t.ab} m`))),
      el('p', { class: 'leise klein', style: 'margin:6px 0 0' },
        [t.geschaetzt.length ? `${t.geschaetzt.length} ${t.geschaetzt.length === 1 ? 'Weg ist' : 'Wege sind'} nur geschätzt (Luftlinie), ohne Höhenmeter.` : 'Alle Wege berechnet.',
          t.bahn ? `${t.bahn}× besser mit Bahn oder Bus, nicht mitgezählt.` : null].filter(Boolean).join(' ')),
      rechnet ? el('p', { class: 'leise klein', role: 'status' }, `Berechne Wege … ${rechnet.fertig} von ${rechnet.gesamt}`)
        : t.geschaetzt.length ? el('button', { type: 'button', class: 'knopf breit', style: 'margin-top:8px', onclick: () => wegeBerechnen(t.geschaetzt) }, ic('route'), 'Genaue Wege berechnen') : null,
      t.geschaetzt.length && !rechnet ? el('p', { class: 'quelle', style: 'margin-top:4px' }, 'Schickt nur die Lage der Stopps an Valhalla (FOSSGIS e.V.), nicht deinen Standort.') : null,
      el('p', { class: 'quelle', style: 'margin-top:6px' }, 'Höhe: Copernicus DEM GLO-30, Oberflächenmodell (Gebäude enthalten), Genauigkeit grob ±20–30 % je Weg. Produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.'));
  }

  // ---------- Zeitleiste: was ist noch machbar, auch wenn ihr trödelt ----------
  // Gehzeit wie überall (1,3 × Luftlinie, 4 km/h; über 2,5 km: 35 Min. mit Bahn/Bus), Aufenthalt aus „Zeitbedarf“
  // (belegt) sonst Schätzwert je Typ. Trödeln verlängert Wege und Aufenthalte. Öffnungszeiten aus OSM, Sonne aus wetter.json.
  const hm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.round(m) % 60).padStart(2, '0')}${m >= 1440 ? ' (nachts)' : ''}`;
  const TAGESENDE = 22 * 60; // Setzung: danach plant die Zeitleiste nichts mehr ein
  function offenAm(o, tagId, minute) {
    const roh = o.infos && o.infos.oeffnungszeiten;
    const w = roh && window.Oeffnung.lies(roh);
    if (!w) return null;
    const iv = w.woche[TAG_IDX[tagId]] || [];
    for (const [a, b] of iv) if (minute >= a && minute < b) return { offen: true, bis: b };
    const spaeter = iv.filter(([a]) => a > minute).sort((x, y) => x[0] - y[0])[0];
    return { offen: false, ab: spaeter ? spaeter[0] : null };
  }
  function zeitleiste(stopps, troedel) {
    const tag = TAGE.find((t) => t.id === S.tag);
    const jetzt = new Date();
    const heute = tag.datum === iso;
    let t = heute ? jetzt.getHours() * 60 + jetzt.getMinutes() : 10 * 60;
    const erster = stopps.find(({ s }) => s.zeit);
    if (!heute && erster && /^\d{1,2}:\d{2}$/.test(erster.s.zeit)) t = Math.min(t, +erster.s.zeit.split(':')[0] * 60 + +erster.s.zeit.split(':')[1]);
    const sonne = W && W.om && (W.om.sonne || []).find((x) => x.datum === tag.datum);
    const unter = sonne ? +sonne.unter.slice(0, 2) * 60 + +sonne.unter.slice(3) : null;
    let pos = heute && S.me ? S.me : null;
    const zeilen = [];
    for (const { o } of stopps) {
      if (fertig(o)) continue;
      const d = pos && hatPos(o) ? meter(pos, o) : 0;
      const wi = pos && pos.id ? wegInfo(pos, o) : null;
      const weg = (wi && wi.art === 'weg' ? wi.min : d > 2500 ? 35 : gehzeit(d)) * (1 + troedel);
      const ankunft = t + weg, bleibe = dauerMin(o) * (1 + troedel);
      const of = offenAm(o, S.tag, ankunft);
      let status = 'ok', info = '';
      if (of && !of.offen) { status = 'zu'; info = of.ab != null ? `zu, öffnet ${hm(of.ab)}` : 'dann geschlossen'; }
      else if (of && of.offen && of.bis < ankunft + bleibe) { status = 'knapp'; info = `schließt ${hm(of.bis)}`; }
      else if (of && of.offen) info = `offen bis ${hm(Math.min(of.bis, 1440))}`;
      if (o.typ === 'aussicht' && unter != null && ankunft > unter + 20) { status = status === 'ok' ? 'dunkel' : status; info = [info, 'nach Sonnenuntergang'].filter(Boolean).join(' · '); }
      if (ankunft + bleibe > TAGESENDE && status !== 'zu') { status = 'spaet'; info = [info, 'nach 22 Uhr'].filter(Boolean).join(' · '); }
      zeilen.push({ o, ankunft, bleibe, status, info });
      t = ankunft + bleibe; pos = o;
    }
    const start = heute ? jetzt.getHours() * 60 + jetzt.getMinutes() : null;
    return { zeilen, ende: t, unter, start, machbar: zeilen.filter((x) => x.status === 'ok' || x.status === 'dunkel').length };
  }
  function zeitleisteTeil(stopps) {
    const modus = S.troedel || 0;
    const kurz = (tr) => { const z = zeitleiste(stopps, tr); const probleme = z.zeilen.filter((x) => x.status === 'zu' || x.status === 'knapp').length; return { z, probleme }; };
    const plan = kurz(0), etwas = kurz(0.25), viel = kurz(0.5);
    if (!plan.z.zeilen.length) return null;
    const akt = modus === 0.5 ? viel : modus === 0.25 ? etwas : plan;
    const n = plan.z.zeilen.length;
    const zusammenfassung = plan.z.machbar === n && viel.z.machbar === n
      ? `Alle ${n} Stopps machbar: fertig um ${hm(plan.z.ende)}, mit viel Trödeln ${hm(viel.z.ende)}.`
      : `${plan.z.start != null ? `Ab jetzt (${hm(plan.z.start)}): ` : ''}${plan.z.machbar} von ${n} Stopps bis 22 Uhr machbar${viel.z.machbar < plan.z.machbar ? `, mit viel Trödeln ${viel.z.machbar}` : ''}.`;
    const details = el('details', { class: 'zeitleiste', open: S.zeitleisteOffen ? true : null },
      el('summary', {}, el('strong', {}, 'Zeitleiste'), el('span', { class: 'leise klein' }, zusammenfassung)),
      el('div', { class: 'segmente', role: 'group', 'aria-label': 'Tempo', style: 'margin:10px 0' },
        [[0, 'Nach Plan'], [0.25, 'Etwas trödeln'], [0.5, 'Viel trödeln']].map(([w, n]) => el('button', { type: 'button', 'aria-pressed': String(modus === w), onclick: () => { S.troedel = w; S.zeitleisteOffen = true; haptik(); zeichne({ scroll: true, karte: false }); } }, n))),
      el('ol', { class: 'zl-liste' }, akt.z.zeilen.map((x) => el('li', { class: 'zl-' + x.status },
        el('span', { class: 'zl-zeit' }, hm(x.ankunft)),
        el('span', { class: 'zl-text' }, el('strong', {}, x.o.name), el('small', {}, [`${Math.round(x.bleibe)} Min. dort`, x.info].filter(Boolean).join(' · '))),
        el('span', { class: 'zl-marke' }, { ok: '✓', knapp: 'knapp', zu: 'zu', dunkel: 'dunkel', spaet: 'zu spät' }[x.status])))),
      el('p', { class: 'leise klein', style: 'margin:8px 0 0' }, `Ende etwa ${hm(akt.z.ende)}${akt.z.unter != null ? ` · Sonnenuntergang ${hm(akt.z.unter)}` : ''}. Gehzeiten geschätzt, Öffnungszeiten aus OpenStreetMap, Aufenthalt aus „Zeitbedarf“ oder geschätzt.`));
    details.addEventListener('toggle', () => { S.zeitleisteOffen = details.open; });
    return details;
  }

  // ---------- Eigene Pläne ----------
  function planSpeichern(p) { p.t = Date.now(); p.e = G.ich && G.ich.id; speichereG(); }
  function neuerPlan(mitOrt) {
    if (!G.ich || !G.ich.name) { toast('Tritt zuerst unter „Gruppe“ bei. Dann können alle deinem Plan folgen.'); S.tab = 'gruppe'; hoehe('gross'); zeichne(); return null; }
    const id = neueId();
    G.plaene[id] = { n: `Plan von ${meinName()}`, von: G.ich.id, tag: S.tag, s: mitOrt ? [mitOrt] : [], d: [], t: Date.now(), e: G.ich.id, x: 0 };
    speichereG();
    S.plan = 'P:' + id; S.planEdit = id; PL.modus = 'liste'; speicher.set('plan', S.plan);
    if (!mitOrt) { S.tab = 'plan'; S.ort = null; hoehe('gross'); }
    zeichne({ anpassen: true });
    return id;
  }
  // ---------- Planer (Überarbeitung 25.10.2026) ----------
  // Zwei Schritte statt eines vollgepackten Blatts: „liste“ zeigt Name, Stopps mit Wegen und Summen; „suche“ ist eine eigene
  // Ansicht zum Hinzufügen (eigene Liste nach Nähe zum letzten Stopp, Suche, Art, OpenStreetMap, Punkt auf der Karte).
  // Mehrere Orte nacheinander hinzufügen geht, ohne die Ansicht zu verlassen. Neue Orte werden dabei gleich gespeichert.
  const PL = { modus: 'liste', q: '', art: '', osm: null };
  const planerOffen = () => !!S.planEdit && !!aktiverEigenplan() && S.plan === 'P:' + S.planEdit;
  function planerStopps(p) { return p.s.map((oid) => NACH_ID.get(oid)).filter(Boolean); }
  function planFuegeHinzu(p, o) {
    if (p.s.includes(o.id)) return;
    p.s.push(o.id); planSpeichern(p); haptik(15);
    PL.osm = null;
    toast(`${o.name} ist jetzt Stopp ${p.s.length}.`, { aktion: 'Rückgängig', fn: () => { p.s = p.s.filter((x) => x !== o.id); planSpeichern(p); zeichne({ scroll: true }); } });
    zeichne({ scroll: true });
  }
  function planNeuerOrt(p, t) {
    const schon = ORTE.find((o) => hatPos(o) && (falte(o.name) === falte(t.n) || meter(o, t) < 25));
    if (schon) { planFuegeHinzu(p, schon); return; }
    const id = eigenSpeichern({ n: t.n, k: t.k, lat: t.lat, lon: t.lon, a: t.a, q: t.q, oh: t.oh, x: '' });
    const o = NACH_ID.get(id);
    if (o) planFuegeHinzu(p, o);
  }
  function planerListe(box, p) {
    const stopps = planerStopps(p);
    const name = el('input', { id: 'pl-name', type: 'text', maxlength: '40', value: p.n, 'aria-label': 'Name des Plans', autocomplete: 'off' });
    name.addEventListener('change', () => { p.n = name.value.trim() || p.n; planSpeichern(p); });
    const schiebe = (i, d) => { const j = i + d; if (j < 0 || j >= p.s.length) return; [p.s[i], p.s[j]] = [p.s[j], p.s[i]]; planSpeichern(p); haptik(); zeichne({ scroll: true }); };
    const liste = el('ol', { class: 'liste plan-edit' });
    let vorher = null;
    p.s.forEach((oid, i) => {
      const o = NACH_ID.get(oid);
      if (!o) return;
      const w = vorher ? wegInfo(vorher, o) : null;
      if (w) liste.append(el('li', { class: 'weg-zeile' + (w.art === 'weg' ? '' : ' geschaetzt') }, el('span', { class: 'pfeil' }, '↓'), wegText(w)));
      vorher = o;
      liste.append(el('li', { class: 'eintrag' },
        el('span', { class: 'marker g-' + gruppeVon(o.kategorie) }, symbol(o), el('span', { class: 'nummer' }, String(i + 1))),
        el('span', { class: 'text' }, el('span', { class: 'titel' }, o.name), el('span', { class: 'unter' }, [TYP_NAME[o.typ] || o.kategorie, o.dauer ? `vor Ort ${o.dauer} Min.` : null].filter(Boolean).join(' · '))),
        el('span', { class: 'plan-knoepfe' },
          el('button', { type: 'button', class: 'haken', 'aria-label': `${o.name} nach oben`, disabled: i === 0 ? true : null, onclick: () => schiebe(i, -1) }, '↑'),
          el('button', { type: 'button', class: 'haken', 'aria-label': `${o.name} nach unten`, disabled: i === p.s.length - 1 ? true : null, onclick: () => schiebe(i, 1) }, '↓'),
          el('button', { type: 'button', class: 'haken', 'aria-label': `${o.name} entfernen`, onclick: () => {
            const pos = i; p.s.splice(i, 1); planSpeichern(p); haptik(); zeichne({ scroll: true });
            toast(`${o.name} entfernt.`, { aktion: 'Rückgängig', fn: () => { p.s.splice(pos, 0, oid); planSpeichern(p); zeichne({ scroll: true }); } });
          } }, ic('x')))));
    });
    const hinzu = (extra) => el('button', { type: 'button', class: 'knopf haupt breit', style: 'min-height:60px;font-size:var(--fs-l)', onclick: () => { PL.modus = 'suche'; PL.q = ''; PL.art = ''; PL.osm = null; hoehe('gross'); zeichne({ karte: false }); } }, ic('plus'), extra);
    const start = !stopps.length ? el('div', { class: 'leer', style: 'padding:12px 0' }, fasan(),
      el('strong', {}, 'Noch keine Stopps.'),
      el('span', {}, 'Füge Orte hinzu oder starte mit einem fertigen Plan und ändere ihn.'),
      el('div', { class: 'chips', style: 'justify-content:center' }, ['A', 'B', 'C', 'G'].map((q) => el('button', { type: 'button', class: 'chip', onclick: () => {
        p.s = schritte(q, S.tag).filter((x) => x.ort && NACH_NAME.has(x.ort)).map((x) => NACH_NAME.get(x.ort).id); planSpeichern(p); haptik(); zeichne({ scroll: true, anpassen: true });
      } }, (q === 'G' ? 'Gruppenplan' : 'Plan ' + q) + ` · ${TAGE.find((t) => t.id === S.tag).kurz}`)))) : null;
    setze(box,
      el('div', { class: 'nah-kopf' }, el('h3', {}, 'Plan bearbeiten'),
        el('button', { type: 'button', class: 'knopf haupt', onclick: () => { S.planEdit = null; haptik(); hoehe('mitte'); zeichne({ anpassen: true }); } }, ic('haken'), 'Fertig')),
      el('label', { class: 'klein leise', for: 'pl-name' }, 'Name'), el('div', { class: 'feld' }, name),
      el('p', { class: 'leise klein', style: 'margin:6px 0 10px' }, `Reiseführer: ${personName(p.von)}. Alle mit offener App sehen jede Änderung und können folgen.`),
      start,
      stopps.length ? liste : null,
      hinzu(stopps.length ? 'Weiteren Ort hinzufügen' : 'Ort hinzufügen'),
      stopps.length > 1 ? streckeTeil(stopps.map((o) => ({ o }))) : null,
      el('div', { class: 'reihe', style: 'margin-top:14px' },
        el('button', { type: 'button', class: 'knopf warn', onclick: () => {
          S.planAlt = S.planEdit; p.x = 1; planSpeichern(p); S.plan = 'A'; S.planEdit = null; speicher.set('plan', 'A'); hoehe('mitte'); zeichne({ anpassen: true });
          toast('Plan gelöscht.', { aktion: 'Rückgängig', fn: () => { p.x = 0; planSpeichern(p); S.plan = 'P:' + S.planAlt; zeichne({ anpassen: true }); } });
        } }, ic('aus'), 'Plan löschen')));
  }
  function planerSuche(box, p) {
    const stopps = planerStopps(p), letzter = stopps[stopps.length - 1] || null;
    const ref = letzter && hatPos(letzter) ? letzter : S.me || null;
    const refName = letzter ? `vom letzten Stopp` : S.me ? 'von dir' : '';
    const feld = el('input', { id: 'pl-suche', type: 'search', value: PL.q, placeholder: 'Ort suchen: Name oder Art', enterkeyhint: 'search', autocomplete: 'off', 'aria-label': 'Ort für den Plan suchen' });
    const treffer = el('div', { id: 'pl-treffer', 'aria-live': 'polite' });
    const fuelle = () => {
      const q = falte(PL.q.trim());
      let l = ORTE.filter((o) => hatPos(o) && !p.s.includes(o.id) && (!PL.art || (PL.art === 'eigen' ? !!o.eigen : gruppeVon(o.kategorie) === PL.art))
        && (!q || falte(`${o.name} ${o.kategorie} ${TYP_NAME[o.typ] || ''} ${o.ort || ''}`).includes(q)));
      const dist = (o) => (ref ? meter(ref, o) : 0);
      l = ref ? l.sort((a, b) => dist(a) - dist(b)) : l.sort((a, b) => a.name.localeCompare(b.name, 'de'));
      const n = l.length;
      l = l.slice(0, 10);
      const zeile = (o) => el('li', { class: 'eintrag' }, el('button', { type: 'button', class: 'auf', 'aria-label': `${o.name} zum Plan hinzufügen`, onclick: () => planFuegeHinzu(p, o) },
        el('span', { class: 'marker g-' + gruppeVon(o.kategorie) }, symbol(o)),
        el('span', { class: 'text' }, el('span', { class: 'titel' }, o.name),
          el('span', { class: 'unter' }, [ref ? `${strecke(meter(ref, o))} ${refName}` : null, TYP_NAME[o.typ] || o.kategorie, o.eigen ? 'eigener Ort' : null].filter(Boolean).join(' · '))),
        el('span', { class: 'plus-badge', 'aria-hidden': 'true' }, ic('plus'))));
      const o = PL.osm;
      const osmTeil = !PL.q.trim() ? null
        : o === 'laedt' ? el('p', { class: 'leise', role: 'status' }, 'Sucht bei OpenStreetMap …')
          : o && o.fehler ? el('p', { role: 'alert' }, o.fehler)
            : Array.isArray(o) ? (o.length ? el('div', {}, el('h4', { class: 'unterkopf' }, 'Neu von OpenStreetMap'),
              el('ul', { class: 'liste' }, o.map((t) => el('li', { class: 'eintrag' }, el('button', { type: 'button', class: 'auf', 'aria-label': `${t.n} anlegen und zum Plan hinzufügen`, onclick: () => planNeuerOrt(p, t) },
                el('span', { class: 'marker g-' + gruppeVon(t.k) }, ic('plus')),
                el('span', { class: 'text' }, el('span', { class: 'titel' }, t.n), el('span', { class: 'unter' }, [t.a, ref ? strecke(meter(ref, t)) + ' ' + refName : null].filter(Boolean).join(' · '))),
                el('span', { class: 'plus-badge', 'aria-hidden': 'true' }, ic('plus')))))),
              el('p', { class: 'quelle' }, 'Suche: Nominatim, Daten © OpenStreetMap-Mitwirkende (ODbL). Nur deine Suchwörter gehen an die OpenStreetMap Foundation, nicht dein Standort. Angelegte Orte sehen alle in der Gruppe.'))
              : el('p', {}, `Bei OpenStreetMap nichts gefunden für „${PL.q}“. Setze den Punkt auf der Karte.`)) : null;
      setze(treffer,
        el('h4', { class: 'unterkopf' }, PL.q.trim() || PL.art ? `${n} ${n === 1 ? 'Treffer' : 'Treffer'} in euren Orten` : ref ? `Nah ${letzter ? 'am letzten Stopp' : 'bei dir'}` : 'Alle Orte'),
        l.length ? el('ul', { class: 'liste' }, l.map(zeile)) : el('p', { class: 'leise' }, PL.q.trim() ? `Kein Ort in euren Daten heißt so.` : 'Keine weiteren Orte in dieser Auswahl.'),
        n > l.length ? el('p', { class: 'leise klein' }, `${n - l.length} weitere. Tippe mehr Buchstaben oder wähle eine Art.`) : null,
        PL.q.trim().length >= 2 && !Array.isArray(PL.osm) && PL.osm !== 'laedt' ? el('button', { type: 'button', class: 'knopf breit', onclick: async () => {
          const q = PL.q.trim(); PL.osm = 'laedt'; fuelle();
          try { PL.osm = await osmAbfrage(q); } catch (e) { PL.osm = osmFehler(e); }
          if (planerOffen() && PL.modus === 'suche') fuelle();
        } }, ic('suche'), `„${PL.q.trim()}“ bei OpenStreetMap suchen`) : null,
        osmTeil);
    };
    feld.addEventListener('input', () => { PL.q = feld.value; PL.osm = null; fuelle(); });
    feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); feld.blur(); } });
    const artChip = (id, label, grp) => {
      const b = el('button', { type: 'button', class: 'chip' + (grp ? ' g-' + grp : ''), 'aria-pressed': String(PL.art === id), onclick: () => { PL.art = PL.art === id ? '' : id; $$('.pl-arten .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.id === PL.art))); fuelle(); } });
      b.dataset.id = id; if (grp) b.append(el('span', { class: 'punktfarbe' })); b.append(label); return b;
    };
    setze(box,
      el('div', { class: 'nah-kopf' }, el('h3', {}, 'Ort hinzufügen'),
        el('button', { type: 'button', class: 'knopf haupt', onclick: () => { PL.modus = 'liste'; haptik(); hoehe('mitte'); zeichne({ karte: false }); } }, ic('haken'), `Zum Plan (${stopps.length})`)),
      el('div', { class: 'suche', style: 'min-height:56px' }, ic('suche'), feld),
      el('div', { class: 'chips pl-arten', role: 'group', 'aria-label': 'Art' }, GRUPPEN.map((g) => artChip(g.id, g.label, g.id)), artChip('eigen', 'Eigene Orte')),
      treffer,
      el('div', { style: 'display:grid;gap:8px;margin-top:14px' },
        el('strong', {}, 'Nicht dabei?'),
        el('button', { type: 'button', class: 'knopf breit', onclick: () => {
          eigenNeu({ plan: S.planEdit, q: PL.q.trim() }); hoehe('klein');
          setTimeout(() => { if (S.eigen && S.eigen.lat == null) { Object.assign(S.eigen, sichtMitte()); hoehe('mitte'); zeichne({ anpassen: true }); } }, 360);
        } }, ic('orte'), 'Punkt auf der Karte setzen'),
        el('button', { type: 'button', class: 'knopf breit', onclick: () => {
          if (!S.me) { starteGps(false); toast('Suche deinen Standort … dann nochmal tippen.'); return; }
          eigenNeu({ plan: S.planEdit, lat: S.me.lat, lon: S.me.lon });
        } }, ic('standort'), 'Dort, wo ich gerade bin'),
        el('p', { class: 'leise klein', style: 'margin:0' }, 'Tipp: Lange auf die Karte drücken setzt den Punkt direkt.')));
    fuelle();
    if (!PL.q) setTimeout(() => { try { feld.focus({ preventScroll: true }); } catch (e) { /* egal */ } }, 250);
  }
  function zeichnePlaner(box) {
    const p = G.plaene[S.planEdit];
    if (!p || p.x) { S.planEdit = null; zeichnePlan(box); return; }
    if (PL.modus === 'suche') planerSuche(box, p); else planerListe(box, p);
  }
  function inPlanBox(o) {
    const eigene = Object.entries(G.plaene).filter(([, x]) => !x.x);
    return el('section', { class: 'karte-box', style: 'margin-top:10px;display:grid;gap:8px' }, el('strong', {}, 'Zu welchem Plan?'),
      el('div', { class: 'chips' },
        eigene.map(([id, x]) => el('button', { type: 'button', class: 'chip', 'aria-pressed': String(x.s.includes(o.id)), onclick: () => {
          if (!x.s.includes(o.id)) { x.s.push(o.id); planSpeichern(x); toast(`Zu „${x.n}“ hinzugefügt.`, { aktion: 'Zum Plan', fn: () => { S.plan = 'P:' + id; S.tab = 'plan'; S.ort = null; zeichne({ anpassen: true }); } }); } else { x.s = x.s.filter((y) => y !== o.id); planSpeichern(x); toast(`Aus „${x.n}“ entfernt.`); }
          haptik(); S.inPlan = null; zeichne({ scroll: true, karte: false });
        } }, x.n)),
        el('button', { type: 'button', class: 'chip', onclick: () => { const id = neuerPlan(o.id); if (id) { S.inPlan = null; toast('Neuer Plan mit diesem Ort. Unter „Plan“ bearbeiten.'); zeichne({ scroll: true, karte: false }); } } }, '+ Neuer Plan')),
      el('p', { class: 'leise klein', style: 'margin:0' }, 'Eigene Pläne sieht die ganze Gruppe. Wer ihn baut, ist Reiseführer; die anderen wählen ihn unter „Plan“ und folgen.'));
  }

  const heimOrt = () => (E.heimPos ? { id: 'heim', name: 'Unterkunft', kategorie: 'Verkehr', typ: 'haus', adresse: '', notiz: '', lat: E.heimPos.lat, lon: E.heimPos.lon } : null);
  function heimKnopf() {
    const h = heimOrt();
    if (!h) return null;
    return el('button', { type: 'button', class: 'knopf', onclick: () => starteNavi(h, true) }, ic('haus'), 'Zur Unterkunft');
  }

  function zeichneOrte(box) {
    const liste = sortiert(gefiltert());
    const chip = (id, label, an, fn, extra) => el('button', { type: 'button', class: 'chip ' + (extra || ''), 'aria-pressed': String(an), onclick: fn }, label);
    const nGemerkt = ORTE.filter((o) => { const m = mk(o.id); return !m.aus && (m.fav || m.notiz || m.sterne || m.fertig); }).length;
    const gemerkt = el('button', { type: 'button', class: 'chip gemerkt-chip', onclick: () => { S.tab = 'gemerkt'; speicher.set('tab', 'gemerkt'); haptik(); hoehe('gross'); zeichne({ anpassen: true }); } },
      ic('herz'), nGemerkt ? `Gemerkt ${nGemerkt}` : 'Gemerkt');
    const gruppen = el('div', { class: 'chips', role: 'group', 'aria-label': 'Kategorien' }, gemerkt,
      chip('alle', 'Alle', S.gruppen.size === 0, () => { S.gruppen.clear(); speicher.set('gruppen', []); zeichne({ anpassen: true }); }),
      GRUPPEN.map((g) => {
        const b = chip(g.id, '', S.gruppen.has(g.id), () => {
          S.gruppen.has(g.id) ? S.gruppen.delete(g.id) : S.gruppen.add(g.id);
          speicher.set('gruppen', [...S.gruppen]); zeichne({ anpassen: true });
        }, 'g-' + g.id);
        b.append(el('span', { class: 'punktfarbe' }), g.label);
        return b;
      }));
    const ex = (id, label, ico) => {
      const b = chip(id, '', S.extra.has(id), () => { S.extra.has(id) ? S.extra.delete(id) : S.extra.add(id); speicher.set('extra', [...S.extra]); zeichne({ anpassen: true }); });
      if (ico) b.append(ic(ico)); b.append(label); return b;
    };
    const extras = el('div', { class: 'filterpanel nur-voll', role: 'group', 'aria-label': 'Weitere Filter', hidden: !S.filterOffen },
      ex('tipp', 'Geheimtipps', 'stern'), ex('offen', 'Jetzt offen'), ex('offenNicht', 'Noch nicht erledigt', 'haken'), ex('fav', 'Gemerkt', 'herz'), ex('gruppe', 'Gruppe will hin', 'gruppe'), ex('eigen', 'Eigene Orte', 'notiz'), ex('aus', 'Ausgeblendete zeigen', 'aus'));
    const nExtra = S.extra.size;
    const sortName = S.sort === 'naehe' ? 'Nähe' : 'Name';
    const zeile = el('div', { class: 'filterzeile' },
      el('button', { type: 'button', class: 'knopf nur-voll', 'aria-expanded': String(!!S.filterOffen), onclick: () => { S.filterOffen = !S.filterOffen; zeichne({ karte: false, scroll: true }); } },
        ic('mehr'), nExtra ? `Filter (${nExtra})` : 'Filter'),
      el('button', { type: 'button', class: 'knopf', 'aria-label': `Sortierung: ${sortName}. Tippen zum Wechseln.`, onclick: () => {
        S.sort = S.sort === 'naehe' ? 'name' : 'naehe'; speicher.set('sort', S.sort); if (S.sort === 'naehe' && !S.me) starteGps(false); zeichne({ karte: false });
      } }, ic('orte'), S.sort === 'naehe' ? 'Nach Nähe' : 'Nach Name'));
    const aktiv = S.gruppen.size + S.extra.size;
    const zuruecksetzen = aktiv ? el('button', { type: 'button', class: 'knopf flach', style: 'margin-top:4px', onclick: () => { S.gruppen.clear(); S.extra.clear(); speicher.set('gruppen', []); speicher.set('extra', []); zeichne({ anpassen: true }); } }, ic('x'), `Filter zurücksetzen (${aktiv})`) : null;
    const kopf = S.suche
      ? el('div', {}, el('p', { class: 'leise', style: 'margin:4px 0 0' }, `${liste.length} Treffer für „${S.suche}“ in euren Orten`),
        el('button', { type: 'button', class: 'knopf breit', style: 'margin-top:8px', onclick: () => eigenNeu({ q: S.suche, suchen: true }) }, ic('suche'), `Bei OpenStreetMap suchen`))
      : el('div', {}, nahChips(), gruppen, zeile,
        el('button', { type: 'button', class: 'knopf breit', style: 'margin-top:8px', onclick: () => eigenNeu() }, ic('plus'), 'Eigenen Ort eintragen'),
        extras, zuruecksetzen,
        el('p', { class: 'leise klein', style: 'margin:12px 0 0' }, `${liste.length} von ${ORTE.length} Orten${S.sort === 'naehe' && !S.me ? ' · Standort fehlt, sortiert nach Name' : ''}`));
    setze(box, kopf,
      liste.length ? el('ul', { class: 'liste' }, liste.map((o) => eintragOrt(o)))
        : el('div', { class: 'leer' }, fasan(), el('strong', {}, 'Kein Ort passt.'),
          el('button', { type: 'button', class: 'knopf', onclick: () => { S.gruppen.clear(); S.extra.clear(); S.suche = ''; $('#suche').value = ''; speicher.set('gruppen', []); speicher.set('extra', []); zeichne({ anpassen: true }); } }, 'Filter zurücksetzen')));
  }

  // Preisstufen der Supermarktketten nur mit Beleg (docs/recherche/2026-10-24-supermaerkte.md); ohne Beleg keine Stufe
  // Einkaufstests 2026: menu5euros.com (29.05.2026, Mercadona < Aldi < Lidl < Pingo Doce < Auchan < Continente < Minipreço),
  // oprecocerto.pt (22.04.2026, Lidl vor Continente und Pingo Doce); DECO online (13.01.2026): Continente 100, Pingo Doce 101,
  // Auchan 102, Intermarché 103, Minipreço 104, El Corte Inglés 110. Kleinformate: keine Preismessung gefunden.
  const PREISE = [
    { re: /bom dia|my auchan|meu super|amanhecer|\bspar\b|express/i, stufe: 4, text: 'Kleinformat' },
    { re: /minipre[cç]o|el corte ingl[eé]s|supercor/i, stufe: 3, text: 'teurer' },
    { re: /mercadona|\baldi\b|\blidl\b/i, stufe: 1, text: 'günstig' },
    { re: /pingo doce|continente|auchan|intermarch[eé]/i, stufe: 2, text: '' },
  ];
  const PREIS_HINWEIS = '„Günstige“ zeigt nur große Supermärkte, keine Kioske und Kleinformate. In Einkaufstests 2026 waren Mercadona, Aldi und Lidl am günstigsten (menu5euros.com, 29.05.2026; oprecocerto.pt, 22.04.2026). Pingo Doce, Continente und Auchan liegen knapp dahinter (DECO, online, 13.01.2026). Minipreço und El Corte Inglés sind teurer.';
  function preisStufe(o) { const t = `${o.marke || ''} ${o.name || ''}`; return PREISE.find((x) => x.re.test(t)) || { stufe: 0, text: '' }; }

  // ---------- In der Nähe ----------
  let U = null, uLaedt = false;
  // Stadtführer: Wikipedia-Artikel mit Koordinaten (stadtfuehrer.json, im Bauprozess geholt)
  let SF = null, sfLaedt = false;
  function ladeFuehrer() {
    if (SF || sfLaedt) return;
    sfLaedt = true;
    fetch('stadtfuehrer.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null))
      .then((d) => { SF = d && Array.isArray(d.artikel) ? d : { artikel: [], fehler: true }; })
      .catch(() => { SF = { artikel: [], fehler: true }; })
      .finally(() => { sfLaedt = false; if (S.nah === 'wiki' && (S.tab === 'orte' || S.tab === 'live') && !S.ort) zeichne({ anpassen: true }); });
  }
  function ladeUmgebung() {
    if (S.nah === 'wiki') { ladeFuehrer(); return; }
    if (U || uLaedt) return;
    uLaedt = true;
    fetch('umgebung.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null))
      .then((d) => { U = d && d.stand ? d : { fehler: true }; })
      .catch(() => { U = { fehler: true }; })
      .finally(() => { uLaedt = false; if (S.nah && (S.tab === 'orte' || S.tab === 'live') && !S.ort) zeichne({ anpassen: true }); else if (S.tab === 'live' && !S.ort) zeichne({ scroll: true, karte: false }); else if (S.tab === 'mehr' && !S.ort) zeichne({ scroll: true, karte: false }); });
  }
  const nahBezug = () => S.me || (karte ? { lat: karte.getCenter().lat, lon: karte.getCenter().lng } : { lat: LISSABON[0], lon: LISSABON[1] });
  function nahOrt(id, x, i) {
    const def = NAH.find((n) => n.id === id);
    const o = { id: `n-${id}-${i}`, nah: id, typ: def.typ, kategorie: 'Alltag', lat: x[0], lon: x[1], adresse: '', notiz: '' };
    if (id === 's') Object.assign(o, { name: x[2] || x[3] || 'Supermarkt', marke: x[3] || '', oh: x[4] });
    else if (id === 'wc') Object.assign(o, { name: x[2] || 'Öffentliche Toilette', gebuehr: x[3], oh: x[4], rolli: x[5] });
    else if (id === 'apo') Object.assign(o, { name: x[2] || 'Apotheke', oh: x[3] });
    else if (id === 'atm') Object.assign(o, { name: x[2] ? `Geldautomat ${x[2]}` : 'Geldautomat', oh: x[3] });
    else o.name = 'Trinkwasser';
    o.adresse = o.name;
    return o;
  }
  function nahListe(id) {
    if (id === 'wiki') {
      if (!SF) return [];
      const b = nahBezug();
      return SF.artikel.map((x) => ({ id: `w-${x[5]}`, nah: 'wiki', typ: 'buch', kategorie: 'Alltag', lat: x[0], lon: x[1], name: x[2], adresse: x[2], notiz: '', text: x[3], stand: x[4], pid: x[5] }))
        .map((o) => { o.d = meter(b, o); return o; }).filter((o) => o.d < 1500).sort((a, c) => a.d - c.d).slice(0, 25);
    }
    if (!U || !Array.isArray(U[id])) return [];
    const b = nahBezug();
    return U[id].map((x, i) => { const o = nahOrt(id, x, i); o.d = meter(b, o); return o; })
      .filter((o) => o.d < 4000 && (id !== 's' || S.nahAlle || [1, 2].includes(preisStufe(o).stufe)))
      .sort((a, b) => a.d - b.d).slice(0, 25);
  }
  function waehleNah(o, vonKarte) {
    S.nahWahl = o.id;
    if (vonKarte) { if (S.hoehe === 'mini') hoehe('klein'); } else zeigeAufKarte(o, 17);
    zeichne({ scroll: true, karte: true });
    requestAnimationFrame(() => { const li = $(`#ansicht [data-nah="${o.id}"]`); if (li) li.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
    haptik();
  }
  function nahChips() {
    return el('div', { class: 'chips nah-chips', role: 'group', 'aria-label': 'In der Nähe' },
      NAH.map((n) => el('button', { type: 'button', class: 'chip nah-chip', 'aria-pressed': String(S.nah === n.id), onclick: () => {
        S.nah = S.nah === n.id ? null : n.id; S.nahWahl = null; haptik();
        if (S.nah) { ladeUmgebung(); if (S.watchId == null) starteGps(false); if (S.hoehe === 'mini') hoehe('klein'); }
        zeichne({ anpassen: true });
      } }, el('span', { class: 'nah-icon', html: `<svg viewBox="0 0 24 24" aria-hidden="true">${SYMBOL[n.typ]}</svg>` }), n.label)));
  }
  function zeichneNah(box) {
    ladeUmgebung();
    const def = NAH.find((n) => n.id === S.nah);
    const kopf = [nahChips(), el('div', { class: 'nah-kopf' }, el('h3', {}, `${def.titel} in der Nähe`),
      el('button', { type: 'button', class: 'knopf flach', onclick: () => { S.nah = null; S.nahWahl = null; zeichne({ anpassen: true }); } }, ic('x'), 'Fertig'))];
    const daten = S.nah === 'wiki' ? SF : U;
    if (!daten) { setze(box, kopf, el('p', { class: 'leise' }, 'Lädt …')); return; }
    if (daten.fehler) { setze(box, kopf, el('p', {}, 'Die Daten konnten nicht geladen werden. Ohne Netz geht es erst, wenn die Liste einmal geladen wurde.')); return; }
    const l = nahListe(S.nah);
    const bezug = S.me ? null : el('div', { class: 'hilfe', style: 'margin:0 0 8px' }, el('span', {}, 'Entfernungen ab der Kartenmitte. Mit Standort ab dir.'),
      el('button', { type: 'button', class: 'knopf flach', onclick: () => starteGps(false) }, 'Standort'));
    const preis = S.nah === 's' ? el('div', { style: 'display:grid;gap:6px;margin-bottom:8px' },
      el('div', { class: 'segmente', role: 'group', 'aria-label': 'Welche Supermärkte' },
        el('button', { type: 'button', 'aria-pressed': String(!S.nahAlle), onclick: () => { S.nahAlle = false; zeichne({ scroll: true }); } }, 'Günstige'),
        el('button', { type: 'button', 'aria-pressed': String(!!S.nahAlle), onclick: () => { S.nahAlle = true; zeichne({ scroll: true }); } }, 'Alle')),
      el('p', { class: 'leise klein', style: 'margin:0' }, PREIS_HINWEIS),
      (() => { const n = Object.values(G.einkauf).filter((x) => !x.x && !x.d).length; return el('button', { type: 'button', class: 'knopf', onclick: () => { S.tab = 'gruppe'; S.gTeil = 'einkauf'; speicher.set('gTeil', 'einkauf'); hoehe('gross'); zeichne(); } }, ic('haken'), n ? `Einkaufsliste (${n} offen)` : 'Einkaufsliste'); })()) : null;
    const zeile = (o) => {
      const st = o.oh ? window.Oeffnung.status(o.oh) : null;
      const pr = o.nah === 's' ? preisStufe(o) : null;
      const unter = [`${strecke(o.d)} · ${gehzeit(o.d)} Min.`];
      if (o.nah === 'wc') unter.push(o.gebuehr === 'yes' ? 'laut OSM kostenpflichtig' : o.gebuehr === 'no' ? 'laut OSM kostenlos' : 'Gebühr unbekannt', o.rolli === 'yes' ? 'rollstuhlgerecht' : null);
      if (o.nah === 'wiki') {
        const offen = S.nahWahl === o.id;
        return el('li', { class: 'eintrag wiki-zeile' + (offen ? ' gewaehlt' : ''), 'data-nah': o.id },
          el('button', { type: 'button', class: 'auf', onclick: () => waehleNah(o) },
            el('span', { class: 'marker g-nah' }, el('span', { html: `<svg viewBox="0 0 24 24" aria-hidden="true">${SYMBOL.buch}</svg>`, style: 'display:contents' })),
            el('span', { class: 'text' }, el('span', { class: 'titel' }, o.name), el('span', { class: 'unter' }, `${strecke(o.d)} · ${gehzeit(o.d)} Min.`),
              el('span', { class: offen ? 'wiki-text' : 'wiki-text kurz' }, o.text),
              offen ? el('span', { class: 'quelle' }, 'Wikipedia (CC BY-SA)', o.stand ? `, Stand ${datumDe(o.stand)}` : '', ' · ', el('a', { href: `https://de.wikipedia.org/?curid=${o.pid}`, target: '_blank', rel: 'noopener' }, 'Artikel')) : null)));
      }
      return el('li', { class: 'eintrag' + (S.nahWahl === o.id ? ' gewaehlt' : ''), 'data-nah': o.id },
        el('button', { type: 'button', class: 'auf', onclick: () => waehleNah(o) },
          el('span', { class: 'marker g-nah' }, el('span', { html: `<svg viewBox="0 0 24 24" aria-hidden="true">${SYMBOL[o.typ]}</svg>`, style: 'display:contents' })),
          el('span', { class: 'text' },
            el('span', { class: 'titel' }, o.name, pr && pr.text ? el('span', { class: 'abzeichen preis p' + pr.stufe }, pr.text) : null),
            el('span', { class: 'unter' }, unter.filter(Boolean).join(' · '),
              st ? el('span', { class: 'status ' + (st.offen ? 'offen' : 'zu') }, st.offen ? ` · offen bis ${st.bis}` : st.naechste ? ` · zu, öffnet ${st.naechste}` : ' · geschlossen') : o.oh ? '' : ' · Zeiten unbekannt'))),
        el('button', { type: 'button', class: 'haken', 'aria-label': `Zu ${o.name} hinführen`, onclick: () => starteNavi(o, true) }, ic('route')));
    };
    setze(box, kopf, bezug, preis,
      l.length ? el('ul', { class: 'liste' }, l.map(zeile)) : el('p', {}, 'Im Umkreis von 4 km nichts gefunden.'),
      el('p', { class: 'quelle', style: 'margin-top:10px' }, S.nah === 'wiki' ? `Texte: Wikipedia (deutsch), CC BY-SA 4.0, abgerufen ${uhrzeit(Date.parse(SF.stand))}. Jeder Text mit Stand der letzten Änderung.` : `Daten: OpenStreetMap-Mitwirkende, abgerufen ${uhrzeit(Date.parse(U.stand))}. Öffnungszeiten können fehlen oder veraltet sein.`));
  }

  function zeichneGemerkt(box) {
    const teil = (titel, pred, extra) => {
      const l = ORTE.filter((o) => pred(mk(o.id)));
      if (!l.length) return null;
      return el('section', { class: 'abschnitt' }, el('h3', {}, `${titel} (${l.length})`),
        el('ul', { class: 'liste' }, l.map((o) => {
          const li = eintragOrt(o);
          if (extra) li.append(extra(o));
          return li;
        })));
    };
    const teile = [
      teil('Gemerkt', (m) => m.fav && !m.aus),
      teil('Mit Notiz', (m) => m.notiz && !m.aus),
      teil('Bewertet', (m) => m.sterne && !m.aus),
      teil('Erledigt', (m) => m.fertig && !m.aus),
      teil('Ausgeblendet', (m) => m.aus, (o) => el('button', { type: 'button', class: 'knopf', onclick: () => { markiere(o.id, { aus: false }); zeichne({ scroll: true }); toast(`${o.name} wird wieder gezeigt.`); } }, 'Zeigen')),
    ].filter(Boolean);
    // „Gemerkt“ ist seit 2.4 ein Teil von „Orte“ (Platz für den Tab „Live“); Zurück führt zur Ortsliste
    const zurueck = el('button', { type: 'button', class: 'knopf flach', style: 'margin:0 0 4px -8px', onclick: () => { S.tab = 'orte'; speicher.set('tab', 'orte'); haptik(); zeichne({ anpassen: true }); } }, ic('zurueck'), 'Alle Orte');
    setze(box, zurueck,
      teile.length ? teile : el('div', { class: 'leer' }, fasan(), el('strong', {}, 'Noch nichts gemerkt.'),
        el('span', {}, 'Öffne einen Ort und tippe auf „Merken“. Hier sammeln sich Favoriten, Notizen, Bewertungen und Erledigtes.')),
      gruppeGemerkt(),
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Mit der Gruppe teilen'),
        !G.ich || !G.ich.name
          ? el('p', { class: 'leise klein', style: 'margin:0' }, 'Tritt unter „Gruppe“ bei. Dann sieht die Gruppe live, was du merkst, erledigst, bewertest und notierst.')
          : el('div', { style: 'display:grid;gap:8px' },
            el('p', { class: 'leise klein', style: 'margin:0' }, E.markTeilen !== false
              ? 'Die Gruppe sieht live, was du merkst, erledigst, bewertest und notierst. Ausgeblendetes bleibt auf deinem Handy.'
              : 'Deine Markierungen bleiben gerade nur auf diesem Handy.'),
            el('button', { type: 'button', class: 'knopf', style: 'justify-self:start', onclick: () => { E.markTeilen = E.markTeilen === false; speichereE(); teileMarkierungen(); zeichne({ scroll: true, karte: false }); toast(E.markTeilen === false ? 'Deine Markierungen werden nicht mehr geteilt.' : 'Deine Markierungen werden wieder geteilt.'); } },
              E.markTeilen !== false ? 'Nicht mehr teilen' : 'Wieder mit der Gruppe teilen'))));
  }
  function gruppeGemerkt() {
    const l = ORTE.map((o) => ({ o, r: gruppeMark(o.id) })).filter((x) => x.r.fav.length).sort((a, b) => b.r.fav.length - a.r.fav.length);
    if (!l.length) return null;
    return el('section', { class: 'abschnitt' }, el('h3', {}, `Von der Gruppe gemerkt (${l.length})`),
      el('ul', { class: 'liste' }, l.map(({ o, r }) => { const li = eintragOrt(o); li.querySelector('.text').append(el('span', { class: 'unter' }, `♥ ${r.fav.join(', ')}`)); return li; })));
  }

  function wahl(liste, aktiv, fn) {
    return el('div', { class: 'wahl' }, liste.map(([id, label, text]) => el('button', { type: 'button', 'aria-pressed': String(id === aktiv), onclick: () => fn(id) },
      el('span', { class: 'kreis' }), el('span', {}, label, text ? el('small', {}, text) : null))));
  }

  // ---------- Notfall: alles im Handy, geht ohne Netz ----------
  // Quellen: Botschaft laut Auswärtigem Amt (Seite ohne Datum, abgerufen 24.10.2026); SNS 24: Renascença (24.07.2026);
  // 112: europaweiter Notruf; Notaufnahmen und Apotheken: OpenStreetMap (umgebung.json).
  function notfallTeil() {
    ladeUmgebung();
    const tel = (nr, titel, unter) => el('a', { class: 'knopf notruf', href: `tel:${nr.replace(/[^+\d]/g, '')}` }, el('span', {}, el('strong', {}, titel), el('small', {}, unter)), el('b', {}, nr));
    const naechste = (key, map, n) => (U && Array.isArray(U[key]) ? U[key].map(map).map((o) => ({ ...o, d: S.me ? meter(S.me, o) : null })).sort((a, b) => (a.d ?? 0) - (b.d ?? 0)).slice(0, n) : []);
    const kh = naechste('kh', (x) => ({ lat: x[0], lon: x[1], name: x[2] || 'Krankenhaus mit Notaufnahme', tel: x[3] }), 2);
    const apo = naechste('apo', (x) => ({ lat: x[0], lon: x[1], name: x[2] || 'Apotheke', oh: x[3] }), 3);
    const ziel = (o, typ) => ({ id: `nf-${typ}-${o.lat}`, name: o.name, kategorie: 'Alltag', typ, adresse: o.name, notiz: '', lat: o.lat, lon: o.lon, nah: typ });
    const zeile = (o, typ, extra) => el('li', { class: 'eintrag' },
      el('span', { class: 'text' }, el('span', { class: 'titel' }, o.name), el('span', { class: 'unter' }, [o.d != null ? `${strecke(o.d)} · ${gehzeit(o.d)} Min.` : 'Standort fehlt', extra].filter(Boolean).join(' · '))),
      el('button', { type: 'button', class: 'haken', 'aria-label': `Zu ${o.name} hinführen`, onclick: () => starteNavi(ziel(o, typ), true) }, ic('route')));
    const adr = el('input', { type: 'text', maxlength: '120', value: E.heimAdresse || '', placeholder: 'Straße, Hausnummer', 'aria-label': 'Adresse der Unterkunft, bleibt auf diesem Handy' });
    adr.addEventListener('change', () => { E.heimAdresse = adr.value.trim(); speichereE(); toast('Gespeichert, nur auf diesem Handy.'); });
    const gross = () => { const b = el('div', { class: 'foto-voll gross-text', role: 'dialog', 'aria-label': 'Adresse groß', onclick: () => b.remove() }, el('p', {}, E.heimAdresse || ''), el('small', {}, 'Antippen zum Schließen')); document.body.append(b); };
    return el('section', { class: 'abschnitt notfall' }, el('h3', {}, 'Notfall'),
      el('div', { style: 'display:grid;gap:8px' },
        tel('112', 'Notruf', 'Polizei, Rettung, Feuerwehr · kostenlos'),
        tel('808 24 24 24', 'SNS 24', 'Gesundheitstelefon in Portugal'),
        tel('+351 21 881 02 10', 'Deutsche Botschaft', 'Campo dos Mártires da Pátria 38, Lissabon'),
        tel('+351 96 580 80 92', 'Botschaft im Notfall', 'außerhalb der Öffnungszeiten')),
      el('div', { style: 'display:grid;gap:8px;margin-top:12px' }, el('strong', {}, 'Unterkunft'), el('span', { class: 'leise klein', style: 'margin-top:-4px' }, 'Adresse für Taxi und Notfall. Bleibt nur auf diesem Handy.'), el('div', { class: 'feld' }, adr),
        el('div', { class: 'reihe' }, E.heimAdresse ? el('button', { type: 'button', class: 'knopf', onclick: gross }, 'Groß zeigen (Taxi)') : null, heimKnopf())),
      treffKarte(),
      kh.length ? el('div', { style: 'margin-top:12px' }, el('strong', {}, 'Nächste Notaufnahme'), el('ul', { class: 'liste' }, kh.map((o) => zeile(o, 'apo', o.tel ? `Tel. ${o.tel}` : '')))) : null,
      apo.length ? el('div', { style: 'margin-top:12px' }, el('strong', {}, 'Nächste Apotheken'), el('ul', { class: 'liste' }, apo.map((o) => { const st = o.oh ? window.Oeffnung.status(o.oh) : null; return zeile(o, 'apo', st ? (st.offen ? `offen bis ${st.bis}` : 'jetzt zu') : 'Zeiten unbekannt'); }))) : null,
      el('p', { class: 'quelle', style: 'margin-top:8px' }, 'Botschaft: Auswärtiges Amt (Seite ohne Datum, abgerufen 24.10.2026). SNS 24: Renascença (24.07.2026). Notaufnahmen und Apotheken: OpenStreetMap, ohne Gewähr. Diese Seite geht auch ohne Netz.'));
  }

  function zeichneMehr(box) {
    setze(box,
      el('div', { style: 'display:flex;align-items:center;gap:12px;padding-top:4px' }, fasan('klein-fasan'),
        el('div', {}, el('strong', { style: 'font-size:var(--fs-t)' }, 'Fasan Karte'), el('div', { class: 'leise klein' }, `Lissabon · Version ${VERSION}`))),
      el('button', { type: 'button', class: 'info-einstieg', onclick: () => { S.tab = 'info'; speicher.set('tab', 'info'); hoehe('gross'); haptik(); zeichne(); } },
        el('span', { class: 'marker g-sehen' }, ic('buch')), el('span', {}, el('strong', {}, 'Reiseinfos Portugal'), el('small', {}, 'Strom, Geld, Gesundheit, Regeln, Strände, Sprache')), ic('zurueck', 'pfeil-rechts')),
      notfallTeil(),
      el('button', { type: 'button', class: 'knopf breit', style: 'margin-top:14px', onclick: () => zeigeEinfuehrung(0) }, ic('plan'), 'Einführung ansehen'),
      el('section', { class: 'abschnitt' }, protokollListe()),
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Über dich'), profilTeil('alles', () => zeichne({ scroll: true }))),
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Profil'), wahl(PROFILE, E.profil, (id) => { E.profil = id; speichereE(); wendeAn(); hoehe(S.hoehe); zeichne({ scroll: true }); })),
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Bewegung'), wahl([['system', 'Wie das Gerät', 'Animationen nach der Einstellung des Handys.'], ['wenig', 'Weniger Bewegung', 'Keine Animationen und Übergänge.']], E.bewegung === 'wenig' ? 'wenig' : 'system', (id) => { E.bewegung = id; speichereE(); wendeAn(); zeichne({ scroll: true }); })),
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Aussehen'), wahl(THEMES, E.theme, (id) => { E.theme = id; speichereE(); wendeAn(); zeichne({ scroll: true }); })),
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Navigation'),
        wahl([['an', 'Sprachansage an', 'sagt die Abbiegungen an'], ['aus', 'Sprachansage aus', null]], E.ansage ? 'an' : 'aus', (id) => { E.ansage = id === 'an'; speichereE(); zeichne({ scroll: true }); })),
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Stadtführer beim Gehen'),
        wahl([['an', 'Hinweise an', 'Kommt ihr an einem Ort mit Wikipedia-Text vorbei, blinkt er auf der Karte. Antippen zeigt den Text mit Quelle und Stand.'], ['aus', 'Hinweise aus', null]], E.fuehrer === false ? 'aus' : 'an', (id) => { E.fuehrer = id === 'an'; speichereE(); if (!E.fuehrer) naeheEntfernen(); zeichne({ scroll: true }); }),
        naeheAus().length ? el('div', { class: 'reihe', style: 'margin-top:8px;align-items:center' },
          el('span', { class: 'leise klein', style: 'flex:1' }, naeheAus().length === 1 ? '1 Ort ausgeblendet' : `${naeheAus().length} Orte ausgeblendet`),
          el('button', { type: 'button', class: 'knopf flach', onclick: () => { speicher.set('naeheAus', []); zeichne({ scroll: true }); toast('Alle Orte melden sich wieder.'); } }, 'Wieder zeigen')) : null),
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Plan'), wahl([['A', 'Plan A', 'Empfehlung: Klassiker mit Geheimtipps'], ['B', 'Plan B', 'Geheimtipps'], ['C', 'Plan C', 'Wenig Steigung'], ['G', 'Gruppenplan', 'Aus euren Stimmen, passt sich bei jedem Abgleich an']], S.plan, (id) => { S.plan = id; speicher.set('plan', id); zeichne({ scroll: true }); })),
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Unterkunft'),
        el('p', { class: 'leise klein', style: 'margin:0 0 8px' }, 'Wenn du an der Unterkunft bist: einmal tippen. Der Ort bleibt nur auf diesem Handy. Danach führt dich „Zur Unterkunft“ jederzeit zurück.'),
        E.heimPos
          ? el('div', { class: 'reihe' }, heimKnopf(), el('button', { type: 'button', class: 'knopf warn', onclick: () => { delete E.heimPos; speichereE(); zeichne({ scroll: true }); toast('Unterkunft gelöscht.'); } }, 'Löschen'))
          : el('button', { type: 'button', class: 'knopf breit', onclick: () => {
            if (!S.me) { starteGps(false); toast('Suche deinen Standort … dann nochmal tippen.'); return; }
            E.heimPos = { lat: S.me.lat, lon: S.me.lon, t: Date.now() }; speichereE(); zeichne({ scroll: true }); toast('Unterkunft gespeichert.');
          } }, ic('haus'), 'Hier ist unsere Unterkunft')),
      el('section', { class: 'abschnitt' }, el('h3', {}, `Gut zu wissen in Lissabon · Stand ${STAND_NOTIZEN}`),
        tipps('Fahren', ['Pro Person eine navegante-Karte (0,50 €) am Metro-Automaten.', 'Einzelfahrt 1,90 €. 24-Stunden-Ticket 7,25 €, mit Fähre nach Cacilhas 10,35 €, mit Zug nach Cascais 11,40 € (Metro Lisboa, Tarife ab 01.01.2026).', 'Beim Fahrer teurer: Tram 3,30 €, Bus 2,30 € (Carris, ab 01.01.2026; echoboomer.pt, 23.12.2025).', 'Fähre nach Cacilhas: Einzelticket 2 € (Observador, 23.09.2026), mit Zapping-Guthaben 1,60 € (ttsl.pt, seit 16.03.2026).', 'Gesperrt: Elevador de Santa Justa sowie die Standseilbahnen Glória, Bica und Lavra (lisbontourism.org, 19.10.2026). Der Funicular da Graça fährt wieder seit 30.04.2026 (Lisboa para Pessoas, 01.09.2026). Fahrzeiten: keine aktuelle Info.']),
        tipps('Zeiten', ['Nacht auf Sonntag: Uhren 1 Stunde zurück.', 'Sonntag zu: Sé und Convento do Carmo. Montag zu: Jerónimos, Torre de Belém, MNAC Chiado. Dienstag zu: Gulbenkian, MAAT.', 'Gulbenkian: sonntags ab 14 Uhr gratis (e-konomista.pt, 12.10.2026).', 'Reservieren: O Frade (So Mittag), Estrela da Bica (Mo Abend).']),
        tipps('Shoppen', ['Sonntags haben laut lisbontourism.org (Stand 21.10.2026) vor allem Einkaufszentren und Läden in Touristengegenden offen.', 'Alle Shopping-Adressen findest du unter „Orte“ mit dem Filter „Shoppen“. Bei jedem Ort steht die Quelle mit Datum.']),
        tipps('Notfall', ['Notruf 112: Polizei, Rettung, Feuerwehr (europaweite Notrufnummer).', 'Taschendiebe laut Auswärtigem Amt (abgerufen 24.10.2026) vor allem an Praça do Comércio, Rua Augusta, in der Alfama, am Castelo de São Jorge, in historischen Straßenbahnen, Bahnhöfen und der Metro.', 'Für Notfälle: einen Treffpunkt unter „Gruppe“ festlegen, dann findet jede und jeder dorthin zurück.']),
        tipps('Vor Ort', ['Couvert (Brot, Oliven, Häppchen) darf nur auf die Rechnung, wenn ihr es bestellt oder angerührt habt (postal.pt nach DECO, 13.07.2023). Nicht gewollt: „Não, obrigado“ und abräumen lassen.', 'Trinkgeld ist freiwillig. Eine feste Servicegebühr gilt nur, wenn sie in der Preisliste steht (DECO, 24.06.2025).', 'Taschendiebe in Tram 28 und 15E. Falsche Dealer in der Baixa ignorieren.', 'Bargeld am Multibanco-Automaten holen.']),
        tipps('Diese Karte', ['Nummern zeigen die Reihenfolge des Tages. Die gepunktete Linie ist Luftlinie; den Fußweg zeigt die Navigation.', 'Gehzeiten sind geschätzt: 1,3 × Luftlinie bei 4 km/h.', 'Öffnungszeiten stammen aus OpenStreetMap und können veraltet sein.', 'Android: im Chrome-Menü „Zum Startbildschirm hinzufügen“. iPhone: die Karte in Safari nutzen, denn Gruppen-Links aus der Kamera öffnen sich in Safari, und ein Symbol auf dem Home-Bildschirm hätte einen eigenen, getrennten Speicher.'])),
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Daten und Verbindungen'),
        el('ul', { class: 'klein', style: 'margin:0;padding-left:20px;display:grid;gap:6px' },
          el('li', {}, 'Keine Konten, keine Statistik, keine Werbung.'),
          el('li', {}, 'Markierungen, Notizen und Unterkunft bleiben auf diesem Handy.'),
          el('li', {}, 'Dein Standort bleibt im Handy. Ausnahmen: „Hinführen“ schickt Start und Ziel an den Routenserver von FOSSGIS (openstreetmap.de). „Standort teilen“ schickt ihn verschlüsselt an deine Gruppe.'),
          el('li', {}, `Live-Abgleich: verschlüsselt (AES-256-GCM) mit dem Schlüssel aus eurem Gruppen-Link, über öffentliche Nostr-Server (${(window.Funk ? Funk.RELAYS : []).map((r) => r.replace('wss://', '')).join(', ')}). Die Server sehen deine IP-Adresse und wann du online bist, nicht den Inhalt. Wer den Gruppen-Link hat, liest mit.`),
          el('li', {}, 'Wetter: holt der Bauprozess auf GitHub bei IPMA und Open-Meteo. Dein Handy fragt dort nicht an.'),
          el('li', {}, 'Kartenbilder von OpenStreetMap. Webseiten und Wikipedia öffnen sich nur, wenn du sie antippst.'))),
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Quellen und Lizenzen'),
        el('p', { class: 'klein', style: 'margin:0' }, 'Karte und Orte: © OpenStreetMap-Mitwirkende (ODbL). Texte: Wikipedia (CC BY-SA). Fotos: Wikimedia Commons, Autor und Lizenz stehen unter jedem Bild. Wetter: IPMA (Tage) und Open-Meteo (Stunden, CC BY 4.0). Karte: Leaflet (BSD-2). QR-Codes: qrcode-generator (MIT). Live-Abgleich: nostr-tools (Unlicense). Diese App: MPL-2.0.')),
      el('section', { class: 'abschnitt nur-voll' }, el('h3', {}, 'Zurücksetzen'), el('div', { id: 'reset-box' },
        el('button', { type: 'button', class: 'knopf warn', onclick: () => setze($('#reset-box'),
          el('p', { style: 'margin:0 0 8px' }, 'Alle Markierungen, Notizen und Bewertungen auf diesem Handy löschen?'),
          el('div', { class: 'reihe' },
            el('button', { type: 'button', class: 'knopf', onclick: () => zeichne({ scroll: true }) }, 'Abbrechen'),
            el('button', { type: 'button', class: 'knopf warn', onclick: () => { M = {}; speicher.set('markierungen', M); toast('Alles gelöscht.'); zeichne(); } }, 'Ja, löschen'))) }, 'Markierungen löschen'))));
  }
  const tipps = (titel, punkte) => el('details', { class: 'tipps' }, el('summary', {}, titel), el('ul', {}, punkte.map((p) => el('li', {}, p))));


  // ---------- Gruppenplan: Tagesplan aus den Stimmen ----------
  // Nur Orte mit Zustimmung und ohne „Lieber nicht“ (strittige Orte stehen unter „Gruppe“; Recherche docs/recherche/2026-10-24-gruppenreisen.md),
  // je Tag nach Nähe zum Tagesgebiet aus Plan A, Öffnungstage beachtet, Reihenfolge nach kurzem Fußweg,
  // Mittag- und Abendessen eingeplant. Weniger Stopps im Profil „Einfach“.
  const ESSEN = ['Essen für alle', 'Vegan portugiesisch', 'Vegetarisch'];
  const DAUER = { shop: 75, museum: 90, kirche: 35, aussicht: 20, park: 25, markt: 60, cafe: 30, bar: 45, platz: 20, friedhof: 40, buch: 60, denkmal: 20, turm: 30, weg: 40, kueste: 30, aufzug: 10, tram: 30, faehre: 30 };
  // Belegte Dauer (Spalte „Dauer“, Recherche docs/recherche/2026-10-24-besuchsdauer.md) als Mittelwert, sonst Schätzwert je Typ
  const dauerMin = (o) => { const m = /^(\d+)(?:–(\d+))?$/.exec(o.dauer || ''); return m ? Math.round((+m[1] + +(m[2] || m[1])) / 2) : DAUER[o.typ] || 40; };
  const TAG_IDX = { sa: 6, so: 0, mo: 1 };
  function erlaubteTage(o) {
    const n = `${o.notiz || ''} ${o.dauerQuelle || ''}`, tage = new Set(['sa', 'so', 'mo']);
    if (/nur Sa\b/i.test(n)) return new Set(['sa']);
    if (/nur So\b/i.test(n) || /Kunstmarkt So\b/.test(n)) return new Set(['so']);
    if (o.typ === 'fado' && /Mo und Mi/.test(n)) return new Set(['mo']);
    if (/Sa und So\b/.test(n)) tage.delete('mo');
    if (/Mo zu|So und Mo zu/.test(n)) tage.delete('mo');
    if (/So zu|So und Mo zu|So geschlossen/.test(n)) tage.delete('so');
    if (/Mo geschlossen/.test(n)) tage.delete('mo');
    if (/Mo–Sa/.test(n)) tage.delete('so');
    if (/Mi–Sa/.test(n)) { tage.delete('so'); tage.delete('mo'); }
    const w = o.infos && o.infos.oeffnungszeiten && window.Oeffnung.lies(o.infos.oeffnungszeiten);
    if (w) for (const t of [...tage]) if (!w.woche[TAG_IDX[t]].length) tage.delete(t);
    return tage;
  }
  const mitte = (os) => ({ lat: os.reduce((a, o) => a + o.lat, 0) / os.length, lon: os.reduce((a, o) => a + o.lon, 0) / os.length });
  function reihenfolge(start, os) {
    const rest = os.slice(), weg = [];
    let p = start;
    while (rest.length) { rest.sort((a, b) => meter(p, a.o) - meter(p, b.o)); const n = rest.shift(); weg.push(n); p = n.o; }
    // 2-opt: Kreuzungen auflösen
    const len = (r) => r.reduce((s, x, i) => s + meter(i ? r[i - 1].o : start, x.o), 0);
    let besser = true;
    while (besser) {
      besser = false;
      for (let i = 0; i < weg.length - 1; i++) for (let k = i + 1; k < weg.length; k++) {
        const neu = weg.slice(0, i).concat(weg.slice(i, k + 1).reverse(), weg.slice(k + 1));
        if (len(neu) + 1 < len(weg)) { weg.splice(0, weg.length, ...neu); besser = true; }
      }
    }
    return weg;
  }
  let gpCache = { key: '', plan: null };
  function gruppenplan() {
    const key = JSON.stringify([G.leute, G.gesehen, E.profil, Object.keys(M).filter((id) => M[id].aus)]);
    if (gpCache.key === key && gpCache.plan) return gpCache.plan;
    const wertung = ORTE.filter((o) => hatPos(o) && !mk(o.id).aus && !vonAllenGesehen(o.id) && o.kategorie !== 'Verkehr' && o.ort === 'Lisboa').map((o) => {
      const { ja, nein } = gruppenStimmen(o.id);
      return { o, ja, nein, wert: ja.length - nein.length };
    }).filter((x) => x.ja.length && !x.nein.length); // ein „Lieber nicht“ = strittig, nicht im Plan (Masthoff 2004: Average Without Misery)
    const plan = { sa: [], so: [], mo: [], uebrig: [] };
    const anker = {};
    for (const t of TAGE) {
      const os = schritte('A', t.id).filter((s) => s.ort).map((s) => NACH_NAME.get(s.ort)).filter(hatPos);
      anker[t.id] = { mitte: os.length ? mitte(os) : { lat: LISSABON[0], lon: LISSABON[1] }, start: os[0] || { lat: LISSABON[0], lon: LISSABON[1] } };
    }
    const maxSehen = E.profil === 'standard' ? 7 : 5;
    const sehen = wertung.filter((x) => !ESSEN.includes(x.o.kategorie) && x.o.typ !== 'fado').sort((a, b) => b.wert - a.wert || b.ja.length - a.ja.length);
    const tagListe = { sa: [], so: [], mo: [] };
    for (const x of sehen) {
      const tage = [...erlaubteTage(x.o)].sort((a, b) => meter(anker[a].mitte, x.o) - meter(anker[b].mitte, x.o));
      const t = tage.find((d) => tagListe[d].length < maxSehen && (tage[0] === d || meter(anker[d].mitte, x.o) < 3500));
      if (t) tagListe[t].push(x); else plan.uebrig.push(x);
    }
    const essen = wertung.filter((x) => ESSEN.includes(x.o.kategorie)).sort((a, b) => b.wert - a.wert);
    const fado = wertung.filter((x) => x.o.typ === 'fado');
    const vergeben = new Set();
    const planEssen = (tag, art) => schritte('A', tag).find((s) => s.ort && new RegExp(art, 'i').test(s.text || ''));
    for (const t of TAGE) {
      const weg = reihenfolge(anker[t.id].start, tagListe[t.id]);
      const steps = [];
      let uhr = 10 * 60, pos = anker[t.id].start, mittag = false;
      const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.round(m % 60 / 5) * 5 % 60).padStart(2, '0')}`;
      const essenWahl = (abends, nahe) => {
        const moeglich = essen.filter((x) => !vergeben.has(x.o.id) && erlaubteTage(x.o).has(t.id) && (abends || !/Nur abends|Abends ab/i.test(x.o.notiz)));
        const radius = abends ? 2500 : 1500; // kein Umweg quer durch die Stadt fürs Mittagessen
        const k = moeglich.filter((x) => meter(nahe, x.o) <= radius).sort((a, b) => b.wert - a.wert || meter(nahe, a.o) - meter(nahe, b.o))[0];
        if (k) { vergeben.add(k.o.id); return { o: k.o, text: `${abends ? 'Abendessen' : 'Mittagessen'} · 👍 ${k.ja.join(', ')}` }; }
        const ausPlan = planEssen(t.id, abends ? 'Abend' : 'Mittag');
        const planOrt = ausPlan && NACH_NAME.get(ausPlan.ort);
        if (!planOrt || vergeben.has(planOrt.id) || !hatPos(planOrt) || meter(nahe, planOrt) > radius * 1.5) {
          const nah = ORTE.filter((o) => ESSEN.includes(o.kategorie) && hatPos(o) && o.ort === 'Lisboa' && !vergeben.has(o.id) && !mk(o.id).aus
            && erlaubteTage(o).has(t.id) && (abends || !/Nur abends|Abends ab/i.test(o.notiz)) && gruppenStimmen(o.id).nein.length === 0)
            .sort((a, b) => meter(nahe, a) - meter(nahe, b))[0];
          if (!nah) return null;
          vergeben.add(nah.id);
          return { o: nah, text: `${abends ? 'Abendessen' : 'Mittagessen'}: Vorschlag in der Nähe (noch keine Stimmen)` };
        }
        vergeben.add(NACH_NAME.get(ausPlan.ort).id);
        return { o: NACH_NAME.get(ausPlan.ort), text: `${abends ? 'Abendessen' : 'Mittagessen'} aus Plan A (noch keine Stimmen dafür)` };
      };
      weg.forEach((x, i) => {
        // Mittag dort, wo man gerade ist, bevor es weitergeht
        if (!mittag && i > 0 && uhr >= 12 * 60 + 15) {
          const e = essenWahl(false, pos);
          if (e && e.o) { uhr = Math.max(uhr + gehzeit(meter(pos, e.o)), 12 * 60 + 30); steps.push({ ort: e.o.name, zeit: fmt(uhr), text: e.text }); uhr += 75; pos = e.o; }
          mittag = true;
        }
        const strecke_m = meter(pos, x.o);
        if (strecke_m > 2500) steps.push({ hinweis: `Weiter Weg (${strecke(strecke_m)}): besser Tram, Bus oder Metro nehmen` });
        uhr += strecke_m > 2500 ? 35 : gehzeit(strecke_m);
        if (i === 3 && E.profil !== 'standard') steps.push({ hinweis: 'Kurze Pause: hinsetzen, etwas trinken' });
        steps.push({ ort: x.o.name, zeit: fmt(uhr), text: `👍 ${x.ja.join(', ')}${x.nein.length ? ` · 👎 ${x.nein.join(', ')}` : ''}` });
        uhr += dauerMin(x.o); pos = x.o;
      });
      if (weg.length && !mittag) {
        const e = essenWahl(false, pos);
        if (e && e.o) { uhr = Math.max(uhr + gehzeit(meter(pos, e.o)), 12 * 60 + 30); steps.push({ ort: e.o.name, zeit: fmt(uhr), text: e.text }); uhr += 75; pos = e.o; }
      }
      if (weg.length && uhr < 16 * 60) steps.push({ hinweis: `Ab etwa ${fmt(uhr)} frei: Stimmt für mehr Orte ab, dann füllt sich der Tag.` });
      if (weg.length) {
        const e = essenWahl(true, pos);
        if (e && e.o) steps.push({ ort: e.o.name, zeit: fmt(Math.max(uhr + gehzeit(meter(pos, e.o)), 19 * 60 + 30)), text: e.text });
        const f = fado.find((x) => erlaubteTage(x.o).has(t.id));
        if (f) steps.push({ ort: f.o.name, zeit: '21:00', text: `Fado · 👍 ${f.ja.join(', ')}` });
      }
      plan[t.id] = steps;
    }
    gpCache = { key, plan };
    return plan;
  }

  // ---------- Treffpunkt ----------
  const treffOrt = () => (G.treff && !G.treff.geloescht ? { id: 'treff', name: `Treffpunkt: ${G.treff.name}`, kategorie: 'Verkehr', typ: 'treff', adresse: G.treff.name, notiz: '', lat: G.treff.lat, lon: G.treff.lon } : null);
  function treffKarte() {
    if (!G.treff || G.treff.geloescht) return null;
    const t = G.treff, o = treffOrt();
    const d = S.me ? meter(S.me, o) : null;
    const von = t.von === (G.ich && G.ich.id) ? meinName() : ((G.leute[t.von] || {}).name || 'Jemand');
    return el('div', { class: 'treff-karte' },
      el('div', { class: 'zeile', style: 'display:flex;gap:12px;align-items:center' },
        el('span', { class: 'marker treff' }, symbol({ typ: 'treff', kategorie: 'Verkehr' })),
        el('div', { class: 'was', style: 'flex:1;min-width:0' }, el('small', {}, `Treffpunkt · von ${von}${d != null ? ` · ${gehzeit(d)} Min. zu Fuß` : ''}`),
          el('strong', {}, `${t.zeit} Uhr · ${t.name}`))),
      el('div', { class: 'reihe' },
        el('button', { type: 'button', class: 'knopf haupt', style: 'flex:2 1 160px', onclick: () => starteNavi(o, true) }, ic('route'), 'Hinführen'),
        el('button', { type: 'button', class: 'knopf nur-voll', style: 'flex:1 1 100px', onclick: () => { S.treffForm = { zeit: t.zeit, q: '' }; S.tab = 'gruppe'; hoehe('gross'); zeichne(); } }, 'Ändern')));
  }
  function treffForm() {
    const f = S.treffForm;
    const zeit = el('input', { id: 'treff-zeit', type: 'time', value: f.zeit, step: '300', 'aria-label': 'Uhrzeit' });
    zeit.addEventListener('input', () => { f.zeit = zeit.value; });
    const such = el('input', { id: 'treff-suche', type: 'search', placeholder: 'Ort suchen', value: f.q || '', 'aria-label': 'Ort für den Treffpunkt suchen' });
    const liste = el('ul', { class: 'liste auswahl' });
    const speichere = (name, lat, lon) => {
      if (!f.zeit) { toast('Gib eine Uhrzeit ein.'); return; }
      ich();
      G.treff = { name, lat, lon, zeit: f.zeit, von: G.ich.id, t: Date.now() };
      G.leute[G.ich.id].t = Date.now(); speichereG();
      S.treffForm = null; zeichne({ anpassen: true });
      toast(F.an && F.status.verbunden ? 'Treffpunkt gespeichert. Alle mit offener App sehen ihn gleich.' : 'Treffpunkt gespeichert. Ohne Live-Verbindung: QR zeigen oder Link senden.', F.an && F.status.verbunden ? {} : { aktion: 'Link senden', fn: teileGruppe });
    };
    const fuelle = () => {
      const q = falte(f.q || '');
      setze(liste, ORTE.filter((o) => hatPos(o) && (!q || falte(o.name).includes(q))).sort((a, b) => (S.me ? meter(S.me, a) - meter(S.me, b) : a.name.localeCompare(b.name, 'pt'))).slice(0, 30)
        .map((o) => el('li', {}, el('button', { type: 'button', class: 'waehle', onclick: () => speichere(o.name, o.lat, o.lon) },
          el('span', { class: 'marker g-' + gruppeVon(o.kategorie), style: 'width:32px;height:32px' }, symbol(o)), el('span', {}, o.name, el('small', {}, o.kategorie))))));
    };
    such.addEventListener('input', () => { f.q = such.value; fuelle(); });
    fuelle();
    return el('div', { class: 'karte-box', style: 'display:grid;gap:10px' },
      el('strong', {}, 'Treffpunkt festlegen'),
      el('label', { for: 'treff-zeit', class: 'klein leise' }, 'Uhrzeit'), zeit,
      el('button', { type: 'button', class: 'knopf', onclick: () => { if (!S.me) { starteGps(false); toast('Suche deinen Standort … dann nochmal tippen.'); return; } speichere('hier, wo ich gerade bin', S.me.lat, S.me.lon); } }, ic('standort'), 'Hier, wo ich gerade bin'),
      el('span', { class: 'klein leise' }, 'Oder einen Ort wählen:'), such, liste,
      el('div', { class: 'reihe' },
        el('button', { type: 'button', class: 'knopf', onclick: () => { S.treffForm = null; zeichne({ scroll: true }); } }, 'Abbrechen'),
        G.treff && !G.treff.geloescht ? el('button', { type: 'button', class: 'knopf warn', onclick: () => { G.treff = { geloescht: true, von: ich() && G.ich.id, t: Date.now() }; ich().t = Date.now(); speichereG(); S.treffForm = null; zeichne(); toast(F.an && F.status.verbunden ? 'Treffpunkt gelöscht.' : 'Treffpunkt gelöscht. Ohne Live-Verbindung: Link senden, damit es alle wissen.'); } }, 'Treffpunkt löschen') : null));
  }

  // ---------- Gruppe: Live, Nachrichten, Angepinntes ----------
  const uhrzeit = (t) => { const d = new Date(t), h = new Date(); const z = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; return d.toDateString() === h.toDateString() ? z : `${['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()]} ${z}`; };
  function funkAnzeige() { if ((S.tab === 'gruppe' || S.tab === 'live') && !S.ort) neuZeichnen(); }
  function pinKarte() {
    if (!G.pin || G.pin.weg || !G.pin.x) return null;
    const von = G.ich && G.pin.von === G.ich.id ? 'dir' : G.pin.n || 'jemandem';
    return el('div', { class: 'pin-karte', role: 'note' }, ic('pin'),
      el('div', { class: 'pin-text' }, el('small', {}, `Angepinnt von ${von} · ${uhrzeit(G.pin.t)}`), el('p', {}, G.pin.x)),
      G.ich && G.ich.name ? el('button', { type: 'button', class: 'knopf flach nur-voll', onclick: () => { anpinnen(null); zeichne({ scroll: true, karte: false }); toast('Gelöst.'); } }, 'Lösen') : null);
  }
  const personOrt = (id) => { const x = F.leuteOrt.get(id); return x ? { id: 'p-' + id, name: x.n, kategorie: 'Verkehr', typ: 'treff', adresse: `Position von ${uhrzeit(x.ts)}`, notiz: '', lat: x.lat, lon: x.lon } : null; };
  function liveTeil() {
    const st = F.status, verbunden = F.an && st.verbunden > 0;
    const da = [...F.gehoert].filter(([, t]) => Date.now() - t < 180000).map(([id]) => (G.leute[id] && G.leute[id].name) || (F.leuteOrt.get(id) || {}).n).filter(Boolean);
    const bis = E.teilenBis ? new Date(E.teilenBis) : null;
    const startTeilen = (ms) => {
      E.teilenBis = ms; speichereE();
      if (S.watchId == null) starteGps(false);
      if (S.me) funkOrt(S.me, true);
      toast(verbunden ? 'Die Gruppe sieht dich jetzt auf der Karte, solange deine App offen ist.' : 'Wird geteilt, sobald Live verbunden ist.');
      zeichne({ scroll: true, karte: false });
    };
    const mitternacht = new Date(); mitternacht.setHours(23, 59, 0, 0);
    const teilen = teileOrt()
      ? el('div', { class: 'reihe' }, el('p', { style: 'margin:0;flex:1 1 160px' }, el('strong', {}, 'Du teilst deinen Standort'), ` bis ${uhrzeit(bis.getTime())}.`),
        el('button', { type: 'button', class: 'knopf warn', onclick: () => { teilenEnde(); zeichne({ scroll: true, karte: false }); } }, 'Nicht mehr teilen'))
      : el('div', { style: 'display:grid;gap:8px' }, el('strong', {}, 'Meinen Standort mit der Gruppe teilen'),
        el('div', { class: 'reihe' },
          el('button', { type: 'button', class: 'knopf', style: 'flex:1 1 130px', onclick: () => startTeilen(Date.now() + 3600e3) }, ic('standort'), '1 Stunde'),
          el('button', { type: 'button', class: 'knopf', style: 'flex:1 1 130px', onclick: () => startTeilen(mitternacht.getTime()) }, ic('standort'), 'Bis Mitternacht')));
    const leute = [...F.leuteOrt].sort((a, b) => (S.me ? meter(S.me, a[1]) - meter(S.me, b[1]) : b[1].ts - a[1].ts));
    const liste = leute.length ? el('ul', { class: 'liste' }, leute.map(([id, x]) => el('li', { class: 'eintrag person-zeile' },
      el('button', { type: 'button', class: 'auf', onclick: () => { if (karte) { hoehe('klein'); karte.setView([x.lat, x.lon], 17); } } },
        el('span', { class: 'marker person' + (Date.now() - x.ts > 600000 ? ' alt' : '') }, initialen(x.n)),
        el('span', { class: 'text' }, el('span', { class: 'titel' }, x.n),
          el('span', { class: 'unter' }, [S.me ? `${strecke(meter(S.me, x))} entfernt` : null, `Stand ${uhrzeit(x.ts)} (${zeitHer(x.ts)})`].filter(Boolean).join(' · ')))),
      el('button', { type: 'button', class: 'haken', 'aria-label': `Zu ${x.n} hinführen`, onclick: () => starteNavi(personOrt(id), true) }, ic('route'))))) : null;
    return el('section', { class: 'karte-box live', style: 'margin-top:4px;display:grid;gap:10px' },
      el('div', { class: 'live-kopf' }, el('span', { class: 'lampe ' + (verbunden ? 'an' : F.an ? 'sucht' : 'aus'), 'aria-hidden': 'true' }),
        el('strong', {}, verbunden ? 'Live verbunden' : F.an ? 'Verbinde …' : 'Live aus'),
        verbunden ? el('span', { class: 'leise klein' }, `${st.verbunden} von ${st.gesamt} Servern · verschlüsselt`) : null),
      el('p', { class: 'leise klein', style: 'margin:0' }, verbunden
        ? (da.length ? `Gerade auch offen: ${da.join(', ')}. ` : 'Gerade ist sonst niemand online. ') + 'Stimmen, Umfragen, Treffpunkt, Nachrichten, geteilte Orte und Markierungen gleichen sich von selbst ab, sobald ein anderes Handy die App offen hat.'
        : F.an ? 'Noch kein Server erreicht. Der Abgleich per QR-Code oder Link geht immer.' : E.funk === false ? 'Du hast den Live-Abgleich ausgeschaltet. Abgleich per QR-Code oder Link.' : 'Live-Abgleich startet …'),
      teilen,
      verbunden ? el('button', { type: 'button', class: 'knopf breit', onclick: woFragen }, ic('gruppe'), 'Wo seid ihr? Alle fragen') : null,
      liste,
      el('p', { class: 'leise klein', style: 'margin:0' }, 'Positionen kommen nur, solange die App offen ist. Die Server sehen nur Verschlüsseltes, manche halten es ein paar Minuten vor. Für unterwegs in der Tasche: WhatsApp-Live-Standort.'),
      el('button', { type: 'button', class: 'knopf flach nur-voll', style: 'justify-self:start;min-height:48px', onclick: () => {
        E.funk = E.funk === false; speichereE();
        if (E.funk === false) { if (teileOrt()) teilenEnde(true); funkStopp(); } else funkStart();
        zeichne({ scroll: true, karte: false });
      } }, E.funk === false ? 'Live-Abgleich einschalten' : 'Live-Abgleich ausschalten'));
  }
  // ---------- Eigene Orte (Wunsch 25.10.2026) ----------
  // Eintragen über die Suche bei OpenStreetMap, am eigenen Standort oder auf der Karte (Nadel ziehen, langes Drücken).
  // Suche: Nominatim der OSM Foundation, nur auf Knopfdruck, höchstens 1 Anfrage pro Sekunde, kein Vorschlagen beim Tippen,
  // Namensnennung (operations.osmfoundation.org/policies/nominatim, abgerufen 25.10.2026). Die Adresse des Dienstes steht in
  // dienste.json, damit er sich ohne App-Änderung abschalten lässt (verlangt die Richtlinie). Eigene Orte gleichen sich mit der Gruppe ab.
  const EIGEN_KATS = [
    ['Sehenswürdigkeit', 'denkmal', 'Sehenswürdigkeit'], ['Museum', 'museum', 'Museum'], ['Aussichtspunkt', 'aussicht', 'Aussicht'],
    ['Strand', 'kueste', 'Strand'], ['Essen für alle', 'restaurant', 'Restaurant'], ['Vegetarisch', 'restaurant', 'Vegetarisch'],
    ['Café', 'cafe', 'Café'], ['Bar', 'bar', 'Bar'], ['Shoppen', 'shop', 'Laden'], ['Foto', 'foto', 'Foto-Spot'], ['Verkehr', 'bahn', 'Verkehr'],
  ];
  function eigeneEinbauen() {
    ORTE = ORTE.filter((o) => !o.eigen);
    for (const [id, o] of [...NACH_ID]) if (o.eigen) NACH_ID.delete(id);
    for (const [n, o] of [...NACH_NAME]) if (o.eigen) NACH_NAME.delete(n);
    for (const [id, x] of Object.entries(G.eigene)) {
      if (x.w) continue;
      const k = EIGEN_KATS.find((e) => e[0] === x.k) || EIGEN_KATS[0];
      const o = { id: 'e-' + id, name: x.n, kategorie: k[0], typ: x.y || k[1], lat: x.lat, lon: x.lon, adresse: x.a || '', notiz: '', ort: '',
        eigen: { id, von: x.von, t: x.t, x: x.x || '', q: x.q || '' }, infos: x.oh ? { oeffnungszeiten: x.oh } : undefined };
      ORTE.push(o); NACH_ID.set(o.id, o); if (!NACH_NAME.has(o.name)) NACH_NAME.set(o.name, o);
    }
  }
  function eigenNeu(vorgabe = {}) {
    if (!vorgabe.plan) { S.tab = 'orte'; speicher.set('tab', 'orte'); }
    S.ort = null; S.nah = null;
    S.eigen = Object.assign({ n: '', k: '', x: '', lat: null, lon: null, q: '', treffer: null }, vorgabe);
    if (vorgabe.lat != null) { hoehe('mitte'); zeichne({ anpassen: true }); setTimeout(() => { const f = $('#eigen-name'); if (f) f.focus({ preventScroll: true }); }, 350); return; }
    hoehe('gross'); zeichne({ anpassen: false });
    if (vorgabe.suchen && vorgabe.q) osmSuchen(vorgabe.q);
  }
  function eigenAbbrechen() { const zumPlan = S.eigen && S.eigen.plan; S.eigen = null; if (zumPlan) hoehe('gross'); zeichne({ anpassen: true }); }
  const eigenAktiv = () => !!S.eigen && (S.eigen.plan ? S.tab === 'plan' : S.tab === 'orte');
  // Sichtbare Kartenmitte (über dem Blatt)
  function sichtMitte() {
    const h = innerWidth >= 760 ? innerHeight : innerHeight - blattPx() - $('#leiste').offsetHeight;
    const ll = karte.containerPointToLatLng(L.point(innerWidth >= 760 ? (innerWidth - 440) / 2 : innerWidth / 2, Math.max(60, h / 2)));
    return { lat: ll.lat, lon: ll.lng };
  }
  let osmZuletzt = 0;
  function osmKategorie(t) {
    const c = t.category, y = t.type;
    if (c === 'tourism' && ['museum', 'gallery'].includes(y)) return 'Museum';
    if (c === 'tourism' && y === 'viewpoint') return 'Aussichtspunkt';
    if ((c === 'natural' && y === 'beach') || (c === 'leisure' && y === 'beach_resort')) return 'Strand';
    if (c === 'amenity' && ['restaurant', 'fast_food', 'food_court'].includes(y)) return 'Essen für alle';
    if (c === 'amenity' && y === 'cafe') return 'Café';
    if (c === 'amenity' && ['bar', 'pub', 'biergarten', 'nightclub'].includes(y)) return 'Bar';
    if (c === 'shop') return 'Shoppen';
    if (['railway', 'public_transport', 'aeroway'].includes(c) || (c === 'amenity' && ['ferry_terminal', 'bus_station'].includes(y))) return 'Verkehr';
    return 'Sehenswürdigkeit';
  }
  // Abfrage bei Nominatim; wirft Error('aus'), wenn der Dienst in dienste.json abgeschaltet ist
  async function osmAbfrage(q) {
    const cfg = await fetch('dienste.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
    const url = cfg.suche === undefined ? 'https://nominatim.openstreetmap.org/search' : cfg.suche;
    if (!url) throw new Error('aus');
    const warte = 1100 - (Date.now() - osmZuletzt);
    if (warte > 0) await new Promise((r) => setTimeout(r, warte));
    osmZuletzt = Date.now();
    const p = new URLSearchParams({ q, format: 'jsonv2', limit: '8', extratags: '1', 'accept-language': 'de' });
    if (karte) { const b = karte.getBounds(); p.set('viewbox', [b.getWest(), b.getNorth(), b.getEast(), b.getSouth()].map((v) => v.toFixed(4)).join(',')); }
    const r = await fetch(`${url}?${p}`);
    if (!r.ok) throw new Error('http ' + r.status);
    const d = await r.json();
    return (Array.isArray(d) ? d : []).map((t) => ({
      n: t.name || String(t.display_name || '').split(',')[0], lat: +t.lat, lon: +t.lon, k: osmKategorie(t),
      a: String(t.display_name || '').split(',').slice(0, 3).join(',').trim(), q: t.osm_type && t.osm_id ? `osm:${t.osm_type}/${t.osm_id}` : 'osm',
      oh: (t.extratags && t.extratags.opening_hours) || '', art: [t.category, t.type].filter(Boolean).join('=') }))
      .filter((t) => t.n && Number.isFinite(t.lat) && Number.isFinite(t.lon));
  }
  const osmFehler = (e) => ({ fehler: String(e.message) === 'aus' ? 'Die Suche ist gerade abgeschaltet.' : navigator.onLine === false ? 'Ohne Internet geht die Suche nicht. Setze den Punkt auf der Karte.' : 'Die Suche hat nicht geantwortet. Später noch einmal, oder den Punkt auf der Karte setzen.' });
  async function osmSuchen(q) {
    q = (q || '').trim();
    if (q.length < 2) { toast('Bitte mindestens zwei Zeichen.'); return; }
    S.eigen.q = q; S.eigen.treffer = 'laedt'; zeichne({ scroll: true, karte: false });
    try {
      const t = await osmAbfrage(q);
      if (!S.eigen) return;
      S.eigen.treffer = t;
    } catch (e) {
      if (!S.eigen) return;
      S.eigen.treffer = osmFehler(e);
    }
    zeichne({ scroll: true, karte: false });
  }
  function zeichneEigen(box) {
    const f = S.eigen, bearbeiten = !!f.id;
    const kopf = el('div', { class: 'nah-kopf' }, el('h3', {}, bearbeiten ? 'Ort bearbeiten' : f.plan ? 'Neuer Ort' : 'Eigenen Ort eintragen'),
      el('button', { type: 'button', class: 'knopf flach', onclick: eigenAbbrechen }, ic('x'), 'Abbrechen'));
    if (f.lat == null) {
      const feld = el('input', { id: 'eigen-suche', type: 'search', value: f.q || '', placeholder: 'Name oder Adresse', enterkeyhint: 'search', autocomplete: 'off', 'aria-label': 'Ort bei OpenStreetMap suchen' });
      feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); feld.blur(); osmSuchen(feld.value); } });
      const t = f.treffer;
      const treffer = t === 'laedt' ? el('p', { class: 'leise' }, 'Sucht …')
        : t && t.fehler ? el('p', { role: 'alert' }, t.fehler)
          : Array.isArray(t) ? (t.length ? el('ul', { class: 'liste' }, t.map((x) => el('li', { class: 'eintrag' },
            el('button', { type: 'button', class: 'auf', onclick: () => { Object.assign(S.eigen, { n: x.n, k: x.k, lat: x.lat, lon: x.lon, a: x.a, q: x.q, oh: x.oh, treffer: null }); haptik(); hoehe('mitte'); zeichne({ anpassen: true }); } },
              el('span', { class: 'marker g-' + gruppeVon(x.k) }, el('span', { html: `<svg viewBox="0 0 24 24" aria-hidden="true">${SYMBOL[(EIGEN_KATS.find((e) => e[0] === x.k) || EIGEN_KATS[0])[1]] || ''}</svg>`, style: 'display:contents' })),
              el('span', { class: 'text' }, el('span', { class: 'titel' }, x.n), el('span', { class: 'unter' }, [x.a, S.me ? strecke(meter(S.me, x)) : null].filter(Boolean).join(' · '))))))) : el('p', {}, `Nichts gefunden für „${f.q}“. Setze den Punkt auf der Karte.`))
            : null;
      setze(box, kopf,
        el('div', { class: 'feld' }, feld, el('button', { type: 'button', class: 'knopf haupt', onclick: () => { feld.blur(); osmSuchen(feld.value); } }, 'Suchen')),
        treffer,
        el('div', { style: 'display:grid;gap:8px;margin-top:12px' },
          el('button', { type: 'button', class: 'knopf breit', onclick: () => {
            if (!S.me) { starteGps(false); toast('Suche deinen Standort … dann nochmal tippen.'); return; }
            Object.assign(S.eigen, { lat: S.me.lat, lon: S.me.lon }); hoehe('mitte'); zeichne({ anpassen: true });
          } }, ic('standort'), 'Hier, wo ich gerade bin'),
          el('button', { type: 'button', class: 'knopf breit', onclick: () => { hoehe('klein'); setTimeout(() => { Object.assign(S.eigen, sichtMitte()); zeichne({ anpassen: false }); }, 360); } }, ic('orte'), 'Auf der Karte wählen')),
        el('p', { class: 'leise klein', style: 'margin:10px 0 0' }, 'Tipp: Lange auf die Karte drücken setzt den Punkt direkt.'),
        el('p', { class: 'quelle', style: 'margin-top:8px' }, 'Suche: Nominatim, Daten © OpenStreetMap-Mitwirkende (ODbL). Deine Suchwörter gehen an die OpenStreetMap Foundation, dein Standort nicht.'));
      return;
    }
    const name = el('input', { id: 'eigen-name', type: 'text', maxlength: '80', value: f.n || '', placeholder: 'Name des Ortes', autocomplete: 'off', 'aria-label': 'Name des Ortes' });
    name.addEventListener('input', () => { S.eigen.n = name.value; });
    const notiz = el('textarea', { class: 'notiz-feld', maxlength: '300', placeholder: 'Notiz für alle, zum Beispiel: „Toller Blick, Eingang hinten“', 'aria-label': 'Notiz' });
    notiz.value = f.x || ''; notiz.addEventListener('input', () => { S.eigen.x = notiz.value; });
    const kats = el('div', { class: 'chips wrap', role: 'group', 'aria-label': 'Art des Ortes' },
      EIGEN_KATS.map(([k, , label]) => el('button', { type: 'button', class: 'chip g-' + gruppeVon(k), 'aria-pressed': String((f.k || 'Sehenswürdigkeit') === k), onclick: () => { S.eigen.k = k; haptik(); zeichne({ scroll: true, karte: false }); } },
        el('span', { class: 'punktfarbe' }), label)));
    const speichern = () => {
      const n = (S.eigen.n || '').trim();
      if (!n) { toast('Bitte einen Namen eingeben.'); name.focus(); return; }
      const planId = S.eigen.plan;
      const id = eigenSpeichern(S.eigen);
      S.eigen = null; haptik(15);
      const pl = planId && G.plaene[planId];
      if (pl && !pl.x) {
        if (!pl.s.includes(id)) { pl.s.push(id); planSpeichern(pl); }
        PL.modus = 'liste'; hoehe('mitte'); zeichne({ anpassen: true });
        toast(`${n} ist jetzt Stopp ${pl.s.length} in „${pl.n}“.`);
        return;
      }
      oeffneOrt(id);
      toast(G.ich && G.ich.name ? 'Gespeichert. Deine Gruppe sieht den Ort.' : 'Gespeichert, auf diesem Handy.');
    };
    // Gibt es den Ort schon? (gleicher Name oder näher als 25 m)
    const schon = ORTE.find((o) => hatPos(o) && !(o.eigen && o.eigen.id === f.id) && ((f.n && falte(o.name) === falte(f.n)) || meter(o, f) < 25));
    const kopf2 = el('div', { class: 'nah-kopf' }, el('h3', {}, bearbeiten ? 'Ort bearbeiten' : f.plan ? 'Neuer Ort' : 'Eigenen Ort eintragen'),
      el('span', { class: 'reihe', style: 'flex-wrap:nowrap' },
        el('button', { type: 'button', class: 'knopf flach', 'aria-label': 'Abbrechen', onclick: eigenAbbrechen }, ic('x')),
        el('button', { type: 'button', class: 'knopf haupt', onclick: speichern }, ic('haken'), 'Speichern')));
    setze(box, kopf2,
      schon ? el('div', { class: 'hilfe', role: 'note', style: 'margin:0 0 10px' }, el('span', {}, `Gibt es schon: „${schon.name}“ (${strecke(meter(schon, f))} entfernt).`),
        el('button', { type: 'button', class: 'knopf flach', onclick: () => { S.eigen = null; oeffneOrt(schon.id); } }, 'Öffnen')) : null,
      el('p', { class: 'hilfe', style: 'margin:0 0 10px' }, el('span', {}, 'Die Nadel auf der Karte zeigt den Ort. Zum Verschieben ziehen.')),
      el('label', { class: 'klein leise', for: 'eigen-name' }, 'Name'), el('div', { class: 'feld' }, name),
      el('p', { class: 'klein leise', style: 'margin:12px 0 6px' }, 'Art'), kats,
      el('p', { class: 'klein leise', style: 'margin:12px 0 6px' }, 'Notiz (freiwillig)'), notiz,
      f.a ? el('p', { class: 'leise klein', style: 'margin:8px 0 0' }, `Adresse laut OpenStreetMap: ${f.a}`) : null,
      el('p', { class: 'leise klein', style: 'margin:8px 0 0' }, G.ich && G.ich.name ? 'Deine Gruppe sieht den Ort, deine Notiz und deinen Namen.' : 'Bleibt auf diesem Handy, bis du einer Gruppe beitrittst.'),
      el('div', { class: 'reihe', style: 'margin-top:12px' },
        el('button', { type: 'button', class: 'knopf', onclick: () => { Object.assign(S.eigen, { lat: null, lon: null }); hoehe('gross'); zeichne({ anpassen: false }); } }, 'Anderer Ort'),
        el('button', { type: 'button', class: 'knopf haupt', style: 'flex:1', onclick: speichern }, ic('haken'), f.plan ? 'Speichern und zum Plan' : 'Speichern')));
  }
  function eigenSpeichern(f) {
    const id = f.id || neueId();
    const alt = G.eigene[id] || {};
    const k = EIGEN_KATS.find((e) => e[0] === f.k) || EIGEN_KATS[0];
    ich();
    G.eigene[id] = { n: f.n.trim().slice(0, 80), k: k[0], y: k[1], lat: +(+f.lat).toFixed(6), lon: +(+f.lon).toFixed(6), x: (f.x || '').trim().slice(0, 300),
      von: alt.von || G.ich.id, t: Date.now(), w: 0, q: (f.q || alt.q || 'hand').slice(0, 40), a: (f.a || alt.a || '').slice(0, 120), oh: (f.oh || alt.oh || '').slice(0, 200) };
    speichereG(); eigeneEinbauen();
    return 'e-' + id;
  }
  function eigenBlock(o) {
    const e = o.eigen, x = G.eigene[e.id];
    const quelle = /^osm:/.test(e.q) ? el('span', {}, 'Lage und Name aus ', el('a', { href: `https://www.openstreetmap.org/${e.q.slice(4)}`, target: '_blank', rel: 'noopener' }, 'OpenStreetMap'), ' (ODbL).') : 'Von Hand auf der Karte gesetzt.';
    return el('section', { class: 'abschnitt' }, el('h3', {}, 'Eigener Ort'),
      e.x ? el('p', { style: 'margin:0 0 6px' }, e.x) : null,
      el('p', { class: 'quelle', style: 'margin:0' }, `Eingetragen von ${G.ich && e.von === G.ich.id ? 'dir' : personName(e.von)} · ${uhrzeit(e.t)}. `, quelle),
      el('div', { class: 'reihe', style: 'margin-top:10px' },
        el('button', { type: 'button', class: 'knopf', onclick: () => { schliesseOrt(); eigenNeu({ id: e.id, n: x.n, k: x.k, x: x.x, lat: x.lat, lon: x.lon, a: x.a, q: x.q, oh: x.oh }); } }, ic('notiz'), 'Bearbeiten'),
        el('button', { type: 'button', class: 'knopf warn', onclick: () => {
          x.w = 1; x.t = Date.now(); speichereG(); eigeneEinbauen(); schliesseOrt();
          toast(`„${x.n}“ gelöscht.`, { aktion: 'Rückgängig', fn: () => { x.w = 0; x.t = Date.now(); speichereG(); eigeneEinbauen(); zeichne(); } });
        } }, ic('aus'), 'Löschen')));
  }

  // ---------- Blickrichtung (nur nach Tipp; Recherche standort-und-live.md, Regel 7) ----------
  // iOS: DeviceOrientationEvent.requestPermission() aus einer Geste, dann webkitCompassHeading (magnetisch Nord),
  // ungenau (webkitCompassAccuracy > 45° oder < 0): kein Kegel. Android: „deviceorientationabsolute“; flach oder leicht geneigt
  // 360 − alpha (W3C, nur bei flachem Gerät exakt), steil gehalten nach dem Beispiel „compassHeading“ der W3C-Spezifikation.
  const BLICK = { an: false, grad: null, zeit: 0 };
  function kompass(alpha, beta, gamma) {
    const d = Math.PI / 180, x = beta * d, y = gamma * d, z = alpha * d;
    const cX = Math.cos(x), cY = Math.cos(y), cZ = Math.cos(z), sX = Math.sin(x), sY = Math.sin(y), sZ = Math.sin(z);
    const vx = -cZ * sY - sZ * sX * cY, vy = -sZ * sY + cZ * sX * cY;
    let h = Math.atan(vx / vy);
    if (vy < 0) h += Math.PI; else if (vx < 0) h += 2 * Math.PI;
    return h / d;
  }
  const WIND = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
  const windName = (g) => WIND[Math.round(g / 45) % 8];
  let rosePos = 0;
  // Anzeige neben dem Standortknopf: Rose dreht sich entgegen der Blickrichtung (N zeigt nach Norden), Text „NO 42°“
  function kompassZeichnen() {
    const b = $('#btn-kompass'); if (!b) return;
    const g = BLICK.grad, t = $('.kompass-text', b);
    b.dataset.zustand = !BLICK.an ? 'aus' : g == null ? 'warte' : 'an';
    b.setAttribute('aria-pressed', String(BLICK.an));
    b.setAttribute('aria-label', !BLICK.an ? 'Kompass und Blickrichtung einschalten' : g == null ? 'Kompass sucht Richtung. Zum Ausschalten tippen.' : `Blickrichtung ${windName(g)} ${Math.round(g)} Grad. Zum Ausschalten tippen.`);
    const txt = !BLICK.an ? 'Kompass' : g == null ? 'sucht …' : `${windName(g)} ${Math.round(g) % 360}°`;
    if (t.textContent !== txt) t.textContent = txt;
    if (g != null) { // kürzesten Weg drehen, nicht über 360° zurückspulen
      const d = ((-g - rosePos) % 360 + 540) % 360 - 180; rosePos += d;
      $('.scheibe', b).style.transform = `rotate(${rosePos.toFixed(1)}deg)`;
    }
  }
  function richtungSetzen(g) {
    if (g != null && BLICK.grad != null) { const d = ((g - BLICK.grad + 540) % 360) - 180; g = (BLICK.grad + 0.35 * d + 360) % 360; } // Zittern glätten
    BLICK.grad = g; BLICK.zeit = Date.now();
    const e = ichPunkt && ichPunkt.getElement();
    if (e) { e.classList.toggle('mit-richtung', g != null); if (g != null) e.style.setProperty('--richtung', `${Math.round(g)}deg`); }
    kompassZeichnen();
  }
  function aufIos(ev) {
    if (typeof ev.webkitCompassHeading !== 'number' || ev.webkitCompassAccuracy < 0 || ev.webkitCompassAccuracy > 45) { richtungSetzen(null); return; }
    richtungSetzen(ev.webkitCompassHeading);
  }
  function aufAndroid(ev) {
    if (ev.alpha == null || ev.beta == null || ev.gamma == null) { richtungSetzen(null); return; }
    // Flach oder leicht geneigt (Karte lesen): Oberkante zeigt nach 360 − alpha; steil gehalten: Rückseite nach W3C-Beispiel
    richtungSetzen(Math.abs(ev.beta) < 60 && Math.abs(ev.gamma) < 30 ? (360 - ev.alpha) % 360 : kompass(ev.alpha, ev.beta, ev.gamma));
  }
  // leise: automatischer Start mit dem Standort, ohne Meldungen bei Fehlern
  async function richtungUmschalten(leise) {
    leise = leise === true;
    if (BLICK.an) {
      removeEventListener('deviceorientation', aufIos); removeEventListener('deviceorientationabsolute', aufAndroid);
      BLICK.an = false; BLICK.grad = null; E.richtungAus = true; speichereE(); richtungSetzen(null); zeichne({ scroll: true, karte: false }); return;
    }
    if (BLICK.startet) return;
    if (!leise) { E.richtungAus = false; speichereE(); }
    BLICK.startet = true;
    try {
      // Android braucht keine Erlaubnis und hat „deviceorientationabsolute“; iOS fragt per requestPermission() nach
      if ('ondeviceorientationabsolute' in window) addEventListener('deviceorientationabsolute', aufAndroid);
      else if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r !== 'granted') { if (!leise) toast('Ohne Erlaubnis keine Blickrichtung.'); return; }
        addEventListener('deviceorientation', aufIos);
      } else if ('ondeviceorientation' in window) addEventListener('deviceorientation', aufIos);
      else { if (!leise) toast('Dieses Handy liefert keine Blickrichtung.'); return; }
      BLICK.an = true; if (!leise) haptik(); kompassZeichnen();
      if (!leise) setTimeout(() => { if (BLICK.an && BLICK.grad == null) toast('Keine Kompassdaten. Handy einmal in Form einer 8 bewegen.'); }, 4000);
    } catch (e) { if (!leise) toast('Blickrichtung nicht verfügbar.'); } finally { BLICK.startet = false; }
    zeichne({ scroll: true, karte: false });
  }

  // ---------- Live: frei laufen (Wunsch 24.10.2026) ----------
  // Eigene Ansicht zum Gehen, damit „Orte“ wieder zum Suchen da ist: Karte folgt dir, alle Orte und die Gruppe sind
  // sichtbar, das Blatt bleibt klein. Oben: Status, nächster Planstopp, wer gerade live ist.
  // Unter Live zählt der heutige Tag (falls er zur Reise gehört), sonst der gewählte
  function reiseTagHeute() {
    const d = new Date(), iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const t = TAGE.find((x) => x.datum === iso); return t ? t.id : S.tag;
  }
  function planName() { const ep = aktiverEigenplan(); return S.plan === 'G' ? 'Gruppenplan' : ep ? `„${ep.n}“` : (PLAENE && PLAENE[S.plan] ? PLAENE[S.plan].titel : 'Plan ' + S.plan); }
  function liveNaechster() {
    if (!ORTE.length) return null;
    return schritte(S.plan, reiseTagHeute()).filter((s) => s.ort && NACH_NAME.has(s.ort)).map((s, i) => ({ s, o: NACH_NAME.get(s.ort), nr: i + 1 }))
      .find(({ o }) => hatPos(o) && !fertig(o)) || null;
  }
  function liveStart() {
    if (S.watchId == null) starteGps(false);
    S.follow = true; gpsKnopf();
    if (S.me && karte) zeigeAufKarte(S.me, Math.max(karte.getZoom(), 17));
  }
  function teilenStart(ms) {
    E.teilenBis = ms; speichereE();
    if (S.watchId == null) starteGps(false);
    if (S.me) funkOrt(S.me, true);
    toast(F.an && F.status.verbunden ? 'Die Gruppe sieht dich jetzt auf der Karte, solange deine App offen ist.' : 'Wird geteilt, sobald Live verbunden ist.');
    zeichne({ scroll: true, karte: false });
  }
  function zeichneLive(box) {
    if (!U && !uLaedt) ladeUmgebung();
    // 1. Status: Standort, Genauigkeit, Folgen
    let status;
    if (S.watchId == null) {
      status = el('div', { class: 'live-status' }, el('span', { class: 'lampe aus', 'aria-hidden': 'true' }),
        el('span', { class: 'text' }, el('strong', {}, 'Standort ist aus'), el('small', {}, 'Live zeigt dich und alles um dich herum')),
        el('button', { type: 'button', class: 'knopf haupt', onclick: liveStart }, ic('standort'), 'Einschalten'));
    } else if (!S.me) {
      status = el('div', { class: 'live-status' }, el('span', { class: 'lampe sucht', 'aria-hidden': 'true' }),
        el('span', { class: 'text' }, el('strong', {}, 'Suche deinen Standort …'), el('small', {}, 'Draußen geht es meist schneller')));
    } else {
      const alt = Date.now() - (S.meZeit || 0) > 30000;
      status = el('div', { class: 'live-status' }, el('span', { class: 'lampe ' + (alt ? 'sucht' : 'an'), 'aria-hidden': 'true' }),
        el('span', { class: 'text' }, el('strong', {}, S.follow ? 'Karte folgt dir' : 'Du bist auf der Karte'),
          el('small', {}, `${S.me.acc > 50 ? 'Ungenau' : 'Genauigkeit'} ± ${Math.round(S.me.acc)} m${alt ? ` · letzte Position ${zeitHer(S.meZeit)}` : ''}`)),
        S.follow ? null : el('button', { type: 'button', class: 'knopf', onclick: () => { liveStart(); zeichne({ scroll: true, karte: false }); } }, ic('standort'), 'Folgen'),
        el('button', { type: 'button', class: 'knopf', 'aria-pressed': String(BLICK.an), onclick: richtungUmschalten }, ic('live'), BLICK.an ? 'Richtung aus' : 'Richtung'));
    }
    // 2. Nächster Planstopp mit Hinführen
    const nx = liveNaechster();
    const ziel = nx ? el('div', { class: 'live-ziel' },
      el('button', { type: 'button', class: 'auf', onclick: () => oeffneOrt(nx.o.id, true) },
        el('span', { class: 'marker g-' + gruppeVon(nx.o.kategorie) }, symbol(nx.o), el('span', { class: 'nummer' }, String(nx.nr))),
        el('span', { class: 'text' }, el('small', {}, `Nächster Stopp ${nx.nr} · ${planName()}`), el('strong', {}, nx.o.name),
          S.me ? el('small', {}, (() => { const d = meter(S.me, nx.o); return d > 2500 ? `${strecke(d)} · besser mit Bahn oder Bus` : `${strecke(d)} · ${gehzeit(d)} Min. zu Fuß`; })()) : null)),
      el('button', { type: 'button', class: 'knopf haupt rund', 'aria-label': `Zu ${nx.o.name} hinführen`, onclick: () => starteNavi(nx.o, true) }, ic('route'))) : null;
    // 3. Gruppe live
    const imGruppe = !!(G.ich && G.ich.name);
    const leute = [...F.leuteOrt].sort((a, b) => (S.me ? meter(S.me, a[1]) - meter(S.me, b[1]) : b[1].ts - a[1].ts));
    const zeigeAlle = () => {
      const pkt = leute.filter(([, x]) => Date.now() - (x.r || x.ts) < 600000).map(([, x]) => [x.lat, x.lon]); if (S.me) pkt.push([S.me.lat, S.me.lon]);
      S.follow = false; gpsKnopf(); if (pkt.length) passeAn(pkt); haptik();
      zeichne({ scroll: true, karte: false });
    };
    const gruppe = !imGruppe
      ? el('button', { type: 'button', class: 'live-hinweis', onclick: () => { S.tab = 'gruppe'; speicher.set('tab', 'gruppe'); hoehe('gross'); zeichne(); } },
        ic('gruppe'), el('span', {}, el('strong', {}, 'Gruppe live sehen'), el('small', {}, 'Unter „Gruppe“ beitreten, dann seht ihr euch hier')))
      : el('div', { class: 'live-leute', role: 'group', 'aria-label': 'Gruppe live' },
        leute.map(([, x]) => el('button', { type: 'button', class: 'person-chip' + (Date.now() - (x.r || x.ts) > 600000 ? ' alt' : ''), 'aria-label': `${x.n}, ${S.me ? strecke(meter(S.me, x)) + ' entfernt, ' : ''}Stand ${zeitHer(x.r || x.ts)}. Auf der Karte zeigen`,
          onclick: () => { S.follow = false; gpsKnopf(); zeigeAufKarte(x, 17); haptik(); zeichne({ scroll: true, karte: false }); } },
          el('span', { class: 'marker person' + (Date.now() - (x.r || x.ts) > 600000 ? ' alt' : '') }, initialen(x.n)),
          el('span', { class: 'text' }, el('strong', {}, x.n), el('small', {}, [S.me ? strecke(meter(S.me, x)) : null, zeitHer(x.r || x.ts)].filter(Boolean).join(' · '))))),
        leute.length ? el('button', { type: 'button', class: 'chip', onclick: zeigeAlle }, ic('gruppe'), 'Alle zeigen') : null,
        teileOrt() ? el('span', { class: 'chip still' }, ic('standort'), `Du teilst bis ${uhrzeit(E.teilenBis)}`)
          : el('button', { type: 'button', class: 'chip', onclick: () => teilenStart(Date.now() + 3600e3) }, ic('standort'), 'Mich zeigen (1 Std.)'),
        F.an && F.status.verbunden ? el('button', { type: 'button', class: 'chip', onclick: () => { woFragen(); zeichne({ scroll: true, karte: false }); } }, ic('gruppe'), 'Wo seid ihr?') : null,
        !leute.length ? el('span', { class: 'leise klein live-leer' }, F.an && F.status.verbunden ? 'Gerade teilt niemand seinen Standort.' : 'Live-Abgleich verbindet …') : null);
    // 4. Schnell finden: nächste Toilette, Supermarkt …
    const schnell = el('div', { class: 'chips nah-chips', role: 'group', 'aria-label': 'Schnell finden' },
      NAH.filter((n) => n.id !== 'wiki').map((n) => {
        const l = U && !U.fehler ? nahListe(n.id) : [];
        return el('button', { type: 'button', class: 'chip nah-chip', onclick: () => { S.nah = n.id; S.nahWahl = null; haptik(); if (S.hoehe === 'mini') hoehe('klein'); zeichne({ anpassen: true }); } },
          el('span', { class: 'nah-icon', html: `<svg viewBox="0 0 24 24" aria-hidden="true">${SYMBOL[n.typ]}</svg>` }), n.label, l[0] ? el('small', { class: 'nah-weit' }, strecke(l[0].d)) : null);
      }));
    // 5. Orte in der Nähe
    const nah = S.me ? ORTE.filter((o) => hatPos(o) && !mk(o.id).aus).map((o) => [o, meter(S.me, o)]).filter(([, d]) => d < 1000).sort((a, b) => a[1] - b[1]).slice(0, 8) : [];
    setze(box,
      el('div', { class: 'live-mini' }, status, ziel, gruppe),
      bonKnopf({ klein: true, titel: 'Kassenzettel scannen und teilen' }),
      el('h3', { class: 'live-h' }, 'Schnell finden'), schnell,
      el('h3', { class: 'live-h' }, 'Orte in der Nähe'),
      nah.length ? el('ul', { class: 'liste' }, nah.map(([o]) => eintragOrt(o)))
        : el('p', { class: 'leise klein' }, S.me ? 'Im Umkreis von 1 km liegt keiner eurer Orte.' : 'Mit Standort siehst du hier, was um dich herum liegt.'),
      S.me ? el('button', { type: 'button', class: 'knopf breit', style: 'margin-top:12px', onclick: () => eigenNeu({ lat: S.me.lat, lon: S.me.lon }) }, ic('plus'), 'Hier einen Ort eintragen') : null,
      el('button', { type: 'button', class: 'knopf breit flach', style: 'margin-top:8px', onclick: () => { S.tab = 'info'; speicher.set('tab', 'info'); hoehe('gross'); zeichne(); } }, ic('buch'), 'Reiseinfos: Sprache, Regeln, Gesundheit'));
  }
  function nachrichtenTeil() {
    const eingabe = el('input', { id: 'nachricht', type: 'text', maxlength: '300', placeholder: 'Nachricht an alle', enterkeyhint: 'send', autocomplete: 'off', 'aria-label': 'Nachricht an die Gruppe' });
    const senden = () => {
      if (!nachrichtSenden(eingabe.value)) { eingabe.focus(); return; }
      F.warteZeichnen = false; eingabe.blur();
      zeichne({ scroll: true, karte: false });
      if (!(F.an && F.status.verbunden)) toast('Gespeichert. Geht raus, sobald Live verbunden ist.');
    };
    eingabe.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); senden(); } });
    const liste = nachrichtenListe().slice(0, 30);
    return el('section', { class: 'abschnitt' }, el('h3', {}, 'Nachrichten'),
      el('div', { class: 'feld' }, eingabe, el('button', { type: 'button', class: 'knopf haupt', onclick: senden }, 'Senden')),
      liste.length ? el('ul', { class: 'nachrichten' }, liste.map(([, x]) => {
        const meine = G.ich && x.von === G.ich.id;
        return el('li', { class: 'nachricht' + (meine ? ' meine' : '') },
          el('div', { class: 'n-kopf' }, el('strong', {}, meine ? 'Du' : x.n || 'Jemand'), el('span', { class: 'leise klein' }, uhrzeit(x.t)),
            el('button', { type: 'button', class: 'knopf flach nur-voll n-pin', onclick: () => { anpinnen(x.x); zeichne({ scroll: true, karte: false }); toast('Angepinnt. Alle sehen es oben im Plan.'); } }, ic('pin'), 'Anpinnen')),
          x.o && NACH_ID.has(x.o) ? ortNachricht(x) : el('p', {}, x.x));
      })) : el('p', { class: 'leise klein', style: 'margin:10px 0 0' }, 'Noch keine Nachrichten. Was du schreibst, sehen alle in eurer Gruppe. Wichtiges zum Anpinnen: Treffpunkt, Zeiten, Notfallnummer.'));
  }

  function ortNachricht(x) {
    const o = NACH_ID.get(x.o);
    const kommentar = x.x.startsWith(`📍 ${o.name}: `) ? x.x.slice(`📍 ${o.name}: `.length) : x.x === `📍 ${o.name}` ? '' : x.x;
    return el('div', {},
      kommentar ? el('p', {}, kommentar) : null,
      el('button', { type: 'button', class: 'n-ort g-' + gruppeVon(o.kategorie), onclick: () => oeffneOrt(o.id, true), 'aria-label': `${o.name} öffnen` },
        el('span', { class: 'marker g-' + gruppeVon(o.kategorie) }, symbol(o)),
        el('span', {}, el('strong', {}, o.name), el('small', {}, [TYP_NAME[o.typ] || o.kategorie, S.me && hatPos(o) ? `${strecke(meter(S.me, o))} entfernt` : null].filter(Boolean).join(' · ')))));
  }

  // ---------- „Wo seid ihr?“: alle bitten, 15 Minuten den Standort zu teilen ----------
  let woZuletzt = 0;
  function woFragen() {
    if (!F.an || !F.status.verbunden) { toast('Gerade keine Live-Verbindung. Frag in WhatsApp oder ruf an.'); return; }
    if (Date.now() - woZuletzt < 60000) { toast('Eben gefragt. Die Antworten erscheinen auf der Karte.'); return; }
    woZuletzt = Date.now();
    Funk.sende({ v: 1, a: 'w', von: G.ich.id, n: meinName(), ts: Date.now() }).catch(() => {});
    haptik(12); toast('Gefragt. Wer zustimmt, erscheint 15 Minuten lang auf der Karte.');
    if (!teileOrt()) { E.teilenBis = Date.now() + 15 * 60000; speichereE(); if (S.watchId == null) starteGps(false); if (S.me) funkOrt(S.me, true); }
  }
  function woFrage(name) {
    const box = $('#naehe'); box.dataset.art = 'wo';
    const zu = () => { box.classList.remove('an'); setTimeout(() => { box.hidden = true; }, 250); };
    setze(box, el('div', { class: 'naehe-karte wo-karte', role: 'alertdialog', 'aria-label': `${name} fragt, wo ihr seid` },
      el('div', { class: 'naehe-kopf' }, el('span', { class: 'marker person mini' }, initialen(name)), el('strong', {}, `${name} fragt: Wo seid ihr?`)),
      el('p', {}, 'Teilst du 15 Minuten lang deinen Standort mit der Gruppe?'),
      el('div', { class: 'reihe' },
        el('button', { type: 'button', class: 'knopf', onclick: zu }, 'Nein'),
        el('button', { type: 'button', class: 'knopf haupt', onclick: () => {
          zu(); E.teilenBis = Math.max(E.teilenBis || 0, Date.now() + 15 * 60000); speichereE();
          if (S.watchId == null) starteGps(false); if (S.me) funkOrt(S.me, true);
          toast('Du teilst deinen Standort 15 Minuten lang.'); zeichne({ scroll: true, karte: false });
        } }, 'Ja, 15 Min. teilen'))));
    box.hidden = false; requestAnimationFrame(() => box.classList.add('an'));
    haptik(40);
  }

  // ---------- Einkaufsliste (geteilt) ----------
  function einkaufTeil() {
    const alle = Object.entries(G.einkauf).filter(([, x]) => !x.x);
    const offen = alle.filter(([, x]) => !x.d).sort((a, b) => a[1].m - b[1].m), fertig = alle.filter(([, x]) => x.d).sort((a, b) => b[1].m - a[1].m);
    const feld = el('input', { type: 'text', maxlength: '60', placeholder: 'Was fehlt? z. B. Wasser, Brot', 'aria-label': 'Neuer Eintrag', enterkeyhint: 'done', autocomplete: 'off' });
    const dazu = () => {
      const t = feld.value.trim(); if (!t) { feld.focus(); return; }
      for (const teil of t.split(/\s*[,;]\s*/).filter(Boolean)) G.einkauf[neueId() + Date.now().toString(36).slice(-3)] = { t: teil.slice(0, 60), von: G.ich.id, d: 0, m: Date.now(), x: 0 };
      speichereG(); haptik(); F.warteZeichnen = false; feld.blur(); zeichne({ scroll: true, karte: false }); // Fokus weg, damit Änderungen der anderen live erscheinen
    };
    feld.id = 'ek-feld';
    feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); dazu(); } });
    const setz = (id, patch) => { Object.assign(G.einkauf[id], patch, { m: Date.now() }); speichereG(); haptik(); zeichne({ scroll: true, karte: false }); };
    const zeile = ([id, x]) => el('li', { class: 'eintrag ek' + (x.d ? ' erledigt' : '') },
      el('button', { type: 'button', class: 'haken', 'aria-pressed': String(!!x.d), 'aria-label': `${x.t} ${x.d ? 'wieder offen' : 'erledigt'}`, onclick: () => setz(id, { d: x.d ? 0 : 1 }) }, ic('haken')),
      el('span', { class: 'text' }, el('span', { class: 'titel' }, x.t), el('span', { class: 'unter' }, `von ${personName(x.von)}`)),
      el('button', { type: 'button', class: 'haken', 'aria-label': `${x.t} löschen`, onclick: () => { setz(id, { x: 1 }); toast(`„${x.t}“ gelöscht.`, { aktion: 'Rückgängig', fn: () => setz(id, { x: 0 }) }); } }, ic('x')));
    return el('section', { class: 'abschnitt', style: 'margin-top:8px' },
      el('div', { class: 'feld' }, feld, el('button', { type: 'button', class: 'knopf haupt', onclick: dazu }, 'Dazu')),
      el('p', { class: 'leise klein', style: 'margin:6px 0 0' }, 'Mehreres mit Komma trennen. Alle sehen die Liste live und haken ab, was gekauft ist.'),
      offen.length ? el('ul', { class: 'liste', style: 'margin-top:8px' }, offen.map(zeile)) : el('p', { style: 'margin:12px 0 0' }, 'Nichts offen.'),
      fertig.length ? el('details', { class: 'ek-fertig' }, el('summary', {}, `Gekauft (${fertig.length})`), el('ul', { class: 'liste' }, fertig.map(zeile)),
        el('button', { type: 'button', class: 'knopf flach warn', onclick: () => { fertig.forEach(([id]) => { G.einkauf[id].x = 1; G.einkauf[id].m = Date.now(); }); speichereG(); zeichne({ scroll: true, karte: false }); } }, 'Gekaufte löschen')) : null,
      el('button', { type: 'button', class: 'knopf breit', style: 'margin-top:12px', onclick: () => { S.tab = 'orte'; S.nah = 's'; S.ort = null; ladeUmgebung(); if (S.watchId == null) starteGps(false); hoehe('mitte'); zeichne({ anpassen: true }); } },
        el('span', { html: `<svg viewBox="0 0 24 24" aria-hidden="true">${SYMBOL.korb}</svg>`, style: 'display:contents' }), 'Günstige Supermärkte in der Nähe'));
  }

  // ---------- Abrechnung als Text ----------
  function abrechnungText() {
    const s2 = salden(), wege = ausgleichWege(s2);
    const liste = Object.values(G.kosten).filter((x) => !x.x).sort((a, b) => a.t - b.t);
    const datum = (t) => { const d = new Date(t); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`; };
    const zeilen = [`Lissabon: Kosten (Stand ${datum(Date.now())} ${uhrzeit(Date.now())})`, '', `Ausgaben gesamt: ${euro(liste.filter((x) => !x.a).reduce((a, x) => a + x.b, 0))}`, '', 'So gleicht ihr aus:'];
    if (wege.length) for (const w of wege) zeilen.push(`- ${personName(w.von)} → ${personName(w.an)}: ${euro(w.b)}`); else zeilen.push('- Alle sind quitt.');
    zeilen.push('', 'Stand je Person:');
    for (const id of personenListe()) zeilen.push(`- ${personName(id)}: ${(s2[id] || 0) >= 0 ? '+' : '−'}${euro(s2[id] || 0)}`);
    zeilen.push('', 'Ausgaben:');
    for (const x of liste) {
      const za = x.za || { [x.v]: x.b };
      zeilen.push(x.a ? `- ${datum(x.t)} Ausgleich ${personName(x.v)} → ${personName(x.f[0])}: ${euro(x.b)}` : `- ${datum(x.t)} ${x.z || 'Ausgabe'}: ${euro(x.b)}, bezahlt von ${Object.entries(za).map(([id, c]) => (Object.keys(za).length > 1 ? `${personName(id)} ${euro(c)}` : personName(id))).join(', ')}`);
    }
    return zeilen.join('\n');
  }

  // ---------- Kosten teilen (Prinzip wie Splid/Splitwise; Recherche docs/recherche/2026-10-24-kosten-und-fuehrung.md) ----------
  // Jede Ausgabe: wer bezahlt hat (v), Betrag in Cent (b), wofür (z), für wen (f, gleich geteilt). Rest-Cents tragen die ersten
  // Personen nach Kennung, damit alle Handys dasselbe rechnen. Ausgleich: wenige Überweisungen, größte Schuld an größtes Guthaben.
  const euro = (c) => `${(Math.abs(c) / 100).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;
  const personName = (id) => (G.ich && id === G.ich.id ? meinName() : (G.leute[id] && G.leute[id].name) || 'Jemand');
  const personenListe = () => Object.keys(G.leute).sort((a, b) => personName(a).localeCompare(personName(b), 'de'));
  // Personenfarben (Recherche docs/recherche/2026-10-29-bon-ansicht-und-farben.md): Farbe findet man schnell wieder, aber nie
  // Farbe allein (WCAG 1.4.1, Farbsehschwäche) – immer zusammen mit einem eindeutigen Kürzel. Okabe-Ito-Farben (für die
  // häufigen Farbsehschwächen unterscheidbar). Feste Zuordnung über die Kennung: gleiche Farbe auf allen Handys der Gruppe.
  const FARBEN = ['#E69F00', '#0072B2', '#009E73', '#CC79A7', '#D55E00', '#56B4E9', '#F0E442', '#8C7A6B'];
  let farbCache = { schl: '', m: new Map() };
  function personFarbe(id) {
    const ids = Object.keys(G.leute).sort(), schl = ids.join(',');
    if (farbCache.schl !== schl) {
      const m = new Map(), frei = () => FARBEN.map((_, k) => k).filter((k) => ![...m.values()].includes(k));
      for (const x of ids) { let h = 0; for (const c of x) h = (h * 31 + c.charCodeAt(0)) >>> 0; const f = frei(); const k = h % FARBEN.length; m.set(x, f.length ? (f.includes(k) ? k : f[h % f.length]) : k); }
      farbCache = { schl, m };
    }
    return FARBEN[farbCache.m.has(id) ? farbCache.m.get(id) : 0];
  }
  // Schrift auf der Farbe: Schwarz oder Weiß, je nachdem was mehr Kontrast hat (relative Leuchtdichte nach WCAG)
  function schriftAuf(hex) {
    const k = [1, 3, 5].map((i) => { const c = parseInt(hex.slice(i, i + 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
    const L = 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
    return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? '#111111' : '#FFFFFF';
  }
  // Kürzel: kürzester Anfang des Namens ab 2 Zeichen, den kein anderer in der Gruppe teilt (Chris/Christina → „Chris“/„Christ“);
  // gleiche Namen bekommen eine Nummer
  function kuerzel(id) {
    const name = personName(id).trim() || '?', andere = Object.keys(G.leute).filter((x) => x !== id).map((x) => personName(x).trim().toLowerCase());
    const n0 = name.toLowerCase(); let n = Math.min(2, name.length);
    while (n < name.length && andere.some((o) => o.slice(0, n) === n0.slice(0, n))) n++;
    let k = name.slice(0, n);
    if (andere.includes(n0)) { const gleiche = Object.keys(G.leute).filter((x) => personName(x).trim().toLowerCase() === n0).sort(); k = name.slice(0, 3) + (gleiche.indexOf(id) + 1); }
    return k.charAt(0).toUpperCase() + k.slice(1);
  }
  // Schraffur je Person zusätzlich zu Farbe und Kürzel: unterscheidbar auch ohne Farbsehen und in Graustufen.
  // Linien in der Schriftfarbe auf der Personenfarbe (color-mix), feste Zuordnung wie bei der Farbe.
  const ML = 'color-mix(in srgb, var(--pt) 40%, transparent)';
  const MUSTER = [
    `repeating-linear-gradient(45deg, ${ML} 0 2px, transparent 2px 8px)`,
    `repeating-linear-gradient(0deg, ${ML} 0 2px, transparent 2px 7px)`,
    `repeating-linear-gradient(90deg, ${ML} 0 2px, transparent 2px 7px)`,
    `repeating-linear-gradient(-45deg, ${ML} 0 2px, transparent 2px 8px)`,
    `repeating-linear-gradient(45deg, ${ML} 0 1.5px, transparent 1.5px 7px), repeating-linear-gradient(-45deg, ${ML} 0 1.5px, transparent 1.5px 7px)`,
    `repeating-linear-gradient(0deg, ${ML} 0 1.5px, transparent 1.5px 7px), repeating-linear-gradient(90deg, ${ML} 0 1.5px, transparent 1.5px 7px)`,
    `repeating-linear-gradient(45deg, ${ML} 0 5px, transparent 5px 12px)`,
    'none',
  ];
  const personMuster = (id) => { personFarbe(id); return MUSTER[farbCache.m.has(id) ? farbCache.m.get(id) % MUSTER.length : 0]; };
  const personStil = (id) => { const f = personFarbe(id); return `--pf:${f};--pt:${schriftAuf(f)};--pm:${personMuster(id)}`; };
  const personPunkt = (id) => el('span', { class: 'p-punkt', style: personStil(id), 'aria-hidden': 'true' });
  function salden() {
    const s2 = {};
    for (const id of Object.keys(G.leute)) s2[id] = 0;
    for (const x of Object.values(G.kosten)) {
      if (x.x) continue;
      const za = x.za || { [x.v]: x.b };
      const an = x.an || verteile(x.b, [...new Set(x.f)].map((id) => [id, 1]));
      for (const [id, c] of Object.entries(za)) s2[id] = (s2[id] || 0) + c;
      for (const [id, c] of Object.entries(an)) s2[id] = (s2[id] || 0) - c;
    }
    return s2;
  }
  // Größte-Reste-Verfahren: Cent nach Gewichten, die Summe stimmt immer; Gleichstand nach Kennung (alle Handys rechnen gleich)
  function verteile(betrag, gewichte) {
    const summe = gewichte.reduce((a, [, w]) => a + w, 0);
    if (!summe || !betrag) return {};
    const roh = gewichte.map(([id, w]) => { const exakt = (betrag * w) / summe; return { id, c: Math.floor(exakt), r: exakt - Math.floor(exakt) }; });
    let rest = betrag - roh.reduce((a, x) => a + x.c, 0);
    roh.slice().sort((a, b) => b.r - a.r || (a.id < b.id ? -1 : 1)).forEach((x) => { if (rest > 0) { x.c += 1; rest -= 1; } });
    const aus = {};
    for (const x of roh) if (x.c) aus[x.id] = (aus[x.id] || 0) + x.c;
    return aus;
  }
  // Prüft Anteile/Zahler aus dem Netz: nur ganze Cent, Summe muss genau stimmen
  function centMap(o, b) {
    if (!o || typeof o !== 'object') return null;
    let s2 = 0; const aus = {};
    for (const [id, c] of Object.entries(o)) { if (typeof id !== 'string' || !Number.isInteger(c) || c < 0) return null; if (c) { aus[id.slice(0, 16)] = c; s2 += c; } }
    return s2 === b ? aus : null;
  }
  // Wenigste Überweisungen: Personen in möglichst viele Gruppen mit Summe 0 teilen (exakt über alle Teilmengen,
  // bei 6 Personen 64); jede Gruppe mit k Personen braucht k − 1 Überweisungen. Gierig allein ist nicht immer optimal
  // (Gegenbeispiel in docs/recherche/2026-10-24-kosten-und-fuehrung.md).
  function gierig(ids, s2) {
    const plus = ids.filter((id) => s2[id] > 0).map((id) => [id, s2[id]]);
    const minus = ids.filter((id) => s2[id] < 0).map((id) => [id, -s2[id]]);
    const wege = [];
    while (plus.length && minus.length) {
      plus.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)); minus.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
      const b = Math.min(plus[0][1], minus[0][1]);
      wege.push({ von: minus[0][0], an: plus[0][0], b });
      plus[0][1] -= b; minus[0][1] -= b;
      if (!plus[0][1]) plus.shift();
      if (!minus[0][1]) minus.shift();
    }
    return wege;
  }
  function ausgleichWege(s2) {
    const ids = Object.keys(s2).filter((id) => s2[id] !== 0).sort();
    const n = ids.length;
    if (!n) return [];
    if (n > 14) return gierig(ids, s2);
    const N = 1 << n, summe = new Array(N).fill(0), dp = new Array(N).fill(-1), wahl = new Array(N).fill(0);
    for (let m = 1; m < N; m++) { const low = m & -m; summe[m] = summe[m ^ low] + s2[ids[31 - Math.clz32(low)]]; }
    dp[0] = 0;
    for (let m = 1; m < N; m++) {
      if (summe[m] !== 0) continue;
      const low = m & -m;
      for (let sub = m; sub; sub = (sub - 1) & m) {
        if (!(sub & low) || summe[sub] !== 0 || dp[m ^ sub] < 0) continue;
        if (dp[m ^ sub] + 1 > dp[m]) { dp[m] = dp[m ^ sub] + 1; wahl[m] = sub; }
      }
    }
    if (dp[N - 1] < 0) return gierig(ids, s2);
    const wege = [];
    for (let m = N - 1; m; m ^= wahl[m]) wege.push(...gierig(ids.filter((_, i) => wahl[m] & (1 << i)), s2));
    return wege;
  }
  function kostenSpeichern(e) {
    const id = e.id || neueId();
    const alt = G.kosten[id];
    G.kosten[id] = { v: e.v, b: e.b, z: String(e.z || '').slice(0, 60), f: [...new Set(e.f)], t: alt ? alt.t : Date.now(), m: Date.now(), x: 0, a: e.a ? 1 : 0,
      an: e.an || null, za: e.za || null, art: e.art || '', pos: e.pos || null, tip: e.tip || null };
    speichereG();
    return id;
  }
  function kostenLoeschen(id, weg) { const x = G.kosten[id]; if (!x) return; x.x = weg ? 1 : 0; x.m = Date.now(); speichereG(); }
  const betragLesen = (t) => { const v = parseFloat(String(t || '').replace(/\s|€/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return Number.isFinite(v) && v > 0 ? Math.round(v * 100) : 0; };
  // ---------- Kassenzettel-Fotos: nur auf diesem Handy (IndexedDB), werden nie gesendet ----------
  const fotoDb = () => new Promise((ok, fehler) => { const r = indexedDB.open('fasan-karte', 1); r.onupgradeneeded = () => r.result.createObjectStore('fotos'); r.onsuccess = () => ok(r.result); r.onerror = () => fehler(r.error); });
  async function fotoSpeichern(id, daten) {
    try {
      const db = await fotoDb();
      await new Promise((ok, f2) => { const t = db.transaction('fotos', 'readwrite'); t.objectStore('fotos').put(daten, id); t.oncomplete = ok; t.onerror = () => f2(t.error); });
      const l = speicher.get('kzFotos', []); if (!l.includes(id)) speicher.set('kzFotos', l.concat(id));
    } catch (e) { toast('Das Foto konnte auf diesem Handy nicht gespeichert werden.'); }
  }
  async function fotoLaden(id) {
    try { const db = await fotoDb(); return await new Promise((ok) => { const r = db.transaction('fotos').objectStore('fotos').get(id); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); }); } catch (e) { return null; }
  }
  // Foto verkleinern (längste Seite 1600 px, JPEG): reicht zum Lesen, spart Speicher
  function fotoEinlesen(datei, max = 1600) {
    return new Promise((ok, fehler) => {
      const r = new FileReader();
      r.onload = () => { const img = new Image(); img.onload = () => { const f2 = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * f2); c.height = Math.round(img.height * f2); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', 0.82)); }; img.onerror = fehler; img.src = r.result; };
      r.onerror = fehler; r.readAsDataURL(datei);
    });
  }
  function zeigeFoto(daten) {
    const box = el('div', { class: 'foto-voll', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Kassenzettel' });
    const img = el('img', { src: daten, alt: 'Kassenzettel' });
    img.addEventListener('click', () => box.classList.toggle('gross'));
    box.append(img, el('button', { type: 'button', class: 'knopf haupt foto-zu', onclick: () => box.remove() }, 'Schließen'), el('p', { class: 'foto-hilfe' }, 'Tippen zum Vergrößern'));
    document.body.append(box);
  }

  // ---------- Kassenzettel scannen: Einstieg überall (Wunsch 25.10.2026) ----------
  // Ein Tipp öffnet die Kamera (oder die Fotos), danach landet der Bon direkt in „Gruppe → Kosten → Posten“ und wird gelesen.
  // Das Foto bleibt auf dem Handy, die Erkennung läuft im Handy (bon.js, tesseract.js).
  async function bonStart(datei, zweck) {
    if (!datei) return;
    if (!G.ich || !G.ich.name) { toast('Tritt zuerst unter „Gruppe“ bei, dann kannst du Rechnungen teilen.'); S.tab = 'gruppe'; hoehe('gross'); zeichne(); return; }
    let foto;
    try { foto = await fotoEinlesen(datei, 3000); } catch (e) { toast('Das Foto konnte nicht gelesen werden.'); return; }
    haptik(12); rwOeffnen(foto, zweck);
  }
  // Ein einziges Dateifeld für alle Einstiege, außerhalb der Ansichten: Wird die Ansicht neu gezeichnet, während die Kamera offen ist
  // (z. B. durch eine neue GPS-Position), geht die Auswahl sonst verloren.
  let bonFeld = null, bonZweck = '';
  function bonWaehle(zweck, kamera) {
    if (!bonFeld) {
      bonFeld = el('input', { type: 'file', accept: 'image/*', hidden: true, 'aria-hidden': 'true', tabindex: '-1', id: 'bon-datei' });
      bonFeld.addEventListener('change', () => { const d = bonFeld.files && bonFeld.files[0]; bonFeld.value = ''; bonStart(d, bonZweck); });
      document.body.append(bonFeld);
    }
    bonZweck = zweck || '';
    if (kamera) bonFeld.setAttribute('capture', 'environment'); else bonFeld.removeAttribute('capture');
    bonFeld.click();
  }
  function bonKnopf(opt = {}) {
    return el('div', { class: 'bon-karte' + (opt.klein ? ' klein' : '') },
      el('button', { type: 'button', class: 'knopf haupt breit bon-gross', onclick: () => bonWaehle(opt.zweck, true) }, el('span', { html: `<svg viewBox="0 0 24 24" aria-hidden="true">${SYMBOL.foto}</svg>`, style: 'display:contents' }),
        el('span', { class: 'bon-titel' }, el('strong', {}, opt.titel || 'Kassenzettel scannen'), opt.klein ? null : el('small', {}, 'Foto machen, antippen wer was hatte, fertig'))),
      opt.klein ? null : el('button', { type: 'button', class: 'knopf flach', style: 'justify-self:start', onclick: () => bonWaehle(opt.zweck, false) }, 'Foto aus der Galerie wählen'));
  }

  // ---------- Rechnung teilen: Schritt für Schritt (Überarbeitung 25.10.2026) ----------
  // Recherche: docs/recherche/2026-10-25-rechnung-teilen-ux.md. Vollbild-Ablauf statt Formular im Blatt:
  // 1 Summe (groß, Foto daneben, Erkennung läuft im Hintergrund) · 2 Wer war dabei, gleich oder nach Posten ·
  // 3 Posten zuordnen (Person wählen, Posten antippen; laufende Summen oben) · 4 Wer hat bezahlt, Speichern.
  // Gelesene Posten werden nur vorbelegt, wenn ihre Summe exakt zur Summe auf dem Bon passt.
  let RW = null, RW_ALT = null;
  const rwFolge = () => (RW.modus === 'posten' ? ['summe', 'art', 'posten', 'zahler'] : ['summe', 'art', 'zahler']);
  const rwNamen = { summe: 'Summe', art: 'Wer war dabei?', posten: 'Wer hatte was?', zahler: 'Wer hat bezahlt?' };
  const rwPostenSumme = () => RW.posten.reduce((a, q) => a + (q.aus ? 0 : q.b || 0), 0);
  // Was war es? (speisen.js) – Klarname mit Symbol; der Name vom Bon bleibt klein darunter stehen
  const rwKlasse = (t) => (t && window.Speisen ? window.Speisen.erkenne(t, RW && RW.bon && RW.bon.art ? RW.bon.art.id : '') : null);
  const rwTitel = (q) => (q.k ? q.k.n : q.t || 'Posten') + (q.teil ? ` (${q.teil})` : '');
  const rwSpeichername = (q) => ((q.k ? q.k.n + (q.t ? ` – ${q.t}` : '') : q.t) || 'Posten') + (q.teil ? ` (${q.teil})` : '');
  const rwSicher = (bon) => !!bon && bon.posten.length >= 2 && (bon.qr ? bon.qr.total : bon.total) != null && bon.summe === (bon.qr ? bon.qr.total : bon.total);
  // ---- Angefangene Rechnungen (Entwürfe): nach jeder Änderung auf diesem Handy gespeichert (Daten in localStorage, Foto in
  // IndexedDB). Schließen heißt nicht mehr Verwerfen; fortsetzen unter „Kosten“. Gespeichert = gebucht → Entwurf weg.
  const rwEntwuerfe = () => speicher.get('rwEntwuerfe', {});
  // ---- Verlauf (Wunsch 31.10.): jede Änderung ist ein Schritt, Rückgängig/Wiederholen über beliebig viele Schritte.
  // Zustand ohne Bilder (Zeilenbilder hängen an der Bon-Zeile und werden beim Zurückholen wieder angehängt).
  const rwZustand = () => JSON.stringify({ posten: RW.posten.map((q) => ({ ...q, bild: undefined })), summe: RW.summe, dabei: RW.dabei, modus: RW.modus, zahler: RW.zahler, tip: RW.tip, tipArt: RW.tipArt, tipName: RW.tipName, z: RW.z });
  function rwVerlaufMerken() {
    if (!RW.hist) { RW.hist = []; RW.redo = []; }
    const z = rwZustand();
    if (RW.hist[RW.hist.length - 1] !== z) { RW.hist.push(z); if (RW.hist.length > 200) RW.hist.shift(); RW.redo = []; }
  }
  function rwZustandSetzen(z) {
    const d = JSON.parse(z), bilder = new Map(RW.posten.filter((q) => q.bild).map((q) => [q.zl, q.bild]));
    for (const q of d.posten) if (q.zl != null && bilder.has(q.zl)) q.bild = bilder.get(q.zl);
    Object.assign(RW, d); RW.bonSel = null; RW.edit = -1; RW.bonLetzt = null;
    if ($('#rw-bon')) rwBonZeichnen(false); else rwZeichnen(false);
  }
  function rwRueck() { if (!RW || !RW.hist || RW.hist.length < 2) return; RW.redo.push(RW.hist.pop()); haptik(10); rwZustandSetzen(RW.hist[RW.hist.length - 1]); }
  function rwVor() { if (!RW || !RW.redo || !RW.redo.length) return; const z = RW.redo.pop(); RW.hist.push(z); haptik(10); rwZustandSetzen(z); }
  const rwVerlaufKnoepfe = () => el('span', { class: 'reihe rw-verlauf', style: 'gap:2px' },
    el('button', { type: 'button', class: 'ik-knopf', disabled: !(RW.hist && RW.hist.length > 1), 'aria-label': 'Rückgängig', title: 'Rückgängig', onclick: rwRueck }, ic('rueck')),
    el('button', { type: 'button', class: 'ik-knopf', disabled: !(RW.redo && RW.redo.length), 'aria-label': 'Wiederholen', title: 'Wiederholen', onclick: rwVor }, ic('vor')));
  function rwMerken() {
    if (!RW || (!RW.foto && !RW.posten.length && !RW.summe)) return;
    const vor = RW.redo ? RW.redo.length : 0, n = RW.hist ? RW.hist.length : 0;
    rwVerlaufMerken();
    if ((RW.hist.length !== n || RW.redo.length !== vor)) for (const k of document.querySelectorAll('.rw-verlauf')) k.replaceWith(rwVerlaufKnoepfe());
    const b = RW.bon;
    const e = { id: RW.id, z: RW.z, summe: RW.summe, summeHand: RW.summeHand, quelle: RW.quelle, schritt: RW.schritt, modus: RW.modus, dabei: RW.dabei, posten: RW.posten,
      aktiv: RW.aktiv, tipArt: RW.tipArt, tip: RW.tip, tipName: RW.tipName || '', v: RW.v, mehr: RW.mehr, zahler: RW.zahler, geladen: RW.geladen, t: Date.now(),
      bon: b ? { zeilen: b.zeilen, breite: b.breite, hoehe: b.hoehe, total: b.total, summe: b.summe, qr: b.qr ? { total: b.qr.total } : null, pruefung: b.pruefung, art: b.art || null, anzahlung: b.anzahlung || 0,
        posten: b.posten.map((p) => ({ zuschlag: p.zuschlag ? 1 : 0, sicher: !!p.sicher })) } : null };
    const alle = rwEntwuerfe(); alle[RW.id] = e; speicher.set('rwEntwuerfe', alle);
    if (RW.foto && RW.fotoGemerkt !== RW.foto) { RW.fotoGemerkt = RW.foto; fotoSpeichern('rw-' + RW.id, RW.foto); if (RW.fotoOrig) fotoSpeichern('rw-' + RW.id + '-o', RW.fotoOrig); }
  }
  function rwEntwurfWeg(id) { const alle = rwEntwuerfe(); delete alle[id]; speicher.set('rwEntwuerfe', alle); }
  async function rwFortsetzen(id) {
    const e = rwEntwuerfe()[id]; if (!e) return;
    const foto = await fotoLaden('rw-' + id), fotoOrig = await fotoLaden('rw-' + id + '-o').catch(() => null);
    rwOeffnen(foto, e.z, { ohneLesen: true, id });
    Object.assign(RW, e, { foto, fotoOrig: fotoOrig || null, fotoGemerkt: foto, lesen: null, edit: -1, bon: e.bon ? { ...e.bon, bild: foto } : null });
    if (e.modus === 'posten' && e.posten.length) RW.schritt = 'posten'; // dort weitermachen, wo die Arbeit steckt
    if (!window.Speisen) { const sc = document.createElement('script'); sc.src = 'speisen.js'; document.head.append(sc); }
    rwZeichnen(true);
  }
  function rwEntwurfListe() {
    const l = Object.values(rwEntwuerfe()).sort((a, b) => b.t - a.t);
    if (!l.length) return null;
    return el('div', { class: 'rw-entwuerfe' }, el('h3', { class: 'rw-h' }, 'Angefangen'), l.map((e) => {
      const n = e.posten.filter((q) => !q.aus).length, fertig = e.posten.filter((q) => !q.aus && q.w && q.w.length).length;
      return el('div', { class: 'rw-entwurf' },
        el('div', {}, el('strong', {}, e.z || 'Rechnung'), el('div', { class: 'leise klein' }, `${e.summe ? euro(e.summe) : 'ohne Summe'}${n ? ` · ${fertig} von ${n} Posten zugeordnet` : ''} · ${new Date(e.t).toLocaleString('de-DE', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}`)),
        el('div', { class: 'reihe' },
          el('button', { type: 'button', class: 'knopf haupt', onclick: () => rwFortsetzen(e.id) }, 'Weiter'),
          el('button', { type: 'button', class: 'knopf flach', 'aria-label': `${e.z || 'Rechnung'} verwerfen`, onclick: () => { const alt = rwEntwuerfe()[e.id]; rwEntwurfWeg(e.id); zeichne({ karte: false }); toast('Angefangene Rechnung verworfen.', { aktion: 'Rückgängig', fn: () => { const a2 = rwEntwuerfe(); a2[e.id] = alt; speicher.set('rwEntwuerfe', a2); zeichne({ karte: false }); } }); } }, 'Verwerfen')));
    }));
  }
  function rwOeffnen(foto, zweck, opt = {}) {
    const ids = personenListe();
    RW = { id: opt.id || neueId(), foto, z: zweck || '', summe: null, summeHand: false, quelle: '', schritt: 'summe', modus: 'gleich', dabei: ids.slice(), posten: [], aktiv: G.ich.id, tipArt: '€', tip: 0, v: G.ich.id, mehr: false, zahler: {},
      bon: null, lesen: foto ? 'Texterkennung startet …' : null, geladen: false, edit: -1 };
    let box = $('#rechnung');
    if (!box) { box = el('div', { id: 'rechnung', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Rechnung teilen' }); document.body.append(box); }
    box.hidden = false; document.body.classList.add('rw-offen');
    try { history.pushState({ rw: 1 }, '', '#rechnung'); } catch (e) { /* egal */ }
    rwZeichnen(true);
    if (foto && !opt.ohneLesen) rwLesen(RW);
  }
  function rwSchliessen(merken) {
    if (!RW) return;
    if (merken) RW_ALT = RW;
    RW = null;
    const bv = $('#rw-bon'); if (bv) bv.remove();
    const box = $('#rechnung'); if (box) { box.hidden = true; box.textContent = ''; }
    document.body.classList.remove('rw-offen');
    try { if (history.state && history.state.rw) history.back(); } catch (e) { /* egal */ }
  }
  function rwWieder() {
    if (!RW_ALT) return;
    const alt = RW_ALT; RW_ALT = null;
    rwOeffnen(alt.foto, alt.z); Object.assign(RW, alt, { lesen: alt.bon ? null : RW.lesen }); rwZeichnen(true);
  }
  addEventListener('popstate', () => { if ($('#rw-bon') && !(history.state && history.state.rwb)) rwBonZu(true); if (RW && !(history.state && history.state.rw)) rwSchliessen(true); });
  addEventListener('keydown', (e) => { if (e.key !== 'Escape' || !RW || $('.foto-voll')) return; if ($('#rw-bon')) { rwBonZu(); return; } rwZurueck(); });
  function rwZurueck() {
    const folge = rwFolge(), i = folge.indexOf(RW.schritt);
    if (i > 0) { RW.schritt = folge[i - 1]; rwZeichnen(true); return; }
    rwAbbrechen();
  }
  function rwAbbrechen() {
    const id = RW.id, hatWas = RW.foto || RW.posten.length || RW.summe; rwMerken(); rwSchliessen(false);
    if (!hatWas) { rwEntwurfWeg(id); return; }
    if (S.tab === 'gruppe' && S.gTeil === 'kosten') zeichne({ karte: false });
    toast('Gespeichert. Unter „Kosten“ kannst du weitermachen.', { aktion: 'Verwerfen', fn: () => { rwEntwurfWeg(id); zeichne({ karte: false }); } });
  }
  // Ladeanzeige: laufender Fasan, Stufe und Balken; wird an Ort und Stelle aktualisiert (kein Neuzeichnen)
  function rwFortschritt(r, text, p) {
    r.fort = { text, p }; r.lesen = text;
    if (RW !== r) return;
    for (const t of document.querySelectorAll('.rw-lade-text')) t.textContent = text;
    for (const i of document.querySelectorAll('.rw-lade-balken')) { i.firstChild.style.width = `${Math.round(p * 100)}%`; i.setAttribute('aria-valuenow', String(Math.round(p * 100))); }
  }
  function rwLade() {
    const f = RW.fort || { text: RW.lesen || 'Bon wird gelesen …', p: 0 };
    return el('div', { class: 'rw-lade', role: 'status', 'aria-live': 'polite' },
      el('div', { class: 'rw-lade-vogel', 'aria-hidden': 'true' }, fasan('lauf')),
      el('div', { class: 'rw-lade-text' }, f.text),
      el('div', { class: 'rw-lade-balken', role: 'progressbar', 'aria-label': 'Fortschritt der Erkennung', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(f.p * 100)) }, el('i', { style: `width:${Math.round(f.p * 100)}%` })),
      el('small', { class: 'leise' }, 'Gründlich statt schnell: Jeder Betrag wird mehrfach gelesen. Das kann ein, zwei Minuten dauern. Das Foto bleibt auf dem Handy.'));
  }
  // ---------- Erkennungs-Protokoll (Wunsch 31.10.): was die Erkennung auf diesem Handy getan hat, zum Teilen mit der
  // Entwicklung. Bleibt im Gerät (IndexedDB), die letzten 5; geteilt wird nur, was du selbst teilst.
  const FEHLER_LOG = [];
  window.addEventListener('error', (e) => { FEHLER_LOG.push({ t: new Date().toISOString(), text: String(e.message), wo: `${e.filename || ''}:${e.lineno || ''}` }); if (FEHLER_LOG.length > 30) FEHLER_LOG.shift(); });
  window.addEventListener('unhandledrejection', (e) => { FEHLER_LOG.push({ t: new Date().toISOString(), text: String((e.reason && e.reason.message) || e.reason) }); if (FEHLER_LOG.length > 30) FEHLER_LOG.shift(); });
  // Versionsmarke auf jeder Seite (Wunsch 31.10.): zeigt, ob das Handy die aktuelle Fassung nutzt; „!“ wenn ein Teil
  // (bon.js) aus einem alten Zwischenspeicher kommt
  function versionMarke() {
    let m = document.getElementById('version-marke');
    if (!m) { m = el('div', { id: 'version-marke', 'aria-hidden': 'true' }); document.body.append(m); }
    const bv = window.Bon && window.Bon.VERSION, alt = bv && bv !== VERSION;
    m.textContent = `v${VERSION}${alt ? ` ! bon ${bv}` : ''}`; m.classList.toggle('alt', !!alt);
    document.documentElement.style.setProperty('--fk-version', `"v${VERSION}"`); // für Stellen, an denen die Marke verdeckt wäre
  }
  setTimeout(versionMarke, 0); setInterval(versionMarke, 5000);
  async function protokollMerken(r, prot, original, fehler) {
    try {
      const swV = navigator.serviceWorker && navigator.serviceWorker.controller ? 'aktiv' : 'kein';
      const p = { app: VERSION, bonJs: window.Bon && window.Bon.VERSION, sw: swV, rechnung: r.id, ...(prot || { schritte: [], fehler: [] }), abbruch: fehler ? String(fehler.stack || fehler) : null, seiteFehler: FEHLER_LOG.slice(), original };
      const id = 'prot-' + Date.now();
      await fotoSpeichern(id, p);
      const l = speicher.get('protokolle', []).concat({ id, t: Date.now(), rw: r.id, posten: prot && prot.schritte ? (prot.schritte.find((x) => x.typ === 'ergebnis') || {}).posten?.length : null });
      while (l.length > 5) { const alt = l.shift(); try { const db = await fotoDb(); db.transaction('fotos', 'readwrite').objectStore('fotos').delete(alt.id); } catch (e) { /* weiter */ } }
      speicher.set('protokolle', l); r.protId = id;
    } catch (e) { /* Protokoll darf die Erkennung nie stören */ }
  }
  async function protokollTeilen(id, mitFoto = true) {
    const l = speicher.get('protokolle', []), e = id ? l.find((x) => x.id === id) : l[l.length - 1];
    if (!e) { toast('Noch kein Protokoll – zuerst einen Bon scannen.'); return; }
    const p = await fotoLaden(e.id); if (!p) { toast('Protokoll nicht mehr vorhanden.'); return; }
    const daten = mitFoto ? p : { ...p, original: null };
    const name = `fasan-protokoll-${VERSION}-${new Date(e.t).toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`;
    const datei = new File([JSON.stringify(daten)], name, { type: 'application/json' });
    try { if (navigator.canShare && navigator.canShare({ files: [datei] })) { await navigator.share({ files: [datei], title: 'Fasan Bon-Protokoll' }); return; } } catch (err) { if (err && err.name === 'AbortError') return; }
    const a = el('a', { href: URL.createObjectURL(datei), download: name }); document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    toast('Protokoll gespeichert (Downloads).');
  }
  function protokollListe() {
    const l = speicher.get('protokolle', []).slice().reverse();
    return el('div', { style: 'display:grid;gap:6px' }, el('h3', {}, 'Bon-Protokolle'),
      el('p', { class: 'leise klein' }, 'Was die Erkennung beim Lesen getan hat (Durchläufe, Zeiten, Fehler, Zwischenbilder, auf Wunsch das Foto). Bleibt auf diesem Handy, bis du es teilst.'),
      l.length ? l.map((e) => el('div', { class: 'reihe', style: 'justify-content:space-between;align-items:center;gap:8px;margin:6px 0' },
        el('span', { class: 'klein' }, `${new Date(e.t).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}${e.posten != null ? ` · ${e.posten} Posten` : ''}`),
        el('span', { class: 'reihe', style: 'gap:6px' },
          el('button', { type: 'button', class: 'knopf haupt', onclick: () => protokollTeilen(e.id, true) }, 'Teilen mit Foto'),
          el('button', { type: 'button', class: 'knopf flach', onclick: () => protokollTeilen(e.id, false) }, 'ohne Foto')))) : el('p', { class: 'leise klein' }, 'Noch keins.'));
  }
  async function rwLesen(r) {
    const status = (t) => { r.lesen = t; const e = $('.rw-status'); if (e && RW === r) e.textContent = t; };
    try {
      const lade = (src, da) => (da ? Promise.resolve() : new Promise((ok, fehler) => { const sc = document.createElement('script'); sc.src = src; sc.onload = ok; sc.onerror = fehler; document.head.append(sc); }));
      await Promise.all([lade('bon.js', window.Bon), lade('speisen.js', window.Speisen).catch(() => null)]);
      const original = r.foto;
      const b = await window.Bon.erkenne(r.foto, (m) => {
        if (m.status === 'stufe') { rwFortschritt(r, m.text, m.progress); return; }
        const pz = Math.round((m.progress || 0) * 100);
        if (/paddle/.test(m.status || '') && /load/.test(m.status || '')) status(`Erkennung wird geladen (einmalig, etwa 28 MB, danach offline) … ${pz} %`);
        else if (/load|initial/i.test(m.status || '')) status(`Erkennung wird geladen (einmalig, etwa 5 MB) … ${pz} %`);
        else if (/nachlesen/.test(m.status || '')) status(`Beträge werden zur Sicherheit mehrfach gelesen … ${pz} %`);
        else if (/recogniz/i.test(m.status || '')) status(`Bon wird gelesen … ${pz} %`);
      });
      protokollMerken(r, b.protokoll, original, null);
      r.bon = b; window.__bonLetzte = b; r.foto = b.bild; r.fotoOrig = b.bildOriginal || null; r.lesen = null;
      // „Wofür?“ vorbelegen: Art + Geschäftsname vom Bon (nur wenn noch leer)
      if (!r.z && b.art && (b.art.name || b.art.geschaeft)) r.z = [b.art.name, b.art.geschaeft].filter(Boolean).join(' · ').slice(0, 60);
      const total = b.qr ? b.qr.total : b.total;
      if (total != null && !r.summeHand) { r.summe = total; r.quelle = b.qr ? 'Aus dem QR-Code auf dem Bon gelesen.' : b.pruefung && b.pruefung.gesamtOk ? 'Gelesen und geprüft: Die Posten ergeben genau diese Summe.' : 'Von der Summenzeile gelesen. Bitte mit dem Foto vergleichen.'; }
    } catch (e) {
      r.lesen = 'Die Erkennung hat nicht geklappt. Du kannst alles von Hand eintragen.'; r.bonFehler = true;
      protokollMerken(r, window.Bon && window.Bon.abbruchProtokoll ? window.Bon.abbruchProtokoll() : null, r.foto, e);
    }
    // während des Lesens gespeichert und geschlossen: Ergebnis in den Entwurf schreiben, damit beim Fortsetzen nichts fehlt
    if (RW !== r) { if (rwEntwuerfe()[r.id]) { const offen = RW; RW = r; try { rwMerken(); } finally { RW = offen; } } return; }
    if (r.schritt === 'summe') rwZeichnen(false);
    else if (r.schritt === 'art') rwZeichnen(false);
    else if (r.schritt === 'posten' && !r.posten.length) rwZeichnen(true);
  }
  function rwKopf() {
    const folge = rwFolge(), i = folge.indexOf(RW.schritt);
    // Navigationsleiste in einer Zeile: links zurück/abbrechen, Mitte Titel mit Schrittpunkten und Version, rechts Aktionen
    return el('div', { class: 'rw-kopf' },
      el('button', { type: 'button', class: 'ik-knopf', onclick: rwZurueck, 'aria-label': i > 0 ? 'Einen Schritt zurück' : 'Abbrechen', title: i > 0 ? 'Zurück' : 'Abbrechen' }, ic(i > 0 ? 'zurueck' : 'x')),
      el('div', { class: 'rw-mitte' }, el('h2', { id: 'rw-titel', tabindex: '-1' }, rwNamen[RW.schritt]),
        el('div', { class: 'rw-unter' }, el('div', { class: 'rw-punkte', role: 'img', 'aria-label': `Schritt ${i + 1} von ${folge.length}` }, folge.map((s, k) => el('i', { class: k <= i ? 'an' : '' }))), el('span', { class: 'rw-ver' }, `v${VERSION}`))),
      el('div', { class: 'rw-aktionen' }, rwVerlaufKnoepfe(),
        el('button', { type: 'button', class: 'rw-sichern', onclick: rwZwischenspeichern, 'aria-label': 'Speichern und schließen – später unter Kosten, Angefangen weitermachen' }, ic('sichern'), 'Speichern')));
  }
  // Jederzeit verlassen ohne Datenverlust: Entwurf (wird ohnehin nach jeder Änderung gemerkt) sichern, schließen, Weg zurück zeigen
  function rwZwischenspeichern() {
    if (!RW) return;
    const id = RW.id, etwas = RW.foto || RW.posten.length || RW.summe;
    rwMerken(); rwSchliessen(false);
    S.tab = 'gruppe'; S.gTeil = 'kosten'; speicher.set('tab', 'gruppe'); speicher.set('gTeil', 'kosten'); haptik(15); zeichne({ karte: false });
    toast(etwas ? 'Gespeichert. Unter „Kosten → Angefangen“ geht es weiter.' : 'Nichts zu speichern.', etwas ? { aktion: 'Öffnen', fn: () => rwFortsetzen(id) } : undefined);
  }
  function rwZeichnen(fokus) {
    const box = $('#rechnung'); if (!box || !RW) return;
    const ansicht = { summe: rwSumme, art: rwArt, posten: rwPosten, zahler: rwZahler }[RW.schritt]();
    const alt = box.querySelector('.rw-inhalt'), scroll = alt && !fokus ? alt.scrollTop : 0;
    setze(box, rwKopf(), ansicht.inhalt, ansicht.fuss || el('div', { class: 'rw-fuss leer' }));
    rwMerken();
    const neu = box.querySelector('.rw-inhalt'); if (neu) neu.scrollTop = scroll;
    RW.pop = null;
    if (fokus) { const t = $('#rw-titel'); if (t) t.focus({ preventScroll: true }); }
  }
  // ---- Schritt 1: Summe
  function rwSumme() {
    const feld = el('input', { type: 'text', inputmode: 'decimal', class: 'rw-summe', placeholder: '0,00', value: centText(RW.summe || 0), 'aria-label': 'Gesamtsumme laut Kassenzettel in Euro', autocomplete: 'off' });
    const hinweis = el('p', { class: 'leise klein rw-quelle', 'aria-live': 'polite' }, RW.quelle || (RW.foto ? 'Trage die Summe vom Bon ein. Wird sie gelesen, erscheint sie hier von selbst.' : 'Trage die Summe vom Bon ein.'));
    const weiter = el('button', { type: 'button', class: 'knopf haupt breit rw-weiter', onclick: () => { if (!RW.summe) return; RW.schritt = 'art'; haptik(); rwZeichnen(true); } }, 'Weiter');
    const pruefe = () => { weiter.disabled = !RW.summe; weiter.textContent = RW.summe ? `Weiter mit ${euro(RW.summe)}` : 'Weiter'; };
    feld.addEventListener('input', () => { RW.summe = betragLesen(feld.value); RW.summeHand = true; RW.quelle = ''; hinweis.textContent = 'Von dir eingetragen.'; pruefe(); });
    pruefe();
    const zweck = el('input', { type: 'text', maxlength: '60', placeholder: 'Wofür? z. B. Abendessen (freiwillig)', value: RW.z, 'aria-label': 'Wofür war die Rechnung', autocomplete: 'off' });
    zweck.addEventListener('input', () => { RW.z = zweck.value; });
    return {
      inhalt: el('div', { class: 'rw-inhalt' },
        RW.foto ? el('button', { type: 'button', class: 'rw-foto', 'aria-label': 'Kassenzettel groß ansehen', onclick: () => zeigeFoto(RW.foto) }, el('img', { src: RW.foto, alt: 'Foto vom Kassenzettel' }), el('span', {}, 'Tippen zum Vergrößern')) : null,
        RW.lesen && !RW.bon && !RW.bonFehler ? rwLade() : RW.lesen ? el('p', { class: 'rw-status', role: 'status' }, RW.lesen) : null,
        RW.bon && RW.bon.art && RW.bon.art.name ? el('p', { class: 'leise klein' }, `Erkannt: ${RW.bon.art.name}${RW.bon.art.sicher ? '' : ' (vermutlich)'}${RW.bon.art.geschaeft ? ` · ${RW.bon.art.geschaeft}` : ''}`) : null,
        el('label', { class: 'rw-label', for: 'rw-summe' }, 'Gesamtsumme laut Bon'), el('div', { class: 'rw-geld' }, Object.assign(feld, { id: 'rw-summe' }), el('span', { 'aria-hidden': 'true' }, '€')), hinweis,
        el('div', { class: 'feld' }, zweck),
        el('p', { class: 'leise klein' }, 'Das Foto bleibt auf diesem Handy. Die Erkennung läuft im Handy.')),
      fuss: el('div', { class: 'rw-fuss' }, weiter) };
  }
  // ---- Schritt 2: Wer war dabei, wie teilen
  function rwArt() {
    const alle = personenListe();
    const je = RW.dabei.length ? verteile(RW.summe, RW.dabei.map((id) => [id, 1])) : {};
    const werte = Object.values(je), lo = Math.min(...werte), hi = Math.max(...werte);
    const chips = el('div', { class: 'chips wrap rw-leute-wahl', role: 'group', 'aria-label': 'Wer war dabei' }, alle.map((id) => el('button', { type: 'button', class: 'chip', 'aria-pressed': String(RW.dabei.includes(id)),
      onclick: () => { RW.dabei = RW.dabei.includes(id) ? RW.dabei.filter((x) => x !== id) : RW.dabei.concat(id); haptik(); rwZeichnen(false); } }, personPunkt(id), personName(id))));
    const nP = RW.bon ? RW.bon.posten.filter((p) => !p.zuschlag).length : 0;
    const post = RW.bon ? (rwSicher(RW.bon) ? `${nP} Posten gelesen, Summe stimmt` : nP ? `${nP} Posten gelesen, bitte kurz prüfen` : 'Posten selbst eintragen, Foto zum Nachlesen') : RW.lesen ? 'Foto wird noch gelesen …' : 'Posten selbst eintragen';
    const keiner = !RW.dabei.length;
    return { inhalt: el('div', { class: 'rw-inhalt' },
      el('p', { class: 'rw-gross' }, `${euro(RW.summe)}${RW.z ? ` · ${RW.z}` : ''}`),
      chips,
      el('button', { type: 'button', class: 'knopf flach', style: 'justify-self:start', onclick: () => { RW.dabei = RW.dabei.length === alle.length ? [] : alle.slice(); rwZeichnen(false); } }, RW.dabei.length === alle.length ? 'Niemanden' : 'Alle'),
      el('button', { type: 'button', class: 'rw-wahl haupt', disabled: keiner ? true : null, onclick: () => { RW.modus = 'gleich'; RW.schritt = 'zahler'; haptik(); rwZeichnen(true); } },
        el('strong', {}, 'Gleich teilen'), el('span', {}, keiner ? 'Wähle oben, wer dabei war.' : lo === hi ? `Jede Person ${euro(lo)}` : `Je ${euro(lo)} bis ${euro(hi)}, die Cent sind genau verteilt`)),
      el('button', { type: 'button', class: 'rw-wahl', disabled: keiner ? true : null, onclick: () => { RW.modus = 'posten'; RW.schritt = 'posten'; haptik(); rwZeichnen(true); } },
        el('strong', {}, 'Nach Posten teilen'), el('span', {}, `Jede Person zahlt, was sie hatte. ${post}.`))) };
  }
  // ---- Schritt 3: Posten zuordnen
  function rwSummen() {
    const an = {};
    for (const q of RW.posten) if (q.b && !q.aus && q.w.length) for (const [id, c] of Object.entries(verteile(Math.abs(q.b), q.w.map((id) => [id, 1])))) an[id] = (an[id] || 0) + Math.sign(q.b) * c;
    return an;
  }
  function rwPosten() {
    // erst vorbelegen, wenn der Bon gelesen ist (man kann schon vorher hier sein)
    if (!RW.geladen && (RW.bon || !RW.lesen)) {
      RW.geladen = true;
      // Gelesene Posten immer vorbelegen (Prüfen geht schneller als Abtippen). Neben jedem Posten steht seine Zeile aus dem Foto.
      // Unsichere sind markiert; geht die Summe nicht auf, zeigt der Kasten unten die Differenz.
      if (!RW.posten.length && RW.bon && RW.bon.posten.length) {
        const ok = rwSicher(RW.bon), zus = RW.bon.posten.filter((p) => p.zuschlag);
        // Platzhalter („Nicht gelesen“) gibt es nicht mehr: jeder Posten hat eine Zeile im Bild
        RW.posten = RW.bon.posten.filter((p) => !p.zuschlag && !p.fehlt && p.zeile >= 0).flatMap((p) => {
          const pruef = !ok && !p.sicher ? 'Bitte mit dem Bild vergleichen' : p.rep ? 'Nachgelesen – bitte kurz mit dem Bild vergleichen' : p.nameUnsicher ? 'Name bitte prüfen' : '';
          const vorschlag = (p.vorschlag || (p.kand || []).filter((c) => c.warum !== 'weg' && c.v !== p.b).map((c) => c.v)).filter((v) => v > 0).slice(0, 3);
          // Menge > 1 und Menge × Einzelpreis = Zeilenbetrag: je Stück eine Zeile, damit jede Person ihr Stück bekommt
          const basis = { t: p.nameUnsicher ? '' : p.t, w: [], bild: p.schnipsel || null, pruef, vorschlag, zl: p.zeile, k: rwKlasse(p.nameUnsicher ? '' : p.t), sicherheit: p.sicherheit, lesungen: p.lesungen || [],
            zus: (p.zusaetze || []).map((z) => ({ art: z.art, b: z.b, zl: z.zeile, t: z.t, alt: (z.alt || []).map((a) => a.zeile), sicher: !!z.sicher })),
            zuKand: p.zuKand ? p.zuKand.map((a) => a.zeile) : null, zusArt: p.zusArt || null, kaution: !!p.kaution,
            aus: p.kaution ? true : undefined };
          if (p.kaution) basis.pruef = 'Kaution: wird erstattet, darum nicht geteilt. Antippen zum Einblenden.';
          return p.menge > 1 && p.menge <= 12 && p.einzel && p.einzel * p.menge === p.b
            ? Array.from({ length: p.menge }, (_, k) => ({ ...basis, b: p.einzel, teil: `${k + 1}/${p.menge}` }))
            : [{ ...basis, b: p.b }];
        });
        // Zeilen im Postenblock, deren Betrag nicht gelesen wurde: als Posten ohne Betrag zeigen (mit Bild), nicht verschweigen
        if (!ok) RW.bon.zeilen.forEach((z, i) => { if (z.typ === 'unklar' && z.b) RW.posten.push({ t: rwNameAus(z.text), b: 0, w: [], zl: i, k: rwKlasse(rwNameAus(z.text)), offenBetrag: true, pruef: 'Betrag nicht gelesen – bitte eintragen' }); });
        RW.posten.sort((a, b) => (a.zl ?? 1e9) - (b.zl ?? 1e9));
        if (RW.posten.some((q) => !q.bild && q.zl != null)) rwBilderNach();
        // Steuer oder Service, die auf dem Bon zur Summe dazukommen (z. B. USA): anteilig nach den Posten verteilen
        if (zus.length && ok) { RW.tipArt = '€'; RW.tip = zus.reduce((a, p) => a + p.b, 0); RW.tipName = zus.map((p) => p.t).join(' + '); }
      }
    }
    const wer = RW.dabei;
    if (RW.aktiv !== 'alle' && !wer.includes(RW.aktiv)) RW.aktiv = wer[0] || 'alle';
    const an = rwSummen();
    const leiste = el('div', { class: 'rw-leute', role: 'group', 'aria-label': 'Für wen tippst du gerade' },
      wer.map((id) => el('button', { type: 'button', class: 'rw-person farbig', style: personStil(id), 'aria-pressed': String(RW.aktiv === id), onclick: () => { RW.aktiv = id; haptik(); rwZeichnen(false); } },
        el('b', {}, personName(id)), el('small', {}, euro(an[id] || 0)))),
      el('button', { type: 'button', class: 'rw-person', 'aria-pressed': String(RW.aktiv === 'alle'), onclick: () => { RW.aktiv = 'alle'; haptik(); rwZeichnen(false); } }, el('b', {}, 'Alle'), el('small', {}, 'geteilt')));
    const initial = (id) => el('span', { class: 'rw-abz', style: personStil(id) }, kuerzel(id));
    const band = (q) => (q.w.length ? `linear-gradient(to bottom, ${q.w.map((id, k) => `${personFarbe(id)} ${(k / q.w.length) * 100}% ${((k + 1) / q.w.length) * 100}%`).join(', ')})` : 'transparent');
    const zeilen = RW.posten.map((q, i) => {
      if (RW.edit === i) {
        const bt = el('input', { type: 'text', inputmode: 'decimal', class: 'geld', value: centText(Math.abs(q.b)), 'aria-label': 'Betrag', autocomplete: 'off' });
        const nm = el('input', { type: 'text', maxlength: '40', value: q.t, placeholder: 'Name', 'aria-label': 'Name des Postens', autocomplete: 'off' });
        const vorher = q.b;
        bt.addEventListener('input', () => { q.pruef = ''; q.b = betragLesen(bt.value) * (q.b < 0 ? -1 : 1); }); nm.addEventListener('input', () => { q.t = nm.value; q.k = rwKlasse(q.t); });
        bt.addEventListener('change', () => rwKorrektur(q, vorher, q.b));
        return el('li', { class: 'rw-zeile edit' }, el('div', { class: 'rw-edit' }, bt, nm),
          el('div', { class: 'reihe' },
            el('button', { type: 'button', class: 'knopf warn', onclick: () => { const alt = RW.posten.splice(i, 1)[0]; RW.edit = -1; rwZeichnen(false); toast('Posten gelöscht.', { aktion: 'Rückgängig', fn: () => { RW.posten.splice(i, 0, alt); rwZeichnen(false); } }); } }, ic('aus'), 'Löschen'),
            el('button', { type: 'button', class: 'knopf haupt', style: 'flex:1', onclick: () => { RW.edit = -1; rwZeichnen(false); } }, ic('haken'), 'Fertig')));
      }
      const alle = q.w.length && q.w.length === wer.length;
      const frei = !q.w.length;
      const meins = RW.aktiv === 'alle' ? alle : q.w.includes(RW.aktiv);
      const titel = rwTitel(q);
      return el('li', { class: 'rw-zeile' + (frei && !q.aus ? ' frei' : '') + (q.aus ? ' aus' : '') + (RW.pop === i ? ' pop' : '') + (q.w.length && !q.aus ? ' belegt' : ''), style: q.w.length && !q.aus ? personStil(q.w[0]) : null },
        el('button', { type: 'button', class: 'rw-p', 'aria-pressed': String(!q.aus && meins), 'aria-label': `${titel}, ${euro(q.b)}, ${q.aus ? 'ausgeblendet, antippen zum Einblenden' : frei ? 'noch niemandem zugeordnet' : alle ? 'alle' : q.w.map(personName).join(' und ')}`,
          onclick: () => {
            if (q.aus) { q.aus = false; haptik(); rwZeichnen(false); return; }
            if (RW.aktiv === 'alle') q.w = alle ? [] : wer.slice(); else q.w = q.w.includes(RW.aktiv) ? q.w.filter((x) => x !== RW.aktiv) : q.w.concat(RW.aktiv);
            RW.pop = i; haptik(); rwZeichnen(false);
          } },
          el('span', { class: 'rw-band', style: `background:${q.aus ? 'transparent' : band(q)}`, 'aria-hidden': 'true' }),
          q.bild ? el('img', { class: 'rw-zeilenbild', src: q.bild, alt: '', 'aria-hidden': 'true', draggable: 'false' }) : null,
          el('span', { class: 'rw-pn' }, q.k ? el('span', { class: 'rw-sym', 'aria-hidden': 'true' }, q.k.s) : null, titel,
            q.k && q.t ? el('small', { class: 'rw-orig' }, q.t) : null, rwZusText(q) ? el('small', { class: 'rw-orig rw-pfand' }, rwZusText(q)) : null,
            q.zuKand && q.zuKand.length ? el('small', { class: 'rw-orig rw-pfand' }, `${q.zusArt === 'rabatt' ? 'Rabatt' : 'Pfand'} – gehört evtl. zu einem Artikel (✎)`) : null,
            q.pruef && (!q.aus || q.kaution) ? el('em', { class: 'rw-pruef' }, q.pruef) : null),
          el('span', { class: 'rw-pb' }, (q.b < 0 ? '−' : '') + euro(q.b), rwSicherPill(q)),
          el('span', { class: 'rw-wer' }, q.aus ? 'ausgeblendet · antippen zum Einblenden' : frei ? 'noch offen' : alle ? 'Alle' : q.w.map(initial))),
        el('button', { type: 'button', class: 'ik-knopf rw-stift', 'aria-label': `${titel} bearbeiten`, title: 'Bearbeiten', onclick: () => { if (q.zl != null && RW.bon) rwBon(q.zl); else { RW.edit = i; rwZeichnen(false); } } }, ic('stift')));
    });
    // neuer Posten: Betrag zuerst, Enter fügt hinzu und bleibt im Feld
    const nb = el('input', { type: 'text', inputmode: 'decimal', class: 'geld', placeholder: '0,00', 'aria-label': 'Betrag des neuen Postens', autocomplete: 'off' });
    const nn = el('input', { type: 'text', maxlength: '40', placeholder: 'Name (freiwillig)', 'aria-label': 'Name des neuen Postens', autocomplete: 'off' });
    const neu = () => { const c = betragLesen(nb.value); if (!c) { toast('Bitte einen Betrag eingeben, z. B. 4,50.'); nb.focus(); return; } RW.posten.push({ t: nn.value.trim(), b: c, w: RW.aktiv === 'alle' ? wer.slice() : [RW.aktiv] }); haptik(); rwZeichnen(false); setTimeout(() => { const f = $('#rechnung .rw-neu .geld'); if (f) f.focus(); const l = $('#rechnung .rw-inhalt'); if (l) l.scrollTop = l.scrollHeight; }, 40); };
    for (const f of [nb, nn]) f.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); neu(); } });
    const offen = RW.posten.filter((q) => !q.aus && ((q.b && !q.w.length) || (q.offenBetrag && !q.b))).length;
    const kautionAus = RW.posten.filter((q) => q.kaution && q.aus).reduce((a, q) => a + q.b, 0);
    const S2 = rwPostenSumme(), diff = RW.summe - S2 - kautionAus;
    const zuschlagPasst = diff > 0 && RW.tipArt === '€' && RW.tip === diff;
    const pruefung = !RW.posten.length ? null : diff === 0 ? el('p', { class: 'rw-ok', role: 'status' }, kautionAus ? `✓ Posten ${euro(S2)} plus Kaution ${euro(kautionAus)} (wird erstattet, nicht geteilt) ergeben ${euro(RW.summe)}, wie auf dem Bon.` : `✓ Posten ergeben ${euro(S2)}, wie auf dem Bon.`)
      : zuschlagPasst ? el('p', { class: 'rw-ok', role: 'status' }, `✓ Posten ${euro(S2)} plus ${RW.tipName || 'Service/Trinkgeld'} ${euro(RW.tip)} ergeben ${euro(RW.summe)}, wie auf dem Bon. Wird anteilig verteilt.`)
      : el('div', { class: 'rw-warn', role: 'alert' },
        el('strong', {}, diff > 0 ? `Es fehlen ${euro(diff)} zur Summe auf dem Bon (${euro(RW.summe)}).` : `Die Posten sind ${euro(-diff)} mehr als der Bon (${euro(RW.summe)}).`),
        el('div', { class: 'reihe' },
          RW.bon ? el('button', { type: 'button', class: 'knopf haupt', onclick: () => rwBon(null) }, 'Fehlende Posten im Bon suchen') : null,
          diff > 0 ? el('button', { type: 'button', class: 'knopf', onclick: () => { RW.tipArt = '€'; RW.tip = diff; RW.tipName = ''; haptik(); rwZeichnen(false); } }, `Als Service/Trinkgeld anteilig verteilen`) : null,
          el('button', { type: 'button', class: 'knopf', onclick: () => { RW.summe = S2; RW.summeHand = true; haptik(); rwZeichnen(false); } }, `Summe auf ${euro(S2)} setzen`)));
    const hilfe = !RW.posten.length
      ? RW.lesen && !RW.bon && !RW.bonFehler ? rwLade() : el('div', { class: 'rw-leer' }, el('strong', {}, RW.bon ? 'Die Posten konnte ich nicht sicher lesen.' : 'Noch keine Posten.'),
        el('span', {}, 'Lies sie im Foto ab: Betrag eintragen, Enter, nächster Posten. Name ist freiwillig.')) : null;
    const bonAuf = () => (RW.bon ? rwBon(null) : zeigeFoto(RW.foto));
    const bonKopf = RW.foto ? el('button', { type: 'button', class: 'rw-bonkopf', onclick: bonAuf }, el('span', { class: 'rw-bonkopf-in' },
      el('img', { src: RW.foto, alt: '', 'aria-hidden': 'true' }),
      el('span', {}, el('strong', {}, 'Original-Bon'), el('small', {}, RW.bon ? 'Posten im Bild prüfen und bearbeiten' : 'Groß ansehen')))) : null;
    const bonFab = RW.foto ? el('button', { type: 'button', class: 'rw-bonfab', onclick: bonAuf, 'aria-label': 'Original-Bon öffnen' }, el('img', { src: RW.foto, alt: '', 'aria-hidden': 'true' }), el('span', {}, 'Bon')) : null;
    const tipp = el('details', { class: 'rw-tip' }, el('summary', {}, RW.tip ? `${RW.tipName || 'Service/Trinkgeld'}: ${RW.tipArt === '%' ? RW.tip + ' %' : euro(RW.tip)}` : 'Service oder Trinkgeld hinzufügen'),
      el('div', { class: 'chips wrap' }, [0, 5, 10, 15].map((pz) => el('button', { type: 'button', class: 'chip', 'aria-pressed': String(RW.tipArt === '%' && RW.tip === pz && pz > 0 || (!RW.tip && pz === 0)), onclick: () => { RW.tipArt = '%'; RW.tip = pz; RW.tipName = ''; rwZeichnen(false); } }, pz ? `${pz} %` : 'Keins'))),
      el('p', { class: 'leise klein' }, 'Wird nach den Posten anteilig verteilt.'));
    const weiter = el('button', { type: 'button', class: 'knopf haupt breit rw-weiter', disabled: offen || !RW.posten.length || diff < 0 || (diff > 0 && !RW.tip) ? true : null, onclick: () => { RW.schritt = 'zahler'; haptik(); rwZeichnen(true); } },
      !RW.posten.length ? 'Erst Posten eintragen' : offen ? `Noch ${offen} ${offen === 1 ? 'Posten' : 'Posten'} offen` : diff < 0 ? 'Summe prüfen' : diff > 0 && !RW.tip ? 'Differenz klären' : 'Weiter');
    const leer = !RW.posten.length;
    return { inhalt: el('div', { class: 'rw-inhalt posten' }, leer ? null : leiste,
      leer ? null : el('p', { class: 'leise klein', style: 'margin:0' }, `Du tippst für ${RW.aktiv === 'alle' ? 'alle gemeinsam' : personName(RW.aktiv)}. Tippe die Posten an, die ${RW.aktiv === 'alle' ? 'ihr teilt' : 'dazugehören'}.`),
      bonKopf, rwHinweis(), rwUebersicht(), hilfe, zeilen.length ? el('ul', { class: 'rw-liste' }, zeilen) : null,
      zeilen.length && RW.bon ? el('div', { class: 'reihe rw-export' }, el('button', { type: 'button', class: 'knopf', onclick: () => rwExport('csv') }, 'Als Tabelle (Excel)'), el('button', { type: 'button', class: 'knopf flach', onclick: () => rwExport('text') }, 'Text vom Bon')) : null,
      el('div', { class: 'rw-neu' }, nb, nn, el('button', { type: 'button', class: 'knopf haupt', onclick: neu }, ic('plus'), 'Posten')),
      pruefung, leer ? null : tipp, bonFab),
      fuss: el('div', { class: 'rw-fuss' + (offen ? ' zwei' : '') }, offen ? el('button', { type: 'button', class: 'knopf', onclick: () => { RW.posten.forEach((q) => { if (q.b && !q.aus && !q.w.length) q.w = wer.slice(); }); haptik(); rwZeichnen(false); } }, 'Rest teilen') : null, weiter) };
  }
  // ---- Original-Bon im Vollbild: jede gelesene Zeile ist ein Kasten im Bild. Posten antippen → korrigieren, Personen
  // zuordnen, ausblenden (zählt nicht mehr, bleibt sichtbar) oder löschen. Andere Zeilen antippen → als Posten übernehmen.
  // Wiedererkennen statt Erinnern: man sieht genau die Zeile vom Bon, nicht nur unseren gelesenen Text.
  function rwBon(sel) {
    if (!RW || !RW.bon) return;
    RW.bonSel = sel; if (RW.bonMarken == null) RW.bonMarken = true;
    if (!$('#rw-bon')) {
      document.body.append(el('div', { id: 'rw-bon', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Original-Bon' }));
      const rw = $('#rechnung'); if (rw) rw.inert = true; // nur ein Dialog gleichzeitig bedienbar (auch für Bildschirmleser)
      try { history.pushState({ rw: 1, rwb: 1 }, '', '#bon'); } catch (e) { /* egal */ }
    }
    rwBonZeichnen(sel != null);
  }
  function rwBonZu(vonZurueck) {
    const b = $('#rw-bon'); if (!b) return;
    b.remove(); const rw = $('#rechnung'); if (rw) rw.inert = false;
    if (RW) { RW.bonSel = null; rwZeichnen(false); }
    if (!vonZurueck) try { if (history.state && history.state.rwb) history.back(); } catch (e) { /* egal */ }
  }
  const rwNameAus = (t) => String(t || '').replace(/(-?\d{1,3}(?:[.,' ]\d{3})*[.,]\d{2})(?!\d)/g, '').replace(/[€$£]|\b\d{1,2}\s*%|\beur\b/gi, '').replace(/^\W*\d+([.,]\d+)?\s+/, '').replace(/^\s*(uni|un|jni|und|stk|pcs)\b\.?\s*/i, '').replace(/\s+/g, ' ').trim().slice(0, 40);
  // Zeilenbild aus dem Bon-Foto schneiden (für Posten, die per Hand übernommen wurden oder ohne Bild kamen)
  let rwFotoBild = null;
  async function rwSchnipsel(zl) { // eng zugeschnitten: Erkennungskästen sind aufgeweitet und reichen sonst in Nachbarzeilen
    const z = RW && RW.bon && RW.bon.zeilen[zl]; if (!z || !z.b || !RW.foto) return null;
    if (!rwFotoBild || rwFotoBild.src !== RW.foto) rwFotoBild = await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = RW.foto; });
    if (!rwFotoBild) return null;
    const f = rwFotoBild.width / RW.bon.breite, h0 = (z.b.y1 - z.b.y0) * f, h = h0 * 0.76, pad = h0 * 0.04;
    const x0 = Math.max(0, z.b.x0 * f - pad), y0 = Math.max(0, z.b.y0 * f + h0 * 0.12 - pad), w = Math.min(rwFotoBild.width - x0, (z.b.x1 - z.b.x0) * f + 2 * pad), hh = Math.min(rwFotoBild.height - y0, h + 2 * pad);
    const s2 = Math.min(1, 56 / hh), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * s2)); c.height = Math.max(1, Math.round(hh * s2));
    c.getContext('2d').drawImage(rwFotoBild, x0, y0, w, hh, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.8);
  }
  async function rwBilderNach() { if (!RW) return; for (const q of RW.posten) if (!q.bild && q.zl != null) q.bild = await rwSchnipsel(q.zl); if (RW) { if ($('#rw-bon')) rwBonZeichnen(false); else rwZeichnen(false); } }
  const rwBetragAus = (t) => { const m = [...String(t).matchAll(/(-?\d{1,3}(?:[.,' ]\d{3})*[.,]\d{2})(?!\d)/g)].pop(); if (!m) return 0; const r = m[1], neg = r.startsWith('-'), x = r.replace(/^-/, ''); const v = Math.round(parseFloat(`${x.slice(0, -3).replace(/[.,' ]/g, '')}.${x.slice(-2)}`) * 100); return neg ? -v : v; };
  // Stelle im Bild antippen, wo kein Kasten ist: dort eine Zeile anlegen und (wenn die Erkennung geladen ist) lesen
  // Zeilenraster des Bons: Abstand der gedruckten Zeilen (Median der Mittenabstände im Postenblock)
  function rwRaster() {
    const b = RW.bon, cy = (z) => (z.b.y0 + z.b.y1) / 2;
    const zs = b.zeilen.filter((z) => z.b && z.text && z.typ !== 'neu').map(cy).sort((p, q) => p - q);
    const d = zs.slice(1).map((y, k) => y - zs[k]).filter((x) => x > 4).sort((p, q) => p - q);
    const hs = b.zeilen.filter((z) => z.b).map((z) => z.b.y1 - z.b.y0).sort((p, q) => p - q), h = hs.length ? hs[hs.length >> 1] : b.hoehe / 60;
    return { pitch: d.length ? Math.min(d[Math.floor(d.length * 0.35)], 1.4 * h) : h, zs };
  }
  // Leere Stelle angetippt: auf das Zeilenraster einrasten (nicht irgendwo ein Band über drei Zeilen), nur diese Zeile lesen
  async function rwBonStelle(y0) {
    const b = RW.bon, { pitch, zs } = rwRaster();
    let y = y0; const oben = zs.filter((v) => v <= y0).pop(), unten = zs.find((v) => v > y0);
    if (oben != null && unten != null && unten - oben > 1.4 * pitch) { const k = Math.max(1, Math.round((unten - oben) / pitch)), st = (unten - oben) / k; y = oben + Math.round((y0 - oben) / st) * st; }
    else if (oben != null && y0 - oben < 1.6 * pitch) y = oben + pitch * Math.max(1, Math.round((y0 - oben) / pitch));
    else if (unten != null && unten - y0 < 1.6 * pitch) y = unten - pitch * Math.max(1, Math.round((unten - y0) / pitch));
    const h = pitch;
    const z = { text: '', b: { x0: b.breite * 0.02, x1: b.breite * 0.98, y0: Math.max(0, y - h * 0.5), y1: Math.min(b.hoehe, y + h * 0.5) }, typ: 'neu', block: true };
    b.zeilen.push(z); RW.bonSel = b.zeilen.length - 1; haptik(); rwBonZeichnen(false);
    try {
      if (window.FasanOCR && await window.FasanOCR.verfuegbar()) {
        if (!rwFotoBild || rwFotoBild.src !== RW.foto) rwFotoBild = await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = RW.foto; });
        const c = document.createElement('canvas'); c.width = b.breite; c.height = b.hoehe; c.getContext('2d').drawImage(rwFotoBild, 0, 0, b.breite, b.hoehe);
        const w = (await window.FasanOCR.streifen(c, z.b.y0, z.b.y1)).filter((x) => Math.abs((x.b.y0 + x.b.y1) / 2 - y) < h * 0.38).sort((p, q) => p.b.x0 - q.b.x0);
        if (w.length) { z.text = w.map((x) => x.t).join(' '); z.b = { x0: Math.min(...w.map((x) => x.b.x0)), x1: Math.max(...w.map((x) => x.b.x1)), y0: Math.min(...w.map((x) => x.b.y0)), y1: Math.max(...w.map((x) => x.b.y1)) }; }
      }
    } catch (err) { /* ohne Lesen: Betrag von Hand */ }
    if ($('#rw-bon')) rwBonZeichnen(false);
  }
  // Gesamteinschätzung oben in der Liste: Summe geprüft? Wie viele Posten sicher, wie viele bitte vergleichen?
  function rwUebersicht() {
    const l = RW.posten.filter((q) => !q.aus && q.zl != null); if (!l.length || !RW.bon) return null;
    const n = { hoch: 0, mittel: 0, tief: 0 }; for (const q of l) { const st = rwStufe(q); if (st) n[st]++; }
    const ok = rwSicher(RW.bon) && rwPostenSumme() + (RW.tipArt === '€' ? RW.tip : 0) === RW.summe;
    return el('div', { class: 'rw-uebersicht' + (ok ? ' ok' : '') },
      el('span', {}, ok ? '✓ Summe geprüft' : '⚠ Summe noch nicht bestätigt'),
      el('span', { class: 'rw-sicher s-hoch' }, `${n.hoch} sicher`), n.mittel ? el('span', { class: 'rw-sicher s-mittel' }, `${n.mittel} prüfen`) : null, n.tief ? el('span', { class: 'rw-sicher s-tief' }, `${n.tief} unsicher`) : null);
  }
  // ---- Lesesicherheit sichtbar machen: Anteil übereinstimmender Lesungen (kein echtes Wahrscheinlichkeitsmaß)
  const rwStufe = (q) => (q.bestaetigt ? 'hoch' : q.offenBetrag && !q.b ? 'tief' : q.sicherheit == null ? '' : q.sicherheit >= 95 ? 'hoch' : q.sicherheit >= 75 ? 'mittel' : 'tief');
  function rwSicherPill(q) {
    const st = rwStufe(q); if (!st) return null;
    const text = q.bestaetigt ? '✓ von dir' : q.offenBetrag && !q.b ? '? fehlt' : `${st === 'hoch' ? '✓' : st === 'mittel' ? '≈' : '?'} ${q.sicherheit} %`;
    return el('span', { class: `rw-sicher s-${st}`, title: 'Lesesicherheit: Anteil der Lesungen, die genau diesen Betrag ergaben' }, text);
  }
  const rwAnteil = (q, v) => { const l = (q.lesungen || []).find((x) => x.v === v); return l ? Math.round(l.anteil * 100) : null; };

  // ---- Korrektur auswerten: Wird ein Betrag geändert (Vorschlag oder von Hand), lernt die App den Lesefehler
  // (z. B. „7“ statt „1“, fehlende führende „1“), liest alle anderen Posten mit dieser Ziffer gezielt nach und prüft die Summe neu.
  function rwZiffernMuster(alt, neu) {
    const a = centText(Math.abs(alt)), b = centText(Math.abs(neu)), m = [];
    if (!a || !b) return m;
    if (a.length === b.length) { for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && /\d/.test(a[i]) && /\d/.test(b[i])) m.push({ von: a[i], nach: b[i] }); }
    else if (b.length === a.length + 1) { for (let i = 0; i < b.length; i++) if (/\d/.test(b[i]) && b.slice(0, i) + b.slice(i + 1) === a) { m.push({ fehlt: b[i], vorn: i === 0 }); break; } }
    return m.slice(0, 3);
  }
  function rwVarianten(v, muster) {
    const t = centText(Math.abs(v)), out = new Set();
    for (const m of muster) {
      if (m.von) { for (let i = 0; i < t.length; i++) if (t[i] === m.von) out.add(t.slice(0, i) + m.nach + t.slice(i + 1)); out.add(t.split(m.von).join(m.nach)); }
      if (m.fehlt) { if (m.vorn) out.add(m.fehlt + t); else for (let i = 0; i < t.length - 3; i++) out.add(t.slice(0, i) + m.fehlt + t.slice(i)); }
    }
    return [...out].map(betragLesen).filter((x) => x > 0 && x !== Math.abs(v));
  }
  const rwMusterText = (muster) => muster.map((m) => (m.von ? `„${m.von}“ gelesen statt „${m.nach}“` : `„${m.fehlt}“ nicht gelesen`)).join(', ');
  // kleinste Zahl an Änderungen, mit der die offenen Posten die Zielsumme ergeben (dynamische Programmierung über Cent)
  function rwLoesen(ziel, fest, offen) {
    let dp = new Map([[fest, { k: 0, wahl: [] }]]);
    for (const o of offen) {
      const n = new Map();
      for (const [s, e] of dp) o.kand.forEach((v, j) => { const ns = s + v, nk = e.k + (j ? 1 : 0); if (nk > 3) return; const a = n.get(ns); if (!a || nk < a.k) n.set(ns, { k: nk, wahl: e.wahl.concat(j) }); });
      dp = n.size > 20000 ? new Map([...n].sort((a, b) => a[1].k - b[1].k).slice(0, 20000)) : n;
    }
    return dp.get(ziel) || null;
  }
  let rwLeinwand = null;
  async function rwLeinwandHolen() {
    if (rwLeinwand && rwLeinwand.src === RW.foto) return rwLeinwand.c;
    const img = await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = RW.foto; }); if (!img) return null;
    const c = document.createElement('canvas'); c.width = RW.bon.breite; c.height = RW.bon.hoehe; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    rwLeinwand = { src: RW.foto, c, dunkel: window.Bon && window.Bon.verbessern ? window.Bon.verbessern(c, 'dunkel') : null }; return c;
  }
  // Betragsbereich einer Zeile erneut lesen (rechter Teil der Zeile, Original und dunkler) und die Lesungen ergänzen
  async function rwZeileNachlesen(q) {
    try {
      if (!window.FasanOCR || !RW.bon || q.zl == null || !(await window.FasanOCR.verfuegbar())) return;
      const z = RW.bon.zeilen[q.zl], c = await rwLeinwandHolen(); if (!z || !z.b || !c) return;
      const h = z.b.y1 - z.b.y0, k = { x0: z.b.x0 + (z.b.x1 - z.b.x0) * 0.55, x1: Math.min(c.width, z.b.x1 + h * 0.3), y0: z.b.y0, y1: z.b.y1 };
      const l = [...await window.FasanOCR.mehrfach(c, k), ...(rwLeinwand.dunkel ? await window.FasanOCR.mehrfach(rwLeinwand.dunkel, k, { varianten: [[0.15, 0], [0.35, 0]] }) : [])];
      const stimmen = new Map(); for (const x of q.lesungen || []) stimmen.set(x.v, (stimmen.get(x.v) || 0) + x.anteil * 5);
      for (const x of l) { const v = Math.abs(rwBetragAus(x.t)); if (v) stimmen.set(v, (stimmen.get(v) || 0) + Math.max(0.2, x.c / 100)); }
      const ges = [...stimmen.values()].reduce((a, x) => a + x, 0) || 1;
      q.lesungen = [...stimmen].sort((a, b) => b[1] - a[1]).map(([v, x]) => ({ v, anteil: x / ges }));
      q.sicherheit = rwAnteil(q, Math.abs(q.b)) ?? 10;
      q.vorschlag = q.lesungen.filter((x) => x.v !== Math.abs(q.b)).map((x) => x.v).slice(0, 4);
    } catch (e) { /* Lesen nicht möglich: Muster und Summe genügen */ }
  }
  async function rwKorrektur(q, alt, neu) {
    if (!RW || alt === neu || !neu) return;
    const r = RW; q.bestaetigt = true; q.pruef = ''; q.offenBetrag = false; q.sicherheit = 100;
    const muster = alt ? rwZiffernMuster(alt, neu) : [];
    const andere = r.posten.filter((x) => x !== q && !x.aus && !x.bestaetigt && x.b && x.zl !== q.zl);
    const betroffen = muster.length ? andere.filter((x) => rwVarianten(x.b, muster).length) : [];
    if (betroffen.length) { r.hinweis = { art: 'laeuft', text: `Lesefehler ${rwMusterText(muster)} gelernt – prüfe ${betroffen.length} weitere Posten …` }; rwNeu(); }
    for (const x of betroffen) await rwZeileNachlesen(x);
    if (RW !== r) return;
    // Summe neu prüfen: Posten mit Alternativen dürfen sich ändern, bestätigte bleiben fest
    const ziel = r.summe - (r.tipArt === '€' ? r.tip : 0);
    const offen = [], fest0 = [];
    for (const x of r.posten) {
      if (x.aus || !x.b) continue;
      const kand = x.bestaetigt ? [] : [...new Set([...(betroffen.includes(x) ? rwVarianten(x.b, muster) : []), ...(x.vorschlag || [])])].filter((v) => v !== Math.abs(x.b)).map((v) => v * Math.sign(x.b));
      if (kand.length) offen.push({ x, kand: [x.b, ...kand] }); else fest0.push(x);
    }
    const lsg = rwLoesen(ziel, fest0.reduce((a, x) => a + x.b, 0), offen);
    // Tippfehler-Schutz: wich die Eingabe von einer sehr sicheren Lesung ab, ausdrücklich darauf hinweisen
    const sicherAlt = alt && rwAnteil(q, Math.abs(alt)); const warnAlt = sicherAlt != null && sicherAlt >= 85 ? ` Gelesen wurde ${euro(Math.abs(alt))} (${sicherAlt} % sicher) – stimmt deine Eingabe ${euro(Math.abs(neu))}?` : '';
    const aend = lsg ? offen.map((o, j) => { const nach = o.kand[lsg.wahl[j]], gleich = betroffen.includes(o.x) && rwVarianten(o.x.b, muster).includes(Math.abs(nach)), a = rwAnteil(o.x, Math.abs(nach));
      return { x: o.x, von: o.x.b, nach, grund: gleich ? 'gleicher Lesefehler' : a != null ? `andere Lesung, ${a} %` : 'andere Lesung' }; }).filter((a) => a.von !== a.nach) : [];
    for (const x of betroffen) if (!aend.some((a) => a.x === x)) x.pruef = `Enthält auch eine Ziffer aus dem Lesefehler – bitte kurz vergleichen`;
    if (aend.length) r.hinweis = { art: 'vorschlag', warn: warnAlt, text: aend.some((a) => a.grund === 'gleicher Lesefehler') ? `Gelernter Lesefehler: ${rwMusterText(muster)}. Damit die Summe stimmt, wohl auch hier:` : 'Damit die Summe wieder stimmt, passt diese Lesung:', aend };
    else if (lsg) r.hinweis = { art: 'ok', text: betroffen.length ? `✓ Summe stimmt. ${betroffen.length} Posten mit derselben Ziffer wurden nachgelesen und sind markiert.` : '✓ Summe stimmt.' };
    else r.hinweis = { art: 'warn', warn: warnAlt, text: `Summe stimmt noch nicht (${euro(Math.abs(ziel - rwPostenSumme()))} Unterschied). Vergleiche die Posten mit niedriger Sicherheit.` };
    rwNeu();
  }
  const rwNeu = () => { if (!RW) return; if ($('#rw-bon')) rwBonZeichnen(false); else rwZeichnen(false); };
  function rwHinweis() {
    const h = RW.hinweis; if (!h) return null;
    return el('div', { class: `rw-hinweis h-${h.art}`, role: 'status' }, h.warn ? el('p', { class: 'rw-hinweis-warn' }, '⚠', h.warn) : null, el('p', {}, h.text),
      h.aend ? el('ul', {}, h.aend.map((a) => el('li', {}, a.x.bild ? el('img', { src: a.x.bild, alt: '' }) : null, el('span', {}, `${rwTitel(a.x)}: ${euro(Math.abs(a.von))} → `, el('b', {}, euro(Math.abs(a.nach))), el('small', { class: 'leise' }, ` (${a.grund})`))))) : null,
      el('div', { class: 'reihe' },
        h.aend ? el('button', { type: 'button', class: 'knopf haupt', onclick: () => { for (const a of h.aend) { a.x.b = a.nach; a.x.bestaetigt = true; a.x.sicherheit = 100; a.x.pruef = ''; } RW.hinweis = { art: 'ok', text: '✓ Übernommen. Summe stimmt.' }; haptik(15); rwNeu(); } }, 'Übernehmen') : null,
        el('button', { type: 'button', class: 'knopf flach', onclick: () => { RW.hinweis = null; rwNeu(); } }, h.aend ? 'Nein, stimmt so' : 'Ok')));
  }

  // ---- Zuordnen direkt im Bon: Person oben wählen, Kasten antippen. Mehrere Stücke (3 × Cola): jeder Tipp gibt ein Stück.
  function rwZuordnenZeile(i, id) {
    const ps = RW.posten.filter((q) => q.zl === i && !q.aus), wer = RW.dabei; if (!ps.length) return;
    if (id === 'alle') { const alle = ps.every((q) => q.w.length === wer.length); ps.forEach((q) => { q.w = alle ? [] : wer.slice(); }); return; }
    if (ps.length === 1) { const q = ps[0]; q.w = q.w.includes(id) ? q.w.filter((x) => x !== id) : q.w.concat(id); return; }
    const frei = ps.find((q) => !q.w.length);
    if (frei) frei.w = [id];
    else { const mein = [...ps].reverse().find((q) => q.w.includes(id)); if (mein) mein.w = mein.w.filter((x) => x !== id); else { const l = ps[ps.length - 1]; l.w = l.w.concat(id); } }
  }
  // Bon digital: Tabelle (CSV, öffnet in Excel/LibreOffice, Semikolon + UTF-8-BOM für deutsche Einstellungen) und Volltext
  function rwExport(art) {
    if (!RW) return;
    const b = RW.bon, z = (v) => { const t = String(v ?? ''); return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; }, g = (c) => (c == null ? '' : (c / 100).toFixed(2).replace('.', ','));
    let text, name, typ;
    if (art === 'text') {
      text = (b ? b.zeilen.filter((x) => x.text).map((x) => x.text) : []).join('\n'); name = 'bon.txt'; typ = 'text/plain';
    } else {
      const zeilen = [['Nr', 'Artikel (Bon)', 'Klarname', 'Menge', 'Einzelpreis', 'Zusatz (Pfand/Rabatt)', 'Betrag', 'Steuer', 'Person(en)', 'ausgeblendet']];
      RW.posten.forEach((q, i) => { const zs = (q.zus || []).reduce((a, x) => a + x.b, 0), bp = b && q.zl != null ? b.posten.find((p) => p.zeile === q.zl) : null;
        zeilen.push([i + 1, q.t, q.k ? q.k.n : '', q.teil ? 1 : bp && bp.menge > 1 ? bp.menge : 1, g(q.teil ? q.b : bp && bp.einzel ? Math.round(bp.einzel) : q.b - zs), zs ? g(zs) : '', g(q.b), bp && bp.stb ? bp.stb : '', q.w.map(personName).join(', '), q.aus ? 'ja' : '']); });
      zeilen.push([], ['', 'Summe laut Bon', '', '', '', '', g(RW.summe)], ['', 'Summe der Posten', '', '', '', '', g(rwPostenSumme())]);
      if (RW.z) zeilen.unshift([RW.z], []);
      text = '\ufeff' + zeilen.map((r) => r.map(z).join(';')).join('\r\n'); name = `${(RW.z || 'bon').replace(/[^\wäöüÄÖÜß -]+/g, '').trim().slice(0, 40) || 'bon'}.csv`; typ = 'text/csv';
    }
    const u = URL.createObjectURL(new Blob([text], { type: typ + ';charset=utf-8' })), a = el('a', { href: u, download: name });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); haptik();
    toast(art === 'text' ? 'Text vom Bon gespeichert.' : 'Tabelle gespeichert (öffnet in Excel, LibreOffice, Numbers).');
  }
  const rwZusText = (q) => (q.zus || []).map((z) => `inkl. ${z.b < 0 ? '−' : ''}${euro(Math.abs(z.b))} ${z.art === 'pfand' ? 'Pfand' : z.art === 'rabatt' ? 'Rabatt' : z.t}`).join(' · ');
  const rwGehoert = (q, i) => q.zl === i || (q.zus || []).some((z) => z.zl === i);
  // Pfand/Rabatt/Extra einem anderen Artikel geben oder als eigenen Posten führen (die Erkennung wägt ab, entscheiden darf man selbst)
  function rwZusVerschieben(q, z, zielZl) {
    q.zus = (q.zus || []).filter((x) => x !== z); q.b -= z.b;
    const andere = [q.zl, ...(z.alt || [])].filter((x, k, a) => x != null && x !== zielZl && a.indexOf(x) === k);
    if (zielZl == null) {
      const t = z.art === 'pfand' ? 'Pfand' : z.art === 'rabatt' ? 'Rabatt' : z.t;
      RW.posten.push({ t, b: z.b, w: q.w.slice(), zl: z.zl, k: rwKlasse(t), zuKand: andere, zusArt: z.art, bestaetigt: true, sicherheit: 100 });
      RW.posten.sort((a, c) => (a.zl ?? 1e9) - (c.zl ?? 1e9));
      return;
    }
    const ziel = RW.posten.find((p) => p.zl === zielZl && !p.aus && !p.teil); if (!ziel) return;
    ziel.zus = (ziel.zus || []).concat({ ...z, alt: andere, sicher: true }); ziel.b += z.b;
  }
  function rwZuArtikel(p, zielZl) { // eigener Pfand-/Rabatt-Posten → an einen Artikel
    const ziel = RW.posten.find((x) => x.zl === zielZl && !x.aus && !x.teil); if (!ziel) return;
    RW.posten = RW.posten.filter((x) => x !== p);
    ziel.zus = (ziel.zus || []).concat({ art: p.zusArt || 'pfand', b: p.b, zl: p.zl, t: p.t, alt: (p.zuKand || []).filter((x) => x !== zielZl), sicher: true }); ziel.b += p.b;
  }
  // Name für die Wahl „gehört zu“: Klarname und Bon-Name, damit man die Zeile auf dem Bon wiederfindet
  const rwArtikelName = (zl) => { const p = RW.posten.find((x) => x.zl === zl); if (!p) return `Zeile ${zl + 1}`; const k = rwTitel({ ...p, teil: '' }); return p.t && p.k && k !== p.t ? `${k} (${p.t})` : k; };
  const rwLetztText = (i) => { const ps = RW.posten.filter((q) => q.zl === i), jetzt = [...new Set(ps.flatMap((q) => (q.aus ? [] : q.w)))]; return ps.length ? `${rwTitel({ ...ps[0], teil: '' })} → ${jetzt.length ? jetzt.map(personName).join(', ') : 'niemand'}` : ''; };
  // Leiste nach jedem Tipp im Bon: Zeilenbild zur Kontrolle (welche Zeile wurde getroffen?), ▲/▼ verschiebt die Zuordnung auf
  // den Posten darüber/darunter (schmale Zeilen: daneben tippen passiert, Korrigieren muss ein Tipp sein), Rückgängig.
  function rwBonLetztLeiste(neu) {
    const l = RW.bonLetzt, ps = RW.posten.filter((q) => q.zl === l.i);
    const reihe = [...new Set(RW.posten.filter((q) => q.zl != null && !q.aus).map((q) => q.zl))].sort((a, c) => a - c), pos = reihe.indexOf(l.i);
    const zurueck = () => RW.posten.filter((q) => q.zl === l.i && !q.aus).forEach((q, k) => { q.w = l.vorher[k] || []; });
    const schieben = (d) => {
      const ziel = reihe[pos + d]; if (ziel == null) return;
      zurueck(); const vorher = RW.posten.filter((q) => q.zl === ziel && !q.aus).map((q) => q.w.slice());
      rwZuordnenZeile(ziel, l.modus); RW.bonLetzt = { ...l, i: ziel, vorher, text: rwLetztText(ziel) }; RW.bonPop = ziel; haptik(12); neu();
      const k = document.querySelector('#rw-bon .rwb-k.pop'); if (k) k.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    return el('div', { class: 'rwb-letzt', role: 'status' },
      ps[0] && ps[0].bild ? el('img', { class: 'rwb-letzt-bild', src: ps[0].bild, alt: '', 'aria-hidden': 'true' }) : null,
      el('span', { class: 'rwb-letzt-text' }, '✓ ', l.text),
      el('span', { class: 'rwb-letzt-knoepfe' },
        l.modus ? el('button', { type: 'button', class: 'knopf flach rwb-ik', 'aria-label': 'Daneben getippt: Posten darüber nehmen', disabled: pos <= 0 ? true : null, onclick: () => schieben(-1) }, '▲') : null,
        l.modus ? el('button', { type: 'button', class: 'knopf flach rwb-ik', 'aria-label': 'Daneben getippt: Posten darunter nehmen', disabled: pos < 0 || pos >= reihe.length - 1 ? true : null, onclick: () => schieben(1) }, '▼') : null,
        el('button', { type: 'button', class: 'knopf flach', onclick: () => { zurueck(); RW.bonLetzt = null; RW.bonPop = l.i; haptik(); neu(); } }, 'Rückgängig')));
  }
  // Zoomen im Bon wie in Foto- und Karten-Apps (Apple HIG „Gestures“, Material Design „Gestures“, Stand 2026): Aufziehen mit
  // zwei Fingern, Doppeltippen (WCAG 2.5.1: Alternative mit einem Zeiger), am Rechner Strg/⌘ + Mausrad bzw. Trackpad-Zoom.
  // Die Stelle unter den Fingern bleibt stehen. Ein „Ganze Breite“-Knopf erscheint nur, solange vergrößert ist.
  // Doppeltippen auf einen Posten mit mehreren Stücken bleibt Zuordnen (jeder Tipp ein Stück).
  let rwZoomT = 0;
  function rwBonZoomGesten(roll, neu) {
    const fenster = roll && roll.querySelector('.rwb-fenster'); if (!fenster) return;
    let z = RW.bonZoom || 1;
    const setzeZoom = (nz, cx, cy) => {
      nz = Math.max(1, Math.min(4, nz)); if (Math.abs(nz - z) < 0.001) return;
      const a = fenster.getBoundingClientRect(), ax = (cx - a.left) / a.width, ay = (cy - a.top) / a.height;
      fenster.style.width = `${nz * 100}%`; z = nz;
      const b = fenster.getBoundingClientRect();
      roll.scrollLeft += b.left + ax * b.width - cx; roll.scrollTop += b.top + ay * b.height - cy;
    };
    const fertig = () => { RW.bonZoom = z; RW.bonGeste = Date.now(); neu(); };
    let p0 = null;
    const ab = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY), mi = (t) => [(t[0].clientX + t[1].clientX) / 2, (t[0].clientY + t[1].clientY) / 2];
    roll.addEventListener('touchstart', (e) => { if (e.touches.length === 2) { e.preventDefault(); p0 = { d: ab(e.touches) || 1, z, m: mi(e.touches) }; RW.bonPinch = true; roll.classList.add('zoomt'); } }, { passive: false });
    roll.addEventListener('touchmove', (e) => {
      if (!p0 || e.touches.length !== 2) return; e.preventDefault();
      const m = mi(e.touches); roll.scrollLeft -= m[0] - p0.m[0]; roll.scrollTop -= m[1] - p0.m[1]; p0.m = m;
      setzeZoom((p0.z * ab(e.touches)) / p0.d, m[0], m[1]);
    }, { passive: false });
    const ende = (e) => { if (p0 && e.touches.length < 2) { p0 = null; RW.bonPinch = false; roll.classList.remove('zoomt'); fertig(); } };
    roll.addEventListener('touchend', ende); roll.addEventListener('touchcancel', ende);
    roll.addEventListener('gesturestart', (e) => e.preventDefault()); // Safari: nicht die ganze Seite zoomen
    roll.addEventListener('wheel', (e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); setzeZoom(z * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY); clearTimeout(rwZoomT); rwZoomT = setTimeout(fertig, 200); }, { passive: false });
    // Doppeltippen: der erste Tipp hat schon zugeordnet oder ausgewählt → zurücknehmen, dann zoomen (1× ↔ 2,5×)
    roll.addEventListener('click', (e) => {
      const jetzt = Date.now();
      if (RW.bonGeste && jetzt - RW.bonGeste < 350) { e.stopPropagation(); e.preventDefault(); return; }
      // mehrere Stücke (3 × Cola): schnelles Mehrfachtippen verteilt Stücke, ist also kein Zoom
      const kk = e.target.closest && e.target.closest('.rwb-k'); if (kk && +kk.dataset.n > 1) { RW.bonTipp = null; return; }
      const l = RW.bonTipp;
      if (l && jetzt - l.t < 330 && Math.hypot(e.clientX - l.x, e.clientY - l.y) < 36) {
        e.stopPropagation(); e.preventDefault(); RW.bonTipp = null; clearTimeout(RW.bonStelleT);
        if (l.stand.w.length === RW.posten.length) l.stand.w.forEach((w, k) => { RW.posten[k].w = w; });
        RW.bonSel = l.stand.sel; RW.bonLetzt = l.stand.letzt;
        setzeZoom(z > 1.3 ? 1 : 2.5, e.clientX, e.clientY); haptik(); fertig(); return;
      }
      RW.bonTipp = { t: jetzt, x: e.clientX, y: e.clientY, stand: { w: RW.posten.map((q) => q.w.slice()), sel: RW.bonSel, letzt: RW.bonLetzt } };
    }, true);
  }
  function rwBonZeichnen(zurAuswahl) {
    const box = $('#rw-bon'); if (!box || !RW) return;
    const b = RW.bon, W = b.breite, H = b.hoehe, wer = RW.dabei, an = rwSummen();
    const alt = box.querySelector('.rwb-roll'), roll = alt ? [alt.scrollLeft, alt.scrollTop] : null;
    const neu = () => rwBonZeichnen(false);
    if (!RW.bonModus || (RW.bonModus !== 'bearbeiten' && RW.bonModus !== 'alle' && !wer.includes(RW.bonModus))) RW.bonModus = wer.includes(RW.aktiv) ? RW.aktiv : 'bearbeiten';
    const modus = RW.bonModus;
    // Ausschnitt: nur Postenblock bis Summe (Kopf und Fuß erst auf Wunsch)
    const hs = b.zeilen.filter((z) => z.b).map((z) => z.b.y1 - z.b.y0).sort((p, q) => p - q), lh = hs.length ? hs[hs.length >> 1] : H / 60;
    const wichtig = b.zeilen.map((z, i) => ({ z, i })).filter(({ z, i }) => z.b && (z.block || z.typ === 'summe' || z.typ === 'neu' || RW.posten.some((q) => rwGehoert(q, i))));
    let yA = 0, yB = H, xA = 0, xB = W;
    if (!RW.bonGanz && wichtig.length) {
      yA = Math.max(0, Math.min(...wichtig.map((o) => o.z.b.y0)) - 2.2 * lh); yB = Math.min(H, Math.max(...wichtig.map((o) => o.z.b.y1)) + 2.2 * lh);
      // Ränder links (✎) und rechts (Kürzel) frei lassen, damit nichts den gedruckten Text verdeckt
      xA = Math.min(...wichtig.map((o) => o.z.b.x0)) - 1.8 * lh; xB = Math.max(...wichtig.map((o) => o.z.b.x1)) + 3.2 * lh;
    }
    const hoch = yB - yA, breit = xB - xA;
    // Ansicht: bereinigt (wie gescannt), Original (gleicher Ausschnitt, ohne Filter) oder beide nebeneinander
    const ansicht = RW.fotoOrig ? (RW.bonAnsicht || 'scan') : 'scan';
    const flaechenStil = `top:${(-yA / hoch) * 100}%;height:${(H / hoch) * 100}%;left:${(-xA / breit) * 100}%;width:${(W / breit) * 100}%`;
    // Zoom beim Öffnen: Zeilenabstand mindestens ~30 px auf dem Bildschirm, damit jede Zeile sicher antippbar ist
    const pz = wichtig.map((o) => (o.z.b.y0 + o.z.b.y1) / 2).sort((a, c) => a - c), abst = pz.slice(1).map((y, k) => y - pz[k]).filter((d) => d > lh * 0.4).sort((a, c) => a - c);
    const pitch = abst.length ? abst[abst.length >> 1] : lh;
    // ganze Breite beim Öffnen (Name, Betrag und Kürzel sichtbar); vergrößern mit zwei Fingern, Doppeltippen oder Strg + Mausrad
    // (rwBonZoomGesten). Fehltipps zeigt die Leiste unten sofort, mit ▲/▼ zur Nachbarzeile.
    if (!RW.bonZoom) RW.bonZoom = 1;
    // Tippflächen ohne Überlappung: jede Zeile reicht bis zur Mitte zur Nachbarzeile (in Bildkoordinaten)
    const pxCss = (Math.min(innerWidth, 640) * RW.bonZoom) / breit; // Bildpixel → Bildschirmpixel
    const flaechen = new Map();
    { const lst = b.zeilen.map((z, i) => ({ z, i })).filter(({ z }) => z.b && z.b.y1 >= yA && z.b.y0 <= yB).map(({ z, i }) => ({ i, cy: (z.b.y0 + z.b.y1) / 2, h: z.b.y1 - z.b.y0 })).sort((a, c) => a.cy - c.cy);
      lst.forEach((o, j) => { const vor = lst[j - 1], nach = lst[j + 1];
        const t = vor ? Math.max((vor.cy + o.cy) / 2, o.cy - o.h * 0.9) : o.cy - o.h * 0.55, u = nach ? Math.min((o.cy + nach.cy) / 2, o.cy + o.h * 0.9) : o.cy + o.h * 0.55;
        flaechen.set(o.i, [t, u]); }); }
    const lang = { t: 0, id: 0 };
    const kaesten = !RW.bonMarken ? [] : b.zeilen.map((z, i) => {
      if (!z.b || z.b.y1 < yA || z.b.y0 > yB) return null;
      // Pfandzeile unter einem Artikel gehört zu ihm: gleicher Posten, Antippen wirkt auf die Artikelzeile
      const ps = RW.posten.filter((q) => rwGehoert(q, i)), istP = ps.length > 0, haupt = istP ? ps[0].zl : i, neben = istP && haupt !== i;
      const gruppe = istP ? [ps[0].zl, ...(ps[0].zus || []).map((x) => x.zl)].sort((a, c) => a - c) : [i];
      const gpos = gruppe.length < 2 ? '' : i === gruppe[0] ? ' g-anfang' : i === gruppe[gruppe.length - 1] ? ' g-ende' : ' g-mitte';
      const art2 = istP ? '' : z.typ === 'unklar' ? ' unklar' : z.block || z.typ === 'neu' ? ' z' : ' leise';
      const aus = istP && ps.every((q) => q.aus), leute = [...new Set(ps.flatMap((q) => (q.aus ? [] : q.w)))];
      const mix = (f) => `color-mix(in srgb, ${f} 34%, transparent)`;
      const flaeche = leute.length ? `background-image:linear-gradient(90deg, ${leute.map((id, k) => `${mix(personFarbe(id))} ${(k / leute.length) * 100}% ${((k + 1) / leute.length) * 100}%`).join(', ')});border-color:${personFarbe(leute[0])};--rand:${personFarbe(leute[0])};` : '';
      const [fy0, fy1] = flaechen.get(i) || [z.b.y0, z.b.y1];
      const stufe = istP ? ps.map(rwStufe).sort((a, c) => ['tief', 'mittel', 'hoch', ''].indexOf(a) - ['tief', 'mittel', 'hoch', ''].indexOf(c))[0] : '';
      const tippen = () => {
        if (istP && !aus && modus !== 'bearbeiten') {
          const vorher = ps.filter((q) => !q.aus).map((q) => q.w.slice()); rwZuordnenZeile(haupt, modus);
          RW.bonLetzt = { i: haupt, vorher, modus, text: rwLetztText(haupt) };
          RW.bonPop = haupt; haptik(12); neu(); return;
        }
        RW.bonSel = RW.bonSel === haupt ? null : haupt; RW.bonBlattNeu = true; haptik(); neu();
      };
      const k = el('div', { role: 'button', tabindex: '0', 'data-n': String(ps.filter((q) => !q.aus).length), class: 'rwb-k' + (istP ? ' p' : art2) + (neben ? ' neben' : '') + gpos + (aus ? ' aus' : '') + (istP && !aus && !leute.length ? ' frei' : '') + (RW.bonSel === haupt ? ' sel' : '') + (RW.bonPop === haupt ? ' pop' : '') + (stufe ? ` s-${stufe}` : ''),
        // Kästen liegen in der Fläche (ganzes Bild): Lage relativ zur ganzen Bildhöhe, der Ausschnitt verschiebt nur die Fläche
        style: `left:${(z.b.x0 / W) * 100}%;top:${(fy0 / H) * 100}%;width:${((z.b.x1 - z.b.x0) / W) * 100}%;height:${((fy1 - fy0) / H) * 100}%;--zh:${((fy1 - fy0) * pxCss).toFixed(1)}px;${flaeche}`,
        'aria-label': `${istP ? rwTitel(ps[0]) : 'Zeile'}: ${z.text}${aus ? ', ausgeblendet' : ''}${istP && modus !== 'bearbeiten' && !aus ? `. Antippen ordnet ${modus === 'alle' ? 'allen' : personName(modus)} zu` : ''}`,
        onclick: () => { if (lang.t) { lang.t = 0; return; } tippen(); },
        onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tippen(); } },
        // Lange drücken öffnet immer das Bearbeiten (auch im Zuordnen-Modus)
        onpointerdown: () => { clearTimeout(lang.id); lang.id = setTimeout(() => { if (RW.bonPinch) return; lang.t = 1; RW.bonSel = haupt; RW.bonBlattNeu = true; haptik(20); neu(); }, 480); },
        onpointerup: () => clearTimeout(lang.id), onpointerleave: () => clearTimeout(lang.id), onpointercancel: () => clearTimeout(lang.id) },
        istP && !neben && (RW.bonSel === i || (RW.bonLetzt && RW.bonLetzt.i === i)) ? el('button', { type: 'button', class: 'rwb-edit', 'aria-label': `${rwTitel(ps[0])} bearbeiten`, onclick: (e) => { e.stopPropagation(); RW.bonSel = i; RW.bonBlattNeu = true; haptik(); neu(); } }, '✎') : null,
        istP && !neben && leute.length ? el('span', { class: 'rwb-wer' }, leute.map((id) => el('span', { class: 'rw-abz', style: personStil(id) }, kuerzel(id)))) : null,
        null);
      return k;
    });
    RW.bonPop = null;
    // Auswahl: Posten bearbeiten oder Zeile übernehmen
    let blatt = null;
    if (RW.bonSel != null && b.zeilen[RW.bonSel]) {
      const i = RW.bonSel, z = b.zeilen[i], ps = RW.posten.filter((q) => q.zl === i);
      if (ps.length) {
        const q0 = ps[0], aus = ps.every((q) => q.aus);
        const nm = el('input', { type: 'text', maxlength: '40', value: q0.t, placeholder: 'Name', 'aria-label': 'Name vom Bon', autocomplete: 'off' });
        nm.addEventListener('change', () => { for (const q of ps) { q.t = nm.value.trim(); q.k = rwKlasse(q.t); } neu(); });
        const reihen = ps.map((q) => {
          // Feld zeigt den Preis der Bon-Zeile (ohne Pfand/Rabatt/Extra); so passt er zum Bild und zu den Lesungen
          const zs = (q.zus || []).reduce((a, z) => a + z.b, 0), basis = q.b - zs, vorher = basis;
          const bt = el('input', { type: 'text', inputmode: 'decimal', class: 'geld', value: centText(Math.abs(basis)), 'aria-label': `Betrag ${rwTitel(q)}${zs ? ' ohne Pfand und Rabatt' : ''}`, autocomplete: 'off' });
          bt.addEventListener('change', () => { const nb = betragLesen(bt.value) * (basis < 0 ? -1 : 1); q.b = nb + zs; if (q.b) q.offenBetrag = false; neu(); rwKorrektur(q, vorher, nb); });
          const vs = (q.vorschlag || []).filter((v) => v !== Math.abs(basis));
          return el('div', { class: 'rwb-reihe' }, ps.length > 1 ? el('span', { class: 'leise klein rwb-teil' }, q.teil || '') : null, bt, rwSicherPill(q),
            vs.length ? el('div', { class: 'rwb-vorschlag', role: 'group', 'aria-label': 'Andere Lesungen' }, el('span', { class: 'leise klein' }, 'Andere Lesung:'), vs.map((v) => { const a = rwAnteil(q, v); return el('button', { type: 'button', class: 'chip', onclick: () => { const nb = v * (basis < 0 ? -1 : 1); q.b = nb + zs; q.offenBetrag = false; haptik(); neu(); rwKorrektur(q, vorher, nb); } }, euro(v), a != null ? el('small', {}, ` ${a} %`) : null); })) : null,
            zs ? el('span', { class: 'leise klein' }, `${zs < 0 ? '−' : '+'} ${euro(Math.abs(zs))} (${(q.zus || []).map((z) => (z.art === 'pfand' ? 'Pfand' : z.art === 'rabatt' ? 'Rabatt' : z.t)).join(', ')}) = ${euro(q.b)}`) : null,
            el('div', { class: 'rwb-leute', role: 'group', 'aria-label': 'Wer hatte das' }, wer.map((id) => el('button', { type: 'button', class: 'rwb-p', style: personStil(id), 'aria-pressed': String(q.w.includes(id)),
              onclick: () => { q.w = q.w.includes(id) ? q.w.filter((x) => x !== id) : q.w.concat(id); q.aus = false; RW.bonPop = i; haptik(); neu(); } }, kuerzel(id)))));
        });
        blatt = el('div', { class: 'rwb-blatt' + (RW.bonBlattNeu ? ' neu' : '') },
          el('div', { class: 'rwb-titel' }, q0.k ? el('span', { class: 'rw-sym', 'aria-hidden': 'true' }, q0.k.s) : null, el('strong', {}, rwTitel({ ...q0, teil: '' })),
            el('button', { type: 'button', class: 'knopf flach rwb-zu', 'aria-label': 'Schließen', onclick: () => { RW.bonSel = null; neu(); } }, '✕'),
            el('span', { class: 'leise klein rwb-text' }, z.text)),
          // Zusatzzeilen (Pfand, Rabatt, Extra): gehört zu diesem Artikel, einem anderen oder ist ein eigener Posten
          ...(q0.zus || []).map((zz) => el('div', { class: 'rwb-zus', role: 'group', 'aria-label': `${zz.art === 'pfand' ? 'Pfand' : zz.art === 'rabatt' ? 'Rabatt' : 'Extra'} gehört zu` },
            el('span', { class: 'leise klein' }, `${zz.art === 'pfand' ? 'Pfand' : zz.art === 'rabatt' ? 'Rabatt' : zz.t} ${zz.b < 0 ? '−' : ''}${euro(Math.abs(zz.b))} gehört zu:`),
            el('button', { type: 'button', class: 'chip', 'aria-pressed': 'true' }, rwArtikelName(q0.zl)),
            (zz.alt || []).filter((zl) => RW.posten.some((x) => x.zl === zl && !x.aus && !x.teil)).map((zl) => el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', onclick: () => { rwZusVerschieben(q0, zz, zl); RW.bonSel = zl; RW.bonPop = zl; haptik(12); neu(); } }, rwArtikelName(zl))),
            el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', onclick: () => { rwZusVerschieben(q0, zz, null); RW.bonSel = zz.zl; haptik(12); neu(); } }, 'Eigener Posten'))),
          q0.zuKand && q0.zuKand.length ? el('div', { class: 'rwb-zus', role: 'group', 'aria-label': 'Gehört zu Artikel' },
            el('span', { class: 'leise klein' }, `${q0.zusArt === 'rabatt' ? 'Rabatt' : q0.zusArt === 'extra' ? 'Extra' : 'Pfand'} einem Artikel zuordnen:`),
            q0.zuKand.filter((zl) => RW.posten.some((x) => x.zl === zl && !x.aus && !x.teil)).map((zl) => el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', onclick: () => { rwZuArtikel(q0, zl); RW.bonSel = zl; RW.bonPop = zl; haptik(12); neu(); } }, rwArtikelName(zl)))) : null,
          el('label', { class: 'leise klein' }, 'Name vom Bon (für die Erkennung „Was war es?“)'), nm, ...reihen,
          el('div', { class: 'reihe' },
            el('button', { type: 'button', class: 'knopf', onclick: () => { for (const q of ps) q.aus = !aus; haptik(); neu(); } }, aus ? 'Einblenden' : 'Ausblenden'),
            el('button', { type: 'button', class: 'knopf warn', onclick: () => {
              const weg = RW.posten.map((q, k) => [k, q]).filter(([, q]) => q.zl === i);
              RW.posten = RW.posten.filter((q) => q.zl !== i); RW.bonSel = null; neu();
              toast('Posten gelöscht.', { aktion: 'Rückgängig', fn: () => { for (const [k, q] of weg) RW.posten.splice(k, 0, q); if ($('#rw-bon')) neu(); else rwZeichnen(false); } });
            } }, ic('aus'), 'Löschen')),
          el('p', { class: 'leise klein' }, aus ? 'Ausgeblendet: zählt nicht zur Rechnung.' : 'Ausblenden, wenn die Zeile kein Posten ist (z. B. Zwischensumme). Änderst du einen Betrag, prüft die App die anderen Posten mit derselben Ziffer nach.'));
      } else {
        let v = rwBetragAus(z.text);
        if (!v && z.b) { const { pitch } = rwRaster(), cy = (z.b.y0 + z.b.y1) / 2; const nb = b.zeilen.filter((o) => o !== z && o.b && o.text && Math.abs((o.b.y0 + o.b.y1) / 2 - cy) < 0.4 * pitch && rwBetragAus(o.text)); if (nb.length) v = rwBetragAus(nb[0].text); }
        const bt = el('input', { type: 'text', inputmode: 'decimal', class: 'geld', value: v ? centText(Math.abs(v)) : '', placeholder: '0,00', 'aria-label': 'Betrag', autocomplete: 'off' });
        blatt = el('div', { class: 'rwb-blatt' + (RW.bonBlattNeu ? ' neu' : '') }, el('div', { class: 'rwb-titel' }, el('strong', {}, z.text ? 'Diese Zeile ist noch kein Posten' : 'Zeile wird gelesen …'),
            el('button', { type: 'button', class: 'knopf flach rwb-zu', 'aria-label': 'Schließen', onclick: () => { RW.bonSel = null; neu(); } }, '✕'), el('span', { class: 'leise klein rwb-text' }, z.text)),
          bt, el('button', { type: 'button', class: 'knopf haupt breit', onclick: () => {
            const c = betragLesen(bt.value); if (!c) { toast('Bitte einen Betrag eingeben.'); return; }
            const t = rwNameAus(z.text);
            const q = { t, b: c * (v < 0 ? -1 : 1), w: modus !== 'bearbeiten' && modus !== 'alle' ? [modus] : modus === 'alle' ? wer.slice() : [], zl: i, k: rwKlasse(t), pruef: '', bestaetigt: true, sicherheit: 100 };
            RW.posten.push(q); RW.posten.sort((a, b2) => (a.zl ?? 1e9) - (b2.zl ?? 1e9)); RW.bonSel = null; RW.bonPop = i; haptik(12); neu();
            rwSchnipsel(i).then((d) => { q.bild = d; if ($('#rw-bon')) neu(); });
          } }, ic('plus'), 'Als Posten übernehmen'));
      }
    }
    RW.bonBlattNeu = false;
    const S2 = rwPostenSumme(), diff = RW.summe - S2 - (RW.tipArt === '€' ? RW.tip : 0) - RW.posten.filter((q) => q.kaution && q.aus).reduce((a, q) => a + q.b, 0);
    rwMerken();
    const leiste = el('div', { class: 'rwb-leiste', role: 'group', 'aria-label': 'Antippen im Bon ordnet zu für' },
      wer.map((id) => el('button', { type: 'button', class: 'rwb-pers', style: personStil(id), 'aria-pressed': String(modus === id), onclick: () => { RW.bonModus = id; RW.aktiv = id; RW.bonSel = null; haptik(); neu(); } }, el('b', {}, kuerzel(id)), el('small', {}, euro(an[id] || 0)))),
      el('button', { type: 'button', class: 'rwb-pers alle', 'aria-pressed': String(modus === 'alle'), onclick: () => { RW.bonModus = 'alle'; RW.aktiv = 'alle'; RW.bonSel = null; haptik(); neu(); } }, el('b', {}, 'Alle'), el('small', {}, 'geteilt')),
      el('button', { type: 'button', class: 'rwb-pers bearb', 'aria-pressed': String(modus === 'bearbeiten'), onclick: () => { RW.bonModus = 'bearbeiten'; haptik(); neu(); }, 'aria-label': 'Bearbeiten: Kasten antippen öffnet die Bearbeitung' }, el('b', {}, '✎'), el('small', {}, 'Ändern')));
    setze(box,
      el('div', { class: 'rwb-kopf' },
        el('button', { type: 'button', class: 'ik-knopf', onclick: () => rwBonZu(), 'aria-label': 'Zurück zur Liste der Posten', title: 'Liste' }, ic('zurueck')),
        rwVerlaufKnoepfe(),
        el('span', { class: 'rwb-luecke' }),
        el('button', { type: 'button', class: 'ik-knopf', 'aria-pressed': String(!!RW.bonGanz), 'aria-label': RW.bonGanz ? 'Nur Posten zeigen' : 'Ganzen Bon zeigen (Kopf und Fuß)', title: 'Ganzer Bon', onclick: () => { RW.bonGanz = !RW.bonGanz; neu(); } }, ic('ganz')),
        el('button', { type: 'button', class: 'ik-knopf', 'aria-pressed': String(RW.bonMarken), 'aria-label': RW.bonMarken ? 'Kästen ausblenden' : 'Kästen einblenden', title: 'Kästen', onclick: () => { RW.bonMarken = !RW.bonMarken; neu(); } }, ic('kaesten')),
        el('button', { type: 'button', class: 'rw-sichern', onclick: rwZwischenspeichern, 'aria-label': 'Speichern und schließen – später weitermachen' }, ic('sichern'), 'Speichern')),
      leiste,
      RW.fotoOrig ? el('div', { class: 'rwb-ansicht segment', role: 'radiogroup', 'aria-label': 'Bild' }, [['scan', 'Bereinigt'], ['orig', 'Original'], ['beide', 'Nebeneinander']].map(([k, t]) => el('button', { type: 'button', class: 'segment-teil', role: 'radio', 'aria-checked': String(ansicht === k), 'aria-pressed': String(ansicht === k), onclick: () => { RW.bonAnsicht = k; haptik(); neu(); } }, t))) : null,
      el('div', { class: 'rwb-bereich' }, el('div', { class: 'rwb-roll' },
        !RW.bonGanz && yA > 0 ? el('button', { type: 'button', class: 'rwb-mehr', onclick: () => { RW.bonGanz = true; neu(); } }, '↑ Kopf des Bons zeigen') : null,
        el('div', { class: 'rwb-fenster' + (ansicht === 'beide' ? ' beide' : ''), style: `width:${RW.bonZoom * 100}%;aspect-ratio:${breit * (ansicht === 'beide' ? 2 : 1)} / ${hoch}` },
          ansicht === 'beide' ? el('div', { class: 'rwb-halb orig', 'aria-label': 'Original' }, el('div', { class: 'rwb-flaeche', style: flaechenStil }, el('img', { src: RW.fotoOrig, alt: 'Original-Bon ohne Bereinigung', draggable: 'false' }))) : null,
          el('div', { class: 'rwb-halb' }, el('div', { class: 'rwb-flaeche', style: flaechenStil },
            // leere Stelle: erst nach kurzer Wartezeit lesen (ein zweiter Tipp ist Doppeltippen = Zoom)
            el('img', { src: ansicht === 'orig' ? RW.fotoOrig : RW.foto, alt: ansicht === 'orig' ? 'Original-Bon' : 'Bon bereinigt', draggable: 'false', onclick: (e) => { const y = (e.offsetY / e.currentTarget.clientHeight) * H; clearTimeout(RW.bonStelleT); RW.bonStelleT = setTimeout(() => rwBonStelle(y), 330); } }), ...kaesten.filter(Boolean)))),
        !RW.bonGanz && yB < H ? el('button', { type: 'button', class: 'rwb-mehr', onclick: () => { RW.bonGanz = true; neu(); } }, '↓ Fuß des Bons zeigen') : null),
        RW.bonZoom > 1.05 ? el('button', { type: 'button', class: 'rwb-zoom-zurueck', 'aria-label': 'Zoom zurücksetzen, ganze Breite zeigen', onclick: () => { RW.bonZoom = 1; haptik(); neu(); } }, '⤢ Ganze Breite') : null),
      el('div', { class: 'rwb-unten' }, rwHinweis(),
        el('p', { class: 'rwb-stand ' + (diff === 0 ? 'ok' : 'warn'), role: 'status' }, diff === 0 ? `✓ Posten ergeben ${euro(RW.summe)}, wie auf dem Bon` : diff > 0 ? `Posten ${centText(S2)} € – es fehlen ${euro(diff)} zu ${euro(RW.summe)}` : `Posten ${centText(S2)} € – ${euro(-diff)} mehr als der Bon`),
        !blatt && RW.bonLetzt ? rwBonLetztLeiste(neu) : null,
        blatt || el('p', { class: 'rwb-hilfe leise klein' }, !RW.bonMarken ? 'Kästen sind aus. Oben wieder einschalten.' : modus === 'bearbeiten' ? 'Kasten antippen: korrigieren, ausblenden, löschen. Leere Stelle antippen: Zeile neu lesen. Zoomen: zwei Finger oder doppelt tippen.' : `Kasten antippen ordnet ${modus === 'alle' ? 'allen' : personName(modus)} zu. Lange drücken oder ✎: bearbeiten. Zoomen: zwei Finger oder doppelt tippen.`)));
    const r = box.querySelector('.rwb-roll');
    if (roll) { r.scrollLeft = roll[0]; r.scrollTop = roll[1]; }
    rwBonZoomGesten(r, neu);
    if (zurAuswahl && RW.bonSel != null) { const k = box.querySelector('.rwb-k.sel'); if (k) requestAnimationFrame(() => k.scrollIntoView({ block: 'center', inline: 'nearest' })); }
  }
  // ---- Schritt 4: Wer hat bezahlt, Speichern
  function rwForm() {
    return RW.modus === 'posten'
      ? { art: 'posten', b: 0, posten: RW.posten.filter((q) => q.b && !q.aus).map((q) => ({ ...q, t: rwSpeichername(q) })), tipArt: RW.tipArt, tip: RW.tip, v: RW.v, mehr: RW.mehr, zahler: RW.zahler, f: [] }
      : { art: 'gleich', b: RW.summe, f: RW.dabei, v: RW.v, mehr: RW.mehr, zahler: RW.zahler };
  }
  function rwZahler() {
    const alle = personenListe();
    const r = berechne(rwForm());
    const kopf = r.an ? el('ul', { class: 'rw-ergebnis' }, Object.entries(r.an).sort((a, c) => personName(a[0]).localeCompare(personName(c[0]), 'de')).map(([id, c]) => el('li', {}, el('span', {}, personPunkt(id), personName(id)), el('b', {}, euro(c))))) : null;
    const gesamt = r.b || RW.summe;
    const zahler = RW.mehr
      ? el('ul', { class: 'k-zeilen' }, alle.map((id) => { const i = el('input', { type: 'text', inputmode: 'decimal', class: 'geld', placeholder: '0,00', value: centText(RW.zahler[id] || 0), 'aria-label': `${personName(id)} hat bezahlt`, autocomplete: 'off' });
        i.addEventListener('input', () => { RW.zahler[id] = betragLesen(i.value); const rr = berechne(rwForm()); const m = $('#rw-meldung'); if (m) m.textContent = rr.fehler || '✓ Passt.'; const b = $('.rw-weiter'); if (b) b.disabled = !!rr.fehler; });
        return el('li', {}, el('span', {}, personName(id)), i); }))
      : el('div', { class: 'chips wrap', role: 'radiogroup', 'aria-label': 'Bezahlt von' }, alle.map((id) => el('button', { type: 'button', class: 'chip', role: 'radio', 'aria-checked': String(RW.v === id), 'aria-pressed': String(RW.v === id), onclick: () => { RW.v = id; haptik(); rwZeichnen(false); } }, personName(id))));
    const speichern = el('button', { type: 'button', class: 'knopf haupt breit rw-weiter', disabled: r.fehler ? true : null, onclick: () => {
      const rr = berechne(rwForm());
      if (rr.fehler) { toast(rr.fehler); return; }
      const f = rwForm();
      const v = Object.entries(rr.za).sort((a, c) => c[1] - a[1])[0][0];
      const id = kostenSpeichern({ v, b: rr.b, z: RW.z, f: Object.keys(rr.an), an: rr.an, za: rr.za, art: f.art,
        pos: f.art === 'posten' ? f.posten.filter((q) => q.b > 0).map((q) => [q.t, q.b, q.w]) : null, tip: f.art === 'posten' && f.tip ? [f.tipArt, f.tip] : null });
      if (RW.foto) fotoSpeichern(id, RW.foto);
      rwEntwurfWeg(RW.id);
      rwSchliessen(false); RW_ALT = null;
      S.tab = 'gruppe'; S.gTeil = 'kosten'; speicher.set('tab', 'gruppe'); speicher.set('gTeil', 'kosten'); S.kostenForm = null; haptik(15); hoehe('gross'); zeichne({ karte: false });
      toast(`${euro(rr.b)} gespeichert.`, { aktion: 'Rückgängig', fn: () => { kostenLoeschen(id, true); zeichne({ scroll: true, karte: false }); } });
    } }, r.fehler ? 'Bitte prüfen' : `Ausgabe eintragen · ${euro(gesamt)}`);
    return { inhalt: el('div', { class: 'rw-inhalt' },
      el('h3', { class: 'rw-h' }, 'Das zahlt jede Person'), kopf,
      el('h3', { class: 'rw-h' }, 'Wer hat bezahlt?'),
      RW.bon && RW.bon.anzahlung ? el('p', { class: 'rw-warn' }, `Laut Beleg wurden ${euro(RW.bon.anzahlung)} schon angezahlt. Hat jemand anderes die Anzahlung bezahlt, „Mehrere Personen haben bezahlt“ wählen und beide Beträge eintragen.`) : null,
      zahler,
      el('button', { type: 'button', class: 'knopf flach', style: 'justify-self:start', onclick: () => { RW.mehr = !RW.mehr; if (RW.mehr && !Object.keys(RW.zahler).length) RW.zahler = {}; rwZeichnen(false); } }, RW.mehr ? 'Nur eine Person hat bezahlt' : 'Mehrere Personen haben bezahlt'),
      el('p', { id: 'rw-meldung', class: r.fehler ? 'k-fehler' : 'k-ok', role: 'status' }, r.fehler || '✓ Alle Cent sind verteilt.')),
      fuss: el('div', { class: 'rw-fuss' }, speichern) };
  }

  // ---------- Kassenzettel erkennen und im Bild korrigieren (bon.js) ----------
  async function bonLesen(f) {
    const neu = () => { if (S.kostenForm === f) zeichne({ scroll: true, karte: false }); };
    const status = (t) => { S.bonStatus = t; const e = $('.bon-status'); if (e) e.textContent = t; else neu(); };
    status('Texterkennung startet …');
    try {
      if (!window.Bon) await new Promise((ok, fehler) => { const sc = document.createElement('script'); sc.src = 'bon.js'; sc.onload = ok; sc.onerror = fehler; document.head.append(sc); });
      const r = await window.Bon.erkenne(f.foto, (m) => {
        const pz = Math.round((m.progress || 0) * 100);
        if (/paddle/.test(m.status || '') && /load/.test(m.status || '')) status(`Erkennung wird geladen (einmalig, etwa 28 MB, danach offline) … ${pz} %`);
        else if (/load|initial/i.test(m.status || '')) status(`Erkennung wird geladen (einmalig, etwa 5 MB) … ${pz} %`);
        else if (/nachlesen/.test(m.status || '')) status(`Beträge werden zur Sicherheit mehrfach gelesen … ${pz} %`);
        else if (/recogniz/i.test(m.status || '')) status(`Bon wird gelesen … ${pz} %`);
      });
      f.bon = r; f.foto = r.bild; f.bonTotal = r.qr ? r.qr.total : r.total; f.bonWahl = null; f.trotzdem = false;
      f.posten = r.posten.length ? r.posten.map((p2) => ({ t: p2.t, b: p2.b, w: [], z: p2.zeile, c: p2.c })) : [{ t: '', b: 0, w: [] }];
      S.bonStatus = null; haptik(12);
      const soll = f.bonTotal;
      toast(soll != null && r.summe === soll ? `${r.posten.length} Posten erkannt, Summe stimmt${r.qr ? ' mit dem QR-Code' : ' mit dem Bon'} überein.` : `${r.posten.length} Posten erkannt. Bitte im Bild prüfen.`);
    } catch (e) {
      S.bonStatus = 'Erkennung nicht möglich. Posten bitte von Hand eintragen.';
    }
    neu();
    // Ergebnis ins Bild holen: Das Foto steht weiter oben, die erkannten Posten sind das, was jetzt zählt
    setTimeout(() => { const e = $('.bon'); if (e && S.kostenForm === f) e.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }, 80);
  }
  function bonAnsicht(f, neu) {
    const r = f.bon, zoom = f.bonZoom || 1;
    const ist = f.posten.reduce((a, q) => a + (q.b || 0), 0), soll = f.bonTotal;
    const passt = soll != null && ist === soll;
    const flaeche = el('div', { class: 'bon-flaeche', style: `width:${zoom * 100}%` }, el('img', { src: f.foto, alt: 'Kassenzettel', draggable: 'false' }));
    r.zeilen.forEach((z, i) => {
      const pi = f.posten.findIndex((q) => q.z === i);
      const typ = pi >= 0 ? ((f.posten[pi].c || 100) < 70 ? 'unsicher' : 'posten') : z.typ === 'summe' ? 'summe' : z.typ === 'teil' ? 'teil' : 'sonst';
      const b = z.b, w = r.breite, h = r.hoehe;
      flaeche.append(el('button', { type: 'button', class: `bon-box ${typ}${f.bonWahl === i ? ' wahl' : ''}`, 'aria-label': `Zeile: ${z.text}`,
        style: `left:${(b.x0 / w) * 100}%;top:${(b.y0 / h) * 100}%;width:${((b.x1 - b.x0) / w) * 100}%;height:${((b.y1 - b.y0) / h) * 100}%`,
        onclick: () => { f.bonWahl = f.bonWahl === i ? null : i; haptik(); neu(); } }, pi >= 0 ? el('span', { class: 'bon-betrag' }, `${f.posten[pi].b < 0 ? '−' : ''}${euro(f.posten[pi].b)}`) : null));
    });
    // Gewählte Zeile bearbeiten
    let panel = null;
    if (f.bonWahl != null && r.zeilen[f.bonWahl]) {
      const z = r.zeilen[f.bonWahl], pi = f.posten.findIndex((q) => q.z === f.bonWahl);
      if (z.typ === 'summe') {
        const i2 = el('input', { type: 'text', inputmode: 'decimal', class: 'geld', value: centText(f.bonTotal || 0), 'aria-label': 'Summe laut Bon' });
        i2.addEventListener('input', () => { f.bonTotal = betragLesen(i2.value) || null; });
        panel = el('div', { class: 'bon-panel' }, el('small', {}, `Erkannt: „${z.text}“`), el('strong', {}, 'Summe laut Bon'), el('div', { class: 'feld' }, i2, el('button', { type: 'button', class: 'knopf haupt', onclick: () => { f.bonWahl = null; neu(); } }, 'OK')));
      } else if (pi >= 0) {
        const q = f.posten[pi];
        const tx = el('input', { type: 'text', value: q.t, maxlength: '40', 'aria-label': 'Bezeichnung' }); tx.addEventListener('input', () => { q.t = tx.value; });
        const bt = el('input', { type: 'text', inputmode: 'decimal', class: 'geld', value: centText(q.b), 'aria-label': 'Betrag' }); bt.addEventListener('input', () => { q.pruef = ''; q.b = betragLesen(bt.value) * (bt.value.trim().startsWith('-') ? -1 : 1); q.c = 100; });
        panel = el('div', { class: 'bon-panel' }, el('small', {}, `Erkannt: „${z.text}“`),
          el('div', { class: 'feld' }, bt, tx),
          el('div', { class: 'chips' }, personenListe().map((id) => el('button', { type: 'button', class: 'chip', 'aria-pressed': String(q.w.includes(id)), onclick: () => { q.w = q.w.includes(id) ? q.w.filter((x) => x !== id) : q.w.concat(id); haptik(); neu(); } }, personName(id)))),
          el('div', { class: 'reihe' }, el('button', { type: 'button', class: 'knopf warn', onclick: () => { f.posten.splice(pi, 1); f.bonWahl = null; neu(); } }, 'Kein Posten'),
            el('button', { type: 'button', class: 'knopf haupt', onclick: () => { f.bonWahl = null; neu(); } }, 'Fertig')));
      } else {
        const zahlen = (z.text.match(/-?\d{1,3}(?:[.\s]\d{3})*[,.]\d{2}/g) || []);
        panel = el('div', { class: 'bon-panel' }, el('small', {}, `Erkannt: „${z.text}“`), el('span', {}, 'Diese Zeile ist kein Posten.'),
          el('div', { class: 'reihe' }, el('button', { type: 'button', class: 'knopf haupt', onclick: () => {
            const b0 = zahlen.length ? window.Bon.cent(zahlen[zahlen.length - 1]) : 0;
            f.posten = f.posten.filter((q) => q.b || q.t); f.posten.push({ t: z.text.replace(/-?\d{1,3}(?:[.\s]\d{3})*[,.]\d{2}.*$/, '').trim().slice(0, 40) || 'Posten', b: b0, w: [], z: f.bonWahl, c: 100 });
            f.posten.sort((a, c) => (a.z ?? 1e9) - (c.z ?? 1e9)); neu();
          } }, 'Als Posten übernehmen'), el('button', { type: 'button', class: 'knopf', onclick: () => { f.bonWahl = null; neu(); } }, 'Schließen')));
      }
    }
    const offen = f.posten.filter((q) => q.b && !q.w.length).length;
    return el('div', { class: 'bon' },
      r.qr ? el('p', { class: 'bon-qr' }, `QR-Code gelesen: Gesamtbetrag ${euro(r.qr.total)} (vom Kassensystem, sicher)${r.total != null && r.total !== r.qr.total ? `. Die Texterkennung hatte ${euro(r.total)} gelesen.` : '.'}`) : null,
      el('div', { class: 'bon-probe ' + (passt ? 'ok' : 'warn') }, passt
        ? `✓ Posten zusammen ${euro(ist)} = Summe ${r.qr && f.bonTotal === r.qr.total ? 'im QR-Code' : 'auf dem Bon'}.`
        : soll != null ? `Posten ${euro(ist)}, Bon ${euro(soll)}: ${euro(Math.abs(soll - ist))} ${ist < soll ? 'fehlen' : 'zu viel'}. Tippe im Bild auf graue Zeilen oder korrigiere Beträge.`
          : 'Summe auf dem Bon nicht gefunden. Tippe im Bild auf die TOTAL-Zeile oder trag sie ein.'),
      soll == null ? (() => { const i3 = el('input', { type: 'text', inputmode: 'decimal', class: 'geld', placeholder: 'Summe laut Bon', 'aria-label': 'Summe laut Bon' }); i3.addEventListener('change', () => { f.bonTotal = betragLesen(i3.value) || null; neu(); }); return el('div', { class: 'feld' }, i3); })() : null,
      el('div', { class: 'bon-werkzeug' },
        el('span', { class: 'klein leise' }, 'Grün: Posten · Orange: unsicher · Blau: Summe · Grau: kein Posten'),
        el('span', { class: 'reihe' }, el('button', { type: 'button', class: 'haken', 'aria-label': 'Bild kleiner', onclick: () => { f.bonZoom = Math.max(1, zoom - 0.5); neu(); } }, '−'),
          el('button', { type: 'button', class: 'haken', 'aria-label': 'Bild größer', onclick: () => { f.bonZoom = Math.min(3, zoom + 0.5); neu(); } }, '+'))),
      el('div', { class: 'bon-ansicht' }, flaeche),
      panel,
      offen ? el('div', { class: 'reihe' }, el('span', { class: 'klein' }, `${offen} ${offen === 1 ? 'Posten ist' : 'Posten sind'} noch niemandem zugeordnet.`),
        el('button', { type: 'button', class: 'knopf', onclick: () => { const alle = personenListe(); f.posten.forEach((q) => { if (q.b && !q.w.length) q.w = alle.slice(); }); neu(); } }, 'Rest: alle teilen')) : null,
      f.trotzdem === 'frage' ? el('button', { type: 'button', class: 'knopf warn breit', onclick: () => { f.trotzdem = true; neu(); } }, 'Trotzdem speichern (Summe weicht ab)') : null);
  }

  const leerForm = () => ({ art: 'gleich', b: 0, z: '', v: G.ich.id, mehr: false, zahler: {}, f: personenListe(), betraege: {}, anteile: Object.fromEntries(personenListe().map((id) => [id, 1])), posten: [{ t: '', b: 0, w: [] }], tipArt: '%', tip: 0, foto: null });
  function formAus(id, x) {
    const f = leerForm();
    Object.assign(f, { id, art: x.art || 'gleich', b: x.b, z: x.z, v: x.v, f: x.f.slice() });
    if (x.za && Object.keys(x.za).length > 1) { f.mehr = true; f.zahler = { ...x.za }; }
    if (x.art === 'betrag' && x.an) f.betraege = { ...x.an };
    if (x.art === 'anteile' && x.an) { const kl = Math.min(...Object.values(x.an)); f.anteile = Object.fromEntries(Object.entries(x.an).map(([k, c]) => [k, Math.max(1, Math.round(c / kl))])); }
    if (x.art === 'posten' && x.pos) { f.posten = x.pos.map(([t, b, w]) => ({ t, b, w: w.slice() })); if (x.tip) { f.tipArt = x.tip[0]; f.tip = x.tip[1]; } }
    return f;
  }
  // Rechnet das Formular durch: Gesamtbetrag, Anteile je Person (Cent), Zahler je Person (Cent) oder ein Fehlertext
  function berechne(f) {
    let b = f.b, an;
    if (f.art === 'posten') {
      const items = f.posten.filter((q) => q.b);
      if (!items.length) return { fehler: 'Trag die Posten vom Kassenzettel ein.' };
      const ohne = f.posten.findIndex((q) => q.b && !q.w.length);
      if (ohne >= 0) return { fehler: `Posten ${ohne + 1} (${f.posten[ohne].t || 'ohne Namen'}): Wer hatte das? Personen antippen.` };
      an = {};
      // Rabatte (negative Posten) mindern die Anteile der Getippten
      for (const q of items) for (const [id, c] of Object.entries(verteile(Math.abs(q.b), q.w.map((id) => [id, 1])))) an[id] = (an[id] || 0) + Math.sign(q.b) * c;
      const summe = items.reduce((a, q) => a + q.b, 0);
      if (summe <= 0) return { fehler: 'Die Summe der Posten muss größer als 0 sein.' };
      if (Object.values(an).some((c) => c < 0)) return { fehler: 'Ein Rabatt ist größer als die Posten dieser Person. Bitte Personen prüfen.' };
      const tip = f.tipArt === '%' ? Math.round((summe * (f.tip || 0)) / 100) : Math.round(f.tip || 0);
      if (tip > 0) for (const [id, c] of Object.entries(verteile(tip, Object.entries(an).filter(([, w]) => w > 0)))) an[id] += c;
      for (const id of Object.keys(an)) if (!an[id]) delete an[id];
      b = summe + Math.max(0, tip);
    } else {
      if (!b) return { fehler: 'Bitte den Betrag eingeben, z. B. 12,50.' };
      if (f.art === 'betrag') {
        an = {}; let s2 = 0;
        for (const [id, c] of Object.entries(f.betraege)) if (c > 0) { an[id] = c; s2 += c; }
        if (s2 !== b) return { fehler: s2 < b ? `Noch ${euro(b - s2)} zu verteilen.` : `${euro(s2 - b)} zu viel verteilt.` };
      } else if (f.art === 'anteile') {
        const g = Object.entries(f.anteile).filter(([, w]) => w > 0);
        if (!g.length) return { fehler: 'Mindestens eine Person braucht einen Anteil.' };
        an = verteile(b, g);
      } else {
        if (!f.f.length) return { fehler: 'Für wen? Mindestens eine Person wählen.' };
        an = verteile(b, f.f.map((id) => [id, 1]));
      }
    }
    let za;
    if (f.mehr) {
      za = {}; let s2 = 0;
      for (const [id, c] of Object.entries(f.zahler)) if (c > 0) { za[id] = c; s2 += c; }
      if (s2 !== b) return { b, an, fehler: s2 < b ? `Bezahlt sind erst ${euro(s2)} von ${euro(b)}.` : `Bezahlt ist ${euro(s2 - b)} mehr als ${euro(b)}.` };
    } else za = { [f.v]: b };
    return { b, an, za };
  }
  const centText = (c) => (c ? (c / 100).toFixed(2).replace('.', ',') : '');
  function kostenForm() {
    const f = S.kostenForm;
    const alle = personenListe();
    const neu = () => zeichne({ scroll: true, karte: false });
    const vorschau = el('div', { class: 'k-vorschau', 'aria-live': 'polite' });
    const aktualisiere = () => {
      const r = berechne(f);
      const zeilen = r.an ? Object.entries(r.an).sort((a, c) => personName(a[0]).localeCompare(personName(c[0]), 'de')).map(([id, c]) => el('li', {}, el('span', {}, personPunkt(id), personName(id)), el('b', {}, euro(c)))) : [];
      setze(vorschau, r.b ? el('strong', {}, `Summe ${euro(r.b)}`) : null, zeilen.length ? el('ul', {}, zeilen) : null, r.fehler ? el('p', { class: 'k-fehler' }, r.fehler) : el('p', { class: 'k-ok' }, 'Passt. Alle Cent sind verteilt.'));
    };
    const geldFeld = (wert, setz, label) => {
      const i = el('input', { type: 'text', inputmode: 'decimal', placeholder: '0,00', value: centText(wert), 'aria-label': label, autocomplete: 'off', class: 'geld' });
      i.addEventListener('input', () => { setz(betragLesen(i.value)); aktualisiere(); });
      return i;
    };
    const personChips = (gewaehlt, umschalten) => el('div', { class: 'chips' }, alle.map((id) => el('button', { type: 'button', class: 'chip', 'aria-pressed': String(gewaehlt.includes(id)), onclick: () => { umschalten(id); haptik(); neu(); } }, personName(id))));
    const arten = el('div', { class: 'segmente', role: 'group', 'aria-label': 'Aufteilen' },
      [['gleich', 'Gleich'], ['betrag', 'Beträge'], ['anteile', 'Anteile']].concat(f.id && f.art === 'posten' ? [['posten', 'Posten']] : []).map(([id, n]) => el('button', { type: 'button', 'aria-pressed': String(f.art === id), onclick: () => { f.art = id; haptik(); neu(); } }, n)));
    const erklaerung = { gleich: 'Gleich auf die gewählten Personen.', betrag: 'Jede Person zahlt einen festen Betrag.', anteile: 'Nach Anteilen, z. B. ein Paar = 2.', posten: 'Nach Kassenzettel: Wer hatte was? Geteilte Posten gehen gleich auf alle Getippten.' }[f.art];
    let teil;
    if (f.art === 'gleich') {
      teil = [el('div', { style: 'display:flex;justify-content:space-between;align-items:center' }, el('span', { class: 'klein leise' }, 'Für wen'),
        el('button', { type: 'button', class: 'knopf flach', style: 'min-height:44px;padding:0 8px', onclick: () => { f.f = f.f.length === alle.length ? [] : alle.slice(); neu(); } }, f.f.length === alle.length ? 'Keine' : 'Alle')),
      personChips(f.f, (id) => { f.f = f.f.includes(id) ? f.f.filter((x) => x !== id) : f.f.concat(id); })];
    } else if (f.art === 'betrag') {
      teil = el('ul', { class: 'k-zeilen' }, alle.map((id) => el('li', {}, el('span', {}, personName(id)), geldFeld(f.betraege[id] || 0, (c) => { f.betraege[id] = c; }, `Betrag für ${personName(id)}`))));
    } else if (f.art === 'anteile') {
      teil = el('ul', { class: 'k-zeilen' }, alle.map((id) => el('li', {}, el('span', {}, personName(id)),
        el('span', { class: 'stepper' },
          el('button', { type: 'button', class: 'haken', 'aria-label': `Anteil ${personName(id)} weniger`, onclick: () => { f.anteile[id] = Math.max(0, (f.anteile[id] || 0) - 1); haptik(); neu(); } }, '−'),
          el('b', { 'aria-label': `Anteil ${personName(id)}` }, String(f.anteile[id] || 0)),
          el('button', { type: 'button', class: 'haken', 'aria-label': `Anteil ${personName(id)} mehr`, onclick: () => { f.anteile[id] = Math.min(20, (f.anteile[id] || 0) + 1); haptik(); neu(); } }, '+')))));
    } else {
      const datei = el('input', { type: 'file', accept: 'image/*', capture: 'environment', hidden: true });
      datei.addEventListener('change', async () => { const d = datei.files && datei.files[0]; if (!d) return; try { f.foto = await fotoEinlesen(d, 2400); f.bon = null; haptik(12); neu(); bonLesen(f); } catch (e) { toast('Das Foto konnte nicht gelesen werden.'); } });
      teil = [
        el('div', { class: 'reihe' }, datei,
          el('button', { type: 'button', class: 'knopf', onclick: () => datei.click() }, el('span', { html: `<svg viewBox="0 0 24 24" aria-hidden="true">${SYMBOL.foto}</svg>`, style: 'display:contents' }), f.foto ? 'Neues Foto' : 'Kassenzettel fotografieren'),
          el('button', { type: 'button', class: 'knopf flach', onclick: () => { datei.removeAttribute('capture'); datei.click(); datei.setAttribute('capture', 'environment'); } }, 'Aus Galerie'),
          f.foto ? el('button', { type: 'button', class: 'k-foto', 'aria-label': 'Kassenzettel groß ansehen', onclick: () => zeigeFoto(f.foto) }, el('img', { src: f.foto, alt: '' })) : null),
        f.foto ? el('p', { class: 'leise klein', style: 'margin:0' }, 'Das Foto bleibt nur auf diesem Handy. Die Erkennung läuft im Handy.') : null,
        S.bonStatus ? el('p', { class: 'bon-status', 'aria-live': 'polite' }, S.bonStatus) : null,
        f.bon ? bonAnsicht(f, neu) : null,
        el('ol', { class: 'k-posten' }, f.posten.map((q, i) => {
          const text = el('input', { type: 'text', maxlength: '40', placeholder: `Posten ${i + 1}, z. B. Bacalhau`, value: q.t, 'aria-label': `Bezeichnung Posten ${i + 1}`, autocomplete: 'off' });
          text.addEventListener('input', () => { q.t = text.value; });
          return el('li', {},
            el('div', { class: 'feld' }, geldFeld(q.b, (c) => { q.b = c; }, `Betrag Posten ${i + 1}`), text,
              el('button', { type: 'button', class: 'haken', 'aria-label': `Posten ${i + 1} entfernen`, onclick: () => { f.posten.splice(i, 1); if (!f.posten.length) f.posten.push({ t: '', b: 0, w: [] }); neu(); } }, ic('x'))),
            el('div', { class: 'chips' }, alle.map((id) => el('button', { type: 'button', class: 'chip', 'aria-pressed': String(q.w.includes(id)), onclick: () => { q.w = q.w.includes(id) ? q.w.filter((x) => x !== id) : q.w.concat(id); haptik(); neu(); } }, personName(id))),
              el('button', { type: 'button', class: 'chip', onclick: () => { q.w = q.w.length === alle.length ? [] : alle.slice(); neu(); } }, q.w.length === alle.length ? 'Keiner' : 'Alle teilen')));
        })),
        el('button', { type: 'button', class: 'knopf breit', onclick: () => { f.posten.push({ t: '', b: 0, w: [] }); neu(); setTimeout(() => { const l = $$('.k-posten .geld'); if (l.length) l[l.length - 1].focus(); }, 60); } }, '+ Posten'),
        el('div', { style: 'display:grid;gap:6px' }, el('span', { class: 'klein leise' }, 'Trinkgeld oder Service (anteilig nach Posten)'),
          el('div', { class: 'chips' }, [0, 5, 10, 15].map((pz) => el('button', { type: 'button', class: 'chip', 'aria-pressed': String(f.tipArt === '%' && (f.tip || 0) === pz), onclick: () => { f.tipArt = '%'; f.tip = pz; neu(); } }, pz ? `${pz} %` : 'Keins')),
            el('button', { type: 'button', class: 'chip', 'aria-pressed': String(f.tipArt === '€'), onclick: () => { f.tipArt = '€'; f.tip = 0; neu(); } }, 'Betrag')),
          f.tipArt === '€' ? geldFeld(f.tip, (c) => { f.tip = c; }, 'Trinkgeld in Euro') : null)];
    }
    const zahler = f.mehr
      ? el('ul', { class: 'k-zeilen' }, alle.map((id) => el('li', {}, el('span', {}, personName(id)), geldFeld(f.zahler[id] || 0, (c) => { f.zahler[id] = c; }, `${personName(id)} hat bezahlt`))))
      : el('div', { class: 'chips', role: 'radiogroup', 'aria-label': 'Bezahlt von' }, alle.map((id) => el('button', { type: 'button', class: 'chip', role: 'radio', 'aria-checked': String(f.v === id), 'aria-pressed': String(f.v === id), onclick: () => { f.v = id; haptik(); neu(); } }, personName(id))));
    const zweck = el('input', { id: 'k-zweck', type: 'text', maxlength: '60', placeholder: 'Wofür? z. B. Abendessen', value: f.z || '', autocomplete: 'off' });
    zweck.addEventListener('input', () => { f.z = zweck.value; });
    const speichern = () => {
      const r = berechne(f);
      if (r.fehler) { toast(r.fehler); haptik(30); return; }
      if (f.art === 'posten' && f.bon) {
        const ist = f.posten.reduce((a, q) => a + (q.b || 0), 0), soll = f.bonTotal;
        if (soll != null && ist !== soll && !f.trotzdem) { toast(`Posten ${euro(ist)}, Bon ${euro(soll)}: bitte erst prüfen. Oder unten „Trotzdem speichern“.`); f.trotzdem = 'frage'; neu(); return; }
      }
      const v = Object.entries(r.za).sort((a, c) => c[1] - a[1])[0][0];
      const id = kostenSpeichern({ id: f.id, v, b: r.b, z: f.z, f: Object.keys(r.an), an: r.an, za: r.za, art: f.art,
        pos: f.art === 'posten' ? f.posten.filter((q) => q.b > 0).map((q) => [q.t, q.b, q.w]) : null, tip: f.art === 'posten' && f.tip ? [f.tipArt, f.tip] : null });
      if (f.foto) fotoSpeichern(id, f.foto);
      S.kostenForm = null; F.warteZeichnen = false; haptik(12);
      neu();
      toast(`${euro(r.b)} gespeichert.`);
    };
    const kopf = el('section', { class: 'karte-box k-form', style: 'display:grid;gap:10px;margin-top:10px' },
      el('strong', {}, f.id ? 'Ausgabe ändern' : 'Neue Ausgabe'),
      arten, el('p', { class: 'leise klein', style: 'margin:0' }, erklaerung),
      f.art !== 'posten' ? el('div', { class: 'feld' }, geldFeld(f.b, (c) => { f.b = c; }, 'Gesamtbetrag in Euro'), el('span', { class: 'euro-zeichen', 'aria-hidden': 'true' }, '€')) : null,
      zweck,
      f.art === 'posten' ? el('span', { class: 'klein leise' }, 'Posten vom Kassenzettel') : null,
      teil,
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center' }, el('span', { class: 'klein leise' }, 'Bezahlt von'),
        el('button', { type: 'button', class: 'knopf flach', style: 'min-height:44px;padding:0 8px', onclick: () => { f.mehr = !f.mehr; neu(); } }, f.mehr ? 'Nur eine Person' : 'Mehrere Personen')),
      zahler,
      vorschau,
      el('div', { class: 'reihe' },
        el('button', { type: 'button', class: 'knopf', onclick: () => { S.kostenForm = null; neu(); } }, 'Abbrechen'),
        el('button', { type: 'button', class: 'knopf haupt', onclick: speichern }, 'Speichern')),
      f.id ? el('button', { type: 'button', class: 'knopf flach warn', onclick: () => { const id = f.id; kostenLoeschen(id, true); S.kostenForm = null; neu(); toast('Ausgabe gelöscht.', { aktion: 'Rückgängig', fn: () => { kostenLoeschen(id, false); neu(); } }); } }, 'Ausgabe löschen') : null);
    aktualisiere();
    return kopf;
  }
  function personOhneApp() {
    const feld = el('input', { type: 'text', maxlength: '30', placeholder: 'Name, z. B. Oma Rita', 'aria-label': 'Name der Person ohne App', autocomplete: 'off' });
    const los = () => {
      const n = feld.value.trim(); if (!n) { feld.focus(); return; }
      const id = neueId();
      G.leute[id] = { name: n, t: Date.now(), s: {}, a: {}, m: {}, ohne: 1 };
      speichereG(); S.personNeu = false; F.warteZeichnen = false; haptik(12);
      zeichne({ scroll: true, karte: false }); toast(`${n} ist dabei. Alle sehen die Person in den Kosten.`);
    };
    feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') los(); });
    setTimeout(() => feld.focus(), 60);
    return el('div', { class: 'karte-box', style: 'display:grid;gap:8px;margin-top:10px' }, el('strong', {}, 'Person ohne App'),
      el('div', { class: 'feld' }, feld, el('button', { type: 'button', class: 'knopf haupt', onclick: los }, 'Hinzufügen')),
      el('button', { type: 'button', class: 'knopf flach', onclick: () => { S.personNeu = false; zeichne({ scroll: true, karte: false }); } }, 'Abbrechen'));
  }
  function kostenTeil() {
    const alle = personenListe();
    const s2 = salden(), wege = ausgleichWege(s2);
    const liste = Object.entries(G.kosten).filter(([, x]) => !x.x).sort((a, b) => b[1].t - a[1].t);
    const summe = liste.filter(([, x]) => !x.a).reduce((a, [, x]) => a + x.b, 0);
    const mein = G.ich ? s2[G.ich.id] || 0 : 0;
    const fotos = speicher.get('kzFotos', []);
    const neu = () => { S.kostenForm = leerForm(); zeichne({ scroll: true, karte: false }); setTimeout(() => { const b = $('.k-form .geld'); if (b) b.focus(); }, 60); };
    const zeileText = (x) => {
      if (x.a) return `Ausgleich · ${uhrzeit(x.t)}`;
      const zahl = x.za && Object.keys(x.za).length > 1 ? Object.entries(x.za).map(([id, c]) => `${personName(id)} ${euro(c)}`).join(', ') : `${personName(x.v)} hat bezahlt`;
      const art = { betrag: 'feste Beträge', anteile: 'nach Anteilen', posten: 'nach Posten' }[x.art];
      const fuer = x.f.length === alle.length ? 'für alle' : `für ${x.f.map(personName).join(', ')}`;
      return [zahl, art || fuer, uhrzeit(x.t)].join(' · ');
    };
    return el('section', { class: 'abschnitt', style: 'margin-top:8px' },
      el('div', { class: 'kosten-stand ' + (mein > 0 ? 'plus' : mein < 0 ? 'minus' : '') },
        el('small', {}, 'Dein Stand'),
        el('strong', {}, mein > 0 ? `Du bekommst ${euro(mein)}` : mein < 0 ? `Du schuldest ${euro(mein)}` : 'Ausgeglichen'),
        el('small', {}, `Ausgaben der Gruppe: ${euro(summe)}`)),
      S.kostenForm ? kostenForm() : el('div', { style: 'display:grid;gap:8px;margin-top:10px' }, rwEntwurfListe(), bonKnopf(), el('button', { type: 'button', class: 'knopf breit', onclick: neu }, '+ Ausgabe ohne Kassenzettel eintragen')),
      S.personNeu ? personOhneApp() : null,
      wege.length ? el('div', { class: 'abschnitt' }, el('h3', {}, 'So gleicht ihr aus'),
        el('ul', { class: 'liste' }, wege.map((w) => el('li', { class: 'eintrag kosten-weg' },
          el('span', { class: 'text' }, el('span', { class: 'titel' }, `${personName(w.von)} → ${personName(w.an)}`), el('span', { class: 'unter' }, euro(w.b))),
          el('button', { type: 'button', class: 'knopf', style: 'min-height:48px;padding:0 12px', onclick: () => {
            const id = kostenSpeichern({ v: w.von, b: w.b, z: 'Ausgleich', f: [w.an], a: 1 }); haptik(12); zeichne({ scroll: true, karte: false });
            toast(`Eingetragen: ${personName(w.von)} hat ${personName(w.an)} ${euro(w.b)} gegeben.`, { aktion: 'Rückgängig', fn: () => { kostenLoeschen(id, true); zeichne({ scroll: true, karte: false }); } });
          } }, 'Bezahlt')))),
        el('p', { class: 'leise klein', style: 'margin:6px 0 0' }, `${wege.length} ${wege.length === 1 ? 'Überweisung reicht' : 'Überweisungen reichen'}, damit alle quitt sind. Teilzahlung: Ausgabe mit „Beträge“ eintragen.`)) : null,
      el('div', { class: 'abschnitt' }, el('h3', {}, 'Wer ist dabei'),
        el('div', { class: 'chips' }, alle.map((id) => el('span', { class: 'chip ruhig' }, personName(id), G.leute[id] && G.leute[id].ohne ? el('small', {}, ' ohne App') : null, el('b', { class: (s2[id] || 0) >= 0 ? 'plus' : 'minus' }, ` ${(s2[id] || 0) >= 0 ? '+' : '−'}${euro(s2[id] || 0)}`))),
          S.personNeu ? null : el('button', { type: 'button', class: 'chip', onclick: () => { S.personNeu = true; zeichne({ scroll: true, karte: false }); } }, '+ Person ohne App'))),
      el('div', { class: 'abschnitt' }, el('h3', {}, `Ausgaben (${liste.length})`),
        liste.length ? el('ul', { class: 'liste' }, liste.map(([id, x]) => el('li', { class: 'eintrag' },
          el('button', { type: 'button', class: 'auf', onclick: () => { S.kostenForm = formAus(id, x); fotoLaden(id).then((d) => { if (d && S.kostenForm && S.kostenForm.id === id) { S.kostenForm.foto = d; zeichne({ scroll: true, karte: false }); } }); zeichne({ scroll: true, karte: false }); } },
            el('span', { class: 'text' },
              el('span', { class: 'titel' }, x.a ? `${personName(x.v)} → ${personName(x.f[0])}` : x.z || 'Ausgabe', fotos.includes(id) ? el('span', { class: 'abzeichen', style: 'margin-left:6px;font-size:12px' }, 'Bon') : null),
              el('span', { class: 'unter' }, zeileText(x))),
            el('span', { class: 'betrag' }, euro(x.b)))))) : el('p', { class: 'leise klein', style: 'margin:0' }, 'Noch keine Ausgaben. Wer bezahlt, trägt es hier ein. Alle sehen es sofort.')),
      liste.length ? el('button', { type: 'button', class: 'knopf breit', style: 'margin-top:12px', onclick: () => kopiere(abrechnungText(), 'Abrechnung kopiert. Du kannst sie jetzt einfügen, wo du willst.') }, ic('kopie'), 'Abrechnung als Text kopieren') : null,
      el('p', { class: 'leise klein', style: 'margin:14px 0 0' }, 'Alles in Euro, auf den Cent genau. Läuft verschlüsselt über euren Gruppenkanal, wie Nachrichten und Stimmen. Fotos bleiben auf dem Handy.'));
  }

  // ---------- Gruppe: Ansicht ----------
  const initialen = (n) => (String(n || '?').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2) || '?').toUpperCase();
  const zeitHer = (t) => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'gerade eben' : m < 60 ? `vor ${m} Min.` : m < 1440 ? `vor ${Math.round(m / 60)} Std.` : `vor ${Math.round(m / 1440)} Tagen`; };
  function zeichneGruppe(box) {
    if (!G.ich || !G.ich.name) {
      const feld = el('input', { id: 'gruppe-name', type: 'text', autocomplete: 'given-name', placeholder: 'Dein Vorname', maxlength: '30' });
      const los = () => { const n = feld.value.trim(); if (!n) { feld.focus(); return; } ich(); G.ich.name = n; G.leute[G.ich.id].name = n; G.leute[G.ich.id].t = Date.now(); speichereG(); funkStart(); teileMarkierungen(); zeichne(); };
      feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') los(); });
      setze(box, el('div', { class: 'leer' }, fasan(), el('strong', { style: 'font-size:var(--fs-t)' }, 'Gemeinsam entscheiden')),
        el('p', { style: 'margin:0 0 6px' }, 'Jede und jeder stimmt bei Orten ab: „Will hin“ oder „Lieber nicht“. Dazu kommen Umfragen wie „Wohin heute Abend?“.'),
        el('p', { class: 'leise klein', style: 'margin:0 0 14px' }, 'Einmal per QR-Code oder Link verbinden. Danach gleicht sich alles live und verschlüsselt ab, ohne Konto. Dein Name ist nur für die Gruppe.'),
        el('div', { class: 'feld' }, feld, el('button', { type: 'button', class: 'knopf haupt', onclick: los }, 'Los')));
      return;
    }
    const leute = Object.entries(G.leute).filter(([id]) => id !== G.ich.id).sort((a, b) => (b[1].t || 0) - (a[1].t || 0));
    const liste = rangliste();
    const umfragen = Object.entries(G.umfragen).sort((a, b) => (b[1].t || 0) - (a[1].t || 0));

    const iosApp = IOS && (navigator.standalone || matchMedia('(display-mode: standalone)').matches);
    const abgleich = el('section', { class: 'karte-box', style: 'margin-top:4px;display:grid;gap:10px' },
      iosApp ? el('p', { class: 'hilfe', style: 'margin:0' }, el('span', {}, 'Auf dem iPhone öffnen sich Gruppen-Links in Safari, nicht in diesem Home-Bildschirm-Symbol. Nutze für die Gruppe die Karte direkt in Safari.')) : null,
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px' },
        el('strong', {}, `Du bist ${meinName()}`),
        el('button', { type: 'button', class: 'knopf flach nur-voll', style: 'min-height:48px;padding:0 10px', onclick: () => { G.ich.name = ''; speichereG(); zeichne(); } }, 'Ändern')),
      el('div', { class: 'reihe' },
        el('button', { type: 'button', class: 'knopf haupt', style: 'flex:1 1 140px', onclick: zeigeQr }, ic('qr'), 'QR zeigen'),
        el('button', { type: 'button', class: 'knopf', style: 'flex:1 1 140px', onclick: teileGruppe }, ic('teilen'), 'Link senden')),
      el('p', { class: 'leise klein', style: 'margin:0' }, leute.length
        ? `Abgeglichen mit: ${leute.map(([, p]) => `${p.name || 'Jemand'} (${zeitHer(p.t)})`).join(', ')}.`
        : 'Noch niemand verbunden. Zeig deinen QR-Code oder schick den Link in eure WhatsApp-Gruppe. Einmal reicht: danach läuft der Abgleich live.'));

    const umfrageTeil = el('section', { class: 'abschnitt' }, el('h3', {}, 'Umfragen'),
      S.neueUmfrage ? formUmfrage() : el('button', { type: 'button', class: 'knopf breit nur-voll', onclick: () => { S.neueUmfrage = { frage: 'Wohin heute Abend?', o: [] }; zeichne({ scroll: true, karte: false }); } }, ic('plan'), 'Neue Umfrage'),
      umfragen.length ? umfragen.map(([id, u]) => karteUmfrage(id, u)) : (S.neueUmfrage ? null : el('p', { class: 'leise klein', style: 'margin:10px 0 0' }, 'Noch keine Umfrage. Neue Umfragen sehen alle mit offener App sofort.')));

    const strittig = liste.filter((x) => x.ja.length && x.nein.length);
    const strittigTeil = strittig.length ? el('section', { class: 'abschnitt' }, el('h3', {}, `Strittig (${strittig.length})`),
      el('p', { class: 'leise klein', style: 'margin:0 0 6px' }, 'Hier will jemand lieber nicht hin. Diese Orte plant der Gruppenplan nicht ein. Redet kurz darüber, vielleicht geht eine Teilgruppe hin und ihr trefft euch danach am Treffpunkt.'),
      el('ul', { class: 'liste' }, strittig.map(({ o }) => eintragOrt(o)))) : null;
    const rang = el('section', { class: 'abschnitt' }, el('h3', {}, 'Was die Gruppe will'),
      liste.length ? el('ol', { class: 'liste' }, liste.map(({ o, ja, nein }, i) => {
        const li = eintragOrt(o, { nr: i + 1 });
        const zeile = el('span', { class: 'unter stimmen' },
          ja.length ? el('span', { class: 'ja' }, `👍 ${ja.length}: ${ja.join(', ')}`) : null,
          nein.length ? el('span', { class: 'nein' }, `👎 ${nein.length}: ${nein.join(', ')}`) : null,
          ja.length && nein.length ? el('span', { class: 'abzeichen warn', style: 'font-size:12px' }, 'uneinig') : null);
        li.querySelector('.text').append(zeile);
        return li;
      })) : el('p', { class: 'leise klein', style: 'margin:0' }, 'Noch keine Stimmen. Öffne einen Ort und tippe auf „Will hin“ oder „Lieber nicht“.'));
    const treffTeil = el('section', { class: 'abschnitt' }, el('h3', {}, 'Treffpunkt'),
      S.treffForm ? treffForm() : treffKarte() || el('button', { type: 'button', class: 'knopf breit', onclick: () => {
        const d = new Date(Date.now() + 90 * 60000); d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
        S.treffForm = { zeit: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`, q: '' }; zeichne({ scroll: true });
      } }, ic('orte'), 'Treffpunkt festlegen'));
    if (document.visibilityState === 'visible') { speicher.set('gelesen', Date.now()); leisteZahl(); }
    const teil = S.gTeil || 'unterwegs';
    const reiter = el('div', { class: 'segmente', role: 'tablist', 'aria-label': 'Gruppe', style: 'margin:4px 0 6px' },
      [['unterwegs', 'Unterwegs'], ['abstimmen', 'Abstimmen'], ['kosten', 'Kosten'], ['einkauf', 'Einkauf']].map(([id, n]) => el('button', { type: 'button', role: 'tab', 'aria-selected': String(teil === id), 'aria-pressed': String(teil === id), onclick: () => { S.gTeil = id; speicher.set('gTeil', id); S.kostenForm = null; haptik(); zeichne({ karte: false }); } }, n)));
    // Ohne bekannte Mitreisende zuerst der Abgleich per QR/Link: darüber kommt auch der Gruppenschlüssel
    const inhalt = teil === 'kosten' ? kostenTeil() : teil === 'einkauf' ? einkaufTeil() : teil === 'abstimmen' ? [umfrageTeil, rang, strittigTeil] : null;
    const bonTeil = teil === 'kosten' ? null : bonKnopf({ klein: true, titel: 'Kassenzettel scannen und teilen' });
    if (!leute.length) setze(box, pinKarte(), abgleich, bonTeil, reiter, inhalt || [liveTeil(), nachrichtenTeil(), treffTeil]);
    else setze(box, pinKarte(), bonTeil, reiter, inhalt || [liveTeil(), nachrichtenTeil(), treffTeil, abgleich]);
  }

  function formUmfrage() {
    const f = S.neueUmfrage;
    const frage = el('input', { id: 'umfrage-frage', type: 'text', value: f.frage, maxlength: '100', 'aria-label': 'Frage' });
    frage.addEventListener('input', () => { f.frage = frage.value; });
    const such = el('input', { id: 'umfrage-suche', type: 'search', placeholder: 'Orte filtern', 'aria-label': 'Orte filtern', value: f.q || '' });
    const auswahl = el('ul', { class: 'liste auswahl' });
    const fuelle = () => {
      const q = falte(f.q || '');
      const kandidaten = ORTE.filter((o) => !mk(o.id).aus && (!q || falte(o.name + ' ' + o.kategorie).includes(q)))
        .sort((a, b) => (f.o.includes(b.id) - f.o.includes(a.id)) || (mk(b.id).fav ? 1 : 0) - (mk(a.id).fav ? 1 : 0) || a.name.localeCompare(b.name, 'pt'));
      setze(auswahl, kandidaten.map((o) => el('li', {},
        el('button', { type: 'button', class: 'waehle', 'aria-pressed': String(f.o.includes(o.id)), onclick: () => {
          if (f.o.includes(o.id)) f.o = f.o.filter((x) => x !== o.id); else if (f.o.length < 6) f.o.push(o.id); else toast('Höchstens 6 Orte pro Umfrage.');
          fuelle(); zaehler.textContent = `${f.o.length} von 6 gewählt`;
        } }, el('span', { class: 'kasten' }, ic('haken')), el('span', {}, o.name, el('small', {}, o.kategorie))))));
    };
    such.addEventListener('input', () => { f.q = such.value; fuelle(); });
    const zaehler = el('span', { class: 'leise klein' }, `${f.o.length} von 6 gewählt`);
    fuelle();
    return el('div', { class: 'karte-box', style: 'display:grid;gap:10px' },
      el('label', { for: 'umfrage-frage', class: 'klein leise' }, 'Frage'), frage,
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center' }, el('span', { class: 'klein leise' }, 'Orte zur Auswahl (2–6)'), zaehler),
      such, auswahl,
      el('div', { class: 'reihe' },
        el('button', { type: 'button', class: 'knopf', onclick: () => { S.neueUmfrage = null; zeichne({ scroll: true, karte: false }); } }, 'Abbrechen'),
        el('button', { type: 'button', class: 'knopf haupt', onclick: () => {
          if (f.o.length < 2) { toast('Wähle mindestens 2 Orte.'); return; }
          if (!f.frage.trim()) { toast('Gib eine Frage ein.'); return; }
          const me = ich();
          const id = neueId();
          G.umfragen[id] = { von: G.ich.id, frage: f.frage.trim(), o: f.o.slice(), t: Date.now() };
          me.t = Date.now(); speichereG();
          S.neueUmfrage = null; zeichne();
          toast(F.an && F.status.verbunden ? 'Umfrage gestartet. Alle mit offener App sehen sie gleich.' : 'Umfrage gestartet. Ohne Live-Verbindung: QR zeigen oder Link senden.', F.an && F.status.verbunden ? {} : { aktion: 'Link senden', fn: teileGruppe });
        } }, 'Umfrage starten')));
  }

  function karteUmfrage(id, u) {
    const me = ich();
    const meine = (me.a && me.a[id]) || [];
    const stimmen = u.o.map((oid) => {
      const namen = [];
      for (const [pid, p] of Object.entries(G.leute)) if (((p.a || {})[id] || []).includes(oid)) namen.push(pid === G.ich.id ? meinName() : p.name || 'Jemand');
      return { oid, namen };
    });
    const max = Math.max(1, ...stimmen.map((s) => s.namen.length));
    const teilnehmer = Object.values(G.leute).filter((p) => ((p.a || {})[id] || []).length).length;
    const vonName = u.von === G.ich.id ? meinName() : (G.leute[u.von] || {}).name || 'Jemand';
    return el('article', { class: 'umfrage' },
      el('strong', { class: 'umfrage-frage' }, u.frage),
      el('span', { class: 'leise klein' }, `von ${vonName} · ${teilnehmer} haben abgestimmt · mehrere Antworten möglich`),
      el('div', { style: 'display:grid;gap:8px;margin-top:8px' }, stimmen.map(({ oid, namen }) => {
        const o = NACH_ID.get(oid);
        if (!o) return null;
        const an = meine.includes(oid);
        return el('button', { type: 'button', class: 'option', 'aria-pressed': String(an), onclick: () => {
          const neu = an ? meine.filter((x) => x !== oid) : meine.concat(oid);
          me.a = Object.assign({}, me.a, { [id]: neu }); me.t = Date.now(); speichereG(); zeichne({ scroll: true });
        } },
        el('span', { class: 'balken', style: `width:${(namen.length / max) * 100}%` }),
        el('span', { class: 'kasten' }, ic('haken')),
        el('span', { class: 'option-text' }, o.name, el('small', {}, namen.length ? `${namen.length}: ${namen.join(', ')}` : 'noch keine Stimme')));
      })),
      el('div', { class: 'reihe', style: 'margin-top:8px' },
        el('button', { type: 'button', class: 'knopf flach', onclick: teileGruppe }, ic('teilen'), 'Antwort senden'),
        u.von === G.ich.id ? el('button', { type: 'button', class: 'knopf flach warn nur-voll', onclick: () => { delete G.umfragen[id]; speichereG(); zeichne({ scroll: true }); toast('Umfrage entfernt (nur auf diesem Handy).'); } }, 'Entfernen') : null));
  }

  // ---------- Ortsdetail ----------
  function oeffneOrt(id, ausListe) {
    const o = NACH_ID.get(id);
    if (!o) return;
    const war = S.ort;
    S.ort = id;
    if (!war) { try { history.pushState({ ort: id }, '', '#ort-' + id); } catch (e) { /* egal */ } }
    else { try { history.replaceState({ ort: id }, '', '#ort-' + id); } catch (e) { /* egal */ } }
    hoehe(ausListe && S.hoehe === 'gross' ? 'gross' : 'mitte');
    zeichne();
    S.follow = false; gpsKnopf();
    requestAnimationFrame(() => zeigeAufKarte(o));
  }
  function schliesseOrt(ausHistory) {
    if (!S.ort) return;
    S.ort = null;
    if (!ausHistory) { try { if (history.state && history.state.ort) history.back(); else history.replaceState(null, '', location.pathname); } catch (e) { /* egal */ } }
    zeichne();
  }
  addEventListener('popstate', () => { if (S.ort && !/^#ort-/.test(location.hash)) schliesseOrt(true); else if (/^#ort-/.test(location.hash)) { const id = location.hash.slice(5); if (NACH_ID.has(id) && S.ort !== id) oeffneOrt(id); } });

  function stimmBlock(o) {
    const v = meineStimme(o.id);
    const { ja, nein } = gruppenStimmen(o.id);
    const setz = (w) => { stimme(o.id, v === w ? 0 : w); zeichne({ scroll: true }); if (!G.ich.name) toast('Gespeichert. Unter „Gruppe“ deinen Namen eingeben, dann abgleichen.'); };
    return el('section', { class: 'abschnitt' }, el('h3', {}, 'Deine Stimme für die Gruppe'),
      el('div', { class: 'segmente stimme', role: 'group', 'aria-label': 'Deine Stimme' },
        el('button', { type: 'button', 'aria-pressed': String(v === 1), class: 'ja', onclick: () => setz(1) }, ic('hoch'), 'Will hin'),
        el('button', { type: 'button', 'aria-pressed': String(v === -1), class: 'nein', onclick: () => setz(-1) }, ic('runter'), 'Lieber nicht')),
      ja.length || nein.length ? el('p', { class: 'klein', style: 'margin:8px 0 0' },
        ja.length ? `👍 ${ja.join(', ')}` : '', ja.length && nein.length ? ' · ' : '', nein.length ? `👎 ${nein.join(', ')}` : '') : null);
  }

  function zeichneOrt(box) {
    const o = NACH_ID.get(S.ort), m = mk(o.id), g = gruppeVon(o.kategorie);
    const d = S.me && hatPos(o) ? meter(S.me, o) : null;
    const aktion = (cls, name, label, an, fn) => el('button', { type: 'button', class: 'aktion ' + cls, 'aria-pressed': an == null ? null : String(!!an), onclick: fn }, ic(name), label);
    const st = status(o);
    const wochen = o.infos && o.infos.oeffnungszeiten ? window.Oeffnung.woche(o.infos.oeffnungszeiten) : null;
    const rollstuhl = { yes: 'rollstuhlgerecht', limited: 'teilweise rollstuhlgerecht', no: 'nicht rollstuhlgerecht' }[(o.infos || {}).rollstuhl];
    const kueche = (o.infos || {}).kueche ? o.infos.kueche.split(';').map((k) => ({ regional: 'regional', portuguese: 'portugiesisch', vegetarian: 'vegetarisch', vegan: 'vegan', coffee_shop: 'Café', international: 'international', mediterranean: 'mittelmeerisch', seafood: 'Fisch und Meeresfrüchte', asian: 'asiatisch' }[k.trim()] || k.trim())).join(', ') : null;
    const veg = (o.infos || {}).vegan === 'only' ? 'nur vegan' : (o.infos || {}).vegetarisch === 'only' ? 'nur vegetarisch'
      : ((o.infos || {}).vegan === 'yes' ? 'vegane Gerichte' : (o.infos || {}).vegetarisch === 'yes' ? 'vegetarische Gerichte' : null);
    const info = (dt, dd) => (dd ? el('div', {}, el('dt', {}, dt), el('dd', {}, dd)) : null);
    const plaene = inPlaenen(o);
    const notiz = el('textarea', { class: 'notiz-feld', id: 'notiz', placeholder: 'Eigene Notiz, zum Beispiel: „Unbedingt die Ginjinha im Schokobecher probieren“' });
    notiz.value = m.notiz || '';
    let notizTimer = null;
    const gespeichert = el('span', { class: 'leise klein', 'aria-live': 'polite' });
    notiz.addEventListener('input', () => {
      clearTimeout(notizTimer);
      notizTimer = setTimeout(() => { markiere(o.id, { notiz: notiz.value.trim() || undefined }); gespeichert.textContent = 'Gespeichert'; karteZeichnen(); }, 500);
    });

    setze(box,
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
        el('button', { type: 'button', class: 'knopf flach zurueck', onclick: () => schliesseOrt() }, ic('zurueck'), 'Zurück'),
        el('button', { type: 'button', class: 'knopf flach', 'aria-label': 'Ort schließen', onclick: () => schliesseOrt() }, ic('x'))),
      o.bild ? el('figure', { class: 'bild', style: 'margin:4px 0 0' },
        el('img', { src: o.bild.src, alt: `Foto: ${o.name}`, width: o.bild.breite, height: o.bild.hoehe }),
        el('figcaption', {}, 'Foto: ', o.bild.autor, ' · ', el('a', { href: o.bild.quelle, target: '_blank', rel: 'noopener' }, o.bild.lizenz)))
        : el('div', { class: `bild-ersatz g-${gruppeVon(o.kategorie)}` }, symbol(o), el('span', {}, TYP_NAME[o.typ] || o.kategorie)),
      el('h2', { class: 'ort-titel' }, o.name),
      el('div', { class: 'ort-unter' },
        el('span', { class: 'marker g-' + g, style: 'width:28px;height:28px' }, SVG[g] ? ic(g) : symbol(o)), o.kategorie,
        o.ort && o.ort !== 'Lisboa' ? el('span', {}, '· ' + o.ort) : null,
        d != null ? el('span', {}, `· ${strecke(d)}, etwa ${gehzeit(d)} Min. zu Fuß`) : null,
        o.dauer ? el('span', {}, `· vor Ort ${o.dauer} Min.`) : null),
      el('div', { class: 'reihe', style: 'margin-top:8px' },
        istTipp(o) ? el('span', { class: 'abzeichen tipp' }, ic('stern'), 'Geheimtipp') : null,
        plaene.map((p) => el('span', { class: 'abzeichen' }, p)),
        o.quelle === 'pruefen' ? el('span', { class: 'abzeichen warn' }, 'Kartenpunkt ungefähr') : null),
      el('div', { style: 'display:grid;gap:8px;margin-top:14px' },
        el('button', { type: 'button', class: 'knopf haupt breit', onclick: () => starteNavi(o) }, ic('route'), 'Hinführen'),
        ['essen', 'veggie', 'abends'].includes(gruppeVon(o.kategorie)) ? bonKnopf({ klein: true, titel: 'Rechnung hier scannen und teilen', zweck: o.name.slice(0, 60) }) : null),
      el('div', { class: 'aktionen' },
        aktion('fav', 'herz', m.fav ? 'Gemerkt' : 'Merken', m.fav, () => { markiere(o.id, { fav: !m.fav }); zeichne({ scroll: true }); }),
        aktion('fertig', 'haken', 'Erledigt', m.fertig, () => { schalteErledigt(o); }),
        aktion('nur-voll', 'aus', 'Ausblenden', m.aus, () => {
          markiere(o.id, { aus: !m.aus });
          if (!m.aus) { schliesseOrt(); toast(`${o.name} ausgeblendet.`, { aktion: 'Rückgängig', fn: () => { markiere(o.id, { aus: false }); zeichne(); } }); } else zeichne({ scroll: true });
        }),
        aktion('', 'plan', 'In Plan', S.inPlan === o.id, () => { S.inPlan = S.inPlan === o.id ? null : o.id; S.teilen = null; zeichne({ scroll: true, karte: false }); }),
        aktion('', 'teilen', 'An Gruppe', S.teilen === o.id, () => { S.teilen = S.teilen === o.id ? null : o.id; zeichne({ scroll: true, karte: false }); if (S.teilen) setTimeout(() => { const f = $('#teil-text'); if (f) f.focus(); }, 50); })),
      S.teilen === o.id ? teilBox(o) : null,
      S.inPlan === o.id ? inPlanBox(o) : null,
      stimmBlock(o),
      gesehenBlock(o),
      gruppeMarkBlock(o),
      o.eigen ? eigenBlock(o) : null,
      o.notiz ? el('section', { class: 'abschnitt' }, el('h3', {}, o.kategorie === 'Foto' ? 'Foto-Tipp' : 'Unser Tipp'), el('p', { style: 'margin:0' }, notizText(o)),
        el('p', { class: 'quelle', style: 'margin-top:4px' }, /Quelle|abgerufen|[Ll]aut |\d{2}\.\d{4}\)/.test(o.notiz) ? 'Preise und Zeiten können sich ändern.' : `Stand ${STAND_NOTIZEN}. Preise und Zeiten können sich ändern.`)) : null,
      o.foto ? el('section', { class: 'abschnitt' }, el('h3', {}, el('span', { class: 'marker g-foto', style: 'width:28px;height:28px;display:inline-grid;vertical-align:middle;margin-right:8px' }, symbol({ typ: 'foto' })), 'Foto-Tipp'), el('p', { style: 'margin:0' }, o.foto)) : null,
      o.dauer ? el('section', { class: 'abschnitt' }, el('h3', {}, 'Zeitbedarf'), el('p', { style: 'margin:0' }, el('strong', {}, `Etwa ${o.dauer} Minuten`)),
        el('p', { class: 'quelle', style: 'margin-top:4px' }, `Quelle: ${o.dauerQuelle || 'nicht angegeben'}.`)) : null,
      o.infos && o.infos.oeffnungszeiten ? el('section', { class: 'abschnitt' }, el('h3', {}, 'Öffnungszeiten'),
        st ? el('p', { style: 'margin:0' }, el('span', { class: 'status ' + (st.offen ? 'offen' : 'zu') }, st.offen ? `Jetzt geöffnet, bis ${st.bis} Uhr` : 'Jetzt geschlossen'), !st.offen && st.naechste ? `. Öffnet ${st.naechste} Uhr.` : '') : null,
        wochen ? el('ul', { class: 'zeiten' }, wochen.map((w) => el('li', { class: w.heute ? 'heute' : '' }, el('b', {}, w.tag), w.text)))
          : el('p', { style: 'margin:0' }, window.Oeffnung.roh(o.infos.oeffnungszeiten)),
        el('p', { class: 'quelle', style: 'margin-top:6px' }, `Laut OpenStreetMap${o.stand ? `, abgerufen am ${datumDe(o.stand)}` : ''}. Kann veraltet sein.`)) : null,
      o.wiki ? el('section', { class: 'abschnitt wiki' }, el('h3', {}, 'Über den Ort'),
        o.wiki.text.split('\n').filter(Boolean).slice(0, 3).map((p) => el('p', {}, p)),
        el('a', { href: o.wiki.url, target: '_blank', rel: 'noopener' }, `Weiterlesen auf Wikipedia${o.wiki.lang !== 'de' ? (o.wiki.lang === 'pt' ? ' (portugiesisch)' : ' (englisch)') : ''}`),
        o.stand ? el('p', { class: 'quelle', style: 'margin-top:4px' }, `Text abgerufen am ${datumDe(o.stand)}.`) : null) : null,
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Infos'),
        el('dl', { class: 'infos' },
          info('Adresse', el('span', {}, o.adresse, ' ', el('button', { type: 'button', class: 'knopf flach', style: 'min-height:44px;padding:0 8px', onclick: () => kopiere(o.adresse, 'Adresse kopiert.') }, ic('kopie'), 'Kopieren'))),
          info('Webseite', o.infos && o.infos.webseite ? el('a', { href: o.infos.webseite, target: '_blank', rel: 'noopener' }, o.infos.webseite.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')) : null),
          info('Telefon', o.infos && o.infos.telefon ? el('a', { href: 'tel:' + o.infos.telefon.replace(/[^+\d]/g, '') }, o.infos.telefon) : null),
          info('Küche', [kueche, veg].filter(Boolean).join(', ') || null),
          info('Zugang', rollstuhl))),
      el('section', { class: 'abschnitt' }, el('h3', {}, 'Meine Notiz'), notiz, gespeichert,
        G.ich && G.ich.name && E.markTeilen !== false ? el('p', { class: 'leise klein', style: 'margin:4px 0 0' }, 'Notiz, Merken, Erledigt und Bewertung sieht deine Gruppe. Abschalten unter „Orte → Gemerkt“.') : null),
      el('section', { class: 'abschnitt nur-voll' }, el('h3', {}, 'Meine Bewertung'),
        el('div', { class: 'sterne', role: 'group', 'aria-label': 'Bewertung' }, [1, 2, 3, 4, 5].map((n) => el('button', {
          type: 'button', 'aria-pressed': String((m.sterne || 0) >= n), 'aria-label': `${n} von 5 Sternen`,
          onclick: () => { markiere(o.id, { sterne: m.sterne === n ? 0 : n }); zeichne({ scroll: true }); },
        }, ic('stern'))))),
      el('p', { class: 'quelle' }, 'Daten: OpenStreetMap', o.wiki ? ', Wikipedia' : '', o.bild ? ', Wikimedia Commons' : '', '.'));
  }

  // Ort an die Gruppe senden: läuft über den Live-Abgleich, nicht über fremde Apps
  function teilBox(o) {
    if (!G.ich || !G.ich.name) return el('div', { class: 'hilfe', style: 'margin-top:10px' }, el('span', {}, 'Tritt zuerst der Gruppe bei, dann kannst du Orte an alle senden.'),
      el('button', { type: 'button', class: 'knopf flach', onclick: () => { S.teilen = null; S.ort = null; S.tab = 'gruppe'; hoehe('gross'); zeichne(); } }, 'Zur Gruppe'));
    const feld = el('input', { id: 'teil-text', type: 'text', maxlength: '300', placeholder: 'Kommentar, z. B. „Hier um 15 Uhr?“ (freiwillig)', enterkeyhint: 'send', autocomplete: 'off', 'aria-label': 'Kommentar zum Ort' });
    const senden = () => {
      nachrichtSenden(feld.value, o.id);
      S.teilen = null; F.warteZeichnen = false; feld.blur();
      zeichne({ scroll: true, karte: false });
      toast(F.an && F.status.verbunden ? `${o.name} an die Gruppe gesendet.` : `${o.name} gespeichert. Geht raus, sobald Live verbunden ist.`);
    };
    feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); senden(); } });
    return el('section', { class: 'karte-box', style: 'margin-top:10px;display:grid;gap:8px' },
      el('strong', {}, 'An die Gruppe senden'),
      el('div', { class: 'feld' }, feld, el('button', { type: 'button', class: 'knopf haupt', onclick: senden }, 'Senden')),
      el('p', { class: 'leise klein', style: 'margin:0' }, 'Erscheint unter „Gruppe → Nachrichten“. Ein Tipp darauf öffnet den Ort.'));
  }
  function gruppeMarkBlock(o) {
    const r = gruppeMark(o.id);
    if (!r.fav.length && !r.fertig.length && !r.sterne.length && !r.notizen.length) return null;
    const schnitt = r.sterne.length ? (r.sterne.reduce((a, [, v]) => a + v, 0) / r.sterne.length).toFixed(1).replace('.', ',') : null;
    return el('section', { class: 'abschnitt' }, el('h3', {}, 'Aus der Gruppe'),
      el('ul', { class: 'klein', style: 'margin:0;padding-left:20px;display:grid;gap:4px' },
        r.fav.length ? el('li', {}, `Gemerkt: ${r.fav.join(', ')}`) : null,
        r.fertig.length ? el('li', {}, `Schon da gewesen: ${r.fertig.join(', ')}`) : null,
        r.sterne.length ? el('li', {}, `Bewertung: ${r.sterne.map(([n, v]) => `${n} ${v}`).join(', ')} (Schnitt ${schnitt} von 5)`) : null,
        r.notizen.map(([n, t]) => el('li', {}, el('b', {}, `${n}: `), t))));
  }
  function kopiere(text, meldung) {
    const ok = () => toast(meldung);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, () => toast(text));
    else toast(text);
  }


  // ---------- Navigation in der App ----------
  // Route: Valhalla der FOSSGIS e.V. (valhalla1.openstreetmap.de), so wie openstreetmap.org sie nutzt
  // (openstreetmap-website: config/settings.yml, engines/fossgis_valhalla.js). Regeln: höchstens 1 Anfrage/s, Namensnennung.
  // Felder laut Valhalla-Doku (docs/api/route/api-reference.md): maneuvers[].type/instruction/verbal_pre_transition_instruction/
  // begin_shape_index/length (km); shape = Polyline mit 6 Nachkommastellen; pedestrian: walking_speed, use_hills, step_penalty.
  const VALHALLA = 'https://valhalla1.openstreetmap.de/route';
  const PFEIL = {
    gerade: '<path d="M12 20V5M6 11l6-6 6 6"/>', rechts: '<path d="M6 20v-7a4 4 0 0 1 4-4h9M14 4l5 5-5 5"/>',
    links: '<path d="M18 20v-7a4 4 0 0 0-4-4H5M10 4 5 9l5 5"/>', leichtRechts: '<path d="M8 20v-6l9-9M11 5h6v6"/>',
    leichtLinks: '<path d="M16 20v-6L7 5M13 5H7v6"/>', wenden: '<path d="M8 20V9a4 4 0 0 1 8 0v4M13 10l3 3 3-3"/>',
    ziel: '<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>', kreisel: '<circle cx="12" cy="9" r="4"/><path d="M12 13v8"/>',
    faehre: '<path d="M3 17c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0M5 14l1.5-5h11L19 14M12 9V4"/>',
  };
  const TYP_PFEIL = (t) => ({ 4: 'ziel', 5: 'ziel', 6: 'ziel', 9: 'leichtRechts', 10: 'rechts', 11: 'rechts', 12: 'wenden', 13: 'wenden', 14: 'links', 15: 'links', 16: 'leichtLinks',
    18: 'rechts', 19: 'links', 20: 'rechts', 21: 'links', 23: 'leichtRechts', 24: 'leichtLinks', 26: 'kreisel', 27: 'kreisel', 28: 'faehre' }[t] || 'gerade');
  const N = { aktiv: false, ziel: null, route: null, cum: null, idx: 0, abseit: null, letzte: 0, gesagt: new Set(), linie: null, sperre: null, angekommen: false };

  function polyline(str, prec = 6) {
    const f = 10 ** prec, out = [];
    let i = 0, lat = 0, lon = 0;
    while (i < str.length) {
      for (const k of [0, 1]) {
        let b, s = 0, r = 0;
        do { b = str.charCodeAt(i++) - 63; r |= (b & 0x1f) << s; s += 5; } while (b >= 0x20);
        const d = r & 1 ? ~(r >> 1) : r >> 1;
        if (k === 0) lat += d; else lon += d;
      }
      out.push([lat / f, lon / f]);
    }
    return out;
  }
  const xy = (p, ref) => [(p[1] - ref[1]) * 111320 * Math.cos(ref[0] * Math.PI / 180), (p[0] - ref[0]) * 110540];

  async function holeRoute(von, ziel, mitOptionen = true) {
    const fuss = { walking_speed: E.tempo === 'gemuetlich' ? 4 : 5.1 };
    if (E.steigung) Object.assign(fuss, { use_hills: 0.1, step_penalty: 60 });
    const body = { locations: [{ lat: von.lat, lon: von.lon, radius: 10 }, { lat: ziel.lat, lon: ziel.lon, radius: 10 }], costing: 'pedestrian',
      directions_options: { units: 'km', language: 'de-DE' } };
    if (mitOptionen) body.costing_options = { pedestrian: fuss };
    const warte = N.letzte + 1100 - Date.now();
    if (warte > 0) await new Promise((r) => setTimeout(r, warte));
    N.letzte = Date.now();
    const r = await fetch(`${VALHALLA}?json=${encodeURIComponent(JSON.stringify(body))}`);
    const d = await r.json().catch(() => ({}));
    if (!d.trip || d.trip.status !== 0) {
      if (mitOptionen) return holeRoute(von, ziel, false);
      throw new Error(d.error || 'keine Route');
    }
    const leg = d.trip.legs[0];
    const pts = polyline(leg.shape, 6);
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + meter({ lat: pts[i - 1][0], lon: pts[i - 1][1] }, { lat: pts[i][0], lon: pts[i][1] }));
    return {
      pts, cum, laenge: cum[cum.length - 1], zeit: leg.summary.time,
      schritte: leg.maneuvers.map((m) => ({ typ: m.type, text: m.instruction, sag: m.verbal_pre_transition_instruction || m.instruction, start: m.begin_shape_index, laenge: (m.length || 0) * 1000 })),
    };
  }

  function sage(text) {
    if (!E.ansage || !text || !('speechSynthesis' in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-DE'; u.rate = E.profil === 'standard' ? 1 : 0.9;
      const v = speechSynthesis.getVoices().find((x) => /^de/i.test(x.lang));
      if (v) u.voice = v;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { /* ohne Ansage weiter */ }
  }
  async function wachHalten(an) {
    try {
      if (an && 'wakeLock' in navigator && !N.sperre) { N.sperre = await navigator.wakeLock.request('screen'); N.sperre.addEventListener('release', () => { N.sperre = null; }); }
      if (!an && N.sperre) { await N.sperre.release(); N.sperre = null; }
    } catch (e) { /* Gerät erlaubt es nicht: dann bleibt das Display nach System-Einstellung */ }
  }
  document.addEventListener('visibilitychange', () => { if (N.aktiv && document.visibilityState === 'visible') wachHalten(true); });

  function vorStart(o) {
    // Weite Ziele: zu Fuß ist Unsinn, Bahn oder Fähre vorschlagen
    const d = S.me && hatPos(o) ? meter(S.me, o) : null;
    if (d != null && d > 4000) {
      const nahMetro = ORTE.filter((x) => x.typ === 'metro' && hatPos(x)).sort((a, b) => meter(S.me, a) - meter(S.me, b))[0];
      const weg = o.ort === 'Cascais' ? { ziel: NACH_NAME.get('Bahnhof Cais do Sodré'), text: 'Das ist zu Fuß zu weit. Nach Cascais fährt der Zug ab Bahnhof Cais do Sodré.' }
        : o.ort === 'Almada' ? { ziel: NACH_NAME.get('Fähre Cais do Sodré'), text: 'Das ist zu Fuß zu weit und liegt auf der anderen Seite des Tejo. Die Fähre fährt ab Cais do Sodré nach Cacilhas.' }
          : { ziel: nahMetro, text: `Das ist zu Fuß zu weit. Mit der Metro geht es besser.${/Metro/.test(o.notiz || '') ? ` Tipp zum Ort: ${notizText(o)}.` : ''}` };
      setze($('#ansicht'), el('button', { type: 'button', class: 'knopf flach zurueck', onclick: () => zeichne() }, ic('zurueck'), 'Zurück'),
        el('h2', { class: 'ort-titel' }, `${strecke(d)} bis ${o.name}`),
        el('p', {}, weg.text),
        el('div', { style: 'display:grid;gap:8px' },
          weg.ziel ? el('button', { type: 'button', class: 'knopf haupt breit', onclick: () => starteNavi(weg.ziel, true) }, ic('route'), `Zu ${weg.ziel.name} führen`) : null,
          el('button', { type: 'button', class: 'knopf breit', onclick: () => starteNavi(o, true) }, 'Trotzdem zu Fuß führen')));
      hoehe('mitte');
      return;
    }
    starteNavi(o, true);
  }

  async function starteNavi(o, bestaetigt) {
    if (!hatPos(o)) { toast('Für diesen Ort fehlt der Kartenpunkt.'); return; }
    if (!bestaetigt) { vorStart(o); return; }
    Object.assign(N, { aktiv: true, ziel: o, route: null, idx: 0, abseit: null, gesagt: new Set(), angekommen: false, luft: false });
    document.body.dataset.navi = 'an';
    S.ort = null; S.follow = true;
    if (E.ansage && 'speechSynthesis' in window) { try { speechSynthesis.speak(new SpeechSynthesisUtterance('')); } catch (e) { /* iOS: Ton im Tipp freischalten */ } }
    wachHalten(true);
    naviPanel('Suche deinen Standort …');
    if (S.watchId == null) starteGps(true);
    if (S.me) await neueRoute();
  }

  async function neueRoute() {
    if (!N.aktiv || !S.me) return;
    naviPanel(N.route ? 'Neue Route …' : 'Route wird berechnet …');
    try {
      N.route = await holeRoute(S.me, N.ziel);
      N.idx = 0; N.abseit = null; N.gesagt = new Set(); N.luft = false;
      const route = N.route;
      ladeRaster().then((R) => { route.hm = hoehenmeter(R, route.pts); if (N.route === route && N.aktiv) naviUpdate(true); }).catch(() => {});
      zeichneRoute();
      naviUpdate(true);
      sage(N.route.schritte[0] && N.route.schritte[0].sag);
    } catch (e) {
      N.luft = true;
      zeichneLuftlinie();
      naviUpdate(true);
    }
  }

  function zeichneRoute() {
    if (!karte || !N.route) return;
    if (N.linie) N.linie.remove();
    N.linie = L.layerGroup([
      L.polyline(N.route.pts, { color: '#ffffff', weight: 11, opacity: 0.9, interactive: false }),
      L.polyline(N.route.pts, { className: 'navi-linie', color: '#1A73E8', weight: 7, opacity: 1, interactive: false }),
    ]).addTo(karte);
    karteZeichnen();
  }

  const RICHTUNG = ['Norden', 'Nordosten', 'Osten', 'Südosten', 'Süden', 'Südwesten', 'Westen', 'Nordwesten'];
  function peilung(a, b) {
    const r = Math.PI / 180, y = Math.sin((b.lon - a.lon) * r) * Math.cos(b.lat * r);
    const x = Math.cos(a.lat * r) * Math.sin(b.lat * r) - Math.sin(a.lat * r) * Math.cos(b.lat * r) * Math.cos((b.lon - a.lon) * r);
    return (Math.atan2(y, x) / r + 360) % 360;
  }
  function zeichneLuftlinie() {
    if (!karte || !S.me) return;
    if (N.linie) N.linie.remove();
    N.linie = L.layerGroup([L.polyline([[S.me.lat, S.me.lon], [N.ziel.lat, N.ziel.lon]], { color: '#1A73E8', weight: 5, dashArray: '2 10', lineCap: 'round', interactive: false })]).addTo(karte);
  }
  // Ohne Route vom Server: gerade Linie, Entfernung und Himmelsrichtung, bis die Route wieder geht
  function luftUpdate() {
    const d = meter(S.me, N.ziel);
    if (!N.angekommen && d < 25) { angekommen(); return; }
    zeichneLuftlinie();
    const richtung = RICHTUNG[Math.round(peilung(S.me, N.ziel) / 45) % 8];
    setze($('#navi-oben'), el('div', { class: 'pfeil', html: `<svg viewBox="0 0 24 24" aria-hidden="true">${PFEIL.gerade}</svg>` }),
      el('div', { class: 'navi-text' }, el('strong', {}, `${strecke(d)} Luftlinie`), el('span', {}, `Ziel liegt im ${richtung}. Die Fußroute lädt gerade nicht.`)));
    $('#navi-oben').hidden = false;
    const tempo = (E.tempo === 'gemuetlich' ? 4 : 5.1) / 3.6;
    naviPanel(null, false, { rest: d * 1.3, an: new Date(Date.now() + ((d * 1.3) / tempo) * 1000), luft: true });
    if (Date.now() - N.letzte > 30000) neueRoute();
  }
  function naviUpdate(neu) {
    if (N.aktiv && N.luft && !N.route && S.me) { luftUpdate(); return; }
    if (!N.aktiv || !N.route || !S.me) return;
    const R = N.route, ref = [S.me.lat, S.me.lon], p = [0, 0];
    let best = { d: Infinity, along: 0, i: 0 };
    for (let i = 0; i < R.pts.length - 1; i++) {
      const a = xy(R.pts[i], ref), b = xy(R.pts[i + 1], ref);
      const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
      const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0;
      const d = Math.hypot(a[0] + t * dx, a[1] + t * dy);
      if (d < best.d) best = { d, along: R.cum[i] + t * (R.cum[i + 1] - R.cum[i]), i };
    }
    const rest = Math.max(0, R.laenge - best.along);
    const zumZiel = meter(S.me, N.ziel);
    if (!N.angekommen && (rest < 20 || zumZiel < 25)) { angekommen(); return; }
    // Abseits der Route? Nach 12 s neu berechnen, höchstens alle 20 s
    const toleranz = Math.max(30, Math.min(S.me.acc || 0, 60));
    if (best.d > toleranz) { N.abseit = N.abseit || Date.now(); if (Date.now() - N.abseit > 12000 && Date.now() - N.letzte > 20000) { neueRoute(); return; } }
    else N.abseit = null;
    let k = R.schritte.findIndex((s) => R.cum[Math.min(s.start, R.cum.length - 1)] > best.along + 3);
    if (k < 0) k = R.schritte.length - 1;
    N.idx = k;
    const s = R.schritte[k];
    const bis = Math.max(0, R.cum[Math.min(s.start, R.cum.length - 1)] - best.along);
    if (bis <= 60 && !N.gesagt.has(k)) { N.gesagt.add(k); sage(s.sag); }
    const tempo = (E.tempo === 'gemuetlich' ? 4 : 5.1) / 3.6;
    const an = new Date(Date.now() + (rest / tempo) * 1000);
    setze($('#navi-oben'),
      el('div', { class: 'pfeil', html: `<svg viewBox="0 0 24 24" aria-hidden="true">${PFEIL[TYP_PFEIL(s.typ)]}</svg>` }),
      el('div', { class: 'navi-text' }, el('strong', {}, best.d > toleranz ? 'Abseits der Route' : `In ${strecke(bis)}`), el('span', {}, s.text)));
    $('#navi-oben').hidden = false;
    naviPanel(null, false, { rest, an, ab: best.d > toleranz });
    if (karte && S.follow) karte.panTo([S.me.lat, S.me.lon], { animate: !neu });
  }

  function naviPanel(meldung, fehler, info) {
    const box = $('#navi-unten');
    box.hidden = false;
    const beenden = el('button', { type: 'button', class: 'knopf warn', onclick: beendeNavi }, ic('x'), 'Beenden');
    const ansage = el('button', { type: 'button', class: 'knopf', 'aria-pressed': String(!!E.ansage), onclick: () => { E.ansage = !E.ansage; speichereE(); if (!E.ansage && 'speechSynthesis' in window) speechSynthesis.cancel(); naviPanel(meldung, fehler, info); } },
      ic(E.ansage ? 'ton' : 'tonAus'), E.ansage ? 'Ansage an' : 'Ansage aus');
    const kopf = el('div', { class: 'navi-kopf' },
      el('span', { class: 'marker g-' + gruppeVon(N.ziel.kategorie) }, symbol(N.ziel)),
      el('div', { class: 'was' }, el('small', {}, 'Navigation zu'), el('strong', {}, N.ziel.name)));
    if (meldung) {
      setze(box, kopf, el('p', { style: 'margin:6px 0 10px', class: fehler ? 'status zu' : 'leise' }, meldung),
        fehler ? el('div', { class: 'reihe' }, el('button', { type: 'button', class: 'knopf', onclick: neueRoute }, 'Nochmal')) : null,
        el('div', { class: 'reihe', style: 'margin-top:8px' }, beenden));
      return;
    }
    const schritte = el('ol', { class: 'schritte', hidden: !N.zeigeSchritte }, (N.route ? N.route.schritte : []).map((s, i) => el('li', { class: i === N.idx ? 'jetzt' : i < N.idx ? 'vorbei' : '' },
      el('span', { class: 'pfeil klein', html: `<svg viewBox="0 0 24 24" aria-hidden="true">${PFEIL[TYP_PFEIL(s.typ)]}</svg>` }), el('span', {}, s.text, s.laenge ? el('small', {}, ` · ${strecke(s.laenge)}`) : null))));
    setze(box, kopf,
      el('div', { class: 'navi-info' },
        el('strong', {}, `${Math.max(1, Math.round(info.rest / ((E.tempo === 'gemuetlich' ? 4 : 5.1) / 0.06)))} Min.`),
        el('span', {}, `${strecke(info.rest)} · Ankunft ${String(info.an.getHours()).padStart(2, '0')}:${String(info.an.getMinutes()).padStart(2, '0')}`),
        N.route && N.route.hm ? el('span', { class: 'leise klein' }, `Ganze Strecke ↑ ${N.route.hm.auf} m ↓ ${N.route.hm.ab} m (Copernicus, grob)`) : null),
      el('div', { class: 'reihe' }, ansage,
        el('button', { type: 'button', class: 'knopf', 'aria-expanded': String(!!N.zeigeSchritte), onclick: () => { N.zeigeSchritte = !N.zeigeSchritte; naviPanel(null, false, info); } }, ic('plan'), 'Schritte'),
        beenden),
      schritte,
      el('p', { class: 'quelle' }, 'Route: ', el('a', { href: 'https://valhalla.openstreetmap.de/', target: '_blank', rel: 'noopener' }, 'Valhalla (FOSSGIS)'),
        ' · Daten © OpenStreetMap · ', el('a', { href: 'https://www.openstreetmap.org/fixthemap', target: '_blank', rel: 'noopener' }, 'Kartenfehler melden')));
    masseNavi();
  }
  function masseNavi() { requestAnimationFrame(() => document.documentElement.style.setProperty('--navi-h', `${$('#navi-unten').offsetHeight}px`)); }

  function angekommen() {
    N.angekommen = true;
    sage(`Du bist angekommen: ${N.ziel.name}.`);
    $('#navi-oben').hidden = true;
    const o = N.ziel;
    const naechster = S.tab === 'plan' ? planStopps().find(({ o: x }) => x.id !== o.id && !mk(x.id).fertig) : null;
    setze($('#navi-unten'),
      el('div', { class: 'leer', style: 'padding:6px 0' }, fasan(), el('strong', { style: 'font-size:var(--fs-t)' }, `Angekommen: ${o.name}`)),
      el('div', { style: 'display:grid;gap:8px' },
        naechster ? el('button', { type: 'button', class: 'knopf haupt breit', onclick: () => { markiere(o.id, { fertig: true }); beendeNavi(); starteNavi(naechster.o); } },
          ic('haken'), `Erledigt, weiter zu ${naechster.o.name}`) : el('button', { type: 'button', class: 'knopf haupt breit', onclick: () => { markiere(o.id, { fertig: true }); beendeNavi(); } }, ic('haken'), 'Als erledigt markieren'),
        el('button', { type: 'button', class: 'knopf breit', onclick: () => { beendeNavi(); oeffneOrt(o.id); } }, 'Ort ansehen'),
        el('button', { type: 'button', class: 'knopf flach breit', onclick: beendeNavi }, 'Beenden')));
    masseNavi();
  }

  function beendeNavi() {
    Object.assign(N, { aktiv: false, route: null, angekommen: false, zeigeSchritte: false });
    if (N.linie) { N.linie.remove(); N.linie = null; }
    $('#navi-oben').hidden = true; $('#navi-unten').hidden = true;
    delete document.body.dataset.navi;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    wachHalten(false);
    hoehe(S.hoehe); zeichne({ anpassen: true });
  }


  // ---------- Reiseinfos (Wunsch 25.10.2026) ----------
  // Inhalte mit Quelle und Stand aus info-pt.json (Recherchen docs/recherche/2026-10-25-*.md). Ungeklärtes steht nicht drin.
  // „Auf einen Blick“ vergleicht mit dem Herkunftsland aus „Über dich“: Stecker und Spannung (laender.json aus Wikidata, CC0),
  // Währung, Zeit (Zeitzonen des Browsers, IANA), Roaming (EU-Mitglied laut Liste unten).
  let INFO = null, LAENDER_D = null, infoLaedt = false;
  const EU = 'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE'.split(' ');
  const ZONE = { DE: 'Europe/Berlin', AT: 'Europe/Vienna', CH: 'Europe/Zurich', NL: 'Europe/Amsterdam', BE: 'Europe/Brussels', LU: 'Europe/Luxembourg', FR: 'Europe/Paris',
    IT: 'Europe/Rome', PL: 'Europe/Warsaw', CZ: 'Europe/Prague', DK: 'Europe/Copenhagen', SE: 'Europe/Stockholm', NO: 'Europe/Oslo', FI: 'Europe/Helsinki', GB: 'Europe/London', IE: 'Europe/Dublin', PT: 'Europe/Lisbon' };
  const WAEHRUNG_FEST = { DE: 'EUR', AT: 'EUR', CH: 'CHF' };
  function ladeInfo() {
    if (INFO || infoLaedt) return;
    infoLaedt = true;
    Promise.all([fetch('info-pt.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('laender.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).catch(() => null)])
      .then(([i, l]) => { INFO = i || { fehler: true }; LAENDER_D = l && l.laender ? l : null; })
      .finally(() => { infoLaedt = false; if (S.tab === 'info' && !S.ort) zeichne({ scroll: true, karte: false }); });
  }
  function zoneVersatz(zone, t = new Date()) {
    try {
      const teil = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' }).formatToParts(t).find((x) => x.type === 'timeZoneName').value;
      const m = /GMT([+-])(\d{2}):(\d{2})/.exec(teil); return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]) : 0;
    } catch (e) { return null; }
  }
  function infoQuelle(keys, kurz) {
    const q = (keys || []).map((k) => INFO.quellen[k]).filter(Boolean);
    if (!q.length) return null;
    const name = (x) => (kurz ? x.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : x.titel);
    return el('small', { class: 'quelle info-q' }, q.length > 1 ? 'Quellen: ' : 'Quelle: ',
      q.map((x, i) => [i ? '; ' : '', el('a', { href: x.url, target: '_blank', rel: 'noopener' }, name(x)), `, ${x.stand}`]));
  }
  function blickKacheln() {
    const k = INFO.kurz, her = E.herkunft || 'DE', ld = LAENDER_D && LAENDER_D.laender, heimat = landName(her), ziel = landName(INFO.land);
    const kachel = (titel, wert, text, q) => el('div', { class: 'blick' }, el('small', {}, titel), el('strong', {}, wert), text ? el('span', {}, text) : null, q ? infoQuelle([q], true) : null);
    // Strom
    let strom;
    const st = k.strom, hs = ld && ld[her];
    if (her === INFO.land) strom = kachel('Strom', `Typ ${st.stecker.join(', ')}`, `${st.spannung} V, ${st.frequenz} Hz`, st.q);
    else if (st.passtVon && st.passtVon[her]) strom = kachel('Strom', 'Kein Adapter nötig', `Typ ${st.stecker.join(', ')}, ${st.spannung} V. Stecker aus ${heimat} passen.`, st.q);
    else if (hs && hs.stecker && hs.stecker.length) {
      const fehlt = hs.stecker.filter((x) => !st.stecker.includes(x));
      const volt = hs.spannung && hs.spannung.length && !hs.spannung.includes(st.spannung);
      strom = kachel('Strom', fehlt.length ? 'Adapter nötig' : 'Stecker passen', `Hier Typ ${st.stecker.join(', ')}, ${st.spannung} V. ${fehlt.length ? `Stecker Typ ${fehlt.join(', ')} von zu Hause passen nicht.` : ''}${volt ? ` Bei dir ${hs.spannung.join('/')} V: prüfe, ob deine Geräte ${st.spannung} V vertragen.` : ''}`.trim(), st.q);
    } else strom = kachel('Strom', `Typ ${st.stecker.join(', ')}`, `${st.spannung} V, ${st.frequenz} Hz. Vergleiche mit deinen Steckern.`, st.q);
    // Geld
    const hw = (ld && ld[her] && ld[her].waehrung && ld[her].waehrung[0]) || WAEHRUNG_FEST[her];
    const geld = kachel('Geld', k.waehrung.name, hw ? (hw === k.waehrung.code ? 'Wie zu Hause.' : `Bei dir: ${hw}. Umrechnung am Automaten ablehnen, wenn sie angeboten wird.`) : null, k.waehrung.q);
    // Zeit
    const zh = ZONE[her], dz = zh ? zoneVersatz(INFO.zeitzone) - zoneVersatz(zh) : null;
    const zeit = kachel('Uhrzeit', dz == null || Number.isNaN(dz) ? new Intl.DateTimeFormat('de-DE', { timeZone: INFO.zeitzone, hour: '2-digit', minute: '2-digit' }).format(new Date()) + ' Uhr'
      : dz === 0 ? 'Gleiche Zeit' : `${Math.abs(dz / 60).toString().replace('.', ',')} Std. ${dz < 0 ? 'früher' : 'später'}`, dz ? `Als in ${heimat}. Hier jetzt ${new Intl.DateTimeFormat('de-DE', { timeZone: INFO.zeitzone, hour: '2-digit', minute: '2-digit' }).format(new Date())} Uhr.` : null);
    const notruf = el('a', { class: 'blick notruf-blick', href: 'tel:' + k.notruf.nummer }, el('small', {}, 'Notruf'), el('strong', {}, k.notruf.nummer), el('span', {}, k.notruf.text), infoQuelle([k.notruf.q], true));
    const handy = kachel('Handy', k.eu && EU.includes(her) ? 'EU-Roaming' : 'Tarif prüfen', k.eu && EU.includes(her) ? 'Keine Aufschläge auf den Inlandspreis.' : `Roaming-Kosten aus ${heimat} beim Anbieter klären.`, k.eu && EU.includes(her) ? 'ROAM' : null);
    const wasser = kachel('Leitungswasser', 'Vom Versorger geprüft', k.wasser.text, k.wasser.q);
    void ziel;
    return el('div', { class: 'blick-raster' }, strom, geld, zeit, notruf, handy, wasser);
  }
  function sprich(text) {
    try {
      const st = window.speechSynthesis; if (!st) return;
      const v = st.getVoices().find((x) => /^pt[-_]PT/i.test(x.lang)) || st.getVoices().find((x) => /^pt/i.test(x.lang));
      if (!v) { toast('Auf diesem Handy ist keine portugiesische Stimme installiert.'); return; }
      st.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/\s*\/.*$/, '').replace(/…/g, '')); u.voice = v; u.lang = v.lang; u.rate = 0.85; st.speak(u); haptik();
    } catch (e) { /* egal */ }
  }
  function zeichneInfo(box) {
    ladeInfo();
    const zurueck = el('button', { type: 'button', class: 'knopf flach', style: 'margin:0 0 4px -8px', onclick: () => { S.tab = 'mehr'; speicher.set('tab', 'mehr'); zeichne(); } }, ic('zurueck'), 'Mehr');
    if (!INFO) { setze(box, zurueck, el('p', { class: 'leise' }, 'Lädt …')); return; }
    if (INFO.fehler) { setze(box, zurueck, el('p', {}, 'Die Reiseinfos konnten nicht geladen werden. Ohne Netz geht es erst, wenn sie einmal geladen wurden.')); return; }
    const her = E.herkunft || 'DE';
    const teil = (t, offen) => {
      const d = el('details', { class: 'info-teil' }, el('summary', {}, t.titel),
        t.eintraege.map((x) => el('div', { class: 'info-eintrag' }, el('strong', {}, x.t), el('p', {}, x.x), infoQuelle(x.q))));
      if (offen) d.open = true;
      return d;
    };
    const sp = INFO.sprache, kann = E.sprachen && E.sprachen[INFO.sprache];
    const gruppen = [];
    for (const z of sp.saetze) { let g = gruppen.find((x) => x[0] === z[0]); if (!g) gruppen.push(g = [z[0], []]); g[1].push(z); }
    if (E.essen === 'vegetarisch' || E.essen === 'vegan') { const r = gruppen.find((x) => x[0] === 'Restaurant'); if (r) r[1].sort((a, b) => (/[Vv]egetari/.test(b[1]) ? 1 : 0) - (/[Vv]egetari/.test(a[1]) ? 1 : 0)); }
    const stimme = 'speechSynthesis' in window;
    const sprache = el('details', { class: 'info-teil sprache' }, el('summary', {}, sp.titel),
      el('p', { class: 'leise klein' }, sp.hinweis),
      el('p', { class: 'info-dank' }, sp.dank),
      el('ul', { class: 'info-regeln' }, sp.regeln.map((r) => el('li', {}, r))),
      gruppen.map(([g, l]) => el('div', { class: 'satz-gruppe' }, el('h4', {}, g),
        l.map(([, de, pt, aus, einQ]) => el('div', { class: 'satz' },
          el('div', { class: 'satz-text' }, el('small', {}, de, einQ ? ' · nicht doppelt geprüft' : ''), el('strong', { lang: 'pt-PT' }, pt), el('span', { class: 'aussprache' }, aus)),
          stimme ? el('button', { type: 'button', class: 'haken', 'aria-label': `„${pt}“ vorlesen`, onclick: () => sprich(pt) }, ic('ton')) : null)))),
      infoQuelle(sp.q));
    if (!kann || kann === 'nein' || kann === 'wenig') sprache.open = true;
    setze(box, zurueck,
      el('h2', { class: 'ort-titel', style: 'margin-top:0' }, `${landName(INFO.land)} · ${INFO.ort}`),
      el('p', { class: 'leise klein', style: 'margin:2px 0 12px' }, `Stand ${datumDe(INFO.stand)} · für dich aus ${landName(her)} `,
        el('button', { type: 'button', class: 'knopf flach', style: 'min-height:44px;padding:0 6px', onclick: () => { S.tab = 'mehr'; zeichne(); } }, 'ändern')),
      el('h3', { class: 'live-h', style: 'margin-top:0' }, 'Auf einen Blick'), blickKacheln(),
      INFO.teile.map((t) => teil(t, t.id === 'regeln')), sprache,
      el('p', { class: 'quelle', style: 'margin-top:12px' }, 'Nur belegte Angaben, jede mit Quelle und Stand. Was wir nicht sicher belegen konnten, steht nicht hier. Stecker und Währung anderer Länder: Wikidata (CC0)', LAENDER_D ? `, abgerufen ${uhrzeit(Date.parse(LAENDER_D.stand))}.` : '.'));
  }

  // ---------- Über dich (Wunsch 25.10.2026) ----------
  // Herkunft (für Strom, Geld, Zeit und Recht im Vergleich), Gehtempo, Steigungen, Sprachen, Essen. Bleibt auf diesem Handy.
  // Ländercodes ISO 3166-1 alpha-2; Namen liefert der Browser (Intl.DisplayNames, Unicode CLDR).
  const LAENDER = ('AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ '
    + 'EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT '
    + 'LU LV LY MA MC MD ME MG MH MK ML MM MN MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL '
    + 'SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS XK YE ZA ZM ZW').split(' ');
  const landName = (c) => { try { return new Intl.DisplayNames(['de'], { type: 'region' }).of(c) || c; } catch (e) { return c; } };
  function herkunftRaten() {
    for (const l of navigator.languages || [navigator.language || '']) { const m = /-([A-Z]{2})$/i.exec(l || ''); if (m && LAENDER.includes(m[1].toUpperCase())) return m[1].toUpperCase(); }
    return 'DE';
  }
  if (!E.sprachen) E.sprachen = {};
  // teil: 'herkunft' (Herkunft, zu Fuß), 'sprache' (Sprachen, Essen) oder 'alles'
  function profilTeil(teil, neu) {
    if (!E.herkunft) { E.herkunft = herkunftRaten(); speichereE(); }
    const seg = (label, opts, wert, fn) => el('div', { class: 'profil-frage' }, el('span', { class: 'profil-label' }, label),
      el('div', { class: 'segmente', role: 'group', 'aria-label': label }, opts.map(([id, n]) => el('button', { type: 'button', 'aria-pressed': String(wert === id),
        onclick: () => { fn(id); speichereE(); haptik(); neu(); } }, n))));
    const oben = ['DE', 'AT', 'CH'];
    const sortiert = LAENDER.filter((c) => !oben.includes(c)).map((c) => [c, landName(c)]).sort((a, b) => a[1].localeCompare(b[1], 'de'));
    const land = el('select', { class: 'auswahl', 'aria-label': 'Woher kommst du?' },
      oben.map((c) => el('option', { value: c }, landName(c))), el('option', { disabled: '' }, '──────────'), sortiert.map(([c, n]) => el('option', { value: c }, n)));
    land.value = E.herkunft;
    land.addEventListener('change', () => { E.herkunft = land.value; speichereE(); haptik(); neu(); });
    const teile = [];
    if (teil !== 'sprache') teile.push(
      el('div', { class: 'profil-frage' }, el('span', { class: 'profil-label' }, 'Woher kommst du?'), land,
        el('span', { class: 'leise klein' }, 'Danach richten sich Hinweise zu Strom, Geld, Zeit und Recht.')),
      seg('Wie bist du zu Fuß?', [['gemuetlich', 'Gemütlich'], ['normal', 'Normal']], E.tempo, (id) => { E.tempo = id; }),
      seg('Steigungen und Treppen', [['ja', 'Lieber meiden'], ['nein', 'Kein Problem']], E.steigung ? 'ja' : 'nein', (id) => { E.steigung = id === 'ja'; }),
      el('span', { class: 'leise klein' }, 'Gemütlich heißt etwa 4 km/h, normal etwa 5 km/h. „Meiden“ wählt etwas längere, bequemere Wege.'));
    if (teil !== 'herkunft') teile.push(
      seg('Portugiesisch', [['nein', 'Gar nicht'], ['wenig', 'Ein paar Worte'], ['gut', 'Gut']], E.sprachen.pt || 'nein', (id) => { E.sprachen.pt = id; }),
      seg('Englisch', [['nein', 'Kaum'], ['wenig', 'Etwas'], ['gut', 'Gut']], E.sprachen.en || 'wenig', (id) => { E.sprachen.en = id; }),
      seg('Essen', [['alles', 'Alles'], ['vegetarisch', 'Vegetarisch'], ['vegan', 'Vegan']], E.essen || 'alles', (id) => { E.essen = id; }));
    return el('div', { class: 'profil' }, teile);
  }

  // ---------- Einführung beim ersten Start ----------
  // Kurz (6 Karten), jederzeit überspringbar, unter „Mehr“ wieder abrufbar. Der Fasan tritt hier auf (ruhiger Bereich).
  // Einführung: vier kurze Seiten, „Weiter“ immer sichtbar unten, Standort erst im Zusammenhang (Recherche: natives-gefuehl.md)
  function zeigeEinfuehrung(seite = 0, richtung = 1) {
    const box = $('#einfuehrung');
    const leiste = [['live', 'Live', 'Frei laufen: Karte folgt dir, Gruppe und Nähe'], ['plan', 'Plan', 'Euer Tag, Stopp für Stopp'], ['orte', 'Orte', 'Suche, Filter, Gemerkt, „In der Nähe“'],
      ['gruppe', 'Gruppe', 'Abstimmen, Nachrichten, Kosten'], ['mehr', 'Mehr', 'Schrift, Aussehen, Notfall']];
    const legende = [['restaurant', 'g-essen', 'Essen'], ['restaurant', 'g-veggie', 'Vegetarisch'], ['museum', 'g-sehen', 'Sehen'], ['aussicht', 'g-aussicht', 'Aussicht'],
      ['bar', 'g-abends', 'Abends'], ['metro', 'g-verkehr', 'Verkehr'], ['shop', 'g-shoppen', 'Shoppen'], ['korb', 'g-nah', 'Supermarkt']];
    const schrift = () => el('div', { class: 'segmente', role: 'group', 'aria-label': 'Schriftgröße', style: 'width:100%' },
      [['standard', 'Normale Schrift'], ['einfach', 'Große Schrift']].map(([id, n]) => el('button', { type: 'button', 'aria-pressed': String(E.profil === id || (id === 'einfach' && E.profil === 'lesbar')), onclick: () => { E.profil = id; speichereE(); wendeAn(); haptik(); zeigeEinfuehrung(seite, 0); } }, n)));
    const seiten = [
      { titel: 'Willkommen in Lissabon', text: 'Eure Karte für die Reise: Tagespläne, alle Orte und der Weg zu Fuß. Ohne Konto, ohne Werbung.',
        bild: () => el('div', { style: 'display:grid;gap:18px;justify-items:center;width:100%' }, fasan('einf-fasan'), schrift()) },
      { oben: true, titel: 'Über dich', text: 'Damit Wege, Zeiten und Hinweise zu dir passen. Alles bleibt auf diesem Handy und lässt sich unter „Mehr“ ändern.',
        bild: () => profilTeil('herkunft', () => zeigeEinfuehrung(seite, 0)) },
      { oben: true, titel: 'Sprache und Essen', text: 'Danach zeigt die App passende Sätze und vegetarische Orte zuerst.',
        bild: () => profilTeil('sprache', () => zeigeEinfuehrung(seite, 0)) },
      { titel: 'Unten ist alles', text: 'Fünf Bereiche, immer im Daumenbereich.', bild: () => el('ul', { class: 'einf-liste' }, leiste.map(([i, n, t]) => el('li', {}, el('span', { class: 'einf-icon' }, ic(i)), el('span', {}, el('strong', {}, n), el('small', {}, t))))) },
      { titel: 'Karte und Symbole', text: 'Tippe auf einen Punkt. „Hinführen“ zeigt den Weg und sagt jede Abbiegung an. Das Blatt unten ziehst du mit dem Finger größer oder kleiner.',
        bild: () => el('div', { class: 'einf-legende' }, legende.map(([typ, g, n]) => el('span', {}, el('span', { class: `marker ${g}` }, symbol({ typ, kategorie: '' })), n))) },
      { titel: 'Gemeinsam unterwegs', text: 'Unter „Gruppe“ zeigst du deinen QR-Code. Danach gleicht sich alles von selbst ab: Stimmen, Nachrichten, Treffpunkt und auf Wunsch dein Standort.',
        bild: () => el('div', { class: 'segmente stimme', style: 'width:100%' }, el('button', { type: 'button', class: 'ja', 'aria-pressed': 'true', tabindex: '-1' }, ic('hoch'), 'Will hin'), el('button', { type: 'button', class: 'nein', tabindex: '-1' }, ic('runter'), 'Lieber nicht')) },
    ];
    const letzte = seite === seiten.length - 1;
    const ende = () => { box.classList.add('weg'); haptik(); setTimeout(() => { box.hidden = true; box.classList.remove('weg'); }, 260); speicher.set('einfuehrung', true); hoehe(S.hoehe); zeichne({ anpassen: true }); };
    const weiter = () => { haptik(); if (letzte) ende(); else zeigeEinfuehrung(seite + 1, 1); };
    const s2 = seiten[seite];
    setze(box, el('div', { class: 'einf-karte', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'einf-titel' },
      el('div', { class: 'einf-oben' },
        el('div', { class: 'einf-punkte', 'aria-label': `Seite ${seite + 1} von ${seiten.length}`, role: 'img' }, seiten.map((_, i) => el('span', { class: i === seite ? 'an' : i < seite ? 'war' : '' }))),
        letzte ? el('span') : el('button', { type: 'button', class: 'knopf flach einf-ueber', onclick: ende }, 'Überspringen')),
      el('div', { class: 'einf-inhalt ' + (richtung > 0 ? 'von-rechts' : richtung < 0 ? 'von-links' : '') }, s2.oben ? [el('h2', { id: 'einf-titel' }, s2.titel), el('p', {}, s2.text), s2.bild()] : [s2.bild(), el('h2', { id: 'einf-titel' }, s2.titel), el('p', {}, s2.text)]),
      el('div', { class: 'einf-knoepfe' },
        seite ? el('button', { type: 'button', class: 'knopf', 'aria-label': 'Zurück', onclick: () => { haptik(); zeigeEinfuehrung(seite - 1, -1); } }, ic('zurueck')) : null,
        el('button', { type: 'button', class: 'knopf haupt', onclick: weiter }, letzte ? 'Los geht’s' : 'Weiter', letzte ? null : el('span', { class: 'pfeil-weiter', 'aria-hidden': 'true' }, '→')))));
    box.hidden = false;
    const f = box.querySelector('.knopf.haupt'); if (f) f.focus({ preventScroll: true });
  }
  // Wischen als Zwilling der Knöpfe
  let einfX = null;
  document.addEventListener('touchstart', (e) => { einfX = e.target.closest('#einfuehrung') ? e.touches[0].clientX : null; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (einfX == null) return;
    const dx = e.changedTouches[0].clientX - einfX; einfX = null;
    const punkte = $$('#einfuehrung .einf-punkte span');
    if (!punkte.length || Math.abs(dx) < 60) return;
    const i = punkte.findIndex((p) => p.classList.contains('an'));
    if (dx < 0 && i < punkte.length - 1) zeigeEinfuehrung(i + 1, 1); else if (dx > 0 && i > 0) zeigeEinfuehrung(i - 1, -1);
  }, { passive: true });

  // ---------- Stadtführer beim Gehen ----------
  // Dezent: Kommt ihr einem Ort mit belegtem Text nahe, blinkt nur dieser Ort auf der Karte (kein Text, keine Vibration).
  // Antippen zeigt den Text mit Quelle. Jeder Ort lässt sich dauerhaft ausblenden, alle Hinweise unter „Mehr“.
  // Radius 60 m, nur bei Genauigkeit ≤ 50 m, höchstens alle 3 Minuten, jeder Ort einmal am Tag, nicht während „Hinführen“.
  // Der Ring verschwindet ab 150 m Abstand oder nach 10 Minuten. Alle Werte sind Setzungen: Die Recherche
  // (kosten-und-fuehrung.md) fand keine belegten Zahlen; Android-Geofences liegen bei 100–150 m.
  const NAEHE = { radius: 60, genau: 50, pause: 180000, weg: 150, dauer: 600000 };
  let naeheZuletzt = 0, naeheAktiv = null, naeheRing = null, naeheTimer = null;
  // Für Screenreader: kurze Ansage statt sichtbarer Karte
  const naeheAnsage = el('div', { class: 'nur-vorlesen', 'aria-live': 'polite' });
  document.body.append(naeheAnsage);
  function naeheAus() { return speicher.get('naeheAus', []); }
  function naeheEntfernen() {
    clearTimeout(naeheTimer);
    if (naeheRing) { naeheRing.remove(); naeheRing = null; }
    naeheAktiv = null;
  }
  function naeheKarteZu() {
    const box = $('#naehe');
    if (box.dataset.art !== 'fuehrer') return;
    box.classList.remove('an'); setTimeout(() => { if (!box.classList.contains('an')) box.hidden = true; }, 250);
  }
  function naeheHinweis(p) {
    if (naeheAktiv && p && meter(p, naeheAktiv) > NAEHE.weg) naeheEntfernen();
    if (E.fuehrer === false || N.aktiv || !p || p.acc > NAEHE.genau || naeheAktiv || Date.now() - naeheZuletzt < NAEHE.pause) return;
    if (!SF) { ladeFuehrer(); return; }
    const heute = new Date().toDateString();
    const gezeigt = speicher.get('naeheGezeigt', {});
    if (gezeigt.tag !== heute) { gezeigt.tag = heute; gezeigt.ids = []; }
    const aus = naeheAus();
    const kand = [];
    for (const o of ORTE) if (o.wiki && hatPos(o)) { const d = meter(p, o); if (d < NAEHE.radius) kand.push({ id: o.id, d, lat: o.lat, lon: o.lon, titel: o.name, text: o.wiki.text.split('\n')[0], ort: o }); }
    for (const x of SF.artikel || []) { const d = meter(p, { lat: x[0], lon: x[1] }); if (d < NAEHE.radius) kand.push({ id: `w-${x[5]}`, d, lat: x[0], lon: x[1], titel: x[2], text: x[3], stand: x[4], pid: x[5] }); }
    const k = kand.filter((x) => !gezeigt.ids.includes(x.id) && !aus.includes(x.id)).sort((a, b) => (a.ort ? -1 : 0) - (b.ort ? -1 : 0) || a.d - b.d)[0];
    if (!k) return;
    naeheZuletzt = Date.now();
    gezeigt.ids.push(k.id);
    // Derselbe Ort aus Wikipedia nicht noch einmal (z. B. „Igreja de São Roque (Lissabon)“)
    if (k.ort) for (const x of kand) if (!x.ort && falte(x.titel).startsWith(falte(k.titel))) gezeigt.ids.push(x.id);
    speicher.set('naeheGezeigt', gezeigt);
    naeheAktiv = k;
    naeheRingZeichnen();
    naeheTimer = setTimeout(naeheEntfernen, NAEHE.dauer);
    naeheAnsage.textContent = `In der Nähe: ${k.titel}. Auf der Karte markiert.`;
  }
  function naeheRingZeichnen() {
    if (!karte || !naeheAktiv) return;
    if (naeheRing) naeheRing.remove();
    const k = naeheAktiv;
    // Eigene Ebene: bleibt stehen, wenn die übrigen Punkte neu gezeichnet werden
    naeheRing = L.marker([k.lat, k.lon], { icon: L.divIcon({ className: 'naehe-ring', html: '<span class="r"></span>', iconSize: [64, 64], iconAnchor: [32, 32] }),
      title: `In der Nähe: ${k.titel}. Antippen für mehr`, alt: `In der Nähe: ${k.titel}`, keyboard: true, zIndexOffset: 1000 })
      .on('click', (e) => { L.DomEvent.stopPropagation(e); naeheZeigen(); })
      .addTo(karte);
  }
  function naeheZeigen() {
    const k = naeheAktiv; if (!k) return;
    haptik();
    const el0 = naeheRing && naeheRing.getElement(); if (el0) el0.classList.add('gesehen');
    const box = $('#naehe'); box.dataset.art = 'fuehrer';
    const kurz = k.text.length > 240 ? `${k.text.slice(0, 240).replace(/\s+\S*$/, '')} …` : k.text;
    const ausblenden = () => {
      const liste = naeheAus(); if (!liste.includes(k.id)) liste.push(k.id); speicher.set('naeheAus', liste);
      naeheKarteZu(); naeheEntfernen(); haptik(12);
      toast(`„${k.titel}“ meldet sich nicht mehr.`, { aktion: 'Rückgängig', fn: () => { speicher.set('naeheAus', naeheAus().filter((x) => x !== k.id)); } });
    };
    const alleAus = () => {
      E.fuehrer = false; speichereE(); naeheKarteZu(); naeheEntfernen(); haptik(12);
      toast('Hinweise sind aus. Wieder an unter „Mehr“.', { aktion: 'Rückgängig', fn: () => { E.fuehrer = true; speichereE(); } });
    };
    setze(box, el('div', { class: 'naehe-karte', role: 'dialog', 'aria-label': `In der Nähe: ${k.titel}` },
      el('div', { class: 'naehe-kopf' }, el('span', { class: 'marker g-nah mini', html: `<svg viewBox="0 0 24 24" aria-hidden="true">${SYMBOL.buch}</svg>` }),
        el('strong', {}, k.titel), el('button', { type: 'button', class: 'naehe-zu', 'aria-label': 'Schließen', onclick: naeheKarteZu }, ic('x'))),
      el('p', {}, kurz),
      el('p', { class: 'quelle', style: 'margin:0 0 6px' }, k.ort ? 'Wikipedia (CC BY-SA)' : `Wikipedia (CC BY-SA)${k.stand ? `, Stand ${datumDe(k.stand)}` : ''}`),
      el('div', { class: 'naehe-fuss' },
        k.ort ? el('button', { type: 'button', class: 'knopf haupt', onclick: () => { naeheKarteZu(); oeffneOrt(k.ort.id); } }, 'Ansehen')
          : el('button', { type: 'button', class: 'knopf haupt', onclick: () => { naeheKarteZu(); S.tab = 'orte'; S.nah = 'wiki'; S.nahWahl = k.id; S.ort = null; hoehe('mitte'); zeichne({ anpassen: true }); } }, 'Mehr lesen'),
        el('button', { type: 'button', class: 'knopf', onclick: ausblenden }, 'Diesen Ort nie mehr'),
        el('button', { type: 'button', class: 'knopf flach', onclick: alleAus }, 'Alle Hinweise aus'))));
    box.hidden = false; requestAnimationFrame(() => box.classList.add('an'));
  }

  // ---------- Standort ----------
  function gpsKnopf() {
    const b = $('#btn-standort');
    b.dataset.zustand = S.watchId == null ? 'aus' : !S.me ? 'sucht' : S.follow ? 'folgt' : 'an';
    b.setAttribute('aria-label', S.follow ? 'Karte folgt deinem Standort' : 'Mein Standort');
  }
  // Eigener Standort: eigene Ebene über allen Punkten und Namen (Leaflet: markerPane 600, tooltipPane 650, popupPane 700;
  // leafletjs.com/reference.html#map-pane), nicht antippbar, damit darunterliegende Orte erreichbar bleiben.
  // Grau, wenn die letzte Position älter als 30 s ist; blasser bei Genauigkeit schlechter als 100 m.
  function zeichneIch() {
    if (!karte || !S.me) return;
    const p = [S.me.lat, S.me.lon];
    if (!karte.getPane('ich')) { const pane = karte.createPane('ich'); pane.style.zIndex = 660; pane.style.pointerEvents = 'none'; }
    if (!ichKreis) ichKreis = L.circle(p, { radius: S.me.acc, className: 'ich-genau', interactive: false }).addTo(karte);
    if (!ichPunkt) ichPunkt = L.marker(p, { pane: 'ich', interactive: false, keyboard: false, icon: L.divIcon({ className: 'ich-punkt', html: '<span class="kegel"></span><span class="halo"></span><span class="kern"></span>', iconSize: [32, 32], iconAnchor: [16, 16] }) }).addTo(karte);
    ichKreis.setLatLng(p).setRadius(S.me.acc);
    ichPunkt.setLatLng(p);
    ichZustand();
  }
  function ichZustand() {
    const e = ichPunkt && ichPunkt.getElement();
    if (!e || !S.me) return;
    e.classList.toggle('alt', Date.now() - (S.meZeit || 0) > 30000);
    e.classList.toggle('ungenau', S.me.acc > 100);
  }
  setInterval(ichZustand, 10000);
  function starteGps(folgen = true) {
    if (!('geolocation' in navigator)) { toast('Dieses Gerät gibt keinen Standort heraus.'); return; }
    if (S.watchId != null) { if (folgen && S.me) { S.follow = true; zeigeAufKarte(S.me); gpsKnopf(); } return; }
    // Erster Tipp: Standort zeigen und Plan sichtbar lassen. Zweiter Tipp: Karte folgt dir.
    S.follow = N.aktiv && folgen;
    S.watchId = navigator.geolocation.watchPosition(aufPosition, aufFehler, { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 });
    gpsKnopf();
    // Kompass und Blickrichtung laufen mit dem Standort; iOS fragt dabei einmal um Erlaubnis (Geste = dieser Tipp)
    if (!BLICK.an && !E.richtungAus) richtungUmschalten(true);
  }
  function aufPosition(p) {
    const neu = { lat: p.coords.latitude, lon: p.coords.longitude, acc: Math.min(p.coords.accuracy || 0, 2000) };
    const erst = !S.me;
    S.me = neu; S.meZeit = Date.now();
    zeichneIch();
    if (teileOrt()) funkOrt(neu);
    naeheHinweis(neu);
    if (karte && erst && !N.aktiv && !S.ort && !S.follow) karteZeichnen(true);
    else if (S.follow && karte) { if (erst) zeigeAufKarte(neu, 17); else karte.panTo(mitteFuer(neu, karte.getZoom()), { animate: true }); }
    if (N.aktiv) { if (!N.route && !N.letzteVersuch) { N.letzteVersuch = Date.now(); neueRoute().finally(() => { N.letzteVersuch = 0; }); } else naviUpdate(); gpsKnopf(); return; }
    if (!S.meAlt || meter(S.meAlt, neu) > 40) { S.meAlt = neu; if (!S.ort) zeichne({ scroll: true, karte: false }); }
    else if (S.tab === 'live' && !S.ort && !S.nah && (!S.liveAlt || meter(S.liveAlt, neu) > 12 || Date.now() - S.liveZeit > 15000)) { S.liveAlt = neu; S.liveZeit = Date.now(); neuZeichnen(); }
    gpsKnopf();
  }
  function aufFehler(e) {
    if (e.code === 1) {
      if (S.watchId != null) navigator.geolocation.clearWatch(S.watchId);
      S.watchId = null; S.follow = false;
      toast(IOS ? 'Standort gesperrt. iPhone: Einstellungen → Datenschutz → Ortungsdienste → Safari-Websites → „Beim Verwenden“. Dann die Seite neu laden.'
        : 'Standort gesperrt. Chrome: links in der Adresszeile auf das Symbol tippen → Berechtigungen → Standort erlauben. Dann neu laden.', { aktion: 'Neu laden', fn: () => location.reload() });
    } else if (e.code === 3 && S.me) {
      /* kurze Funklöcher: letzte Position bleibt gültig */
    } else if (Date.now() - S.fehlerZeit > 60000) { S.fehlerZeit = Date.now(); toast('Standort gerade nicht verfügbar. Draußen klappt es meist besser.'); }
    gpsKnopf();
  }

  // ---------- Meldungen und Hilfe im Moment ----------
  let toastTimer = null;
  function toast(text, opt = {}) {
    const t = $('#toast');
    setze(t, el('span', {}, text), opt.aktion ? el('button', { type: 'button', onclick: () => { t.hidden = true; opt.fn(); } }, opt.aktion) : null);
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, opt.aktion ? 6500 : 4000);
  }
  // Hilfe im Moment: ein kurzer Hinweis direkt am Element, nur beim ersten Mal (Fasan: Grossman & Fitzmaurice 2010)
  function hilfe(key, text) {
    if (speicher.get('hilfe:' + key, false)) return null;
    const box = el('div', { class: 'hilfe', role: 'note' }, el('span', {}, text));
    box.append(el('button', { type: 'button', class: 'knopf flach', onclick: () => { speicher.set('hilfe:' + key, true); box.remove(); } }, 'Verstanden'));
    return box;
  }

  // ---------- Bedienung ----------
  $$('#leiste [data-tab]').forEach((b) => b.addEventListener('click', () => {
    const neu = b.dataset.tab;
    if (S.ort) { S.ort = null; try { history.replaceState(null, '', location.pathname); } catch (e) { /* egal */ } }
    if (neu === S.tab && S.hoehe !== 'klein') { $('#ansicht').scrollTop = 0; }
    if (neu !== S.tab && (neu === 'live' || S.tab === 'live')) { S.nah = null; S.nahWahl = null; }
    S.tab = neu; speicher.set('tab', neu);
    haptik();
    if (neu === 'live') { hoehe('mini'); zeichne({ anpassen: false }); liveStart(); return; }
    if (neu === 'mehr' || neu === 'gemerkt' || neu === 'gruppe') hoehe('gross'); else if (S.hoehe === 'gross' && neu === 'plan') hoehe('mitte');
    zeichne({ anpassen: true });
  }));
  $('#griff').addEventListener('click', () => (S.hoehe === 'gross' ? hoehe('klein') : groesser()));
  // Blatt folgt dem Finger. Beim Loslassen rastet es ein; ein Wisch zählt mit seinem Schwung
  // (Projektion: Weg = (v/1000) · r / (1 − r), v in px/s, r = 0,99; Wisch ab 500 px/s geht mindestens eine Raste weiter;
  // Gummiband (1 − 1/(x · 0,55/d + 1)) · d. Quelle: docs/recherche/2026-10-24-natives-gefuehl.md). Sichtbarer Zwilling: der Griff.
  const zug = { an: false };
  const zone = $('#blatt');
  zone.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || window.innerWidth >= 760) return;
    const t = e.touches[0], inhalt = e.target.closest('#ansicht');
    Object.assign(zug, { an: true, los: false, y0: t.clientY, x0: t.clientX, h0: blattPx(), inhalt: !!inhalt, pkt: [[e.timeStamp, t.clientY]] });
  }, { passive: true });
  zone.addEventListener('touchmove', (e) => {
    if (!zug.an) return;
    const t = e.touches[0], dy = t.clientY - zug.y0;
    if (!zug.los) {
      if (Math.abs(dy) < 8 || Math.abs(t.clientX - zug.x0) > Math.abs(dy)) return;
      const ansicht = $('#ansicht');
      // Im Inhalt: nach unten nur ganz oben, nach oben nur solange das Blatt nicht groß ist; sonst scrollt der Inhalt
      if (zug.inhalt && ((dy > 0 && ansicht.scrollTop > 0) || (dy < 0 && S.hoehe === 'gross'))) { zug.an = false; return; }
      zug.los = true; document.body.classList.add('zieht');
    }
    e.preventDefault();
    const p = stufenPx();
    let h = zug.h0 - dy;
    const gummi = (x2) => (1 - 1 / ((x2 * 0.55) / innerHeight + 1)) * innerHeight;
    if (h > p.gross) h = p.gross + gummi(h - p.gross);
    if (h < p.mini) h = p.mini - gummi(p.mini - h);
    setzeBlatt(h);
    zug.pkt.push([e.timeStamp, t.clientY]); if (zug.pkt.length > 5) zug.pkt.shift();
  }, { passive: false });
  const zugEnde = () => {
    if (!zug.an) return;
    zug.an = false;
    if (!zug.los) return;
    document.body.classList.remove('zieht');
    const [t0, y0] = zug.pkt[0], [t1, y1] = zug.pkt[zug.pkt.length - 1];
    const v = t1 > t0 ? (y1 - y0) / (t1 - t0) : 0; // px/ms, positiv = nach unten
    const ziel = blattPx() - (v * 1000 / 1000) * 0.99 / (1 - 0.99);
    const p = stufenPx();
    let naechste = STUFEN.reduce((a, b) => (Math.abs(p[b] - ziel) < Math.abs(p[a] - ziel) ? b : a), 'mini');
    // Schneller Wisch (ab 500 px/s): mindestens eine Raste in Wischrichtung
    const start = STUFEN.reduce((a, b) => (Math.abs(p[b] - zug.h0) < Math.abs(p[a] - zug.h0) ? b : a), 'mini');
    const i0 = STUFEN.indexOf(start), i1 = STUFEN.indexOf(naechste);
    if (v < -0.5 && i1 <= i0) naechste = STUFEN[Math.min(3, i0 + 1)];
    if (v > 0.5 && i1 >= i0) naechste = STUFEN[Math.max(0, i0 - 1)];
    hoehe(naechste, { spuerbar: true });
    karte && karte.invalidateSize({ pan: false });
  };
  zone.addEventListener('touchend', zugEnde, { passive: true });
  zone.addEventListener('touchcancel', zugEnde, { passive: true });

  const suche = $('#suche');
  suche.addEventListener('focus', () => { hoehe('gross'); if (S.tab !== 'orte') { S.tab = 'orte'; S.ort = null; zeichne(); } });
  suche.addEventListener('input', () => { S.suche = suche.value; $('#suche-leeren').hidden = !S.suche; if (S.ort) S.ort = null; if (S.tab !== 'orte') S.tab = 'orte'; zeichne({ anpassen: true }); });
  suche.addEventListener('keydown', (e) => { if (e.key === 'Enter') suche.blur(); });
  $('#suche-leeren').addEventListener('click', () => { suche.value = ''; S.suche = ''; $('#suche-leeren').hidden = true; zeichne({ anpassen: true }); suche.focus(); });
  $('#btn-standort').addEventListener('click', () => starteGps(true));
  $('#btn-kompass').addEventListener('click', () => { haptik(); if (!BLICK.an && S.watchId == null) { E.richtungAus = false; speichereE(); starteGps(false); return; } richtungUmschalten(); });
  kompassZeichnen();
  addEventListener('resize', () => { hoehe(S.hoehe); if (karte) karte.invalidateSize(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.ort) schliesseOrt(); });

  // ---------- Start ----------
  wendeAn();
  hoehe('klein');
  gpsKnopf();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  const lade = (u) => fetch(u, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });
  Promise.all([lade('orte.json'), lade('plaene.json')]).then(([orte, plaene]) => {
    ORTE = orte; PLAENE = plaene;
    ORTE.forEach((o) => { NACH_NAME.set(o.name, o); NACH_ID.set(o.id, o); });
    eigeneEinbauen();
    zeichne({ anpassen: true });
    if (!speicher.get('einfuehrung', false) && !/^#g=/.test(location.hash)) { zeigeEinfuehrung(0); E.profilGefragt = 1; speichereE(); }
    else if (!E.profilGefragt) {
      // Wer die Einführung schon kannte: einmal auf die neuen Fragen „Über dich“ hinweisen
      E.profilGefragt = 1; speichereE();
      setTimeout(() => toast('Neu: Erzähl kurz über dich (Herkunft, Tempo, Sprache, Essen).', { aktion: 'Öffnen', fn: () => { S.tab = 'mehr'; S.ort = null; hoehe('gross'); zeichne(); } }), 2500);
    }
    importiereAusHash();
    funkStart(); leisteZahl(); teileMarkierungen();
    if (E.teilenBis && !teileOrt()) { E.teilenBis = 0; speichereE(); }
    if (teileOrt()) { if (S.watchId == null) starteGps(false); setTimeout(() => toast(`Du teilst deinen Standort mit der Gruppe bis ${uhrzeit(E.teilenBis)}.`, { aktion: 'Beenden', fn: () => { teilenEnde(); zeichne({ scroll: true, karte: false }); } }), 1500); }
    fetch('wetter.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).then((w) => { if (w && (w.ipma || w.om)) { W = w; if (S.tab === 'plan' && !S.ort) zeichne({ scroll: true, karte: false }); } }).catch(() => {});
    const h = /^#ort-(.+)$/.exec(location.hash);
    if (h && NACH_ID.has(h[1])) { try { history.replaceState(null, '', location.pathname); } catch (e) { /* egal */ } oeffneOrt(h[1]); }
    $('#laden').classList.add('weg');
    setTimeout(() => $('#laden').remove(), 400);
  }).catch(() => {
    setze($('#laden'), fasan(), el('b', {}, 'Die Orte konnten nicht geladen werden.'), el('button', { type: 'button', class: 'knopf haupt', onclick: () => location.reload() }, 'Neu laden'));
  });
})();
