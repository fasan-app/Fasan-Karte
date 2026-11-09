#!/usr/bin/env python3
"""Baut site/orte.json aus data/orte.csv.

Pro Ort: Koordinaten (OpenStreetMap Nominatim), Prüfung gegen eine zweite Quelle, Infos aus OSM
(Öffnungszeiten, Webseite, Barrierefreiheit), Kurztext aus Wikipedia und ein freies Bild aus
Wikimedia Commons (nur gemeinfrei, CC0, CC BY, CC BY-SA, mit Namensnennung).

Aufruf: python3 tools/daten.py
Schreibt: site/orte.json, site/bilder/*.jpg, data/cache.json, data/pruefbericht.md

Schnittstellen (offizielle Doku):
- Nominatim Search, Parameter extratags/namedetails/viewbox/bounded:
  https://nominatim.org/release-docs/latest/api/Search/
- Nominatim-Regeln: höchstens 1 Anfrage/s, eigener User-Agent:
  https://operations.osmfoundation.org/policies/nominatim/
- Wikidata-Datensatz als JSON: https://www.wikidata.org/wiki/Special:EntityData
- MediaWiki Action API (search, extracts, coordinates, pageprops, pageimages, imageinfo):
  https://www.mediawiki.org/wiki/API:Main_page
- Wikimedia User-Agent-Regeln: https://meta.wikimedia.org/wiki/User-Agent_policy
"""
import csv
import json
import math
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
CSV = WURZEL / "data" / "orte.csv"
CACHE = WURZEL / "data" / "cache.json"
BERICHT = WURZEL / "data" / "pruefbericht.md"
ZIEL = WURZEL / "site" / "orte.json"
BILDER = WURZEL / "site" / "bilder"

UA = "Fasan-Karte/1.1 (+https://github.com/CUK999/Fasan-Karte)"
VIEWBOX = "-9.50,38.83,-9.05,38.62"  # Lissabon, Almada, Cascais
CACHE_VERSION = 2
NAH_M = 400        # Name- und Adresstreffer gelten bis hier als derselbe Ort
WIKI_NAH_M = 450   # Wikipedia-Artikel gilt nur, wenn seine Koordinate so nah liegt
PRUEF_M = 300      # Abweichung zu Wikidata, ab der ein Ort geprüft werden muss
BILD_BREITE = 720
FREIE_LIZENZ = re.compile(r"^(CC0|Public domain|PD|CC BY(-SA)?( \d\.\d)?|CC-BY(-SA)?)", re.I)

_letzte = {"nominatim": 0.0, "wiki": 0.0}


def hole(url, art="wiki", roh=False):
    """GET mit eigenem User-Agent und Pause je Dienst. Gibt JSON oder Bytes zurück, None bei Fehler."""
    pause = 1.1 if art == "nominatim" else 0.25
    warte = _letzte[art] + pause - time.time()
    if warte > 0:
        time.sleep(warte)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "de,pt,en"})
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            daten = r.read()
    except (urllib.error.URLError, TimeoutError) as e:
        print(f"  Fehler {art}: {e} ({url[:90]})")
        return None
    finally:
        _letzte[art] = time.time()
    return daten if roh else json.loads(daten)


