#!/usr/bin/env python3
"""Fußwege der festen Pläne (A, B, C) mit Länge, Gehzeit und Höhenmetern.

- Weg: Valhalla der FOSSGIS e.V. (valhalla1.openstreetmap.de, wie openstreetmap.org), Kosten „pedestrian“,
  höchstens 1 Anfrage pro Sekunde, Ergebnisse im Cache (data/wege-cache.json), nur Neues wird angefragt.
- Höhe: Raster aus tools/hoehe.py (Copernicus DEM GLO-30). Abtasten alle 15 m entlang des Wegs, bilinear.
  Anstieg und Abstieg mit Hysterese 5 m: Das ist der Wert, den BRouter für 1″-Daten nutzt
  (docs/recherche/2026-10-24-hoehendaten.md, Abschnitt 3). Abtastabstand 15 m ist eine Setzung.
- Paare mit mehr als 2,5 km Luftlinie gelten als Bahn/Bus und werden nicht als Fußweg berechnet (wie die Zeitleiste).
Schreibt site/wege.json: {"wege": {"idA>idB": [Meter, Sekunden, auf, ab, polyline6]}, "h": {ortId: Höhe in m}}.
"""
import gzip
import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone

UA = 'Fasan-Karte/2.8 (+https://github.com/CUK999/Fasan-Karte)'
VALHALLA = 'https://valhalla1.openstreetmap.de/route'
CACHE = 'data/wege-cache.json'
ZIEL = 'site/wege.json'
ABSTAND, HYST, BAHN_AB = 15.0, 5.0, 2500.0


def meter(a, b):
    r = 6371000.0
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = p2 - p1, math.radians(b[1] - a[1])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def dekodiere(s, genau=6):
    pts, i, lat, lon, f = [], 0, 0, 0, 10 ** genau
    while i < len(s):
        for k in range(2):
            v = sh = 0
            while True:
                b = ord(s[i]) - 63; i += 1
                v |= (b & 0x1f) << sh; sh += 5
                if b < 0x20:
                    break
            d = ~(v >> 1) if v & 1 else v >> 1
            if k == 0:
                lat += d
            else:
                lon += d
        pts.append((lat / f, lon / f))
    return pts


class Raster:
    def __init__(self):
        k = json.load(open('site/hoehe.json', encoding='utf-8'))
        roh = gzip.decompress(open('site/hoehe.bin', 'rb').read())
        import array
        a = array.array('h'); a.frombytes(roh)
        if sys.byteorder != 'little':
            a.byteswap()
        w, h = k['breite'], k['hoehe']
        for r in range(h):  # Zeilen-Differenzen zurückrechnen
            o = r * w
            for c in range(1, w):
                a[o + c] = (a[o + c] + a[o + c - 1] + 32768) % 65536 - 32768
        self.k, self.a, self.w, self.h = k, a, w, h

    def an(self, lat, lon):
        k = self.k
        x = (lon - k['west']) / k['dx'] - 0.5
        y = (k['nord'] - lat) / k['dy'] - 0.5
        x0, y0 = int(math.floor(x)), int(math.floor(y))
        if x0 < 0 or y0 < 0 or x0 + 1 >= self.w or y0 + 1 >= self.h:
            return None
        fx, fy = x - x0, y - y0
        g = lambda r, c: self.a[r * self.w + c] * k['skala']  # noqa: E731
        return (g(y0, x0) * (1 - fx) * (1 - fy) + g(y0, x0 + 1) * fx * (1 - fy) + g(y0 + 1, x0) * (1 - fx) * fy + g(y0 + 1, x0 + 1) * fx * fy)


def profil(r, pts):
    """Abtasten alle ABSTAND m, Hysterese HYST m: Anstieg und Abstieg."""
    hs, rest = [], 0.0
    for i in range(len(pts)):
        if i == 0:
            hs.append(r.an(*pts[0])); continue
        a, b = pts[i - 1], pts[i]
        d = meter(a, b)
        t = ABSTAND - rest
        while t <= d:
            f = t / d
            hs.append(r.an(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)); t += ABSTAND
        rest = d - (t - ABSTAND)
    hs.append(r.an(*pts[-1]))
    hs = [x for x in hs if x is not None]
    if len(hs) < 2:
        return 0, 0
    auf = ab = 0.0
    ref = hs[0]
    for x in hs[1:]:
        if x - ref >= HYST:
            auf += x - ref; ref = x
        elif ref - x >= HYST:
            ab += ref - x; ref = x
    return round(auf), round(ab)


