// Erzeugt einen künstlichen Bon als PNG (Thermodruck-Optik), Inhalt aus JSON
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [,, json, out] = process.argv;
const bon = JSON.parse(fs.readFileSync(json, 'utf8'));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 420, height: 400 }, deviceScaleFactor: 2.5 });
const zeilen = bon.zeilen.map((z) => Array.isArray(z) ? `<div class=r><span>${z[0]}</span><span>${z[1]}</span></div>` : `<div class=${z.startsWith('#') ? 'c' : 'l'}>${z.replace(/^#/, '')}</div>`).join('');
await p.setContent(`<style>body{margin:0;background:#888}#b{width:340px;margin:20px auto;background:#f6f4ef;padding:18px 16px;font:15px/1.35 'DejaVu Sans Mono',monospace;color:#222;filter:contrast(.9)}.r{display:flex;justify-content:space-between;gap:8px}.c{text-align:center}</style><div id=b>${zeilen}</div>`);
const el = await p.$('#b'); await el.screenshot({ path: out });
await b.close();