def falte(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def slug(s):
    return falte(s).replace(" ", "-")[:60]


def abstand_m(a, b):
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = p2 - p1, math.radians(b[1] - a[1])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * 6371000 * math.asin(math.sqrt(h))


def stadt(adresse):
    letzter = adresse.split(",")[-1].strip()
    woerter = [w for w in letzter.split() if not any(c.isdigit() for c in w)]
    return " ".join(woerter) or letzter


# ---------- OpenStreetMap ----------

def nominatim(q):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({
        "q": q, "format": "jsonv2", "limit": 1, "countrycodes": "pt", "viewbox": VIEWBOX,
        "bounded": 1, "extratags": 1, "namedetails": 1})
    t = hole(url, "nominatim")
    if not t:
        return None
    h = t[0]
    return {"lat": round(float(h["lat"]), 6), "lon": round(float(h["lon"]), 6),
            "anzeige": h.get("display_name", ""), "osm": f'{h.get("osm_type", "")}/{h.get("osm_id", "")}',
            "art": f'{h.get("category", "")}:{h.get("type", "")}', "name": h.get("name", ""),
            "tags": h.get("extratags") or {}}


def osm_infos(tags):
    t = tags or {}
    infos = {
        "oeffnungszeiten": t.get("opening_hours"),
        "webseite": t.get("website") or t.get("contact:website"),
        "telefon": t.get("phone") or t.get("contact:phone"),
        "rollstuhl": t.get("wheelchair"),
        "kueche": t.get("cuisine"),
        "vegetarisch": t.get("diet:vegetarian"),
        "vegan": t.get("diet:vegan"),
    }
    return {k: v for k, v in infos.items() if v}


# ---------- Wikipedia / Wikidata / Commons ----------

def api(lang_host, **params):
    params.update(format="json", formatversion=2)
    return hole(f"https://{lang_host}/w/api.php?" + urllib.parse.urlencode(params))


def wikidata(qid):
    d = hole(f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json")
    if not d or qid not in d.get("entities", {}):
        return None
    e = d["entities"][qid]
    claims = e.get("claims", {})

    def wert(p):
        try:
            return claims[p][0]["mainsnak"]["datavalue"]["value"]
        except (KeyError, IndexError, TypeError):
            return None

    koord = wert("P625")
    return {
        "qid": qid,
        "bild": wert("P18"),
        "koord": [koord["latitude"], koord["longitude"]] if isinstance(koord, dict) else None,
        "titel": {k[:-4]: v["title"] for k, v in e.get("sitelinks", {}).items() if k in ("dewiki", "ptwiki", "enwiki")},
    }


def wiki_suche(name, pos):
    """Sucht einen Artikel zum Namen; gilt nur, wenn Titel passt und Koordinate nahe liegt."""
    woerter = {w for w in falte(name).split() if len(w) >= 4}
    for lang in ("pt", "de", "en"):
        s = api(f"{lang}.wikipedia.org", action="query", list="search", srsearch=name, srlimit=3)
        treffer = (s or {}).get("query", {}).get("search", [])
        for t in treffer:
            titel = t["title"]
            if not woerter & set(falte(titel).split()):
                continue
            p = api(f"{lang}.wikipedia.org", action="query", titles=titel, prop="coordinates|pageprops", redirects=1)
            seiten = (p or {}).get("query", {}).get("pages", [])
            if not seiten or "coordinates" not in seiten[0]:
                continue
            c = seiten[0]["coordinates"][0]
            if pos and abstand_m(pos, (c["lat"], c["lon"])) <= WIKI_NAH_M:
                qid = seiten[0].get("pageprops", {}).get("wikibase_item")
                return qid, lang, seiten[0]["title"]
    return None, None, None


def auszug(lang, titel):
    p = api(f"{lang}.wikipedia.org", action="query", titles=titel, prop="extracts|pageimages",
            exintro=1, explaintext=1, exsentences=4, piprop="name", redirects=1)
    seiten = (p or {}).get("query", {}).get("pages", [])
    if not seiten or seiten[0].get("missing"):
        return None
    s = seiten[0]
    text = re.sub(r"\s*\([^()]*\)", "", (s.get("extract") or "").strip())  # Lautschrift-Klammern raus
    text = re.sub(r"\s{2,}", " ", text)
    return {"lang": lang, "titel": s["title"], "text": text,
            "url": f"https://{lang}.wikipedia.org/wiki/" + urllib.parse.quote(s["title"].replace(" ", "_")),
            "seitenbild": s.get("pageimage")}


def bild_info(datei):
    p = api("commons.wikimedia.org", action="query", titles="File:" + datei, prop="imageinfo",
            iiprop="url|extmetadata|size", iiurlwidth=BILD_BREITE)
    seiten = (p or {}).get("query", {}).get("pages", [])
    if not seiten or "imageinfo" not in seiten[0]:
        return None
    ii = seiten[0]["imageinfo"][0]
    meta = ii.get("extmetadata", {})

    def m(k):
        return re.sub(r"<[^>]+>", "", (meta.get(k) or {}).get("value", "")).strip()

    lizenz = m("LicenseShortName")
    if not FREIE_LIZENZ.match(lizenz):
        print(f"  Bild übersprungen (Lizenz '{lizenz}'): {datei}")
        return None
    return {"thumb": ii.get("thumburl") or ii.get("url"), "autor": m("Artist")[:120] or "unbekannt",
            "lizenz": lizenz, "lizenz_url": m("LicenseUrl"), "quelle": ii.get("descriptionurl"),
            "breite": ii.get("thumbwidth"), "hoehe": ii.get("thumbheight")}


# ---------- Ablauf ----------

def passt_plz(treffer, adresse):
    m = re.search(r"\b(\d)\d{3}-\d{3}\b", adresse)
    erwartet = m.group(1) if m else ("1" if stadt(adresse) == "Lisboa" else None)
    t = re.search(r"\b(\d)\d{3}-\d{3}\b", (treffer or {}).get("anzeige") or "")
    return erwartet is None or t is None or t.group(1) == erwartet


def koordinaten(name, adresse, manuell, alt):
    """Gibt (pos, quelle, a, n) zurück; a/n sind die Nominatim-Treffer für Adresse und Name."""
    if alt and alt.get("a_n_geholt"):
        a, n = alt.get("a"), alt.get("n")
    else:
        a = nominatim(adresse)
        n = nominatim(f"{name}, {stadt(adresse)}")
    if manuell:
        return manuell, "manuell", a, n
    if a and n:
        if abstand_m((a["lat"], a["lon"]), (n["lat"], n["lon"])) <= NAH_M:
            return (n["lat"], n["lon"]), "name", a, n
        # Uneinig: Treffer mit falscher Postleitzahl-Gegend verwerfen (z. B. „Largo de São Vicente“ gibt es auch in Cascais).
        # Lissabon-Stadt hat Postleitzahlen 1xxx-xxx; steht eine PLZ in der Adresse, zählt deren erste Ziffer.
        if passt_plz(n, adresse) and not passt_plz(a, adresse):
            return (n["lat"], n["lon"]), "pruefen", a, n
        return (a["lat"], a["lon"]), "pruefen", a, n
    if a:
        return (a["lat"], a["lon"]), "adresse", a, n
    if n:
        return (n["lat"], n["lon"]), "pruefen", a, n
    return None, "fehlt", a, n


def main():
    cache = {}
    if CACHE.exists():
        c = json.loads(CACHE.read_text(encoding="utf-8"))
        if c.get("version") == CACHE_VERSION:
            cache = c.get("orte", {})
    BILDER.mkdir(parents=True, exist_ok=True)
    orte, bericht, neuer_cache = [], [], {}

    with open(CSV, encoding="utf-8", newline="") as f:
        zeilen = list(csv.DictReader(f))

    for z in zeilen:
        name, adresse = z["Name"].strip(), z["Adresse"].strip()
        schluessel = f"{name}|{adresse}"
        alt = cache.get(schluessel, {})
        lat, lon = (z.get("Lat") or "").strip(), (z.get("Lon") or "").strip()
        manuell = (float(lat), float(lon)) if lat and lon else None

        pos, quelle, a, n = koordinaten(name, adresse, manuell, alt)
        eintrag = {"a_n_geholt": True, "a": a, "n": n, "datum": alt.get("datum") or time.strftime("%Y-%m-%d", time.gmtime())}

        # POI-Infos: Namenstreffer, wenn er nah an der gewählten Position liegt
        tags = {}
        for h in (n, a):
            if h and pos and abstand_m(pos, (h["lat"], h["lon"])) <= 150 and h["tags"]:
                tags = h["tags"]
                break

        # Wikidata: aus OSM oder über die Wikipedia-Suche
        if "wiki" in alt:
            wiki = alt["wiki"]
        else:
            qid = tags.get("wikidata")
            such_lang = such_titel = None
            if not qid and pos:
                qid, such_lang, such_titel = wiki_suche(name, pos)
            wd = wikidata(qid) if qid else None
            text = None
            titel = (wd or {}).get("titel", {})
            for lang in ("de", "pt", "en"):
                if lang in titel:
                    text = auszug(lang, titel[lang])
                    if text:
                        break
            if not text and such_lang:
                text = auszug(such_lang, such_titel)
            datei = (wd or {}).get("bild") or (text or {}).get("seitenbild")
            bild = bild_info(datei) if datei else None
            wiki = {"wd": wd, "text": text, "bild": bild}
        eintrag["wiki"] = wiki
        neuer_cache[schluessel] = eintrag

        # Bild herunterladen (nur einmal)
        bild_rel = None
        if wiki.get("bild"):
            datei = BILDER / f"{slug(name)}.jpg"
            if not datei.exists():
                roh = hole(wiki["bild"]["thumb"], "wiki", roh=True)
                if roh:
                    datei.write_bytes(roh)
            if datei.exists():
                bild_rel = f"bilder/{datei.name}"

        # Prüfung
        hinweise = []
        if quelle == "fehlt":
            hinweise.append("keine Koordinate gefunden")
        if a and n and quelle != "manuell":
            d = abstand_m((a["lat"], a["lon"]), (n["lat"], n["lon"]))
            if d > NAH_M:
                hinweise.append(f"Name und Adresse {d:.0f} m auseinander")
        wdk = ((wiki.get("wd") or {}).get("koord"))
        if wdk and pos:
            d = abstand_m(pos, wdk)
            if d > PRUEF_M:
                hinweise.append(f"Wikidata-Position {d:.0f} m entfernt")
        if quelle == "pruefen" and not hinweise:
            hinweise.append("nur über den Namen gefunden")

        o = {
            "id": slug(name), "name": name, "adresse": adresse, "ort": stadt(adresse),
            "kategorie": z["Kategorie"].strip(), "notiz": (z.get("Notiz") or "").strip(),
            "typ": (z.get("Typ") or "").strip(),
            "stand": eintrag["datum"],
            "lat": pos[0] if pos else None, "lon": pos[1] if pos else None,
            "quelle": "pruefen" if hinweise and quelle != "manuell" else quelle,
            "infos": osm_infos(tags),
        }
        # Foto-Tipp und Besuchsdauer mit Quelle (Recherchen in docs/recherche/2026-10-24-*.md)
        for feld, schluessel in (("Foto", "foto"), ("Dauer", "dauer"), ("DauerQuelle", "dauerQuelle")):
            wert = (z.get(feld) or "").strip()
            if wert:
                o[schluessel] = wert
        zeiten = (z.get("Zeiten") or "").strip()  # eigene Angabe schlägt OSM; "-" blendet OSM-Zeiten aus
        if zeiten == "-":
            o["infos"].pop("oeffnungszeiten", None)
        elif zeiten:
            o["infos"]["oeffnungszeiten"] = zeiten
        if wiki.get("text"):
            t = wiki["text"]
            o["wiki"] = {"text": t["text"], "url": t["url"], "lang": t["lang"], "titel": t["titel"]}
        if bild_rel:
            b = wiki["bild"]
            o["bild"] = {"src": bild_rel, "autor": b["autor"], "lizenz": b["lizenz"],
                         "lizenz_url": b["lizenz_url"], "quelle": b["quelle"],
                         "breite": b["breite"], "hoehe": b["hoehe"]}
        orte.append(o)
        anzeige = ((n or a or {}).get("anzeige") or "")[:110]
        bericht.append((name, o["quelle"], pos, hinweise, anzeige, bool(o.get("wiki")), bool(bild_rel)))
        print(f'{o["quelle"]:8} {"W" if o.get("wiki") else "-"}{"B" if bild_rel else "-"} {name}')

    ZIEL.write_text(json.dumps(orte, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    CACHE.write_text(json.dumps({"version": CACHE_VERSION, "orte": neuer_cache}, ensure_ascii=False, indent=1) + "\n",
                     encoding="utf-8")
    zeilen_md = ["# Prüfbericht der Orte", "",
                 f"{sum(1 for b in bericht if b[2])} von {len(bericht)} mit Koordinate, "
                 f"{sum(1 for b in bericht if b[5])} mit Wikipedia-Text, {sum(1 for b in bericht if b[6])} mit Bild.", "",
                 "| Ort | Quelle | Position | Hinweise | OSM-Treffer |", "| --- | --- | --- | --- | --- |"]
    for name, q, pos, hinweise, anzeige, _, _ in bericht:
        p = f"{pos[0]:.5f}, {pos[1]:.5f}" if pos else "–"
        zeilen_md.append(f"| {name} | {q} | {p} | {'; '.join(hinweise) or 'ok'} | {anzeige.replace('|', '/')} |")
    BERICHT.write_text("\n".join(zeilen_md) + "\n", encoding="utf-8")
    print(f"\nFertig: {len(orte)} Orte. Bericht: {BERICHT.relative_to(WURZEL)}")


if __name__ == "__main__":
    sys.exit(main())
