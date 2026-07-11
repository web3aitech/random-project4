// localize-assets.mjs
// Extract every real embedded image from the SingleFile captures of
// dubaipipes.com and write them as local files under public/assets/images/.
//
// SingleFile replaces <img src> with a 1x1 transparent gif shim and moves the
// real image into a base64 data URI - either inside a --sf-img-N CSS variable
// in a <style> block, or inline on the element. This script pulls ALL data:
// image URIs out of every capture, skips the tiny shims/spacers by size,
// dedupes by content hash, and emits a manifest at scripts/url-map.json.
//
// Idempotent: re-running skips files already on disk.
//
// Usage:  node scripts/localize-assets.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(ROOT, 'All dubaipipes.com pages');
const OUT_DIR = join(ROOT, 'public', 'assets', 'images');
const MANIFEST = join(__dirname, 'url-map.json');

// Capture filename (by embedded timestamp) -> page slug.
// Determined in Phase 0 by reading each page's leading heading.
const SLUG_BY_TIME = {
  '6：28：25': 'home',
  '6：29：27': 'contact-us',
  '6：30：00': 'certifications-approvals',
  '6：30：31': 'grp-pipe-installation',
  '6：30：55': 'grp-pipes-benefits',
  '6：31：41': 'grp-pipes-general-information',
  '6：32：07': 'know-how-supplier',
  '6：32：42': 'product-testing',
  '6：33：24': 'download-catalog',
  '6：33：54': 'services',
};

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg' };

// Minimal header parsers - no external deps.
function dims(buf, mime) {
  try {
    if (mime === 'image/png') {
      // IHDR at bytes 16..24: width(4) height(4) big-endian
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    }
    if (mime === 'image/gif') {
      // logical screen width/height little-endian u16 at 6/8
      return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
    }
    if (mime === 'image/jpeg') {
      // scan JPEG markers for SOFn to find width/height
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
        }
        const seg = buf.readUInt16BE(i + 2);
        i += 2 + seg;
      }
    }
  } catch { /* ignore */ }
  return { w: 0, h: 0 };
}

const dataUriRe = /data:(image\/[a-z+.-]+);base64,([A-Za-z0-9+/=]+)/g;

const files = readdirSync(SRC_DIR).filter(f => f.endsWith('.html'));
const manifest = { generatedFor: 'dubaipipes.com captures', pages: [] };
const seen = new Map(); // hash -> first path (dedupe across whole site)

let totalExtracted = 0, totalSkipped = 0;

for (const file of files) {
  const timeKey = Object.keys(SLUG_BY_TIME).find(t => file.includes(t));
  if (!timeKey) { console.warn(`skip (no slug): ${file}`); continue; }
  const slug = SLUG_BY_TIME[timeKey];
  const html = readFileSync(join(SRC_DIR, file), 'utf8');
  const page = { slug, source: file, images: [] };

  let m;
  while ((m = dataUriRe.exec(html)) !== null) {
    const mime = m[1];
    const b64 = m[2];
    const buf = Buffer.from(b64, 'base64');
    // Skip tiny shims/spacers (1x1 transparent gifs, 9x21 nav bullets, etc.)
    if (buf.length < 500) { totalSkipped++; continue; }
    const hash = createHash('sha1').update(buf).digest('hex');
    const hash8 = hash.slice(0, 10);
    const ext = EXT[mime] || 'bin';
    const relPath = `${slug}/${hash8}.${ext}`;
    const absPath = join(OUT_DIR, relPath);

    if (!seen.has(hash)) {
      seen.set(hash, `/assets/images/${relPath}`);
      if (!existsSync(absPath)) {
        mkdirSync(dirname(absPath), { recursive: true });
        writeFileSync(absPath, buf);
      }
      totalExtracted++;
      const { w, h } = dims(buf, mime);
      page.images.push({ path: `/assets/images/${relPath}`, mime, bytes: buf.length, w, h });
    } else {
      // already saved (possibly from another page); note the dupe ref
      page.images.push({ path: seen.get(hash), mime, bytes: buf.length, dupe: true });
    }
  }
  manifest.pages.push(page);
  console.log(`${slug.padEnd(30)} ${page.images.length.toString().padStart(3)} images`);
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\nExtracted ${totalExtracted} unique images, skipped ${totalSkipped} shims.`);
console.log(`Manifest: ${MANIFEST}`);
