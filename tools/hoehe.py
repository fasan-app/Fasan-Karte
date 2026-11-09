#!/usr/bin/env python3
"""Höhenraster für Höhenmeter auf dem Handy: Copernicus DEM GLO-30, Ausschnitt Lissabon.

Quelle und Lizenz (docs/recherche/2026-10-24-hoehendaten.md):
- AWS Open Data, Bucket copernicus-dem-30m, ohne Konto (registry.opendata.aws/copernicus-dem).
- ESA-Lizenz COP-DEM-GLO-30-F, Art. 6(b) und 6(c): Hinweis und Haftungssatz bei angepassten Daten (stehen in hoehe.json).
- Oberflächenmodell (DSM): Gebäude und Bäume sind enthalten; einzelne steile Gassen wirken flacher.
Liest nur den Ausschnitt per HTTP-Range (GDAL /vsicurl/ über rasterio). Läuft höchstens alle 30 Tage.
Schreibt site/hoehe.json (Kopf) und site/hoehe.bin (Int16 in Dezimetern, je Zeile als Differenzen, gzip).
"""
import gzip
import json
import os
import sys
from datetime import datetime, timezone, timedelta

URL = ('https://copernicus-dem-30m.s3.eu-central-1.amazonaws.com/Copernicus_DSM_COG_10_N38_00_W010_00_DEM/'
       'Copernicus_DSM_COG_10_N38_00_W010_00_DEM.tif')
# Süd, West, Nord, Ost: Lissabon mit Belém, Almada am Fluss und Küste bis Cascais
S, W, N, O = 38.66, -9.45, 38.80, -9.08
KOPF, DATEI = 'site/hoehe.json', 'site/hoehe.bin'


def frisch():
    try:
        d = json.load(open(KOPF, encoding='utf-8'))
        return os.path.exists(DATEI) and datetime.now(timezone.utc) - datetime.fromisoformat(d['stand']) < timedelta(days=30)
    except Exception:  # noqa: BLE001
        return False


def main():
    if frisch():
        print('hoehe.json ist jünger als 30 Tage, kein neuer Abruf')
        return 0
    try:
        import numpy as np
        import rasterio
        from rasterio.windows import from_bounds
    except ImportError as e:
        print('rasterio/numpy fehlen:', e)
        return 0
    try:
        with rasterio.open(URL) as ds:
            fenster = from_bounds(W, S, O, N, ds.transform).round_offsets().round_lengths()
            a = ds.read(1, window=fenster).astype('float64')
            t = ds.window_transform(fenster)
            leer = ds.nodata
    except Exception as e:  # noqa: BLE001
        print('Copernicus nicht erreichbar, alte Datei bleibt:', e)
        return 0
    if leer is not None:
        a[a == leer] = 0
    a[~np.isfinite(a)] = 0
    dm = np.clip(np.rint(a * 10), -32768, 32767).astype('<i2')
    # Zeilenweise Differenzen (erste Spalte absolut): kleine Zahlen, packen sich gut
    diff = dm.copy()
    diff[:, 1:] = (dm[:, 1:].astype('<i4') - dm[:, :-1].astype('<i4')).clip(-32768, 32767).astype('<i2')
    roh = diff.tobytes()
    os.makedirs('site', exist_ok=True)
    with open(DATEI, 'wb') as f:
        f.write(gzip.compress(roh, 9))
    kopf = {
        'stand': datetime.now(timezone.utc).isoformat(timespec='minutes'),
        'quelle': 'Copernicus DEM GLO-30 (AWS Open Data, registry.opendata.aws/copernicus-dem)',
        'hinweis': ('produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 '
                    'provided under COPERNICUS by the European Union and ESA; all rights reserved'),
        'haftung': ('The organisations in charge of the Copernicus programme by law or by delegation do not incur any liability '
                    'for any use of the Copernicus WorldDEM-30.'),
        'art': 'Oberflächenmodell (DSM), Gebäude und Bäume enthalten',
        'west': t.c, 'nord': t.f, 'dx': t.a, 'dy': -t.e, 'breite': int(dm.shape[1]), 'hoehe': int(dm.shape[0]),
        'skala': 0.1, 'format': 'int16 LE, Zeilen von Nord nach Süd, je Zeile Differenzen, gzip',
    }
    with open(KOPF, 'w', encoding='utf-8') as f:
        json.dump(kopf, f, ensure_ascii=False, indent=1)
    print('Raster', dm.shape, 'min/max m', float(a.min()), float(a.max()), 'Bytes gz', os.path.getsize(DATEI))
    # Stichproben zur Kontrolle (Lage aus OSM): Praça do Comércio (Ufer) und Castelo de São Jorge (Hügel)
    for name, lat, lon in [('Praça do Comércio', 38.7075, -9.1364), ('Castelo de São Jorge', 38.7139, -9.1334), ('Miradouro da Senhora do Monte', 38.7192, -9.1328)]:
        r = int((t.f - lat) / -t.e); c = int((lon - t.c) / t.a)
        print(f'  {name}: {a[r, c]:.1f} m')
    return 0


if __name__ == '__main__':
    sys.exit(main())
