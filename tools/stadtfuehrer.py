#!/usr/bin/env python3
"""Stadtführer: deutschsprachige Wikipedia-Artikel mit Koordinaten in Lissabon (und am Fluss), mit Kurztext und Stand.

Quellen und Grenzen (geprüft 24.10.2026):
- GeoData-Erweiterung, list=geosearch: gsradius bis MaxGeoSearchRadius (Wikimedia: 10 000 m), gslimit bis
  ApiBase::LIMIT_BIG1 = 500 (Quelltext mediawiki-extensions-GeoData, includes/Api/QueryGeoSearch.php).
- TextExtracts, prop=extracts mit exintro: höchstens 20 Seiten je Abfrage.
Läuft nur in GitHub Actions, höchstens einmal in sechs Tagen. Texte: Wikipedia, CC BY-SA 4.0.
Schreibt site/stadtfuehrer.json: [lat, lon, Titel, Text, Stand der letzten Änderung (JJJJ-MM-TT), Seiten-ID].
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta

UA = 'Fasan-Karte/1.9 (+https://github.com/CUK999/Fasan-Karte)'
API = 'https://de.wikipedia.org/w/api.php'
ZIEL = 'site/stadtfuehrer.json'
# Mittelpunkte, Umkreis 1800 m: Baixa, Bairro Alto, Alfama/Graça, Avenida, Estrela, Alcântara, Belém, Cacilhas, Parque das Nações
MITTEN = [(38.7106, -9.1386), (38.7128, -9.1460), (38.7150, -9.1290), (38.7250, -9.1470), (38.7140, -9.1600),
          (38.7040, -9.1780), (38.6960, -9.2070), (38.6870, -9.1480), (38.7680, -9.0940)]


def frisch():
    try:
        d = json.load(open(ZIEL, encoding='utf-8'))
        return datetime.now(timezone.utc) - datetime.fromisoformat(d['stand']) < timedelta(days=6)
    except Exception:  # noqa: BLE001
        return False


def api(**p):
    p.update(format='json', formatversion='2')
    url = API + '?' + urllib.parse.urlencode(p)
    for versuch in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:  # noqa: BLE001
            print('API-Fehler', e)
            time.sleep(3 * (versuch + 1))
    return {}


def main():
    if frisch():
        print('stadtfuehrer.json ist jünger als 6 Tage, kein neuer Abruf')
        return 0
    seiten = {}
    for lat, lon in MITTEN:
        d = api(action='query', list='geosearch', gscoord=f'{lat}|{lon}', gsradius=1800, gslimit=500, gsnamespace=0)
        for g in (d.get('query') or {}).get('geosearch', []):
            seiten.setdefault(g['pageid'], {'titel': g['title'], 'lat': g['lat'], 'lon': g['lon']})
        time.sleep(0.5)
    print('Artikel mit Koordinaten:', len(seiten))
    ids = list(seiten)
    for i in range(0, len(ids), 20):
        teil = ids[i:i + 20]
        d = api(action='query', pageids='|'.join(map(str, teil)), prop='extracts|revisions', exintro=1, explaintext=1,
                exsentences=3, exlimit=20, rvprop='timestamp')
        for p in (d.get('query') or {}).get('pages', []):
            s = seiten.get(p.get('pageid'))
            if not s:
                continue
            s['text'] = re.sub(r'\s+', ' ', (p.get('extract') or '')).strip()
            rev = (p.get('revisions') or [{}])[0].get('timestamp', '')
            s['stand'] = rev[:10]
        time.sleep(0.3)
    aus = []
    for pid, s in seiten.items():
        t = s.get('text') or ''
        if len(t) < 60 or s['titel'].startswith('Liste '):
            continue
        aus.append([round(s['lat'], 6), round(s['lon'], 6), s['titel'], t[:480], s.get('stand', ''), pid])
    with open(ZIEL, 'w', encoding='utf-8') as f:
        json.dump({'stand': datetime.now(timezone.utc).isoformat(timespec='minutes'), 'quelle': 'de.wikipedia.org', 'lizenz': 'CC BY-SA 4.0',
                   'artikel': aus}, f, ensure_ascii=False, separators=(',', ':'))
    print('Gespeichert:', len(aus), 'Artikel; Beispiele:', [a[2] for a in aus[:15]])
    return 0


if __name__ == '__main__':
    sys.exit(main())
