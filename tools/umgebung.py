#!/usr/bin/env python3
"""„In der Nähe“: Supermärkte, Toiletten, Apotheken, Geldautomaten und Trinkwasser aus OpenStreetMap (Overpass API).

Läuft nur in GitHub Actions; höchstens einmal am Tag (Overpass-Nutzungsregeln: sparsam abfragen,
https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances).
Schreibt site/umgebung.json (Daten © OpenStreetMap-Mitwirkende, ODbL).
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta

UA = 'Fasan-Karte/1.7 (+https://github.com/CUK999/Fasan-Karte)'
ZIEL = 'site/umgebung.json'
SERVER = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter']
# (Süd, West, Nord, Ost): Lissabon mit Belém, Almada am Fluss, Küste Carcavelos–Cascais
GEBIETE = [(38.690, -9.235, 38.800, -9.085), (38.660, -9.175, 38.695, -9.140), (38.670, -9.440, 38.715, -9.320)]
FILTER = {
    's': ['["shop"="supermarket"]'],
    'wc': ['["amenity"="toilets"]'],
    'apo': ['["amenity"="pharmacy"]'],
    'atm': ['["amenity"="atm"]', '["amenity"="bank"]["atm"="yes"]'],
    'wasser': ['["amenity"="drinking_water"]'],
    'kh': ['["amenity"="hospital"]["emergency"="yes"]'],
}


def frisch():
    try:
        d = json.load(open(ZIEL, encoding='utf-8'))
        return 'kh' in d and datetime.now(timezone.utc) - datetime.fromisoformat(d['stand']) < timedelta(hours=20)
    except Exception:  # noqa: BLE001
        return False


def abfrage():
    teile = []
    for f in sum(FILTER.values(), []):
        for b in GEBIETE:
            teile.append(f'nwr{f}({b[0]},{b[1]},{b[2]},{b[3]});')
    return '[out:json][timeout:120];(' + ''.join(teile) + ');out center tags;'


def hole():
    daten = urllib.parse.urlencode({'data': abfrage()}).encode()
    for url in SERVER:
        for versuch in range(2):
            try:
                req = urllib.request.Request(url, data=daten, headers={'User-Agent': UA})
                with urllib.request.urlopen(req, timeout=180) as r:
                    return json.loads(r.read().decode('utf-8')), url
            except Exception as e:  # noqa: BLE001
                print(f'{url} Versuch {versuch + 1}: {e}')
                time.sleep(10)
    return None, None


def art(t):
    if t.get('shop') == 'supermarket':
        return 's'
    a = t.get('amenity')
    if a == 'hospital':
        return 'kh'
    return {'toilets': 'wc', 'pharmacy': 'apo', 'atm': 'atm', 'bank': 'atm', 'drinking_water': 'wasser'}.get(a)


def main():
    if frisch():
        print('umgebung.json ist jünger als 20 Stunden, kein neuer Abruf')
        return 0
    d, url = hole()
    if not d:
        print('Overpass nicht erreichbar, alte Datei bleibt')
        return 0
    aus = {'stand': datetime.now(timezone.utc).isoformat(timespec='minutes'), 'quelle': url, 's': [], 'wc': [], 'apo': [], 'atm': [], 'wasser': [], 'kh': []}
    gesehen = set()
    for e in d.get('elements', []):
        t = e.get('tags') or {}
        k = art(t)
        if not k:
            continue
        lat = e.get('lat') or (e.get('center') or {}).get('lat')
        lon = e.get('lon') or (e.get('center') or {}).get('lon')
        if lat is None or lon is None:
            continue
        schluessel = (k, round(lat, 5), round(lon, 5))
        if schluessel in gesehen:
            continue
        gesehen.add(schluessel)
        name = t.get('name') or t.get('brand') or ''
        oh = t.get('opening_hours') or ''
        if k == 's':
            aus['s'].append([round(lat, 6), round(lon, 6), name, t.get('brand') or '', oh])
        elif k == 'wc':
            aus['wc'].append([round(lat, 6), round(lon, 6), name, t.get('fee') or '', oh, t.get('wheelchair') or ''])
        elif k == 'apo':
            aus['apo'].append([round(lat, 6), round(lon, 6), name, oh])
        elif k == 'atm':
            aus['atm'].append([round(lat, 6), round(lon, 6), t.get('operator') or t.get('brand') or name, oh])
        elif k == 'kh':
            aus['kh'].append([round(lat, 6), round(lon, 6), name, t.get('phone') or t.get('contact:phone') or ''])
        else:
            aus['wasser'].append([round(lat, 6), round(lon, 6)])
    os.makedirs('site', exist_ok=True)
    with open(ZIEL, 'w', encoding='utf-8') as f:
        json.dump(aus, f, ensure_ascii=False, separators=(',', ':'))
    marken = {}
    for x in aus['s']:
        m = x[3] or x[2]
        marken[m] = marken.get(m, 0) + 1
    print('Server:', url)
    print({k: len(v) for k, v in aus.items() if isinstance(v, list)})
    print('Supermarkt-Marken:', sorted(marken.items(), key=lambda kv: -kv[1])[:30])
    return 0


if __name__ == '__main__':
    sys.exit(main())