def schritte(plaene, p, tag):
    s = (plaene.get(p) or {}).get('tage', {}).get(tag)
    if isinstance(s, str):
        s = (plaene.get(s) or {}).get('tage', {}).get(tag)
    return s if isinstance(s, list) else []


def main():
    try:
        plaene = json.load(open('site/plaene.json', encoding='utf-8'))
        orte = json.load(open('site/orte.json', encoding='utf-8'))
        r = Raster()
    except Exception as e:  # noqa: BLE001
        print('Eingaben fehlen, keine Wege:', e)
        return 0
    nach_name = {o['name']: o for o in orte if isinstance(o.get('lat'), (int, float))}
    cache = json.load(open(CACHE, encoding='utf-8')) if os.path.exists(CACHE) else {}
    paare = {}
    for p in ('A', 'B', 'C'):
        for tag in ('sa', 'so', 'mo'):
            st = [nach_name[s['ort']] for s in schritte(plaene, p, tag) if s.get('ort') in nach_name]
            for a, b in zip(st, st[1:]):
                if a['id'] != b['id'] and meter((a['lat'], a['lon']), (b['lat'], b['lon'])) <= BAHN_AB:
                    paare[f"{a['id']}>{b['id']}"] = (a, b)
    neu = 0
    for key, (a, b) in paare.items():
        ck = f"{a['lat']:.5f},{a['lon']:.5f}>{b['lat']:.5f},{b['lon']:.5f}"
        if ck in cache:
            continue
        body = {'locations': [{'lat': a['lat'], 'lon': a['lon']}, {'lat': b['lat'], 'lon': b['lon']}], 'costing': 'pedestrian',
                'directions_options': {'units': 'km'}, 'directions_type': 'none'}
        url = VALHALLA + '?json=' + urllib.parse.quote(json.dumps(body, separators=(',', ':')))
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=30) as resp:
                d = json.loads(resp.read().decode('utf-8'))
            t = d['trip']
            cache[ck] = [round(t['summary']['length'] * 1000), round(t['summary']['time']), t['legs'][0]['shape']]
            neu += 1
        except Exception as e:  # noqa: BLE001
            print('Valhalla-Fehler', key, e)
        time.sleep(1.1)
    os.makedirs('data', exist_ok=True)
    json.dump(cache, open(CACHE, 'w', encoding='utf-8'), separators=(',', ':'))
    wege = {}
    for key, (a, b) in paare.items():
        ck = f"{a['lat']:.5f},{a['lon']:.5f}>{b['lat']:.5f},{b['lon']:.5f}"
        if ck not in cache:
            continue
        m, s, form = cache[ck]
        auf, ab = profil(r, dekodiere(form))
        wege[key] = [m, s, auf, ab, form]
    hoehen = {}
    for o in orte:
        if isinstance(o.get('lat'), (int, float)):
            h = r.an(o['lat'], o['lon'])
            if h is not None:
                hoehen[o['id']] = round(h)
    json.dump({'stand': datetime.now(timezone.utc).isoformat(timespec='minutes'), 'quelle': 'Wege: Valhalla (FOSSGIS e.V.), Daten © OpenStreetMap-Mitwirkende (ODbL). Höhe: Copernicus DEM GLO-30.',
               'regel': f'Abtastung {ABSTAND:.0f} m, Hysterese {HYST:.0f} m (BRouter-Wert für 1″-Daten)', 'wege': wege, 'h': hoehen},
              open(ZIEL, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('Paare', len(paare), 'neu angefragt', neu, 'mit Weg', len(wege), 'Orte mit Höhe', len(hoehen))
    for key in list(wege)[:5]:
        m, s, auf, ab, _ = wege[key]
        print(' ', key, f'{m} m, {s // 60} Min., auf {auf} m, ab {ab} m')
    return 0


if __name__ == '__main__':
    sys.exit(main())
