#!/usr/bin/env python3
"""Länder-Grundinfos weltweit aus Wikidata (CC0): Steckertypen, Spannung, Frequenz, Währung, Notrufnummern,
Fahrseite, Amtssprachen. Fundament für weltweite Reisen: Die App vergleicht Herkunft und Ziel (Adapter? Währung?).

Quelle: Wikidata Query Service (query.wikidata.org), Lizenz CC0. Eigenschaften laut Recherche
docs/recherche/2026-10-25-laenderdaten-weltweit.md: P297 ISO-Code, P2853 Steckertyp, P2884 Netzspannung,
P2885 Netzfrequenz (nicht bestätigt), P38 Währung (P498 ISO 4217), P2852 Notrufnummer, P1622 Fahrseite, P37 Amtssprache (P218).
Läuft höchstens alle 30 Tage. Schreibt site/laender.json. Ohne Antwort bleibt die alte Datei.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta

UA = 'Fasan-Karte/2.6 (+https://github.com/CUK999/Fasan-Karte)'
ZIEL = 'site/laender.json'
ABFRAGE = """
SELECT ?iso ?stecker ?steckerLabel ?alias ?spannung ?frequenz ?waehrung ?notrufLabel ?seiteLabel ?sprache WHERE {
  ?land wdt:P31 wd:Q3624078; wdt:P297 ?iso .
  OPTIONAL { ?land wdt:P2853 ?stecker . OPTIONAL { ?stecker skos:altLabel ?alias . FILTER(LANG(?alias) = "en") } }
  OPTIONAL { ?land wdt:P2884 ?spannung . }
  OPTIONAL { ?land wdt:P2885 ?frequenz . }
  OPTIONAL { ?land wdt:P38 ?w . ?w wdt:P498 ?waehrung . }
  OPTIONAL { ?land wdt:P2852 ?notruf . }
  OPTIONAL { ?land wdt:P1622 ?seite . }
  OPTIONAL { ?land wdt:P37 ?sp . ?sp wdt:P218 ?sprache . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
"""
# Fahrseite aus der englischen Bezeichnung des Werts („right-hand traffic“, „left-hand traffic“), nicht aus geratenen Kennungen
VERSION = 2
# Steckertyp-Buchstabe aus Bezeichnung oder Alias („Type F“, „Schuko“ …)
NAMEN = {'europlug': 'C', 'schuko': 'F', 'bs 1363': 'G', 'nema 1-15': 'A', 'nema 5-15': 'B'}


def frisch():
    try:
        d = json.load(open(ZIEL, encoding='utf-8'))
        return d.get('v') == VERSION and datetime.now(timezone.utc) - datetime.fromisoformat(d['stand']) < timedelta(days=30)
    except Exception:  # noqa: BLE001
        return False


def typ(*texte):
    for t in texte:
        t = (t or '').strip()
        m = re.search(r'\btype\s+([A-N])\b', t, re.I)
        if m:
            return m.group(1).upper()
        for k, v in NAMEN.items():
            if k in t.lower():
                return v
    return None


def main():
    if frisch():
        print('laender.json ist jünger als 30 Tage, kein neuer Abruf')
        return 0
    url = 'https://query.wikidata.org/sparql?' + urllib.parse.urlencode({'query': ABFRAGE, 'format': 'json'})
    d = None
    for versuch in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'application/sparql-results+json'})
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.loads(r.read().decode('utf-8'))
            break
        except Exception as e:  # noqa: BLE001
            print('Wikidata-Fehler', e)
            time.sleep(10 * (versuch + 1))
    if not d:
        print('Wikidata nicht erreichbar, alte Datei bleibt')
        return 0
    laender = {}
    for b in d['results']['bindings']:
        g = lambda k: (b.get(k) or {}).get('value')  # noqa: E731
        iso = (g('iso') or '').upper()
        if not re.fullmatch(r'[A-Z]{2}', iso):
            continue
        x = laender.setdefault(iso, {'stecker': set(), 'spannung': set(), 'frequenz': set(), 'waehrung': set(), 'notruf': set(), 'seite': set(), 'sprachen': set()})
        t = typ(g('steckerLabel'), g('alias'))
        if t:
            x['stecker'].add(t)
        for k, feld in (('spannung', 'spannung'), ('frequenz', 'frequenz')):
            v = g(k)
            if v:
                try:
                    x[feld].add(int(round(float(v))))
                except ValueError:
                    pass
        if g('waehrung'):
            x['waehrung'].add(g('waehrung'))
        if g('notrufLabel') and re.fullmatch(r'[0-9 ]{2,6}', g('notrufLabel')):
            x['notruf'].add(g('notrufLabel').replace(' ', ''))
        s = (g('seiteLabel') or '').lower()
        if 'left' in s:
            x['seite'].add('links')
        elif 'right' in s:
            x['seite'].add('rechts')
        if g('sprache'):
            x['sprachen'].add(g('sprache'))
    aus = {k: {f: sorted(v) for f, v in x.items()} for k, x in sorted(laender.items())}
    with open(ZIEL, 'w', encoding='utf-8') as f:
        json.dump({'v': VERSION, 'stand': datetime.now(timezone.utc).isoformat(timespec='minutes'), 'quelle': 'Wikidata (query.wikidata.org)', 'lizenz': 'CC0',
                   'laender': aus}, f, ensure_ascii=False, separators=(',', ':'))
    print('Länder:', len(aus))
    for k in ('PT', 'DE', 'AT', 'CH', 'GB', 'US'):
        print(' ', k, aus.get(k))
    return 0


if __name__ == '__main__':
    sys.exit(main())
