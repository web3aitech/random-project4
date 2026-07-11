// fetch-fonts.mjs - vendor candidate fonts for the font-comparison page.
// Downloads Latin-subset woff2 from Google Fonts (css2) and Fontshare (api),
// writes them under public/assets/fonts/options/ and emits
// public/assets/css/fonts-options.css with all @font-face rules.
//
// Usage: node scripts/fetch-fonts.mjs
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public', 'assets', 'fonts', 'options');
const CSS = join(ROOT, 'public', 'assets', 'css', 'fonts-options.css');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
mkdirSync(OUT, { recursive: true });

const GF = 'https://fonts.googleapis.com/css2';
const FS_API = 'https://api.fontshare.com/v2/css';

// Google Fonts families -> weights (Latin subset only).
const GF_FAMILIES = [
  { fam: 'IBM Plex Sans', slug: 'ibm-plex-sans', weights: [400, 500, 600, 700] },
  { fam: 'IBM Plex Mono', slug: 'ibm-plex-mono', weights: [400, 500] },
  { fam: 'Fraunces', slug: 'fraunces', weights: [600, 700], opsz: true },
  { fam: 'Hanken Grotesk', slug: 'hanken-grotesk', weights: [400, 500, 600, 700] },
  { fam: 'Space Mono', slug: 'space-mono', weights: [400, 700] },
];
// Fontshare families -> weights (one file per face).
const FS_FAMILIES = [
  { fam: 'Clash Display', slug: 'clash-display', weights: [500, 600, 700] },
  { fam: 'General Sans', slug: 'general-sans', weights: [400, 500, 600, 700] },
  { fam: 'Satoshi', slug: 'satoshi', weights: [400, 500, 600, 700] },
  { fam: 'Switzer', slug: 'switzer', weights: [400, 500, 600, 700] },
];

async function fetchText(url) {
  const r = await fetch(url, { headers: { 'user-agent': UA } });
  if (!r.ok) throw new Error('GET failed ' + r.status + ' ' + url);
  return r.text();
}
async function download(url, file) {
  if (existsSync(file)) return file;
  const r = await fetch(url, { headers: { 'user-agent': UA } });
  if (!r.ok) throw new Error('download failed ' + r.status + ' ' + url);
  await pipeline(Readable.fromWeb(r.body), { write: (chunk) => { import('node:fs').then(()=>{}); } } );
  return file;
}
// node fetch body -> file via buffer (simple, fonts are small)
async function save(url, file) {
  if (existsSync(file)) return 'cached';
  const r = await fetch(url, { headers: { 'user-agent': UA } });
  if (!r.ok) throw new Error('save failed ' + r.status + ' ' + url);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(file, buf);
  return buf.length + 'b';
}

const faces = []; // {family, weight, file, cssName}

// ---- Google Fonts ----
for (const f of GF_FAMILIES) {
  const wq = f.weights.join(';');
  const url = `${GF}?family=${encodeURIComponent(f.fam)}:wght@${wq}&display=swap`;
  const css = await fetchText(url);
  // split on /* latin */ comment, take block after it
  const parts = css.split(/\/\*\s*latin\s*\*\//);
  for (let i = 1; i < parts.length; i++) {
    const b = parts[i];
    const w = (b.match(/font-weight:\s*(\d+)/) || [])[1];
    const u = (b.match(/url\(([^)]+)\)/) || [])[1];
    if (!w || !u) continue;
    const file = `${f.slug}-${w}.woff2`;
    const status = await save(u, join(OUT, file));
    faces.push({ family: f.fam, weight: +w, file, cssName: f.fam });
    console.log('GF ', f.fam, w, status);
  }
}

// ---- Fontshare ----
for (const f of FS_FAMILIES) {
  const wq = f.weights.map((w) => w).join(',');
  const url = `${FS_API}?f[]=${encodeURIComponent(f.slug)}@${wq}&display=swap`;
  let css;
  try { css = await fetchText(url); } catch (e) {
    // Fontshare uses family name in f[] param; slug works. If fail, try fam name.
    css = await fetchText(`${FS_API}?f[]=${encodeURIComponent(f.fam)}@${wq}&display=swap`);
  }
  // each @font-face block
  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) || [];
  for (const b of blocks) {
    const fam = (b.match(/font-family:\s*'([^']+)'/) || [])[1];
    const w = (b.match(/font-weight:\s*(\d+)/) || [])[1];
    let u = (b.match(/url\(([^)]+)\)/) || [])[1];
    if (!fam || !w || !u) continue;
    if (fam !== f.fam) continue;
    u = u.replace(/^['"]|['"]$/g, '');
    if (u.startsWith('//')) u = 'https:' + u;
    const file = `${f.slug}-${w}.woff2`;
    const status = await save(u, join(OUT, file));
    faces.push({ family: f.fam, weight: +w, file, cssName: f.fam });
    console.log('FS  ', f.fam, w, status);
  }
}

// ---- emit @font-face CSS ----
let out = '/* Vendored candidate fonts for the font-comparison page. */\n';
for (const fc of faces) {
  out += `@font-face {\n  font-family: "${fc.cssName}";\n  font-style: normal;\n  font-weight: ${fc.weight};\n  font-display: swap;\n  src: url("../fonts/options/${fc.file}") format("woff2");\n}\n`;
}
writeFileSync(CSS, out);
console.log('\nWrote', faces.length, 'faces ->', CSS);
