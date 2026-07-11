/**
 * fix-symbols.mjs
 * Replaces all U+FFFD replacement characters (and literal ? arrows left
 * from a bad encoding conversion) with proper HTML entities throughout
 * every built HTML file under public/.
 */
import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'fs'; // node 22+; fall back below
import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC = resolve(__dirname, '../public');

// Recursively collect *.html files
function htmlFiles(dir) {
  const result = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) result.push(...htmlFiles(full));
    else if (entry.endsWith('.html')) result.push(full);
  }
  return result;
}

const FFFD = '\uFFFD';

/**
 * Ordered list of [pattern, replacement] pairs.
 * Patterns are plain strings (case-sensitive); all occurrences replaced.
 * Order matters — more specific patterns come first.
 */
const REPLACEMENTS = [

  // ── Copyright + year range ──────────────────────────────────────────────
  [`${FFFD} 2011${FFFD}2026`, '&copy; 2011&ndash;2026'],
  [`${FFFD} 2011-2026`,       '&copy; 2011&ndash;2026'],

  // ── Footer location separators ──────────────────────────────────────────
  [`Area ${FFFD} Dubai ${FFFD} UAE`, 'Area &middot; Dubai &middot; UAE'],
  [`Area ${FFFD} Dubai`,             'Area &middot; Dubai'],
  [`Dubai ${FFFD} UAE`,              'Dubai &middot; UAE'],

  // ── Address em-dash ─────────────────────────────────────────────────────
  [`UAE ${FFFD} P.O.`, 'UAE &mdash; P.O.'],

  // ── Registered trademark: Flowtite® ─────────────────────────────────────
  [`Flowtite${FFFD}`, 'Flowtite&reg;'],

  // ── Units: N/m² and m² ──────────────────────────────────────────────────
  [`N/m${FFFD}`,             'N/m<sup>2</sup>'],
  [`&nbsp;m${FFFD}`,         '&nbsp;m<sup>2</sup>'],
  [`,000&nbsp;m${FFFD}`,     ',000&nbsp;m<sup>2</sup>'],
  [` m${FFFD}.`,             ' m<sup>2</sup>.'],
  [` m${FFFD} `,             ' m<sup>2</sup> '],

  // ── Eyebrow separator: GRP Pipe Manufacturer · Jebel Ali ────────────────
  [`Manufacturer ${FFFD} Jebel`, 'Manufacturer &middot; Jebel'],

  // ── Pipe layer em-dashes: 01 — Inner liner ──────────────────────────────
  [`01 ${FFFD} Inner`,      '01 &mdash; Inner'],
  [`02 ${FFFD} Structural`, '02 &mdash; Structural'],
  [`03 ${FFFD} Outer`,      '03 &mdash; Outer'],

  // ── SVG: diameter symbol Ø 2400 MM ──────────────────────────────────────
  [`<tspan>${FFFD} </tspan>`, '<tspan>&Oslash; </tspan>'],

  // ── SVG: ≤ 2.5 mm (Resin-rich liner label) ──────────────────────────────
  [`Resin-rich ${FFFD} =`, 'Resin-rich &le; '],

  // ── Mobile nav close button ─────────────────────────────────────────────
  [`aria-label="Close menu">${FFFD}`, 'aria-label="Close menu">&times;'],

  // ── Ellipsis in select placeholder and textarea placeholder ─────────────
  [`Select${FFFD}`,   'Select&hellip;'],
  [`location${FFFD}`, 'location&hellip;'],

  // ── Literal ? arrow in btn__arrow and to-top (ASCII 63 fallback) ─────────
  [`btn__arrow">?</span>`, 'btn__arrow">&rarr;</span>'],
  [`btn__arrow">?</button>`, 'btn__arrow">&rarr;</button>'],
  [`to-top" aria-label="Back to top">?`, 'to-top" aria-label="Back to top">&uarr;'],
];

let totalFiles = 0;
let totalReplacements = 0;

for (const file of htmlFiles(PUBLIC)) {
  let content = readFileSync(file, 'utf8');
  let fileReplacements = 0;

  for (const [pattern, replacement] of REPLACEMENTS) {
    let idx = content.indexOf(pattern);
    while (idx !== -1) {
      content = content.slice(0, idx) + replacement + content.slice(idx + pattern.length);
      fileReplacements++;
      totalReplacements++;
      idx = content.indexOf(pattern, idx + replacement.length);
    }
  }

  if (fileReplacements > 0) {
    writeFileSync(file, content, 'utf8');
    const rel = file.replace(PUBLIC + '\\', '').replace(PUBLIC + '/', '');
    console.log(`  ✓  ${rel}  (${fileReplacements} replacements)`);
    totalFiles++;
  }
}

// Report any remaining U+FFFD
let remaining = 0;
for (const file of htmlFiles(PUBLIC)) {
  const content = readFileSync(file, 'utf8');
  const count = [...content].filter(c => c === FFFD).length;
  if (count > 0) {
    const rel = file.replace(PUBLIC + '\\', '').replace(PUBLIC + '/', '');
    console.warn(`  ⚠  ${rel} still has ${count} unhandled U+FFFD chars`);
    remaining += count;
  }
}

console.log(`\nDone. ${totalFiles} file(s) updated, ${totalReplacements} total replacements.`);
if (remaining) console.warn(`${remaining} U+FFFD character(s) still need manual review.`);
