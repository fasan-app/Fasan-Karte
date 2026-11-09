#!/usr/bin/env python3
"""Wetter für Lissabon holen und als site/wetter.json ablegen. Läuft nur in GitHub Actions.

Quellen (geprüft 24.10.2026):
- IPMA, Tagesvorhersage je Ort: api.ipma.pt/open-data/forecast/meteorology/cities/daily/<globalIdLocal>.json
  Lissabon = 1110600 (Datensatz der Stadt Lissabon, dados.cm-lisboa.pt). Felder laut IPMA-API-Beschreibung:
  forecastDate, dataUpdate, idWeatherType, tMin, tMax, classWindSpeed, predWindDir, precipitaProb.
- Open-Meteo /v1/forecast, stündlich: temperature_2m, precipitation_probability, precipitation, weather_code;
  täglich: sunrise, sunset (Doku: open-meteo-website, src/routes/en/docs). Lizenz CC BY 4.0, frei für
  nicht-kommerzielle Nutzung unter 10 000 Abrufen am Tag.
Die Handys laden nur diese Datei von GitHub Pages. Fällt eine Quelle aus, bleibt der Teil leer.
"""
import json
import sys
import time
import urllib.request
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

UA = 'Fasan-Karte/1.5 (+https://github.com/CUK999/Fasan-Karte)'
LAT, LON = 38.7139, -9.1394  # Baixa, Lissabon
IPMA_ORT = 1110600


LISSABON = ZoneInfo('Europe/Lisbon')


def lokal(utc_iso):
    """'2026-10-25T17:44' in UTC → Ortszeit Lissabon als 'YYYY-MM-DDTHH:MM' (mit Zeitumstellung)."""
    return datetime.fromisoformat(utc_iso).replace(tzinfo=timezone.utc).astimezone(LISSABON).strftime('%Y-%m-%dT%H:%M')


def hole(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode('utf-8'))


# Kurze deutsche Texte nach Stichworten der portugiesischen IPMA-Beschreibung; ohne Treffer bleibt das Original.
STICHWORTE = [
    ('trovoada', 'Gewitter'), ('granizo', 'Hagel'), ('neve', 'Schnee'), ('nevoeiro', 'Nebel'), ('neblina', 'Dunst'),
    ('chuvisco', 'Nieselregen'), ('aguaceiros fortes', 'Kräftige Schauer'), ('chuva forte', 'Starker Regen'),
    ('aguaceiros fracos', 'Leichte Schauer'), ('chuva fraca', 'Leichter Regen'), ('aguaceiros', 'Schauer'),
    ('chuva', 'Regen'), ('muito nublado', 'Stark bewölkt'), ('encoberto', 'Bedeckt'), ('parcialmente nublado', 'Teils bewölkt'),
    ('pouco nublado', 'Leicht bewölkt'), ('nuvens altas', 'Hohe Wolken'), ('nublado', 'Bewölkt'), ('limpo', 'Klar'),
]


def deutsch(pt):
    t = (pt or '').lower()
    for k, d in STICHWORTE:
        if k in t:
            return d
    return pt or ''


def ipma():
    url = f'https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/{IPMA_ORT}.json'
    d = hole(url)
    print('IPMA Felder:', sorted(d.keys()), 'erste Zeile:', json.dumps((d.get('data') or [{}])[0])[:300])
    typen = {}
    try:
        k = hole('https://api.ipma.pt/open-data/weather-type-classe.json')
        print('IPMA Wettertypen erste Zeile:', json.dumps((k.get('data') or [{}])[0])[:200])
        for x in k.get('data') or []:
            typen[int(x.get('idWeatherType'))] = x.get('descWeatherTypePT') or x.get('descIdWeatherTypePT') or ''
    except Exception as e:  # noqa: BLE001
        print('IPMA Wettertypen fehlen:', e)
    tage = []
    for x in d.get('data') or []:
        try:
            tid = int(x.get('idWeatherType'))
        except (TypeError, ValueError):
            tid = None
        pt = typen.get(tid, '')
        tage.append({
            'datum': x.get('forecastDate'), 'min': float(x['tMin']), 'max': float(x['tMax']),
            'regen': round(float(x.get('precipitaProb', 0))), 'wind': x.get('classWindSpeed'), 'richtung': x.get('predWindDir'),
            'typ': tid, 'pt': pt, 'text': deutsch(pt),
        })
    return {'quelle': 'IPMA', 'url': 'https://www.ipma.pt/pt/otempo/prev.localidade.hora/', 'aktualisiert': d.get('dataUpdate'), 'tage': tage}


def open_meteo():
    url = ('https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s'
           '&hourly=temperature_2m,precipitation_probability,precipitation,weather_code'
           '&daily=sunrise,sunset&timezone=GMT&forecast_days=4') % (LAT, LON)
    # In UTC abrufen und hier umrechnen: Mit timezone=Europe/Lisbon kamen am 24.10.2026 die Zeiten für So/Mo mit
    # Sommerzeit-Versatz (Sonnenuntergang So 18:44 statt 17:44 laut RFM, 20.10.2026). zoneinfo kennt die Umstellung.
    d = hole(url)
    h, t = d.get('hourly') or {}, d.get('daily') or {}
    print('Open-Meteo Felder:', sorted(h.keys()), sorted(t.keys()), 'utc_offset_seconds:', d.get('utc_offset_seconds'))
    stunden = []
    for i, zeit in enumerate(h.get('time') or []):
        stunden.append({'t': lokal(zeit), 'temp': h['temperature_2m'][i], 'regen': h['precipitation_probability'][i],
                        'mm': h['precipitation'][i], 'code': h['weather_code'][i]})
    sonne = []
    for i in range(len(t.get('time') or [])):
        auf, unter = lokal(t['sunrise'][i]), lokal(t['sunset'][i])
        sonne.append({'datum': auf[:10], 'auf': auf[11:16], 'unter': unter[11:16]})
    print('Sonne (Lissabon-Zeit):', sonne)
    return {'quelle': 'Open-Meteo', 'url': 'https://open-meteo.com/', 'lizenz': 'CC BY 4.0', 'stunden': stunden, 'sonne': sonne}


def main():
    aus = {'stand': datetime.now(timezone.utc).isoformat(timespec='minutes'), 'ort': 'Lissabon'}
    for name, fn in (('ipma', ipma), ('om', open_meteo)):
        for versuch in range(3):
            try:
                aus[name] = fn()
                break
            except Exception as e:  # noqa: BLE001
                print(f'{name} Versuch {versuch + 1} fehlgeschlagen: {e}')
                time.sleep(3)
    with open('site/wetter.json', 'w', encoding='utf-8') as f:
        json.dump(aus, f, ensure_ascii=False, separators=(',', ':'))
    print('wetter.json:', {k: (len(v.get('tage', v.get('stunden', []))) if isinstance(v, dict) else v) for k, v in aus.items()})
    return 0


if __name__ == '__main__':
    sys.exit(main())
