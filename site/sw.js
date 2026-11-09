/* Offline zuerst: App-Hülle und Daten liegen im Gerät, Bilder nach dem ersten Ansehen.
   Kartenkacheln regelt der Browser-Cache (OSM-Regeln: kein Vorab-Herunterladen). */
const KERN = 'fk-kern-v39';
const BILDER = 'fk-bilder-v1';
// Bibliotheken und Erkennungs-Modelle (bis ~28 MB): eigener Speicher, Gerät zuerst; bleibt bei App-Updates erhalten
const VENDOR = 'fk-vendor-v1';
const DATEIEN = ['./', 'index.html', 'style.css', 'app.js', 'oeffnungszeiten.js', 'orte.json', 'plaene.json',
  'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css', 'vendor/qrcode/qrcode.js', 'vendor/nostr/nostr.bundle.js', 'funk.js', 'bon.js', 'bonbild.js', 'scan.js', 'ocr.js', 'speisen.js', 'wetter.json', 'umgebung.json', 'stadtfuehrer.json', 'info-pt.json', 'laender.json', 'wege.json', 'hoehe.json', 'hoehe.bin', 'fasan-aufbruch.svg', 'manifest.webmanifest', 'icon-180.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(KERN).then((c) => Promise.all(DATEIEN.map((d) => c.add(d).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => ![KERN, BILDER, VENDOR].includes(k)).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/vendor/') && !e.request.headers.get('range')) {
    e.respondWith(caches.open(VENDOR).then((c) => c.match(e.request).then((r) => r || fetch(e.request).then((n) => { if (n.ok) c.put(e.request, n.clone()); return n; }).catch(() => caches.match(e.request, { ignoreSearch: true })))));
    return;
  }
  if (url.pathname.includes('/bilder/')) {
    e.respondWith(caches.open(BILDER).then((c) => c.match(e.request).then((r) => r || fetch(e.request).then((n) => { if (n.ok) c.put(e.request, n.clone()); return n; }))));
    return;
  }
  // Netz zuerst, damit Änderungen sofort ankommen; ohne Netz aus dem Gerät
  e.respondWith(fetch(e.request).then((n) => {
    if (n.ok) { const k = n.clone(); caches.open(KERN).then((c) => c.put(e.request, k)); }
    return n;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
});
